import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Dev server must run on port 3000 (Cloud Run sets PORT=8080 which is used by the system proxy)
const PORT = 3000;
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

interface DatabaseSchema {
  escoteiros: any[];
  idsExcluidos: string[];
  contribuicoes: any[];
  filiacoes: any[];
  eventos: any[];
  participacoes: any[];
  uniformes: any[];
  usuarios: any[];
  ultimaAtualizacao: string;
  versaoBanco: string;
}

function getDatabaseDefaults(): DatabaseSchema {
  return {
    escoteiros: [],
    idsExcluidos: [],
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

// Leitura com tolerância a falhas do banco de dados local em disco
function lerBanco(): DatabaseSchema {
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
      idsExcluidos: Array.isArray(parsed.idsExcluidos) ? parsed.idsExcluidos : [],
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
    console.error('[Database] Erro ao ler banco de dados JSON:', err);
    return getDatabaseDefaults();
  }
}

// Escrita atômica segura no disco
function salvarBanco(dados: DatabaseSchema): boolean {
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
    console.error('[Database] Erro ao salvar banco de dados JSON:', err);
    return false;
  }
}

export async function createServer() {
  const app = express();

  // Middleware para processar JSON e formulários
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // CORS habilitado para comunicação entre Hostinger, Google AI Studio e dispositivos móveis
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  /* ========================================================================= */
  /* ROTAS DA API REST - PERSISTÊNCIA CENTRALIZADA NO SERVIDOR                 */
  /* ========================================================================= */

  // 1. Status e diagnóstico de conexão do Banco de Dados
  app.get('/api/status', (req: Request, res: Response) => {
    const db = lerBanco();
    res.json({
      status: 'ok',
      online: true,
      servidor: 'Hostinger & AI Studio Node.js',
      bancoAtivo: true,
      caminhoBanco: DB_FILE,
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

  // 2. Listar todos os escoteiros cadastrados no servidor
  app.get('/api/escoteiros', (req: Request, res: Response) => {
    const db = lerBanco();
    res.json(db.escoteiros);
  });

  // 3. Cadastrar ou atualizar ficha de escoteiro no banco permanente do servidor
  app.post('/api/escoteiros', (req: Request, res: Response) => {
    try {
      const cadastro = req.body;
      if (!cadastro || !cadastro.nomeCompleto) {
        res.status(400).json({ erro: 'Dados incompletos: nome completo é obrigatório.' });
        return;
      }

      const db = lerBanco();
      const agora = new Date().toISOString();

      if (cadastro.id) {
        // Se estava na lista de excluídos, remove para permitir restauração/recriação
        db.idsExcluidos = db.idsExcluidos.filter(id => id !== cadastro.id);
        const index = db.escoteiros.findIndex((e: any) => e.id === cadastro.id);
        if (index !== -1) {
          const atualizado = {
            ...db.escoteiros[index],
            ...cadastro,
            id: cadastro.id,
            atualizadoEm: agora,
          };
          db.escoteiros[index] = atualizado;
          salvarBanco(db);
          console.log(`[API] Inscrição atualizada no servidor: ${atualizado.nomeCompleto} (${atualizado.id})`);
          res.json(atualizado);
          return;
        }
      }

      // Novo cadastro permanente
      const count = db.escoteiros.length + 1;
      const numeroRegistro = cadastro.fichaMedica?.numeroRegistro || `GET-2026-${String(count).padStart(3, '0')}`;
      const novoId = cadastro.id || `esc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      // Garante que o novo ID não esteja marcado como excluído
      db.idsExcluidos = db.idsExcluidos.filter(id => id !== novoId);

      const novo = {
        ...cadastro,
        id: novoId,
        criadoEm: agora,
        atualizadoEm: agora,
        fichaMedica: {
          ...(cadastro.fichaMedica || {}),
          numeroRegistro,
        },
      };

      db.escoteiros.unshift(novo);
      salvarBanco(db);
      console.log(`[API] Nova inscrição gravada no banco do servidor: ${novo.nomeCompleto} (${numeroRegistro})`);
      res.status(201).json(novo);
    } catch (err: any) {
      console.error('[API] Erro ao gravar escoteiro:', err);
      res.status(500).json({ erro: 'Falha interna ao gravar no banco de dados.' });
    }
  });

  // 4. Excluir ficha de escoteiro com registro permanente em idsExcluidos
  app.delete('/api/escoteiros/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = lerBanco();
    const anterior = db.escoteiros.length;
    db.escoteiros = db.escoteiros.filter((e: any) => e.id !== id);
    if (!db.idsExcluidos.includes(id)) {
      db.idsExcluidos.push(id);
      // Mantém últimos 2000 IDs excluídos
      if (db.idsExcluidos.length > 2000) {
        db.idsExcluidos = db.idsExcluidos.slice(-2000);
      }
    }
    salvarBanco(db);
    console.log(`[API] Registro excluído do servidor com tombstone permanente: ${id}`);
    res.json({ sucesso: true, id });
  });

  // 5. Sincronização integral bidirecional (dados locais <-> servidor central)
  app.get('/api/sync', (req: Request, res: Response) => {
    const db = lerBanco();
    res.json(db);
  });

  app.post('/api/sync', (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const db = lerBanco();

      // Mescla IDs excluídos reportados pelo cliente
      if (Array.isArray(payload.idsExcluidos)) {
        payload.idsExcluidos.forEach((id: string) => {
          if (id && !db.idsExcluidos.includes(id)) {
            db.idsExcluidos.push(id);
          }
        });
        if (db.idsExcluidos.length > 2000) {
          db.idsExcluidos = db.idsExcluidos.slice(-2000);
        }
      }

      const setExcluidos = new Set(db.idsExcluidos);

      // Limpa do servidor quaisquer registros marcados como excluídos
      db.escoteiros = db.escoteiros.filter((e: any) => e && e.id && !setExcluidos.has(e.id));

      // Mescla escoteiros recebidos com os do servidor sem duplicar IDs e NUNCA ressuscitando excluídos
      if (Array.isArray(payload.escoteiros)) {
        const mapa = new Map<string, any>();
        // Primeiro coloca os do servidor válidos
        db.escoteiros.forEach(e => {
          if (e.id && !setExcluidos.has(e.id)) mapa.set(e.id, e);
        });
        // Mescla com os recebidos do cliente
        payload.escoteiros.forEach((e: any) => {
          if (e && e.id && !setExcluidos.has(e.id)) {
            const existente = mapa.get(e.id);
            if (!existente) {
              mapa.set(e.id, e);
            } else {
              // Se o cliente tem versão mais recente, atualiza
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
      console.log(`[API] Sincronização concluída. Total de escoteiros agora no servidor: ${db.escoteiros.length}`);
      res.json({
        sucesso: true,
        banco: db,
        totalEscoteiros: db.escoteiros.length,
        ultimaAtualizacao: db.ultimaAtualizacao,
      });
    } catch (err: any) {
      console.error('[API] Erro ao sincronizar dados:', err);
      res.status(500).json({ erro: 'Falha durante sincronização com o banco central.' });
    }
  });

  // 6. Resetar banco do servidor para ambiente com dados reais (mantendo Cmte. Malta)
  app.post('/api/reset-real', (req: Request, res: Response) => {
    const limpo = getDatabaseDefaults();
    salvarBanco(limpo);
    console.log('[API] Banco de dados resetado para dados reais. Apenas Cmte. Malta ativo.');
    res.json({ sucesso: true, mensagem: 'Banco do servidor limpo com sucesso para dados reais.' });
  });

  // 7. Download direto do backup JSON
  app.get('/api/backup/download', (req: Request, res: Response) => {
    const db = lerBanco();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup_escoteiros_${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(db, null, 2));
  });

  // Rota de verificação simples de saúde
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /* ========================================================================= */
  /* SERVIÇO DE FRONTEND (Vite em Desenvolvimento / Dist em Produção)          */
  /* ========================================================================= */
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));

    app.get('*', (req: Request, res: Response) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).send(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="utf-8">
            <title>G.E.T. 22 de Fevereiro</title>
          </head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Grupo Escoteiro Tradicional 22 de Fevereiro</h2>
            <p>O diretório de compilação (dist) ainda não foi gerado.</p>
            <p>Execute <code>npm run build</code> para compilar a aplicação.</p>
          </body>
          </html>
        `);
      }
    });
  }

  return app;
}

// Inicia o servidor se executado diretamente
if (process.env.NODE_ENV !== 'test') {
  createServer().then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Servidor GET 22 de Fevereiro] Rodando com Banco de Dados Persistente na porta ${PORT}`);
      console.log(`[Banco de Dados] Arquivo JSON ativo em: ${DB_FILE}`);
    });
  }).catch((err) => {
    console.error('Erro crítico ao inicializar servidor:', err);
    process.exit(1);
  });
}
