import React, { useState } from 'react';
import {
  Tag,
  Printer,
  X,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Info
} from 'lucide-react';
import { FerramentaDetalhada } from '../types/mro';

interface ToolTagModalProps {
  tool: FerramentaDetalhada;
  isOpen: boolean;
  onClose: () => void;
}

export const ToolTagModal: React.FC<ToolTagModalProps> = ({
  tool,
  isOpen,
  onClose
}) => {
  const [tagType, setTagType] = useState<'AMARELA' | 'VERMELHA'>(
    tool.status_operacional === 'QUARENTENA' ? 'VERMELHA' : 'AMARELA'
  );

  if (!isOpen) return null;

  const ultimaCalibracao = tool.calibracoes?.[0];
  const ultimaQuarentena = tool.quarentenas?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg text-slate-200">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                ETIQUETA REGULAMENTAR DE FERRAMENTA
              </h3>
              <p className="text-xs text-slate-400">
                Padrões Oficiais MOMQ MNT-001 (Rev 08) — Impacto Aviation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tag Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
          <button
            onClick={() => setTagType('AMARELA')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              tagType === 'AMARELA'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            Tag Amarela F 001-06-3 (Calibrado)
          </button>
          <button
            onClick={() => setTagType('VERMELHA')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              tagType === 'VERMELHA'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            Tag Vermelha F 001-01-6 (Quarentena)
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Etiqueta
            </button>
          </div>

          {/* TAG AMARELA F 001-06-3 */}
          {tagType === 'AMARELA' && (
            <div className="max-w-md mx-auto bg-amber-300 text-slate-950 p-5 rounded-lg border-4 border-amber-500 shadow-2xl font-sans relative">
              <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-amber-600 mx-auto mb-2 shadow-inner"></div>

              <div className="text-center border-b-2 border-amber-600/80 pb-2 mb-2">
                <div className="text-[11px] tracking-widest font-black uppercase text-amber-950 font-mono">
                  IMPACTO AVIATION
                </div>
                <div className="text-[8px] font-bold text-amber-950 uppercase leading-tight font-sans">
                  IMPACTO Manutenção, Pintura, Conservação de Aeronaves e Serviços Auxiliares Ltda.
                </div>
                <div className="text-[8px] font-mono text-amber-900 font-bold mt-0.5">
                  COM 200607-05/ANAC • EASA.145.1003 • Base {tool.nome_base || 'GRU'}
                </div>
                <div className="mt-1 flex items-center justify-between bg-amber-400 px-2 py-0.5 rounded border border-amber-600 font-mono text-[9px]">
                  <span className="font-black text-amber-950">FORM F 001-06-3 (TAG AMARELA)</span>
                  <span className="font-bold text-amber-900">REV: R08 • 15/01/2026</span>
                </div>
                <div className="mt-1 text-xs font-black tracking-wider uppercase bg-amber-950 text-amber-300 py-0.5 px-2 rounded font-sans">
                  INSTRUMENTO CALIBRADO (PME)
                </div>
              </div>

              <div className="space-y-1.5 text-[10.5px] bg-amber-200/90 p-2.5 rounded border border-amber-400 font-sans">
                <div className="flex justify-between border-b border-amber-300 pb-1">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 01 • DESCRIÇÃO:</span>
                  <span className="font-semibold text-right">{tool.descricao}</span>
                </div>
                <div className="flex justify-between border-b border-amber-300 pb-1">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 02 • PART NUMBER (P/N):</span>
                  <span className="font-mono font-bold">{tool.part_number}</span>
                </div>
                <div className="flex justify-between border-b border-amber-300 pb-1">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 03 • SERIAL NUMBER (S/N):</span>
                  <span className="font-mono font-bold">{tool.serial_number}</span>
                </div>
                <div className="flex justify-between border-b border-amber-300 pb-1">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 04 • CERTIFICADO Nº:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {ultimaCalibracao?.numero_certificado || 'CAL-2026-0182 RBC'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-amber-300 pb-1">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 05 • DATA CALIBRAÇÃO:</span>
                  <span className="font-mono font-bold">
                    {tool.data_ultima_calibracao || '15/01/2026'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-amber-300 pb-1">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 06 • VENCIMENTO:</span>
                  <span className="font-mono font-black text-red-950">
                    {tool.data_proxima_calibracao || '15/07/2026'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-amber-300 pb-1">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 07 • LABORATÓRIO RBC:</span>
                  <span className="font-semibold truncate max-w-[190px]">
                    {ultimaCalibracao?.laboratorio_homologado || 'LabMetrologia RBC Acreditado'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-amber-300 pb-1">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 08 • DESVIO PADRÃO:</span>
                  <span className="font-mono font-bold">
                    {ultimaCalibracao?.desvio_padrao_encontrado !== undefined
                      ? `±${ultimaCalibracao.desvio_padrao_encontrado} (Conforme BTI-PMP-05)`
                      : '±0.12 (Aprovado BTI-PMP-05)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-amber-950 text-[9.5px]">Campo 09 • RESPONSÁVEL:</span>
                  <span className="font-semibold font-mono text-[9.5px]">
                    {(ultimaCalibracao as any)?.responsavel_registro || 'Carlos Eduardo (Ferramentaria)'}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center text-[8.5px] font-black text-amber-950 uppercase border-t border-amber-400 pt-1">
                REGRA MOMQ: VERIFIQUE O LACRE DE INTEGRIDADE ANTES DO USO NA OS
              </div>
            </div>
          )}

          {/* TAG VERMELHA F 001-01-6 */}
          {tagType === 'VERMELHA' && (
            <div className="max-w-md mx-auto bg-red-600 text-white p-5 rounded-lg border-4 border-red-800 shadow-2xl font-sans relative">
              <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white/80 mx-auto mb-2 shadow-inner"></div>

              <div className="text-center border-b-2 border-white/60 pb-2 mb-2">
                <div className="text-[11px] tracking-widest font-black uppercase text-red-100 font-mono">
                  IMPACTO AVIATION
                </div>
                <div className="text-[8px] font-bold text-red-100 uppercase leading-tight font-sans">
                  IMPACTO Manutenção, Pintura, Conservação de Aeronaves e Serviços Auxiliares Ltda.
                </div>
                <div className="text-[8px] font-mono text-red-200 mt-0.5">
                  COM 200607-05/ANAC • EASA.145.1003 • Base {tool.nome_base || 'GRU'}
                </div>
                <div className="mt-1 flex items-center justify-between bg-red-800 px-2 py-0.5 rounded border border-white/40 font-mono text-[9px]">
                  <span className="font-black text-white">FORM F 001-01-6 (TAG VERMELHA)</span>
                  <span className="font-bold text-red-200">REV: R08 • 15/01/2026</span>
                </div>
                <div className="mt-1 text-xs font-black tracking-wider uppercase bg-red-950 text-red-100 py-0.5 px-2 rounded border border-red-400 font-sans">
                  MATERIAL NÃO UTILIZÁVEL (QUARENTENA)
                </div>
              </div>

              <div className="space-y-1.5 text-[10.5px] bg-red-700/80 p-2.5 rounded border border-red-500/80 font-sans">
                <div className="flex justify-between border-b border-red-500/50 pb-1">
                  <span className="font-bold uppercase text-red-200 text-[9.5px]">Campo 01 • DESCRIÇÃO:</span>
                  <span className="font-semibold text-right">{tool.descricao}</span>
                </div>
                <div className="flex justify-between border-b border-red-500/50 pb-1">
                  <span className="font-bold uppercase text-red-200 text-[9.5px]">Campo 02 • PART NUMBER (P/N):</span>
                  <span className="font-mono font-bold">{tool.part_number}</span>
                </div>
                <div className="flex justify-between border-b border-red-500/50 pb-1">
                  <span className="font-bold uppercase text-red-200 text-[9.5px]">Campo 03 • SERIAL NUMBER (S/N):</span>
                  <span className="font-mono font-bold">{tool.serial_number}</span>
                </div>
                <div className="flex justify-between border-b border-red-500/50 pb-1">
                  <span className="font-bold uppercase text-red-200 text-[9.5px]">Campo 04 • BASE OPERACIONAL:</span>
                  <span className="font-bold">Base {tool.nome_base || 'GRU'}</span>
                </div>
                <div className="flex justify-between border-b border-red-500/50 pb-1">
                  <span className="font-bold uppercase text-red-200 text-[9.5px]">Campo 05 • DATA SEGREGAÇÃO:</span>
                  <span className="font-mono font-bold">
                    {ultimaQuarentena?.data_segregacao || '18/01/2026'}
                  </span>
                </div>
                <div className="border-b border-red-500/50 pb-1">
                  <span className="font-bold uppercase text-red-200 text-[9.5px] block">Campo 06 • MOTIVO DA REJEIÇÃO:</span>
                  <span className="italic text-white text-[10px] block mt-0.5">
                    {ultimaQuarentena?.motivo ||
                      (tool.status_calibracao === 'VENCIDA'
                        ? 'Calibração periódica PME vencida (Bloqueio Automático Regra #2)'
                        : 'Segregação preventiva / Desvio padrão reprovado conforme BTI-PMP-05')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-red-500/50 pb-1">
                  <span className="font-bold uppercase text-red-200 text-[9.5px]">Campo 07 • STATUS RESOLUÇÃO:</span>
                  <span className="font-mono font-bold text-amber-200">
                    {ultimaQuarentena?.status_resolucao || 'RETIDO EM QUARENTENA'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold uppercase text-red-200 text-[9.5px]">Campo 08 • RESPONSÁVEL:</span>
                  <span className="font-semibold text-[9.5px]">
                    {ultimaQuarentena?.responsavel_nome || 'Inspetor da Garantia da Qualidade'}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center bg-black/50 p-2 rounded border border-white/40">
                <p className="text-[10px] font-black uppercase text-yellow-300 tracking-wider">
                  ATENÇÃO: PROIBIDO O USO EM AERONAVES OU COMPONENTES
                </p>
                <p className="text-[8px] text-slate-200 mt-0.5">
                  Conforme RBAC 145 / MOMQ MNT-001 Rev 08 • Violação sujeita a penalidade ANAC
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
