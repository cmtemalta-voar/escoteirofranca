import React, { useState, useMemo } from 'react';
import { 
  EscoteiroCadastro, 
  calcularIdade, 
  identificarRamo, 
  RamoEscoteiro,
  formatarDataBR,
  formatarTelefone 
} from '../types/scout';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Printer, 
  Edit3, 
  Trash2, 
  FileText, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Waves, 
  Download,
  AlertTriangle,
  ChevronDown,
  LayoutGrid,
  List,
  Eye,
  Users
} from 'lucide-react';

interface ScoutListProps {
  escoteiros: EscoteiroCadastro[];
  onSelectEscoteiro: (escoteiro: EscoteiroCadastro) => void;
  onEditEscoteiro: (escoteiro: EscoteiroCadastro) => void;
  onDeleteEscoteiro: (id: string) => void;
  onNovoCadastro: () => void;
  onImprimirEscoteiro: (escoteiro: EscoteiroCadastro) => void;
  onExportarCSV: () => void;
  onOpenDirigenteDossier?: (escoteiro: EscoteiroCadastro) => void;
}

export const ScoutList: React.FC<ScoutListProps> = ({
  escoteiros,
  onSelectEscoteiro,
  onEditEscoteiro,
  onDeleteEscoteiro,
  onNovoCadastro,
  onImprimirEscoteiro,
  onExportarCSV,
  onOpenDirigenteDossier,
}) => {
  const [busca, setBusca] = useState<string>('');
  const [filtroRamo, setFiltroRamo] = useState<string>('todos');
  const [filtroSexo, setFiltroSexo] = useState<string>('todos');
  const [filtroBairro, setFiltroBairro] = useState<string>('todos');
  const [filtroSaude, setFiltroSaude] = useState<string>('todos');
  const [modoVisualizacao, setModoVisualizacao] = useState<'tabela' | 'cards'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'tabela';
  });
  const [mostrarFiltrosMobile, setMostrarFiltrosMobile] = useState<boolean>(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  // Lista única de bairros
  const bairrosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    escoteiros.forEach(e => {
      if (e.bairro && e.bairro.trim()) set.add(e.bairro.trim());
    });
    return Array.from(set).sort();
  }, [escoteiros]);

  // Filtragem
  const filtrados = useMemo(() => {
    return escoteiros.filter(e => {
      const idade = calcularIdade(e.dataNascimento);
      const ramo = identificarRamo(idade);

      // Busca texto
      if (busca.trim()) {
        const query = busca.toLowerCase();
        const bateNome = e.nomeCompleto.toLowerCase().includes(query);
        const bateCpf = (e.cpf || '').includes(query);
        const bateBairro = (e.bairro || '').toLowerCase().includes(query);
        const bateResp = e.primeiroResponsavel.nomeCompleto.toLowerCase().includes(query);
        const bateReg = (e.fichaMedica.numeroRegistro || '').toLowerCase().includes(query);
        if (!bateNome && !bateCpf && !bateBairro && !bateResp && !bateReg) return false;
      }

      // Filtro Ramo
      if (filtroRamo !== 'todos' && ramo !== filtroRamo) return false;

      // Filtro Sexo
      if (filtroSexo !== 'todos' && e.sexo !== filtroSexo) return false;

      // Filtro Bairro
      if (filtroBairro !== 'todos' && e.bairro.trim() !== filtroBairro) return false;

      // Filtro Saúde
      if (filtroSaude === 'alergia' && !e.fichaMedica.apresentaAlergia) return false;
      if (filtroSaude === 'nao_nada' && e.fichaMedica.sabeNadar) return false;
      if (filtroSaude === 'medicamento' && !e.fichaMedica.medicamentoContinuo) return false;
      if (filtroSaude === 'neuro' && !e.fichaMedica.apresentaNeurodivergencia) return false;
      if (filtroSaude === 'pcd' && !e.fichaMedica.apresentaDeficiencia) return false;

      return true;
    });
  }, [escoteiros, busca, filtroRamo, filtroSexo, filtroBairro, filtroSaude]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Actions */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            Controle de Membros & Inscrições
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gerenciamento completo das fichas cadastrais do Grupo Escoteiro 22 de Fevereiro
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onExportarCSV();
            }}
            className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 cursor-pointer rounded-xl border border-emerald-300 transition-all shadow-2xs flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            title="Exportar planilha Excel com todos os campos cadastrais"
          >
            <Download className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Exportar Planilha Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={onNovoCadastro}
            className="px-4 py-2 min-h-[40px] bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-emerald-950 font-bold text-xs cursor-pointer rounded-xl shadow-sm transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Novo Escoteiro</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
        {/* Search Input & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome, CPF, bairro ou responsável..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            onClick={() => setMostrarFiltrosMobile(!mostrarFiltrosMobile)}
            className={`md:hidden px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mostrarFiltrosMobile || filtroRamo !== 'todos' || filtroSexo !== 'todos' || filtroBairro !== 'todos' || filtroSaude !== 'todos'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Dropdowns (Always visible on desktop, toggleable on mobile) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 ${mostrarFiltrosMobile ? 'block' : 'hidden md:grid'}`}>
          {/* Ramo */}
          <div>
            <label className="md:hidden block text-[10px] font-bold text-stone-500 uppercase mb-1">Ramo Escoteiro</label>
            <select
              value={filtroRamo}
              onChange={e => setFiltroRamo(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            >
              <option value="todos">Todos os Ramos</option>
              <option value="Lobinho">Lobinho (6.5-10a)</option>
              <option value="Escoteiro">Escoteiro (11-14a)</option>
              <option value="Sênior">Sênior (15-17a)</option>
              <option value="Pioneiro">Pioneiro (18-21a)</option>
              <option value="Adulto / Chefia">Adulto / Chefia</option>
            </select>
          </div>

          {/* Sexo */}
          <div>
            <label className="md:hidden block text-[10px] font-bold text-stone-500 uppercase mb-1">Sexo</label>
            <select
              value={filtroSexo}
              onChange={e => setFiltroSexo(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="todos">Sexo: Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          {/* Bairro */}
          <div>
            <label className="md:hidden block text-[10px] font-bold text-stone-500 uppercase mb-1">Bairro em Franca</label>
            <select
              value={filtroBairro}
              onChange={e => setFiltroBairro(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="todos">Todos os Bairros</option>
              {bairrosDisponiveis.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Filtro Saúde & Segurança */}
          <div>
            <label className="md:hidden block text-[10px] font-bold text-stone-500 uppercase mb-1">Condição de Saúde</label>
            <select
              value={filtroSaude}
              onChange={e => setFiltroSaude(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="todos">Saúde: Todos</option>
              <option value="alergia">Com Alergia</option>
              <option value="nao_nada">Não Sabe Nadar</option>
              <option value="medicamento">Medicamento Contínuo</option>
              <option value="neuro">Neurodivergência</option>
              <option value="pcd">PCD</option>
            </select>
          </div>
        </div>

        {/* View toggles & counter */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <div>
            Exibindo <strong>{filtrados.length}</strong> de <strong>{escoteiros.length}</strong> escoteiros cadastrados
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setModoVisualizacao('tabela')}
              className={`p-1.5 rounded-md transition-all ${
                modoVisualizacao === 'tabela' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setModoVisualizacao('cards')}
              className={`p-1.5 rounded-md transition-all ${
                modoVisualizacao === 'cards' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scouts Presentation */}
      {escoteiros.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">Nenhum escoteiro cadastrado ainda</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              O sistema está operando com banco de dados limpo para dados reais. Comece preenchendo a ficha de inscrição oficial para cadastrar os jovens do grupo.
            </p>
          </div>
          <button
            onClick={onNovoCadastro}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md inline-flex items-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>+ Cadastrar Primeiro Jovem</span>
          </button>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">Nenhum escoteiro encontrado</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Não foram encontrados registros para os filtros selecionados. Tente ajustar os termos de busca ou filtros.
          </p>
          <button
            onClick={() => {
              setBusca('');
              setFiltroRamo('todos');
              setFiltroSexo('todos');
              setFiltroBairro('todos');
              setFiltroSaude('todos');
            }}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl"
          >
            Limpar Filtros
          </button>
        </div>
      ) : modoVisualizacao === 'tabela' ? (
        
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs font-semibold uppercase tracking-wider border-b border-stone-200/60">
                <tr>
                  <th className="px-5 py-3.5">Registro</th>
                  <th className="px-5 py-3.5">Escoteiro</th>
                  <th className="px-5 py-3.5">Ramo / Idade</th>
                  <th className="px-5 py-3.5">Bairro / Franca</th>
                  <th className="px-5 py-3.5">Responsável Legal</th>
                  <th className="px-5 py-3.5">Saúde & Cuidados</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtrados.map(esc => {
                  const idade = calcularIdade(esc.dataNascimento);
                  const ramo = identificarRamo(idade);

                  return (
                    <tr key={esc.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-stone-600">
                        {esc.fichaMedica.numeroRegistro || 'S/N'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {esc.foto ? (
                            <img 
                              src={esc.foto} 
                              alt={esc.nomeCompleto} 
                              className="w-10 h-10 rounded-xl object-cover border border-emerald-700/30 shadow-2xs shrink-0" 
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 ${
                              esc.sexo === 'M' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {esc.nomeCompleto.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                              <span className="truncate">{esc.nomeCompleto}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                esc.sexo === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {esc.sexo}
                              </span>
                            </div>
                            <div className="text-xs text-stone-400 truncate">
                              Nasc: {formatarDataBR(esc.dataNascimento)} · CPF: {esc.cpf || 'Não inf.'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
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
                      <td className="px-5 py-4">
                        <div className="text-xs font-medium text-stone-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{esc.bairro}</span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {esc.endereco}, {esc.numero}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-medium text-stone-800">
                          {esc.primeiroResponsavel.nomeCompleto}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{esc.primeiroResponsavel.telefone1 || '-'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[11px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono">
                            {esc.fichaMedica.tipoSanguineo || 'S/T'}
                          </span>
                          {esc.fichaMedica.apresentaAlergia && (
                            <span className="text-[11px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                              Alergia
                            </span>
                          )}
                          {!esc.fichaMedica.sabeNadar && (
                            <span className="text-[11px] bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded font-medium border border-cyan-200">
                              Não nada
                            </span>
                          )}
                          {esc.fichaMedica.medicamentoContinuo && (
                            <span className="text-[11px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-medium border border-blue-200">
                              Medicamento
                            </span>
                          )}
                          {esc.fichaMedica.apresentaNeurodivergencia && (
                            <span className="text-[11px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                              Neuro
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenDirigenteDossier && (
                            <button
                              type="button"
                              onClick={() => onOpenDirigenteDossier(esc)}
                              className="px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                              title="Ver Dossiê Executivo 360° do Associado"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-950" />
                              <span>Ficha 360°</span>
                            </button>
                          )}
                          <button
                            onClick={() => onImprimirEscoteiro(esc)}
                            className="px-2.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                            title="Imprimir Cadastro Individual no Layout Oficial da Ficha"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-800" />
                            <span>Imprimir Ficha</span>
                          </button>
                          <button
                            onClick={() => onSelectEscoteiro(esc)}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Visualizar Ficha Completa na Tela"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditEscoteiro(esc)}
                            className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar Cadastro"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setIdParaExcluir(esc.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(esc => {
            const idade = calcularIdade(esc.dataNascimento);
            const ramo = identificarRamo(idade);

            return (
              <div 
                key={esc.id} 
                className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                    <span className="font-mono">{esc.fichaMedica.numeroRegistro || 'S/N'}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                      ramo === 'Lobinho' ? 'bg-amber-100 text-amber-800' :
                      ramo === 'Escoteiro' ? 'bg-emerald-100 text-emerald-800' :
                      ramo === 'Sênior' ? 'bg-rose-100 text-rose-800' :
                      ramo === 'Pioneiro' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-stone-200 text-stone-800'
                    }`}>
                      {ramo} ({idade}a)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {esc.foto ? (
                      <img 
                        src={esc.foto} 
                        alt={esc.nomeCompleto} 
                        className="w-12 h-12 rounded-2xl object-cover border border-emerald-700/30 shadow-xs shrink-0" 
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${
                        esc.sexo === 'M' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {esc.nomeCompleto.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-stone-900 leading-snug truncate">
                        {esc.nomeCompleto}
                      </h3>
                      
                      <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>{esc.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
                        <span>·</span>
                        <span>Nasc: {formatarDataBR(esc.dataNascimento)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-100 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-medium text-stone-800">{esc.bairro}, Franca</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{esc.telefone1} ({esc.primeiroResponsavel.nomeCompleto})</span>
                    </div>
                  </div>

                  {/* Badges de Saúde */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono font-bold">
                      Tipo: {esc.fichaMedica.tipoSanguineo || 'S/I'}
                    </span>
                    {esc.fichaMedica.apresentaAlergia && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                        Alergia
                      </span>
                    )}
                    {!esc.fichaMedica.sabeNadar && (
                      <span className="text-[10px] bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded font-medium border border-cyan-200">
                        Não nada
                      </span>
                    )}
                    {esc.fichaMedica.medicamentoContinuo && (
                      <span className="text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-medium border border-blue-200">
                        Medicamento
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {onOpenDirigenteDossier && (
                      <button
                        type="button"
                        onClick={() => onOpenDirigenteDossier(esc)}
                        className="px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        title="Ver Dossiê Executivo 360°"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-950" />
                        <span>Ficha 360°</span>
                      </button>
                    )}
                    <button
                      onClick={() => onImprimirEscoteiro(esc)}
                      className="px-2.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      title="Imprimir Cadastro Individual no Layout Oficial da Ficha"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Imprimir</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectEscoteiro(esc)}
                      className="p-1.5 text-stone-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50"
                      title="Ver Ficha Completa na Tela"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditEscoteiro(esc)}
                      className="p-1.5 text-stone-500 hover:text-amber-800 rounded-lg hover:bg-amber-50"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIdParaExcluir(esc.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {idParaExcluir && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl shadow-xl border border-stone-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Excluir Cadastro</h3>
              <p className="text-xs text-stone-500 mt-1">
                Tem certeza que deseja remover esta inscrição e toda sua ficha médica do sistema? Esta ação é irreversível.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIdParaExcluir(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteEscoteiro(idParaExcluir);
                  setIdParaExcluir(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
