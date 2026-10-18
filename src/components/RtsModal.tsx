import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
  Award,
  Send,
  Printer,
  Copy,
  Check,
  Plane,
  Building,
  UserCheck,
  Lock,
} from 'lucide-react';
import {
  OrdemServicoF001_09_2,
  PessoalTecnico,
  TipoDeclaracaoRelease,
  LiberacaoRTS,
} from '../types/mro';
import { OfficialFormHeader } from './OfficialFormHeader';
import { OfficialFormNotices } from './OfficialFormNotices';

interface RtsModalProps {
  os: OrdemServicoF001_09_2;
  tecnicos: PessoalTecnico[];
  onClose: () => void;
  onSuccess: (rts: LiberacaoRTS) => void;
}

export const RtsModal: React.FC<RtsModalProps> = ({
  os,
  tecnicos,
  onClose,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiedLta, setCopiedLta] = useState<boolean>(false);

  // Form State
  const defaultAprs =
    tecnicos.find((t) => t.id_tecnico === os.id_inspetor_aprs) ||
    tecnicos.find((t) => t.cargo === 'Inspetor' || t.cargo === 'Inspetor Chefe') ||
    tecnicos[0];

  const defaultRt =
    tecnicos.find((t) => t.id_tecnico === os.id_rt) ||
    tecnicos.find((t) => t.cargo === 'RT') ||
    tecnicos[0];

  const [idInspetorAprs, setIdInspetorAprs] = useState<number>(defaultAprs ? defaultAprs.id_tecnico : 4);
  const [idRt, setIdRt] = useState<number>(defaultRt ? defaultRt.id_tecnico : 1);
  const [tipoDeclaracao, setTipoDeclaracao] = useState<TipoDeclaracaoRelease>(
    os.declaracao_easa_part145_aplicada ? 'DUAL_RELEASE_ANAC_EASA' : 'ANAC_RBAC_43_9'
  );
  const [observacoesLimitacoes, setObservacoesLimitacoes] = useState<string>(
    'Aeronave liberada sem limitações operacionais. Apta para voo comercial.'
  );
  const [protocoloCliente, setProtocoloCliente] = useState<string>(
    `${os.campo_05_operador.slice(0, 5).toUpperCase()}-ENTREGA-TECNICA-${os.campo_02_matricula}`
  );
  const [recebedorPcp, setRecebedorPcp] = useState<string>(
    `PCP Central Impacto - Protocolo PCP-2026-${os.numero_os.replace('OS-', '')}`
  );

  // Textos oficiais regulatórios
  const textoAnac = `Certifica-se que os serviços descritos na ${os.numero_os} foram executados de acordo com os regulamentos vigentes da ANAC (RBAC 145 / RBAC 43) e os dados técnicos aprovados pelo fabricante. Em respeito aos trabalhos especificados, a aeronave é considerada APROVADA PARA RETORNO AO SERVIÇO (RTS).`;
  const textoEasa =
    'Certifies that the work specified, except as otherwise specified, was carried out in accordance with EASA Part145 and in respect that work the aircraft is considered ready for release to service.';

  const handleEmitirRTS = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);

    try {
      const payload = {
        id_os: os.id_os,
        id_inspetor_aprs: Number(idInspetorAprs),
        id_rt: Number(idRt),
        tipo_declaracao: tipoDeclaracao,
        observacoes_limitacoes: observacoesLimitacoes,
        via_1_recebedor: recebedorPcp,
        protocolo_cliente: protocoloCliente,
      };

      const res = await fetch('/api/qualidade/rts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao emitir RTS');
      }

      onSuccess(data.data.rts);
    } catch (err: any) {
      setErro(err.message || 'Erro ao homologar retorno ao serviço');
    } finally {
      setSubmitting(false);
    }
  };

  const inspetorSelecionado = tecnicos.find((t) => t.id_tecnico === Number(idInspetorAprs));
  const rtSelecionado = tecnicos.find((t) => t.id_tecnico === Number(idRt));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Aprovação para Retorno ao Serviço (RTS) & Declaração Dual Release
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Homologação Final da OS <strong className="text-white font-mono">{os.numero_os}</strong> • Aeronave:{' '}
                <strong className="text-white font-mono">{os.campo_02_matricula} ({os.campo_03_modelo})</strong> • MOMQ 5.7.1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleEmitirRTS}>
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs text-slate-200">
            
            {erro && (
              <div className="p-4 rounded-xl bg-red-950/60 border-2 border-red-600 text-red-100 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm font-mono uppercase text-red-400">Bloqueio Regulatória de Emissão RTS</h4>
                  <p className="text-xs whitespace-pre-line mt-1">{erro}</p>
                </div>
              </div>
            )}

            {/* Banner de Aeronave e Escopo */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Aeronave</span>
                  <span className="font-bold text-white text-sm">{os.campo_02_matricula}</span>
                  <span className="text-[10px] text-slate-400 block">{os.campo_03_modelo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">MSN / Série</span>
                  <span className="font-bold text-white">{os.campo_04_msn}</span>
                  <span className="text-[10px] text-slate-400 block">Base: {os.campo_06_base_executante}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Tempos / Ciclos</span>
                  <span className="font-bold text-cyan-300">{os.campo_09_tsn}</span>
                  <span className="text-[10px] text-slate-400 block">{os.campo_10_csn}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Operador Cliente</span>
                  <span className="font-bold text-white">{os.campo_05_operador}</span>
                  <span className="text-[10px] text-emerald-400 block font-sans">Auditoria GQ Aprovada ✓</span>
                </div>
              </div>
            </div>

            {/* 1. Modalidade de Declaração de Liberação */}
            <div>
              <label className="block text-xs font-bold font-mono text-slate-300 uppercase mb-2">
                1. Modalidade de Liberação Técnica (RBAC 43.9 / EASA Part-145 / MOMQ 5.7.1) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoDeclaracao('DUAL_RELEASE_ANAC_EASA')}
                  className={`p-3 rounded-lg border text-left transition ${
                    tipoDeclaracao === 'DUAL_RELEASE_ANAC_EASA'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold font-mono block text-xs">DUAL RELEASE</span>
                  <span className="text-[11px] block mt-1 font-sans">ANAC RBAC 43.9 + EASA Part-145 (COM 200607-05 / EASA.145.1003)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoDeclaracao('ANAC_RBAC_43_9')}
                  className={`p-3 rounded-lg border text-left transition ${
                    tipoDeclaracao === 'ANAC_RBAC_43_9'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold font-mono block text-xs">ANAC RBAC 43.9</span>
                  <span className="text-[11px] block mt-1 font-sans">Aeronaves de Registro Brasileiro sob égide exclusiva da ANAC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoDeclaracao('EASA_PART_145')}
                  className={`p-3 rounded-lg border text-left transition ${
                    tipoDeclaracao === 'EASA_PART_145'
                      ? 'bg-blue-950/60 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold font-mono block text-xs">EASA Part-145</span>
                  <span className="text-[11px] block mt-1 font-sans">Operadores europeus e aeronaves de registro estrangeiro EASA</span>
                </button>
              </div>
            </div>

            {/* Texto Oficial Compulsório */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase text-cyan-400 block mb-1">
                  Texto Oficial ANAC RBAC 43.9 (Compulsório):
                </span>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 italic">
                  "{textoAnac}"
                </p>
              </div>

              {(tipoDeclaracao === 'DUAL_RELEASE_ANAC_EASA' || tipoDeclaracao === 'EASA_PART_145') && (
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase text-amber-400 block mb-1">
                    Texto Oficial EASA Part-145 (Inclusão Compulsória EASA.145.1003):
                  </span>
                  <p className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-200 italic">
                    "{textoEasa}"
                  </p>
                </div>
              )}
            </div>

            {/* 2. Assinaturas Técnicas Mandatórias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-mono text-slate-300 uppercase mb-1">
                  Inspetor APRS Homologador (Form F 001-03) *
                </label>
                <select
                  value={idInspetorAprs}
                  onChange={(e) => setIdInspetorAprs(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                  required
                >
                  {tecnicos
                    .filter((t) => t.ativo)
                    .map((t) => (
                      <option key={t.id_tecnico} value={t.id_tecnico}>
                        {t.nome_completo} (CANAC: {t.canac} - {t.cargo})
                      </option>
                    ))}
                </select>
                {inspetorSelecionado && (
                  <div className="mt-1.5 p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                    <span className="block font-mono text-cyan-300">Licença EASA: EASA.66.BR.{inspetorSelecionado.canac}</span>
                    <span className="block font-mono">Assinatura Digital: {inspetorSelecionado.nome_completo.split(' ').map(n=>n[0]).join('')}-{inspetorSelecionado.canac}-APRS-RTS</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-slate-300 uppercase mb-1">
                  Diretor de Manutenção / RT (MOMQ Parte 1) *
                </label>
                <select
                  value={idRt}
                  onChange={(e) => setIdRt(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                  required
                >
                  {tecnicos
                    .filter((t) => t.ativo)
                    .map((t) => (
                      <option key={t.id_tecnico} value={t.id_tecnico}>
                        {t.nome_completo} (CANAC: {t.canac} - RT / Chefia Técnica)
                      </option>
                    ))}
                </select>
                {rtSelecionado && (
                  <div className="mt-1.5 p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                    <span className="block font-mono text-cyan-300">Registro Profissional: CREA-SP 50628912-D</span>
                    <span className="block font-mono">Chancela Digital: {rtSelecionado.nome_completo.split(' ').map(n=>n[0]).join('')}-{rtSelecionado.canac}-RT-CHIEF</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Distribuição Lógica das Vias (MOMQ 6.5) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono flex items-center space-x-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>3. Distribuição Obrigatória das 3 Vias da OS (MOMQ 6.5 / P 001-01):</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="font-bold text-cyan-300 font-mono block">1ª Via: PCP</span>
                  <span className="text-slate-400 block mt-0.5">Destino: Arquivo Central / Histórico Aeronave</span>
                  <input
                    type="text"
                    value={recebedorPcp}
                    onChange={(e) => setRecebedorPcp(e.target.value)}
                    className="w-full mt-2 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-[10px]"
                    placeholder="Protocolo PCP"
                  />
                </div>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="font-bold text-amber-300 font-mono block">2ª Via: Base Executante</span>
                  <span className="text-slate-400 block mt-0.5">Destino: Pasta Operacional Local ({os.campo_06_base_executante})</span>
                  <span className="text-[10px] text-emerald-400 block mt-2 font-mono">Custódia Hangar: 5 anos vigentes</span>
                </div>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="font-bold text-purple-300 font-mono block">3ª Via: Cliente / Operador</span>
                  <span className="text-slate-400 block mt-0.5">Destino: CTM do Operador + LTA</span>
                  <input
                    type="text"
                    value={protocoloCliente}
                    onChange={(e) => setProtocoloCliente(e.target.value)}
                    className="w-full mt-2 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-[10px]"
                    placeholder="Protocolo Cliente"
                  />
                </div>
              </div>
            </div>

            {/* Observações e Limitações */}
            <div>
              <label className="block text-xs font-bold font-mono text-slate-300 uppercase mb-1">
                Observações / Limitações de Retorno ao Serviço:
              </label>
              <textarea
                value={observacoesLimitacoes}
                onChange={(e) => setObservacoesLimitacoes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
              />
            </div>

          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Emitindo RTS & Gravando Dossiê...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assinar e Homologar Retorno ao Serviço (RTS)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
