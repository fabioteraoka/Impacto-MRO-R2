import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  FileText,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Search,
  Filter,
  RefreshCw,
  Building,
  Plane,
  UserCheck,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Calendar,
  Layers,
  ArrowUpRight,
  Check,
  ExternalLink,
  BookOpen,
  Lock,
} from 'lucide-react';
import {
  OrdemServicoF001_09_2,
  LiberacaoRTS,
  DossieDigitalOS,
  PainelExecutivoStats,
  PessoalTecnico,
  BaseOperacional,
} from '../types/mro';
import { AuditOsModal } from './AuditOsModal';
import { RtsModal } from './RtsModal';
import { LtaPrintModal } from './LtaPrintModal';
import { DossiePrintModal } from './DossiePrintModal';
import { OfficialFormNotices } from './OfficialFormNotices';

interface QualityReleaseViewProps {
  bases: BaseOperacional[];
  tecnicos: PessoalTecnico[];
  onRefreshGlobal?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type SubTabQualidade = 'auditoria-os' | 'rts-liberacoes' | 'arquivo-tecnico' | 'painel-executivo';

export const QualityReleaseView: React.FC<QualityReleaseViewProps> = ({
  bases,
  tecnicos,
  onRefreshGlobal,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabQualidade>('auditoria-os');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [ordensServico, setOrdensServico] = useState<OrdemServicoF001_09_2[]>([]);
  const [liberacoesRts, setLiberacoesRts] = useState<LiberacaoRTS[]>([]);
  const [dossies, setDossies] = useState<DossieDigitalOS[]>([]);
  const [executivoStats, setExecutivoStats] = useState<PainelExecutivoStats | null>(null);

  // Filters
  const [filtroBase, setFiltroBase] = useState<string>('TODAS');
  const [busca, setBusca] = useState<string>('');

  // Modals
  const [auditOsModalTarget, setAuditOsModalTarget] = useState<OrdemServicoF001_09_2 | null>(null);
  const [rtsModalTarget, setRtsModalTarget] = useState<OrdemServicoF001_09_2 | null>(null);
  const [ltaModalTarget, setLtaModalTarget] = useState<{ os: OrdemServicoF001_09_2; rts?: LiberacaoRTS } | null>(null);
  const [dossieModalTarget, setDossieModalTarget] = useState<DossieDigitalOS | null>(null);

  // Success Feedback
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [filtroBase]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [resOs, resRts, resDossies, resExec] = await Promise.all([
        fetch('/api/ordens-servico'),
        fetch(`/api/qualidade/rts${filtroBase !== 'TODAS' ? `?base=${filtroBase}` : ''}`),
        fetch(`/api/arquivo-tecnico/dossies${filtroBase !== 'TODAS' ? `?base=${filtroBase}` : ''}`),
        fetch('/api/diretoria/painel-executivo'),
      ]);

      const parseJsonSafe = async (res: Response, fallback: any = { success: false, data: [] }) => {
        if (!res.ok) return fallback;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await res.json();
        }
        return fallback;
      };

      const [dataOs, dataRts, dataDossies, dataExec] = await Promise.all([
        parseJsonSafe(resOs),
        parseJsonSafe(resRts),
        parseJsonSafe(resDossies),
        parseJsonSafe(resExec, { success: false, data: null }),
      ]);

      if (dataOs?.success) setOrdensServico(dataOs.data || []);
      if (dataRts?.success) setLiberacoesRts(dataRts.data || []);
      if (dataDossies?.success) setDossies(dataDossies.data || []);
      if (dataExec?.success) setExecutivoStats(dataExec.data || null);
    } catch (err) {
      console.error('Erro ao carregar dados da Garantia da Qualidade:', err);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(null), 5000);
  };

  // Filtragem de OSs
  const ossFiltradas = ordensServico.filter((os) => {
    const matchBase = filtroBase === 'TODAS' || os.campo_06_base_executante === filtroBase;
    const matchBusca =
      busca === '' ||
      os.numero_os.toLowerCase().includes(busca.toLowerCase()) ||
      os.campo_02_matricula.toLowerCase().includes(busca.toLowerCase()) ||
      os.campo_05_operador.toLowerCase().includes(busca.toLowerCase()) ||
      os.campo_03_modelo.toLowerCase().includes(busca.toLowerCase());
    return matchBase && matchBusca;
  });

  // Filtragem de RTS
  const rtsFiltrados = liberacoesRts.filter((r) => {
    const matchBase = filtroBase === 'TODAS' || r.base_liberacao === filtroBase;
    const matchBusca =
      busca === '' ||
      r.numero_rts.toLowerCase().includes(busca.toLowerCase()) ||
      r.numero_os.toLowerCase().includes(busca.toLowerCase()) ||
      r.matricula_aeronave.toLowerCase().includes(busca.toLowerCase()) ||
      r.operador_cliente.toLowerCase().includes(busca.toLowerCase());
    return matchBase && matchBusca;
  });

  // Filtragem de Dossiês
  const dossiesFiltrados = dossies.filter((d) => {
    const matchBase = filtroBase === 'TODAS' || d.base === filtroBase;
    const matchBusca =
      busca === '' ||
      d.id_dossie.toLowerCase().includes(busca.toLowerCase()) ||
      d.numero_os.toLowerCase().includes(busca.toLowerCase()) ||
      d.matricula.toLowerCase().includes(busca.toLowerCase()) ||
      d.operador.toLowerCase().includes(busca.toLowerCase()) ||
      d.numero_rts.toLowerCase().includes(busca.toLowerCase());
    return matchBase && matchBusca;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Superior Regulatório */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 uppercase">
                  Parte 6 • Final
                </span>
                <span className="text-slate-400 text-xs font-mono">•</span>
                <span className="text-xs text-slate-300 font-mono">
                  MOMQ 5.7 / MOMQ 5.7.1 / MOMQ 6.5 / RBAC 43.9 / EASA Part-145
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white font-mono uppercase tracking-tight mt-0.5">
                Garantia da Qualidade, Liberação / RTS e Arquivo Técnico
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Motor de Auditoria de Fechamento da OS, Certificação Dual Release (ANAC/EASA), Anotação Oficial de Livro Técnico (LTA) e Repositório Digital Consolidado com controle legal de retenção de 5 anos (RBAC 145) e 3 anos (EASA).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={carregarDados}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Atualizar dados regulatórios"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}
      </div>

      {/* SubTabs de Navegação */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveSubTab('auditoria-os')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold text-xs transition ${
              activeSubTab === 'auditoria-os'
                ? 'bg-cyan-500 text-slate-950 border border-cyan-400 shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoria GQ de Fechamento (MOMQ 5.7)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-cyan-300 font-mono">
              {ordensServico.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('rts-liberacoes')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold text-xs transition ${
              activeSubTab === 'rts-liberacoes'
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400 shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Liberações RTS & Dual Release (MOMQ 5.7.1)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-emerald-300 font-mono">
              {liberacoesRts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('arquivo-tecnico')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold text-xs transition ${
              activeSubTab === 'arquivo-tecnico'
                ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Arquivo Técnico & Dossiês (MOMQ 6.5)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-amber-300 font-mono">
              {dossies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('painel-executivo')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold text-xs transition ${
              activeSubTab === 'painel-executivo'
                ? 'bg-purple-500 text-slate-950 border border-purple-400 shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Painel Executivo GR & RT</span>
          </button>
        </div>

        {/* Filtros de Base e Busca */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroBase}
              onChange={(e) => setFiltroBase(e.target.value)}
              className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="TODAS">Todas as Bases (GRU, CNF, VCP)</option>
              <option value="GRU">Base GRU (Sede Principal)</option>
              <option value="CNF">Base CNF (Secundária)</option>
              <option value="VCP">Base VCP (Linha)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por OS, Matrícula..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs w-48 sm:w-60 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ABA 1: CENTRAL DE AUDITORIA DE FECHAMENTO PELA GQ (MOMQ 5.7) */}
      {/* ==================================================================== */}
      {activeSubTab === 'auditoria-os' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Verificação Prévia de Conformidade para Liberação da OS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                O motor regulatório confere os 6 pilares compulsórios: Tarefas 100% cumpridas, RIs F 001-12 fechados, dupla inspeção IIO, FCDAs aprovadas, PME devolvido e checklist FOD.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-mono text-cyan-300">
                {ossFiltradas.length} Ordens de Serviço listadas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {ossFiltradas.map((os) => {
              const rtsEmitido = liberacoesRts.find((r) => r.id_os === os.id_os);
              const isEncerrada = os.status_os === 'ENCERRADA';

              return (
                <div
                  key={os.id_os}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Identificação da OS e Aeronave */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-black text-white text-base">
                          {os.numero_os}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {os.campo_02_matricula} ({os.campo_03_modelo})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          Base {os.campo_06_base_executante}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isEncerrada
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {os.status_os}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        <strong>Escopo:</strong> {os.campo_11_escopo_servico}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>Operador: <strong className="text-slate-200">{os.campo_05_operador}</strong></span>
                        <span>•</span>
                        <span>Abertura: {os.campo_07_data_abertura} {os.campo_07_hora_abertura}</span>
                        <span>•</span>
                        <span>TSN: {os.campo_09_tsn}</span>
                        <span>•</span>
                        <span>Inspetor APRS: {os.inspetor_aprs_nome}</span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      
                      {/* Botão de Auditoria GQ */}
                      <button
                        onClick={() => setAuditOsModalTarget(os)}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 text-xs font-bold transition shadow-sm"
                        title="Executar Auditoria Prévia de Fechamento da Garantia da Qualidade"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Auditar GQ (MOMQ 5.7)</span>
                      </button>

                      {/* Se já possui RTS emitido */}
                      {rtsEmitido ? (
                        <>
                          <button
                            onClick={() => setLtaModalTarget({ os, rts: rtsEmitido })}
                            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                            title="Visualizar Anotação LTA padronizada"
                          >
                            <FileText className="w-4 h-4 text-amber-400" />
                            <span>Anotação LTA</span>
                          </button>

                          <span className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-mono text-xs font-bold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{rtsEmitido.numero_rts}</span>
                          </span>
                        </>
                      ) : (
                        <button
                          onClick={() => setRtsModalTarget(os)}
                          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/40 active:scale-95"
                          title="Emitir Aprovação para Retorno ao Serviço com Dual Release"
                        >
                          <Award className="w-4 h-4" />
                          <span>Emitir RTS (Dual Release)</span>
                        </button>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 2: LIBERAÇÕES RTS & DUAL RELEASE (MOMQ 5.7.1) */}
      {/* ==================================================================== */}
      {activeSubTab === 'rts-liberacoes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Registro Histórico de Retorno ao Serviço (RTS - MOMQ 5.7.1)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Certificações formais emitidas pelo Inspetor APRS e Diretor Técnico (RT) com declarações obrigatórias ANAC RBAC 43.9 e EASA Part-145.A.50.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-300 shrink-0">
              {rtsFiltrados.length} RTSs emitidos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {rtsFiltrados.map((rts) => {
              const osAssociada = ordensServico.find((o) => o.id_os === rts.id_os);

              return (
                <div
                  key={rts.id_rts}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-white text-base">
                            {rts.numero_rts}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {rts.tipo_declaracao}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          OS: <strong className="text-white font-mono">{rts.numero_os}</strong> • Aeronave:{' '}
                          <strong className="text-white font-mono">{rts.matricula_aeronave} ({rts.modelo_aeronave})</strong> • Base:{' '}
                          <strong className="text-white font-mono">{rts.base_liberacao}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (osAssociada) {
                            setLtaModalTarget({ os: osAssociada, rts });
                          }
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                      >
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>Ver Anotação LTA</span>
                      </button>
                    </div>
                  </div>

                  {/* Declarações e Assinaturas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                        Declaração ANAC RBAC 43.9:
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed italic">
                        "{rts.texto_declaracao_anac}"
                      </p>

                      {rts.texto_declaracao_easa && (
                        <div className="mt-2 pt-2 border-t border-slate-800">
                          <span className="text-[10px] text-amber-400 font-bold uppercase block">
                            Declaração EASA Part-145 (EASA.145.1003):
                          </span>
                          <p className="text-[11px] text-amber-200 leading-relaxed italic">
                            "{rts.texto_declaracao_easa}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Inspetor APRS Homologador</span>
                        <span className="font-bold text-white block">{rts.inspetor_aprs_nome}</span>
                        <span className="text-[10px] text-cyan-300 block">CANAC: {rts.inspetor_aprs_canac} • {rts.inspetor_aprs_licenca_easa || 'EASA B1/B2'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Diretor Técnico / RT</span>
                        <span className="font-bold text-white block">{rts.rt_nome}</span>
                        <span className="text-[10px] text-cyan-300 block">CANAC: {rts.rt_canac} • CREA: {rts.rt_crea}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span>TSN: {rts.tsn_liberacao}</span>
                        <span>CSN: {rts.csn_liberacao}</span>
                        <span>Data: {new Date(rts.data_hora_liberacao).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Distribuição das 3 Vias */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Distribuição das 3 Vias (MOMQ 6.5):</span>
                    <span className="text-cyan-300">1ª Via: PCP ({rts.distribuicao_vias.via_1_pcp.status})</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-300">2ª Via: Base {rts.base_liberacao} ({rts.distribuicao_vias.via_2_base.status})</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-purple-300">3ª Via: Cliente ({rts.distribuicao_vias.via_3_cliente.status})</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 3: ARQUIVO TÉCNICO & DOSSIÊS DIGITAIS (MOMQ 6.5) */}
      {/* ==================================================================== */}
      {activeSubTab === 'arquivo-tecnico' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Repositório Central de Dossiês Digitais Consolidados (MOMQ 6.5 / P 001-01)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Custódia técnica dos registros de manutenção concluídos. Guarda mandatória de 5 anos (ANAC RBAC 145.219) e 3 anos (EASA Part-145.A.55) com rastreabilidade auditável por SHA-256.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 shrink-0">
              {dossiesFiltrados.length} Dossiês Arquivados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dossiesFiltrados.map((d) => (
              <div
                key={d.id_dossie}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block">
                        Dossiê Digital Consolidado
                      </span>
                      <h4 className="font-mono font-black text-white text-base mt-0.5">
                        {d.id_dossie}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Aeronave: <strong className="text-white font-mono">{d.matricula} ({d.modelo})</strong> • MSN: {d.msn}
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {d.tipo_release}
                    </span>
                  </div>

                  {/* Resumo do Conteúdo Consolidado */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">OS Fechada</span>
                      <span className="font-bold text-white">{d.numero_os}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">RTS Emitido</span>
                      <span className="font-bold text-emerald-400">{d.numero_rts}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Base Executante</span>
                      <span className="font-bold text-cyan-300">{d.base}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Tarefas</span>
                      <span className="font-bold text-white">{d.total_tarefas_apontadas} (IIO: {d.total_tarefas_iio})</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">RIs Fechados</span>
                      <span className="font-bold text-white">{d.total_ris_f001_12_inclusos}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Peças Rastr.</span>
                      <span className="font-bold text-white">{d.materiais_rastreabilidade_inclusos}</span>
                    </div>
                  </div>

                  {/* Custódia Legal Regulatória */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guarda Legal ANAC (5 anos):</span>
                      <strong className="text-emerald-400">Até {d.data_limite_retencao_anac_5anos}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guarda Legal EASA (3 anos):</span>
                      <strong className="text-blue-400">Até {d.data_limite_retencao_easa_3anos}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-500">
                      <span>Armazenamento Físico:</span>
                      <span className="truncate max-w-[200px] text-slate-300">{d.local_armazenamento_fisico}</span>
                    </div>
                  </div>
                </div>

                {/* Botão de Abrir / Imprimir Dossiê */}
                <button
                  onClick={() => setDossieModalTarget(d)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Visualizar Dossiê Completo (A4 / PDF)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 4: PAINEL EXECUTIVO GR & RT (DIRETORIA) */}
      {/* ==================================================================== */}
      {activeSubTab === 'painel-executivo' && executivoStats && (
        <div className="space-y-6">
          {/* Métricas Principais de Alto Nível */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">OSs Concluídas</span>
              <span className="text-2xl font-black text-emerald-400 font-mono block mt-1">
                {executivoStats.total_os_concluidas}
              </span>
              <span className="text-[10px] text-slate-500 block">Homologadas GQ</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Em Andamento</span>
              <span className="text-2xl font-black text-amber-400 font-mono block mt-1">
                {executivoStats.total_os_em_andamento}
              </span>
              <span className="text-[10px] text-slate-500 block">No Hangar / Linha</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Taxa Pontualidade (SLA)</span>
              <span className="text-2xl font-black text-cyan-400 font-mono block mt-1">
                {executivoStats.taxa_pontualidade_sla}%
              </span>
              <span className="text-[10px] text-emerald-400 block">Acima da Meta (95%)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Índice Conformidade</span>
              <span className="text-2xl font-black text-purple-400 font-mono block mt-1">
                {executivoStats.taxa_conformidade_qualidade}%
              </span>
              <span className="text-[10px] text-slate-500 block">Zero Divergência</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">RTS Emitidos</span>
              <span className="text-2xl font-black text-white font-mono block mt-1">
                {executivoStats.total_rts_emitidos}
              </span>
              <span className="text-[10px] text-slate-500 block">Dual Release</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Dossiês sob Custódia</span>
              <span className="text-2xl font-black text-amber-400 font-mono block mt-1">
                {executivoStats.total_dossies_arquivados}
              </span>
              <span className="text-[10px] text-emerald-400 block">Vigência 5 Anos</span>
            </div>
          </div>

          {/* Desempenho por Base Operacional */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide mb-3 flex items-center space-x-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Desempenho Operacional e de Qualidade por Base (MOMQ MNT-001):</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {executivoStats.desempenho_bases.map((b) => (
                <div key={b.base} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-black text-base text-white">Base {b.base}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300">
                      {b.base === 'GRU' ? 'Sede Hangar' : b.base === 'CNF' ? 'Secundária' : 'Linha'}
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>OSs Concluídas:</span>
                      <strong className="text-emerald-400">{b.os_concluidas}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>OSs em Execução:</span>
                      <strong className="text-amber-400">{b.em_andamento}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Pontualidade SLA:</span>
                      <strong className="text-cyan-400">{b.pontualidade_pct}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>RIs em Aberto:</span>
                      <strong className={b.ris_abertos > 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {b.ris_abertos}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trilha de Auditoria Regulatória Recente */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Registro Imutável de Auditorias da Qualidade (Regulatory Audit Log):</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                    <th className="pb-2">Data</th>
                    <th className="pb-2">Ordem de Serviço</th>
                    <th className="pb-2">Matrícula</th>
                    <th className="pb-2">Resultado da Auditoria</th>
                    <th className="pb-2">Auditor Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {executivoStats.auditorias_recentes.map((aud, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/50">
                      <td className="py-2.5 text-slate-400">{aud.data}</td>
                      <td className="py-2.5 font-bold text-white">{aud.numero_os}</td>
                      <td className="py-2.5 text-cyan-300">{aud.matricula}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {aud.resultado}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300">{aud.auditor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAIS CONECTADOS */}

      {/* 1. Modal de Auditoria de Fechamento */}
      {auditOsModalTarget && (
        <AuditOsModal
          os={auditOsModalTarget}
          tecnicos={tecnicos}
          onClose={() => setAuditOsModalTarget(null)}
          onProceedToRts={(os) => {
            setAuditOsModalTarget(null);
            setRtsModalTarget(os);
          }}
        />
      )}

      {/* 2. Modal de Emissão do RTS */}
      {rtsModalTarget && (
        <RtsModal
          os={rtsModalTarget}
          tecnicos={tecnicos}
          onClose={() => setRtsModalTarget(null)}
          onSuccess={(rts) => {
            setRtsModalTarget(null);
            showFeedback(`RTS ${rts.numero_rts} emitido com sucesso! OS homologada e encerrada.`);
            carregarDados();
            onRefreshGlobal?.();
          }}
        />
      )}

      {/* 3. Modal de Impressão LTA */}
      {ltaModalTarget && (
        <LtaPrintModal
          os={ltaModalTarget.os}
          rts={ltaModalTarget.rts}
          onClose={() => setLtaModalTarget(null)}
        />
      )}

      {/* 4. Modal de Impressão Dossiê Consolidado */}
      {dossieModalTarget && (
        <DossiePrintModal
          dossie={dossieModalTarget}
          os={ordensServico.find((o) => o.numero_os === dossieModalTarget.numero_os)}
          rts={liberacoesRts.find((r) => r.numero_rts === dossieModalTarget.numero_rts)}
          onClose={() => setDossieModalTarget(null)}
        />
      )}

    </div>
  );
};
