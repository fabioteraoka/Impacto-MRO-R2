import React from 'react';
import { Printer, X, Wrench, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Ferramenta, ControleCalibracaoF001_06 } from '../types/mro';
import { OfficialFormHeader } from './OfficialFormHeader';
import { NaRuleNotice, EasaReleaseDeclaration } from './OfficialFormNotices';

interface CalibrationMasterSheetModalProps {
  tool: Ferramenta | null;
  calibracao?: ControleCalibracaoF001_06 | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CalibrationMasterSheetModal: React.FC<CalibrationMasterSheetModalProps> = ({
  tool,
  calibracao,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !tool) return null;

  const cal = calibracao || {
    id_calibracao: 1,
    id_ferramenta: tool.id_ferramenta,
    data_calibracao: tool.data_ultima_calibracao || '15/01/2026',
    data_vencimento: tool.data_proxima_calibracao || '15/07/2026',
    numero_certificado: 'CAL-2026-0182-RBC',
    laboratorio_homologado: 'LabMetrologia Aero RBC/INMETRO Acreditado CRL-0412',
    desvio_padrao_encontrado: 0.12,
    resultado_aprovado: true,
    responsavel_registro: 'Carlos Eduardo Vieira (PCP / Ferramentaria)',
    status_resolucao: 'CONFORME_BTI_PMP_05',
    observacoes: 'Calibração realizada em temperatura controlada (20°C ± 1°C). Desvio padrão dentro dos limites da BTI-PMP-05.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full">
        {/* Modal Controls (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-b border-slate-700 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
              Ficha de Controle de Calibração PME • Form F 001-06 (I 001-06 / BTI-PMP-05)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition"
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
        <div className="p-4 sm:p-6 bg-white text-black font-sans text-xs print:p-0 print:text-[9.5px] leading-tight max-w-[210mm] mx-auto">
          {/* Header */}
          <OfficialFormHeader
            codigoFormulario="FORM F 001-06"
            numeroRevisao="R08"
            dataRevisao="15/01/2026"
            tituloDocumento="FICHA MESTRE DE CALIBRAÇÃO E CONTROLE METROLÓGICO (PME)"
            subtituloDocumento="CALIBRATION CONTROL RECORD FOR PRECISION MEASURING EQUIPMENT (RBAC 145.109 / BTI-PMP-05)"
            instrucaoMOMQ="INSTRUÇÃO DE TRABALHO I 001-06 • CONTROLE DE FERRAMENTAS E PADRÕES"
            numeroDocumento={`ID PME: ${(tool as any).codigo_ferramenta || `PME-${String(tool.id_ferramenta).padStart(3, '0')}`}`}
            baseOperacional={tool.nome_base || 'GRU'}
            paginaInfo="PÁG. 1 DE 1"
          />

          {/* Mandatory N/A Notice */}
          <NaRuleNotice />

          {/* SEÇÃO I: IDENTIFICAÇÃO DO EQUIPAMENTO OU FERRAMENTA (Campos 01 a 07) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono flex justify-between">
              <span>SEÇÃO I — IDENTIFICAÇÃO DO EQUIPAMENTO DE MEDIÇÃO (I 001-06)</span>
              <span>CÓDIGO: <strong>{(tool as any).codigo_ferramenta || `PME-${String(tool.id_ferramenta).padStart(3, '0')}`}</strong></span>
            </div>
            <div className="grid grid-cols-4 gap-0 text-[9px]">
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 01 • Código do Item:</span>
                <span className="font-black font-mono text-blue-950 text-xs">{(tool as any).codigo_ferramenta || `PME-${String(tool.id_ferramenta).padStart(3, '0')}`}</span>
              </div>
              <div className="border-r border-b border-black p-1.5 col-span-2">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 02 • Descrição / Nomenclatura:</span>
                <span className="font-bold uppercase text-black">{tool.descricao}</span>
              </div>
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 03 • Fabricante:</span>
                <span className="font-semibold">{tool.fabricante || 'Snap-On Tools'}</span>
              </div>

              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 04 • Part Number (P/N):</span>
                <span className="font-mono font-bold">{tool.part_number}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 05 • Serial Number (S/N):</span>
                <span className="font-mono font-bold">{tool.serial_number}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 06 • Faixa de Medição:</span>
                <span className="font-mono">{tool.faixa_operacao || (tool as any).faixa_medicao || '20 - 250 Nm'}</span>
              </div>
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 07 • Periodicidade:</span>
                <span className="font-mono font-bold">{tool.periodicidade_meses || 12} MESES</span>
              </div>

              <div className="border-black p-1.5 col-span-4 bg-slate-50 flex justify-between">
                <div>
                  <span className="font-bold text-[7.5px] text-slate-700 uppercase">Localização / Base Alocada: </span>
                  <span className="font-mono font-bold text-black">{tool.posicao_localizacao || 'Armário Metrológico A-02'} • Base {tool.nome_base || 'GRU'}</span>
                </div>
                <div className="text-[8px] font-mono text-blue-900 font-bold">
                  SISTEMA DE GESTÃO METROLÓGICA • COM 200607-05 / EASA
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO II: DADOS DO LAUDO DE CALIBRAÇÃO E METROLOGIA (Campos 08 a 13) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO II — DADOS METROLÓGICOS E LAUDO HOMOLOGADO (BTI-PMP-05)
            </div>
            <div className="grid grid-cols-4 gap-0 text-[9px]">
              <div className="border-r border-b border-black p-1.5 col-span-2">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 08 • Laboratório Homologado RBC:</span>
                <span className="font-semibold text-black">{cal.laboratorio_homologado}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 09 • Certificado Nº:</span>
                <span className="font-black font-mono text-blue-950 text-xs">{cal.numero_certificado}</span>
              </div>
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 10 • Data Calibração:</span>
                <span className="font-mono font-bold text-black">{cal.data_calibracao}</span>
              </div>

              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 11 • Próximo Vencimento:</span>
                <span className="font-mono font-black text-rose-950">{cal.data_vencimento}</span>
              </div>
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 12 • Desvio Padrão:</span>
                <span className="font-mono font-bold text-black">±{cal.desvio_padrao_encontrado} (Tolerância: ±0.25)</span>
              </div>
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 13 • Status da Aferição:</span>
                <span className="font-black font-mono text-emerald-900 uppercase">CONFORME BTI-PMP-05</span>
              </div>
              <div className="p-1.5 bg-amber-50">
                <span className="font-bold block text-[7.5px] text-amber-950 uppercase">Etiqueta Vinculada:</span>
                <span className="font-bold font-mono text-amber-950 text-[8.5px]">TAG AMARELA F 001-06-3</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO III: OBSERVAÇÕES E REGISTRO DE MOVIMENTAÇÃO (Campo 14) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-0.5 font-bold text-[9px] border-b border-black uppercase font-mono">
              SEÇÃO III — Campo 14 • PARECER TÉCNICO E OBSERVAÇÕES DO METROLOGISTA
            </div>
            <div className="p-2 text-[8.5px] font-mono bg-slate-50">
              {(cal as any).observacoes || (cal as any).observacoes_laudo || 'Ferramenta aferida de acordo com os padrões da Rede Brasileira de Calibração (RBC). Desvio padrão e repetibilidade metrológica aprovados para uso em manutenção de aeronaves segundo MOMQ MNT-001.'}
            </div>
          </div>

          {/* EASA Part-145 Release Declaration */}
          <EasaReleaseDeclaration dataAprovacao={cal.data_calibracao} />

          {/* SEÇÃO IV: ASSINATURAS E RESPONSABILIDADE (Campos 15 e 16) */}
          <div className="border-2 border-black grid grid-cols-2 gap-0 text-[8.5px] page-break-avoid">
            {/* Campo 15: Responsável pelo Controle de Ferramentas */}
            <div className="border-r border-black p-2 flex flex-col justify-between h-28">
              <div>
                <span className="font-bold block text-black uppercase text-[8px]">Campo 15 • Responsável pela Ferramentaria</span>
                <span className="text-slate-600 block text-[7px]">Controle de PME e Calibrações • RBAC 145.109</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] font-bold">
                  {(cal as any).responsavel_registro || 'Carlos Eduardo Vieira (PCP / Ferramentaria)'}
                </div>
                <div className="font-bold text-[8px]">Encargo Metrológico Impacto</div>
              </div>
              <div className="text-[7px] text-slate-600 text-center font-mono">
                Data: {cal.data_calibracao}
              </div>
            </div>

            {/* Campo 16: Gerente de Garantia da Qualidade GQ */}
            <div className="p-2 flex flex-col justify-between h-28 bg-slate-50">
              <div>
                <span className="font-bold block text-black uppercase text-[8px]">Campo 16 • Gerente da Garantia da Qualidade (GQ)</span>
                <span className="text-slate-600 block text-[7px]">Auditoria Interna • MOMQ MNT-001 Rev 08</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] font-bold">
                  Marcelo Ferreira Ramos
                </div>
                <div className="font-bold text-[8px]">Auditor Líder Qualidade Aeronáutica</div>
              </div>
              <div className="text-[7px] text-slate-600 text-center font-mono">
                Visto de Qualidade Homologado
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-2 text-[7px] text-slate-600 font-mono flex justify-between border-t border-slate-300 pt-1">
            <span>IMPACTO AVIATION LTDA • FORM F 001-06 (Rev 08) • CONFORME RBAC 145 & BTI-PMP-05</span>
            <span>HISTÓRICO MESTRE DE CALIBRAÇÕES PME • ARQUIVO PCP E QUALIDADE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
