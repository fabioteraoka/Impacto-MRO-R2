import React, { useState, useEffect } from 'react';
import { X, UserPlus, ShieldAlert, Check } from 'lucide-react';
import { CargoTecnico, StatusToxicologico, BaseOperacional, PessoalTecnico } from '../types/mro';

interface TechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PessoalTecnico>) => Promise<void>;
  bases: BaseOperacional[];
  tecnicoParaEdicao?: PessoalTecnico | null;
}

export const TechnicianModal: React.FC<TechnicianModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bases,
  tecnicoParaEdicao,
}) => {
  const [nome, setNome] = useState('');
  const [canac, setCanac] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState<CargoTecnico>('MMA');
  const [cctGmp, setCctGmp] = useState(false);
  const [cctCel, setCctCel] = useState(false);
  const [cctAvi, setCctAvi] = useState(false);
  const [cctNA, setCctNA] = useState(false);
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [statusToxicologico, setStatusToxicologico] = useState<StatusToxicologico>('EM_DIA');
  const [idBase, setIdBase] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (tecnicoParaEdicao) {
      setNome(tecnicoParaEdicao.nome_completo || '');
      setCanac(tecnicoParaEdicao.canac || '');
      setCpf(tecnicoParaEdicao.cpf || '');
      setCargo(tecnicoParaEdicao.cargo || 'MMA');
      setDataAdmissao(tecnicoParaEdicao.data_admissao || '');
      setStatusToxicologico(tecnicoParaEdicao.status_exame_toxicologico || 'EM_DIA');
      setIdBase(tecnicoParaEdicao.id_base_alocada || 1);

      const cct = tecnicoParaEdicao.licenca_cct || 'N/A';
      if (cct === 'N/A') {
        setCctNA(true);
        setCctGmp(false);
        setCctCel(false);
        setCctAvi(false);
      } else {
        setCctNA(false);
        setCctGmp(cct.includes('GMP'));
        setCctCel(cct.includes('CEL'));
        setCctAvi(cct.includes('AVI'));
      }
    } else {
      setNome('');
      setCanac('');
      setCpf('');
      setCargo('MMA');
      setCctGmp(false);
      setCctCel(false);
      setCctAvi(false);
      setCctNA(false);
      setDataAdmissao(new Date().toISOString().split('T')[0]);
      setStatusToxicologico('EM_DIA');
      setIdBase(bases[0]?.id_base || 1);
      setErrorMsg('');
    }
  }, [tecnicoParaEdicao, isOpen, bases]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nome.trim() || !canac.trim() || !cpf.trim()) {
      setErrorMsg('Preencha os campos obrigatórios (Nome, CANAC e CPF).');
      return;
    }

    // Montar Licença CCT com Regra N/A
    let licenca_cct = 'N/A';
    if (!cctNA) {
      const parts: string[] = [];
      if (cctGmp) parts.push('GMP');
      if (cctCel) parts.push('CEL');
      if (cctAvi) parts.push('AVI');
      if (parts.length > 0) {
        licenca_cct = parts.join(' / ');
      }
    }

    try {
      setLoading(true);
      await onSave({
        nome_completo: nome.trim(),
        canac: canac.trim(),
        cpf: cpf.trim(),
        cargo,
        licenca_cct, // Regra 1: "N/A" automático caso não tenha
        data_admissao: dataAdmissao,
        status_exame_toxicologico: statusToxicologico,
        id_base_alocada: Number(idBase),
        ativo: tecnicoParaEdicao ? tecnicoParaEdicao.ativo : true,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar técnico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                {tecnicoParaEdicao ? 'Atualizar Prontuário Técnico' : 'Cadastrar Pessoal Técnico (tb_pessoal_tecnico)'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Conformidade RBAC 145 / MOMQ MNT-001 (Rev 08)
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

          {/* Nome Completo */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Nome Completo do Técnico / Inspetor *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: João da Silva Santos"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* CANAC & CPF */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Código ANAC (CANAC) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 172940"
                value={canac}
                onChange={(e) => setCanac(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                CPF *
              </label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Cargo & Base Operacional */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Cargo / Função *
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value as CargoTecnico)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                <option value="MMA">MMA (Mecânico de Manutenção Aeronáutica)</option>
                <option value="Inspetor">Inspetor Credenciado (APRS)</option>
                <option value="Inspetor Chefe">Inspetor Chefe</option>
                <option value="RT">RT (Responsável Técnico)</option>
                <option value="Gerente Qualidade">Gerente da Garantia da Qualidade</option>
                <option value="PCP">PCP (Planejamento & Controle)</option>
                <option value="GR">GR (Gerente Responsável)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Base Operacional Alocada *
              </label>
              <select
                value={idBase}
                onChange={(e) => setIdBase(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                {bases.map((b) => (
                  <option key={b.id_base} value={b.id_base}>
                    {b.nome_base} ({b.codigo_anac})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Habilitações CCT (RBAC 65) */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">
                Licença Técnica CCT (RBAC 65)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Regra N/A automática
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <label className="flex items-center space-x-2 p-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={cctGmp}
                  disabled={cctNA}
                  onChange={(e) => {
                    setCctGmp(e.target.checked);
                    if (e.target.checked) setCctNA(false);
                  }}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px] font-mono text-slate-200">GMP</span>
              </label>

              <label className="flex items-center space-x-2 p-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={cctCel}
                  disabled={cctNA}
                  onChange={(e) => {
                    setCctCel(e.target.checked);
                    if (e.target.checked) setCctNA(false);
                  }}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px] font-mono text-slate-200">CEL</span>
              </label>

              <label className="flex items-center space-x-2 p-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={cctAvi}
                  disabled={cctNA}
                  onChange={(e) => {
                    setCctAvi(e.target.checked);
                    if (e.target.checked) setCctNA(false);
                  }}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px] font-mono text-slate-200">AVI</span>
              </label>

              <label className="flex items-center space-x-2 p-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={cctNA}
                  onChange={(e) => {
                    setCctNA(e.target.checked);
                    if (e.target.checked) {
                      setCctGmp(false);
                      setCctCel(false);
                      setCctAvi(false);
                    }
                  }}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px] font-mono text-slate-300">N/A</span>
              </label>
            </div>
          </div>

          {/* Admissão & Toxicológico (PPSP) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data de Admissão *
              </label>
              <input
                type="date"
                required
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Exame Toxicológico (PPSP) *
              </label>
              <select
                value={statusToxicologico}
                onChange={(e) => setStatusToxicologico(e.target.value as StatusToxicologico)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                <option value="EM_DIA">EM DIA (Conforme RBAC 120 / PPSP)</option>
                <option value="VENCIDO">VENCIDO (Bloqueio Automático)</option>
                <option value="PENDENTE">PENDENTE (Bloqueio Automático)</option>
              </select>
            </div>
          </div>

          {/* Notice Regra 1 */}
          <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-[11px] text-blue-300/90 leading-relaxed font-sans">
            <span className="font-bold text-cyan-400">Regra Inviolável #1:</span> Nenhum campo é deixado nulo no banco. Campos não preenchidos ou não aplicáveis recebem o valor padrão regulamentar <span className="font-mono font-bold bg-blue-900/60 px-1 py-0.5 rounded text-white">"N/A"</span>.
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
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : tecnicoParaEdicao ? 'Atualizar Prontuário' : 'Efetivar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
