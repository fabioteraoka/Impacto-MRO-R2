import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  FileSpreadsheet,
  Wrench,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  RelatorioInspecaoF001_12,
  OrdemServicoF001_09_2,
  TecnicoComQualificacao,
  TipoInspecaoRI,
  SeveridadeRI,
} from '../types/mro';
import { apiClient } from '../services/apiClient';

interface RiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  riExistente?: RelatorioInspecaoF001_12 | null;
  ordensServico: OrdemServicoF001_09_2[];
  tecnicos: TecnicoComQualificacao[];
}

export const RiModal: React.FC<RiModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  riExistente,
  ordensServico,
  tecnicos,
}) => {
  if (!isOpen) return null;

  const isEditing = !!riExistente;

  // New RI states
  const [idOs, setIdOs] = useState<number>(riExistente?.id_os || (ordensServico[0]?.id_os || 1));
  const [tipoInspecao, setTipoInspecao] = useState<TipoInspecaoRI>(riExistente?.tipo_inspecao || 'PRELIMINAR');
  const [descricaoDiscrepancia, setDescricaoDiscrepancia] = useState(riExistente?.descricao_discrepancia || '');
  const [localizacao, setLocalizacao] = useState(riExistente?.localizacao_aeronave || '');
  const [referenciaManual, setReferenciaManual] = useState(riExistente?.referencia_manual_defeito || '');
  const [severidade, setSeveridade] = useState<SeveridadeRI>(riExistente?.severidade || 'MAIOR');
  const [isIio, setIsIio] = useState<boolean>(riExistente?.is_iio || false);
  const [acaoExigida, setAcaoExigida] = useState(riExistente?.acao_corretiva_exigida || '');
  const [idInspetorAbertura, setIdInspetorAbertura] = useState<number>(riExistente?.id_inspetor_abertura || 3);

  // Resolution states (Mechanic)
  const [acaoExecutada, setAcaoExecutada] = useState(riExistente?.acao_corretiva_executada || '');
  const [idMecanicoResolucao, setIdMecanicoResolucao] = useState<number>(riExistente?.id_mecanico_execucao || 5);

  // Approval states (APRS)
  const [idInspetorAprovacao, setIdInspetorAprovacao] = useState<number>(riExistente?.id_inspetor_aprovacao || 3);
  const [observacoesAprovacao, setObservacoesAprovacao] = useState(riExistente?.observacoes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedOs = ordensServico.find((os) => os.id_os === idOs);

  const handleCriarRi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricaoDiscrepancia.trim() || !acaoExigida.trim()) {
      setErrorMessage('Preencha a descrição da discrepância e a ação corretiva exigida.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiClient.createRelatorioInspecao({
        id_os: idOs,
        tipo_inspecao: tipoInspecao,
        descricao_discrepancia: descricaoDiscrepancia.trim(),
        localizacao_aeronave: localizacao.trim() || 'N/A',
        referencia_manual_defeito: referenciaManual.trim() || 'AMM Reference',
        severidade,
        is_iio: isIio,
        acao_corretiva_exigida: acaoExigida.trim(),
        id_inspetor_abertura: idInspetorAbertura,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao abrir RI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolverRi = async () => {
    if (!riExistente) return;
    if (!acaoExecutada.trim()) {
      alert('Descreva a ação corretiva executada pelo mecânico.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiClient.resolverRelatorioInspecao(
        riExistente.id_ri,
        acaoExecutada.trim(),
        idMecanicoResolucao
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar ação corretiva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAprovarRi = async () => {
    if (!riExistente) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiClient.aprovarRelatorioInspecao(
        riExistente.id_ri,
        idInspetorAprovacao,
        observacoesAprovacao
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao aprovar e encerrar RI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700">
                  FORM F 001-12
                </span>
                {riExistente && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {riExistente.numero_ri}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {isEditing ? `Gestão do Relatório de Inspeção: ${riExistente.numero_ri}` : 'Abertura de Relatório de Inspeção (RI)'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-500 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Banner de Trava Regulatória */}
          <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl text-[11px] text-rose-200 space-y-1">
            <div className="font-bold flex items-center space-x-1 text-rose-400">
              <ShieldCheck className="w-4 h-4" />
              <span>TRAVA REGULATÓRIA OBRIGATÓRIA (MOMQ / RBAC 145 / EASA):</span>
            </div>
            <p>
              A Ordem de Serviço permanece formalmente <strong>bloqueada para encerramento</strong> enquanto houver qualquer Relatório de Inspeção (RI) em aberto. A liberação exige resolução técnica e homologação pelo Inspetor APRS.
            </p>
          </div>

          {!isEditing ? (
            /* CRIAÇÃO DE NOVO RI */
            <form onSubmit={handleCriarRi} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Vincular à Ordem de Serviço (OS) *</label>
                  <select
                    value={idOs}
                    onChange={(e) => setIdOs(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  >
                    {ordensServico.map((os) => (
                      <option key={os.id_os} value={os.id_os}>
                        {os.numero_os} - {os.campo_02_matricula} ({os.campo_03_modelo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Tipo de Inspeção *</label>
                  <select
                    value={tipoInspecao}
                    onChange={(e) => setTipoInspecao(e.target.value as TipoInspecaoRI)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  >
                    <option value="PRELIMINAR">Inspeção Preliminar de Recebimento</option>
                    <option value="TRANSITO">Inspeção de Trânsito / Linha</option>
                    <option value="DIRETRIZ_AD">Inspeção Mandatória de Diretriz (AD/DA)</option>
                    <option value="NAO_CONFORMIDADE_LINHA">Não Conformidade em Hangar</option>
                    <option value="RECEBIMENTO_PECAS">Recebimento e Inspeção de Peças</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Localização na Aeronave *</label>
                  <input
                    type="text"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    placeholder="Ex: Trem de Pouso Principal Direito / Eixo Roda #2 (JASC 32-40)"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Severidade *</label>
                  <select
                    value={severidade}
                    onChange={(e) => setSeveridade(e.target.value as SeveridadeRI)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  >
                    <option value="MENOR">Menor</option>
                    <option value="MAIOR">Maior</option>
                    <option value="CRITICA_AOG">Crítica (AOG / Voo Impedido)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Referência Técnica do Manual (AMM/SRM)</label>
                <input
                  type="text"
                  value={referenciaManual}
                  onChange={(e) => setReferenciaManual(e.target.value)}
                  placeholder="Ex: SRM ATR 72 JASC 57-10 / AMM 32-40-10"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Descrição Detalhada da Não Conformidade / Discrepância *</label>
                <textarea
                  value={descricaoDiscrepancia}
                  onChange={(e) => setDescricaoDiscrepancia(e.target.value)}
                  rows={3}
                  placeholder="Relate os indícios, medidas aferidas, folgas, trincas ou vazamentos encontrados fora dos padrões..."
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Ação Corretiva Exigida pelo Inspetor *</label>
                <textarea
                  value={acaoExigida}
                  onChange={(e) => setAcaoExigida(e.target.value)}
                  rows={2}
                  placeholder="Ex: Substituição mandatória do componente avariado e realização de ensaio não-destrutivo..."
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="chk-iio"
                    checked={isIio}
                    onChange={(e) => setIsIio(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-0"
                  />
                  <label htmlFor="chk-iio" className="text-slate-200 font-bold cursor-pointer">
                    Classificar Discrepância como Item de Inspeção Obrigatória (IIO)
                  </label>
                </div>
                <span className="text-[10px] text-amber-400 font-mono">MOMQ 5.4</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Inspetor Responsável pela Abertura *</label>
                <select
                  value={idInspetorAbertura}
                  onChange={(e) => setIdInspetorAbertura(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                >
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} (CANAC: {t.canac}) {t.qualificacao.aprovado_aprs ? '✓ APRS' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center space-x-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Abrindo...' : 'Abrir Relatório de Inspeção (RI)'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* VISUALIZAÇÃO E WORKFLOW DE RESOLUÇÃO / APROVAÇÃO DO RI */
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-700 pb-1">
                  <span>OS: <strong>{riExistente.numero_os}</strong> ({riExistente.matricula_aeronave})</span>
                  <span>Aberto em: {riExistente.data_abertura} {riExistente.hora_abertura}</span>
                </div>
                <div className="text-xs">
                  <strong className="text-white block">Não Conformidade:</strong>
                  <p className="text-slate-300 mt-0.5">{riExistente.descricao_discrepancia}</p>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Localização: {riExistente.localizacao_aeronave} • Ref: {riExistente.referencia_manual_defeito}
                </div>
                <div className="p-2 bg-slate-900 rounded text-xs text-rose-300 border border-rose-950">
                  <strong>Ação Exigida:</strong> {riExistente.acao_corretiva_exigida}
                </div>
              </div>

              {/* Status do RI */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Status Atual:</span>
                <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs ${
                  riExistente.status_ri === 'APROVADO_ENCERRADO'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : riExistente.status_ri === 'RESOLVIDO_AGUARDANDO_APRS'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {riExistente.status_ri}
                </span>
              </div>

              {/* ETAPA 1: Registro da Ação Corretiva pelo Mecânico */}
              {riExistente.status_ri === 'ABERTO_PENDENTE' && (
                <div className="p-4 bg-slate-800/80 border border-blue-500/30 rounded-xl space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center space-x-1.5 font-mono">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span>Etapa 1 • Execução da Ação Corretiva (Mecânico MMA)</span>
                  </h4>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Ação Corretiva Executada *</label>
                    <textarea
                      value={acaoExecutada}
                      onChange={(e) => setAcaoExecutada(e.target.value)}
                      rows={3}
                      placeholder="Descreva a remoção, instalação, teste funcional ou inspeção corretiva realizada conforme AMM..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Mecânico Executor *</label>
                    <select
                      value={idMecanicoResolucao}
                      onChange={(e) => setIdMecanicoResolucao(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    >
                      {tecnicos.map((t) => (
                        <option key={t.id_tecnico} value={t.id_tecnico}>
                          {t.nome_completo} (CANAC: {t.canac})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleResolverRi}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow transition"
                  >
                    {isSubmitting ? 'Registrando...' : 'Registrar Resolução e Encaminhar para Inspeção APRS'}
                  </button>
                </div>
              )}

              {/* ETAPA 2: Aprovação e Encerramento pelo Inspetor APRS */}
              {(riExistente.status_ri === 'RESOLVIDO_AGUARDANDO_APRS' || riExistente.status_ri === 'ABERTO_PENDENTE') && (
                <div className="p-4 bg-slate-800/80 border border-emerald-500/30 rounded-xl space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center space-x-1.5 font-mono">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Etapa 2 • Aprovação Final & Baixa do RI (Inspetor APRS)</span>
                  </h4>
                  {riExistente.acao_corretiva_executada && (
                    <div className="p-2.5 bg-slate-900 rounded text-xs text-slate-200 border border-slate-700">
                      <strong className="text-cyan-400 block text-[11px]">Ação Executada pelo Mecânico:</strong>
                      <p className="mt-0.5">{riExistente.acao_corretiva_executada}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Inspetor APRS Homologado *</label>
                    <select
                      value={idInspetorAprovacao}
                      onChange={(e) => setIdInspetorAprovacao(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    >
                      {tecnicos.map((t) => (
                        <option key={t.id_tecnico} value={t.id_tecnico}>
                          {t.nome_completo} (CANAC: {t.canac}) {t.qualificacao.aprovado_aprs ? '✓ APRS' : '✗ SEM APRS'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Parecer de Conformidade / Observações</label>
                    <input
                      type="text"
                      value={observacoesAprovacao}
                      onChange={(e) => setObservacoesAprovacao(e.target.value)}
                      placeholder="Conformidade atestada. Peça substituída com Form 1. Liberado para voo."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAprovarRi}
                    disabled={isSubmitting || riExistente.status_ri === 'ABERTO_PENDENTE'}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg text-xs shadow transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Aprovando...' : 'Aprovar e Encerrar RI (Liberar Trava da OS)'}</span>
                  </button>
                </div>
              )}

              {riExistente.status_ri === 'APROVADO_ENCERRADO' && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center space-x-2 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">Relatório de Inspeção Concluído e Homologado:</strong>
                    <span>Aprovado pelo Inspetor APRS {riExistente.inspetor_aprovacao_nome} (CANAC: {riExistente.inspetor_aprovacao_canac}). Não há pendências de fechamento.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
