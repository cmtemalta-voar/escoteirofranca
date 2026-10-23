import React, { useState } from 'react';
import { 
  Home,
  BarChart3, 
  UserPlus, 
  Users, 
  Database,
  Printer,
  ShieldCheck,
  Plus,
  DollarSign,
  Tent,
  Shirt,
  Menu,
  X,
  ChevronDown,
  LogIn,
  LogOut,
  Crown,
  User,
  Sparkles
} from 'lucide-react';
import { ScoutLogo } from './ScoutLogo';
import { UsuarioSistema } from '../types/auth';

export type TabType = 
  | 'home'
  | 'dashboard' 
  | 'novo' 
  | 'lista' 
  | 'financeiro' 
  | 'eventos' 
  | 'uniformes' 
  | 'impressao' 
  | 'database'
  | 'usuarios';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  totalCadastros: number;
  onNovoCadastro: () => void;
  usuarioAtual: UsuarioSistema | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  totalCadastros,
  onNovoCadastro,
  usuarioAtual,
  onLogout,
}) => {
  const [menuMaisAberto, setMenuMaisAberto] = useState<boolean>(false);

  const temAcesso = (aba: TabType): boolean => {
    if (aba === 'home') return true;
    if (aba === 'novo') return true; // Ficha de inscrição aberta ao público e chefia
    if (!usuarioAtual) return false;
    if (usuarioAtual.isAdmin) return true;
    return usuarioAtual.permissoes ? usuarioAtual.permissoes.includes(aba as any) : false;
  };

  const isPublico = !usuarioAtual;

  return (
    <>
      {/* Top Header */}
      <header className="bg-emerald-950 text-white shadow-md border-b border-emerald-900/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo & Scout Identity */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0" 
              onClick={() => setCurrentTab('home')}
              title="Ir para a Home do Grupo Escoteiro"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 border-2 border-amber-400/80 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                <ScoutLogo className="w-full h-full" />
              </div>
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-amber-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> G.E.T. Franca/SP
                  </span>
                  <span className="text-emerald-400/40 text-xs hidden xs:inline">|</span>
                  <span className="text-[10px] sm:text-xs text-emerald-300 font-medium hidden xs:inline">Sempre Alerta</span>
                </div>
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white font-serif truncate">
                  22 de Fevereiro
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            {isPublico ? (
              /* MODO VISITANTE (SEM LOGIN): APENAS HOME E NOVA INSCRIÇÃO */
              <nav className="hidden md:flex items-center gap-2 bg-emerald-900/40 p-1.5 rounded-xl border border-emerald-800/40 text-xs sm:text-sm">
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                    currentTab === 'home'
                      ? 'bg-emerald-800 text-white shadow-xs font-bold'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                  }`}
                >
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>Início / Home</span>
                </button>

                <button
                  onClick={onNovoCadastro}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                    currentTab === 'novo'
                      ? 'bg-emerald-800 text-white shadow-xs font-bold'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Ficha de Inscrição</span>
                </button>
              </nav>
            ) : (
              /* MODO AUTENTICADO: NAVEGAÇÃO COMPLETA DE ACORDO COM AS PERMISSÕES */
              <nav className="hidden xl:flex items-center gap-1 bg-emerald-900/40 p-1.5 rounded-xl border border-emerald-800/40 text-xs sm:text-sm">
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    currentTab === 'home'
                      ? 'bg-emerald-800 text-white shadow-xs font-bold'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                  }`}
                >
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>Home</span>
                </button>

                {temAcesso('dashboard') && (
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentTab === 'dashboard'
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>Painel</span>
                  </button>
                )}

                {temAcesso('lista') && (
                  <button
                    onClick={() => setCurrentTab('lista')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentTab === 'lista'
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Associados</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-700/50">
                      {totalCadastros}
                    </span>
                  </button>
                )}

                {temAcesso('financeiro') && (
                  <button
                    onClick={() => setCurrentTab('financeiro')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentTab === 'financeiro'
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Financeiro</span>
                  </button>
                )}

                {temAcesso('eventos') && (
                  <button
                    onClick={() => setCurrentTab('eventos')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentTab === 'eventos'
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                    }`}
                  >
                    <Tent className="w-4 h-4 text-emerald-300" />
                    <span>Eventos</span>
                  </button>
                )}

                {temAcesso('uniformes') && (
                  <button
                    onClick={() => setCurrentTab('uniformes')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentTab === 'uniformes'
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                    }`}
                  >
                    <Shirt className="w-4 h-4 text-emerald-300" />
                    <span>Uniformes</span>
                  </button>
                )}

                {temAcesso('impressao') && (
                  <button
                    onClick={() => setCurrentTab('impressao')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentTab === 'impressao'
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                    }`}
                  >
                    <Printer className="w-4 h-4 text-emerald-300" />
                    <span>Ficha Oficial</span>
                  </button>
                )}

                {temAcesso('database') && (
                  <button
                    onClick={() => setCurrentTab('database')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentTab === 'database'
                        ? 'bg-emerald-800 text-white shadow-xs font-bold'
                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                    }`}
                  >
                    <Database className="w-4 h-4 text-emerald-300" />
                    <span>Banco</span>
                  </button>
                )}

                {usuarioAtual.isAdmin && (
                  <button
                    onClick={() => setCurrentTab('usuarios')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      currentTab === 'usuarios'
                        ? 'bg-amber-500 text-emerald-950 font-black shadow-xs'
                        : 'text-amber-300 hover:text-white hover:bg-emerald-800/50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Usuários</span>
                  </button>
                )}
              </nav>
            )}

            {/* Medium Devices Navigation (lg to xl) para Autenticado */}
            {!isPublico && (
              <nav className="hidden md:flex xl:hidden items-center gap-1 bg-emerald-900/40 p-1.5 rounded-xl border border-emerald-800/40 text-xs">
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'home' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
                >
                  Home
                </button>
                {temAcesso('dashboard') && (
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'dashboard' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
                  >
                    Painel
                  </button>
                )}
                {temAcesso('lista') && (
                  <button
                    onClick={() => setCurrentTab('lista')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'lista' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
                  >
                    Associados ({totalCadastros})
                  </button>
                )}
                {temAcesso('financeiro') && (
                  <button
                    onClick={() => setCurrentTab('financeiro')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'financeiro' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
                  >
                    Financeiro
                  </button>
                )}
                {usuarioAtual.isAdmin && (
                  <button
                    onClick={() => setCurrentTab('usuarios')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold ${currentTab === 'usuarios' ? 'bg-amber-500 text-emerald-950' : 'text-amber-300'}`}
                  >
                    Usuários
                  </button>
                )}
              </nav>
            )}

            {/* Top Right Action & User Profile */}
            <div className="flex items-center gap-2">
              {isPublico ? (
                <>
                  <button
                    onClick={onNovoCadastro}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
                    <span>Nova Inscrição</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('home')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-emerald-700/60 transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Acesso Chefia</span>
                    <span className="sm:hidden">Entrar</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Badge do Usuário Logado */}
                  <div className="hidden sm:flex items-center gap-2 bg-emerald-900/70 border border-emerald-700/70 px-3 py-1.5 rounded-xl text-left">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      usuarioAtual.isAdmin ? 'bg-amber-500 text-emerald-950' : 'bg-emerald-800 text-emerald-200'
                    }`}>
                      {usuarioAtual.isAdmin ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 max-w-[130px] lg:max-w-[180px]">
                      <p className="text-xs font-bold text-white truncate leading-tight">{usuarioAtual.nome}</p>
                      <p className="text-[10px] text-emerald-300 truncate leading-tight">{usuarioAtual.cargo}</p>
                    </div>
                  </div>

                  <button
                    onClick={onNovoCadastro}
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Inscrição</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-2 sm:px-3 sm:py-2 bg-emerald-900/70 hover:bg-rose-900/80 text-emerald-200 hover:text-white border border-emerald-700/60 hover:border-rose-600 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
                    title="Desconectar do sistema"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <div className="md:hidden print:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800/80 shadow-2xl safe-area-bottom">
        {isPublico ? (
          /* Mobile Bar para Visitante */
          <div className="grid grid-cols-2 h-16 items-center px-4 gap-2">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center justify-center gap-2 h-11 rounded-xl transition-all ${
                currentTab === 'home' ? 'bg-emerald-900 text-amber-400 font-bold' : 'text-emerald-200/80 hover:bg-emerald-900/40'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-semibold">Início / Login</span>
            </button>

            <button
              onClick={onNovoCadastro}
              className="flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-amber-500 to-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-transform"
            >
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
              <span>Nova Inscrição</span>
            </button>
          </div>
        ) : (
          /* Mobile Bar para Usuário Autenticado */
          <div className="grid grid-cols-5 h-16 items-center px-1">
            {/* 1. Home */}
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
                currentTab === 'home' ? 'text-amber-400 font-bold' : 'text-emerald-200/70 hover:text-emerald-100'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Home</span>
            </button>

            {/* 2. Dashboard ou Usuários */}
            {temAcesso('dashboard') ? (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
                  currentTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-emerald-200/70 hover:text-emerald-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">Painel</span>
              </button>
            ) : (
              <div />
            )}

            {/* 3. Center Highlight: Inscrição */}
            <button
              onClick={onNovoCadastro}
              className="flex flex-col items-center justify-center -translate-y-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-emerald-950 flex items-center justify-center shadow-lg shadow-amber-950/40 border-2 border-emerald-900 group-active:scale-90 transition-transform">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-[9px] font-bold text-amber-300 mt-0.5">Novo</span>
            </button>

            {/* 4. Associados */}
            {temAcesso('lista') ? (
              <button
                onClick={() => setCurrentTab('lista')}
                className={`flex flex-col items-center justify-center h-full py-1 relative transition-all ${
                  currentTab === 'lista' ? 'text-amber-400 font-bold' : 'text-emerald-200/70 hover:text-emerald-100'
                }`}
              >
                <div className="relative">
                  <Users className="w-5 h-5 mb-0.5" />
                  {totalCadastros > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-emerald-950 text-[9px] font-black rounded-full px-1.5 py-0.2 shadow-xs">
                      {totalCadastros}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">Membros</span>
              </button>
            ) : (
              <div />
            )}

            {/* 5. Menu Mais */}
            <button
              onClick={() => setMenuMaisAberto(!menuMaisAberto)}
              className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
                menuMaisAberto || ['financeiro', 'eventos', 'uniformes', 'impressao', 'database', 'usuarios'].includes(currentTab)
                  ? 'text-amber-400 font-bold'
                  : 'text-emerald-200/70 hover:text-emerald-100'
              }`}
            >
              <Menu className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Mais</span>
            </button>
          </div>
        )}
      </div>

      {/* Menu 'Mais' Flutuante para Mobile no modo Autenticado */}
      {menuMaisAberto && !isPublico && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setMenuMaisAberto(false)}
        >
          <div 
            className="bg-emerald-950 text-white rounded-t-3xl p-5 border-t border-emerald-800 space-y-3 pb-24 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm font-serif">Módulos Disponíveis</span>
                <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-emerald-300 font-mono">
                  {usuarioAtual.cargo}
                </span>
              </div>
              <button 
                onClick={() => setMenuMaisAberto(false)}
                className="text-emerald-300 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {temAcesso('financeiro') && (
                <button
                  onClick={() => {
                    setCurrentTab('financeiro');
                    setMenuMaisAberto(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    currentTab === 'financeiro' ? 'bg-emerald-800 border-amber-400 font-bold' : 'bg-emerald-900/60 border-emerald-800'
                  }`}
                >
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">Controle Financeiro</span>
                  <span className="text-[10px] text-emerald-300">Mensalidades & Caixa</span>
                </button>
              )}

              {temAcesso('eventos') && (
                <button
                  onClick={() => {
                    setCurrentTab('eventos');
                    setMenuMaisAberto(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    currentTab === 'eventos' ? 'bg-emerald-800 border-amber-400 font-bold' : 'bg-emerald-900/60 border-emerald-800'
                  }`}
                >
                  <Tent className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">Eventos & Acampamentos</span>
                  <span className="text-[10px] text-emerald-300">Chamada e taxas</span>
                </button>
              )}

              {temAcesso('uniformes') && (
                <button
                  onClick={() => {
                    setCurrentTab('uniformes');
                    setMenuMaisAberto(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    currentTab === 'uniformes' ? 'bg-emerald-800 border-amber-400 font-bold' : 'bg-emerald-900/60 border-emerald-800'
                  }`}
                >
                  <Shirt className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">Uniformes & Materiais</span>
                  <span className="text-[10px] text-emerald-300">Tamanhos e peças</span>
                </button>
              )}

              {temAcesso('impressao') && (
                <button
                  onClick={() => {
                    setCurrentTab('impressao');
                    setMenuMaisAberto(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    currentTab === 'impressao' ? 'bg-emerald-800 border-amber-400 font-bold' : 'bg-emerald-900/60 border-emerald-800'
                  }`}
                >
                  <Printer className="w-5 h-5 text-emerald-300" />
                  <span className="text-xs font-bold">Ficha Oficial (PDF)</span>
                  <span className="text-[10px] text-emerald-300">Layout 4 páginas</span>
                </button>
              )}

              {temAcesso('database') && (
                <button
                  onClick={() => {
                    setCurrentTab('database');
                    setMenuMaisAberto(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    currentTab === 'database' ? 'bg-emerald-800 border-amber-400 font-bold' : 'bg-emerald-900/60 border-emerald-800'
                  }`}
                >
                  <Database className="w-5 h-5 text-emerald-300" />
                  <span className="text-xs font-bold">Banco de Dados</span>
                  <span className="text-[10px] text-emerald-300">Backup & Excel</span>
                </button>
              )}

              {usuarioAtual.isAdmin && (
                <button
                  onClick={() => {
                    setCurrentTab('usuarios');
                    setMenuMaisAberto(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    currentTab === 'usuarios' ? 'bg-amber-500 text-emerald-950 font-black border-amber-300' : 'bg-emerald-900/60 border-amber-400/50 text-amber-300'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">Usuários & Acesso</span>
                  <span className="text-[10px] opacity-80">Criar contas e regras</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between">
              <span className="text-xs text-emerald-300">Sessão: {usuarioAtual.nome}</span>
              <button
                onClick={() => {
                  setMenuMaisAberto(false);
                  onLogout();
                }}
                className="text-xs font-bold text-rose-300 hover:text-white flex items-center gap-1 p-1"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Desconectar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
