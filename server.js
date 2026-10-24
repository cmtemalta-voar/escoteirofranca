import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');
const distPath = path.join(__dirname, 'dist');

// Usuário Administrador Geral Padrão
const USUARIO_ADMIN_DEFAULT = {
  id: 'user-admin-malta',
  nome: 'Cmte. Malta',
  login: 'cmte.malta@gmail.com',
  senha: '@f@m2lt2',
  cargo: 'Comandante / Administrador Geral',
  isAdmin: true,
  permissoes: [
    'dashboard',
    'novo',
    'lista',
    'financeiro',
    'eventos',
    'uniformes',
    'impressao',
    'database',
    'usuarios'
  ],
  ativo: true,
  criadoEm: '2026-01-01T08:00:00.000Z',
};

function getDatabaseDefaults() {
  return {
    escoteiros: [],
    contribuicoes: [],
    filiacoes: [],
    eventos: [],
    participacoes: [],
    uniformes: [],
    usuarios: [USUARIO_ADMIN_DEFAULT],
    ultimaAtualizacao: new Date().toISOString(),
    versaoBanco: '1.0.0',
  };
}

function lerBanco() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const defaults = getDatabaseDefaults();
      fs.writeFileSync(DB_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
      return defaults;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') {
      return getDatabaseDefaults();
    }
    return {
      escoteiros: Array.isArray(parsed.escoteiros) ? parsed.escoteiros : [],
      contribuicoes: Array.isArray(parsed.contribuicoes) ? parsed.contribuicoes : [],
      filiacoes: Array.isArray(parsed.filiacoes) ? parsed.filiacoes : [],
      eventos: Array.isArray(parsed.eventos) ? parsed.eventos : [],
      participacoes: Array.isArray(parsed.participacoes) ? parsed.participacoes : [],
      uniformes: Array.isArray(parsed.uniformes) ? parsed.uniformes : [],
      usuarios: Array.isArray(parsed.usuarios) && parsed.usuarios.length > 0 ? parsed.usuarios : [USUARIO_ADMIN_DEFAULT],
      ultimaAtualizacao: parsed.ultimaAtualizacao || new Date().toISOString(),
      versaoBanco: parsed.versaoBanco || '1.0.0',
    };
  } catch (err) {
    console.error('[Hostinger Database] Erro ao ler banco de dados JSON:', err);
    return getDatabaseDefaults();
  }
}

function salvarBanco(dados) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    dados.ultimaAtualizacao = new Date().toISOString();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(dados, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('[Hostinger Database] Erro ao salvar banco de dados JSON:', err);
    return false;
  }
}

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS liberado para integração total
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/* ========================================================================= */
/* ROTAS DA API REST - BANCO CENTRALIZADO HOSTINGER                          */
/* ========================================================================= */

// Status do Servidor e Banco
app.get('/api/status', (req, res) => {
  const db = lerBanco();
  res.json({
    status: 'ok',
    online: true,
    servidor: 'Hostinger Node.js Server',
    bancoAtivo: true,
    totalEscoteiros: db.escoteiros.length,
    totalContribuicoes: db.contribuicoes.length,
    totalFiliacoes: db.filiacoes.length,
    totalEventos: db.eventos.length,
    totalUniformes: db.uniformes.length,
    totalUsuarios: db.usuarios.length,
    ultimaAtualizacao: db.ultimaAtualizacao,
    timestamp: new Date().toISOString(),
  });
});

// Listar todos os escoteiros
app.get('/api/escoteiros', (req, res) => {
  const db = lerBanco();
  res.json(db.escoteiros);
});

// Cadastrar ou atualizar escoteiro
app.post('/api/escoteiros', (req, res) => {
  try {
    const cadastro = req.body;
    if (!cadastro || !cadastro.nomeCompleto) {
      return res.status(400).json({ erro: 'Nome completo é obrigatório.' });
    }

    const db = lerBanco();
    const agora = new Date().toISOString();

    if (cadastro.id) {
      const index = db.escoteiros.findIndex((e) => e.id === cadastro.id);
      if (index !== -1) {
        const atualizado = {
          ...db.escoteiros[index],
          ...cadastro,
          id: cadastro.id,
          atualizadoEm: agora,
        };
        db.escoteiros[index] = atualizado;
        salvarBanco(db);
        console.log(`[Hostinger Server] Ficha atualizada: ${atualizado.nomeCompleto}`);
        return res.json(atualizado);
      }
    }

    const count = db.escoteiros.length + 1;
    const numeroRegistro = cadastro.fichaMedica?.numeroRegistro || `GET-2026-${String(count).padStart(3, '0')}`;
    const novo = {
      ...cadastro,
      id: cadastro.id || `esc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      criadoEm: agora,
      atualizadoEm: agora,
      fichaMedica: {
        ...(cadastro.fichaMedica || {}),
        numeroRegistro,
      },
    };

    db.escoteiros.unshift(novo);
    salvarBanco(db);
    console.log(`[Hostinger Server] Nova inscrição salva: ${novo.nomeCompleto} (${numeroRegistro})`);
    res.status(201).json(novo);
  } catch (err) {
    console.error('[Hostinger Server] Erro ao salvar cadastro:', err);
    res.status(500).json({ erro: 'Falha interna ao salvar no banco.' });
  }
});

// Excluir ficha
app.delete('/api/escoteiros/:id', (req, res) => {
  const { id } = req.params;
  const db = lerBanco();
  const anterior = db.escoteiros.length;
  db.escoteiros = db.escoteiros.filter((e) => e.id !== id);
  if (db.escoteiros.length < anterior) {
    salvarBanco(db);
    res.json({ sucesso: true, id });
  } else {
    res.status(404).json({ erro: 'Registro não encontrado.' });
  }
});

// Sincronização geral
app.get('/api/sync', (req, res) => {
  const db = lerBanco();
  res.json(db);
});

app.post('/api/sync', (req, res) => {
  try {
    const payload = req.body;
    const db = lerBanco();

    if (Array.isArray(payload.escoteiros)) {
      const mapa = new Map();
      db.escoteiros.forEach(e => { if (e.id) mapa.set(e.id, e); });
      payload.escoteiros.forEach(e => {
        if (e && e.id) {
          const existente = mapa.get(e.id);
          if (!existente) {
            mapa.set(e.id, e);
          } else {
            const timeCliente = new Date(e.atualizadoEm || e.criadoEm || 0).getTime();
            const timeServidor = new Date(existente.atualizadoEm || existente.criadoEm || 0).getTime();
            if (timeCliente >= timeServidor) {
              mapa.set(e.id, { ...existente, ...e });
            }
          }
        }
      });
      db.escoteiros = Array.from(mapa.values());
    }

    if (Array.isArray(payload.contribuicoes) && payload.contribuicoes.length > 0) {
      db.contribuicoes = payload.contribuicoes;
    }
    if (Array.isArray(payload.filiacoes) && payload.filiacoes.length > 0) {
      db.filiacoes = payload.filiacoes;
    }
    if (Array.isArray(payload.eventos) && payload.eventos.length > 0) {
      db.eventos = payload.eventos;
    }
    if (Array.isArray(payload.participacoes) && payload.participacoes.length > 0) {
      db.participacoes = payload.participacoes;
    }
    if (Array.isArray(payload.uniformes) && payload.uniformes.length > 0) {
      db.uniformes = payload.uniformes;
    }

    salvarBanco(db);
    res.json({
      sucesso: true,
      banco: db,
      totalEscoteiros: db.escoteiros.length,
      ultimaAtualizacao: db.ultimaAtualizacao,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro durante sincronização.' });
  }
});

// Reset para dados reais
app.post('/api/reset-real', (req, res) => {
  const limpo = getDatabaseDefaults();
  salvarBanco(limpo);
  res.json({ sucesso: true, mensagem: 'Banco limpo para dados reais.' });
});

// Download do arquivo de backup
app.get('/api/backup/download', (req, res) => {
  const db = lerBanco();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="backup_escoteiros_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(db, null, 2));
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ========================================================================= */
/* SERVINDO OS ARQUIVOS ESTÁTICOS COMPILADOS DO FRONTEND                     */
/* ========================================================================= */
app.use(express.static(distPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

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
  console.log(`[Hostinger Server] Banco de dados permanente ativo em: ${DB_FILE}`);
});
