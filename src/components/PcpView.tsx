import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  Printer,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Building,
  Plane,
  Wrench,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowRight,
  FileSpreadsheet,
  Check,
  X,
} from 'lucide-react';
import {
  OrdemServicoF001_09_2,
  SolicitacaoComercial,
  ModeloHomologadoEO,
  PcpStats,
  BaseSigla,
  StatusOrdemServico,
  TecnicoComQualificacao,
  Ferramenta,
  BaseOperacional,
} from '../types/mro';
import { apiClient } from '../services/apiClient';
import { WorkOrderPrintModal } from './WorkOrderPrintModal';
import { WorkOrderModal } from './WorkOrderModal';
import { CommercialRequestModal } from './CommercialRequestModal';

interface PcpViewProps {
  bases: BaseOperacional[];
  tecnicos: TecnicoComQualificacao[];
  onRefreshGlobal?: () => void;
  initialTab?: 'ordens-servico' | 'workflow-comercial' | 'modelos-eo';
}

export const PcpView: React.FC<PcpViewProps> = ({
  bases,
  tecnicos,
  onRefreshGlobal,
  initialTab = 'ordens-servico',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ordens-servico' | 'workflow-comercial' | 'modelos-eo'>(initialTab);

  // Data states
  const [ordensServico, setOrdensServico] = useState<OrdemServicoF001_09_2[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoComercial[]>([]);
  const [modelosEO, setModelosEO] = useState<ModeloHomologadoEO[]>([]);
  const [pcpStats, setPcpStats] = useState<PcpStats | null>(null);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtroStatusOS, setFiltroStatusOS] = useState<string>('TODOS');
  const [filtroBaseOS, setFiltroBaseOS] = useState<string>('TODAS');
  const [filtroSearchOS, setFiltroSearchOS] = useState<string>('');

  const [filtroStatusSol, setFiltroStatusSol] = useState<string>('TODOS');
  const [filtroBaseSol, setFiltroBaseSol] = useState<string>('TODAS');
  const [filtroSearchSol, setFiltroSearchSol] = useState<string>('');

  // Modals state
  const [isNewOSModalOpen, setIsNewOSModalOpen] = useState(false);
  const [solicitacaoParaOS, setSolicitacaoParaOS] = useState<SolicitacaoComercial | null>(null);
  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState(false);
  const [selectedOSToPrint, setSelectedOSToPrint] = useState<OrdemServicoF001_09_2 | null>(null);

  // Status Change / Close Work Order Modal
  const [osParaStatus, setOsParaStatus] = useState<OrdemServicoF001_09_2 | null>(null);
  const [novoStatus, setNovoStatus] = useState<StatusOrdemServico>('EM_EXECUCAO');
  const [repOperadorNome, setRepOperadorNome] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [osData, solData, eoData, statsData, toolsData] = await Promise.all([
        apiClient.getOrdensServico({
          status: filtroStatusOS !== 'TODOS' ? filtroStatusOS : undefined,
          base: filtroBaseOS !== 'TODAS' ? filtroBaseOS : undefined,
          search: filtroSearchOS || undefined,
        }),
        apiClient.getSolicitacoesComerciais({
          status: filtroStatusSol !== 'TODOS' ? filtroStatusSol : undefined,
          base: filtroBaseSol !== 'TODAS' ? filtroBaseSol : undefined,
          search: filtroSearchSol || undefined,
        }),
        apiClient.getModelosEO(),
        apiClient.getPcpStats(),
        apiClient.getFerramentas(),
      ]);

      setOrdensServico(osData);
      setSolicitacoes(solData);
      setModelosEO(eoData);
      setPcpStats(statsData);
      setFerramentas(toolsData);
    } catch (err) {
      console.error('Erro ao carregar dados do PCP:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtroStatusOS, filtroBaseOS, filtroSearchOS, filtroStatusSol, filtroBaseSol, filtroSearchSol]);

  const handleOpenOSFromSolicitacao = (sol: SolicitacaoComercial) => {
    setSolicitacaoParaOS(sol);
    setIsNewOSModalOpen(true);
  };

  const handleOpenDirectOS = () => {
    setSolicitacaoParaOS(null);
    setIsNewOSModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!osParaStatus) return;
    setIsUpdatingStatus(true);
    try {
      const agora = new Date();
      await apiClient.updateStatusOrdemServico(osParaStatus.id_os, novoStatus, {
        data_encerramento_real: agora.toLocaleDateString('pt-BR'),
        hora_encerramento_real: `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')} UTC`,
        representante_operador: repOperadorNome || osParaStatus.representante_operador_nome,
      });

      setOsParaStatus(null);
      await carregarDados();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      alert(`Erro ao atualizar status da OS: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context Badges */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PARTE 4 • COMERCIAL & PCP
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                MOMQ 6.3 • I 001-09
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                FORM F 001-09-2
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                HOMOLOGAÇÃO: COM 200607-05 / EASA.145.1003
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-3">
              <span>Planejamento e Controle da Produção (PCP) & Workflow Comercial</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Gestão integrada de agendamentos com antecedência regulamentar (mínimo 24h), validação automática de Especificações Operativas (EO) por base, checagem compulsória de Carta de Concessão de Manuais (IS 145.109-001) e emissão inviolável de Ordens de Serviço (Form F 001-09-2) com travas técnicas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCommercialModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shadow-md transition"
            >
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Nova Solicitação Cliente</span>
            </button>

            <button
              onClick={handleOpenDirectOS}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Ordem de Serviço (OS)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards do PCP */}
      {pcpStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total de OSs</span>
            <div className="text-2xl font-black text-white font-mono mt-1">{pcpStats.total_ordens_servico}</div>
            <span className="text-[9px] text-slate-500 mt-1">Histórico completo</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-blue-400 uppercase">OSs Abertas</span>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1">{pcpStats.os_abertas}</div>
            <span className="text-[9px] text-blue-500/70 mt-1">Aguardando início</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-amber-400 uppercase">Em Execução</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{pcpStats.os_em_execucao}</div>
            <span className="text-[9px] text-amber-500/70 mt-1">Em hangar / linha</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-purple-400 uppercase">Ag. Inspeção</span>
            <div className="text-2xl font-black text-purple-400 font-mono mt-1">{pcpStats.os_aguardando_inspecao}</div>
            <span className="text-[9px] text-purple-500/70 mt-1">Inspetor APRS</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Encerradas</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{pcpStats.os_encerradas}</div>
            <span className="text-[9px] text-emerald-500/70 mt-1">Liberadas p/ voo</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Sol. Pendentes</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{pcpStats.solicitacoes_pendentes}</div>
            <span className="text-[9px] text-cyan-500/70 mt-1">Análise comercial</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-indigo-400 uppercase">FCDAs Vínculo</span>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1">{pcpStats.total_fcdas_vinculadas}</div>
            <span className="text-[9px] text-indigo-500/70 mt-1">DAs/ADs mandatórias</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Pontualidade</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{pcpStats.taxa_pontualidade_percentual}%</div>
            <span className="text-[9px] text-emerald-500/70 mt-1">Liberação no slot</span>
          </div>
        </div>
      )}

      {/* Navegação entre Abas do PCP */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('ordens-servico')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'ordens-servico'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Ordens de Serviço (Form F 001-09-2)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {ordensServico.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('workflow-comercial')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'workflow-comercial'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Workflow Comercial & Agendamento</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {solicitacoes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('modelos-eo')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'modelos-eo'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Especificações Operativas (EO) por Base</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {modelosEO.length}
          </span>
        </button>
      </div>

      {/* ABA 1: TABELA DE ORDENS DE SERVIÇO (Form F 001-09-2) */}
      {activeSubTab === 'ordens-servico' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filtroSearchOS}
                  onChange={(e) => setFiltroSearchOS(e.target.value)}
                  placeholder="Buscar por Nº OS, Matrícula, Operador ou Modelo..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filtroBaseOS}
                onChange={(e) => setFiltroBaseOS(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-mono focus:outline-none"
              >
                <option value="TODAS">Todas as Bases</option>
                <option value="GRU">Base Sede GRU</option>
                <option value="CNF">Base Secundária CNF</option>
                <option value="VCP">Base Secundária VCP</option>
              </select>

              <select
                value={filtroStatusOS}
                onChange={(e) => setFiltroStatusOS(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-mono focus:outline-none"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="ABERTA">Aberta</option>
                <option value="EM_EXECUCAO">Em Execução</option>
                <option value="AGUARDANDO_INSPECAO">Aguardando Inspeção</option>
                <option value="ENCERRADA">Encerrada</option>
              </select>
            </div>

            <button
              onClick={carregarDados}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Tabela de OSs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 border-b border-slate-700 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nº da OS (PCP)</th>
                    <th className="py-3 px-4">Aeronave & Operador</th>
                    <th className="py-3 px-4">Base & Cronograma</th>
                    <th className="py-3 px-4">Status OS</th>
                    <th className="py-3 px-4">Equipe Técnica</th>
                    <th className="py-3 px-4">DAs / FCDA</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {ordensServico.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-500">
                        Nenhuma Ordem de Serviço encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    ordensServico.map((os) => {
                      const isEncerrada = os.status_os === 'ENCERRADA';

                      return (
                        <tr key={os.id_os} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-cyan-400 block">{os.numero_os}</span>
                            <span className="text-[10px] text-slate-500">Form F 001-09-2</span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center space-x-1.5">
                              <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 border border-slate-700">
                                {os.campo_02_matricula}
                              </span>
                              <span className="text-slate-300">{os.campo_03_modelo}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {os.campo_05_operador} (MSN: {os.campo_04_msn})
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px]">
                            <div className="font-bold text-slate-300">Base {os.campo_06_base_executante}</div>
                            <div className="text-[10px] text-slate-400">
                              {os.campo_07_data_abertura} {os.campo_07_hora_abertura}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Prev: {os.campo_08_data_encerramento_prevista} {os.campo_08_hora_encerramento_prevista}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                                os.status_os === 'ENCERRADA'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : os.status_os === 'EM_EXECUCAO'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : os.status_os === 'AGUARDANDO_INSPECAO'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {os.status_os === 'ENCERRADA'
                                ? '✓ ENCERRADA'
                                : os.status_os === 'EM_EXECUCAO'
                                ? '⚡ EM EXECUÇÃO'
                                : os.status_os === 'AGUARDANDO_INSPECAO'
                                ? '🔍 AG. INSPEÇÃO'
                                : '⏳ ABERTA'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[11px]">
                            <div className="text-slate-300 truncate max-w-[180px]">
                              MMA: <strong className="text-white">{os.mecanico_executor_nome}</strong>
                            </div>
                            <div className="text-slate-400 text-[10px] font-mono">
                              APRS: {os.inspetor_aprs_nome} ({os.inspetor_aprs_canac})
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px]">
                            {os.diretrizes_vinculadas && os.diretrizes_vinculadas.length > 0 ? (
                              <div className="space-y-0.5">
                                {os.diretrizes_vinculadas.map((d, i) => (
                                  <div key={i} className="text-blue-300 text-[10px] flex items-center space-x-1">
                                    <span className="font-bold">{d.numero_diretriz}</span>
                                    {d.numero_fcda && (
                                      <span className="text-[9px] text-cyan-400 font-bold">({d.numero_fcda})</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[10px]">N/A</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Botão de Atualizar Status */}
                              <button
                                onClick={() => {
                                  setOsParaStatus(os);
                                  setNovoStatus(
                                    os.status_os === 'ABERTA'
                                      ? 'EM_EXECUCAO'
                                      : os.status_os === 'EM_EXECUCAO'
                                      ? 'AGUARDANDO_INSPECAO'
                                      : os.status_os === 'AGUARDANDO_INSPECAO'
                                      ? 'ENCERRADA'
                                      : 'ENCERRADA'
                                  );
                                  setRepOperadorNome(os.representante_operador_nome || '');
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                                title="Alterar status de execução / encerrar OS"
                              >
                                Status
                              </button>

                              {/* Botão de Visualização / Impressão A4 com Zero Divergência */}
                              <button
                                onClick={() => setSelectedOSToPrint(os)}
                                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Imprimir A4</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: WORKFLOW COMERCIAL & AGENDAMENTOS */}
      {activeSubTab === 'workflow-comercial' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filtroSearchSol}
                  onChange={(e) => setFiltroSearchSol(e.target.value)}
                  placeholder="Buscar solicitação por operador, matrícula ou escopo..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <select
                value={filtroBaseSol}
                onChange={(e) => setFiltroBaseSol(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-mono focus:outline-none"
              >
                <option value="TODAS">Todas as Bases</option>
                <option value="GRU">Base Sede GRU</option>
                <option value="CNF">Base Secundária CNF</option>
                <option value="VCP">Base Secundária VCP</option>
              </select>

              <select
                value={filtroStatusSol}
                onChange={(e) => setFiltroStatusSol(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-mono focus:outline-none"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="NOVA">Nova</option>
                <option value="EM_ANALISE_PCP">Em Análise PCP</option>
                <option value="APROVADA_OS_GERADA">Aprovada (OS Gerada)</option>
                <option value="RECUSADA_REPROVADA">Recusada</option>
              </select>
            </div>

            <button
              onClick={() => setIsCommercialModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Solicitação</span>
            </button>
          </div>

          {/* Cards de Solicitações Comerciais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solicitacoes.map((sol) => {
              const isAntecedenciaOk = sol.antecedencia_valida_24h;
              const isEOOk = sol.elegivel_eo_base;
              const isCartaOk = sol.possui_carta_concessao_ativa;
              const podeGerarOS = isEOOk && isCartaOk && sol.status !== 'APROVADA_OS_GERADA' && sol.status !== 'RECUSADA_REPROVADA';

              return (
                <div
                  key={sol.id_solicitacao}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-cyan-400 font-black text-sm">{sol.numero_solicitacao}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                            Base {sol.base_solicitada}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1">{sol.operador_cliente}</h4>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                          sol.status === 'APROVADA_OS_GERADA'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sol.status === 'RECUSADA_REPROVADA'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : sol.status === 'EM_ANALISE_PCP'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {sol.status}
                      </span>
                    </div>

                    {/* Dados da Aeronave */}
                    <div className="bg-slate-800/60 rounded-xl p-3 grid grid-cols-3 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Matrícula</span>
                        <strong className="text-blue-300 text-sm">{sol.matricula_aeronave}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-500 uppercase block">Modelo</span>
                        <strong className="text-white truncate block">{sol.modelo_aeronave}</strong>
                      </div>
                    </div>

                    {/* Escopo de Serviço */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Escopo Solicitado:
                      </span>
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        {sol.escopo_servico}
                      </p>
                    </div>

                    {/* Verificações Regulatórias Automáticas (MOMQ 6.3 / IS 145.109-001) */}
                    <div className="space-y-1.5 pt-1">
                      {/* 1. Antecedência */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Antecedência (mínimo 24h):</span>
                        <span
                          className={`font-bold flex items-center space-x-1 ${
                            isAntecedenciaOk ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {isAntecedenciaOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{sol.horas_antecedencia}h {isAntecedenciaOk ? '(Conforme)' : '(Alerta < 24h)'}</span>
                        </span>
                      </div>

                      {/* 2. EO da Base */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">EO Base ({sol.base_solicitada}):</span>
                        <span
                          className={`font-bold flex items-center space-x-1 ${
                            isEOOk ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isEOOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
                          <span>{isEOOk ? 'Homologado na Base' : 'Não Consta na EO'}</span>
                        </span>
                      </div>

                      {/* 3. Carta de Concessão de Manuais */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Carta de Concessão:</span>
                        <span
                          className={`font-bold flex items-center space-x-1 ${
                            isCartaOk ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isCartaOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
                          <span>{isCartaOk ? `${sol.numero_carta_concessao}` : 'Ausência de Carta'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Alertas / Bloqueios específicos */}
                    {sol.motivo_incompatibilidade_eo && (
                      <div className="p-2 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 text-[10.5px]">
                        ⚠️ {sol.motivo_incompatibilidade_eo}
                      </div>
                    )}
                    {sol.alerta_antecedencia && (
                      <div className="p-2 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-300 text-[10.5px]">
                        ⚠️ {sol.alerta_antecedencia}
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card com Ação */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Início Previsto: {new Date(sol.data_hora_prevista_inicio).toLocaleDateString('pt-BR')} {new Date(sol.data_hora_prevista_inicio).toLocaleTimeString('pt-BR')}
                    </span>

                    {sol.status === 'APROVADA_OS_GERADA' ? (
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1">
                        <Check className="w-4 h-4" />
                        <span>OS {sol.numero_os_gerada}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenOSFromSolicitacao(sol)}
                        disabled={!podeGerarOS}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-bold transition shadow"
                      >
                        <span>Abrir OS no PCP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: ESPECIFICAÇÕES OPERATIVAS (EO) POR BASE */}
      {activeSubTab === 'modelos-eo' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plane className="w-5 h-5 text-cyan-400" />
                <span>Matriz de Frotas e Modelos Homologados nas Especificações Operativas (EO)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Conforme RBAC 145 e Portarias da ANAC emitidas sob o Certificado de Organização de Manutenção COM 200607-05 / EASA.145.1003. Aberturas de OS em bases não autorizadas são bloqueadas pelo sistema.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* BASE GRU */}
              <div className="bg-slate-800/60 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">Base Sede GRU</h4>
                    <span className="text-[10px] text-blue-400 font-mono">SBGR • Hangar Principal</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300">
                    BASE PRINCIPAL
                  </span>
                </div>
                <div className="space-y-1.5">
                  {modelosEO
                    .filter((m) => m.bases_homologadas.includes('GRU'))
                    .map((m, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
                        <strong className="text-white block font-mono">{m.codigo_modelo}</strong>
                        <span className="text-[10px] text-slate-400">{m.descricao}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* BASE CNF */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">Base Secundária CNF</h4>
                    <span className="text-[10px] text-cyan-400 font-mono">SBCF • Linha & Check</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-300">
                    BASE SECUNDÁRIA
                  </span>
                </div>
                <div className="space-y-1.5">
                  {modelosEO
                    .filter((m) => m.bases_homologadas.includes('CNF'))
                    .map((m, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
                        <strong className="text-white block font-mono">{m.codigo_modelo}</strong>
                        <span className="text-[10px] text-slate-400">{m.descricao}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* BASE VCP */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">Base Secundária VCP</h4>
                    <span className="text-[10px] text-cyan-400 font-mono">SBKP • Hangar Viracopos</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-300">
                    BASE SECUNDÁRIA
                  </span>
                </div>
                <div className="space-y-1.5">
                  {modelosEO
                    .filter((m) => m.bases_homologadas.includes('VCP'))
                    .map((m, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
                        <strong className="text-white block font-mono">{m.codigo_modelo}</strong>
                        <span className="text-[10px] text-slate-400">{m.descricao}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ABERTURA DE ORDEM DE SERVIÇO (Form F 001-09-2) */}
      <WorkOrderModal
        isOpen={isNewOSModalOpen}
        onClose={() => {
          setIsNewOSModalOpen(false);
          setSolicitacaoParaOS(null);
        }}
        onSuccess={async (novaOS) => {
          await carregarDados();
          setSelectedOSToPrint(novaOS);
        }}
        solicitacaoOrigem={solicitacaoParaOS}
        tecnicos={tecnicos}
        ferramentas={ferramentas}
        bases={bases}
      />

      {/* MODAL 2: NOVA SOLICITAÇÃO COMERCIAL */}
      <CommercialRequestModal
        isOpen={isCommercialModalOpen}
        onClose={() => setIsCommercialModalOpen(false)}
        onSuccess={async () => {
          await carregarDados();
        }}
      />

      {/* MODAL 3: IMPRESSÃO A4 OFICIAL FORM F 001-09-2 (DIRETRIZ 7 - ZERO DIVERGÊNCIA) */}
      {selectedOSToPrint && (
        <WorkOrderPrintModal
          isOpen={true}
          onClose={() => setSelectedOSToPrint(null)}
          workOrder={selectedOSToPrint}
        />
      )}

      {/* MODAL 4: ATUALIZAÇÃO DE STATUS E ENCERRAMENTO DA OS */}
      {osParaStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                Atualizar Status da OS: {osParaStatus.numero_os}
              </h3>
              <button onClick={() => setOsParaStatus(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Novo Status da OS:</label>
                <select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value as StatusOrdemServico)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                >
                  <option value="ABERTA">Aberta</option>
                  <option value="EM_EXECUCAO">Em Execução</option>
                  <option value="AGUARDANDO_INSPECAO">Aguardando Inspeção Final (APRS)</option>
                  <option value="ENCERRADA">Encerrada (Liberação Retorno ao Serviço)</option>
                </select>
              </div>

              {novoStatus === 'ENCERRADA' && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2 text-emerald-300">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Regulamento de Encerramento (RBAC 145 / EASA)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ao encerrar a OS, todas as ferramentas vinculadas serão liberadas para o estoque como <strong>DISPONÍVEIS</strong> e a declaração de liberação para retorno ao serviço será assinada.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 mb-1">
                      Representante do Operador (Campo 22 - Aceite):
                    </label>
                    <input
                      type="text"
                      value={repOperadorNome}
                      onChange={(e) => setRepOperadorNome(e.target.value)}
                      placeholder="Ex: Cap. Fernando Menezes (Comandante da Aeronave)"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOsParaStatus(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isUpdatingStatus}
                className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                {isUpdatingStatus ? 'Salvando...' : 'Confirmar Atualização'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
