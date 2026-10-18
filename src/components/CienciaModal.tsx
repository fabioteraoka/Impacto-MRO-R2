import React, { useState, useEffect } from 'react';
import { CheckCheck, X, AlertTriangle, UserCheck, Calendar, ShieldCheck, FileText } from 'lucide-react';
import { PublicacaoTecnicaF001_02_1, CienciaCorpoTecnicoF001_02_2, PessoalTecnico } from '../types/mro';
import { apiClient } from '../services/apiClient';

interface CienciaModalProps {
  publication: PublicacaoTecnicaF001_02_1;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tecnicos: PessoalTecnico[];
}

export const CienciaModal: React.FC<CienciaModalProps> = ({
  publication,
  isOpen,
  onClose,
  onSuccess,
  tecnicos,
}) => {
  const [activeTab, setActiveTab] = useState<'registrar' | 'historico'>('registrar');
  const [ciencias, setCiencias] = useState<CienciaCorpoTecnicoF001_02_2[]>([]);
  const [loading, setLoading] = useState(false);

  const [idTecnico, setIdTecnico] = useState<number>(tecnicos[0]?.id_tecnico || 1);
  const [revisaoCientificada, setRevisaoCientificada] = useState(publication.revisao_atual);
  const [observacoes, setObservacoes] = useState(
    'Declaro ter tomado ciência integral das alterações incorporadas nesta revisão do manual técnico, aplicando os novos parâmetros na execução e inspeção de serviços.'
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCiencias = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCiencias({ id_publicacao: publication.id_publicacao });
      setCiencias(data);
    } catch (err) {
      console.error('Erro ao carregar ciências:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCiencias();
      setRevisaoCientificada(publication.revisao_atual);
    }
  }, [isOpen, publication]);

  if (!isOpen) return null;

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await apiClient.registrarCiencia({
        id_publicacao: publication.id_publicacao,
        id_tecnico: Number(idTecnico),
        revisao_cientificada: revisaoCientificada.trim(),
        observacoes: observacoes.trim() || 'N/A',
      });
      await loadCiencias();
      setActiveTab('historico');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar ciência técnica.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-400">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                REGISTRO DE CIÊNCIA DO CORPO TÉCNICO (F 001-02-2)
              </h3>
              <p className="text-xs text-slate-400">
                Rastreabilidade de Treinamento e Leitura de Manuais — MOMQ I 001-02 (Rev 08)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('registrar')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'registrar'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Registrar Nova Ciência
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'historico'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Histórico de Ciências ({ciencias.length})
          </button>
        </div>

        {/* Publication summary */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="font-bold text-white text-sm">{publication.titulo}</div>
          <div className="flex flex-wrap gap-4 text-slate-400 mt-1 font-mono">
            <span>Doc: <strong className="text-cyan-300">{publication.codigo_documento}</strong></span>
            <span>Revisão Vigente: <strong className="text-amber-300">{publication.revisao_atual}</strong></span>
            <span>Data: <strong className="text-slate-200">{publication.data_revisao}</strong></span>
            <span>Modelo: <strong className="text-slate-200">{publication.modelo_aplicavel}</strong></span>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'registrar' && (
            <form onSubmit={handleRegistrar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Técnico / Inspetor que declara ciência (MMA / Inspetor) *
                </label>
                <select
                  value={idTecnico}
                  onChange={(e) => setIdTecnico(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
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
                  Revisão Cientificada *
                </label>
                <input
                  type="text"
                  required
                  value={revisaoCientificada}
                  onChange={(e) => setRevisaoCientificada(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Declaração Formal de Leitura & Observações *
                </label>
                <textarea
                  rows={4}
                  required
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-lg text-xs text-purple-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  O registro eletrônico do Form F 001-02-2 vincula o CANAC do profissional à data e hora exatas de confirmação, servindo como evidência formal perante auditorias ANAC e EASA.
                </span>
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
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-lg shadow-purple-900/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {submitting ? 'Confirmando...' : 'Confirmar Assinatura de Ciência'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-3">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Carregando histórico...</div>
              ) : ciencias.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800">
                  Nenhuma ciência registrada para esta publicação técnica até o momento.
                </div>
              ) : (
                ciencias.map((c) => (
                  <div key={c.id_ciencia} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white">
                        {c.tecnico_nome} <span className="text-purple-400 font-mono">({c.tecnico_cargo})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-[10px] font-bold">
                        CONFIRMADA
                      </span>
                    </div>
                    <div className="flex gap-4 text-slate-400 font-mono text-[11px]">
                      <span>CANAC: <strong className="text-amber-400">{c.tecnico_canac}</strong></span>
                      <span>Revisão: <strong className="text-cyan-300">{c.revisao_cientificada}</strong></span>
                      <span>Data/Hora: <strong className="text-slate-300">{c.data_ciencia}</strong></span>
                    </div>
                    <p className="text-slate-400 italic text-[11px] pt-1 border-t border-slate-800/60 mt-1">
                      "{c.observacoes}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
