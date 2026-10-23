import React, { useState, useEffect, useCallback } from 'react';
import { EscoteiroCadastro } from './types/scout';
import { 
  ContribuicaoMensal, 
  FiliacaoAnual, 
  EventoEscoteiro, 
  ParticipacaoEvento, 
  RegistroUniformeMaterial 
} from './types/management';
import { storageService } from './services/storage';
import { Navbar, TabType } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { RegistrationForm } from './components/RegistrationForm';
import { ScoutList } from './components/ScoutList';
import { OfficialSheetView } from './components/OfficialSheetView';
import { DatabaseManager } from './components/DatabaseManager';
import { FinanceiroManager } from './components/FinanceiroManager';
import { EventosManager } from './components/EventosManager';
import { UniformesManager } from './components/UniformesManager';
import { PainelDirigenteModal } from './components/PainelDirigenteModal';
import { ExportModal } from './components/ExportModal';
import { HomeView } from './components/HomeView';
import { CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [escoteiros, setEscoteiros] = useState<EscoteiroCadastro[]>(() => {
    return storageService.getEscoteiros();
  });

  const [contribuicoes, setContribuicoes] = useState<ContribuicaoMensal[]>(() => {
    return storageService.getContribuicoes();
  });

  const [filiacoes, setFiliacoes] = useState<FiliacaoAnual[]>(() => {
    return storageService.getFiliacoes();
  });

  const [eventos, setEventos] = useState<EventoEscoteiro[]>(() => {
    return storageService.getEventos();
  });

  const [participacoes, setParticipacoes] = useState<ParticipacaoEvento[]>(() => {
    return storageService.getParticipacoes();
  });

  const [uniformes, setUniformes] = useState<RegistroUniformeMaterial[]>(() => {
    return storageService.getUniformes();
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [selectedEscoteiro, setSelectedEscoteiro] = useState<EscoteiroCadastro | null>(() => {
    const list = storageService.getEscoteiros();
    return list.length > 0 ? list[0] : null;
  });
  const [editingEscoteiro, setEditingEscoteiro] = useState<EscoteiroCadastro | null>(null);
  const [dossierEscoteiro, setDossierEscoteiro] = useState<EscoteiroCadastro | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

  const refreshData = useCallback(() => {
    const list = storageService.getEscoteiros();
    setEscoteiros(list);
    setContribuicoes(storageService.getContribuicoes());
    setFiliacoes(storageService.getFiliacoes());
    setEventos(storageService.getEventos());
    setParticipacoes(storageService.getParticipacoes());
    setUniformes(storageService.getUniformes());

    if (!selectedEscoteiro && list.length > 0) {
      setSelectedEscoteiro(list[0]);
    } else if (selectedEscoteiro) {
      const updated = list.find(e => e.id === selectedEscoteiro.id);
      if (updated) setSelectedEscoteiro(updated);
      else if (list.length > 0) setSelectedEscoteiro(list[0]);
    }

    if (dossierEscoteiro) {
      const updatedDossier = list.find(e => e.id === dossierEscoteiro.id);
      if (updatedDossier) setDossierEscoteiro(updatedDossier);
    }
  }, [selectedEscoteiro, dossierEscoteiro]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleNovoCadastro = () => {
    setEditingEscoteiro(null);
    setCurrentTab('novo');
  };

  const handleEditEscoteiro = (esc: EscoteiroCadastro) => {
    setEditingEscoteiro(esc);
    setCurrentTab('novo');
  };

  const handleSalvarCadastro = (dados: EscoteiroCadastro) => {
    const salvo = storageService.salvarEscoteiro(dados);
    refreshData();
    setSelectedEscoteiro(salvo);
    setEditingEscoteiro(null);
    setCurrentTab('lista');
    showToast(`Ficha de ${salvo.nomeCompleto} salva com sucesso no banco de dados!`);
  };

  const handleDeleteEscoteiro = (id: string) => {
    storageService.excluirEscoteiro(id);
    refreshData();
    showToast('Inscrição removida do banco de dados.');
  };

  const handleSelectEscoteiro = (esc: EscoteiroCadastro) => {
    setSelectedEscoteiro(esc);
    setCurrentTab('impressao');
  };

  const handleImprimirEscoteiro = (esc: EscoteiroCadastro) => {
    const escoteiroPronto: EscoteiroCadastro = {
      ...esc,
      id: esc.id || `esc-temp-${Date.now()}`,
      nomeCompleto: esc.nomeCompleto.trim() || 'Escoteiro (Ficha em Preenchimento)'
    };
    setSelectedEscoteiro(escoteiroPronto);
    setCurrentTab('impressao');
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn('Erro ao disparar impressão:', e);
      }
    }, 250);
  };

  const handleExportarCSV = () => {
    setExportModalOpen(true);
    try {
      const csv = storageService.exportarCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_escoteiros_22_fevereiro_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      showToast('Planilha CSV gerada! Baixando arquivo...');
    } catch (e) {
      showToast('Opções de exportação prontas.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={tab => {
          if (tab === 'novo') setEditingEscoteiro(null);
          setCurrentTab(tab);
        }}
        totalCadastros={escoteiros.length}
        onNovoCadastro={handleNovoCadastro}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-700/60 flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-bounce-short">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        
        {/* 0. HOME: LOGO DO ESCOTEIRO, LOGIN DE ACESSO & BOTÃO NOVO CADASTRO */}
        {currentTab === 'home' && (
          <HomeView
            onNovoCadastro={handleNovoCadastro}
            onLoginSuccess={() => {
              setCurrentTab('dashboard');
              showToast('Login realizado com sucesso! Bem-vindo(a) ao painel.');
            }}
          />
        )}

        {/* 1. DASHBOARD GERAL COM ANIVERSARIANTES & ATALHOS */}
        {currentTab === 'dashboard' && (
          <Dashboard
            escoteiros={escoteiros}
            contribuicoes={contribuicoes}
            filiacoes={filiacoes}
            eventos={eventos}
            uniformes={uniformes}
            onSelectEscoteiro={handleSelectEscoteiro}
            onNovoCadastro={handleNovoCadastro}
            onVerTodos={() => setCurrentTab('lista')}
            onImprimirEscoteiro={handleImprimirEscoteiro}
            onOpenDirigenteDossier={setDossierEscoteiro}
            onNavigateTab={setCurrentTab}
          />
        )}

        {/* 2. CADASTRO / EDIÇÃO */}
        {currentTab === 'novo' && (
          <RegistrationForm
            initialData={editingEscoteiro}
            onSave={handleSalvarCadastro}
            onCancel={() => {
              setEditingEscoteiro(null);
              setCurrentTab('lista');
            }}
            onPrint={handleImprimirEscoteiro}
          />
        )}

        {/* 3. LISTAGEM DE ASSOCIADOS */}
        {currentTab === 'lista' && (
          <ScoutList
            escoteiros={escoteiros}
            onSelectEscoteiro={handleSelectEscoteiro}
            onEditEscoteiro={handleEditEscoteiro}
            onDeleteEscoteiro={handleDeleteEscoteiro}
            onNovoCadastro={handleNovoCadastro}
            onImprimirEscoteiro={handleImprimirEscoteiro}
            onExportarCSV={handleExportarCSV}
            onOpenDirigenteDossier={setDossierEscoteiro}
          />
        )}

        {/* 4. CONTROLE DE CONTRIBUIÇÕES E FILIAÇÃO ANUAL */}
        {currentTab === 'financeiro' && (
          <FinanceiroManager
            escoteiros={escoteiros}
            contribuicoes={contribuicoes}
            filiacoes={filiacoes}
            onRefresh={refreshData}
            onOpenDirigenteDossier={setDossierEscoteiro}
          />
        )}

        {/* 5. GESTÃO DE EVENTOS ESCOTEIROS & PARTICIPAÇÕES */}
        {currentTab === 'eventos' && (
          <EventosManager
            escoteiros={escoteiros}
            eventos={eventos}
            participacoes={participacoes}
            onRefresh={refreshData}
            onOpenDirigenteDossier={setDossierEscoteiro}
          />
        )}

        {/* 6. CONTROLE DE UNIFORMES E MATERIAIS FORNECIDOS */}
        {currentTab === 'uniformes' && (
          <UniformesManager
            escoteiros={escoteiros}
            uniformes={uniformes}
            onRefresh={refreshData}
            onOpenDirigenteDossier={setDossierEscoteiro}
          />
        )}

        {/* 7. FICHA OFICIAL (IMPRESSÃO 4 PÁGINAS) */}
        {currentTab === 'impressao' && (
          selectedEscoteiro ? (
            <OfficialSheetView
              escoteiro={selectedEscoteiro}
              todosEscoteiros={escoteiros}
              onSelectOutro={setSelectedEscoteiro}
              onVoltar={() => setCurrentTab('lista')}
            />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
              <p className="text-stone-500 text-sm">Nenhum escoteiro cadastrado para visualização da ficha.</p>
              <button
                onClick={handleNovoCadastro}
                className="mt-3 px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl"
              >
                Cadastrar Primeiro Escoteiro
              </button>
            </div>
          )
        )}

        {/* 8. BANCO DE DADOS & BACKUP */}
        {currentTab === 'database' && (
          <DatabaseManager
            escoteiros={escoteiros}
            onRefresh={refreshData}
            onExportarCSV={handleExportarCSV}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="print:hidden border-t border-stone-200 bg-white py-6 mb-16 md:mb-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 font-serif">Grupo Escoteiro Tradicional 22 de Fevereiro</span>
            <span>•</span>
            <span>Franca/SP</span>
          </div>
          <div>
            Sede: Rua Marcos Granzotti, nº 4725, Jardim Paineiras — CEP 14.409-403
          </div>
          <div className="text-stone-400">
            Sistema Integrado de Gestão Escoteira • 2026
          </div>
        </div>
      </footer>

      {/* Modal Ficha 360° do Associado (Painel do Dirigente) */}
      <PainelDirigenteModal
        escoteiro={dossierEscoteiro}
        isOpen={!!dossierEscoteiro}
        onClose={() => setDossierEscoteiro(null)}
        contribuicoes={contribuicoes}
        filiacoes={filiacoes}
        eventos={eventos}
        participacoes={participacoes}
        uniformes={uniformes}
        onImprimirOficial={handleImprimirEscoteiro}
        onEditarCadastro={handleEditEscoteiro}
      />

      {/* Modal Exportar Planilha Excel/CSV */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        escoteiros={escoteiros}
      />

    </div>
  );
}
