import React, { useState } from 'react';
import { EscoteiroCadastro, calcularIdade, identificarRamo } from '../types/scout';
import { storageService } from '../services/storage';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  X, 
  Table, 
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  escoteiros: EscoteiroCadastro[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  escoteiros,
}) => {
  const [copiado, setCopiado] = useState<boolean>(false);
  const [copiadoTSV, setCopiadoTSV] = useState<boolean>(false);
  const [mostrarPrevia, setMostrarPrevia] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const fileName = `relatorio_escoteiros_22_fevereiro_${new Date().toISOString().split('T')[0]}.csv`;

  const handleDownloadCSV = () => {
    try {
      const csv = storageService.exportarCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Keep blob URL active for 30s to avoid browser cancelling asynchronous download
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      // Data URI Fallback
      try {
        const csv = storageService.exportarCSV();
        const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csv}`);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } catch (err) {
        console.error('Download fallback error:', err);
      }
    }
  };

  const handleCopiarCSV = async () => {
    try {
      const csv = storageService.exportarCSV();
      await navigator.clipboard.writeText(csv);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  const handleCopiarTSV = async () => {
    try {
      const tsv = storageService.exportarTSV();
      await navigator.clipboard.writeText(tsv);
      setCopiadoTSV(true);
      setTimeout(() => setCopiadoTSV(false), 3000);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Exportar Dados para Excel / CSV</h3>
              <p className="text-xs text-emerald-200">
                {escoteiros.length} escoteiros cadastrados no sistema
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800">
          
          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 flex flex-col items-start gap-2 text-left transition-all active:scale-[0.99] group shadow-xs"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-700" />
                  Baixar Arquivo CSV / Excel
                </span>
                {downloadSuccess ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Baixado!
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 leading-snug">
                Gera arquivo <strong className="font-semibold text-stone-800">.csv</strong> formatado em UTF-8 com separador ponto e vírgula (;), pronto para abrir no Excel.
              </p>
            </button>

            {/* Copy for Google Sheets / Excel */}
            <button
              type="button"
              onClick={handleCopiarTSV}
              className="p-4 rounded-xl border border-stone-300 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50 text-stone-900 flex flex-col items-start gap-2 text-left transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  {copiadoTSV ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                  {copiadoTSV ? 'Copiado para Colar!' : 'Copiar para Google Planilhas'}
                </span>
                {copiadoTSV && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Na memória!
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 leading-snug">
                Copia os dados em formato de colunas. Basta abrir o Google Planilhas ou Excel e pressionar <kbd className="px-1 py-0.5 bg-stone-200 rounded text-[10px] font-mono">Ctrl+V</kbd>.
              </p>
            </button>
          </div>

          {/* Quick Copy Raw CSV */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-600 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              Copiar texto CSV puro (com cabeçalhos):
            </span>
            <button
              type="button"
              onClick={handleCopiarCSV}
              className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 font-semibold rounded-lg border border-stone-300 transition-colors flex items-center gap-1 shadow-2xs"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? 'Texto CSV Copiado!' : 'Copiar Texto CSV'}</span>
            </button>
          </div>

          {/* Data Preview Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setMostrarPrevia(!mostrarPrevia)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5"
            >
              <Table className="w-3.5 h-3.5" />
              <span>{mostrarPrevia ? 'Ocultar prévia dos dados' : 'Ver prévia da tabela de dados'}</span>
            </button>

            {mostrarPrevia && (
              <div className="mt-2 border border-stone-200 rounded-xl overflow-x-auto max-h-48 text-[11px]">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-100 font-bold text-stone-700 sticky top-0">
                    <tr>
                      <th className="px-3 py-1.5 text-left">Nome</th>
                      <th className="px-3 py-1.5 text-left">Sexo</th>
                      <th className="px-3 py-1.5 text-left">Idade</th>
                      <th className="px-3 py-1.5 text-left">Ramo</th>
                      <th className="px-3 py-1.5 text-left">Bairro</th>
                      <th className="px-3 py-1.5 text-left">Telefone</th>
                      <th className="px-3 py-1.5 text-left">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {escoteiros.slice(0, 10).map(e => (
                      <tr key={e.id}>
                        <td className="px-3 py-1.5 font-medium text-stone-900 whitespace-nowrap">{e.nomeCompleto}</td>
                        <td className="px-3 py-1.5 text-stone-600">{e.sexo}</td>
                        <td className="px-3 py-1.5 text-stone-600">{calcularIdade(e.dataNascimento)} anos</td>
                        <td className="px-3 py-1.5 text-stone-600">{identificarRamo(calcularIdade(e.dataNascimento))}</td>
                        <td className="px-3 py-1.5 text-stone-600 whitespace-nowrap">{e.bairro}</td>
                        <td className="px-3 py-1.5 text-stone-600 whitespace-nowrap">{e.telefone1}</td>
                        <td className="px-3 py-1.5 text-stone-600 whitespace-nowrap">{e.primeiroResponsavel.nomeCompleto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info note */}
          <div className="text-[11px] text-stone-500 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
            <span className="font-semibold text-amber-900">Dica:</span> O arquivo CSV inclui 20 colunas essenciais: Nº de registro, nome, sexo, idade, ramo, datas, CPF, RG, endereço completo em Franca, telefones, dados do responsável legal, tipo sanguíneo, alergias, restrições e convênio de saúde.
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-4 sm:px-6 py-3 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            Grupo Escoteiro Tradicional 22 de Fevereiro
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
