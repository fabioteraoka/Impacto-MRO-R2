/**
 * Tipos e Modelos de Dados - Impacto Aviation MRO
 * Homologação: ANAC COM 200607-05 / EASA.145.1003
 * Manuais de Referência: MOMQ MNT-001 (Rev 07/08), MNT-002, RBAC 145, RBAC 65, RBAC 43
 */

export type TipoBase = 'PRINCIPAL' | 'SECUNDARIA';

export interface BaseOperacional {
  id_base: number;
  nome_base: string; // Ex: Base Sede GRU, Base Secundária CNF
  codigo_anac: string;
  tipo_base: TipoBase;
  ativo: boolean;
}

export type CargoTecnico =
  | 'GR' // Gerente Responsável (Accountable Manager)
  | 'RT' // Responsável Técnico (Technical Director)
  | 'Gerente Qualidade' // Quality Assurance Manager
  | 'PCP' // Planejamento e Controle da Produção
  | 'Inspetor Chefe' // Chief Inspector
  | 'Inspetor' // Certified Inspector (APRS)
  | 'MMA'; // Mecânico de Manutenção Aeronáutica

export type StatusToxicologico = 'EM_DIA' | 'VENCIDO' | 'PENDENTE';

export interface PessoalTecnico {
  id_tecnico: number;
  nome_completo: string;
  canac: string; // Código ANAC único
  cpf: string;
  cargo: CargoTecnico;
  licenca_cct: string; // GMP, CEL, AVI ou "N/A"
  data_admissao: string; // YYYY-MM-DD
  status_exame_toxicologico: StatusToxicologico; // PPSP
  id_base_alocada: number;
  ativo: boolean;
  // Campos virtuais / calculados
  base_nome?: string;
  base_codigo?: string;
}

export type StatusDesignacao = 'ATIVO' | 'SUSPENSO' | 'VENCIDO';

export interface DesignacaoFuncoesF001_03 {
  id_designacao: number;
  id_tecnico: number;
  numero_f001_03: string; // Form F 001-03
  funcoes_autorizadas: string; // Ex: APRS, Inspeção Final, Execução Célula
  data_emissao: string; // YYYY-MM-DD
  data_validade: string; // YYYY-MM-DD
  assinado_por_rt: boolean; // Trava Regra 6: se falso, bloqueia assinatura de OS
  status: StatusDesignacao;
  // Campos virtuais
  tecnico_nome?: string;
  tecnico_canac?: string;
}

export interface TreinamentoMNT002 {
  id_treinamento: number;
  id_tecnico: number;
  nome_curso: string; // RBAC 145, EASA Part-145, EWIS, FTS, Human Factors, etc.
  carga_horaria: number;
  data_conclusao: string; // YYYY-MM-DD
  data_reciclagem: string; // YYYY-MM-DD - Limite de validade do curso
  certificado_url: string; // URL ou "N/A"
  // Campos virtuais
  tecnico_nome?: string;
}

// Cursos mandatórios regulamentares (MOMQ MNT-002)
export const CURSOS_MANDATORIOS = [
  'RBAC 145 - Requisitos de Organização de Manutenção',
  'Fatores Humanos na Manutenção (Human Factors)',
  'EWIS - Electrical Wiring Interconnection System',
  'FTS - Fuel Tank Safety (Nível 2)',
  'EASA Part-145 (Requisitos Suplementares EASA)',
  'SGSO / SMS - Sistema de Gerenciamento da Segurança Operacional'
] as const;

export interface StatusQualificacaoAudit {
  id_tecnico: number;
  is_apto: boolean;
  status: 'APTO' | 'BLOQUEADO';
  aprovado_aprs: boolean;
  motivos_bloqueio: string[];
  funcoes_autorizadas: string[];
  f001_03_ativo: boolean;
  f001_03_assinado_rt: boolean;
  f001_03_numero: string;
  f001_03_validade: string;
  toxicologico_ok: boolean;
  treinamentos_vencidos: {
    nome_curso: string;
    data_reciclagem: string;
  }[];
  treinamentos_faltantes: string[];
  treinamentos_a_vencer_30d: {
    nome_curso: string;
    data_reciclagem: string;
    dias_restantes: number;
  }[];
}

export interface TecnicoComQualificacao extends PessoalTecnico {
  qualificacao: StatusQualificacaoAudit;
  designacoes: DesignacaoFuncoesF001_03[];
  treinamentos: TreinamentoMNT002[];
  base?: BaseOperacional;
}

// Relatório Trimestral F 001-07 para a ANAC
export interface ItemRelatorioF001_07 {
  item: number;
  id_tecnico: number;
  nome_completo: string;
  canac: string;
  cpf: string;
  cargo: string;
  licenca_cct: string;
  base_alocada: string;
  f001_03_numero: string;
  f001_03_validade: string;
  f001_03_rt_assinado: 'SIM' | 'NÃO';
  funcoes_autorizadas: string;
  cursos_mandatorios_status: 'CONFORME' | 'NÃO CONFORME';
  exame_toxicologico: StatusToxicologico;
  condicao_operacional: 'APTO' | 'BLOQUEADO';
  motivo_bloqueio_resumo: string; // ou "N/A"
}

export interface RelatorioTrimestralF001_07 {
  cabecalho: {
    empresa: 'Impacto Aviation Ltda';
    homologacao_anac: 'COM 200607-05/ANAC';
    homologacao_easa: 'EASA.145.1003';
    formulario: 'F 001-07';
    titulo: 'RELAÇÃO DE PESSOAL TÉCNICO E INSPETORES QUALIFICADOS - RELATÓRIO TRIMESTRAL (RBAC 145.163 / MOMQ MNT-001)';
    revisao_momq: 'MNT-001 Rev 08';
    trimestre: string; // Ex: "3º Trimestre / 2026"
    data_geracao: string; // Data ISO / legível
    responsavel_tecnico: string;
    canac_rt: string;
    gerente_qualidade: string;
  };
  estatisticas: {
    total_tecnicos: number;
    total_aptos: number;
    total_bloqueados: number;
    total_aprs_habilitados: number;
    taxa_conformidade_percentual: number;
    tecnicos_por_base: Record<string, number>;
  };
  itens: ItemRelatorioF001_07[];
}

// =============================================================================
// PARTE 2: FERRAMENTARIA, CONTROLE DE CALIBRAÇÃO E QUARENTENA
// Formulários: F 001-06 (Calibração), F 001-06-1 (Movimentação), F 001-06-3 (Tag Calibração),
// F 001-06-4 / F 001-06-04 (Quarentena), Tag F 001-01-6 (Vermelha / Não Utilizável), BTI-PMP-05
// =============================================================================

export type StatusFerramenta = 'DISPONIVEL' | 'EM_USO' | 'EM_CALIBRACAO' | 'QUARENTENA';
export type PropriedadeFerramenta = 'PROPRIA' | 'TERCEIROS' | 'ALUGADA';

export interface Ferramenta {
  id_ferramenta: number;
  descricao: string;
  part_number: string;
  serial_number: string;
  posicao_localizacao: string; // Ex: "Armário A2-G04", "Bancada Eletrônica"
  requer_calibracao: boolean;
  propriedade: PropriedadeFerramenta;
  status: StatusFerramenta;
  fabricante: string; // ou "N/A"
  faixa_operacao: string; // Ex: "0-250 Nm", "0-100 psi", "N/A"
  tolerancia_admissivel: string; // Ex: "± 2.5%", "N/A"
  observacoes: string; // ou "N/A"
  modelo?: string;
  tipo_ferramenta?: string;
  localizacao_fisica?: string;
  periodicidade_meses?: number;
  id_base?: number;
  nome_base?: string;
  data_ultima_calibracao?: string;
  data_proxima_calibracao?: string;
  status_calibracao?: 'EM_DIA' | 'A_VENCER' | 'VENCIDA' | 'NAO_APLICAVEL';
  status_operacional?: 'DISPONIVEL' | 'EM_USO' | 'EM_CALIBRACAO' | 'QUARENTENA' | 'BAIXADA';
  calibracoes?: ControleCalibracaoF001_06[];
  quarentenas?: QuarentenaFerramentasF001_06_4[];
  // Campos virtuais
  ultima_calibracao?: ControleCalibracaoF001_06;
  registro_quarentena_ativo?: QuarentenaFerramentasF001_06_4;
  movimentacao_atual?: MovimentacaoFerramentaF001_06_1;
  dias_para_vencer_calibracao?: number;
  calibracao_vencida?: boolean;
}

export type FerramentaDetalhada = Ferramenta;
export type QuarentenaFerramentaF001_06_4 = QuarentenaFerramentasF001_06_4;

export interface ControleCalibracaoF001_06 {
  id_calibracao: number;
  id_ferramenta: number;
  numero_laudo: string; // Certificado de Calibração RBC/Inmetro
  laboratorio_homologado: string; // Ex: "Laboratório Metrológico Aero Ltda - RBC #142"
  desvio_padrao_observado: number; // Conforme BTI-PMP-05
  desvio_maximo_tolerado: number; // Conforme BTI-PMP-05
  aprovado_desvio_padrao: boolean; // Se false -> Segregação Quarentena imediata
  data_afericao: string; // YYYY-MM-DD
  data_vencimento: string; // YYYY-MM-DD
  tag_f001_06_3_aplicada: boolean; // Tag Amarela de Calibração
  observacoes_laudo: string; // ou "N/A"
  // Campos virtuais e compatibilidade
  numero_certificado?: string;
  desvio_padrao_encontrado?: number;
  tolerancia_admissivel?: number;
  data_calibracao?: string;
  resultado?: 'APROVADO' | 'REPROVADO';
  toolDesc?: string;
  pn?: string;
  sn?: string;
  ferramenta_pn?: string;
  ferramenta_sn?: string;
  ferramenta_descricao?: string;
}

export type TipoMovimentacao = 'CHECK_OUT' | 'CHECK_IN';

export interface MovimentacaoFerramentaF001_06_1 {
  id_movimentacao: number;
  numero_f001_06_1: string; // Registro sequencial
  id_ferramenta: number;
  id_tecnico: number; // Técnico retirante
  tipo_movimentacao: TipoMovimentacao;
  data_hora: string; // ISO string
  ordem_servico_numero: string; // Ex: "OS-2026-081" ou "N/A"
  finalidade_servico: string; // Ex: "Torque cabeçote PT6A-67P" ou "N/A"
  condicoes_retirada: string; // "INTACTA_CALIBRADA", etc.
  condicoes_devolucao: string; // "INTACTA", "DANIFICADA", "N/A"
  devolvido_em?: string; // ISO string
  id_tecnico_devolucao?: number;
  // Campos virtuais e compatibilidade
  status?: 'RETIRADA' | 'DEVOLVIDA';
  descricao_ferramenta?: string;
  part_number?: string;
  serial_number?: string;
  nome_tecnico?: string;
  canac?: string;
  numero_os?: string;
  data_retirada?: string;
  data_devolucao?: string;
  condicao_retorno?: string;
  ferramenta_descricao?: string;
  ferramenta_pn?: string;
  ferramenta_sn?: string;
  tecnico_nome?: string;
  tecnico_canac?: string;
}

export type StatusResolucaoQuarentena = 'RETIDO' | 'ENVIADO_AFERICAO' | 'SUCATEADO' | 'LIBERADO_RECALIBRADO' | 'RETIDO_QUARENTENA' | 'LIBERADO_APOS_CALIBRACAO';

export interface QuarentenaFerramentasF001_06_4 {
  id_quarentena: number;
  numero_f001_06_4: string; // Formulário F 001-06-04
  id_ferramenta: number;
  motivo_segregacao: string; // Ex: "Calibração Vencida", "Queda / Danificada", "Desvio Padrão BTI-PMP-05 Reprovado"
  tag_vermelha_f001_01_6: string; // Código Tag Vermelha "Material Não Utilizável"
  data_entrada: string; // ISO string
  responsavel_segregacao: number; // id_tecnico (Inspetor / Qualidade / Ferramenteiro)
  local_armazenamento_segregado: string; // "Armário Quarentena Trancado Q-01"
  status_resolucao: StatusResolucaoQuarentena;
  data_resolucao?: string; // ISO string ou "N/A"
  despacho_qualidade: string; // Parecer do GQ ou Inspetor Chefe ou "N/A"
  // Campos virtuais e compatibilidade
  data_segregacao?: string;
  motivo?: string;
  id_responsavel?: number;
  nome_responsavel?: string;
  observacoes?: string;
  descricao_ferramenta?: string;
  part_number?: string;
  serial_number?: string;
  ferramenta_descricao?: string;
  ferramenta_pn?: string;
  ferramenta_sn?: string;
  responsavel_nome?: string;
  responsavel_canac?: string;
}

export interface ToolingStats {
  total_ferramentas: number;
  disponiveis: number;
  em_uso: number;
  em_calibracao: number;
  em_quarentena: number;
  calibracoes_vencidas: number;
  calibracoes_a_vencer_30d: number;
  movimentacoes_ativas: number;
  taxa_disponibilidade: number;
}

// ============================================================================
// PARTE 3: CTM, DADOS TÉCNICOS & DIRETRIZES DE AERONAVEGABILIDADE (DA/AD/SB)
// Regulamentos: RBAC 145.109, IS 145.109-001, I 001-02, I 001-03, I 001-24, IS 39-001A
// ============================================================================

export type TipoDocumentoTecnico =
  | 'AMM'
  | 'IPC'
  | 'MPD'
  | 'SRM'
  | 'WDM'
  | 'CMM'
  | 'SB'
  | 'NDT'
  | 'OUTRO';

export type MeioDistribuicao = 'PORTAL_ONLINE' | 'DIGITAL_SERVIDOR' | 'FISICO_PASTA';
export type StatusPublicacao = 'ATUALIZADO' | 'A_REVISAR' | 'OBSOLETO' | 'AGUARDANDO_CONCESSAO';
export type StatusCartaConcessao = 'VALIDA' | 'VENCIDA' | 'REVOGADA';

export interface CartaConcessaoManuais {
  id_carta_concessao: number;
  numero_carta: string; // Ex: CC-TAM-2026-014
  operador_cliente: string; // Ex: TAM Linhas Aéreas S.A.
  frotas_modelos: string; // Ex: Airbus A320 Family / ATR 72-600
  manuais_concedidos: string; // Ex: AMM, IPC, MPD, WDM, SRM, CMM
  data_emissao: string; // YYYY-MM-DD
  data_validade: string; // YYYY-MM-DD
  forma_acesso: string; // Ex: Portal AirbusWorld institucional
  status: StatusCartaConcessao;
  id_responsavel: number;
  responsavel_nome?: string;
  observacoes: string;
}

export interface PublicacaoTecnicaF001_02_1 {
  id_publicacao: number;
  codigo_documento: string; // Ex: AMM-A320-REV54
  titulo: string; // Ex: Aircraft Maintenance Manual - AMM
  tipo_documento: TipoDocumentoTecnico;
  fabricante: string; // Ex: Airbus, Cessna, CFM, Pratt & Whitney
  modelo_aplicavel: string; // Ex: Airbus A320 Family
  ata_capitulo: string; // Ex: Geral, ATA 24, ATA 32, N/A
  revisao_atual: string; // Ex: Rev. 54
  data_revisao: string; // YYYY-MM-DD
  meio_distribuicao: MeioDistribuicao;
  status: StatusPublicacao;
  data_ultima_verificacao: string; // YYYY-MM-DD
  id_responsavel_atualizacao: number;
  responsavel_nome?: string;
  id_carta_concessao?: number;
  numero_carta_concessao?: string;
  link_acesso?: string;
  observacoes: string;
  ciencias_count?: number;
}

export interface CienciaCorpoTecnicoF001_02_2 {
  id_ciencia: number;
  id_publicacao: number;
  id_tecnico: number;
  data_ciencia: string; // YYYY-MM-DD HH:mm:ss
  revisao_cientificada: string;
  status_ciencia: 'CONFIRMADA';
  observacoes: string;
  tecnico_nome?: string;
  tecnico_canac?: string;
  tecnico_cargo?: string;
  publicacao_titulo?: string;
  publicacao_codigo?: string;
}

export type CategoriaAplicacaoDA = 'AERONAVE' | 'MOTOR' | 'HELICE' | 'COMPONENTE';
export type TipoAcaoDA = 'TERMINAL' | 'REPETITIVA' | 'PARCIAL';
export type AplicabilidadeDA = 'APLICAVEL' | 'NAO_APLICAVEL';
export type StatusFCDA = 'EM_ELABORACAO' | 'CONCLUIDA' | 'CANCELADA';

export interface FCDAF001_03_2 {
  id_fcda: number;
  numero_fcda: string; // Ex: FCDA-2026-0042
  matricula_aeronave: string; // Ex: PR-IMP
  msn_aeronave: string; // Ex: 18942
  numero_diretriz: string; // Ex: DA 2026-04-01 / FAA AD 2025-18-04
  data_efetividade: string; // YYYY-MM-DD
  vencimento_limite: string; // Ex: 12.000 FH ou 31/12/2026
  categoria_aplicacao: CategoriaAplicacaoDA;
  tipo_acao: TipoAcaoDA;
  intervalo_repeticao: string; // Ex: A cada 500 FH ou 12 meses, ou N/A
  aplicabilidade: AplicabilidadeDA;
  justificativa_nao_aplicabilidade: string; // OBRIGATÓRIA se NAO_APLICAVEL (Regra #1)
  numero_sb_referencia: string; // Ex: SB CFM56-72-0941
  documentos_referencia: string; // Ex: AMM 72-00-00, EASA AD 2026-0038
  produto_fabricante: string; // Ex: CFM International
  produto_modelo: string; // Ex: CFM56-5B4/P
  produto_pn: string; // Ex: 340-001-204-0 ou N/A
  produto_sn: string; // Ex: SN-CFM-88912 ou N/A
  produto_vn: string; // Ex: Posição #1 (Motor Esquerdo) ou N/A
  tsn: string; // Total Time Since New (ex: 8450.5 FH)
  csn: string; // Total Cycles Since New (ex: 4320 FC)
  tso: string; // Time Since Overhaul (ex: 1200.0 FH ou N/A)
  tsli: string; // Time Since Last Inspection (ex: 450.0 FH ou N/A)
  csli: string; // Cycles Since Last Inspection (ex: 210 FC ou N/A)
  data_cumprimento: string; // YYYY-MM-DD
  numero_os: string; // Ex: OS-2026-0812
  proximo_vencimento_horas: string; // Horas ou N/A
  proximo_vencimento_ciclos: string; // Ciclos ou N/A
  proximo_vencimento_data: string; // Data ou N/A
  metodo_utilizado: string; // Descrição detalhada do procedimento executado
  resultado_acao: string; // Laudo / Conclusão da ação
  id_executor: number; // id_tecnico MMA
  executor_nome?: string;
  executor_canac?: string;
  id_inspetor: number; // id_tecnico Inspetor
  inspetor_nome?: string;
  inspetor_canac?: string;
  id_rt: number; // id_tecnico RT
  rt_nome?: string;
  rt_canac?: string;
  nome_operador: string; // Ex: AeroTáxi Impacto / Cliente Executivo
  representante_operador: string; // Ex: Cmte. Fernando Vasconcelos
  status_fcda: StatusFCDA;
  observacoes: string;
}

export interface RelatorioMandatoriasItemF001_03_3 {
  numero_item: number;
  numero_mandatorio: string; // DA / AD / SB
  assunto: string;
  numero_os: string;
  prefixo_aeronave: string;
  msn: string;
  data_execucao: string;
  tipo_acao: string;
  categoria: string;
  proximo_vencimento: string;
  responsavel_tecnico: string;
  aplicabilidade: string;
}

export interface RelatorioMandatoriasF001_03_3 {
  mes_ano: string; // YYYY-MM (ex: 2026-09)
  mes_ano_formatado: string; // Ex: Setembro / 2026
  data_geracao: string;
  responsavel_elaboracao: string;
  responsavel_aprovacao_rt: string;
  total_mandatorias: number;
  itens: RelatorioMandatoriasItemF001_03_3[];
}

export interface MonitoramentoAgencia {
  agencia: 'ANAC' | 'FAA' | 'EASA';
  nome_sistema: string;
  url_consulta: string;
  ultima_checagem: string;
  responsavel_checagem: string;
  status_monitoramento: 'EM_DIA' | 'PENDENTE';
  frequencia: 'SEMANAL' | 'QUINZENAL';
  observacoes: string;
  id_monitoramento?: number;
  descricao?: string;
  link_oficial?: string;
}

export interface CtmStats {
  total_publicacoes: number;
  publicacoes_atualizadas: number;
  publicacoes_a_revisar: number;
  total_cartas_concessao: number;
  cartas_ativas: number;
  total_fcdas: number;
  fcdas_aplicaveis: number;
  fcdas_nao_aplicaveis: number;
  fcdas_repetitivas: number;
  total_ciencias: number;
}

// ============================================================================
// PARTE 4: COMERCIAL, PCP E ABERTURA DA ORDEM DE SERVIÇO (MOMQ 6.3 / I 001-09)
// Form F 001-09-2 (Ordem de Serviço) & Form F 001-03-2 (FCDA vinculada)
// ============================================================================

export type BaseSigla = 'GRU' | 'CNF' | 'VCP';

export interface ModeloHomologadoEO {
  codigo_modelo: string;
  fabricante: string;
  familia: string;
  descricao: string;
  bases_homologadas: BaseSigla[]; // Bases onde o modelo está na Especificação Operativa
}

export type StatusSolicitacaoComercial =
  | 'NOVA'
  | 'EM_ANALISE_PCP'
  | 'APROVADA_OS_GERADA'
  | 'RECUSADA_REPROVADA'
  | 'CANCELADA';

export interface SolicitacaoComercial {
  id_solicitacao: number;
  numero_solicitacao: string; // Ex: "SOL-2026-0038"
  operador_cliente: string;
  contato_responsavel: string;
  email_contato: string;
  telefone_contato: string;
  matricula_aeronave: string; // Ex: "PR-IMA", "PP-VPA"
  modelo_aeronave: string; // Ex: "ATR 72-600"
  msn_aeronave: string;
  base_solicitada: BaseSigla;
  data_solicitacao: string; // ISO string
  data_hora_prevista_inicio: string; // ISO string
  data_hora_prevista_fim: string; // ISO string
  horas_antecedencia: number;
  antecedencia_valida_24h: boolean; // MOMQ 6.3 - mínimo 24h
  alerta_antecedencia?: string;
  elegivel_eo_base: boolean; // Verificação automática nas EOs da Base
  motivo_incompatibilidade_eo?: string;
  possui_carta_concessao_ativa: boolean; // IS 145.109-001
  numero_carta_concessao?: string;
  motivo_incompatibilidade_manuais?: string;
  escopo_servico: string;
  diretrizes_mandatorias_solicitadas: string[]; // Lista de DAs/ADs/SBs requeridas
  status: StatusSolicitacaoComercial;
  id_ordem_servico_gerada?: number;
  numero_os_gerada?: string;
  observacoes: string;
}

export type StatusOrdemServico =
  | 'ABERTA'
  | 'EM_EXECUCAO'
  | 'AGUARDANDO_INSPECAO'
  | 'GQ'
  | 'RTS'
  | 'ENCERRADA'
  | 'CANCELADA';

export interface PublicacaoAplicavelOS {
  codigo_documento: string; // Ex: "AMM ATR 72 JASC 32"
  titulo: string;
  revisao_utilizada: string; // Ex: "Rev. 44"
  data_revisao: string;
  numero_carta_concessao: string;
}

export interface DiretrizVinculadaOS {
  numero_diretriz: string; // Ex: "DA 2025-11-02"
  tipo_diretriz: 'DA_ANAC' | 'AD_FAA' | 'AD_EASA' | 'SB_FABRICANTE';
  categoria: CategoriaAplicacaoDA;
  tipo_acao: TipoAcaoDA;
  id_fcda?: number; // Vinculada ao Form F 001-03-2
  numero_fcda?: string;
  status_fcda?: StatusFCDA;
}

export interface FerramentaAlocadaOS {
  id_ferramenta: number;
  descricao: string;
  part_number: string;
  serial_number: string;
  posicao_localizacao: string;
  status: StatusFerramenta;
  calibracao_valida: boolean;
  data_vencimento_calibracao: string;
  numero_certificado_calibracao: string;
  em_quarentena: boolean;
}

export interface TarefaDiscrepanciaOS {
  item: number;
  discrepancia: string;
  acao_corretiva: string;
  referencia_amm: string;
  executor_canac: string;
  inspetor_canac: string;
  status_tarefa: 'PENDENTE' | 'EXECUTADA' | 'INSPECIONADA';
}

export interface OrdemServicoF001_09_2 {
  id_os: number;
  numero_os: string; // Form F 001-09-2 (ex: "OS-2026-0085")
  id_solicitacao?: number;
  numero_solicitacao?: string;
  status_os: StatusOrdemServico;

  // Campos 01 a 12 (Estruturação Estrita Form F 001-09-2 - I 001-09)
  campo_01_numero_os: string;
  campo_02_matricula: string;
  campo_03_modelo: string;
  campo_04_msn: string;
  campo_05_operador: string;
  campo_06_base_executante: BaseSigla;
  campo_07_data_abertura: string; // DD/MM/YYYY ou YYYY-MM-DD
  campo_07_hora_abertura: string; // HH:mm
  campo_08_data_encerramento_prevista: string;
  campo_08_hora_encerramento_prevista: string;
  campo_08_data_encerramento_real?: string;
  campo_08_hora_encerramento_real?: string;
  campo_09_tsn: string; // Total Time Since New (ex: "8450.2 FH")
  campo_10_csn: string; // Total Cycles Since New (ex: "7120 FC")
  campo_11_escopo_servico: string; // Escopo e descrição detalhada
  campo_12_publicacoes_aplicaveis: PublicacaoAplicavelOS[];
  campo_12_manuais_texto_formatado: string;

  // Campos 13 e 14
  campo_13_ferramental_pme_texto: string;
  campo_14_materiais_pecas_texto: string;

  // Seção III: Campo 15 (Tarefas / Discrepâncias)
  tarefas_discrepancias: TarefaDiscrepanciaOS[];

  // Seção IV: Campo 16 (Testes Funcionais)
  campo_16_testes_funcionais: string;

  // Vínculos Regulatórios e Automação
  diretrizes_vinculadas: DiretrizVinculadaOS[];
  ferramentas_alocadas: FerramentaAlocadaOS[];

  // Equipe Técnica Alocada (MOMQ Parte 1 & RBAC 145/65)
  id_mecanico_executor: number;
  mecanico_executor_nome: string;
  mecanico_executor_canac: string;
  mecanico_executor_apto: boolean;

  id_inspetor_aprs: number;
  inspetor_aprs_nome: string;
  inspetor_aprs_canac: string;
  inspetor_aprs_habilitado: boolean;

  id_rt: number;
  rt_nome: string;
  rt_canac: string;

  representante_operador_nome: string;

  // Regras Invioláveis do MOMQ
  regra_na_aplicada: boolean;
  regra_na_declarada?: boolean;
  aviso_fod_incluido: boolean; // "AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO."
  declaracao_easa_part145_aplicada: boolean;
  tipo_release_aplicavel?: TipoDeclaracaoRelease;
  rt_crea?: string;

  // Metadados
  criado_em: string;
  criado_por: string;
  atualizado_em: string;
  observacoes: string;
}

export interface ValidacaoAberturaOSResult {
  pode_abrir: boolean;
  motivos_bloqueio: string[];
  avisos: string[];
  antecedencia_ok: boolean;
  horas_antecedencia: number;
  base_homologada_eo: boolean;
  carta_concessao_ativa: boolean;
  carta_concessao_numero?: string;
  mecanico_apto: boolean;
  mecanico_motivos_bloqueio?: string[];
  inspetor_aprs_valido: boolean;
  inspetor_motivos_bloqueio?: string[];
  ferramentas_aptas: boolean;
  ferramentas_bloqueadas_detalhes: Array<{
    id_ferramenta: number;
    descricao: string;
    pn: string;
    motivo: string;
  }>;
}

export interface PcpStats {
  total_ordens_servico: number;
  os_abertas: number;
  os_em_execucao: number;
  os_aguardando_inspecao: number;
  os_encerradas: number;
  solicitacoes_pendentes: number;
  solicitacoes_aprovadas: number;
  total_fcdas_vinculadas: number;
  taxa_pontualidade_percentual: number;
}

// ============================================================================
// PARTE 5: EXECUÇÃO DE LINHA, PASSAGEM DE TURNO E INSPEÇÕES
// MOMQ 5.4, P 001-07, I 001-09, I 001-14 / Form F 001-12, F 001-24
// ============================================================================

export type TipoDocumentoRastreabilidade =
  | 'EASA_FORM_1'
  | 'FAA_8130_3'
  | 'ANAC_ARC_SEGVOO'
  | 'CERTIFICADO_FABRICANTE_COC'
  | 'OUTRO_HOMOLOGADO';

export interface MaterialAplicadoOS {
  id_material_aplicado: number;
  id_os: number;
  numero_os: string;
  part_number: string;
  serial_number: string; // ou 'N/A' se consumível/lote
  lote_batch: string;
  descricao: string;
  quantidade: number;
  unidade_medida: string; // 'UN', 'EA', 'KG', 'L', 'M'
  numero_requisicao_f001_01: string; // Ex: "REQ-2026-0098"
  tipo_documento_rastreabilidade: TipoDocumentoRastreabilidade;
  numero_documento_rastreabilidade: string; // Ex: "2025-EASA-991204"
  data_aplicacao: string;
  id_mecanico_aplicador: number;
  mecanico_nome: string;
  mecanico_canac: string;
  observacoes?: string;
}

export type CondicaoDevolucaoFerramenta =
  | 'CONFORME_SEM_DANOS'
  | 'AVARIADA_REQUER_QUARENTENA'
  | 'PENDENTE_DEVOLUCAO';

export interface FerramentaUtilizadaOS {
  id_uso_ferramenta: number;
  id_os: number;
  numero_os: string;
  id_ferramenta: number;
  part_number: string;
  serial_number: string;
  descricao: string;
  numero_laudo_calibracao: string;
  data_vencimento_calibracao: string;
  data_hora_checkout: string; // Form F 001-06-1
  data_hora_checkin?: string;
  condicao_devolucao: CondicaoDevolucaoFerramenta;
  responsavel_checkout_nome: string;
  responsavel_checkin_nome?: string;
  observacoes?: string;
}

export type StatusApontamentoTarefa =
  | 'PENDENTE'
  | 'EM_ANDAMENTO'
  | 'EXECUTADO'
  | 'INSPECIONADO_APRS';

export interface ApontamentoTarefaOS {
  id_apontamento: number;
  id_os: number;
  numero_os: string;
  item_tarefa: number;
  titulo_tarefa: string;
  descricao_passo_a_passo: string;
  referencia_amm_task: string; // Ex: "AMM Task 32-30-00-400-801"
  is_iio: boolean; // Item de Inspeção Obrigatória (MOMQ 5.4 / P 001-07)
  categoria_iio?: string; // Ex: "Comandos de Voo", "Pressurização", "Fixação do Motor", "Trem de Pouso Crítico"
  id_mecanico_executor: number;
  mecanico_nome: string;
  mecanico_canac: string;
  data_hora_execucao: string;
  rubrica_mecanico: string;
  status_apontamento: StatusApontamentoTarefa;
  id_inspetor_aprs?: number;
  inspetor_nome?: string;
  inspetor_canac?: string;
  data_hora_inspecao?: string;
  rubrica_inspetor?: string;
  assinatura_dupla_iio_valida: boolean;
  violacao_independencia_iio?: boolean;
  materiais_aplicados: MaterialAplicadoOS[];
  ferramentas_utilizadas: FerramentaUtilizadaOS[];
  observacoes: string;
}

export type SeveridadeRI = 'MENOR' | 'MAIOR' | 'CRITICA_AOG';

export type StatusRI =
  | 'ABERTO_PENDENTE'
  | 'EM_CORRECAO'
  | 'RESOLVIDO_AGUARDANDO_APRS'
  | 'APROVADO_ENCERRADO';

export type TipoInspecaoRI =
  | 'PRELIMINAR'
  | 'TRANSITO'
  | 'DIRETRIZ_AD'
  | 'NAO_CONFORMIDADE_LINHA'
  | 'RECEBIMENTO_PECAS';

export interface RelatorioInspecaoF001_12 {
  id_ri: number;
  numero_ri: string; // Ex: "RI-2026-0042" (Form F 001-12)
  id_os: number;
  numero_os: string;
  matricula_aeronave: string;
  modelo_aeronave: string;
  base: BaseSigla;
  data_abertura: string;
  hora_abertura: string;
  tipo_inspecao: TipoInspecaoRI;
  descricao_discrepancia: string;
  localizacao_aeronave: string; // Ex: "Asa Direita JASC 57-10", "Cone de Cauda JASC 53"
  referencia_manual_defeito: string;
  severidade: SeveridadeRI;
  is_iio: boolean;
  acao_corretiva_exigida: string;
  acao_corretiva_executada?: string;
  status_ri: StatusRI;
  id_inspetor_abertura: number;
  inspetor_abertura_nome: string;
  inspetor_abertura_canac: string;
  id_mecanico_execucao?: number;
  mecanico_execucao_nome?: string;
  mecanico_execucao_canac?: string;
  data_hora_execucao?: string;
  id_inspetor_aprovacao?: number;
  inspetor_aprovacao_nome?: string;
  inspetor_aprovacao_canac?: string;
  data_hora_aprovacao?: string;
  observacoes: string;
}

export type TurnoServico = 'MANHA' | 'TARDE' | 'NOITE' | 'MADRUGADA';

export interface PassagemTurnoF001_24 {
  id_passagem: number;
  numero_passagem: string; // Ex: "PT-2026-0019" (Form F 001-24 / I 001-14)
  id_os: number;
  numero_os: string;
  matricula_aeronave: string;
  modelo_aeronave: string;
  base_operacional: BaseSigla;
  turno_saindo: TurnoServico;
  turno_entrando: TurnoServico;
  data_passagem: string;
  hora_passagem: string;
  status_geral_trabalhos: string;
  tarefas_concluidas_resumo: string;
  tarefas_pendentes_detalhes: string;
  ris_em_aberto_alerta: string;
  ferramentas_retidas_aeronave_bancada: string; // Prevenção FOD
  pecas_pendentes_suprimentos: string;
  condicoes_seguranca_fod_atestadas: boolean;
  aviso_fod_incluido: boolean;
  id_tecnico_saindo: number;
  tecnico_saindo_nome: string;
  tecnico_saindo_canac: string;
  rubrica_tecnico_saindo: string;
  id_tecnico_entrando: number;
  tecnico_entrando_nome: string;
  tecnico_entrando_canac: string;
  rubrica_tecnico_entrando: string;
  aceite_formal_entrante?: boolean;
  aceite_tecnico_entrando?: boolean;
  observacoes: string;
}

export interface ChecklistFodEncerramento {
  recolhimento_todas_ferramentas: boolean;
  contagem_ferramentas_confere: boolean;
  inspecao_visual_baias_motores_paineis: boolean;
  limpeza_residuos_freio_arames_panos: boolean;
  paineis_acesso_fechados_travados: boolean;
  aviso_fod_confirmado: boolean; // "AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO."
  data_hora_verificacao: string;
  id_inspetor_verificador: number;
  inspetor_nome: string;
  inspetor_canac: string;
  observacoes?: string;
}

export interface ValidacaoDuplaAssinaturaIioResult {
  valido: boolean;
  motivo_bloqueio?: string;
  mecanico_habilitado: boolean;
  inspetor_aprs_autorizado: boolean;
  tecnicos_distintos: boolean;
}

export interface HangarStats {
  total_apontamentos: number;
  apontamentos_concluidos: number;
  apontamentos_iio_pendentes_aprs: number;
  total_ris: number;
  ris_abertos_bloqueantes: number;
  total_passagens_turno: number;
  ferramentas_em_uso_hangar: number;
}

// ============================================================================
// PARTE 6: GARANTIA DA QUALIDADE, LIBERAÇÃO / RTS E ARQUIVO TÉCNICO (FINAL)
// MOMQ 5.7, MOMQ 5.7.1, MOMQ 6.5, P 001-01 / RBAC 43.9, RBAC 145.219, EASA Part-145
// ============================================================================

export interface ItemAuditoriaQualidade {
  item: string;
  descricao: string;
  status: 'CONFORME' | 'NAO_CONFORME' | 'NAO_APLICAVEL';
  detalhes: string;
  bloqueante: boolean;
}

export interface AuditoriaQualidadeResult {
  id_os: number;
  numero_os: string;
  matricula: string;
  modelo: string;
  base: BaseSigla;
  aprovado_para_fechamento: boolean;
  itens_auditados: {
    tarefas_100_concluidas: boolean;
    ris_100_resolvidos: boolean;
    iio_dupla_assinatura_concluida: boolean;
    fcda_diretrizes_cumpridas: boolean;
    ferramental_100_devolvido: boolean;
    checklist_fod_concluido: boolean;
  };
  itens_detalhados: ItemAuditoriaQualidade[];
  motivos_bloqueio: string[];
  avisos_qualidade: string[];
  data_auditoria: string;
  auditor_responsavel: string;
  canac_auditor: string;
}

export type TipoDeclaracaoRelease =
  | 'DUAL_RELEASE_ANAC_EASA'
  | 'ANAC_RBAC_43_9'
  | 'EASA_PART_145';

export interface LiberacaoRTS {
  id_rts: number;
  numero_rts: string; // Ex: "RTS-2026-0042"
  id_os: number;
  numero_os: string;
  matricula_aeronave: string;
  modelo_aeronave: string;
  msn_aeronave: string;
  operador_cliente: string;
  base_liberacao: BaseSigla;
  data_hora_liberacao: string;
  tsn_liberacao: string;
  csn_liberacao: string;
  
  // Declaração Regulatória
  tipo_declaracao: TipoDeclaracaoRelease;
  texto_declaracao_anac: string;
  texto_declaracao_easa?: string;
  requer_declaracao_easa: boolean;
  
  // Assinaturas e Qualificações
  id_inspetor_aprs: number;
  inspetor_aprs_nome: string;
  inspetor_aprs_canac: string;
  inspetor_aprs_licenca_easa?: string;
  assinatura_digital_aprs: string;

  id_rt: number;
  rt_nome: string;
  rt_canac: string;
  rt_crea: string;
  assinatura_digital_rt: string;

  // LTA & Registro Técnico
  texto_anotacao_lta: string;
  codigo_anotacao_lta: string;

  // Vias de Distribuição (MOMQ 6.5)
  distribuicao_vias: {
    via_1_pcp: { status: 'ENTREGUE_AO_PCP' | 'PENDENTE'; data?: string; recebedor?: string };
    via_2_base: { status: 'ARQUIVADA_NA_BASE' | 'PENDENTE'; data?: string; base: BaseSigla };
    via_3_cliente: { status: 'ENTREGUE_AO_OPERADOR' | 'PENDENTE'; data?: string; protocolo_cliente?: string };
  };

  observacoes_limitacoes?: string;
  status: 'VIGENTE' | 'CANCELADO';
  criado_em: string;
}

export interface DossieDigitalOS {
  id_dossie: string; // Ex: "DOSSIE-OS-2026-0084"
  id_os: number;
  numero_os: string;
  matricula: string;
  modelo: string;
  msn: string;
  operador: string;
  base: BaseSigla;
  data_fechamento_os: string;
  data_rts: string;
  numero_rts: string;
  tipo_release: TipoDeclaracaoRelease;
  
  // Componentes do Dossiê Consolidado
  os_f001_09_2_incluso: boolean;
  total_tarefas_apontadas: number;
  total_tarefas_iio: number;
  total_ris_f001_12_inclusos: number;
  total_fcdas_f001_03_2_inclusas: number;
  passagem_turno_f001_24_inclusa: boolean;
  ferramentas_f001_06_1_inclusas: number;
  materiais_rastreabilidade_inclusos: number;
  checklist_fod_concluido: boolean;
  anotacao_lta_emitida: boolean;

  // Controle de Custódia e Arquivo Técnico (MOMQ 6.5 / RBAC 145.219 / EASA Part-145.A.55)
  data_limite_retencao_anac_5anos: string;
  data_limite_retencao_easa_3anos: string;
  status_custodia: 'CUSTODIA_OBRIGATORIA_VIGENTE' | 'RETENCAO_PERMANENTE' | 'EXPIRADO_ARQUIVADO';
  local_armazenamento_fisico: string;
  hash_integridade_digital: string;
  tamanho_estimado_pdf: string;
}

export interface PainelExecutivoStats {
  total_os_concluidas: number;
  total_os_em_andamento: number;
  total_rts_emitidos: number;
  taxa_conformidade_qualidade: number; // Ex: 98.4%
  taxa_pontualidade_sla: number; // Ex: 96.2%
  total_dossies_arquivados: number;
  dossies_custodia_vigente: number;
  total_ris_historico: number;
  tempo_medio_fechamento_horas: number;
  desempenho_bases: Array<{
    base: BaseSigla;
    os_concluidas: number;
    em_andamento: number;
    pontualidade_pct: number;
    ris_abertos: number;
  }>;
  auditorias_recentes: Array<{
    data: string;
    numero_os: string;
    matricula: string;
    resultado: 'APROVADO_SEM_RESSALVAS' | 'APROVADO_COM_AJUSTES' | 'REPROVADO';
    auditor: string;
  }>;
}



