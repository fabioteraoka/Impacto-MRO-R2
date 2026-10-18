import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Wrench,
  Sparkles,
  ClipboardList,
  Printer,
  X,
  FileText,
  AlertOctagon,
  ArrowRight,
  Plane,
} from 'lucide-react';
import { OrdemServicoF001_09_2, AuditoriaQualidadeResult, PessoalTecnico } from '../types/mro';
import { OfficialFormHeader } from './OfficialFormHeader';
import { OfficialFormNotices } from './OfficialFormNotices';

interface AuditOsModalProps {
  os: OrdemServicoF001_09_2;
  tecnicos: PessoalTecnico[];
  onClose: () => void;
  onProceedToRts: (os: OrdemServicoF001_09_2) => void;
}

export const AuditOsModal: React.FC<AuditOsModalProps> = ({
  os,
  tecnicos,
  onClose,
  onProceedToRts,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [auditoria, setAuditoria] = useState<AuditoriaQualidadeResult | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarAuditoria();
  }, [os.id_os]);

  const carregarAuditoria = async () => {
    try {
      setLoading(true);
      setErro(null);
      const res = await fetch(`/api/qualidade/auditoria-os/${os.id_os}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao executar auditoria regulatória da OS');
      }
      setAuditoria(data.data);
    } catch (err: any) {
      setErro(err.message || 'Erro ao auditar Ordem de Serviço');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:bg-white print:m-0 print:p-0 print:max-w-none">
        
        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Auditoria de Fechamento da OS - Garantia da Qualidade (GQ)
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  MOMQ 5.7 / RBAC 145.109
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ordem de Serviço: <strong className="text-white font-mono">{os.numero_os}</strong> • Aeronave:{' '}
                <strong className="text-white font-mono">{os.campo_02_matricula} ({os.campo_03_modelo})</strong> • Base:{' '}
                <strong className="text-white font-mono">{os.campo_06_base_executante}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Imprimir Laudo de Auditoria da Qualidade"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Imprimir Laudo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-2 bg-slate-900/50 print:bg-white text-slate-100 print:text-black">
          
          {/* Header Oficial para Impressão */}
          <div className="hidden print:block">
            <OfficialFormHeader
              codigoFormulario="F 001-09-2"
              numeroRevisao="R08"
              dataRevisao="15/01/2026"
              tituloDocumento="LAUDO OFICIAL DE AUDITORIA DE FECHAMENTO PELA QUALIDADE (GQ)"
              subtituloDocumento="QUALITY ASSURANCE WORK ORDER CLOSING COMPLIANCE AUDIT"
              instrucaoMOMQ="PROCEDIMENTO MOMQ 5.7 • AUDITORIA PRÉVIA AO RETORNO AO SERVIÇO (RTS)"
              numeroDocumento={`AUD-${os.numero_os}`}
              baseOperacional={os.campo_06_base_executante}
              paginaInfo="PÁG. 1 DE 1"
            />
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm text-cyan-300 font-mono">Executando motor de auditoria regulatória em tempo real...</p>
              <p className="text-xs text-slate-400 mt-1">Conferindo tarefas, RIs F 001-12, IIO P 001-07, FCDA F 001-03-2, PME F 001-06-1 e FOD</p>
            </div>
          ) : erro ? (
            <div className="p-4 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-sm">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <AlertOctagon className="w-5 h-5 text-red-400" />
                <span>Falha na Auditoria</span>
              </div>
              <p>{erro}</p>
            </div>
          ) : auditoria ? (
            <div className="space-y-6">
              
              {/* Status Geral da Auditoria */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  auditoria.aprovado_para_fechamento
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/50 text-red-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {auditoria.aprovado_para_fechamento ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-base font-bold uppercase font-mono tracking-wide">
                      {auditoria.aprovado_para_fechamento
                        ? 'HOMOLOGAÇÃO DA QUALIDADE CONCLUÍDA - APROVADA PARA RTS'
                        : 'BLOQUEIO REGULATÓRIO DE QUALIDADE - FECHAMENTO NÃO AUTORIZADO'}
                    </h3>
                    <p className="text-xs opacity-90 mt-0.5">
                      {auditoria.aprovado_para_fechamento
                        ? '100% dos requisitos mandatórios foram auditados e conferidos. A OS está apta para emissão da Aprovação para Retorno ao Serviço (RTS).'
                        : 'Foram detectadas não-conformidades ou pendências impeditivas. O fechamento e RTS estão bloqueados conforme MOMQ 5.7.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-75 block">Auditor da GQ</span>
                    <span className="text-xs font-bold font-mono">{auditoria.auditor_responsavel}</span>
                    <span className="text-[10px] text-cyan-300 block">CANAC: {auditoria.canac_auditor}</span>
                  </div>
                </div>
              </div>

              {/* Lista de Motivos de Bloqueio se houver */}
              {auditoria.motivos_bloqueio.length > 0 && (
                <div className="p-4 rounded-xl bg-red-950/60 border-2 border-red-600 text-red-100">
                  <div className="flex items-center space-x-2 font-black text-sm uppercase font-mono tracking-wide text-red-400 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>Pendências Impeditivas Encontradas ({auditoria.motivos_bloqueio.length})</span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {auditoria.motivos_bloqueio.map((m, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-red-300/80 mt-3 pt-2 border-t border-red-800/80">
                    * Regulamentação RBAC 145.109 / MOMQ 5.7: A emissão de RTS é terminantemente proibida com itens impeditivos pendentes.
                  </p>
                </div>
              )}

              {/* Grid dos 6 Pilares de Auditoria */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4 text-cyan-400" />
                  <span>Resultado dos 6 Pilares de Verificação Regulatória (MOMQ 5.7):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* 1. Tarefas da OS */}
                  <div className={`p-3.5 rounded-lg border ${auditoria.itens_auditados.tarefas_100_concluidas ? 'bg-slate-950/60 border-emerald-500/40' : 'bg-red-950/30 border-red-500/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {auditoria.itens_auditados.tarefas_100_concluidas ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs font-bold uppercase font-mono text-white">
                          1. Cumprimento 100% das Tarefas (F 001-09-2)
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${auditoria.itens_auditados.tarefas_100_concluidas ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {auditoria.itens_auditados.tarefas_100_concluidas ? 'CONFORME' : 'NÃO CONFORME'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2">
                      Verificação de encerramento de todas as tarefas abertas com citação obrigatória dos manuais do fabricante (AMM / SRM / WDM).
                    </p>
                  </div>

                  {/* 2. RIs F 001-12 */}
                  <div className={`p-3.5 rounded-lg border ${auditoria.itens_auditados.ris_100_resolvidos ? 'bg-slate-950/60 border-emerald-500/40' : 'bg-red-950/30 border-red-500/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {auditoria.itens_auditados.ris_100_resolvidos ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs font-bold uppercase font-mono text-white">
                          2. Resolução de RIs (Form F 001-12)
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${auditoria.itens_auditados.ris_100_resolvidos ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {auditoria.itens_auditados.ris_100_resolvidos ? 'CONFORME' : 'NÃO CONFORME'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2">
                      Todos os Relatórios de Inspeção de Não Conformidade solucionados, executados e com aprovação compulsória do Inspetor APRS.
                    </p>
                  </div>

                  {/* 3. Itens IIO */}
                  <div className={`p-3.5 rounded-lg border ${auditoria.itens_auditados.iio_dupla_assinatura_concluida ? 'bg-slate-950/60 border-emerald-500/40' : 'bg-red-950/30 border-red-500/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {auditoria.itens_auditados.iio_dupla_assinatura_concluida ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs font-bold uppercase font-mono text-white">
                          3. Dupla Inspeção IIO (P 001-07 / MOMQ 5.4)
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${auditoria.itens_auditados.iio_dupla_assinatura_concluida ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {auditoria.itens_auditados.iio_dupla_assinatura_concluida ? 'CONFORME' : 'NÃO CONFORME'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2">
                      Dupla validação independente obrigatória em itens críticos (comandos de voo, motores, trens de pouso). Bloqueio estrito de auto-inspeção.
                    </p>
                  </div>

                  {/* 4. Diretrizes & FCDA */}
                  <div className={`p-3.5 rounded-lg border ${auditoria.itens_auditados.fcda_diretrizes_cumpridas ? 'bg-slate-950/60 border-emerald-500/40' : 'bg-red-950/30 border-red-500/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {auditoria.itens_auditados.fcda_diretrizes_cumpridas ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs font-bold uppercase font-mono text-white">
                          4. Diretrizes Mandatórias & FCDA (F 001-03-2)
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${auditoria.itens_auditados.fcda_diretrizes_cumpridas ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {auditoria.itens_auditados.fcda_diretrizes_cumpridas ? 'CONFORME' : 'NÃO CONFORME'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2">
                      Conferência de cumprimento de DAs/ADs/SBs e formalização da Ficha de Cumprimento de Diretrizes de Aeronavegabilidade.
                    </p>
                  </div>

                  {/* 5. Ferramental PME */}
                  <div className={`p-3.5 rounded-lg border ${auditoria.itens_auditados.ferramental_100_devolvido ? 'bg-slate-950/60 border-emerald-500/40' : 'bg-red-950/30 border-red-500/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {auditoria.itens_auditados.ferramental_100_devolvido ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs font-bold uppercase font-mono text-white">
                          5. Devolução de Ferramental PME (F 001-06-1)
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${auditoria.itens_auditados.ferramental_100_devolvido ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {auditoria.itens_auditados.ferramental_100_devolvido ? 'CONFORME' : 'NÃO CONFORME'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2">
                      100% das ferramentas de precisão (torquímetros, manômetros, micrômetros) devolvidas com check-in físico e inspeção pós-uso.
                    </p>
                  </div>

                  {/* 6. FOD & Limpeza */}
                  <div className={`p-3.5 rounded-lg border ${auditoria.itens_auditados.checklist_fod_concluido ? 'bg-slate-950/60 border-emerald-500/40' : 'bg-red-950/30 border-red-500/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {auditoria.itens_auditados.checklist_fod_concluido ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs font-bold uppercase font-mono text-white">
                          6. Prevenção FOD & Limpeza de Áreas
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${auditoria.itens_auditados.checklist_fod_concluido ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {auditoria.itens_auditados.checklist_fod_concluido ? 'CONFORME' : 'NÃO CONFORME'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2">
                      Atesto compulsório de ausência de ferramentas a bordo e conformidade com o aviso mandatório de desobstrução e limpeza total.
                    </p>
                  </div>

                </div>
              </div>

              {/* Detalhamento dos Itens Auditados */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide font-mono mb-2">
                  Registro da Auditoria da Garantia da Qualidade (MOMQ 5.7 / RBAC 145.109):
                </h4>
                <div className="space-y-2 text-xs">
                  {auditoria.itens_detalhados.map((it, idx) => (
                    <div key={idx} className="flex items-start justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                      <div>
                        <span className="font-bold text-cyan-300 font-mono block">{it.descricao}</span>
                        <span className="text-slate-400 text-[11px]">{it.detalhes}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ml-2 ${it.status === 'CONFORME' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {it.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Termos e Assinaturas */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Auditor da Garantia da Qualidade</span>
                    <span className="font-bold text-white block">{auditoria.auditor_responsavel}</span>
                    <span className="text-[11px] text-cyan-300 font-mono block">CANAC: {auditoria.canac_auditor} • Auditoria GQ</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Data/Hora: {new Date(auditoria.data_auditoria).toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Diretor Técnico / RT (MOMQ Parte 1)</span>
                    <span className="font-bold text-white block">{os.rt_nome}</span>
                    <span className="text-[11px] text-cyan-300 font-mono block">CANAC: {os.rt_canac} • Responsável Técnico</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Supervisão Técnica RBAC 145 / EASA Part-145</span>
                  </div>
                </div>
              </div>

              {/* Aviso Mandatório MOMQ */}
              <OfficialFormNotices modulo="ORDEM_SERVICO" />

            </div>
          ) : null}

        </div>

        {/* Action Footer - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Fechar Auditoria
          </button>

          <div className="flex items-center space-x-3">
            {auditoria?.aprovado_para_fechamento ? (
              <button
                onClick={() => onProceedToRts(os)}
                className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95"
              >
                <span>Prosseguir para Emissão do RTS (Dual Release)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-right">
                <span className="text-[11px] font-bold text-red-400 block font-mono">
                  BLOQUEIO ATIVO: Resolva as pendências acima para liberar o RTS
                </span>
                <span className="text-[10px] text-slate-400">
                  Exigência regulatória RBAC 145.109 / MOMQ 5.7
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
