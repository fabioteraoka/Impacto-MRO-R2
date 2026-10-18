import React, { useState } from 'react';
import { RefreshCw, X, AlertTriangle, CheckCircle, Calendar, User } from 'lucide-react';
import { PublicacaoTecnicaF001_02_1, PessoalTecnico, StatusPublicacao } from '../types/mro';
import { apiClient } from '../services/apiClient';

interface CheckRevisionModalProps {
  publication: PublicacaoTecnicaF001_02_1;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tecnicos: PessoalTecnico[];
}

export const CheckRevisionModal: React.FC<CheckRevisionModalProps> = ({
  publication,
  isOpen,
  onClose,
  onSuccess,
  tecnicos,
}) => {
  const [status, setStatus] = useState<StatusPublicacao>(publication.status);
  const [revisao, setRevisao] = useState(publication.revisao_atual);
  const [dataRevisao, setDataRevisao] = useState(publication.data_revisao);
  const [idResponsavel, setIdResponsavel] = useState<number>(
    tecnicos.find((t) => t.cargo === 'RT' || t.cargo === 'Gerente Qualidade')?.id_tecnico ||
    tecnicos[0]?.id_tecnico || 1
  );
  const [observacoes, setObservacoes] = useState(
    `Verificação periódica realizada via portal do fabricante. Manual conferido e em vigor.`
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await apiClient.checarRevisaoPublicacao(publication.id_publicacao, {
        status,
        revisao: revisao.trim(),
        data_revisao: dataRevisao,
        id_responsavel: Number(idResponsavel),
        observacoes: observacoes.trim() || 'N/A',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar checagem de revisão.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                CHECAGEM DE REVISÃO DE MANUAL (I 001-02)
              </h3>
              <p className="text-xs text-slate-400">
                Auditoria de Atualização de Dados Técnicos — IS 145.109-001
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Publication Summary */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-lg text-xs space-y-1">
            <div className="font-bold text-white text-sm">{publication.titulo}</div>
            <div className="text-slate-400 font-mono">
              Código: <strong className="text-cyan-300">{publication.codigo_documento}</strong> • Fabricante: <strong className="text-slate-200">{publication.fabricante}</strong>
            </div>
            <div className="text-slate-400 font-mono">
              Revisão Registrada: <strong className="text-amber-300">{publication.revisao_atual}</strong> (Data: {publication.data_revisao})
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Verificado no Portal / Fabricante *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusPublicacao)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ATUALIZADO">ATUALIZADO (Em vigor no portal do fabricante)</option>
                <option value="A_REVISAR">A REVISAR (Nova revisão publicada / pendente estudo)</option>
                <option value="OBSOLETO">OBSOLETO (Cancelado ou substituído)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Revisão Conferida *
                </label>
                <input
                  type="text"
                  required
                  value={revisao}
                  onChange={(e) => setRevisao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data da Revisão *
                </label>
                <input
                  type="date"
                  required
                  value={dataRevisao}
                  onChange={(e) => setDataRevisao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Responsável pela Checagem (CTM / RT / Inspetor) *
              </label>
              <select
                value={idResponsavel}
                onChange={(e) => setIdResponsavel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {tecnicos.map((t) => (
                  <option key={t.id_tecnico} value={t.id_tecnico}>
                    {t.nome_completo} ({t.cargo} - CANAC: {t.canac})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Despacho / Parecer da Checagem
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="Detalhes da conferência..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-900/30 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Gravando...' : 'Confirmar Checagem de Revisão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
