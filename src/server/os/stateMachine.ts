/**
 * Máquina de Estados Controlada da Ordem de Serviço (F 001-09-2)
 * Garante que transições sigam o fluxo regulatório estrito:
 * ABERTA -> EM_EXECUCAO -> AGUARDANDO_INSPECAO -> GQ -> RTS -> ENCERRADA
 */

import { StatusOrdemServico, OrdemServicoF001_09_2 } from '../../types/mro';
import { auditLogger } from '../audit/auditLogger';
import { dbConnection } from '../db/connection';

export interface TransitionContext {
  id_os: number;
  novo_estado: StatusOrdemServico;
  usuario_nome: string;
  id_usuario?: number;
  cargo_usuario?: string;
  motivo: string;
  ip_origem?: string;
  dados_adicionais?: {
    data_encerramento_real?: string;
    hora_encerramento_real?: string;
    representante_operador?: string;
    id_inspetor_aprs?: number;
  };
}

export interface TransitionValidationResult {
  permitido: boolean;
  motivos_bloqueio: string[];
  avisos: string[];
}

export class OsStateMachine {
  // Grafo de transições permitidas
  private transicoesValidas: Record<StatusOrdemServico, StatusOrdemServico[]> = {
    ABERTA: ['EM_EXECUCAO', 'CANCELADA'],
    EM_EXECUCAO: ['AGUARDANDO_INSPECAO', 'CANCELADA'],
    AGUARDANDO_INSPECAO: ['GQ', 'EM_EXECUCAO', 'CANCELADA'],
    GQ: ['RTS', 'EM_EXECUCAO'], // Permite retorno para retrabalho
    RTS: ['ENCERRADA'],
    ENCERRADA: [], // Terminal
    CANCELADA: [], // Terminal
  };

  public isTransicaoValidaNoGrafo(
    estadoAtual: StatusOrdemServico,
    novoEstado: StatusOrdemServico
  ): boolean {
    const permitidos = this.transicoesValidas[estadoAtual] || [];
    return permitidos.includes(novoEstado);
  }

  /**
   * Valida rigorosamente se a OS cumpre todos os pré-requisitos regulatórios
   * antes de permitir qualquer modificação no estado.
   */
  public validarTransicao(
    os: OrdemServicoF001_09_2,
    novoEstado: StatusOrdemServico,
    evidencias: {
      mecanicoApto?: boolean;
      inspetorApto?: boolean;
      tarefasCompletas?: boolean;
      risPendentes?: number;
      iioDuplaAssinaturaValida?: boolean;
      ferramentasPendentesDevolucao?: number;
      fodChecklistExecutado?: boolean;
      passagemTurnoPendente?: boolean;
      rtsEmitido?: boolean;
    }
  ): TransitionValidationResult {
    const motivos_bloqueio: string[] = [];
    const avisos: string[] = [];

    // 1. Validação no grafo de estados
    if (!this.isTransicaoValidaNoGrafo(os.status_os, novoEstado)) {
      motivos_bloqueio.push(
        `Transição ilegal de '${os.status_os}' para '${novoEstado}'. Transições permitidas a partir de ${os.status_os}: [${(
          this.transicoesValidas[os.status_os] || []
        ).join(', ')}]`
      );
      return { permitido: false, motivos_bloqueio, avisos };
    }

    // 2. Transição ABERTA -> EM_EXECUCAO
    if (novoEstado === 'EM_EXECUCAO') {
      if (evidencias.mecanicoApto === false) {
        motivos_bloqueio.push('Mecânico executor designado não está APTO no cadastro técnico (bloqueio de qualificação/MNT-002).');
      }
      if (evidencias.inspetorApto === false) {
        motivos_bloqueio.push('Inspetor APRS designado não possui qualificação ativa ou habilitação para a aeronave.');
      }
    }

    // 3. Transição EM_EXECUCAO -> AGUARDANDO_INSPECAO
    if (novoEstado === 'AGUARDANDO_INSPECAO') {
      if (evidencias.tarefasCompletas === false) {
        motivos_bloqueio.push('Existem tarefas e apontamentos da OS ainda pendentes de execução pelo mecânico responsável.');
      }
    }

    // 4. Transição AGUARDANDO_INSPECAO -> GQ (Garantia da Qualidade)
    if (novoEstado === 'GQ') {
      if (evidencias.risPendentes && evidencias.risPendentes > 0) {
        motivos_bloqueio.push(`Existem ${evidencias.risPendentes} Relatório(s) de Inspeção (RI F 001-12) abertos sem resolução.`);
      }
      if (evidencias.iioDuplaAssinaturaValida === false) {
        motivos_bloqueio.push('Itens de Inspeção Obrigatória (IIO) pendentes de dupla inspeção ou com violação de independência.');
      }
    }

    // 5. Transição GQ -> RTS (Liberação para Retorno ao Serviço)
    if (novoEstado === 'RTS') {
      if (evidencias.ferramentasPendentesDevolucao && evidencias.ferramentasPendentesDevolucao > 0) {
        motivos_bloqueio.push(`Existem ${evidencias.ferramentasPendentesDevolucao} ferramenta(s) com devolução pendente na Ferramentaria.`);
      }
      if (evidencias.fodChecklistExecutado === false) {
        motivos_bloqueio.push('O Checklist compulsório de prevenção FOD e desobstrução ainda não foi executado pelo inspetor.');
      }
    }

    // 6. Transição RTS -> ENCERRADA
    if (novoEstado === 'ENCERRADA') {
      if (evidencias.rtsEmitido === false) {
        motivos_bloqueio.push('A Ordem de Serviço só pode ser encerrada após a emissão e assinatura formal da Liberação RTS.');
      }
      if (evidencias.passagemTurnoPendente === true) {
        motivos_bloqueio.push('Existe passagem de turno (F 001-24) pendente de aceite formal pelo turno entrante.');
      }
    }

    return {
      permitido: motivos_bloqueio.length === 0,
      motivos_bloqueio,
      avisos,
    };
  }

  /**
   * Registra a transição de estado da OS no histórico auditável
   */
  public async registrarTransicao(
    contexto: TransitionContext,
    estadoAnterior: StatusOrdemServico
  ): Promise<void> {
    // Registra na trilha de auditoria central
    await auditLogger.log({
      usuario_nome: contexto.usuario_nome,
      id_usuario: contexto.id_usuario,
      cargo: contexto.cargo_usuario,
      entidade: 'ORDEM_SERVICO',
      id_entidade: String(contexto.id_os),
      acao: 'TRANSICAO_ESTADO_OS',
      estado_anterior: { status_os: estadoAnterior },
      estado_posterior: { status_os: contexto.novo_estado },
      motivo_detalhes: contexto.motivo,
      ip_origem: contexto.ip_origem,
    });

    // Registra na tabela de histórico de OS do PostgreSQL se conectado
    try {
      if (dbConnection.getStatus().isConnected) {
        await dbConnection.query(
          `INSERT INTO tb_os_status_history (
            id_os, estado_anterior, novo_estado, id_usuario, usuario_nome, data_hora, motivo, ip_origem
          ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
          [
            contexto.id_os,
            estadoAnterior,
            contexto.novo_estado,
            contexto.id_usuario || null,
            contexto.usuario_nome,
            contexto.motivo,
            contexto.ip_origem || '127.0.0.1',
          ]
        );
      }
    } catch (e: any) {
      console.warn(`[StateMachine] Aviso: histórico em tb_os_status_history não persistido: ${e.message}`);
    }
  }
}

export const osStateMachine = new OsStateMachine();
