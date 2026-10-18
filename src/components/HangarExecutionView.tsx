import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Package,
  FileCheck2,
  FileSpreadsheet,
  Plus,
  Printer,
  Search,
  Filter,
  RefreshCw,
  Plane,
  UserCheck,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  OrdemServicoF001_09_2,
  ApontamentoTarefaOS,
  MaterialAplicadoOS,
  FerramentaUtilizadaOS,
  RelatorioInspecaoF001_12,
  PassagemTurnoF001_24,
  HangarStats,
  TecnicoComQualificacao,
  Ferramenta,
  BaseOperacional,
} from '../types/mro';
import { apiClient } from '../services/apiClient';
import { TaskExecutionModal } from './TaskExecutionModal';
import { RiModal } from './RiModal';
import { ShiftHandoverModal } from './ShiftHandoverModal';
import { ShiftHandoverPrintModal } from './ShiftHandoverPrintModal';
import { FodClosureModal } from './FodClosureModal';
import { WorkOrderPrintModal } from './WorkOrderPrintModal';

interface HangarExecutionViewProps {
  bases: BaseOperacional[];
  tecnicos: TecnicoComQualificacao[];
  onRefreshGlobal?: () => void;
  initialSubTab?: 'tarefas' | 'materiais' | 'ferramentas' | 'ris' | 'passagens';
}

export const HangarExecutionView: React.FC<HangarExecutionViewProps> = ({
  bases,
  tecnicos,
  onRefreshGlobal,
  initialSubTab = 'tarefas',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tarefas' | 'materiais' | 'ferramentas' | 'ris' | 'passagens'>(initialSubTab);

  // Dados principais
  const [ordensServico, setOrdensServico] = useState<OrdemServicoF001_09_2[]>([]);
  const [selectedOsId, setSelectedOsId] = useState<number>(1);
  const [apontamentos, setApontamentos] = useState<ApontamentoTarefaOS[]>([]);
  const [materiais, setMateriais] = useState<MaterialAplicadoOS[]>([]);
  const [ferramentasUtilizadas, setFerramentasUtilizadas] = useState<FerramentaUtilizadaOS[]>([]);
  const [ferramentasEstoque, setFerramentasEstoque] = useState<Ferramenta[]>([]);
  const [relatoriosInspecao, setRelatoriosInspecao] = useState<RelatorioInspecaoF001_12[]>([]);
  const [passagensTurno, setPassagensTurno] = useState<PassagemTurnoF001_24[]>([]);
  const [stats, setStats] = useState<HangarStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedApontamento, setSelectedApontamento] = useState<ApontamentoTarefaOS | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedRi, setSelectedRi] = useState<RelatorioInspecaoF001_12 | null>(null);
  const [isRiModalOpen, setIsRiModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [selectedHandoverToPrint, setSelectedHandoverToPrint] = useState<PassagemTurnoF001_24 | null>(null);
  const [isFodClosureModalOpen, setIsFodClosureModalOpen] = useState(false);
  const [isOsPrintModalOpen, setIsOsPrintModalOpen] = useState(false);

  const carregarDadosHangar = async () => {
    setLoading(true);
    try {
      const [osList, aptsList, matList, toolsUsedList, toolsStockList, risList, passagensList, statsData] =
        await Promise.all([
          apiClient.getOrdensServico({ status: 'TODOS' }),
          apiClient.getApontamentos({ id_os: selectedOsId }),
          apiClient.getMateriaisAplicados(selectedOsId),
          apiClient.getFerramentasUtilizadas(selectedOsId),
          apiClient.getFerramentas(),
          apiClient.getRelatoriosInspecao(),
          apiClient.getPassagensTurno(),
          apiClient.getHangarStats(),
        ]);

      setOrdensServico(osList);
      setApontamentos(aptsList);
      setMateriais(matList);
      setFerramentasUtilizadas(toolsUsedList);
      setFerramentasEstoque(toolsStockList);
      setRelatoriosInspecao(risList);
      setPassagensTurno(passagensList);
      setStats(statsData);

      // Se a OS selecionada não existir na lista, pega a primeira
      if (osList.length > 0 && !osList.some((os) => os.id_os === selectedOsId)) {
        setSelectedOsId(osList[0].id_os);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de execução do hangar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosHangar();
  }, [selectedOsId]);

  const selectedOs = ordensServico.find((os) => os.id_os === selectedOsId) || ordensServico[0];
  const risDestaOs = relatoriosInspecao.filter((r) => r.id_os === selectedOsId);
  const risPendentesDestaOs = risDestaOs.filter((r) => r.status_ri !== 'APROVADO_ENCERRADO');
  const iiosPendentesDestaOs = apontamentos.filter((a) => a.is_iio && !a.assinatura_dupla_iio_valida);

  const handleOpenNovaTarefa = () => {
    if (!selectedOs) return;
    const novoApontamento: ApontamentoTarefaOS = {
      id_apontamento: 0,
      id_os: selectedOs.id_os,
      numero_os: selectedOs.numero_os,
      item_tarefa: apontamentos.length + 1,
      titulo_tarefa: '',
      descricao_passo_a_passo: '',
      referencia_amm_task: '',
      is_iio: false,
      id_mecanico_executor: 5,
      mecanico_nome: 'Marcos Vinicius Santos',
      mecanico_canac: '114522',
      data_hora_execucao: new Date().toISOString(),
      rubrica_mecanico: 'MVS-114522',
      status_apontamento: 'PENDENTE',
      assinatura_dupla_iio_valida: false,
      materiais_aplicados: [],
      ferramentas_utilizadas: [],
      observacoes: 'N/A',
    };
    setSelectedApontamento(novoApontamento);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Hangar / Execução de Linha */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PARTE 5 • EXECUÇÃO & INSPEÇÕES
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                MOMQ 5.4 • P 001-07
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                FORM F 001-12 (RI) • FORM F 001-24 (HANDOVER)
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                HOMOLOGAÇÃO: COM 200607-05 / EASA.145.1003
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-3">
              <span>Execução de Hangar, Linha, Passagem de Turno & Inspeções</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Registro passo a passo de tarefas com rastreabilidade de peças (Campo 14), controle metrológico de ferramentas PME (F 001-06-1), trava inviolável de dupla assinatura em itens IIO (MOMQ 5.4), gestão de não-conformidades (RI F 001-12) e passagem de serviço contínua (F 001-24).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedRi(null);
                setIsRiModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 transition shadow"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>+ Novo RI (F 001-12)</span>
            </button>

            <button
              onClick={() => setIsHandoverModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition shadow"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Passagem de Turno (F 001-24)</span>
            </button>

            {selectedOs && (
              <button
                onClick={() => setIsFodClosureModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Encerramento Operacional FOD</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards do Hangar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Apontamentos</span>
            <div className="text-2xl font-black text-white font-mono mt-1">{stats.total_apontamentos}</div>
            <span className="text-[9px] text-slate-500 mt-1">{stats.apontamentos_concluidos} executados</span>
          </div>

          <div className={`rounded-xl p-3 flex flex-col justify-between border ${stats.apontamentos_iio_pendentes_aprs > 0 ? 'bg-amber-950/30 border-amber-500/50' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] font-mono text-amber-400 uppercase">IIO Pendentes</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.apontamentos_iio_pendentes_aprs}</div>
            <span className="text-[9px] text-amber-500/70 mt-1">Exigem Inspetor APRS</span>
          </div>

          <div className={`rounded-xl p-3 flex flex-col justify-between border ${stats.ris_abertos_bloqueantes > 0 ? 'bg-rose-950/30 border-rose-500/50' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] font-mono text-rose-400 uppercase">RIs Abertos</span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">{stats.ris_abertos_bloqueantes}</div>
            <span className="text-[9px] text-rose-500/70 mt-1">Bloqueios de OS ativos</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">PME em Uso</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{stats.ferramentas_em_uso_hangar}</div>
            <span className="text-[9px] text-cyan-500/70 mt-1">Check-out ativo</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-indigo-400 uppercase">Passagens F 001-24</span>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1">{stats.total_passagens_turno}</div>
            <span className="text-[9px] text-indigo-500/70 mt-1">Continuidade de turno</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Peças Aplicadas</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{materiais.length}</div>
            <span className="text-[9px] text-emerald-500/70 mt-1">Com rastreabilidade ARC</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-purple-400 uppercase">Aeronave Ativa</span>
            <div className="text-lg font-bold text-white font-mono mt-1 truncate">{selectedOs ? selectedOs.campo_02_matricula : 'N/A'}</div>
            <span className="text-[9px] text-purple-400 truncate">{selectedOs ? selectedOs.campo_03_modelo : 'Nenhuma'}</span>
          </div>
        </div>
      )}

      {/* SELETOR DE ORDEM DE SERVIÇO EM ANDAMENTO NO HANGAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Plane className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
              Selecione a Ordem de Serviço em Execução no Hangar:
            </label>
            <select
              value={selectedOsId}
              onChange={(e) => setSelectedOsId(Number(e.target.value))}
              className="mt-0.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs focus:outline-none"
            >
              {ordensServico.map((os) => (
                <option key={os.id_os} value={os.id_os}>
                  {os.numero_os} • {os.campo_02_matricula} ({os.campo_03_modelo}) - Base {os.campo_06_base_executante} [{os.status_os}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedOs && (
          <div className="flex items-center space-x-2 text-xs">
            {risPendentesDestaOs.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold flex items-center space-x-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{risPendentesDestaOs.length} RI(s) Bloqueante(s)</span>
              </span>
            )}
            {iiosPendentesDestaOs.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{iiosPendentesDestaOs.length} IIO sem APRS</span>
              </span>
            )}
            <button
              onClick={() => setIsOsPrintModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir OS F 001-09-2</span>
            </button>
            <button
              onClick={carregarDadosHangar}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('tarefas')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'tarefas'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Apontamentos & Tarefas da OS</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {apontamentos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('materiais')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'materiais'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Peças & Materiais Aplicados (Campo 14)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {materiais.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ferramentas')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'ferramentas'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Controle PME (F 001-06-1)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {ferramentasUtilizadas.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ris')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'ris'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Relatórios de Inspeção (RI / F 001-12)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-rose-950 text-rose-200 font-mono font-bold">
            {risDestaOs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('passagens')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'passagens'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Passagem de Turno (F 001-24)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {passagensTurno.length}
          </span>
        </button>
      </div>

      {/* ABA 1: TAREFAS & APONTAMENTOS NA OS */}
      {activeSubTab === 'tarefas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">
                Execução Passo a Passo das Tarefas da OS: {selectedOs?.numero_os}
              </h3>
              <p className="text-xs text-slate-400">
                Preenchimento dos Campos 13 a 18 do Form F 001-09-2 com validação compulsória de dupla assinatura para tarefas críticas IIO.
              </p>
            </div>
            <button
              onClick={handleOpenNovaTarefa}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Apontar Nova Tarefa</span>
            </button>
          </div>

          <div className="space-y-3">
            {apontamentos.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                Nenhum apontamento registrado para esta Ordem de Serviço até o momento.
              </div>
            ) : (
              apontamentos.map((apt) => (
                <div
                  key={apt.id_apontamento}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition space-y-3 ${
                    apt.is_iio && !apt.assinatura_dupla_iio_valida
                      ? 'border-amber-500/60 bg-amber-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-800 text-cyan-400 border border-slate-700">
                          Item {apt.item_tarefa}
                        </span>
                        {apt.is_iio && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>IIO • ITEM DE INSPEÇÃO OBRIGATÓRIA ({apt.categoria_iio || 'Crítico'})</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">{apt.referencia_amm_task}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{apt.titulo_tarefa}</h4>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                        apt.status_apontamento === 'INSPECIONADO_APRS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : apt.status_apontamento === 'EXECUTADO'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {apt.status_apontamento === 'INSPECIONADO_APRS'
                        ? '✓ INSPECIONADO APRS'
                        : apt.status_apontamento === 'EXECUTADO'
                        ? '⚡ EXECUTADO MMA'
                        : '⏳ PENDENTE'}
                    </span>
                  </div>

                  {/* Passo a Passo Descrito */}
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {apt.descricao_passo_a_passo}
                  </p>

                  {/* Detalhes de Peças e Ferramentas associadas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-800/50 p-2.5 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Peças / Materiais Aplicados ({apt.materiais_aplicados.length}):
                      </span>
                      {apt.materiais_aplicados.length > 0 ? (
                        apt.materiais_aplicados.map((m, i) => (
                          <div key={i} className="text-emerald-300 text-[11px] truncate">
                            • {m.descricao} (P/N: {m.part_number}) [{m.tipo_documento_rastreabilidade}: {m.numero_documento_rastreabilidade}]
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[10px]">Nenhum material associado.</span>
                      )}
                    </div>

                    <div className="bg-slate-800/50 p-2.5 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Ferramentas PME Utilizadas ({apt.ferramentas_utilizadas.length}):
                      </span>
                      {apt.ferramentas_utilizadas.length > 0 ? (
                        apt.ferramentas_utilizadas.map((f, i) => (
                          <div key={i} className="text-amber-300 text-[11px] truncate">
                            • {f.descricao} (S/N: {f.serial_number}) [Laudo RBC: {f.numero_laudo_calibracao}]
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[10px]">Nenhuma ferramenta registrada.</span>
                      )}
                    </div>
                  </div>

                  {/* Assinaturas Duplas e Ações */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-slate-300">
                        Mecânico Executor: <strong className="text-white">{apt.mecanico_nome}</strong> (CANAC: {apt.mecanico_canac}) • Rubrica: <code className="text-cyan-400 font-bold">{apt.rubrica_mecanico}</code>
                      </span>

                      {apt.is_iio && (
                        <span className="text-amber-300">
                          Inspetor APRS: {apt.inspetor_nome ? (
                            <>
                              <strong className="text-white">{apt.inspetor_nome}</strong> (CANAC: {apt.inspetor_canac}) • Rubrica: <code className="text-amber-400 font-bold">{apt.rubrica_inspetor}</code>
                            </>
                          ) : (
                            <strong className="text-rose-400 animate-pulse">AGUARDANDO DUPLA INSPEÇÃO APRS</strong>
                          )}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedApontamento(apt);
                        setIsTaskModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition shadow flex items-center space-x-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{apt.is_iio && !apt.assinatura_dupla_iio_valida ? 'Inspeção APRS IIO' : 'Editar / Apontar'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA 2: PEÇAS & MATERIAIS APLICADOS (Campo 14) */}
      {activeSubTab === 'materiais' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Relação de Peças e Materiais Aplicados na OS {selectedOs?.numero_os} (Campo 14)
                </h3>
                <p className="text-xs text-slate-400">
                  Rastreabilidade obrigatória conforme RBAC 145.109 e MOMQ I 001-05.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Part Number (P/N)</th>
                    <th className="py-3 px-4">Serial / Lote</th>
                    <th className="py-3 px-4">Descrição do Componente</th>
                    <th className="py-3 px-4">Doc Rastreabilidade (ARC)</th>
                    <th className="py-3 px-4">Nº Requisição</th>
                    <th className="py-3 px-4">Mecânico Aplicador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {materiais.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Nenhuma peça ou material registrado para esta OS.
                      </td>
                    </tr>
                  ) : (
                    materiais.map((mat) => (
                      <tr key={mat.id_material_aplicado} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-white">{mat.part_number}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {mat.serial_number !== 'N/A' ? mat.serial_number : `Lote: ${mat.lote_batch}`}
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-semibold">{mat.descricao}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                          {mat.tipo_documento_rastreabilidade}: {mat.numero_documento_rastreabilidade}
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-400">{mat.numero_requisicao_f001_01}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {mat.mecanico_nome} ({mat.mecanico_canac})
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

      {/* ABA 3: CONTROLE PME & FERRAMENTAL (Form F 001-06-1) */}
      {activeSubTab === 'ferramentas' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Movimentação de Ferramentas PME na OS {selectedOs?.numero_os} (Form F 001-06-1)
                </h3>
                <p className="text-xs text-slate-400">
                  Registro de check-out e check-in com inspeção visual mandatória de devolução.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Ferramenta & P/N</th>
                    <th className="py-3 px-4">Serial (S/N)</th>
                    <th className="py-3 px-4">Laudo RBC & Validade</th>
                    <th className="py-3 px-4">Check-out (Retirada)</th>
                    <th className="py-3 px-4">Check-in (Devolução)</th>
                    <th className="py-3 px-4">Condição Retorno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {ferramentasUtilizadas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Nenhum registro de uso de ferramenta para esta OS.
                      </td>
                    </tr>
                  ) : (
                    ferramentasUtilizadas.map((uso) => (
                      <tr key={uso.id_uso_ferramenta} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {uso.descricao}
                          <span className="block text-[10px] text-slate-400 font-normal">P/N: {uso.part_number}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-300">{uso.serial_number}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400">
                          {uso.numero_laudo_calibracao}
                          <span className="block text-[10px] text-slate-400">Venc: {uso.data_vencimento_calibracao}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {new Date(uso.data_hora_checkout).toLocaleTimeString('pt-BR')}
                          <span className="block text-[10px] text-slate-500">{uso.responsavel_checkout_nome}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {uso.data_hora_checkin ? (
                            <>
                              {new Date(uso.data_hora_checkin).toLocaleTimeString('pt-BR')}
                              <span className="block text-[10px] text-slate-500">{uso.responsavel_checkin_nome}</span>
                            </>
                          ) : (
                            <span className="text-amber-400 font-bold">EM USO NA AERONAVE</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              uso.condicao_devolucao === 'CONFORME_SEM_DANOS'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : uso.condicao_devolucao === 'AVARIADA_REQUER_QUARENTENA'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {uso.condicao_devolucao}
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

      {/* ABA 4: GESTÃO DE RELATÓRIOS DE INSPEÇÃO (RI / Form F 001-12) */}
      {activeSubTab === 'ris' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">
                Relatórios de Inspeção (RI / Form F 001-12) vinculados à OS {selectedOs?.numero_os}
              </h3>
              <p className="text-xs text-slate-400">
                Discrepâncias encontradas em inspeções preliminares ou não programadas. Travam o encerramento da OS enquanto pendentes.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedRi(null);
                setIsRiModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Abrir Novo RI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risDestaOs.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                Nenhum Relatório de Inspeção (RI) aberto para esta Ordem de Serviço.
              </div>
            ) : (
              risDestaOs.map((ri) => (
                <div
                  key={ri.id_ri}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-3 transition ${
                    ri.status_ri !== 'APROVADO_ENCERRADO'
                      ? 'border-rose-500/50 bg-rose-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-rose-400 font-black text-sm">{ri.numero_ri}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                            {ri.tipo_inspecao}
                          </span>
                          {ri.is_iio && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                              IIO
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-xs mt-1">{ri.localizacao_aeronave}</h4>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                          ri.status_ri === 'APROVADO_ENCERRADO'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ri.status_ri === 'RESOLVIDO_AGUARDANDO_APRS'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {ri.status_ri}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <strong>Discrepância:</strong> {ri.descricao_discrepancia}
                    </p>

                    <div className="p-2 bg-slate-950/40 rounded border border-slate-800 text-[11px] text-slate-400">
                      <strong>Ação Exigida:</strong> {ri.acao_corretiva_exigida}
                    </div>

                    {ri.acao_corretiva_executada && (
                      <div className="p-2 bg-blue-950/30 rounded border border-blue-500/30 text-[11px] text-blue-300">
                        <strong>Ação Executada:</strong> {ri.acao_corretiva_executada} (por {ri.mecanico_execucao_nome})
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Aberto por: {ri.inspetor_abertura_nome} ({ri.inspetor_abertura_canac})
                    </span>

                    <button
                      onClick={() => {
                        setSelectedRi(ri);
                        setIsRiModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs border border-slate-700 transition"
                    >
                      {ri.status_ri === 'APROVADO_ENCERRADO' ? 'Visualizar RI' : 'Gerenciar Resolução / Aprovação'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA 5: PASSAGEM DE TURNO (Form F 001-24) */}
      {activeSubTab === 'passagens' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">
                Histórico de Fichas de Passagem de Serviço (Form F 001-24 / I 001-14)
              </h3>
              <p className="text-xs text-slate-400">
                Evidência formal de continuidade técnica, ferramentas retidas e transferências de responsabilidade entre turnos.
              </p>
            </div>
            <button
              onClick={() => setIsHandoverModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Passagem de Turno</span>
            </button>
          </div>

          <div className="space-y-3">
            {passagensTurno.map((pt) => (
              <div
                key={pt.id_passagem}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-cyan-400 font-black text-sm">{pt.numero_passagem}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                        OS: {pt.numero_os} ({pt.matricula_aeronave})
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                        Turno: {pt.turno_saindo} ➔ {pt.turno_entrando}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      Registrado em: {pt.data_passagem} {pt.hora_passagem} • Base {pt.base_operacional}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedHandoverToPrint(pt)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir A4 (F 001-24)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block text-[11px]">Andamento dos Trabalhos:</strong>
                    <p className="text-slate-300">{pt.status_geral_trabalhos}</p>
                    <div className="text-[11px] text-amber-300 pt-1">
                      <strong>Pendências Próximo Turno:</strong> {pt.tarefas_pendentes_detalhes}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-white block text-[11px]">Controle de Ferramental & FOD:</strong>
                    <p className="text-slate-300 font-mono text-[11px]">{pt.ferramentas_retidas_aeronave_bancada}</p>
                    <div className="text-[11px] text-rose-300 pt-1 font-mono font-bold">
                      {pt.ris_em_aberto_alerta}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400">
                      Entregou: <strong className="text-white">{pt.tecnico_saindo_nome}</strong> (CANAC: {pt.tecnico_saindo_canac})
                    </span>
                    <span className="text-slate-400">
                      Recebeu: <strong className="text-white">{pt.tecnico_entrando_nome}</strong> (CANAC: {pt.tecnico_entrando_canac})
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    ✓ Condições de Segurança & FOD Atestadas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: APONTAMENTO DE TAREFA E DUPLA ASSINATURA IIO */}
      {selectedApontamento && (
        <TaskExecutionModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedApontamento(null);
          }}
          onSuccess={async () => {
            await carregarDadosHangar();
            if (onRefreshGlobal) onRefreshGlobal();
          }}
          apontamento={selectedApontamento}
          tecnicos={tecnicos}
          ferramentasDisponiveis={ferramentasEstoque}
        />
      )}

      {/* MODAL 2: RELATÓRIO DE INSPEÇÃO (RI / FORM F 001-12) */}
      <RiModal
        isOpen={isRiModalOpen}
        onClose={() => {
          setIsRiModalOpen(false);
          setSelectedRi(null);
        }}
        onSuccess={async () => {
          await carregarDadosHangar();
          if (onRefreshGlobal) onRefreshGlobal();
        }}
        riExistente={selectedRi}
        ordensServico={ordensServico}
        tecnicos={tecnicos}
      />

      {/* MODAL 3: PASSAGEM DE SERVIÇO (HANDOVER / FORM F 001-24) */}
      <ShiftHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        onSuccess={async (nova) => {
          await carregarDadosHangar();
          setSelectedHandoverToPrint(nova);
          if (onRefreshGlobal) onRefreshGlobal();
        }}
        ordensServico={ordensServico}
        tecnicos={tecnicos}
        risAbertos={relatoriosInspecao.filter((r) => r.status_ri !== 'APROVADO_ENCERRADO')}
      />

      {/* MODAL 4: IMPRESSÃO A4 PASSAGEM DE SERVIÇO (ZERO DIVERGÊNCIA) */}
      {selectedHandoverToPrint && (
        <ShiftHandoverPrintModal
          isOpen={true}
          onClose={() => setSelectedHandoverToPrint(null)}
          passagem={selectedHandoverToPrint}
        />
      )}

      {/* MODAL 5: ENCERRAMENTO OPERACIONAL COM CHECKLIST FOD COMPULSÓRIO */}
      {selectedOs && (
        <FodClosureModal
          isOpen={isFodClosureModalOpen}
          onClose={() => setIsFodClosureModalOpen(false)}
          onSuccess={async () => {
            await carregarDadosHangar();
            if (onRefreshGlobal) onRefreshGlobal();
          }}
          os={selectedOs}
          tecnicos={tecnicos}
          risPendentes={risPendentesDestaOs}
          iiosPendentes={iiosPendentesDestaOs}
        />
      )}

      {/* MODAL 6: IMPRESSÃO A4 FORM F 001-09-2 */}
      {selectedOs && isOsPrintModalOpen && (
        <WorkOrderPrintModal
          isOpen={true}
          onClose={() => setIsOsPrintModalOpen(false)}
          workOrder={selectedOs}
        />
      )}
    </div>
  );
};
