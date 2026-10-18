import React, { useState, useEffect } from 'react';
import { X, FileText, Check, ShieldAlert, Award } from 'lucide-react';
import { TecnicoComQualificacao, DesignacaoFuncoesF001_03 } from '../types/mro';

interface DesignationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tecnicos: TecnicoComQualificacao[];
  tecnicoPreSelecionado?: TecnicoComQualificacao | null;
  onSave: (data: Partial<DesignacaoFuncoesF001_03>) => Promise<void>;
}

const FUNCOES_PREDEFINIDAS = [
  'APRS (Aprovação para Retorno ao Serviço - ANAC/EASA)',
  'Inspeção Obrigatória IIO (P 001-07 / RBAC 65)',
  'Inspeção Final de Manutenção',
  'Inspeção Boroscópica em Motores',
  'Execução de Célula e Estruturas Aeronáuticas',
  'Execução de Grupo Motopropulsor (GMP)',
  'Execução de Aviônica e Sistemas Elétricos',
  'Testes de Rádio, Transponder e Pitot-Estático',
  'Inspeção de Recebimento de Peças e Componentes',
  'Auditorias de Garantia da Qualidade (MOMQ)',
  'Controle de Calibração e Ferramental (F 001-06)',
];

export const DesignationModal: React.FC<DesignationModalProps> = ({
  isOpen,
  onClose,
  tecnicos,
  tecnicoPreSelecionado,
  onSave,
}) => {
  const [idTecnico, setIdTecnico] = useState<number>(0);
  const [numeroF00103, setNumeroF00103] = useState('');
  const [funcoesSelecionadas, setFuncoesSelecionadas] = useState<string[]>([]);
  const [outraFuncao, setOutraFuncao] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [assinadoRT, setAssinadoRT] = useState(false);
  const [status, setStatus] = useState<'ATIVO' | 'SUSPENSO' | 'VENCIDO'>('ATIVO');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const dataHojeIso = hoje.toISOString().split('T')[0];

    const umAnoDepois = new Date(hoje);
    umAnoDepois.setFullYear(umAnoDepois.getFullYear() + 1);
    const dataValidadeIso = umAnoDepois.toISOString().split('T')[0];

    setDataEmissao(dataHojeIso);
    setDataValidade(dataValidadeIso);

    if (tecnicoPreSelecionado) {
      setIdTecnico(tecnicoPreSelecionado.id_tecnico);
    } else if (tecnicos.length > 0) {
      setIdTecnico(tecnicos[0].id_tecnico);
    }

    setNumeroF00103(`F001-03-${anoAtual}-${Math.floor(1000 + Math.random() * 9000)}`);
    setFuncoesSelecionadas(['Execução de Célula e Estruturas Aeronáuticas']);
    setOutraFuncao('');
    setAssinadoRT(false);
    setStatus('ATIVO');
    setErrorMsg('');
  }, [isOpen, tecnicoPreSelecionado, tecnicos]);

  if (!isOpen) return null;

  const toggleFuncao = (funcao: string) => {
    if (funcoesSelecionadas.includes(funcao)) {
      setFuncoesSelecionadas(funcoesSelecionadas.filter((f) => f !== funcao));
    } else {
      setFuncoesSelecionadas([...funcoesSelecionadas, funcao]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!idTecnico) {
      setErrorMsg('Selecione um técnico.');
      return;
    }

    const funcoesFinais = [...funcoesSelecionadas];
    if (outraFuncao.trim()) {
      funcoesFinais.push(outraFuncao.trim());
    }

    if (funcoesFinais.length === 0) {
      setErrorMsg('Selecione pelo menos uma função autorizada.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        id_tecnico: Number(idTecnico),
        numero_f001_03: numeroF00103.trim(),
        funcoes_autorizadas: funcoesFinais.join(', '),
        data_emissao: dataEmissao,
        data_validade: dataValidade,
        assinado_por_rt: assinadoRT,
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao emitir formulário F 001-03.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Emissão de Designação de Funções (Form F 001-03)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Manual MOMQ MNT-001 (Rev 08) • RBAC 145 & RBAC 65
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-300 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Seleção do Técnico */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Técnico Habilitado Designado *
            </label>
            <select
              value={idTecnico}
              onChange={(e) => setIdTecnico(Number(e.target.value))}
              disabled={!!tecnicoPreSelecionado}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              {tecnicos.map((t) => (
                <option key={t.id_tecnico} value={t.id_tecnico}>
                  {t.nome_completo} (CANAC: {t.canac} • {t.cargo} • Licença: {t.licenca_cct})
                </option>
              ))}
            </select>
          </div>

          {/* Número do Formulário & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Número do F 001-03 *
              </label>
              <input
                type="text"
                required
                value={numeroF00103}
                onChange={(e) => setNumeroF00103(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Status da Designação *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="ATIVO">ATIVO</option>
                <option value="SUSPENSO">SUSPENSO</option>
                <option value="VENCIDO">VENCIDO</option>
              </select>
            </div>
          </div>

          {/* Escopo de Funções Autorizadas */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Escopo de Funções Regulatórias Autorizadas *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
              {FUNCOES_PREDEFINIDAS.map((funcao) => {
                const checked = funcoesSelecionadas.includes(funcao);
                return (
                  <label
                    key={funcao}
                    onClick={() => toggleFuncao(funcao)}
                    className={`flex items-start space-x-2 p-2 rounded-lg cursor-pointer border transition text-[11px] ${
                      checked
                        ? 'bg-amber-950/40 border-amber-600/70 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>{funcao}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Outra Função Específica */}
          <div>
            <label className="block text-slate-400 font-medium mb-1 text-[11px]">
              Outra Função / Modelo de Aeronave Específico (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ex: Embraer Phenom 300 / King Air B200"
              value={outraFuncao}
              onChange={(e) => setOutraFuncao(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data de Emissão *
              </label>
              <input
                type="date"
                required
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data de Validade (Máx 12 meses) *
              </label>
              <input
                type="date"
                required
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Assinatura do RT - Trava Regra 6 */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={assinadoRT}
                onChange={(e) => setAssinadoRT(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-slate-200">
                Assinatura do Responsável Técnico (RT) Concedida
              </span>
            </label>
            <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
              <strong className="text-amber-400">Aviso Regra 6:</strong> Sem a assinatura do Responsável Técnico, o sistema bloqueará automaticamente qualquer tentativa do técnico de assinar Ordens de Serviço (OS).
            </p>
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
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Emitir F 001-03'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
