import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  PlusCircle,
  Search,
  Filter,
  ArrowRightLeft,
  Calendar,
  Tag,
  FileText,
  AlertOctagon,
  Building,
  RefreshCw,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Ban
} from 'lucide-react';
import {
  FerramentaDetalhada,
  BaseOperacional,
  PessoalTecnico,
  MovimentacaoFerramentaF001_06_1,
  QuarentenaFerramentaF001_06_4,
  ControleCalibracaoF001_06
} from '../types/mro';
import { apiClient } from '../services/apiClient';
import { ToolModal } from './ToolModal';
import { CalibrationModal } from './CalibrationModal';
import { MovementModal } from './MovementModal';
import { QuarantineModal } from './QuarantineModal';
import { ToolTagModal } from './ToolTagModal';

interface ToolingViewProps {
  bases: BaseOperacional[];
  tecnicos: PessoalTecnico[];
  onRefreshData?: () => void;
}

export const ToolingView: React.FC<ToolingViewProps> = ({
  bases,
  tecnicos,
  onRefreshData
}) => {
  const [subTab, setSubTab] = useState<'inventario' | 'movimentacoes' | 'quarentena' | 'calibracoes'>('inventario');
  const [tools, setTools] = useState<FerramentaDetalhada[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFerramentaF001_06_1[]>([]);
  const [quarentenas, setQuarentenas] = useState<QuarentenaFerramentaF001_06_4[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBase, setSelectedBase] = useState<string>('TODAS');
  const [selectedStatusOp, setSelectedStatusOp] = useState<string>('TODOS');
  const [selectedStatusCal, setSelectedStatusCal] = useState<string>('TODOS');

  // Modals state
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [toolToEdit, setToolToEdit] = useState<FerramentaDetalhada | null>(null);

  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [calibrationTool, setCalibrationTool] = useState<FerramentaDetalhada | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementTool, setMovementTool] = useState<FerramentaDetalhada | null>(null);

  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);
  const [quarantineTool, setQuarantineTool] = useState<FerramentaDetalhada | null>(null);

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagTool, setTagTool] = useState<FerramentaDetalhada | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [toolsData, movData, quarData] = await Promise.all([
        apiClient.getFerramentas(),
        apiClient.getMovimentacoes(),
        apiClient.getQuarentenas()
      ]);
      setTools(toolsData);
      setMovimentacoes(movData);
      setQuarentenas(quarData);
    } catch (err) {
      console.error('Erro ao carregar dados de ferramentaria:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
    if (onRefreshData) onRefreshData();
  };

  // KPIs
  const totalTools = tools.length;
  const toolsDisponiveis = tools.filter(t => t.status_operacional === 'DISPONIVEL').length;
  const toolsEmUso = tools.filter(t => t.status_operacional === 'EM_USO').length;
  const toolsEmCalibracao = tools.filter(t => t.status_operacional === 'EM_CALIBRACAO').length;
  const toolsQuarentena = tools.filter(t => t.status_operacional === 'QUARENTENA').length;

  const toolsVencidas = tools.filter(t => t.status_calibracao === 'VENCIDA').length;
  const toolsAVencer = tools.filter(t => t.status_calibracao === 'A_VENCER').length;

  // Filtered tools
  const filteredTools = tools.filter(tool => {
    const loc = tool.localizacao_fisica || tool.posicao_localizacao || '';
    const matchesSearch =
      tool.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBase =
      selectedBase === 'TODAS' || (tool.id_base !== undefined && tool.id_base.toString() === selectedBase);

    const matchesStatusOp =
      selectedStatusOp === 'TODOS' || (tool.status_operacional || tool.status) === selectedStatusOp;

    const matchesStatusCal =
      selectedStatusCal === 'TODOS' || tool.status_calibracao === selectedStatusCal;

    return matchesSearch && matchesBase && matchesStatusOp && matchesStatusCal;
  });

  // Action triggers
  const handleOpenMovement = (tool: FerramentaDetalhada) => {
    setMovementTool(tool);
    setIsMovementModalOpen(true);
  };

  const handleOpenCalibration = (tool: FerramentaDetalhada) => {
    setCalibrationTool(tool);
    setIsCalibrationModalOpen(true);
  };

  const handleOpenQuarantine = (tool: FerramentaDetalhada) => {
    setQuarantineTool(tool);
    setIsQuarantineModalOpen(true);
  };

  const handleOpenTag = (tool: FerramentaDetalhada) => {
    setTagTool(tool);
    setIsTagModalOpen(true);
  };

  const handleEditTool = (tool: FerramentaDetalhada) => {
    setToolToEdit(tool);
    setIsToolModalOpen(true);
  };

  const handleCreateNewTool = () => {
    setToolToEdit(null);
    setIsToolModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: HEADER & REGULATORY KPIs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                PARTE 2 — MRO TOOLING & METROLOGY
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                RBAC 145.109 / MOMQ MNT-001
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Wrench className="w-7 h-7 text-amber-400" />
              Ferramentaria, Controle de Calibração & Quarentena
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Gestão de inventário PME calibrável, aferições metrológicas com validação de desvio padrão (BTI-PMP-05), controle diário de retirada/devolução (F 001-06-1) e segregação com emissão de Tag Vermelha (F 001-01-6) e Ficha F 001-06-04.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
              title="Recarregar Dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={handleCreateNewTool}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Cadastrar Ferramenta
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Ferramental
            </span>
            <span className="text-2xl font-black text-white font-mono">{totalTools}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Cadastrados no MRO</span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Disponíveis
            </span>
            <span className="text-2xl font-black text-emerald-300 font-mono">{toolsDisponiveis}</span>
            <span className="text-[10px] text-emerald-500/80 block mt-0.5">Aptas para uso em OS</span>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-800/40 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Em Uso Técnico
            </span>
            <span className="text-2xl font-black text-cyan-300 font-mono">{toolsEmUso}</span>
            <span className="text-[10px] text-cyan-500/80 block mt-0.5">Form F 001-06-1 ativo</span>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Calibração Vencendo
            </span>
            <span className="text-2xl font-black text-amber-300 font-mono">{toolsAVencer}</span>
            <span className="text-[10px] text-amber-500/80 block mt-0.5">A vencer em ≤ 30 dias</span>
          </div>

          <div className="bg-rose-950/30 border border-rose-800/50 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
              Calibração Vencida
            </span>
            <span className="text-2xl font-black text-rose-300 font-mono">{toolsVencidas}</span>
            <span className="text-[10px] text-rose-500/80 block mt-0.5">Bloqueio Automático #2</span>
          </div>

          <div className="bg-red-950/40 border border-red-700/60 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
              Em Quarentena
            </span>
            <span className="text-2xl font-black text-red-200 font-mono">{toolsQuarentena}</span>
            <span className="text-[10px] text-red-400/80 block mt-0.5">Tag F 001-01-6 Ativa</span>
          </div>
        </div>
      </div>

      {/* REGULATORY ALERT BANNER (IF EXPIRED OR IN QUARANTINE) */}
      {toolsVencidas > 0 && (
        <div className="p-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-l-4 border-red-600 border border-red-800/50 rounded-lg shadow-lg flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-200 uppercase tracking-wide flex items-center gap-2">
              ALERTA REGULAMENTAR CRÍTICO — RBAC 145 / MOMQ MNT-001 (Rev 08)
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Existem <strong>{toolsVencidas} ferramenta(s)</strong> com calibração vencida detectadas pelo sistema de auditoria. Conforme a <strong>Regra Inviolável #2</strong>, essas ferramentas estão estritamente bloqueadas para vinculação em Ordens de Serviço (OS) e devem ser enviadas imediatamente à Área Segregada de Quarentena com emissão da <strong>Tag Vermelha F 001-01-6</strong>.
            </p>
          </div>
          <button
            onClick={() => setSelectedStatusCal('VENCIDA')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded shadow transition-colors shrink-0"
          >
            Filtrar Vencidas
          </button>
        </div>
      )}

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 rounded-t-xl px-4 pt-2 gap-2">
        <button
          onClick={() => setSubTab('inventario')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            subTab === 'inventario'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Inventário de Ferramental ({totalTools})
        </button>

        <button
          onClick={() => setSubTab('movimentacoes')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            subTab === 'movimentacoes'
              ? 'border-cyan-500 text-cyan-400 bg-slate-800/50 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Movimentação Diária (Form F 001-06-1)
          {toolsEmUso > 0 && (
            <span className="px-1.5 py-0.2 bg-cyan-900 text-cyan-200 rounded-full text-[10px] font-mono">
              {toolsEmUso}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('quarentena')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            subTab === 'quarentena'
              ? 'border-red-500 text-red-400 bg-slate-800/50 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Segregação & Quarentena (F 001-06-04 / Tag F 001-01-6)
          {toolsQuarentena > 0 && (
            <span className="px-1.5 py-0.2 bg-red-900 text-red-200 rounded-full text-[10px] font-mono">
              {toolsQuarentena}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('calibracoes')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            subTab === 'calibracoes'
              ? 'border-yellow-400 text-yellow-400 bg-slate-800/50 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Histórico de Calibrações (Form F 001-06)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: INVENTÁRIO GERAL                                               */}
      {/* ========================================================================= */}
      {subTab === 'inventario' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descrição, Part Number (PN), Serial Number (SN) ou gaveta/armário..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="TODAS">Todas as Bases</option>
                {bases.map(b => (
                  <option key={b.id_base} value={b.id_base.toString()}>
                    {b.nome_base}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusOp}
                onChange={(e) => setSelectedStatusOp(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="TODOS">Status Operacional (Todos)</option>
                <option value="DISPONIVEL">Disponível</option>
                <option value="EM_USO">Em Uso Técnico</option>
                <option value="EM_CALIBRACAO">Em Calibração</option>
                <option value="QUARENTENA">Em Quarentena</option>
                <option value="BAIXADA">Baixada / Sucateada</option>
              </select>

              <select
                value={selectedStatusCal}
                onChange={(e) => setSelectedStatusCal(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="TODOS">Calibração (Todos)</option>
                <option value="EM_DIA">Calibração Em Dia</option>
                <option value="A_VENCER">A Vencer (≤ 30d)</option>
                <option value="VENCIDA">Calibração VENCIDA</option>
                <option value="NAO_APLICAVEL">N/A (Não calibrável)</option>
              </select>
            </div>
          </div>

          {/* TABLE OF TOOLS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Ferramenta / Identificação</th>
                    <th className="px-4 py-3">PN & Serial (SN)</th>
                    <th className="px-4 py-3">Posição / Base</th>
                    <th className="px-4 py-3">Propriedade</th>
                    <th className="px-4 py-3">Status Metrológico</th>
                    <th className="px-4 py-3">Status Operacional</th>
                    <th className="px-4 py-3 text-right">Ações Regulamentares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredTools.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        Nenhuma ferramenta encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredTools.map((tool) => {
                      const isVencida = tool.status_calibracao === 'VENCIDA';
                      const isAVencer = tool.status_calibracao === 'A_VENCER';
                      const isQuarentena = tool.status_operacional === 'QUARENTENA';
                      const isEmUso = tool.status_operacional === 'EM_USO';
                      const isEmCalibracao = tool.status_operacional === 'EM_CALIBRACAO';

                      return (
                        <tr
                          key={tool.id_ferramenta}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isQuarentena
                              ? 'bg-red-950/10'
                              : isVencida
                              ? 'bg-rose-950/10'
                              : ''
                          }`}
                        >
                          {/* Tool Info */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">
                              {tool.descricao}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{tool.fabricante}</span>
                              {tool.modelo !== 'N/A' && <span>• Mod: {tool.modelo}</span>}
                              <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                                {tool.tipo_ferramenta}
                              </span>
                            </div>
                          </td>

                          {/* PN & SN */}
                          <td className="px-4 py-3 font-mono">
                            <div className="text-slate-200">PN: {tool.part_number}</div>
                            <div className="text-amber-400/90 text-[11px]">SN: {tool.serial_number}</div>
                          </td>

                          {/* Posição Física */}
                          <td className="px-4 py-3">
                            <div className="font-mono text-cyan-300 font-semibold">
                              {tool.localizacao_fisica}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {tool.nome_base || 'Sede GRU'}
                            </div>
                          </td>

                          {/* Propriedade */}
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tool.propriedade === 'PROPRIA'
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : tool.propriedade === 'TERCEIROS'
                                ? 'bg-purple-950/50 text-purple-300 border border-purple-800/60'
                                : 'bg-orange-950/50 text-orange-300 border border-orange-800/60'
                            }`}>
                              {tool.propriedade}
                            </span>
                          </td>

                          {/* Status Metrológico */}
                          <td className="px-4 py-3">
                            {!tool.requer_calibracao ? (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                                N/A (Sem Calibração)
                              </span>
                            ) : isVencida ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 border border-rose-600 text-rose-300 text-[11px] font-bold">
                                  <AlertOctagon className="w-3 h-3" />
                                  VENCIDA ({tool.data_proxima_calibracao})
                                </span>
                                <span className="block text-[10px] text-rose-400/80 mt-0.5">
                                  Trava Regra #2 Ativa
                                </span>
                              </div>
                            ) : isAVencer ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 border border-amber-600 text-amber-300 text-[11px] font-bold">
                                  <AlertTriangle className="w-3 h-3" />
                                  A VENCER ({tool.data_proxima_calibracao})
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[11px] font-semibold">
                                  <CheckCircle className="w-3 h-3" />
                                  EM DIA ({tool.data_proxima_calibracao})
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Status Operacional */}
                          <td className="px-4 py-3">
                            {isQuarentena ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950 border border-red-600 text-red-200 text-[11px] font-bold tracking-wide">
                                <ShieldAlert className="w-3 h-3 text-red-400" />
                                QUARENTENA
                              </span>
                            ) : isEmUso ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 text-[11px] font-bold">
                                  <ArrowRightLeft className="w-3 h-3" />
                                  EM USO (OS {tool.movimentacao_atual?.numero_os || 'N/A'})
                                </span>
                                <span className="block text-[10px] text-cyan-400/80 mt-0.5 truncate max-w-[130px]">
                                  {tool.movimentacao_atual?.nome_tecnico}
                                </span>
                              </div>
                            ) : isEmCalibracao ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300 text-[11px] font-semibold">
                                <Calendar className="w-3 h-3" />
                                EM CALIBRAÇÃO
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 text-[11px] font-semibold">
                                <Check className="w-3 h-3" />
                                DISPONÍVEL
                              </span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Movimentar (Check-in/out) */}
                              <button
                                onClick={() => handleOpenMovement(tool)}
                                className={`p-1.5 rounded transition-colors ${
                                  isQuarentena || isEmCalibracao
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60'
                                }`}
                                title={
                                  isQuarentena || isEmCalibracao
                                    ? 'Bloqueado pela Trava de Quarentena / Em Calibração'
                                    : isEmUso
                                    ? 'Devolver Ferramenta (Check-in)'
                                    : 'Retirar Ferramenta (Check-out F 001-06-1)'
                                }
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>

                              {/* Calibrar (Form F 001-06) */}
                              {tool.requer_calibracao && (
                                <button
                                  onClick={() => handleOpenCalibration(tool)}
                                  className="p-1.5 rounded bg-yellow-950/60 hover:bg-yellow-900 text-yellow-300 border border-yellow-800/60 transition-colors"
                                  title="Registrar Calibração (Form F 001-06)"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Segregar / Quarentena (F 001-06-04) */}
                              <button
                                onClick={() => handleOpenQuarantine(tool)}
                                className={`p-1.5 rounded transition-colors ${
                                  isQuarentena
                                    ? 'bg-red-900 text-red-200 border border-red-500'
                                    : 'bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/60'
                                }`}
                                title={isQuarentena ? 'Ver Ficha de Quarentena F 001-06-04' : 'Segregar para Quarentena'}
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>

                              {/* Ver Tags */}
                              <button
                                onClick={() => handleOpenTag(tool)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                                title="Ver Tags Regulamentares (F 001-06-3 / F 001-01-6)"
                              >
                                <Tag className="w-3.5 h-3.5" />
                              </button>

                              {/* Editar */}
                              <button
                                onClick={() => handleEditTool(tool)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                title="Editar Cadastro"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
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

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MOVIMENTAÇÃO DIÁRIA (FORM F 001-06-1)                          */}
      {/* ========================================================================= */}
      {subTab === 'movimentacoes' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  LIVRO DE MOVIMENTAÇÃO DIÁRIA DE FERRAMENTAS
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                    Form F 001-06-1
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Rastreabilidade de custódia técnica por Ordem de Serviço (OS) e CANAC executante.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Total de Registros: <span className="font-mono text-white font-bold">{movimentacoes.length}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Ferramenta</th>
                    <th className="px-4 py-3">Técnico / CANAC</th>
                    <th className="px-4 py-3">Ordem de Serviço (OS)</th>
                    <th className="px-4 py-3">Retirada</th>
                    <th className="px-4 py-3">Devolução</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {movimentacoes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        Nenhuma movimentação registrada no sistema.
                      </td>
                    </tr>
                  ) : (
                    movimentacoes.map((mov) => {
                      const tool = tools.find(t => t.id_ferramenta === mov.id_ferramenta);
                      const isAberta = mov.status === 'RETIRADA';

                      return (
                        <tr key={mov.id_movimentacao} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{mov.descricao_ferramenta}</div>
                            <div className="font-mono text-[11px] text-slate-400">
                              PN: {mov.part_number} • SN: {mov.serial_number}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-slate-200 font-medium">{mov.nome_tecnico}</div>
                            <div className="font-mono text-[11px] text-amber-400">CANAC: {mov.canac}</div>
                          </td>

                          <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                            {mov.numero_os}
                          </td>

                          <td className="px-4 py-3 font-mono text-slate-300">
                            {mov.data_retirada || mov.data_hora ? new Date(mov.data_retirada || mov.data_hora).toLocaleString('pt-BR') : 'N/A'}
                          </td>

                          <td className="px-4 py-3 font-mono">
                            {mov.data_devolucao || mov.devolvido_em ? (
                              <span className="text-emerald-300">
                                {new Date(mov.data_devolucao || mov.devolvido_em!).toLocaleString('pt-BR')}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Pendente devolução</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {isAberta ? (
                              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold text-[10px]">
                                EM CUSTÓDIA
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-medium text-[10px]">
                                DEVOLVIDA ({mov.condicao_retorno})
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {isAberta && tool && (
                              <button
                                onClick={() => handleOpenMovement(tool)}
                                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] rounded transition-colors"
                              >
                                Registrar Devolução
                              </button>
                            )}
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

      {/* ========================================================================= */}
      {/* SUB-TAB 3: MÓDULO DE QUARENTENA & SEGREGAÇÃO (FORM F 001-06-04)           */}
      {/* ========================================================================= */}
      {subTab === 'quarentena' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-800/50 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      ÁREA SEGREGADA DE QUARENTENA DE FERRAMENTAL
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-red-900/60 border border-red-700 text-red-300 rounded">
                      Form F 001-06-04
                    </span>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-red-950 border border-red-500 text-red-200 rounded">
                      Tag F 001-01-6
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Regra Inviolável #2: Ferramentas reprovadas ou com calibração vencida ficam bloqueadas pelo sistema e devem permanecer fisicamente na área demarcada de Quarentena.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs text-slate-400">Ferramentas Retidas:</span>
                <span className="px-3 py-1 bg-red-600 text-white font-mono font-bold text-sm rounded-lg shadow">
                  {toolsQuarentena}
                </span>
              </div>
            </div>
          </div>

          {/* QUARANTINE ITEMS CARDS / TABLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quarentenas.length === 0 ? (
              <div className="md:col-span-2 p-12 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500">
                Nenhum item atualmente na Quarentena.
              </div>
            ) : (
              quarentenas.map((q) => {
                const tool = tools.find(t => t.id_ferramenta === q.id_ferramenta);
                const isRetido = q.status_resolucao === 'RETIDO_QUARENTENA';

                return (
                  <div
                    key={q.id_quarentena}
                    className="bg-slate-900 border border-red-900/50 rounded-xl p-5 shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-950 border border-red-600 text-red-300 text-[10px] font-mono font-bold">
                            TAG VERMELHA F 001-01-6
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {q.data_segregacao}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">
                          {q.descricao_ferramenta}
                        </h4>
                        <div className="flex gap-3 text-xs text-slate-400 mt-1 font-mono">
                          <span>PN: <strong className="text-slate-200">{q.part_number}</strong></span>
                          <span>SN: <strong className="text-amber-400">{q.serial_number}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isRetido
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                        }`}>
                          {q.status_resolucao}
                        </span>
                      </div>
                    </div>

                    {/* Motivo */}
                    <div className="mt-3 p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs">
                      <span className="text-red-400 font-bold block text-[10px] uppercase">
                        Motivo da Segregação (F 001-06-04):
                      </span>
                      <p className="text-red-200 mt-0.5 italic">{q.motivo}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                      <div>
                        Responsável: <span className="text-slate-200 font-medium">{q.nome_responsavel}</span>
                      </div>

                      {tool && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenQuarantine(tool)}
                            className="px-2.5 py-1 text-xs font-semibold bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/60 rounded flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ficha / Tag
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: CRONOGRAMA DE CALIBRAÇÕES (FORM F 001-06)                      */}
      {/* ========================================================================= */}
      {subTab === 'calibracoes' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  HISTÓRICO DE CALIBRAÇÕES REGULAMENTARES & METROLOGIA
                  <span className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800 text-[10px] font-mono">
                    Form F 001-06
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    Instrução BTI-PMP-05
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Laudos metrológicos, laboratórios homologados pela RBC/Inmetro e conferência de desvio padrão máximo.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Ferramenta / P/N</th>
                    <th className="px-4 py-3">Certificado Nº</th>
                    <th className="px-4 py-3">Laboratório Homologado</th>
                    <th className="px-4 py-3">Data Aferição</th>
                    <th className="px-4 py-3">Próximo Vencimento</th>
                    <th className="px-4 py-3">Desvio Padrão (BTI-PMP-05)</th>
                    <th className="px-4 py-3">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {tools
                    .filter(t => t.calibracoes && t.calibracoes.length > 0)
                    .flatMap(t => t.calibracoes!.map((c: ControleCalibracaoF001_06) => ({ ...c, toolDesc: t.descricao, pn: t.part_number, sn: t.serial_number })))
                    .length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        Nenhum registro de calibração encontrado.
                      </td>
                    </tr>
                  ) : (
                    tools
                      .filter(t => t.calibracoes && t.calibracoes.length > 0)
                      .flatMap(t => t.calibracoes!.map((c: ControleCalibracaoF001_06) => ({ ...c, toolDesc: t.descricao, pn: t.part_number, sn: t.serial_number })))
                      .map((c) => (
                        <tr key={c.id_calibracao} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{c.toolDesc}</div>
                            <div className="font-mono text-[11px] text-slate-400">
                              PN: {c.pn} • SN: {c.sn}
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono font-bold text-amber-300">
                            {c.numero_certificado}
                          </td>

                          <td className="px-4 py-3 text-slate-200">
                            {c.laboratorio_homologado}
                          </td>

                          <td className="px-4 py-3 font-mono text-slate-300">
                            {c.data_calibracao}
                          </td>

                          <td className="px-4 py-3 font-mono font-bold text-red-300">
                            {c.data_vencimento}
                          </td>

                          <td className="px-4 py-3 font-mono text-slate-300">
                            ±{c.desvio_padrao_encontrado} / Tol: ±{c.tolerancia_admissivel}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              c.resultado === 'APROVADO'
                                ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                                : 'bg-red-950 border border-red-700 text-red-300'
                            }`}>
                              {c.resultado}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS INTEGRATION                                                        */}
      {/* ========================================================================= */}
      {/* 1. Modal Cadastro / Edição Ferramenta */}
      <ToolModal
        toolToEdit={toolToEdit}
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
        onSuccess={handleRefresh}
        bases={bases}
      />

      {/* 2. Modal Calibração Form F 001-06 */}
      {calibrationTool && (
        <CalibrationModal
          tool={calibrationTool}
          isOpen={isCalibrationModalOpen}
          onClose={() => {
            setIsCalibrationModalOpen(false);
            setCalibrationTool(null);
          }}
          onSuccess={handleRefresh}
        />
      )}

      {/* 3. Modal Movimentação Diária Form F 001-06-1 */}
      {movementTool && (
        <MovementModal
          tool={movementTool}
          isOpen={isMovementModalOpen}
          onClose={() => {
            setIsMovementModalOpen(false);
            setMovementTool(null);
          }}
          onSuccess={handleRefresh}
          tecnicos={tecnicos}
        />
      )}

      {/* 4. Modal Quarentena Form F 001-06-04 & Tag Vermelha F 001-01-6 */}
      {quarantineTool && (
        <QuarantineModal
          tool={quarantineTool}
          isOpen={isQuarantineModalOpen}
          onClose={() => {
            setIsQuarantineModalOpen(false);
            setQuarantineTool(null);
          }}
          onSuccess={handleRefresh}
          tecnicos={tecnicos}
        />
      )}

      {/* 5. Modal Visualizador de Etiquetas (Tag Amarela F 001-06-3 / Tag Vermelha F 001-01-6) */}
      {tagTool && (
        <ToolTagModal
          tool={tagTool}
          isOpen={isTagModalOpen}
          onClose={() => {
            setIsTagModalOpen(false);
            setTagTool(null);
          }}
        />
      )}
    </div>
  );
};
