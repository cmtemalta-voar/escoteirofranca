import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Lock, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Users, 
  Crown, 
  CheckSquare, 
  Square, 
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { UsuarioSistema, PermissaoModulo, LISTA_PERMISSOES } from '../types/auth';
import { storageService } from '../services/storage';

interface UsuariosManagerProps {
  usuarioAtual: UsuarioSistema | null;
  onRefreshAuth?: () => void;
  showToast: (msg: string) => void;
}

export const UsuariosManager: React.FC<UsuariosManagerProps> = ({
  usuarioAtual,
  onRefreshAuth,
  showToast,
}) => {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(() => storageService.getUsuarios());
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<UsuarioSistema | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<PermissaoModulo[]>([]);
  const [ativo, setAtivo] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroForm, setErroForm] = useState('');

  // Atualizar lista
  const recarregarUsuarios = () => {
    const list = storageService.getUsuarios();
    setUsuarios(list);
  };

  const abrirModalNovo = () => {
    setUsuarioEmEdicao(null);
    setNome('');
    setLogin('');
    setSenha('');
    setCargo('');
    setIsAdmin(false);
    setPermissoesSelecionadas(['dashboard', 'novo', 'lista']);
    setAtivo(true);
    setMostrarSenha(false);
    setErroForm('');
    setModalAberto(true);
  };

  const abrirModalEditar = (u: UsuarioSistema) => {
    setUsuarioEmEdicao(u);
    setNome(u.nome);
    setLogin(u.login);
    setSenha(u.senha);
    setCargo(u.cargo);
    setIsAdmin(u.isAdmin);
    setPermissoesSelecionadas(u.permissoes || []);
    setAtivo(u.ativo);
    setMostrarSenha(false);
    setErroForm('');
    setModalAberto(true);
  };

  const togglePermissao = (modulo: PermissaoModulo) => {
    setPermissoesSelecionadas(prev => {
      if (prev.includes(modulo)) {
        return prev.filter(p => p !== modulo);
      } else {
        return [...prev, modulo];
      }
    });
  };

  const selecionarTodasPermissoes = () => {
    setPermissoesSelecionadas(LISTA_PERMISSOES.map(p => p.id));
  };

  const limparTodasPermissoes = () => {
    setPermissoesSelecionadas([]);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm('');

    if (!nome.trim()) {
      setErroForm('Informe o nome do usuário.');
      return;
    }
    if (!login.trim()) {
      setErroForm('Informe o login ou e-mail de acesso.');
      return;
    }
    if (!senha.trim() || senha.length < 3) {
      setErroForm('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    // Verifica se já existe login duplicado (exceto ele mesmo se estiver editando)
    const loginJaExiste = usuarios.some(
      u => u.login.toLowerCase() === login.trim().toLowerCase() && 
           (!usuarioEmEdicao || u.id !== usuarioEmEdicao.id)
    );
    if (loginJaExiste) {
      setErroForm(`O login "${login.trim()}" já está sendo usado por outro usuário.`);
      return;
    }

    if (!isAdmin && permissoesSelecionadas.length === 0) {
      setErroForm('Selecione pelo menos um módulo de acesso para o usuário.');
      return;
    }

    const payload = {
      id: usuarioEmEdicao ? usuarioEmEdicao.id : undefined,
      nome: nome.trim(),
      login: login.trim().toLowerCase(),
      senha: senha.trim(),
      cargo: cargo.trim() || (isAdmin ? 'Diretoria Geral' : 'Chefia / Colaborador'),
      isAdmin,
      permissoes: isAdmin ? LISTA_PERMISSOES.map(p => p.id) : permissoesSelecionadas,
      ativo,
    };

    storageService.salvarUsuario(payload);
    recarregarUsuarios();
    if (onRefreshAuth) onRefreshAuth();

    showToast(usuarioEmEdicao ? 'Usuário atualizado com sucesso!' : 'Novo usuário cadastrado com sucesso!');
    setModalAberto(false);
  };

  const handleExcluir = (u: UsuarioSistema) => {
    if (!confirm(`Deseja realmente remover o acesso de "${u.nome}" (${u.login})?`)) {
      return;
    }

    const res = storageService.excluirUsuario(u.id);
    if (!res.sucesso) {
      alert(res.mensagem || 'Não foi possível excluir este usuário.');
      return;
    }

    recarregarUsuarios();
    if (onRefreshAuth) onRefreshAuth();
    showToast(`Usuário "${u.nome}" removido do sistema.`);
  };

  const handleRestaurarPadroes = () => {
    if (confirm('Deseja redefinir os acessos mantendo apenas a conta oficial do Administrador Geral Cmte. Malta (cmte.malta@gmail.com)?')) {
      storageService.redefinirUsuariosPadrao();
      recarregarUsuarios();
      if (onRefreshAuth) onRefreshAuth();
      showToast('Conta oficial do Administrador Cmte. Malta redefinida!');
    }
  };

  const totalAdmins = usuarios.filter(u => u.isAdmin).length;
  const totalPersonalizados = usuarios.filter(u => !u.isAdmin).length;
  const totalAtivos = usuarios.filter(u => u.ativo).length;

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-amber-500 to-emerald-950" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Segurança & RBAC
                </span>
                <span className="text-xs text-stone-500">G.E.T. 22 de Fevereiro</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 font-serif">
                Gestão de Usuários & Controle de Acesso
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                Cadastre chefes, dirigentes e voluntários, determinando com precisão a quais áreas e módulos do sistema cada um pode ter acesso.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRestaurarPadroes}
              className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Garantir acesso do Administrador Geral Cmte. Malta"
            >
              <RotateCcw className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Garantir Admin Geral</span>
            </button>

            <button
              onClick={abrirModalNovo}
              className="px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 border border-emerald-800"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-[11px] text-stone-500 font-medium">Total de Contas</span>
            <p className="text-xl font-black text-stone-900 mt-0.5">{usuarios.length}</p>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/60">
            <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-600" /> Administradores
            </span>
            <p className="text-xl font-black text-emerald-950 mt-0.5">{totalAdmins}</p>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60">
            <span className="text-[11px] text-amber-800 font-medium">Acesso Personalizado</span>
            <p className="text-xl font-black text-amber-950 mt-0.5">{totalPersonalizados}</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-[11px] text-stone-500 font-medium">Contas Ativas</span>
            <p className="text-xl font-black text-stone-900 mt-0.5">{totalAtivos}</p>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-900" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Usuários Autorizados no Sistema ({usuarios.length})
            </h2>
          </div>
          <span className="text-xs text-stone-500 hidden sm:inline">
            Clique em "Editar" para alterar senhas ou permissões
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {usuarios.map(u => {
            const isLogado = usuarioAtual && usuarioAtual.id === u.id;

            return (
              <div 
                key={u.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/70 transition"
              >
                {/* Info do usuário */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-sm ${
                    u.isAdmin 
                      ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white' 
                      : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {u.isAdmin ? <Crown className="w-6 h-6 text-white" /> : u.nome.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-base">{u.nome}</h3>
                      
                      {isLogado && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          Sua Sessão Atual
                        </span>
                      )}

                      {u.isAdmin ? (
                        <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-700" /> Administrador Completo
                        </span>
                      ) : (
                        <span className="text-[11px] bg-stone-100 text-stone-700 font-semibold px-2.5 py-0.5 rounded-full border border-stone-200">
                          Acesso Restrito ({u.permissoes ? u.permissoes.length : 0} módulos)
                        </span>
                      )}

                      {!u.ativo && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-300">
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1 font-mono font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                        <User className="w-3 h-3 text-stone-400" /> Login: <strong>{u.login}</strong>
                      </span>
                      <span>Cargo: <strong className="text-stone-700">{u.cargo}</strong></span>
                      {u.ultimoAcesso && (
                        <span className="flex items-center gap-1 text-stone-400 text-[11px]">
                          <Clock className="w-3 h-3" /> Último acesso: {new Date(u.ultimoAcesso).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    {/* Badges de permissões ativas */}
                    <div className="pt-2">
                      {u.isAdmin ? (
                        <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Possui acesso irrestrito a todos os módulos, cadastros, relatórios e permissões.</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {u.permissoes && u.permissoes.map(pId => {
                            const info = LISTA_PERMISSOES.find(item => item.id === pId);
                            return (
                              <span 
                                key={pId}
                                className="text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2 py-0.5 rounded-md font-medium"
                              >
                                {info ? info.nome : pId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => abrirModalEditar(u)}
                    className="p-2.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl border border-stone-200 bg-stone-50 hover:bg-white text-stone-700 hover:border-emerald-600 transition flex items-center gap-1.5 shadow-sm"
                    title="Editar informações e permissões"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-800" />
                    <span className="hidden sm:inline">Editar & Permissões</span>
                  </button>

                  <button
                    onClick={() => handleExcluir(u)}
                    disabled={isLogado || (u.isAdmin && totalAdmins <= 1)}
                    className={`p-2.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                      isLogado || (u.isAdmin && totalAdmins <= 1)
                        ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
                        : 'border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 text-rose-700 shadow-sm'
                    }`}
                    title={
                      isLogado 
                        ? 'Você não pode excluir sua própria conta conectada' 
                        : (u.isAdmin && totalAdmins <= 1)
                        ? 'Não é possível remover o único administrador ativo'
                        : 'Excluir usuário'
                    }
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE USUÁRIO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden my-6 animate-scale-up">
            
            {/* Topo do modal */}
            <div className="bg-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {usuarioEmEdicao ? `Editar Usuário: ${usuarioEmEdicao.nome}` : 'Cadastrar Novo Usuário'}
                  </h2>
                  <p className="text-xs text-emerald-200/80">
                    Defina os dados de login e marque quais módulos o usuário poderá acessar.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalAberto(false)}
                className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvar} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {erroForm && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{erroForm}</span>
                </div>
              )}

              {/* Informações Básicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Akela Carlos Silva"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Cargo / Função no Grupo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chefe de Tropa, Tesoureiro, Secretaria"
                    value={cargo}
                    onChange={e => setCargo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Login / Usuário de Acesso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: chefecarlos ou carlos@email.com"
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Nome curto ou e-mail que o usuário usará para entrar.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 3 caracteres"
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 transition"
                      title={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status da Conta */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-800">Conta Ativa</span>
                  <p className="text-[11px] text-stone-500">Se desmarcado, o usuário não conseguirá fazer login.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={e => setAtivo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
                </label>
              </div>

              {/* TIPO DE ACESSO: ADMINISTRADOR OU PERSONALIZADO */}
              <div className="pt-2 border-t border-stone-200">
                <div 
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                    isAdmin 
                      ? 'bg-amber-50/70 border-amber-500 text-amber-950 shadow-sm' 
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                    isAdmin ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                  }`}>
                    {isAdmin ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <h4 className="text-sm font-bold text-stone-900">
                        Administrador Completo (Acesso Total)
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Concede permissão total para todas as áreas: Dashboard, Novos Cadastros, Lista de Membros, Financeiro, Eventos, Fardamento, Backup do Banco e inclusive esta <strong>Gestão de Usuários</strong>.
                    </p>
                  </div>
                </div>

                {/* SELEÇÃO INDIVIDUAL DE PERMISSÕES */}
                {!isAdmin && (
                  <div className="mt-4 space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-emerald-800" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                          Selecione o que este usuário pode acessar ({permissoesSelecionadas.length}/{LISTA_PERMISSOES.length})
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={selecionarTodasPermissoes}
                          className="text-emerald-800 hover:text-emerald-950 font-semibold underline"
                        >
                          Marcar todas
                        </button>
                        <span className="text-stone-300">•</span>
                        <button
                          type="button"
                          onClick={limparTodasPermissoes}
                          className="text-stone-500 hover:text-stone-800 font-semibold underline"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {LISTA_PERMISSOES.map(item => {
                        const selecionada = permissoesSelecionadas.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => togglePermissao(item.id)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-2.5 ${
                              selecionada 
                                ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 shadow-xs' 
                                : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                              selecionada ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-stone-300 bg-white'
                            }`}>
                              {selecionada && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight truncate">{item.nome}</p>
                              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug line-clamp-2">
                                {item.descricao}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs sm:text-sm font-semibold transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 border border-emerald-800"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{usuarioEmEdicao ? 'Salvar Alterações' : 'Criar Usuário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
