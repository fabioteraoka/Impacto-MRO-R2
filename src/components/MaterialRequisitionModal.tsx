import React from 'react';
import { Printer, X, PackageCheck, AlertOctagon, CheckCircle2, ShieldCheck } from 'lucide-react';
import { OfficialFormHeader } from './OfficialFormHeader';
import { NaRuleNotice, EasaReleaseDeclaration } from './OfficialFormNotices';

export interface MaterialRequisitionData {
  numero_requisicao: string;
  numero_os: string;
  matricula_aeronave: string;
  base_solicitante: string;
  data_requisicao: string;
  hora_requisicao: string;
  descricao_item: string;
  part_number: string;
  part_number_alternativo: string;
  quantidade: string;
  condicao_peca: 'NOVO' | 'OVERHAULED' | 'REPARADO' | 'SERVICAVEL';
  documento_rastreabilidade: string;
  numero_documento_rastreabilidade: string;
  serial_number: string;
  numero_lote: string;
  data_fabricacao: string;
  validade_shelf_life: string;
  inspecao_recebimento_conforme: boolean;
  parecer_qualidade: 'APROVADO_APLICACAO' | 'REJEITADO_QUARENTENA';
  mecanico_requisitante_nome: string;
  mecanico_requisitante_canac: string;
  inspetor_recebimento_nome: string;
  inspetor_recebimento_canac: string;
  almoxarife_nome: string;
}

interface MaterialRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition?: MaterialRequisitionData;
}

export const MaterialRequisitionModal: React.FC<MaterialRequisitionModalProps> = ({
  isOpen,
  onClose,
  requisition,
}) => {
  if (!isOpen) return null;

  const req: MaterialRequisitionData = requisition || {
    numero_requisicao: 'REQ-2026-0142',
    numero_os: 'OS-2026-0084',
    matricula_aeronave: 'PR-IMA',
    base_solicitante: 'GRU',
    data_requisicao: '22/01/2026',
    hora_requisicao: '09:15 UTC',
    descricao_item: 'PRESSURE TRANSMITTER, HYDRAULIC SYSTEM (TRANSMISSOR DE PRESSÃO HIDRÁULICA)',
    part_number: '32-1104-01',
    part_number_alternativo: '32-1104-01B (CONFORME ATR 72 IPC JASC 32-30)',
    quantidade: '01 UNIDADE',
    condicao_peca: 'NOVO',
    documento_rastreabilidade: 'EASA FORM 1 (AUTHORIZED RELEASE CERTIFICATE)',
    numero_documento_rastreabilidade: 'EASA.145.5412-2025-09881',
    serial_number: 'HD-99214',
    numero_lote: 'LOT-2025/11',
    data_fabricacao: '10/11/2025',
    validade_shelf_life: 'N/A (ITEM NÃO PERECÍVEL)',
    inspecao_recebimento_conforme: true,
    parecer_qualidade: 'APROVADO_APLICACAO',
    mecanico_requisitante_nome: 'Marcos Vinicius Santos',
    mecanico_requisitante_canac: '114522',
    inspetor_recebimento_nome: 'Juliana Costa e Silva',
    inspetor_recebimento_canac: '114521',
    almoxarife_nome: 'Carlos Eduardo Vieira (Almoxarifado GRU)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full">
        {/* Modal Controls (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-b border-slate-700 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
              Requisição e Recebimento de Materiais • Form F 001-01-1 (I 001-05 / RBAC 145)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition"
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
            codigoFormulario="FORM F 001-01-1"
            numeroRevisao="R08"
            dataRevisao="15/01/2026"
            tituloDocumento="REQUISIÇÃO E RECEBIMENTO DE MATERIAIS AERONÁUTICOS (FORM F 001-01-1)"
            subtituloDocumento="AERONAUTICAL MATERIAL REQUISITION & RECEIVING INSPECTION RECORD (RBAC 145.109 / MOMQ I 001-05)"
            instrucaoMOMQ="INSTRUÇÃO DE SUPRIMENTOS E QUALIDADE I 001-05 • RASTREABILIDADE 100%"
            numeroDocumento={req.numero_requisicao}
            baseOperacional={req.base_solicitante}
            paginaInfo="PÁG. 1 DE 1"
          />

          {/* Mandatory N/A Regulatory Notice */}
          <NaRuleNotice />

          {/* SEÇÃO I: IDENTIFICAÇÃO DA REQUISIÇÃO E DA AERONAVE (Campos 01 a 05) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono flex justify-between">
              <span>SEÇÃO I — IDENTIFICAÇÃO DA REQUISIÇÃO (I 001-05)</span>
              <span>Nº REQ: <strong>{req.numero_requisicao}</strong></span>
            </div>
            <div className="grid grid-cols-4 gap-0 text-[9px]">
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 01 • Nº Requisição:</span>
                <span className="font-black font-mono text-blue-950 text-xs">{req.numero_requisicao}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 02 • Nº OS Vinculada:</span>
                <span className="font-bold font-mono text-black">{req.numero_os}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 03 • Matrícula (Reg.):</span>
                <span className="font-black text-xs font-mono">{req.matricula_aeronave}</span>
              </div>
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 04 • Base Solicitante:</span>
                <span className="font-bold font-mono">Base {req.base_solicitante}</span>
              </div>

              <div className="border-black p-1.5 col-span-4 bg-slate-50 flex justify-between">
                <div>
                  <span className="font-bold text-[7.5px] text-slate-700 uppercase">Campo 05 • Data e Hora da Requisição: </span>
                  <span className="font-mono font-bold text-black">{req.data_requisicao} às {req.hora_requisicao}</span>
                </div>
                <div className="text-[8px] font-mono text-blue-900 font-bold">
                  APROVAÇÃO COM ANAC 200607-05 / EASA.145.1003
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO II: ESPECIFICAÇÃO DO MATERIAL OU COMPONENTE (Campos 06 a 13) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
              SEÇÃO II — DADOS TÉCNICOS DO MATERIAL E RASTREABILIDADE (I 001-05)
            </div>
            <div className="grid grid-cols-4 gap-0 text-[9px]">
              <div className="border-r border-b border-black p-1.5 col-span-2">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 06 • Descrição / Nomenclatura Aeronáutica:</span>
                <span className="font-bold uppercase text-black">{req.descricao_item}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 07 • Part Number (P/N):</span>
                <span className="font-black font-mono text-blue-950 text-xs">{req.part_number}</span>
              </div>
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 08 • P/N Alternativo (IPC):</span>
                <span className="font-mono font-semibold">{req.part_number_alternativo}</span>
              </div>

              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 09 • Quantidade:</span>
                <span className="font-mono font-black">{req.quantidade}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 10 • Condição Requerida:</span>
                <span className="font-black text-emerald-900 uppercase">{req.condicao_peca}</span>
              </div>
              <div className="border-r border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 11 • Serial Number (S/N):</span>
                <span className="font-mono font-bold">{req.serial_number}</span>
              </div>
              <div className="border-b border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 12 • Lote (Batch/Lot):</span>
                <span className="font-mono font-bold">{req.numero_lote}</span>
              </div>

              <div className="border-r border-black p-1.5 col-span-2">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Campo 13 • Documento de Rastreabilidade Anexo:</span>
                <span className="font-mono font-bold text-black">{req.documento_rastreabilidade} nº {req.numero_documento_rastreabilidade}</span>
              </div>
              <div className="border-r border-black p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Data de Fabricação:</span>
                <span className="font-mono">{req.data_fabricacao}</span>
              </div>
              <div className="p-1.5">
                <span className="font-bold block text-[7.5px] text-slate-700 uppercase">Validade Shelf Life:</span>
                <span className="font-mono">{req.validade_shelf_life}</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO III: INSPEÇÃO FÍSICA E TÉCNICA DE RECEBIMENTO (Campos 14 e 15) */}
          <div className="border border-black mb-2.5">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono flex justify-between">
              <span>SEÇÃO III — INSPEÇÃO TÉCNICA DE RECEBIMENTO NO ALMOXARIFADO</span>
              <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded ${
                req.parecer_qualidade === 'APROVADO_APLICACAO' ? 'bg-emerald-800 text-white' : 'bg-rose-800 text-white'
              }`}>
                {req.parecer_qualidade === 'APROVADO_APLICACAO' ? 'MATERIAL APROVADO' : 'REJEITADO (QUARENTENA)'}
              </span>
            </div>
            <div className="p-2 space-y-1.5 text-[9px]">
              <div className="grid grid-cols-3 gap-2 border-b border-slate-300 pb-1.5">
                <label className="flex items-center space-x-1.5">
                  <input type="checkbox" checked={req.inspecao_recebimento_conforme} readOnly className="accent-black" />
                  <span className="font-bold">Embalagem íntegra e lacrada de fábrica</span>
                </label>
                <label className="flex items-center space-x-1.5">
                  <input type="checkbox" checked={req.inspecao_recebimento_conforme} readOnly className="accent-black" />
                  <span className="font-bold">Rastreabilidade 100% comprovada por ARC</span>
                </label>
                <label className="flex items-center space-x-1.5">
                  <input type="checkbox" checked={req.inspecao_recebimento_conforme} readOnly className="accent-black" />
                  <span className="font-bold">Ausência total de corrosão ou danos físicos</span>
                </label>
              </div>

              <div>
                <span className="font-bold text-[7.5px] text-slate-700 uppercase block">
                  Campo 15 • Parecer Conclusivo da Inspeção de Recebimento:
                </span>
                <p className="font-mono text-black bg-slate-50 p-1.5 border border-slate-300 rounded mt-0.5 text-[8.5px]">
                  Material aeronáutico inspecionado fisicamente e documentalmente de acordo com a Instrução I 001-05 e RBAC 145.
                  Certificado de liberação {req.documento_rastreabilidade} autenticado. APROVADO PARA INSTALAÇÃO NA AERONAVE {req.matricula_aeronave}.
                </p>
              </div>
            </div>
          </div>

          {/* EASA Part-145 Release Declaration */}
          <EasaReleaseDeclaration dataAprovacao={req.data_requisicao} />

          {/* SEÇÃO IV: ASSINATURAS E CARIMBOS (Campos 16 a 18) */}
          <div className="border-2 border-black grid grid-cols-3 gap-0 text-[8.5px] page-break-avoid">
            {/* Campo 16: Mecânico Requisitante */}
            <div className="border-r border-black p-2 flex flex-col justify-between h-28">
              <div>
                <span className="font-bold block text-black uppercase text-[8px]">Campo 16 • Mecânico Requisitante</span>
                <span className="text-slate-600 block text-[7px]">Execução Técnica • RBAC 65</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] font-bold">
                  {req.mecanico_requisitante_nome}
                </div>
                <div className="font-bold text-[8px]">CANAC: {req.mecanico_requisitante_canac}</div>
              </div>
              <div className="text-[7px] text-slate-600 text-center font-mono">
                Data: {req.data_requisicao}
              </div>
            </div>

            {/* Campo 17: Inspetor de Recebimento */}
            <div className="border-r border-black p-2 flex flex-col justify-between h-28 bg-blue-50/20">
              <div>
                <span className="font-bold block text-blue-950 uppercase text-[8px]">Campo 17 • Inspetor de Recebimento</span>
                <span className="text-blue-900 block text-[7px]">Controle de Qualidade • RBAC 145.109</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9px] text-blue-950 font-bold">
                  {req.inspetor_recebimento_nome}
                </div>
                <div className="font-bold text-[8px] text-blue-950">CANAC: {req.inspetor_recebimento_canac} (APRS)</div>
              </div>
              <div className="text-[7px] text-blue-900 text-center font-bold">
                Inspeção de Entrada Conforme
              </div>
            </div>

            {/* Campo 18: Almoxarifado */}
            <div className="p-2 flex flex-col justify-between h-28">
              <div>
                <span className="font-bold block text-black uppercase text-[8px]">Campo 18 • Almoxarifado / Suprimentos</span>
                <span className="text-slate-600 block text-[7px]">Baixa de Estoque e Entrega Física</span>
              </div>
              <div className="text-center font-mono my-1">
                <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[8.5px]">
                  {req.almoxarife_nome}
                </div>
                <div className="font-bold text-[7.5px] text-slate-600">Almoxarifado Central Impacto</div>
              </div>
              <div className="text-[7px] text-slate-600 text-center font-mono">
                Arquivo Suprimentos & PCP
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-2 text-[7px] text-slate-600 font-mono flex justify-between border-t border-slate-300 pt-1">
            <span>IMPACTO AVIATION LTDA • FORM F 001-01-1 (Rev 08) • CONFORME RBAC 145 & MOMQ I 001-05</span>
            <span>SISTEMA MRO HOMOLOGADO ANAC / EASA • RASTREABILIDADE INTEGRAL DE MATERIAIS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
