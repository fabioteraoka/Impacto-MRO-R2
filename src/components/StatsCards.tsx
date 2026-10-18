import React from 'react';
import { Users, CheckCircle2, ShieldAlert, Award, FileSignature, AlertOctagon } from 'lucide-react';
import { DashboardStats } from '../services/apiClient';

interface StatsCardsProps {
  stats: DashboardStats | null;
  onFilterStatus?: (status: string) => void;
  onFilterPendingRT?: () => void;
  onFilterVencidos?: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  onFilterStatus,
  onFilterPendingRT,
  onFilterVencidos,
}) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Total de Pessoal Técnico */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('TODOS')}
        className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Técnico
          </span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-white">
            {stats.total_tecnicos}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">tb_pessoal</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Todas as bases (GRU/CNF/BSB)
        </div>
      </div>

      {/* 2. Técnicos Aptos (Conformes) */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('APTO')}
        className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 hover:border-emerald-600/60 transition cursor-pointer shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
            Aptos p/ OS
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-emerald-300">
            {stats.tecnicos_aptos}
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-900/50 px-1.5 py-0.5 rounded">
            {stats.taxa_conformidade}%
          </span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-400/80">
          100% conformes com F 001-03
        </div>
      </div>

      {/* 3. Bloqueados por Qualificação (Regra 6) */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('BLOQUEADO')}
        className={`rounded-xl p-3.5 transition cursor-pointer shadow-sm relative overflow-hidden border ${
          stats.tecnicos_bloqueados > 0
            ? 'bg-rose-950/30 border-rose-800/70 hover:border-rose-600'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">
            Bloqueados
          </span>
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-rose-300">
            {stats.tecnicos_bloqueados}
          </span>
          <span className="text-[10px] text-rose-400/80 font-mono">REGRA 6</span>
        </div>
        <div className="mt-1 text-[11px] text-rose-300/80 truncate">
          Impedidos de assinar OS
        </div>
      </div>

      {/* 4. Habilitados APRS */}
      <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-3.5 hover:border-blue-600/60 transition shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
            Inspetores APRS
          </span>
          <Award className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-blue-300">
            {stats.habilitados_aprs}
          </span>
          <span className="text-[10px] text-blue-400/80 font-mono">EASA/ANAC</span>
        </div>
        <div className="mt-1 text-[11px] text-blue-300/80">
          Aptos p/ Retorno ao Serviço
        </div>
      </div>

      {/* 5. Pendentes Assinatura RT */}
      <div
        onClick={onFilterPendingRT}
        className={`rounded-xl p-3.5 transition cursor-pointer shadow-sm border ${
          stats.designacoes_pendentes_rt > 0
            ? 'bg-amber-950/30 border-amber-700/60 hover:border-amber-500'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
            Pendentes RT
          </span>
          <FileSignature className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-amber-300">
            {stats.designacoes_pendentes_rt}
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono">F 001-03</span>
        </div>
        <div className="mt-1 text-[11px] text-amber-300/80 truncate">
          Aguardando validação RT
        </div>
      </div>

      {/* 6. Treinamentos Vencidos MNT-002 */}
      <div
        onClick={onFilterVencidos}
        className={`rounded-xl p-3.5 transition cursor-pointer shadow-sm border ${
          stats.cursos_vencidos > 0
            ? 'bg-red-950/30 border-red-700/70 hover:border-red-500'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">
            Cursos Vencidos
          </span>
          <AlertOctagon className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-rose-300">
            {stats.cursos_vencidos}
          </span>
          <span className="text-[10px] text-amber-400 font-mono">
            {stats.cursos_a_vencer_30d > 0 ? `+${stats.cursos_a_vencer_30d} a vencer` : '0 a vencer'}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 truncate">
          MNT-002 Reciclagem
        </div>
      </div>
    </div>
  );
};
