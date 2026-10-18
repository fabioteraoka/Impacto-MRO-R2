import React, { useState } from 'react';
import {
  X,
  Clock,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import {
  OrdemServicoF001_09_2,
  TecnicoComQualificacao,
  TurnoServico,
  PassagemTurnoF001_24,
  RelatorioInspecaoF001_12,
} from '../types/mro';
import { apiClient } from '../services/apiClient';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (novaPassagem: PassagemTurnoF001_24) => void;
  ordensServico: OrdemServicoF001_09_2[];
  tecnicos: TecnicoComQualificacao[];
  risAbertos?: RelatorioInspecaoF001_12[];
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  ordensServico,
  tecnicos,
  risAbertos = [],
}) => {
  if (!isOpen) return null;

  const agora = new Date();
  const dataHoje = agora.toLocaleDateString('pt-BR');
  const horaAgora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')} UTC`;

  const [idOs, setIdOs] = useState<number>(ordensServico[0]?.id_os || 1);
  const [turnoSaindo, setTurnoSaindo] = useState<TurnoServico>('TARDE');
  const [turnoEntrando, setTurnoEntrando] = useState<TurnoServico>('NOITE');
  const [dataPassagem, setDataPassagem] = useState(dataHoje);
  const [horaPassagem, setHoraPassagem] = useState(horaAgora);

  const [statusGeral, setStatusGeral] = useState('');
  const [tarefasConcluidas, setTarefasConcluidas] = useState('');
  const [tarefasPendentes, setTarefasPendentes] = useState('');
  const [ferramentasRetidas, setFerramentasRetidas] = useState('Nenhuma ferramenta retida na aeronave.');
  const [pecasPendentes, setPecasPendentes] = useState('N/A');

  const [idTecnicoSaindo, setIdTecnicoSaindo] = useState<number>(5);
  const [rubricaSaindo, setRubricaSaindo] = useState('MVS-114522');
  const [idTecnicoEntrando, setIdTecnicoEntrando] = useState<number>(2);
  const [rubricaEntrando, setRubricaEntrando] = useState('CEL-114523');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedOs = ordensServico.find((os) => os.id_os === idOs);
  const risDestaOs = risAbertos.filter((r) => r.id_os === idOs);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusGeral.trim() || !tarefasPendentes.trim()) {
      setErrorMessage('Preencha o status geral e os detalhes de tarefas pendentes.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const alertaRIs = risDestaOs.length > 0
        ? `ATENÇÃO: Existem ${risDestaOs.length} RI(s) pendentes nesta aeronave (${risDestaOs.map((r) => r.numero_ri).join(', ')}). OS impedida de fechamento.`
        : 'Nenhum RI em aberto.';

      const nova = await apiClient.createPassagemTurno({
        id_os: idOs,
        turno_saindo: turnoSaindo,
        turno_entrando: turnoEntrando,
        data_passagem: dataPassagem,
        hora_passagem: horaPassagem,
        status_geral_trabalhos: statusGeral.trim(),
        tarefas_concluidas_resumo: tarefasConcluidas.trim() || 'N/A',
        tarefas_pendentes_detalhes: tarefasPendentes.trim(),
        ris_em_aberto_alerta: alertaRIs,
        ferramentas_retidas_aeronave_bancada: ferramentasRetidas.trim() || 'N/A',
        pecas_pendentes_suprimentos: pecasPendentes.trim() || 'N/A',
        id_tecnico_saindo: idTecnicoSaindo,
        rubrica_tecnico_saindo: rubricaSaindo,
        id_tecnico_entrando: idTecnicoEntrando,
        rubrica_tecnico_entrando: rubricaEntrando,
      });

      onSuccess(nova);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao emitir passagem de turno.');
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
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  MOMQ I 001-14
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  FORM F 001-24
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Ficha de Passagem de Serviço (Handover de Turno)
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-500 rounded-xl text-rose-200 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Contexto da OS e Aeronave */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Ordem de Serviço (OS) *</label>
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Turno Saindo *</label>
                <select
                  value={turnoSaindo}
                  onChange={(e) => setTurnoSaindo(e.target.value as TurnoServico)}
                  className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                >
                  <option value="MANHA">Manhã</option>
                  <option value="TARDE">Tarde</option>
                  <option value="NOITE">Noite</option>
                  <option value="MADRUGADA">Madrugada</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Turno Entrando *</label>
                <select
                  value={turnoEntrando}
                  onChange={(e) => setTurnoEntrando(e.target.value as TurnoServico)}
                  className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                >
                  <option value="MANHA">Manhã</option>
                  <option value="TARDE">Tarde</option>
                  <option value="NOITE">Noite</option>
                  <option value="MADRUGADA">Madrugada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alerta de RIs Abertos */}
          {risDestaOs.length > 0 && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs space-y-1">
              <strong className="flex items-center space-x-1 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>ALERTA DE SEGURANÇA: {risDestaOs.length} Relatório(s) de Inspeção em Aberto</span>
              </strong>
              <p className="text-[11px] text-slate-300">
                A aeronave possui RIs não concluídos ({risDestaOs.map((r) => r.numero_ri).join(', ')}). Este alerta é transferido compulsoriamente na ficha do próximo turno.
              </p>
            </div>
          )}

          {/* Status Geral das Tarefas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Status Circunstanciado das Atividades do Turno *</label>
            <textarea
              value={statusGeral}
              onChange={(e) => setStatusGeral(e.target.value)}
              rows={2}
              placeholder="Descreva o andamento das tarefas, testes concluídos e ocorrências no hangar..."
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Tarefas Concluídas no Turno</label>
              <textarea
                value={tarefasConcluidas}
                onChange={(e) => setTarefasConcluidas(e.target.value)}
                rows={2}
                placeholder="Ex: Troca do sensor hidráulico e sangria do circuito..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Tarefas Pendentes para o Próximo Turno *</label>
              <textarea
                value={tarefasPendentes}
                onChange={(e) => setTarefasPendentes(e.target.value)}
                rows={2}
                placeholder="Ex: Inspeção APRS da tarefa IIO dos cabos de comando..."
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Controle de Ferramentas Retidas (FOD Prevention) */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
            <label className="block text-[11px] font-bold text-amber-300 flex items-center space-x-1.5 font-mono">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Ferramentas PME / Manuais Retidos na Aeronave ou Bancada (Prevenção FOD) *</span>
            </label>
            <input
              type="text"
              value={ferramentasRetidas}
              onChange={(e) => setFerramentasRetidas(e.target.value)}
              placeholder="Ex: Torquímetro PME-001 conectado no trem de pouso; ou 'Nenhuma ferramenta retida'."
              required
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
            />
          </div>

          {/* Peças Pendentes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Peças e Materiais Pendentes de Almoxarifado</label>
            <input
              type="text"
              value={pecasPendentes}
              onChange={(e) => setPecasPendentes(e.target.value)}
              placeholder="Ex: Rolamento P/N 200044-01 sob REQ-2026-0102 ou N/A"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
            />
          </div>

          {/* Dupla Assinatura da Passagem de Turno */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            {/* Saindo */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-200">Técnico que Entrega (Turno Anterior) *</label>
              <select
                value={idTecnicoSaindo}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setIdTecnicoSaindo(id);
                  const t = tecnicos.find((tec) => tec.id_tecnico === id);
                  if (t) setRubricaSaindo(`${t.nome_completo.split(' ').map((n) => n[0]).join('')}-${t.canac}`);
                }}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
              >
                {tecnicos.map((t) => (
                  <option key={t.id_tecnico} value={t.id_tecnico}>
                    {t.nome_completo} (CANAC: {t.canac})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={rubricaSaindo}
                onChange={(e) => setRubricaSaindo(e.target.value)}
                placeholder="Rubrica"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-cyan-300 font-mono text-xs font-bold"
              />
            </div>

            {/* Entrando */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-200">Técnico que Recebe (Próximo Turno) *</label>
              <select
                value={idTecnicoEntrando}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setIdTecnicoEntrando(id);
                  const t = tecnicos.find((tec) => tec.id_tecnico === id);
                  if (t) setRubricaEntrando(`${t.nome_completo.split(' ').map((n) => n[0]).join('')}-${t.canac}`);
                }}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
              >
                {tecnicos.map((t) => (
                  <option key={t.id_tecnico} value={t.id_tecnico}>
                    {t.nome_completo} (CANAC: {t.canac})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={rubricaEntrando}
                onChange={(e) => setRubricaEntrando(e.target.value)}
                placeholder="Rubrica"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-blue-300 font-mono text-xs font-bold"
              />
            </div>
          </div>

          {/* Footer FOD Notice */}
          <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>"AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO."</span>
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
              className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Emitindo...' : 'Emitir Ficha de Passagem de Serviço (F 001-24)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
