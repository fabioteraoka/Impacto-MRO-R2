import React from 'react';
import { Printer, X, Download, ShieldCheck, CheckCircle2, Plane, AlertTriangle, FileText } from 'lucide-react';
import { FCDAF001_03_2 } from '../types/mro';
import { OfficialFormHeader } from './OfficialFormHeader';
import { FodPreventionNotice, NaRuleNotice, EasaReleaseDeclaration } from './OfficialFormNotices';

interface FcdaPrintModalProps {
  fcda: FCDAF001_03_2 | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FcdaPrintModal: React.FC<FcdaPrintModalProps> = ({ fcda, isOpen, onClose }) => {
  if (!isOpen || !fcda) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-b border-slate-700 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
              FCDA Oficial • Form F 001-03-2 (IS 39-001A / MOMQ I 001-03)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir A4 / Gerar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Document Container - Strictly Formatted for A4 */}
        <div className="p-4 sm:p-6 bg-white text-black font-sans text-xs print:p-0 print:text-[9.5px] leading-tight max-w-[210mm] mx-auto">
          {/* 1. Official Header (Standard Impacto Aviation MOMQ) */}
          <OfficialFormHeader
            codigoFormulario="FORM F 001-03-2"
            numeroRevisao="R08"
            dataRevisao="15/01/2026"
            tituloDocumento="FICHA DE CUMPRIMENTO DE DIRETRIZ DE AERONAVEGABILIDADE (FCDA)"
            subtituloDocumento="AIRWORTHINESS DIRECTIVE & SERVICE BULLETIN COMPLIANCE RECORD (IS 39-001A / RBAC 145.109 / RBAC 43)"
            instrucaoMOMQ="PROCEDIMENTO TÉCNICO I 001-03 • ARQUIVO PCP / ENVIO CTM OPERADOR"
            numeroDocumento={`FCDA Nº: ${fcda.numero_fcda}`}
            baseOperacional="GRU"
            paginaInfo="PÁG. 1 DE 1"
          />

          {/* Mandatory N/A Regulatory Notice */}
          <NaRuleNotice />

          {/* SEÇÃO 1: IDENTIFICAÇÃO DA AERONAVE E DIRETRIZ MANDATÓRIA (Campos 01 a 11) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono flex justify-between">
              <span>SEÇÃO I — IDENTIFICAÇÃO DA AERONAVE E DIRETRIZ MANDATÓRIA (I 001-03)</span>
              <span>ORDEM DE SERVIÇO IMPACTO: <strong>{fcda.numero_os}</strong></span>
            </div>
            
            <div className="grid grid-cols-4 gap-0 text-[9.5px]">
              {/* Campo 01 */}
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 01 • Matrícula (Reg.):</span>
                <span className="font-black text-xs font-mono">{fcda.matricula_aeronave || 'N/A'}</span>
              </div>
              {/* Campo 02 */}
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 02 • S/N Fabricante (MSN):</span>
                <span className="font-mono font-bold">{fcda.msn_aeronave || 'N/A'}</span>
              </div>
              {/* Campo 03 */}
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 03 • Operador / Cliente:</span>
                <span className="font-bold uppercase truncate block">{fcda.nome_operador || 'N/A'}</span>
              </div>
              {/* Campo 04 & 05 */}
              <div className="border-b border-black p-1.5 bg-blue-50/40">
                <span className="font-bold block text-[8px] text-blue-900 uppercase">Campo 05 • Nº Diretriz (AD/DA):</span>
                <span className="font-black font-mono text-blue-950 text-xs">{fcda.numero_diretriz || 'N/A'}</span>
              </div>

              {/* Campo 06 */}
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 06 • Data Efetividade:</span>
                <span className="font-mono">{fcda.data_efetividade || 'N/A'}</span>
              </div>
              {/* Campo 07 */}
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 07 • Vencimento Limite:</span>
                <span className="font-mono font-semibold">{fcda.vencimento_limite || 'N/A'}</span>
              </div>
              {/* Campo 08 */}
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 08 • Categoria Aplicação:</span>
                <span className="font-bold uppercase">{fcda.categoria_aplicacao || 'N/A'}</span>
              </div>
              {/* Campo 09 */}
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 09 • Tipo de Ação:</span>
                <span className={`font-black uppercase ${fcda.tipo_acao === 'REPETITIVA' ? 'text-amber-900' : 'text-emerald-900'}`}>
                  {fcda.tipo_acao || 'N/A'}
                </span>
              </div>

              {/* Campo 10 */}
              <div className="border-r border-black p-1.5 col-span-2">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 10 • Boletim de Serviço de Referência (SB):</span>
                <span className="font-mono font-semibold">{fcda.numero_sb_referencia || 'N/A'}</span>
              </div>
              {/* Campo 11 */}
              <div className="border-black p-1.5 col-span-2">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 11 • Documentos Complementares (AMM / MPD / IPC):</span>
                <span className="font-mono truncate block">{fcda.documentos_referencia || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: IDENTIFICAÇÃO DO PRODUTO / COMPONENTE AFETADO (Campos 12 a 16) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO II — IDENTIFICAÇÃO DO PRODUTO / COMPONENTE AFETADO (I 001-03)
            </div>
            <div className="grid grid-cols-5 gap-0 text-[9.5px]">
              {/* Campo 12 */}
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 12 • Fabricante:</span>
                <span className="font-semibold uppercase">{fcda.produto_fabricante || 'N/A'}</span>
              </div>
              {/* Campo 13 */}
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 13 • Modelo:</span>
                <span className="font-mono font-semibold">{fcda.produto_modelo || 'N/A'}</span>
              </div>
              {/* Campo 14 */}
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 14 • Part Number (P/N):</span>
                <span className="font-mono font-bold">{fcda.produto_pn || 'N/A'}</span>
              </div>
              {/* Campo 15 */}
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 15 • Serial Number (S/N):</span>
                <span className="font-mono font-bold">{fcda.produto_sn || 'N/A'}</span>
              </div>
              {/* Campo 16 */}
              <div className="p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 16 • Vendor Number (V/N):</span>
                <span className="font-mono">{fcda.produto_vn || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: AVALIAÇÃO DE APLICABILIDADE REGULAMENTAR (Campo 17) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono flex items-center justify-between">
              <span>SEÇÃO III — Campo 17 • AVALIAÇÃO DE APLICABILIDADE (IS 39-001A / MOMQ I 001-03)</span>
              <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded ${
                fcda.aplicabilidade === 'APLICAVEL' ? 'bg-emerald-800 text-white' : 'bg-rose-800 text-white'
              }`}>
                {fcda.aplicabilidade === 'APLICAVEL' ? 'DIRETRIZ APLICÁVEL' : 'NÃO APLICÁVEL (JUSTIFICADA)'}
              </span>
            </div>
            <div className="p-2 text-[9.5px]">
              <div className="flex items-center space-x-6 mb-1">
                <label className="flex items-center space-x-1.5">
                  <input
                    type="radio"
                    readOnly
                    checked={fcda.aplicabilidade === 'APLICAVEL'}
                    className="accent-black"
                  />
                  <span className="font-bold">APLICÁVEL</span> — Requisitos técnicos cumpridos integralmente nesta Ordem de Serviço.
                </label>
                <label className="flex items-center space-x-1.5">
                  <input
                    type="radio"
                    readOnly
                    checked={fcda.aplicabilidade === 'NAO_APLICAVEL'}
                    className="accent-black"
                  />
                  <span className="font-bold">NÃO APLICÁVEL</span> — Exige justificativa técnica circunstanciada (Regra Inviolável #1).
                </label>
              </div>

              {fcda.aplicabilidade === 'NAO_APLICAVEL' ? (
                <div className="bg-amber-50 border border-amber-500 p-2 rounded text-[9px] mt-1 font-mono">
                  <span className="font-bold text-amber-950 block uppercase text-[8px]">
                    Justificativa Técnica Circunstanciada de Não-Aplicabilidade (IS 39-001A):
                  </span>
                  <p className="text-black italic mt-0.5 font-sans">
                    "{fcda.justificativa_nao_aplicabilidade}"
                  </p>
                </div>
              ) : (
                <div className="text-[8px] text-slate-500 font-mono">
                  Justificativa de Não Aplicabilidade: N/A (Item homologado como aplicável à aeronave/componente).
                </div>
              )}
            </div>
          </div>

          {/* SEÇÃO 4: DADOS TÉCNICOS OPERACIONAIS NO CUMPRIMENTO (Campos 18 e 19) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO IV — Campo 18 • DADOS OPERACIONAIS NO CUMPRIMENTO & Campo 19 • PRÓXIMO VENCIMENTO
            </div>
            <div className="grid grid-cols-6 gap-0 text-[9.5px]">
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">TSN (Horas Totais):</span>
                <span className="font-mono font-bold">{fcda.tsn || 'N/A'}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">CSN (Ciclos Totais):</span>
                <span className="font-mono font-bold">{fcda.csn || 'N/A'}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">TSO (Horas Revisão):</span>
                <span className="font-mono">{fcda.tso || 'N/A'}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">TSLI (Horas Últ. Insp.):</span>
                <span className="font-mono">{fcda.tsli || 'N/A'}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">CSLI (Ciclos Últ. Insp.):</span>
                <span className="font-mono">{fcda.csli || 'N/A'}</span>
              </div>
              <div className="border-b border-black p-1.5 bg-slate-50">
                <span className="font-bold block text-[8px] text-slate-700 uppercase">Data Cumprimento:</span>
                <span className="font-mono font-black">{fcda.data_cumprimento || 'N/A'}</span>
              </div>

              {/* Campo 19: Repetitive info */}
              <div className="border-r border-black p-1.5 col-span-2 bg-amber-50/40">
                <span className="font-bold block text-[8px] text-amber-950 uppercase">Campo 19.A • Próx. Vencimento (Horas):</span>
                <span className="font-mono font-bold">{fcda.proximo_vencimento_horas || 'N/A'}</span>
              </div>
              <div className="border-r border-black p-1.5 col-span-2 bg-amber-50/40">
                <span className="font-bold block text-[8px] text-amber-950 uppercase">Campo 19.B • Próx. Vencimento (Ciclos):</span>
                <span className="font-mono font-bold">{fcda.proximo_vencimento_ciclos || 'N/A'}</span>
              </div>
              <div className="p-1.5 col-span-2 bg-amber-50/40">
                <span className="font-bold block text-[8px] text-amber-950 uppercase">Campo 19.C • Próx. Vencimento (Data):</span>
                <span className="font-mono font-bold">{fcda.proximo_vencimento_data || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: MÉTODO EXECUTIVO, RESULTADO E OBSERVAÇÕES (Campos 20, 21 e 22) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO V — EXECUÇÃO TÉCNICA E RESULTADO DA MANUTENÇÃO (I 001-03 / RBAC 43)
            </div>
            <div className="p-2 text-[9.5px] space-y-1.5">
              <div>
                <span className="font-bold text-[8px] text-slate-700 uppercase block">
                  Campo 20 • Método Executivo Utilizado / Instruções de Cumprimento:
                </span>
                <div className="font-mono text-black bg-slate-50 p-1.5 border border-slate-300 rounded mt-0.5 text-[9px]">
                  {fcda.metodo_utilizado || 'N/A'}
                </div>
              </div>

              <div>
                <span className="font-bold text-[8px] text-slate-700 uppercase block">
                  Campo 21 • Resultado da Ação de Manutenção / Despacho Técnico de Conformidade:
                </span>
                <div className="font-mono font-bold text-black bg-slate-50 p-1.5 border border-slate-300 rounded mt-0.5 text-[9px]">
                  {fcda.resultado_acao || 'N/A'}
                </div>
              </div>

              <div>
                <span className="font-bold text-[8px] text-slate-700 uppercase block">
                  Campo 22 • Observações Técnicas Complementares:
                </span>
                <div className="text-slate-800 italic text-[8.5px]">
                  {fcda.observacoes || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory FOD Prevention Notice */}
          <FodPreventionNotice />

          {/* EASA Part-145 Release Declaration */}
          <EasaReleaseDeclaration dataAprovacao={fcda.data_cumprimento} />

          {/* SEÇÃO 6: RESPONSABILIDADE TÉCNICA, CARIMBOS E ASSINATURAS (Campos 23 a 26) */}
          <div className="border-2 border-black page-break-avoid">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono text-center">
              SEÇÃO VI — APROVAÇÃO, CARIMBOS E ASSINATURAS REGULAMENTARES (RBAC 145 / RBAC 65 / MOMQ)
            </div>
            <div className="grid grid-cols-4 gap-0 text-[8.5px]">
              {/* Campo 23: Mecânico Executor */}
              <div className="border-r border-black p-2 flex flex-col justify-between h-28">
                <div>
                  <span className="font-bold block text-black uppercase text-[8px]">Campo 23 • Mecânico Executor</span>
                  <span className="text-slate-600 block text-[7.5px]">Execução Técnica • RBAC 65</span>
                </div>
                <div className="text-center font-mono my-1">
                  <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] font-bold">
                    {fcda.executor_nome || 'N/A'}
                  </div>
                  <div className="font-bold text-[8.5px]">CANAC: {fcda.executor_canac || 'N/A'}</div>
                </div>
                <div className="text-[7.5px] text-slate-600 text-center font-mono">
                  Data: {fcda.data_cumprimento || 'N/A'}
                </div>
              </div>

              {/* Campo 24: Inspetor APRS */}
              <div className="border-r border-black p-2 flex flex-col justify-between h-28 bg-blue-50/20">
                <div>
                  <span className="font-bold block text-blue-950 uppercase text-[8px]">Campo 24 • Inspetor (APRS)</span>
                  <span className="text-blue-900 block text-[7.5px]">Dupla Inspeção • RBAC 145.163</span>
                </div>
                <div className="text-center font-mono my-1">
                  <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] text-blue-950 font-bold">
                    {fcda.inspetor_nome || 'N/A'}
                  </div>
                  <div className="font-bold text-[8.5px] text-blue-950">
                    CANAC: {fcda.inspetor_canac || 'N/A'} (APRS)
                  </div>
                </div>
                <div className="text-[7.5px] text-blue-900 text-center font-bold">
                  Visto de Qualidade Conforme
                </div>
              </div>

              {/* Campo 25: Responsável Técnico RT */}
              <div className="border-r border-black p-2 flex flex-col justify-between h-28">
                <div>
                  <span className="font-bold block text-black uppercase text-[8px]">Campo 25 • Responsável Técnico (RT)</span>
                  <span className="text-slate-600 block text-[7.5px]">Diretoria Técnica • COM 200607-05</span>
                </div>
                <div className="text-center font-mono my-1">
                  <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] font-bold">
                    {fcda.rt_nome || 'N/A'}
                  </div>
                  <div className="font-bold text-[8.5px]">CANAC: {fcda.rt_canac || 'N/A'}</div>
                </div>
                <div className="text-[7.5px] text-slate-600 text-center">
                  Aprovado Retorno ao Serviço
                </div>
              </div>

              {/* Campo 26: Operador / CTM */}
              <div className="p-2 flex flex-col justify-between h-28">
                <div>
                  <span className="font-bold block text-black uppercase text-[8px]">Campo 26 • Recebido Operador / CTM</span>
                  <span className="text-slate-600 block text-[7.5px]">Arquivo Técnico da Aeronave</span>
                </div>
                <div className="text-center font-mono my-1">
                  <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px]">
                    {fcda.representante_operador || fcda.nome_operador || 'N/A'}
                  </div>
                  <div className="font-bold text-[7.5px] text-slate-600">Representante Homologado</div>
                </div>
                <div className="text-[7.5px] text-slate-600 text-center font-mono">
                  Arquivo Permanente PCP
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-2 text-[7.5px] text-slate-600 font-mono flex justify-between border-t border-slate-300 pt-1">
            <span>IMPACTO AVIATION LTDA • FORM F 001-03-2 (Rev 08) • CONFORME RBAC 145, RBAC 43 & IS 39-001A</span>
            <span>EVIDÊNCIA AUDITÁVEL ANAC / EASA • AUTENTICIDADE GARANTIDA VIA MRO SUITE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
