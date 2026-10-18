/**
 * Runner de Migrações do PostgreSQL
 * Executa scripts SQL em ordem e registra histórico em schema_migrations
 * Uso: npm run db:migrate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConnection } from './connection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Migrações] Iniciando verificação e aplicação de migrações PostgreSQL...');

  const isConnected = await dbConnection.testConnection();
  if (!isConnected) {
    console.error('[Migrações] FALHA: Não foi possível conectar ao PostgreSQL. Verifique se o serviço está ativo e as variáveis de ambiente em .env estão corretas.');
    process.exit(1);
  }

  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('[Migrações] Diretório migrations/ não encontrado.');
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[Migrações] Nenhum arquivo .sql encontrado em migrations/.');
    return;
  }

  await dbConnection.withTransaction(async (client) => {
    // Garante tabela de migrações
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const res = await client.query('SELECT migration_name FROM schema_migrations');
    const applied = new Set(res.rows.map((r) => r.migration_name));

    for (const file of files) {
      if (!applied.has(file)) {
        console.log(`[Migrações] Aplicando: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
          [file]
        );
        console.log(`[Migrações] Concluído com sucesso: ${file}`);
      } else {
        console.log(`[Migrações] Já aplicada previamente: ${file}`);
      }
    }
  });

  console.log('[Migrações] Todas as migrações foram verificadas e aplicadas com sucesso.');
  await dbConnection.close();
}

// Se executado diretamente via CLI
if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrations().catch((err) => {
    console.error('[Migrações] Erro fatal:', err);
    process.exit(1);
  });
}
