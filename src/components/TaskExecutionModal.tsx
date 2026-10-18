import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  Wrench,
  Package,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  UserCheck,
  Plus,
  Trash2,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  ApontamentoTarefaOS,
  TecnicoComQualificacao,
  Ferramenta,
  MaterialAplicadoOS,
  FerramentaUtilizadaOS,
  TipoDocumentoRastreabilidade,
  ValidacaoDuplaAssinaturaIioResult,
} from '../types/mro';
import { apiClient } from '../services/apiClient';

interface TaskExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apontamento: ApontamentoTarefaOS | null;
  tecnicos: TecnicoComQualificacao[];
  ferramentasDisponiveis: Ferramenta[];
}

export const TaskExecutionModal: React.FC<TaskExecutionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  apontamento,
  tecnicos,
  ferramentasDisponiveis,
}) => {
  if (!isOpen || !apontamento) return null;

  // Form states
  const [descricaoPasso, setDescricaoPasso] = useState(apontamento.descricao_passo_a_passo || '');
  const [referenciaAmm, setReferenciaAmm] = useState(apontamento.referencia_amm_task || '');
  const [observacoes, setObservacoes] = useState(apontamento.observacoes || '');

  // Executor (Mecânico MMA)
  const [idMecanico, setIdMecanico] = useState<number>(apontamento.id_mecanico_executor || 5);
  const [rubricaMecanico, setRubricaMecanico] = useState(apontamento.rubrica_mecanico || '');

  // Inspetor APRS (para IIO ou inspeção final)
  const [idInspetorAprs, setIdInspetorAprs] = useState<number>(apontamento.id_inspetor_aprs || 3);
  const [rubricaInspetor, setRubricaInspetor] = useState(apontamento.rubrica_inspetor || '');

  // Nova peça / material
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [novoPn, setNovoPn] = useState('');
  const [novoSn, setNovoSn] = useState('');
  const [novoLote, setNovoLote] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaQtd, setNovaQtd] = useState(1);
  const [novoDocTipo, setNovoDocTipo] = useState<TipoDocumentoRastreabilidade>('EASA_FORM_1');
  const [novoDocNum, setNovoDocNum] = useState('');
  const [novaReqNum, setNovaReqNum] = useState('REQ-2026-');

  // Nova ferramenta check-out
  const [showAddTool, setShowAddTool] = useState(false);
  const [idFerramentaCheckout, setIdFerramentaCheckout] = useState<number>(1);

  // Validação IIO em tempo real
  const [validacaoIio, setValidacaoIio] = useState<ValidacaoDuplaAssinaturaIioResult | null>(null);
  const [isValidatingIio, setIsValidatingIio] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Executa checagem regulatória de Dupla Assinatura IIO
  useEffect(() => {
    if (!apontamento.is_iio) return;

    let isCancelled = false;
    const testarIio = async () => {
      setIsValidatingIio(true);
      try {
        const res = await apiClient.validarDuplaAssinaturaIio(idMecanico, idInspetorAprs);
        if (!isCancelled) setValidacaoIio(res);
      } catch (err) {
        console.error('Erro na validação IIO:', err);
      } finally {
        if (!isCancelled) setIsValidatingIio(false);
      }
    };

    testarIio();
    return () => {
      isCancelled = true;
    };
  }, [idMecanico, idInspetorAprs, apontamento.is_iio]);

  const handleSalvarDescricao = async () => {
    try {
      await apiClient.updateApontamento(apontamento.id_apontamento, {
        descricao_passo_a_passo: descricaoPasso,
        referencia_amm_task: referenciaAmm,
        observacoes,
      });
      alert('Descrição técnica da tarefa salva.');
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPn.trim() || !novaDescricao.trim() || !novoDocNum.trim()) {
      alert('Preencha os campos obrigatórios do material (PN, Descrição, Doc Rastreabilidade).');
      return;
    }

    try {
      await apiClient.addMaterialAplicado({
        id_os: apontamento.id_os,
        numero_os: apontamento.numero_os,
        part_number: novoPn.trim().toUpperCase(),
        serial_number: novoSn.trim() || 'N/A',
        lote_batch: novoLote.trim() || 'N/A',
        descricao: novaDescricao.trim(),
        quantidade: novaQtd,
        unidade_medida: 'UN',
        numero_requisicao_f001_01: novaReqNum.trim() || 'REQ-2026-N/A',
        tipo_documento_rastreabilidade: novoDocTipo,
        numero_documento_rastreabilidade: novoDocNum.trim(),
        id_mecanico_aplicador: idMecanico,
      });

      setShowAddMaterial(false);
      setNovoPn('');
      setNovoSn('');
      setNovoLote('');
      setNovaDescricao('');
      setNovoDocNum('');
      onSuccess();
    } catch (err: any) {
      alert(`Erro ao vincular material: ${err.message}`);
    }
  };

  const handleCheckoutFerramenta = async () => {
    try {
      const mec = tecnicos.find((t) => t.id_tecnico === idMecanico);
      await apiClient.registrarCheckoutFerramenta({
        id_os: apontamento.id_os,
        numero_os: apontamento.numero_os,
        id_ferramenta: idFerramentaCheckout,
        responsavel_checkout_nome: mec ? mec.nome_completo : 'Mecânico Executor',
      });
      setShowAddTool(false);
      onSuccess();
    } catch (err: any) {
      alert(`Bloqueio de Ferramental: ${err.message}`);
    }
  };

  const handleCheckinFerramenta = async (idUso: number) => {
    const condicao = window.prompt(
      'Informe a condição da ferramenta devolvida:\n1 - CONFORME_SEM_DANOS\n2 - AVARIADA_REQUER_QUARENTENA',
      '1'
    );
    if (!condicao) return;

    const condicaoEnum = condicao === '2' ? 'AVARIADA_REQUER_QUARENTENA' : 'CONFORME_SEM_DANOS';
    const insp = tecnicos.find((t) => t.id_tecnico === idInspetorAprs);

    try {
      await apiClient.registrarCheckinFerramenta(
        idUso,
        condicaoEnum,
        insp ? insp.nome_completo : 'Inspetor de Linha',
        condicaoEnum === 'AVARIADA_REQUER_QUARENTENA' ? 'Avaria identificada no retorno. Encaminhada para Quarentena.' : 'Conforme.'
      );
      onSuccess();
    } catch (err: any) {
      alert(`Erro no check-in: ${err.message}`);
    }
  };

  const handleAssinarExecucao = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // 1. Atualiza dados técnicos
      await apiClient.updateApontamento(apontamento.id_apontamento, {
        descricao_passo_a_passo: descricaoPasso,
        referencia_amm_task: referenciaAmm,
        id_mecanico_executor: idMecanico,
        rubrica_mecanico: rubricaMecanico,
        status_apontamento: 'EXECUTADO',
        observacoes,
      });

      // 2. Se for IIO e o Inspetor APRS estiver preenchido com dupla assinatura válida
      if (apontamento.is_iio) {
        if (!validacaoIio?.valido) {
          throw new Error(validacaoIio?.motivo_bloqueio || 'Falha na validação da Dupla Assinatura IIO.');
        }

        await apiClient.assinarInspecaoAprsIio(
          apontamento.id_apontamento,
          idInspetorAprs,
          rubricaInspetor
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar assinatura.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${apontamento.is_iio ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}>
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {apontamento.numero_os} • Item {apontamento.item_tarefa}
                </span>
                {apontamento.is_iio && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>IIO • INSPEÇÃO OBRIGATÓRIA</span>
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-0.5 truncate max-w-lg">
                {apontamento.titulo_tarefa}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal com Scroll */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-500 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ALERTA MANDATÓRIO IIO (Caso se aplique) */}
          {apontamento.is_iio && (
            <div className="p-4 bg-amber-950/30 border-2 border-amber-500/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>PROCEDIMENTO OBRIGATÓRIO: ITEM DE INSPEÇÃO OBRIGATÓRIA (IIO)</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  MOMQ 5.4 • P 001-07
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Esta tarefa foi classificada como crítica para a aeronavegabilidade (<strong>{apontamento.categoria_iio || 'Comandos e Estruturas Críticas'}</strong>). Conforme o RBAC 145.163 e MOMQ 5.4, é <strong>estritamente proibida a auto-inspeção</strong>. A conclusão desta tarefa exige <strong>DUPLA ASSINATURA OBRIGATÓRIA</strong>: 1) Mecânico Executor Habilitado; 2) Inspetor APRS Qualificado designado no Form F 001-03.
              </p>

              {validacaoIio && !validacaoIio.valido && (
                <div className="p-2.5 bg-rose-950/70 border border-rose-600 rounded-lg text-rose-200 text-[11px] flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span><strong>BLOQUEIO:</strong> {validacaoIio.motivo_bloqueio}</span>
                </div>
              )}
            </div>
          )}

          {/* DESCRIÇÃO PASSO A PASSO & REF TÉCNICA (Campos 15 & 16) */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white uppercase text-[11px] flex items-center space-x-1.5 font-mono">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Passo a Passo de Cumprimento & Referência Técnica (AMM / SRM)</span>
              </h3>
              <button
                type="button"
                onClick={handleSalvarDescricao}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline"
              >
                Salvar Rascunho
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">
                Referência Técnica do Manual (AMM Task):
              </label>
              <input
                type="text"
                value={referenciaAmm}
                onChange={(e) => setReferenciaAmm(e.target.value)}
                placeholder="Ex: AMM Task 32-30-00-400-801"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">
                Ações Executadas Passo a Passo pelo Mecânico:
              </label>
              <textarea
                value={descricaoPasso}
                onChange={(e) => setDescricaoPasso(e.target.value)}
                rows={3}
                placeholder="Descreva detalhadamente as etapas de desmontagem, inspeção, montagem, torqueamento e conexões..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* SEÇÃO DE MATERIAIS E PEÇAS APLICADOS (Campo 14) */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white uppercase text-[11px] flex items-center space-x-1.5 font-mono">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Materiais e Peças Aeronáuticas Aplicadas (Campo 14 • Rastreabilidade ARC)</span>
                </h3>
                <span className="text-[10px] text-slate-400">Rastreabilidade obrigatória EASA Form 1 / FAA 8130-3 / COC</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMaterial(!showAddMaterial)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Aplicar Peça</span>
              </button>
            </div>

            {/* Formulário Novo Material */}
            {showAddMaterial && (
              <form onSubmit={handleAddMaterial} className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">Part Number (P/N) *</label>
                    <input
                      type="text"
                      value={novoPn}
                      onChange={(e) => setNovoPn(e.target.value)}
                      placeholder="Ex: 32-1104-01"
                      required
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">Serial Number (S/N)</label>
                    <input
                      type="text"
                      value={novoSn}
                      onChange={(e) => setNovoSn(e.target.value)}
                      placeholder="Ex: HD-99214 ou N/A"
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">Lote / Batch</label>
                    <input
                      type="text"
                      value={novoLote}
                      onChange={(e) => setNovoLote(e.target.value)}
                      placeholder="Ex: LT-2025-081"
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">Qtd / Unidade</label>
                    <div className="flex space-x-1">
                      <input
                        type="number"
                        min="1"
                        value={novaQtd}
                        onChange={(e) => setNovaQtd(Number(e.target.value))}
                        className="w-16 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                      />
                      <span className="px-2 py-1.5 bg-slate-800 text-slate-400 rounded text-xs font-mono">UN</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">Descrição do Item *</label>
                    <input
                      type="text"
                      value={novaDescricao}
                      onChange={(e) => setNovaDescricao(e.target.value)}
                      placeholder="Ex: Sensor de Pressão Hidráulica Principal"
                      required
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">Nº Requisição F 001-01</label>
                    <input
                      type="text"
                      value={novaReqNum}
                      onChange={(e) => setNovaReqNum(e.target.value)}
                      placeholder="REQ-2026-0098"
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">Documento de Rastreabilidade *</label>
                    <select
                      value={novoDocTipo}
                      onChange={(e) => setNovoDocTipo(e.target.value as TipoDocumentoRastreabilidade)}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    >
                      <option value="EASA_FORM_1">EASA Form 1 (Aprovado EASA.145)</option>
                      <option value="FAA_8130_3">FAA Form 8130-3 (Airworthiness Tag)</option>
                      <option value="ANAC_ARC_SEGVOO">ANAC ARC / Certificado de Aeronavegabilidade</option>
                      <option value="CERTIFICADO_FABRICANTE_COC">Certificado de Conformidade Fabricante (C of C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-0.5">Número do Documento / Tag *</label>
                    <input
                      type="text"
                      value={novoDocNum}
                      onChange={(e) => setNovoDocNum(e.target.value)}
                      placeholder="Ex: 2025-EASA-991204"
                      required
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddMaterial(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-400 hover:text-white rounded text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs shadow"
                  >
                    Confirmar Aplicação na OS
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Materiais Aplicados */}
            <div className="space-y-1.5">
              {apontamento.materiais_aplicados && apontamento.materiais_aplicados.length > 0 ? (
                apontamento.materiais_aplicados.map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-emerald-300">
                        {m.descricao} • P/N: {m.part_number} {m.serial_number !== 'N/A' && `(S/N: ${m.serial_number})`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {m.tipo_documento_rastreabilidade}: <strong>{m.numero_documento_rastreabilidade}</strong> • Req: {m.numero_requisicao_f001_01} • Lote: {m.lote_batch}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      APLICADO
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-500 italic p-2 bg-slate-900/40 rounded-lg">
                  Nenhum componente ou material aeronáutico associado a este item da OS até o momento.
                </div>
              )}
            </div>
          </div>

          {/* SEÇÃO DE FERRAMENTAL PME UTILIZADO (Check-in / Check-out - Form F 001-06-1) */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white uppercase text-[11px] flex items-center space-x-1.5 font-mono">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Ferramentas PME Utilizadas (Form F 001-06-1 • Metrologia & Rastreabilidade)</span>
                </h3>
                <span className="text-[10px] text-slate-400">Rastreabilidade metrológica com certificado RBC e controle de devolução</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTool(!showAddTool)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Check-out PME</span>
              </button>
            </div>

            {/* Check-out de Ferramenta */}
            {showAddTool && (
              <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-slate-300">Selecione a Ferramenta Disponível na Ferramentaria:</label>
                <select
                  value={idFerramentaCheckout}
                  onChange={(e) => setIdFerramentaCheckout(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                >
                  {ferramentasDisponiveis.map((f) => (
                    <option key={f.id_ferramenta} value={f.id_ferramenta}>
                      {f.descricao} (P/N: {f.part_number}, S/N: {f.serial_number}) - Validade: {f.ultima_calibracao?.data_vencimento || 'N/A'} [{f.status}]
                    </option>
                  ))}
                </select>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTool(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-400 rounded text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckoutFerramenta}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs shadow"
                  >
                    Registrar Retirada (Check-out)
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Ferramentas Registradas */}
            <div className="space-y-1.5">
              {apontamento.ferramentas_utilizadas && apontamento.ferramentas_utilizadas.length > 0 ? (
                apontamento.ferramentas_utilizadas.map((u, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-amber-300">
                        {u.descricao} (P/N: {u.part_number}, S/N: {u.serial_number})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Laudo RBC: {u.numero_laudo_calibracao} • Validade: {u.data_vencimento_calibracao} • Retirado por: {u.responsavel_checkout_nome}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${u.condicao_devolucao === 'PENDENTE_DEVOLUCAO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {u.condicao_devolucao === 'PENDENTE_DEVOLUCAO' ? 'EM USO' : 'DEVOLVIDA'}
                      </span>
                      {u.condicao_devolucao === 'PENDENTE_DEVOLUCAO' && (
                        <button
                          type="button"
                          onClick={() => handleCheckinFerramenta(u.id_uso_ferramenta)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-700"
                        >
                          Check-in
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-500 italic p-2 bg-slate-900/40 rounded-lg">
                  Nenhuma ferramenta PME vinculada a este apontamento.
                </div>
              )}
            </div>
          </div>

          {/* SEÇÃO DE ASSINATURA TÉCNICA E APRS */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-white uppercase text-[11px] font-mono flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Assinaturas Técnicas de Execução e Inspeção APRS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Assinatura do Mecânico Executor */}
              <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200">1. Mecânico Executor (MMA) *</label>
                  <span className="text-[10px] font-mono text-cyan-400">RBAC 65</span>
                </div>
                <select
                  value={idMecanico}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setIdMecanico(id);
                    const mec = tecnicos.find((t) => t.id_tecnico === id);
                    if (mec) setRubricaMecanico(`${mec.nome_completo.split(' ').map((n) => n[0]).join('')}-${mec.canac}`);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs focus:outline-none"
                >
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} (CANAC: {t.canac}) {t.qualificacao.is_apto ? '✓' : '✗ BLOQUEADO'}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Rubrica / Assinatura Digital:</label>
                  <input
                    type="text"
                    value={rubricaMecanico}
                    onChange={(e) => setRubricaMecanico(e.target.value)}
                    placeholder="Ex: MVS-114522"
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              {/* 2. Assinatura do Inspetor APRS (Mandatória se IIO) */}
              <div className={`p-3 rounded-xl border space-y-2 ${apontamento.is_iio ? 'bg-amber-950/20 border-amber-500/50' : 'bg-slate-900/90 border-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center space-x-1">
                    <span>2. Inspetor APRS Designado</span>
                    {apontamento.is_iio && <span className="text-amber-400 font-black">* OBRIGATÓRIO (IIO)</span>}
                  </label>
                  <span className="text-[10px] font-mono text-amber-400">Form F 001-03</span>
                </div>
                <select
                  value={idInspetorAprs}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setIdInspetorAprs(id);
                    const insp = tecnicos.find((t) => t.id_tecnico === id);
                    if (insp) setRubricaInspetor(`${insp.nome_completo.split(' ').map((n) => n[0]).join('')}-${insp.canac}-APRS`);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs focus:outline-none"
                >
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} (CANAC: {t.canac}) {t.qualificacao.aprovado_aprs ? '✓ APRS' : '✗ SEM APRS'}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Rubrica Inspetor APRS:</label>
                  <input
                    type="text"
                    value={rubricaInspetor}
                    onChange={(e) => setRubricaInspetor(e.target.value)}
                    placeholder="Ex: JCS-114521-APRS"
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AVISO MANDATÓRIO DE PREVENÇÃO FOD */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="block uppercase text-[10px] font-mono font-bold">Aviso Mandatório de Prevenção FOD:</strong>
              <span>"AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO."</span>
            </div>
          </div>
        </div>

        {/* Footer do Modal com Botões de Ação */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-t border-slate-700">
          <div className="text-[11px] font-mono">
            {apontamento.is_iio ? (
              validacaoIio?.valido ? (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Dupla Assinatura IIO Conforme (Mecânico ≠ Inspetor APRS).</span>
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center space-x-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Trava IIO Ativa: Selecione técnicos distintos habilitados.</span>
                </span>
              )
            ) : (
              <span className="text-slate-400">Tarefa Regular • Assinatura do Executor habilitada.</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAssinarExecucao}
              disabled={isSubmitting || (apontamento.is_iio && !validacaoIio?.valido)}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Confirmar e Assinar Apontamento'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
