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

const STORAGE_KEY = 'get_22_fevereiro_escoteiros_db';
const KEY_CONTRIBUICOES = 'get_22_fevereiro_contribuicoes_db';
const KEY_FILIACOES = 'get_22_fevereiro_filiacoes_db';
const KEY_EVENTOS = 'get_22_fevereiro_eventos_db';
const KEY_PARTICIPACOES = 'get_22_fevereiro_participacoes_db';
const KEY_UNIFORMES = 'get_22_fevereiro_uniformes_db';

export const storageService = {
  getEscoteiros(): EscoteiroCadastro[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DADOS_INICIAIS_FRANCA));
        return DADOS_INICIAIS_FRANCA;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DADOS_INICIAIS_FRANCA));
        return DADOS_INICIAIS_FRANCA;
      }
      return parsed.map((e: EscoteiroCadastro) => ({
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
      return DADOS_INICIAIS_FRANCA;
    }
  },

  salvarEscoteiro(cadastro: Omit<EscoteiroCadastro, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }): EscoteiroCadastro {
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
        return atualizado;
      }
    }

    // Novo cadastro
    const count = list.length + 1;
    const novoRegistro = cadastro.fichaMedica.numeroRegistro || `GET-2026-${String(count).padStart(3, '0')}`;
    const novo: EscoteiroCadastro = {
      ...cadastro,
      id: `esc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      criadoEm: agora,
      atualizadoEm: agora,
      fichaMedica: {
        ...cadastro.fichaMedica,
        numeroRegistro: novoRegistro,
      }
    };

    list.unshift(novo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return novo;
  },

  excluirEscoteiro(id: string): boolean {
    const list = this.getEscoteiros();
    const filtered = list.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered.length < list.length;
  },

  getEscoteiroPorId(id: string): EscoteiroCadastro | undefined {
    return this.getEscoteiros().find(e => e.id === id);
  },

  restaurarDadosPadrao(): EscoteiroCadastro[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DADOS_INICIAIS_FRANCA));
    return DADOS_INICIAIS_FRANCA;
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
  }
};
