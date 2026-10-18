import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  X,
  FileText,
  Printer,
  Calendar,
  User,
  Wrench,
  CheckCircle,
  Tag,
  ArrowRight,
  Info
} from 'lucide-react';
import { FerramentaDetalhada, QuarentenaFerramentaF001_06_4, PessoalTecnico } from '../types/mro';
import { apiClient } from '../services/apiClient';

interface QuarantineModalProps {
  tool: FerramentaDetalhada;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tecnicos: PessoalTecnico[];
}

export const QuarantineModal: React.FC<QuarantineModalProps> = ({
  tool,
  isOpen,
  onClose,
  onSuccess,
  tecnicos
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'tag' | 'ficha'>('create');
  const [motivo, setMotivo] = useState(
    tool.status_calibracao === 'VENCIDA'
      ? 'Calibração periódica vencida conforme F 001-06 / MOMQ'
      : 'Dano físico constatado / falha operacional'
  );
  const [idResponsavel, setIdResponsavel] = useState<number>(
    tecnicos.find(t => t.cargo === 'Inspetor' || t.cargo === 'Inspetor Chefe' || t.cargo === 'RT')?.id_tecnico ||
    tecnicos[0]?.id_tecnico || 1
  );
  const [observacoes, setObservacoes] = useState('N/A');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If tool is already in quarantine, default to viewing the Tag or Ficha
  const activeQuarantine = tool.quarentenas?.find((q: QuarentenaFerramentaF001_06_4) => q.status_resolucao === 'RETIDO_QUARENTENA');

  const isAlreadyInQuarantine = tool.status_operacional === 'QUARENTENA';

  const handleSendToQuarantine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await apiClient.segregarParaQuarentena(tool.id_ferramenta, {
        motivo,
        id_responsavel: Number(idResponsavel),
        observacoes: observacoes || 'N/A'
      });
      onSuccess();
      setActiveTab('tag');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao segregar ferramenta para quarentena');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveQuarantine = async (idQuarentena: number, resolucao: 'ENVIADO_AFERICAO' | 'SUCATEADO' | 'LIBERADO_APOS_CALIBRACAO') => {
    setSubmitting(true);
    try {
      await apiClient.resolverQuarentena(idQuarentena, {
        status_resolucao: resolucao,
        data_resolucao: new Date().toISOString().split('T')[0],
        observacoes: `Resolução aprovada via painel regulatório Impacto Aviation (${resolucao})`
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar quarentena');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-b border-red-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500/40 rounded-lg text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  MÓDULO DE SEGREGAÇÃO & QUARENTENA
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-900/60 border border-red-700/60 text-red-200 rounded">
                  Form F 001-06-04
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-950 border border-red-500/80 text-red-300 rounded font-mono">
                  Tag F 001-01-6
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Impacto Aviation (COM 200607-05 / EASA.145.1003) — Regra Inviolável #2: Trava de Quarentena
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

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
          {!isAlreadyInQuarantine && (
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'create'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              Segregar Ferramenta
            </button>
          )}
          <button
            onClick={() => setActiveTab('tag')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'tag'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            Tag Vermelha F 001-01-6
          </button>
          <button
            onClick={() => setActiveTab('ficha')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'ficha'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Ficha de Quarentena F 001-06-04
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-sm text-red-300 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: FORM TO SEND TO QUARANTINE */}
          {activeTab === 'create' && !isAlreadyInQuarantine && (
            <form onSubmit={handleSendToQuarantine} className="space-y-4">
              {/* Tool Summary Card */}
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      Ferramenta a ser Segregada
                    </span>
                    <h4 className="text-base font-semibold text-white mt-0.5">
                      {tool.descricao}
                    </h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500">Part Number: </span>
                        <span className="font-mono text-white">{tool.part_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Serial Number: </span>
                        <span className="font-mono text-white">{tool.serial_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Posição Atual: </span>
                        <span className="text-amber-300">{tool.localizacao_fisica}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Status Operacional: </span>
                        <span className="px-2 py-0.5 rounded bg-slate-700 font-mono text-white text-[11px]">
                          {tool.status_operacional}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory Notice */}
              <div className="p-3 bg-red-950/40 border border-red-700/50 rounded-lg flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-red-200 leading-relaxed">
                  <strong className="text-red-300">Regra Inviolável #2 (Zero Risk Audit):</strong> Ao registrar esta segregação, o sistema bloqueará imediatamente a ferramenta com o status <strong className="font-mono text-white">QUARENTENA</strong> e transferirá a localização física para a Área de Quarentena Segregada. A ferramenta ficará estritamente impedida de ser vinculada a qualquer Ordem de Serviço (OS) ou de ser retirada por técnicos.
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Motivo da Segregação (F 001-06-04) *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                    placeholder="Ex: Calibração vencida em 20/09/2026 / Instrumento com dano no visor / Desvio padrão reprovado conforme BTI-PMP-05"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Responsável pela Transferência (Inspetor / RT / MMA) *
                    </label>
                    <select
                      value={idResponsavel}
                      onChange={(e) => setIdResponsavel(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                    >
                      {tecnicos.map(t => (
                        <option key={t.id_tecnico} value={t.id_tecnico}>
                          {t.nome_completo} ({t.cargo} - CANAC: {t.canac})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Observações Adicionais (Regra do N/A Obrigatório)
                    </label>
                    <input
                      type="text"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                      placeholder="N/A"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-900/40 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {submitting ? 'Segregando...' : 'Confirmar Segregação & Emitir Tag F 001-01-6'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: OFFICIAL RED TAG F 001-01-6 */}
          {activeTab === 'tag' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">
                  Visualização da Etiqueta Regulamentar de Identificação de Material Não Utilizável
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Tag F 001-01-6
                </button>
              </div>

              {/* THE OFFICIAL RED TAG (ETIQUETA VERMELHA) */}
              <div className="max-w-md mx-auto bg-red-600 text-white p-5 rounded-lg border-4 border-red-800 shadow-2xl relative font-sans">
                {/* Hole punch simulation for physical tag wire */}
                <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-white/80 mx-auto mb-3 shadow-inner"></div>

                {/* Header */}
                <div className="text-center border-b-2 border-white/60 pb-2 mb-3">
                  <div className="text-[10px] tracking-widest font-black uppercase text-red-100">
                    IMPACTO AVIATION LTDA
                  </div>
                  <div className="text-[9px] font-mono text-red-200">
                    COM 200607-05 / ANAC | EASA.145.1003
                  </div>
                  <div className="mt-1 text-base font-black tracking-wider uppercase bg-red-800 text-white py-1 px-2 rounded border border-white/40">
                    MATERIAL NÃO UTILIZÁVEL
                  </div>
                  <div className="text-[10px] font-bold text-red-100 mt-0.5">
                    FORMULÁRIO F 001-01-6 (TAG VERMELHA)
                  </div>
                </div>

                {/* Content details */}
                <div className="space-y-2 text-xs bg-red-700/80 p-3 rounded border border-red-500/80">
                  <div className="flex justify-between border-b border-red-500/50 pb-1">
                    <span className="font-bold uppercase text-red-200 text-[10px]">DESCRIÇÃO:</span>
                    <span className="font-semibold text-right">{tool.descricao}</span>
                  </div>
                  <div className="flex justify-between border-b border-red-500/50 pb-1">
                    <span className="font-bold uppercase text-red-200 text-[10px]">PART NUMBER (PN):</span>
                    <span className="font-mono font-bold">{tool.part_number}</span>
                  </div>
                  <div className="flex justify-between border-b border-red-500/50 pb-1">
                    <span className="font-bold uppercase text-red-200 text-[10px]">SERIAL NUMBER (SN):</span>
                    <span className="font-mono font-bold">{tool.serial_number}</span>
                  </div>
                  <div className="flex justify-between border-b border-red-500/50 pb-1">
                    <span className="font-bold uppercase text-red-200 text-[10px]">DATA SEGREGAÇÃO:</span>
                    <span className="font-mono font-bold">
                      {activeQuarantine?.data_segregacao || new Date().toISOString().split('T')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-red-500/50 pb-1">
                    <span className="font-bold uppercase text-red-200 text-[10px]">RESPONSÁVEL:</span>
                    <span className="font-semibold">
                      {tecnicos.find(t => t.id_tecnico === activeQuarantine?.id_responsavel)?.nome_completo || 'Inspetor de Qualidade'}
                    </span>
                  </div>
                  <div className="border-b border-red-500/50 pb-1">
                    <span className="font-bold uppercase text-red-200 text-[10px] block">MOTIVO DA REJEIÇÃO:</span>
                    <span className="italic text-[11px] text-white block mt-0.5">
                      {activeQuarantine?.motivo || motivo}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-red-200 text-[10px] block">DESTINAÇÃO / RESOLUÇÃO:</span>
                    <span className="font-mono font-bold text-amber-200 text-[11px]">
                      {activeQuarantine?.status_resolucao || 'RETIDO EM ÁREA SEGREGADA (QUARENTENA)'}
                    </span>
                  </div>
                </div>

                {/* Footer warning */}
                <div className="mt-3 text-center bg-black/40 p-2 rounded border border-white/30">
                  <p className="text-[10px] font-black uppercase text-yellow-300 tracking-wider">
                    ATENÇÃO: PROIBIDO O USO EM AERONAVES OU COMPONENTES
                  </p>
                  <p className="text-[9px] text-slate-300">
                    Conforme RBAC 145 / MOMQ MNT-001 Rev 08
                  </p>
                </div>
              </div>

              {/* Status resolution actions if in quarantine */}
              {isAlreadyInQuarantine && activeQuarantine && (
                <div className="mt-6 p-4 bg-slate-800/70 border border-slate-700 rounded-lg">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Ações de Resolução de Quarentena (Controle de Qualidade)
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Selecione a ação autorizada para atualização do status regulamentar desta ferramenta:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleResolveQuarantine(activeQuarantine.id_quarentena, 'ENVIADO_AFERICAO')}
                      className="px-3 py-1.5 text-xs font-semibold bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded transition-colors"
                    >
                      Remover para Envio a Laboratório de Aferição
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveQuarantine(activeQuarantine.id_quarentena, 'SUCATEADO')}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-900/40 hover:bg-red-900/70 text-red-200 border border-red-700/60 rounded transition-colors"
                    >
                      Sucatear e Dar Baixa Definitiva
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveQuarantine(activeQuarantine.id_quarentena, 'LIBERADO_APOS_CALIBRACAO')}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-700/60 rounded transition-colors"
                    >
                      Liberar após Nova Calibração Homologada
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FORM F 001-06-04 FULL SHEET */}
          {activeTab === 'ficha' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">
                  Formulário Oficial de Registro de Quarentena de Ferramentas / Equipamentos
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Ficha F 001-06-04
                </button>
              </div>

              {/* OFFICIAL FICHA F 001-06-04 CONTAINER */}
              <div className="p-6 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono space-y-4">
                {/* Header */}
                <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-bold text-white font-sans">IMPACTO AVIATION LTDA</h2>
                    <p className="text-[11px] text-slate-400 font-sans">
                      COM 200607-05/ANAC | EASA.145.1003 | MOMQ MNT-001
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-red-950 text-red-300 font-bold border border-red-700 rounded text-[11px]">
                      FORMULÁRIO F 001-06-04
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-sans">Rev. 04 — Segregação de Ferramental</p>
                  </div>
                </div>

                <div className="text-center py-1 bg-slate-900 border border-slate-800 rounded font-bold text-white uppercase text-[11px]">
                  TERMO DE TRANSFERÊNCIA PARA ÁREA DE QUARENTENA E SEGREGAÇÃO
                </div>

                {/* Table Data */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-500 block text-[10px]">ID QUARENTENA</span>
                    <span className="text-white font-bold">{activeQuarantine?.id_quarentena || 'F06-PENDING'}</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-500 block text-[10px]">DATA SEGREGAÇÃO</span>
                    <span className="text-white font-bold">
                      {activeQuarantine?.data_segregacao || new Date().toISOString().split('T')[0]}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-500 block text-[10px]">TAG VINCULADA</span>
                    <span className="text-red-400 font-bold">F 001-01-6 (Vermelha)</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-500 block text-[10px]">BASE OPERACIONAL</span>
                    <span className="text-white font-bold">{tool.nome_base || 'Sede GRU'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2">
                  <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                    DADOS DA FERRAMENTA / EQUIPAMENTO
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">DESCRIÇÃO</span>
                      <span className="text-white">{tool.descricao}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">PART NUMBER (PN)</span>
                      <span className="text-white">{tool.part_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">SERIAL NUMBER (SN)</span>
                      <span className="text-white">{tool.serial_number}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-400 font-bold block">MOTIVO DETALHADO DA SEGREGAÇÃO</span>
                  <p className="text-red-300 italic">{activeQuarantine?.motivo || motivo}</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-400 font-bold block">RESOLUÇÃO / DESTINAÇÃO ATUAL</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-950 border border-red-700 text-red-200 rounded font-bold">
                      {activeQuarantine?.status_resolucao || 'RETIDO_QUARENTENA'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {activeQuarantine?.data_resolucao ? `Data: ${activeQuarantine.data_resolucao}` : '(Aguardando Ação da Qualidade)'}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">Obs: {activeQuarantine?.observacoes || observacoes}</p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800 font-sans">
                  <div className="text-center p-3 bg-slate-900/60 border border-slate-800 rounded">
                    <div className="h-10 border-b border-slate-700 mb-1 flex items-end justify-center pb-1 text-slate-300 font-serif italic text-sm">
                      {tecnicos.find(t => t.id_tecnico === (activeQuarantine?.id_responsavel || idResponsavel))?.nome_completo || 'Técnico Responsável'}
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold block">RESPONSÁVEL PELA SEGREGAÇÃO</span>
                    <span className="text-[10px] text-slate-500">Inspetor / Supervisor de Ferramentaria</span>
                  </div>
                  <div className="text-center p-3 bg-slate-900/60 border border-slate-800 rounded">
                    <div className="h-10 border-b border-slate-700 mb-1 flex items-end justify-center pb-1 text-slate-300 font-serif italic text-sm">
                      Responsável Técnico / Gerência de Qualidade
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold block">VISTO DE CONFERÊNCIA</span>
                    <span className="text-[10px] text-slate-500">Garantia da Qualidade MNT-001</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
