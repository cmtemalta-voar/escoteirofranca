import React, { useMemo, useState } from 'react';
import { EscoteiroCadastro, identificarRamo } from '../types/scout';
import { 
  obterSecaoPorRamo, 
  calcularInfoAniversario, 
  InfoAniversariante, 
  MESES_NOMES 
} from '../types/management';
import { 
  Cake, 
  Calendar, 
  Sparkles, 
  Clock, 
  PartyPopper, 
  ChevronRight, 
  Filter, 
  CheckCircle,
  Users
} from 'lucide-react';

interface AniversariantesCardProps {
  escoteiros: EscoteiroCadastro[];
  onSelectEscoteiro?: (escoteiro: EscoteiroCadastro) => void;
  onOpenDirigenteDossier?: (escoteiro: EscoteiroCadastro) => void;
}

export const AniversariantesCard: React.FC<AniversariantesCardProps> = ({
  escoteiros,
  onSelectEscoteiro,
  onOpenDirigenteDossier,
}) => {
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todos_proximos' | 'mes_atual' | 'semana' | 'todos_meses'>('todos_proximos');
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);

  const hoje = new Date();
  const mesAtualNum = hoje.getMonth() + 1;

  // Processa todos os aniversariantes
  const listaAniversarios = useMemo(() => {
    const list: InfoAniversariante[] = [];
    escoteiros.forEach(esc => {
      const secao = obterSecaoPorRamo(identificarRamo(new Date().getFullYear() - parseInt(esc.dataNascimento.split('-')[0] || '2015', 10)));
      const info = calcularInfoAniversario(esc.id, esc.nomeCompleto, secao, esc.dataNascimento, hoje);
      if (info) {
        list.push(info);
      }
    });

    // Ordena por dias restantes
    return list.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [escoteiros]);

  // Contagens rápidas
  const contadores = useMemo(() => {
    let hojeCount = 0;
    let amanhaCount = 0;
    let semanaCount = 0;
    let mesAtualCount = 0;

    listaAniversarios.forEach(item => {
      if (item.categoria === 'hoje') hojeCount++;
      if (item.categoria === 'amanha') amanhaCount++;
      if (item.diasRestantes <= 7) semanaCount++;
      if (item.mesAniversario === mesAtualNum) mesAtualCount++;
    });

    return { hojeCount, amanhaCount, semanaCount, mesAtualCount };
  }, [listaAniversarios, mesAtualNum]);

  // Filtragem conforme a seleção do usuário
  const aniversariantesFiltrados = useMemo(() => {
    if (filtroPeriodo === 'mes_atual') {
      return listaAniversarios
        .filter(item => item.mesAniversario === mesAtualNum)
        .sort((a, b) => a.diaAniversario - b.diaAniversario);
    }
    if (filtroPeriodo === 'semana') {
      return listaAniversarios.filter(item => item.diasRestantes <= 7);
    }
    if (filtroPeriodo === 'todos_meses') {
      return listaAniversarios
        .filter(item => item.mesAniversario === mesSelecionado)
        .sort((a, b) => a.diaAniversario - b.diaAniversario);
    }
    // 'todos_proximos': próximos 60 dias
    return listaAniversarios.filter(item => item.diasRestantes <= 60);
  }, [listaAniversarios, filtroPeriodo, mesAtualNum, mesSelecionado]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner shrink-0">
            <Cake className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg tracking-tight font-serif">
                🎂 Aniversariantes do Grupo
              </h3>
              {contadores.hojeCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full animate-bounce">
                  {contadores.hojeCount} Hoje!
                </span>
              )}
            </div>
            <p className="text-xs text-amber-100">
              Comemoração tradicional: último sábado do mês no G.E.T. 22 de Fevereiro
            </p>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setFiltroPeriodo('todos_proximos')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filtroPeriodo === 'todos_proximos'
                ? 'bg-white text-amber-950 shadow-xs font-bold'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            Próximos 60 dias ({listaAniversarios.filter(i => i.diasRestantes <= 60).length})
          </button>
          <button
            onClick={() => setFiltroPeriodo('mes_atual')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filtroPeriodo === 'mes_atual'
                ? 'bg-white text-amber-950 shadow-xs font-bold'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            Mês Atual ({contadores.mesAtualCount})
          </button>
          <button
            onClick={() => setFiltroPeriodo('semana')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filtroPeriodo === 'semana'
                ? 'bg-white text-amber-950 shadow-xs font-bold'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            Nesta Semana ({contadores.semanaCount})
          </button>
          <button
            onClick={() => setFiltroPeriodo('todos_meses')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filtroPeriodo === 'todos_meses'
                ? 'bg-white text-amber-950 shadow-xs font-bold'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            Por Mês
          </button>
        </div>
      </div>

      {/* Sub-selector for specific month */}
      {filtroPeriodo === 'todos_meses' && (
        <div className="bg-amber-50/70 border-b border-amber-100 p-3 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <span className="font-semibold text-amber-900 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-700" />
            Escolher Mês:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {MESES_NOMES.map((nome, idx) => {
              const mesNum = idx + 1;
              const ehAtual = mesNum === mesAtualNum;
              const selecionado = mesNum === mesSelecionado;
              const qtd = listaAniversarios.filter(i => i.mesAniversario === mesNum).length;
              return (
                <button
                  key={nome}
                  onClick={() => setMesSelecionado(mesNum)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                    selecionado
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {nome.slice(0, 3)} {ehAtual && '•'} ({qtd})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      <div className="p-4 sm:p-5">
        {aniversariantesFiltrados.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs sm:text-sm">
            Nenhum aniversariante encontrado para o período selecionado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aniversariantesFiltrados.map(item => {
              const escoteiroOriginal = escoteiros.find(e => e.id === item.escoteiroId);

              // Badge styling by proximity
              let badgeColor = 'bg-stone-100 text-stone-700 border-stone-200';
              let badgeText = `${item.diasRestantes} dias restantes`;
              let isSpecialAlert = false;

              if (item.categoria === 'hoje') {
                badgeColor = 'bg-rose-500 text-white font-bold border-rose-600 animate-pulse';
                badgeText = 'HOJE! 🎂 PARABÉNS!';
                isSpecialAlert = true;
              } else if (item.categoria === 'amanha') {
                badgeColor = 'bg-amber-500 text-amber-950 font-bold border-amber-600';
                badgeText = 'Amanhã!';
                isSpecialAlert = true;
              } else if (item.categoria === 'semana') {
                badgeColor = 'bg-emerald-100 text-emerald-900 font-semibold border-emerald-300';
                badgeText = `Em ${item.diasRestantes} dias (Nesta semana)`;
              }

              return (
                <div
                  key={item.escoteiroId}
                  className={`p-3.5 rounded-xl border transition-all hover:shadow-md flex flex-col justify-between gap-2.5 ${
                    isSpecialAlert 
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/40' 
                      : 'bg-stone-50/60 border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 text-sm truncate">
                          {item.nome}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                          {item.secao}
                        </span>
                        <span>•</span>
                        <span>{item.idadeAtual} anos</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {item.proximoAniversarioFormatado}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] border ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        (fará {item.idadeCompletar} anos)
                      </span>
                    </div>

                    {escoteiroOriginal && (
                      <div className="flex items-center gap-1">
                        {onOpenDirigenteDossier && (
                          <button
                            type="button"
                            onClick={() => onOpenDirigenteDossier(escoteiroOriginal)}
                            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                            title="Ver Ficha 360° do Associado"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        )}
                        {onSelectEscoteiro && (
                          <button
                            type="button"
                            onClick={() => onSelectEscoteiro(escoteiroOriginal)}
                            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors"
                            title="Ver Ficha Oficial de Impressão"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
