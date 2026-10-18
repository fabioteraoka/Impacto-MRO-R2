import React, { useState } from 'react';
import {
  Wrench,
  X,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Ferramenta, BaseOperacional } from '../types/mro';
import { apiClient } from '../services/apiClient';

interface ToolModalProps {
  toolToEdit?: Ferramenta | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bases: BaseOperacional[];
}

export const ToolModal: React.FC<ToolModalProps> = ({
  toolToEdit,
  isOpen,
  onClose,
  onSuccess,
  bases,
}) => {
  const [descricao, setDescricao] = useState(toolToEdit?.descricao || '');
  const [partNumber, setPartNumber] = useState(toolToEdit?.part_number || '');
  const [serialNumber, setSerialNumber] = useState(toolToEdit?.serial_number || '');
  const [fabricante, setFabricante] = useState(toolToEdit?.fabricante || '');
  const [modelo, setModelo] = useState(toolToEdit?.modelo || '');
  const [tipoFerramenta, setTipoFerramenta] = useState(toolToEdit?.tipo_ferramenta || 'TORQUIMETRO');
  const [localizacaoFisica, setLocalizacaoFisica] = useState(toolToEdit?.localizacao_fisica || 'ARM-A-01');
  const [propriedade, setPropriedade] = useState<'PROPRIA' | 'TERCEIROS' | 'ALUGADA'>(
    toolToEdit?.propriedade || 'PROPRIA'
  );
  const [requerCalibracao, setRequerCalibracao] = useState(
    toolToEdit ? toolToEdit.requer_calibracao : true
  );
  const [periodicidadeMeses, setPeriodicidadeMeses] = useState<number>(
    toolToEdit?.periodicidade_meses || 12
  );
  const [idBase, setIdBase] = useState<number>(
    toolToEdit?.id_base || (bases[0]?.id_base ?? 1)
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    // Regra Inviolável #1: N/A obrigatório se vazio
    const payload = {
      descricao: descricao.trim() || 'N/A',
      part_number: partNumber.trim() || 'N/A',
      serial_number: serialNumber.trim() || 'N/A',
      fabricante: fabricante.trim() || 'N/A',
      modelo: modelo.trim() || 'N/A',
      tipo_ferramenta: tipoFerramenta.trim() || 'N/A',
      localizacao_fisica: localizacaoFisica.trim() || 'N/A',
      propriedade,
      requer_calibracao: Boolean(requerCalibracao),
      periodicidade_meses: requerCalibracao ? Number(periodicidadeMeses) : 0,
      id_base: Number(idBase)
    };

    try {
      if (toolToEdit) {
        await apiClient.atualizarFerramenta(toolToEdit.id_ferramenta, payload);
      } else {
        await apiClient.cadastrarFerramenta(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar ferramenta');
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
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {toolToEdit ? 'EDITAR FERRAMENTA / EQUIPAMENTO' : 'NOVO CADASTRO DE FERRAMENTAL'}
              </h3>
              <p className="text-xs text-slate-400">
                Inventário Técnico MRO — Impacto Aviation (COM 200607-05 / EASA.145.1003)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Banner Regra do N/A */}
          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg text-xs text-blue-300 flex items-center gap-2">
            <FileText className="w-4 h-4 shrink-0 text-blue-400" />
            <span>
              <strong>Regra #1 MOMQ:</strong> Nenhum campo será gravado em branco. Se não aplicável, o sistema registrará automaticamente a string <strong>"N/A"</strong>.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição da Ferramenta / Equipamento *
              </label>
              <input
                type="text"
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="Ex: Torquímetro de Estalo 1/2 Pol 20-100 Nm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Part Number (PN) *
              </label>
              <input
                type="text"
                required
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="Ex: TORQ-100-SNAP"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Serial Number (SN) *
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="Ex: SN-2024-8841"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fabricante
              </label>
              <input
                type="text"
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="Ex: Snap-On / Gedore / Stahlwille"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Modelo
              </label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="Ex: PRO-CLICK-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria / Tipo de Ferramenta
              </label>
              <select
                value={tipoFerramenta}
                onChange={(e) => setTipoFerramenta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="TORQUIMETRO">Torquímetro (PME Calibrável)</option>
                <option value="MULTIMETRO">Multímetro Digital (Aviônica)</option>
                <option value="MANOMETRO">Manômetro Hidráulico / Pneumático</option>
                <option value="PAQUIMETRO">Paquímetro / Micrômetro</option>
                <option value="TESTADOR_PITOT">Mala de Teste Pitot-Estática</option>
                <option value="ESPECIAL_MOTOR">Ferramenta Especial de Motor</option>
                <option value="MECANICA_GERAL">Mecânica Geral (Sem Calibração)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Propriedade
              </label>
              <select
                value={propriedade}
                onChange={(e) => setPropriedade(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="PROPRIA">Própria (Impacto Aviation)</option>
                <option value="TERCEIROS">Terceiros (Cliente / Operador)</option>
                <option value="ALUGADA">Alugada / Locação Externa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Posição Física no Armário / Prateleira *
              </label>
              <input
                type="text"
                required
                value={localizacaoFisica}
                onChange={(e) => setLocalizacaoFisica(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                placeholder="Ex: ARM-A-01, GAVETA-03, BANCA-02"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Base Operacional Alocada
              </label>
              <select
                value={idBase}
                onChange={(e) => setIdBase(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {bases.map(b => (
                  <option key={b.id_base} value={b.id_base}>
                    {b.nome_base} ({b.codigo_anac})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requerCalibracao}
                  onChange={(e) => setRequerCalibracao(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-white">
                  Ferramenta requer calibração periódica (PME - F 001-06)
                </span>
              </label>
            </div>

            {requerCalibracao && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Periodicidade de Calibração (meses) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={periodicidadeMeses}
                  onChange={(e) => setPeriodicidadeMeses(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Padrão MOMQ MNT-001: 12 meses para torquímetros e manômetros.
                </p>
              </div>
            )}
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
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-lg shadow-amber-900/30 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : toolToEdit ? 'Atualizar Ferramenta' : 'Cadastrar Ferramenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
