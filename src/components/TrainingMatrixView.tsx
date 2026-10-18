import React, { useState } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';
import {
  TecnicoComQualificacao,
  TreinamentoMNT002,
  CURSOS_MANDATORIOS,
} from '../types/mro';

interface TrainingMatrixViewProps {
  tecnicos: TecnicoComQualificacao[];
  treinamentos: TreinamentoMNT002[];
  onOpenNovoTreinamento: (tecnico?: TecnicoComQualificacao) => void;
}

export const TrainingMatrixView: React.FC<TrainingMatrixViewProps> = ({
  tecnicos,
  treinamentos,
  onOpenNovoTreinamento,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAlerta, setFiltroAlerta] = useState<'TODOS' | 'VENCIDOS' | 'A_VENCER'>('TODOS');

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const filteredTecnicos = tecnicos.filter((t) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.nome_completo.toLowerCase().includes(q) ||
        t.canac.toLowerCase().includes(q) ||
        t.cargo.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filtroAlerta === 'VENCIDOS') {
      return t.qualificacao.treinamentos_vencidos.length > 0;
    }
    if (filtroAlerta === 'A_VENCER') {
      return t.qualificacao.treinamentos_a_vencer_30d.length > 0;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded">
              PROGRAMA DE TREINAMENTO MNT-002
            </span>
            <span className="text-slate-400 text-xs font-mono">
              RBAC 145.163 / EASA 145.A.30(e) / Fator Humano
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Matriz de Qualificação & Reciclagem Periódica
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Acompanhamento em tempo real da validade de cursos mandatórios (RBAC 145, EASA, EWIS, FTS, Human Factors). A expiração de qualquer curso gera bloqueio automático de qualificação (Regra 6).
          </p>
        </div>

        <button
          onClick={() => onOpenNovoTreinamento()}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 text-xs transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>+ Lançar Treinamento MNT-002</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar técnico na matriz..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFiltroAlerta('TODOS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filtroAlerta === 'TODOS'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({tecnicos.length})
          </button>
          <button
            onClick={() => setFiltroAlerta('VENCIDOS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1 ${
              filtroAlerta === 'VENCIDOS'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Com Cursos Vencidos</span>
          </button>
          <button
            onClick={() => setFiltroAlerta('A_VENCER')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1 ${
              filtroAlerta === 'A_VENCER'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>A Vencer em 30d</span>
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 min-w-[200px]">Técnico / CANAC</th>
                <th className="py-3 px-3 text-center">RBAC 145</th>
                <th className="py-3 px-3 text-center">Human Factors</th>
                <th className="py-3 px-3 text-center">EWIS</th>
                <th className="py-3 px-3 text-center">FTS Nível 2</th>
                <th className="py-3 px-3 text-center">EASA Part-145</th>
                <th className="py-3 px-3 text-center">Conformidade</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTecnicos.map((t) => {
                const getCourseStatus = (keyword: string) => {
                  const tr = t.treinamentos.find((c) =>
                    c.nome_curso.toLowerCase().includes(keyword.toLowerCase())
                  );
                  if (!tr) {
                    return (
                      <span className="text-slate-500 font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        N/A
                      </span>
                    );
                  }

                  const recDate = new Date(tr.data_reciclagem);
                  const diffMs = recDate.getTime() - hoje.getTime();
                  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                  if (dias < 0) {
                    return (
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center text-[10px] font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-800 px-1.5 py-0.5 rounded">
                          VENCIDO
                        </span>
                        <span className="text-[9px] text-rose-400 font-mono mt-0.5">
                          {tr.data_reciclagem}
                        </span>
                      </div>
                    );
                  }

                  if (dias <= 30) {
                    return (
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-1.5 py-0.5 rounded">
                          {dias}d rest.
                        </span>
                        <span className="text-[9px] text-amber-400 font-mono mt-0.5">
                          {tr.data_reciclagem}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col items-center">
                      <span className="inline-flex items-center text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                        ✓ EM DIA
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {tr.data_reciclagem}
                      </span>
                    </div>
                  );
                };

                const hasExpired = t.qualificacao.treinamentos_vencidos.length > 0;
                const hasPendingMandatory = t.qualificacao.treinamentos_faltantes.length > 0;

                return (
                  <tr key={t.id_tecnico} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{t.nome_completo}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5">
                        <span className="text-cyan-400">CANAC: {t.canac}</span>
                        <span>•</span>
                        <span>{t.cargo}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">{getCourseStatus('RBAC 145')}</td>
                    <td className="py-3 px-3 text-center">{getCourseStatus('Human Factors')}</td>
                    <td className="py-3 px-3 text-center">{getCourseStatus('EWIS')}</td>
                    <td className="py-3 px-3 text-center">{getCourseStatus('Fuel Tank')}</td>
                    <td className="py-3 px-3 text-center">{getCourseStatus('EASA Part-145')}</td>

                    <td className="py-3 px-3 text-center">
                      {hasExpired || hasPendingMandatory ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          NÃO CONFORME
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 bg-emerald-950 border border-emerald-800">
                          CONFORME
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenNovoTreinamento(t)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded text-[11px] font-medium border border-slate-700 transition"
                      >
                        + Lançar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
