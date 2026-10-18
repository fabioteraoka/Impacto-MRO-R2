/**
 * Configurações Centrais do Impacto Aviation MRO
 * Preparado para execução local (PostgreSQL) e migração para nuvem
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface AppConfig {
  database: {
    url?: string;
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
    ssl: boolean;
    poolMax: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
  storage: {
    driver: 'local' | 's3';
    basePath: string;
    s3?: {
      region?: string;
      bucket?: string;
      accessKeyId?: string;
      secretAccessKey?: string;
    };
  };
  server: {
    port: number;
    nodeEnv: string;
    appUrl: string;
  };
}

export const config: AppConfig = {
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'impacto_mro',
    ssl: process.env.PGSSL === 'true',
    poolMax: Number(process.env.PG_POOL_MAX) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  storage: {
    driver: (process.env.STORAGE_DRIVER as 'local' | 's3') || 'local',
    basePath: process.env.STORAGE_BASE_PATH || path.resolve(process.cwd(), 'storage'),
    s3: {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
  },
};
