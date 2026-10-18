import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  X,
  ShieldAlert,
  CheckCircle,
  User,
  Wrench,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Ferramenta, TecnicoComQualificacao, PessoalTecnico } from '../types/mro';
import { api } from '../services/apiClient';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo?: 'CHECK_OUT' | 'CHECK_IN';
  ferramenta?: Ferramenta | null;
  tool?: Ferramenta | null;
  tecnicos: (TecnicoComQualificacao | PessoalTecnico)[];
  onCheckOut?: (data: {
    id_ferramenta: number;
    id_tecnico: number;
    ordem_servico_numero: string;
    finalidade_servico: string;
    condicoes_retirada?: string;
  }) => Promise<any>;
  onCheckIn?: (data: {
    id_ferramenta: number;
    id_tecnico_devolucao: number;
    condicoes_devolucao: 'INTACTA' | 'DANIFICADA';
    observacoes_devolucao?: string;
  }) => Promise<any>;
  onSuccess?: () => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  tipo: propTipo,
  ferramenta: propFerramenta,
  tool,
  tecnicos,
  onCheckOut,
  onCheckIn,
  onSuccess,
}) => {
  const activeTool = tool || propFerramenta;
  const tipo = propTipo || (activeTool?.status_operacional === 'EM_USO' || activeTool?.status === 'EM_USO' ? 'CHECK_IN' : 'CHECK_OUT');

  const [idTecnico, setIdTecnico] = useState<number>(0);
  const [ordemServico, setOrdemServico] = useState('');
  const [finalidade, setFinalidade] = useState('');
  const [condicoesRetirada, setCondicoesRetirada] = useState('INTACTA_CALIBRADA');
  const [condicoesDevolucao, setCondicoesDevolucao] = useState<'INTACTA' | 'DANIFICADA'>('INTACTA');
  const [observacoesDevolucao, setObservacoesDevolucao] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtrar técnicos aptos para check-out
  const tecnicosAptos = tecnicos.filter((t: any) => !t.qualificacao || t.qualificacao.is_apto);

  useEffect(() => {
    if (tipo === 'CHECK_OUT') {
      if (tecnicosAptos.length > 0) {
        setIdTecnico(tecnicosAptos[0].id_tecnico);
      } else if (tecnicos.length > 0) {
        setIdTecnico(tecnicos[0].id_tecnico);
      }
      setOrdemServico(`OS-2026-${Math.floor(100 + Math.random() * 900)}`);
      setFinalidade('Inspeção programada / Torqueamento de componentes conforme AMM');
      setCondicoesRetirada('INTACTA_CALIBRADA');
    } else {
      // Check-in
      if (activeTool?.movimentacao_atual) {
        setIdTecnico(activeTool.movimentacao_atual.id_tecnico);
      } else if (tecnicos.length > 0) {
        setIdTecnico(tecnicos[0].id_tecnico);
      }
      setCondicoesDevolucao('INTACTA');
      setObservacoesDevolucao('');
    }
    setErrorMsg('');
  }, [isOpen, tipo, activeTool, tecnicos]);

  if (!isOpen || !activeTool) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!idTecnico) {
      setErrorMsg('Selecione um técnico responsável.');
      return;
    }

    try {
      setLoading(true);
      if (tipo === 'CHECK_OUT') {
        if (!ordemServico.trim() || !finalidade.trim()) {
          setErrorMsg('Informe a Ordem de Serviço (OS) e a Finalidade do Serviço.');
          setLoading(false);
          return;
        }

        const payload = {
          id_ferramenta: activeTool.id_ferramenta,
          id_tecnico: Number(idTecnico),
          ordem_servico_numero: ordemServico.trim(),
          finalidade_servico: finalidade.trim(),
          condicoes_retirada: condicoesRetirada,
        };

        if (onCheckOut) {
          await onCheckOut(payload);
        } else {
          await api.checkOutFerramenta(payload);
        }
      } else {
        // Check-in
        const payload = {
          id_ferramenta: activeTool.id_ferramenta,
          id_tecnico_devolucao: Number(idTecnico),
          condicoes_devolucao: condicoesDevolucao,
          observacoes_devolucao: observacoesDevolucao.trim() || undefined,
        };

        let res: any;
        if (onCheckIn) {
          res = await onCheckIn(payload);
        } else {
          res = await api.checkInFerramenta(payload);
        }

        if (res?.quarentena_acionada) {
          alert(
            'ALERTA REGULATÓRIO (Regra #2): Ferramenta devolvida DANIFICADA foi transferida imediatamente para QUARENTENA com emissão da Tag Vermelha F 001-01-6!'
          );
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao registrar movimentação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] flex flex-col text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                tipo === 'CHECK_OUT'
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {tipo === 'CHECK_OUT' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownLeft className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                {tipo === 'CHECK_OUT'
                  ? 'Retirada de Ferramenta (Check-out - F 001-06-1)'
                  : 'Devolução de Ferramenta (Check-in - F 001-06-1)'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Controle Diário de Ferramental • MOMQ MNT-001 (Rev 08)
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-300 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dados da Ferramenta */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-slate-400">
                Ferramenta Selecionada
              </span>
              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                SN: {activeTool.serial_number}
              </span>
            </div>
            <div className="font-bold text-white text-sm">{activeTool.descricao}</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div>
                PN: <strong className="text-slate-200">{activeTool.part_number}</strong>
              </div>
              <div>
                Posição: <strong className="text-slate-200">{activeTool.posicao_localizacao || activeTool.localizacao_fisica}</strong>
              </div>
            </div>
          </div>

          {/* Check-out fields */}
          {tipo === 'CHECK_OUT' ? (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Técnico Habilitado Retirante * (Regra #6: Apenas Aptos)
                </label>
                <select
                  value={idTecnico}
                  onChange={(e) => setIdTecnico(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {tecnicosAptos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} (CANAC: {t.canac} • {t.cargo} • APTO)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Técnicos com pendência de F 001-03 ou treinamentos vencidos são omitidos conforme Regra 6.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Número da OS Vinculada *
                  </label>
                  <input
                    type="text"
                    required
                    value={ordemServico}
                    onChange={(e) => setOrdemServico(e.target.value)}
                    placeholder="Ex: OS-2026-0081"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Condição na Retirada
                  </label>
                  <select
                    value={condicoesRetirada}
                    onChange={(e) => setCondicoesRetirada(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
                  >
                    <option value="INTACTA_CALIBRADA">INTACTA & CALIBRADA</option>
                    <option value="INTACTA_SEM_CALIBRACAO">INTACTA (NÃO REQUER CALIBRAÇÃO)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Finalidade do Serviço na Aeronave *
                </label>
                <textarea
                  rows={2}
                  required
                  value={finalidade}
                  onChange={(e) => setFinalidade(e.target.value)}
                  placeholder="Ex: Aplicação de torque nos parafusos da turbina conforme AMM 72-00-00..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </>
          ) : (
            /* Check-in fields */
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Técnico Devolvente *
                </label>
                <select
                  value={idTecnico}
                  onChange={(e) => setIdTecnico(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} (CANAC: {t.canac} • {t.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Condições Físicas na Devolução *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setCondicoesDevolucao('INTACTA')}
                    className={`p-3 rounded-lg border cursor-pointer transition text-center ${
                      condicoesDevolucao === 'INTACTA'
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">✓ INTACTA / PERFEITA</div>
                    <div className="text-[10px] opacity-80 mt-1">
                      Retorna ao status DISPONÍVEL
                    </div>
                  </label>

                  <label
                    onClick={() => setCondicoesDevolucao('DANIFICADA')}
                    className={`p-3 rounded-lg border cursor-pointer transition text-center ${
                      condicoesDevolucao === 'DANIFICADA'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">⚠️ DANIFICADA / QUEDA</div>
                    <div className="text-[10px] opacity-80 mt-1">
                      Segregar para QUARENTENA (Regra 2)
                    </div>
                  </label>
                </div>
              </div>

              {condicoesDevolucao === 'DANIFICADA' && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-2">
                  <label className="block font-bold text-rose-300 text-[11px]">
                    Descreva o Dano ou Ocorrência (Obrigatório para Quarentena F 001-06-04):
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={observacoesDevolucao}
                    onChange={(e) => setObservacoesDevolucao(e.target.value)}
                    placeholder="Ex: Ferramenta sofreu impacto de queda durante o torqueamento ou estalo com desvio perceptível..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg font-bold shadow-lg transition text-slate-950 ${
                tipo === 'CHECK_OUT'
                  ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/30'
                  : condicoesDevolucao === 'DANIFICADA'
                  ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30'
              }`}
            >
              {loading
                ? 'Processando...'
                : tipo === 'CHECK_OUT'
                ? 'Efetivar Check-out (Liberar Ferramenta)'
                : condicoesDevolucao === 'DANIFICADA'
                ? 'Registrar Devolução & Segregar Quarentena'
                : 'Concluir Devolução (Check-in)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
