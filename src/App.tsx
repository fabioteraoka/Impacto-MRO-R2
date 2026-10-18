/**
 * Impacto Aviation MRO - Sistema de Gestão de Manutenção Aeronáutica
 * Homologação: ANAC COM 200607-05 / EASA.145.1003
 * PARTE 1: Gestão Cadastral, Recursos Humanos e Qualificação (F 001-03 / F 001-07 / MNT-002)
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { TechnicianList } from './components/TechnicianList';
import { TechnicianModal } from './components/TechnicianModal';
import { TechnicianDossierModal } from './components/TechnicianDossierModal';
import { DesignationModal } from './components/DesignationModal';
import { DesignationsView } from './components/DesignationsView';
import { TrainingModal } from './components/TrainingModal';
import { TrainingMatrixView } from './components/TrainingMatrixView';
import { ReportF00107View } from './components/ReportF00107View';
import { RegulatoryRulesView } from './components/RegulatoryRulesView';
import { AuditSimulatorModal } from './components/AuditSimulatorModal';
import { ToolingView } from './components/ToolingView';
import { CtmView } from './components/CtmView';
import { OfficialFormsDirectoryView } from './components/OfficialFormsDirectoryView';
import { PcpView } from './components/PcpView';
import { HangarExecutionView } from './components/HangarExecutionView';
import { QualityReleaseView } from './components/QualityReleaseView';

import {
  BaseOperacional,
  PessoalTecnico,
  DesignacaoFuncoesF001_03,
  TreinamentoMNT002,
  TecnicoComQualificacao,
} from './types/mro';
import { api, DashboardStats } from './services/apiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('qualidade');
  const [tecnicos, setTecnicos] = useState<TecnicoComQualificacao[]>([]);
  const [bases, setBases] = useState<BaseOperacional[]>([]);
  const [designacoes, setDesignacoes] = useState<DesignacaoFuncoesF001_03[]>([]);
  const [treinamentos, setTreinamentos] = useState<TreinamentoMNT002[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtro de Status vindo dos cards
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modals state
  const [isTecnicoModalOpen, setIsTecnicoModalOpen] = useState(false);
  const [tecnicoParaEdicao, setTecnicoParaEdicao] = useState<PessoalTecnico | null>(null);

  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [tecnicoDossier, setTecnicoDossier] = useState<TecnicoComQualificacao | null>(null);

  const [isDesignacaoModalOpen, setIsDesignacaoModalOpen] = useState(false);
  const [tecnicoPreDesig, setTecnicoPreDesig] = useState<TecnicoComQualificacao | null>(null);

  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [tecnicoPreTreino, setTecnicoPreTreino] = useState<TecnicoComQualificacao | null>(null);

  const [isAuditSimOpen, setIsAuditSimOpen] = useState(false);

  // Carregar dados gerais
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [basesData, tecnicosData, designacoesData, treinamentosData, statsData] =
        await Promise.all([
          api.getBases(),
          api.getTecnicos(),
          api.getDesignacoes(),
          api.getTreinamentos(),
          api.getStats(),
        ]);

      setBases(basesData);
      setTecnicos(tecnicosData);
      setDesignacoes(designacoesData);
      setTreinamentos(treinamentosData);
      setStats(statsData);

      // Atualizar dossier aberto se houver
      if (tecnicoDossier) {
        const atualizado = tecnicosData.find((t) => t.id_tecnico === tecnicoDossier.id_tecnico);
        if (atualizado) setTecnicoDossier(atualizado);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do MRO:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Handlers Técnicos
  const handleSaveTecnico = async (data: Partial<PessoalTecnico>) => {
    if (tecnicoParaEdicao) {
      await api.updateTecnico(tecnicoParaEdicao.id_tecnico, data);
    } else {
      await api.createTecnico(data);
    }
    await carregarDados();
  };

  const handleToggleAtivo = async (id: number) => {
    await api.toggleTecnicoAtivo(id);
    await carregarDados();
  };

  // Handlers Designação F 001-03
  const handleSaveDesignacao = async (data: Partial<DesignacaoFuncoesF001_03>) => {
    await api.createDesignacao(data);
    await carregarDados();
  };

  const handleAssinarRT = async (id_designacao: number) => {
    await api.assinarDesignacaoRT(id_designacao);
    await carregarDados();
  };

  // Handlers Treinamento MNT-002
  const handleSaveTreinamento = async (data: Partial<TreinamentoMNT002>) => {
    await api.createTreinamento(data);
    await carregarDados();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header com Navegação e Badges Regulatórios */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTecnico={() => {
          setTecnicoParaEdicao(null);
          setIsTecnicoModalOpen(true);
        }}
        onOpenAuditSim={() => setIsAuditSimOpen(true)}
        quarantineCount={stats?.ferramentas_quarentena ?? 0}
        expiredToolsCount={stats?.ferramentas_calibracao_vencida ?? 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* KPI & Regulatory Audit Cards - Exibir nas abas de RH */}
        {(activeTab === 'tecnicos' || activeTab === 'designacoes' || activeTab === 'treinamentos') && (
          <StatsCards
            stats={stats}
            onFilterStatus={(st) => {
              setFiltroStatus(st);
              setActiveTab('tecnicos');
            }}
            onFilterPendingRT={() => {
              setActiveTab('designacoes');
            }}
            onFilterVencidos={() => {
              setActiveTab('treinamentos');
            }}
          />
        )}

        {/* Tab Content - Parte 6: Garantia da Qualidade, Liberação / RTS e Arquivo Técnico (MOMQ 5.7 / RBAC 43.9 / EASA) */}
        {(activeTab === 'qualidade' || activeTab === 'rts' || activeTab === 'arquivo-tecnico' || activeTab === 'diretoria') && (
          <QualityReleaseView
            bases={bases}
            tecnicos={tecnicos}
            onRefreshGlobal={carregarDados}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Tab Content - Parte 5: Hangar, Execução de Linha e Inspeções */}
        {(activeTab === 'hangar' || activeTab === 'execucao-linha') && (
          <HangarExecutionView
            bases={bases}
            tecnicos={tecnicos}
            onRefreshGlobal={carregarDados}
          />
        )}

        {/* Tab Content - Parte 4: PCP, Comercial e Ordens de Serviço (Form F 001-09-2) */}
        {(activeTab === 'pcp' || activeTab === 'ordens-servico' || activeTab === 'workflow-comercial' || activeTab === 'modelos-eo') && (
          <PcpView
            bases={bases}
            tecnicos={tecnicos}
            onRefreshGlobal={carregarDados}
            initialTab={
              activeTab === 'workflow-comercial'
                ? 'workflow-comercial'
                : activeTab === 'modelos-eo'
                ? 'modelos-eo'
                : 'ordens-servico'
            }
          />
        )}

        {/* Tab Content - Parte 3: CTM, Publicações e Diretrizes de Aeronavegabilidade */}
        {(activeTab === 'ctm' || activeTab === 'fcda' || activeTab === 'relatorio-mandatorias') && (
          <CtmView
            tecnicos={tecnicos}
            bases={bases}
            onRefreshGlobal={carregarDados}
            initialSubTab={
              activeTab === 'fcda'
                ? 'fcda'
                : activeTab === 'relatorio-mandatorias'
                ? 'relatorio-mensal'
                : 'publicacoes'
            }
          />
        )}

        {/* Tab Content - Parte 2: Ferramentaria e Quarentena */}
        {(activeTab === 'ferramentaria' || activeTab === 'quarentena') && (
          <ToolingView
            bases={bases}
            tecnicos={tecnicos}
            onRefreshData={carregarDados}
          />
        )}

        {/* Tab Content - Parte 1: RH & Qualificação */}
        {activeTab === 'tecnicos' && (
          <TechnicianList
            tecnicos={tecnicos}
            bases={bases}
            onSelectTecnicoDossier={(tec) => {
              setTecnicoDossier(tec);
              setIsDossierModalOpen(true);
            }}
            onOpenNovaDesignacao={(tec) => {
              setTecnicoPreDesig(tec);
              setIsDesignacaoModalOpen(true);
            }}
            onOpenNovoTreinamento={(tec) => {
              setTecnicoPreTreino(tec);
              setIsTrainingModalOpen(true);
            }}
            onEditTecnico={(tec) => {
              setTecnicoParaEdicao(tec);
              setIsTecnicoModalOpen(true);
            }}
            onToggleAtivo={handleToggleAtivo}
            onAssinarRT={handleAssinarRT}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
          />
        )}

        {activeTab === 'designacoes' && (
          <DesignationsView
            designacoes={designacoes}
            tecnicos={tecnicos}
            onAssinarRT={handleAssinarRT}
            onOpenNovaDesignacao={(tec) => {
              setTecnicoPreDesig(tec || null);
              setIsDesignacaoModalOpen(true);
            }}
          />
        )}

        {activeTab === 'treinamentos' && (
          <TrainingMatrixView
            tecnicos={tecnicos}
            treinamentos={treinamentos}
            onOpenNovoTreinamento={(tec) => {
              setTecnicoPreTreino(tec || null);
              setIsTrainingModalOpen(true);
            }}
          />
        )}

        {activeTab === 'relatorio-f001-07' && (
          <ReportF00107View bases={bases} />
        )}

        {activeTab === 'regras-auditoria' && (
          <RegulatoryRulesView />
        )}

        {/* Master Directory of Official Forms (Zero Divergence) */}
        {activeTab === 'formularios-oficiais' && (
          <OfficialFormsDirectoryView
            bases={bases}
            tecnicos={tecnicos}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 px-4 text-xs text-slate-400 font-mono print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Impacto Aviation Ltda • Sistema MRO Certificado ANAC COM 200607-05 / EASA.145.1003
          </div>
          <div className="text-[11px] text-slate-500">
            RBAC 145 • RBAC 65 • RBAC 43 • MOMQ MNT-001 (Rev 08) • Zero Risk Audit
          </div>
        </div>
      </footer>

      {/* Modal Cadastro/Edição de Técnico */}
      <TechnicianModal
        isOpen={isTecnicoModalOpen}
        onClose={() => {
          setIsTecnicoModalOpen(false);
          setTecnicoParaEdicao(null);
        }}
        onSave={handleSaveTecnico}
        bases={bases}
        tecnicoParaEdicao={tecnicoParaEdicao}
      />

      {/* Modal Dossiê do Técnico */}
      <TechnicianDossierModal
        tecnico={tecnicoDossier}
        isOpen={isDossierModalOpen}
        onClose={() => {
          setIsDossierModalOpen(false);
          setTecnicoDossier(null);
        }}
        onAssinarRT={handleAssinarRT}
        onOpenNovaDesignacao={(tec) => {
          setTecnicoPreDesig(tec);
          setIsDesignacaoModalOpen(true);
        }}
        onOpenNovoTreinamento={(tec) => {
          setTecnicoPreTreino(tec);
          setIsTrainingModalOpen(true);
        }}
      />

      {/* Modal Emissão de Designação F 001-03 */}
      <DesignationModal
        isOpen={isDesignacaoModalOpen}
        onClose={() => {
          setIsDesignacaoModalOpen(false);
          setTecnicoPreDesig(null);
        }}
        tecnicos={tecnicos}
        tecnicoPreSelecionado={tecnicoPreDesig}
        onSave={handleSaveDesignacao}
      />

      {/* Modal Registro de Treinamento MNT-002 */}
      <TrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => {
          setIsTrainingModalOpen(false);
          setTecnicoPreTreino(null);
        }}
        tecnicos={tecnicos}
        tecnicoPreSelecionado={tecnicoPreTreino}
        onSave={handleSaveTreinamento}
      />

      {/* Modal Simulador de Auditoria e Trava de Assinatura */}
      <AuditSimulatorModal
        isOpen={isAuditSimOpen}
        onClose={() => setIsAuditSimOpen(false)}
        tecnicos={tecnicos}
      />
    </div>
  );
}
