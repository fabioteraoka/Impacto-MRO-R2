/**
 * Gerenciador de Conexão PostgreSQL e Transações ACID
 * Impacto Aviation MRO (COM 200607-05 / EASA.145.1003)
 */

import pg from 'pg';
import { config } from '../config';

const { Pool } = pg;

export interface TransactionClient {
  query: (text: string, params?: any[]) => Promise<pg.QueryResult>;
  release: () => void;
}

class DatabaseConnection {
  private pool: pg.Pool | null = null;
  private isConnected = false;
  private connectionAttempted = false;

  public getPool(): pg.Pool {
    if (!this.pool) {
      const poolConfig: pg.PoolConfig = config.database.url
        ? {
            connectionString: config.database.url,
            ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
            max: config.database.poolMax,
            idleTimeoutMillis: config.database.idleTimeoutMillis,
            connectionTimeoutMillis: config.database.connectionTimeoutMillis,
          }
        : {
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
            max: config.database.poolMax,
            idleTimeoutMillis: config.database.idleTimeoutMillis,
            connectionTimeoutMillis: config.database.connectionTimeoutMillis,
          };

      this.pool = new Pool(poolConfig);

      this.pool.on('error', (err) => {
        console.error('[PostgreSQL] Erro inesperado no cliente de conexão:', err.message);
      });
    }

    return this.pool;
  }

  /**
   * Testa a conectividade com o PostgreSQL
   */
  public async testConnection(): Promise<boolean> {
    if (this.connectionAttempted && !this.isConnected) {
      return false;
    }
    this.connectionAttempted = true;

    try {
      const pool = this.getPool();
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() AS agora, version() AS versao');
      client.release();
      this.isConnected = true;
      console.log(`[PostgreSQL] Conectado com sucesso ao banco '${config.database.database}'. Horário: ${res.rows[0].agora}`);
      return true;
    } catch (error: any) {
      this.isConnected = false;
      console.warn(`[PostgreSQL] Banco PostgreSQL não disponível no momento (${error.message}). Modo de resiliência ativo.`);
      return false;
    }
  }

  public getStatus(): { isConnected: boolean; database: string; host: string; port: number } {
    return {
      isConnected: this.isConnected,
      database: config.database.database,
      host: config.database.host,
      port: config.database.port,
    };
  }

  /**
   * Executa uma consulta direta
   */
  public async query(text: string, params?: any[]): Promise<pg.QueryResult> {
    const pool = this.getPool();
    return pool.query(text, params);
  }

  /**
   * Executa múltiplas operações dentro de uma TRANSAÇÃO PostgreSQL real.
   * Se qualquer operação ou validação falhar, executa ROLLBACK imediato.
   */
  public async withTransaction<T>(
    operation: (client: pg.PoolClient) => Promise<T>
  ): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[PostgreSQL] Transação revertida via ROLLBACK devido a erro:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
    }
  }
}

export const dbConnection = new DatabaseConnection();
