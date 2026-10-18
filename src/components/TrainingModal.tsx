import React, { useState, useEffect } from 'react';
import { X, GraduationCap, ShieldAlert, Calendar } from 'lucide-react';
import { TecnicoComQualificacao, TreinamentoMNT002, CURSOS_MANDATORIOS } from '../types/mro';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tecnicos: TecnicoComQualificacao[];
  tecnicoPreSelecionado?: TecnicoComQualificacao | null;
  onSave: (data: Partial<TreinamentoMNT002>) => Promise<void>;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  onClose,
  tecnicos,
  tecnicoPreSelecionado,
  onSave,
}) => {
  const [idTecnico, setIdTecnico] = useState<number>(0);
  const [nomeCurso, setNomeCurso] = useState<string>(CURSOS_MANDATORIOS[0]);
  const [outroCurso, setOutroCurso] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState(24);
  const [dataConclusao, setDataConclusao] = useState('');
  const [dataReciclagem, setDataReciclagem] = useState('');
  const [certificadoUrl, setCertificadoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const hoje = new Date();
    const dataHojeIso = hoje.toISOString().split('T')[0];

    const doisAnosDepois = new Date(hoje);
    doisAnosDepois.setFullYear(doisAnosDepois.getFullYear() + 2);
    const dataReciclagemIso = doisAnosDepois.toISOString().split('T')[0];

    setDataConclusao(dataHojeIso);
    setDataReciclagem(dataReciclagemIso);

    if (tecnicoPreSelecionado) {
      setIdTecnico(tecnicoPreSelecionado.id_tecnico);
    } else if (tecnicos.length > 0) {
      setIdTecnico(tecnicos[0].id_tecnico);
    }

    setNomeCurso(CURSOS_MANDATORIOS[0]);
    setOutroCurso('');
    setCargaHoraria(24);
    setCertificadoUrl(`CERT-${Math.floor(1000 + Math.random() * 9000)}.pdf`);
    setErrorMsg('');
  }, [isOpen, tecnicoPreSelecionado, tecnicos]);

  if (!isOpen) return null;

  // Atualizar reciclagem automaticamente quando data de conclusão mudar (+24 meses)
  const handleDataConclusaoChange = (val: string) => {
    setDataConclusao(val);
    if (val) {
      const d = new Date(val);
      d.setFullYear(d.getFullYear() + 2);
      setDataReciclagem(d.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!idTecnico) {
      setErrorMsg('Selecione um técnico.');
      return;
    }

    const cursoFinal = nomeCurso === 'OUTRO' ? outroCurso.trim() : nomeCurso;
    if (!cursoFinal) {
      setErrorMsg('Informe o nome do curso.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        id_tecnico: Number(idTecnico),
        nome_curso: cursoFinal,
        carga_horaria: Number(cargaHoraria) || 16,
        data_conclusao: dataConclusao,
        data_reciclagem: dataReciclagem,
        certificado_url: certificadoUrl.trim() || 'N/A', // Regra N/A
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar treinamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Registrar Treinamento MNT-002
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Programa de Treinamento Técnico Aeronáutico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-300 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Seleção do Técnico */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Técnico Alvo *
            </label>
            <select
              value={idTecnico}
              onChange={(e) => setIdTecnico(Number(e.target.value))}
              disabled={!!tecnicoPreSelecionado}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              {tecnicos.map((t) => (
                <option key={t.id_tecnico} value={t.id_tecnico}>
                  {t.nome_completo} (CANAC: {t.canac} • {t.cargo})
                </option>
              ))}
            </select>
          </div>

          {/* Nome do Curso */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Curso / Disciplina Regulamentar *
            </label>
            <select
              value={nomeCurso}
              onChange={(e) => setNomeCurso(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              {CURSOS_MANDATORIOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="OUTRO">Outro Curso Técnico / Diferencial de Tipo...</option>
            </select>
          </div>

          {nomeCurso === 'OUTRO' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Nome do Curso Específico *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Treinamento de Tipo ATR 72-600 / PW127M"
                value={outroCurso}
                onChange={(e) => setOutroCurso(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}

          {/* Carga Horária & Certificado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Carga Horária (Horas) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={500}
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Registro / Certificado
              </label>
              <input
                type="text"
                placeholder="Ex: CERT-2026-081.pdf ou N/A"
                value={certificadoUrl}
                onChange={(e) => setCertificadoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data de Conclusão *
              </label>
              <input
                type="date"
                required
                value={dataConclusao}
                onChange={(e) => handleDataConclusaoChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data de Reciclagem Obrigatória (24m) *
              </label>
              <input
                type="date"
                required
                value={dataReciclagem}
                onChange={(e) => setDataReciclagem(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-[11px] text-emerald-300/90 leading-relaxed font-sans">
            <strong className="text-emerald-400">Regra de Auditoria MNT-002:</strong> Ao atingir a data de reciclagem sem novo registro, o sistema bloqueia automaticamente a autorização de assinatura de OS do técnico.
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Lançar Treinamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
