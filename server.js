import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Servir arquivos estáticos gerados pelo Vite
app.use(express.static(distPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    // Evitar cache no index.html para sempre servir a versão mais recente
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Rota de status / health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback para SPA (Single Page Application): redireciona todas as rotas para index.html
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Construção pendente - GET 22 de Fevereiro</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f4; color: #1c1917; text-align: center; }
          .card { background: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 480px; }
          h1 { color: #15803d; margin-top: 0; }
          code { background: #e7e5e4; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Grupo Escoteiro Tradicional 22 de Fevereiro</h1>
          <p>O diretório de compilação (<code>dist</code>) ainda não foi encontrado.</p>
          <p>Por favor, execute <code>npm run build</code> no painel da Hostinger para compilar o sistema.</p>
        </div>
      </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Hostinger Server] Aplicação GET 22 de Fevereiro iniciada com sucesso na porta ${PORT}`);
});
