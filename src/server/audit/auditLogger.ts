/**
 * Engine de Trilha de Auditoria Persistente
 * Impacto Aviation MRO (RBAC 145 / MOMQ 5.7 / MOMQ 6.5)
 */

import crypto from 'crypto';
import { dbConnection } from '../db/connection';

export interface AuditEntry {
  id?: number;
  usuario_nome: string;
  id_usuario?: number;
  cargo?: string;
  data_hora?: string;
  entidade: string;
  id_entidade: string;
  acao: string;
  estado_anterior?: any;
  estado_posterior?: any;
  motivo_detalhes: string;
  ip_origem?: string;
  hash_evento?: string;
  hash_evento_anterior?: string;
}

class AuditLogger {
  private inMemoryLog: AuditEntry[] = [];
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Registra uma ação de auditoria de forma persistente.
   * Calcula hash encadeado do evento para garantir rastreabilidade da sequência.
   */
  public async log(entry: AuditEntry): Promise<AuditEntry> {
    const dataHora = entry.data_hora || new Date().toISOString();
    const prevHash = this.lastHash;

    const payload = JSON.stringify({
      usuario: entry.usuario_nome,
      entidade: entry.entidade,
      id_entidade: entry.id_entidade,
      acao: entry.acao,
      anterior: entry.estado_anterior,
      posterior: entry.estado_posterior,
      motivo: entry.motivo_detalhes,
      timestamp: dataHora,
      prevHash,
    });

    const eventHash = crypto.createHash('sha256').update(payload).digest('hex');
    this.lastHash = eventHash;

    const fullEntry: AuditEntry = {
      ...entry,
      data_hora: dataHora,
      hash_evento: eventHash,
      hash_evento_anterior: prevHash,
    };

    // Armazena em memória para consultas rápidas e resiliência
    this.inMemoryLog.unshift(fullEntry);
    if (this.inMemoryLog.length > 500) {
      this.inMemoryLog.pop();
    }

    // Persiste no PostgreSQL se conectado
    try {
      if (dbConnection.getStatus().isConnected) {
        await dbConnection.query(
          `INSERT INTO tb_audit_log (
            usuario_nome, id_usuario, cargo, data_hora, entidade, id_entidade,
            acao, estado_anterior, estado_posterior, motivo_detalhes, ip_origem,
            hash_evento, hash_evento_anterior
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            fullEntry.usuario_nome,
            fullEntry.id_usuario || null,
            fullEntry.cargo || 'N/A',
            fullEntry.data_hora,
            fullEntry.entidade,
            fullEntry.id_entidade,
            fullEntry.acao,
            fullEntry.estado_anterior ? JSON.stringify(fullEntry.estado_anterior) : null,
            fullEntry.estado_posterior ? JSON.stringify(fullEntry.estado_posterior) : null,
            fullEntry.motivo_detalhes,
            fullEntry.ip_origem || '127.0.0.1',
            fullEntry.hash_evento,
            fullEntry.hash_evento_anterior,
          ]
        );
      }
    } catch (e: any) {
      console.warn(`[AuditLogger] Não foi possível persistir no PostgreSQL: ${e.message}`);
    }

    return fullEntry;
  }

  public getHistory(filtros?: {
    entidade?: string;
    id_entidade?: string;
    usuario?: string;
    limit?: number;
  }): AuditEntry[] {
    let result = this.inMemoryLog;

    if (filtros?.entidade) {
      result = result.filter((e) => e.entidade.toUpperCase() === filtros.entidade!.toUpperCase());
    }
    if (filtros?.id_entidade) {
      result = result.filter((e) => e.id_entidade === filtros.id_entidade);
    }
    if (filtros?.usuario) {
      const u = filtros.usuario.toLowerCase();
      result = result.filter((e) => e.usuario_nome.toLowerCase().includes(u));
    }

    return result.slice(0, filtros?.limit || 100);
  }
}

export const auditLogger = new AuditLogger();
