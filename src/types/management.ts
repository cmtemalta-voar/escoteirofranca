import { RamoEscoteiro } from './scout';

export type SecaoEscoteira = 
  | 'Alcateia (Lobinhos)' 
  | 'Tropa Escoteira' 
  | 'Tropa Sênior' 
  | 'Clã Pioneiro' 
  | 'Chefia / Dirigente';

export function obterSecaoPorRamo(ramo: RamoEscoteiro): SecaoEscoteira {
  switch (ramo) {
    case 'Lobinho':
      return 'Alcateia (Lobinhos)';
    case 'Escoteiro':
      return 'Tropa Escoteira';
    case 'Sênior':
      return 'Tropa Sênior';
    case 'Pioneiro':
      return 'Clã Pioneiro';
    default:
      return 'Chefia / Dirigente';
  }
}

export type FormaPagamento = 'Pix' | 'Dinheiro' | 'Cartão' | 'Boleto' | 'Transferência';

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  'Pix',
  'Dinheiro',
  'Cartão',
  'Boleto',
  'Transferência'
];

/* ========================================================================= */
/* 1. CONTRIBUIÇÃO MENSAL                                                   */
/* ========================================================================= */
export type StatusContribuicao = 'Pago' | 'Pendente' | 'Em atraso' | 'Isento';

export interface ContribuicaoMensal {
  id: string;
  escoteiroId: string;
  escoteiroNome: string;
  secao: SecaoEscoteira;
  responsavelFinanceiro: string;
  competenciaMes: number; // 1 a 12
  competenciaAno: number; // ex: 2026
  valor: number;
  dataVencimento: string; // YYYY-MM-DD
  dataPagamento?: string; // YYYY-MM-DD
  formaPagamento?: FormaPagamento;
  status: StatusContribuicao;
  observacoes?: string;
  criadoEm: string;
}

export const MESES_NOMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/* ========================================================================= */
/* 2. FILIAÇÃO ANUAL                                                         */
/* ========================================================================= */
export type StatusFiliacao = 'Pago' | 'Pendente' | 'Em renovação' | 'Isento';

export interface FiliacaoAnual {
  id: string;
  escoteiroId: string;
  escoteiroNome: string;
  secao: SecaoEscoteira;
  ano: number; // ex: 2026
  valor: number;
  dataPagamento?: string;
  formaPagamento?: FormaPagamento;
  status: StatusFiliacao;
  comprovanteObs?: string;
  criadoEm: string;
}

/* ========================================================================= */
/* 3. EVENTOS ESCOTEIROS                                                     */
/* ========================================================================= */
export type TipoEvento = 
  | 'Acampamento' 
  | 'Bivaque' 
  | 'Jornada' 
  | 'Excursão' 
  | 'Atividade Especial' 
  | 'Feira / Comunitário' 
  | 'Formação';

export type StatusEvento = 'Planejado' | 'Aberto' | 'Realizado' | 'Cancelado';

export interface EventoEscoteiro {
  id: string;
  nome: string;
  tipo: TipoEvento;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  local: string;
  descricao: string;
  valorParticipacao: number;
  dataLimitePagamento: string;
  responsavel: string;
  vagas?: number;
  status: StatusEvento;
  criadoEm: string;
}

export type StatusFinanceiroParticipacao = 'Pago' | 'Pendente' | 'Parcial' | 'Isento';

export interface ParticipacaoEvento {
  id: string;
  eventoId: string;
  escoteiroId: string;
  escoteiroNome: string;
  secao: SecaoEscoteira;
  participou: boolean;
  valorCobrado: number;
  valorPago: number;
  dataPagamento?: string;
  formaPagamento?: FormaPagamento;
  statusFinanceiro: StatusFinanceiroParticipacao;
  observacoes?: string;
  atualizadoEm: string;
}

/* ========================================================================= */
/* 4. UNIFORMES E MATERIAIS FORNECIDOS                                       */
/* ========================================================================= */
export type TipoItemUniforme = 
  | 'Cobertura — boné'
  | 'Gandola escoteira'
  | 'Bermuda/short escoteiro'
  | 'Calça escoteira'
  | 'Short-saia escoteiro'
  | 'Cinto escoteiro'
  | 'Camiseta laranja'
  | 'Meião escoteiro'
  | 'Lenço e Distintivos'
  | 'Outro Material';

export const ITENS_UNIFORME_PADRAO: TipoItemUniforme[] = [
  'Cobertura — boné',
  'Gandola escoteira',
  'Bermuda/short escoteiro',
  'Calça escoteira',
  'Short-saia escoteiro',
  'Cinto escoteiro',
  'Camiseta laranja',
  'Meião escoteiro',
  'Lenço e Distintivos',
  'Outro Material'
];

export type OrigemMaterial = 'Fornecido pelo Grupo' | 'Adquirido/Pago pelo responsável';

export type StatusPagamentoMaterial = 'Pago' | 'Pendente' | 'Parcial' | 'Cortesia / Isento';

export interface RegistroUniformeMaterial {
  id: string;
  escoteiroId: string;
  escoteiroNome: string;
  secao: SecaoEscoteira;
  item: TipoItemUniforme;
  origem: OrigemMaterial;
  tamanho: string; // ex: 8, 10, 12, 14, 16, P, M, G, GG, Único
  quantidade: number;
  dataEntrega: string; // YYYY-MM-DD
  valor: number;
  statusPagamento: StatusPagamentoMaterial;
  valorPago: number;
  dataPagamento?: string;
  formaPagamento?: FormaPagamento;
  responsavelRecebimento: string;
  observacoes?: string;
  criadoEm: string;
}

/* ========================================================================= */
/* 5. ANIVERSARIANTES HELPERS                                                */
/* ========================================================================= */
export interface InfoAniversariante {
  escoteiroId: string;
  nome: string;
  secao: SecaoEscoteira;
  dataNascimento: string;
  idadeAtual: number;
  idadeCompletar: number;
  proximoAniversarioFormatado: string;
  dataProximoAniversario: Date;
  diasRestantes: number;
  categoria: 'hoje' | 'amanha' | 'semana' | 'mes' | 'futuro';
  mesAniversario: number;
  diaAniversario: number;
}

export function calcularInfoAniversario(
  escoteiroId: string, 
  nome: string, 
  secao: SecaoEscoteira, 
  dataNasc: string,
  hojeRef: Date = new Date()
): InfoAniversariante | null {
  if (!dataNasc) return null;
  const parts = dataNasc.split('-');
  if (parts.length !== 3) return null;

  const anoNasc = parseInt(parts[0], 10);
  const mesNasc = parseInt(parts[1], 10) - 1; // 0-11
  const diaNasc = parseInt(parts[2], 10);

  const anoAtual = hojeRef.getFullYear();

  // Aniversário neste ano
  let dataAniv = new Date(anoAtual, mesNasc, diaNasc);
  // Zera hora para cálculo puro de dias
  const hoje = new Date(hojeRef.getFullYear(), hojeRef.getMonth(), hojeRef.getDate());
  
  if (dataAniv < hoje) {
    // Já passou este ano, o próximo é no ano que vem
    dataAniv = new Date(anoAtual + 1, mesNasc, diaNasc);
  }

  const diffTime = dataAniv.getTime() - hoje.getTime();
  const diasRestantes = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Idade
  let idadeAtual = hojeRef.getFullYear() - anoNasc;
  const fezAniversarioEsteAno = 
    hojeRef.getMonth() > mesNasc || 
    (hojeRef.getMonth() === mesNasc && hojeRef.getDate() >= diaNasc);
  if (!fezAniversarioEsteAno) {
    idadeAtual--;
  }

  const idadeCompletar = dataAniv.getFullYear() - anoNasc;

  let categoria: 'hoje' | 'amanha' | 'semana' | 'mes' | 'futuro' = 'futuro';
  if (diasRestantes === 0) {
    categoria = 'hoje';
  } else if (diasRestantes === 1) {
    categoria = 'amanha';
  } else if (diasRestantes <= 7) {
    categoria = 'semana';
  } else if (diasRestantes <= 30) {
    categoria = 'mes';
  }

  const diaStr = String(diaNasc).padStart(2, '0');
  const mesStr = String(mesNasc + 1).padStart(2, '0');

  return {
    escoteiroId,
    nome,
    secao,
    dataNascimento: dataNasc,
    idadeAtual,
    idadeCompletar,
    proximoAniversarioFormatado: `${diaStr}/${mesStr}`,
    dataProximoAniversario: dataAniv,
    diasRestantes,
    categoria,
    mesAniversario: mesNasc + 1,
    diaAniversario: diaNasc
  };
}
