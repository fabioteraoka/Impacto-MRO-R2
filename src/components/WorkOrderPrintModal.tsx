import React, { useState } from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Wrench, Link2 } from 'lucide-react';
import { OfficialFormHeader } from './OfficialFormHeader';
import { FodPreventionNotice, NaRuleNotice, EasaReleaseDeclaration } from './OfficialFormNotices';
import { OrdemServicoF001_09_2 } from '../types/mro';

export interface WorkOrderData {
  numero_os: string;
  matricula_aeronave: string;
  modelo_aeronave: string;
  msn: string;
  operador: string;
  base_operacional: string;
  data_abertura: string;
  hora_abertura: string;
  data_encerramento: string;
  hora_encerramento: string;
  tsn: string;
  csn: string;
  escopo_servico: string;
  manuais_utilizados: string;
  ferramentas_vinculadas: string;
  materiais_aplicados: string;
  diretrizes_vinculadas?: Array<{
    numero_diretriz: string;
    numero_fcda?: string;
    status_fcda?: string;
  }>;
  tarefas_executadas: Array<{
    item: number;
    discrepancia: string;
    acao_corretiva: string;
    referencia_amm: string;
    executor_canac: string;
    inspetor_canac: string;
  }>;
  testes_funcionais: string;
  mecanico_executor_nome: string;
  mecanico_executor_canac: string;
  inspetor_aprs_nome: string;
  inspetor_aprs_canac: string;
  rt_nome: string;
  rt_canac: string;
  recebido_operador_nome: string;
}

interface WorkOrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder?: WorkOrderData | OrdemServicoF001_09_2;
}

export const WorkOrderPrintModal: React.FC<WorkOrderPrintModalProps> = ({
  isOpen,
  onClose,
  workOrder,
}) => {
  if (!isOpen) return null;

  // Normalização caso seja OrdemServicoF001_09_2 completa do backend
  let os: WorkOrderData;
  if (!workOrder) {
    os = {
      numero_os: 'OS-2026-0084',
      matricula_aeronave: 'PR-IMA',
      modelo_aeronave: 'ATR 72-600 (ATR 72-212A)',
      msn: '1248',
      operador: 'VoePass Linhas Aéreas S.A. / Impacto Fleet',
      base_operacional: 'GRU',
      data_abertura: '26/09/2026',
      hora_abertura: '08:00 UTC',
      data_encerramento: '26/09/2026',
      hora_encerramento: '18:30 UTC',
      tsn: '8.450,2 FH',
      csn: '7.120 FC',
      escopo_servico: 'Cumprimento de Inspeção de Trânsito 50FH, Diretriz Mandatória DA 2025-11-02 (AD 2025-22-01) e Substituição de Sensor de Pressão Hidráulica Principal.',
      manuais_utilizados: 'ATR 72 AMM JASC 32-00-00 (Rev 44 de 15/11/2025) sob Carta de Concessão CC-VOP-2026-005; IPC JASC 32; SB ATR72-57-6030.',
      ferramentas_vinculadas: 'Torquímetro Snap-On 1/2" (PME-001, SN: SN-88219, Calibração Válida até 15/07/2026 - Certificado CAL-2026-0182 RBC); Manômetro Digital Fluke (PME-004, SN: 77210).',
      materiais_aplicados: 'Sensor Transmissor Hidráulico P/N: 32-1104-01, S/N: HD-99214 com EASA Form 1 nº 2025-EASA-991204; O-Ring MS28775-012 (Req F 001-01-1 nº REQ-2026-0098).',
      diretrizes_vinculadas: [
        {
          numero_diretriz: 'DA 2025-11-02',
          numero_fcda: 'FCDA-2026-0814',
          status_fcda: 'CONCLUIDA',
        }
      ],
      tarefas_executadas: [
        {
          item: 1,
          discrepancia: 'Vazamento residual de fluido hidráulico constatado na linha de retorno do trem de pouso principal direito.',
          acao_corretiva: 'Removido sensor de pressão hidráulica defeituoso, instalado novo componente P/N: 32-1104-01 (S/N: HD-99214) com anéis de vedação novos conforme AMM 32-30-00.',
          referencia_amm: 'AMM Task 32-30-00-400-801',
          executor_canac: '114522',
          inspetor_canac: '114521',
        },
        {
          item: 2,
          discrepancia: 'Cumprimento compulsório da Diretriz de Aeronavegabilidade ANAC DA 2025-11-02 (EASA AD 2025-0188).',
          acao_corretiva: 'Efetuada inspeção por correntes parasitas (Eddy Current) nas fixações da longarina conforme SB ATR72-57-6030 e FCDA F 001-03-2 nº FCDA-2026-0814 emitida.',
          referencia_amm: 'SB ATR72-57-6030 / FCDA',
          executor_canac: '114524',
          inspetor_canac: '114521',
        },
        {
          item: 3,
          discrepancia: 'Inspeção de rotina pré-voo e pressurização estática do sistema hidráulico.',
          acao_corretiva: 'Pressurizado sistema a 3.000 PSI por 15 minutos. Ausência total de vazamentos. Níveis de reservatório restabelecidos conforme AMM 29-00-00.',
          referencia_amm: 'AMM Task 29-10-00-710-801',
          executor_canac: '114522',
          inspetor_canac: '114521',
        },
      ],
      testes_funcionais: 'Teste operacional de extensão e recolhimento de trem de pouso em cavaletes concluído com parâmetros normais de tempo e travamento. Teste de estanqueidade a 3.000 PSI sem vazamentos. Conforme AMM.',
      mecanico_executor_nome: 'Marcos Vinicius Santos',
      mecanico_executor_canac: '114522',
      inspetor_aprs_nome: 'Juliana Costa e Silva',
      inspetor_aprs_canac: '114521',
      rt_nome: 'Rodrigo Albuquerque da Silva',
      rt_canac: '114520',
      recebido_operador_nome: 'Cap. Fernando Menezes (Comandante da Aeronave)',
    };
  } else if ('campo_01_numero_os' in workOrder) {
    const raw = workOrder as OrdemServicoF001_09_2;
    os = {
      numero_os: raw.campo_01_numero_os || raw.numero_os,
      matricula_aeronave: raw.campo_02_matricula,
      modelo_aeronave: raw.campo_03_modelo,
      msn: raw.campo_04_msn,
      operador: raw.campo_05_operador,
      base_operacional: raw.campo_06_base_executante,
      data_abertura: raw.campo_07_data_abertura,
      hora_abertura: raw.campo_07_hora_abertura,
      data_encerramento: raw.campo_08_data_encerramento_real && raw.campo_08_data_encerramento_real !== 'N/A'
        ? raw.campo_08_data_encerramento_real
        : raw.campo_08_data_encerramento_prevista,
      hora_encerramento: raw.campo_08_hora_encerramento_real && raw.campo_08_hora_encerramento_real !== 'N/A'
        ? raw.campo_08_hora_encerramento_real
        : raw.campo_08_hora_encerramento_prevista,
      tsn: raw.campo_09_tsn,
      csn: raw.campo_10_csn,
      escopo_servico: raw.campo_11_escopo_servico,
      manuais_utilizados: raw.campo_12_manuais_texto_formatado,
      ferramentas_vinculadas: raw.campo_13_ferramental_pme_texto,
      materiais_aplicados: raw.campo_14_materiais_pecas_texto,
      diretrizes_vinculadas: (raw.diretrizes_vinculadas || []).map((d) => ({
        numero_diretriz: d.numero_diretriz,
        numero_fcda: d.numero_fcda,
        status_fcda: d.status_fcda,
      })),
      tarefas_executadas: (raw.tarefas_discrepancias || []).map((t) => ({
        item: t.item,
        discrepancia: t.discrepancia,
        acao_corretiva: t.acao_corretiva,
        referencia_amm: t.referencia_amm,
        executor_canac: t.executor_canac,
        inspetor_canac: t.inspetor_canac,
      })),
      testes_funcionais: raw.campo_16_testes_funcionais,
      mecanico_executor_nome: raw.mecanico_executor_nome,
      mecanico_executor_canac: raw.mecanico_executor_canac,
      inspetor_aprs_nome: raw.inspetor_aprs_nome,
      inspetor_aprs_canac: raw.inspetor_aprs_canac,
      rt_nome: raw.rt_nome,
      rt_canac: raw.rt_canac,
      recebido_operador_nome: raw.representante_operador_nome,
    };
  } else {
    os = workOrder as WorkOrderData;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full">
        {/* Modal Controls (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-b border-slate-700 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
              Ordem de Serviço Oficial • Form F 001-09-2 (I 001-09 / RBAC 145 / EASA.145.1003)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir A4 / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-4 sm:p-6 bg-white text-black font-sans text-xs print:p-0 print:text-[9px] leading-tight max-w-[210mm] mx-auto">
          {/* Official Document Header */}
          <OfficialFormHeader
            codigoFormulario="FORM F 001-09-2"
            numeroRevisao="R08"
            dataRevisao="15/01/2026"
            tituloDocumento="ORDEM DE SERVIÇO DE MANUTENÇÃO AERONÁUTICA (OS)"
            subtituloDocumento="AIRCRAFT MAINTENANCE WORK ORDER (RBAC 145 / RBAC 43 / EASA PART-145.A.50)"
            instrucaoMOMQ="INSTRUÇÃO DE TRABALHO I 001-09 • SISTEMA DE CONTROLE TÉCNICO PCP"
            numeroDocumento={os.numero_os}
            baseOperacional={os.base_operacional}
            paginaInfo="PÁG. 1 DE 1"
          />

          {/* Mandatory N/A Regulatory Notice */}
          <NaRuleNotice />

          {/* SEÇÃO I: IDENTIFICAÇÃO DA AERONAVE E DA ORDEM DE SERVIÇO (Campos 01 a 10) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono flex justify-between">
              <span>SEÇÃO I — IDENTIFICAÇÃO DA AERONAVE E ABERTURA (I 001-09)</span>
              <span>Nº OS: <strong>{os.numero_os}</strong></span>
            </div>
            <div className="grid grid-cols-4 gap-0 text-[9px]">
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 01 • Nº da OS:</span>
                <span className="font-black text-xs font-mono text-blue-950">{os.numero_os}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 02 • Matrícula (Reg.):</span>
                <span className="font-black text-xs font-mono">{os.matricula_aeronave}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 03 • Modelo da Aeronave:</span>
                <span className="font-bold truncate block">{os.modelo_aeronave}</span>
              </div>
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 04 • Nº Série (MSN):</span>
                <span className="font-mono font-bold">{os.msn}</span>
              </div>

              <div className="border-r border-b border-black p-1.5 col-span-2">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 05 • Operador / Proprietário:</span>
                <span className="font-semibold truncate block">{os.operador}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 06 • Base Atendimento:</span>
                <span className="font-bold font-mono">Base {os.base_operacional}</span>
              </div>
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 07 • Abertura:</span>
                <span className="font-mono">{os.data_abertura} {os.hora_abertura}</span>
              </div>

              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 08 • Encerramento:</span>
                <span className="font-mono">{os.data_encerramento} {os.hora_encerramento}</span>
              </div>
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 09 • TSN Aeronave:</span>
                <span className="font-mono font-bold">{os.tsn}</span>
              </div>
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 10 • CSN Aeronave:</span>
                <span className="font-mono font-bold">{os.csn}</span>
              </div>
              <div className="p-1.5 bg-slate-50">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Homologação da Base:</span>
                <span className="font-mono text-[8px] font-bold text-blue-900">COM 200607-05 / EASA</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO II: ESCOPO DE SERVIÇO E REFERÊNCIAS TÉCNICAS (Campos 11 a 14) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO II — ESCOPO DE SERVIÇO, PUBLICAÇÕES E RASTREABILIDADE (I 001-09 / I 001-02 / I 001-06)
            </div>
            <div className="p-2 space-y-1.5 text-[9px]">
              <div>
                <span className="font-bold text-[7.5px] text-slate-700 uppercase block">
                  Campo 11 • Descrição dos Serviços Solicitados / Escopo de Manutenção:
                </span>
                <div className="font-semibold text-black bg-slate-50 p-1 border border-slate-300 rounded mt-0.5">
                  {os.escopo_servico}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <span className="font-bold text-[7.5px] text-slate-700 uppercase block">
                    Campo 12 • Manuais Técnicos e Revisões (F 001-02-1):
                  </span>
                  <div className="text-[8.5px] font-mono bg-slate-50 p-1 border border-slate-300 rounded h-12 overflow-hidden">
                    {os.manuais_utilizados}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-[7.5px] text-slate-700 uppercase block">
                    Campo 13 • Ferramental PME Calibrado Utilizado (F 001-06-1):
                  </span>
                  <div className="text-[8.5px] font-mono bg-slate-50 p-1 border border-slate-300 rounded h-12 overflow-hidden">
                    {os.ferramentas_vinculadas}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-[7.5px] text-slate-700 uppercase block">
                    Campo 14 • Peças e Materiais Aeronáuticos (F 001-01-1):
                  </span>
                  <div className="text-[8.5px] font-mono bg-slate-50 p-1 border border-slate-300 rounded h-12 overflow-hidden">
                    {os.materiais_aplicados}
                  </div>
                </div>
              </div>

              {/* Vínculo Nominal de Diretrizes de Aeronavegabilidade (DAs / ADs / SBs) e FCDA Form F 001-03-2 */}
              <div className="border-t border-slate-300 pt-1.5 mt-1">
                <span className="font-bold text-[7.5px] text-slate-700 uppercase block flex items-center space-x-1">
                  <Link2 className="w-3 h-3 text-blue-700 inline" />
                  <span>Diretrizes de Aeronavegabilidade Vinculadas Nominalmente • Form F 001-03-2 (IS 39-001A / MOMQ 6.3):</span>
                </span>
                {os.diretrizes_vinculadas && os.diretrizes_vinculadas.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {os.diretrizes_vinculadas.map((d, i) => (
                      <div key={i} className="bg-blue-50 border border-blue-300 text-blue-950 px-2 py-0.5 rounded text-[8px] font-mono flex items-center space-x-1">
                        <span className="font-bold">{d.numero_diretriz}</span>
                        {d.numero_fcda && (
                          <span className="text-slate-600">→ FCDA: <strong>{d.numero_fcda}</strong> ({d.status_fcda || 'VINCULADA'})</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[8px] font-mono text-slate-500 italic mt-0.5">
                    N/A — Nenhuma diretriz mandatória vinculada a esta Ordem de Serviço.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO III: TAREFAS EXECUTADAS E DISCREPÂNCIAS (Campo 15) */}
          <div className="border border-black mb-2.5 overflow-hidden">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO III — Campo 15 • REGISTRO DE DISCREPÂNCIAS E AÇÕES CORRETIVAS EXECUTADAS
            </div>
            <table className="w-full text-left text-[8.5px]">
              <thead className="bg-slate-100 border-b border-black font-mono font-bold uppercase text-[7.5px]">
                <tr>
                  <th className="p-1 border-r border-black w-6 text-center">Item</th>
                  <th className="p-1 border-r border-black w-1/3">Discrepância Constatada</th>
                  <th className="p-1 border-r border-black">Ação Corretiva Executada / Referência Técnica</th>
                  <th className="p-1 border-r border-black w-16 text-center">Mecânico (CANAC)</th>
                  <th className="p-1 w-16 text-center">Inspetor (APRS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/60 font-sans">
                {os.tarefas_executadas.map((t) => (
                  <tr key={t.item} className="hover:bg-slate-50">
                    <td className="p-1 border-r border-black text-center font-mono font-bold">{t.item}</td>
                    <td className="p-1 border-r border-black font-semibold text-slate-900">{t.discrepancia}</td>
                    <td className="p-1 border-r border-black text-slate-900">
                      <div>{t.acao_corretiva}</div>
                      <div className="text-[7.5px] font-mono text-blue-900 font-bold mt-0.5">Ref: {t.referencia_amm}</div>
                    </td>
                    <td className="p-1 border-r border-black text-center font-mono font-bold text-black">{t.executor_canac}</td>
                    <td className="p-1 text-center font-mono font-black text-blue-950">{t.inspetor_canac}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SEÇÃO IV: TESTES FUNCIONAIS (Campo 16) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-0.5 font-bold text-[9px] border-b border-black uppercase font-mono">
              SEÇÃO IV — Campo 16 • TESTES FUNCIONAIS, OPERACIONAIS E ESTANQUEIDADE
            </div>
            <div className="p-1.5 text-[8.5px] font-mono bg-slate-50">
              {os.testes_funcionais}
            </div>
          </div>

          {/* Mandatory FOD Prevention Notice */}
          <FodPreventionNotice />

          {/* EASA Part-145 Release Declaration */}
          <EasaReleaseDeclaration dataAprovacao={os.data_encerramento} />

          {/* SEÇÃO V: ASSINATURAS E LIBERAÇÃO PARA RETORNO AO SERVIÇO (Campos 19 a 22) */}
          <div className="border-2 border-black grid grid-cols-4 gap-0 text-[8.5px] page-break-avoid">
            {/* Campo 19: Mecânico Executor */}
            <div className="border-r border-black p-2 flex flex-col justify-between h-28">
              <div>
                <span className="font-bold block text-black uppercase text-[8px]">Campo 19 • Mecânico Executor</span>
                <span className="text-slate-600 block text-[7px]">Execução Técnica • RBAC 65</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] font-bold">
                  {os.mecanico_executor_nome}
                </div>
                <div className="font-bold text-[8px]">CANAC: {os.mecanico_executor_canac}</div>
              </div>
              <div className="text-[7px] text-slate-600 text-center font-mono">
                Data: {os.data_encerramento}
              </div>
            </div>

            {/* Campo 20: Inspetor APRS */}
            <div className="border-r border-black p-2 flex flex-col justify-between h-28 bg-blue-50/20">
              <div>
                <span className="font-bold block text-blue-950 uppercase text-[8px]">Campo 20 • Inspetor APRS</span>
                <span className="text-blue-900 block text-[7px]">Dupla Inspeção • RBAC 145.163</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] text-blue-950 font-bold">
                  {os.inspetor_aprs_nome}
                </div>
                <div className="font-bold text-[8px] text-blue-950">CANAC: {os.inspetor_aprs_canac} (APRS)</div>
              </div>
              <div className="text-[7px] text-blue-900 text-center font-bold">
                Retorno ao Serviço Autorizado
              </div>
            </div>

            {/* Campo 21: Responsável Técnico RT */}
            <div className="border-r border-black p-2 flex flex-col justify-between h-28">
              <div>
                <span className="font-bold block text-black uppercase text-[8px]">Campo 21 • Responsável Técnico (RT)</span>
                <span className="text-slate-600 block text-[7px]">Diretoria Técnica • COM 200607-05</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] font-bold">
                  {os.rt_nome}
                </div>
                <div className="font-bold text-[8px]">CANAC: {os.rt_canac}</div>
              </div>
              <div className="text-[7px] text-slate-600 text-center font-mono">
                Homologado EASA.145.1003
              </div>
            </div>

            {/* Campo 22: Recebimento do Operador */}
            <div className="p-2 flex flex-col justify-between h-28">
              <div>
                <span className="font-bold block text-black uppercase text-[8px]">Campo 22 • Aceite do Operador</span>
                <span className="text-slate-600 block text-[7px]">Comandante / CTM do Cliente</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[8.5px]">
                  {os.recebido_operador_nome}
                </div>
                <div className="font-bold text-[7.5px] text-slate-600">Representante do Operador</div>
              </div>
              <div className="text-[7px] text-slate-600 text-center font-mono">
                Arquivo de Bordo e CTM
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-2 text-[7px] text-slate-600 font-mono flex justify-between border-t border-slate-300 pt-1">
            <span>IMPACTO AVIATION LTDA • FORM F 001-09-2 (Rev 08) • CONFORME RBAC 145, RBAC 43 & EASA PART-145</span>
            <span>AUTENTICIDADE COMPROVADA VIA MRO SUITE • VIA 1: ARQUIVO PCP • VIA 2: CTM OPERADOR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
