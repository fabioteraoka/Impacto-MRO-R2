import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/api';
import { dbConnection } from './src/server/db/connection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares para JSON e CORS
  app.use(express.json());

  // Rotas da API da Impacto Aviation MRO
  app.use('/api', apiRouter);

  // Status e Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      app: 'Impacto Aviation MRO System',
      certificacoes: ['ANAC COM 200607-05', 'EASA.145.1003'],
      database: dbConnection.getStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  // Tenta conexão assíncrona ao PostgreSQL (sem bloquear o arranque do servidor)
  dbConnection.testConnection().catch((err) => {
    console.warn('[PostgreSQL] Conexão inicial pendente:', err.message);
  });

  if (process.env.NODE_ENV === 'production') {
    // Em produção, servir a pasta dist gerada pelo vite build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Em desenvolvimento, montar vite.middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Impacto Aviation MRO] Servidor ativo em http://0.0.0.0:${PORT}`);
    console.log(`[Regulamentação] ANAC COM 200607-05 / EASA.145.1003 - RBAC 145 & MOMQ`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor MRO:', err);
  process.exit(1);
});
