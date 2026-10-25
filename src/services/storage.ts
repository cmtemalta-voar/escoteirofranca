import { EscoteiroCadastro, calcularIdade, identificarRamo } from '../types/scout';
import { DADOS_INICIAIS_FRANCA } from '../data/initialData';
import { 
  ContribuicaoMensal, 
  FiliacaoAnual, 
  EventoEscoteiro, 
  ParticipacaoEvento, 
  RegistroUniformeMaterial 
} from '../types/management';
import {
  INICIAL_CONTRIBUICOES,
  INICIAL_FILIACOES,
  INICIAL_EVENTOS,
  INICIAL_PARTICIPACOES,
  INICIAL_UNIFORMES
} from '../data/initialManagementData';
import { UsuarioSistema, PermissaoModulo } from '../types/auth';

const STORAGE_KEY = 'get_22_fevereiro_escoteiros_db';
const KEY_CONTRIBUICOES = 'get_22_fevereiro_contribuicoes_db';
const KEY_FILIACOES = 'get_22_fevereiro_filiacoes_db';
const KEY_EVENTOS = 'get_22_fevereiro_eventos_db';
const KEY_PARTICIPACOES = 'get_22_fevereiro_participacoes_db';
const KEY_UNIFORMES = 'get_22_fevereiro_uniformes_db';
const KEY_USUARIOS = 'get_22_fevereiro_usuarios_db';
const KEY_SESSAO_ATIVA = 'get_22_fevereiro_sessao_ativa';
const KEY_REMOTE_API_URL = 'get_22_api_remote_url';
const KEY_LAST_SYNC = 'get_22_last_sync_timestamp';
const KEY_IDS_EXCLUIDOS = 'get_22_fevereiro_ids_excluidos';

export const USUARIOS_INICIAIS: UsuarioSistema[] = [
  {
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
  }
];

// Chave para purga automática de dados fictícios em clientes com sessões antigas
const KEY_CLEAN_DATA_MIGRATED = 'get_22_fevereiro_purged_mock_v3';

// Rotina de limpeza automática de dados fictícios na inicialização
if (typeof window !== 'undefined') {
  try {
    const jaLimpou = localStorage.getItem(KEY_CLEAN_DATA_MIGRATED);
    if (!jaLimpou) {
      // Limpa dados de escoteiros, financeiro, eventos e materiais
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(KEY_CONTRIBUICOES, JSON.stringify([]));
      localStorage.setItem(KEY_FILIACOES, JSON.stringify([]));
      localStorage.setItem(KEY_EVENTOS, JSON.stringify([]));
      localStorage.setItem(KEY_PARTICIPACOES, JSON.stringify([]));
      localStorage.setItem(KEY_UNIFORMES, JSON.stringify([]));

      // Mantém APENAS o usuário administrador geral completo
      localStorage.setItem(KEY_USUARIOS, JSON.stringify(USUARIOS_INICIAIS));

      // Se havia sessão antiga com usuário de teste, ajusta para Cmte. Malta
      const sessaoRaw = localStorage.getItem(KEY_SESSAO_ATIVA);
      if (sessaoRaw) {
        try {
          const sessao = JSON.parse(sessaoRaw);
          if (sessao?.login !== 'cmte.malta@gmail.com') {
            localStorage.setItem(KEY_SESSAO_ATIVA, JSON.stringify(USUARIOS_INICIAIS[0]));
            localStorage.setItem('get_22_auth_session', 'true');
            localStorage.setItem('get_22_auth_user', USUARIOS_INICIAIS[0].nome);
          }
        } catch {
          localStorage.setItem(KEY_SESSAO_ATIVA, JSON.stringify(USUARIOS_INICIAIS[0]));
        }
      }

      localStorage.setItem(KEY_CLEAN_DATA_MIGRATED, 'true');
    }
  } catch (err) {
    console.warn('Erro ao purgar dados fictícios:', err);
  }
}

export const storageService = {
  getIdsExcluidos(): string[] {
    try {
      const data = localStorage.getItem(KEY_IDS_EXCLUIDOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  registrarIdExcluido(id: string): void {
    try {
      if (!id) return;
      const ids = this.getIdsExcluidos();
      if (!ids.includes(id)) {
        ids.push(id);
        const trimmed = ids.slice(-2000);
        localStorage.setItem(KEY_IDS_EXCLUIDOS, JSON.stringify(trimmed));
      }
    } catch (e) {
      console.warn('Erro ao registrar ID excluído:', e);
    }
  },

  removerIdExcluido(id: string): void {
    try {
      if (!id) return;
      const ids = this.getIdsExcluidos().filter(item => item !== id);
      localStorage.setItem(KEY_IDS_EXCLUIDOS, JSON.stringify(ids));
    } catch (e) {
      console.warn('Erro ao remover ID excluído:', e);
    }
  },

  getEscoteiros(): EscoteiroCadastro[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [];
      }
      const idsExcluidos = new Set(this.getIdsExcluidos());
      return parsed
        .filter((e: EscoteiroCadastro) => e && e.id && !idsExcluidos.has(e.id))
        .map((e: EscoteiroCadastro) => ({
        ...e,
        fichaMedica: {
          ...e.fichaMedica,
          deficienciaFisica: e.fichaMedica?.deficienciaFisica || false,
          deficienciaFisicaDetalhes: e.fichaMedica?.deficienciaFisicaDetalhes || '',
          deficienciaVisual: e.fichaMedica?.deficienciaVisual || false,
          deficienciaVisualDetalhes: e.fichaMedica?.deficienciaVisualDetalhes || '',
          deficienciaAuditiva: e.fichaMedica?.deficienciaAuditiva || false,
          deficienciaAuditivaDetalhes: e.fichaMedica?.deficienciaAuditivaDetalhes || '',
          deficienciaIntelectual: e.fichaMedica?.deficienciaIntelectual || false,
          deficienciaIntelectualDetalhes: e.fichaMedica?.deficienciaIntelectualDetalhes || '',
        }
      }));
    } catch (e) {
      console.error('Erro ao ler dados do localStorage:', e);
      return [];
    }
  },

  salvarEscoteiro(cadastro: Omit<EscoteiroCadastro, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }): EscoteiroCadastro {
    if (cadastro.id) {
      this.removerIdExcluido(cadastro.id);
    }
    const list = this.getEscoteiros();
    const agora = new Date().toISOString();

    if (cadastro.id) {
      // Atualização
      const index = list.findIndex(e => e.id === cadastro.id);
      if (index !== -1) {
        const atualizado: EscoteiroCadastro = {
          ...list[index],
          ...cadastro,
          id: cadastro.id,
          atualizadoEm: agora,
        };
        list[index] = atualizado;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        this.enviarParaServidorAsync(atualizado);
        return atualizado;
      }
    }

    // Novo cadastro
    const count = list.length + 1;
    const novoRegistro = cadastro.fichaMedica?.numeroRegistro || `GET-2026-${String(count).padStart(3, '0')}`;
    const novoId = cadastro.id || `esc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.removerIdExcluido(novoId);

    const novo: EscoteiroCadastro = {
      ...cadastro,
      id: novoId,
      criadoEm: agora,
      atualizadoEm: agora,
      fichaMedica: {
        ...cadastro.fichaMedica,
        numeroRegistro: novoRegistro,
      }
    };

    list.unshift(novo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    this.enviarParaServidorAsync(novo);
    return novo;
  },

  excluirEscoteiro(id: string): boolean {
    this.registrarIdExcluido(id);
    const list = this.getEscoteiros();
    const filtered = list.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    this.excluirDoServidorAsync(id);
    return true;
  },

  getEscoteiroPorId(id: string): EscoteiroCadastro | undefined {
    return this.getEscoteiros().find(e => e.id === id);
  },

  restaurarDadosPadrao(): EscoteiroCadastro[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  },

  limparTudoParaDadosReais(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(KEY_CONTRIBUICOES, JSON.stringify([]));
    localStorage.setItem(KEY_FILIACOES, JSON.stringify([]));
    localStorage.setItem(KEY_EVENTOS, JSON.stringify([]));
    localStorage.setItem(KEY_PARTICIPACOES, JSON.stringify([]));
    localStorage.setItem(KEY_UNIFORMES, JSON.stringify([]));
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(USUARIOS_INICIAIS));
    localStorage.removeItem(KEY_IDS_EXCLUIDOS);
    this.definirSessaoAtual(USUARIOS_INICIAIS[0]);
    this.resetarServidorAsync();
  },

  limparTodos(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  },

  importarJSON(jsonString: string): { success: boolean; count?: number; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) {
        return { success: false, error: 'O arquivo JSON deve conter uma lista de cadastros.' };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { success: true, count: data.length };
    } catch (e) {
      return { success: false, error: 'JSON inválido ou corrompido.' };
    }
  },

  exportarJSON(): string {
    const data = this.getEscoteiros();
    return JSON.stringify(data, null, 2);
  },

  exportarCSV(): string {
    const escoteiros = this.getEscoteiros();
    const headers = [
      'Nº Registro',
      'Nome Completo',
      'Sexo',
      'Idade',
      'Ramo',
      'Data Nascimento',
      'CPF',
      'RG',
      'Bairro',
      'Cidade',
      'Telefone 1',
      'Email',
      'Responsável 1',
      'Telefone Responsável',
      'Tipo Sanguíneo',
      'Sabe Nadar',
      'Alergias Identificadas',
      'Medicamento Contínuo',
      'Neurodivergência',
      'Plano de Saúde'
    ];

    const rows = escoteiros.map(e => {
      const idade = calcularIdade(e.dataNascimento);
      const ramo = identificarRamo(idade);
      const alergias = e.fichaMedica.apresentaAlergia ? 'Sim' : 'Não';
      const medicamento = e.fichaMedica.medicamentoContinuo ? 'Sim' : 'Não';
      const neuro = e.fichaMedica.apresentaNeurodivergencia ? 'Sim' : 'Não';
      const plano = e.fichaMedica.possuiPlanoSaude ? e.fichaMedica.planoOperadora : 'SUS';

      return [
        `"${e.fichaMedica.numeroRegistro || '-'}"`,
        `"${e.nomeCompleto.replace(/"/g, '""')}"`,
        `"${e.sexo}"`,
        idade,
        `"${ramo}"`,
        `"${e.dataNascimento}"`,
        `"${e.cpf}"`,
        `"${e.rg}"`,
        `"${e.bairro.replace(/"/g, '""')}"`,
        `"${e.cidade.replace(/"/g, '""')}"`,
        `"${e.telefone1}"`,
        `"${e.email}"`,
        `"${e.primeiroResponsavel.nomeCompleto.replace(/"/g, '""')}"`,
        `"${e.primeiroResponsavel.telefone1}"`,
        `"${e.fichaMedica.tipoSanguineo || '-'}"`,
        e.fichaMedica.sabeNadar ? 'Sim' : 'Não',
        `"${alergias}"`,
        `"${medicamento}"`,
        `"${neuro}"`,
        `"${plano}"`
      ].join(';');
    });

    // UTF-8 BOM for Microsoft Excel
    return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  },

  exportarTSV(): string {
    const escoteiros = this.getEscoteiros();
    const headers = [
      'Nº Registro',
      'Nome Completo',
      'Sexo',
      'Idade',
      'Ramo',
      'Data Nascimento',
      'CPF',
      'RG',
      'Bairro',
      'Cidade',
      'Telefone 1',
      'Email',
      'Responsável 1',
      'Telefone Responsável',
      'Tipo Sanguíneo',
      'Sabe Nadar',
      'Alergias Identificadas',
      'Medicamento Contínuo',
      'Neurodivergência',
      'Plano de Saúde'
    ];

    const rows = escoteiros.map(e => {
      const idade = calcularIdade(e.dataNascimento);
      const ramo = identificarRamo(idade);
      const alergias = e.fichaMedica.apresentaAlergia ? 'Sim' : 'Não';
      const medicamento = e.fichaMedica.medicamentoContinuo ? 'Sim' : 'Não';
      const neuro = e.fichaMedica.apresentaNeurodivergencia ? 'Sim' : 'Não';
      const plano = e.fichaMedica.possuiPlanoSaude ? e.fichaMedica.planoOperadora : 'SUS';

      return [
        e.fichaMedica.numeroRegistro || '-',
        e.nomeCompleto,
        e.sexo,
        idade,
        ramo,
        e.dataNascimento,
        e.cpf,
        e.rg,
        e.bairro,
        e.cidade,
        e.telefone1,
        e.email,
        e.primeiroResponsavel.nomeCompleto,
        e.primeiroResponsavel.telefone1,
        e.fichaMedica.tipoSanguineo || '-',
        e.fichaMedica.sabeNadar ? 'Sim' : 'Não',
        alergias,
        medicamento,
        neuro,
        plano
      ].join('\t');
    });

    return [headers.join('\t'), ...rows].join('\n');
  },

  /* ========================================================================= */
  /* CONTRIBUIÇÕES MENSAIS (MENSALIDADES)                                     */
  /* ========================================================================= */
  getContribuicoes(): ContribuicaoMensal[] {
    try {
      const data = localStorage.getItem(KEY_CONTRIBUICOES);
      if (!data) {
        localStorage.setItem(KEY_CONTRIBUICOES, JSON.stringify(INICIAL_CONTRIBUICOES));
        return INICIAL_CONTRIBUICOES;
      }
      return JSON.parse(data);
    } catch {
      return INICIAL_CONTRIBUICOES;
    }
  },

  salvarContribuicao(item: Omit<ContribuicaoMensal, 'id' | 'criadoEm'> & { id?: string }): ContribuicaoMensal {
    const list = this.getContribuicoes();
    if (item.id) {
      const index = list.findIndex(c => c.id === item.id);
      if (index !== -1) {
        const atualizada: ContribuicaoMensal = {
          ...list[index],
          ...item,
          id: item.id
        };
        list[index] = atualizada;
        localStorage.setItem(KEY_CONTRIBUICOES, JSON.stringify(list));
        return atualizada;
      }
    }

    const nova: ContribuicaoMensal = {
      ...item,
      id: item.id || `cont-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      criadoEm: new Date().toISOString()
    };
    list.unshift(nova);
    localStorage.setItem(KEY_CONTRIBUICOES, JSON.stringify(list));
    return nova;
  },

  excluirContribuicao(id: string): boolean {
    const list = this.getContribuicoes();
    const filtrado = list.filter(c => c.id !== id);
    localStorage.setItem(KEY_CONTRIBUICOES, JSON.stringify(filtrado));
    return filtrado.length < list.length;
  },

  /* ========================================================================= */
  /* FILIAÇÕES ANUAIS                                                          */
  /* ========================================================================= */
  getFiliacoes(): FiliacaoAnual[] {
    try {
      const data = localStorage.getItem(KEY_FILIACOES);
      if (!data) {
        localStorage.setItem(KEY_FILIACOES, JSON.stringify(INICIAL_FILIACOES));
        return INICIAL_FILIACOES;
      }
      return JSON.parse(data);
    } catch {
      return INICIAL_FILIACOES;
    }
  },

  salvarFiliacao(item: Omit<FiliacaoAnual, 'id' | 'criadoEm'> & { id?: string }): FiliacaoAnual {
    const list = this.getFiliacoes();
    if (item.id) {
      const index = list.findIndex(f => f.id === item.id);
      if (index !== -1) {
        const atualizada: FiliacaoAnual = {
          ...list[index],
          ...item,
          id: item.id
        };
        list[index] = atualizada;
        localStorage.setItem(KEY_FILIACOES, JSON.stringify(list));
        return atualizada;
      }
    }

    const nova: FiliacaoAnual = {
      ...item,
      id: item.id || `fil-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      criadoEm: new Date().toISOString()
    };
    list.unshift(nova);
    localStorage.setItem(KEY_FILIACOES, JSON.stringify(list));
    return nova;
  },

  excluirFiliacao(id: string): boolean {
    const list = this.getFiliacoes();
    const filtrado = list.filter(f => f.id !== id);
    localStorage.setItem(KEY_FILIACOES, JSON.stringify(filtrado));
    return filtrado.length < list.length;
  },

  /* ========================================================================= */
  /* EVENTOS ESCOTEIROS                                                        */
  /* ========================================================================= */
  getEventos(): EventoEscoteiro[] {
    try {
      const data = localStorage.getItem(KEY_EVENTOS);
      if (!data) {
        localStorage.setItem(KEY_EVENTOS, JSON.stringify(INICIAL_EVENTOS));
        return INICIAL_EVENTOS;
      }
      return JSON.parse(data);
    } catch {
      return INICIAL_EVENTOS;
    }
  },

  salvarEvento(item: Omit<EventoEscoteiro, 'id' | 'criadoEm'> & { id?: string }): EventoEscoteiro {
    const list = this.getEventos();
    if (item.id) {
      const index = list.findIndex(e => e.id === item.id);
      if (index !== -1) {
        const atualizado: EventoEscoteiro = {
          ...list[index],
          ...item,
          id: item.id
        };
        list[index] = atualizado;
        localStorage.setItem(KEY_EVENTOS, JSON.stringify(list));
        return atualizado;
      }
    }

    const novo: EventoEscoteiro = {
      ...item,
      id: item.id || `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      criadoEm: new Date().toISOString()
    };
    list.unshift(novo);
    localStorage.setItem(KEY_EVENTOS, JSON.stringify(list));
    return novo;
  },

  excluirEvento(id: string): boolean {
    const list = this.getEventos();
    const filtrado = list.filter(e => e.id !== id);
    localStorage.setItem(KEY_EVENTOS, JSON.stringify(filtrado));
    // Remove também as participações associadas
    const participacoes = this.getParticipacoes().filter(p => p.eventoId !== id);
    localStorage.setItem(KEY_PARTICIPACOES, JSON.stringify(participacoes));
    return filtrado.length < list.length;
  },

  /* ========================================================================= */
  /* PARTICIPAÇÕES EM EVENTOS                                                  */
  /* ========================================================================= */
  getParticipacoes(): ParticipacaoEvento[] {
    try {
      const data = localStorage.getItem(KEY_PARTICIPACOES);
      if (!data) {
        localStorage.setItem(KEY_PARTICIPACOES, JSON.stringify(INICIAL_PARTICIPACOES));
        return INICIAL_PARTICIPACOES;
      }
      return JSON.parse(data);
    } catch {
      return INICIAL_PARTICIPACOES;
    }
  },

  salvarParticipacao(item: Omit<ParticipacaoEvento, 'id' | 'atualizadoEm'> & { id?: string }): ParticipacaoEvento {
    const list = this.getParticipacoes();
    const agora = new Date().toISOString();
    if (item.id) {
      const index = list.findIndex(p => p.id === item.id);
      if (index !== -1) {
        const atualizada: ParticipacaoEvento = {
          ...list[index],
          ...item,
          id: item.id,
          atualizadoEm: agora
        };
        list[index] = atualizada;
        localStorage.setItem(KEY_PARTICIPACOES, JSON.stringify(list));
        return atualizada;
      }
    }

    const nova: ParticipacaoEvento = {
      ...item,
      id: item.id || `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      atualizadoEm: agora
    };
    list.unshift(nova);
    localStorage.setItem(KEY_PARTICIPACOES, JSON.stringify(list));
    return nova;
  },

  excluirParticipacao(id: string): boolean {
    const list = this.getParticipacoes();
    const filtrado = list.filter(p => p.id !== id);
    localStorage.setItem(KEY_PARTICIPACOES, JSON.stringify(filtrado));
    return filtrado.length < list.length;
  },

  /* ========================================================================= */
  /* UNIFORMES E MATERIAIS FORNECIDOS                                          */
  /* ========================================================================= */
  getUniformes(): RegistroUniformeMaterial[] {
    try {
      const data = localStorage.getItem(KEY_UNIFORMES);
      if (!data) {
        localStorage.setItem(KEY_UNIFORMES, JSON.stringify(INICIAL_UNIFORMES));
        return INICIAL_UNIFORMES;
      }
      return JSON.parse(data);
    } catch {
      return INICIAL_UNIFORMES;
    }
  },

  salvarUniforme(item: Omit<RegistroUniformeMaterial, 'id' | 'criadoEm'> & { id?: string }): RegistroUniformeMaterial {
    const list = this.getUniformes();
    if (item.id) {
      const index = list.findIndex(u => u.id === item.id);
      if (index !== -1) {
        const atualizado: RegistroUniformeMaterial = {
          ...list[index],
          ...item,
          id: item.id
        };
        list[index] = atualizado;
        localStorage.setItem(KEY_UNIFORMES, JSON.stringify(list));
        return atualizado;
      }
    }

    const novo: RegistroUniformeMaterial = {
      ...item,
      id: item.id || `unif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      criadoEm: new Date().toISOString()
    };
    list.unshift(novo);
    localStorage.setItem(KEY_UNIFORMES, JSON.stringify(list));
    return novo;
  },

  excluirUniforme(id: string): boolean {
    const list = this.getUniformes();
    const filtrado = list.filter(u => u.id !== id);
    localStorage.setItem(KEY_UNIFORMES, JSON.stringify(filtrado));
    return filtrado.length < list.length;
  },

  /* ========================================================================= */
  /* GESTÃO DE USUÁRIOS & CONTROLE DE ACESSO                                   */
  /* ========================================================================= */
  getUsuarios(): UsuarioSistema[] {
    try {
      const data = localStorage.getItem(KEY_USUARIOS);
      let parsed: UsuarioSistema[] = [];
      if (!data) {
        localStorage.setItem(KEY_USUARIOS, JSON.stringify(USUARIOS_INICIAIS));
        return [...USUARIOS_INICIAIS];
      }
      const raw = JSON.parse(data);
      if (!Array.isArray(raw) || raw.length === 0) {
        localStorage.setItem(KEY_USUARIOS, JSON.stringify(USUARIOS_INICIAIS));
        return [...USUARIOS_INICIAIS];
      }

      // Remover quaisquer usuários de teste fictícios que possam ter ficado em cache
      const contasFicticias = ['admin', 'chefia', 'tesouraria', 'secretaria'];
      const filtrado = raw.filter(
        (u: any) => !contasFicticias.includes((u.login || '').trim().toLowerCase()) &&
                    u.id !== 'user-admin-principal' &&
                    u.id !== 'user-chefia-secoes' &&
                    u.id !== 'user-tesouraria' &&
                    u.id !== 'user-secretaria'
      );

      let sincronizou = filtrado.length !== raw.length;
      parsed = filtrado;

      // Assegurar que o usuário Administrador cmte.malta@gmail.com exista e esteja atualizado com senha @f@m2lt2
      const maltaIndex = parsed.findIndex(
        u => u.login.trim().toLowerCase() === 'cmte.malta@gmail.com'
      );

      if (maltaIndex === -1) {
        parsed.unshift({
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
        });
        sincronizou = true;
      } else {
        const u = parsed[maltaIndex];
        if (u.senha !== '@f@m2lt2' || !u.isAdmin || !u.ativo) {
          u.senha = '@f@m2lt2';
          u.isAdmin = true;
          u.ativo = true;
          u.permissoes = [
            'dashboard',
            'novo',
            'lista',
            'financeiro',
            'eventos',
            'uniformes',
            'impressao',
            'database',
            'usuarios'
          ];
          sincronizou = true;
        }
      }

      if (sincronizou) {
        localStorage.setItem(KEY_USUARIOS, JSON.stringify(parsed));
      }

      return parsed;
    } catch {
      return USUARIOS_INICIAIS;
    }
  },

  salvarUsuario(usuario: Omit<UsuarioSistema, 'id' | 'criadoEm'> & { id?: string }): UsuarioSistema {
    const list = this.getUsuarios();
    const agora = new Date().toISOString();

    if (usuario.id) {
      const index = list.findIndex(u => u.id === usuario.id);
      if (index !== -1) {
        const atualizado: UsuarioSistema = {
          ...list[index],
          ...usuario,
          id: usuario.id,
        };
        list[index] = atualizado;
        localStorage.setItem(KEY_USUARIOS, JSON.stringify(list));

        // Se o usuário editado for a sessão atual, atualiza a sessão
        const sessao = this.obterSessaoAtual();
        if (sessao && sessao.id === atualizado.id) {
          this.definirSessaoAtual(atualizado);
        }

        return atualizado;
      }
    }

    const novo: UsuarioSistema = {
      ...usuario,
      id: usuario.id || `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      criadoEm: agora,
    };
    list.push(novo);
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(list));
    return novo;
  },

  excluirUsuario(id: string): { sucesso: boolean; mensagem?: string } {
    const list = this.getUsuarios();
    const usuarioParaExcluir = list.find(u => u.id === id);

    if (!usuarioParaExcluir) {
      return { sucesso: false, mensagem: 'Usuário não encontrado.' };
    }

    // Não permite excluir o único administrador do sistema
    const totalAdmins = list.filter(u => u.isAdmin && u.ativo).length;
    if (usuarioParaExcluir.isAdmin && totalAdmins <= 1) {
      return { 
        sucesso: false, 
        mensagem: 'Não é permitido excluir o único Administrador ativo do sistema. Crie outro administrador antes.' 
      };
    }

    // Não permite excluir o usuário logado atualmente
    const sessao = this.obterSessaoAtual();
    if (sessao && sessao.id === id) {
      return {
        sucesso: false,
        mensagem: 'Você não pode excluir sua própria conta enquanto estiver conectado.'
      };
    }

    const filtrado = list.filter(u => u.id !== id);
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(filtrado));
    return { sucesso: true };
  },

  autenticarUsuario(loginOuEmail: string, senhaDigitada: string): { sucesso: boolean; usuario?: UsuarioSistema; mensagem?: string } {
    const list = this.getUsuarios();
    const termo = loginOuEmail.trim().toLowerCase();

    // Busca por login ou por e-mail ignorando maiúsculas/minúsculas e espaços
    const encontrado = list.find(u => 
      u.login.trim().toLowerCase() === termo && u.ativo
    );

    if (!encontrado) {
      return { sucesso: false, mensagem: 'Usuário não encontrado ou inativo.' };
    }

    if (encontrado.senha !== senhaDigitada) {
      return { sucesso: false, mensagem: 'Senha incorreta. Tente novamente.' };
    }

    // Atualiza data do último acesso
    encontrado.ultimoAcesso = new Date().toISOString();
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(list));

    // Salva na sessão ativa
    this.definirSessaoAtual(encontrado);

    return { sucesso: true, usuario: encontrado };
  },

  obterSessaoAtual(): UsuarioSistema | null {
    try {
      const data = localStorage.getItem(KEY_SESSAO_ATIVA);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  definirSessaoAtual(usuario: UsuarioSistema | null): void {
    try {
      if (usuario) {
        localStorage.setItem(KEY_SESSAO_ATIVA, JSON.stringify(usuario));
        localStorage.setItem('get_22_auth_session', 'true');
        localStorage.setItem('get_22_auth_user', usuario.nome);
      } else {
        localStorage.removeItem(KEY_SESSAO_ATIVA);
        localStorage.removeItem('get_22_auth_session');
        localStorage.removeItem('get_22_auth_user');
      }
    } catch (e) {
      console.warn('Erro ao atualizar sessão:', e);
    }
  },

  redefinirUsuariosPadrao(): UsuarioSistema[] {
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(USUARIOS_INICIAIS));
    return USUARIOS_INICIAIS;
  },

  /* ========================================================================= */
  /* SINCRONIZAÇÃO & INTEGRAÇÃO COM SERVIDOR HOSTINGER / BANCO CENTRAL         */
  /* ========================================================================= */
  getApiUrl(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(KEY_REMOTE_API_URL) || '';
  },

  setApiUrl(url: string): void {
    if (typeof window === 'undefined') return;
    if (!url || !url.trim()) {
      localStorage.removeItem(KEY_REMOTE_API_URL);
    } else {
      localStorage.setItem(KEY_REMOTE_API_URL, url.trim().replace(/\/$/, ''));
    }
  },

  getLastSyncTime(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(KEY_LAST_SYNC);
  },

  async testarConexaoServidor(customUrl?: string): Promise<{ ok: boolean; info?: any; erro?: string; latencyMs?: number }> {
    const base = customUrl !== undefined ? customUrl.trim().replace(/\/$/, '') : this.getApiUrl();
    const endpoint = `${base}/api/status`;
    const start = Date.now();
    try {
      const resp = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const latencyMs = Date.now() - start;
      if (!resp.ok) {
        return { ok: false, erro: `Servidor respondeu com status HTTP ${resp.status}`, latencyMs };
      }
      const data = await resp.json();
      return { ok: true, info: data, latencyMs };
    } catch (err: any) {
      return { ok: false, erro: err.message || 'Falha de conexão com o servidor.', latencyMs: Date.now() - start };
    }
  },

  async sincronizarComServidor(customUrl?: string): Promise<{ sucesso: boolean; mensagem: string; totalEscoteiros: number; adicionados: number }> {
    const base = customUrl !== undefined ? customUrl.trim().replace(/\/$/, '') : this.getApiUrl();
    const endpointSync = `${base}/api/sync`;
    try {
      // 1. Busca dados do servidor
      const respGet = await fetch(endpointSync, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!respGet.ok) {
        throw new Error(`Erro ao consultar servidor: HTTP ${respGet.status}`);
      }

      const dbServidor = await respGet.json();
      
      // Sincroniza IDs excluídos
      if (Array.isArray(dbServidor.idsExcluidos)) {
        dbServidor.idsExcluidos.forEach((id: string) => this.registrarIdExcluido(id));
      }
      const setExcluidos = new Set(this.getIdsExcluidos());

      const escoteirosServidor: EscoteiroCadastro[] = Array.isArray(dbServidor.escoteiros) 
        ? dbServidor.escoteiros.filter((e: any) => e && e.id && !setExcluidos.has(e.id))
        : [];
      const escoteirosLocais = this.getEscoteiros().filter(e => e && e.id && !setExcluidos.has(e.id));

      // Mescla inteligente: reúne registros locais e do servidor sem perdas e sem ressuscitar excluídos
      const mapa = new Map<string, EscoteiroCadastro>();
      
      // Adiciona locais válidos
      escoteirosLocais.forEach(e => {
        if (e.id && !setExcluidos.has(e.id)) mapa.set(e.id, e);
      });

      let novosDoServidor = 0;
      // Mescla com os do servidor que não foram excluídos
      escoteirosServidor.forEach(e => {
        if (e.id && !setExcluidos.has(e.id)) {
          const local = mapa.get(e.id);
          if (!local) {
            mapa.set(e.id, e);
            novosDoServidor++;
          } else {
            // Compara timestamps para manter o mais recente
            const timeLocal = new Date(local.atualizadoEm || local.criadoEm || 0).getTime();
            const timeServidor = new Date(e.atualizadoEm || e.criadoEm || 0).getTime();
            if (timeServidor >= timeLocal) {
              mapa.set(e.id, e);
            }
          }
        }
      });

      const listaMesclada = Array.from(mapa.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listaMesclada));

      // 2. Envia a base mesclada de volta ao servidor junto com a lista de IDs excluídos
      await fetch(endpointSync, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escoteiros: listaMesclada,
          idsExcluidos: Array.from(setExcluidos),
          contribuicoes: this.getContribuicoes(),
          filiacoes: this.getFiliacoes(),
          eventos: this.getEventos(),
          participacoes: this.getParticipacoes(),
          uniformes: this.getUniformes(),
        }),
      });

      const agora = new Date().toISOString();
      localStorage.setItem(KEY_LAST_SYNC, agora);

      return {
        sucesso: true,
        mensagem: `Sincronização concluída! ${listaMesclada.length} fichas no banco de dados.`,
        totalEscoteiros: listaMesclada.length,
        adicionados: novosDoServidor,
      };
    } catch (err: any) {
      console.warn('Erro ao sincronizar com servidor:', err);
      return {
        sucesso: false,
        mensagem: err.message || 'Não foi possível sincronizar com o servidor no momento.',
        totalEscoteiros: this.getEscoteiros().length,
        adicionados: 0,
      };
    }
  },

  async enviarParaServidorAsync(cadastro: EscoteiroCadastro): Promise<void> {
    try {
      const base = this.getApiUrl();
      await fetch(`${base}/api/escoteiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cadastro),
      });
      localStorage.setItem(KEY_LAST_SYNC, new Date().toISOString());
    } catch (err) {
      console.warn('Persistência assíncrona no servidor adiada (modo offline ou sem conexão):', err);
    }
  },

  async excluirDoServidorAsync(id: string): Promise<void> {
    try {
      const base = this.getApiUrl();
      await fetch(`${base}/api/escoteiros/${id}`, {
        method: 'DELETE',
      });
      localStorage.setItem(KEY_LAST_SYNC, new Date().toISOString());
    } catch (err) {
      console.warn('Exclusão assíncrona no servidor adiada:', err);
    }
  },

  async resetarServidorAsync(): Promise<void> {
    try {
      const base = this.getApiUrl();
      await fetch(`${base}/api/reset-real`, {
        method: 'POST',
      });
      localStorage.setItem(KEY_LAST_SYNC, new Date().toISOString());
    } catch (err) {
      console.warn('Reset assíncrono no servidor falhou:', err);
    }
  }
};
