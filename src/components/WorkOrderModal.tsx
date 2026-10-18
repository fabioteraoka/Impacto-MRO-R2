import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Plane,
  Wrench,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Calendar,
  Clock,
  Building,
  Plus,
  Trash2,
  AlertOctagon,
  FileSpreadsheet,
} from 'lucide-react';
import {
  OrdemServicoF001_09_2,
  TecnicoComQualificacao,
  Ferramenta,
  BaseSigla,
  ValidacaoAberturaOSResult,
  PublicacaoTecnicaF001_02_1,
  CartaConcessaoManuais,
  SolicitacaoComercial,
} from '../types/mro';
import { apiClient } from '../services/apiClient';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (novaOS: OrdemServicoF001_09_2) => void;
  solicitacaoOrigem?: SolicitacaoComercial | null;
  tecnicos: TecnicoComQualificacao[];
  ferramentas: Ferramenta[];
  bases?: any[];
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  solicitacaoOrigem,
  tecnicos,
  ferramentas,
}) => {
  if (!isOpen) return null;

  const agora = new Date();
  const dataHojeStr = agora.toISOString().split('T')[0];
  const horaAgoraStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

  // Form states
  const [matricula, setMatricula] = useState(solicitacaoOrigem?.matricula_aeronave || '');
  const [modelo, setModelo] = useState(solicitacaoOrigem?.modelo_aeronave || 'ATR 72-600');
  const [msn, setMsn] = useState(solicitacaoOrigem?.msn_aeronave || '');
  const [operador, setOperador] = useState(solicitacaoOrigem?.operador_cliente || '');
  const [baseExecutante, setBaseExecutante] = useState<BaseSigla>(
    (solicitacaoOrigem?.base_solicitada as BaseSigla) || 'GRU'
  );
  const [dataAbertura, setDataAbertura] = useState(dataHojeStr);
  const [horaAbertura, setHoraAbertura] = useState(horaAgoraStr);
  const [dataEncerramento, setDataEncerramento] = useState(dataHojeStr);
  const [horaEncerramento, setHoraEncerramento] = useState('18:00');
  const [tsn, setTsn] = useState('');
  const [csn, setCsn] = useState('');
  const [escopoServico, setEscopoServico] = useState(solicitacaoOrigem?.escopo_servico || '');
  const [testesFuncionais, setTestesFuncionais] = useState(
    'Teste de estanqueidade a 3.000 PSI sem vazamentos. Testes funcionais e operacionais em conformidade com o AMM.'
  );

  // Alocação de Pessoal
  const [idMecanico, setIdMecanico] = useState<number | ''>(5);
  const [idInspetor, setIdInspetor] = useState<number | ''>(4);

  // Ferramental Selecionado
  const [ferramentasSelecionadas, setFerramentasSelecionadas] = useState<number[]>([1]);

  // Diretrizes Vinculadas (DAs/ADs/SBs)
  const [diretrizesInput, setDiretrizesInput] = useState<string[]>(
    solicitacaoOrigem?.diretrizes_mandatorias_solicitadas && solicitacaoOrigem.diretrizes_mandatorias_solicitadas.length > 0
      ? solicitacaoOrigem.diretrizes_mandatorias_solicitadas
      : []
  );
  const [novaDiretriz, setNovaDiretriz] = useState('');

  // Publicações Aplicáveis (Campo 12)
  const [manuaisTexto, setManuaisTexto] = useState(
    'AMM ATR 72 JASC 32-00-00 (Rev. 44) sob Carta de Concessão CC-VOP-2026-005; IPC JASC 32.'
  );

  // Peças e Materiais (Campo 14)
  const [materiaisTexto, setMateriaisTexto] = useState('N/A');

  // Estado de Validação em Tempo Real
  const [validacao, setValidacao] = useState<ValidacaoAberturaOSResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validar elegibilidade sempre que mudar campos críticos
  useEffect(() => {
    let isCancelled = false;

    const executarValidacao = async () => {
      if (!modelo || !operador || !baseExecutante) return;
      setIsValidating(true);
      try {
        const res = await apiClient.validarElegibilidadeOS({
          modelo_aeronave: modelo,
          base_executante: baseExecutante,
          operador,
          data_hora_abertura: `${dataAbertura}T${horaAbertura}`,
          data_hora_prevista_inicio: solicitacaoOrigem?.data_hora_prevista_inicio,
          id_mecanico_executor: idMecanico ? Number(idMecanico) : undefined,
          id_inspetor_aprs: idInspetor ? Number(idInspetor) : undefined,
          ids_ferramentas: ferramentasSelecionadas,
        });
        if (!isCancelled) {
          setValidacao(res);
        }
      } catch (err: any) {
        console.error('Erro na validação prévia:', err);
      } finally {
        if (!isCancelled) setIsValidating(false);
      }
    };

    const timeout = setTimeout(executarValidacao, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [modelo, operador, baseExecutante, idMecanico, idInspetor, ferramentasSelecionadas, dataAbertura, horaAbertura]);

  const handleAddDiretriz = () => {
    const trimmed = novaDiretriz.trim();
    if (!trimmed) return;
    if (!diretrizesInput.includes(trimmed)) {
      setDiretrizesInput([...diretrizesInput, trimmed]);
    }
    setNovaDiretriz('');
  };

  const handleRemoveDiretriz = (idx: number) => {
    setDiretrizesInput(diretrizesInput.filter((_, i) => i !== idx));
  };

  const toggleFerramenta = (id: number) => {
    if (ferramentasSelecionadas.includes(id)) {
      setFerramentasSelecionadas(ferramentasSelecionadas.filter((fId) => fId !== id));
    } else {
      setFerramentasSelecionadas([...ferramentasSelecionadas, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!matricula.trim() || !modelo.trim() || !operador.trim() || !escopoServico.trim()) {
      setErrorMessage('Preencha os campos obrigatórios: Matrícula, Modelo, Operador e Escopo de Serviço.');
      return;
    }

    if (validacao && !validacao.pode_abrir) {
      setErrorMessage(
        `BLOQUEIO REGULATÓRIO: A OS não pode ser aberta devido aos seguintes impeditivos: ${validacao.motivos_bloqueio.join(' | ')}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<OrdemServicoF001_09_2> & { ids_ferramentas_selecionadas?: number[] } = {
        id_solicitacao: solicitacaoOrigem?.id_solicitacao,
        numero_solicitacao: solicitacaoOrigem?.numero_solicitacao,
        status_os: 'ABERTA',
        campo_02_matricula: matricula.trim().toUpperCase(),
        campo_03_modelo: modelo.trim(),
        campo_04_msn: msn.trim() || 'N/A',
        campo_05_operador: operador.trim(),
        campo_06_base_executante: baseExecutante,
        campo_07_data_abertura: dataAbertura,
        campo_07_hora_abertura: `${horaAbertura} UTC`,
        campo_08_data_encerramento_prevista: dataEncerramento,
        campo_08_hora_encerramento_prevista: `${horaEncerramento} UTC`,
        campo_09_tsn: tsn.trim() || 'N/A',
        campo_10_csn: csn.trim() || 'N/A',
        campo_11_escopo_servico: escopoServico.trim(),
        campo_12_manuais_texto_formatado: manuaisTexto.trim() || 'N/A',
        campo_14_materiais_pecas_texto: materiaisTexto.trim() || 'N/A',
        campo_16_testes_funcionais: testesFuncionais.trim() || 'N/A',
        id_mecanico_executor: Number(idMecanico),
        id_inspetor_aprs: Number(idInspetor),
        ids_ferramentas_selecionadas: ferramentasSelecionadas,
        diretrizes_vinculadas: diretrizesInput.map((dir) => ({
          numero_diretriz: dir,
          tipo_diretriz: 'DA_ANAC',
          categoria: 'AERONAVE',
          tipo_acao: 'REPETITIVA',
        })),
        observacoes: solicitacaoOrigem
          ? `OS gerada a partir da solicitação comercial ${solicitacaoOrigem.numero_solicitacao}.`
          : 'Abertura direta pelo PCP.',
      };

      const nova = await apiClient.createOrdemServico(payload);
      onSuccess(nova);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao abrir Ordem de Serviço.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  MOMQ 6.3 • I 001-09
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  FORM F 001-09-2
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Abertura de Ordem de Serviço (OS) • PCP Impacto Aviation
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body com scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Mensagem de Erro Global */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 flex items-start space-x-2.5">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Bloqueio Regulatório:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Banner de Auditoria e Trava Preventiva em Tempo Real */}
          <div className="p-4 rounded-xl border bg-slate-800/60 border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-mono text-[11px] font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>STATUS DE AUDITORIA REGULATÓRIA PRÉVIA (RBAC 145 / MOMQ 6.3):</span>
              </div>
              {isValidating ? (
                <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Auditando travas...</span>
              ) : validacao?.pode_abrir ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ELEGÍVEL PARA ABERTURA</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                  <AlertOctagon className="w-3 h-3" />
                  <span>BLOQUEIO IMPEDITIVO</span>
                </span>
              )}
            </div>

            {/* Badges de Verificação Individual */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
              {/* EO da Base */}
              <div className={`p-2 rounded-lg border ${validacao?.base_homologada_eo ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-rose-950/30 border-rose-800 text-rose-300'}`}>
                <span className="block text-[8px] text-slate-400 uppercase">EO Base ({baseExecutante})</span>
                <span className="font-bold">{validacao?.base_homologada_eo ? '✓ HOMOLOGADO' : '✗ NÃO CONSTA NA EO'}</span>
              </div>

              {/* Carta de Concessão de Manuais */}
              <div className={`p-2 rounded-lg border ${validacao?.carta_concessao_ativa ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-rose-950/30 border-rose-800 text-rose-300'}`}>
                <span className="block text-[8px] text-slate-400 uppercase">Manuais (IS 145.109)</span>
                <span className="font-bold truncate block">{validacao?.carta_concessao_ativa ? `✓ CARTA: ${validacao.carta_concessao_numero}` : '✗ SEM CONCESSÃO'}</span>
              </div>

              {/* Equipe Técnica */}
              <div className={`p-2 rounded-lg border ${validacao?.mecanico_apto && validacao?.inspetor_aprs_valido ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-rose-950/30 border-rose-800 text-rose-300'}`}>
                <span className="block text-[8px] text-slate-400 uppercase">Equipe (APRS / MNT-002)</span>
                <span className="font-bold">{validacao?.mecanico_apto && validacao?.inspetor_aprs_valido ? '✓ HABILITADOS' : '✗ INAPTO / SEM APRS'}</span>
              </div>

              {/* Ferramental */}
              <div className={`p-2 rounded-lg border ${validacao?.ferramentas_aptas ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-rose-950/30 border-rose-800 text-rose-300'}`}>
                <span className="block text-[8px] text-slate-400 uppercase">Ferramental PME</span>
                <span className="font-bold">{validacao?.ferramentas_aptas ? '✓ CALIBRADO / DISP.' : '✗ VENCIDO / QUAR.'}</span>
              </div>
            </div>

            {/* Lista de Motivos de Bloqueio se houver */}
            {validacao?.motivos_bloqueio && validacao.motivos_bloqueio.length > 0 && (
              <div className="bg-rose-900/20 border border-rose-500/40 p-2.5 rounded-lg text-rose-300 text-[11px] space-y-1 mt-2">
                <strong className="block text-rose-200">Motivos impeditivos regulatórios para emissão da OS:</strong>
                {validacao.motivos_bloqueio.map((m, i) => (
                  <div key={i} className="flex items-start space-x-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Avisos não impeditivos */}
            {validacao?.avisos && validacao.avisos.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-500/40 p-2 rounded-lg text-amber-300 text-[10.5px]">
                {validacao.avisos.map((av, i) => (
                  <div key={i}>⚠️ {av}</div>
                ))}
              </div>
            )}
          </div>

          {/* SEÇÃO I: CAMPOS 01 A 10 (AERONAVE, OPERADOR E HORÁRIOS) */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-slate-200 text-xs border-b border-slate-700/80 pb-1 uppercase tracking-wider flex items-center space-x-2">
              <Plane className="w-4 h-4 text-blue-400" />
              <span>Seção I • Identificação da Aeronave e Abertura (Campos 01 a 10)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 02 • Matrícula da Aeronave *
                </label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                  placeholder="Ex: PR-IMA, PP-VPA"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 03 • Modelo da Aeronave *
                </label>
                <select
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                >
                  <option value="ATR 72-600">ATR 72-600 (ATR 72-212A)</option>
                  <option value="ATR 72-500">ATR 72-500 (ATR 72-212A)</option>
                  <option value="ATR 42-500">ATR 42-500</option>
                  <option value="Airbus A320-200">Airbus A320-200 (ceo)</option>
                  <option value="Airbus A320neo">Airbus A320neo</option>
                  <option value="Airbus A321-200">Airbus A321-200</option>
                  <option value="Boeing 737-800">Boeing 737-800 (NG)</option>
                  <option value="Boeing 737-700">Boeing 737-700 (NG)</option>
                  <option value="Embraer 190 / 195">Embraer E-Jets 190 / 195</option>
                  <option value="Cessna 208B Grand Caravan">Cessna 208B Grand Caravan</option>
                  <option value="Beechcraft King Air B200">King Air B200 / B350</option>
                  <option value="Cessna 525 Citation Jet">Cessna 525 Citation (Só GRU)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 04 • MSN (Nº de Série)
                </label>
                <input
                  type="text"
                  value={msn}
                  onChange={(e) => setMsn(e.target.value)}
                  placeholder="Ex: 1248"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 05 • Operador / Proprietário *
                </label>
                <input
                  type="text"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  placeholder="Ex: VoePass Linhas Aéreas S.A., TAM Linhas Aéreas S.A."
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 06 • Base Executante *
                </label>
                <select
                  value={baseExecutante}
                  onChange={(e) => setBaseExecutante(e.target.value as BaseSigla)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                >
                  <option value="GRU">Base Sede GRU (Guarulhos)</option>
                  <option value="CNF">Base Secundária CNF (Confins)</option>
                  <option value="VCP">Base Secundária VCP (Viracopos)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 07 • Data e Hora Abertura
                </label>
                <div className="flex space-x-1">
                  <input
                    type="date"
                    value={dataAbertura}
                    onChange={(e) => setDataAbertura(e.target.value)}
                    className="w-2/3 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                  <input
                    type="time"
                    value={horaAbertura}
                    onChange={(e) => setHoraAbertura(e.target.value)}
                    className="w-1/3 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 08 • Previsão de Encerramento
                </label>
                <div className="flex space-x-1">
                  <input
                    type="date"
                    value={dataEncerramento}
                    onChange={(e) => setDataEncerramento(e.target.value)}
                    className="w-2/3 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                  <input
                    type="time"
                    value={horaEncerramento}
                    onChange={(e) => setHoraEncerramento(e.target.value)}
                    className="w-1/3 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Campo 09 • TSN
                  </label>
                  <input
                    type="text"
                    value={tsn}
                    onChange={(e) => setTsn(e.target.value)}
                    placeholder="8450.2 FH"
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Campo 10 • CSN
                  </label>
                  <input
                    type="text"
                    value={csn}
                    onChange={(e) => setCsn(e.target.value)}
                    placeholder="7120 FC"
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO II: ESCOPO DE SERVIÇO & PUBLICAÇÕES (Campos 11 a 14) */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-slate-200 text-xs border-b border-slate-700/80 pb-1 uppercase tracking-wider flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Seção II • Escopo, Publicações e Diretrizes Mandatórias (Campos 11 a 14)</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Campo 11 • Descrição dos Serviços Solicitados / Escopo de Manutenção *
              </label>
              <textarea
                value={escopoServico}
                onChange={(e) => setEscopoServico(e.target.value)}
                rows={2}
                placeholder="Ex: Cumprimento de Inspeção de Trânsito 50FH, Diretriz Mandatória DA 2025-11-02 e Substituição de Sensor de Pressão Hidráulica."
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Vínculo Nominal de Diretrizes de Aeronavegabilidade (DAs / ADs / SBs) com Disparo de FCDA */}
            <div className="p-3 bg-slate-800/80 border border-blue-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-blue-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Vínculo Nominal de Diretrizes Mandatórias (DAs/ADs/SBs) → Dispara FCDA (Form F 001-03-2)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">IS 39-001A / MOMQ 6.3</span>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={novaDiretriz}
                  onChange={(e) => setNovaDiretriz(e.target.value)}
                  placeholder="Ex: DA 2025-11-02 ou EASA AD 2026-0038"
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddDiretriz}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center space-x-1 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vincular DA</span>
                </button>
              </div>

              {diretrizesInput.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {diretrizesInput.map((dir, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 px-2.5 py-1 bg-blue-900/40 border border-blue-500/50 rounded-lg text-blue-200 text-xs font-mono"
                    >
                      <span className="font-bold">{dir}</span>
                      <span className="text-[10px] text-cyan-300">(FCDA F 001-03-2 Automática)</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDiretriz(idx)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  Nenhuma diretriz mandatória vinculada a esta OS. Caso haja cumprimento de DA/AD/SB, vincule acima para geração automática da FCDA.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 12 • Manuais Técnicos e Revisões Utilizadas (F 001-02-1)
                </label>
                <input
                  type="text"
                  value={manuaisTexto}
                  onChange={(e) => setManuaisTexto(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Campo 14 • Peças e Materiais Aplicados (Req F 001-01-1)
                </label>
                <input
                  type="text"
                  value={materiaisTexto}
                  onChange={(e) => setMateriaisTexto(e.target.value)}
                  placeholder="Ex: Sensor P/N 32-1104-01 ou N/A"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO III: ALOCAÇÃO DE EQUIPE TÉCNICA (Parte 1 & RBAC 145/65) */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-slate-200 text-xs border-b border-slate-700/80 pb-1 uppercase tracking-wider flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Alocação da Equipe Técnica Habilitada (MOMQ Parte 1 • Trava F 001-03 e MNT-002)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Mecânico Executor (MMA) • Campo 19 *
                </label>
                <select
                  value={idMecanico}
                  onChange={(e) => setIdMecanico(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecione o Mecânico Executor...</option>
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} (CANAC: {t.canac} - {t.cargo}) {t.qualificacao.is_apto ? '✓ APTO' : '✗ BLOQUEADO'}
                    </option>
                  ))}
                </select>
                {validacao?.mecanico_motivos_bloqueio && (
                  <p className="text-[10px] text-rose-400 mt-1">
                    ⚠️ {validacao.mecanico_motivos_bloqueio.join(', ')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Inspetor APRS Designado • Campo 20 *
                </label>
                <select
                  value={idInspetor}
                  onChange={(e) => setIdInspetor(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecione o Inspetor APRS...</option>
                  {tecnicos.map((t) => (
                    <option key={t.id_tecnico} value={t.id_tecnico}>
                      {t.nome_completo} (CANAC: {t.canac}) {t.qualificacao.aprovado_aprs ? '✓ APRS ATIVO' : '✗ SEM APRS'}
                    </option>
                  ))}
                </select>
                {validacao?.inspetor_motivos_bloqueio && (
                  <p className="text-[10px] text-rose-400 mt-1">
                    ⚠️ {validacao.inspetor_motivos_bloqueio.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO IV: SELEÇÃO DE FERRAMENTAL PME (Parte 2 & Trava de Quarentena) */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-slate-200 text-xs border-b border-slate-700/80 pb-1 uppercase tracking-wider flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Ferramental PME e Metrológico Requerido (Parte 2 • Trava F 001-06 / Quarentena)</span>
            </h3>

            <p className="text-[11px] text-slate-400">
              Selecione as ferramentas e equipamentos necessários para a execução dos serviços. Ferramentas em <strong>Quarentena (Tag Vermelha)</strong> ou com <strong>Calibração Vencida</strong> bloquearão imediatamente a abertura da OS.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-800/40 rounded-xl border border-slate-700">
              {ferramentas.map((f) => {
                const isSelected = ferramentasSelecionadas.includes(f.id_ferramenta);
                const isBloqueada = f.status === 'QUARENTENA' || f.calibracao_vencida || f.status === 'EM_CALIBRACAO';

                return (
                  <div
                    key={f.id_ferramenta}
                    onClick={() => toggleFerramenta(f.id_ferramenta)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition flex items-start space-x-2.5 ${
                      isSelected
                        ? isBloqueada
                          ? 'bg-rose-950/40 border-rose-600 text-rose-200'
                          : 'bg-blue-950/40 border-blue-500 text-blue-100'
                        : isBloqueada
                        ? 'bg-slate-900/60 border-slate-800 opacity-60'
                        : 'bg-slate-900 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-blue-600 focus:ring-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate">{f.descricao}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            f.status === 'QUARENTENA'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : f.calibracao_vencida
                              ? 'bg-rose-500/20 text-rose-400'
                              : f.status === 'EM_USO'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {f.status === 'QUARENTENA'
                            ? 'QUARENTENA'
                            : f.calibracao_vencida
                            ? 'VENCIDA'
                            : f.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        P/N: {f.part_number} • S/N: {f.serial_number}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {f.ultima_calibracao?.data_vencimento
                          ? `Validade: ${f.ultima_calibracao.data_vencimento}`
                          : 'Sem calibração cadastrada'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AVISO MANDATÓRIO DE PREVENÇÃO FOD (Foreign Object Damage) */}
          <div className="p-3 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl flex items-center space-x-3 text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <strong className="block font-bold uppercase tracking-wider text-[11px]">
                Aviso Mandatório de Prevenção FOD (MOMQ / RBAC 145):
              </strong>
              <span>
                "AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO."
              </span>
            </div>
          </div>
        </form>

        {/* Footer do Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 font-mono">
            {validacao?.pode_abrir ? (
              <span className="text-emerald-400">✓ Todos os requisitos regulatórios cumpridos.</span>
            ) : (
              <span className="text-rose-400">⚠️ Corrija os bloqueios indicados antes de emitir a OS.</span>
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
              onClick={handleSubmit}
              disabled={isSubmitting || (validacao !== null && !validacao.pode_abrir)}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Emitindo OS...</span>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Emitir Pacote de Trabalho (Form F 001-09-2)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
