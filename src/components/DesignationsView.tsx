import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  Search,
  FileSignature,
  PlusCircle,
  Building,
  User,
  ShieldCheck,
  ShieldAlert,
  Printer,
} from 'lucide-react';
import { DesignacaoFuncoesF001_03, TecnicoComQualificacao } from '../types/mro';
import { OfficialFormHeader } from './OfficialFormHeader';
import { NaRuleNotice, EasaReleaseDeclaration } from './OfficialFormNotices';

interface DesignationsViewProps {
  designacoes: DesignacaoFuncoesF001_03[];
  tecnicos: TecnicoComQualificacao[];
  onAssinarRT: (id_designacao: number) => void;
  onOpenNovaDesignacao: (tecnico?: TecnicoComQualificacao) => void;
}

export const DesignationsView: React.FC<DesignationsViewProps> = ({
  designacoes,
  tecnicos,
  onAssinarRT,
  onOpenNovaDesignacao,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAssinatura, setFiltroAssinatura] = useState<'TODOS' | 'PENDENTE' | 'ASSINADO'>('TODOS');
  const [previewF00103, setPreviewF00103] = useState<DesignacaoFuncoesF001_03 | null>(null);

  const filtered = designacoes.filter((d) => {
    if (filtroAssinatura === 'PENDENTE' && d.assinado_por_rt) return false;
    if (filtroAssinatura === 'ASSINADO' && !d.assinado_por_rt) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        d.numero_f001_03.toLowerCase().includes(q) ||
        (d.tecnico_nome && d.tecnico_nome.toLowerCase().includes(q)) ||
        (d.tecnico_canac && d.tecnico_canac.toLowerCase().includes(q)) ||
        d.funcoes_autorizadas.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 font-mono font-bold text-xs bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded">
              FORMULÁRIO OFICIAL F 001-03
            </span>
            <span className="text-slate-400 text-xs font-mono">
              RBAC 145.163 / MOMQ MNT-001 (Rev 08)
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Designação de Funções e Escopo de Autorização Técnica
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Cada técnico ou inspetor deve possuir uma designação vigente devidamente assinada pelo Responsável Técnico (RT). O sistema bloqueia automaticamente qualquer ordem de serviço para designações pendentes.
          </p>
        </div>

        <button
          onClick={() => onOpenNovaDesignacao()}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-600/20 text-xs transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>+ Nova Designação F 001-03</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por formulário, técnico ou CANAC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFiltroAssinatura('TODOS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filtroAssinatura === 'TODOS'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({designacoes.length})
          </button>
          <button
            onClick={() => setFiltroAssinatura('PENDENTE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1 ${
              filtroAssinatura === 'PENDENTE'
                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pendentes Assinatura RT</span>
          </button>
          <button
            onClick={() => setFiltroAssinatura('ASSINADO')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1 ${
              filtroAssinatura === 'ASSINADO'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assinados RT</span>
          </button>
        </div>
      </div>

      {/* Grid of Designations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            Nenhuma designação encontrada com os filtros selecionados.
          </div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id_designacao}
              className={`p-5 rounded-xl border transition shadow-lg flex flex-col justify-between ${
                d.assinado_por_rt
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {d.numero_f001_03}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        d.status === 'ATIVO'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  {d.assinado_por_rt ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80">
                      <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" />
                      Assinado por RT
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-amber-400 bg-amber-950/70 border border-amber-800/80 animate-pulse">
                      <Clock className="w-3 h-3 mr-1 text-amber-400" />
                      Pendente Assinatura RT
                    </span>
                  )}
                </div>

                {/* Technician Info */}
                <div className="mt-3 flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 flex-shrink-0">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {d.tecnico_nome}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      CANAC: <strong className="text-cyan-400">{d.tecnico_canac}</strong>
                    </div>
                  </div>
                </div>

                {/* Scope of Authorization */}
                <div className="mt-3 p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Funções e Prerrogativas Técnicas Autorizadas:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {d.funcoes_autorizadas}
                  </p>
                </div>

                {/* Validity Dates */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px]">DATA DE EMISSÃO</span>
                    <span className="text-slate-300 font-semibold">{d.data_emissao}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">VÁLIDO ATÉ</span>
                    <span className="text-amber-400 font-semibold">{d.data_validade}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPreviewF00103(d)}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Visualizar Formulário</span>
                </button>

                {!d.assinado_por_rt && (
                  <button
                    onClick={() => onAssinarRT(d.id_designacao)}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-lg shadow-md transition flex items-center space-x-1"
                  >
                    <FileSignature className="w-3.5 h-3.5 text-slate-950" />
                    <span>Assinar como RT (Destravar)</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Visualizer Modal for F 001-03 */}
      {previewF00103 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:rounded-none">
            {/* Modal Top Bar (hidden in print) */}
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between print:hidden">
              <span className="text-xs font-mono font-bold text-amber-400">
                IMPACTO AVIATION • FORMULÁRIO OFICIAL F 001-03
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir A4 / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewF00103(null)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Printable Sheet Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 text-xs font-sans text-black bg-white print:p-0">
              <OfficialFormHeader
                codigoFormulario="FORM F 001-03"
                numeroRevisao="R08"
                dataRevisao="15/01/2026"
                tituloDocumento="FICHA DE DESIGNAÇÃO DE FUNÇÕES TÉCNICAS E AUTORIZAÇÕES"
                subtituloDocumento="TECHNICAL SCOPE & AUTHORIZATION DESIGNATION RECORD (RBAC 145.163 / MOMQ I 001-03 / EASA PART-145)"
                instrucaoMOMQ="INSTRUÇÃO DE TRABALHO I 001-03 • REGULAMENTAÇÃO TÉCNICA E AUDITORIA"
                numeroDocumento={`Nº: ${previewF00103.numero_f001_03}`}
                baseOperacional="GRU"
                paginaInfo="PÁG. 1 DE 1"
              />

              <NaRuleNotice />

              {/* Numbered Sections */}
              <div className="border border-black">
                <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
                  SEÇÃO I — DADOS CADASTRAIS DO TÉCNICO DESIGNADO
                </div>
                <div className="grid grid-cols-3 gap-0 text-[9.5px]">
                  <div className="border-r border-b border-black p-2 col-span-2">
                    <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 01 • Técnico Habilitado (Nome Completo):</span>
                    <span className="font-bold text-xs uppercase text-black">{previewF00103.tecnico_nome}</span>
                  </div>
                  <div className="border-b border-black p-2 bg-blue-50/40">
                    <span className="font-bold block text-[8px] text-blue-900 uppercase">Campo 02 • Código ANAC (CANAC):</span>
                    <span className="font-black text-xs font-mono text-blue-950">{previewF00103.tecnico_canac}</span>
                  </div>
                  <div className="border-r border-black p-2">
                    <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 03 • Data de Emissão:</span>
                    <span className="font-mono font-bold text-black">{previewF00103.data_emissao}</span>
                  </div>
                  <div className="border-r border-black p-2">
                    <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 04 • Data de Validade:</span>
                    <span className="font-mono font-bold text-black">{previewF00103.data_validade}</span>
                  </div>
                  <div className="p-2">
                    <span className="font-bold block text-[8px] text-slate-700 uppercase">Campo 05 • Status da Designação:</span>
                    <span className="font-black font-mono text-emerald-900 uppercase">{previewF00103.status}</span>
                  </div>
                </div>
              </div>

              {/* Scope of Authorization */}
              <div className="border border-black">
                <div className="bg-slate-200 px-2 py-1 font-bold text-[9.5px] border-b border-black uppercase font-mono">
                  SEÇÃO II — Campo 06 • PRERROGATIVAS, FUNÇÕES E ESCOPO TÉCNICO AUTORIZADO (MOMQ I 001-03)
                </div>
                <div className="p-3 text-[10px] space-y-2">
                  <div className="font-semibold text-black bg-slate-50 p-2.5 border border-slate-300 rounded font-mono leading-relaxed">
                    {previewF00103.funcoes_autorizadas}
                  </div>
                  <p className="text-[8px] text-slate-600 font-mono italic">
                    O profissional acima qualificado está formalmente autorizado pela Diretoria Técnica a exercer com exclusividade as funções descritas,
                    cumprindo com todas as obrigações e limitações do MOMQ MNT-001 e normas ANAC/EASA aplicáveis.
                  </p>
                </div>
              </div>

              {/* Release Declaration */}
              <EasaReleaseDeclaration dataAprovacao={previewF00103.data_emissao} />

              {/* Signatures */}
              <div className="border-2 border-black grid grid-cols-2 gap-0 text-[9.5px] page-break-avoid">
                {/* Campo 07: Técnico Designado */}
                <div className="p-3 border-r border-black flex flex-col justify-between h-28">
                  <div>
                    <span className="font-bold text-slate-800 uppercase text-[8.5px]">
                      Campo 07 • Ciência do Técnico Designado:
                    </span>
                    <span className="text-slate-600 block text-[7.5px]">Assunção de Responsabilidade Técnica • RBAC 65</span>
                  </div>
                  <div className="text-center font-mono my-1">
                    <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9.5px] font-bold">
                      {previewF00103.tecnico_nome}
                    </div>
                    <div className="font-bold text-[8.5px]">CANAC: {previewF00103.tecnico_canac}</div>
                  </div>
                  <div className="text-[7.5px] text-slate-600 text-center font-mono">
                    Assinatura do Profissional
                  </div>
                </div>

                {/* Campo 08: Responsável Técnico RT */}
                <div className="p-3 flex flex-col justify-between h-28 bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 uppercase text-[8.5px]">
                      Campo 08 • Homologação pelo Responsável Técnico (RT):
                    </span>
                    <span className="text-slate-600 block text-[7.5px]">Diretoria de Manutenção • COM 200607-05</span>
                  </div>
                  <div className="text-center font-mono my-1">
                    <div className="border-b border-dotted border-black pb-1 mb-1 italic text-[9.5px] font-bold">
                      Rodrigo Albuquerque da Silva
                    </div>
                    <div className="font-bold text-[8.5px]">CANAC: 114520 (RT Homologado ANAC)</div>
                  </div>
                  <div className="text-[7.5px] text-slate-600 text-center font-mono">
                    {previewF00103.assinado_por_rt ? (
                      <span className="text-emerald-900 font-bold">✓ Homologado & Assinado Digitalmente</span>
                    ) : (
                      <span className="text-amber-900 font-bold">Aguardando Assinatura Física/Digital</span>
                    )}
                  </div>
                </div>
              </div>

              {/* RT Action button inside modal if pending */}
              {!previewF00103.assinado_por_rt && (
                <div className="p-2.5 bg-amber-50 border border-amber-400 rounded flex items-center justify-between print:hidden">
                  <div className="flex items-center space-x-2 text-amber-950 text-xs">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Esta designação está pendente de assinatura do RT. Deseja homologar agora?</span>
                  </div>
                  <button
                    onClick={() => {
                      onAssinarRT(previewF00103.id_designacao);
                      setPreviewF00103({ ...previewF00103, assinado_por_rt: true });
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition"
                  >
                    Homologar & Assinar
                  </button>
                </div>
              )}

              {/* Sheet Footer */}
              <div className="mt-2 text-[7.5px] text-slate-600 font-mono flex justify-between border-t border-slate-300 pt-1">
                <span>IMPACTO AVIATION LTDA • FORM F 001-03 (Rev 08) • CONFORME RBAC 145.163</span>
                <span>REGISTRO OFICIAL DO DOSSIÊ TÉCNICO • PCP & QUALIDADE</span>
              </div>
            </div>

            {/* Bottom Modal Actions (hidden in print) */}
            <div className="p-3 bg-slate-100 border-t border-slate-300 flex justify-end print:hidden">
              <button
                onClick={() => setPreviewF00103(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
