import React from 'react';
import { AlertTriangle, ShieldCheck, Wrench } from 'lucide-react';

/**
 * Nota Obrigatória de Prevenção FOD (Foreign Object Damage)
 * Requisito estrito MOMQ: "AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO"
 */
export const FodPreventionNotice: React.FC = () => {
  return (
    <div className="border-2 border-black bg-amber-50 p-2 text-center my-2 page-break-avoid">
      <div className="flex items-center justify-center space-x-2 text-black font-extrabold uppercase text-[10px] tracking-wide">
        <Wrench className="w-4 h-4 text-black shrink-0" />
        <span className="underline decoration-black">AVISO MANDATÓRIO DE SEGURANÇA E PREVENÇÃO FOD:</span>
      </div>
      <p className="text-[10px] sm:text-[11px] font-black uppercase text-black mt-0.5 tracking-wider font-mono">
        "AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO."
      </p>
    </div>
  );
};

/**
 * Caixa de Alerta Regulatório Compulsório para Preenchimento de N/A
 * Regra Inviolável #1 MOMQ / ANAC
 */
export const NaRuleNotice: React.FC = () => {
  return (
    <div className="border border-black bg-slate-100 p-1.5 text-center my-2 text-[8px] sm:text-[8.5px] font-mono page-break-avoid">
      <span className="font-extrabold text-black">REGRA INVIOLÁVEL #1 (MOMQ / ANAC / EASA):</span>{' '}
      <span className="text-slate-900">
        Aplicação compulsória do valor "N/A" (Não Aplicável) em qualquer campo sem informação ou opcional.
        É estritamente proibido rasuras ou deixar campos em branco nesta documentação técnica.
      </span>
    </div>
  );
};

/**
 * Declaração Formal de Aprovação para Retorno ao Serviço (Release to Service - EASA Part-145 / RBAC 43.9 / RBAC 145)
 */
export const EasaReleaseDeclaration: React.FC<{ dataAprovacao?: string }> = ({ dataAprovacao }) => {
  return (
    <div className="border border-black bg-white p-2 my-2 text-[8px] sm:text-[8.5px] font-sans text-slate-900 leading-tight page-break-avoid">
      <div className="font-bold text-black uppercase font-mono text-[9px] mb-1 flex items-center justify-between border-b border-black pb-0.5">
        <span>DECLARAÇÃO DE RETORNO AO SERVIÇO (EASA PART-145.A.50 / RBAC 43.9 / RBAC 145)</span>
        <span className="text-[8px] font-bold text-black font-mono">COM 200607-05 • EASA.145.1003</span>
      </div>
      <p className="italic text-justify">
        "Certifica-se que o trabalho especificado nesta documentação oficial, salvo indicação em contrário constante deste documento,
        foi executado de acordo com os requisitos estabelecidos no RBAC 145, RBAC 43, MOMQ MNT-001 e com a aprovação
        <strong> EASA Part-145 (Certificado EASA.145.1003)</strong>. Relativamente ao trabalho realizado, a aeronave / motor /
        hélice / componente especificado é considerado aprovado para retorno ao serviço (Authorized Release to Service)."
      </p>
      {dataAprovacao && (
        <div className="text-right text-[8px] font-mono mt-1 font-bold text-black">
          Data de Liberação: {dataAprovacao}
        </div>
      )}
    </div>
  );
};

export interface OfficialFormNoticesProps {
  modulo?: string;
  showEasa?: boolean;
  dataAprovacao?: string;
}

export const OfficialFormNotices: React.FC<OfficialFormNoticesProps> = ({ showEasa, dataAprovacao }) => {
  return (
    <div className="space-y-2 my-2 page-break-avoid">
      <FodPreventionNotice />
      <NaRuleNotice />
      {showEasa && <EasaReleaseDeclaration dataAprovacao={dataAprovacao} />}
    </div>
  );
};

