import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  LogIn, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  LogOut,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { ScoutLogo } from './ScoutLogo';

interface HomeViewProps {
  onNovoCadastro: () => void;
  onLoginSuccess: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNovoCadastro, onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erroLogin, setErroLogin] = useState('');
  const [sucessoLogin, setSucessoLogin] = useState(false);
  
  // Verifica se já está autenticado no localStorage
  const [isAutenticado, setIsAutenticado] = useState<boolean>(() => {
    try {
      return localStorage.getItem('get_22_auth_session') === 'true';
    } catch {
      return false;
    }
  });

  const [usuarioLogado, setUsuarioLogado] = useState<string>(() => {
    try {
      return localStorage.getItem('get_22_auth_user') || 'Dirigente Geral';
    } catch {
      return 'Dirigente Geral';
    }
  });

  useEffect(() => {
    if (isAutenticado) {
      setSucessoLogin(false);
    }
  }, [isAutenticado]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin('');

    if (!usuario.trim()) {
      setErroLogin('Por favor, informe o usuário ou e-mail de acesso.');
      return;
    }

    if (!senha.trim()) {
      setErroLogin('Por favor, digite sua senha de acesso.');
      return;
    }

    // Validação flexível e amigável para dirigentes e chefia
    // Aceita qualquer senha com mais de 2 dígitos ou as senhas padrão: 'semprealerta', 'admin', '123456'
    if (senha.length < 3) {
      setErroLogin('A senha deve conter ao menos 3 caracteres.');
      return;
    }

    const nomeFormatado = usuario.trim().toLowerCase().includes('admin') 
      ? 'Dirigente Geral (Administrador)' 
      : usuario.trim();

    try {
      if (lembrar) {
        localStorage.setItem('get_22_auth_session', 'true');
        localStorage.setItem('get_22_auth_user', nomeFormatado);
      }
    } catch (err) {
      console.warn('Erro ao salvar sessão local:', err);
    }

    setIsAutenticado(true);
    setUsuarioLogado(nomeFormatado);
    setSucessoLogin(true);

    setTimeout(() => {
      onLoginSuccess();
    }, 800);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('get_22_auth_session');
      localStorage.removeItem('get_22_auth_user');
    } catch (err) {
      console.warn('Erro ao remover sessão:', err);
    }
    setIsAutenticado(false);
    setUsuario('');
    setSenha('');
    setSucessoLogin(false);
  };

  const preencherAcessoRapido = () => {
    setUsuario('chefia@22fevereiro.org');
    setSenha('semprealerta');
    setErroLogin('');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-12 px-4 flex flex-col items-center justify-center min-h-[75vh]">
      
      {/* 1. LOGO DO ESCOTEIRO COM IDENTIDADE VISUAL */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative group mb-4">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
          <div className="relative p-2 bg-white rounded-full shadow-xl border-4 border-emerald-900/20">
            <ScoutLogo className="w-28 h-28 sm:w-36 sm:h-36" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 font-serif tracking-tight">
          G.E.T. <span className="text-4xl sm:text-5xl md:text-6xl font-black inline-block px-1">22</span> de Fevereiro
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
          Grupo Escoteiro Tradicional 22 de Fevereiro — Franca/SP
        </p>
      </div>

      {/* 2. CARD PRINCIPAL: LOGIN DE ACESSO OU STATUS CONECTADO */}
      <div className="w-full bg-white rounded-3xl shadow-xl shadow-stone-200/60 border border-stone-200/80 p-6 sm:p-8 mb-6 relative overflow-hidden">
        
        {/* Barra superior com detalhes em tons escoteiros */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-800 via-amber-500 to-emerald-900" />

        {isAutenticado ? (
          /* Sessão Ativa / Conectado */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Acesso Autenticado
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-2">
                Bem-vindo(a), {usuarioLogado}!
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Sua credencial de chefia/dirigente está ativa no sistema.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={onLoginSuccess}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-850 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Acessar Painel de Gestão</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4 text-stone-500" />
                <span>Desconectar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Login de Acesso */
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 mb-2 border border-amber-400/30">
                <LogIn className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-emerald-950 font-serif">
                Login de Acesso
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Área reservada para Dirigentes, Chefia e Administração do Grupo
              </p>
            </div>

            {erroLogin && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                <span>{erroLogin}</span>
              </div>
            )}

            {sucessoLogin && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Autenticação autorizada! Abrindo painel...</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Usuário ou E-mail da Chefia
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Ex: chefia ou dirigente@22fevereiro.org"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 text-stone-800 text-sm transition outline-none"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha de acesso"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 text-stone-800 text-sm transition outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                    title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-700 w-3.5 h-3.5"
                  />
                  <span>Lembrar meu acesso</span>
                </label>

                <button
                  type="button"
                  onClick={preencherAcessoRapido}
                  className="text-emerald-800 hover:text-emerald-950 font-semibold hover:underline flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3 text-amber-500" />
                  <span>Acesso Rápido Chefia</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-900 hover:bg-emerald-950 active:bg-emerald-950 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Entrar no Sistema</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. BOTÃO "NOVO CADASTRO" (DESTACADO E DE ACESSO DIRETO) */}
      <div className="w-full">
        <button
          type="button"
          onClick={onNovoCadastro}
          className="w-full group relative overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-600 text-emerald-950 rounded-3xl shadow-xl shadow-amber-500/25 border-2 border-amber-300 flex items-center justify-between transition-all duration-200 active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-black uppercase tracking-tight text-emerald-950">
                  Novo Cadastro
                </span>
                <span className="bg-emerald-950 text-amber-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  Ficha Oficial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950/80 font-medium mt-0.5">
                Clique aqui para preencher nova inscrição escoteira
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-emerald-950/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5 text-emerald-950 stroke-[3]" />
          </div>
        </button>

        <p className="text-center text-[11px] text-stone-500 mt-3 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Inscrição aberta para Alcateia, Tropa Escoteira, Tropa Sênior e Clã Pioneiro</span>
        </p>
      </div>

    </div>
  );
};
