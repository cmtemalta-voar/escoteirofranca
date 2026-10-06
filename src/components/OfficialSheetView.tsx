import React from 'react';
import { 
  EscoteiroCadastro, 
  calcularIdade, 
  identificarRamo, 
  formatarDataBR 
} from '../types/scout';
import { ScoutLogo } from './ScoutLogo';
import { 
  Printer, 
  ChevronLeft, 
  FileText,
  UserCheck
} from 'lucide-react';

interface OfficialSheetViewProps {
  escoteiro: EscoteiroCadastro;
  todosEscoteiros: EscoteiroCadastro[];
  onSelectOutro: (e: EscoteiroCadastro) => void;
  onVoltar: () => void;
}

export const OfficialSheetView: React.FC<OfficialSheetViewProps> = ({
  escoteiro,
  todosEscoteiros,
  onSelectOutro,
  onVoltar,
}) => {
  const idade = calcularIdade(escoteiro.dataNascimento);
  const ramo = identificarRamo(idade);

  // Lista com o escoteiro atual garantido
  const listaEscoteiros = React.useMemo(() => {
    if (!escoteiro) return todosEscoteiros;
    if (!todosEscoteiros.some(e => e.id === escoteiro.id)) {
      return [escoteiro, ...todosEscoteiros];
    }
    return todosEscoteiros;
  }, [todosEscoteiros, escoteiro]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Erro ao disparar impressão:', e);
    }
  };

  // Checkbox format identical to document: ( ) or ( X )
  const cb = (checked: boolean, label: string) => (
    <span className="inline-flex items-center gap-1 mr-2 whitespace-nowrap">
      <span className="font-mono text-[11px] font-bold">{checked ? '( X )' : '(   )'}</span>
      <span>{label}</span>
    </span>
  );

  return (
    <div className="space-y-6 pb-16">
      
      {/* Print Control Toolbar - Hidden on print */}
      <div className="print:hidden bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-18 sm:top-24 z-30">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onVoltar}
            className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="text-[11px] text-stone-400 font-medium">Ficha Oficial Individual:</div>
            <div className="font-bold text-stone-900 text-xs sm:text-base flex items-center gap-1.5 truncate">
              <span className="truncate">{escoteiro.nomeCompleto}</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold shrink-0">
                {ramo} ({idade}a)
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={escoteiro.id}
            onChange={e => {
              const found = listaEscoteiros.find(x => x.id === e.target.value);
              if (found) onSelectOutro(found);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none"
          >
            {listaEscoteiros.map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.nomeCompleto} ({identificarRamo(calcularIdade(sc.dataNascimento))})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Imprimir Cadastro Individual</span>
          </button>
        </div>
      </div>

      {/* Mobile Hint - Hidden on Desktop and Print */}
      <div className="md:hidden print:hidden p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <Printer className="w-4 h-4 text-amber-700 shrink-0" />
        <span>Toque no botão <strong>Imprimir Cadastro</strong> acima para gerar o PDF ou enviar direto para a impressora.</span>
      </div>

      {/* DOCUMENT WRAPPER (Scrollable container on mobile to prevent table distortion) */}
      <div className="overflow-x-auto print:overflow-visible pb-4 print:pb-0">
        <div className="max-w-[210mm] min-w-[700px] md:min-w-0 mx-auto print:max-w-none print:min-w-0 print:w-full space-y-8 print:space-y-0 text-black font-sans text-[11px] leading-tight">
        
        {/* ========================================================================= */}
        {/* PÁGINA 1: FICHA DE INSCRIÇÃO INDIVIDUAL */}
        {/* ========================================================================= */}
        <section className="bg-white p-8 sm:p-12 print:p-0 rounded-2xl print:rounded-none border print:border-none border-stone-300 shadow-sm print:shadow-none print:break-after-page min-h-[297mm] flex flex-col justify-between">
          <div>
            
            {/* Header com Logo */}
            <div className="flex items-center justify-between pb-3 mb-2">
              <div className="w-16 h-16 flex items-center justify-center">
                <ScoutLogo className="w-16 h-16" />
              </div>
              <div className="flex-1 text-center pr-12">
                <h1 className="text-sm font-bold tracking-tight uppercase">
                  GRUPO ESCOTEIRO TRADICIONAL 22 DE FEVEREIRO – FRANCA/SP
                </h1>
                <h2 className="text-xs font-bold uppercase mt-1">
                  FICHA DE INSCRIÇÃO INDIVIDUAL
                </h2>
              </div>
            </div>

            {/* TABELA: DADOS DO INSCRITO */}
            <div className="border border-black divide-y divide-black text-[11px] mb-3">
              {/* Row 1: Nome Completo */}
              <div className="p-1.5 flex flex-col">
                <span className="text-[10px] text-stone-600 font-semibold">Nome Completo</span>
                <span className="font-bold text-[12px]">{escoteiro.nomeCompleto || ' '}</span>
              </div>

              {/* Row 2: Sexo, Data Nasc, Naturalidade, UF */}
              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-3 p-1.5">
                  <div className="text-[10px] text-stone-600">Sexo</div>
                  <div className="mt-0.5">{cb(escoteiro.sexo === 'M', 'M')} {cb(escoteiro.sexo === 'F', 'F')}</div>
                </div>
                <div className="col-span-3 p-1.5">
                  <div className="text-[10px] text-stone-600">Data de Nascimento</div>
                  <div className="font-semibold">{formatarDataBR(escoteiro.dataNascimento) || '______/______/__________'}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Naturalidade</div>
                  <div className="font-semibold">{escoteiro.naturalidade || 'Franca'}</div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div className="text-[10px] text-stone-600">UF</div>
                  <div className="font-semibold">{escoteiro.ufNaturalidade || 'SP'}</div>
                </div>
              </div>

              {/* Row 3: Estado Civil, RG, CPF */}
              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Estado Civil</div>
                  <div className="font-semibold">{escoteiro.estadoCivil || 'Solteiro(a)'}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Identidade (RG)</div>
                  <div className="font-semibold">{escoteiro.rg || ' '}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">CPF</div>
                  <div className="font-semibold">{escoteiro.cpf || ' '}</div>
                </div>
              </div>

              {/* Row 4: Endereço, Nº, Complemento */}
              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-7 p-1.5">
                  <div className="text-[10px] text-stone-600">Endereço</div>
                  <div className="font-semibold">{escoteiro.endereco || ' '}</div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div className="text-[10px] text-stone-600">Nº</div>
                  <div className="font-semibold">{escoteiro.numero || ' '}</div>
                </div>
                <div className="col-span-3 p-1.5">
                  <div className="text-[10px] text-stone-600">Complemento</div>
                  <div className="font-semibold">{escoteiro.complemento || ' '}</div>
                </div>
              </div>

              {/* Row 5: Bairro, Cidade, UF, CEP */}
              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-5 p-1.5">
                  <div className="text-[10px] text-stone-600">Bairro</div>
                  <div className="font-semibold">{escoteiro.bairro || ' '}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Cidade</div>
                  <div className="font-semibold">{escoteiro.cidade || 'Franca'}</div>
                </div>
                <div className="col-span-1 p-1.5 text-center">
                  <div className="text-[10px] text-stone-600">UF</div>
                  <div className="font-semibold">{escoteiro.uf || 'SP'}</div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div className="text-[10px] text-stone-600">CEP</div>
                  <div className="font-semibold">{escoteiro.cep || ' '}</div>
                </div>
              </div>

              {/* Row 6: Telefones */}
              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Telefone 1</div>
                  <div className="font-semibold">{escoteiro.telefone1 || '(   ) '}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Telefone 2</div>
                  <div className="font-semibold">{escoteiro.telefone2 || '(   ) '}</div>
                </div>
              </div>

              {/* Row 7: E-mail */}
              <div className="p-1.5">
                <div className="text-[10px] text-stone-600">E-mail</div>
                <div className="font-semibold">{escoteiro.email || ' '}</div>
              </div>

              {/* Row 8: Profissão, Escolaridade */}
              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Profissão</div>
                  <div className="font-semibold">{escoteiro.profissao || 'Estudante'}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Escolaridade</div>
                  <div className="font-semibold">{escoteiro.escolaridade || ' '}</div>
                </div>
              </div>

              {/* Row 9: Religião */}
              <div className="p-1.5">
                <div className="text-[10px] text-stone-600">Religião professada pelo jovem e pela família</div>
                <div className="font-semibold">{escoteiro.religiao || ' '}</div>
              </div>
            </div>

            {/* SUBTÍTULO: PRIMEIRO RESPONSÁVEL LEGAL */}
            <div className="font-bold text-[11px] mb-1">
              Primeiro Responsável Legal (preencher se o inscrito for menor de idade)
            </div>

            {/* TABELA: PRIMEIRO RESPONSÁVEL LEGAL */}
            <div className="border border-black divide-y divide-black text-[11px] mb-3">
              <div className="p-1.5 flex flex-col">
                <span className="text-[10px] text-stone-600">Nome Completo</span>
                <span className="font-bold text-[11.5px]">{escoteiro.primeiroResponsavel.nomeCompleto || ' '}</span>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-3 p-1.5">
                  <div className="text-[10px] text-stone-600">Sexo</div>
                  <div className="mt-0.5">{cb(escoteiro.primeiroResponsavel.sexo === 'M', 'M')} {cb(escoteiro.primeiroResponsavel.sexo === 'F', 'F')}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Data de Nascimento</div>
                  <div className="font-semibold">{formatarDataBR(escoteiro.primeiroResponsavel.dataNascimento) || '______/______/__________'}</div>
                </div>
                <div className="col-span-5 p-1.5">
                  <div className="text-[10px] text-stone-600">Estado Civil</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.estadoCivil || ' '}</div>
                </div>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Identidade (RG)</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.rg || ' '}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">CPF</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.cpf || ' '}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Grau de Parentesco</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.grauParentesco || ' '}</div>
                </div>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-7 p-1.5">
                  <div className="text-[10px] text-stone-600">Endereço</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.endereco || escoteiro.endereco}</div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div className="text-[10px] text-stone-600">Nº</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.numero || escoteiro.numero}</div>
                </div>
                <div className="col-span-3 p-1.5">
                  <div className="text-[10px] text-stone-600">Complemento</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.complemento || escoteiro.complemento}</div>
                </div>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-5 p-1.5">
                  <div className="text-[10px] text-stone-600">Bairro</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.bairro || escoteiro.bairro}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Cidade</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.cidade || escoteiro.cidade}</div>
                </div>
                <div className="col-span-1 p-1.5 text-center">
                  <div className="text-[10px] text-stone-600">UF</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.uf || escoteiro.uf}</div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div className="text-[10px] text-stone-600">CEP</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.cep || escoteiro.cep}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Telefone 1</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.telefone1 || '(   ) '}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Telefone 2</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.telefone2 || '(   ) '}</div>
                </div>
              </div>

              <div className="p-1.5">
                <div className="text-[10px] text-stone-600">E-mail</div>
                <div className="font-semibold">{escoteiro.primeiroResponsavel.email || ' '}</div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Profissão</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.profissao || ' '}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Escolaridade</div>
                  <div className="font-semibold">{escoteiro.primeiroResponsavel.escolaridade || ' '}</div>
                </div>
              </div>
            </div>

            {/* SUBTÍTULO: SEGUNDO RESPONSÁVEL LEGAL */}
            <div className="font-bold text-[11px] mb-1">
              Segundo Responsável Legal (preencher se o inscrito for menor de idade)
            </div>

            {/* TABELA: SEGUNDO RESPONSÁVEL LEGAL */}
            <div className="border border-black divide-y divide-black text-[11px] mb-3">
              <div className="p-1.5 flex flex-col">
                <span className="text-[10px] text-stone-600">Nome Completo</span>
                <span className="font-bold text-[11.5px]">{escoteiro.segundoResponsavel?.nomeCompleto || ' '}</span>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-3 p-1.5">
                  <div className="text-[10px] text-stone-600">Sexo</div>
                  <div className="mt-0.5">{cb(escoteiro.segundoResponsavel?.sexo === 'M', 'M')} {cb(escoteiro.segundoResponsavel?.sexo === 'F', 'F')}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Data de Nascimento</div>
                  <div className="font-semibold">{formatarDataBR(escoteiro.segundoResponsavel?.dataNascimento) || '______/______/__________'}</div>
                </div>
                <div className="col-span-5 p-1.5">
                  <div className="text-[10px] text-stone-600">Estado Civil</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.estadoCivil || ' '}</div>
                </div>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Identidade (RG)</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.rg || ' '}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">CPF</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.cpf || ' '}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Grau de Parentesco</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.grauParentesco || ' '}</div>
                </div>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-7 p-1.5">
                  <div className="text-[10px] text-stone-600">Endereço</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.endereco || ' '}</div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div className="text-[10px] text-stone-600">Nº</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.numero || ' '}</div>
                </div>
                <div className="col-span-3 p-1.5">
                  <div className="text-[10px] text-stone-600">Complemento</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.complemento || ' '}</div>
                </div>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-5 p-1.5">
                  <div className="text-[10px] text-stone-600">Bairro</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.bairro || ' '}</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div className="text-[10px] text-stone-600">Cidade</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.cidade || ' '}</div>
                </div>
                <div className="col-span-1 p-1.5 text-center">
                  <div className="text-[10px] text-stone-600">UF</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.uf || ' '}</div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div className="text-[10px] text-stone-600">CEP</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.cep || ' '}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Telefone 1</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.telefone1 || '(   ) '}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Telefone 2</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.telefone2 || '(   ) '}</div>
                </div>
              </div>

              <div className="p-1.5">
                <div className="text-[10px] text-stone-600">E-mail</div>
                <div className="font-semibold">{escoteiro.segundoResponsavel?.email || ' '}</div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Profissão</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.profissao || ' '}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] text-stone-600">Escolaridade</div>
                  <div className="font-semibold">{escoteiro.segundoResponsavel?.escolaridade || ' '}</div>
                </div>
              </div>
            </div>

            {/* TABELA: SITUAÇÃO FAMILIAR E GUARDA */}
            <div className="border border-black divide-y divide-black text-[11px] mb-3">
              <div className="p-1 font-bold bg-stone-100/50">
                Situação Familiar e Guarda (em caso de pais separados ou divorciados)
              </div>
              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-4 p-1.5">
                  <div className="font-semibold mb-1">Responsável pela guarda:</div>
                  <div className="space-y-0.5">
                    {cb(escoteiro.responsavelGuarda === 'Pai', 'Pai')}
                    {cb(escoteiro.responsavelGuarda === 'Mãe', 'Mãe')}
                    {cb(escoteiro.responsavelGuarda === 'Outro' || escoteiro.responsavelGuarda === 'Ambos / Compartilhada', 'Outro:')}
                    {escoteiro.responsavelGuardaOutro && <span className="font-semibold">{escoteiro.responsavelGuardaOutro}</span>}
                  </div>
                </div>

                <div className="col-span-5 p-1.5">
                  <div className="font-semibold mb-1">O outro responsável tem ciência do ingresso no Escotismo?</div>
                  <div>
                    {cb(escoteiro.outroResponsavelCiencia === true, 'Sim')}
                    {cb(escoteiro.outroResponsavelCiencia === false, 'Não')}
                  </div>
                </div>

                <div className="col-span-3 p-1.5">
                  <div className="font-semibold mb-1">Concorda?</div>
                  <div>
                    {cb(escoteiro.outroResponsavelConcorda === true, 'Sim')}
                    {cb(escoteiro.outroResponsavelConcorda === false, 'Não')}
                  </div>
                </div>
              </div>

              <div className="p-1.5">
                <span className="font-semibold">Regime de convivência e visitas vigente: </span>
                <span className="font-normal">{escoteiro.regimeConvivenciaVisitas || ' '}</span>
              </div>
            </div>

            {/* TABELA: CONTATOS ADICIONAIS DE EMERGÊNCIA */}
            <div className="border border-black divide-y divide-black text-[11px] mb-3">
              <div className="p-1 font-bold bg-stone-100/50">
                Contatos Adicionais de Emergência
              </div>
              {[0, 1, 2].map(idx => {
                const c = escoteiro.contatosEmergencia[idx];
                return (
                  <div key={idx} className="grid grid-cols-12 divide-x divide-black">
                    <div className="col-span-8 p-1.5">
                      <span className="text-stone-600 font-medium">Nome: </span>
                      <span className="font-semibold">{c ? `${c.nome} ${c.parentesco ? `(${c.parentesco})` : ''}` : ' '}</span>
                    </div>
                    <div className="col-span-4 p-1.5">
                      <span className="text-stone-600 font-medium">Telefone: </span>
                      <span className="font-semibold">{c ? c.telefone : '(   ) '}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RODAPÉ E ASSINATURAS PÁGINA 1 */}
          <div className="pt-4 text-center">
            <div className="text-left text-[11px] mb-6">
              Franca/SP, _____ de ____________________ de 2026
            </div>
            <div className="grid grid-cols-2 gap-8 text-[11px]">
              <div>
                <div className="border-t border-black w-4/5 mx-auto pt-1 font-semibold">
                  Assinatura do 1º Responsável
                </div>
              </div>
              <div>
                <div className="border-t border-black w-4/5 mx-auto pt-1 font-semibold">
                  Assinatura do 2º Responsável
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PÁGINA 2: FICHA MÉDICA */}
        {/* ========================================================================= */}
        <section className="bg-white p-8 sm:p-12 print:p-0 rounded-2xl print:rounded-none border print:border-none border-stone-300 shadow-sm print:shadow-none print:break-after-page min-h-[297mm] flex flex-col justify-between">
          <div className="space-y-2.5">
            
            {/* Header com Logo */}
            <div className="flex items-center justify-between pb-3 mb-1">
              <div className="w-16 h-16 flex items-center justify-center">
                <ScoutLogo className="w-16 h-16" />
              </div>
              <div className="flex-1 text-center pr-12">
                <h1 className="text-sm font-bold tracking-tight uppercase">
                  GRUPO ESCOTEIRO TRADICIONAL 22 DE FEVEREIRO – FRANCA/SP
                </h1>
                <h2 className="text-xs font-bold uppercase mt-1">
                  FICHA MÉDICA
                </h2>
              </div>
            </div>

            {/* 1. Identificação e Dados Físicos */}
            <div className="border border-black divide-y divide-black text-[11px]">
              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-8 p-1.5">
                  <span className="text-stone-600 font-medium">Nome Completo: </span>
                  <span className="font-bold text-[12px]">{escoteiro.nomeCompleto}</span>
                </div>
                <div className="col-span-4 p-1.5">
                  <span className="text-stone-600 font-medium">Nº Registro: </span>
                  <span className="font-semibold">{escoteiro.fichaMedica.numeroRegistro || ' '}</span>
                </div>
              </div>

              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-3 p-1.5">
                  <span className="text-stone-600 font-medium">Altura: </span>
                  <span className="font-semibold">{escoteiro.fichaMedica.altura ? `${escoteiro.fichaMedica.altura} m` : '______ m'}</span>
                </div>
                <div className="col-span-3 p-1.5">
                  <span className="text-stone-600 font-medium">Peso: </span>
                  <span className="font-semibold">{escoteiro.fichaMedica.peso ? `${escoteiro.fichaMedica.peso} kg` : '______ kg'}</span>
                </div>
                <div className="col-span-3 p-1.5">
                  <span className="text-stone-600 font-medium">Tipo Sanguíneo: </span>
                  <span className="font-bold">{escoteiro.fichaMedica.tipoSanguineo || '______'}</span>
                </div>
                <div className="col-span-3 p-1.5">
                  <span className="text-stone-600 font-medium">Fator RH: </span>
                  {cb(escoteiro.fichaMedica.fatorRh === 'Positivo', 'Positivo')}
                  {cb(escoteiro.fichaMedica.fatorRh === 'Negativo', 'Negativo')}
                </div>
              </div>
            </div>

            {/* Equipamentos de auxílio em uso */}
            <div className="border border-black p-2 text-[11px] space-y-1">
              <div className="font-bold">Equipamentos de auxílio em uso:</div>
              <div className="flex flex-wrap gap-y-1">
                {cb(escoteiro.fichaMedica.equipamentosAuxilio.includes('Óculos'), 'Óculos')}
                {cb(escoteiro.fichaMedica.equipamentosAuxilio.includes('Lentes de contato'), 'Lentes de contato')}
                {cb(escoteiro.fichaMedica.equipamentosAuxilio.includes('Aparelho dentário'), 'Aparelho dentário')}
                {cb(escoteiro.fichaMedica.equipamentosAuxilio.includes('Sonda'), 'Sonda')}
                {cb(escoteiro.fichaMedica.equipamentosAuxilio.includes('Marca-passo'), 'Marca-passo')}
                {cb(escoteiro.fichaMedica.equipamentosAuxilio.includes('Aparelho auditivo'), 'Aparelho auditivo')}
              </div>
              <div>
                {cb(!!escoteiro.fichaMedica.equipamentosAuxilioOutros, 'Outros — Especificar:')}
                <span className="border-b border-black inline-block min-w-64 font-semibold">
                  {escoteiro.fichaMedica.equipamentosAuxilioOutros || ' '}
                </span>
              </div>
            </div>

            {/* Doenças pregressas ou em tratamento */}
            <div className="border border-black p-2 text-[11px] space-y-1.5">
              <div className="font-bold">Doenças pregressas ou em tratamento:</div>
              <div className="grid grid-cols-7 gap-y-1">
                {['Asma', 'Bronquite', 'Catapora', 'Caxumba', 'Convulsões', 'Desmaios', 'Dengue'].map(d => (
                  <span key={d}>{cb(escoteiro.fichaMedica.doencasPregressas.includes(d), d)}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {['Diabetes', 'Epilepsia', 'Hemofilia', 'Hepatite', 'Rubéola', 'Sarampo', 'Sinusite'].map(d => (
                  <span key={d}>{cb(escoteiro.fichaMedica.doencasPregressas.includes(d), d)}</span>
                ))}
              </div>
              <div>
                <span className="font-semibold">Condições atualmente em tratamento: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.condicoesTratamento || ' '}
                </span>
              </div>
              <div>
                <span className="font-semibold">Outras informações clínicas relevantes: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.outrasInformacoesClinicas || ' '}
                </span>
              </div>
            </div>

            {/* Neurodivergências e Condições do Neurodesenvolvimento */}
            <div className="border border-black p-2 text-[11px] space-y-1">
              <div className="font-bold">Neurodivergências e Condições do Neurodesenvolvimento</div>
              <div>
                <span>O jovem apresenta diagnóstico de neurodivergência ou condição do neurodesenvolvimento?</span>
                <span className="ml-2">
                  {cb(!escoteiro.fichaMedica.apresentaNeurodivergencia, 'Não')}
                  {cb(escoteiro.fichaMedica.apresentaNeurodivergencia, 'Sim (preencher os campos abaixo)')}
                </span>
              </div>
              <div>
                <span className="font-semibold">Autismo (Transtorno do Espectro Autista – TEA): </span>
                {cb(escoteiro.fichaMedica.autismoTea, 'Sim')}
                {cb(!escoteiro.fichaMedica.autismoTea, 'Não')}
                <span className="ml-2 font-semibold">Nível de suporte: </span>
                {cb(escoteiro.fichaMedica.autismoNivelSuporte === 'Nível 1', 'Nível 1')}
                {cb(escoteiro.fichaMedica.autismoNivelSuporte === 'Nível 2', 'Nível 2')}
                {cb(escoteiro.fichaMedica.autismoNivelSuporte === 'Nível 3', 'Nível 3')}
              </div>
              <div>
                <span className="font-semibold">Observações / Gatilhos de sobrecarga sensorial: </span>
                <span className="border-b border-black inline-block min-w-64 font-normal">
                  {escoteiro.fichaMedica.autismoGatilhos || ' '}
                </span>
              </div>
              <div>
                <span className="font-semibold">Transtorno de Déficit de Atenção e Hiperatividade (TDAH): </span>
                {cb(escoteiro.fichaMedica.tdah, 'Sim')}
                {cb(!escoteiro.fichaMedica.tdah, 'Não')}
                <span className="ml-2 font-semibold">Predomínio: </span>
                {cb(escoteiro.fichaMedica.tdahPredominio === 'Hiperatividade', 'Hiperatividade')}
                {cb(escoteiro.fichaMedica.tdahPredominio === 'Desatenção', 'Desatenção')}
                {cb(escoteiro.fichaMedica.tdahPredominio === 'Impulsividade', 'Impulsividade')}
                {cb(escoteiro.fichaMedica.tdahPredominio === 'Combinado', 'Combinado')}
              </div>
              <div>
                <span className="font-semibold">Observações: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.tdahObservacoes || ' '}
                </span>
              </div>
              <div className="flex flex-wrap gap-y-0.5">
                <span className="font-semibold mr-1">Outras condições correlatas: </span>
                {cb(escoteiro.fichaMedica.outrasCondicoesNeuro.includes('Dislexia'), 'Dislexia')}
                {cb(escoteiro.fichaMedica.outrasCondicoesNeuro.includes('Disgrafia'), 'Disgrafia')}
                {cb(escoteiro.fichaMedica.outrasCondicoesNeuro.includes('Discalculia'), 'Discalculia')}
                {cb(escoteiro.fichaMedica.outrasCondicoesNeuro.includes('TOD (Transtorno Opositor Desafiador)'), 'TOD (Transtorno Opositor Desafiador)')}
                {cb(escoteiro.fichaMedica.outrasCondicoesNeuro.includes('TEA associado a comorbidades'), 'TEA associado a comorbidades')}
              </div>
              <div>
                <span className="font-semibold">Outra condição não listada: </span>
                <span className="border-b border-black inline-block min-w-64 font-normal">
                  {escoteiro.fichaMedica.outraCondicaoNaoListada || ' '}
                </span>
              </div>
              <div>
                <div className="font-semibold">Cuidados, adaptações e condutas pedagógicas recomendadas nas atividades:</div>
                <div className="border-b border-black min-h-4 font-normal">
                  {escoteiro.fichaMedica.cuidadosPedagogicos || ' '}
                </div>
              </div>
              <div>
                <span className="font-semibold">Medicações específicas vinculadas ao quadro: </span>
                <span className="border-b border-black inline-block min-w-64 font-normal">
                  {escoteiro.fichaMedica.medicacoesQuadroNeuro || ' '}
                </span>
              </div>
            </div>

            {/* Medicamentos e Condutas Médicas */}
            <div className="border border-black p-2 text-[11px] space-y-1">
              <div className="font-bold">Medicamentos e Condutas Médicas</div>
              <div>
                <span className="font-semibold">Faz uso de medicamento de uso contínuo ou temporário? </span>
                {cb(!escoteiro.fichaMedica.medicamentoContinuo, 'Não')}
                {cb(escoteiro.fichaMedica.medicamentoContinuo, 'Sim')}
              </div>
              <div>
                <span className="font-semibold">Qual(is), dosagem e horário: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.medicamentosDetalhes || ' '}
                </span>
              </div>
              <div>
                <span className="font-semibold">Autoriza a administração de medicamentos por profissionais de saúde do Grupo? </span>
                {cb(escoteiro.fichaMedica.autorizaAdministracaoMedicamentos, 'Sim')}
                {cb(!escoteiro.fichaMedica.autorizaAdministracaoMedicamentos, 'Não')}
              </div>
              <div>
                <span className="font-semibold">Restrições ou recomendações: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.restricoesMedicamentos || ' '}
                </span>
              </div>
              <div>
                <span className="font-semibold">Em caso de urgência/emergência médica: </span>
                <div className="mt-0.5">
                  {cb(escoteiro.fichaMedica.urgenciaEmergenciaMedica === 'Aguardar acompanhamento dos pais/responsáveis', 'Aguardar acompanhamento dos pais/responsáveis')}
                  {cb(escoteiro.fichaMedica.urgenciaEmergenciaMedica === 'Autoriza intervenção médica imediata', 'Autoriza intervenção médica imediata')}
                </div>
              </div>
              <div>
                <span className="font-semibold">Avisar prioritariamente em caso de acidente: </span>
                {cb(escoteiro.fichaMedica.avisarPrioritariamente === 'Pais/Responsáveis legais', 'Pais/Responsáveis legais')}
                {cb(escoteiro.fichaMedica.avisarPrioritariamente === 'Outro', 'Outro:')}
                <span className="border-b border-black inline-block min-w-32 mr-2">
                  {escoteiro.fichaMedica.avisarPrioritariamenteOutro || ' '}
                </span>
                <span className="font-semibold">Telefone: </span>
                <span className="border-b border-black inline-block min-w-28">
                  {escoteiro.fichaMedica.avisarPrioritariamenteTelefone || '(   ) '}
                </span>
              </div>
              <div>
                <span className="font-semibold">Possui cobertura por plano de assistência médica privada? </span>
                {cb(!escoteiro.fichaMedica.possuiPlanoSaude, 'Não / Utiliza SUS')}
                {cb(escoteiro.fichaMedica.possuiPlanoSaude, 'Sim')}
              </div>
              <div className="flex flex-wrap gap-x-4">
                <div>
                  <span className="font-semibold">Operadora/Plano: </span>
                  <span className="border-b border-black inline-block min-w-36 font-normal">
                    {escoteiro.fichaMedica.planoOperadora || ' '}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Nº Carteirinha: </span>
                  <span className="border-b border-black inline-block min-w-36 font-normal">
                    {escoteiro.fichaMedica.planoNumeroCarteirinha || ' '}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4">
                <div>
                  <span className="font-semibold">Médico de referência: </span>
                  <span className="border-b border-black inline-block min-w-36 font-normal">
                    {escoteiro.fichaMedica.planoMedicoReferencia || ' '}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Telefone: </span>
                  <span className="border-b border-black inline-block min-w-32 font-normal">
                    {escoteiro.fichaMedica.planoTelefoneMedico || '(   ) '}
                  </span>
                </div>
              </div>
            </div>

            {/* Alergias e Intolerâncias */}
            <div className="border border-black p-2 text-[11px] space-y-1">
              <div>
                <span className="font-bold">Alergias e Intolerâncias </span>
                <span className="ml-2 font-semibold">Apresenta quadro alérgico identificado? </span>
                {cb(!escoteiro.fichaMedica.apresentaAlergia, 'Não')}
                {cb(escoteiro.fichaMedica.apresentaAlergia, 'Sim')}
              </div>
              <div>
                {cb(escoteiro.fichaMedica.alergiaPicadaInsetos, 'Picada de insetos')}
                <span className="font-semibold ml-2">Detalhar: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.alergiaPicadaInsetosDetalhes || ' '}
                </span>
              </div>
              <div>
                {cb(escoteiro.fichaMedica.alergiaMedicamentos, 'Medicamentos')}
                <span className="font-semibold ml-2">Detalhar: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.alergiaMedicamentosDetalhes || ' '}
                </span>
              </div>
              <div>
                {cb(escoteiro.fichaMedica.alergiaPlantasPolen, 'Plantas e pólen')}
                <span className="font-semibold ml-2">Detalhar: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.alergiaPlantasPolenDetalhes || ' '}
                </span>
              </div>
              <div>
                {cb(escoteiro.fichaMedica.alergiaAlimentos, 'Alimentos')}
                <span className="font-semibold ml-2">Detalhar: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.alergiaAlimentosDetalhes || ' '}
                </span>
              </div>
              <div>
                {cb(escoteiro.fichaMedica.alergiaOutras, 'Outras substâncias')}
                <span className="font-semibold ml-2">Detalhar: </span>
                <span className="border-b border-black inline-block min-w-80 font-normal">
                  {escoteiro.fichaMedica.alergiaOutrasDetalhes || ' '}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* PÁGINA 3: FICHA MÉDICA (continuação) */}
        {/* ========================================================================= */}
        <section className="bg-white p-8 sm:p-12 print:p-0 rounded-2xl print:rounded-none border print:border-none border-stone-300 shadow-sm print:shadow-none print:break-after-page min-h-[297mm] flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header com Logo */}
            <div className="flex items-center justify-between pb-3 mb-2">
              <div className="w-16 h-16 flex items-center justify-center">
                <ScoutLogo className="w-16 h-16" />
              </div>
              <div className="flex-1 text-center pr-12">
                <h1 className="text-sm font-bold tracking-tight uppercase">
                  GRUPO ESCOTEIRO TRADICIONAL 22 DE FEVEREIRO – FRANCA/SP
                </h1>
                <h2 className="text-xs font-bold uppercase mt-1">
                  FICHA MÉDICA (continuação)
                </h2>
              </div>
            </div>

            {/* Informações Gerais de Aptidão */}
            <div className="border border-black p-3 text-[11px] space-y-2">
              <div className="font-bold">Informações Gerais de Aptidão</div>
              <div>
                <div>
                  <span className="font-semibold">Possui algum impedimento físico para atividades ao ar livre? </span>
                  {cb(!escoteiro.fichaMedica.impedidoAtividadesArLivre, 'Não')}
                  {cb(escoteiro.fichaMedica.impedidoAtividadesArLivre, 'Sim')}
                </div>
                <div className="mt-0.5">
                  <span className="font-semibold">Especificar: </span>
                  <span className="border-b border-black inline-block min-w-96 font-normal">
                    {escoteiro.fichaMedica.impedidoAtividadesDetalhes || ' '}
                  </span>
                </div>
              </div>

              <div>
                <div>
                  <span className="font-semibold">Apresenta restrições alimentares específicas? </span>
                  {cb(!escoteiro.fichaMedica.restricoesAlimentares, 'Não')}
                  {cb(escoteiro.fichaMedica.restricoesAlimentares, 'Sim')}
                </div>
                <div className="mt-0.5">
                  <span className="font-semibold">Especificar: </span>
                  <span className="border-b border-black inline-block min-w-96 font-normal">
                    {escoteiro.fichaMedica.restricoesAlimentaresDetalhes || ' '}
                  </span>
                </div>
              </div>

              <div>
                <div>
                  <span className="font-semibold">Apresenta cardiopatias ou problemas cardíacos? </span>
                  {cb(!escoteiro.fichaMedica.cardiopatias, 'Não')}
                  {cb(escoteiro.fichaMedica.cardiopatias, 'Sim')}
                </div>
                <div className="mt-0.5">
                  <span className="font-semibold">Especificar: </span>
                  <span className="border-b border-black inline-block min-w-96 font-normal">
                    {escoteiro.fichaMedica.cardiopatiasDetalhes || ' '}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold">Sabe nadar? </span>
                {cb(!escoteiro.fichaMedica.sabeNadar, 'Não')}
                {cb(escoteiro.fichaMedica.sabeNadar, 'Sim')}
              </div>

              <div>
                <span className="font-semibold">Apresenta histórico de sonambulismo? </span>
                {cb(!escoteiro.fichaMedica.historicoSonambulismo, 'Não')}
                {cb(escoteiro.fichaMedica.historicoSonambulismo, 'Sim')}
              </div>
            </div>

            {/* Saúde Mental e Transtornos Psicológicos */}
            <div className="border border-black p-3 text-[11px] space-y-2">
              <div className="font-bold">Saúde Mental e Transtornos Psicológicos</div>
              <div>
                <div className="font-semibold">
                  Apresenta Transtorno de Comportamento? <span className="font-normal text-stone-600">Exemplo: conduta, oposição desafiante, etc.</span>
                </div>
                <div className="mt-0.5">
                  {cb(!escoteiro.fichaMedica.transtornoComportamento, 'Não')}
                  {cb(escoteiro.fichaMedica.transtornoComportamento, 'Sim')}
                  <span className="font-semibold ml-2">Cite: </span>
                  <span className="border-b border-black inline-block min-w-80 font-normal">
                    {escoteiro.fichaMedica.transtornoComportamentoDetalhes || ' '}
                  </span>
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  Apresenta Transtorno Alimentar? <span className="font-normal text-stone-600">Exemplo: anorexia, bulimia, etc.</span>
                </div>
                <div className="mt-0.5">
                  {cb(!escoteiro.fichaMedica.transtornoAlimentar, 'Não')}
                  {cb(escoteiro.fichaMedica.transtornoAlimentar, 'Sim')}
                  <span className="font-semibold ml-2">Cite: </span>
                  <span className="border-b border-black inline-block min-w-80 font-normal">
                    {escoteiro.fichaMedica.transtornoAlimentarDetalhes || ' '}
                  </span>
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  Apresenta Transtorno de Ansiedade ou Fobia? <span className="font-normal text-stone-600">Exemplo: síndrome do pânico, fobia social, etc.</span>
                </div>
                <div className="mt-0.5">
                  {cb(!escoteiro.fichaMedica.transtornoAnsiedadeFobia, 'Não')}
                  {cb(escoteiro.fichaMedica.transtornoAnsiedadeFobia, 'Sim')}
                  <span className="font-semibold ml-2">Cite: </span>
                  <span className="border-b border-black inline-block min-w-80 font-normal">
                    {escoteiro.fichaMedica.transtornoAnsiedadeFobiaDetalhes || ' '}
                  </span>
                </div>
              </div>
            </div>

            {/* Pessoas com Deficiência (PCD) */}
            <div className="border border-black p-3 text-[11px] space-y-2">
              <div>
                <span className="font-bold">Pessoas com Deficiência (PCD) </span>
                <span className="ml-2 font-semibold">Apresenta deficiência comprovada? </span>
                {cb(!escoteiro.fichaMedica.apresentaDeficiencia, 'Não')}
                {cb(escoteiro.fichaMedica.apresentaDeficiencia, 'Sim')}
              </div>
              <div>
                {cb(escoteiro.fichaMedica.deficienciaFisica || escoteiro.fichaMedica.tiposDeficiencia.includes('Física'), 'Física')}
                <span className="font-semibold ml-2">Especificar: </span>
                <span className="border-b border-black inline-block min-w-96 font-normal">
                  {escoteiro.fichaMedica.deficienciaFisicaDetalhes || (escoteiro.fichaMedica.tiposDeficiencia.includes('Física') ? escoteiro.fichaMedica.deficienciaEspecificar : ' ')}
                </span>
              </div>
              <div>
                {cb(escoteiro.fichaMedica.deficienciaVisual || escoteiro.fichaMedica.tiposDeficiencia.includes('Visual'), 'Visual')}
                <span className="font-semibold ml-2">Especificar: </span>
                <span className="border-b border-black inline-block min-w-96 font-normal">
                  {escoteiro.fichaMedica.deficienciaVisualDetalhes || (escoteiro.fichaMedica.tiposDeficiencia.includes('Visual') ? escoteiro.fichaMedica.deficienciaEspecificar : ' ')}
                </span>
              </div>
              <div>
                {cb(escoteiro.fichaMedica.deficienciaAuditiva || escoteiro.fichaMedica.tiposDeficiencia.includes('Auditiva'), 'Auditiva')}
                <span className="font-semibold ml-2">Especificar: </span>
                <span className="border-b border-black inline-block min-w-96 font-normal">
                  {escoteiro.fichaMedica.deficienciaAuditivaDetalhes || (escoteiro.fichaMedica.tiposDeficiencia.includes('Auditiva') ? escoteiro.fichaMedica.deficienciaEspecificar : ' ')}
                </span>
              </div>
              <div>
                {cb(escoteiro.fichaMedica.deficienciaIntelectual || escoteiro.fichaMedica.tiposDeficiencia.includes('Intelectual'), 'Intelectual')}
                <span className="font-semibold ml-2">Especificar: </span>
                <span className="border-b border-black inline-block min-w-96 font-normal">
                  {escoteiro.fichaMedica.deficienciaIntelectualDetalhes || (escoteiro.fichaMedica.tiposDeficiencia.includes('Intelectual') ? escoteiro.fichaMedica.deficienciaEspecificar : ' ')}
                </span>
              </div>
            </div>

          </div>

          {/* RODAPÉ E ASSINATURAS PÁGINA 3 */}
          <div className="pt-6 text-center">
            <div className="text-left text-[11px] mb-8">
              Franca/SP, _____ de ____________________ de 2026
            </div>
            <div className="grid grid-cols-2 gap-8 text-[11px]">
              <div>
                <div className="border-t border-black w-4/5 mx-auto pt-1 font-semibold">
                  Assinatura do 1º Responsável
                </div>
              </div>
              <div>
                <div className="border-t border-black w-4/5 mx-auto pt-1 font-semibold">
                  Assinatura do 2º Responsável
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PÁGINA 4: AUTORIZAÇÃO DO USO DE IMAGEM */}
        {/* ========================================================================= */}
        <section className="bg-white p-8 sm:p-12 print:p-0 rounded-2xl print:rounded-none border print:border-none border-stone-300 shadow-sm print:shadow-none min-h-[297mm] flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Header com Logo */}
            <div className="flex items-center justify-between pb-3 mb-2">
              <div className="w-16 h-16 flex items-center justify-center">
                <ScoutLogo className="w-16 h-16" />
              </div>
              <div className="flex-1 text-center pr-12">
                <h1 className="text-sm font-bold tracking-tight uppercase">
                  GRUPO ESCOTEIRO TRADICIONAL 22 DE FEVEREIRO – FRANCA/SP
                </h1>
                <h2 className="text-xs font-bold uppercase mt-1">
                  AUTORIZAÇÃO DO USO DE IMAGEM
                </h2>
              </div>
            </div>

            {/* Texto integral idêntico */}
            <div className="text-[12px] leading-relaxed text-justify space-y-4 pt-2">
              <p>
                Como responsável pela inscrição neste documento, autorizo o <strong>Grupo Escoteiro Tradicional 22 de
                Fevereiro</strong>, com sede na Rua Marcos Granzotti, nº 4725, Jardim Paineiras, Franca, SP, CEP 14.409-403, a
                utilizar-se das imagens e voz minha, ou daquele que represento ou assisto, para a edição de filmes e
                fotos, outorgando-lhe todos os direitos de imagem relacionados, para qualquer tipo de divulgação,
                publicidade e veiculação em todos e quaisquer meios de comunicação, a exclusivo critério do Grupo
                Escoteiro Tradicional 22 de Fevereiro, que poderá, ainda, reproduzir, editar, introduzir no mercado,
                armazenar, distribuir, executar, transmitir, criar trabalhos derivados e baseados nas imagens e
                informações disponibilizadas, para finalidade editorial, comercial, promocional, educacional,
                institucional, publicitária e todas as outras formas que venham a ser passíveis de utilização.
              </p>

              <p>
                Os associados beneficiários e contribuintes declaram que conhecem e concordam em cumprir a
                regulamentação interna do Grupo Escoteiro Tradicional 22 de Fevereiro. Declaro que as informações
                acima foram por mim prestadas e são de minha inteira e total responsabilidade, especialmente o
                conteúdo e especificações descritos na ficha médica.
              </p>

              <p>
                Também estou ciente do compromisso de efetuar o pagamento da colaboração mensal definida pelo
                Grupo Escoteiro Tradicional 22 de Fevereiro, bem como em reembolsar o Grupo Escoteiro Tradicional 22
                de Fevereiro por eventuais danos materiais ou financeiros causados pelo(a) jovem inscrito(a) sob minha
                responsabilidade.
              </p>

              <p className="font-semibold">
                Declaro haver lido as informações acima e concordo com as mesmas.
              </p>
            </div>

          </div>

          {/* RODAPÉ E ASSINATURA PÁGINA 4 */}
          <div className="pt-12 text-center">
            <div className="text-left text-[11px] mb-12">
              Franca/SP, _____ de ____________________ de 2026
            </div>
            <div className="max-w-xs mx-auto text-[11px]">
              <div className="border-t border-black pt-1 font-semibold">
                Assinatura do Responsável
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                {escoteiro.responsavelAssinatura || escoteiro.primeiroResponsavel.nomeCompleto}
              </div>
            </div>
          </div>
        </section>

        </div>
      </div>
    </div>
  );
};
