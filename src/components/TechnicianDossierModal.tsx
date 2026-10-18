import React from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle,
  AlertTriangle,
  FileText,
  GraduationCap,
  Calendar,
  Building,
  User,
  FileSignature,
  Clock,
} from 'lucide-react';
import { TecnicoComQualificacao } from '../types/mro';

interface TechnicianDossierModalProps {
  tecnico: TecnicoComQualificacao | null;
  isOpen: boolean;
  onClose: () => void;
  onAssinarRT: (id_designacao: number) => void;
  onOpenNovaDesignacao: (tecnico: TecnicoComQualificacao) => void;
  onOpenNovoTreinamento: (tecnico: TecnicoComQualificacao) => void;
}

export const TechnicianDossierModal: React.FC<TechnicianDossierModalProps> = ({
  tecnico,
  isOpen,
  onClose,
  onAssinarRT,
  onOpenNovaDesignacao,
  onOpenNovoTreinamento,
}) => {
  if (!isOpen || !tecnico) return null;

  const q = tecnico.qualificacao;
  const desigAtiva = tecnico.designacoes.find((d) => d.status === 'ATIVO');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  {tecnico.nome_completo}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  {tecnico.cargo}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-0.5">
                <span>CANAC: <strong className="text-cyan-400">{tecnico.canac}</strong></span>
                <span>•</span>
                <span>CPF: {tecnico.cpf}</span>
                <span>•</span>
                <span>Base: {tecnico.base_nome?.split('-')[0].trim()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Regulatory Qualification Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              q.is_apto
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800/70 text-rose-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              {q.is_apto ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
                    STATUS REGULATÓRIO: {q.status}
                  </h3>
                  {q.aprovado_aprs && (
                    <span className="text-[10px] bg-cyan-900 text-cyan-200 px-2 py-0.5 rounded font-mono font-bold border border-cyan-700 flex items-center">
                      <Award className="w-3 h-3 mr-1 text-cyan-400" /> APRS HABILITADO
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-1 opacity-90 leading-relaxed">
                  {q.is_apto
                    ? 'Técnico plenamente qualificado conforme MOMQ MNT-001 (Rev 08), RBAC 145 e EASA Part-145. Liberado para assinatura de Ordens de Serviço.'
                    : 'BLOQUEIO POR QUALIFICAÇÃO ATIVO (Regra 6 / MOMQ). O técnico não possui autorização para assinar ou executar ordens de serviço no sistema.'}
                </p>
              </div>
            </div>

            {/* If blocked by RT signature, provide instant action */}
            {desigAtiva && !desigAtiva.assinado_por_rt && (
              <button
                onClick={() => onAssinarRT(desigAtiva.id_designacao)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md transition flex items-center space-x-1.5 whitespace-nowrap"
              >
                <FileSignature className="w-4 h-4 text-slate-950" />
                <span>Assinar F 001-03 como RT</span>
              </button>
            )}
          </div>

          {/* Audit Violations Details if blocked */}
          {!q.is_apto && q.motivos_bloqueio.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-900/60 rounded-xl p-4">
              <h4 className="font-bold text-rose-400 uppercase text-[11px] font-mono tracking-wider flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-400" />
                MOTIVOS DO BLOQUEIO OPERACIONAL (AUDITORIA ANAC / RBAC 145):
              </h4>
              <ul className="space-y-1.5">
                {q.motivos_bloqueio.map((motivo, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-rose-300 text-[11px]">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{motivo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dados Gerais do Técnico */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Data de Admissão</span>
              <span className="text-xs font-semibold text-white font-mono">{tecnico.data_admissao}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Licenças CCT (RBAC 65)</span>
              <span className="text-xs font-semibold text-cyan-300 font-mono">{tecnico.licenca_cct}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Exame Toxicológico (PPSP)</span>
              <span className={`text-xs font-semibold font-mono ${tecnico.status_exame_toxicologico === 'EM_DIA' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tecnico.status_exame_toxicologico}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Status do Cadastro</span>
              <span className={`text-xs font-semibold font-mono ${tecnico.ativo ? 'text-emerald-400' : 'text-slate-400'}`}>
                {tecnico.ativo ? 'ATIVO' : 'INATIVO'}
              </span>
            </div>
          </div>

          {/* Seção F 001-03: Designação de Funções */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-white text-xs">
                  Designação de Funções (Formulário F 001-03)
                </h4>
              </div>
              <button
                onClick={() => onOpenNovaDesignacao(tecnico)}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition"
              >
                + Nova Designação F 001-03
              </button>
            </div>

            <div className="p-4">
              {tecnico.designacoes.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-mono text-xs">
                  Nenhum formulário F 001-03 cadastrado. Obrigatório emitir para autorizar trabalho.
                </div>
              ) : (
                <div className="space-y-3">
                  {tecnico.designacoes.map((d) => (
                    <div
                      key={d.id_designacao}
                      className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-cyan-400">
                            {d.numero_f001_03}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                              d.status === 'ATIVO'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {d.status}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] mt-1">
                          <strong>Escopo Autorizado:</strong> {d.funcoes_autorizadas}
                        </div>
                        <div className="text-slate-500 text-[10px] font-mono mt-1">
                          Emissão: {d.data_emissao} | Validade: {d.data_validade}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {d.assinado_por_rt ? (
                          <div className="flex items-center text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded text-[11px] font-mono">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Assinado pelo RT
                          </div>
                        ) : (
                          <button
                            onClick={() => onAssinarRT(d.id_designacao)}
                            className="flex items-center text-amber-300 bg-amber-950/80 border border-amber-600 px-2.5 py-1 rounded text-[11px] font-medium hover:bg-amber-900 transition"
                          >
                            <FileSignature className="w-3.5 h-3.5 mr-1" />
                            Assinar como RT
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Seção MNT-002: Treinamentos e Reciclagens */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-xs">
                  Prontuário de Treinamentos Regulamentares (MNT-002)
                </h4>
              </div>
              <button
                onClick={() => onOpenNovoTreinamento(tecnico)}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 transition"
              >
                + Registrar Treinamento
              </button>
            </div>

            <div className="p-4">
              {tecnico.treinamentos.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-mono text-xs">
                  Nenhum treinamento registrado neste prontuário.
                </div>
              ) : (
                <div className="space-y-2">
                  {tecnico.treinamentos.map((tr) => {
                    const isVencido = q.treinamentos_vencidos.some((v) => v.nome_curso === tr.nome_curso);
                    const isAVencer = q.treinamentos_a_vencer_30d.some((a) => a.nome_curso === tr.nome_curso);

                    return (
                      <div
                        key={tr.id_treinamento}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          isVencido
                            ? 'bg-rose-950/30 border-rose-800/80'
                            : isAVencer
                            ? 'bg-amber-950/30 border-amber-800/80'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center space-x-2">
                            <span>{tr.nome_curso}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({tr.carga_horaria}h)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Conclusão: {tr.data_conclusao} | Reciclagem Obrigatória: <strong>{tr.data_reciclagem}</strong>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Certificado: {tr.certificado_url}
                          </div>
                        </div>

                        <div>
                          {isVencido ? (
                            <span className="text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                              VENCIDO
                            </span>
                          ) : isAVencer ? (
                            <span className="text-amber-300 bg-amber-950/80 border border-amber-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                              A VENCER &lt;30d
                            </span>
                          ) : (
                            <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
                              EM DIA
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 font-mono">
            Auditoria MOMQ Impacto Aviation • COM 200607-05
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Fechar Dossiê
          </button>
        </div>
      </div>
    </div>
  );
};
