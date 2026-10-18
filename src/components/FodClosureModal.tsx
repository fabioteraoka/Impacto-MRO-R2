import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Trash2,
  Layers,
} from 'lucide-react';
import {
  OrdemServicoF001_09_2,
  TecnicoComQualificacao,
  ChecklistFodEncerramento,
  RelatorioInspecaoF001_12,
  ApontamentoTarefaOS,
} from '../types/mro';
import { apiClient } from '../services/apiClient';

interface FodClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (osEncerrada: OrdemServicoF001_09_2) => void;
  os: OrdemServicoF001_09_2;
  tecnicos: TecnicoComQualificacao[];
  risPendentes: RelatorioInspecaoF001_12[];
  iiosPendentes: ApontamentoTarefaOS[];
}

export const FodClosureModal: React.FC<FodClosureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  os,
  tecnicos,
  risPendentes,
  iiosPendentes,
}) => {
  if (!isOpen) return null;

  const [recolhimentoFerramentas, setRecolhimentoFerramentas] = useState(false);
  const [contagemConfere, setContagemConfere] = useState(false);
  const [inspecaoVisualBaias, setInspecaoVisualBaias] = useState(false);
  const [limpezaResiduos, setLimpezaResiduos] = useState(false);
  const [paineisTravados, setPaineisTravados] = useState(false);
  const [avisoFodConfirmado, setAvisoFodConfirmado] = useState(false);

  const [idInspetor, setIdInspetor] = useState<number>(3);
  const [observacoes, setObservacoes] = useState('Limpeza rigorosa de área concluída. Ferramentas conferidas.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const temBloqueioRegulatorio = risPendentes.length > 0 || iiosPendentes.length > 0;
  const checklistCompleto =
    recolhimentoFerramentas &&
    contagemConfere &&
    inspecaoVisualBaias &&
    limpezaResiduos &&
    paineisTravados &&
    avisoFodConfirmado;

  const handleEncerrar = async () => {
    if (temBloqueioRegulatorio) {
      alert('Não é permitido encerrar a OS com RIs pendentes ou tarefas IIO sem dupla inspeção.');
      return;
    }

    if (!checklistCompleto) {
      alert('Todos os 6 itens do Checklist FOD devem ser verificados e confirmados.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const insp = tecnicos.find((t) => t.id_tecnico === idInspetor);
      const checklist: ChecklistFodEncerramento = {
        recolhimento_todas_ferramentas: recolhimentoFerramentas,
        contagem_ferramentas_confere: contagemConfere,
        inspecao_visual_baias_motores_paineis: inspecaoVisualBaias,
        limpeza_residuos_freio_arames_panos: limpezaResiduos,
        paineis_acesso_fechados_travados: paineisTravados,
        aviso_fod_confirmado: avisoFodConfirmado,
        data_hora_verificacao: new Date().toISOString(),
        id_inspetor_verificador: idInspetor,
        inspetor_nome: insp ? insp.nome_completo : 'Inspetor APRS',
        inspetor_canac: insp ? insp.canac : 'N/A',
        observacoes,
      };

      const osAtualizada = await apiClient.encerrarOsComFod(os.id_os, checklist, idInspetor);
      onSuccess(osAtualizada);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar encerramento operacional FOD.');
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
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  MOMQ MNT-001 • RBAC 145
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  CHECKLIST FOD MANDATÓRIO
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Encerramento Operacional & Prevenção FOD • OS {os.numero_os}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-500 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bloqueios Regulatórios Impeditivos */}
          {risPendentes.length > 0 && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/60 rounded-xl text-rose-200 text-xs space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-rose-400">
                <AlertOctagon className="w-4 h-4" />
                <span>BLOQUEIO: {risPendentes.length} Relatório(s) de Inspeção (RI) em aberto</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {risPendentes.map((r) => `${r.numero_ri} (${r.status_ri})`).join('; ')}. É obrigatório resolver e aprovar todos os RIs antes de encerrar a OS.
              </p>
            </div>
          )}

          {iiosPendentes.length > 0 && (
            <div className="p-3 bg-amber-950/50 border border-amber-500/60 rounded-xl text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>BLOQUEIO: {iiosPendentes.length} Tarefa(s) Crítica(s) IIO pendentes de inspeção APRS</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {iiosPendentes.map((i) => i.titulo_tarefa).join('; ')}. A dupla assinatura com o Inspetor APRS é compulsória.
              </p>
            </div>
          )}

          {/* AVISO MANDATÓRIO DE PREVENÇÃO FOD */}
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500/60 rounded-xl text-amber-300 space-y-1 text-center">
            <span className="font-extrabold text-[11px] uppercase tracking-wider block font-mono text-amber-400">
              AVISO MANDATÓRIO DE PREVENÇÃO FOD (FOREIGN OBJECT DAMAGE)
            </span>
            <p className="text-xs font-black uppercase text-amber-200 font-mono tracking-wide">
              "AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO."
            </p>
          </div>

          {/* ITENS DO CHECKLIST OBRIGATÓRIO */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase font-mono flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verificação de Segurança Físico-Operacional (Checklist Compulsório)</span>
            </h3>

            <div className="space-y-2">
              <label className="flex items-start space-x-2.5 p-2 bg-slate-900/80 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition">
                <input
                  type="checkbox"
                  checked={recolhimentoFerramentas}
                  onChange={(e) => setRecolhimentoFerramentas(e.target.checked)}
                  className="mt-0.5 text-emerald-500 rounded focus:ring-0"
                />
                <div>
                  <strong className="block text-slate-200">1. Recolhimento Total de Ferramental:</strong>
                  <span className="text-[10px] text-slate-400">Todas as ferramentas, chaves, adaptadores e torquímetros foram retirados da aeronave.</span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2 bg-slate-900/80 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition">
                <input
                  type="checkbox"
                  checked={contagemConfere}
                  onChange={(e) => setContagemConfere(e.target.checked)}
                  className="mt-0.5 text-emerald-500 rounded focus:ring-0"
                />
                <div>
                  <strong className="block text-slate-200">2. Contagem Física e Confronto com Check-out:</strong>
                  <span className="text-[10px] text-slate-400">A quantidade de ferramentas devolvidas na caixa/painel confere rigorosamente com as retiradas.</span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2 bg-slate-900/80 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition">
                <input
                  type="checkbox"
                  checked={inspecaoVisualBaias}
                  onChange={(e) => setInspecaoVisualBaias(e.target.checked)}
                  className="mt-0.5 text-emerald-500 rounded focus:ring-0"
                />
                <div>
                  <strong className="block text-slate-200">3. Inspeção Visual em Baias, Motores e Porões:</strong>
                  <span className="text-[10px] text-slate-400">Inspeção com lanterna realizada em todas as áreas onde houve intervenção mecânica.</span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2 bg-slate-900/80 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition">
                <input
                  type="checkbox"
                  checked={limpezaResiduos}
                  onChange={(e) => setLimpezaResiduos(e.target.checked)}
                  className="mt-0.5 text-emerald-500 rounded focus:ring-0"
                />
                <div>
                  <strong className="block text-slate-200">4. Limpeza de Resíduos e Arames de Freio:</strong>
                  <span className="text-[10px] text-slate-400">Ausência de sobras de arame de freio, rebites, arruelas, panos de limpeza ou óleo derramado.</span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2 bg-slate-900/80 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition">
                <input
                  type="checkbox"
                  checked={paineisTravados}
                  onChange={(e) => setPaineisTravados(e.target.checked)}
                  className="mt-0.5 text-emerald-500 rounded focus:ring-0"
                />
                <div>
                  <strong className="block text-slate-200">5. Fechamento e Travamento de Painéis de Acesso:</strong>
                  <span className="text-[10px] text-slate-400">Todos os painéis, janelas de inspeção e capôs foram fechados com parafusos e travas instalados.</span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2 bg-amber-950/30 border border-amber-500/40 rounded-lg cursor-pointer hover:bg-amber-950/40 transition">
                <input
                  type="checkbox"
                  checked={avisoFodConfirmado}
                  onChange={(e) => setAvisoFodConfirmado(e.target.checked)}
                  className="mt-0.5 text-amber-500 rounded focus:ring-0"
                />
                <div>
                  <strong className="block text-amber-300">6. Atestado Formal do Aviso Inviolável de Prevenção FOD:</strong>
                  <span className="text-[10px] text-amber-200/80">Confirmo que a área de trabalho ao redor da aeronave está 100% limpa e desobstruída.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Inspetor APRS Verificador */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Inspetor APRS Verificador *</label>
              <select
                value={idInspetor}
                onChange={(e) => setIdInspetor(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
              >
                {tecnicos.map((t) => (
                  <option key={t.id_tecnico} value={t.id_tecnico}>
                    {t.nome_completo} (CANAC: {t.canac}) {t.qualificacao.aprovado_aprs ? '✓ APRS' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Observações do Encerramento</label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-t border-slate-700">
          <div className="text-[11px] font-mono">
            {checklistCompleto && !temBloqueioRegulatorio ? (
              <span className="text-emerald-400 font-bold">✓ Checklist FOD 100% conforme. Liberação autorizada.</span>
            ) : (
              <span className="text-amber-400">Marque todos os 6 itens para habilitar o encerramento.</span>
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
              onClick={handleEncerrar}
              disabled={isSubmitting || !checklistCompleto || temBloqueioRegulatorio}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Encerrando...' : 'Confirmar Encerramento Operacional (FOD OK)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
