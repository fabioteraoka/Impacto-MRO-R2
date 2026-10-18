import React, { useState } from 'react';
import {
  FileCheck2,
  X,
  AlertTriangle,
  Plane,
  ShieldAlert,
  Info,
  Calendar,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  FCDAF001_03_2,
  PessoalTecnico,
  CategoriaAplicacaoDA,
  TipoAcaoDA,
  AplicabilidadeDA,
  StatusFCDA
} from '../types/mro';
import { apiClient } from '../services/apiClient';

interface FcdaModalProps {
  fcdaToEdit?: FCDAF001_03_2 | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tecnicos: PessoalTecnico[];
}

export const FcdaModal: React.FC<FcdaModalProps> = ({
  fcdaToEdit,
  isOpen,
  onClose,
  onSuccess,
  tecnicos,
}) => {
  // Identificação e Diretriz
  const [numeroFcda, setNumeroFcda] = useState(fcdaToEdit?.numero_fcda || '');
  const [matriculaAeronave, setMatriculaAeronave] = useState(fcdaToEdit?.matricula_aeronave || 'PR-IMP');
  const [msnAeronave, setMsnAeronave] = useState(fcdaToEdit?.msn_aeronave || '');
  const [numeroDiretriz, setNumeroDiretriz] = useState(fcdaToEdit?.numero_diretriz || '');
  const [dataEfetividade, setDataEfetividade] = useState(fcdaToEdit?.data_efetividade || new Date().toISOString().split('T')[0]);
  const [vencimentoLimite, setVencimentoLimite] = useState(fcdaToEdit?.vencimento_limite || '');

  // Categoria e Tipo
  const [categoriaAplicacao, setCategoriaAplicacao] = useState<CategoriaAplicacaoDA>(fcdaToEdit?.categoria_aplicacao || 'AERONAVE');
  const [tipoAcao, setTipoAcao] = useState<TipoAcaoDA>(fcdaToEdit?.tipo_acao || 'TERMINAL');
  const [intervaloRepeticao, setIntervaloRepeticao] = useState(fcdaToEdit?.intervalo_repeticao || 'N/A');

  // Aplicabilidade & Justificativa (Regra #1 / IS 39-001A)
  const [aplicabilidade, setAplicabilidade] = useState<AplicabilidadeDA>(fcdaToEdit?.aplicabilidade || 'APLICAVEL');
  const [justificativaNaoAplicabilidade, setJustificativaNaoAplicabilidade] = useState(
    fcdaToEdit?.justificativa_nao_aplicabilidade && fcdaToEdit.justificativa_nao_aplicabilidade !== 'N/A'
      ? fcdaToEdit.justificativa_nao_aplicabilidade
      : ''
  );

  // Referências
  const [numeroSbReferencia, setNumeroSbReferencia] = useState(fcdaToEdit?.numero_sb_referencia || '');
  const [documentosReferencia, setDocumentosReferencia] = useState(fcdaToEdit?.documentos_referencia || '');

  // Produto Afetado
  const [produtoFabricante, setProdutoFabricante] = useState(fcdaToEdit?.produto_fabricante || '');
  const [produtoModelo, setProdutoModelo] = useState(fcdaToEdit?.produto_modelo || '');
  const [produtoPn, setProdutoPn] = useState(fcdaToEdit?.produto_pn || 'N/A');
  const [produtoSn, setProdutoSn] = useState(fcdaToEdit?.produto_sn || 'N/A');
  const [produtoVn, setProdutoVn] = useState(fcdaToEdit?.produto_vn || 'N/A');

  // Horas e Ciclos (TSN, CSN, TSO, TSLI, CSLI)
  const [tsn, setTsn] = useState(fcdaToEdit?.tsn || '');
  const [csn, setCsn] = useState(fcdaToEdit?.csn || '');
  const [tso, setTso] = useState(fcdaToEdit?.tso || 'N/A');
  const [tsli, setTsli] = useState(fcdaToEdit?.tsli || 'N/A');
  const [csli, setCsli] = useState(fcdaToEdit?.csli || 'N/A');

  // Cumprimento e OS
  const [dataCumprimento, setDataCumprimento] = useState(fcdaToEdit?.data_cumprimento || new Date().toISOString().split('T')[0]);
  const [numeroOs, setNumeroOs] = useState(fcdaToEdit?.numero_os || `OS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [proximoVencimentoHoras, setProximoVencimentoHoras] = useState(fcdaToEdit?.proximo_vencimento_horas || 'N/A');
  const [proximoVencimentoCiclos, setProximoVencimentoCiclos] = useState(fcdaToEdit?.proximo_vencimento_ciclos || 'N/A');
  const [proximoVencimentoData, setProximoVencimentoData] = useState(fcdaToEdit?.proximo_vencimento_data || 'N/A');

  // Método e Laudo
  const [metodoUtilizado, setMetodoUtilizado] = useState(fcdaToEdit?.metodo_utilizado || '');
  const [resultadoAcao, setResultadoAcao] = useState(fcdaToEdit?.resultado_acao || 'Aprovado para retorno ao serviço.');

  // Responsáveis e Assinaturas
  const [idExecutor, setIdExecutor] = useState<number>(
    fcdaToEdit?.id_executor || tecnicos.find((t) => t.cargo === 'MMA')?.id_tecnico || tecnicos[0]?.id_tecnico || 1
  );
  const [idInspetor, setIdInspetor] = useState<number>(
    fcdaToEdit?.id_inspetor || tecnicos.find((t) => t.cargo === 'Inspetor Chefe' || t.cargo === 'Inspetor')?.id_tecnico || 3
  );
  const [idRt, setIdRt] = useState<number>(
    fcdaToEdit?.id_rt || tecnicos.find((t) => t.cargo === 'RT')?.id_tecnico || 1
  );
  const [nomeOperador, setNomeOperador] = useState(fcdaToEdit?.nome_operador || 'Impacto Linhas Aéreas');
  const [representanteOperador, setRepresentanteOperador] = useState(fcdaToEdit?.representante_operador || 'Cmte. Fernando Vasconcelos');
  const [statusFcda, setStatusFcda] = useState<StatusFCDA>(fcdaToEdit?.status_fcda || 'CONCLUIDA');
  const [observacoes, setObservacoes] = useState(fcdaToEdit?.observacoes || 'N/A');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    // Validação estrita regulamentar
    if (aplicabilidade === 'NAO_APLICAVEL') {
      const just = justificativaNaoAplicabilidade.trim();
      if (!just || just === 'N/A' || just.length < 15) {
        setErrorMsg(
          'BLOQUEIO REGULAMENTAR (IS 39-001A / MOMQ): Para Diretrizes marcadas como NÃO-APLICÁVEL, é ESTRITAMENTE OBRIGATÓRIO informar a Justificativa Técnica circunstanciada (especificando P/N, S/N, modificação ausente ou configuração não afetada - mín. 15 caracteres).'
        );
        setSubmitting(false);
        return;
      }
    }

    const payload: Partial<FCDAF001_03_2> = {
      numero_fcda: numeroFcda.trim() || undefined,
      matricula_aeronave: matriculaAeronave.trim().toUpperCase() || 'PR-IMP',
      msn_aeronave: msnAeronave.trim() || 'N/A',
      numero_diretriz: numeroDiretriz.trim() || 'N/A',
      data_efetividade: dataEfetividade,
      vencimento_limite: vencimentoLimite.trim() || 'N/A',
      categoria_aplicacao: categoriaAplicacao,
      tipo_acao: tipoAcao,
      intervalo_repeticao: tipoAcao === 'REPETITIVA' ? (intervaloRepeticao.trim() || 'Conforme AD') : 'N/A',
      aplicabilidade,
      justificativa_nao_aplicabilidade:
        aplicabilidade === 'NAO_APLICAVEL' ? justificativaNaoAplicabilidade.trim() : 'N/A',
      numero_sb_referencia: numeroSbReferencia.trim() || 'N/A',
      documentos_referencia: documentosReferencia.trim() || 'N/A',
      produto_fabricante: produtoFabricante.trim() || 'N/A',
      produto_modelo: produtoModelo.trim() || 'N/A',
      produto_pn: produtoPn.trim() || 'N/A',
      produto_sn: produtoSn.trim() || 'N/A',
      produto_vn: produtoVn.trim() || 'N/A',
      tsn: tsn.trim() || 'N/A',
      csn: csn.trim() || 'N/A',
      tso: tso.trim() || 'N/A',
      tsli: tsli.trim() || 'N/A',
      csli: csli.trim() || 'N/A',
      data_cumprimento: dataCumprimento,
      numero_os: numeroOs.trim() || 'N/A',
      proximo_vencimento_horas: tipoAcao === 'REPETITIVA' ? (proximoVencimentoHoras.trim() || 'N/A') : 'N/A',
      proximo_vencimento_ciclos: tipoAcao === 'REPETITIVA' ? (proximoVencimentoCiclos.trim() || 'N/A') : 'N/A',
      proximo_vencimento_data: tipoAcao === 'REPETITIVA' ? (proximoVencimentoData.trim() || 'N/A') : 'N/A',
      metodo_utilizado: metodoUtilizado.trim() || 'Cumprimento realizado conforme instruções técnicas aplicáveis.',
      resultado_acao: resultadoAcao.trim() || 'Aprovado para retorno ao serviço.',
      id_executor: Number(idExecutor),
      id_inspetor: Number(idInspetor),
      id_rt: Number(idRt),
      nome_operador: nomeOperador.trim() || 'N/A',
      representante_operador: representanteOperador.trim() || 'N/A',
      status_fcda: statusFcda,
      observacoes: observacoes.trim() || 'N/A',
    };

    try {
      if (fcdaToEdit) {
        await apiClient.atualizarFcda(fcdaToEdit.id_fcda, payload);
      } else {
        await apiClient.emitirFcda(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao emitir FCDA.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/20 border border-amber-500/40 rounded-lg text-amber-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {fcdaToEdit ? 'EDITAR FICHA DE CUMPRIMENTO DE DA/AD/SB' : 'EMISSÃO DE FCDA — FORMULÁRIO F 001-03-2'}
                </h3>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-950 border border-amber-700 text-amber-300 rounded">
                  IS 39-001A / MOMQ I 001-03
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Impacto Aviation (COM 200607-05 / EASA.145.1003) — Registro Oficial de Diretrizes de Aeronavegabilidade
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-red-950/70 border border-red-500 rounded-lg text-xs text-red-200 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: IDENTIFICAÇÃO DA AERONAVE E DA DIRETRIZ */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Plane className="w-4 h-4" />
              1. Identificação da Aeronave e da Diretriz de Aeronavegabilidade
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Matrícula da Aeronave *
                </label>
                <input
                  type="text"
                  required
                  value={matriculaAeronave}
                  onChange={(e) => setMatriculaAeronave(e.target.value.toUpperCase())}
                  placeholder="Ex: PR-IMP, PS-MRO"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Número de Série (MSN)
                </label>
                <input
                  type="text"
                  value={msnAeronave}
                  onChange={(e) => setMsnAeronave(e.target.value)}
                  placeholder="Ex: 18942, 208B-5120"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Número da Diretriz (DA / AD / EAD) *
                </label>
                <input
                  type="text"
                  required
                  value={numeroDiretriz}
                  onChange={(e) => setNumeroDiretriz(e.target.value)}
                  placeholder="Ex: DA 2026-03-01 / FAA AD 2025-18-04 / EASA AD 2026-0042"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Data de Efetividade *
                </label>
                <input
                  type="date"
                  required
                  value={dataEfetividade}
                  onChange={(e) => setDataEfetividade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Vencimento / Limite Estabelecido *
                </label>
                <input
                  type="text"
                  required
                  value={vencimentoLimite}
                  onChange={(e) => setVencimentoLimite(e.target.value)}
                  placeholder="Ex: 14.500 FH ou 30/11/2026"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Categoria de Aplicação *
                </label>
                <select
                  value={categoriaAplicacao}
                  onChange={(e) => setCategoriaAplicacao(e.target.value as CategoriaAplicacaoDA)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="AERONAVE">Aeronave (Célula / Estrutura / Sistemas)</option>
                  <option value="MOTOR">Motor / APU</option>
                  <option value="HELICE">Hélice / Conjunto Rotor</option>
                  <option value="COMPONENTE">Componente / Acessório / Aviônica</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Tipo de Ação *
                </label>
                <select
                  value={tipoAcao}
                  onChange={(e) => setTipoAcao(e.target.value as TipoAcaoDA)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="TERMINAL">Terminal (Cumprimento Único / Definitivo)</option>
                  <option value="REPETITIVA">Repetitiva (Inspeção Recorrente)</option>
                  <option value="PARCIAL">Parcial (Etapa Intermediária)</option>
                </select>
              </div>

              {tipoAcao === 'REPETITIVA' && (
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                    Intervalo de Repetição da Diretriz *
                  </label>
                  <input
                    type="text"
                    required
                    value={intervaloRepeticao}
                    onChange={(e) => setIntervaloRepeticao(e.target.value)}
                    placeholder="Ex: A cada 750 Horas de Voo ou 12 Meses (o que ocorrer primeiro)"
                    className="w-full px-3 py-2 bg-slate-900 border border-amber-600/70 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: APLICABILIDADE E JUSTIFICATIVA (REGRA #1 IS 39-001A) */}
          <div className={`p-4 rounded-xl border transition-colors ${
            aplicabilidade === 'NAO_APLICAVEL'
              ? 'bg-rose-950/30 border-rose-600/80 shadow-lg shadow-rose-950/20'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                2. Aplicabilidade da Diretriz (IS 39-001A / MOMQ I 001-03)
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="aplicabilidade"
                    value="APLICAVEL"
                    checked={aplicabilidade === 'APLICAVEL'}
                    onChange={() => setAplicabilidade('APLICAVEL')}
                    className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>APLICÁVEL</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-rose-300">
                  <input
                    type="radio"
                    name="aplicabilidade"
                    value="NAO_APLICAVEL"
                    checked={aplicabilidade === 'NAO_APLICAVEL'}
                    onChange={() => setAplicabilidade('NAO_APLICAVEL')}
                    className="w-4 h-4 text-rose-500 bg-slate-900 border-slate-700"
                  />
                  <span>NÃO-APLICÁVEL</span>
                </label>
              </div>
            </div>

            {aplicabilidade === 'NAO_APLICAVEL' ? (
              <div className="space-y-2">
                <div className="p-3 bg-rose-950/50 border border-rose-700/60 rounded-lg text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">ATENÇÃO — REQUISITO REGULAMENTAR OBRIGATÓRIO (IS 39-001A):</strong> Toda diretriz registrada como NÃO-APLICÁVEL deve possuir justificativa técnica formal detalhando os Part Numbers, Serial Numbers, ausência de modificação prévia ou modelo não englobado. Registros com "N/A" genérico ou em branco serão reprovados na auditoria.
                  </div>
                </div>

                <label className="block text-xs font-bold text-rose-300 mb-1">
                  Justificativa Técnica Circunstanciada de Não-Aplicabilidade *
                </label>
                <textarea
                  rows={3}
                  required
                  value={justificativaNaoAplicabilidade}
                  onChange={(e) => setJustificativaNaoAplicabilidade(e.target.value)}
                  placeholder="Ex: O atuador instalado possui P/N 8923-01 e S/N 441, não constando na Tabela 1 da Diretriz FAA AD 2026-11-03. Modificação SB-A320-78-1055 já incorporada de fábrica."
                  className="w-full px-3 py-2 bg-slate-950 border border-rose-500 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Diretriz aplicável à aeronave, motor ou componente. O cumprimento técnico deve ser detalhado nas seções abaixo.
              </p>
            )}
          </div>

          {/* SECTION 3: IDENTIFICAÇÃO DO PRODUTO & BOLETINS DE SERVIÇO */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Wrench className="w-4 h-4" />
              3. Identificação do Produto / Componente & Documentos de Referência
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Boletim de Serviço (SB) Referência
                </label>
                <input
                  type="text"
                  value={numeroSbReferencia}
                  onChange={(e) => setNumeroSbReferencia(e.target.value)}
                  placeholder="Ex: SB A320-57-1240 Rev. 01"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Outros Documentos Técnicos de Referência
                </label>
                <input
                  type="text"
                  value={documentosReferencia}
                  onChange={(e) => setDocumentosReferencia(e.target.value)}
                  placeholder="Ex: AMM 57-51-11, SRM 51-40-00, EASA AD 2026-0042"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Fabricante do Produto
                </label>
                <input
                  type="text"
                  value={produtoFabricante}
                  onChange={(e) => setProdutoFabricante(e.target.value)}
                  placeholder="Ex: Airbus, CFM, Hartzell, Eaton"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Modelo do Produto / Componente
                </label>
                <input
                  type="text"
                  value={produtoModelo}
                  onChange={(e) => setProdutoModelo(e.target.value)}
                  placeholder="Ex: A320-214, CFM56-5B4/P, HC-B4TN"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Part Number (P/N)
                </label>
                <input
                  type="text"
                  value={produtoPn}
                  onChange={(e) => setProdutoPn(e.target.value)}
                  placeholder="Ex: D575-12000-001 ou N/A"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Serial Number (S/N)
                </label>
                <input
                  type="text"
                  value={produtoSn}
                  onChange={(e) => setProdutoSn(e.target.value)}
                  placeholder="Ex: SN-TRK-7741 ou N/A"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Posição / Instalação na Aeronave (VN)
                </label>
                <input
                  type="text"
                  value={produtoVn}
                  onChange={(e) => setProdutoVn(e.target.value)}
                  placeholder="Ex: Trilho do Flap RH #2, Motor #1 LH, etc."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: TEMPO E CICLOS & DADOS DE EXECUÇÃO */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              4. Dados de Tempo e Ciclos no Momento do Cumprimento
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  TSN (Horas Totais) *
                </label>
                <input
                  type="text"
                  required
                  value={tsn}
                  onChange={(e) => setTsn(e.target.value)}
                  placeholder="8450.5 FH"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  CSN (Ciclos Totais) *
                </label>
                <input
                  type="text"
                  required
                  value={csn}
                  onChange={(e) => setCsn(e.target.value)}
                  placeholder="4320 FC"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  TSO (Horas Overhaul)
                </label>
                <input
                  type="text"
                  value={tso}
                  onChange={(e) => setTso(e.target.value)}
                  placeholder="N/A"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  TSLI (Horas Insp.)
                </label>
                <input
                  type="text"
                  value={tsli}
                  onChange={(e) => setTsli(e.target.value)}
                  placeholder="N/A"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  CSLI (Ciclos Insp.)
                </label>
                <input
                  type="text"
                  value={csli}
                  onChange={(e) => setCsli(e.target.value)}
                  placeholder="N/A"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Data do Cumprimento *
                </label>
                <input
                  type="date"
                  required
                  value={dataCumprimento}
                  onChange={(e) => setDataCumprimento(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Ordem de Serviço (OS IMPACTO) *
                </label>
                <input
                  type="text"
                  required
                  value={numeroOs}
                  onChange={(e) => setNumeroOs(e.target.value)}
                  placeholder="Ex: OS-2026-0741"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {tipoAcao === 'REPETITIVA' && (
              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-amber-300 mb-1">
                    Próximo Vencimento (Horas)
                  </label>
                  <input
                    type="text"
                    value={proximoVencimentoHoras}
                    onChange={(e) => setProximoVencimentoHoras(e.target.value)}
                    placeholder="Ex: 9200.5 FH"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-amber-300 mb-1">
                    Próximo Vencimento (Ciclos)
                  </label>
                  <input
                    type="text"
                    value={proximoVencimentoCiclos}
                    onChange={(e) => setProximoVencimentoCiclos(e.target.value)}
                    placeholder="Ex: 5070 FC ou N/A"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-amber-300 mb-1">
                    Próximo Vencimento (Data)
                  </label>
                  <input
                    type="date"
                    value={proximoVencimentoData !== 'N/A' ? proximoVencimentoData : ''}
                    onChange={(e) => setProximoVencimentoData(e.target.value || 'N/A')}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: MÉTODO UTILIZADO E RESULTADO */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              5. Descrição Técnica do Método Utilizado e Resultado da Ação
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Método Utilizado (Descrição Detalhada do Procedimento Executado) *
              </label>
              <textarea
                rows={3}
                required
                value={metodoUtilizado}
                onChange={(e) => setMetodoUtilizado(e.target.value)}
                placeholder="Ex: Inspeção não-destrutiva por Ultrassom Phased Array e Líquido Penetrante no trilho do flap #2 asa direita conforme SB A320-57-1240 item 3.B..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Resultado da Ação de Manutenção / Laudo Técnico *
              </label>
              <textarea
                rows={2}
                required
                value={resultadoAcao}
                onChange={(e) => setResultadoAcao(e.target.value)}
                placeholder="Ex: Nenhuma trinca ou corrosão detectada. Dimensões dentro das tolerâncias do manual. Aprovado para retorno ao serviço."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* SECTION 6: RESPONSÁVEIS, ASSINATURAS E OPERADOR */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <User className="w-4 h-4" />
              6. Responsáveis Técnicos e Assinaturas Regulamentares
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Mecânico Executor (MMA) *
                </label>
                <select
                  value={idExecutor}
                  onChange={(e) => setIdExecutor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} ({t.cargo} - CANAC: {t.canac})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Inspetor de Qualidade *
                </label>
                <select
                  value={idInspetor}
                  onChange={(e) => setIdInspetor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} ({t.cargo} - CANAC: {t.canac})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Responsável Técnico (RT / Dir. Manutenção) *
                </label>
                <select
                  value={idRt}
                  onChange={(e) => setIdRt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} ({t.cargo} - CANAC: {t.canac})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nome do Operador / Cliente
                </label>
                <input
                  type="text"
                  value={nomeOperador}
                  onChange={(e) => setNomeOperador(e.target.value)}
                  placeholder="Ex: Impacto Linhas Aéreas"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Representante do Operador
                </label>
                <input
                  type="text"
                  value={representanteOperador}
                  onChange={(e) => setRepresentanteOperador(e.target.value)}
                  placeholder="Ex: Cmte. Fernando Vasconcelos"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Status da FCDA
                </label>
                <select
                  value={statusFcda}
                  onChange={(e) => setStatusFcda(e.target.value as StatusFCDA)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="CONCLUIDA">Concluída / Assinada</option>
                  <option value="EM_ELABORACAO">Em Elaboração / Aberta</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
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
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-950/40 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              {submitting ? 'Emitindo...' : fcdaToEdit ? 'Salvar Alterações FCDA' : 'Emitir FCDA (Form F 001-03-2)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
