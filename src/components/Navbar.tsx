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
  ChevronDown
} from 'lucide-react';
import { ScoutLogo } from './ScoutLogo';

export type TabType = 
  | 'home'
  | 'dashboard' 
  | 'novo' 
  | 'lista' 
  | 'financeiro' 
  | 'eventos' 
  | 'uniformes' 
  | 'impressao' 
  | 'database';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  totalCadastros: number;
  onNovoCadastro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  totalCadastros,
  onNovoCadastro,
}) => {
  const [menuMaisAberto, setMenuMaisAberto] = useState<boolean>(false);

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
            </nav>

            {/* Medium Devices Navigation (lg to xl) */}
            <nav className="hidden md:flex xl:hidden items-center gap-1 bg-emerald-900/40 p-1.5 rounded-xl border border-emerald-800/40 text-xs">
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'home' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'dashboard' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
              >
                Painel
              </button>
              <button
                onClick={() => setCurrentTab('lista')}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'lista' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
              >
                Associados ({totalCadastros})
              </button>
              <button
                onClick={() => setCurrentTab('financeiro')}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'financeiro' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
              >
                Financeiro
              </button>
              <button
                onClick={() => setCurrentTab('eventos')}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'eventos' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
              >
                Eventos
              </button>
              <button
                onClick={() => setCurrentTab('uniformes')}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'uniformes' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
              >
                Uniformes
              </button>
              <button
                onClick={() => setCurrentTab('impressao')}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${currentTab === 'impressao' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'}`}
              >
                Ficha PDF
              </button>
            </nav>

            {/* Top Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={onNovoCadastro}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
                <span className="hidden sm:inline">Nova Inscrição</span>
                <span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <div className="md:hidden print:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800/80 shadow-2xl safe-area-bottom">
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

          {/* 2. Dashboard */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
              currentTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-emerald-200/70 hover:text-emerald-100'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Painel</span>
          </button>

          {/* 3. Center Highlight: Novo Cadastro */}
          <button
            onClick={onNovoCadastro}
            className="flex flex-col items-center justify-center -translate-y-2 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-emerald-950 flex items-center justify-center shadow-lg shadow-amber-950/40 border-2 border-emerald-900 group-active:scale-90 transition-transform">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[9px] font-bold text-amber-300 mt-0.5">Novo</span>
          </button>

          {/* 4. Escoteiros */}
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

          {/* 5. Menu Mais */}
          <button
            onClick={() => setMenuMaisAberto(!menuMaisAberto)}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
              menuMaisAberto || ['financeiro', 'eventos', 'uniformes', 'impressao', 'database'].includes(currentTab)
                ? 'text-amber-400 font-bold'
                : 'text-emerald-200/70 hover:text-emerald-100'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Mais</span>
          </button>

        </div>
      </div>

      {/* Menu 'Mais' Flutuante para Mobile */}
      {menuMaisAberto && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setMenuMaisAberto(false)}
        >
          <div 
            className="bg-emerald-950 text-white rounded-t-3xl p-5 border-t border-emerald-800 space-y-3 pb-24 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
              <span className="font-bold text-sm font-serif">Outros Módulos do Sistema</span>
              <button 
                onClick={() => setMenuMaisAberto(false)}
                className="text-emerald-300 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};
