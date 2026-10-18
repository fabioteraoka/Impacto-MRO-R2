import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Award,
  FileText,
  PlusCircle,
  GraduationCap,
  Eye,
  Check,
  AlertCircle,
  Building,
  UserCheck,
  UserX,
  FileSignature,
} from 'lucide-react';
import { TecnicoComQualificacao, BaseOperacional } from '../types/mro';

interface TechnicianListProps {
  tecnicos: TecnicoComQualificacao[];
  bases: BaseOperacional[];
  onSelectTecnicoDossier: (tecnico: TecnicoComQualificacao) => void;
  onOpenNovaDesignacao: (tecnico: TecnicoComQualificacao) => void;
  onOpenNovoTreinamento: (tecnico: TecnicoComQualificacao) => void;
  onEditTecnico: (tecnico: TecnicoComQualificacao) => void;
  onToggleAtivo: (id: number) => void;
  onAssinarRT: (id_designacao: number) => void;
  filtroStatus: string;
  setFiltroStatus: (st: string) => void;
}

export const TechnicianList: React.FC<TechnicianListProps> = ({
  tecnicos,
  bases,
  onSelectTecnicoDossier,
  onOpenNovaDesignacao,
  onOpenNovoTreinamento,
  onEditTecnico,
  onToggleAtivo,
  onAssinarRT,
  filtroStatus,
  setFiltroStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBase, setSelectedBase] = useState<string>('TODAS');
  const [selectedCargo, setSelectedCargo] = useState<string>('TODOS');

  // Filtragem local combinada
  const filteredTecnicos = tecnicos.filter((t) => {
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.nome_completo.toLowerCase().includes(q) ||
        t.canac.toLowerCase().includes(q) ||
        t.cpf.includes(q) ||
        t.cargo.toLowerCase().includes(q) ||
        t.licenca_cct.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Base
    if (selectedBase !== 'TODAS' && String(t.id_base_alocada) !== selectedBase) {
      return false;
    }

    // Cargo
    if (selectedCargo !== 'TODOS' && t.cargo !== selectedCargo) {
      return false;
    }

    // Status Qualificação
    if (filtroStatus !== 'TODOS') {
      if (t.qualificacao.status !== filtroStatus) return false;
    }

    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, CANAC, CPF ou função..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
            >
              <option value="TODAS" className="bg-slate-900 text-white">Todas as Bases</option>
              {bases.map((b) => (
                <option key={b.id_base} value={String(b.id_base)} className="bg-slate-900 text-white">
                  {b.nome_base.split('-')[0].trim()} ({b.codigo_anac})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todos os Cargos</option>
              <option value="RT" className="bg-slate-900 text-white">RT (Responsável Técnico)</option>
              <option value="Inspetor Chefe" className="bg-slate-900 text-white">Inspetor Chefe</option>
              <option value="Inspetor" className="bg-slate-900 text-white">Inspetor</option>
              <option value="MMA" className="bg-slate-900 text-white">MMA (Mecânico)</option>
              <option value="Gerente Qualidade" className="bg-slate-900 text-white">Gerente Qualidade</option>
              <option value="PCP" className="bg-slate-900 text-white">PCP</option>
              <option value="GR" className="bg-slate-900 text-white">GR (Gerente Resp.)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setFiltroStatus('TODOS')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                filtroStatus === 'TODOS'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({tecnicos.length})
            </button>
            <button
              onClick={() => setFiltroStatus('APTO')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
                filtroStatus === 'APTO'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Aptos</span>
            </button>
            <button
              onClick={() => setFiltroStatus('BLOQUEADO')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
                filtroStatus === 'BLOQUEADO'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Bloqueados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <th className="py-3 px-3">Técnico / Registro</th>
              <th className="py-3 px-3">Cargo / Base</th>
              <th className="py-3 px-3">Licenças CCT</th>
              <th className="py-3 px-3">Designação F 001-03</th>
              <th className="py-3 px-3">Treinamentos MNT-002</th>
              <th className="py-3 px-3">Toxicológico (PPSP)</th>
              <th className="py-3 px-3 text-center">Auditoria Qualificação</th>
              <th className="py-3 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredTecnicos.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  Nenhum técnico encontrado com os critérios selecionados.
                </td>
              </tr>
            ) : (
              filteredTecnicos.map((t) => {
                const q = t.qualificacao;
                const desigAtiva = t.designacoes.find((d) => d.status === 'ATIVO');
                const hasPendingRT = desigAtiva && !desigAtiva.assinado_por_rt;

                return (
                  <tr
                    key={t.id_tecnico}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Técnico & Registro */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
                        <span className={t.ativo ? 'text-white' : 'text-slate-500 line-through'}>
                          {t.nome_completo}
                        </span>
                        {!t.ativo && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                            INATIVO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="text-cyan-400 font-semibold">
                          CANAC: {t.canac}
                        </span>
                        <span>•</span>
                        <span>CPF: {t.cpf}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Adm: {t.data_admissao}
                      </div>
                    </td>

                    {/* Cargo / Base */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                        {t.cargo}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[140px]" title={t.base_nome}>
                          {t.base_nome?.split('-')[0].trim()}
                        </span>
                      </div>
                    </td>

                    {/* Licenças CCT (Regra N/A) */}
                    <td className="py-3 px-3 font-mono">
                      {t.licenca_cct === 'N/A' ? (
                        <span className="text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                          N/A
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {t.licenca_cct.split('/').map((lic, i) => (
                            <span
                              key={i}
                              className="bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            >
                              {lic.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Designação F 001-03 */}
                    <td className="py-3 px-3">
                      {desigAtiva ? (
                        <div>
                          <div className="flex items-center space-x-1 font-mono text-[11px]">
                            <span className="text-slate-200 font-semibold">
                              {desigAtiva.numero_f001_03}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Val: {desigAtiva.data_validade}
                          </div>
                          <div className="mt-1 flex items-center space-x-1">
                            {desigAtiva.assinado_por_rt ? (
                              <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                                <Check className="w-2.5 h-2.5 mr-0.5" /> Assinado RT
                              </span>
                            ) : (
                              <button
                                onClick={() => onAssinarRT(desigAtiva.id_designacao)}
                                className="inline-flex items-center text-[10px] text-amber-300 bg-amber-950/70 border border-amber-700/80 px-1.5 py-0.5 rounded hover:bg-amber-900 transition font-medium"
                                title="Clique para assinar como RT e liberar o técnico"
                              >
                                <FileSignature className="w-3 h-3 mr-1 text-amber-400" />
                                Assinar RT (Pendente)
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-rose-400 font-mono bg-rose-950/60 border border-rose-900/60 px-2 py-0.5 rounded">
                          N/A (Sem F 001-03)
                        </span>
                      )}
                    </td>

                    {/* Treinamentos MNT-002 */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1 text-[11px]">
                        <span className="font-semibold text-slate-200">
                          {t.treinamentos.length} curso(s)
                        </span>
                      </div>
                      {q.treinamentos_vencidos.length > 0 && (
                        <div className="text-[10px] text-rose-400 font-medium mt-0.5">
                          ⚠️ {q.treinamentos_vencidos.length} vencido(s)
                        </div>
                      )}
                      {q.treinamentos_a_vencer_30d.length > 0 && (
                        <div className="text-[10px] text-amber-400 mt-0.5">
                          ⏳ {q.treinamentos_a_vencer_30d.length} a vencer em 30d
                        </div>
                      )}
                      {q.treinamentos_vencidos.length === 0 && q.treinamentos_faltantes.length === 0 && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          ✓ Reciclagens em dia
                        </div>
                      )}
                    </td>

                    {/* Exame Toxicológico (PPSP) */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {t.status_exame_toxicologico === 'EM_DIA' ? (
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px]">
                          EM DIA
                        </span>
                      ) : (
                        <span className="text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-[10px] font-bold">
                          {t.status_exame_toxicologico}
                        </span>
                      )}
                    </td>

                    {/* Auditoria Qualificação (Regra 6) */}
                    <td className="py-3 px-3 text-center">
                      {q.is_apto ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            APTO
                          </span>
                          {q.aprovado_aprs && (
                            <span className="text-[10px] text-cyan-300 font-mono mt-1 flex items-center">
                              <Award className="w-3 h-3 mr-0.5 text-cyan-400" />
                              APRS
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className="inline-flex flex-col items-center cursor-pointer group/tip relative"
                          onClick={() => onSelectTecnicoDossier(t)}
                        >
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/10">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            BLOQUEADO
                          </span>
                          <span className="text-[10px] text-rose-300/90 font-mono mt-0.5 underline">
                            {q.motivos_bloqueio.length} motivo(s)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onSelectTecnicoDossier(t)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                          title="Abrir Dossiê Completo e Auditoria"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenNovaDesignacao(t)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition"
                          title="Emitir / Atualizar F 001-03"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenNovoTreinamento(t)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition"
                          title="Registrar Treinamento MNT-002"
                        >
                          <GraduationCap className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleAtivo(t.id_tecnico)}
                          className={`p-1.5 rounded transition ${
                            t.ativo
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                              : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                          }`}
                          title={t.ativo ? 'Desativar técnico' : 'Reativar técnico'}
                        >
                          {t.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
      {/* Table Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between">
        <div>
          Exibindo <span className="font-semibold text-white">{filteredTecnicos.length}</span> de{' '}
          <span className="font-semibold text-white">{tecnicos.length}</span> técnicos cadastrados
        </div>
        <div className="flex items-center space-x-3 font-mono">
          <span className="flex items-center text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
            Apto: Liberado para Execução / RTS
          </span>
          <span className="flex items-center text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400 mr-1.5" />
            Bloqueado: Trava Regra 6 Ativa
          </span>
        </div>
      </div>
    </div>
  );
};
