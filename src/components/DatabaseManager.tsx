import React, { useState, useRef, useEffect } from 'react';
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
  FileJson,
  Server,
  RefreshCw,
  Globe,
  Wifi,
  WifiOff,
  Check,
  ExternalLink,
  Info
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

  // Estados de Sincronização e Conexão com o Servidor / Hostinger
  const [apiUrl, setApiUrl] = useState<string>(() => storageService.getApiUrl());
  const [statusConexao, setStatusConexao] = useState<'verificando' | 'online' | 'offline'>('verificando');
  const [testando, setTestando] = useState<boolean>(false);
  const [sincronizando, setSincronizando] = useState<boolean>(false);
  const [infoServidor, setInfoServidor] = useState<{
    totalEscoteiros?: number;
    ultimaAtualizacao?: string;
    servidor?: string;
    latenciaMs?: number;
  } | null>(null);
  const [ultimoSync, setUltimoSync] = useState<string | null>(() => storageService.getLastSyncTime());

  // Tamanho aproximado dos dados em KB
  const tamanhoKB = Math.round(new Blob([JSON.stringify(escoteiros)]).size / 1024);

  // Testar conectividade inicial ao abrir o gerenciador
  useEffect(() => {
    let ativo = true;
    storageService.testarConexaoServidor().then((res) => {
      if (!ativo) return;
      if (res.ok) {
        setStatusConexao('online');
        setInfoServidor({
          totalEscoteiros: res.info?.totalEscoteiros,
          ultimaAtualizacao: res.info?.ultimaAtualizacao,
          servidor: res.info?.servidor,
          latenciaMs: res.latencyMs,
        });
      } else {
        setStatusConexao('offline');
      }
    });
    return () => { ativo = false; };
  }, []);

  const handleTestarConexao = async () => {
    setTestando(true);
    setMensagem(null);
    try {
      const res = await storageService.testarConexaoServidor(apiUrl);
      if (res.ok) {
        setStatusConexao('online');
        setInfoServidor({
          totalEscoteiros: res.info?.totalEscoteiros,
          ultimaAtualizacao: res.info?.ultimaAtualizacao,
          servidor: res.info?.servidor,
          latenciaMs: res.latencyMs,
        });
        setMensagem({
          tipo: 'sucesso',
          texto: `Conexão bem-sucedida! Servidor respondendo em ${res.latencyMs}ms com ${res.info?.totalEscoteiros ?? 0} fichas cadastradas.`,
        });
      } else {
        setStatusConexao('offline');
        setMensagem({
          tipo: 'erro',
          texto: `Falha ao conectar no servidor: ${res.erro || 'Verifique se a URL está correta ou se o servidor está online.'}`,
        });
      }
    } catch (err: any) {
      setStatusConexao('offline');
      setMensagem({ tipo: 'erro', texto: 'Erro de rede ao tentar contatar o servidor.' });
    } finally {
      setTestando(false);
      setTimeout(() => setMensagem(null), 5000);
    }
  };

  const handleSalvarUrlServidor = () => {
    storageService.setApiUrl(apiUrl);
    setMensagem({
      tipo: 'sucesso',
      texto: apiUrl.trim() ? `URL do Servidor Hostinger configurada para: ${apiUrl.trim()}` : 'URL redefinida para o servidor padrão local.',
    });
    handleTestarConexao();
  };

  const handleSincronizarServidor = async () => {
    setSincronizando(true);
    setMensagem(null);
    try {
      const res = await storageService.sincronizarComServidor(apiUrl);
      if (res.sucesso) {
        setStatusConexao('online');
        onRefresh();
        setUltimoSync(new Date().toISOString());
        setMensagem({
          tipo: 'sucesso',
          texto: `${res.mensagem} (${res.adicionados} novas fichas puxadas do servidor)`,
        });
      } else {
        setMensagem({
          tipo: 'erro',
          texto: res.mensagem,
        });
      }
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: 'Erro durante processo de sincronização.' });
    } finally {
      setSincronizando(false);
      setTimeout(() => setMensagem(null), 5000);
    }
  };

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
          // Envia também para o servidor
          storageService.sincronizarComServidor();
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
    if (window.confirm('Atenção: Deseja zerar completamente o sistema para operação com Dados Reais? Todos os registros serão apagados no navegador e no servidor, mantendo apenas o usuário Administrador Cmte. Malta.')) {
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
            <span>Controle, Servidor & Persistência</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            Banco de Dados & Sincronização
          </h2>
          <p className="text-xs text-stone-500">
            Persistência centralizada no servidor da Hostinger, redundância local e sincronização em tempo real.
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
          {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{mensagem.texto}</span>
        </div>
      )}

      {/* Database KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase">Fichas no Banco Ativo</div>
          <div className="text-3xl font-extrabold text-stone-900 mt-1">{escoteiros.length}</div>
          <div className="text-xs text-stone-400 mt-1">
            {infoServidor?.totalEscoteiros !== undefined ? `${infoServidor.totalEscoteiros} registradas no servidor` : 'Histórico médico completo'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase">Conexão do Servidor</div>
          <div className="text-base font-bold mt-2 flex items-center gap-1.5">
            {statusConexao === 'online' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>Servidor Online</span>
              </span>
            ) : statusConexao === 'verificando' ? (
              <span className="inline-flex items-center gap-1.5 text-amber-600">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span>Verificando...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-600">
                <WifiOff className="w-4 h-4 text-rose-500" />
                <span>Modo Local (Offline)</span>
              </span>
            )}
          </div>
          <div className="text-xs text-stone-400 mt-1">
            {infoServidor?.latenciaMs ? `Latência: ${infoServidor.latenciaMs}ms` : 'Persistência no navegador'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase">Última Sincronização</div>
          <div className="text-sm font-bold text-stone-800 mt-2">
            {ultimoSync ? new Date(ultimoSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Automática'}
          </div>
          <div className="text-xs text-stone-400 mt-1">
            {ultimoSync ? new Date(ultimoSync).toLocaleDateString('pt-BR') : 'Ao abrir o sistema'}
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: SINCRONIZAÇÃO E INTEGRAÇÃO HOSTINGER / GOOGLE IA */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-stone-900">
                Integração do Servidor Hostinger & Banco Central
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Garanta que todas as inscrições feitas no site hospedado na Hostinger sejam gravadas no banco permanente e reflitam em qualquer dispositivo.
            </p>
          </div>

          <button
            onClick={handleSincronizarServidor}
            disabled={sincronizando}
            className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} />
            <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar com Hostinger Agora'}</span>
          </button>
        </div>

        {/* Banner Explicativo de Arquitetura */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <Info className="w-4 h-4 shrink-0 text-amber-700" />
            <span>Como funciona a persistência de inscrições entre Hostinger e Google IA:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-amber-800/90 leading-relaxed">
            <li>
              <strong>No Servidor Hostinger:</strong> Quando um pai ou voluntário preenche o cadastro, a ficha é gravada diretamente no banco permanente do servidor (<code>data/database.json</code>), ficando segura e preservada mesmo que o usuário feche a página.
            </li>
            <li>
              <strong>Sincronização Bidirecional:</strong> Ao abrir o sistema aqui no Google IA ou no computador da Diretoria, o botão <em>"Sincronizar com Hostinger Agora"</em> ou a sincronização automática traz as novas inscrições instantaneamente.
            </li>
            <li>
              <strong>Ambiente Isolado do Navegador:</strong> Se você estiver testando no Google IA e quiser puxar as inscrições do seu domínio oficial da Hostinger (ex: <code>https://seugrupoescoteiro.com.br</code>), basta inserir a URL abaixo e clicar em <em>"Salvar & Conectar"</em>.
            </li>
          </ul>
        </div>

        {/* Configuração de Endpoint Remoto */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            Endereço (URL) do Servidor Hostinger (Opcional):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="Exemplo: https://meugrupoescoteiro.com.br (ou deixe em branco para servidor padrão local)"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white text-stone-800"
              />
            </div>
            
            <button
              onClick={handleSalvarUrlServidor}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar URL</span>
            </button>

            <button
              onClick={handleTestarConexao}
              disabled={testando}
              className="py-2.5 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testando ? 'animate-spin' : ''}`} />
              <span>Testar Conexão</span>
            </button>
          </div>
          <p className="text-[11px] text-stone-400">
            Deixe o campo em branco quando o sistema estiver rodando no próprio servidor da Hostinger ou em ambiente local integrado.
          </p>
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
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                Selecione um arquivo de backup previamente exportado para restaurar a base de dados no navegador e sincronizar com o servidor.
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
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
          A limpeza do banco de dados removerá todas as fichas salvas localmente e no servidor. Certifique-se de ter feito backup.
        </p>

        {!confirmarLimpeza ? (
          <button
            onClick={() => setConfirmarLimpeza(true)}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Banco de Dados</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleLimparBanco}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Confirmar Exclusão Total
            </button>
            <button
              onClick={() => setConfirmarLimpeza(false)}
              className="px-3 py-2 bg-stone-200 text-stone-700 text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
