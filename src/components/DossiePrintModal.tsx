import React from 'react';
import {
  FileText,
  Printer,
  X,
  ShieldCheck,
  Award,
  Plane,
  CheckCircle2,
  Calendar,
  Lock,
  Building,
  Wrench,
  Download,
} from 'lucide-react';
import { DossieDigitalOS, OrdemServicoF001_09_2, LiberacaoRTS } from '../types/mro';
import { OfficialFormHeader } from './OfficialFormHeader';
import { OfficialFormNotices } from './OfficialFormNotices';

interface DossiePrintModalProps {
  dossie: DossieDigitalOS;
  os?: OrdemServicoF001_09_2;
  rts?: LiberacaoRTS;
  onClose: () => void;
}

export const DossiePrintModal: React.FC<DossiePrintModalProps> = ({
  dossie,
  os,
  rts,
  onClose,
}) => {
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
                  Dossiê Digital Consolidado da Aeronave (Arquivo Técnico)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  MOMQ 6.5 / P 001-01
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Identificador: <strong className="text-white font-mono">{dossie.id_dossie}</strong> • Aeronave:{' '}
                <strong className="text-white font-mono">{dossie.matricula} ({dossie.modelo})</strong> • OS:{' '}
                <strong className="text-white font-mono">{dossie.numero_os}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Imprimir ou Salvar Dossiê Consolidado em PDF"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Imprimir / Salvar PDF</span>
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
        <div className="p-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 bg-white text-black font-sans text-xs">
          
          {/* ============================================================== */}
          {/* PÁGINA 1: CAPA OFICIAL DO DOSSIÊ TÉCNICO REGULATÓRIO */}
          {/* ============================================================== */}
          <div className="p-6 border-2 border-black mb-8 print:border-black print:mb-0 print:min-h-screen flex flex-col justify-between">
            <div>
              <OfficialFormHeader
                codigoFormulario="F 001-09-2"
                numeroRevisao="R08"
                dataRevisao="15/01/2026"
                tituloDocumento="DOSSIÊ DIGITAL CONSOLIDADO DE MANUTENÇÃO AERONÁUTICA"
                subtituloDocumento="CONSOLIDATED AIRCRAFT MAINTENANCE DOSSIER & AIRWORTHINESS RELEASE RECORD"
                instrucaoMOMQ="PROCEDIMENTO MOMQ 6.5 & P 001-01 • ARQUIVO TÉCNICO E CUSTÓDIA LEGAL DE REGISTROS"
                numeroDocumento={dossie.id_dossie}
                baseOperacional={dossie.base}
                paginaInfo="CAPA DO DOSSIÊ"
              />

              {/* Informações Centrais da Aeronave */}
              <div className="border-2 border-black p-4 bg-slate-50 my-6">
                <h3 className="font-mono font-black text-sm uppercase border-b-2 border-black pb-2 mb-3 text-center">
                  DADOS GERAIS DA AERONAVE E CUSTÓDIA REGULATÓRIA
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Matrícula</span>
                    <span className="text-base font-black text-black">{dossie.matricula}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Modelo Homologado</span>
                    <span className="font-bold text-black">{dossie.modelo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Número de Série (MSN)</span>
                    <span className="font-bold text-black">{dossie.msn}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Base Executante</span>
                    <span className="font-bold text-black">{dossie.base}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Operador Cliente</span>
                    <span className="font-bold text-black">{dossie.operador}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Ordem de Serviço</span>
                    <span className="font-bold text-black">{dossie.numero_os}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Nº de Liberação RTS</span>
                    <span className="font-bold text-black text-emerald-800">{dossie.numero_rts}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Modalidade Release</span>
                    <span className="font-bold text-black">{dossie.tipo_release}</span>
                  </div>
                </div>
              </div>

              {/* Índice de Documentos Consolidados no Dossiê */}
              <div className="border-2 border-black p-4 mb-6">
                <h4 className="font-mono font-black text-xs uppercase border-b border-black pb-1 mb-2">
                  ÍNDICE DE COMPONENTES INTEGRANTES DESTE DOSSIÊ DIGITAL (100% AUDITADO):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Ordem de Serviço Principal (Form F 001-09-2) Homologada e Fechada</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Apontamentos Detalhados de Tarefas ({dossie.total_tarefas_apontadas} executadas)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Itens de Inspeção Obrigatória IIO ({dossie.total_tarefas_iio} com dupla assinatura)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Relatórios de Inspeção de Não Conformidades ({dossie.total_ris_f001_12_inclusos} RIs F 001-12 resolvidos)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Fichas de Diretrizes de Aeronavegabilidade ({dossie.total_fcdas_f001_03_2_inclusas} FCDAs cumpridas)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Rastreabilidade de Peças e Certificados Form 1 / 8130-3 ({dossie.materiais_rastreabilidade_inclusos} itens)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Controle de Utilização e Devolução de Ferramental PME (Form F 001-06-1)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Checklist de Prevenção FOD e Limpeza de Área de Trabalho</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Certificado de Aprovação para Retorno ao Serviço (RTS) e Anotação LTA</span>
                  </div>
                </div>
              </div>

              {/* Prazos Legais de Custódia e Arquivamento */}
              <div className="border-2 border-black p-4 bg-amber-50/50">
                <h4 className="font-mono font-black text-xs uppercase border-b border-black pb-1 mb-2 text-amber-950">
                  CONTROLE DE CUSTÓDIA LEGAL E PRAZO DE ARQUIVAMENTO TÉCNICO (MOMQ 6.5):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-600 block uppercase">Guarda Mínima ANAC (RBAC 145.219)</span>
                    <strong className="text-black text-sm block">5 ANOS</strong>
                    <span className="text-[10px] text-slate-700 block">Válido até: {dossie.data_limite_retencao_anac_5anos}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block uppercase">Guarda Mínima EASA (Part-145.A.55)</span>
                    <strong className="text-black text-sm block">3 ANOS</strong>
                    <span className="text-[10px] text-slate-700 block">Válido até: {dossie.data_limite_retencao_easa_3anos}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block uppercase">Status da Custódia</span>
                    <strong className="text-emerald-800 text-sm block font-sans">VIGENTE (AUDITÁVEL)</strong>
                    <span className="text-[10px] text-slate-700 block">{dossie.local_armazenamento_fisico}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-black/40 text-[10px] font-mono text-slate-700">
                  <span>Hash Criptográfico de Integridade (SHA-256): </span>
                  <span className="font-bold select-all text-black">{dossie.hash_integridade_digital}</span>
                </div>
              </div>
            </div>

            {/* Rodapé da Capa com Assinaturas */}
            <div className="mt-8 pt-4 border-t-2 border-black">
              <div className="grid grid-cols-2 gap-8 text-center font-mono">
                <div>
                  <div className="border-b border-black pb-1 font-bold text-black">
                    {rts?.inspetor_aprs_nome || os?.inspetor_aprs_nome || 'Alexandre Pires Guimarães'}
                  </div>
                  <span className="text-[10px] text-slate-700 uppercase block mt-1">
                    Inspetor APRS Homologador • CANAC {rts?.inspetor_aprs_canac || os?.inspetor_aprs_canac || '155601'}
                  </span>
                </div>
                <div>
                  <div className="border-b border-black pb-1 font-bold text-black">
                    {rts?.rt_nome || os?.rt_nome || 'Rodrigo Albuquerque da Silva'}
                  </div>
                  <span className="text-[10px] text-slate-700 uppercase block mt-1">
                    Diretor Técnico / RT (CREA-SP 50628912-D • CANAC {rts?.rt_canac || os?.rt_canac || '114520'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PÁGINA 2: CERTIFICADO DE RTS E ANOTAÇÃO LTA */}
          {/* ============================================================== */}
          <div className="p-6 border-2 border-black my-8 print:border-black print:my-0 print:min-h-screen">
            <OfficialFormHeader
              codigoFormulario="F 001-09-2"
              numeroRevisao="R08"
              dataRevisao="15/01/2026"
              tituloDocumento="CERTIFICADO DE APROVAÇÃO PARA RETORNO AO SERVIÇO (RTS)"
              subtituloDocumento="AIRWORTHINESS RELEASE TO SERVICE CERTIFICATE (DUAL RELEASE)"
              instrucaoMOMQ="PROCEDIMENTO MOMQ 5.7.1 • APROVAÇÃO PARA RETORNO AO SERVIÇO"
              numeroDocumento={dossie.numero_rts}
              baseOperacional={dossie.base}
              paginaInfo="PÁG. 2 DE 3"
            />

            <div className="p-4 border-2 border-black bg-slate-50 my-4 space-y-3 font-mono">
              <div className="border-b border-black pb-2">
                <span className="text-[10px] text-slate-600 uppercase block">Declaração Regulatória ANAC RBAC 43.9:</span>
                <p className="text-xs font-bold text-black mt-1">
                  "Certifica-se que os serviços descritos na {dossie.numero_os} foram executados de acordo com os regulamentos vigentes da ANAC (RBAC 145 / RBAC 43) e os dados técnicos aprovados pelo fabricante. Em respeito aos trabalhos especificados, a aeronave é considerada APROVADA PARA RETORNO AO SERVIÇO (RTS)."
                </p>
              </div>

              {(dossie.tipo_release === 'DUAL_RELEASE_ANAC_EASA' || dossie.tipo_release === 'EASA_PART_145') && (
                <div>
                  <span className="text-[10px] text-slate-600 uppercase block">EASA Part-145 Mandatory Statement (EASA.145.1003):</span>
                  <p className="text-xs font-bold text-black mt-1 italic">
                    "Certifies that the work specified, except as otherwise specified, was carried out in accordance with EASA Part145 and in respect that work the aircraft is considered ready for release to service."
                  </p>
                </div>
              )}
            </div>

            {/* Anotação para LTA */}
            <div className="p-4 border-2 border-black my-4">
              <h4 className="font-mono font-black text-xs uppercase border-b border-black pb-1 mb-2">
                TRANSCRIÇÃO OFICIAL PARA O LIVRO TÉCNICO DA AERONAVE (LTA / ATL):
              </h4>
              <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-black bg-slate-50 p-3 border border-black">
                {rts?.texto_anotacao_lta || 'Anotação técnica formalizada conforme LTA gerado pelo sistema.'}
              </pre>
            </div>

            {/* Distribuição das 3 Vias */}
            <div className="border-2 border-black p-3 bg-slate-50 font-mono text-[11px]">
              <span className="font-black text-black uppercase block mb-1">PROTOCOLO DE DISTRIBUIÇÃO DAS 3 VIAS DA OS:</span>
              <div className="grid grid-cols-3 gap-2">
                <div>• 1ª Via: PCP (Central) - Entregue</div>
                <div>• 2ª Via: Base {dossie.base} - Arquivada</div>
                <div>• 3ª Via: Cliente ({dossie.operador.split(' ')[0]}) - Despachada</div>
              </div>
            </div>

            {/* Aviso Mandatório MOMQ */}
            <div className="mt-6">
              <OfficialFormNotices modulo="ORDEM_SERVICO" />
            </div>
          </div>

        </div>

        {/* Action Footer - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Fechar Visualização
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Dossiê Completo (A4)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
