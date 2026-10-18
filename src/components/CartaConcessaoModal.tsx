import React, { useState } from 'react';
import { FileCheck, X, Building, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { CartaConcessaoManuais, PessoalTecnico, StatusCartaConcessao } from '../types/mro';
import { apiClient } from '../services/apiClient';

interface CartaConcessaoModalProps {
  cartaToEdit?: CartaConcessaoManuais | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tecnicos: PessoalTecnico[];
}

export const CartaConcessaoModal: React.FC<CartaConcessaoModalProps> = ({
  cartaToEdit,
  isOpen,
  onClose,
  onSuccess,
  tecnicos,
}) => {
  const [numeroCarta, setNumeroCarta] = useState(cartaToEdit?.numero_carta || '');
  const [operadorCliente, setOperadorCliente] = useState(cartaToEdit?.operador_cliente || '');
  const [frotasModelos, setFrotasModelos] = useState(cartaToEdit?.frotas_modelos || '');
  const [manuaisConcedidos, setManuaisConcedidos] = useState(cartaToEdit?.manuais_concedidos || 'AMM, IPC, MPD, WDM, SRM, CMM');
  const [dataEmissao, setDataEmissao] = useState(cartaToEdit?.data_emissao || new Date().toISOString().split('T')[0]);
  const [dataValidade, setDataValidade] = useState(
    cartaToEdit?.data_validade || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [formaAcesso, setFormaAcesso] = useState(cartaToEdit?.forma_acesso || '');
  const [status, setStatus] = useState<StatusCartaConcessao>(cartaToEdit?.status || 'VALIDA');
  const [idResponsavel, setIdResponsavel] = useState<number>(cartaToEdit?.id_responsavel || tecnicos[0]?.id_tecnico || 1);
  const [observacoes, setObservacoes] = useState(cartaToEdit?.observacoes || 'N/A');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const payload: Partial<CartaConcessaoManuais> = {
      numero_carta: numeroCarta.trim() || 'N/A',
      operador_cliente: operadorCliente.trim() || 'N/A',
      frotas_modelos: frotasModelos.trim() || 'N/A',
      manuais_concedidos: manuaisConcedidos.trim() || 'N/A',
      data_emissao: dataEmissao,
      data_validade: dataValidade,
      forma_acesso: formaAcesso.trim() || 'Portal institucional do cliente',
      status,
      id_responsavel: Number(idResponsavel),
      observacoes: observacoes.trim() || 'N/A',
    };

    try {
      if (cartaToEdit) {
        await apiClient.atualizarCartaConcessao(cartaToEdit.id_carta_concessao, payload);
      } else {
        await apiClient.cadastrarCartaConcessao(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar carta de concessão.');
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
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {cartaToEdit ? 'EDITAR CARTA DE CONCESSÃO DE MANUAIS' : 'NOVA CARTA DE CONCESSÃO DE MANUAIS (IS 145.109-001)'}
              </h3>
              <p className="text-xs text-slate-400">
                Autorização de Operador / Cliente para Uso de Dados Técnicos — MOMQ I 001-02
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

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              <strong>IS 145.109-001:</strong> O concessionário (Impacto Aviation) é responsável por manter registro formal de que o operador disponibilizou dados técnicos atualizados.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número da Carta de Concessão *
              </label>
              <input
                type="text"
                required
                value={numeroCarta}
                onChange={(e) => setNumeroCarta(e.target.value)}
                placeholder="Ex: CC-TAM-2026-014, CC-AZU-2025-089"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status da Concessão *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusCartaConcessao)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="VALIDA">Válida (Ativa)</option>
                <option value="VENCIDA">Vencida (Expirada)</option>
                <option value="REVOGADA">Revogada pelo Operador</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Operador / Cliente Concedente *
              </label>
              <input
                type="text"
                required
                value={operadorCliente}
                onChange={(e) => setOperadorCliente(e.target.value)}
                placeholder="Ex: TAM Linhas Aéreas S.A. (LATAM Airlines Brasil), Helisul Aviação"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Frotas / Modelos Autorizados *
              </label>
              <input
                type="text"
                required
                value={frotasModelos}
                onChange={(e) => setFrotasModelos(e.target.value)}
                placeholder="Ex: Airbus A320 Family, ATR 72-600, Cessna 208B Grand Caravan"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Manuais / Publicações Concedidas *
              </label>
              <input
                type="text"
                required
                value={manuaisConcedidos}
                onChange={(e) => setManuaisConcedidos(e.target.value)}
                placeholder="Ex: AMM, IPC, MPD, WDM, SRM, CMM, NDT, TSM"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data de Emissão da Carta *
              </label>
              <input
                type="date"
                required
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data de Validade / Vencimento *
              </label>
              <input
                type="date"
                required
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Forma de Acesso / Portal Credenciado
              </label>
              <input
                type="text"
                value={formaAcesso}
                onChange={(e) => setFormaAcesso(e.target.value)}
                placeholder="Ex: Portal AirbusWorld via credenciais de manutenção delegada"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Responsável Técnico pelo Monitoramento *
              </label>
              <select
                value={idResponsavel}
                onChange={(e) => setIdResponsavel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {tecnicos.map((t) => (
                  <option key={t.id_tecnico} value={t.id_tecnico}>
                    {t.nome_completo} ({t.cargo} - CANAC: {t.canac})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações Adicionais (Regra do N/A)
              </label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="N/A"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer buttons */}
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-900/30 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : cartaToEdit ? 'Atualizar Concessão' : 'Registrar Carta de Concessão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
