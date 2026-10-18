import React from 'react';
import { ShieldCheck, Plane, AlertTriangle, FileCheck2, Cpu, Wrench, ShieldAlert, BookOpen, FileSpreadsheet, FileText, Award } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTecnico: () => void;
  onOpenAuditSim: () => void;
  quarantineCount?: number;
  expiredToolsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTecnico,
  onOpenAuditSim,
  quarantineCount = 0,
  expiredToolsCount = 0,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top Regulatory Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-cyan-400 font-mono font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
              SISTEMA DE GESTÃO MRO
            </span>
            <span className="text-slate-500">|</span>
            <span className="bg-blue-950/80 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded text-[11px] font-medium font-mono">
              ANAC COM: 200607-05
            </span>
            <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded text-[11px] font-medium font-mono">
              EASA.145.1003
            </span>
            <span className="hidden md:inline-block text-slate-400 font-mono text-[11px]">
              MOMQ MNT-001 (Rev 08) • RBAC 145 / RBAC 65 / RBAC 43 / EASA Part-145
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            {expiredToolsCount > 0 && (
              <span className="bg-rose-950/80 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded font-mono flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-400" />
                {expiredToolsCount} FERRAMENTA(S) VENCIDA(S)
              </span>
            )}
            <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded font-mono flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              ZERO RISK AUDIT ATIVO
            </span>
            <span className="text-slate-400 font-mono hidden sm:inline">
              REGRA N/A: OBRIGATÓRIA
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
            <Plane className="w-6 h-6 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                IMPACTO AVIATION
              </h1>
              <span className="text-xs uppercase bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-700/60">
                PARTE 1 A 5: MRO SUITE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              GQ & RTS (MOMQ 5.7) • Execução Hangar (MOMQ 5.4 / IIO / RI) • PCP (F 001-09-2) • CTM • Ferramentaria
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('qualidade')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              activeTab === 'qualidade' || activeTab === 'rts' || activeTab === 'arquivo-tecnico' || activeTab === 'diretoria'
                ? 'bg-emerald-400 text-slate-950 border border-emerald-300'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
            }`}
            title="Garantia da Qualidade, Auditoria de OS, Retorno ao Serviço (RTS) e Arquivo Técnico (Parte 6)"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Qualidade & RTS (Parte 6)</span>
          </button>

          <button
            onClick={() => setActiveTab('hangar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              activeTab === 'hangar' || activeTab === 'execucao-linha'
                ? 'bg-amber-400 text-slate-950 border border-amber-300'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
            }`}
            title="Central do Hangar: Apontamento de Tarefas, Peças (Campo 14), RIs e Dupla Inspeção IIO"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Hangar & Execução (Parte 5)</span>
          </button>

          <button
            onClick={() => setActiveTab('pcp')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              activeTab === 'pcp' || activeTab === 'ordens-servico'
                ? 'bg-cyan-500 text-slate-950 border border-cyan-400'
                : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30'
            }`}
            title="Painel de Controle da Produção (PCP) e Abertura de Ordens de Serviço"
          >
            <Plane className="w-4 h-4 text-cyan-400" />
            <span>PCP & OS (F 001-09-2)</span>
          </button>

          <button
            onClick={() => setActiveTab('formularios-oficiais')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              activeTab === 'formularios-oficiais'
                ? 'bg-amber-500 text-slate-950 border border-amber-400'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
            }`}
            title="Diretório de Formulários Oficiais Impacto Aviation (A4 / Zero Divergência)"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Formulários Oficiais</span>
          </button>

          <button
            onClick={onOpenAuditSim}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition shadow-sm"
            title="Simular se técnico pode assinar OS ou tarefa IIO (Regras 3 e 6)"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Simulador de Assinatura OS</span>
          </button>

          <button
            onClick={onOpenNewTecnico}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/25 transition active:scale-95"
          >
            <span>+ Cadastrar Técnico</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/80">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none text-xs">
          {/* PARTE 6: QUALIDADE, RTS & ARQUIVO TÉCNICO */}
          <button
            onClick={() => setActiveTab('qualidade')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'qualidade' || activeTab === 'rts' || activeTab === 'arquivo-tecnico' || activeTab === 'diretoria'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-emerald-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Qualidade & RTS (Parte 6 - Final)</span>
          </button>

          {/* PARTE 5: HANGAR & EXECUÇÃO */}
          <button
            onClick={() => setActiveTab('hangar')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'hangar' || activeTab === 'execucao-linha'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-amber-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Hangar & Execução (Parte 5)</span>
          </button>

          {/* PARTE 4: PCP & ORDENS DE SERVIÇO */}
          <button
            onClick={() => setActiveTab('pcp')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'pcp' || activeTab === 'ordens-servico' || activeTab === 'workflow-comercial'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-cyan-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-cyan-400" />
            <span>PCP & Ordens de Serviço (F 001-09-2)</span>
          </button>

          {/* PARTE 3: CTM & PUBLICAÇÕES */}
          <button
            onClick={() => setActiveTab('ctm')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'ctm'
                ? 'bg-blue-600/25 text-blue-300 border border-blue-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>CTM & Publicações (F 001-02-1)</span>
          </button>

          {/* PARTE 3: FCDA - DIRETRIZES */}
          <button
            onClick={() => setActiveTab('fcda')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'fcda'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Diretrizes & FCDA (F 001-03-2)</span>
          </button>

          {/* PARTE 3: RELATÓRIO MENSAL */}
          <button
            onClick={() => setActiveTab('relatorio-mandatorias')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'relatorio-mandatorias'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Relatório Mandatórias (F 001-03-3)</span>
          </button>

          {/* PARTE 2: FERRAMENTARIA */}
          <button
            onClick={() => setActiveTab('ferramentaria')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'ferramentaria'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Ferramentaria & Calibração (F 001-06)</span>
          </button>

          {/* PARTE 2: QUARENTENA */}
          <button
            onClick={() => setActiveTab('quarentena')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'quarentena'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Quarentena (F 001-06-04 / Tag Vermelha)</span>
            {quarantineCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-900 border border-red-700 text-red-200 text-[10px] font-mono">
                {quarantineCount}
              </span>
            )}
          </button>

          {/* PARTE 1: PESSOAL TÉCNICO */}
          <button
            onClick={() => setActiveTab('tecnicos')}
            className={`px-3 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'tecnicos'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/70 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>Pessoal Técnico (tb_pessoal_tecnico)</span>
          </button>

          <button
            onClick={() => setActiveTab('designacoes')}
            className={`px-3 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'designacoes'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/70 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>Designação de Funções (F 001-03)</span>
          </button>

          <button
            onClick={() => setActiveTab('treinamentos')}
            className={`px-3 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'treinamentos'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/70 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>Matriz de Treinamentos (MNT-002)</span>
          </button>

          <button
            onClick={() => setActiveTab('relatorio-f001-07')}
            className={`px-3 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'relatorio-f001-07'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/70 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Relatório ANAC (F 001-07)</span>
          </button>

          <button
            onClick={() => setActiveTab('regras-auditoria')}
            className={`px-3 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'regras-auditoria'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/70 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Regras Invioláveis MOMQ</span>
          </button>

          {/* Central de Formulários Oficiais Impacto Aviation */}
          <button
            onClick={() => setActiveTab('formularios-oficiais')}
            className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'formularios-oficiais'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-amber-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Diretório de Formulários (Zero Divergência)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

