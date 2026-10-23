import { TabType } from '../components/Navbar';

export type PermissaoModulo = 
  | 'dashboard'
  | 'novo'
  | 'lista'
  | 'financeiro'
  | 'eventos'
  | 'uniformes'
  | 'impressao'
  | 'database'
  | 'usuarios';

export interface PermissaoItem {
  id: PermissaoModulo;
  nome: string;
  descricao: string;
  icone: string;
  categoria: 'Visão Geral' | 'Secretaria' | 'Atividades & Operações' | 'Administrativo';
}

export const LISTA_PERMISSOES: PermissaoItem[] = [
  {
    id: 'dashboard',
    nome: 'Painel & Aniversariantes',
    descricao: 'Estatísticas do grupo, resumo por ramos e aniversariantes do mês.',
    icone: 'BarChart3',
    categoria: 'Visão Geral',
  },
  {
    id: 'novo',
    nome: 'Ficha de Inscrição / Cadastro',
    descricao: 'Cadastrar novos membros e preencher fichas completas.',
    icone: 'UserPlus',
    categoria: 'Secretaria',
  },
  {
    id: 'lista',
    nome: 'Lista de Membros & Dossiê',
    descricao: 'Visualizar associados, contatos, prontuários médicos e histórico.',
    icone: 'Users',
    categoria: 'Secretaria',
  },
  {
    id: 'impressao',
    nome: 'Ficha Oficial de Matrícula',
    descricao: 'Gerar e imprimir a Ficha Oficial padronizada do G.E.T.',
    icone: 'Printer',
    categoria: 'Secretaria',
  },
  {
    id: 'financeiro',
    nome: 'Controle Financeiro & Filiação',
    descricao: 'Gestão de mensalidades, taxas de filiação anual e relatórios de caixa.',
    icone: 'DollarSign',
    categoria: 'Atividades & Operações',
  },
  {
    id: 'eventos',
    nome: 'Eventos & Acampamentos',
    descricao: 'Organização de acampamentos, excursões, taxas e presenças.',
    icone: 'Tent',
    categoria: 'Atividades & Operações',
  },
  {
    id: 'uniformes',
    nome: 'Fardamento & Material',
    descricao: 'Controle de lenços, vestuário escoteiro, distintivos e estoque.',
    icone: 'Shirt',
    categoria: 'Atividades & Operações',
  },
  {
    id: 'database',
    nome: 'Backup & Banco de Dados',
    descricao: 'Exportação, importação e restauração de dados do sistema.',
    icone: 'Database',
    categoria: 'Administrativo',
  },
  {
    id: 'usuarios',
    nome: 'Gestão de Usuários & Acessos',
    descricao: 'Criar chefes, definir permissões e gerenciar senhas.',
    icone: 'ShieldCheck',
    categoria: 'Administrativo',
  },
];

export interface UsuarioSistema {
  id: string;
  nome: string;
  login: string;
  senha: string;
  cargo: string;
  isAdmin: boolean;
  permissoes: PermissaoModulo[];
  ativo: boolean;
  criadoEm: string;
  ultimoAcesso?: string;
}

export interface SessaoUsuario {
  autenticado: boolean;
  usuario: UsuarioSistema | null;
}
