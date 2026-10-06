import React, { useState, useMemo } from 'react';
import { EscoteiroCadastro, identificarRamo } from '../types/scout';
import { 
  RegistroUniformeMaterial, 
  TipoItemUniforme, 
  OrigemMaterial, 
  StatusPagamentoMaterial, 
  FormaPagamento,
  ITENS_UNIFORME_PADRAO,
  FORMAS_PAGAMENTO,
  obterSecaoPorRamo
} from '../types/management';
import { storageService } from '../services/storage';
import { 
  Shirt, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Gift, 
  ShoppingBag,
  Users,
  DollarSign,
  Tag
} from 'lucide-react';

interface UniformesManagerProps {
  escoteiros: EscoteiroCadastro[];
  uniformes: RegistroUniformeMaterial[];
  onRefresh: () => void;
  onOpenDirigenteDossier?: (escoteiro: EscoteiroCadastro) => void;
}

export const UniformesManager: React.FC<UniformesManagerProps> = ({
  escoteiros,
  uniformes,
  onRefresh,
  onOpenDirigenteDossier,
}) => {
  const [busca, setBusca] = useState<string>('');
  const [filtroItem, setFiltroItem] = useState<string>('todos');
  const [filtroOrigem, setFiltroOrigem] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Modais
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [editandoUniforme, setEditandoUniforme] = useState<RegistroUniformeMaterial | null>(null);

  // Form State
  const [form, setForm] = useState<{
    escoteiroId: string;
    item: TipoItemUniforme;
    origem: OrigemMaterial;
    tamanho: string;
    quantidade: number;
    dataEntrega: string;
    valor: number;
    statusPagamento: StatusPagamentoMaterial;
    valorPago: number;
    dataPagamento: string;
    formaPagamento: FormaPagamento;
    responsavelRecebimento: string;
    observacoes: string;
  }>({
    escoteiroId: escoteiros[0]?.id || '',
    item: 'Gandola escoteira',
    origem: 'Adquirido/Pago pelo responsável',
    tamanho: '10',
    quantidade: 1,
    dataEntrega: new Date().toISOString().split('T')[0],
    valor: 110.00,
    statusPagamento: 'Pago',
    valorPago: 110.00,
    dataPagamento: new Date().toISOString().split('T')[0],
    formaPagamento: 'Pix',
    responsavelRecebimento: '',
    observacoes: ''
  });

  // Estatísticas de Almoxarifado / Uniforme
  const stats = useMemo(() => {
    let totalPecas = 0;
    let totalArrecadado = 0;
    let totalPendente = 0;
    let pecasGrupo = 0;
    let pecasCompradas = 0;

    uniformes.forEach(u => {
      totalPecas += u.quantidade;
      totalArrecadado += u.valorPago;
      if (u.statusPagamento === 'Pendente') {
        totalPendente += Math.max(0, u.valor - u.valorPago);
      } else if (u.statusPagamento === 'Parcial') {
        totalPendente += Math.max(0, u.valor - u.valorPago);
      }

      if (u.origem === 'Fornecido pelo Grupo') {
        pecasGrupo += u.quantidade;
      } else {
        pecasCompradas += u.quantidade;
      }
    });

    return { totalPecas, totalArrecadado, totalPendente, pecasGrupo, pecasCompradas };
  }, [uniformes]);

  // Lista Filtrada
  const uniformesFiltrados = useMemo(() => {
    return uniformes.filter(u => {
      if (filtroItem !== 'todos' && u.item !== filtroItem) return false;
      if (filtroOrigem !== 'todas' && u.origem !== filtroOrigem) return false;
      if (filtroStatus !== 'todos' && u.statusPagamento !== filtroStatus) return false;
      if (busca.trim()) {
        const q = busca.toLowerCase();
        const bateNome = u.escoteiroNome.toLowerCase().includes(q);
        const bateItem = u.item.toLowerCase().includes(q);
        const bateResp = (u.responsavelRecebimento || '').toLowerCase().includes(q);
        if (!bateNome && !bateItem && !bateResp) return false;
      }
      return true;
    });
  }, [uniformes, filtroItem, filtroOrigem, filtroStatus, busca]);

  // Salvar Uniforme
  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const esc = escoteiros.find(x => x.id === form.escoteiroId);
    if (!esc) return;

    const idade = new Date().getFullYear() - parseInt(esc.dataNascimento.split('-')[0] || '2015', 10);
    const secao = obterSecaoPorRamo(identificarRamo(idade));

    storageService.salvarUniforme({
      id: editandoUniforme?.id,
      escoteiroId: esc.id,
      escoteiroNome: esc.nomeCompleto,
      secao,
      item: form.item,
      origem: form.origem,
      tamanho: form.tamanho,
      quantidade: Number(form.quantidade),
      dataEntrega: form.dataEntrega,
      valor: Number(form.valor),
      statusPagamento: form.statusPagamento,
      valorPago: Number(form.valorPago),
      dataPagamento: form.valorPago > 0 ? form.dataPagamento || new Date().toISOString().split('T')[0] : undefined,
      formaPagamento: form.valorPago > 0 ? form.formaPagamento : undefined,
      responsavelRecebimento: form.responsavelRecebimento || esc.primeiroResponsavel.nomeCompleto,
      observacoes: form.observacoes
    });

    setModalAberto(false);
    setEditandoUniforme(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Shirt className="w-4 h-4" />
            <span>Almoxarifado & Enxoval Tradicional</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-1">
            Controle de Uniformes e Materiais
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Registro de gandolas, bonés, bermudas, camisetas, tamanhos e controle de pagamentos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditandoUniforme(null);
            setForm({
              escoteiroId: escoteiros[0]?.id || '',
              item: 'Gandola escoteira',
              origem: 'Adquirido/Pago pelo responsável',
              tamanho: '10',
              quantidade: 1,
              dataEntrega: new Date().toISOString().split('T')[0],
              valor: 110.00,
              statusPagamento: 'Pago',
              valorPago: 110.00,
              dataPagamento: new Date().toISOString().split('T')[0],
              formaPagamento: 'Pix',
              responsavelRecebimento: escoteiros[0]?.primeiroResponsavel.nomeCompleto || '',
              observacoes: ''
            });
            setModalAberto(true);
          }}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Entrega de Uniforme/Material</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
            <span>Peças Entregues</span>
            <Package className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            {stats.totalPecas}
          </div>
          <div className="text-xs text-stone-400 mt-1">
            {stats.pecasCompradas} adquiridas • {stats.pecasGrupo} fornecidas pelo Grupo
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
            <span>Total Arrecadado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            R$ {stats.totalArrecadado.toFixed(2)}
          </div>
          <div className="text-xs text-stone-400 mt-1">
            Recebido por vendas e reembolsos
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
            <span>Valores Pendentes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
            R$ {stats.totalPendente.toFixed(2)}
          </div>
          <div className="text-xs text-stone-400 mt-1">
            A receber dos responsáveis
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase flex items-center justify-between">
            <span>Fornecido pelo Grupo</span>
            <Gift className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-800 mt-2">
            {stats.pecasGrupo} itens
          </div>
          <div className="text-xs text-stone-400 mt-1">
            Kits de boas-vindas, distintivos ou doações
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar associado, item ou responsável..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100 text-xs">
          {/* Tipo de Item */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Item de Uniforme</label>
            <select
              value={filtroItem}
              onChange={e => setFiltroItem(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
            >
              <option value="todos">Todos os Itens</option>
              {ITENS_UNIFORME_PADRAO.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Origem */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Origem do Material</label>
            <select
              value={filtroOrigem}
              onChange={e => setFiltroOrigem(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
            >
              <option value="todas">Todas as Origens</option>
              <option value="Fornecido pelo Grupo">Fornecido pelo Grupo</option>
              <option value="Adquirido/Pago pelo responsável">Adquirido pelo Responsável</option>
            </select>
          </div>

          {/* Status de Pagamento */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Status Pagamento</label>
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
            >
              <option value="todos">Todos os Status</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Parcial">Parcial</option>
              <option value="Cortesia / Isento">Cortesia / Isento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Uniformes e Materiais */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Associado / Jovem</th>
                <th className="px-4 py-3">Item de Uniforme</th>
                <th className="px-4 py-3">Tamanho</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3">Valor / Pago</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Recebido por</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {uniformesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-stone-400">
                    Nenhum registro de uniforme ou material encontrado.
                  </td>
                </tr>
              ) : (
                uniformesFiltrados.map(u => {
                  const escoteiroOriginal = escoteiros.find(e => e.id === u.escoteiroId);

                  let badgeStatus = 'bg-stone-100 text-stone-700';
                  if (u.statusPagamento === 'Pago') badgeStatus = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  if (u.statusPagamento === 'Pendente') badgeStatus = 'bg-amber-100 text-amber-800 border-amber-300';
                  if (u.statusPagamento === 'Cortesia / Isento') badgeStatus = 'bg-blue-100 text-blue-800 border-blue-300';

                  return (
                    <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-stone-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{u.escoteiroNome}</span>
                          {escoteiroOriginal && onOpenDirigenteDossier && (
                            <button
                              type="button"
                              onClick={() => onOpenDirigenteDossier(escoteiroOriginal)}
                              className="text-stone-400 hover:text-emerald-700 p-0.5"
                              title="Ver Ficha 360°"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-stone-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{u.item}</span>
                          {u.quantidade > 1 && (
                            <span className="text-[10px] bg-stone-100 px-1 rounded text-stone-600">
                              x{u.quantidade}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-stone-800 whitespace-nowrap">
                        {u.tamanho}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.origem === 'Fornecido pelo Grupo' 
                            ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {u.origem === 'Fornecido pelo Grupo' ? 'Grupo' : 'Responsável'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                        {u.dataEntrega ? u.dataEntrega.split('-').reverse().join('/') : '-'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-stone-900">
                          R$ {u.valorPago.toFixed(2)}
                          <span className="font-normal text-stone-400 text-[10px] ml-1">
                            / R$ {u.valor.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStatus}`}>
                          {u.statusPagamento}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                        {u.responsavelRecebimento || '-'}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditandoUniforme(u);
                              setForm({
                                escoteiroId: u.escoteiroId,
                                item: u.item,
                                origem: u.origem,
                                tamanho: u.tamanho,
                                quantidade: u.quantidade,
                                dataEntrega: u.dataEntrega,
                                valor: u.valor,
                                statusPagamento: u.statusPagamento,
                                valorPago: u.valorPago,
                                dataPagamento: u.dataPagamento || '',
                                formaPagamento: u.formaPagamento || 'Pix',
                                responsavelRecebimento: u.responsavelRecebimento || '',
                                observacoes: u.observacoes || ''
                              });
                              setModalAberto(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Excluir o registro de ${u.item} de ${u.escoteiroNome}?`)) {
                                storageService.excluirUniforme(u.id);
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

      {/* =================================================================== */}
      {/* MODAL: LANÇAR / EDITAR ENTREGA DE UNIFORME                          */}
      {/* =================================================================== */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base font-serif">
                {editandoUniforme ? 'Editar Registro de Uniforme/Material' : 'Registrar Entrega de Uniforme/Material'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalAberto(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-5 space-y-3.5 text-xs text-stone-800 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Associado / Jovem Escoteiro</label>
                <select
                  value={form.escoteiroId}
                  onChange={e => {
                    const esc = escoteiros.find(x => x.id === e.target.value);
                    setForm({ 
                      ...form, 
                      escoteiroId: e.target.value,
                      responsavelRecebimento: esc?.primeiroResponsavel.nomeCompleto || form.responsavelRecebimento
                    });
                  }}
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
                  <label className="block font-bold text-stone-700 mb-1">Item Fornecido</label>
                  <select
                    value={form.item}
                    onChange={e => {
                      const item = e.target.value as TipoItemUniforme;
                      let valorSug = 110.00;
                      if (item === 'Cobertura — boné') valorSug = 35.00;
                      if (item === 'Camiseta laranja') valorSug = 45.00;
                      if (item === 'Cinto escoteiro') valorSug = 30.00;
                      if (item === 'Bermuda/short escoteiro') valorSug = 70.00;
                      if (item === 'Calça escoteira') valorSug = 85.00;
                      if (item === 'Short-saia escoteiro') valorSug = 65.00;
                      if (item === 'Meião escoteiro') valorSug = 25.00;
                      setForm({
                        ...form,
                        item,
                        valor: valorSug,
                        valorPago: form.statusPagamento === 'Pago' ? valorSug : form.valorPago
                      });
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  >
                    {ITENS_UNIFORME_PADRAO.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Origem do Material</label>
                  <select
                    value={form.origem}
                    onChange={e => {
                      const origem = e.target.value as OrigemMaterial;
                      setForm({
                        ...form,
                        origem,
                        statusPagamento: origem === 'Fornecido pelo Grupo' ? 'Cortesia / Isento' : form.statusPagamento,
                        valorPago: origem === 'Fornecido pelo Grupo' ? 0 : form.valorPago
                      });
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  >
                    <option value="Adquirido/Pago pelo responsável">Adquirido pelo Responsável</option>
                    <option value="Fornecido pelo Grupo">Fornecido pelo Grupo (Subsídio/Kit)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tamanho</label>
                  <input
                    type="text"
                    value={form.tamanho}
                    onChange={e => setForm({ ...form, tamanho: e.target.value })}
                    placeholder="8, 10, P, M, G..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantidade}
                    onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Data de Entrega</label>
                  <input
                    type="date"
                    value={form.dataEntrega}
                    onChange={e => setForm({ ...form, dataEntrega: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status de Pagamento</label>
                  <select
                    value={form.statusPagamento}
                    onChange={e => {
                      const st = e.target.value as StatusPagamentoMaterial;
                      setForm({
                        ...form,
                        statusPagamento: st,
                        valorPago: st === 'Pago' ? form.valor : st === 'Cortesia / Isento' ? 0 : form.valorPago
                      });
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  >
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Parcial">Parcial</option>
                    <option value="Cortesia / Isento">Cortesia / Isento</option>
                  </select>
                </div>
              </div>

              {form.statusPagamento !== 'Cortesia / Isento' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Valor Pago (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.valorPago}
                      onChange={e => setForm({ ...form, valorPago: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Forma de Pagamento</label>
                    <select
                      value={form.formaPagamento}
                      onChange={e => setForm({ ...form, formaPagamento: e.target.value as FormaPagamento })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    >
                      {FORMAS_PAGAMENTO.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 mb-1">Responsável pelo Recebimento da Peça</label>
                <input
                  type="text"
                  value={form.responsavelRecebimento}
                  onChange={e => setForm({ ...form, responsavelRecebimento: e.target.value })}
                  placeholder="Nome do pai/mãe ou chefe que retirou o material"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Observações</label>
                <input
                  type="text"
                  value={form.observacoes}
                  onChange={e => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Ex: Distintivos costurados na sede..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
