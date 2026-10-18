import React, { useState } from 'react';
import { X, Cpu, ShieldCheck, ShieldAlert, Check, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { TecnicoComQualificacao } from '../types/mro';
import { api } from '../services/apiClient';

interface AuditSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tecnicos: TecnicoComQualificacao[];
}

export const AuditSimulatorModal: React.FC<AuditSimulatorModalProps> = ({
  isOpen,
  onClose,
  tecnicos,
}) => {
  const [selectedTecnicoId, setSelectedTecnicoId] = useState<number>(tecnicos[0]?.id_tecnico || 1);
  const [tipoTarefa, setTipoTarefa] = useState<'EXECUCAO_PADRAO' | 'INSPECAO_IIO' | 'LIBERACAO_APRS'>('EXECUCAO_PADRAO');
  const [isIIO, setIsIIO] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSimular = async () => {
    try {
      setLoading(true);
      const res = await api.simularAssinatura(selectedTecnicoId, tipoTarefa, isIIO || tipoTarefa === 'INSPECAO_IIO');
      setResultado(res);
    } catch (err: any) {
      alert(err.message || 'Erro ao simular');
    } finally {
      setLoading(false);
    }
  };

  const tecnicoAtual = tecnicos.find((t) => t.id_tecnico === selectedTecnicoId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Simulador de Assinatura & Trava de Qualificação (OS / IIO)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Validação de Regras Invioláveis: Regra 3 (IIO) e Regra 6 (Bloqueio F 001-03)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-blue-200 text-[11px] leading-relaxed">
            <strong className="text-cyan-400 font-mono">PROPÓSITO DE AUDITORIA:</strong> Teste se determinado técnico pode assinar uma Ordem de Serviço (OS), uma tarefa de <strong>Item de Inspeção Obrigatória (IIO)</strong> ou efetuar a liberação <strong>APRS (Dual Release)</strong> no seu estado cadastral atual.
          </div>

          {/* Seleção do Técnico */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Selecione o Técnico para o Teste:
            </label>
            <select
              value={selectedTecnicoId}
              onChange={(e) => {
                setSelectedTecnicoId(Number(e.target.value));
                setResultado(null);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              {tecnicos.map((t) => (
                <option key={t.id_tecnico} value={t.id_tecnico}>
                  {t.nome_completo} ({t.cargo} • CANAC: {t.canac} • Status: {t.qualificacao.status})
                </option>
              ))}
            </select>
          </div>

          {/* Quick status summary of selected technician */}
          {tecnicoAtual && (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Status no Cadastro:
                </span>
                <span className="text-white font-bold">{tecnicoAtual.nome_completo}</span>
                <span className="text-slate-400 font-mono ml-2">({tecnicoAtual.cargo})</span>
              </div>
              <div>
                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                    tecnicoAtual.qualificacao.is_apto
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {tecnicoAtual.qualificacao.status}
                </span>
              </div>
            </div>
          )}

          {/* Tipo de Assinatura Desejada na OS */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-medium">
              Tipo de Assinatura a ser Solicitada na Ordem de Serviço:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label
                onClick={() => {
                  setTipoTarefa('EXECUCAO_PADRAO');
                  setIsIIO(false);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  tipoTarefa === 'EXECUCAO_PADRAO'
                    ? 'bg-cyan-950/40 border-cyan-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">1. Execução de Tarefa</div>
                <div className="text-[10px] opacity-80 mt-1">
                  Mecânico executante padrão (MMA)
                </div>
              </label>

              <label
                onClick={() => {
                  setTipoTarefa('INSPECAO_IIO');
                  setIsIIO(true);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  tipoTarefa === 'INSPECAO_IIO'
                    ? 'bg-amber-950/40 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-amber-300">2. Inspeção IIO (Regra 3)</div>
                <div className="text-[10px] opacity-80 mt-1">
                  Item de Inspeção Obrigatória (Exige Inspetor)
                </div>
              </label>

              <label
                onClick={() => {
                  setTipoTarefa('LIBERACAO_APRS');
                  setIsIIO(false);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  tipoTarefa === 'LIBERACAO_APRS'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-indigo-300">3. Liberação RTS (APRS)</div>
                <div className="text-[10px] opacity-80 mt-1">
                  Dual Release EASA/ANAC (Inspetor / RT)
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSimular}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-600/30 transition flex items-center justify-center space-x-2"
            >
              <Cpu className="w-4 h-4" />
              <span>{loading ? 'Processando Auditoria...' : 'Executar Validação de Assinatura'}</span>
            </button>
          </div>

          {/* Resultado da Simulação */}
          {resultado && (
            <div className="mt-4 p-4 rounded-xl border bg-slate-950/80 border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-mono text-slate-400 uppercase text-[10px]">
                  VEREDITO DO MOTOR REGULATÓRIO (RBAC 145 / MOMQ):
                </span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    resultado.status === 'APTO'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  QUALIFICAÇÃO: {resultado.status}
                </span>
              </div>

              {/* Permissões específicas */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                <div
                  className={`p-2 rounded border ${
                    resultado.permissoes.pode_executar
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">EXECUTAR OS</div>
                  <div className="font-bold">{resultado.permissoes.pode_executar ? 'AUTORIZADO' : 'BLOQUEADO'}</div>
                </div>

                <div
                  className={`p-2 rounded border ${
                    resultado.permissoes.pode_inspecionar
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">INSPEÇÃO IIO</div>
                  <div className="font-bold">{resultado.permissoes.pode_inspecionar ? 'AUTORIZADO' : 'BLOQUEADO'}</div>
                </div>

                <div
                  className={`p-2 rounded border ${
                    resultado.permissoes.pode_liberar_aprs
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">LIBERAR APRS</div>
                  <div className="font-bold">{resultado.permissoes.pode_liberar_aprs ? 'AUTORIZADO' : 'BLOQUEADO'}</div>
                </div>
              </div>

              {/* Motivos de bloqueio se houver */}
              {resultado.permissoes.motivos_bloqueio.length > 0 ? (
                <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded-lg text-rose-300 space-y-1">
                  <div className="font-bold text-rose-400 uppercase text-[10px] font-mono flex items-center">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                    TRAVAS ATIVAS IMPEDINDO A ASSINATURA:
                  </div>
                  {resultado.permissoes.motivos_bloqueio.map((m: string, i: number) => (
                    <div key={i} className="text-[11px] pl-2">• {m}</div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-lg text-emerald-300 text-center font-bold">
                  ✓ ASSINATURA LIBERADA: O técnico cumpre 100% dos requisitos do MOMQ MNT-001 (Rev 08).
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Fechar Simulador
          </button>
        </div>
      </div>
    </div>
  );
};
