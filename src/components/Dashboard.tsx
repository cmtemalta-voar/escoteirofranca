import React, { useMemo, useState } from 'react';
import { 
  EscoteiroCadastro, 
  calcularIdade, 
  identificarRamo, 
  RamoEscoteiro,
  formatarDataBR 
} from '../types/scout';
import { 
  ContribuicaoMensal, 
  FiliacaoAnual, 
  EventoEscoteiro, 
  RegistroUniformeMaterial,
  MESES_NOMES 
} from '../types/management';
import { AniversariantesCard } from './AniversariantesCard';
import { 
  Users, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  Waves, 
  Pill, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  HeartPulse,
  Printer,
  ChevronRight,
  DollarSign,
  ShieldCheck,
  Tent,
  Shirt,
  CheckCircle2,
  Clock,
  Eye
} from 'lucide-react';

interface DashboardProps {
  escoteiros: EscoteiroCadastro[];
  contribuicoes: ContribuicaoMensal[];
  filiacoes: FiliacaoAnual[];
  eventos: EventoEscoteiro[];
  uniformes: RegistroUniformeMaterial[];
  onSelectEscoteiro: (escoteiro: EscoteiroCadastro) => void;
  onNovoCadastro: () => void;
  onVerTodos: () => void;
  onImprimirEscoteiro: (escoteiro: EscoteiroCadastro) => void;
  onOpenDirigenteDossier?: (escoteiro: EscoteiroCadastro) => void;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  escoteiros,
  contribuicoes,
  filiacoes,
  eventos,
  uniformes,
  onSelectEscoteiro,
  onNovoCadastro,
  onVerTodos,
  onImprimirEscoteiro,
  onOpenDirigenteDossier,
  onNavigateTab,
}) => {
  const [bairroFilter, setBairroFilter] = useState<string>('todos');

  // Métricas Principais
  const total = escoteiros.length;

  const stats = useMemo(() => {
    let masc = 0;
    let fem = 0;
    let somaIdades = 0;
    const ramosContagem: Record<RamoEscoteiro, number> = {
      'Lobinho': 0,
      'Escoteiro': 0,
      'Sênior': 0,
      'Pioneiro': 0,
      'Adulto / Chefia': 0
    };

    const bairrosContagem: Record<string, number> = {};
    const idadesContagem: Record<number, number> = {};
    const tiposSanguineos: Record<string, number> = {};

    let sabemNadar = 0;
    let comAlergia = 0;
    let comMedicamento = 0;
    let comNeurodivergencia = 0;
    let comDeficiencia = 0;
    let comPlanoPrivado = 0;

    escoteiros.forEach(e => {
      // Sexo
      if (e.sexo === 'M') masc++;
      else if (e.sexo === 'F') fem++;

      // Idade & Ramo
      const idade = calcularIdade(e.dataNascimento);
      somaIdades += idade;
      const ramo = identificarRamo(idade);
      ramosContagem[ramo] = (ramosContagem[ramo] || 0) + 1;

      idadesContagem[idade] = (idadesContagem[idade] || 0) + 1;

      // Bairro
      const bairroLimpo = (e.bairro || 'Não informado').trim();
      bairrosContagem[bairroLimpo] = (bairrosContagem[bairroLimpo] || 0) + 1;

      // Ficha Médica
      if (e.fichaMedica.sabeNadar) sabemNadar++;
      if (e.fichaMedica.apresentaAlergia) comAlergia++;
      if (e.fichaMedica.medicamentoContinuo) comMedicamento++;
      if (e.fichaMedica.apresentaNeurodivergencia) comNeurodivergencia++;
      if (e.fichaMedica.apresentaDeficiencia) comDeficiencia++;
      if (e.fichaMedica.possuiPlanoSaude) comPlanoPrivado++;

      const tipoSang = e.fichaMedica.tipoSanguineo || 'Não Informado';
      tiposSanguineos[tipoSang] = (tiposSanguineos[tipoSang] || 0) + 1;
    });

    const mediaIdade = total > 0 ? (somaIdades / total).toFixed(1) : '0';
    const pctMasc = total > 0 ? Math.round((masc / total) * 100) : 0;
    const pctFem = total > 0 ? Math.round((fem / total) * 100) : 0;
    const pctNadam = total > 0 ? Math.round((sabemNadar / total) * 100) : 0;

    // Ordenar bairros por maior quantidade
    const bairrosOrdenados = Object.entries(bairrosContagem)
      .map(([bairro, count]) => ({ bairro, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    // Faixas etárias para visualização
    const faixasEtarias = [
      { label: '6 a 8 anos', min: 6, max: 8, count: 0 },
      { label: '9 a 10 anos', min: 9, max: 10, count: 0 },
      { label: '11 a 12 anos', min: 11, max: 12, count: 0 },
      { label: '13 a 14 anos', min: 13, max: 14, count: 0 },
      { label: '15 a 17 anos', min: 15, max: 17, count: 0 },
      { label: '18 a 21 anos', min: 18, max: 21, count: 0 },
      { label: '22+ anos (Chefia)', min: 22, max: 99, count: 0 },
    ];

    escoteiros.forEach(e => {
      const id = calcularIdade(e.dataNascimento);
      const faixa = faixasEtarias.find(f => id >= f.min && id <= f.max);
      if (faixa) faixa.count++;
    });

    return {
      masc,
      fem,
      pctMasc,
      pctFem,
      mediaIdade,
      ramosContagem,
      bairrosOrdenados,
      faixasEtarias,
      sabemNadar,
      pctNadam,
      comAlergia,
      comMedicamento,
      comNeurodivergencia,
      comDeficiencia,
      comPlanoPrivado,
      tiposSanguineos
    };
  }, [escoteiros, total]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Summary Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-white p-5 sm:p-8 rounded-2xl shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Painel Gerencial de Inscrições & Saúde</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold font-serif tracking-tight leading-tight">
              Grupo Escoteiro Tradicional 22 de Fevereiro
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              Sede Franca/SP • Fichas de inscrição, dados cadastrais, 
              avaliações médicas e monitoramento de segurança dos jovens.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={onNovoCadastro}
              className="w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2"
            >
              <span>+ Novo Cadastro</span>
            </button>
            <button
              onClick={onVerTodos}
              className="w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-emerald-800/80 hover:bg-emerald-700/80 active:bg-emerald-900 text-white font-medium text-xs sm:text-sm rounded-xl border border-emerald-600/40 transition-all flex items-center justify-center gap-2"
            >
              <span>Ver Lista Completa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Cadastros */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 text-sm font-medium mb-3">
            <span>Total de Cadastros</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900">{total}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Ativos no Grupo
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Inscritos registrados no sistema com ficha completa
          </p>
        </div>

        {/* Quantidade por Sexo */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 text-sm font-medium mb-3">
            <span>Distribuição por Sexo</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xl font-bold text-stone-900">{stats.masc}</span>
              <span className="text-xs text-stone-500 ml-1">M ({stats.pctMasc}%)</span>
            </div>
            <div className="text-stone-300">|</div>
            <div>
              <span className="text-xl font-bold text-stone-900">{stats.fem}</span>
              <span className="text-xs text-stone-500 ml-1">F ({stats.pctFem}%)</span>
            </div>
          </div>
          {/* Progress split bar */}
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden flex mt-3">
            <div 
              className="bg-blue-600 h-full transition-all duration-500" 
              style={{ width: `${stats.pctMasc}%` }}
              title={`Masculino: ${stats.masc} (${stats.pctMasc}%)`}
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${stats.pctFem}%` }}
              title={`Feminino: ${stats.fem} (${stats.pctFem}%)`}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-stone-500 mt-1.5 font-medium">
            <span className="text-blue-700">● Masculino</span>
            <span className="text-rose-600">● Feminino</span>
          </div>
        </div>

        {/* Média de Idade */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 text-sm font-medium mb-3">
            <span>Média de Idade</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900">{stats.mediaIdade}</span>
            <span className="text-sm font-medium text-stone-500">anos</span>
          </div>
          <div className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="text-amber-700 font-semibold">{stats.ramosContagem['Lobinho']} Lobinhos</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">{stats.ramosContagem['Escoteiro']} Escoteiros</span>
          </div>
        </div>

        {/* Segurança: Autonomia Aquática */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 text-sm font-medium mb-3">
            <span>Segurança: Sabe Nadar</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Waves className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900">{stats.pctNadam}%</span>
            <span className="text-xs font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md">
              {stats.sabemNadar} de {total}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            {total - stats.sabemNadar} precisam de colete obrigatório em águas abertas
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🎂 CONTROLE DE ANIVERSARIANTES                                      */}
      {/* =================================================================== */}
      <AniversariantesCard
        escoteiros={escoteiros}
        onSelectEscoteiro={onSelectEscoteiro}
        onOpenDirigenteDossier={onOpenDirigenteDossier}
      />

      {/* =================================================================== */}
      {/* 💼 ATALHOS GERENCIAIS: FINANCEIRO, EVENTOS & UNIFORMES              */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contribuições */}
        <div 
          onClick={() => onNavigateTab('financeiro')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>1. Mensalidades</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900">
            {contribuicoes.filter(c => c.status === 'Pago').length} pagas
          </div>
          <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>Ver controle por seção</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Filiação Anual */}
        <div 
          onClick={() => onNavigateTab('financeiro')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>2. Filiação 2026</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900">
            {filiacoes.filter(f => f.ano === 2026 && f.status === 'Pago').length} quitadas
          </div>
          <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>Registros anuais GET</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Eventos Escoteiros */}
        <div 
          onClick={() => onNavigateTab('eventos')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>3. Acampamentos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <Tent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900">
            {eventos.length} atividades
          </div>
          <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>Inscrições & chamada</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Uniformes e Materiais */}
        <div 
          onClick={() => onNavigateTab('uniformes')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>4. Uniformes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900">
            {uniformes.length} itens
          </div>
          <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>Tamanhos & almoxarifado</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>

      {/* Row 2: Ramos Escoteiros & Faixa Etária (Idades) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ramos Escoteiros */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Distribuição por Ramo Escoteiro</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Classificação automática pela idade oficial do jovem
              </p>
            </div>
            <span className="text-xs font-medium text-stone-400">Total: {total}</span>
          </div>

          <div className="space-y-4">
            {([
              { ramo: 'Lobinho', desc: '6,5 a 10 anos', cor: 'bg-amber-500', textCor: 'text-amber-800', bgBadge: 'bg-amber-50' },
              { ramo: 'Escoteiro', desc: '11 a 14 anos', cor: 'bg-emerald-600', textCor: 'text-emerald-800', bgBadge: 'bg-emerald-50' },
              { ramo: 'Sênior', desc: '15 a 17 anos (Guia/Sênior)', cor: 'bg-rose-600', textCor: 'text-rose-800', bgBadge: 'bg-rose-50' },
              { ramo: 'Pioneiro', desc: '18 a 21 anos', cor: 'bg-indigo-600', textCor: 'text-indigo-800', bgBadge: 'bg-indigo-50' },
              { ramo: 'Adulto / Chefia', desc: '22+ anos (Voluntários)', cor: 'bg-stone-700', textCor: 'text-stone-800', bgBadge: 'bg-stone-100' },
            ] as const).map(item => {
              const count = stats.ramosContagem[item.ramo] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={item.ramo} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-800">{item.ramo}</span>
                      <span className="text-xs text-stone-400 font-normal">({item.desc})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-500">{pct}%</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${item.textCor} ${item.bgBadge}`}>
                        {count} {count === 1 ? 'membro' : 'membros'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.cor} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quantidade por Idade / Faixa Etária */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Quantidade por Faixa Etária (Idades)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Faixas etárias e evolução demográfica dos membros
              </p>
            </div>
            <span className="text-xs font-medium text-stone-400">Média: {stats.mediaIdade}a</span>
          </div>

          <div className="space-y-3.5">
            {stats.faixasEtarias.map(faixa => {
              const pct = total > 0 ? Math.round((faixa.count / total) * 100) : 0;
              return (
                <div key={faixa.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-stone-700">{faixa.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">{pct}%</span>
                      <span className="font-bold text-stone-900 min-w-8 text-right">
                        {faixa.count}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Bairros de Franca & Alertas de Saúde / Ficha Médica */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quantidade por Bairro (Franca/SP) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Distribuição por Bairro em Franca/SP</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Mapeamento de origem geográfica dos inscritos para planejamento de transporte
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                {stats.bairrosOrdenados.length} bairros
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {stats.bairrosOrdenados.map((item, idx) => (
                <div key={item.bairro} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 text-xs font-mono text-stone-400">{idx + 1}.</span>
                      <span className="font-medium text-stone-800 truncate">{item.bairro}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-stone-400">{item.pct}%</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                        {item.count} {item.count === 1 ? 'inscrito' : 'inscritos'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.pct, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
            <span>Sede do Grupo: Rua Marcos Granzotti, 4725 - Jardim Paineiras</span>
            <button
              onClick={onVerTodos}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Ver endereços</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Painel Médico e Cuidados Especiais (Ficha Médica pág 2 e 3) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Painel de Segurança & Saúde</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ficha médica consolidada para chefes de seção e acampamento
                </p>
              </div>
              <Activity className="w-4 h-4 text-stone-400" />
            </div>

            <div className="space-y-3">
              {/* Alergias */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Alergias Identificadas</div>
                    <div className="text-xs text-stone-500">Picada de insetos, medicamentos, pólen</div>
                  </div>
                </div>
                <span className="text-base font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-lg">
                  {stats.comAlergia}
                </span>
              </div>

              {/* Medicamentos contínuos */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-700 flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Uso de Medicamento Contínuo</div>
                    <div className="text-xs text-stone-500">Exige autorização e horários de dosagem</div>
                  </div>
                </div>
                <span className="text-base font-bold text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-lg">
                  {stats.comMedicamento}
                </span>
              </div>

              {/* Neurodivergências */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Neurodivergências (TEA / TDAH)</div>
                    <div className="text-xs text-stone-500">Acompanhamento e adaptação pedagógica</div>
                  </div>
                </div>
                <span className="text-base font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg">
                  {stats.comNeurodivergencia}
                </span>
              </div>

              {/* Plano de saúde */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                    SUS
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Cobertura Médica</div>
                    <div className="text-xs text-stone-500">
                      {stats.comPlanoPrivado} Plano Privado · {total - stats.comPlanoPrivado} SUS
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-stone-600 bg-stone-200/70 px-2.5 py-1 rounded-md">
                  {Math.round((stats.comPlanoPrivado / Math.max(total, 1)) * 100)}% Privado
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Tipos sanguíneos cadastrados no banco</span>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {Object.entries(stats.tiposSanguineos).slice(0, 4).map(([t, q]) => (
                <span key={t} className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                  {t}: {q}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Acesso Rápido aos Últimos Inscritos */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Inscrições Recentes no Grupo Escoteiro</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Visualize, edite ou imprima as 5 fichas mais recentes
            </p>
          </div>
          <button
            onClick={onVerTodos}
            className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Gerenciar todos os {total} escoteiros</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 text-stone-500 text-xs font-semibold uppercase tracking-wider border-b border-stone-100">
              <tr>
                <th className="px-6 py-3.5">Nº Registro</th>
                <th className="px-6 py-3.5">Nome do Inscrito</th>
                <th className="px-6 py-3.5">Ramo / Idade</th>
                <th className="px-6 py-3.5">Bairro</th>
                <th className="px-6 py-3.5">Responsável Legal</th>
                <th className="px-6 py-3.5">Condição Médica</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {escoteiros.slice(0, 5).map(esc => {
                const idade = calcularIdade(esc.dataNascimento);
                const ramo = identificarRamo(idade);

                return (
                  <tr key={esc.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-stone-600">
                      {esc.fichaMedica.numeroRegistro || 'S/N'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900">{esc.nomeCompleto}</div>
                      <div className="text-xs text-stone-400">
                        {esc.sexo === 'M' ? 'Masculino' : 'Feminino'} · CPF: {esc.cpf || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        ramo === 'Lobinho' ? 'bg-amber-100 text-amber-800' :
                        ramo === 'Escoteiro' ? 'bg-emerald-100 text-emerald-800' :
                        ramo === 'Sênior' ? 'bg-rose-100 text-rose-800' :
                        ramo === 'Pioneiro' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-stone-200 text-stone-800'
                      }`}>
                        {ramo} ({idade}a)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-600 text-xs">
                      {esc.bairro}, Franca
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-stone-800">
                        {esc.primeiroResponsavel.nomeCompleto}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {esc.primeiroResponsavel.telefone1 || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {esc.fichaMedica.apresentaAlergia && (
                          <span className="text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-medium border border-amber-200">
                            Alergia
                          </span>
                        )}
                        {!esc.fichaMedica.sabeNadar && (
                          <span className="text-[11px] bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded font-medium border border-cyan-200">
                            Não nada
                          </span>
                        )}
                        {esc.fichaMedica.apresentaNeurodivergencia && (
                          <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium border border-emerald-200">
                            Neuro
                          </span>
                        )}
                        {!esc.fichaMedica.apresentaAlergia && esc.fichaMedica.sabeNadar && !esc.fichaMedica.apresentaNeurodivergencia && (
                          <span className="text-[11px] text-stone-400">Sem restrições</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenDirigenteDossier && (
                          <button
                            type="button"
                            onClick={() => onOpenDirigenteDossier(esc)}
                            className="px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                            title="Ver Dossiê Executivo 360°"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-950" />
                            <span>Ficha 360°</span>
                          </button>
                        )}
                        <button
                          onClick={() => onImprimirEscoteiro(esc)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                          title="Imprimir Cadastro no Layout Oficial"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-800" />
                          <span>Imprimir</span>
                        </button>
                        <button
                          onClick={() => onSelectEscoteiro(esc)}
                          className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                          title="Ver Ficha / Editar"
                        >
                          Ver Ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Feed View - No horizontal scroll required */}
        <div className="md:hidden divide-y divide-stone-100">
          {escoteiros.slice(0, 5).map(esc => {
            const idade = calcularIdade(esc.dataNascimento);
            const ramo = identificarRamo(idade);

            return (
              <div key={esc.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{esc.nomeCompleto}</h4>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {esc.bairro}, Franca • {esc.sexo === 'M' ? 'Masc.' : 'Fem.'}
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    ramo === 'Lobinho' ? 'bg-amber-100 text-amber-800' :
                    ramo === 'Escoteiro' ? 'bg-emerald-100 text-emerald-800' :
                    ramo === 'Sênior' ? 'bg-rose-100 text-rose-800' :
                    ramo === 'Pioneiro' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-stone-200 text-stone-800'
                  }`}>
                    {ramo} ({idade}a)
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 text-[11px]">
                  <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono">
                    Tipo: {esc.fichaMedica.tipoSanguineo || 'S/I'}
                  </span>
                  {esc.fichaMedica.apresentaAlergia && (
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-medium border border-amber-200">
                      Alergia
                    </span>
                  )}
                  {!esc.fichaMedica.sabeNadar && (
                    <span className="bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded font-medium border border-cyan-200">
                      Não nada
                    </span>
                  )}
                  {esc.fichaMedica.medicamentoContinuo && (
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium border border-blue-200">
                      Medicamento
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {onOpenDirigenteDossier && (
                    <button
                      type="button"
                      onClick={() => onOpenDirigenteDossier(esc)}
                      className="w-full py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-950" />
                      <span>Ver Ficha 360° do Associado</span>
                    </button>
                  )}
                  <button
                    onClick={() => onImprimirEscoteiro(esc)}
                    className="flex-1 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Imprimir Ficha</span>
                  </button>
                  <button
                    onClick={() => onSelectEscoteiro(esc)}
                    className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Ver Detalhes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
