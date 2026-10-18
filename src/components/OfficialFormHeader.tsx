import React from 'react';
import { Plane, ShieldCheck } from 'lucide-react';

export interface OfficialFormHeaderProps {
  codigoFormulario: string; // Ex: 'F 001-03-2', 'F 001-09-2', 'F 001-07', 'F 001-03', 'F 001-01-1'
  numeroRevisao?: string;   // Ex: 'R08', 'R02'
  dataRevisao?: string;     // Ex: '15/01/2026'
  tituloDocumento: string;  // Ex: 'FICHA DE CUMPRIMENTO DE DIRETRIZ DE AERONAVEGABILIDADE (FCDA)'
  subtituloDocumento?: string; // Ex: 'AIRWORTHINESS DIRECTIVE & SERVICE BULLETIN COMPLIANCE RECORD'
  instrucaoMOMQ?: string;   // Ex: 'INSTRUÇÃO SUPLEMENTAR I 001-03 • MOMQ MNT-001'
  numeroDocumento?: string; // Ex: 'FCDA-2026-0814', 'OS-2026-0045'
  baseOperacional?: 'GRU' | 'CNF' | 'VCP' | string;
  paginaInfo?: string;      // Ex: 'PÁGINA 1 DE 1'
}

export const OfficialFormHeader: React.FC<OfficialFormHeaderProps> = ({
  codigoFormulario,
  numeroRevisao = 'R08',
  dataRevisao = '15/01/2026',
  tituloDocumento,
  subtituloDocumento,
  instrucaoMOMQ = 'PROCEDIMENTO DO MANUAL DA ORGANIZAÇÃO DE MANUTENÇÃO (MOMQ)',
  numeroDocumento,
  baseOperacional = 'GRU',
  paginaInfo = 'PÁG. 1 DE 1',
}) => {
  // Endereços oficiais padronizados das bases da Impacto Aviation
  const getEnderecoBase = (base: string) => {
    const b = (base || '').toUpperCase();
    if (b.includes('CNF') || b.includes('CONFINS')) {
      return 'Base Operacional CNF: Hangar Impacto Aviation, Aeroporto Int. de Confins - Tancredo Neves, Rod. LMG-800 km 7,9, Confins/MG - CEP 33500-000';
    }
    if (b.includes('VCP') || b.includes('VIRACOPOS') || b.includes('CAMPINAS')) {
      return 'Base Operacional VCP: Hangar Impacto Aviation, Aeroporto Int. de Viracopos, Rod. Santos Dumont km 66, Campinas/SP - CEP 13055-900';
    }
    return 'Base Principal GRU: Hangar Impacto Aviation, Aeroporto Int. de Guarulhos - Rod. Hélio Smidt s/nº, Guarulhos/SP - CEP 07190-100';
  };

  return (
    <header className="border-2 border-black bg-white text-black font-sans mb-3 text-left print:border-black">
      {/* Top Bar: Logo, Legal Company Name, Regulatory Approvals and Form Code Box */}
      <div className="grid grid-cols-12 border-b-2 border-black">
        {/* Logo and Identity */}
        <div className="col-span-8 sm:col-span-9 p-2.5 flex items-center space-x-3 border-r-2 border-black">
          {/* Logo Badge */}
          <div className="w-14 h-14 bg-slate-950 text-white rounded flex flex-col items-center justify-center p-1 shrink-0 border border-black shadow-sm">
            <div className="flex items-center space-x-0.5">
              <Plane className="w-6 h-6 text-amber-400 transform -rotate-45" />
            </div>
            <span className="text-[7px] font-black tracking-widest text-amber-400 font-mono mt-0.5 uppercase">
              IMPACTO
            </span>
          </div>

          {/* Legal Identity and Certificates */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight uppercase text-black font-mono leading-none">
                IMPACTO AVIATION
              </h1>
              <span className="text-[8px] font-bold bg-black text-white px-1.5 py-0.5 rounded font-mono">
                MRO
              </span>
            </div>

            <div className="text-[9.5px] font-bold text-slate-900 uppercase tracking-tight mt-0.5 font-sans leading-tight">
              IMPACTO Manutenção, Pintura, Conservação de Aeronaves e Serviços Auxiliares Ltda.
            </div>

            {/* Certifications Row */}
            <div className="flex flex-wrap items-center gap-x-2 text-[8.5px] font-mono text-slate-800 mt-0.5 font-bold">
              <span className="text-blue-900">COM ANAC Nº: 200607-05</span>
              <span>•</span>
              <span className="text-emerald-900">CERTIFICADO EASA.145.1003</span>
              <span>•</span>
              <span className="text-slate-600">FAA EQUIVALENT ACCEPTED</span>
            </div>

            {/* Base Address */}
            <div className="text-[7.5px] text-slate-600 font-sans truncate mt-0.5">
              {getEnderecoBase(baseOperacional)}
            </div>
          </div>
        </div>

        {/* Form Control Box in Top Right Corner */}
        <div className="col-span-4 sm:col-span-3 p-1.5 flex flex-col justify-between bg-slate-50 font-mono text-[9px] text-right">
          <div>
            <div className="text-[11px] font-black uppercase text-black bg-white px-1.5 py-0.5 border border-black text-center mb-1 shadow-xs tracking-wider">
              {codigoFormulario}
            </div>
            <div className="text-[8.5px] text-slate-700 leading-tight">
              <div><strong className="text-black">REVISÃO:</strong> {numeroRevisao}</div>
              <div><strong className="text-black">DATA:</strong> {dataRevisao}</div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-0.5 mt-1 text-[8px] text-slate-600 flex justify-between font-mono">
            <span>{paginaInfo}</span>
            {numeroDocumento && (
              <span className="font-bold text-blue-900 truncate ml-1">
                {numeroDocumento}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title Banner */}
      <div className="text-center py-1.5 px-2 bg-slate-100 border-b border-black">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black font-sans">
          {tituloDocumento}
        </h2>
        {subtituloDocumento && (
          <p className="text-[8.5px] font-bold uppercase font-mono text-slate-700 mt-0.5">
            {subtituloDocumento}
          </p>
        )}
        <div className="text-[7.5px] font-mono text-slate-600 mt-0.5">
          {instrucaoMOMQ}
        </div>
      </div>
    </header>
  );
};
