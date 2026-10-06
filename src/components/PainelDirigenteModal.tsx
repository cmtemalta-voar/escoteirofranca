import React, { useMemo } from 'react';
import { EscoteiroCadastro, calcularIdade, identificarRamo, formatarDataBR, formatarTelefone, formatarCPF } from '../types/scout';
import { 
  ContribuicaoMensal, 
  FiliacaoAnual, 
  EventoEscoteiro, 
  ParticipacaoEvento, 
  RegistroUniformeMaterial,
  obterSecaoPorRamo,
  calcularInfoAniversario,
  MESES_NOMES
} from '../types/management';
import { 
  X, 
  Printer, 
  User, 
  HeartPulse, 
  DollarSign, 
  Tent, 
  Shirt, 
  Cake, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Mail,
  Calendar,
  Sparkles,
  Edit3
} from 'lucide-react';

interface PainelDirigenteModalProps {
  escoteiro: EscoteiroCadastro | null;
  isOpen: boolean;
  onClose: () => void;
  contribuicoes: ContribuicaoMensal[];
  filiacoes: FiliacaoAnual[];
  eventos: EventoEscoteiro[];
  participacoes: ParticipacaoEvento[];
  uniformes: RegistroUniformeMaterial[];
  onImprimirOficial?: (escoteiro: EscoteiroCadastro) => void;
  onEditarCadastro?: (escoteiro: EscoteiroCadastro) => void;
}

export const PainelDirigenteModal: React.FC<PainelDirigenteModalProps> = ({
  escoteiro,
  isOpen,
  onClose,
  contribuicoes,
  filiacoes,
  eventos,
  participacoes,
  uniformes,
  onImprimirOficial,
  onEditarCadastro,
}) => {
  if (!isOpen || !escoteiro) return null;

  const idade = calcularIdade(escoteiro.dataNascimento);
  const ramo = identificarRamo(idade);
  const secao = obterSecaoPorRamo(ramo);
  const infoAniv = calcularInfoAniversario(escoteiro.id, escoteiro.nomeCompleto, secao, escoteiro.dataNascimento);

  // Filtros de dados vinculados ao associado
  const contrDoJovem = useMemo(() => {
    return contribuicoes.filter(c => c.escoteiroId === escoteiro.id);
  }, [contribuicoes, escoteiro.id]);

  const filiacoesDoJovem = useMemo(() => {
    return filiacoes.filter(f => f.escoteiroId === escoteiro.id);
  }, [filiacoes, escoteiro.id]);

  const partDoJovem = useMemo(() => {
    return participacoes.filter(p => p.escoteiroId === escoteiro.id);
  }, [participacoes, escoteiro.id]);

  const uniformesDoJovem = useMemo(() => {
    return uniformes.filter(u => u.escoteiroId === escoteiro.id);
  }, [uniformes, escoteiro.id]);

  // Balanço Financeiro Geral do Jovem
  const balancoFinanceiro = useMemo(() => {
    let totalPago = 0;
    let totalPendente = 0;

    // Mensalidades
    contrDoJovem.forEach(c => {
      if (c.status === 'Pago') totalPago += c.valor;
      else if (c.status !== 'Isento') totalPendente += c.valor;
    });

    // Filiações
    filiacoesDoJovem.forEach(f => {
      if (f.status === 'Pago') totalPago += f.valor;
      else if (f.status !== 'Isento') totalPendente += f.valor;
    });

    // Eventos
    partDoJovem.forEach(p => {
      totalPago += p.valorPago;
      if (p.statusFinanceiro !== 'Isento') {
        totalPendente += Math.max(0, p.valorCobrado - p.valorPago);
      }
    });

    // Uniformes
    uniformesDoJovem.forEach(u => {
      totalPago += u.valorPago;
      if (u.statusPagamento !== 'Cortesia / Isento') {
        totalPendente += Math.max(0, u.valor - u.valorPago);
      }
    });

    return { totalPago, totalPendente };
  }, [contrDoJovem, filiacoesDoJovem, partDoJovem, uniformesDoJovem]);

  // Filiação 2026 do jovem
  const filiacao2026 = filiacoesDoJovem.find(f => f.ano === 2026);
  // Contribuição do mês atual (10/2026)
  const mesAtual = new Date().getMonth() + 1;
  const contrMesAtual = contrDoJovem.find(c => c.competenciaMes === mesAtual && c.competenciaAno === 2026);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-stone-50 w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header do Dossiê */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-emerald-950 flex items-center justify-center font-bold text-xl shadow-md font-serif shrink-0">
              {escoteiro.nomeCompleto.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  Ficha 360° do Associado
                </span>
                <span className="text-emerald-300 text-xs font-semibold">
                  {secao}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold font-serif tracking-tight mt-0.5">
                {escoteiro.nomeCompleto}
              </h2>
              <div className="text-xs text-emerald-200/90 flex flex-wrap items-center gap-2 mt-0.5">
                <span>Nasc: {formatarDataBR(escoteiro.dataNascimento)} ({idade} anos)</span>
                <span>•</span>
                <span>Registro GET: #{escoteiro.fichaMedica.numeroRegistro || 'S/N'}</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">
                  {filiacao2026?.status === 'Pago' ? 'Filiação 2026 Regular' : 'Filiação 2026 Pendente'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {onImprimirOficial && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onImprimirOficial(escoteiro);
                }}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600 transition-colors flex items-center gap-1.5 shadow-xs"
                title="Imprimir Ficha Oficial de Inscrição em PDF"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Imprimir Ficha Oficial (4 Págs)</span>
              </button>
            )}

            {onEditarCadastro && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditarCadastro(escoteiro);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                title="Editar dados cadastrais"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
                <span>Editar</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Resumo Executivo em 6 Seções */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-stone-800">
          
          {/* Quick Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Mensalidade Atual</span>
              <div className="mt-1 flex items-center gap-1.5">
                {contrMesAtual?.status === 'Pago' ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paga ({MESES_NOMES[mesAtual - 1]})
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pendente ({MESES_NOMES[mesAtual - 1]})
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Filiação Anual 2026</span>
              <div className="mt-1">
                {filiacao2026?.status === 'Pago' ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Quitada (R$ 160)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Pendente
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Saldo Pendente Total</span>
              <div className="text-sm font-extrabold text-stone-900 mt-1">
                {balancoFinanceiro.totalPendente > 0 ? (
                  <span className="text-amber-600">R$ {balancoFinanceiro.totalPendente.toFixed(2)}</span>
                ) : (
                  <span className="text-emerald-700">Tudo em dia</span>
                )}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">🎂 Próximo Aniversário</span>
              <div className="text-xs font-bold text-amber-700 mt-1 flex items-center gap-1">
                <Cake className="w-3.5 h-3.5" />
                <span>{infoAniv ? `${infoAniv.proximoAniversarioFormatado} (${infoAniv.diasRestantes}d)` : '-'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. DADOS PESSOAIS & FAMÍLIA */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2 text-stone-900 font-bold text-sm font-serif">
                <User className="w-4 h-4 text-emerald-800" />
                <span>1. Dados Pessoais & Família</span>
              </div>

              <div className="text-xs space-y-2 text-stone-700">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Sexo / Estado Civil</span>
                    <span className="font-medium text-stone-900">{escoteiro.sexo === 'M' ? 'Masculino' : 'Feminino'} • {escoteiro.estadoCivil}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">CPF / RG</span>
                    <span className="font-mono">{escoteiro.cpf || '-'} • {escoteiro.rg || '-'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Endereço em Franca/SP</span>
                  <span className="font-medium">{escoteiro.endereco}, nº {escoteiro.numero} {escoteiro.complemento ? `(${escoteiro.complemento})` : ''} — Bairro: {escoteiro.bairro} — CEP {escoteiro.cep}</span>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">1º Responsável Legal</span>
                  <div className="font-bold text-stone-900 text-xs mt-0.5">
                    {escoteiro.primeiroResponsavel.nomeCompleto} ({escoteiro.primeiroResponsavel.grauParentesco})
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-600 mt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-emerald-700" />
                      {escoteiro.primeiroResponsavel.telefone1}
                    </span>
                    {escoteiro.primeiroResponsavel.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        {escoteiro.primeiroResponsavel.email}
                      </span>
                    )}
                  </div>
                </div>

                {escoteiro.temSegundoResponsavel && escoteiro.segundoResponsavel && (
                  <div className="pt-1.5">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">2º Responsável Legal</span>
                    <div className="font-medium text-stone-800 text-xs">
                      {escoteiro.segundoResponsavel.nomeCompleto} ({escoteiro.segundoResponsavel.grauParentesco}) • {escoteiro.segundoResponsavel.telefone1}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. DOCUMENTAÇÃO & FICHA MÉDICA */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2 text-stone-900 font-bold text-sm font-serif">
                <HeartPulse className="w-4 h-4 text-rose-700" />
                <span>2. Documentação Médica & Segurança</span>
              </div>

              <div className="text-xs space-y-2.5 text-stone-700">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Tipo Sanguíneo</span>
                    <span className="font-extrabold text-sm text-rose-700">
                      {escoteiro.fichaMedica.tipoSanguineo} (Rh {escoteiro.fichaMedica.fatorRh})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Natação / Aptidão</span>
                    <span className="font-bold text-stone-900">
                      {escoteiro.fichaMedica.sabeNadar ? '🏊 Sabe Nadar' : '⚠️ Não Sabe Nadar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Plano de Saúde</span>
                    <span className="font-medium text-stone-800">
                      {escoteiro.fichaMedica.possuiPlanoSaude ? escoteiro.fichaMedica.planoOperadora : 'SUS'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">Alergias / Intolerâncias:</span>
                    <span className={escoteiro.fichaMedica.apresentaAlergia ? 'text-rose-700 font-bold' : 'text-stone-500'}>
                      {escoteiro.fichaMedica.apresentaAlergia ? 'SIM (Atenção)' : 'Nenhuma relatada'}
                    </span>
                  </div>
                  {escoteiro.fichaMedica.apresentaAlergia && (
                    <div className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {escoteiro.fichaMedica.alergiaMedicamentos && `Medicamentos: ${escoteiro.fichaMedica.alergiaMedicamentosDetalhes || 'Sim'}; `}
                      {escoteiro.fichaMedica.alergiaAlimentos && `Alimentos: ${escoteiro.fichaMedica.alergiaAlimentosDetalhes || 'Sim'}; `}
                      {escoteiro.fichaMedica.alergiaPicadaInsetos && `Picadas: ${escoteiro.fichaMedica.alergiaPicadaInsetosDetalhes || 'Sim'}; `}
                      {escoteiro.fichaMedica.alergiaOutras && `Outras: ${escoteiro.fichaMedica.alergiaOutrasDetalhes}; `}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-stone-800">Medicação Contínua:</span>
                    <span>{escoteiro.fichaMedica.medicamentoContinuo ? `Sim (${escoteiro.fichaMedica.medicamentosDetalhes})` : 'Não'}</span>
                  </div>

                  {escoteiro.fichaMedica.apresentaNeurodivergencia && (
                    <div className="pt-1 text-[11px] text-blue-900 bg-blue-50 p-2 rounded-lg">
                      <strong>Neurodivergência:</strong> {escoteiro.fichaMedica.autismoTea ? `TEA (${escoteiro.fichaMedica.autismoNivelSuporte}); ` : ''}{escoteiro.fichaMedica.tdah ? `TDAH (${escoteiro.fichaMedica.tdahPredominio})` : ''}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Autorização de Imagem: <strong>Concedida e arquivada</strong></span>
                  <span>Intervenção Médica: <strong>Autorizada</strong></span>
                </div>
              </div>
            </div>

            {/* 3. FINANCEIRO CONSOLIDADO */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm font-serif">
                  <DollarSign className="w-4 h-4 text-emerald-800" />
                  <span>3. Histórico Financeiro & Mensalidades</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  Total Pago: R$ {balancoFinanceiro.totalPago.toFixed(2)}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div className="font-semibold text-stone-700">Contribuições Mensais Recentes:</div>
                {contrDoJovem.length === 0 ? (
                  <div className="text-stone-400 text-[11px] py-2">Nenhuma contribuição lançada.</div>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {contrDoJovem.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 text-[11px]">
                        <div>
                          <span className="font-bold text-stone-900">{MESES_NOMES[c.competenciaMes - 1]}/{c.competenciaAno}</span>
                          <span className="text-stone-400 ml-1.5">• Venc: {c.dataVencimento.split('-').reverse().slice(0, 2).join('/')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">R$ {c.valor.toFixed(2)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'Pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span>Filiações Anuais:</span>
                  <span className="font-medium text-stone-800">
                    {filiacoesDoJovem.map(f => `${f.ano}: ${f.status}`).join(' | ') || 'Nenhuma registrada'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. PARTICIPAÇÃO ESCOTEIRA & EVENTOS */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2 text-stone-900 font-bold text-sm font-serif">
                <Tent className="w-4 h-4 text-emerald-800" />
                <span>4. Participação Escoteira & Acampamentos</span>
              </div>

              <div className="text-xs space-y-2">
                {partDoJovem.length === 0 ? (
                  <div className="text-stone-400 text-[11px] py-4 text-center">
                    Nenhuma participação em evento registrada ainda.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {partDoJovem.map(p => {
                      const evt = eventos.find(e => e.id === p.eventoId);
                      return (
                        <div key={p.id} className="p-2.5 bg-stone-50 rounded-xl flex items-start justify-between gap-2 text-[11px]">
                          <div>
                            <div className="font-bold text-stone-900">{evt?.nome || 'Evento'}</div>
                            <div className="text-stone-500">
                              {evt?.tipo} • {evt?.local} • {p.participou ? '✅ Participou' : '❌ Não compareceu'}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-stone-800">R$ {p.valorPago.toFixed(2)}</span>
                            <div className={`text-[10px] font-bold ${p.statusFinanceiro === 'Pago' ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {p.statusFinanceiro}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 5. UNIFORME & MATERIAIS */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2 text-stone-900 font-bold text-sm font-serif">
              <Shirt className="w-4 h-4 text-emerald-800" />
              <span>5. Enxoval de Uniforme & Materiais Entregues</span>
            </div>

            {uniformesDoJovem.length === 0 ? (
              <div className="text-stone-400 text-xs py-2">
                Nenhum item de uniforme ou material registrado para este associado.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {uniformesDoJovem.map(u => (
                  <div key={u.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs">
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-stone-900">{u.item}</div>
                      <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-stone-200 text-[10px]">
                        Tam: {u.tamanho}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      {u.origem} • Entregue em {u.dataEntrega.split('-').reverse().join('/')}
                    </div>
                    <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-stone-200/60 font-semibold text-[11px]">
                      <span>R$ {u.valorPago.toFixed(2)}</span>
                      <span className={u.statusPagamento === 'Pago' ? 'text-emerald-700' : 'text-amber-700'}>
                        {u.statusPagamento}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white p-4 sm:p-5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 text-center sm:text-left">
            Grupo Escoteiro Tradicional 22 de Fevereiro • Sede Franca/SP • Painel Executivo do Dirigente
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fechar Ficha 360°
          </button>
        </div>

      </div>
    </div>
  );
};
