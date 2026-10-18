import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  X,
  Plane,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { OrdemServicoF001_09_2, LiberacaoRTS } from '../types/mro';
import { OfficialFormHeader } from './OfficialFormHeader';

interface LtaPrintModalProps {
  os: OrdemServicoF001_09_2;
  rts?: LiberacaoRTS;
  onClose: () => void;
}

export const LtaPrintModal: React.FC<LtaPrintModalProps> = ({
  os,
  rts,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [ltaData, setLtaData] = useState<{ texto: string; codigo: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    carregarLTA();
  }, [os.id_os, rts?.id_rts]);

  const carregarLTA = async () => {
    try {
      setLoading(true);
      const url = rts
        ? `/api/qualidade/lta/${os.id_os}?id_rts=${rts.id_rts}`
        : `/api/qualidade/lta/${os.id_os}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setLtaData(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar anotação LTA:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (ltaData?.texto) {
      navigator.clipboard.writeText(ltaData.texto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:bg-white print:m-0 print:p-0 print:max-w-none">
        
        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Anotação Oficial para o Livro Técnico da Aeronave (LTA)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  RBAC 43.9 / EASA.145
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aeronave: <strong className="text-white font-mono">{os.campo_02_matricula} ({os.campo_03_modelo})</strong> • OS:{' '}
                <strong className="text-white font-mono">{os.numero_os}</strong> • RTS:{' '}
                <strong className="text-white font-mono">{rts?.numero_rts || 'RTS Oficial'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Copiar texto para colar em Caderneta de Voo ou Software de CTM"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Imprimir folha de bordo LTA"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Imprimir Folha LTA</span>
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
        <div className="p-6 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-2 bg-slate-900/50 print:bg-white text-slate-100 print:text-black">
          
          {/* Header Oficial para Impressão */}
          <div className="hidden print:block mb-4">
            <OfficialFormHeader
              codigoFormulario="F 001-09-2"
              numeroRevisao="R08"
              dataRevisao="15/01/2026"
              tituloDocumento="ANOTAÇÃO OFICIAL PARA CADERNETA / LIVRO TÉCNICO DA AERONAVE (LTA)"
              subtituloDocumento="AIRCRAFT TECHNICAL LOGBOOK (ATL) OFFICIAL MAINTENANCE RELEASE RECORD"
              instrucaoMOMQ="PROCEDIMENTO MOMQ 5.7.1 • REGISTRO DE RETORNO AO SERVIÇO (RBAC 43.9 / EASA PART-145)"
              numeroDocumento={ltaData?.codigo || `LTA-${os.numero_os}`}
              baseOperacional={os.campo_06_base_executante}
              paginaInfo="PÁG. 1 DE 1"
            />
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-3" />
              <p className="text-xs text-cyan-300 font-mono">Gerando texto regulatório padronizado para o LTA...</p>
            </div>
          ) : ltaData ? (
            <div className="space-y-4">
              
              {/* Etiqueta / Quadro Formatado de Transcrição */}
              <div className="p-4 rounded-xl bg-slate-950 print:bg-white border-2 border-slate-700 print:border-black font-mono text-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 print:border-black">
                  <div className="flex items-center space-x-2">
                    <Plane className="w-4 h-4 text-amber-400 print:text-black" />
                    <span className="font-black text-white print:text-black uppercase">
                      IMPACTO AVIATION MRO (COM 200607-05 / EASA.145.1003)
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 print:text-black font-bold">
                    CÓDIGO: {ltaData.codigo}
                  </span>
                </div>

                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-200 print:text-black select-all">
                  {ltaData.texto}
                </pre>
              </div>

              {/* Instruções de Uso na Caderneta de Voo */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:hidden text-xs text-slate-300 space-y-1">
                <h4 className="font-bold text-cyan-300 font-mono uppercase text-[11px]">
                  Instruções para Transcrição / Inserção no Livro de Bordo (MOMQ 5.7.1):
                </h4>
                <p className="text-[11px] text-slate-400">
                  1. O texto acima consolida a totalidade dos serviços executados na OS {os.numero_os}, referenciando os dados técnicos homologados e as licenças dos aprovadores.
                </p>
                <p className="text-[11px] text-slate-400">
                  2. A via original deve ser assinada e carimbada pelo Inspetor APRS e Diretor Técnico (RT), sendo rubricada pelo Comandante da aeronave na entrega técnica.
                </p>
                <p className="text-[11px] text-slate-400">
                  3. Uma cópia deste registro é arquivada pelo prazo regulatório de 5 anos (ANAC) e 3 anos (EASA) no Módulo de Arquivo Técnico.
                </p>
              </div>

            </div>
          ) : null}

        </div>

        {/* Action Footer - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Fechar
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Texto Copiado com Sucesso!' : 'Copiar Texto para Caderneta'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
