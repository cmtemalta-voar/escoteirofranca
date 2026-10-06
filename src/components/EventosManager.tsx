import React, { useState, useMemo } from 'react';
import { EscoteiroCadastro, identificarRamo } from '../types/scout';
import { 
  EventoEscoteiro, 
  ParticipacaoEvento, 
  TipoEvento, 
  StatusEvento, 
  StatusFinanceiroParticipacao,
  FormaPagamento,
  FORMAS_PAGAMENTO,
  obterSecaoPorRamo
} from '../types/management';
import { storageService } from '../services/storage';
import { 
  Tent, 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  FileText, 
  UserCheck, 
  UserX,
  CreditCard,
  DollarSign,
  ChevronRight,
  Printer
} from 'lucide-react';

interface EventosManagerProps {
  escoteiros: EscoteiroCadastro[];
  eventos: EventoEscoteiro[];
  participacoes: ParticipacaoEvento[];
  onRefresh: () => void;
  onOpenDirigenteDossier?: (escoteiro: EscoteiroCadastro) => void;
}

export const EventosManager: React.FC<EventosManagerProps> = ({
  escoteiros,
  eventos,
  participacoes,
  onRefresh,
  onOpenDirigenteDossier,
}) => {
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string>(eventos[0]?.id || '');
  const [busca, setBusca] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Modais
  const [modalEventoAberto, setModalEventoAberto] = useState<boolean>(false);
  const [editandoEvento, setEditandoEvento] = useState<EventoEscoteiro | null>(null);

  const [modalInscricaoAberto, setModalInscricaoAberto] = useState<boolean>(false);
  const [editandoParticipacao, setEditandoParticipacao] = useState<ParticipacaoEvento | null>(null);

  // Form states para Evento
  const [formEvento, setFormEvento] = useState<{
    nome: string;
    tipo: TipoEvento;
    dataInicio: string;
    dataFim: string;
    local: string;
    descricao: string;
    valorParticipacao: number;
    dataLimitePagamento: string;
    responsavel: string;
    vagas: number;
    status: StatusEvento;
  }>({
    nome: '',
    tipo: 'Acampamento',
    dataInicio: '',
    dataFim: '',
    local: '',
    descricao: '',
    valorParticipacao: 120.00,
    dataLimitePagamento: '',
    responsavel: 'Chefe de Seção',
    vagas: 30,
    status: 'Aberto'
  });

  // Form states para Participação
  const [formPart, setFormPart] = useState<{
    escoteiroId: string;
    participou: boolean;
    valorCobrado: number;
    valorPago: number;
    dataPagamento: string;
    formaPagamento: FormaPagamento;
    statusFinanceiro: StatusFinanceiroParticipacao;
    observacoes: string;
  }>({
    escoteiroId: escoteiros[0]?.id || '',
    participou: true,
    valorCobrado: 120.00,
    valorPago: 0,
    dataPagamento: '',
    formaPagamento: 'Pix',
    statusFinanceiro: 'Pendente',
    observacoes: ''
  });

  // Evento Ativo
  const eventoAtivo = useMemo(() => {
    return eventos.find(e => e.id === eventoSelecionadoId) || eventos[0];
  }, [eventos, eventoSelecionadoId]);

  // Participações do evento ativo
  const participacoesDoEvento = useMemo(() => {
    if (!eventoAtivo) return [];
    return participacoes.filter(p => p.eventoId === eventoAtivo.id);
  }, [participacoes, eventoAtivo]);

  // Balanço do Evento Ativo
  const metricasEvento = useMemo(() => {
    let totalCobrado = 0;
    let totalPago = 0;
    let totalPresentes = 0;
    let totalQuitados = 0;

    participacoesDoEvento.forEach(p => {
      totalCobrado += p.valorCobrado;
      totalPago += p.valorPago;
      if (p.participou) totalPresentes++;
      if (p.statusFinanceiro === 'Pago') totalQuitados++;
    });

    const vagasRestantes = eventoAtivo?.vagas ? Math.max(0, eventoAtivo.vagas - participacoesDoEvento.length) : null;

    return {
      totalCobrado,
      totalPago,
      saldoDevedor: Math.max(0, totalCobrado - totalPago),
      totalInscritos: participacoesDoEvento.length,
      totalPresentes,
      totalQuitados,
      vagasRestantes
    };
  }, [participacoesDoEvento, eventoAtivo]);

  // Filtro de Eventos
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => {
      if (filtroTipo !== 'todos' && e.tipo !== filtroTipo) return false;
      if (filtroStatus !== 'todos' && e.status !== filtroStatus) return false;
      if (busca.trim()) {
        const q = busca.toLowerCase();
        if (!e.nome.toLowerCase().includes(q) && !e.local.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [eventos, filtroTipo, filtroStatus, busca]);

  // Salvar Evento
  const handleSalvarEvento = (e: React.FormEvent) => {
    e.preventDefault();
    const salvo = storageService.salvarEvento({
      id: editandoEvento?.id,
      nome: formEvento.nome,
      tipo: formEvento.tipo,
      dataInicio: formEvento.dataInicio,
      dataFim: formEvento.dataFim,
      local: formEvento.local,
      descricao: formEvento.descricao,
      valorParticipacao: Number(formEvento.valorParticipacao),
      dataLimitePagamento: formEvento.dataLimitePagamento,
      responsavel: formEvento.responsavel,
      vagas: Number(formEvento.vagas),
      status: formEvento.status
    });

    setModalEventoAberto(false);
    setEditandoEvento(null);
    setEventoSelecionadoId(salvo.id);
    onRefresh();
  };

  // Salvar Participação
  const handleSalvarParticipacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoAtivo) return;
    const esc = escoteiros.find(x => x.id === formPart.escoteiroId);
    if (!esc) return;

    const idade = new Date().getFullYear() - parseInt(esc.dataNascimento.split('-')[0] || '2015', 10);
    const secao = obterSecaoPorRamo(identificarRamo(idade));

    storageService.salvarParticipacao({
      id: editandoParticipacao?.id,
      eventoId: eventoAtivo.id,
      escoteiroId: esc.id,
      escoteiroNome: esc.nomeCompleto,
      secao,
      participou: formPart.participou,
      valorCobrado: Number(formPart.valorCobrado),
      valorPago: Number(formPart.valorPago),
      dataPagamento: formPart.valorPago > 0 ? formPart.dataPagamento || new Date().toISOString().split('T')[0] : undefined,
      formaPagamento: formPart.valorPago > 0 ? formPart.formaPagamento : undefined,
      statusFinanceiro: formPart.statusFinanceiro,
      observacoes: formPart.observacoes
    });

    setModalInscricaoAberto(false);
    setEditandoParticipacao(null);
    onRefresh();
  };

  // Alternar presença rápida (Participou? Sim / Não)
  const handleTogglePresenca = (part: ParticipacaoEvento) => {
    storageService.salvarParticipacao({
      ...part,
      participou: !part.participou
    });
    onRefresh();
  };

  // Imprimir Lista de Chamada e Emergência do Evento
  const handleImprimirListaChamada = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Eventos */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Tent className="w-4 h-4" />
            <span>Vida ao Ar Livre • Atividades & Acampamentos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-1">
            Eventos Escoteiros & Participações
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Cadastro de acampamentos, controle de vagas, lista de chamada e financeiro de cada atividade.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditandoEvento(null);
            setFormEvento({
              nome: '',
              tipo: 'Acampamento',
              dataInicio: new Date().toISOString().split('T')[0],
              dataFim: new Date().toISOString().split('T')[0],
              local: 'Sede Franca / Local a definir',
              descricao: '',
              valorParticipacao: 120.00,
              dataLimitePagamento: new Date().toISOString().split('T')[0],
              responsavel: 'Chefia Responsável',
              vagas: 35,
              status: 'Aberto'
            });
            setModalEventoAberto(true);
          }}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Novo Evento</span>
        </button>
      </div>

      {/* Grid Principal: Lista de Eventos à Esquerda, Painel do Evento à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna 1: Lista / Seletor de Eventos (4 Colunas) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-2.5">
            <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span>Eventos Cadastrados ({eventosFiltrados.length})</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar evento ou local..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-1.5 text-xs">
              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-[11px]"
              >
                <option value="todos">Todos Tipos</option>
                <option value="Acampamento">Acampamento</option>
                <option value="Bivaque">Bivaque</option>
                <option value="Jornada">Jornada</option>
                <option value="Excursão">Excursão</option>
                <option value="Atividade Especial">Atividade Especial</option>
              </select>

              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-[11px]"
              >
                <option value="todos">Todos Status</option>
                <option value="Aberto">Aberto</option>
                <option value="Planejado">Planejado</option>
                <option value="Realizado">Realizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Cards de Eventos */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {eventosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs bg-white rounded-2xl border border-stone-200 p-4">
                Nenhum evento encontrado.
              </div>
            ) : (
              eventosFiltrados.map(ev => {
                const isSelected = ev.id === eventoAtivo?.id;
                let statusBadge = 'bg-stone-100 text-stone-600';
                if (ev.status === 'Aberto') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                if (ev.status === 'Realizado') statusBadge = 'bg-blue-100 text-blue-800 border-blue-300';
                if (ev.status === 'Planejado') statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';

                return (
                  <div
                    key={ev.id}
                    onClick={() => setEventoSelecionadoId(ev.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/40'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isSelected ? 'bg-emerald-800 text-amber-300' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {ev.tipo}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {ev.status}
                      </span>
                    </div>

                    <h4 className={`font-bold text-sm mt-2 line-clamp-1 ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      {ev.nome}
                    </h4>

                    <div className={`text-[11px] space-y-1 mt-2 ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{ev.dataInicio ? ev.dataInicio.split('-').reverse().join('/') : '-'} até {ev.dataFim ? ev.dataFim.split('-').reverse().join('/') : '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ev.local}</span>
                      </div>
                    </div>

                    <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs font-semibold ${
                      isSelected ? 'border-emerald-800/80 text-amber-300' : 'border-stone-100 text-emerald-800'
                    }`}>
                      <span>R$ {ev.valorParticipacao.toFixed(2)}</span>
                      <span className="text-[11px] font-normal text-stone-400">
                        {participacoes.filter(p => p.eventoId === ev.id).length} inscritos
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 2: Detalhes do Evento & Participantes (8 Colunas) */}
        <div className="lg:col-span-8 space-y-5">
          {eventoAtivo ? (
            <>
              {/* Event Header & KPI Banner */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-md">
                        {eventoAtivo.tipo}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        Responsável: <strong className="text-stone-800">{eventoAtivo.responsavel}</strong>
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-1">
                      {eventoAtivo.nome}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {eventoAtivo.descricao || 'Sem descrição cadastrada.'}
                    </p>
                  </div>

                  {/* Actions for active event */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoEvento(eventoAtivo);
                        setFormEvento({
                          nome: eventoAtivo.nome,
                          tipo: eventoAtivo.tipo,
                          dataInicio: eventoAtivo.dataInicio,
                          dataFim: eventoAtivo.dataFim,
                          local: eventoAtivo.local,
                          descricao: eventoAtivo.descricao,
                          valorParticipacao: eventoAtivo.valorParticipacao,
                          dataLimitePagamento: eventoAtivo.dataLimitePagamento,
                          responsavel: eventoAtivo.responsavel,
                          vagas: eventoAtivo.vagas || 30,
                          status: eventoAtivo.status
                        });
                        setModalEventoAberto(true);
                      }}
                      className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
                      title="Editar Dados do Evento"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Excluir o evento "${eventoAtivo.nome}" e todas as suas inscrições?`)) {
                          storageService.excluirEvento(eventoAtivo.id);
                          onRefresh();
                        }
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                      title="Excluir Evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleImprimirListaChamada}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-stone-200"
                      title="Imprimir Lista de Chamada e Emergência"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">Imprimir Lista</span>
                    </button>
                  </div>
                </div>

                {/* Métricas do Evento */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Inscritos / Vagas</div>
                    <div className="text-base sm:text-lg font-extrabold text-stone-900 mt-0.5">
                      {metricasEvento.totalInscritos} {eventoAtivo.vagas ? `/ ${eventoAtivo.vagas}` : ''}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {metricasEvento.totalPresentes} confirmados
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Total Arrecadado</div>
                    <div className="text-base sm:text-lg font-extrabold text-emerald-700 mt-0.5">
                      R$ {metricasEvento.totalPago.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      {metricasEvento.totalQuitados} 100% quitados
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Saldo a Receber</div>
                    <div className="text-base sm:text-lg font-extrabold text-amber-600 mt-0.5">
                      R$ {metricasEvento.saldoDevedor.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Previsão: R$ {metricasEvento.totalCobrado.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Data Limite Pgto</div>
                    <div className="text-base sm:text-lg font-extrabold text-stone-900 mt-0.5">
                      {eventoAtivo.dataLimitePagamento ? eventoAtivo.dataLimitePagamento.split('-').reverse().slice(0, 2).join('/') : '-'}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Taxa: R$ {eventoAtivo.valorParticipacao.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Participantes do Evento */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-4">
                <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-stone-900 font-serif">
                      Jovens Inscritos no Evento ({participacoesDoEvento.length})
                    </h4>
                    <p className="text-xs text-stone-500">
                      Controle de presença no campo, fichas médicas e situação de pagamento.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditandoParticipacao(null);
                      setFormPart({
                        escoteiroId: escoteiros[0]?.id || '',
                        participou: true,
                        valorCobrado: eventoAtivo.valorParticipacao,
                        valorPago: 0,
                        dataPagamento: '',
                        formaPagamento: 'Pix',
                        statusFinanceiro: 'Pendente',
                        observacoes: ''
                      });
                      setModalInscricaoAberto(true);
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Inscrever Associado</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200 text-xs text-left">
                    <thead className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Presença</th>
                        <th className="px-4 py-3">Associado</th>
                        <th className="px-4 py-3">Seção</th>
                        <th className="px-4 py-3">Cobrado / Pago</th>
                        <th className="px-4 py-3">Status Financeiro</th>
                        <th className="px-4 py-3">Observações</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {participacoesDoEvento.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                            Nenhum jovem inscrito neste evento ainda. Clique em "Inscrever Associado" acima.
                          </td>
                        </tr>
                      ) : (
                        participacoesDoEvento.map(p => {
                          const escoteiroOriginal = escoteiros.find(e => e.id === p.escoteiroId);

                          let badgeFinanceiro = 'bg-stone-100 text-stone-700';
                          if (p.statusFinanceiro === 'Pago') badgeFinanceiro = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                          if (p.statusFinanceiro === 'Parcial') badgeFinanceiro = 'bg-amber-100 text-amber-800 border-amber-300';
                          if (p.statusFinanceiro === 'Pendente') badgeFinanceiro = 'bg-rose-100 text-rose-800 border-rose-300';

                          return (
                            <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                              {/* Checkbox Presença */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePresenca(p)}
                                  className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                    p.participou
                                      ? 'bg-emerald-700 text-white shadow-2xs'
                                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                  }`}
                                  title="Clique para alternar presença"
                                >
                                  {p.participou ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                  <span>{p.participou ? 'Presente' : 'Ausente'}</span>
                                </button>
                              </td>

                              <td className="px-4 py-3 font-semibold text-stone-900 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span>{p.escoteiroNome}</span>
                                  {escoteiroOriginal && onOpenDirigenteDossier && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenDirigenteDossier(escoteiroOriginal)}
                                      className="text-stone-400 hover:text-emerald-700 p-0.5"
                                      title="Ficha 360°"
                                    >
                                      <Users className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100">
                                  {p.secao}
                                </span>
                              </td>

                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-bold text-stone-900">
                                  R$ {p.valorPago.toFixed(2)}
                                  <span className="font-normal text-stone-400 text-[11px] ml-1">
                                    / R$ {p.valorCobrado.toFixed(2)}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeFinanceiro}`}>
                                  {p.statusFinanceiro}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-stone-500 max-w-[200px] truncate">
                                {p.observacoes || '-'}
                              </td>

                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditandoParticipacao(p);
                                      setFormPart({
                                        escoteiroId: p.escoteiroId,
                                        participou: p.participou,
                                        valorCobrado: p.valorCobrado,
                                        valorPago: p.valorPago,
                                        dataPagamento: p.dataPagamento || '',
                                        formaPagamento: p.formaPagamento || 'Pix',
                                        statusFinanceiro: p.statusFinanceiro,
                                        observacoes: p.observacoes || ''
                                      });
                                      setModalInscricaoAberto(true);
                                    }}
                                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                    title="Editar Inscrição / Pagamento"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Remover a inscrição de ${p.escoteiroNome} deste evento?`)) {
                                        storageService.excluirParticipacao(p.id);
                                        onRefresh();
                                      }
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Remover Inscrição"
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
            </>
          ) : (
            <div className="bg-white p-12 text-center text-stone-400 rounded-2xl border border-stone-200">
              Nenhum evento selecionado.
            </div>
          )}
        </div>

      </div>

      {/* =================================================================== */}
      {/* MODAL 1: CADASTRO / EDIÇÃO DE EVENTO ESCOTEIRO                     */}
      {/* =================================================================== */}
      {modalEventoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base font-serif">
                {editandoEvento ? 'Editar Evento Escoteiro' : 'Cadastrar Novo Evento Escoteiro'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalEventoAberto(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEvento} className="p-5 space-y-3.5 text-xs text-stone-800 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nome do Evento</label>
                <input
                  type="text"
                  value={formEvento.nome}
                  onChange={e => setFormEvento({ ...formEvento, nome: e.target.value })}
                  placeholder="Ex: Acampamento de Primavera 2026"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tipo de Evento</label>
                  <select
                    value={formEvento.tipo}
                    onChange={e => setFormEvento({ ...formEvento, tipo: e.target.value as TipoEvento })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  >
                    <option value="Acampamento">Acampamento</option>
                    <option value="Bivaque">Bivaque</option>
                    <option value="Jornada">Jornada</option>
                    <option value="Excursão">Excursão</option>
                    <option value="Atividade Especial">Atividade Especial</option>
                    <option value="Feira / Comunitário">Feira / Comunitário</option>
                    <option value="Formação">Formação</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status</label>
                  <select
                    value={formEvento.status}
                    onChange={e => setFormEvento({ ...formEvento, status: e.target.value as StatusEvento })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Planejado">Planejado</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={formEvento.dataInicio}
                    onChange={e => setFormEvento({ ...formEvento, dataInicio: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Data Final</label>
                  <input
                    type="date"
                    value={formEvento.dataFim}
                    onChange={e => setFormEvento({ ...formEvento, dataFim: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Local do Evento</label>
                <input
                  type="text"
                  value={formEvento.local}
                  onChange={e => setFormEvento({ ...formEvento, local: e.target.value })}
                  placeholder="Ex: Sítio Recanto das Águas — Claraval/MG ou Sede Franca"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Taxa (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formEvento.valorParticipacao}
                    onChange={e => setFormEvento({ ...formEvento, valorParticipacao: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Data Limite Pgto</label>
                  <input
                    type="date"
                    value={formEvento.dataLimitePagamento}
                    onChange={e => setFormEvento({ ...formEvento, dataLimitePagamento: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Vagas</label>
                  <input
                    type="number"
                    value={formEvento.vagas}
                    onChange={e => setFormEvento({ ...formEvento, vagas: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Chefe / Responsável pelo Evento</label>
                <input
                  type="text"
                  value={formEvento.responsavel}
                  onChange={e => setFormEvento({ ...formEvento, responsavel: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Descrição & Orientações aos Pais</label>
                <textarea
                  rows={3}
                  value={formEvento.descricao}
                  onChange={e => setFormEvento({ ...formEvento, descricao: e.target.value })}
                  placeholder="Informações sobre alimentação, transporte, material individual obrigatório..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEventoAberto(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: INSCREVER / EDITAR PARTICIPAÇÃO DE JOVEM                  */}
      {/* =================================================================== */}
      {modalInscricaoAberto && eventoAtivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base font-serif">
                  {editandoParticipacao ? 'Editar Inscrição no Evento' : 'Inscrever Jovem no Evento'}
                </h3>
                <p className="text-[11px] text-emerald-300">
                  {eventoAtivo.nome}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setModalInscricaoAberto(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarParticipacao} className="p-5 space-y-4 text-xs text-stone-800">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Associado / Jovem Escoteiro</label>
                <select
                  value={formPart.escoteiroId}
                  onChange={e => setFormPart({ ...formPart, escoteiroId: e.target.value })}
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
                  <label className="block font-bold text-stone-700 mb-1">Valor Cobrado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPart.valorCobrado}
                    onChange={e => setFormPart({ ...formPart, valorCobrado: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Valor Pago (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPart.valorPago}
                    onChange={e => {
                      const v = Number(e.target.value);
                      let novoStatus: StatusFinanceiroParticipacao = 'Pendente';
                      if (v >= formPart.valorCobrado && formPart.valorCobrado > 0) novoStatus = 'Pago';
                      else if (v > 0) novoStatus = 'Parcial';
                      setFormPart({
                        ...formPart,
                        valorPago: v,
                        statusFinanceiro: novoStatus
                      });
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status Financeiro</label>
                  <select
                    value={formPart.statusFinanceiro}
                    onChange={e => setFormPart({ ...formPart, statusFinanceiro: e.target.value as StatusFinanceiroParticipacao })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Parcial">Parcial</option>
                    <option value="Pago">Pago</option>
                    <option value="Isento">Isento</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={formPart.formaPagamento}
                    onChange={e => setFormPart({ ...formPart, formaPagamento: e.target.value as FormaPagamento })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    {FORMAS_PAGAMENTO.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Confirmação de Presença no Evento</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="participou"
                      checked={formPart.participou === true}
                      onChange={() => setFormPart({ ...formPart, participou: true })}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span>Sim (Confirmado no Acampamento)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="participou"
                      checked={formPart.participou === false}
                      onChange={() => setFormPart({ ...formPart, participou: false })}
                      className="text-stone-500 focus:ring-stone-400"
                    />
                    <span>Não / Faltou</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Observações / Equipamentos / Dieta</label>
                <input
                  type="text"
                  value={formPart.observacoes}
                  onChange={e => setFormPart({ ...formPart, observacoes: e.target.value })}
                  placeholder="Ex: Traz barraca, autorização médica especial entregue..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalInscricaoAberto(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Salvar Inscrição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
