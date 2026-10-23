export type Sexo = 'M' | 'F';

export type RamoEscoteiro = 'Lobinho' | 'Escoteiro' | 'Sênior' | 'Pioneiro' | 'Adulto / Chefia';

export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Não Informado';

export interface ContatoEmergencia {
  id: string;
  nome: string;
  parentesco: string;
  telefone: string;
}

export interface ResponsavelLegal {
  nomeCompleto: string;
  sexo: Sexo | '';
  dataNascimento: string;
  estadoCivil: string;
  rg: string;
  cpf: string;
  grauParentesco: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone1: string;
  telefone2: string;
  email: string;
  profissao: string;
  escolaridade: string;
}

export interface FichaMedica {
  // 1. Identificação e Dados Físicos
  numeroRegistro: string;
  altura: string; // m
  peso: string; // kg
  tipoSanguineo: TipoSanguineo;
  fatorRh: 'Positivo' | 'Negativo' | 'Não Informado';
  equipamentosAuxilio: string[];
  equipamentosAuxilioOutros: string;

  // 2. Histórico Clínico Geral
  doencasPregressas: string[];
  condicoesTratamento: string;
  outrasInformacoesClinicas: string;

  // 3. Neurodivergências e Condições do Neurodesenvolvimento
  apresentaNeurodivergencia: boolean;
  autismoTea: boolean;
  autismoNivelSuporte: 'Nível 1' | 'Nível 2' | 'Nível 3' | '';
  autismoGatilhos: string;
  tdah: boolean;
  tdahPredominio: 'Hiperatividade' | 'Desatenção' | 'Impulsividade' | 'Combinado' | '';
  tdahObservacoes: string;
  outrasCondicoesNeuro: string[];
  outraCondicaoNaoListada: string;
  cuidadosPedagogicos: string;
  medicacoesQuadroNeuro: string;

  // 4. Medicamentos e Condutas Médicas
  medicamentoContinuo: boolean;
  medicamentosDetalhes: string;
  autorizaAdministracaoMedicamentos: boolean;
  restricoesMedicamentos: string;
  urgenciaEmergenciaMedica: 'Aguardar acompanhamento dos pais/responsáveis' | 'Autoriza intervenção médica imediata';
  avisarPrioritariamente: 'Pais/Responsáveis legais' | 'Outro';
  avisarPrioritariamenteOutro: string;
  avisarPrioritariamenteTelefone: string;
  possuiPlanoSaude: boolean;
  planoOperadora: string;
  planoNumeroCarteirinha: string;
  planoMedicoReferencia: string;
  planoTelefoneMedico: string;

  // 5. Alergias e Intolerâncias
  apresentaAlergia: boolean;
  alergiaPicadaInsetos: boolean;
  alergiaPicadaInsetosDetalhes: string;
  alergiaMedicamentos: boolean;
  alergiaMedicamentosDetalhes: string;
  alergiaPlantasPolen: boolean;
  alergiaPlantasPolenDetalhes: string;
  alergiaAlimentos: boolean;
  alergiaAlimentosDetalhes: string;
  alergiaOutras: boolean;
  alergiaOutrasDetalhes: string;

  // 6. Informações Gerais de Aptidão
  impedidoAtividadesArLivre: boolean;
  impedidoAtividadesDetalhes: string;
  restricoesAlimentares: boolean;
  restricoesAlimentaresDetalhes: string;
  cardiopatias: boolean;
  cardiopatiasDetalhes: string;
  sabeNadar: boolean;
  historicoSonambulismo: boolean;

  // 7. Saúde Mental e Transtornos Psicológicos
  transtornoComportamento: boolean;
  transtornoComportamentoDetalhes: string;
  transtornoAlimentar: boolean;
  transtornoAlimentarDetalhes: string;
  transtornoAnsiedadeFobia: boolean;
  transtornoAnsiedadeFobiaDetalhes: string;

  // 8. Pessoas com Deficiência (PCD)
  apresentaDeficiencia: boolean;
  tiposDeficiencia: string[];
  deficienciaEspecificar: string;
  deficienciaFisica?: boolean;
  deficienciaFisicaDetalhes?: string;
  deficienciaVisual?: boolean;
  deficienciaVisualDetalhes?: string;
  deficienciaAuditiva?: boolean;
  deficienciaAuditivaDetalhes?: string;
  deficienciaIntelectual?: boolean;
  deficienciaIntelectualDetalhes?: string;
}

export interface EscoteiroCadastro {
  id: string;
  criadoEm: string; // ISO
  atualizadoEm: string; // ISO

  // Foto 3x4 do Escoteiro (Base64 compactada ou URL)
  foto?: string;

  // 1. Dados do Inscrito
  nomeCompleto: string;
  sexo: Sexo;
  dataNascimento: string; // YYYY-MM-DD
  naturalidade: string;
  ufNaturalidade: string;
  estadoCivil: string;
  rg: string;
  cpf: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone1: string;
  telefone2: string;
  email: string;
  profissao: string;
  escolaridade: string;
  religiao: string;

  // 2. Primeiro Responsável Legal
  primeiroResponsavel: ResponsavelLegal;

  // 3. Segundo Responsável Legal
  temSegundoResponsavel: boolean;
  segundoResponsavel: ResponsavelLegal;

  // 4. Situação Familiar e Guarda
  responsavelGuarda: 'Pai' | 'Mãe' | 'Ambos / Compartilhada' | 'Outro';
  responsavelGuardaOutro: string;
  outroResponsavelCiencia: boolean;
  outroResponsavelConcorda: boolean;
  regimeConvivenciaVisitas: string;

  // 5. Contatos Adicionais de Emergência
  contatosEmergencia: ContatoEmergencia[];

  // Ficha Médica
  fichaMedica: FichaMedica;

  // Termos e Autorizações
  autorizacaoImagem: boolean;
  concordanciaRegulamento: boolean;
  cienciaContribuicaoMensal: boolean;
  responsavelAssinatura: string;
  cpfAssinatura: string;
  dataAssinatura: string;
  cidadeAssinatura: string;
}

// Funções auxiliares de cálculo e formatação
export function calcularIdade(dataNascimento: string): number {
  if (!dataNascimento) return 0;
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return isNaN(idade) ? 0 : Math.max(0, idade);
}

export function identificarRamo(idade: number): RamoEscoteiro {
  if (idade <= 10) return 'Lobinho'; // 6.5 a 10 anos
  if (idade <= 14) return 'Escoteiro'; // 11 a 14 anos
  if (idade <= 17) return 'Sênior'; // 15 a 17 anos (Sênior/Guia)
  if (idade <= 21) return 'Pioneiro'; // 18 a 21 anos
  return 'Adulto / Chefia'; // 21+ anos
}

export function formatarCPF(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatarTelefone(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatarCEP(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatarDataBR(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}
