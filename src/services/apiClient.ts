/**
 * Cliente de API Frontend para Impacto Aviation MRO
 */

import {
  BaseOperacional,
  PessoalTecnico,
  DesignacaoFuncoesF001_03,
  TreinamentoMNT002,
  TecnicoComQualificacao,
  RelatorioTrimestralF001_07,
  Ferramenta,
  ControleCalibracaoF001_06,
  MovimentacaoFerramentaF001_06_1,
  QuarentenaFerramentasF001_06_4,
  ToolingStats,
  CartaConcessaoManuais,
  PublicacaoTecnicaF001_02_1,
  CienciaCorpoTecnicoF001_02_2,
  FCDAF001_03_2,
  RelatorioMandatoriasF001_03_3,
  MonitoramentoAgencia,
  CtmStats,
  ModeloHomologadoEO,
  SolicitacaoComercial,
  OrdemServicoF001_09_2,
  ValidacaoAberturaOSResult,
  PcpStats,
  StatusOrdemServico,
  ApontamentoTarefaOS,
  MaterialAplicadoOS,
  FerramentaUtilizadaOS,
  RelatorioInspecaoF001_12,
  PassagemTurnoF001_24,
  ChecklistFodEncerramento,
  ValidacaoDuplaAssinaturaIioResult,
  HangarStats,
  AuditoriaQualidadeResult,
  LiberacaoRTS,
  DossieDigitalOS,
  PainelExecutivoStats,
} from '../types/mro';

export interface DashboardStats {
  total_tecnicos: number;
  tecnicos_aptos: number;
  tecnicos_bloqueados: number;
  habilitados_aprs: number;
  designacoes_pendentes_rt: number;
  cursos_vencidos: number;
  cursos_a_vencer_30d: number;
  taxa_conformidade: number;
  total_ferramentas?: number;
  ferramentas_disponiveis?: number;
  ferramentas_em_uso?: number;
  ferramentas_calibracao_vencida?: number;
  ferramentas_calibracao_a_vencer?: number;
  ferramentas_quarentena?: number;
}

export const api = {
  // Bases
  async getBases(): Promise<BaseOperacional[]> {
    const res = await fetch('/api/bases');
    const json = await res.json();
    return json.data || [];
  },

  // Técnicos
  async getTecnicos(filtros?: {
    id_base?: number;
    cargo?: string;
    status_qualificacao?: string;
    search?: string;
  }): Promise<TecnicoComQualificacao[]> {
    const params = new URLSearchParams();
    if (filtros?.id_base) params.append('id_base', String(filtros.id_base));
    if (filtros?.cargo && filtros.cargo !== 'TODOS') params.append('cargo', filtros.cargo);
    if (filtros?.status_qualificacao && filtros.status_qualificacao !== 'TODOS') {
      params.append('status_qualificacao', filtros.status_qualificacao);
    }
    if (filtros?.search) params.append('search', filtros.search);

    const res = await fetch(`/api/tecnicos?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getTecnico(id: number): Promise<TecnicoComQualificacao> {
    const res = await fetch(`/api/tecnicos/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar técnico');
    return json.data;
  },

  async createTecnico(data: Partial<PessoalTecnico>): Promise<TecnicoComQualificacao> {
    const res = await fetch('/api/tecnicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao cadastrar técnico');
    return json.data;
  },

  async updateTecnico(id: number, data: Partial<PessoalTecnico>): Promise<TecnicoComQualificacao> {
    const res = await fetch(`/api/tecnicos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar técnico');
    return json.data;
  },

  async toggleTecnicoAtivo(id: number): Promise<TecnicoComQualificacao> {
    const res = await fetch(`/api/tecnicos/${id}/toggle-ativo`, {
      method: 'PATCH',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao alternar status do técnico');
    return json.data;
  },

  // Designações F 001-03
  async getDesignacoes(id_tecnico?: number): Promise<DesignacaoFuncoesF001_03[]> {
    const url = id_tecnico ? `/api/designacoes?id_tecnico=${id_tecnico}` : '/api/designacoes';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async createDesignacao(data: Partial<DesignacaoFuncoesF001_03>): Promise<DesignacaoFuncoesF001_03> {
    const res = await fetch('/api/designacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao emitir designação');
    return json.data;
  },

  async assinarDesignacaoRT(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/designacoes/${id}/assinar-rt`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao assinar designação');
    return json;
  },

  // Treinamentos MNT-002
  async getTreinamentos(id_tecnico?: number): Promise<TreinamentoMNT002[]> {
    const url = id_tecnico ? `/api/treinamentos?id_tecnico=${id_tecnico}` : '/api/treinamentos';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async createTreinamento(data: Partial<TreinamentoMNT002>): Promise<TreinamentoMNT002> {
    const res = await fetch('/api/treinamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao registrar treinamento');
    return json.data;
  },

  // Auditoria & Simulador
  async simularAssinatura(id_tecnico: number, tipo_tarefa: string, is_iio: boolean) {
    const res = await fetch('/api/auditoria/simular-assinatura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_tecnico, tipo_tarefa, is_iio }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro na simulação');
    return json;
  },

  // Relatório F 001-07
  async getRelatorioF00107(trimestre?: string, id_base?: number): Promise<RelatorioTrimestralF001_07> {
    const params = new URLSearchParams();
    if (trimestre) params.append('trimestre', trimestre);
    if (id_base) params.append('id_base', String(id_base));

    const res = await fetch(`/api/relatorios/f001-07?${params.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao gerar relatório trimestral');
    return json.data;
  },

  // Estatísticas
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    const json = await res.json();
    return json.data;
  },

  // ===========================================================================
  // PARTE 2: FERRAMENTARIA, CALIBRAÇÃO E QUARENTENA CLIENT METHODS
  // ===========================================================================
  async getFerramentas(filtros?: {
    status?: string;
    propriedade?: string;
    requer_calibracao?: boolean;
    search?: string;
  }): Promise<Ferramenta[]> {
    const params = new URLSearchParams();
    if (filtros?.status && filtros.status !== 'TODOS') params.append('status', filtros.status);
    if (filtros?.propriedade && filtros.propriedade !== 'TODOS') params.append('propriedade', filtros.propriedade);
    if (filtros?.requer_calibracao !== undefined) params.append('requer_calibracao', String(filtros.requer_calibracao));
    if (filtros?.search) params.append('search', filtros.search);

    const res = await fetch(`/api/ferramentas?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getFerramenta(id: number): Promise<Ferramenta> {
    const res = await fetch(`/api/ferramentas/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar ferramenta');
    return json.data;
  },

  async createFerramenta(data: Partial<Ferramenta>): Promise<Ferramenta> {
    const res = await fetch('/api/ferramentas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao cadastrar ferramenta');
    return json.data;
  },

  async updateFerramenta(id: number, data: Partial<Ferramenta>): Promise<Ferramenta> {
    const res = await fetch(`/api/ferramentas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar ferramenta');
    return json.data;
  },

  // Calibrações F 001-06
  async getCalibracoes(id_ferramenta?: number): Promise<ControleCalibracaoF001_06[]> {
    const url = id_ferramenta ? `/api/calibracoes?id_ferramenta=${id_ferramenta}` : '/api/calibracoes';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async createCalibracao(data: Partial<ControleCalibracaoF001_06>): Promise<{
    data: ControleCalibracaoF001_06;
    quarentena_acionada: boolean;
    motivo_quarentena?: string;
  }> {
    const res = await fetch('/api/calibracoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao registrar laudo de calibração');
    return json;
  },

  // Movimentações F 001-06-1
  async getMovimentacoes(id_ferramenta?: number): Promise<MovimentacaoFerramentaF001_06_1[]> {
    const url = id_ferramenta ? `/api/movimentacoes?id_ferramenta=${id_ferramenta}` : '/api/movimentacoes';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async checkOutFerramenta(data: {
    id_ferramenta: number;
    id_tecnico: number;
    ordem_servico_numero: string;
    finalidade_servico: string;
    condicoes_retirada?: string;
  }): Promise<{ success: boolean; message: string; data: MovimentacaoFerramentaF001_06_1 }> {
    const res = await fetch('/api/movimentacoes/check-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha no Check-out');
    return json;
  },

  async checkInFerramenta(data: {
    id_ferramenta: number;
    id_tecnico_devolucao: number;
    condicoes_devolucao: 'INTACTA' | 'DANIFICADA';
    observacoes_devolucao?: string;
  }): Promise<{ success: boolean; message: string; quarentena_acionada?: boolean; data: MovimentacaoFerramentaF001_06_1 }> {
    const res = await fetch('/api/movimentacoes/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha no Check-in');
    return json;
  },

  // Quarentena F 001-06-04 & Tag F 001-01-6
  async getQuarentenas(): Promise<QuarentenaFerramentasF001_06_4[]> {
    const res = await fetch('/api/quarentena');
    const json = await res.json();
    return json.data || [];
  },

  async getQuarentena(id: number): Promise<QuarentenaFerramentasF001_06_4> {
    const res = await fetch(`/api/quarentena/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Registro de quarentena não encontrado');
    return json.data;
  },

  async transferirParaQuarentena(data: {
    id_ferramenta: number;
    motivo_segregacao: string;
    responsavel_segregacao: number;
    local_armazenamento_segregado?: string;
  }): Promise<QuarentenaFerramentasF001_06_4> {
    const res = await fetch('/api/quarentena/segregar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao transferir para quarentena');
    return json.data;
  },

  async atualizarResolucaoQuarentena(
    id: number,
    data: {
      status_resolucao: 'RETIDO' | 'ENVIADO_AFERICAO' | 'SUCATEADO' | 'LIBERADO_RECALIBRADO';
      despacho_qualidade: string;
    }
  ): Promise<QuarentenaFerramentasF001_06_4> {
    const res = await fetch(`/api/quarentena/${id}/resolucao`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar resolução');
    return json.data;
  },

  async getToolingStats(): Promise<ToolingStats> {
    const res = await fetch('/api/ferramentaria/stats');
    const json = await res.json();
    return json.data;
  },

  // Aliases para conveniência
  async cadastrarFerramenta(data: Partial<Ferramenta>): Promise<Ferramenta> {
    return this.createFerramenta(data);
  },

  async atualizarFerramenta(id: number, data: Partial<Ferramenta>): Promise<Ferramenta> {
    return this.updateFerramenta(id, data);
  },

  async segregarParaQuarentena(id_ferramenta: number, options: { motivo: string; id_responsavel: number; observacoes?: string }) {
    return this.transferirParaQuarentena({
      id_ferramenta,
      motivo_segregacao: options.motivo,
      responsavel_segregacao: options.id_responsavel,
      local_armazenamento_segregado: 'Área de Quarentena Segregada (F 001-06-04)',
    });
  },

  async resolverQuarentena(idQuarentena: number, options: { status_resolucao: any; data_resolucao?: string; observacoes?: string }) {
    let resolucaoMapped: 'RETIDO' | 'ENVIADO_AFERICAO' | 'SUCATEADO' | 'LIBERADO_RECALIBRADO' = 'RETIDO';
    if (options.status_resolucao === 'ENVIADO_AFERICAO') resolucaoMapped = 'ENVIADO_AFERICAO';
    else if (options.status_resolucao === 'SUCATEADO') resolucaoMapped = 'SUCATEADO';
    else if (options.status_resolucao === 'LIBERADO_APOS_CALIBRACAO' || options.status_resolucao === 'LIBERADO_RECALIBRADO') resolucaoMapped = 'LIBERADO_RECALIBRADO';

    return this.atualizarResolucaoQuarentena(idQuarentena, {
      status_resolucao: resolucaoMapped,
      despacho_qualidade: options.observacoes || 'Atualização via painel MRO',
    });
  },

  // --- PARTE 3: CTM, DADOS TÉCNICOS & DIRETRIZES DE AERONAVEGABILIDADE ---
  async getCtmStats(): Promise<CtmStats> {
    const res = await fetch('/api/ctm/stats');
    const json = await res.json();
    return json.data;
  },

  async getCartasConcessao(): Promise<CartaConcessaoManuais[]> {
    const res = await fetch('/api/cartas-concessao');
    const json = await res.json();
    return json.data;
  },

  async getCartaConcessaoById(id: number): Promise<CartaConcessaoManuais> {
    const res = await fetch(`/api/cartas-concessao/${id}`);
    const json = await res.json();
    return json.data;
  },

  async cadastrarCartaConcessao(data: Partial<CartaConcessaoManuais>): Promise<CartaConcessaoManuais> {
    const res = await fetch('/api/cartas-concessao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar carta de concessão');
    return json.data;
  },

  async atualizarCartaConcessao(id: number, data: Partial<CartaConcessaoManuais>): Promise<CartaConcessaoManuais> {
    const res = await fetch(`/api/cartas-concessao/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar carta de concessão');
    return json.data;
  },

  async getPublicacoes(params?: { status?: string; tipo?: string; fabricante?: string; search?: string }): Promise<PublicacaoTecnicaF001_02_1[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.tipo) query.append('tipo', params.tipo);
    if (params?.fabricante) query.append('fabricante', params.fabricante);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`/api/publicacoes?${query.toString()}`);
    const json = await res.json();
    return json.data;
  },

  async getPublicacaoById(id: number): Promise<PublicacaoTecnicaF001_02_1> {
    const res = await fetch(`/api/publicacoes/${id}`);
    const json = await res.json();
    return json.data;
  },

  async cadastrarPublicacao(data: Partial<PublicacaoTecnicaF001_02_1>): Promise<PublicacaoTecnicaF001_02_1> {
    const res = await fetch('/api/publicacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao cadastrar publicação técnica');
    return json.data;
  },

  async atualizarPublicacao(id: number, data: Partial<PublicacaoTecnicaF001_02_1>): Promise<PublicacaoTecnicaF001_02_1> {
    const res = await fetch(`/api/publicacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar publicação técnica');
    return json.data;
  },

  async checarRevisaoPublicacao(
    id: number,
    data: { status: any; revisao?: string; data_revisao?: string; id_responsavel: number; observacoes?: string }
  ): Promise<PublicacaoTecnicaF001_02_1> {
    const res = await fetch(`/api/publicacoes/${id}/checar-revisao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar checagem de revisão');
    return json.data;
  },

  async getCiencias(params?: { id_publicacao?: number; id_tecnico?: number }): Promise<CienciaCorpoTecnicoF001_02_2[]> {
    const query = new URLSearchParams();
    if (params?.id_publicacao) query.append('id_publicacao', String(params.id_publicacao));
    if (params?.id_tecnico) query.append('id_tecnico', String(params.id_tecnico));

    const res = await fetch(`/api/ciencias?${query.toString()}`);
    const json = await res.json();
    return json.data;
  },

  async registrarCiencia(data: {
    id_publicacao: number;
    id_tecnico: number;
    revisao_cientificada?: string;
    observacoes?: string;
  }): Promise<CienciaCorpoTecnicoF001_02_2> {
    const res = await fetch('/api/ciencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar ciência técnica');
    return json.data;
  },

  async getFcdas(params?: { matricula?: string; aplicabilidade?: string; tipo_acao?: string; search?: string; mes_ano?: string }): Promise<FCDAF001_03_2[]> {
    const query = new URLSearchParams();
    if (params?.matricula) query.append('matricula', params.matricula);
    if (params?.aplicabilidade) query.append('aplicabilidade', params.aplicabilidade);
    if (params?.tipo_acao) query.append('tipo_acao', params.tipo_acao);
    if (params?.search) query.append('search', params.search);
    if (params?.mes_ano) query.append('mes_ano', params.mes_ano);

    const res = await fetch(`/api/fcdas?${query.toString()}`);
    const json = await res.json();
    return json.data;
  },

  async getFcdaById(id: number): Promise<FCDAF001_03_2> {
    const res = await fetch(`/api/fcdas/${id}`);
    const json = await res.json();
    return json.data;
  },

  async emitirFcda(data: Partial<FCDAF001_03_2>): Promise<FCDAF001_03_2> {
    const res = await fetch('/api/fcdas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao emitir FCDA');
    return json.data;
  },

  async atualizarFcda(id: number, data: Partial<FCDAF001_03_2>): Promise<FCDAF001_03_2> {
    const res = await fetch(`/api/fcdas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar FCDA');
    return json.data;
  },

  async getRelatorioMandatorias(mes_ano?: string, prefixo?: string): Promise<RelatorioMandatoriasF001_03_3> {
    const query = new URLSearchParams();
    if (mes_ano) query.append('mes_ano', mes_ano);
    if (prefixo) query.append('prefixo', prefixo);

    const res = await fetch(`/api/relatorio-mandatorias?${query.toString()}`);
    const json = await res.json();
    return json.data;
  },

  async getMonitoramentoAgencias(): Promise<MonitoramentoAgencia[]> {
    const res = await fetch('/api/monitoramento-agencias');
    const json = await res.json();
    return json.data;
  },

  async registrarChecagemAgencia(data: { agencia: 'ANAC' | 'FAA' | 'EASA'; id_tecnico: number; observacoes?: string }): Promise<MonitoramentoAgencia> {
    const res = await fetch('/api/monitoramento-agencias/checar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar checagem de agência');
    return json.data;
  },

  // --- PARTE 4: COMERCIAL, PCP E ORDENS DE SERVIÇO ---
  async getModelosEO(base?: string): Promise<ModeloHomologadoEO[]> {
    const url = base && base !== 'TODAS' ? `/api/pcp/modelos-eo?base=${base}` : '/api/pcp/modelos-eo';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async getPcpStats(): Promise<PcpStats> {
    const res = await fetch('/api/pcp/stats');
    const json = await res.json();
    return json.data;
  },

  async getSolicitacoesComerciais(filtros?: { status?: string; base?: string; search?: string }): Promise<SolicitacaoComercial[]> {
    const params = new URLSearchParams();
    if (filtros?.status && filtros.status !== 'TODOS') params.append('status', filtros.status);
    if (filtros?.base && filtros.base !== 'TODAS') params.append('base', filtros.base);
    if (filtros?.search) params.append('search', filtros.search);

    const res = await fetch(`/api/comercial/solicitacoes?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getSolicitacaoComercial(id: number): Promise<SolicitacaoComercial> {
    const res = await fetch(`/api/comercial/solicitacoes/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao carregar solicitação comercial');
    return json.data;
  },

  async createSolicitacaoComercial(data: Partial<SolicitacaoComercial>): Promise<SolicitacaoComercial> {
    const res = await fetch('/api/comercial/solicitacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar solicitação comercial');
    return json.data;
  },

  async updateSolicitacaoComercial(id: number, data: Partial<SolicitacaoComercial>): Promise<SolicitacaoComercial> {
    const res = await fetch(`/api/comercial/solicitacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar solicitação');
    return json.data;
  },

  async validarElegibilidadeOS(dados: {
    modelo_aeronave: string;
    base_executante: string;
    operador: string;
    data_hora_abertura?: string;
    data_hora_prevista_inicio?: string;
    id_mecanico_executor?: number;
    id_inspetor_aprs?: number;
    ids_ferramentas?: number[];
  }): Promise<ValidacaoAberturaOSResult> {
    const res = await fetch('/api/ordens-servico/validar-elegibilidade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao validar elegibilidade da OS');
    return json.data;
  },

  async getOrdensServico(filtros?: { status?: string; base?: string; matricula?: string; search?: string }): Promise<OrdemServicoF001_09_2[]> {
    const params = new URLSearchParams();
    if (filtros?.status && filtros.status !== 'TODOS') params.append('status', filtros.status);
    if (filtros?.base && filtros.base !== 'TODAS') params.append('base', filtros.base);
    if (filtros?.matricula && filtros.matricula !== 'TODAS') params.append('matricula', filtros.matricula);
    if (filtros?.search) params.append('search', filtros.search);

    const res = await fetch(`/api/ordens-servico?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getOrdemServico(id: number): Promise<OrdemServicoF001_09_2> {
    const res = await fetch(`/api/ordens-servico/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao carregar Ordem de Serviço');
    return json.data;
  },

  async createOrdemServico(data: Partial<OrdemServicoF001_09_2> & { ids_ferramentas_selecionadas?: number[] }): Promise<OrdemServicoF001_09_2> {
    const res = await fetch('/api/ordens-servico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao abrir Ordem de Serviço');
    return json.data;
  },

  async updateOrdemServico(id: number, data: Partial<OrdemServicoF001_09_2>): Promise<OrdemServicoF001_09_2> {
    const res = await fetch(`/api/ordens-servico/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar Ordem de Serviço');
    return json.data;
  },

  async updateStatusOrdemServico(id: number, status: StatusOrdemServico, dados?: { data_encerramento_real?: string; hora_encerramento_real?: string; representante_operador?: string }): Promise<OrdemServicoF001_09_2> {
    const res = await fetch(`/api/ordens-servico/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...dados }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar status da OS');
    return json.data;
  },

  async getPacoteTrabalhoOS(id: number): Promise<any> {
    const res = await fetch(`/api/ordens-servico/${id}/pacote-trabalho`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao obter pacote de trabalho da OS');
    return json.data;
  },

  // --- PARTE 5: EXECUÇÃO DE LINHA, PASSAGEM DE TURNO E INSPEÇÕES ---
  async getHangarStats(): Promise<HangarStats> {
    const res = await fetch('/api/hangar/stats');
    const json = await res.json();
    return json.data;
  },

  async getApontamentos(filtros?: { id_os?: number; status?: string; is_iio?: boolean }): Promise<ApontamentoTarefaOS[]> {
    const params = new URLSearchParams();
    if (filtros?.id_os) params.append('id_os', String(filtros.id_os));
    if (filtros?.status && filtros.status !== 'TODOS') params.append('status', filtros.status);
    if (filtros?.is_iio !== undefined) params.append('is_iio', String(filtros.is_iio));

    const res = await fetch(`/api/hangar/apontamentos?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async createApontamento(data: Partial<ApontamentoTarefaOS>): Promise<ApontamentoTarefaOS> {
    const res = await fetch('/api/hangar/apontamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar apontamento');
    return json.data;
  },

  async updateApontamento(id: number, data: Partial<ApontamentoTarefaOS>): Promise<ApontamentoTarefaOS> {
    const res = await fetch(`/api/hangar/apontamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao atualizar apontamento');
    return json.data;
  },

  async validarDuplaAssinaturaIio(id_mecanico: number, id_inspetor: number): Promise<ValidacaoDuplaAssinaturaIioResult> {
    const res = await fetch('/api/hangar/validar-iio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_mecanico, id_inspetor }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao validar dupla assinatura IIO');
    return json.data;
  },

  async assinarInspecaoAprsIio(id_apontamento: number, id_inspetor: number, rubrica?: string): Promise<ApontamentoTarefaOS> {
    const res = await fetch(`/api/hangar/apontamentos/${id_apontamento}/assinar-iio-aprs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_inspetor, rubrica }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar assinatura APRS em tarefa IIO');
    return json.data;
  },

  async getMateriaisAplicados(id_os?: number): Promise<MaterialAplicadoOS[]> {
    const params = new URLSearchParams();
    if (id_os) params.append('id_os', String(id_os));
    const res = await fetch(`/api/hangar/materiais?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async addMaterialAplicado(data: Partial<MaterialAplicadoOS>): Promise<MaterialAplicadoOS> {
    const res = await fetch('/api/hangar/materiais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao adicionar peça/material');
    return json.data;
  },

  async getFerramentasUtilizadas(id_os?: number): Promise<FerramentaUtilizadaOS[]> {
    const params = new URLSearchParams();
    if (id_os) params.append('id_os', String(id_os));
    const res = await fetch(`/api/hangar/ferramentas-utilizadas?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async registrarCheckoutFerramenta(data: Partial<FerramentaUtilizadaOS>): Promise<FerramentaUtilizadaOS> {
    const res = await fetch('/api/hangar/ferramentas-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro no check-out de ferramenta PME');
    return json.data;
  },

  async registrarCheckinFerramenta(id_uso: number, condicao: string, responsavel_checkin: string, observacoes?: string): Promise<FerramentaUtilizadaOS> {
    const res = await fetch('/api/hangar/ferramentas-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_uso, condicao, responsavel_checkin, observacoes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro no check-in de ferramenta PME');
    return json.data;
  },

  async getRelatoriosInspecao(filtros?: { id_os?: number; status?: string; base?: string }): Promise<RelatorioInspecaoF001_12[]> {
    const params = new URLSearchParams();
    if (filtros?.id_os) params.append('id_os', String(filtros.id_os));
    if (filtros?.status && filtros.status !== 'TODOS') params.append('status', filtros.status);
    if (filtros?.base && filtros.base !== 'TODAS') params.append('base', filtros.base);

    const res = await fetch(`/api/hangar/ris?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async createRelatorioInspecao(data: Partial<RelatorioInspecaoF001_12>): Promise<RelatorioInspecaoF001_12> {
    const res = await fetch('/api/hangar/ris', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao abrir Relatório de Inspeção (RI)');
    return json.data;
  },

  async resolverRelatorioInspecao(id_ri: number, acao_corretiva: string, id_mecanico: number): Promise<RelatorioInspecaoF001_12> {
    const res = await fetch(`/api/hangar/ris/${id_ri}/resolver`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao_corretiva, id_mecanico }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar ação corretiva no RI');
    return json.data;
  },

  async aprovarRelatorioInspecao(id_ri: number, id_inspetor_aprs: number, observacoes?: string): Promise<RelatorioInspecaoF001_12> {
    const res = await fetch(`/api/hangar/ris/${id_ri}/aprovar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_inspetor_aprs, observacoes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao aprovar e encerrar RI');
    return json.data;
  },

  async getPassagensTurno(filtros?: { id_os?: number; base?: string }): Promise<PassagemTurnoF001_24[]> {
    const params = new URLSearchParams();
    if (filtros?.id_os) params.append('id_os', String(filtros.id_os));
    if (filtros?.base && filtros.base !== 'TODAS') params.append('base', filtros.base);

    const res = await fetch(`/api/hangar/passagens-turno?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async createPassagemTurno(data: Partial<PassagemTurnoF001_24>): Promise<PassagemTurnoF001_24> {
    const res = await fetch('/api/hangar/passagens-turno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar passagem de serviço');
    return json.data;
  },

  async encerrarOsComFod(id_os: number, checklist: ChecklistFodEncerramento, id_inspetor_aprs: number): Promise<OrdemServicoF001_09_2> {
    const res = await fetch(`/api/hangar/ordens-servico/${id_os}/encerramento-fod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist, id_inspetor_aprs }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao realizar encerramento operacional FOD');
    return json.data;
  },

  // --- PARTE 6: GARANTIA DA QUALIDADE, RTS, ARQUIVO TÉCNICO & DIRETORIA ---
  async getAuditoriaFechamentoOS(id_os: number, id_auditor?: number): Promise<AuditoriaQualidadeResult> {
    const query = id_auditor ? `?id_auditor=${id_auditor}` : '';
    const res = await fetch(`/api/qualidade/auditoria-os/${id_os}${query}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao auditar fechamento da OS');
    return json.data;
  },

  async getTextoLTA(id_os: number, id_rts?: number): Promise<{ texto: string; codigo: string }> {
    const query = id_rts ? `?id_rts=${id_rts}` : '';
    const res = await fetch(`/api/qualidade/lta/${id_os}${query}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao gerar anotação LTA');
    return json.data;
  },

  async getLiberacoesRTS(params?: { id_os?: number; base?: string; search?: string }): Promise<LiberacaoRTS[]> {
    const query = new URLSearchParams();
    if (params?.id_os) query.append('id_os', String(params.id_os));
    if (params?.base && params.base !== 'TODAS') query.append('base', params.base);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`/api/qualidade/rts?${query.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getLiberacaoRTSById(id: number): Promise<LiberacaoRTS> {
    const res = await fetch(`/api/qualidade/rts/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao obter RTS');
    return json.data;
  },

  async emitirLiberacaoRTS(data: any): Promise<{ rts: LiberacaoRTS; os: OrdemServicoF001_09_2 }> {
    const res = await fetch('/api/qualidade/rts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao emitir RTS');
    return json.data;
  },

  async getDossiesDigitais(params?: { base?: string; operador?: string; search?: string }): Promise<DossieDigitalOS[]> {
    const query = new URLSearchParams();
    if (params?.base && params.base !== 'TODAS') query.append('base', params.base);
    if (params?.operador && params.operador !== 'TODOS') query.append('operador', params.operador);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`/api/arquivo-tecnico/dossies?${query.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getDossieDigitalById(id: string): Promise<DossieDigitalOS> {
    const res = await fetch(`/api/arquivo-tecnico/dossies/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao carregar Dossiê Digital');
    return json.data;
  },

  async getPainelExecutivoStats(): Promise<PainelExecutivoStats> {
    const res = await fetch('/api/diretoria/painel-executivo');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao carregar Painel Executivo');
    return json.data;
  },
};

export const apiClient = api;

