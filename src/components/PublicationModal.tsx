import React, { useState } from 'react';
import { BookOpen, X, Building, Link2, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { PublicacaoTecnicaF001_02_1, CartaConcessaoManuais, PessoalTecnico, TipoDocumentoTecnico, MeioDistribuicao, StatusPublicacao } from '../types/mro';
import { apiClient } from '../services/apiClient';

interface PublicationModalProps {
  publicationToEdit?: PublicacaoTecnicaF001_02_1 | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cartas: CartaConcessaoManuais[];
  tecnicos: PessoalTecnico[];
}

export const PublicationModal: React.FC<PublicationModalProps> = ({
  publicationToEdit,
  isOpen,
  onClose,
  onSuccess,
  cartas,
  tecnicos,
}) => {
  const [codigoDocumento, setCodigoDocumento] = useState(publicationToEdit?.codigo_documento || '');
  const [titulo, setTitulo] = useState(publicationToEdit?.titulo || '');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumentoTecnico>(publicationToEdit?.tipo_documento || 'AMM');
  const [fabricante, setFabricante] = useState(publicationToEdit?.fabricante || '');
  const [modeloAplicavel, setModeloAplicavel] = useState(publicationToEdit?.modelo_aplicavel || '');
  const [ataCapitulo, setAtaCapitulo] = useState(publicationToEdit?.ata_capitulo || 'Geral');
  const [revisaoAtual, setRevisaoAtual] = useState(publicationToEdit?.revisao_atual || '');
  const [dataRevisao, setDataRevisao] = useState(publicationToEdit?.data_revisao || new Date().toISOString().split('T')[0]);
  const [meioDistribuicao, setMeioDistribuicao] = useState<MeioDistribuicao>(publicationToEdit?.meio_distribuicao || 'PORTAL_ONLINE');
  const [status, setStatus] = useState<StatusPublicacao>(publicationToEdit?.status || 'ATUALIZADO');
  const [idResponsavel, setIdResponsavel] = useState<number>(publicationToEdit?.id_responsavel_atualizacao || tecnicos[0]?.id_tecnico || 1);
  const [idCartaConcessao, setIdCartaConcessao] = useState<string>(publicationToEdit?.id_carta_concessao ? String(publicationToEdit.id_carta_concessao) : '');
  const [linkAcesso, setLinkAcesso] = useState(publicationToEdit?.link_acesso || '');
  const [observacoes, setObservacoes] = useState(publicationToEdit?.observacoes || 'N/A');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const carta = cartas.find((c) => c.id_carta_concessao === Number(idCartaConcessao));

    const payload: Partial<PublicacaoTecnicaF001_02_1> = {
      codigo_documento: codigoDocumento.trim() || 'N/A',
      titulo: titulo.trim() || 'N/A',
      tipo_documento: tipoDocumento,
      fabricante: fabricante.trim() || 'N/A',
      modelo_aplicavel: modeloAplicavel.trim() || 'N/A',
      ata_capitulo: ataCapitulo.trim() || 'N/A',
      revisao_atual: revisaoAtual.trim() || 'N/A',
      data_revisao: dataRevisao,
      meio_distribuicao: meioDistribuicao,
      status,
      id_responsavel_atualizacao: Number(idResponsavel),
      id_carta_concessao: idCartaConcessao ? Number(idCartaConcessao) : undefined,
      numero_carta_concessao: carta ? carta.numero_carta : 'N/A',
      link_acesso: linkAcesso.trim() || 'N/A',
      observacoes: observacoes.trim() || 'N/A',
    };

    try {
      if (publicationToEdit) {
        await apiClient.atualizarPublicacao(publicationToEdit.id_publicacao, payload);
      } else {
        await apiClient.cadastrarPublicacao(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar publicação técnica.');
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
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/40 rounded-lg text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {publicationToEdit ? 'EDITAR PUBLICAÇÃO TÉCNICA (F 001-02-1)' : 'NOVO MANUAL TÉCNICO NO LIVRO MESTRE (F 001-02-1)'}
              </h3>
              <p className="text-xs text-slate-400">
                Controle de Dados Técnicos de Fabricantes & Clientes — IS 145.109-001 / MOMQ I 001-02
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

          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg text-xs text-blue-300 flex items-center gap-2">
            <FileText className="w-4 h-4 shrink-0 text-blue-400" />
            <span>
              <strong>Regra Inviolável #1 MOMQ:</strong> Nenhum campo textual pode ser gravado vazio. Valores omitidos serão normalizados com <strong>"N/A"</strong>.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Código / Número do Documento *
              </label>
              <input
                type="text"
                required
                value={codigoDocumento}
                onChange={(e) => setCodigoDocumento(e.target.value)}
                placeholder="Ex: AMM-A320-REV54, C208-AMM-D100"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Publicação *
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as TipoDocumentoTecnico)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="AMM">AMM - Aircraft Maintenance Manual</option>
                <option value="IPC">IPC - Illustrated Parts Catalog</option>
                <option value="MPD">MPD - Maintenance Planning Document</option>
                <option value="SRM">SRM - Structural Repair Manual</option>
                <option value="WDM">WDM - Wiring Diagram Manual</option>
                <option value="CMM">CMM - Component Maintenance Manual</option>
                <option value="SB">SB - Service Bulletin</option>
                <option value="NDT">NDT - Non-Destructive Testing Manual</option>
                <option value="OUTRO">Outro Documento Técnico</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título Oficial da Publicação *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Aircraft Maintenance Manual (AMM) - Airbus A319/A320/A321"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fabricante *
              </label>
              <input
                type="text"
                required
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                placeholder="Ex: Airbus, Textron Aviation, CFM, P&WC"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Modelo Aplicável *
              </label>
              <input
                type="text"
                required
                value={modeloAplicavel}
                onChange={(e) => setModeloAplicavel(e.target.value)}
                placeholder="Ex: Airbus A320 Family, Cessna 208B, PT6A-114A"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Capítulo ATA / Categoria
              </label>
              <input
                type="text"
                value={ataCapitulo}
                onChange={(e) => setAtaCapitulo(e.target.value)}
                placeholder="Ex: Geral (00 a 80), ATA 24, ATA 72"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Revisão Atual *
              </label>
              <input
                type="text"
                required
                value={revisaoAtual}
                onChange={(e) => setRevisaoAtual(e.target.value)}
                placeholder="Ex: Rev. 54, Temp. Rev. 32-04"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meio de Distribuição *
              </label>
              <select
                value={meioDistribuicao}
                onChange={(e) => setMeioDistribuicao(e.target.value as MeioDistribuicao)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="PORTAL_ONLINE">Portal Online do Fabricante/Operador</option>
                <option value="DIGITAL_SERVIDOR">Digital (Servidor MRO Controlado)</option>
                <option value="FISICO_PASTA">Físico (Pasta de Documentação)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status de Validação *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusPublicacao)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ATUALIZADO">Atualizado (Conferido com Fabricante)</option>
                <option value="A_REVISAR">A Revisar (Necessita Verificação)</option>
                <option value="OBSOLETO">Obsoleto (Substituído / Cancelado)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Carta de Concessão Vinculada
              </label>
              <select
                value={idCartaConcessao}
                onChange={(e) => setIdCartaConcessao(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">N/A (Aquisição Própria Impacto)</option>
                {cartas.map((c) => (
                  <option key={c.id_carta_concessao} value={c.id_carta_concessao}>
                    {c.numero_carta} - {c.operador_cliente}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Responsável Técnico pela Atualização *
              </label>
              <select
                value={idResponsavel}
                onChange={(e) => setIdResponsavel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
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
                URL / Link de Acesso ao Portal Técnico
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={linkAcesso}
                  onChange={(e) => setLinkAcesso(e.target.value)}
                  placeholder="https://airbusworld.airbus.com ou https://1view.txtav.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações de Controle (Regra do N/A)
              </label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="N/A"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-900/30 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : publicationToEdit ? 'Atualizar Manual' : 'Cadastrar no Livro Mestre F 001-02-1'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
