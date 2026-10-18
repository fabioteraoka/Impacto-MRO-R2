import React from 'react';
import { Printer, X, ShieldCheck, Clock, Users, Wrench, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { OfficialFormHeader } from './OfficialFormHeader';
import { FodPreventionNotice, NaRuleNotice } from './OfficialFormNotices';
import { PassagemTurnoF001_24 } from '../types/mro';

interface ShiftHandoverPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  passagem: PassagemTurnoF001_24;
}

export const ShiftHandoverPrintModal: React.FC<ShiftHandoverPrintModalProps> = ({
  isOpen,
  onClose,
  passagem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full">
        {/* Controls (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-b border-slate-700 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
              Ficha de Passagem de Serviço Oficial • Form F 001-24 (I 001-14 / RBAC 145)
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

        {/* Printable Document A4 Container */}
        <div className="p-4 sm:p-6 bg-white text-black font-sans text-xs print:p-0 print:text-[9.5px] leading-tight max-w-[210mm] mx-auto">
          {/* Header Oficial */}
          <OfficialFormHeader
            codigoFormulario="FORM F 001-24"
            numeroRevisao="R08"
            dataRevisao="15/01/2026"
            tituloDocumento="FICHA DE PASSAGEM DE SERVIÇO DE MANUTENÇÃO (HANDOVER)"
            subtituloDocumento="MAINTENANCE SHIFT HANDOVER RECORD (RBAC 145.109 / MOMQ I 001-14 / EASA PART-145)"
            instrucaoMOMQ="INSTRUÇÃO DE TRABALHO I 001-14 • CONTROLE DE CONTINUIDADE TÉCNICA"
            numeroDocumento={passagem.numero_passagem}
            baseOperacional={passagem.base_operacional}
            paginaInfo="PÁG. 1 DE 1"
          />

          <NaRuleNotice />

          {/* SEÇÃO I: IDENTIFICAÇÃO DO TURNO E DA AERONAVE */}
          <div className="border border-black mb-3">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono flex justify-between">
              <span>SEÇÃO I — IDENTIFICAÇÃO OPERACIONAL E TRANSIÇÃO DE TURNO</span>
              <span>I 001-14</span>
            </div>
            <div className="grid grid-cols-4 gap-0 text-[9px] divide-x divide-black">
              <div className="p-2">
                <span className="font-bold block uppercase text-slate-600 text-[8px]">Ordem de Serviço (OS):</span>
                <span className="font-mono font-black text-sm text-blue-900">{passagem.numero_os}</span>
              </div>
              <div className="p-2">
                <span className="font-bold block uppercase text-slate-600 text-[8px]">Aeronave & Modelo:</span>
                <span className="font-mono font-bold text-black">{passagem.matricula_aeronave}</span>
                <span className="block text-[8px] text-slate-600">{passagem.modelo_aeronave}</span>
              </div>
              <div className="p-2">
                <span className="font-bold block uppercase text-slate-600 text-[8px]">Transição de Turno:</span>
                <span className="font-mono font-bold text-black">
                  {passagem.turno_saindo} ➔ {passagem.turno_entrando}
                </span>
                <span className="block text-[8px] text-slate-600">Base {passagem.base_operacional}</span>
              </div>
              <div className="p-2">
                <span className="font-bold block uppercase text-slate-600 text-[8px]">Data e Hora da Passagem:</span>
                <span className="font-mono font-bold text-black">{passagem.data_passagem}</span>
                <span className="block text-[8px] text-slate-600 font-mono">{passagem.hora_passagem}</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO II: STATUS CIRCUNSTANCIADO DOS TRABALHOS */}
          <div className="border border-black mb-3">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO II — CIRCUNSTÂNCIA GERAL E ANDAMENTO DOS SERVIÇOS
            </div>
            <div className="p-2.5 text-[9px] font-mono bg-slate-50 space-y-2">
              <div>
                <strong className="block text-black uppercase text-[8px]">Descrição das Atividades do Turno Anterior:</strong>
                <p className="mt-0.5 text-slate-900">{passagem.status_geral_trabalhos}</p>
              </div>
              <div className="border-t border-slate-300 pt-1.5">
                <strong className="block text-black uppercase text-[8px]">Tarefas Concluídas:</strong>
                <p className="mt-0.5 text-slate-900">{passagem.tarefas_concluidas_resumo}</p>
              </div>
            </div>
          </div>

          {/* SEÇÃO III: TAREFAS PENDENTES E ALERTAS DE RIs */}
          <div className="border border-black mb-3">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono flex justify-between">
              <span>SEÇÃO III — PENDÊNCIAS TÉCNICAS E RELATÓRIOS DE INSPEÇÃO (RI)</span>
              <span className="text-rose-700 font-bold">ATENÇÃO CRÍTICA</span>
            </div>
            <div className="p-2.5 text-[9px] space-y-2 font-mono">
              <div className="bg-amber-50/80 p-2 border border-amber-300 rounded">
                <strong className="block text-amber-900 uppercase text-[8.5px]">Tarefas em Andamento para o Próximo Turno:</strong>
                <p className="mt-0.5 text-slate-900">{passagem.tarefas_pendentes_detalhes}</p>
              </div>
              <div className="bg-rose-50/80 p-2 border border-rose-300 rounded">
                <strong className="block text-rose-900 uppercase text-[8.5px]">Status de Relatórios de Inspeção (RI / Form F 001-12):</strong>
                <p className="mt-0.5 text-rose-950 font-bold">{passagem.ris_em_aberto_alerta}</p>
              </div>
            </div>
          </div>

          {/* SEÇÃO IV: CONTROLE DE FERRAMENTAL RETIDO E PEÇAS (PREVENÇÃO FOD) */}
          <div className="border border-black mb-3">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO IV — FERRAMENTAL EM USO NA AERONAVE / BANCADA E SUPRIMENTOS
            </div>
            <div className="grid grid-cols-2 gap-0 divide-x divide-black text-[9px] font-mono">
              <div className="p-2.5 bg-slate-50">
                <strong className="block text-black uppercase text-[8px]">Ferramentas PME / Manuais Retidos:</strong>
                <p className="mt-1 text-slate-900">{passagem.ferramentas_retidas_aeronave_bancada}</p>
              </div>
              <div className="p-2.5 bg-slate-50">
                <strong className="block text-black uppercase text-[8px]">Peças / Materiais Pendentes de Almoxarifado:</strong>
                <p className="mt-1 text-slate-900">{passagem.pecas_pendentes_suprimentos}</p>
              </div>
            </div>
          </div>

          {/* AVISO MANDATÓRIO DE PREVENÇÃO FOD */}
          <FodPreventionNotice />

          {/* SEÇÃO V: ASSINATURAS DE PASSAGEM E RECEBIMENTO */}
          <div className="border-2 border-black grid grid-cols-2 gap-0 text-[8.5px] page-break-avoid">
            {/* Técnico que Entrega */}
            <div className="border-r border-black p-3 flex flex-col justify-between h-28">
              <div>
                <span className="font-bold block text-black uppercase text-[8px]">Técnico Responsável Saindo (Entrega do Turno)</span>
                <span className="text-slate-600 block text-[7px]">Turno {passagem.turno_saindo} • RBAC 145 / I 001-14</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] font-bold">
                  {passagem.tecnico_saindo_nome}
                </div>
                <div className="font-bold text-[8px]">CANAC: {passagem.tecnico_saindo_canac} • Rubrica: {passagem.rubrica_tecnico_saindo}</div>
              </div>
              <div className="text-[7px] text-slate-600 text-center font-mono">
                Data/Hora: {passagem.data_passagem} {passagem.hora_passagem}
              </div>
            </div>

            {/* Técnico que Assume */}
            <div className="p-3 flex flex-col justify-between h-28 bg-blue-50/20">
              <div>
                <span className="font-bold block text-blue-950 uppercase text-[8px]">Técnico Responsável Entrando (Recebimento do Turno)</span>
                <span className="text-blue-900 block text-[7px]">Turno {passagem.turno_entrando} • Assunção de Continuidade</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] text-blue-950 font-bold">
                  {passagem.tecnico_entrando_nome}
                </div>
                <div className="font-bold text-[8px] text-blue-950">CANAC: {passagem.tecnico_entrando_canac} • Rubrica: {passagem.rubrica_tecnico_entrando}</div>
              </div>
              <div className="text-[7px] text-blue-900 text-center font-mono">
                Ciência Formal do Status de Aeronavegabilidade
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-2 text-[7px] text-slate-600 font-mono flex justify-between border-t border-slate-300 pt-1">
            <span>IMPACTO AVIATION LTDA • FORM F 001-24 (Rev 08) • CONFORME MOMQ I 001-14 & RBAC 145</span>
            <span>AUTENTICIDADE COMPROVADA VIA MRO SUITE • ARQUIVO PCP / HANGAR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
