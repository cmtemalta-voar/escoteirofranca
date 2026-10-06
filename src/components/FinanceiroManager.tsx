import React, { useState, useMemo } from 'react';
import { EscoteiroCadastro, identificarRamo } from '../types/scout';
import { 
  ContribuicaoMensal, 
  FiliacaoAnual, 
  SecaoEscoteira, 
  FormaPagamento, 
  StatusContribuicao, 
  StatusFiliacao,
  FORMAS_PAGAMENTO,
  MESES_NOMES,
  obterSecaoPorRamo
} from '../types/management';
import { storageService } from '../services/storage';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ArrowUpRight, 
  Wallet,
  Users,
  Check,
  X,
  CreditCard
} from 'lucide-react';

interface FinanceiroManagerProps {
  escoteiros: EscoteiroCadastro[];
  contribuicoes: ContribuicaoMensal[];
  filiacoes: FiliacaoAnual[];
  onRefresh: () => void;
  onOpenDirigenteDossier?: (escoteiro: EscoteiroCadastro) => void;
}

export const FinanceiroManager: React.FC<FinanceiroManagerProps> = ({
  escoteiros,
  contribuicoes,
  filiacoes,
  onRefresh,
  onOpenDirigenteDossier,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'contribuicoes' | 'filiacao'>('contribuicoes');
  
  // Filtros Contribuições
  const [busca, setBusca] = useState<string>('');
  const [filtroSecao, setFiltroSecao] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<number>(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState<number>(2026);

  // Filtros Filiação
  const [buscaFiliacao, setBuscaFiliacao] = useState<string>('');
  const [filtroAnoFiliacao, setFiltroAnoFiliacao] = useState<number>(2026);
  const [filtroStatusFiliacao, setFiltroStatusFiliacao] = useState<string>('todos');

  // Modais de Criação/Edição
  const [modalContribuicaoAberto, setModalContribuicaoAberto] = useState<boolean>(false);
  const [editandoContribuicao, setEditandoContribuicao] = useState<ContribuicaoMensal | null>(null);

  const [modalFiliacaoAberto, setModalFiliacaoAberto] = useState<boolean>(false);
  const [editandoFiliacao, setEditandoFiliacao] = useState<FiliacaoAnual | null>(null);

  // Modal Pagamento Rápido
  const [pagamentoRapidoItem, setPagamentoRapidoItem] = useState<{ tipo: 'contribuicao' | 'filiacao'; id: string; nome: string; valor: number } | null>(null);
  const [formaPagamentoRapido, setFormaPagamentoRapido] = useState<FormaPagamento>('Pix');
  const [dataPagamentoRapido, setDataPagamentoRapido] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form States para Nova Contribuição
  const [formContr, setFormContr] = useState<{
    escoteiroId: string;
    competenciaMes: number;
    competenciaAno: number;
    valor: number;
    dataVencimento: string;
    dataPagamento: string;
    formaPagamento: FormaPagamento;
    status: StatusContribuicao;
    observacoes: string;
  }>({
    escoteiroId: escoteiros[0]?.id || '',
    competenciaMes: new Date().getMonth() + 1,
    competenciaAno: 2026,
    valor: 75.00,
    dataVencimento: `${new Date().toISOString().slice(0, 7)}-10`,
    dataPagamento: '',
    formaPagamento: 'Pix',
    status: 'Pendente',
    observacoes: ''
  });

  // Form States para Nova Filiação
  const [formFil, setFormFil] = useState<{
    escoteiroId: string;
    ano: number;
    valor: number;
    dataPagamento: string;
    formaPagamento: FormaPagamento;
    status: StatusFiliacao;
    comprovanteObs: string;
  }>({
    escoteiroId: escoteiros[0]?.id || '',
    ano: 2026,
    valor: 160.00,
    dataPagamento: '',
    formaPagamento: 'Pix',
    status: 'Pendente',
    comprovanteObs: ''
  });

  // Estatísticas Contribuições do Mês Selecionado
  const statsContribuicoes = useMemo(() => {
    const doMes = contribuicoes.filter(c => c.competenciaMes === filtroMes && c.competenciaAno === filtroAno);
    let totalEsperado = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let totalEmAtraso = 0;
    let qtdPagas = 0;

    doMes.forEach(c => {
      totalEsperado += c.valor;
      if (c.status === 'Pago') {
        totalPago += c.valor;
        qtdPagas++;
      } else if (c.status === 'Em atraso') {
        totalEmAtraso += c.valor;
      } else if (c.status === 'Pendente') {
        totalPendente += c.valor;
      }
    });

    const taxaAdimplencia = doMes.length > 0 ? Math.round((qtdPagas / doMes.length) * 100) : 0;

    return { totalEsperado, totalPago, totalPendente, totalEmAtraso, taxaAdimplencia, totalQtd: doMes.length };
  }, [contribuicoes, filtroMes, filtroAno]);

  // Estatísticas Filiações
  const statsFiliacoes = useMemo(() => {
    const doAno = filiacoes.filter(f => f.ano === filtroAnoFiliacao);
    let totalEsperado = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let qtdPagas = 0;

    doAno.forEach(f => {
      totalEsperado += f.valor;
      if (f.status === 'Pago') {
        totalPago += f.valor;
        qtdPagas++;
      } else {
        totalPendente += f.valor;
      }
    });

    const taxa = doAno.length > 0 ? Math.round((qtdPagas / doAno.length) * 100) : 0;
    return { totalEsperado, totalPago, totalPendente, qtdPagas, totalQtd: doAno.length, taxa };
  }, [filiacoes, filtroAnoFiliacao]);

  // Lista Filtrada Contribuições
  const contribuicoesFiltradas = useMemo(() => {
    return contribuicoes.filter(c => {
      if (filtroMes !== 0 && c.competenciaMes !== filtroMes) return false;
      if (c.competenciaAno !== filtroAno) return false;
      if (filtroSecao !== 'todas' && c.secao !== filtroSecao) return false;
      if (filtroStatus !== 'todos' && c.status !== filtroStatus) return false;
      if (busca.trim()) {
        const q = busca.toLowerCase();
        const bateNome = c.escoteiroNome.toLowerCase().includes(q);
        const bateResp = (c.responsavelFinanceiro || '').toLowerCase().includes(q);
        if (!bateNome && !bateResp) return false;
      }
      return true;
    });
  }, [contribuicoes, filtroMes, filtroAno, filtroSecao, filtroStatus, busca]);

  // Lista Filtrada Filiações
  const filiacoesFiltradas = useMemo(() => {
    return filiacoes.filter(f => {
      if (f.ano !== filtroAnoFiliacao) return false;
      if (filtroStatusFiliacao !== 'todos' && f.status !== filtroStatusFiliacao) return false;
      if (buscaFiliacao.trim()) {
        const q = buscaFiliacao.toLowerCase();
        if (!f.escoteiroNome.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filiacoes, filtroAnoFiliacao, filtroStatusFiliacao, buscaFiliacao]);

  // Gerar mensalidades em lote para todos os escoteiros ativos no mês
  const handleGerarMensalidadesEmLote = () => {
    const confirmou = window.confirm(
      `Deseja gerar a cobrança de R$ 75,00 referente a ${MESES_NOMES[filtroMes - 1]}/${filtroAno} para todos os ${escoteiros.length} associados cadastrados?`
    );
    if (!confirmou) return;

    let gerados = 0;
    const anoStr = String(filtroAno);
    const mesStr = String(filtroMes).padStart(2, '0');
    const vencimentoPadrao = `${anoStr}-${mesStr}-10`;

    escoteiros.forEach(esc => {
      // Verifica se já existe para este jovem na mesma competência
      const jaExiste = contribuicoes.some(
        c => c.escoteiroId === esc.id && c.competenciaMes === filtroMes && c.competenciaAno === filtroAno
      );
      if (!jaExiste) {
        const idade = new Date().getFullYear() - parseInt(esc.dataNascimento.split('-')[0] || '2015', 10);
        const secao = obterSecaoPorRamo(identificarRamo(idade));
        storageService.salvarContribuicao({
          escoteiroId: esc.id,
          escoteiroNome: esc.nomeCompleto,
          secao,
          responsavelFinanceiro: esc.primeiroResponsavel.nomeCompleto,
          competenciaMes: filtroMes,
          competenciaAno: filtroAno,
          valor: 75.00,
          dataVencimento: vencimentoPadrao,
          status: 'Pendente',
          observacoes: 'Gerado automaticamente em lote'
        });
        gerados++;
      }
    });

    onRefresh();
    alert(`${gerados} mensalidades geradas com sucesso para ${MESES_NOMES[filtroMes - 1]}/${filtroAno}!`);
  };

  // Gerar filiações em lote para todos os escoteiros no ano
  const handleGerarFiliacoesEmLote = () => {
    const confirmou = window.confirm(
      `Deseja gerar o Registro/Filiação Anual de R$ 160,00 para o ano ${filtroAnoFiliacao} para todos os associados?`
    );
    if (!confirmou) return;

    let geradas = 0;
    escoteiros.forEach(esc => {
      const jaExiste = filiacoes.some(f => f.escoteiroId === esc.id && f.ano === filtroAnoFiliacao);
      if (!jaExiste) {
        const idade = new Date().getFullYear() - parseInt(esc.dataNascimento.split('-')[0] || '2015', 10);
        const secao = obterSecaoPorRamo(identificarRamo(idade));
        storageService.salvarFiliacao({
          escoteiroId: esc.id,
          escoteiroNome: esc.nomeCompleto,
          secao,
          ano: filtroAnoFiliacao,
          valor: 160.00,
          status: 'Pendente',
          comprovanteObs: 'Registro anual gerado em lote'
        });
        geradas++;
      }
    });

    onRefresh();
    alert(`${geradas} filiações geradas com sucesso para o ano de ${filtroAnoFiliacao}!`);
  };

  // Salvar formulário de contribuição
  const handleSalvarContribuicao = (e: React.FormEvent) => {
    e.preventDefault();
    const esc = escoteiros.find(x => x.id === formContr.escoteiroId);
    if (!esc) return;

    const idade = new Date().getFullYear() - parseInt(esc.dataNascimento.split('-')[0] || '2015', 10);
    const secao = obterSecaoPorRamo(identificarRamo(idade));

    storageService.salvarContribuicao({
      id: editandoContribuicao?.id,
      escoteiroId: esc.id,
      escoteiroNome: esc.nomeCompleto,
      secao,
      responsavelFinanceiro: esc.primeiroResponsavel.nomeCompleto,
      competenciaMes: formContr.competenciaMes,
      competenciaAno: formContr.competenciaAno,
      valor: Number(formContr.valor),
      dataVencimento: formContr.dataVencimento,
      dataPagamento: formContr.status === 'Pago' ? formContr.dataPagamento || new Date().toISOString().split('T')[0] : undefined,
      formaPagamento: formContr.status === 'Pago' ? formContr.formaPagamento : undefined,
      status: formContr.status,
      observacoes: formContr.observacoes
    });

    setModalContribuicaoAberto(false);
    setEditandoContribuicao(null);
    onRefresh();
  };

  // Salvar formulário de filiação
  const handleSalvarFiliacao = (e: React.FormEvent) => {
    e.preventDefault();
    const esc = escoteiros.find(x => x.id === formFil.escoteiroId);
    if (!esc) return;

    const idade = new Date().getFullYear() - parseInt(esc.dataNascimento.split('-')[0] || '2015', 10);
    const secao = obterSecaoPorRamo(identificarRamo(idade));

    storageService.salvarFiliacao({
      id: editandoFiliacao?.id,
      escoteiroId: esc.id,
      escoteiroNome: esc.nomeCompleto,
      secao,
      ano: Number(formFil.ano),
      valor: Number(formFil.valor),
      dataPagamento: formFil.status === 'Pago' ? formFil.dataPagamento || new Date().toISOString().split('T')[0] : undefined,
      formaPagamento: formFil.status === 'Pago' ? formFil.formaPagamento : undefined,
      status: formFil.status,
      comprovanteObs: formFil.comprovanteObs
    });

    setModalFiliacaoAberto(false);
    setEditandoFiliacao(null);
    onRefresh();
  };

  // Confirmar pagamento rápido
  const handleConfirmarPagamentoRapido = () => {
    if (!pagamentoRapidoItem) return;

    if (pagamentoRapidoItem.tipo === 'contribuicao') {
      const item = contribuicoes.find(c => c.id === pagamentoRapidoItem.id);
      if (item) {
        storageService.salvarContribuicao({
          ...item,
          status: 'Pago',
          dataPagamento: dataPagamentoRapido,
          formaPagamento: formaPagamentoRapido
        });
      }
    } else {
      const item = filiacoes.find(f => f.id === pagamentoRapidoItem.id);
      if (item) {
        storageService.salvarFiliacao({
          ...item,
          status: 'Pago',
          dataPagamento: dataPagamentoRapido,
          formaPagamento: formaPagamentoRapido
        });
      }
    }

    setPagamentoRapidoItem(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner Financeiro */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <DollarSign className="w-4 h-4" />
            <span>Tesouraria • Grupo Escoteiro Tradicional 22 de Fevereiro</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-1">
            Gestão Financeira & Contribuições
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Acompanhamento de mensalidades, registro anual de filiação e controle por jovem e seção.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-stone-100 p-1.5 rounded-xl border border-stone-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setAbaAtiva('contribuicoes')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              abaAtiva === 'contribuicoes'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1. Contribuição Mensal</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('filiacao')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              abaAtiva === 'filiacao'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Filiação Anual</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ABA 1: CONTRIBUIÇÕES MENSAIS                                        */}
      {/* =================================================================== */}
      {abaAtiva === 'contribuicoes' && (
        <div className="space-y-6">
          
          {/* KPI Cards do Mês */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
                <span>Arrecadado no Mês</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
                R$ {statsContribuicoes.totalPago.toFixed(2)}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                {MESES_NOMES[filtroMes - 1]} / {filtroAno} ({statsContribuicoes.taxaAdimplencia}% de adimplência)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
                <span>Pendente a Receber</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
                R$ {statsContribuicoes.totalPendente.toFixed(2)}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Aguardando pagamento no vencimento
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
                <span>Em Atraso</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
                R$ {statsContribuicoes.totalEmAtraso.toFixed(2)}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Vencimento ultrapassado
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
                <span>Previsão Total</span>
                <Wallet className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
                R$ {statsContribuicoes.totalEsperado.toFixed(2)}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Total para {statsContribuicoes.totalQtd} mensalidades geradas
              </div>
            </div>
          </div>

          {/* Action and Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar associado ou responsável financeiro..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGerarMensalidadesEmLote}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition-colors flex items-center gap-1.5"
                  title="Gerar cobrança para todos os escoteiros neste mês"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Gerar Mensalidades do Mês em Lote</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditandoContribuicao(null);
                    setModalContribuicaoAberto(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Lançar Mensalidade</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100 text-xs">
              {/* Competência Mês */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Mês de Referência</label>
                <select
                  value={filtroMes}
                  onChange={e => setFiltroMes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  {MESES_NOMES.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Ano */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Ano</label>
                <select
                  value={filtroAno}
                  onChange={e => setFiltroAno(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              {/* Seção */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Seção</label>
                <select
                  value={filtroSecao}
                  onChange={e => setFiltroSecao(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="todas">Todas as Seções</option>
                  <option value="Alcateia (Lobinhos)">Alcateia (Lobinhos)</option>
                  <option value="Tropa Escoteira">Tropa Escoteira</option>
                  <option value="Tropa Sênior">Tropa Sênior</option>
                  <option value="Clã Pioneiro">Clã Pioneiro</option>
                  <option value="Chefia / Dirigente">Chefia / Dirigente</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Status</label>
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em atraso">Em atraso</option>
                  <option value="Isento">Isento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-xs text-left">
                <thead className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Associado / Jovem</th>
                    <th className="px-4 py-3">Seção</th>
                    <th className="px-4 py-3">Responsável Financeiro</th>
                    <th className="px-4 py-3">Competência</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3">Status / Pagamento</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {contribuicoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-stone-400">
                        Nenhuma contribuição encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    contribuicoesFiltradas.map(c => {
                      const escoteiroOriginal = escoteiros.find(e => e.id === c.escoteiroId);

                      // Badges
                      let badge = 'bg-stone-100 text-stone-700';
                      if (c.status === 'Pago') badge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      if (c.status === 'Pendente') badge = 'bg-amber-100 text-amber-800 border-amber-300';
                      if (c.status === 'Em atraso') badge = 'bg-rose-100 text-rose-800 border-rose-300';
                      if (c.status === 'Isento') badge = 'bg-blue-100 text-blue-800 border-blue-300';

                      return (
                        <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="px-4 py-3 font-semibold text-stone-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{c.escoteiroNome}</span>
                              {escoteiroOriginal && onOpenDirigenteDossier && (
                                <button
                                  type="button"
                                  onClick={() => onOpenDirigenteDossier(escoteiroOriginal)}
                                  className="text-stone-400 hover:text-emerald-700 p-0.5"
                                  title="Abrir Ficha 360°"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100">
                              {c.secao}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                            {c.responsavelFinanceiro || '-'}
                          </td>
                          <td className="px-4 py-3 text-stone-700 font-medium whitespace-nowrap">
                            {MESES_NOMES[c.competenciaMes - 1]}/{c.competenciaAno}
                          </td>
                          <td className="px-4 py-3 font-bold text-stone-900 whitespace-nowrap">
                            R$ {c.valor.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                            {c.dataVencimento ? c.dataVencimento.split('-').reverse().join('/') : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge} w-fit`}>
                                {c.status}
                              </span>
                              {c.status === 'Pago' && c.dataPagamento && (
                                <span className="text-[10px] text-stone-400">
                                  {c.formaPagamento} • {c.dataPagamento.split('-').reverse().join('/')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {c.status !== 'Pago' && (
                                <button
                                  type="button"
                                  onClick={() => setPagamentoRapidoItem({
                                    tipo: 'contribuicao',
                                    id: c.id,
                                    nome: c.escoteiroNome,
                                    valor: c.valor
                                  })}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title="Dar Baixa / Marcar como Pago"
                                >
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  <span>Receber</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setEditandoContribuicao(c);
                                  setFormContr({
                                    escoteiroId: c.escoteiroId,
                                    competenciaMes: c.competenciaMes,
                                    competenciaAno: c.competenciaAno,
                                    valor: c.valor,
                                    dataVencimento: c.dataVencimento,
                                    dataPagamento: c.dataPagamento || '',
                                    formaPagamento: c.formaPagamento || 'Pix',
                                    status: c.status,
                                    observacoes: c.observacoes || ''
                                  });
                                  setModalContribuicaoAberto(true);
                                }}
                                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                title="Editar Lançamento"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Excluir esta cobrança de ${c.escoteiroNome}?`)) {
                                    storageService.excluirContribuicao(c.id);
                                    onRefresh();
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ABA 2: FILIAÇÃO ANUAL                                               */}
      {/* =================================================================== */}
      {abaAtiva === 'filiacao' && (
        <div className="space-y-6">
          
          {/* KPI Cards Filiação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
                <span>Filiações Pagas ({filtroAnoFiliacao})</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
                R$ {statsFiliacoes.totalPago.toFixed(2)}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                {statsFiliacoes.qtdPagas} jovens regularizados ({statsFiliacoes.taxa}%)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
                <span>Filiações Pendentes</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
                R$ {statsFiliacoes.totalPendente.toFixed(2)}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                {statsFiliacoes.totalQtd - statsFiliacoes.qtdPagas} jovens aguardando quitação anual
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
                <span>Previsão Anual de Registro</span>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
                R$ {statsFiliacoes.totalEsperado.toFixed(2)}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Total para {statsFiliacoes.totalQtd} associados registrados
              </div>
            </div>
          </div>

          {/* Toolbar Filiação */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={buscaFiliacao}
                  onChange={e => setBuscaFiliacao(e.target.value)}
                  placeholder="Buscar associado..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Ano Filiação */}
              <select
                value={filtroAnoFiliacao}
                onChange={e => setFiltroAnoFiliacao(Number(e.target.value))}
                className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
              >
                <option value={2025}>Ano 2025</option>
                <option value={2026}>Ano 2026</option>
                <option value={2027}>Ano 2027</option>
              </select>

              {/* Status */}
              <select
                value={filtroStatusFiliacao}
                onChange={e => setFiltroStatusFiliacao(e.target.value)}
                className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              >
                <option value="todos">Status: Todos</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
                <option value="Em renovação">Em renovação</option>
                <option value="Isento">Isento</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleGerarFiliacoesEmLote}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Gerar Filiações {filtroAnoFiliacao}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditandoFiliacao(null);
                  setModalFiliacaoAberto(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Lançar Filiação</span>
              </button>
            </div>
          </div>

          {/* Tabela Filiações */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-xs text-left">
                <thead className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Associado / Jovem</th>
                    <th className="px-4 py-3">Seção</th>
                    <th className="px-4 py-3">Ano de Filiação</th>
                    <th className="px-4 py-3">Valor da Taxa</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Pagamento / Forma</th>
                    <th className="px-4 py-3">Comprovante / Obs</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {filiacoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-stone-400">
                        Nenhum registro de filiação anual encontrado para {filtroAnoFiliacao}.
                      </td>
                    </tr>
                  ) : (
                    filiacoesFiltradas.map(f => {
                      const escoteiroOriginal = escoteiros.find(e => e.id === f.escoteiroId);

                      let badge = 'bg-stone-100 text-stone-700';
                      if (f.status === 'Pago') badge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      if (f.status === 'Pendente') badge = 'bg-amber-100 text-amber-800 border-amber-300';
                      if (f.status === 'Em renovação') badge = 'bg-blue-100 text-blue-800 border-blue-300';

                      return (
                        <tr key={f.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="px-4 py-3 font-semibold text-stone-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{f.escoteiroNome}</span>
                              {escoteiroOriginal && onOpenDirigenteDossier && (
                                <button
                                  type="button"
                                  onClick={() => onOpenDirigenteDossier(escoteiroOriginal)}
                                  className="text-stone-400 hover:text-emerald-700 p-0.5"
                                  title="Abrir Ficha 360°"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100">
                              {f.secao}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-stone-900 whitespace-nowrap">
                            {f.ano}
                          </td>
                          <td className="px-4 py-3 font-bold text-stone-900 whitespace-nowrap">
                            R$ {f.valor.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                            {f.status === 'Pago' && f.dataPagamento ? (
                              <span>{f.formaPagamento || 'Pix'} • {f.dataPagamento.split('-').reverse().join('/')}</span>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-stone-500 max-w-[200px] truncate">
                            {f.comprovanteObs || '-'}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {f.status !== 'Pago' && (
                                <button
                                  type="button"
                                  onClick={() => setPagamentoRapidoItem({
                                    tipo: 'filiacao',
                                    id: f.id,
                                    nome: f.escoteiroNome,
                                    valor: f.valor
                                  })}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  <span>Receber</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setEditandoFiliacao(f);
                                  setFormFil({
                                    escoteiroId: f.escoteiroId,
                                    ano: f.ano,
                                    valor: f.valor,
                                    dataPagamento: f.dataPagamento || '',
                                    formaPagamento: f.formaPagamento || 'Pix',
                                    status: f.status,
                                    comprovanteObs: f.comprovanteObs || ''
                                  });
                                  setModalFiliacaoAberto(true);
                                }}
                                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Excluir o registro de filiação de ${f.escoteiroNome}?`)) {
                                    storageService.excluirFiliacao(f.id);
                                    onRefresh();
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: LANÇAR / EDITAR CONTRIBUIÇÃO MENSAL                       */}
      {/* =================================================================== */}
      {modalContribuicaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base font-serif">
                {editandoContribuicao ? 'Editar Contribuição Mensal' : 'Lançar Nova Contribuição Mensal'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalContribuicaoAberto(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarContribuicao} className="p-5 space-y-4 text-xs text-stone-800">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Associado / Jovem Escoteiro</label>
                <select
                  value={formContr.escoteiroId}
                  onChange={e => setFormContr({ ...formContr, escoteiroId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                >
                  {escoteiros.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nomeCompleto} ({identificarRamo(new Date().getFullYear() - parseInt(e.dataNascimento.split('-')[0] || '2015', 10))})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mês (Competência)</label>
                  <select
                    value={formContr.competenciaMes}
                    onChange={e => setFormContr({ ...formContr, competenciaMes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    {MESES_NOMES.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ano</label>
                  <input
                    type="number"
                    value={formContr.competenciaAno}
                    onChange={e => setFormContr({ ...formContr, competenciaAno: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Valor da Mensalidade (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formContr.valor}
                    onChange={e => setFormContr({ ...formContr, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={formContr.dataVencimento}
                    onChange={e => setFormContr({ ...formContr, dataVencimento: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status</label>
                  <select
                    value={formContr.status}
                    onChange={e => setFormContr({ ...formContr, status: e.target.value as StatusContribuicao })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Em atraso">Em atraso</option>
                    <option value="Isento">Isento</option>
                  </select>
                </div>

                {formContr.status === 'Pago' && (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Forma de Pagamento</label>
                    <select
                      value={formContr.formaPagamento}
                      onChange={e => setFormContr({ ...formContr, formaPagamento: e.target.value as FormaPagamento })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    >
                      {FORMAS_PAGAMENTO.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formContr.status === 'Pago' && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Data do Pagamento</label>
                  <input
                    type="date"
                    value={formContr.dataPagamento || new Date().toISOString().split('T')[0]}
                    onChange={e => setFormContr({ ...formContr, dataPagamento: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 mb-1">Observações</label>
                <input
                  type="text"
                  value={formContr.observacoes}
                  onChange={e => setFormContr({ ...formContr, observacoes: e.target.value })}
                  placeholder="Ex: Comprovante arquivado, recibo emitido nº 45..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalContribuicaoAberto(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Salvar Contribuição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: LANÇAR / EDITAR FILIAÇÃO ANUAL                             */}
      {/* =================================================================== */}
      {modalFiliacaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base font-serif">
                {editandoFiliacao ? 'Editar Registro de Filiação Anual' : 'Lançar Novo Registro de Filiação'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalFiliacaoAberto(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarFiliacao} className="p-5 space-y-4 text-xs text-stone-800">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Associado / Jovem Escoteiro</label>
                <select
                  value={formFil.escoteiroId}
                  onChange={e => setFormFil({ ...formFil, escoteiroId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                >
                  {escoteiros.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nomeCompleto} ({identificarRamo(new Date().getFullYear() - parseInt(e.dataNascimento.split('-')[0] || '2015', 10))})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ano de Referência</label>
                  <input
                    type="number"
                    value={formFil.ano}
                    onChange={e => setFormFil({ ...formFil, ano: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Valor da Taxa (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formFil.valor}
                    onChange={e => setFormFil({ ...formFil, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status</label>
                  <select
                    value={formFil.status}
                    onChange={e => setFormFil({ ...formFil, status: e.target.value as StatusFiliacao })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Em renovação">Em renovação</option>
                    <option value="Isento">Isento</option>
                  </select>
                </div>

                {formFil.status === 'Pago' && (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Forma de Pagamento</label>
                    <select
                      value={formFil.formaPagamento}
                      onChange={e => setFormFil({ ...formFil, formaPagamento: e.target.value as FormaPagamento })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    >
                      {FORMAS_PAGAMENTO.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formFil.status === 'Pago' && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Data do Pagamento</label>
                  <input
                    type="date"
                    value={formFil.dataPagamento || new Date().toISOString().split('T')[0]}
                    onChange={e => setFormFil({ ...formFil, dataPagamento: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 mb-1">Comprovante / Código de Registro</label>
                <input
                  type="text"
                  value={formFil.comprovanteObs}
                  onChange={e => setFormFil({ ...formFil, comprovanteObs: e.target.value })}
                  placeholder="Ex: Registro Nacional Escoteiro nº 88129-A..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalFiliacaoAberto(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Salvar Filiação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: PAGAMENTO RÁPIDO                                           */}
      {/* =================================================================== */}
      {pagamentoRapidoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-amber-300 stroke-[3]" />
                <h3 className="font-bold text-sm">Confirmar Recebimento</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPagamentoRapidoItem(null)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-stone-800">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200/80">
                <div className="text-[11px] text-stone-500">Associado:</div>
                <div className="font-bold text-stone-900 text-sm">{pagamentoRapidoItem.nome}</div>
                <div className="text-emerald-800 font-extrabold text-base mt-1">
                  R$ {pagamentoRapidoItem.valor.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Forma de Pagamento</label>
                <select
                  value={formaPagamentoRapido}
                  onChange={e => setFormaPagamentoRapido(e.target.value as FormaPagamento)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                >
                  {FORMAS_PAGAMENTO.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Data do Pagamento</label>
                <input
                  type="date"
                  value={dataPagamentoRapido}
                  onChange={e => setDataPagamentoRapido(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPagamentoRapidoItem(null)}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarPagamentoRapido}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirmar Baixa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
