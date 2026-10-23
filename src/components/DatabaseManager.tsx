import React, { useState, useRef } from 'react';
import { EscoteiroCadastro } from '../types/scout';
import { storageService } from '../services/storage';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  HardDrive,
  ShieldCheck,
  FileJson
} from 'lucide-react';

interface DatabaseManagerProps {
  escoteiros: EscoteiroCadastro[];
  onRefresh: () => void;
  onExportarCSV: () => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  escoteiros,
  onRefresh,
  onExportarCSV,
}) => {
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tamanho aproximado dos dados em KB
  const tamanhoKB = Math.round(new Blob([JSON.stringify(escoteiros)]).size / 1024);

  const handleExportarJSON = () => {
    try {
      const json = storageService.exportarJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_escoteiros_22_fevereiro_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30000);

      setMensagem({ tipo: 'sucesso', texto: 'Backup JSON exportado com sucesso!' });
      setTimeout(() => setMensagem(null), 3000);
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: 'Falha ao exportar backup JSON.' });
    }
  };

  const handleImportarJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = storageService.importarJSON(content);
        if (res.success) {
          onRefresh();
          setMensagem({ tipo: 'sucesso', texto: `${res.count} cadastros importados com sucesso para o banco de dados!` });
        } else {
          setMensagem({ tipo: 'erro', texto: res.error || 'Erro na validação do arquivo JSON.' });
        }
      } catch (err) {
        setMensagem({ tipo: 'erro', texto: 'Arquivo corrompido ou formato inválido.' });
      }
      setTimeout(() => setMensagem(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLimparTudoParaDadosReais = () => {
    if (window.confirm('Atenção: Deseja zerar completamente o sistema para operação com Dados Reais? Todos os registros serão apagados e apenas o usuário Administrador Cmte. Malta será mantido.')) {
      storageService.limparTudoParaDadosReais();
      onRefresh();
      setConfirmarLimpeza(false);
      setMensagem({ tipo: 'sucesso', texto: 'Sistema resetado com sucesso para ambiente de Dados Reais com Administrador Cmte. Malta.' });
      setTimeout(() => setMensagem(null), 3500);
    }
  };

  const handleLimparBanco = () => {
    storageService.limparTudoParaDadosReais();
    onRefresh();
    setConfirmarLimpeza(false);
    setMensagem({ tipo: 'sucesso', texto: 'Banco de dados limpo com sucesso. Ambiente pronto para novos registros reais.' });
    setTimeout(() => setMensagem(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Database className="w-4 h-4" />
            <span>Controle & Persistência de Dados</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            Banco de Dados do Grupo Escoteiro
          </h2>
          <p className="text-xs text-stone-500">
            Armazenamento seguro, exportação em planilha, rotinas de backup e restauração.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
          <HardDrive className="w-6 h-6" />
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{mensagem.texto}</span>
        </div>
      )}

      {/* Database KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase">Registros no Banco</div>
          <div className="text-3xl font-extrabold text-stone-900 mt-1">{escoteiros.length}</div>
          <div className="text-xs text-stone-400 mt-1">Fichas ativas com histórico médico</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase">Tamanho do Banco</div>
          <div className="text-3xl font-extrabold text-emerald-800 mt-1">~{tamanhoKB} KB</div>
          <div className="text-xs text-stone-400 mt-1">Armazenado localmente</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase">Status do Sistema</div>
          <div className="text-base font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Operacional & Sincronizado</span>
          </div>
          <div className="text-xs text-stone-400 mt-1">Persistência em tempo real</div>
        </div>
      </div>

      {/* Export / Import Actions */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
          Ferramentas de Exportação e Backup
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Planilha Excel CSV */}
          <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Exportar Planilha Excel (CSV)</h4>
              <p className="text-xs text-stone-500 mt-1">
                Gera um arquivo compatível com Microsoft Excel, Google Sheets e LibreOffice com delimitador padrão brasileiro e codificação UTF-8.
              </p>
            </div>
            <button
              onClick={onExportarCSV}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Planilha Excel (.csv)</span>
            </button>
          </div>

          {/* Backup JSON */}
          <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                <FileJson className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Backup Integral do Banco (JSON)</h4>
              <p className="text-xs text-stone-500 mt-1">
                Exporta todas as fichas médicas, contatos de emergência e assinaturas em formato estruturado para restauração posterior.
              </p>
            </div>
            <button
              onClick={handleExportarJSON}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Backup Completo (.json)</span>
            </button>
          </div>

          {/* Importar JSON */}
          <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Restaurar de Arquivo JSON</h4>
              <p className="text-xs text-stone-500 mt-1">
                Selecione um arquivo de backup previamente exportado para restaurar a base de dados.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportarJSON}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Selecionar Arquivo Backup...</span>
              </button>
            </div>
          </div>

          {/* Zerar para Base de Dados Reais */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Base Limpa (Dados Reais)</h4>
              <p className="text-xs text-stone-500 mt-1">
                Zera quaisquer dados residuais fictícios e mantém apenas a conta do Administrador Geral Cmte. Malta pronta para uso real.
              </p>
            </div>
            <button
              onClick={handleLimparTudoParaDadosReais}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetar para Dados Reais</span>
            </button>
          </div>

        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/40 p-6 rounded-2xl border border-rose-200 space-y-3">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Zona de Perigo</span>
        </div>
        <p className="text-xs text-stone-600">
          A limpeza do banco de dados removerá todas as fichas salvas localmente neste navegador. Certifique-se de ter feito backup.
        </p>

        {!confirmarLimpeza ? (
          <button
            onClick={() => setConfirmarLimpeza(true)}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Banco de Dados</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleLimparBanco}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Confirmar Exclusão Total
            </button>
            <button
              onClick={() => setConfirmarLimpeza(false)}
              className="px-3 py-2 bg-stone-200 text-stone-700 text-xs rounded-xl"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
