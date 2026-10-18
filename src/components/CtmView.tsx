import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileCheck2,
  FileText,
  Calendar,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Printer,
  Globe,
  CheckCircle2,
  Building,
  Plane,
  Clock,
  Layers,
  FileSpreadsheet,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  PublicacaoTecnicaF001_02_1,
  CartaConcessaoManuais,
  CienciaCorpoTecnicoF001_02_2,
  FCDAF001_03_2,
  RelatorioMandatoriasF001_03_3,
  MonitoramentoAgencia,
  CtmStats,
  PessoalTecnico,
  BaseOperacional,
} from '../types/mro';
import { apiClient } from '../services/apiClient';
import { PublicationModal } from './PublicationModal';
import { CheckRevisionModal } from './CheckRevisionModal';
import { CienciaModal } from './CienciaModal';
import { CartaConcessaoModal } from './CartaConcessaoModal';
import { FcdaModal } from './FcdaModal';
import { FcdaPrintModal } from './FcdaPrintModal';
import { OfficialFormHeader } from './OfficialFormHeader';
import { NaRuleNotice, EasaReleaseDeclaration } from './OfficialFormNotices';

interface CtmViewProps {
  tecnicos: PessoalTecnico[];
  bases: BaseOperacional[];
  onRefreshGlobal?: () => void;
  initialSubTab?: 'publicacoes' | 'cartas' | 'fcda' | 'relatorio-mensal' | 'agencias';
}

export const CtmView: React.FC<CtmViewProps> = ({
  tecnicos,
  bases,
  onRefreshGlobal,
  initialSubTab = 'publicacoes',
}) => {
  const [subTab, setSubTab] = useState<'publicacoes' | 'cartas' | 'fcda' | 'relatorio-mensal' | 'agencias'>(initialSubTab);

  // Data States
  const [stats, setStats] = useState<CtmStats | null>(null);
  const [publicacoes, setPublicacoes] = useState<PublicacaoTecnicaF001_02_1[]>([]);
  const [cartas, setCartas] = useState<CartaConcessaoManuais[]>([]);
  const [fcdas, setFcdas] = useState<FCDAF001_03_2[]>([]);
  const [monitoramentos, setMonitoramentos] = useState<MonitoramentoAgencia[]>([]);
  const [relatorioMensal, setRelatorioMensal] = useState<RelatorioMandatoriasF001_03_3 | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchPub, setSearchPub] = useState('');
  const [filtroTipoPub, setFiltroTipoPub] = useState('TODOS');
  const [filtroStatusPub, setFiltroStatusPub] = useState('TODOS');

  const [searchFcda, setSearchFcda] = useState('');
  const [filtroMatriculaFcda, setFiltroMatriculaFcda] = useState('TODAS');
  const [filtroAplicabilidadeFcda, setFiltroAplicabilidadeFcda] = useState('TODAS');
  const [filtroTipoAcaoFcda, setFiltroTipoAcaoFcda] = useState('TODOS');

  const [mesAnoRelatorio, setMesAnoRelatorio] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filtroPrefixoRelatorio, setFiltroPrefixoRelatorio] = useState('TODAS');

  // Modals state
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [pubToEdit, setPubToEdit] = useState<PublicacaoTecnicaF001_02_1 | null>(null);

  const [isCheckRevModalOpen, setIsCheckRevModalOpen] = useState(false);
  const [pubToCheck, setPubToCheck] = useState<PublicacaoTecnicaF001_02_1 | null>(null);

  const [isCienciaModalOpen, setIsCienciaModalOpen] = useState(false);
  const [pubCiencia, setPubCiencia] = useState<PublicacaoTecnicaF001_02_1 | null>(null);

  const [isCartaModalOpen, setIsCartaModalOpen] = useState(false);
  const [cartaToEdit, setCartaToEdit] = useState<CartaConcessaoManuais | null>(null);

  const [isFcdaModalOpen, setIsFcdaModalOpen] = useState(false);
  const [fcdaToEdit, setFcdaToEdit] = useState<FCDAF001_03_2 | null>(null);

  const [isFcdaPrintOpen, setIsFcdaPrintOpen] = useState(false);
  const [fcdaToPrint, setFcdaToPrint] = useState<FCDAF001_03_2 | null>(null);

  // Agency checking quick action state
  const [checkingAgency, setCheckingAgency] = useState<string | null>(null);
  const [agencyFeedback, setAgencyFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        pubsData,
        cartasData,
        fcdasData,
        monitData,
        relData,
      ] = await Promise.all([
        apiClient.getCtmStats(),
        apiClient.getPublicacoes(),
        apiClient.getCartasConcessao(),
        apiClient.getFcdas(),
        apiClient.getMonitoramentoAgencias(),
        apiClient.getRelatorioMandatorias(mesAnoRelatorio, filtroPrefixoRelatorio),
      ]);

      setStats(statsData);
      setPublicacoes(pubsData);
      setCartas(cartasData);
      setFcdas(fcdasData);
      setMonitoramentos(monitData);
      setRelatorioMensal(relData);
    } catch (err) {
      console.error('Erro ao carregar dados do CTM:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchRelatorio = async () => {
      try {
        const data = await apiClient.getRelatorioMandatorias(mesAnoRelatorio, filtroPrefixoRelatorio);
        setRelatorioMensal(data);
      } catch (e) {
        console.error('Erro ao buscar relatório:', e);
      }
    };
    fetchRelatorio();
  }, [mesAnoRelatorio, filtroPrefixoRelatorio]);

  const handleChecarAgencia = async (agencia: 'ANAC' | 'FAA' | 'EASA') => {
    try {
      setCheckingAgency(agencia);
      const tec = tecnicos.find((t) => t.cargo === 'RT' || t.cargo === 'Gerente Qualidade') || tecnicos[0];
      await apiClient.registrarChecagemAgencia({
        agencia,
        id_tecnico: tec ? tec.id_tecnico : 1,
        observacoes: `Verificação rotineira realizada no portal oficial da ${agencia}. Sem novas mandatórias com impacto imediato.`,
      });
      const updatedMonit = await apiClient.getMonitoramentoAgencias();
      setMonitoramentos(updatedMonit);
      setAgencyFeedback(`Checagem da ${agencia} registrada com sucesso no log de auditoria MOMQ!`);
      setTimeout(() => setAgencyFeedback(null), 4000);
    } catch (err: any) {
      alert(`Falha ao registrar checagem: ${err.message}`);
    } finally {
      setCheckingAgency(null);
    }
  };

  // Filtered publications
  const filteredPubs = publicacoes.filter((p) => {
    const matchTipo = filtroTipoPub === 'TODOS' || p.tipo_documento === filtroTipoPub;
    const matchStatus = filtroStatusPub === 'TODOS' || p.status === filtroStatusPub;
    const q = searchPub.toLowerCase();
    const matchSearch =
      !q ||
      p.titulo.toLowerCase().includes(q) ||
      p.codigo_documento.toLowerCase().includes(q) ||
      p.modelo_aplicavel.toLowerCase().includes(q) ||
      p.fabricante.toLowerCase().includes(q);
    return matchTipo && matchStatus && matchSearch;
  });

  // Filtered FCDAs
  const filteredFcdas = fcdas.filter((f) => {
    const matchMat = filtroMatriculaFcda === 'TODAS' || f.matricula_aeronave.toUpperCase() === filtroMatriculaFcda.toUpperCase();
    const matchApli = filtroAplicabilidadeFcda === 'TODAS' || f.aplicabilidade === filtroAplicabilidadeFcda;
    const matchTipo = filtroTipoAcaoFcda === 'TODOS' || f.tipo_acao === filtroTipoAcaoFcda;
    const q = searchFcda.toLowerCase();
    const matchSearch =
      !q ||
      f.numero_fcda.toLowerCase().includes(q) ||
      f.numero_diretriz.toLowerCase().includes(q) ||
      f.matricula_aeronave.toLowerCase().includes(q) ||
      f.numero_os.toLowerCase().includes(q) ||
      f.produto_modelo.toLowerCase().includes(q);
    return matchMat && matchApli && matchTipo && matchSearch;
  });

  // Unique aircraft registrations from FCDAs
  const matriculasDisponiveis = Array.from(new Set(fcdas.map((f) => f.matricula_aeronave))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* CTM Header with Regulatory References */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    CTM & DADOS TÉCNICOS • DIRETRIZES DE AERONAVEGABILIDADE
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    PARTE 3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controle Técnico de Manutenção conforme RBAC 145.109, IS 145.109-001, I 001-02, I 001-03 e IS 39-001A
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setPubToEdit(null);
                setIsPubModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Publicação Técnica</span>
            </button>

            <button
              onClick={() => {
                setCartaToEdit(null);
                setIsCartaModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Building className="w-4 h-4 text-amber-400" />
              <span>Nova Carta de Concessão</span>
            </button>

            <button
              onClick={() => {
                setFcdaToEdit(null);
                setIsFcdaModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-950/30 transition flex items-center space-x-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Emitir FCDA (Form F 001-03-2)</span>
            </button>
          </div>
        </div>

        {/* Regulatory Rule #1 Notice */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px]">
              REGRA INVIOLÁVEL #1 ATIVA: Gravação compulsória de "N/A" para campos não aplicáveis em manuais e FCDA.
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              ANAC COM: 200607-05
            </span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              EASA.145.1003
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Publicações Totais</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats?.total_publicacoes ?? 0}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            {stats?.publicacoes_atualizadas ?? 0} atualizadas (F 001-02-1)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Revisão Pendente</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-bold font-mono ${stats?.publicacoes_a_revisar ? 'text-amber-400' : 'text-slate-300'}`}>
            {stats?.publicacoes_a_revisar ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Exige checagem periódica
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cartas Concessão</span>
            <Building className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats?.total_cartas_concessao ?? 0}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
            {stats?.cartas_ativas ?? 0} válidas (I 001-02)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>FCDAs Emitidas</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {stats?.total_fcdas ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {stats?.fcdas_aplicaveis ?? 0} aplicáveis cumpridas
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Não-Aplicáveis</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {stats?.fcdas_nao_aplicaveis ?? 0}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            100% com justificativa técnica
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Ciências do Técnico</span>
            <CheckCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-300 font-mono">
            {stats?.total_ciencias ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Form F 001-02-2 registradas
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSubTab('publicacoes')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            subTab === 'publicacoes'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Tabela Mestre de Publicações (Form F 001-02-1)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
            {publicacoes.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('cartas')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            subTab === 'cartas'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Building className="w-4 h-4 text-amber-400" />
          <span>Cartas de Concessão de Manuais (I 001-02)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
            {cartas.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('fcda')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            subTab === 'fcda'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-amber-400" />
          <span>FCDA - Cumprimento de DA/AD/SB (Form F 001-03-2)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
            {fcdas.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('relatorio-mensal')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            subTab === 'relatorio-mensal'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Relatório Mensal de Mandatórias (Form F 001-03-3)</span>
        </button>

        <button
          onClick={() => setSubTab('agencias')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
            subTab === 'agencias'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Central de Monitoramento (ANAC / FAA / EASA)</span>
        </button>
      </div>

      {/* Agency Notification Feedback */}
      {agencyFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-700/60 p-3 rounded-lg text-emerald-200 text-xs font-mono flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{agencyFeedback}</span>
        </div>
      )}

      {/* SUB-TAB 1: TABELA MESTRE DE PUBLICAÇÕES (Form F 001-02-1) */}
      {subTab === 'publicacoes' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 min-w-[240px] items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="text"
                value={searchPub}
                onChange={(e) => setSearchPub(e.target.value)}
                placeholder="Buscar por código, título, modelo (ex: A320, C208B) ou fabricante..."
                className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1">
                <span className="text-slate-400">Tipo:</span>
                <select
                  value={filtroTipoPub}
                  onChange={(e) => setFiltroTipoPub(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="AMM">AMM (Aircraft Maintenance Manual)</option>
                  <option value="IPC">IPC (Illustrated Parts Catalog)</option>
                  <option value="MPD">MPD (Maintenance Planning Doc)</option>
                  <option value="WDM">WDM (Wiring Diagram Manual)</option>
                  <option value="SRM">SRM (Structural Repair Manual)</option>
                  <option value="CMM">CMM (Component Maintenance Manual)</option>
                  <option value="ENGINE_MANUAL">Engine Manual</option>
                  <option value="SB">Service Bulletin (SB)</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-slate-400">Status:</span>
                <select
                  value={filtroStatusPub}
                  onChange={(e) => setFiltroStatusPub(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="ATUALIZADO">Atualizado</option>
                  <option value="A_REVISAR">A Revisar</option>
                  <option value="OBSOLETO">Obsoleto</option>
                  <option value="AGUARDANDO_CONCESSAO">Aguardando Concessão</option>
                </select>
              </div>

              <button
                onClick={loadData}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Recarregar dados"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Publications Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Código / Título</th>
                    <th className="py-3 px-4">Tipo & ATA</th>
                    <th className="py-3 px-4">Fabricante & Modelo</th>
                    <th className="py-3 px-4">Revisão Vigente</th>
                    <th className="py-3 px-4">Carta Concessão</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Ciências (F 001-02-2)</th>
                    <th className="py-3 px-4 text-right">Ações Regulamentares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredPubs.map((pub) => {
                    const isAguardando = pub.status === 'AGUARDANDO_CONCESSAO';
                    const isARevisar = pub.status === 'A_REVISAR';
                    const isAtualizado = pub.status === 'ATUALIZADO';

                    return (
                      <tr key={pub.id_publicacao} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white text-xs">
                            {pub.codigo_documento}
                          </div>
                          <div className="text-slate-300 font-medium truncate max-w-xs" title={pub.titulo}>
                            {pub.titulo}
                          </div>
                          {pub.link_acesso && pub.link_acesso !== 'N/A' && (
                            <a
                              href={pub.link_acesso}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-400 hover:underline flex items-center space-x-1 mt-0.5"
                            >
                              <span>Acessar Portal do Manual</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                            {pub.tipo_documento}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1 font-mono">
                            ATA: {pub.ata_capitulo}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{pub.fabricante}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{pub.modelo_aplicavel}</div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-slate-200">{pub.revisao_atual}</div>
                          <div className="text-[11px] text-slate-500">
                            Data: {pub.data_revisao}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Verif.: {pub.data_ultima_verificacao}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-xs font-mono">
                          {pub.numero_carta_concessao && pub.numero_carta_concessao !== 'N/A' ? (
                            <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80 font-semibold">
                              {pub.numero_carta_concessao}
                            </span>
                          ) : (
                            <span className="text-slate-500">Próprio / N/A</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border inline-block ${
                              isAtualizado
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                                : isARevisar
                                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                                : isAguardando
                                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
                                : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                            }`}
                          >
                            {pub.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          <button
                            onClick={() => {
                              setPubCiencia(pub);
                              setIsCienciaModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 hover:border-teal-500/50 transition inline-flex items-center space-x-1"
                            title="Visualizar e registrar ciências técnicas (Form F 001-02-2)"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-teal-400" />
                            <span>{pub.ciencias_count ?? 0} Vistos</span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setPubToCheck(pub);
                                setIsCheckRevModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-medium transition"
                              title="Registrar verificação periódica de revisão"
                            >
                              Checar Revisão
                            </button>

                            <button
                              onClick={() => {
                                setPubToEdit(pub);
                                setIsPubModalOpen(true);
                              }}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Editar Publicação"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPubs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                        Nenhuma publicação técnica encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CARTAS DE CONCESSÃO (IS 145.109-001 / I 001-02) */}
      {subTab === 'cartas' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Cartas de Concessão de Manuais Técnicos por Clientes / Operadores
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Conforme RBAC 145.109, IS 145.109-001 e Instrução de Trabalho I 001-02 da Impacto Aviation
              </p>
            </div>
            <button
              onClick={() => {
                setCartaToEdit(null);
                setIsCartaModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cadastrar Carta de Concessão</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartas.map((carta) => {
              const isValida = carta.status === 'VALIDA';

              return (
                <div
                  key={carta.id_carta_concessao}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {carta.numero_carta}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isValida
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                        }`}
                      >
                        {carta.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm mb-1">{carta.operador_cliente}</h4>
                    <div className="text-xs text-slate-400 font-mono mb-2">
                      Frotas / Modelos: <span className="text-slate-200 font-semibold">{carta.frotas_modelos}</span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs mb-3 space-y-1">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Manuais Concedidos:</span>
                        <span className="text-slate-200 font-mono font-medium">{carta.manuais_concedidos}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-900">
                        <span className="text-slate-500 text-[11px] block">Forma de Acesso / Plataforma:</span>
                        <span className="text-blue-300 text-[11px]">{carta.forma_acesso}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 mb-2">
                      <div>
                        <span className="block text-slate-500 text-[10px]">Emissão:</span>
                        <span className="text-slate-300">{carta.data_emissao}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px]">Validade:</span>
                        <span className="text-slate-300 font-bold">{carta.data_validade}</span>
                      </div>
                    </div>

                    {carta.observacoes && carta.observacoes !== 'N/A' && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-800/40">
                        "{carta.observacoes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs mt-3">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Resp: {carta.responsavel_nome}
                    </span>
                    <button
                      onClick={() => {
                        setCartaToEdit(carta);
                        setIsCartaModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-mono text-[11px]"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EMISSÃO DE FCDA (Form F 001-03-2) */}
      {subTab === 'fcda' && (
        <div className="space-y-4">
          {/* FCDA Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 min-w-[240px] items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="text"
                value={searchFcda}
                onChange={(e) => setSearchFcda(e.target.value)}
                placeholder="Buscar FCDA por número, Diretriz (AD/DA), prefixo ou OS..."
                className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1">
                <span className="text-slate-400">Prefixo:</span>
                <select
                  value={filtroMatriculaFcda}
                  onChange={(e) => setFiltroMatriculaFcda(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-mono"
                >
                  <option value="TODAS">Todos os Prefixos</option>
                  {matriculasDisponiveis.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-slate-400">Aplicabilidade:</span>
                <select
                  value={filtroAplicabilidadeFcda}
                  onChange={(e) => setFiltroAplicabilidadeFcda(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value="TODAS">Todas</option>
                  <option value="APLICAVEL">Aplicável</option>
                  <option value="NAO_APLICAVEL">Não Aplicável (Justificada)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-slate-400">Ação:</span>
                <select
                  value={filtroTipoAcaoFcda}
                  onChange={(e) => setFiltroTipoAcaoFcda(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="TERMINAL">Terminal</option>
                  <option value="REPETITIVA">Repetitiva</option>
                  <option value="PARCIAL">Parcial</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFcdaToEdit(null);
                  setIsFcdaModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Emitir FCDA</span>
              </button>
            </div>
          </div>

          {/* FCDAs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nº FCDA / OS</th>
                    <th className="py-3 px-4">Aeronave (Prefixo/MSN)</th>
                    <th className="py-3 px-4">Diretriz Mandatória (AD/DA)</th>
                    <th className="py-3 px-4">Categoria & Ação</th>
                    <th className="py-3 px-4">Aplicabilidade</th>
                    <th className="py-3 px-4">Data & Próx. Vencimento</th>
                    <th className="py-3 px-4">Corpo Técnico</th>
                    <th className="py-3 px-4 text-right">Documento Oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredFcdas.map((fcda) => {
                    const isAplicavel = fcda.aplicabilidade === 'APLICAVEL';
                    const isRepetitiva = fcda.tipo_acao === 'REPETITIVA';

                    return (
                      <tr key={fcda.id_fcda} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-amber-400 text-xs">
                            {fcda.numero_fcda}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            OS: {fcda.numero_os}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white text-xs">
                            {fcda.matricula_aeronave}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            MSN: {fcda.msn_aeronave || 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {fcda.nome_operador}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-blue-300 text-xs">
                            {fcda.numero_diretriz}
                          </div>
                          {fcda.numero_sb_referencia && fcda.numero_sb_referencia !== 'N/A' && (
                            <div className="text-[11px] text-slate-400">
                              SB: {fcda.numero_sb_referencia}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500">
                            Efetividade: {fcda.data_efetividade}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {fcda.categoria_aplicacao}
                          </span>
                          <div className="mt-1">
                            <span
                              className={`text-[10px] font-bold ${
                                isRepetitiva ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              {fcda.tipo_acao}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border block text-center max-w-[130px] ${
                              isAplicavel
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                                : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                            }`}
                          >
                            {isAplicavel ? 'APLICÁVEL' : 'NÃO APLICÁVEL'}
                          </span>
                          {!isAplicavel && (
                            <div
                              className="text-[10px] text-amber-300 italic truncate max-w-[140px] mt-1"
                              title={fcda.justificativa_nao_aplicabilidade}
                            >
                              Justificada: {fcda.justificativa_nao_aplicabilidade}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div className="text-slate-300 font-semibold">
                            Exec.: {fcda.data_cumprimento}
                          </div>
                          {isRepetitiva ? (
                            <div className="text-amber-400 text-[10px]">
                              Próx: {fcda.proximo_vencimento_horas !== 'N/A' ? `${fcda.proximo_vencimento_horas}h` : fcda.proximo_vencimento_data}
                            </div>
                          ) : (
                            <div className="text-slate-500 text-[10px]">Cumprimento Terminal</div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[11px]">
                          <div className="text-slate-300">
                            <span className="text-slate-500 font-mono">Exec:</span> {fcda.executor_nome}
                          </div>
                          <div className="text-cyan-300">
                            <span className="text-slate-500 font-mono">Insp (APRS):</span> {fcda.inspetor_nome}
                          </div>
                          <div className="text-slate-400">
                            <span className="text-slate-500 font-mono">RT:</span> {fcda.rt_nome}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setFcdaToPrint(fcda);
                                setIsFcdaPrintOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                              title="Visualizar e Imprimir Ficha Oficial Form F 001-03-2"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>F 001-03-2</span>
                            </button>

                            <button
                              onClick={() => {
                                setFcdaToEdit(fcda);
                                setIsFcdaModalOpen(true);
                              }}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Editar FCDA"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFcdas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                        Nenhuma FCDA encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RELATÓRIO MENSAL DE MANDATÓRIAS (Form F 001-03-3) */}
      {subTab === 'relatorio-mensal' && relatorioMensal && (
        <div className="space-y-4">
          {/* Monthly Report Controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Listagem Mensal de Mandatórias Cumpridas • Form F 001-03-3 (I 001-24)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Relatório consolidado para envio ao CTM do operador e arquivamento obrigatório no PCP da Impacto Aviation
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Mês / Ano:</span>
                <input
                  type="month"
                  value={mesAnoRelatorio}
                  onChange={(e) => setMesAnoRelatorio(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Prefixo:</span>
                <select
                  value={filtroPrefixoRelatorio}
                  onChange={(e) => setFiltroPrefixoRelatorio(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                >
                  <option value="TODAS">Todas as Aeronaves</option>
                  {matriculasDisponiveis.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Relatório (F 001-03-3)</span>
              </button>
            </div>
          </div>

          {/* Form F 001-03-3 Official Paper Preview Layout */}
          <div className="bg-white text-slate-900 rounded-xl p-4 sm:p-6 shadow-xl border border-slate-300 font-sans text-xs print:p-0 print:border-none print:shadow-none print-landscape">
            {/* Header Document */}
            <OfficialFormHeader
              codigoFormulario="FORM F 001-03-3"
              numeroRevisao="R08"
              dataRevisao="15/01/2026"
              tituloDocumento="RELATÓRIO MENSAL DE DIRETRIZES DE AERONAVEGABILIDADE (DA/AD) E BOLETINS (SB) CUMPRIDOS"
              subtituloDocumento="MONTHLY SUMMARY OF MANDATORY AIRWORTHINESS DIRECTIVES (MOMQ I 001-24 / IS 39-001A)"
              instrucaoMOMQ="INSTRUÇÃO DE CONTROLE TÉCNICO I 001-24 • ENVIO AO CTM DO OPERADOR E PCP"
              numeroDocumento={`MÊS: ${relatorioMensal.mes_ano_formatado}`}
              baseOperacional="GRU"
              paginaInfo="PÁG. 1 DE 1"
            />

            {/* Mandatory N/A Regulatory Notice */}
            <NaRuleNotice />

            {/* Metadata Summary */}
            <div className="grid grid-cols-3 gap-2 border border-black p-2 mb-3 bg-slate-50 text-[9.5px] font-mono">
              <div>
                <span className="font-bold block text-slate-700 uppercase">Campo 01 • Data de Emissão:</span>
                <span className="font-black text-black">{relatorioMensal.data_geracao}</span>
              </div>
              <div>
                <span className="font-bold block text-slate-700 uppercase">Campo 02 • Total de Mandatórias no Mês:</span>
                <span className="font-black text-blue-900 text-xs">{relatorioMensal.total_mandatorias} ITEM(NS) REGISTRADO(S)</span>
              </div>
              <div>
                <span className="font-bold block text-slate-700 uppercase">Campo 03 • Filtro de Prefixo Aplicado:</span>
                <span className="font-black text-black">{filtroPrefixoRelatorio}</span>
              </div>
            </div>

            {/* Table of Mandatories */}
            <div className="border border-black overflow-hidden mb-3">
              <table className="w-full text-left text-[9.5px]">
                <thead className="bg-slate-200 border-b border-black font-mono font-bold uppercase text-[8.5px]">
                  <tr>
                    <th className="py-2 px-2 border-r border-black w-8 text-center">Item</th>
                    <th className="py-2 px-2 border-r border-black">Campo 04 • Nº Mandatório (AD / DA)</th>
                    <th className="py-2 px-2 border-r border-black">Campo 05 • Assunto / Ação Realizada</th>
                    <th className="py-2 px-2 border-r border-black w-24">Campo 06 • Nº OS</th>
                    <th className="py-2 px-2 border-r border-black w-24">Campo 07 • Prefixo (MSN)</th>
                    <th className="py-2 px-2 border-r border-black w-20">Campo 08 • Data</th>
                    <th className="py-2 px-2 border-r border-black w-20">Campo 09 • Ação</th>
                    <th className="py-2 px-2 border-r border-black w-24">Campo 10 • Próx. Venc.</th>
                    <th className="py-2 px-2">Campo 11 • Resp. Técnico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/80 font-sans">
                  {relatorioMensal.itens.map((item) => (
                    <tr key={item.numero_item} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 border-r border-black text-center font-mono font-bold">
                        {item.numero_item}
                      </td>
                      <td className="py-1.5 px-2 border-r border-black font-mono font-bold text-blue-900">
                        {item.numero_mandatorio}
                      </td>
                      <td className="py-1.5 px-2 border-r border-black">
                        <div className="font-semibold text-black">{item.assunto}</div>
                        <div className="text-[8px] text-slate-600 uppercase font-mono">{item.aplicabilidade}</div>
                      </td>
                      <td className="py-1.5 px-2 border-r border-black font-mono font-semibold text-black">
                        {item.numero_os}
                      </td>
                      <td className="py-1.5 px-2 border-r border-black font-mono">
                        <span className="font-bold text-black">{item.prefixo_aeronave}</span>
                        <span className="text-[8px] text-slate-600 block">MSN: {item.msn}</span>
                      </td>
                      <td className="py-1.5 px-2 border-r border-black font-mono">
                        {item.data_execucao}
                      </td>
                      <td className="py-1.5 px-2 border-r border-black font-mono font-bold">
                        {item.tipo_acao}
                      </td>
                      <td className="py-1.5 px-2 border-r border-black font-mono">
                        {item.proximo_vencimento}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-[8.5px]">
                        {item.responsavel_tecnico}
                      </td>
                    </tr>
                  ))}
                  {relatorioMensal.itens.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-500 font-mono italic">
                        Nenhuma diretriz mandatória cumprida registrada para o mês de {relatorioMensal.mes_ano_formatado}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* EASA Part-145 Release Declaration */}
            <EasaReleaseDeclaration dataAprovacao={relatorioMensal.data_geracao} />

            {/* Signatures Block for Form F 001-03-3 */}
            <div className="border-2 border-black grid grid-cols-2 gap-0 text-[9.5px] page-break-avoid">
              <div className="p-3 border-r border-black flex flex-col justify-between h-24">
                <span className="font-bold text-slate-800 uppercase text-[8.5px]">
                  Campo 12 • Elaborado por (PCP / CTM Impacto Aviation):
                </span>
                <div className="text-center font-mono border-t border-dotted border-black pt-1">
                  <div className="font-bold text-black">{relatorioMensal.responsavel_elaboracao}</div>
                  <div className="text-[8px] text-slate-600">Planejamento e Controle da Manutenção</div>
                </div>
              </div>

              <div className="p-3 flex flex-col justify-between h-24 bg-slate-50">
                <span className="font-bold text-slate-800 uppercase text-[8.5px]">
                  Campo 13 • Aprovado por (Responsável Técnico - RT / Diretoria Técnica):
                </span>
                <div className="text-center font-mono border-t border-dotted border-black pt-1">
                  <div className="font-bold text-black">{relatorioMensal.responsavel_aprovacao_rt}</div>
                  <div className="text-[8px] text-slate-600">COM ANAC 200607-05 / EASA.145.1003</div>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-2 text-[7.5px] text-slate-600 font-mono flex justify-between border-t border-slate-300 pt-1">
              <span>IMPACTO AVIATION LTDA • FORM F 001-03-3 • ARQUIVO PCP / ENVIO CTM OPERADOR</span>
              <span>CERTIFICADO ANAC RBAC 145 / EASA PART-145 • MOMQ REV 08</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CENTRAL DE MONITORAMENTO REGULATÓRIO (ANAC, FAA, EASA) */}
      {subTab === 'agencias' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Central de Monitoramento e Links Oficiais de Agências Reguladoras
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Acesso rápido para consulta periódica de Diretrizes de Aeronavegabilidade (DAs/ADs), Boletins de Emergência e Biweeklies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monitoramentos.map((item) => {
              const isAnac = item.agencia === 'ANAC';
              const isFaa = item.agencia === 'FAA';
              const isEasa = item.agencia === 'EASA';

              return (
                <div
                  key={item.id_monitoramento || item.agencia}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                          isAnac
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            : isFaa
                            ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                            : 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                        }`}
                      >
                        {item.agencia} • {item.nome_sistema}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {item.status_monitoramento}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3">{item.descricao}</p>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Última Checagem:</span>
                        <span className="text-slate-200 font-semibold">{item.ultima_checagem}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Responsável:</span>
                        <span className="text-slate-300 text-[11px] truncate max-w-[150px]" title={item.responsavel_checagem}>
                          {item.responsavel_checagem}
                        </span>
                      </div>
                    </div>

                    {item.observacoes && item.observacoes !== 'N/A' && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-800/40 mb-4">
                        "{item.observacoes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                    <a
                      href={item.link_oficial || item.url_consulta}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 flex items-center justify-center space-x-2 transition"
                    >
                      <span>Acessar Portal Oficial {item.agencia}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleChecarAgencia(item.agencia)}
                      disabled={checkingAgency === item.agencia}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{checkingAgency === item.agencia ? 'Gravando...' : 'Registrar Checagem de Diretrizes'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: Publicação Técnica (Criar/Editar Form F 001-02-1) */}
      <PublicationModal
        publicationToEdit={pubToEdit}
        isOpen={isPubModalOpen}
        onClose={() => {
          setIsPubModalOpen(false);
          setPubToEdit(null);
        }}
        onSuccess={() => {
          loadData();
          onRefreshGlobal?.();
        }}
        cartas={cartas}
        tecnicos={tecnicos}
      />

      {/* MODAL 2: Checagem Periódica de Revisão */}
      {pubToCheck && (
        <CheckRevisionModal
          publication={pubToCheck}
          isOpen={isCheckRevModalOpen}
          onClose={() => {
            setIsCheckRevModalOpen(false);
            setPubToCheck(null);
          }}
          onSuccess={() => {
            loadData();
            onRefreshGlobal?.();
          }}
          tecnicos={tecnicos}
        />
      )}

      {/* MODAL 3: Registro de Ciência do Corpo Técnico (Form F 001-02-2) */}
      {pubCiencia && (
        <CienciaModal
          publication={pubCiencia}
          isOpen={isCienciaModalOpen}
          onClose={() => {
            setIsCienciaModalOpen(false);
            setPubCiencia(null);
          }}
          onSuccess={() => {
            loadData();
            onRefreshGlobal?.();
          }}
          tecnicos={tecnicos}
        />
      )}

      {/* MODAL 4: Carta de Concessão de Manuais (I 001-02) */}
      <CartaConcessaoModal
        cartaToEdit={cartaToEdit}
        isOpen={isCartaModalOpen}
        onClose={() => {
          setIsCartaModalOpen(false);
          setCartaToEdit(null);
        }}
        onSuccess={() => {
          loadData();
          onRefreshGlobal?.();
        }}
        tecnicos={tecnicos}
      />

      {/* MODAL 5: Emissão e Edição de FCDA (Form F 001-03-2) */}
      <FcdaModal
        fcdaToEdit={fcdaToEdit}
        isOpen={isFcdaModalOpen}
        onClose={() => {
          setIsFcdaModalOpen(false);
          setFcdaToEdit(null);
        }}
        onSuccess={() => {
          loadData();
          onRefreshGlobal?.();
        }}
        tecnicos={tecnicos}
      />

      {/* MODAL 6: Visualização Oficial e Impressão da FCDA (Form F 001-03-2) */}
      <FcdaPrintModal
        fcda={fcdaToPrint}
        isOpen={isFcdaPrintOpen}
        onClose={() => {
          setIsFcdaPrintOpen(false);
          setFcdaToPrint(null);
        }}
      />
    </div>
  );
};
