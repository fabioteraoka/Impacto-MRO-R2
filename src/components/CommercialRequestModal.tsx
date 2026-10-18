import React, { useState } from 'react';
import {
  X,
  Send,
  Building,
  Calendar,
  Clock,
  Plane,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Mail,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
import { BaseSigla, SolicitacaoComercial } from '../types/mro';
import { apiClient } from '../services/apiClient';

interface CommercialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (nova: SolicitacaoComercial) => void;
}

export const CommercialRequestModal: React.FC<CommercialRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const agora = new Date();
  const dataHojeStr = agora.toISOString().split('T')[0];
  const horaHojeStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

  // Previsão padrão: daqui a 48h
  const data48h = new Date(agora.getTime() + 48 * 3600 * 1000);
  const data48hStr = data48h.toISOString().split('T')[0];
  const hora48hStr = '08:00';

  const [operador, setOperador] = useState('');
  const [contato, setContato] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [matricula, setMatricula] = useState('');
  const [modelo, setModelo] = useState('ATR 72-600');
  const [msn, setMsn] = useState('');
  const [baseSolicitada, setBaseSolicitada] = useState<BaseSigla>('GRU');

  const [dataInicio, setDataInicio] = useState(data48hStr);
  const [horaInicio, setHoraInicio] = useState(hora48hStr);

  const [escopoServico, setEscopoServico] = useState('');
  const [diretrizMandatoria, setDiretrizMandatoria] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cálculo dinâmico da antecedência
  const dataInicioCompleta = new Date(`${dataInicio}T${horaInicio}:00`);
  const diffHoras = Math.round(((dataInicioCompleta.getTime() - agora.getTime()) / (1000 * 3600)) * 10) / 10;
  const antecedenciaValida = diffHoras >= 24;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!operador.trim() || !matricula.trim() || !modelo.trim() || !escopoServico.trim()) {
      setErrorMessage('Preencha os campos obrigatórios: Operador, Matrícula, Modelo e Escopo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataHoraPrevistaInicio = dataInicioCompleta.toISOString();
      const dataHoraPrevistaFim = new Date(dataInicioCompleta.getTime() + 10 * 3600 * 1000).toISOString();

      const nova = await apiClient.createSolicitacaoComercial({
        operador_cliente: operador.trim(),
        contato_responsavel: contato.trim() || 'N/A',
        email_contato: email.trim() || 'N/A',
        telefone_contato: telefone.trim() || 'N/A',
        matricula_aeronave: matricula.trim().toUpperCase(),
        modelo_aeronave: modelo.trim(),
        msn_aeronave: msn.trim() || 'N/A',
        base_solicitada: baseSolicitada,
        data_solicitacao: agora.toISOString(),
        data_hora_prevista_inicio: dataHoraPrevistaInicio,
        data_hora_prevista_fim: dataHoraPrevistaFim,
        escopo_servico: escopoServico.trim(),
        diretrizes_mandatorias_solicitadas: diretrizMandatoria.trim() ? [diretrizMandatoria.trim()] : [],
        observacoes: observacoes.trim() || 'N/A',
      });

      onSuccess(nova);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar solicitação comercial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                MOMQ 6.3 • WORKFLOW COMERCIAL
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Nova Solicitação de Manutenção Aeronáutica
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 flex items-start space-x-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Checagem de Antecedência em Tempo Real */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${antecedenciaValida ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-300' : 'bg-amber-950/20 border-amber-800/80 text-amber-300'}`}>
            <div className="flex items-center space-x-2">
              {antecedenciaValida ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <strong className="block text-[11px]">
                  {antecedenciaValida ? 'Antecedência Conforme MOMQ 6.3' : 'Alerta de Antecedência Curta (< 24h)'}
                </strong>
                <span className="text-[10px] opacity-80">
                  Início previsto com {diffHoras > 0 ? `${diffHoras}h` : '0h'} de antecedência (Mínimo regulamentar: 24h).
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${antecedenciaValida ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {diffHoras} Horas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Operador / Cliente *
              </label>
              <input
                type="text"
                value={operador}
                onChange={(e) => setOperador(e.target.value)}
                placeholder="Ex: VoePass Linhas Aéreas, LATAM Airlines"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Contato Responsável
              </label>
              <input
                type="text"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Ex: Cap. Fernando Menezes"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                E-mail do Operador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manutencao@operador.com.br"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Telefone de Contato (24/7)
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98888-7777"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Matrícula da Aeronave *
              </label>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                placeholder="Ex: PR-IMA, PT-XYZ"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Modelo da Aeronave *
              </label>
              <select
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              >
                <option value="ATR 72-600">ATR 72-600 (ATR 72-212A)</option>
                <option value="ATR 72-500">ATR 72-500 (ATR 72-212A)</option>
                <option value="Airbus A320-200">Airbus A320-200 (ceo)</option>
                <option value="Airbus A320neo">Airbus A320neo</option>
                <option value="Boeing 737-800">Boeing 737-800</option>
                <option value="Cessna 208B Grand Caravan">Cessna 208B Grand Caravan</option>
                <option value="Beechcraft King Air B200">King Air B200 / B350</option>
                <option value="Cessna 525 Citation Jet">Cessna 525 Citation (Só GRU)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Base Solicitada *
              </label>
              <select
                value={baseSolicitada}
                onChange={(e) => setBaseSolicitada(e.target.value as BaseSigla)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold"
              >
                <option value="GRU">Base Sede GRU (Guarulhos)</option>
                <option value="CNF">Base Secundária CNF (Confins)</option>
                <option value="VCP">Base Secundária VCP (Viracopos)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Data e Hora Prevista para Início *
              </label>
              <div className="flex space-x-1">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-2/3 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-1/3 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Escopo e Serviços Solicitados *
            </label>
            <textarea
              value={escopoServico}
              onChange={(e) => setEscopoServico(e.target.value)}
              rows={2}
              placeholder="Descreva as tarefas requeridas, checks programados ou discrepâncias..."
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Diretriz Mandatória Solicitada (DA/AD/SB)
              </label>
              <input
                type="text"
                value={diretrizMandatoria}
                onChange={(e) => setDiretrizMandatoria(e.target.value)}
                placeholder="Ex: DA 2025-11-02 ou N/A"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Observações de Operação / Slot
              </label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Aeronave chega em voo de linha às 07:15 UTC"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Registrando...' : 'Registrar Solicitação Comercial'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
