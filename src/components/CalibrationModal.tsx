import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  PlusCircle,
  FileCheck,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowRightLeft,
  X,
  Tag,
  AlertOctagon,
  Search,
} from 'lucide-react';
import { Ferramenta, ControleCalibracaoF001_06 } from '../types/mro';
import { api } from '../services/apiClient';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ferramentas?: Ferramenta[];
  ferramentaPreSelecionada?: Ferramenta | null;
  tool?: Ferramenta | null;
  onSave?: (data: Partial<ControleCalibracaoF001_06>) => Promise<any>;
  onSuccess?: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  ferramentas = [],
  ferramentaPreSelecionada,
  tool,
  onSave,
  onSuccess,
}) => {
  const activeTool = tool || ferramentaPreSelecionada;
  const toolList = ferramentas.length > 0 ? ferramentas : activeTool ? [activeTool] : [];

  const [idFerramenta, setIdFerramenta] = useState<number>(activeTool?.id_ferramenta || 0);
  const [numeroLaudo, setNumeroLaudo] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [desvioPadrao, setDesvioPadrao] = useState<number>(0.05);
  const [desvioMaximo, setDesvioMaximo] = useState<number>(0.1);
  const [dataAfericao, setDataAfericao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [tagAmarelaAplicada, setTagAmarelaAplicada] = useState(true);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtrar apenas ferramentas que requerem calibração
  const ferramentasCalibraveis = toolList.filter((f) => f.requer_calibracao);

  useEffect(() => {
    const hoje = new Date();
    const hojeIso = hoje.toISOString().split('T')[0];
    const umAnoDepois = new Date(hoje);
    umAnoDepois.setFullYear(umAnoDepois.getFullYear() + 1);
    const vencimentoIso = umAnoDepois.toISOString().split('T')[0];

    setDataAfericao(hojeIso);
    setDataVencimento(vencimentoIso);

    if (activeTool) {
      setIdFerramenta(activeTool.id_ferramenta);
    } else if (ferramentasCalibraveis.length > 0) {
      setIdFerramenta(ferramentasCalibraveis[0].id_ferramenta);
    }

    setNumeroLaudo(`CAL-RBC-${hoje.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setLaboratorio('Metrologia Aeronáutica AeroTech Ltda (RBC #042)');
    setDesvioPadrao(0.045);
    setDesvioMaximo(0.1);
    setTagAmarelaAplicada(true);
    setObservacoes('Calibração padrão periódica realizada em laboratório credenciado RBC.');
    setErrorMsg('');
  }, [isOpen, activeTool, ferramentas]);

  if (!isOpen) return null;

  const selecionada = toolList.find((f) => f.id_ferramenta === idFerramenta) || activeTool;
  const reprovadoDesvio = desvioPadrao > desvioMaximo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!idFerramenta || !numeroLaudo.trim() || !laboratorio.trim() || !dataVencimento) {
      setErrorMsg('Preencha os campos obrigatórios (Ferramenta, Laudo, Laboratório e Vencimento).');
      return;
    }

    try {
      setLoading(true);
      const payload: Partial<ControleCalibracaoF001_06> = {
        id_ferramenta: Number(idFerramenta),
        numero_laudo: numeroLaudo.trim(),
        laboratorio_homologado: laboratorio.trim(),
        desvio_padrao_observado: Number(desvioPadrao),
        desvio_maximo_tolerado: Number(desvioMaximo),
        data_afericao: dataAfericao,
        data_vencimento: dataVencimento,
        tag_f001_06_3_aplicada: !reprovadoDesvio && tagAmarelaAplicada,
        observacoes_laudo: observacoes.trim() || 'N/A', // Regra N/A
      };

      let res: any;
      if (onSave) {
        res = await onSave(payload);
      } else {
        res = await api.createCalibracao(payload);
      }

      if (res?.quarentena_acionada) {
        alert(
          `ALERTA REGULATÓRIO (BTI-PMP-05): O desvio padrão (${desvioPadrao}) ultrapassou o limite tolerado (${desvioMaximo}). A ferramenta foi movida compulsoriamente para QUARENTENA com emissão da Tag Vermelha F 001-01-6!`
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar laudo de calibração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Registro de Calibração Metrológica (Form F 001-06)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Conformidade BTI-PMP-05 / Rede Brasileira de Calibração (RBC)
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Seleção de Ferramenta */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Ferramenta de Precisão / Padrão Metrológico *
            </label>
            <select
              value={idFerramenta}
              onChange={(e) => setIdFerramenta(Number(e.target.value))}
              disabled={!!ferramentaPreSelecionada}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-sans focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              {ferramentasCalibraveis.map((f) => (
                <option key={f.id_ferramenta} value={f.id_ferramenta}>
                  {f.descricao} (PN: {f.part_number} • SN: {f.serial_number} • {f.status})
                </option>
              ))}
            </select>
          </div>

          {/* Dados do Laudo & Laboratório */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Número do Certificado / Laudo RBC *
              </label>
              <input
                type="text"
                required
                value={numeroLaudo}
                onChange={(e) => setNumeroLaudo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Laboratório Homologado (RBC / Inmetro) *
              </label>
              <input
                type="text"
                required
                value={laboratorio}
                onChange={(e) => setLaboratorio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Validação de Desvio Padrão BTI-PMP-05 */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                Critério de Aceitação: Desvio Padrão (BTI-PMP-05)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Regra Inviolável #2
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Desvio Padrão Observado no Laudo *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={desvioPadrao}
                  onChange={(e) => setDesvioPadrao(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Desvio Máximo Tolerado pelo Fabricante *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={desvioMaximo}
                  onChange={(e) => setDesvioMaximo(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Alerta de Desvio Padrão */}
            {reprovadoDesvio ? (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 flex items-center space-x-2 text-[11px]">
                <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  <strong>REPROVADO POR BTI-PMP-05:</strong> O desvio padrão ultrapassou a tolerância. A ferramenta será transferida automaticamente para <strong>QUARENTENA (Tag Vermelha F 001-01-6)</strong>.
                </span>
              </div>
            ) : (
              <div className="p-2 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 flex items-center space-x-1.5 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Desvio em conformidade metrológica (Aprovado).</span>
              </div>
            )}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data da Aferição *
              </label>
              <input
                type="date"
                required
                value={dataAfericao}
                onChange={(e) => setDataAfericao(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data de Vencimento da Calibração *
              </label>
              <input
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Tag F 001-06-3 */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tagAmarelaAplicada && !reprovadoDesvio}
                disabled={reprovadoDesvio}
                onChange={(e) => setTagAmarelaAplicada(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-slate-200">
                Afixar Etiqueta / Tag de Calibração Amarela (F 001-06-3)
              </span>
            </label>
            <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
              Obrigatório comprovar a afixação física da etiqueta no corpo da ferramenta contendo número do laudo e data de validade antes da liberação.
            </p>
          </div>

          {/* Observações com Regra N/A */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Observações Metrológicas (Regra N/A automática)
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Pontos de ensaio, temperatura do ambiente de teste..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

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
                reprovadoDesvio
                  ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/30'
                  : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30'
              }`}
            >
              {loading
                ? 'Processando...'
                : reprovadoDesvio
                ? 'Registrar Laudo & Segregar em Quarentena'
                : 'Salvar Laudo F 001-06'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
