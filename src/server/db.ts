/**
 * Banco de Dados em Memória com Persistência & Engine de Auditoria Regulatória
 * Impacto Aviation MRO (COM 200607-05 / EASA.145.1003)
 * Módulo Parte 1: BNT Pessoal, Habilitações, F 001-03 e MNT-002
 */

import {
  BaseOperacional,
  PessoalTecnico,
  DesignacaoFuncoesF001_03,
  TreinamentoMNT002,
  StatusQualificacaoAudit,
  TecnicoComQualificacao,
  RelatorioTrimestralF001_07,
  ItemRelatorioF001_07,
  CURSOS_MANDATORIOS,
  Ferramenta,
  ControleCalibracaoF001_06,
  MovimentacaoFerramentaF001_06_1,
  QuarentenaFerramentasF001_06_4,
  ToolingStats,
  StatusFerramenta,
  CartaConcessaoManuais,
  PublicacaoTecnicaF001_02_1,
  CienciaCorpoTecnicoF001_02_2,
  FCDAF001_03_2,
  RelatorioMandatoriasF001_03_3,
  RelatorioMandatoriasItemF001_03_3,
  MonitoramentoAgencia,
  CtmStats,
  StatusPublicacao,
  ModeloHomologadoEO,
  SolicitacaoComercial,
  OrdemServicoF001_09_2,
  BaseSigla,
  ValidacaoAberturaOSResult,
  PcpStats,
  DiretrizVinculadaOS,
  FerramentaAlocadaOS,
  PublicacaoAplicavelOS,
  TarefaDiscrepanciaOS,
  StatusOrdemServico,
  ApontamentoTarefaOS,
  MaterialAplicadoOS,
  FerramentaUtilizadaOS,
  CondicaoDevolucaoFerramenta,
  RelatorioInspecaoF001_12,
  PassagemTurnoF001_24,
  ChecklistFodEncerramento,
  ValidacaoDuplaAssinaturaIioResult,
  HangarStats,
  StatusApontamentoTarefa,
  StatusRI,
  AuditoriaQualidadeResult,
  ItemAuditoriaQualidade,
  LiberacaoRTS,
  TipoDeclaracaoRelease,
  DossieDigitalOS,
  PainelExecutivoStats,
} from '../types/mro';
import {
  INITIAL_BASES,
  INITIAL_TECNICOS,
  INITIAL_DESIGNACOES,
  INITIAL_TREINAMENTOS,
  INITIAL_FERRAMENTAS,
  INITIAL_CALIBRACOES,
  INITIAL_MOVIMENTACOES,
  INITIAL_QUARENTENA,
  INITIAL_CARTAS_CONCESSAO,
  INITIAL_PUBLICACOES,
  INITIAL_CIENCIAS,
  INITIAL_FCDAS,
  INITIAL_MONITORAMENTOS,
  INITIAL_MODELOS_EO,
  INITIAL_SOLICITACOES_COMERCIAIS,
  INITIAL_ORDENS_SERVICO,
  INITIAL_MATERIAIS_APLICADOS,
  INITIAL_FERRAMENTAS_UTILIZADAS,
  INITIAL_APONTAMENTOS_TAREFAS,
  INITIAL_RELATORIOS_INSPECAO,
  INITIAL_PASSAGENS_TURNO,
  INITIAL_LIBERACOES_RTS,
  INITIAL_DOSSIES_DIGITAIS,
} from './seedData';

import crypto from 'crypto';
import { auditLogger } from './audit/auditLogger';
import { osStateMachine } from './os/stateMachine';
import { storageProvider } from './storage/storageProvider';
import { dbConnection } from './db/connection';

// Regra Inviolável #1: Nunca permitir campos em branco ou vazios. N/A obrigatório.
export function sanitizeNA<T>(value: T): T | string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? 'N/A' : trimmed;
  }
  return value;
}

export class MroDatabase {
  private bases: BaseOperacional[] = [...INITIAL_BASES];
  private tecnicos: PessoalTecnico[] = [...INITIAL_TECNICOS];
  private designacoes: DesignacaoFuncoesF001_03[] = [...INITIAL_DESIGNACOES];
  private treinamentos: TreinamentoMNT002[] = [...INITIAL_TREINAMENTOS];

  // Parte 4: Comercial, PCP e Ordens de Serviço
  private modelosEO: ModeloHomologadoEO[] = [...INITIAL_MODELOS_EO];
  private solicitacoes: SolicitacaoComercial[] = [...INITIAL_SOLICITACOES_COMERCIAIS];
  private ordensServico: OrdemServicoF001_09_2[] = [...INITIAL_ORDENS_SERVICO];

  // Parte 5: Execução de Linha, Apontamentos, RIs e Passagem de Turno
  private apontamentos: ApontamentoTarefaOS[] = [...INITIAL_APONTAMENTOS_TAREFAS];
  private materiaisAplicados: MaterialAplicadoOS[] = [...INITIAL_MATERIAIS_APLICADOS];
  private ferramentasUtilizadas: FerramentaUtilizadaOS[] = [...INITIAL_FERRAMENTAS_UTILIZADAS];
  private relatoriosInspecao: RelatorioInspecaoF001_12[] = [...INITIAL_RELATORIOS_INSPECAO];
  private passagensTurno: PassagemTurnoF001_24[] = [...INITIAL_PASSAGENS_TURNO];

  // Parte 6: Garantia da Qualidade, RTS e Arquivo Técnico
  private liberacoesRts: LiberacaoRTS[] = [...INITIAL_LIBERACOES_RTS];
  private dossiesDigitais: DossieDigitalOS[] = [...INITIAL_DOSSIES_DIGITAIS];

  // Evidências Reais de Limpeza e Prevenção FOD (I 001-09 / I 001-14)
  private checklistsFod: (ChecklistFodEncerramento & { id_os: number })[] = [
    {
      id_os: 2, // OS-2026-0082 (Concluída em seed)
      recolhimento_todas_ferramentas: true,
      contagem_ferramentas_confere: true,
      inspecao_visual_baias_motores_paineis: true,
      limpeza_residuos_freio_arames_panos: true,
      paineis_acesso_fechados_travados: true,
      aviso_fod_confirmado: true,
      data_hora_verificacao: '21/09/2026 05:45 UTC',
      id_inspetor_verificador: 3,
      inspetor_nome: 'Alexandre Pires Guimarães',
      inspetor_canac: '109312',
    },
  ];

  // Retenção Documental Configurável (RBAC 145.211 / EASA Part-145.A.55)
  private retencoesDocumentais: any[] = [
    {
      id_retencao: 1,
      id_dossie: 'DOSSIE-OS-2026-0082',
      id_os: 2,
      data_criacao: '2026-09-21T06:00:00Z',
      data_encerramento: '2026-09-21T06:00:00Z',
      data_rts: '2026-09-21T06:00:00Z',
      data_minima_retencao: '2031-09-21',
      politica_retencao: 'RBAC 145.211 (5 ANOS APÓS RTS) / EASA Part-145.A.55',
      status_retencao: 'VIGENTE',
      bloqueio_exclusao: true,
      motivo_bloqueio: 'Custódia regulatória obrigatória vigente. Exclusão estritamente proibida.',
    },
  ];

  // Usuários e Perfis RBAC
  private usuarios: any[] = [
    {
      id_usuario: 1,
      nome: 'Eng. Roberto Albuquerque Mendonça',
      email: 'rt@impactoaviation.com.br',
      cargo: 'Responsável Técnico (RT)',
      perfil: 'RT',
      canac: '104820',
      ativo: true,
      permissoes: ['ALL', 'RTS_EMISSAO', 'F001_03_ASSINAR', 'OS_ENCERRAR', 'QUALIDADE_AUDITAR'],
    },
    {
      id_usuario: 2,
      nome: 'Juliana Costa e Silva',
      email: 'qualidade@impactoaviation.com.br',
      cargo: 'Gerente da Garantia da Qualidade (GQ)',
      perfil: 'GERENTE_QUALIDADE',
      canac: '114520',
      ativo: true,
      permissoes: ['AUDITORIA_GQ', 'QUARENTENA_FERRAMENTA', 'OS_AUDITAR', 'LTA_GERAR'],
    },
    {
      id_usuario: 3,
      nome: 'Alexandre Pires Guimarães',
      email: 'inspetor.chefe@impactoaviation.com.br',
      cargo: 'Inspetor Chefe (APRS)',
      perfil: 'INSPETOR_CHEFE',
      canac: '109312',
      ativo: true,
      permissoes: ['RTS_EMISSAO', 'IIO_INSPECAO', 'RI_APROVACAO', 'FOD_INSPECAO'],
    },
    {
      id_usuario: 4,
      nome: 'Carlos Eduardo Silveira',
      email: 'mecanico.lider@impactoaviation.com.br',
      cargo: 'MMA / Mecânico Líder',
      perfil: 'MECANICO',
      canac: '128450',
      ativo: true,
      permissoes: ['TAREFA_EXECUTAR', 'RI_ABERTURA', 'FERRAMENTA_MOVIMENTAR'],
    },
    {
      id_usuario: 5,
      nome: 'Fernanda Lima Rocha',
      email: 'pcp@impactoaviation.com.br',
      cargo: 'Analista de Planejamento (PCP)',
      perfil: 'PCP',
      canac: '139820',
      ativo: true,
      permissoes: ['OS_ABERTURA', 'OS_EDITAR', 'SOLICITACAO_ANALISAR'],
    },
  ];

  private nextTecnicoId = 11;
  private nextDesignacaoId = 9;
  private nextTreinamentoId = 22;
  private nextBaseId = 5;
  private nextSolicitacaoId = 6;
  private nextOsId = 4;
  private nextOsSeq = 86;
  private nextApontamentoId = 4;
  private nextMaterialId = 4;
  private nextUsoFerramentaId = 3;
  private nextRiId = 3;
  private nextRiSeq = 43;
  private nextPassagemId = 3;
  private nextPassagemSeq = 20;
  private nextRtsId = 2;
  private nextRtsSeq = 42;
  private nextFodId = 2;
  private nextRetencaoId = 2;

  // --- BASES OPERACIONAIS ---
  public getBases(): BaseOperacional[] {
    return this.bases.map((b) => ({
      ...b,
      nome_base: sanitizeNA(b.nome_base) as string,
      codigo_anac: sanitizeNA(b.codigo_anac) as string,
    }));
  }

  public getBaseById(id: number): BaseOperacional | undefined {
    return this.bases.find((b) => b.id_base === id);
  }

  public createBase(base: Omit<BaseOperacional, 'id_base'>): BaseOperacional {
    const newBase: BaseOperacional = {
      id_base: this.nextBaseId++,
      nome_base: (sanitizeNA(base.nome_base) as string) || 'N/A',
      codigo_anac: (sanitizeNA(base.codigo_anac) as string) || 'N/A',
      tipo_base: base.tipo_base || 'SECUNDARIA',
      ativo: base.ativo ?? true,
    };
    this.bases.push(newBase);
    return newBase;
  }

  // --- PESSOAL TÉCNICO ---
  public getTecnicos(filtros?: {
    id_base?: number;
    cargo?: string;
    status_qualificacao?: 'APTO' | 'BLOQUEADO';
    search?: string;
  }): TecnicoComQualificacao[] {
    let result = this.tecnicos.map((t) => this.montarTecnicoComQualificacao(t));

    if (filtros?.id_base) {
      result = result.filter((t) => t.id_base_alocada === filtros.id_base);
    }
    if (filtros?.cargo && filtros.cargo !== 'TODOS') {
      result = result.filter((t) => t.cargo === filtros.cargo);
    }
    if (filtros?.status_qualificacao && filtros.status_qualificacao !== ('TODOS' as any)) {
      result = result.filter((t) => t.qualificacao.status === filtros.status_qualificacao);
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.nome_completo.toLowerCase().includes(q) ||
          t.canac.toLowerCase().includes(q) ||
          t.cpf.includes(q) ||
          t.cargo.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getTecnicoById(id: number): TecnicoComQualificacao | undefined {
    const tecnico = this.tecnicos.find((t) => t.id_tecnico === id);
    if (!tecnico) return undefined;
    return this.montarTecnicoComQualificacao(tecnico);
  }

  public createTecnico(data: Omit<PessoalTecnico, 'id_tecnico'>): TecnicoComQualificacao {
    // Sanitização e N/A
    const novoTecnico: PessoalTecnico = {
      id_tecnico: this.nextTecnicoId++,
      nome_completo: (sanitizeNA(data.nome_completo) as string) || 'N/A',
      canac: (sanitizeNA(data.canac) as string) || 'N/A',
      cpf: (sanitizeNA(data.cpf) as string) || 'N/A',
      cargo: data.cargo,
      licenca_cct: (sanitizeNA(data.licenca_cct) as string) || 'N/A',
      data_admissao: data.data_admissao || new Date().toISOString().split('T')[0],
      status_exame_toxicologico: data.status_exame_toxicologico || 'EM_DIA',
      id_base_alocada: Number(data.id_base_alocada) || 1,
      ativo: data.ativo ?? true,
    };

    this.tecnicos.push(novoTecnico);
    return this.montarTecnicoComQualificacao(novoTecnico);
  }

  public updateTecnico(id: number, data: Partial<PessoalTecnico>): TecnicoComQualificacao | undefined {
    const index = this.tecnicos.findIndex((t) => t.id_tecnico === id);
    if (index === -1) return undefined;

    const current = this.tecnicos[index];
    this.tecnicos[index] = {
      ...current,
      nome_completo: data.nome_completo !== undefined ? (sanitizeNA(data.nome_completo) as string) : current.nome_completo,
      canac: data.canac !== undefined ? (sanitizeNA(data.canac) as string) : current.canac,
      cpf: data.cpf !== undefined ? (sanitizeNA(data.cpf) as string) : current.cpf,
      cargo: data.cargo !== undefined ? data.cargo : current.cargo,
      licenca_cct: data.licenca_cct !== undefined ? (sanitizeNA(data.licenca_cct) as string) : current.licenca_cct,
      data_admissao: data.data_admissao || current.data_admissao,
      status_exame_toxicologico: data.status_exame_toxicologico || current.status_exame_toxicologico,
      id_base_alocada: data.id_base_alocada ? Number(data.id_base_alocada) : current.id_base_alocada,
      ativo: data.ativo !== undefined ? data.ativo : current.ativo,
    };

    return this.montarTecnicoComQualificacao(this.tecnicos[index]);
  }

  public toggleTecnicoAtivo(id: number): boolean {
    const tecnico = this.tecnicos.find((t) => t.id_tecnico === id);
    if (!tecnico) return false;
    tecnico.ativo = !tecnico.ativo;
    return true;
  }

  // --- DESIGNAÇÃO DE FUNÇÕES F 001-03 ---
  public getDesignacoes(id_tecnico?: number): DesignacaoFuncoesF001_03[] {
    let list = this.designacoes;
    if (id_tecnico) {
      list = list.filter((d) => d.id_tecnico === id_tecnico);
    }
    return list.map((d) => {
      const tec = this.tecnicos.find((t) => t.id_tecnico === d.id_tecnico);
      return {
        ...d,
        numero_f001_03: sanitizeNA(d.numero_f001_03) as string,
        funcoes_autorizadas: sanitizeNA(d.funcoes_autorizadas) as string,
        tecnico_nome: tec?.nome_completo || 'N/A',
        tecnico_canac: tec?.canac || 'N/A',
      };
    });
  }

  public createDesignacao(data: Omit<DesignacaoFuncoesF001_03, 'id_designacao'>): DesignacaoFuncoesF001_03 {
    const anoAtual = new Date().getFullYear();
    const seq = String(this.designacoes.length + 1).padStart(4, '0');
    const numero_f001_03 = data.numero_f001_03?.trim() || `F001-03-${anoAtual}-${seq}`;

    const novaDesignacao: DesignacaoFuncoesF001_03 = {
      id_designacao: this.nextDesignacaoId++,
      id_tecnico: Number(data.id_tecnico),
      numero_f001_03,
      funcoes_autorizadas: (sanitizeNA(data.funcoes_autorizadas) as string) || 'Execução Célula',
      data_emissao: data.data_emissao || new Date().toISOString().split('T')[0],
      data_validade: data.data_validade,
      assinado_por_rt: Boolean(data.assinado_por_rt),
      status: data.status || 'ATIVO',
    };

    this.designacoes.push(novaDesignacao);
    return novaDesignacao;
  }

  public assinarDesignacaoRT(id_designacao: number): boolean {
    const desig = this.designacoes.find((d) => d.id_designacao === id_designacao);
    if (!desig) return false;
    desig.assinado_por_rt = true;
    return true;
  }

  public updateDesignacao(id: number, data: Partial<DesignacaoFuncoesF001_03>): DesignacaoFuncoesF001_03 | undefined {
    const desig = this.designacoes.find((d) => d.id_designacao === id);
    if (!desig) return undefined;

    if (data.funcoes_autorizadas !== undefined) {
      desig.funcoes_autorizadas = sanitizeNA(data.funcoes_autorizadas) as string;
    }
    if (data.data_validade !== undefined) desig.data_validade = data.data_validade;
    if (data.assinado_por_rt !== undefined) desig.assinado_por_rt = data.assinado_por_rt;
    if (data.status !== undefined) desig.status = data.status;

    return desig;
  }

  // --- TREINAMENTOS MNT-002 ---
  public getTreinamentos(id_tecnico?: number): TreinamentoMNT002[] {
    let list = this.treinamentos;
    if (id_tecnico) {
      list = list.filter((t) => t.id_tecnico === id_tecnico);
    }
    return list.map((t) => {
      const tec = this.tecnicos.find((item) => item.id_tecnico === t.id_tecnico);
      return {
        ...t,
        nome_curso: sanitizeNA(t.nome_curso) as string,
        certificado_url: sanitizeNA(t.certificado_url) as string,
        tecnico_nome: tec?.nome_completo || 'N/A',
      };
    });
  }

  public createTreinamento(data: Omit<TreinamentoMNT002, 'id_treinamento'>): TreinamentoMNT002 {
    // Calculo padrão de validade: 24 meses se não informado
    let dataReciclagem = data.data_reciclagem;
    if (!dataReciclagem && data.data_conclusao) {
      const d = new Date(data.data_conclusao);
      d.setFullYear(d.getFullYear() + 2);
      dataReciclagem = d.toISOString().split('T')[0];
    }

    const novoTreinamento: TreinamentoMNT002 = {
      id_treinamento: this.nextTreinamentoId++,
      id_tecnico: Number(data.id_tecnico),
      nome_curso: (sanitizeNA(data.nome_curso) as string) || 'N/A',
      carga_horaria: Number(data.carga_horaria) || 16,
      data_conclusao: data.data_conclusao || new Date().toISOString().split('T')[0],
      data_reciclagem: dataReciclagem || new Date().toISOString().split('T')[0],
      certificado_url: (sanitizeNA(data.certificado_url) as string) || 'N/A',
    };

    this.treinamentos.push(novoTreinamento);
    return novoTreinamento;
  }

  public updateTreinamento(id: number, data: Partial<TreinamentoMNT002>): TreinamentoMNT002 | undefined {
    const tr = this.treinamentos.find((t) => t.id_treinamento === id);
    if (!tr) return undefined;

    if (data.nome_curso !== undefined) tr.nome_curso = sanitizeNA(data.nome_curso) as string;
    if (data.carga_horaria !== undefined) tr.carga_horaria = Number(data.carga_horaria);
    if (data.data_conclusao !== undefined) tr.data_conclusao = data.data_conclusao;
    if (data.data_reciclagem !== undefined) tr.data_reciclagem = data.data_reciclagem;
    if (data.certificado_url !== undefined) tr.certificado_url = sanitizeNA(data.certificado_url) as string;

    return tr;
  }

  // --- MOTOR DE AUDITORIA & REGRA DE QUALIFICAÇÃO (BLOQUEIO POR QUALIFICAÇÃO - REGRA 6) ---
  public calcularAuditoriaQualificacao(id_tecnico: number): StatusQualificacaoAudit {
    const tecnico = this.tecnicos.find((t) => t.id_tecnico === id_tecnico);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const motivos_bloqueio: string[] = [];

    if (!tecnico) {
      return {
        id_tecnico,
        is_apto: false,
        status: 'BLOQUEADO',
        aprovado_aprs: false,
        motivos_bloqueio: ['Técnico não encontrado no cadastro'],
        funcoes_autorizadas: [],
        f001_03_ativo: false,
        f001_03_assinado_rt: false,
        f001_03_numero: 'N/A',
        f001_03_validade: 'N/A',
        toxicologico_ok: false,
        treinamentos_vencidos: [],
        treinamentos_faltantes: [],
        treinamentos_a_vencer_30d: [],
      };
    }

    // 1. Verificação se o cadastro está ativo
    if (!tecnico.ativo) {
      motivos_bloqueio.push('Técnico inativo no cadastro geral da organização');
    }

    // 2. Verificação de Exame Toxicológico (PPSP)
    const toxicologico_ok = tecnico.status_exame_toxicologico === 'EM_DIA';
    if (!toxicologico_ok) {
      motivos_bloqueio.push(
        `Exame Toxicológico (PPSP) não regularizado (Status atual: ${tecnico.status_exame_toxicologico})`
      );
    }

    // 3. Verificação do Formulário F 001-03 (Designação de Funções)
    const desigsTecnico = this.designacoes.filter((d) => d.id_tecnico === id_tecnico);
    const desigAtiva = desigsTecnico.find((d) => d.status === 'ATIVO');

    let f001_03_ativo = false;
    let f001_03_assinado_rt = false;
    let f001_03_numero = 'N/A';
    let f001_03_validade = 'N/A';
    const funcoes_autorizadas: string[] = [];

    if (!desigAtiva) {
      motivos_bloqueio.push('Nenhum Formulário de Designação de Funções (F 001-03) ATIVO cadastrado (Regra 6 / MOMQ)');
    } else {
      f001_03_ativo = true;
      f001_03_numero = desigAtiva.numero_f001_03;
      f001_03_validade = desigAtiva.data_validade;

      if (desigAtiva.funcoes_autorizadas) {
        desigAtiva.funcoes_autorizadas.split(',').forEach((f) => funcoes_autorizadas.push(f.trim()));
      }

      // Trava obrigatória: Assinatura do RT
      if (!desigAtiva.assinado_por_rt) {
        f001_03_assinado_rt = false;
        motivos_bloqueio.push(
          `Formulário F 001-03 (${f001_03_numero}) PENDENTE de Assinatura do Responsável Técnico (RT). Bloqueio conforme Regra 6.`
        );
      } else {
        f001_03_assinado_rt = true;
      }

      // Validade da Designação
      if (desigAtiva.data_validade) {
        const valDate = new Date(desigAtiva.data_validade);
        if (valDate < hoje) {
          motivos_bloqueio.push(
            `Formulário F 001-03 (${f001_03_numero}) VENCIDO em ${desigAtiva.data_validade}. Renovação obrigatória.`
          );
        }
      }
    }

    // 4. Verificação de Treinamentos Mandatórios (MNT-002)
    const treinosTecnico = this.treinamentos.filter((t) => t.id_tecnico === id_tecnico);
    const treinamentos_vencidos: { nome_curso: string; data_reciclagem: string }[] = [];
    const treinamentos_a_vencer_30d: { nome_curso: string; data_reciclagem: string; dias_restantes: number }[] = [];

    // Checar cada treinamento realizado
    for (const tr of treinosTecnico) {
      if (tr.data_reciclagem) {
        const recDate = new Date(tr.data_reciclagem);
        const diffMs = recDate.getTime() - hoje.getTime();
        const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (dias < 0) {
          treinamentos_vencidos.push({
            nome_curso: tr.nome_curso,
            data_reciclagem: tr.data_reciclagem,
          });
          motivos_bloqueio.push(
            `Treinamento MNT-002 '${tr.nome_curso}' VENCIDO em ${tr.data_reciclagem}. Bloqueio conforme Regra 6.`
          );
        } else if (dias <= 30) {
          treinamentos_a_vencer_30d.push({
            nome_curso: tr.nome_curso,
            data_reciclagem: tr.data_reciclagem,
            dias_restantes: dias,
          });
        }
      }
    }

    // Checar treinamentos mandatórios faltantes (para cargos técnicos: MMA, Inspetor, Inspetor Chefe, RT)
    const treinamentos_faltantes: string[] = [];
    const cargosExigidos = ['MMA', 'Inspetor', 'Inspetor Chefe', 'RT'];
    if (cargosExigidos.includes(tecnico.cargo)) {
      const cursosFeitos = treinosTecnico.map((t) => t.nome_curso.toLowerCase());
      // RBAC 145 e Fatores Humanos são mandatórios para qualquer técnico ativo
      const mandatoryBase = [
        'RBAC 145 - Requisitos de Organização de Manutenção',
        'Fatores Humanos na Manutenção (Human Factors)',
      ];

      for (const mCurso of mandatoryBase) {
        const encontrado = cursosFeitos.some((c) => c.includes(mCurso.toLowerCase().substring(0, 15)));
        if (!encontrado) {
          treinamentos_faltantes.push(mCurso);
          motivos_bloqueio.push(`Treinamento mandatório faltante no prontuário: '${mCurso}' (MNT-002)`);
        }
      }
    }

    const is_apto = motivos_bloqueio.length === 0;
    const status = is_apto ? 'APTO' : 'BLOQUEADO';

    // Aprovado APRS (Aprovação para Retorno ao Serviço)
    const temFuncaoAPRS = funcoes_autorizadas.some(
      (f) => f.toUpperCase().includes('APRS') || f.toUpperCase().includes('RETORNO AO SERVIÇO')
    );
    const temLicenca = Boolean(tecnico.licenca_cct && tecnico.licenca_cct !== 'N/A');
    const cargoPermite = ['RT', 'Inspetor Chefe', 'Inspetor'].includes(tecnico.cargo);
    const aprovado_aprs = Boolean(is_apto && (cargoPermite || temFuncaoAPRS) && temLicenca);

    return {
      id_tecnico,
      is_apto,
      status,
      aprovado_aprs,
      motivos_bloqueio,
      funcoes_autorizadas,
      f001_03_ativo,
      f001_03_assinado_rt,
      f001_03_numero,
      f001_03_validade,
      toxicologico_ok,
      treinamentos_vencidos,
      treinamentos_faltantes,
      treinamentos_a_vencer_30d,
    };
  }

  private montarTecnicoComQualificacao(tecnico: PessoalTecnico): TecnicoComQualificacao {
    const base = this.bases.find((b) => b.id_base === tecnico.id_base_alocada);
    const qualificacao = this.calcularAuditoriaQualificacao(tecnico.id_tecnico);
    const designacoes = this.getDesignacoes(tecnico.id_tecnico);
    const treinamentos = this.getTreinamentos(tecnico.id_tecnico);

    return {
      ...tecnico,
      nome_completo: sanitizeNA(tecnico.nome_completo) as string,
      canac: sanitizeNA(tecnico.canac) as string,
      cpf: sanitizeNA(tecnico.cpf) as string,
      licenca_cct: sanitizeNA(tecnico.licenca_cct) as string,
      base_nome: base?.nome_base || 'N/A',
      base_codigo: base?.codigo_anac || 'N/A',
      base,
      qualificacao,
      designacoes,
      treinamentos,
    };
  }

  // --- RELATÓRIO TRIMESTRAL F 001-07 PARA A ANAC ---
  public gerarRelatorioTrimestralF001_07(trimestre?: string, id_base?: number): RelatorioTrimestralF001_07 {
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth() + 1;
    const triPadrao =
      trimestre || `${Math.ceil(mesAtual / 3)}º Trimestre / ${anoAtual}`;

    const rt = this.tecnicos.find((t) => t.cargo === 'RT');
    const gq = this.tecnicos.find((t) => t.cargo === 'Gerente Qualidade');

    let tecnicos = this.getTecnicos();
    if (id_base) {
      tecnicos = tecnicos.filter((t) => t.id_base_alocada === id_base);
    }

    const itens: ItemRelatorioF001_07[] = tecnicos.map((t, idx) => {
      const q = t.qualificacao;
      const desigAtiva = t.designacoes.find((d) => d.status === 'ATIVO');

      return {
        item: idx + 1,
        id_tecnico: t.id_tecnico,
        nome_completo: sanitizeNA(t.nome_completo) as string,
        canac: sanitizeNA(t.canac) as string,
        cpf: sanitizeNA(t.cpf) as string,
        cargo: sanitizeNA(t.cargo) as string,
        licenca_cct: sanitizeNA(t.licenca_cct) as string,
        base_alocada: sanitizeNA(t.base_nome) as string,
        f001_03_numero: desigAtiva?.numero_f001_03 ? sanitizeNA(desigAtiva.numero_f001_03) as string : 'N/A',
        f001_03_validade: desigAtiva?.data_validade ? sanitizeNA(desigAtiva.data_validade) as string : 'N/A',
        f001_03_rt_assinado: desigAtiva?.assinado_por_rt ? 'SIM' : 'NÃO',
        funcoes_autorizadas: desigAtiva?.funcoes_autorizadas ? sanitizeNA(desigAtiva.funcoes_autorizadas) as string : 'N/A',
        cursos_mandatorios_status: q.treinamentos_vencidos.length === 0 && q.treinamentos_faltantes.length === 0 ? 'CONFORME' : 'NÃO CONFORME',
        exame_toxicologico: t.status_exame_toxicologico,
        condicao_operacional: q.status,
        motivo_bloqueio_resumo: q.motivos_bloqueio.length > 0 ? q.motivos_bloqueio.join('; ') : 'N/A',
      };
    });

    const total_tecnicos = itens.length;
    const total_aptos = itens.filter((i) => i.condicao_operacional === 'APTO').length;
    const total_bloqueados = itens.filter((i) => i.condicao_operacional === 'BLOQUEADO').length;
    const total_aprs_habilitados = tecnicos.filter((t) => t.qualificacao.aprovado_aprs).length;
    const taxa_conformidade_percentual =
      total_tecnicos > 0 ? Number(((total_aptos / total_tecnicos) * 100).toFixed(1)) : 100;

    const tecnicos_por_base: Record<string, number> = {};
    for (const b of this.bases) {
      tecnicos_por_base[b.nome_base] = tecnicos.filter((t) => t.id_base_alocada === b.id_base).length;
    }

    return {
      cabecalho: {
        empresa: 'Impacto Aviation Ltda',
        homologacao_anac: 'COM 200607-05/ANAC',
        homologacao_easa: 'EASA.145.1003',
        formulario: 'F 001-07',
        titulo: 'RELAÇÃO DE PESSOAL TÉCNICO E INSPETORES QUALIFICADOS - RELATÓRIO TRIMESTRAL (RBAC 145.163 / MOMQ MNT-001)',
        revisao_momq: 'MNT-001 Rev 08',
        trimestre: triPadrao,
        data_geracao: agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR'),
        responsavel_tecnico: rt ? `${rt.nome_completo} (CANAC: ${rt.canac})` : 'N/A',
        canac_rt: rt ? rt.canac : 'N/A',
        gerente_qualidade: gq ? `${gq.nome_completo} (CANAC: ${gq.canac})` : 'N/A',
      },
      estatisticas: {
        total_tecnicos,
        total_aptos,
        total_bloqueados,
        total_aprs_habilitados,
        taxa_conformidade_percentual,
        tecnicos_por_base,
      },
      itens,
    };
  }

  // --- ESTATÍSTICAS DO DASHBOARD ---
  public getDashboardStats() {
    const tecnicos = this.getTecnicos();
    const total = tecnicos.length;
    const aptos = tecnicos.filter((t) => t.qualificacao.is_apto).length;
    const bloqueados = tecnicos.filter((t) => !t.qualificacao.is_apto).length;
    const aprs = tecnicos.filter((t) => t.qualificacao.aprovado_aprs).length;
    const designacoesPendentesRT = this.designacoes.filter((d) => d.status === 'ATIVO' && !d.assinado_por_rt).length;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let cursosVencidos = 0;
    let cursosVencer30d = 0;

    for (const tr of this.treinamentos) {
      if (tr.data_reciclagem) {
        const d = new Date(tr.data_reciclagem);
        const diff = d.getTime() - hoje.getTime();
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (dias < 0) cursosVencidos++;
        else if (dias <= 30) cursosVencer30d++;
      }
    }

    return {
      total_tecnicos: total,
      tecnicos_aptos: aptos,
      tecnicos_bloqueados: bloqueados,
      habilitados_aprs: aprs,
      designacoes_pendentes_rt: designacoesPendentesRT,
      cursos_vencidos: cursosVencidos,
      cursos_a_vencer_30d: cursosVencer30d,
      taxa_conformidade: total > 0 ? Math.round((aptos / total) * 100) : 100,
    };
  }

  // ===========================================================================
  // PARTE 2: FERRAMENTARIA, CALIBRAÇÃO E QUARENTENA (tb_ferramentas, etc.)
  // ===========================================================================
  private ferramentas: Ferramenta[] = [...INITIAL_FERRAMENTAS];
  private calibracoes: ControleCalibracaoF001_06[] = [...INITIAL_CALIBRACOES];
  private movimentacoes: MovimentacaoFerramentaF001_06_1[] = [...INITIAL_MOVIMENTACOES];
  private quarentenas: QuarentenaFerramentasF001_06_4[] = [...INITIAL_QUARENTENA];

  private nextFerramentaId = 10;
  private nextCalibracaoId = 7;
  private nextMovimentacaoId = 3;
  private nextQuarentenaId = 3;

  // --- RECALCULAR STATUS E VENCIMENTO AUTOMÁTICO DE FERRAMENTAS (REGRA 2) ---
  public verificarEVincularFerramenta(f: Ferramenta): Ferramenta {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Buscar última calibração
    const calibs = this.calibracoes
      .filter((c) => c.id_ferramenta === f.id_ferramenta)
      .sort((a, b) => new Date(b.data_afericao).getTime() - new Date(a.data_afericao).getTime());
    const ultimaCalib = calibs[0];

    // Buscar registro de quarentena ativo
    const quarentenaAtiva = this.quarentenas.find(
      (q) => q.id_ferramenta === f.id_ferramenta && q.status_resolucao !== 'LIBERADO_RECALIBRADO' && q.status_resolucao !== 'SUCATEADO'
    );

    // Buscar movimentação em aberto (CHECK_OUT sem CHECK_IN)
    const movAberta = this.movimentacoes
      .filter((m) => m.id_ferramenta === f.id_ferramenta && m.tipo_movimentacao === 'CHECK_OUT' && !m.devolvido_em)
      .sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime())[0];

    let dias_para_vencer_calibracao: number | undefined = undefined;
    let calibracao_vencida = false;

    if (f.requer_calibracao && ultimaCalib) {
      const dataVenc = new Date(ultimaCalib.data_vencimento);
      const diffMs = dataVenc.getTime() - hoje.getTime();
      dias_para_vencer_calibracao = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (dias_para_vencer_calibracao < 0) {
        calibracao_vencida = true;
      }
    }

    // REGRA 2: Se calibração está vencida e não está em quarentena ou calibração, mover imediatamente
    if (f.requer_calibracao && calibracao_vencida && f.status !== 'QUARENTENA' && f.status !== 'EM_CALIBRACAO') {
      f.status = 'QUARENTENA';
      // Criar registro de quarentena automático caso não exista
      if (!quarentenaAtiva) {
        this.quarentenas.push({
          id_quarentena: this.nextQuarentenaId++,
          numero_f001_06_4: `F001-06-04-${hoje.getFullYear()}-${String(this.quarentenas.length + 1).padStart(3, '0')}`,
          id_ferramenta: f.id_ferramenta,
          motivo_segregacao: `Vencimento de Calibração Metrológica (Expirou em ${ultimaCalib.data_vencimento}). Trava preventiva Regra #2 e MOMQ MNT-001.`,
          tag_vermelha_f001_01_6: `TAG-VERMELHA-${hoje.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          data_entrada: new Date().toISOString(),
          responsavel_segregacao: 2, // Gerente de Qualidade padrão
          local_armazenamento_segregado: 'Armário Quarentena Ferramentaria Trancado Q-01',
          status_resolucao: 'RETIDO',
          despacho_qualidade: 'Bloqueio preventivo automático. Ferramenta impedida de vincular a OS.',
        });
      }
    }

    // Se estiver em quarentena, status da ferramenta deve refletir
    if (quarentenaAtiva && f.status !== 'QUARENTENA') {
      f.status = 'QUARENTENA';
    }

    // Se tiver movimentação aberta e não estiver em quarentena/calibração
    if (movAberta && f.status !== 'QUARENTENA' && f.status !== 'EM_CALIBRACAO') {
      f.status = 'EM_USO';
    }

    return {
      ...f,
      descricao: sanitizeNA(f.descricao) as string,
      part_number: sanitizeNA(f.part_number) as string,
      serial_number: sanitizeNA(f.serial_number) as string,
      posicao_localizacao: sanitizeNA(f.posicao_localizacao) as string,
      fabricante: sanitizeNA(f.fabricante) as string,
      faixa_operacao: sanitizeNA(f.faixa_operacao) as string,
      tolerancia_admissivel: sanitizeNA(f.tolerancia_admissivel) as string,
      observacoes: sanitizeNA(f.observacoes) as string,
      ultima_calibracao: ultimaCalib,
      registro_quarentena_ativo: quarentenaAtiva,
      movimentacao_atual: movAberta,
      dias_para_vencer_calibracao,
      calibracao_vencida,
    };
  }

  // --- CRUD FERRAMENTAS ---
  public getFerramentas(filtros?: {
    status?: string;
    propriedade?: string;
    requer_calibracao?: boolean;
    search?: string;
  }): Ferramenta[] {
    let result = this.ferramentas.map((f) => this.verificarEVincularFerramenta(f));

    if (filtros?.status && filtros.status !== 'TODOS') {
      result = result.filter((f) => f.status === filtros.status);
    }
    if (filtros?.propriedade && filtros.propriedade !== 'TODOS') {
      result = result.filter((f) => f.propriedade === filtros.propriedade);
    }
    if (filtros?.requer_calibracao !== undefined) {
      result = result.filter((f) => f.requer_calibracao === filtros.requer_calibracao);
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      result = result.filter(
        (f) =>
          f.descricao.toLowerCase().includes(q) ||
          f.part_number.toLowerCase().includes(q) ||
          f.serial_number.toLowerCase().includes(q) ||
          f.posicao_localizacao.toLowerCase().includes(q) ||
          f.fabricante.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getFerramentaById(id: number): Ferramenta | undefined {
    const f = this.ferramentas.find((item) => item.id_ferramenta === id);
    if (!f) return undefined;
    return this.verificarEVincularFerramenta(f);
  }

  public createFerramenta(data: Omit<Ferramenta, 'id_ferramenta'>): Ferramenta {
    const novaFerramenta: Ferramenta = {
      id_ferramenta: this.nextFerramentaId++,
      descricao: (sanitizeNA(data.descricao) as string) || 'N/A',
      part_number: (sanitizeNA(data.part_number) as string) || 'N/A',
      serial_number: (sanitizeNA(data.serial_number) as string) || 'N/A',
      posicao_localizacao: (sanitizeNA(data.posicao_localizacao) as string) || 'N/A',
      requer_calibracao: Boolean(data.requer_calibracao),
      propriedade: data.propriedade || 'PROPRIA',
      status: data.status || 'DISPONIVEL',
      fabricante: (sanitizeNA(data.fabricante) as string) || 'N/A',
      faixa_operacao: (sanitizeNA(data.faixa_operacao) as string) || 'N/A',
      tolerancia_admissivel: (sanitizeNA(data.tolerancia_admissivel) as string) || 'N/A',
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.ferramentas.push(novaFerramenta);
    return this.verificarEVincularFerramenta(novaFerramenta);
  }

  public updateFerramenta(id: number, data: Partial<Ferramenta>): Ferramenta | undefined {
    const index = this.ferramentas.findIndex((f) => f.id_ferramenta === id);
    if (index === -1) return undefined;

    const curr = this.ferramentas[index];
    this.ferramentas[index] = {
      ...curr,
      descricao: data.descricao !== undefined ? (sanitizeNA(data.descricao) as string) : curr.descricao,
      part_number: data.part_number !== undefined ? (sanitizeNA(data.part_number) as string) : curr.part_number,
      serial_number: data.serial_number !== undefined ? (sanitizeNA(data.serial_number) as string) : curr.serial_number,
      posicao_localizacao:
        data.posicao_localizacao !== undefined ? (sanitizeNA(data.posicao_localizacao) as string) : curr.posicao_localizacao,
      requer_calibracao: data.requer_calibracao !== undefined ? data.requer_calibracao : curr.requer_calibracao,
      propriedade: data.propriedade || curr.propriedade,
      status: data.status || curr.status,
      fabricante: data.fabricante !== undefined ? (sanitizeNA(data.fabricante) as string) : curr.fabricante,
      faixa_operacao: data.faixa_operacao !== undefined ? (sanitizeNA(data.faixa_operacao) as string) : curr.faixa_operacao,
      tolerancia_admissivel:
        data.tolerancia_admissivel !== undefined
          ? (sanitizeNA(data.tolerancia_admissivel) as string)
          : curr.tolerancia_admissivel,
      observacoes: data.observacoes !== undefined ? (sanitizeNA(data.observacoes) as string) : curr.observacoes,
    };

    return this.verificarEVincularFerramenta(this.ferramentas[index]);
  }

  // --- CONTROLE DE CALIBRAÇÃO (tb_controle_calibracao_f001_06 - F 001-06) ---
  public getCalibracoes(id_ferramenta?: number): ControleCalibracaoF001_06[] {
    let list = this.calibracoes;
    if (id_ferramenta) {
      list = list.filter((c) => c.id_ferramenta === id_ferramenta);
    }
    return list.map((c) => {
      const f = this.ferramentas.find((item) => item.id_ferramenta === c.id_ferramenta);
      return {
        ...c,
        numero_laudo: sanitizeNA(c.numero_laudo) as string,
        laboratorio_homologado: sanitizeNA(c.laboratorio_homologado) as string,
        observacoes_laudo: sanitizeNA(c.observacoes_laudo) as string,
        ferramenta_pn: f?.part_number || 'N/A',
        ferramenta_sn: f?.serial_number || 'N/A',
        ferramenta_descricao: f?.descricao || 'N/A',
      };
    });
  }

  public createCalibracao(data: Omit<ControleCalibracaoF001_06, 'id_calibracao'>): {
    calibracao: ControleCalibracaoF001_06;
    quarentena_acionada: boolean;
    motivo_quarentena?: string;
  } {
    const desvioObservado = Number(data.desvio_padrao_observado);
    const desvioMaximo = Number(data.desvio_maximo_tolerado);

    // Validação metrológica BTI-PMP-05
    const aprovadoDesvio = desvioObservado <= desvioMaximo;
    const tagAmarelaAplicada = aprovadoDesvio && Boolean(data.tag_f001_06_3_aplicada);

    const novaCalib: ControleCalibracaoF001_06 = {
      id_calibracao: this.nextCalibracaoId++,
      id_ferramenta: Number(data.id_ferramenta),
      numero_laudo: (sanitizeNA(data.numero_laudo) as string) || 'N/A',
      laboratorio_homologado: (sanitizeNA(data.laboratorio_homologado) as string) || 'N/A',
      desvio_padrao_observado: desvioObservado,
      desvio_maximo_tolerado: desvioMaximo,
      aprovado_desvio_padrao: aprovadoDesvio,
      data_afericao: data.data_afericao || new Date().toISOString().split('T')[0],
      data_vencimento: data.data_vencimento,
      tag_f001_06_3_aplicada: tagAmarelaAplicada,
      observacoes_laudo: (sanitizeNA(data.observacoes_laudo) as string) || 'N/A',
    };

    this.calibracoes.push(novaCalib);

    // Atualizar ferramenta correspondente
    const f = this.ferramentas.find((item) => item.id_ferramenta === novaCalib.id_ferramenta);
    let quarentenaAcionada = false;
    let motivoQuarentena: string | undefined = undefined;

    if (f) {
      if (!aprovadoDesvio) {
        // TRAVA BTI-PMP-05: Se reprovado no desvio padrão, mover imediatamente para Quarentena
        f.status = 'QUARENTENA';
        quarentenaAcionada = true;
        motivoQuarentena = `Reprovado no laudo metrológico ${novaCalib.numero_laudo}: Desvio padrão observado (${desvioObservado}) excedeu a tolerância BTI-PMP-05 (${desvioMaximo}).`;

        this.quarentenas.push({
          id_quarentena: this.nextQuarentenaId++,
          numero_f001_06_4: `F001-06-04-${new Date().getFullYear()}-${String(this.quarentenas.length + 1).padStart(3, '0')}`,
          id_ferramenta: f.id_ferramenta,
          motivo_segregacao: motivoQuarentena,
          tag_vermelha_f001_01_6: `TAG-VERMELHA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          data_entrada: new Date().toISOString(),
          responsavel_segregacao: 2, // Gerente de Qualidade
          local_armazenamento_segregado: 'Armário Quarentena Ferramentaria Trancado Q-02',
          status_resolucao: 'RETIDO',
          despacho_qualidade: 'Reprovado por desvio metrológico. Tag Vermelha F 001-01-6 afixada.',
        });
      } else {
        // Se aprovado e estava em quarentena ou calibração, liberar caso a data esteja no futuro
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataVenc = new Date(novaCalib.data_vencimento);

        if (dataVenc >= hoje) {
          f.status = 'DISPONIVEL';
          // Se havia quarentena ativa, atualizar status de resolução
          const qAtiva = this.quarentenas.find(
            (q) => q.id_ferramenta === f.id_ferramenta && q.status_resolucao !== 'SUCATEADO' && q.status_resolucao !== 'LIBERADO_RECALIBRADO'
          );
          if (qAtiva) {
            qAtiva.status_resolucao = 'LIBERADO_RECALIBRADO';
            qAtiva.data_resolucao = new Date().toISOString();
            qAtiva.despacho_qualidade = `Liberado para uso operacional após nova calibração aprovada (Laudo: ${novaCalib.numero_laudo}). Tag F 001-06-3 afixada.`;
          }
        }
      }
    }

    return {
      calibracao: novaCalib,
      quarentena_acionada: quarentenaAcionada,
      motivo_quarentena: motivoQuarentena,
    };
  }

  // --- MOVIMENTAÇÃO DIÁRIA (CHECK-IN / CHECK-OUT - Form F 001-06-1) ---
  public getMovimentacoes(id_ferramenta?: number): MovimentacaoFerramentaF001_06_1[] {
    let list = this.movimentacoes;
    if (id_ferramenta) {
      list = list.filter((m) => m.id_ferramenta === id_ferramenta);
    }
    return list
      .map((m) => {
        const f = this.ferramentas.find((item) => item.id_ferramenta === m.id_ferramenta);
        const tec = this.tecnicos.find((t) => t.id_tecnico === m.id_tecnico);
        return {
          ...m,
          numero_f001_06_1: sanitizeNA(m.numero_f001_06_1) as string,
          ordem_servico_numero: sanitizeNA(m.ordem_servico_numero) as string,
          finalidade_servico: sanitizeNA(m.finalidade_servico) as string,
          ferramenta_descricao: f?.descricao || 'N/A',
          ferramenta_pn: f?.part_number || 'N/A',
          ferramenta_sn: f?.serial_number || 'N/A',
          tecnico_nome: tec?.nome_completo || 'N/A',
          tecnico_canac: tec?.canac || 'N/A',
        };
      })
      .sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());
  }

  // Realizar CHECK-OUT (Retirada de Ferramenta)
  public checkOutFerramenta(data: {
    id_ferramenta: number;
    id_tecnico: number;
    ordem_servico_numero: string;
    finalidade_servico: string;
    condicoes_retirada?: string;
  }): { success: boolean; movimentacao?: MovimentacaoFerramentaF001_06_1; erro?: string } {
    const f = this.getFerramentaById(data.id_ferramenta);
    if (!f) return { success: false, erro: 'Ferramenta não encontrada no acervo.' };

    // TRAVA REGRA 2: Impedir retirada de ferramenta em Quarentena ou Calibração
    if (f.status === 'QUARENTENA') {
      return {
        success: false,
        erro: 'BLOQUEIO REGULATÓRIO (Regra #2): Ferramenta está em QUARENTENA com Tag Vermelha F 001-01-6 ("Material Não Utilizável"). Retirada proibida por normas MOMQ/ANAC.',
      };
    }
    if (f.requer_calibracao && f.calibracao_vencida) {
      return {
        success: false,
        erro: 'BLOQUEIO REGULATÓRIO (Regra #2): Ferramenta com calibração periódica vencida (F 001-06). Retirada para OS proibida até nova aferição ou transferência para Quarentena.',
      };
    }
    if (f.status === 'EM_CALIBRACAO') {
      return {
        success: false,
        erro: 'BLOQUEIO: Ferramenta está EM CALIBRAÇÃO externa e não se encontra fisicamente disponível para uso.',
      };
    }
    if (f.status === 'EM_USO') {
      return {
        success: false,
        erro: 'Ferramenta já consta como EM USO por outro técnico. É necessário efetuar o Check-in prévio.',
      };
    }

    // TRAVA REGRA 6: Verificar se o técnico está APTO
    const auditTecnico = this.calcularAuditoriaQualificacao(data.id_tecnico);
    if (!auditTecnico.is_apto) {
      return {
        success: false,
        erro: `BLOQUEIO POR QUALIFICAÇÃO (Regra #6): O técnico selecionado está BLOQUEADO (${auditTecnico.motivos_bloqueio[0]}). A ferramentaria não pode liberar ferramentas para técnicos sem qualificação ativa.`,
      };
    }

    const agora = new Date();
    const seq = String(this.movimentacoes.length + 1).padStart(4, '0');
    const novaMov: MovimentacaoFerramentaF001_06_1 = {
      id_movimentacao: this.nextMovimentacaoId++,
      numero_f001_06_1: `F001-06-1-${agora.getFullYear()}-${seq}`,
      id_ferramenta: f.id_ferramenta,
      id_tecnico: data.id_tecnico,
      tipo_movimentacao: 'CHECK_OUT',
      data_hora: agora.toISOString(),
      ordem_servico_numero: (sanitizeNA(data.ordem_servico_numero) as string) || 'N/A',
      finalidade_servico: (sanitizeNA(data.finalidade_servico) as string) || 'Execução de OS',
      condicoes_retirada: data.condicoes_retirada || 'INTACTA_CALIBRADA',
      condicoes_devolucao: 'N/A',
    };

    this.movimentacoes.push(novaMov);

    // Atualizar status da ferramenta
    const fRef = this.ferramentas.find((item) => item.id_ferramenta === f.id_ferramenta);
    if (fRef) fRef.status = 'EM_USO';

    return {
      success: true,
      movimentacao: novaMov,
    };
  }

  // Realizar CHECK-IN (Devolução de Ferramenta)
  public checkInFerramenta(data: {
    id_ferramenta: number;
    id_tecnico_devolucao: number;
    condicoes_devolucao: 'INTACTA' | 'DANIFICADA';
    observacoes_devolucao?: string;
  }): { success: boolean; movimentacao?: MovimentacaoFerramentaF001_06_1; quarentena_acionada?: boolean; erro?: string } {
    const f = this.getFerramentaById(data.id_ferramenta);
    if (!f) return { success: false, erro: 'Ferramenta não encontrada.' };

    const movAberta = this.movimentacoes
      .filter((m) => m.id_ferramenta === data.id_ferramenta && m.tipo_movimentacao === 'CHECK_OUT' && !m.devolvido_em)
      .sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime())[0];

    const agora = new Date().toISOString();
    let quarentenaAcionada = false;

    if (movAberta) {
      movAberta.devolvido_em = agora;
      movAberta.condicoes_devolucao = data.condicoes_devolucao;
      movAberta.id_tecnico_devolucao = data.id_tecnico_devolucao;
    }

    const fRef = this.ferramentas.find((item) => item.id_ferramenta === f.id_ferramenta);

    // Se devolvida danificada ou com queda -> Mover imediatamente para Quarentena (Regra 2)
    if (data.condicoes_devolucao === 'DANIFICADA') {
      if (fRef) fRef.status = 'QUARENTENA';
      quarentenaAcionada = true;

      this.quarentenas.push({
        id_quarentena: this.nextQuarentenaId++,
        numero_f001_06_4: `F001-06-04-${new Date().getFullYear()}-${String(this.quarentenas.length + 1).padStart(3, '0')}`,
        id_ferramenta: f.id_ferramenta,
        motivo_segregacao: `Devolvida com avaria/dano na devolução do Form F 001-06-1: ${data.observacoes_devolucao || 'Queda / Danificada pelo usuário'}. Bloqueio preventivo conforme Regra #2 e MOMQ.`,
        tag_vermelha_f001_01_6: `TAG-VERMELHA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        data_entrada: agora,
        responsavel_segregacao: data.id_tecnico_devolucao,
        local_armazenamento_segregado: 'Armário Quarentena Ferramentaria Trancado Q-01',
        status_resolucao: 'RETIDO',
        despacho_qualidade: 'Ferramenta devolvida danificada. Retida para avaliação da Qualidade e Metrologia.',
      });
    } else {
      // Se devolvida intacta, verificar se calibração não venceu no interim
      if (fRef) {
        if (f.calibracao_vencida) {
          fRef.status = 'QUARENTENA';
        } else {
          fRef.status = 'DISPONIVEL';
        }
      }
    }

    return {
      success: true,
      movimentacao: movAberta,
      quarentena_acionada: quarentenaAcionada,
    };
  }

  // --- MÓDULO DE QUARENTENA & SEGREGAÇÃO (tb_quarentena_ferramentas_f001_06_4 - Form F 001-06-04) ---
  public getQuarentenas(): QuarentenaFerramentasF001_06_4[] {
    return this.quarentenas.map((q) => {
      const f = this.ferramentas.find((item) => item.id_ferramenta === q.id_ferramenta);
      const tec = this.tecnicos.find((t) => t.id_tecnico === q.responsavel_segregacao);
      return {
        ...q,
        motivo_segregacao: sanitizeNA(q.motivo_segregacao) as string,
        tag_vermelha_f001_01_6: sanitizeNA(q.tag_vermelha_f001_01_6) as string,
        local_armazenamento_segregado: sanitizeNA(q.local_armazenamento_segregado) as string,
        despacho_qualidade: sanitizeNA(q.despacho_qualidade) as string,
        ferramenta_descricao: f?.descricao || 'N/A',
        ferramenta_pn: f?.part_number || 'N/A',
        ferramenta_sn: f?.serial_number || 'N/A',
        responsavel_nome: tec?.nome_completo || 'N/A',
        responsavel_canac: tec?.canac || 'N/A',
      };
    });
  }

  public getQuarentenaById(id: number): QuarentenaFerramentasF001_06_4 | undefined {
    const q = this.quarentenas.find((item) => item.id_quarentena === id);
    if (!q) return undefined;
    const f = this.ferramentas.find((item) => item.id_ferramenta === q.id_ferramenta);
    const tec = this.tecnicos.find((t) => t.id_tecnico === q.responsavel_segregacao);
    return {
      ...q,
      ferramenta_descricao: f?.descricao || 'N/A',
      ferramenta_pn: f?.part_number || 'N/A',
      ferramenta_sn: f?.serial_number || 'N/A',
      responsavel_nome: tec?.nome_completo || 'N/A',
      responsavel_canac: tec?.canac || 'N/A',
    };
  }

  public transferirParaQuarentena(data: {
    id_ferramenta: number;
    motivo_segregacao: string;
    responsavel_segregacao: number;
    local_armazenamento_segregado?: string;
  }): QuarentenaFerramentasF001_06_4 {
    const f = this.ferramentas.find((item) => item.id_ferramenta === data.id_ferramenta);
    if (!f) throw new Error('Ferramenta não encontrada');

    f.status = 'QUARENTENA';
    const agora = new Date();

    const novoRegistro: QuarentenaFerramentasF001_06_4 = {
      id_quarentena: this.nextQuarentenaId++,
      numero_f001_06_4: `F001-06-04-${agora.getFullYear()}-${String(this.quarentenas.length + 1).padStart(3, '0')}`,
      id_ferramenta: f.id_ferramenta,
      motivo_segregacao: (sanitizeNA(data.motivo_segregacao) as string) || 'Segregação manual preventiva',
      tag_vermelha_f001_01_6: `TAG-VERMELHA-${agora.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      data_entrada: agora.toISOString(),
      responsavel_segregacao: data.responsavel_segregacao,
      local_armazenamento_segregado:
        data.local_armazenamento_segregado || 'Armário Quarentena Ferramentaria Trancado Q-01',
      status_resolucao: 'RETIDO',
      despacho_qualidade: 'Ferramenta segregada em quarentena com Tag Vermelha afixada.',
    };

    this.quarentenas.push(novoRegistro);
    return novoRegistro;
  }

  public atualizarResolucaoQuarentena(
    id_quarentena: number,
    data: {
      status_resolucao: 'RETIDO' | 'ENVIADO_AFERICAO' | 'SUCATEADO' | 'LIBERADO_RECALIBRADO';
      despacho_qualidade: string;
    }
  ): QuarentenaFerramentasF001_06_4 | undefined {
    const q = this.quarentenas.find((item) => item.id_quarentena === id_quarentena);
    if (!q) return undefined;

    q.status_resolucao = data.status_resolucao;
    q.despacho_qualidade = sanitizeNA(data.despacho_qualidade) as string;
    q.data_resolucao = new Date().toISOString();

    const f = this.ferramentas.find((item) => item.id_ferramenta === q.id_ferramenta);
    if (f) {
      if (data.status_resolucao === 'LIBERADO_RECALIBRADO') {
        f.status = 'DISPONIVEL';
      } else if (data.status_resolucao === 'ENVIADO_AFERICAO') {
        f.status = 'EM_CALIBRACAO';
      } else if (data.status_resolucao === 'SUCATEADO') {
        f.status = 'QUARENTENA';
        f.observacoes = 'SUCATEADA DEFINITIVAMENTE CONFORME PARECER GQ/MOMQ';
      }
    }

    return q;
  }

  // --- ESTATÍSTICAS DA FERRAMENTARIA ---
  public getToolingStats(): ToolingStats {
    const ferramentas = this.getFerramentas();
    const total = ferramentas.length;
    const disponiveis = ferramentas.filter((f) => f.status === 'DISPONIVEL').length;
    const em_uso = ferramentas.filter((f) => f.status === 'EM_USO').length;
    const em_calibracao = ferramentas.filter((f) => f.status === 'EM_CALIBRACAO').length;
    const em_quarentena = ferramentas.filter((f) => f.status === 'QUARENTENA').length;

    const calibracoes_vencidas = ferramentas.filter((f) => f.calibracao_vencida).length;
    const calibracoes_a_vencer_30d = ferramentas.filter(
      (f) => f.requer_calibracao && f.dias_para_vencer_calibracao !== undefined && f.dias_para_vencer_calibracao >= 0 && f.dias_para_vencer_calibracao <= 30
    ).length;

    const movsAtivas = this.movimentacoes.filter((m) => m.tipo_movimentacao === 'CHECK_OUT' && !m.devolvido_em).length;
    const taxa_disponibilidade = total > 0 ? Math.round((disponiveis / total) * 100) : 100;

    return {
      total_ferramentas: total,
      disponiveis,
      em_uso,
      em_calibracao,
      em_quarentena,
      calibracoes_vencidas,
      calibracoes_a_vencer_30d,
      movimentacoes_ativas: movsAtivas,
      taxa_disponibilidade,
    };
  }

  // ===========================================================================
  // PARTE 3: CTM, DADOS TÉCNICOS & DIRETRIZES DE AERONAVEGABILIDADE (DA/AD/SB)
  // Regulamentos: RBAC 145.109, IS 145.109-001, I 001-02, I 001-03, I 001-24, IS 39-001A
  // ===========================================================================
  private cartasConcessao: CartaConcessaoManuais[] = [...INITIAL_CARTAS_CONCESSAO];
  private publicacoes: PublicacaoTecnicaF001_02_1[] = [...INITIAL_PUBLICACOES];
  private ciencias: CienciaCorpoTecnicoF001_02_2[] = [...INITIAL_CIENCIAS];
  private fcdas: FCDAF001_03_2[] = [...INITIAL_FCDAS];
  private monitoramentos: MonitoramentoAgencia[] = [...INITIAL_MONITORAMENTOS];

  private nextCartaId = 4;
  private nextPublicacaoId = 9;
  private nextCienciaId = 4;
  private nextFcdaId = 5;

  // --- CARTAS DE CONCESSÃO DE MANUAIS (IS 145.109-001 / I 001-02) ---
  public getCartasConcessao(): CartaConcessaoManuais[] {
    return this.cartasConcessao.map((c) => {
      const resp = this.tecnicos.find((t) => t.id_tecnico === c.id_responsavel);
      return {
        ...c,
        numero_carta: sanitizeNA(c.numero_carta) as string,
        operador_cliente: sanitizeNA(c.operador_cliente) as string,
        frotas_modelos: sanitizeNA(c.frotas_modelos) as string,
        manuais_concedidos: sanitizeNA(c.manuais_concedidos) as string,
        forma_acesso: sanitizeNA(c.forma_acesso) as string,
        observacoes: sanitizeNA(c.observacoes) as string,
        responsavel_nome: resp ? resp.nome_completo : 'N/A',
      };
    });
  }

  public getCartaConcessaoById(id: number): CartaConcessaoManuais | undefined {
    const list = this.getCartasConcessao();
    return list.find((c) => c.id_carta_concessao === id);
  }

  public createCartaConcessao(data: Partial<CartaConcessaoManuais>): CartaConcessaoManuais {
    const novaCarta: CartaConcessaoManuais = {
      id_carta_concessao: this.nextCartaId++,
      numero_carta: (sanitizeNA(data.numero_carta) as string) || `CC-IMP-${new Date().getFullYear()}-${String(this.nextCartaId).padStart(3, '0')}`,
      operador_cliente: (sanitizeNA(data.operador_cliente) as string) || 'N/A',
      frotas_modelos: (sanitizeNA(data.frotas_modelos) as string) || 'N/A',
      manuais_concedidos: (sanitizeNA(data.manuais_concedidos) as string) || 'AMM, IPC, MPD',
      data_emissao: data.data_emissao || new Date().toISOString().split('T')[0],
      data_validade: data.data_validade || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      forma_acesso: (sanitizeNA(data.forma_acesso) as string) || 'Portal institucional do cliente',
      status: data.status || 'VALIDA',
      id_responsavel: Number(data.id_responsavel) || 1,
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.cartasConcessao.push(novaCarta);
    return novaCarta;
  }

  public updateCartaConcessao(id: number, data: Partial<CartaConcessaoManuais>): CartaConcessaoManuais | undefined {
    const index = this.cartasConcessao.findIndex((c) => c.id_carta_concessao === id);
    if (index === -1) return undefined;

    const curr = this.cartasConcessao[index];
    this.cartasConcessao[index] = {
      ...curr,
      numero_carta: data.numero_carta !== undefined ? (sanitizeNA(data.numero_carta) as string) : curr.numero_carta,
      operador_cliente: data.operador_cliente !== undefined ? (sanitizeNA(data.operador_cliente) as string) : curr.operador_cliente,
      frotas_modelos: data.frotas_modelos !== undefined ? (sanitizeNA(data.frotas_modelos) as string) : curr.frotas_modelos,
      manuais_concedidos: data.manuais_concedidos !== undefined ? (sanitizeNA(data.manuais_concedidos) as string) : curr.manuais_concedidos,
      data_emissao: data.data_emissao || curr.data_emissao,
      data_validade: data.data_validade || curr.data_validade,
      forma_acesso: data.forma_acesso !== undefined ? (sanitizeNA(data.forma_acesso) as string) : curr.forma_acesso,
      status: data.status || curr.status,
      id_responsavel: data.id_responsavel !== undefined ? Number(data.id_responsavel) : curr.id_responsavel,
      observacoes: data.observacoes !== undefined ? (sanitizeNA(data.observacoes) as string) : curr.observacoes,
    };

    return this.getCartaConcessaoById(id);
  }

  // --- TABELA MESTRE DE PUBLICAÇÕES TÉCNICAS (Form F 001-02-1) ---
  public getPublicacoes(filtros?: {
    status?: string;
    tipo?: string;
    fabricante?: string;
    search?: string;
  }): PublicacaoTecnicaF001_02_1[] {
    let list = this.publicacoes.map((p) => {
      const resp = this.tecnicos.find((t) => t.id_tecnico === p.id_responsavel_atualizacao);
      const carta = p.id_carta_concessao ? this.cartasConcessao.find((c) => c.id_carta_concessao === p.id_carta_concessao) : undefined;
      const countCiencias = this.ciencias.filter((c) => c.id_publicacao === p.id_publicacao).length;

      return {
        ...p,
        codigo_documento: sanitizeNA(p.codigo_documento) as string,
        titulo: sanitizeNA(p.titulo) as string,
        fabricante: sanitizeNA(p.fabricante) as string,
        modelo_aplicavel: sanitizeNA(p.modelo_aplicavel) as string,
        ata_capitulo: sanitizeNA(p.ata_capitulo) as string,
        revisao_atual: sanitizeNA(p.revisao_atual) as string,
        link_acesso: sanitizeNA(p.link_acesso) as string,
        observacoes: sanitizeNA(p.observacoes) as string,
        responsavel_nome: resp ? resp.nome_completo : 'N/A',
        numero_carta_concessao: carta ? carta.numero_carta : p.numero_carta_concessao || 'N/A',
        ciencias_count: countCiencias,
      };
    });

    if (filtros?.status && filtros.status !== 'TODOS') {
      list = list.filter((p) => p.status === filtros.status);
    }
    if (filtros?.tipo && filtros.tipo !== 'TODOS') {
      list = list.filter((p) => p.tipo_documento === filtros.tipo);
    }
    if (filtros?.fabricante && filtros.fabricante !== 'TODOS') {
      list = list.filter((p) => p.fabricante.toLowerCase().includes(filtros.fabricante!.toLowerCase()));
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.codigo_documento.toLowerCase().includes(q) ||
          p.modelo_aplicavel.toLowerCase().includes(q) ||
          p.fabricante.toLowerCase().includes(q) ||
          p.revisao_atual.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getPublicacaoById(id: number): PublicacaoTecnicaF001_02_1 | undefined {
    const list = this.getPublicacoes();
    return list.find((p) => p.id_publicacao === id);
  }

  public createPublicacao(data: Partial<PublicacaoTecnicaF001_02_1>): PublicacaoTecnicaF001_02_1 {
    const hoje = new Date().toISOString().split('T')[0];
    const novaPub: PublicacaoTecnicaF001_02_1 = {
      id_publicacao: this.nextPublicacaoId++,
      codigo_documento: (sanitizeNA(data.codigo_documento) as string) || `PUB-${this.nextPublicacaoId}`,
      titulo: (sanitizeNA(data.titulo) as string) || 'Manual Técnico de Manutenção',
      tipo_documento: data.tipo_documento || 'AMM',
      fabricante: (sanitizeNA(data.fabricante) as string) || 'N/A',
      modelo_aplicavel: (sanitizeNA(data.modelo_aplicavel) as string) || 'N/A',
      ata_capitulo: (sanitizeNA(data.ata_capitulo) as string) || 'Geral',
      revisao_atual: (sanitizeNA(data.revisao_atual) as string) || 'Rev. 00',
      data_revisao: data.data_revisao || hoje,
      meio_distribuicao: data.meio_distribuicao || 'PORTAL_ONLINE',
      status: data.status || 'ATUALIZADO',
      data_ultima_verificacao: data.data_ultima_verificacao || hoje,
      id_responsavel_atualizacao: Number(data.id_responsavel_atualizacao) || 1,
      id_carta_concessao: data.id_carta_concessao ? Number(data.id_carta_concessao) : undefined,
      numero_carta_concessao: (sanitizeNA(data.numero_carta_concessao) as string) || 'N/A',
      link_acesso: (sanitizeNA(data.link_acesso) as string) || 'N/A',
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.publicacoes.push(novaPub);
    return novaPub;
  }

  public updatePublicacao(id: number, data: Partial<PublicacaoTecnicaF001_02_1>): PublicacaoTecnicaF001_02_1 | undefined {
    const index = this.publicacoes.findIndex((p) => p.id_publicacao === id);
    if (index === -1) return undefined;

    const curr = this.publicacoes[index];
    this.publicacoes[index] = {
      ...curr,
      codigo_documento: data.codigo_documento !== undefined ? (sanitizeNA(data.codigo_documento) as string) : curr.codigo_documento,
      titulo: data.titulo !== undefined ? (sanitizeNA(data.titulo) as string) : curr.titulo,
      tipo_documento: data.tipo_documento || curr.tipo_documento,
      fabricante: data.fabricante !== undefined ? (sanitizeNA(data.fabricante) as string) : curr.fabricante,
      modelo_aplicavel: data.modelo_aplicavel !== undefined ? (sanitizeNA(data.modelo_aplicavel) as string) : curr.modelo_aplicavel,
      ata_capitulo: data.ata_capitulo !== undefined ? (sanitizeNA(data.ata_capitulo) as string) : curr.ata_capitulo,
      revisao_atual: data.revisao_atual !== undefined ? (sanitizeNA(data.revisao_atual) as string) : curr.revisao_atual,
      data_revisao: data.data_revisao || curr.data_revisao,
      meio_distribuicao: data.meio_distribuicao || curr.meio_distribuicao,
      status: data.status || curr.status,
      data_ultima_verificacao: data.data_ultima_verificacao || curr.data_ultima_verificacao,
      id_responsavel_atualizacao: data.id_responsavel_atualizacao !== undefined ? Number(data.id_responsavel_atualizacao) : curr.id_responsavel_atualizacao,
      id_carta_concessao: data.id_carta_concessao !== undefined ? (data.id_carta_concessao ? Number(data.id_carta_concessao) : undefined) : curr.id_carta_concessao,
      numero_carta_concessao: data.numero_carta_concessao !== undefined ? (sanitizeNA(data.numero_carta_concessao) as string) : curr.numero_carta_concessao,
      link_acesso: data.link_acesso !== undefined ? (sanitizeNA(data.link_acesso) as string) : curr.link_acesso,
      observacoes: data.observacoes !== undefined ? (sanitizeNA(data.observacoes) as string) : curr.observacoes,
    };

    return this.getPublicacaoById(id);
  }

  public checarRevisaoPublicacao(
    id: number,
    data: {
      status: StatusPublicacao;
      revisao?: string;
      data_revisao?: string;
      id_responsavel: number;
      observacoes?: string;
    }
  ): PublicacaoTecnicaF001_02_1 | undefined {
    const pub = this.publicacoes.find((p) => p.id_publicacao === id);
    if (!pub) return undefined;

    const hoje = new Date().toISOString().split('T')[0];
    pub.status = data.status;
    pub.data_ultima_verificacao = hoje;
    pub.id_responsavel_atualizacao = Number(data.id_responsavel);
    if (data.revisao) pub.revisao_atual = sanitizeNA(data.revisao) as string;
    if (data.data_revisao) pub.data_revisao = data.data_revisao;
    if (data.observacoes) pub.observacoes = sanitizeNA(data.observacoes) as string;

    return this.getPublicacaoById(id);
  }

  // --- REGISTRO DE CIÊNCIA DO CORPO TÉCNICO (Form F 001-02-2) ---
  public getCiencias(id_publicacao?: number, id_tecnico?: number): CienciaCorpoTecnicoF001_02_2[] {
    let list = this.ciencias.map((c) => {
      const tec = this.tecnicos.find((t) => t.id_tecnico === c.id_tecnico);
      const pub = this.publicacoes.find((p) => p.id_publicacao === c.id_publicacao);
      return {
        ...c,
        observacoes: sanitizeNA(c.observacoes) as string,
        tecnico_nome: tec ? tec.nome_completo : 'N/A',
        tecnico_canac: tec ? tec.canac : 'N/A',
        tecnico_cargo: tec ? tec.cargo : 'N/A',
        publicacao_titulo: pub ? pub.titulo : 'N/A',
        publicacao_codigo: pub ? pub.codigo_documento : 'N/A',
      };
    });

    if (id_publicacao) {
      list = list.filter((c) => c.id_publicacao === id_publicacao);
    }
    if (id_tecnico) {
      list = list.filter((c) => c.id_tecnico === id_tecnico);
    }

    return list.sort((a, b) => new Date(b.data_ciencia).getTime() - new Date(a.data_ciencia).getTime());
  }

  public registrarCiencia(data: {
    id_publicacao: number;
    id_tecnico: number;
    revisao_cientificada?: string;
    observacoes?: string;
  }): CienciaCorpoTecnicoF001_02_2 {
    const pub = this.publicacoes.find((p) => p.id_publicacao === data.id_publicacao);
    if (!pub) throw new Error('Publicação técnica não encontrada.');

    const tec = this.tecnicos.find((t) => t.id_tecnico === data.id_tecnico);
    if (!tec) throw new Error('Técnico não encontrado.');

    const agora = new Date();
    const agoraStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')} ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}:${String(agora.getSeconds()).padStart(2, '0')}`;

    const novaCiencia: CienciaCorpoTecnicoF001_02_2 = {
      id_ciencia: this.nextCienciaId++,
      id_publicacao: pub.id_publicacao,
      id_tecnico: tec.id_tecnico,
      data_ciencia: agoraStr,
      revisao_cientificada: data.revisao_cientificada || pub.revisao_atual,
      status_ciencia: 'CONFIRMADA',
      observacoes: (sanitizeNA(data.observacoes) as string) || 'Ciência registrada no portal do CTM.',
      tecnico_nome: tec.nome_completo,
      tecnico_canac: tec.canac,
      tecnico_cargo: tec.cargo,
      publicacao_titulo: pub.titulo,
      publicacao_codigo: pub.codigo_documento,
    };

    this.ciencias.push(novaCiencia);
    return novaCiencia;
  }

  // --- EMISSÃO DE FCDA - FICHA DE CUMPRIMENTO DE DA/AD/SB (Form F 001-03-2 / IS 39-001A) ---
  public getFcdas(filtros?: {
    matricula?: string;
    aplicabilidade?: string;
    tipo_acao?: string;
    categoria?: string;
    search?: string;
    mes_ano?: string;
  }): FCDAF001_03_2[] {
    let list = this.fcdas.map((f) => {
      const executor = this.tecnicos.find((t) => t.id_tecnico === f.id_executor);
      const inspetor = this.tecnicos.find((t) => t.id_tecnico === f.id_inspetor);
      const rt = this.tecnicos.find((t) => t.id_tecnico === f.id_rt);

      return {
        ...f,
        numero_fcda: sanitizeNA(f.numero_fcda) as string,
        matricula_aeronave: sanitizeNA(f.matricula_aeronave) as string,
        msn_aeronave: sanitizeNA(f.msn_aeronave) as string,
        numero_diretriz: sanitizeNA(f.numero_diretriz) as string,
        vencimento_limite: sanitizeNA(f.vencimento_limite) as string,
        intervalo_repeticao: sanitizeNA(f.intervalo_repeticao) as string,
        justificativa_nao_aplicabilidade: sanitizeNA(f.justificativa_nao_aplicabilidade) as string,
        numero_sb_referencia: sanitizeNA(f.numero_sb_referencia) as string,
        documentos_referencia: sanitizeNA(f.documentos_referencia) as string,
        produto_fabricante: sanitizeNA(f.produto_fabricante) as string,
        produto_modelo: sanitizeNA(f.produto_modelo) as string,
        produto_pn: sanitizeNA(f.produto_pn) as string,
        produto_sn: sanitizeNA(f.produto_sn) as string,
        produto_vn: sanitizeNA(f.produto_vn) as string,
        tsn: sanitizeNA(f.tsn) as string,
        csn: sanitizeNA(f.csn) as string,
        tso: sanitizeNA(f.tso) as string,
        tsli: sanitizeNA(f.tsli) as string,
        csli: sanitizeNA(f.csli) as string,
        numero_os: sanitizeNA(f.numero_os) as string,
        proximo_vencimento_horas: sanitizeNA(f.proximo_vencimento_horas) as string,
        proximo_vencimento_ciclos: sanitizeNA(f.proximo_vencimento_ciclos) as string,
        proximo_vencimento_data: sanitizeNA(f.proximo_vencimento_data) as string,
        metodo_utilizado: sanitizeNA(f.metodo_utilizado) as string,
        resultado_acao: sanitizeNA(f.resultado_acao) as string,
        nome_operador: sanitizeNA(f.nome_operador) as string,
        representante_operador: sanitizeNA(f.representante_operador) as string,
        observacoes: sanitizeNA(f.observacoes) as string,
        executor_nome: executor ? executor.nome_completo : 'N/A',
        executor_canac: executor ? executor.canac : 'N/A',
        inspetor_nome: inspetor ? inspetor.nome_completo : 'N/A',
        inspetor_canac: inspetor ? inspetor.canac : 'N/A',
        rt_nome: rt ? rt.nome_completo : 'N/A',
        rt_canac: rt ? rt.canac : 'N/A',
      };
    });

    if (filtros?.matricula && filtros.matricula !== 'TODAS') {
      list = list.filter((f) => f.matricula_aeronave.toUpperCase() === filtros.matricula!.toUpperCase());
    }
    if (filtros?.aplicabilidade && filtros.aplicabilidade !== 'TODAS') {
      list = list.filter((f) => f.aplicabilidade === filtros.aplicabilidade);
    }
    if (filtros?.tipo_acao && filtros.tipo_acao !== 'TODOS') {
      list = list.filter((f) => f.tipo_acao === filtros.tipo_acao);
    }
    if (filtros?.categoria && filtros.categoria !== 'TODAS') {
      list = list.filter((f) => f.categoria_aplicacao === filtros.categoria);
    }
    if (filtros?.mes_ano) {
      list = list.filter((f) => f.data_cumprimento.startsWith(filtros.mes_ano!));
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      list = list.filter(
        (f) =>
          f.numero_fcda.toLowerCase().includes(q) ||
          f.matricula_aeronave.toLowerCase().includes(q) ||
          f.numero_diretriz.toLowerCase().includes(q) ||
          f.numero_os.toLowerCase().includes(q) ||
          f.numero_sb_referencia.toLowerCase().includes(q) ||
          f.produto_modelo.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.data_cumprimento).getTime() - new Date(a.data_cumprimento).getTime());
  }

  public getFcdaById(id: number): FCDAF001_03_2 | undefined {
    const list = this.getFcdas();
    return list.find((f) => f.id_fcda === id);
  }

  public createFcda(data: Partial<FCDAF001_03_2>): FCDAF001_03_2 {
    // VALIDAÇÃO CRÍTICA DE INTEGRIDADE REGULAMENTAR (IS 39-001A / MOMQ):
    if (data.aplicabilidade === 'NAO_APLICAVEL') {
      const just = data.justificativa_nao_aplicabilidade?.trim() || '';
      if (!just || just === 'N/A' || just.length < 15) {
        throw new Error(
          'BLOQUEIO REGULAMENTAR (IS 39-001A / MOMQ): Para Diretrizes marcadas como NÃO-APLICÁVEL, é ESTRITAMENTE OBRIGATÓRIO informar a Justificativa Técnica circunstanciada (especificando P/N, S/N, modificação ausente ou configuração não afetada).'
        );
      }
    }

    const agora = new Date();
    const ano = agora.getFullYear();
    const numFCDA = (sanitizeNA(data.numero_fcda) as string) !== 'N/A' && data.numero_fcda
      ? data.numero_fcda
      : `FCDA-${ano}-${String(this.nextFcdaId).padStart(4, '0')}`;

    const novaFcda: FCDAF001_03_2 = {
      id_fcda: this.nextFcdaId++,
      numero_fcda: numFCDA,
      matricula_aeronave: ((sanitizeNA(data.matricula_aeronave) as string) || 'PR-IMP').toUpperCase(),
      msn_aeronave: (sanitizeNA(data.msn_aeronave) as string) || 'N/A',
      numero_diretriz: (sanitizeNA(data.numero_diretriz) as string) || 'N/A',
      data_efetividade: data.data_efetividade || agora.toISOString().split('T')[0],
      vencimento_limite: (sanitizeNA(data.vencimento_limite) as string) || 'N/A',
      categoria_aplicacao: data.categoria_aplicacao || 'AERONAVE',
      tipo_acao: data.tipo_acao || 'TERMINAL',
      intervalo_repeticao: data.tipo_acao === 'REPETITIVA' ? ((sanitizeNA(data.intervalo_repeticao) as string) || 'Conforme AD') : 'N/A',
      aplicabilidade: data.aplicabilidade || 'APLICAVEL',
      justificativa_nao_aplicabilidade:
        data.aplicabilidade === 'NAO_APLICAVEL'
          ? (sanitizeNA(data.justificativa_nao_aplicabilidade) as string)
          : 'N/A',
      numero_sb_referencia: (sanitizeNA(data.numero_sb_referencia) as string) || 'N/A',
      documentos_referencia: (sanitizeNA(data.documentos_referencia) as string) || 'N/A',
      produto_fabricante: (sanitizeNA(data.produto_fabricante) as string) || 'N/A',
      produto_modelo: (sanitizeNA(data.produto_modelo) as string) || 'N/A',
      produto_pn: (sanitizeNA(data.produto_pn) as string) || 'N/A',
      produto_sn: (sanitizeNA(data.produto_sn) as string) || 'N/A',
      produto_vn: (sanitizeNA(data.produto_vn) as string) || 'N/A',
      tsn: (sanitizeNA(data.tsn) as string) || 'N/A',
      csn: (sanitizeNA(data.csn) as string) || 'N/A',
      tso: (sanitizeNA(data.tso) as string) || 'N/A',
      tsli: (sanitizeNA(data.tsli) as string) || 'N/A',
      csli: (sanitizeNA(data.csli) as string) || 'N/A',
      data_cumprimento: data.data_cumprimento || agora.toISOString().split('T')[0],
      numero_os: (sanitizeNA(data.numero_os) as string) || `OS-${ano}-${Math.floor(100 + Math.random() * 900)}`,
      proximo_vencimento_horas: data.tipo_acao === 'REPETITIVA' ? (sanitizeNA(data.proximo_vencimento_horas) as string) : 'N/A',
      proximo_vencimento_ciclos: data.tipo_acao === 'REPETITIVA' ? (sanitizeNA(data.proximo_vencimento_ciclos) as string) : 'N/A',
      proximo_vencimento_data: data.tipo_acao === 'REPETITIVA' ? (sanitizeNA(data.proximo_vencimento_data) as string) : 'N/A',
      metodo_utilizado: (sanitizeNA(data.metodo_utilizado) as string) || 'Cumprimento realizado conforme instruções do fabricante.',
      resultado_acao: (sanitizeNA(data.resultado_acao) as string) || 'Aprovado para retorno ao serviço.',
      id_executor: Number(data.id_executor) || 5,
      id_inspetor: Number(data.id_inspetor) || 3,
      id_rt: Number(data.id_rt) || 1,
      nome_operador: (sanitizeNA(data.nome_operador) as string) || 'Impacto Linhas Aéreas',
      representante_operador: (sanitizeNA(data.representante_operador) as string) || 'N/A',
      status_fcda: data.status_fcda || 'CONCLUIDA',
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.fcdas.push(novaFcda);
    return this.getFcdaById(novaFcda.id_fcda)!;
  }

  public updateFcda(id: number, data: Partial<FCDAF001_03_2>): FCDAF001_03_2 | undefined {
    const index = this.fcdas.findIndex((f) => f.id_fcda === id);
    if (index === -1) return undefined;

    if (data.aplicabilidade === 'NAO_APLICAVEL') {
      const just = data.justificativa_nao_aplicabilidade?.trim() || '';
      if (!just || just === 'N/A' || just.length < 15) {
        throw new Error(
          'BLOQUEIO REGULAMENTAR (IS 39-001A / MOMQ): Para Diretrizes marcadas como NÃO-APLICÁVEL, é ESTRITAMENTE OBRIGATÓRIO informar a Justificativa Técnica circunstanciada.'
        );
      }
    }

    const curr = this.fcdas[index];
    this.fcdas[index] = {
      ...curr,
      numero_diretriz: data.numero_diretriz !== undefined ? (sanitizeNA(data.numero_diretriz) as string) : curr.numero_diretriz,
      matricula_aeronave: data.matricula_aeronave !== undefined ? (sanitizeNA(data.matricula_aeronave) as string).toUpperCase() : curr.matricula_aeronave,
      msn_aeronave: data.msn_aeronave !== undefined ? (sanitizeNA(data.msn_aeronave) as string) : curr.msn_aeronave,
      data_efetividade: data.data_efetividade || curr.data_efetividade,
      vencimento_limite: data.vencimento_limite !== undefined ? (sanitizeNA(data.vencimento_limite) as string) : curr.vencimento_limite,
      categoria_aplicacao: data.categoria_aplicacao || curr.categoria_aplicacao,
      tipo_acao: data.tipo_acao || curr.tipo_acao,
      intervalo_repeticao: data.intervalo_repeticao !== undefined ? (sanitizeNA(data.intervalo_repeticao) as string) : curr.intervalo_repeticao,
      aplicabilidade: data.aplicabilidade || curr.aplicabilidade,
      justificativa_nao_aplicabilidade:
        data.aplicabilidade === 'NAO_APLICAVEL'
          ? (sanitizeNA(data.justificativa_nao_aplicabilidade) as string)
          : (data.justificativa_nao_aplicabilidade !== undefined ? (sanitizeNA(data.justificativa_nao_aplicabilidade) as string) : curr.justificativa_nao_aplicabilidade),
      numero_sb_referencia: data.numero_sb_referencia !== undefined ? (sanitizeNA(data.numero_sb_referencia) as string) : curr.numero_sb_referencia,
      documentos_referencia: data.documentos_referencia !== undefined ? (sanitizeNA(data.documentos_referencia) as string) : curr.documentos_referencia,
      produto_fabricante: data.produto_fabricante !== undefined ? (sanitizeNA(data.produto_fabricante) as string) : curr.produto_fabricante,
      produto_modelo: data.produto_modelo !== undefined ? (sanitizeNA(data.produto_modelo) as string) : curr.produto_modelo,
      produto_pn: data.produto_pn !== undefined ? (sanitizeNA(data.produto_pn) as string) : curr.produto_pn,
      produto_sn: data.produto_sn !== undefined ? (sanitizeNA(data.produto_sn) as string) : curr.produto_sn,
      produto_vn: data.produto_vn !== undefined ? (sanitizeNA(data.produto_vn) as string) : curr.produto_vn,
      tsn: data.tsn !== undefined ? (sanitizeNA(data.tsn) as string) : curr.tsn,
      csn: data.csn !== undefined ? (sanitizeNA(data.csn) as string) : curr.csn,
      tso: data.tso !== undefined ? (sanitizeNA(data.tso) as string) : curr.tso,
      tsli: data.tsli !== undefined ? (sanitizeNA(data.tsli) as string) : curr.tsli,
      csli: data.csli !== undefined ? (sanitizeNA(data.csli) as string) : curr.csli,
      data_cumprimento: data.data_cumprimento || curr.data_cumprimento,
      numero_os: data.numero_os !== undefined ? (sanitizeNA(data.numero_os) as string) : curr.numero_os,
      proximo_vencimento_horas: data.proximo_vencimento_horas !== undefined ? (sanitizeNA(data.proximo_vencimento_horas) as string) : curr.proximo_vencimento_horas,
      proximo_vencimento_ciclos: data.proximo_vencimento_ciclos !== undefined ? (sanitizeNA(data.proximo_vencimento_ciclos) as string) : curr.proximo_vencimento_ciclos,
      proximo_vencimento_data: data.proximo_vencimento_data !== undefined ? (sanitizeNA(data.proximo_vencimento_data) as string) : curr.proximo_vencimento_data,
      metodo_utilizado: data.metodo_utilizado !== undefined ? (sanitizeNA(data.metodo_utilizado) as string) : curr.metodo_utilizado,
      resultado_acao: data.resultado_acao !== undefined ? (sanitizeNA(data.resultado_acao) as string) : curr.resultado_acao,
      id_executor: data.id_executor !== undefined ? Number(data.id_executor) : curr.id_executor,
      id_inspetor: data.id_inspetor !== undefined ? Number(data.id_inspetor) : curr.id_inspetor,
      id_rt: data.id_rt !== undefined ? Number(data.id_rt) : curr.id_rt,
      nome_operador: data.nome_operador !== undefined ? (sanitizeNA(data.nome_operador) as string) : curr.nome_operador,
      representante_operador: data.representante_operador !== undefined ? (sanitizeNA(data.representante_operador) as string) : curr.representante_operador,
      status_fcda: data.status_fcda || curr.status_fcda,
      observacoes: data.observacoes !== undefined ? (sanitizeNA(data.observacoes) as string) : curr.observacoes,
    };

    return this.getFcdaById(id);
  }

  // --- LISTAGEM MENSAL DE MANDATÓRIAS CUMPRIDAS (Form F 001-03-3 / I 001-24) ---
  public getRelatorioMandatoriasMensal(mes_ano?: string, prefixo?: string): RelatorioMandatoriasF001_03_3 {
    const agora = new Date();
    const targetMesAno = mes_ano || `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;

    const [anoStr, mesStr] = targetMesAno.split('-');
    const mesesNomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mesIndex = Number(mesStr) - 1;
    const nomeMes = mesesNomes[mesIndex] || mesStr;

    let fcdasFiltradas = this.getFcdas({ mes_ano: targetMesAno });
    if (prefixo && prefixo !== 'TODAS') {
      fcdasFiltradas = fcdasFiltradas.filter((f) => f.matricula_aeronave.toUpperCase() === prefixo.toUpperCase());
    }

    const rt = this.tecnicos.find((t) => t.cargo === 'RT') || this.tecnicos[0];
    const pcp = this.tecnicos.find((t) => t.cargo === 'PCP') || this.tecnicos[1];

    const itens: RelatorioMandatoriasItemF001_03_3[] = fcdasFiltradas.map((f, idx) => ({
      numero_item: idx + 1,
      numero_mandatorio: f.numero_diretriz,
      assunto: `${f.categoria_aplicacao}: ${f.produto_modelo} - ${f.metodo_utilizado.substring(0, 75)}...`,
      numero_os: f.numero_os,
      prefixo_aeronave: f.matricula_aeronave,
      msn: f.msn_aeronave,
      data_execucao: f.data_cumprimento,
      tipo_acao: f.tipo_acao,
      categoria: f.categoria_aplicacao,
      proximo_vencimento:
        f.tipo_acao === 'REPETITIVA'
          ? f.proximo_vencimento_horas !== 'N/A'
            ? f.proximo_vencimento_horas
            : f.proximo_vencimento_data !== 'N/A'
            ? f.proximo_vencimento_data
            : f.intervalo_repeticao
          : 'TERMINAL',
      responsavel_tecnico: f.rt_nome || rt?.nome_completo || 'Rodrigo Albuquerque (RT)',
      aplicabilidade: f.aplicabilidade === 'APLICAVEL' ? 'APLICÁVEL' : 'NÃO APLICÁVEL (JUSTIFICADA)',
    }));

    return {
      mes_ano: targetMesAno,
      mes_ano_formatado: `${nomeMes} / ${anoStr}`,
      data_geracao: agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR'),
      responsavel_elaboracao: pcp ? `${pcp.nome_completo} (CANAC: ${pcp.canac})` : 'PCP / CTM Impacto Aviation',
      responsavel_aprovacao_rt: rt ? `${rt.nome_completo} (CANAC: ${rt.canac})` : 'Responsável Técnico',
      total_mandatorias: itens.length,
      itens,
    };
  }

  // --- CENTRAL DE MONITORAMENTO DE AGÊNCIAS (ANAC, FAA, EASA) ---
  public getMonitoramentoAgencias(): MonitoramentoAgencia[] {
    return this.monitoramentos.map((m) => ({
      ...m,
      observacoes: sanitizeNA(m.observacoes) as string,
    }));
  }

  public registrarChecagemAgencia(
    agencia: 'ANAC' | 'FAA' | 'EASA',
    id_tecnico: number,
    observacoes?: string
  ): MonitoramentoAgencia | undefined {
    const item = this.monitoramentos.find((m) => m.agencia === agencia);
    if (!item) return undefined;

    const tec = this.tecnicos.find((t) => t.id_tecnico === id_tecnico);
    const agora = new Date();
    const agoraStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')} ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    item.ultima_checagem = agoraStr;
    item.responsavel_checagem = tec ? `${tec.nome_completo} (${tec.cargo})` : 'Inspetor de Qualidade';
    item.status_monitoramento = 'EM_DIA';
    if (observacoes) item.observacoes = sanitizeNA(observacoes) as string;

    return item;
  }

  // --- ESTATÍSTICAS DO CTM ---
  public getCtmStats(): CtmStats {
    const pubs = this.getPublicacoes();
    const cartas = this.getCartasConcessao();
    const fcdas = this.getFcdas();
    const ciencias = this.getCiencias();

    return {
      total_publicacoes: pubs.length,
      publicacoes_atualizadas: pubs.filter((p) => p.status === 'ATUALIZADO').length,
      publicacoes_a_revisar: pubs.filter((p) => p.status === 'A_REVISAR' || p.status === 'OBSOLETO').length,
      total_cartas_concessao: cartas.length,
      cartas_ativas: cartas.filter((c) => c.status === 'VALIDA').length,
      total_fcdas: fcdas.length,
      fcdas_aplicaveis: fcdas.filter((f) => f.aplicabilidade === 'APLICAVEL').length,
      fcdas_nao_aplicaveis: fcdas.filter((f) => f.aplicabilidade === 'NAO_APLICAVEL').length,
      fcdas_repetitivas: fcdas.filter((f) => f.tipo_acao === 'REPETITIVA').length,
      total_ciencias: ciencias.length,
    };
  }

  // ===========================================================================
  // PARTE 4: WORKFLOW COMERCIAL, PCP E ABERTURA DE ORDEM DE SERVIÇO (MOMQ 6.3 / I 001-09)
  // ===========================================================================

  // --- ESPECIFICAÇÕES OPERATIVAS (EO) ---
  public getModelosEO(base?: BaseSigla): ModeloHomologadoEO[] {
    if (!base || base === ('TODAS' as any)) return this.modelosEO;
    return this.modelosEO.filter((m) => m.bases_homologadas.includes(base));
  }

  public checarElegibilidadeEO(modelo: string, base: BaseSigla): { homologado: boolean; motivo?: string } {
    const modTrim = (modelo || '').trim().toLowerCase();
    const item = this.modelosEO.find(
      (m) =>
        m.codigo_modelo.toLowerCase() === modTrim ||
        modTrim.includes(m.codigo_modelo.toLowerCase()) ||
        m.descricao.toLowerCase().includes(modTrim)
    );

    if (!item) {
      const itemParcial = this.modelosEO.find((m) => {
        const palavras = m.codigo_modelo.toLowerCase().split(' ');
        return palavras.some((p) => p.length > 2 && modTrim.includes(p));
      });

      if (itemParcial) {
        const homologado = itemParcial.bases_homologadas.includes(base);
        return {
          homologado,
          motivo: homologado
            ? undefined
            : `Aeronave modelo '${modelo}' (família ${itemParcial.familia}) não consta nas Especificações Operativas (EO) da Base ${base}. Homologado apenas em: ${itemParcial.bases_homologadas.join(', ')}.`,
        };
      }

      return {
        homologado: false,
        motivo: `Modelo de aeronave '${modelo}' não localizado nas Especificações Operativas (EO) homologadas pela ANAC/EASA para a Impacto Aviation.`,
      };
    }

    const homologado = item.bases_homologadas.includes(base);
    return {
      homologado,
      motivo: homologado
        ? undefined
        : `Aeronave modelo '${item.codigo_modelo}' não consta nas Especificações Operativas (EO) da Base ${base}. Homologado exclusivamente em: ${item.bases_homologadas.join(', ')}.`,
    };
  }

  // --- CARTA DE CONCESSÃO DE MANUAIS (IS 145.109-001) ---
  public checarCartaConcessao(operador: string, modelo: string): { ativa: boolean; carta?: CartaConcessaoManuais; motivo?: string } {
    const opTrim = (operador || '').trim().toLowerCase();
    const modTrim = (modelo || '').trim().toLowerCase();
    const hojeStr = new Date().toISOString().split('T')[0];

    const cartas = this.getCartasConcessao();
    const carta = cartas.find((c) => {
      const matchOp =
        c.operador_cliente.toLowerCase().includes(opTrim) ||
        opTrim.includes(c.operador_cliente.toLowerCase()) ||
        (opTrim.includes('latam') && c.operador_cliente.toLowerCase().includes('tam')) ||
        (opTrim.includes('voepass') && c.operador_cliente.toLowerCase().includes('voepass')) ||
        (opTrim.includes('azul') && c.operador_cliente.toLowerCase().includes('azul')) ||
        (opTrim.includes('gol') && c.operador_cliente.toLowerCase().includes('gol')) ||
        (opTrim.includes('helisul') && c.operador_cliente.toLowerCase().includes('helisul'));

      if (!matchOp) return false;

      const frotas = c.frotas_modelos.toLowerCase();
      const matchFrota =
        frotas.includes(modTrim) ||
        (modTrim.includes('atr') && frotas.includes('atr')) ||
        (modTrim.includes('a320') && frotas.includes('a320')) ||
        (modTrim.includes('737') && frotas.includes('737')) ||
        (modTrim.includes('caravan') && frotas.includes('caravan')) ||
        (modTrim.includes('king') && frotas.includes('king'));

      return matchFrota;
    });

    if (!carta) {
      return {
        ativa: false,
        motivo: `Ausência de Carta de Concessão de Manuais Técnica Ativa (IS 145.109-001) entre a Impacto Aviation e o operador '${operador}' para a frota '${modelo}'.`,
      };
    }

    if (carta.status !== 'VALIDA') {
      return {
        ativa: false,
        carta,
        motivo: `Carta de Concessão de Manuais nº ${carta.numero_carta} encontra-se com status '${carta.status}'. Requer renovação técnica prévia.`,
      };
    }

    if (carta.data_validade < hojeStr) {
      return {
        ativa: false,
        carta,
        motivo: `Carta de Concessão de Manuais nº ${carta.numero_carta} expirou em ${carta.data_validade}. Requer prorrogação contratual.`,
      };
    }

    return {
      ativa: true,
      carta,
    };
  }

  // --- SOLICITAÇÕES COMERCIAIS & WORKFLOW ---
  public getSolicitacoesComerciais(filtros?: {
    status?: string;
    base?: string;
    search?: string;
  }): SolicitacaoComercial[] {
    let list = this.solicitacoes.map((s) => ({
      ...s,
      operador_cliente: sanitizeNA(s.operador_cliente) as string,
      contato_responsavel: sanitizeNA(s.contato_responsavel) as string,
      email_contato: sanitizeNA(s.email_contato) as string,
      telefone_contato: sanitizeNA(s.telefone_contato) as string,
      matricula_aeronave: sanitizeNA(s.matricula_aeronave) as string,
      modelo_aeronave: sanitizeNA(s.modelo_aeronave) as string,
      msn_aeronave: sanitizeNA(s.msn_aeronave) as string,
      escopo_servico: sanitizeNA(s.escopo_servico) as string,
      observacoes: sanitizeNA(s.observacoes) as string,
    }));

    if (filtros?.status && filtros.status !== 'TODOS') {
      list = list.filter((s) => s.status === filtros.status);
    }
    if (filtros?.base && filtros.base !== 'TODAS') {
      list = list.filter((s) => s.base_solicitada === filtros.base);
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.numero_solicitacao.toLowerCase().includes(q) ||
          s.operador_cliente.toLowerCase().includes(q) ||
          s.matricula_aeronave.toLowerCase().includes(q) ||
          s.modelo_aeronave.toLowerCase().includes(q) ||
          s.escopo_servico.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime());
  }

  public getSolicitacaoComercialById(id: number): SolicitacaoComercial | undefined {
    return this.solicitacoes.find((s) => s.id_solicitacao === id);
  }

  public createSolicitacaoComercial(data: Partial<SolicitacaoComercial>): SolicitacaoComercial {
    const agora = new Date();
    const dataSol = data.data_solicitacao || agora.toISOString();
    const dataInicioPrev = data.data_hora_prevista_inicio || new Date(agora.getTime() + 48 * 3600 * 1000).toISOString();
    const dataFimPrev = data.data_hora_prevista_fim || new Date(agora.getTime() + 60 * 3600 * 1000).toISOString();

    const diffMs = new Date(dataInicioPrev).getTime() - new Date(dataSol).getTime();
    const horasAntecedencia = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
    const antecedencia_valida_24h = horasAntecedencia >= 24;

    const baseSol: BaseSigla = (data.base_solicitada as BaseSigla) || 'GRU';
    const modelo = (data.modelo_aeronave || '').trim();
    const operador = (data.operador_cliente || '').trim();

    const checagemEO = this.checarElegibilidadeEO(modelo, baseSol);
    const checagemCarta = this.checarCartaConcessao(operador, modelo);

    let statusInicial: any = 'NOVA';
    let motivoRecusa: string | undefined;

    if (!checagemEO.homologado) {
      statusInicial = 'RECUSADA_REPROVADA';
      motivoRecusa = checagemEO.motivo;
    } else if (!checagemCarta.ativa) {
      motivoRecusa = checagemCarta.motivo;
    }

    const seq = String(this.nextSolicitacaoId).padStart(4, '0');
    const ano = agora.getFullYear();
    const numero_solicitacao = `SOL-${ano}-${seq}`;

    const nova: SolicitacaoComercial = {
      id_solicitacao: this.nextSolicitacaoId++,
      numero_solicitacao,
      operador_cliente: (sanitizeNA(operador) as string) || 'N/A',
      contato_responsavel: (sanitizeNA(data.contato_responsavel) as string) || 'N/A',
      email_contato: (sanitizeNA(data.email_contato) as string) || 'N/A',
      telefone_contato: (sanitizeNA(data.telefone_contato) as string) || 'N/A',
      matricula_aeronave: (sanitizeNA(data.matricula_aeronave) as string) || 'N/A',
      modelo_aeronave: (sanitizeNA(modelo) as string) || 'N/A',
      msn_aeronave: (sanitizeNA(data.msn_aeronave) as string) || 'N/A',
      base_solicitada: baseSol,
      data_solicitacao: dataSol,
      data_hora_prevista_inicio: dataInicioPrev,
      data_hora_prevista_fim: dataFimPrev,
      horas_antecedencia: horasAntecedencia,
      antecedencia_valida_24h,
      alerta_antecedencia: !antecedencia_valida_24h
        ? `ALERTA REGULATÓRIO: Prazo de antecedência de ${horasAntecedencia}h é inferior ao mínimo obrigatório de 24h (MOMQ 6.3). Requer autorização especial da Gerência de Operações / PCP.`
        : undefined,
      elegivel_eo_base: checagemEO.homologado,
      motivo_incompatibilidade_eo: checagemEO.motivo,
      possui_carta_concessao_ativa: checagemCarta.ativa,
      numero_carta_concessao: checagemCarta.carta?.numero_carta || 'N/A',
      motivo_incompatibilidade_manuais: checagemCarta.motivo,
      escopo_servico: (sanitizeNA(data.escopo_servico) as string) || 'N/A',
      diretrizes_mandatorias_solicitadas: data.diretrizes_mandatorias_solicitadas || [],
      status: data.status || statusInicial,
      observacoes: (sanitizeNA(data.observacoes || motivoRecusa) as string) || 'N/A',
    };

    this.solicitacoes.push(nova);
    return nova;
  }

  public updateSolicitacaoComercial(id: number, data: Partial<SolicitacaoComercial>): SolicitacaoComercial | undefined {
    const item = this.solicitacoes.find((s) => s.id_solicitacao === id);
    if (!item) return undefined;

    if (data.status !== undefined) item.status = data.status;
    if (data.id_ordem_servico_gerada !== undefined) item.id_ordem_servico_gerada = data.id_ordem_servico_gerada;
    if (data.numero_os_gerada !== undefined) item.numero_os_gerada = data.numero_os_gerada;
    if (data.observacoes !== undefined) item.observacoes = sanitizeNA(data.observacoes) as string;
    if (data.escopo_servico !== undefined) item.escopo_servico = sanitizeNA(data.escopo_servico) as string;

    return item;
  }

  // --- ENGINE DE VALIDAÇÃO DE ABERTURA DE OS (AUDITORIA ANTECIPADA) ---
  public validarElegibilidadeOS(dados: {
    modelo_aeronave: string;
    base_executante: BaseSigla;
    operador: string;
    data_hora_abertura?: string;
    data_hora_prevista_inicio?: string;
    id_mecanico_executor?: number;
    id_inspetor_aprs?: number;
    ids_ferramentas?: number[];
  }): ValidacaoAberturaOSResult {
    const motivos_bloqueio: string[] = [];
    const avisos: string[] = [];

    // 1. Checagem de Antecedência (mínimo 24h - MOMQ 6.3)
    const agora = new Date();
    const dataReferenciaAbertura = dados.data_hora_abertura ? new Date(dados.data_hora_abertura) : agora;
    const dataInicioPrevisto = dados.data_hora_prevista_inicio ? new Date(dados.data_hora_prevista_inicio) : agora;
    const diffMs = dataInicioPrevisto.getTime() - dataReferenciaAbertura.getTime();
    const horasAntecedencia = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
    const antecedencia_ok = horasAntecedencia >= 24;

    if (!antecedencia_ok) {
      motivos_bloqueio.push(
        `BLOQUEIO DE ANTECEDÊNCIA (MOMQ 6.3): Prazo de antecedência calculado em ${horasAntecedencia}h é inferior ao mínimo obrigatório de 24h entre a abertura e o início previsto dos serviços. Bloqueio preventivo ativado.`
      );
    }

    // 2. Checagem de Especificações Operativas (EO) da Base
    const checagemEO = this.checarElegibilidadeEO(dados.modelo_aeronave, dados.base_executante);
    if (!checagemEO.homologado) {
      motivos_bloqueio.push(`BLOQUEIO EO: ${checagemEO.motivo}`);
    }

    // 3. Checagem de Carta de Concessão de Manuais (IS 145.109-001)
    const checagemCarta = this.checarCartaConcessao(dados.operador, dados.modelo_aeronave);
    if (!checagemCarta.ativa) {
      motivos_bloqueio.push(`BLOQUEIO MANUAIS: ${checagemCarta.motivo}`);
    }

    // 4. Checagem do Mecânico Executor
    let mecanico_apto = true;
    let mecanico_motivos_bloqueio: string[] | undefined;
    if (dados.id_mecanico_executor) {
      const audMec = this.calcularAuditoriaQualificacao(dados.id_mecanico_executor);
      mecanico_apto = audMec.is_apto;
      if (!audMec.is_apto) {
        mecanico_motivos_bloqueio = audMec.motivos_bloqueio;
        motivos_bloqueio.push(
          `BLOQUEIO MECÂNICO: Mecânico Executor (ID: ${dados.id_mecanico_executor}) não está apto: ${audMec.motivos_bloqueio.join('; ')}`
        );
      }
    }

    // 5. Checagem do Inspetor APRS (Trava Regra 6 & Form F 001-03)
    let inspetor_aprs_valido = true;
    let inspetor_motivos_bloqueio: string[] | undefined;
    if (dados.id_inspetor_aprs) {
      const audInsp = this.calcularAuditoriaQualificacao(dados.id_inspetor_aprs);
      inspetor_aprs_valido = audInsp.is_apto && audInsp.aprovado_aprs;
      if (!inspetor_aprs_valido) {
        inspetor_motivos_bloqueio = audInsp.motivos_bloqueio;
        const msg = !audInsp.aprovado_aprs
          ? 'Inspetor designado não possui Form F 001-03 ativo com função APRS homologada e assinada pelo RT.'
          : audInsp.motivos_bloqueio.join('; ');
        motivos_bloqueio.push(`BLOQUEIO INSPETOR APRS: ${msg}`);
      }
    }

    // 6. Checagem de Ferramental PME e Trava de Quarentena / Vencimento
    let ferramentas_aptas = true;
    const ferramentas_bloqueadas_detalhes: Array<{
      id_ferramenta: number;
      descricao: string;
      pn: string;
      motivo: string;
    }> = [];

    if (dados.ids_ferramentas && dados.ids_ferramentas.length > 0) {
      for (const idF of dados.ids_ferramentas) {
        const tool = this.getFerramentaById(idF);
        if (!tool) continue;

        if (tool.status === 'QUARENTENA' || tool.registro_quarentena_ativo) {
          ferramentas_aptas = false;
          ferramentas_bloqueadas_detalhes.push({
            id_ferramenta: tool.id_ferramenta,
            descricao: tool.descricao,
            pn: tool.part_number,
            motivo: `Ferramenta em Quarentena ativa (Tag Vermelha / Não Utilizável). Impede vínculo à Ordem de Serviço conforme Parte 2 e MOMQ.`,
          });
        } else if (tool.calibracao_vencida) {
          ferramentas_aptas = false;
          ferramentas_bloqueadas_detalhes.push({
            id_ferramenta: tool.id_ferramenta,
            descricao: tool.descricao,
            pn: tool.part_number,
            motivo: `Calibração metrológica expirada. Proibido o uso em manutenção aeronáutica (Regra #2).`,
          });
        } else if (tool.status === 'EM_CALIBRACAO') {
          ferramentas_aptas = false;
          ferramentas_bloqueadas_detalhes.push({
            id_ferramenta: tool.id_ferramenta,
            descricao: tool.descricao,
            pn: tool.part_number,
            motivo: `Ferramenta enviada para calibração externa em laboratório metrológico credenciado. Indisponível.`,
          });
        }
      }

      if (!ferramentas_aptas) {
        motivos_bloqueio.push(
          `BLOQUEIO FERRAMENTAL: Uma ou mais ferramentas requeridas estão em Quarentena ou com Calibração Vencida (${ferramentas_bloqueadas_detalhes.map((f) => f.pn).join(', ')}).`
        );
      }
    }

    const pode_abrir = motivos_bloqueio.length === 0;

    return {
      pode_abrir,
      motivos_bloqueio,
      avisos,
      antecedencia_ok,
      horas_antecedencia: horasAntecedencia,
      base_homologada_eo: checagemEO.homologado,
      carta_concessao_ativa: checagemCarta.ativa,
      carta_concessao_numero: checagemCarta.carta?.numero_carta,
      mecanico_apto,
      mecanico_motivos_bloqueio,
      inspetor_aprs_valido,
      inspetor_motivos_bloqueio,
      ferramentas_aptas,
      ferramentas_bloqueadas_detalhes,
    };
  }

  // --- ORDENS DE SERVIÇO (Form F 001-09-2) ---
  public getOrdensServico(filtros?: {
    status?: string;
    base?: string;
    matricula?: string;
    search?: string;
  }): OrdemServicoF001_09_2[] {
    let list = this.ordensServico.map((os) => ({
      ...os,
      campo_01_numero_os: sanitizeNA(os.campo_01_numero_os) as string,
      campo_02_matricula: sanitizeNA(os.campo_02_matricula) as string,
      campo_03_modelo: sanitizeNA(os.campo_03_modelo) as string,
      campo_04_msn: sanitizeNA(os.campo_04_msn) as string,
      campo_05_operador: sanitizeNA(os.campo_05_operador) as string,
      campo_09_tsn: sanitizeNA(os.campo_09_tsn) as string,
      campo_10_csn: sanitizeNA(os.campo_10_csn) as string,
      campo_11_escopo_servico: sanitizeNA(os.campo_11_escopo_servico) as string,
      campo_12_manuais_texto_formatado: sanitizeNA(os.campo_12_manuais_texto_formatado) as string,
      campo_13_ferramental_pme_texto: sanitizeNA(os.campo_13_ferramental_pme_texto) as string,
      campo_14_materiais_pecas_texto: sanitizeNA(os.campo_14_materiais_pecas_texto) as string,
      campo_16_testes_funcionais: sanitizeNA(os.campo_16_testes_funcionais) as string,
      mecanico_executor_nome: sanitizeNA(os.mecanico_executor_nome) as string,
      mecanico_executor_canac: sanitizeNA(os.mecanico_executor_canac) as string,
      inspetor_aprs_nome: sanitizeNA(os.inspetor_aprs_nome) as string,
      inspetor_aprs_canac: sanitizeNA(os.inspetor_aprs_canac) as string,
      rt_nome: sanitizeNA(os.rt_nome) as string,
      rt_canac: sanitizeNA(os.rt_canac) as string,
      representante_operador_nome: sanitizeNA(os.representante_operador_nome) as string,
      observacoes: sanitizeNA(os.observacoes) as string,
    }));

    if (filtros?.status && filtros.status !== 'TODOS') {
      list = list.filter((os) => os.status_os === filtros.status);
    }
    if (filtros?.base && filtros.base !== 'TODAS') {
      list = list.filter((os) => os.campo_06_base_executante === filtros.base);
    }
    if (filtros?.matricula && filtros.matricula !== 'TODAS') {
      list = list.filter((os) => os.campo_02_matricula.toUpperCase() === filtros.matricula?.toUpperCase());
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      list = list.filter(
        (os) =>
          os.numero_os.toLowerCase().includes(q) ||
          os.campo_02_matricula.toLowerCase().includes(q) ||
          os.campo_05_operador.toLowerCase().includes(q) ||
          os.campo_03_modelo.toLowerCase().includes(q) ||
          os.campo_11_escopo_servico.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.id_os - a.id_os);
  }

  public getOrdemServicoById(id: number): OrdemServicoF001_09_2 | undefined {
    return this.ordensServico.find((os) => os.id_os === id);
  }

  public createOrdemServico(data: Partial<OrdemServicoF001_09_2> & { ids_ferramentas_selecionadas?: number[] }): OrdemServicoF001_09_2 {
    const agora = new Date();
    const baseExec: BaseSigla = data.campo_06_base_executante || 'GRU';
    const modelo = (data.campo_03_modelo || '').trim();
    const operador = (data.campo_05_operador || '').trim();
    const matricula = (data.campo_02_matricula || '').trim().toUpperCase();

    // 1. Auditoria e Validação Prévia de Elegibilidade
    const validacao = this.validarElegibilidadeOS({
      modelo_aeronave: modelo,
      base_executante: baseExec,
      operador,
      data_hora_abertura: data.campo_07_data_abertura,
      id_mecanico_executor: data.id_mecanico_executor,
      id_inspetor_aprs: data.id_inspetor_aprs,
      ids_ferramentas: data.ids_ferramentas_selecionadas,
    });

    if (!validacao.pode_abrir) {
      throw new Error(
        `BLOQUEIO REGULATÓRIO DE ABERTURA DE OS: ${validacao.motivos_bloqueio.join(' | ')}`
      );
    }

    // 2. Geração automática do número sequencial da OS pelo PCP
    const anoAtual = agora.getFullYear();
    const seqOsStr = String(this.nextOsSeq++).padStart(4, '0');
    const numero_os = `OS-${anoAtual}-${seqOsStr}`;

    // 3. Resolução da Equipe Técnica
    const mecId = data.id_mecanico_executor ?? 4;
    const inspId = data.id_inspetor_aprs ?? 3;
    const mec = this.tecnicos.find((t) => t.id_tecnico === mecId);
    if (!mec) {
      throw new Error(`Mecânico Executor (ID: ${mecId}) não encontrado no cadastro técnico ativo.`);
    }
    const insp = this.tecnicos.find((t) => t.id_tecnico === inspId);
    if (!insp) {
      throw new Error(`Inspetor APRS (ID: ${inspId}) não encontrado no cadastro técnico ativo.`);
    }
    const rt = data.id_rt
      ? this.tecnicos.find((t) => t.id_tecnico === data.id_rt)
      : this.tecnicos.find((t) => t.cargo === 'RT');
    if (!rt) {
      throw new Error('Responsável Técnico (RT) não encontrado no cadastro técnico ativo.');
    }

    // 4. Resolução de Ferramental Selecionado
    const ferramentasAlocadas: FerramentaAlocadaOS[] = [];
    const nomesFerramentas: string[] = [];

    if (data.ids_ferramentas_selecionadas && data.ids_ferramentas_selecionadas.length > 0) {
      for (const idF of data.ids_ferramentas_selecionadas) {
        const f = this.getFerramentaById(idF);
        if (f) {
          ferramentasAlocadas.push({
            id_ferramenta: f.id_ferramenta,
            descricao: f.descricao,
            part_number: f.part_number,
            serial_number: f.serial_number,
            posicao_localizacao: f.posicao_localizacao,
            status: 'EM_USO',
            calibracao_valida: !f.calibracao_vencida,
            data_vencimento_calibracao: f.ultima_calibracao?.data_vencimento || 'N/A',
            numero_certificado_calibracao: f.ultima_calibracao?.numero_laudo || 'N/A',
            em_quarentena: false,
          });
          nomesFerramentas.push(`${f.descricao} P/N: ${f.part_number} (S/N: ${f.serial_number}, Certificado: ${f.ultima_calibracao?.numero_laudo || 'N/A'})`);

          f.status = 'EM_USO';
        }
      }
    }

    const ferramentalTexto =
      data.campo_13_ferramental_pme_texto ||
      (nomesFerramentas.length > 0 ? nomesFerramentas.join('; ') : 'N/A');

    // 5. Vínculo de Diretrizes Mandatórias e Disparo Automático de FCDA (Form F 001-03-2)
    const diretrizesVinculadas: DiretrizVinculadaOS[] = [];
    if (data.diretrizes_vinculadas && data.diretrizes_vinculadas.length > 0) {
      for (const dir of data.diretrizes_vinculadas) {
        const fcdasExistentes = this.getFcdas({ matricula });
        let fcdaCorrespondente = fcdasExistentes.find(
          (f) => f.numero_diretriz.toLowerCase().includes(dir.numero_diretriz.toLowerCase())
        );

        if (!fcdaCorrespondente) {
          fcdaCorrespondente = this.createFcda({
            matricula_aeronave: matricula,
            msn_aeronave: data.campo_04_msn || 'N/A',
            numero_diretriz: dir.numero_diretriz,
            categoria_aplicacao: dir.categoria || 'AERONAVE',
            tipo_acao: dir.tipo_acao || 'REPETITIVA',
            aplicabilidade: 'APLICAVEL',
            numero_os,
            nome_operador: operador,
            id_executor: mec.id_tecnico,
            id_inspetor: insp.id_tecnico,
            id_rt: rt.id_tecnico,
            status_fcda: 'EM_ELABORACAO',
            metodo_utilizado: `Cumprimento da diretriz vinculada à Ordem de Serviço ${numero_os} conforme procedimentos do manual do fabricante.`,
          });
        }

        diretrizesVinculadas.push({
          numero_diretriz: dir.numero_diretriz,
          tipo_diretriz: dir.tipo_diretriz || 'DA_ANAC',
          categoria: dir.categoria || 'AERONAVE',
          tipo_acao: dir.tipo_acao || 'REPETITIVA',
          id_fcda: fcdaCorrespondente.id_fcda,
          numero_fcda: fcdaCorrespondente.numero_fcda,
          status_fcda: fcdaCorrespondente.status_fcda,
        });
      }
    }

    // 6. Publicações Aplicáveis e Texto Formatado para Campo 12
    const publicacoesAplicaveis = data.campo_12_publicacoes_aplicaveis || [];
    let manuaisTexto = data.campo_12_manuais_texto_formatado || '';
    if (!manuaisTexto && publicacoesAplicaveis.length > 0) {
      manuaisTexto = publicacoesAplicaveis
        .map((p) => `${p.codigo_documento} (${p.revisao_utilizada}) sob Carta de Concessão ${p.numero_carta_concessao}`)
        .join('; ');
    }
    if (!manuaisTexto) {
      manuaisTexto = `AMM ${modelo} sob Carta de Concessão ${validacao.carta_concessao_numero || 'N/A'}; IPC; SRM.`;
    }

    // 7. Tarefas e Discrepâncias
    const tarefas = data.tarefas_discrepancias && data.tarefas_discrepancias.length > 0
      ? data.tarefas_discrepancias
      : [
          {
            item: 1,
            discrepancia: (data.campo_11_escopo_servico || 'Inspeção e manutenção programada conforme solicitação do operador.').substring(0, 150),
            acao_corretiva: 'Executado serviço conforme procedimentos descritos nas publicações técnicas aplicáveis.',
            referencia_amm: publicacoesAplicaveis[0]?.codigo_documento || 'AMM Geral',
            executor_canac: mec.canac,
            inspetor_canac: insp.canac,
            status_tarefa: 'PENDENTE' as const,
          },
        ];

    // 8. Montagem Estruturada da OS Form F 001-09-2 com Aplicação da Regra Inviolável #1 (N/A)
    const novaOS: OrdemServicoF001_09_2 = {
      id_os: this.nextOsId++,
      numero_os,
      id_solicitacao: data.id_solicitacao,
      numero_solicitacao: data.numero_solicitacao || 'N/A',
      status_os: data.status_os || 'ABERTA',

      campo_01_numero_os: numero_os,
      campo_02_matricula: matricula || 'N/A',
      campo_03_modelo: (sanitizeNA(modelo) as string) || 'N/A',
      campo_04_msn: (sanitizeNA(data.campo_04_msn) as string) || 'N/A',
      campo_05_operador: (sanitizeNA(operador) as string) || 'N/A',
      campo_06_base_executante: baseExec,
      campo_07_data_abertura: data.campo_07_data_abertura || agora.toLocaleDateString('pt-BR'),
      campo_07_hora_abertura: data.campo_07_hora_abertura || `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')} UTC`,
      campo_08_data_encerramento_prevista: data.campo_08_data_encerramento_prevista || agora.toLocaleDateString('pt-BR'),
      campo_08_hora_encerramento_prevista: data.campo_08_hora_encerramento_prevista || '18:00 UTC',
      campo_08_data_encerramento_real: data.campo_08_data_encerramento_real || 'N/A',
      campo_08_hora_encerramento_real: data.campo_08_hora_encerramento_real || 'N/A',
      campo_09_tsn: (sanitizeNA(data.campo_09_tsn) as string) || 'N/A',
      campo_10_csn: (sanitizeNA(data.campo_10_csn) as string) || 'N/A',
      campo_11_escopo_servico: (sanitizeNA(data.campo_11_escopo_servico) as string) || 'N/A',
      campo_12_publicacoes_aplicaveis: publicacoesAplicaveis,
      campo_12_manuais_texto_formatado: (sanitizeNA(manuaisTexto) as string) || 'N/A',

      campo_13_ferramental_pme_texto: (sanitizeNA(ferramentalTexto) as string) || 'N/A',
      campo_14_materiais_pecas_texto: (sanitizeNA(data.campo_14_materiais_pecas_texto) as string) || 'N/A',

      tarefas_discrepancias: tarefas,
      campo_16_testes_funcionais: (sanitizeNA(data.campo_16_testes_funcionais) as string) || 'Testes operacionais e funcionais em conformidade com o manual de manutenção aplicável.',

      diretrizes_vinculadas: diretrizesVinculadas,
      ferramentas_alocadas: ferramentasAlocadas,

      id_mecanico_executor: mec.id_tecnico,
      mecanico_executor_nome: mec.nome_completo,
      mecanico_executor_canac: mec.canac,
      mecanico_executor_apto: true,

      id_inspetor_aprs: insp.id_tecnico,
      inspetor_aprs_nome: insp.nome_completo,
      inspetor_aprs_canac: insp.canac,
      inspetor_aprs_habilitado: true,

      id_rt: rt.id_tecnico,
      rt_nome: rt.nome_completo,
      rt_canac: rt.canac,

      representante_operador_nome: (sanitizeNA(data.representante_operador_nome) as string) || 'Comandante da Aeronave / CTM do Operador',

      regra_na_aplicada: true,
      aviso_fod_incluido: true,
      tipo_release_aplicavel: data.tipo_release_aplicavel || 'ANAC_RBAC_43_9',
      declaracao_easa_part145_aplicada: Boolean(
        data.declaracao_easa_part145_aplicada ??
        (data.tipo_release_aplicavel === 'DUAL_RELEASE_ANAC_EASA' || data.tipo_release_aplicavel === 'EASA_PART_145')
      ),

      criado_em: agora.toISOString(),
      criado_por: data.criado_por || 'Planejamento e Controle da Produção (PCP)',
      atualizado_em: agora.toISOString(),
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.ordensServico.unshift(novaOS);

    if (data.id_solicitacao) {
      this.updateSolicitacaoComercial(data.id_solicitacao, {
        status: 'APROVADA_OS_GERADA',
        id_ordem_servico_gerada: novaOS.id_os,
        numero_os_gerada: novaOS.numero_os,
      });
    }

    return novaOS;
  }

  public updateOrdemServico(id: number, data: Partial<OrdemServicoF001_09_2>): OrdemServicoF001_09_2 | undefined {
    const os = this.ordensServico.find((item) => item.id_os === id);
    if (!os) return undefined;

    if (data.status_os !== undefined) os.status_os = data.status_os;
    if (data.campo_09_tsn !== undefined) os.campo_09_tsn = sanitizeNA(data.campo_09_tsn) as string;
    if (data.campo_10_csn !== undefined) os.campo_10_csn = sanitizeNA(data.campo_10_csn) as string;
    if (data.campo_11_escopo_servico !== undefined) os.campo_11_escopo_servico = sanitizeNA(data.campo_11_escopo_servico) as string;
    if (data.campo_12_manuais_texto_formatado !== undefined) os.campo_12_manuais_texto_formatado = sanitizeNA(data.campo_12_manuais_texto_formatado) as string;
    if (data.campo_13_ferramental_pme_texto !== undefined) os.campo_13_ferramental_pme_texto = sanitizeNA(data.campo_13_ferramental_pme_texto) as string;
    if (data.campo_14_materiais_pecas_texto !== undefined) os.campo_14_materiais_pecas_texto = sanitizeNA(data.campo_14_materiais_pecas_texto) as string;
    if (data.campo_16_testes_funcionais !== undefined) os.campo_16_testes_funcionais = sanitizeNA(data.campo_16_testes_funcionais) as string;
    if (data.tarefas_discrepancias !== undefined) os.tarefas_discrepancias = data.tarefas_discrepancias;
    if (data.representante_operador_nome !== undefined) os.representante_operador_nome = sanitizeNA(data.representante_operador_nome) as string;
    if (data.observacoes !== undefined) os.observacoes = sanitizeNA(data.observacoes) as string;

    os.atualizado_em = new Date().toISOString();
    return os;
  }

  public updateStatusOrdemServico(
    id: number,
    status: StatusOrdemServico,
    dados?: {
      data_encerramento_real?: string;
      hora_encerramento_real?: string;
      representante_operador?: string;
      usuario_nome?: string;
      id_usuario?: number;
      cargo_usuario?: string;
      motivo?: string;
      ip_origem?: string;
    }
  ): OrdemServicoF001_09_2 | undefined {
    const os = this.ordensServico.find((item) => item.id_os === id);
    if (!os) return undefined;

    const estadoAnterior = os.status_os;
    if (estadoAnterior === status) {
      return os;
    }

    // 1. Coleta de evidências reais para auditoria e pré-requisitos
    const audMec = this.calcularAuditoriaQualificacao(os.id_mecanico_executor);
    const audInsp = this.calcularAuditoriaQualificacao(os.id_inspetor_aprs);
    const apts = this.getApontamentosByOS(id);
    const tarefasCompletas = apts.length > 0 && apts.every((a) => a.status_apontamento === 'EXECUTADO' || a.status_apontamento === 'INSPECIONADO_APRS');
    const risPendentes = this.relatoriosInspecao.filter(
      (r) => r.id_os === id && r.status_ri !== 'APROVADO_ENCERRADO'
    ).length;
    const iios = apts.filter((a) => a.is_iio);
    const iioDuplaAssinaturaValida = iios.length === 0 || iios.every((a) => a.assinatura_dupla_iio_valida && !a.violacao_independencia_iio);

    const tools = this.ferramentasUtilizadas.filter((t) => t.id_os === id);
    const pendentesDevolucao = tools.filter(
      (t) => t.condicao_devolucao === 'PENDENTE_DEVOLUCAO' || !t.data_hora_checkin
    ).length;

    const fodChecklist = this.getChecklistFodByOS(id);
    const fodChecklistExecutado = Boolean(
      fodChecklist &&
      fodChecklist.recolhimento_todas_ferramentas &&
      fodChecklist.contagem_ferramentas_confere &&
      fodChecklist.inspecao_visual_baias_motores_paineis &&
      fodChecklist.limpeza_residuos_freio_arames_panos &&
      fodChecklist.paineis_acesso_fechados_travados &&
      pendentesDevolucao === 0
    );

    const pts = this.getPassagensTurno({ id_os: id });
    const passagemTurnoPendente = pts.some((p) => !p.aceite_formal_entrante && !p.rubrica_tecnico_entrando);
    const rtsEmitido = this.liberacoesRts.some((r) => r.id_os === id && r.status === 'VIGENTE');

    // 2. Validação da transição na Máquina de Estados ANTES de alterar qualquer estado
    const validacao = osStateMachine.validarTransicao(os, status, {
      mecanicoApto: audMec.is_apto,
      inspetorApto: audInsp.aprovado_aprs,
      tarefasCompletas,
      risPendentes,
      iioDuplaAssinaturaValida,
      ferramentasPendentesDevolucao: pendentesDevolucao,
      fodChecklistExecutado,
      passagemTurnoPendente,
      rtsEmitido,
    });

    if (!validacao.permitido) {
      throw new Error(`BLOQUEIO DE TRANSIÇÃO DA OS: ${validacao.motivos_bloqueio.join(' | ')}`);
    }

    // 3. Validações adicionais para encerramento
    if (status === 'ENCERRADA') {
      if (risPendentes > 0) {
        throw new Error(`BLOQUEIO REGULATÓRIO: Existem ${risPendentes} Relatório(s) de Inspeção (RI F 001-12) pendentes.`);
      }
      if (!iioDuplaAssinaturaValida) {
        throw new Error('BLOQUEIO REGULATÓRIO IIO: Existem itens críticos IIO pendentes de dupla assinatura homologada.');
      }
      if (!rtsEmitido) {
        throw new Error('BLOQUEIO REGULATÓRIO: A OS não pode ser encerrada sem a emissão prévia de Liberação RTS (MOMQ 5.7).');
      }
      if (!fodChecklistExecutado) {
        throw new Error('BLOQUEIO FOD: O checklist de desobstrução e inspeção de resíduos FOD deve ser executado antes do encerramento.');
      }
    }

    // 4. Somente agora que todas as validações foram aprovadas, aplicamos as modificações
    const agora = new Date();
    os.status_os = status;
    os.atualizado_em = agora.toISOString();

    if (status === 'ENCERRADA') {
      os.campo_08_data_encerramento_real = dados?.data_encerramento_real || agora.toLocaleDateString('pt-BR');
      os.campo_08_hora_encerramento_real = dados?.hora_encerramento_real || `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')} UTC`;
      if (dados?.representante_operador) {
        os.representante_operador_nome = sanitizeNA(dados.representante_operador) as string;
      }
      os.tarefas_discrepancias = os.tarefas_discrepancias.map((t) => ({
        ...t,
        status_tarefa: 'INSPECIONADA',
      }));

      if (os.ferramentas_alocadas) {
        for (const fa of os.ferramentas_alocadas) {
          const f = this.getFerramentaById(fa.id_ferramenta);
          if (f && f.status === 'EM_USO') f.status = 'DISPONIVEL';
          fa.status = 'DISPONIVEL';
        }
      }

      if (os.diretrizes_vinculadas) {
        for (const dir of os.diretrizes_vinculadas) {
          if (dir.id_fcda) {
            this.updateFcda(dir.id_fcda, { status_fcda: 'CONCLUIDA' });
            dir.status_fcda = 'CONCLUIDA';
          }
        }
      }
    }

    // 5. Registro na trilha de auditoria e máquina de estados
    osStateMachine.registrarTransicao(
      {
        id_os: id,
        novo_estado: status,
        usuario_nome: dados?.usuario_nome || 'PCP / Auditoria MRO',
        id_usuario: dados?.id_usuario,
        cargo_usuario: dados?.cargo_usuario || 'PCP',
        motivo: dados?.motivo || `Transição de estado da OS de ${estadoAnterior} para ${status}`,
        ip_origem: dados?.ip_origem || '127.0.0.1',
      },
      estadoAnterior
    ).catch((e) => console.warn('[Audit] Erro ao registrar transição:', e));

    return os;
  }

  // --- ESTATÍSTICAS DO PCP ---
  public getPcpStats(): PcpStats {
    const oss = this.ordensServico;
    const sols = this.solicitacoes;

    const totalOs = oss.length;
    const osAbertas = oss.filter((os) => os.status_os === 'ABERTA').length;
    const osEmExecucao = oss.filter((os) => os.status_os === 'EM_EXECUCAO').length;
    const osAguardandoInspecao = oss.filter((os) => os.status_os === 'AGUARDANDO_INSPECAO').length;
    const osEncerradas = oss.filter((os) => os.status_os === 'ENCERRADA').length;

    const solsPendentes = sols.filter((s) => s.status === 'NOVA' || s.status === 'EM_ANALISE_PCP').length;
    const solsAprovadas = sols.filter((s) => s.status === 'APROVADA_OS_GERADA').length;

    let fcdasCount = 0;
    for (const os of oss) {
      fcdasCount += (os.diretrizes_vinculadas || []).length;
    }

    const taxa = totalOs > 0 ? Math.round((osEncerradas / totalOs) * 100) : 100;

    return {
      total_ordens_servico: totalOs,
      os_abertas: osAbertas,
      os_em_execucao: osEmExecucao,
      os_aguardando_inspecao: osAguardandoInspecao,
      os_encerradas: osEncerradas,
      solicitacoes_pendentes: solsPendentes,
      solicitacoes_aprovadas: solsAprovadas,
      total_fcdas_vinculadas: fcdasCount,
      taxa_pontualidade_percentual: taxa,
    };
  }

  // ===========================================================================
  // PARTE 5: EXECUÇÃO DE LINHA, PASSAGEM DE TURNO E INSPEÇÕES (MOMQ 5.4 / P 001-07)
  // ===========================================================================

  // --- 1. APONTAMENTOS DE TAREFAS NA OS (Form F 001-09-2) ---
  public getApontamentos(filtros?: {
    id_os?: number;
    status?: string;
    is_iio?: boolean;
  }): ApontamentoTarefaOS[] {
    let list = this.apontamentos.map((a) => ({
      ...a,
      titulo_tarefa: sanitizeNA(a.titulo_tarefa) as string,
      descricao_passo_a_passo: sanitizeNA(a.descricao_passo_a_passo) as string,
      referencia_amm_task: sanitizeNA(a.referencia_amm_task) as string,
      observacoes: sanitizeNA(a.observacoes) as string,
    }));

    if (filtros?.id_os) {
      list = list.filter((a) => a.id_os === filtros.id_os);
    }
    if (filtros?.status && filtros.status !== 'TODOS') {
      list = list.filter((a) => a.status_apontamento === filtros.status);
    }
    if (filtros?.is_iio !== undefined) {
      list = list.filter((a) => a.is_iio === filtros.is_iio);
    }

    return list.sort((a, b) => a.item_tarefa - b.item_tarefa);
  }

  public getApontamentoById(id: number): ApontamentoTarefaOS | undefined {
    return this.apontamentos.find((a) => a.id_apontamento === id);
  }

  public getApontamentosByOS(id_os: number): ApontamentoTarefaOS[] {
    return this.getApontamentos({ id_os });
  }

  public createApontamento(data: Partial<ApontamentoTarefaOS>): ApontamentoTarefaOS {
    const os = this.getOrdemServicoById(data.id_os || 1);
    const mec = this.tecnicos.find((t) => t.id_tecnico === data.id_mecanico_executor) || this.tecnicos[4];
    const agora = new Date();

    const novo: ApontamentoTarefaOS = {
      id_apontamento: this.nextApontamentoId++,
      id_os: os ? os.id_os : 1,
      numero_os: os ? os.numero_os : 'OS-2026-0084',
      item_tarefa: data.item_tarefa || (this.apontamentos.filter((a) => a.id_os === (os?.id_os || 1)).length + 1),
      titulo_tarefa: (sanitizeNA(data.titulo_tarefa) as string) || 'Tarefa de Manutenção',
      descricao_passo_a_passo: (sanitizeNA(data.descricao_passo_a_passo) as string) || 'N/A',
      referencia_amm_task: (sanitizeNA(data.referencia_amm_task) as string) || 'AMM Task N/A',
      is_iio: !!data.is_iio,
      categoria_iio: data.categoria_iio || (data.is_iio ? 'Item Crítico de Aeronavegabilidade' : undefined),
      id_mecanico_executor: mec.id_tecnico,
      mecanico_nome: mec.nome_completo,
      mecanico_canac: mec.canac,
      data_hora_execucao: data.data_hora_execucao || agora.toISOString(),
      rubrica_mecanico: data.rubrica_mecanico || `${mec.nome_completo.split(' ').map((n) => n[0]).join('')}-${mec.canac}`,
      status_apontamento: data.status_apontamento || 'EXECUTADO',
      assinatura_dupla_iio_valida: false,
      materiais_aplicados: [],
      ferramentas_utilizadas: [],
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.apontamentos.push(novo);

    // Atualiza status da OS para EM_EXECUCAO se ainda estava ABERTA
    if (os && os.status_os === 'ABERTA') {
      os.status_os = 'EM_EXECUCAO';
    }

    return novo;
  }

  public updateApontamento(id: number, data: Partial<ApontamentoTarefaOS>): ApontamentoTarefaOS | undefined {
    const item = this.apontamentos.find((a) => a.id_apontamento === id);
    if (!item) return undefined;

    if (data.titulo_tarefa !== undefined) item.titulo_tarefa = sanitizeNA(data.titulo_tarefa) as string;
    if (data.descricao_passo_a_passo !== undefined) item.descricao_passo_a_passo = sanitizeNA(data.descricao_passo_a_passo) as string;
    if (data.referencia_amm_task !== undefined) item.referencia_amm_task = sanitizeNA(data.referencia_amm_task) as string;
    if (data.status_apontamento !== undefined) item.status_apontamento = data.status_apontamento;
    if (data.observacoes !== undefined) item.observacoes = sanitizeNA(data.observacoes) as string;

    return item;
  }

  // --- 2. VALIDAÇÃO E DUPLA ASSINATURA OBRIGATÓRIA (IIO - MOMQ 5.4 / P 001-07) ---
  public validarDuplaAssinaturaIio(id_mecanico: number, id_inspetor: number): ValidacaoDuplaAssinaturaIioResult {
    const tecnicos_distintos = id_mecanico !== id_inspetor;
    const audMec = this.calcularAuditoriaQualificacao(id_mecanico);
    const audInsp = this.calcularAuditoriaQualificacao(id_inspetor);

    const mecanico_habilitado = audMec.is_apto;
    const inspetor_aprs_autorizado = audInsp.is_apto && audInsp.aprovado_aprs;

    let motivo_bloqueio: string | undefined;

    if (!tecnicos_distintos) {
      motivo_bloqueio = 'VIOLAÇÃO REGULATÓRIA (MOMQ 5.4 / RBAC 145.163 / EASA Part-145): O Inspetor APRS de uma tarefa crítica IIO NÃO pode ser o mesmo técnico que executou a ação (Auto-inspeção estritamente proibida).';
    } else if (!mecanico_habilitado) {
      motivo_bloqueio = `Mecânico Executor inabilitado ou com pendências: ${audMec.motivos_bloqueio.join('; ')}.`;
    } else if (!inspetor_aprs_autorizado) {
      motivo_bloqueio = !audInsp.aprovado_aprs
        ? 'Inspetor designado não possui autorização APRS homologada pelo RT no Form F 001-03.'
        : `Inspetor APRS com pendências de treinamento/habilitação: ${audInsp.motivos_bloqueio.join('; ')}.`;
    }

    return {
      valido: tecnicos_distintos && mecanico_habilitado && inspetor_aprs_autorizado,
      motivo_bloqueio,
      mecanico_habilitado,
      inspetor_aprs_autorizado,
      tecnicos_distintos,
    };
  }

  public assinarInspecaoAprsIio(
    id_apontamento: number,
    id_inspetor_aprs: number,
    rubrica: string
  ): ApontamentoTarefaOS {
    const item = this.apontamentos.find((a) => a.id_apontamento === id_apontamento);
    if (!item) throw new Error('Apontamento de tarefa não encontrado.');

    if (item.id_mecanico_executor === id_inspetor_aprs) {
      throw new Error(
        'BLOQUEIO REGULATÓRIO IIO (MOMQ 5.4 / RBAC 145.163): O Inspetor APRS não pode ser o mesmo profissional que executou o serviço. Auto-inspeção em itens críticos de aeronavegabilidade é vedada por norma.'
      );
    }

    const validacao = this.validarDuplaAssinaturaIio(item.id_mecanico_executor, id_inspetor_aprs);
    if (!validacao.valido) {
      throw new Error(`BLOQUEIO DE INSPEÇÃO IIO: ${validacao.motivo_bloqueio}`);
    }

    const insp = this.tecnicos.find((t) => t.id_tecnico === id_inspetor_aprs);
    if (!insp) throw new Error('Inspetor não encontrado no cadastro técnico.');

    const agora = new Date();
    item.id_inspetor_aprs = insp.id_tecnico;
    item.inspetor_nome = insp.nome_completo;
    item.inspetor_canac = insp.canac;
    item.data_hora_inspecao = agora.toISOString();
    item.rubrica_inspetor = rubrica || `${insp.nome_completo.split(' ').map((n) => n[0]).join('')}-${insp.canac}-APRS`;
    item.status_apontamento = 'INSPECIONADO_APRS';
    item.assinatura_dupla_iio_valida = true;

    return item;
  }

  // --- 3. PEÇAS E MATERIAIS APLICADOS (Campo 14 - Form F 001-09-2) ---
  public getMateriaisAplicados(id_os?: number): MaterialAplicadoOS[] {
    let list = this.materiaisAplicados;
    if (id_os) {
      list = list.filter((m) => m.id_os === id_os);
    }
    return list;
  }

  public addMaterialAplicado(data: Partial<MaterialAplicadoOS>): MaterialAplicadoOS {
    const os = this.getOrdemServicoById(data.id_os || 1);
    const mec = this.tecnicos.find((t) => t.id_tecnico === data.id_mecanico_aplicador) || this.tecnicos[4];
    const agora = new Date();

    const novo: MaterialAplicadoOS = {
      id_material_aplicado: this.nextMaterialId++,
      id_os: os ? os.id_os : 1,
      numero_os: os ? os.numero_os : 'OS-2026-0084',
      part_number: (sanitizeNA(data.part_number) as string) || 'N/A',
      serial_number: (sanitizeNA(data.serial_number) as string) || 'N/A',
      lote_batch: (sanitizeNA(data.lote_batch) as string) || 'N/A',
      descricao: (sanitizeNA(data.descricao) as string) || 'Material Aeronáutico',
      quantidade: data.quantidade || 1,
      unidade_medida: data.unidade_medida || 'UN',
      numero_requisicao_f001_01: (sanitizeNA(data.numero_requisicao_f001_01) as string) || 'REQ-2026-0000',
      tipo_documento_rastreabilidade: data.tipo_documento_rastreabilidade || 'EASA_FORM_1',
      numero_documento_rastreabilidade: (sanitizeNA(data.numero_documento_rastreabilidade) as string) || 'ARC-PENDENTE',
      data_aplicacao: data.data_aplicacao || agora.toISOString(),
      id_mecanico_aplicador: mec.id_tecnico,
      mecanico_nome: mec.nome_completo,
      mecanico_canac: mec.canac,
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.materiaisAplicados.push(novo);

    // Se a OS tiver campo 14 resumido, atualiza
    if (os) {
      const atual = os.campo_14_materiais_pecas_texto === 'N/A' ? '' : `${os.campo_14_materiais_pecas_texto}; `;
      os.campo_14_materiais_pecas_texto = `${atual}${novo.descricao} P/N: ${novo.part_number} (Doc: ${novo.numero_documento_rastreabilidade})`;
    }

    return novo;
  }

  // --- 4. FERRAMENTAL PME UTILIZADO & CHECK-IN / CHECK-OUT (Form F 001-06-1) ---
  public getFerramentasUtilizadas(id_os?: number): FerramentaUtilizadaOS[] {
    let list = this.ferramentasUtilizadas;
    if (id_os) {
      list = list.filter((f) => f.id_os === id_os);
    }
    return list;
  }

  public registrarCheckoutFerramenta(data: Partial<FerramentaUtilizadaOS>): FerramentaUtilizadaOS {
    const f = this.getFerramentaById(data.id_ferramenta || 1);
    if (!f) throw new Error('Ferramenta não localizada.');

    if (f.status === 'QUARENTENA' || f.calibracao_vencida) {
      throw new Error(`BLOQUEIO: Ferramenta ${f.part_number} encontra-se em Quarentena ou com calibração expirada. Uso proibido.`);
    }

    const os = this.getOrdemServicoById(data.id_os || 1);
    const agora = new Date();

    const novoUso: FerramentaUtilizadaOS = {
      id_uso_ferramenta: this.nextUsoFerramentaId++,
      id_os: os ? os.id_os : 1,
      numero_os: os ? os.numero_os : 'OS-2026-0084',
      id_ferramenta: f.id_ferramenta,
      part_number: f.part_number,
      serial_number: f.serial_number,
      descricao: f.descricao,
      numero_laudo_calibracao: f.ultima_calibracao?.numero_laudo || 'N/A',
      data_vencimento_calibracao: f.ultima_calibracao?.data_vencimento || 'N/A',
      data_hora_checkout: data.data_hora_checkout || agora.toISOString(),
      condicao_devolucao: 'PENDENTE_DEVOLUCAO',
      responsavel_checkout_nome: data.responsavel_checkout_nome || 'Mecânico Linha',
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    f.status = 'EM_USO';
    this.ferramentasUtilizadas.push(novoUso);
    return novoUso;
  }

  public registrarCheckinFerramenta(
    id_uso: number,
    condicao: CondicaoDevolucaoFerramenta,
    responsavel_checkin: string,
    observacoes?: string
  ): FerramentaUtilizadaOS {
    const item = this.ferramentasUtilizadas.find((u) => u.id_uso_ferramenta === id_uso);
    if (!item) throw new Error('Registro de uso de ferramenta não localizado.');

    const f = this.getFerramentaById(item.id_ferramenta);
    const agora = new Date();

    item.data_hora_checkin = agora.toISOString();
    item.condicao_devolucao = condicao;
    item.responsavel_checkin_nome = responsavel_checkin;
    item.observacoes = (sanitizeNA(observacoes) as string) || 'N/A';

    if (f) {
      if (condicao === 'AVARIADA_REQUER_QUARENTENA') {
        this.transferirParaQuarentena({
          id_ferramenta: f.id_ferramenta,
          responsavel_segregacao: 1,
          motivo_segregacao: `Avaria ou dano identificado durante o check-in da OS ${item.numero_os}. Ferramenta segregada com Tag Vermelha.`,
          local_armazenamento_segregado: 'Armário Quarentena Ferramentaria Trancado Q-01',
        });
      } else {
        f.status = 'DISPONIVEL';
      }
    }

    return item;
  }

  // --- 5. GESTÃO DE RELATÓRIOS DE INSPEÇÃO (RI / Form F 001-12) ---
  public getRelatoriosInspecao(filtros?: {
    id_os?: number;
    status?: string;
    base?: string;
  }): RelatorioInspecaoF001_12[] {
    let list = this.relatoriosInspecao.map((r) => ({
      ...r,
      descricao_discrepancia: sanitizeNA(r.descricao_discrepancia) as string,
      localizacao_aeronave: sanitizeNA(r.localizacao_aeronave) as string,
      referencia_manual_defeito: sanitizeNA(r.referencia_manual_defeito) as string,
      acao_corretiva_exigida: sanitizeNA(r.acao_corretiva_exigida) as string,
      acao_corretiva_executada: sanitizeNA(r.acao_corretiva_executada) as string,
      observacoes: sanitizeNA(r.observacoes) as string,
    }));

    if (filtros?.id_os) {
      list = list.filter((r) => r.id_os === filtros.id_os);
    }
    if (filtros?.status) {
      if (filtros.status === 'PENDENTES_DE_RESOLUCAO') {
        list = list.filter((r) => r.status_ri !== 'APROVADO_ENCERRADO');
      } else if (filtros.status !== 'TODOS') {
        list = list.filter((r) => r.status_ri === filtros.status);
      }
    }
    if (filtros?.base && filtros.base !== 'TODAS') {
      list = list.filter((r) => r.base === filtros.base);
    }

    return list.sort((a, b) => b.id_ri - a.id_ri);
  }

  public getRelatorioInspecaoById(id: number): RelatorioInspecaoF001_12 | undefined {
    return this.relatoriosInspecao.find((r) => r.id_ri === id);
  }

  public createRelatorioInspecao(data: Partial<RelatorioInspecaoF001_12>): RelatorioInspecaoF001_12 {
    const os = this.getOrdemServicoById(data.id_os || 1);
    const insp = this.tecnicos.find((t) => t.id_tecnico === data.id_inspetor_abertura) || this.tecnicos[2];
    const agora = new Date();
    const ano = agora.getFullYear();
    const seq = String(this.nextRiSeq++).padStart(4, '0');
    const numero_ri = `RI-${ano}-${seq}`;

    const novo: RelatorioInspecaoF001_12 = {
      id_ri: this.nextRiId++,
      numero_ri,
      id_os: os ? os.id_os : 1,
      numero_os: os ? os.numero_os : 'OS-2026-0084',
      matricula_aeronave: os ? os.campo_02_matricula : 'PR-IMA',
      modelo_aeronave: os ? os.campo_03_modelo : 'ATR 72-600',
      base: os ? os.campo_06_base_executante : 'GRU',
      data_abertura: data.data_abertura || agora.toLocaleDateString('pt-BR'),
      hora_abertura: data.hora_abertura || `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')} UTC`,
      tipo_inspecao: data.tipo_inspecao || 'PRELIMINAR',
      descricao_discrepancia: (sanitizeNA(data.descricao_discrepancia) as string) || 'Não conformidade constatada.',
      localizacao_aeronave: (sanitizeNA(data.localizacao_aeronave) as string) || 'N/A',
      referencia_manual_defeito: (sanitizeNA(data.referencia_manual_defeito) as string) || 'AMM Defect Reference',
      severidade: data.severidade || 'MAIOR',
      is_iio: !!data.is_iio,
      acao_corretiva_exigida: (sanitizeNA(data.acao_corretiva_exigida) as string) || 'Correção requerida.',
      status_ri: 'ABERTO_PENDENTE',
      id_inspetor_abertura: insp.id_tecnico,
      inspetor_abertura_nome: insp.nome_completo,
      inspetor_abertura_canac: insp.canac,
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.relatoriosInspecao.unshift(novo);
    return novo;
  }

  public resolverRelatorioInspecao(
    id_ri: number,
    acao_corretiva: string,
    id_mecanico: number
  ): RelatorioInspecaoF001_12 {
    const ri = this.relatoriosInspecao.find((r) => r.id_ri === id_ri);
    if (!ri) throw new Error('Relatório de Inspeção não localizado.');

    const mec = this.tecnicos.find((t) => t.id_tecnico === id_mecanico);
    if (!mec) throw new Error('Mecânico executor não localizado.');

    ri.acao_corretiva_executada = (sanitizeNA(acao_corretiva) as string) || 'Ação corretiva executada conforme AMM.';
    ri.id_mecanico_execucao = mec.id_tecnico;
    ri.mecanico_execucao_nome = mec.nome_completo;
    ri.mecanico_execucao_canac = mec.canac;
    ri.data_hora_execucao = new Date().toISOString();
    ri.status_ri = 'RESOLVIDO_AGUARDANDO_APRS';

    return ri;
  }

  public aprovarRelatorioInspecao(
    id_ri: number,
    id_inspetor_aprs: number,
    observacoes?: string
  ): RelatorioInspecaoF001_12 {
    const ri = this.relatoriosInspecao.find((r) => r.id_ri === id_ri);
    if (!ri) throw new Error('Relatório de Inspeção não localizado.');

    if (ri.status_ri === 'ABERTO_PENDENTE') {
      throw new Error('O RI ainda não possui registro de ação corretiva executada pelo mecânico.');
    }

    // Trava IIO: Inspetor não pode ser quem executou a correção
    if (ri.is_iio && ri.id_mecanico_execucao === id_inspetor_aprs) {
      throw new Error(
        'BLOQUEIO REGULATÓRIO (MOMQ 5.4): O Inspetor APRS não pode ser o mesmo mecânico que realizou a ação corretiva de um RI classificado como IIO.'
      );
    }

    const insp = this.tecnicos.find((t) => t.id_tecnico === id_inspetor_aprs);
    if (!insp) throw new Error('Inspetor não localizado.');

    const aud = this.calcularAuditoriaQualificacao(id_inspetor_aprs);
    if (!aud.aprovado_aprs) {
      throw new Error('O técnico selecionado não possui função de Inspetor APRS homologada pelo RT (Form F 001-03).');
    }

    ri.id_inspetor_aprovacao = insp.id_tecnico;
    ri.inspetor_aprovacao_nome = insp.nome_completo;
    ri.inspetor_aprovacao_canac = insp.canac;
    ri.data_hora_aprovacao = new Date().toISOString();
    ri.status_ri = 'APROVADO_ENCERRADO';
    if (observacoes) ri.observacoes = sanitizeNA(observacoes) as string;

    return ri;
  }

  // --- 6. FICHA DE PASSAGEM DE SERVIÇO (Form F 001-24 / I 001-14) ---
  public getPassagensTurno(filtros?: {
    id_os?: number;
    base?: string;
  }): PassagemTurnoF001_24[] {
    let list = this.passagensTurno.map((p) => ({
      ...p,
      status_geral_trabalhos: sanitizeNA(p.status_geral_trabalhos) as string,
      tarefas_concluidas_resumo: sanitizeNA(p.tarefas_concluidas_resumo) as string,
      tarefas_pendentes_detalhes: sanitizeNA(p.tarefas_pendentes_detalhes) as string,
      ris_em_aberto_alerta: sanitizeNA(p.ris_em_aberto_alerta) as string,
      ferramentas_retidas_aeronave_bancada: sanitizeNA(p.ferramentas_retidas_aeronave_bancada) as string,
      pecas_pendentes_suprimentos: sanitizeNA(p.pecas_pendentes_suprimentos) as string,
      observacoes: sanitizeNA(p.observacoes) as string,
    }));

    if (filtros?.id_os) {
      list = list.filter((p) => p.id_os === filtros.id_os);
    }
    if (filtros?.base && filtros.base !== 'TODAS') {
      list = list.filter((p) => p.base_operacional === filtros.base);
    }

    return list.sort((a, b) => b.id_passagem - a.id_passagem);
  }

  public getPassagemTurnoById(id: number): PassagemTurnoF001_24 | undefined {
    return this.passagensTurno.find((p) => p.id_passagem === id);
  }

  public createPassagemTurno(data: Partial<PassagemTurnoF001_24>): PassagemTurnoF001_24 {
    const os = this.getOrdemServicoById(data.id_os || 1);
    const tecSaindo = this.tecnicos.find((t) => t.id_tecnico === data.id_tecnico_saindo) || this.tecnicos[4];
    const tecEntrando = this.tecnicos.find((t) => t.id_tecnico === data.id_tecnico_entrando) || this.tecnicos[1];

    const agora = new Date();
    const ano = agora.getFullYear();
    const seq = String(this.nextPassagemSeq++).padStart(4, '0');
    const numero_passagem = `PT-${ano}-${seq}`;

    // Checa se há RIs pendentes para alimentar o alerta automático
    const risPendentes = this.relatoriosInspecao.filter(
      (r) => r.id_os === (os?.id_os || 1) && r.status_ri !== 'APROVADO_ENCERRADO'
    );
    const alertaRIs = risPendentes.length > 0
      ? `ATENÇÃO: Existem ${risPendentes.length} RI(s) em aberto (${risPendentes.map((r) => r.numero_ri).join(', ')}). A OS está com trava de fechamento ativa.`
      : 'Nenhum RI em aberto.';

    const nova: PassagemTurnoF001_24 = {
      id_passagem: this.nextPassagemId++,
      numero_passagem,
      id_os: os ? os.id_os : 1,
      numero_os: os ? os.numero_os : 'OS-2026-0084',
      matricula_aeronave: os ? os.campo_02_matricula : 'PR-IMA',
      modelo_aeronave: os ? os.campo_03_modelo : 'ATR 72-600',
      base_operacional: os ? os.campo_06_base_executante : 'GRU',
      turno_saindo: data.turno_saindo || 'TARDE',
      turno_entrando: data.turno_entrando || 'NOITE',
      data_passagem: data.data_passagem || agora.toLocaleDateString('pt-BR'),
      hora_passagem: data.hora_passagem || `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')} UTC`,
      status_geral_trabalhos: (sanitizeNA(data.status_geral_trabalhos) as string) || 'Trabalhos em andamento.',
      tarefas_concluidas_resumo: (sanitizeNA(data.tarefas_concluidas_resumo) as string) || 'N/A',
      tarefas_pendentes_detalhes: (sanitizeNA(data.tarefas_pendentes_detalhes) as string) || 'N/A',
      ris_em_aberto_alerta: data.ris_em_aberto_alerta || alertaRIs,
      ferramentas_retidas_aeronave_bancada: (sanitizeNA(data.ferramentas_retidas_aeronave_bancada) as string) || 'Nenhuma ferramenta retida.',
      pecas_pendentes_suprimentos: (sanitizeNA(data.pecas_pendentes_suprimentos) as string) || 'N/A',
      condicoes_seguranca_fod_atestadas: true,
      aviso_fod_incluido: true,
      id_tecnico_saindo: tecSaindo.id_tecnico,
      tecnico_saindo_nome: tecSaindo.nome_completo,
      tecnico_saindo_canac: tecSaindo.canac,
      rubrica_tecnico_saindo: data.rubrica_tecnico_saindo || `${tecSaindo.nome_completo.split(' ').map((n) => n[0]).join('')}-${tecSaindo.canac}`,
      id_tecnico_entrando: tecEntrando.id_tecnico,
      tecnico_entrando_nome: tecEntrando.nome_completo,
      tecnico_entrando_canac: tecEntrando.canac,
      rubrica_tecnico_entrando: data.rubrica_tecnico_entrando || `${tecEntrando.nome_completo.split(' ').map((n) => n[0]).join('')}-${tecEntrando.canac}`,
      observacoes: (sanitizeNA(data.observacoes) as string) || 'N/A',
    };

    this.passagensTurno.unshift(nova);
    return nova;
  }

  // --- 7. ENCERRAMENTO OPERACIONAL COM CHECKLIST FOD COMPULSÓRIO ---
  public executarEncerramentoOperacionalFod(
    id_os: number,
    checklist: ChecklistFodEncerramento,
    id_inspetor_aprs: number
  ): OrdemServicoF001_09_2 {
    if (!checklist.recolhimento_todas_ferramentas || !checklist.contagem_ferramentas_confere) {
      throw new Error(
        'BLOQUEIO FOD: Todas as ferramentas devem ser devidamente recolhidas e a contagem conferida antes da liberação.'
      );
    }

    if (!checklist.inspecao_visual_baias_motores_paineis || !checklist.limpeza_residuos_freio_arames_panos) {
      throw new Error(
        'BLOQUEIO FOD: A inspeção visual de baias/motores e a limpeza de resíduos e arames de freio são obrigatórias.'
      );
    }

    if (!checklist.paineis_acesso_fechados_travados) {
      throw new Error('BLOQUEIO: Todos os painéis de acesso devem estar fechados e travados.');
    }

    const insp = this.tecnicos.find((t) => t.id_tecnico === id_inspetor_aprs);
    if (!insp) throw new Error('Inspetor APRS não localizado.');

    const os = this.updateStatusOrdemServico(id_os, 'ENCERRADA');
    if (!os) throw new Error('Ordem de Serviço não localizada.');

    os.observacoes = `${os.observacoes}; Checklist FOD e limpeza de área atestados pelo Inspetor ${insp.nome_completo} (CANAC: ${insp.canac}).`;
    return os;
  }

  // --- 8. ESTATÍSTICAS DO HANGAR (PARTE 5) ---
  public getHangarStats(): HangarStats {
    const apts = this.apontamentos;
    const ris = this.relatoriosInspecao;
    const pts = this.passagensTurno;
    const tools = this.ferramentasUtilizadas;

    return {
      total_apontamentos: apts.length,
      apontamentos_concluidos: apts.filter((a) => a.status_apontamento === 'INSPECIONADO_APRS' || a.status_apontamento === 'EXECUTADO').length,
      apontamentos_iio_pendentes_aprs: apts.filter((a) => a.is_iio && !a.assinatura_dupla_iio_valida).length,
      total_ris: ris.length,
      ris_abertos_bloqueantes: ris.filter((r) => r.status_ri !== 'APROVADO_ENCERRADO').length,
      total_passagens_turno: pts.length,
      ferramentas_em_uso_hangar: tools.filter((t) => t.condicao_devolucao === 'PENDENTE_DEVOLUCAO').length,
    };
  }

  // ============================================================================
  // PARTE 6: GARANTIA DA QUALIDADE, LIBERAÇÃO / RTS E ARQUIVO TÉCNICO (FINAL)
  // MOMQ 5.7, MOMQ 5.7.1, MOMQ 6.5, P 001-01 / RBAC 43.9, RBAC 145.219, EASA Part-145
  // ============================================================================

  // --- 1. MOTOR DE AUDITORIA DE FECHAMENTO PELA GQ / RT (MOMQ 5.7) ---
  public auditarFechamentoOS(id_os: number, id_auditor?: number): AuditoriaQualidadeResult {
    const os = this.getOrdemServicoById(id_os);
    if (!os) throw new Error('Ordem de Serviço não encontrada');

    const itensDetalhados: ItemAuditoriaQualidade[] = [];
    const motivosBloqueio: string[] = [];
    const avisosQualidade: string[] = [];

    // a) Cumprimento de 100% das tarefas abertas na OS (Form F 001-09-2)
    const apts = this.getApontamentosByOS(id_os);
    const pendentesApts = apts.filter(
      (a: ApontamentoTarefaOS) => a.status_apontamento === 'PENDENTE' || a.status_apontamento === 'EM_ANDAMENTO'
    );
    const tarefasCompletas =
      apts.length > 0
        ? pendentesApts.length === 0
        : os.tarefas_discrepancias.every(
            (t) => t.status_tarefa === 'EXECUTADA' || t.status_tarefa === 'INSPECIONADA'
          );

    if (!tarefasCompletas) {
      motivosBloqueio.push(
        `Existem ${pendentesApts.length || 1} tarefa(s) pendente(s) de execução/inspeção na OS (RBAC 145.109).`
      );
      itensDetalhados.push({
        item: 'TAREFAS_OS',
        descricao: 'Cumprimento de 100% das tarefas abertas na OS (Form F 001-09-2)',
        status: 'NAO_CONFORME',
        detalhes: `${pendentesApts.length || 1} tarefa(s) pendente(s) de conclusão`,
        bloqueante: true,
      });
    } else {
      itensDetalhados.push({
        item: 'TAREFAS_OS',
        descricao: 'Cumprimento de 100% das tarefas abertas na OS (Form F 001-09-2)',
        status: 'CONFORME',
        detalhes: `Todas as ${apts.length || os.tarefas_discrepancias.length} tarefas executadas com dados técnicos vigentes`,
        bloqueante: true,
      });
    }

    // b) Fechamento e resolução de todos os Relatórios de Inspeção (RIs / Form F 001-12)
    const ris = this.getRelatoriosInspecao({ id_os });
    const risAbertos = ris.filter((r) => r.status_ri !== 'APROVADO_ENCERRADO');
    const risConformes = risAbertos.length === 0;

    if (!risConformes) {
      motivosBloqueio.push(
        `Existem ${risAbertos.length} Relatório(s) de Inspeção (RI Form F 001-12) em aberto ou sem aprovação APRS.`
      );
      itensDetalhados.push({
        item: 'RIS_F001_12',
        descricao: 'Resolução e aprovação APRS de todos os Relatórios de Inspeção (Form F 001-12)',
        status: 'NAO_CONFORME',
        detalhes: `RIs impeditivos em aberto: ${risAbertos.map((r) => r.numero_ri).join(', ')}`,
        bloqueante: true,
      });
    } else {
      itensDetalhados.push({
        item: 'RIS_F001_12',
        descricao: 'Resolução e aprovação APRS de todos os Relatórios de Inspeção (Form F 001-12)',
        status: 'CONFORME',
        detalhes:
          ris.length > 0
            ? `Todos os ${ris.length} RIs resolvidos e aprovados pelo Inspetor APRS`
            : 'Nenhuma não-conformidade pendente na aeronave',
        bloqueante: true,
      });
    }

    // c) Assinaturas e dupla validação de todos os Itens IIO (P 001-07 / MOMQ 5.4)
    const iioApts = apts.filter((a: ApontamentoTarefaOS) => a.is_iio);
    const iioPendentes = iioApts.filter(
      (a: ApontamentoTarefaOS) =>
        !a.assinatura_dupla_iio_valida ||
        !a.id_inspetor_aprs ||
        a.id_mecanico_executor === a.id_inspetor_aprs
    );
    const iioConforme = iioPendentes.length === 0;

    if (!iioConforme) {
      motivosBloqueio.push(
        `Existem ${iioPendentes.length} tarefa(s) crítica(s) de IIO sem validação dupla independente (P 001-07 / MOMQ 5.4).`
      );
      itensDetalhados.push({
        item: 'IIO_DUPLA_ASSINATURA',
        descricao: 'Dupla assinatura e inspeção independente de Itens de Inspeção Obrigatória (IIO - P 001-07)',
        status: 'NAO_CONFORME',
        detalhes: `${iioPendentes.length} item(ns) IIO sem inspeção independente de Inspetor APRS distinto do executor`,
        bloqueante: true,
      });
    } else {
      itensDetalhados.push({
        item: 'IIO_DUPLA_ASSINATURA',
        descricao: 'Dupla assinatura e inspeção independente de Itens de Inspeção Obrigatória (IIO - P 001-07)',
        status: 'CONFORME',
        detalhes:
          iioApts.length > 0
            ? `${iioApts.length} tarefa(s) IIO com dupla assinatura independente (Executor + Inspetor APRS)`
            : 'Sem itens IIO impeditivos',
        bloqueante: true,
      });
    }

    // d) Validação do cumprimento de DAs/ADs/SBs e emissão da FCDA (Form F 001-03-2)
    const fcdas = this.fcdas.filter((f) => f.matricula_aeronave === os.campo_02_matricula);
    let fcdaConforme = true;
    if (os.diretrizes_vinculadas && os.diretrizes_vinculadas.length > 0) {
      for (const d of os.diretrizes_vinculadas) {
        const matchFcda = fcdas.find((f) => f.numero_diretriz === d.numero_diretriz);
        if (!matchFcda || matchFcda.status_fcda === 'CANCELADA') {
          fcdaConforme = false;
          motivosBloqueio.push(
            `Diretriz mandatória ${d.numero_diretriz} sem FCDA (Form F 001-03-2) aprovada.`
          );
        }
      }
    }
    itensDetalhados.push({
      item: 'FCDA_DIRETRIZES',
      descricao: 'Cumprimento de Diretrizes de Aeronavegabilidade e emissão de FCDA (Form F 001-03-2)',
      status: fcdaConforme ? 'CONFORME' : 'NAO_CONFORME',
      detalhes: fcdaConforme
        ? 'Diretrizes vinculadas conferidas e FCDAs emitidas conforme Form F 001-03-2'
        : 'FCDA pendente de formalização para diretrizes mandatórias',
      bloqueante: true,
    });

    // e) Devolução de 100% do ferramental PME utilizado (Form F 001-06-1)
    const tools = this.ferramentasUtilizadas.filter((t) => t.id_os === id_os);
    const pendentesDevolucao = tools.filter(
      (t) => t.condicao_devolucao === 'PENDENTE_DEVOLUCAO' || !t.data_hora_checkin
    );
    const toolsConforme = pendentesDevolucao.length === 0;

    if (!toolsConforme) {
      motivosBloqueio.push(
        `Existem ${pendentesDevolucao.length} ferramenta(s) PME com check-in pendente na Ferramentaria (Form F 001-06-1).`
      );
      itensDetalhados.push({
        item: 'FERRAMENTAL_PME',
        descricao: 'Controle Diário de Devolução de Ferramental PME (Form F 001-06-1)',
        status: 'NAO_CONFORME',
        detalhes: `Ferramentas não devolvidas: ${pendentesDevolucao.map((t) => `${t.part_number} (${t.descricao})`).join(', ')}`,
        bloqueante: true,
      });
    } else {
      itensDetalhados.push({
        item: 'FERRAMENTAL_PME',
        descricao: 'Controle Diário de Devolução de Ferramental PME (Form F 001-06-1)',
        status: 'CONFORME',
        detalhes:
          tools.length > 0
            ? `100% do ferramental (${tools.length} PME) conferido, devolvido e com integridade atestada`
            : 'Nenhuma ferramenta pendente de devolução',
        bloqueante: true,
      });
    }

    // f) Confirmação do checklist de limpeza e prevenção FOD com evidências reais (I 001-09 / I 001-14)
    const fodChecklist = this.getChecklistFodByOS(id_os);
    const fodConforme = Boolean(
      fodChecklist &&
      fodChecklist.recolhimento_todas_ferramentas &&
      fodChecklist.contagem_ferramentas_confere &&
      fodChecklist.inspecao_visual_baias_motores_paineis &&
      fodChecklist.limpeza_residuos_freio_arames_panos &&
      fodChecklist.paineis_acesso_fechados_travados &&
      toolsConforme
    );

    if (!fodConforme) {
      motivosBloqueio.push(
        'BLOQUEIO FOD (I 001-09 / I 001-14): Checklist de Desobstrução, Limpeza e Prevenção FOD não realizado ou pendente de recolhimento físico de ferramentas.'
      );
      itensDetalhados.push({
        item: 'CHECKLIST_FOD',
        descricao: 'Checklist de Limpeza de Áreas, Desobstrução e Prevenção FOD (I 001-09 / I 001-14)',
        status: 'NAO_CONFORME',
        detalhes: fodChecklist
          ? 'Checklist FOD preenchido mas com pendências físicas ou ferramentas em aberto'
          : 'Checklist físico de desobstrução e prevenção FOD ainda não foi executado pelo Inspetor APRS',
        bloqueante: true,
      });
    } else {
      itensDetalhados.push({
        item: 'CHECKLIST_FOD',
        descricao: 'Checklist de Limpeza de Áreas, Desobstrução e Prevenção FOD (I 001-09 / I 001-14)',
        status: 'CONFORME',
        detalhes: `Checklist FOD executado e atestado por ${fodChecklist?.inspetor_nome || 'Inspetor'} em ${fodChecklist?.data_hora_verificacao}`,
        bloqueante: true,
      });
    }

    // g) Validação da Passagem de Turno F 001-24 (se houver passagens na OS)
    const pts = this.getPassagensTurno({ id_os });
    const ptsPendentes = pts.filter((p) => !p.aceite_formal_entrante && !p.rubrica_tecnico_entrando);
    const passagemConforme = ptsPendentes.length === 0;

    if (!passagemConforme) {
      motivosBloqueio.push(
        `BLOQUEIO PASSAGEM DE TURNO (F 001-24): Existem ${ptsPendentes.length} passagem(ns) de turno pendentes de aceite formal.`
      );
      itensDetalhados.push({
        item: 'PASSAGEM_TURNO',
        descricao: 'Passagem de Turno F 001-24 e continuidade de serviços',
        status: 'NAO_CONFORME',
        detalhes: `Passagens pendentes de aceite: ${ptsPendentes.map((p) => p.numero_passagem).join(', ')}`,
        bloqueante: true,
      });
    } else if (pts.length > 0) {
      itensDetalhados.push({
        item: 'PASSAGEM_TURNO',
        descricao: 'Passagem de Turno F 001-24 e continuidade de serviços',
        status: 'CONFORME',
        detalhes: `${pts.length} passagem(ns) de turno formalizadas e aceitas`,
        bloqueante: false,
      });
    }

    const aprovado = motivosBloqueio.length === 0;
    const auditor = id_auditor
      ? this.tecnicos.find((t) => t.id_tecnico === id_auditor)
      : this.tecnicos.find((t) => t.cargo === 'Inspetor' || t.cargo === 'Inspetor Chefe' || t.cargo === 'Gerente Qualidade') ||
        this.tecnicos.find((t) => t.id_tecnico === 2);
    if (!auditor) {
      throw new Error('Auditor da qualidade não identificado no cadastro.');
    }

    return {
      id_os,
      numero_os: os.numero_os,
      matricula: os.campo_02_matricula,
      modelo: os.campo_03_modelo,
      base: os.campo_06_base_executante,
      aprovado_para_fechamento: aprovado,
      itens_auditados: {
        tarefas_100_concluidas: tarefasCompletas,
        ris_100_resolvidos: risConformes,
        iio_dupla_assinatura_concluida: iioConforme,
        fcda_diretrizes_cumpridas: fcdaConforme,
        ferramental_100_devolvido: toolsConforme,
        checklist_fod_concluido: fodConforme,
      },
      itens_detalhados: itensDetalhados,
      motivos_bloqueio: motivosBloqueio,
      avisos_qualidade: avisosQualidade,
      data_auditoria: new Date().toISOString(),
      auditor_responsavel: auditor ? auditor.nome_completo : 'Auditoria da Qualidade MRO',
      canac_auditor: auditor ? auditor.canac : '114520',
    };
  }

  // --- 2. GERAÇÃO DE ANOTAÇÃO PADRONIZADA PARA O LIVRO TÉCNICO DA AERONAVE (LTA) ---
  public gerarTextoLTA(id_os: number, id_rts?: number): { texto: string; codigo: string } {
    const os = this.getOrdemServicoById(id_os);
    if (!os) throw new Error('Ordem de Serviço não encontrada');

    const rts = id_rts
      ? this.liberacoesRts.find((r) => r.id_rts === id_rts)
      : this.liberacoesRts.find((r) => r.id_os === id_os);

    const mats = this.materiaisAplicados.filter((m) => m.id_os === id_os);
    const apts = this.apontamentos.filter((a) => a.id_os === id_os);

    const materiaisTexto =
      mats.length > 0
        ? mats
            .map(
              (m) =>
                `• P/N: ${m.part_number} | S/N: ${m.serial_number} | Lote: ${m.lote_batch} | Qtd: ${m.quantidade} ${m.unidade_medida} | Doc: ${m.tipo_documento_rastreabilidade} nº ${m.numero_documento_rastreabilidade}`
            )
            .join('\n')
        : 'Nenhum componente ou peça primária substituído.';

    const tarefasTexto =
      apts.length > 0
        ? apts
            .map(
              (a) =>
                `• Item ${a.item_tarefa}: ${a.titulo_tarefa} [Ref: ${a.referencia_amm_task}]${
                  a.is_iio ? ' (ITEM IIO - DUPLA INSPEÇÃO APRS REALIZADA)' : ''
                }`
            )
            .join('\n')
        : os.campo_11_escopo_servico;

    const ano = os.campo_07_data_abertura.includes('/')
      ? os.campo_07_data_abertura.split('/')[2]
      : '2026';
    const codigo = `LTA-${ano}-${os.numero_os.replace('OS-', '')}-${os.campo_02_matricula.replace('-', '')}`;

    const texto = `================================================================================
IMPACTO AVIATION MRO (COM 200607-05 / EASA.145.1003)
ANOTAÇÃO OFICIAL PARA LIVRO TÉCNICO DE BORDO (LTA) / AIRCRAFT TECHNICAL LOG (ATL)
Código de Autenticação Digital: ${codigo}
================================================================================
AERONAVE: ${os.campo_02_matricula} | MODELO: ${os.campo_03_modelo} | MSN: ${os.campo_04_msn}
OPERADOR: ${os.campo_05_operador} | BASE OPERACIONAL: ${os.campo_06_base_executante}
TEMPO TOTAL (TSN): ${os.campo_09_tsn} | CICLOS TOTAIS (CSN): ${os.campo_10_csn}
ORDEM DE SERVIÇO: Form F 001-09-2 Nº ${os.numero_os}
RTS Nº: ${rts ? rts.numero_rts : 'RTS-2026-PENDENTE'}
PERÍODO DE EXECUÇÃO: ${os.campo_07_data_abertura} às ${os.campo_07_hora_abertura} até ${os.campo_08_data_encerramento_real || new Date().toLocaleDateString('pt-BR')} ${os.campo_08_hora_encerramento_real || '18:00 UTC'}

1. SERVIÇOS E INSPEÇÕES EXECUTADOS:
${tarefasTexto}

2. COMPONENTES E MATERIAIS APLICADOS (RASTREABILIDADE RBAC 145.109 / RBAC 43):
${materiaisTexto}

3. DADOS TÉCNICOS APROVADOS E REFERÊNCIAS UTILIZADAS:
${os.campo_12_manuais_texto_formatado || 'AMM / SRM / WDM conforme cartas de concessão vigentes.'}

4. DECLARAÇÃO DE APROVAÇÃO PARA RETORNO AO SERVIÇO (RTS - MOMQ 5.7.1):
[X] ANAC RBAC 43.9: "Certifica-se que os serviços acima descritos foram executados de acordo com os regulamentos vigentes da ANAC (RBAC 145 / RBAC 43) e os dados técnicos aprovados pelo fabricante. Em respeito aos serviços executados, a aeronave é considerada APROVADA PARA RETORNO AO SERVIÇO (RTS)."
${
  os.declaracao_easa_part145_aplicada
    ? '[X] EASA PART-145: "Certifies that the work specified, except as otherwise specified, was carried out in accordance with EASA Part145 and in respect that work the aircraft is considered ready for release to service."'
    : ''
}

5. ASSINATURAS E RESPONSABILIDADE TÉCNICA:
• Inspetor APRS: ${rts ? rts.inspetor_aprs_nome : os.inspetor_aprs_nome} - CANAC: ${rts ? rts.inspetor_aprs_canac : os.inspetor_aprs_canac} (Assinatura Digital: ${rts ? rts.assinatura_digital_aprs : 'OK'})
• Diretor Técnico (RT): ${rts ? rts.rt_nome : os.rt_nome} - CANAC: ${rts ? rts.rt_canac : os.rt_canac} (CREA: ${rts ? rts.rt_crea : 'CREA-SP 50628912-D'})
================================================================================`;

    return { texto, codigo };
  }

  // --- 3. APROVAÇÃO PARA RETORNO AO SERVIÇO (RTS) E EMISSÃO DE DOSSIÊ DIGITAL (PARTE 6) ---
  public emitirLiberacaoRTS(params: {
    id_os: number;
    id_inspetor_aprs: number;
    id_rt: number;
    tipo_declaracao?: TipoDeclaracaoRelease;
    observacoes_limitacoes?: string;
    via_1_recebedor?: string;
    protocolo_cliente?: string;
  }): { rts: LiberacaoRTS; dossie: DossieDigitalOS; os: OrdemServicoF001_09_2 } {
    const os = this.getOrdemServicoById(params.id_os);
    if (!os) throw new Error('Ordem de Serviço não encontrada');

    // Executa auditoria regulatória compulsória
    const auditoria = this.auditarFechamentoOS(params.id_os, params.id_inspetor_aprs);
    if (!auditoria.aprovado_para_fechamento) {
      throw new Error(
        `BLOQUEIO DE AUDITORIA GQ: Não é permitida a emissão de RTS com pendências não conformes:\n${auditoria.motivos_bloqueio.join(
          '\n'
        )}`
      );
    }

    const insp = this.tecnicos.find((t) => t.id_tecnico === params.id_inspetor_aprs);
    if (!insp) {
      throw new Error(`Inspetor APRS ID ${params.id_inspetor_aprs} não encontrado no cadastro técnico ativo.`);
    }

    const rt = this.tecnicos.find((t) => t.id_tecnico === params.id_rt);
    if (!rt) {
      throw new Error(`Responsável Técnico (RT) ID ${params.id_rt} não encontrado no cadastro técnico ativo.`);
    }

    const agora = new Date();
    const agoraISO = agora.toISOString();
    const agoraFormatada = agora.toLocaleDateString('pt-BR');
    const horaFormatada = `${String(agora.getHours()).padStart(2, '0')}:${String(
      agora.getMinutes()
    ).padStart(2, '0')} UTC`;

    const seq = this.nextRtsSeq++;
    const numRTS = `RTS-2026-${String(seq).padStart(4, '0')}`;

    const tipoDeclaracao =
      params.tipo_declaracao ||
      (os.declaracao_easa_part145_aplicada ? 'DUAL_RELEASE_ANAC_EASA' : 'ANAC_RBAC_43_9');
    const requerEasa =
      tipoDeclaracao === 'DUAL_RELEASE_ANAC_EASA' || tipoDeclaracao === 'EASA_PART_145';

    const textoAnac = `Certifica-se que os serviços descritos na ${os.numero_os} foram executados de acordo com os regulamentos vigentes da ANAC (RBAC 145 / RBAC 43) e os dados técnicos aprovados pelo fabricante. Em respeito aos trabalhos especificados, a aeronave é considerada APROVADA PARA RETORNO AO SERVIÇO (RTS).`;
    const textoEasa = requerEasa
      ? 'Certifies that the work specified, except as otherwise specified, was carried out in accordance with EASA Part145 and in respect that work the aircraft is considered ready for release to service.'
      : undefined;

    const idRts = this.nextRtsId++;
    const novaRTS: LiberacaoRTS = {
      id_rts: idRts,
      numero_rts: numRTS,
      id_os: os.id_os,
      numero_os: os.numero_os,
      matricula_aeronave: os.campo_02_matricula,
      modelo_aeronave: os.campo_03_modelo,
      msn_aeronave: os.campo_04_msn,
      operador_cliente: os.campo_05_operador,
      base_liberacao: os.campo_06_base_executante,
      data_hora_liberacao: agoraISO,
      tsn_liberacao: os.campo_09_tsn,
      csn_liberacao: os.campo_10_csn,
      tipo_declaracao: tipoDeclaracao,
      texto_declaracao_anac: textoAnac,
      texto_declaracao_easa: textoEasa,
      requer_declaracao_easa: requerEasa,
      id_inspetor_aprs: insp.id_tecnico,
      inspetor_aprs_nome: insp.nome_completo,
      inspetor_aprs_canac: insp.canac,
      inspetor_aprs_licenca_easa: `EASA.66.BR.${insp.canac} (Cat. B1/B2)`,
      assinatura_digital_aprs: `${insp.nome_completo
        .split(' ')
        .map((n) => n[0])
        .join('')}-${insp.canac}-APRS-RTS`,
      id_rt: rt.id_tecnico,
      rt_nome: rt.nome_completo,
      rt_canac: rt.canac,
      rt_crea: 'CREA-SP 50628912-D',
      assinatura_digital_rt: `${rt.nome_completo
        .split(' ')
        .map((n) => n[0])
        .join('')}-${rt.canac}-RT-CHIEF`,
      texto_anotacao_lta: '',
      codigo_anotacao_lta: '',
      distribuicao_vias: {
        via_1_pcp: {
          status: 'ENTREGUE_AO_PCP',
          data: `${agoraFormatada} ${horaFormatada}`,
          recebedor:
            params.via_1_recebedor ||
            `PCP Impacto - Protocolo PCP-2026-${String(seq).padStart(4, '0')}`,
        },
        via_2_base: {
          status: 'ARQUIVADA_NA_BASE',
          data: `${agoraFormatada} ${horaFormatada}`,
          base: os.campo_06_base_executante,
        },
        via_3_cliente: {
          status: 'ENTREGUE_AO_OPERADOR',
          data: `${agoraFormatada} ${horaFormatada}`,
          protocolo_cliente:
            params.protocolo_cliente ||
            `${os.campo_05_operador.slice(0, 5).toUpperCase()}-DESPACHO-${os.campo_02_matricula}`,
        },
      },
      observacoes_limitacoes:
        (sanitizeNA(params.observacoes_limitacoes) as string) ||
        'Aeronave liberada sem limitações operacionais.',
      status: 'VIGENTE',
      criado_em: agoraISO,
    };

    const ltaGen = this.gerarTextoLTA(os.id_os, novaRTS.id_rts);
    novaRTS.texto_anotacao_lta = ltaGen.texto;
    novaRTS.codigo_anotacao_lta = ltaGen.codigo;

    this.liberacoesRts.unshift(novaRTS);

    // Atualiza status da OS para ENCERRADA
    os.status_os = 'ENCERRADA';
    os.campo_08_data_encerramento_real = agoraFormatada;
    os.campo_08_hora_encerramento_real = horaFormatada;
    os.observacoes = `${os.observacoes}; OS homologada e encerrada pela GQ. Liberado RTS ${numRTS}.`;

    // Geração do Dossiê Digital Consolidado (MOMQ 6.5 / RBAC 145.219 / EASA Part-145.A.55)
    const apts = this.getApontamentosByOS(os.id_os);
    const ris = this.getRelatoriosInspecao({ id_os: os.id_os });
    const fcdas = this.fcdas.filter((f) => f.matricula_aeronave === os.campo_02_matricula);
    const pts = this.getPassagensTurno({ id_os: os.id_os });
    const tools = this.ferramentasUtilizadas.filter((t) => t.id_os === os.id_os);
    const mats = this.materiaisAplicados.filter((m) => m.id_os === os.id_os);
    const fodChecklist = this.getChecklistFodByOS(os.id_os);

    const anoFechamento = agora.getFullYear();
    const limAnac = `${agoraFormatada.split('/')[0]}/${agoraFormatada.split('/')[1]}/${
      anoFechamento + 5
    }`;
    const limEasa = `${agoraFormatada.split('/')[0]}/${agoraFormatada.split('/')[1]}/${
      anoFechamento + 3
    }`;

    // Construção Canônica dos Dados Reais da OS para Cálculo do Hash SHA-256 Criptográfico
    const canonicalPayload = {
      empresa: 'Impacto Aviation Ltda (COM 200607-05 / EASA.145.1003)',
      tipo_documento: 'DOSSIE_TECNICO_DIGITAL_OS',
      numero_os: os.numero_os,
      matricula: os.campo_02_matricula,
      modelo: os.campo_03_modelo,
      msn: os.campo_04_msn,
      operador: os.campo_05_operador,
      base: os.campo_06_base_executante,
      data_fechamento_os: agoraFormatada,
      data_rts: agoraFormatada,
      numero_rts: numRTS,
      tipo_release: tipoDeclaracao,
      rts: novaRTS,
      os_f001_09_2: os,
      apontamentos_tarefas: apts,
      relatorios_inspecao_ri: ris,
      diretrizes_fcda: fcdas,
      ferramentas_utilizadas: tools,
      materiais_aplicados: mats,
      passagens_turno: pts,
      checklist_fod: fodChecklist || null,
      gerado_em: agoraISO,
    };

    const canonicalJson = JSON.stringify(canonicalPayload);
    const realHashSha256 = crypto.createHash('sha256').update(canonicalJson).digest('hex');

    // Gravação via Storage Provider desacoplado (Local / Nuvem)
    const storagePath = `dossies/${os.numero_os}/dossie_consolidado_${os.numero_os}.json`;
    storageProvider.saveDocument(storagePath, canonicalJson, 'application/json').catch((err) => {
      console.warn('[Storage] Aviso ao persistir arquivo de dossiê:', err.message);
    });

    const novoDossie: DossieDigitalOS = {
      id_dossie: `DOSSIE-${os.numero_os}`,
      id_os: os.id_os,
      numero_os: os.numero_os,
      matricula: os.campo_02_matricula,
      modelo: os.campo_03_modelo,
      msn: os.campo_04_msn,
      operador: os.campo_05_operador,
      base: os.campo_06_base_executante,
      data_fechamento_os: agoraFormatada,
      data_rts: agoraFormatada,
      numero_rts: numRTS,
      tipo_release: tipoDeclaracao,
      os_f001_09_2_incluso: true,
      total_tarefas_apontadas: apts.length || os.tarefas_discrepancias.length,
      total_tarefas_iio: apts.filter((a: ApontamentoTarefaOS) => a.is_iio).length,
      total_ris_f001_12_inclusos: ris.length,
      total_fcdas_f001_03_2_inclusas: fcdas.length,
      passagem_turno_f001_24_inclusa: pts.length > 0,
      ferramentas_f001_06_1_inclusas: tools.length,
      materiais_rastreabilidade_inclusos: mats.length,
      checklist_fod_concluido: Boolean(fodChecklist && fodChecklist.recolhimento_todas_ferramentas),
      anotacao_lta_emitida: true,
      data_limite_retencao_anac_5anos: limAnac,
      data_limite_retencao_easa_3anos: limEasa,
      status_custodia: 'CUSTODIA_OBRIGATORIA_VIGENTE',
      local_armazenamento_fisico: `Arquivo Central PCP - Pasta ${os.campo_03_modelo.split(' ')[0]}-${
        os.campo_06_base_executante
      }-${os.numero_os.replace('OS-', '')}`,
      hash_integridade_digital: realHashSha256,
      tamanho_estimado_pdf: `${(4.2 + apts.length * 0.4 + mats.length * 0.3).toFixed(
        1
      )} MB (Consolidado)`,
    };

    const existIdx = this.dossiesDigitais.findIndex((d) => d.id_os === os.id_os);
    if (existIdx >= 0) {
      this.dossiesDigitais[existIdx] = novoDossie;
    } else {
      this.dossiesDigitais.unshift(novoDossie);
    }

    // Registro na política de Retenção Documental Configurável (MOMQ / RBAC 145.211)
    const novaRetencao = {
      id_retencao: this.nextRetencaoId++,
      id_dossie: novoDossie.id_dossie,
      id_os: os.id_os,
      data_criacao: agoraISO,
      data_encerramento: agoraISO,
      data_rts: agoraISO,
      data_minima_retencao: `${anoFechamento + 5}-12-31`,
      politica_retencao: 'RBAC 145.211 (5 ANOS APÓS RTS) / EASA Part-145.A.55',
      status_retencao: 'VIGENTE',
      bloqueio_exclusao: true,
      motivo_bloqueio: 'Retenção regulatória obrigatória em conformidade com RBAC 145.211 / EASA 145.A.55.',
    };
    this.retencoesDocumentais.unshift(novaRetencao);

    // Registro na Trilha de Auditoria
    auditLogger.log({
      usuario_nome: rt.nome_completo,
      id_usuario: rt.id_tecnico,
      cargo: rt.cargo,
      entidade: 'RTS',
      id_entidade: numRTS,
      acao: 'EMISSAO_RTS_E_DOSSIE',
      estado_anterior: { status_os: 'RTS' },
      estado_posterior: { status_os: 'ENCERRADA', rts: numRTS, sha256: realHashSha256 },
      motivo_detalhes: `Aprovação para Retorno ao Serviço e emissão de Dossiê Técnico Digital com hash SHA-256 verificado.`,
    }).catch(console.warn);

    return { rts: novaRTS, dossie: novoDossie, os };
  }

  // --- 4. CONSULTA DE LIBERAÇÕES RTS ---
  public getLiberacoesRTS(filtros?: { id_os?: number; base?: string; search?: string }): LiberacaoRTS[] {
    let list = this.liberacoesRts.map((r) => ({
      ...r,
      texto_declaracao_anac: sanitizeNA(r.texto_declaracao_anac) as string,
      observacoes_limitacoes: sanitizeNA(r.observacoes_limitacoes) as string,
    }));

    if (filtros?.id_os) {
      list = list.filter((r) => r.id_os === filtros.id_os);
    }
    if (filtros?.base && filtros.base !== 'TODAS') {
      list = list.filter((r) => r.base_liberacao === filtros.base);
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.numero_rts.toLowerCase().includes(q) ||
          r.numero_os.toLowerCase().includes(q) ||
          r.matricula_aeronave.toLowerCase().includes(q) ||
          r.operador_cliente.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.id_rts - a.id_rts);
  }

  public getLiberacaoRTSById(id_rts: number): LiberacaoRTS | undefined {
    return this.liberacoesRts.find((r) => r.id_rts === id_rts);
  }

  public getLiberacaoRTSByOS(id_os: number): LiberacaoRTS | undefined {
    return this.liberacoesRts.find((r) => r.id_os === id_os);
  }

  public atualizarDistribuicaoViasRTS(
    id_rts: number,
    vias: {
      via_1_status?: 'ENTREGUE_AO_PCP';
      via_1_recebedor?: string;
      via_2_status?: 'ARQUIVADA_NA_BASE';
      via_3_status?: 'ENTREGUE_AO_OPERADOR';
      via_3_protocolo?: string;
    }
  ): LiberacaoRTS {
    const rts = this.getLiberacaoRTSById(id_rts);
    if (!rts) throw new Error('Liberação RTS não encontrada');

    const agora = new Date().toLocaleDateString('pt-BR');

    if (vias.via_1_status) {
      rts.distribuicao_vias.via_1_pcp.status = vias.via_1_status;
      rts.distribuicao_vias.via_1_pcp.data = agora;
      if (vias.via_1_recebedor) rts.distribuicao_vias.via_1_pcp.recebedor = vias.via_1_recebedor;
    }
    if (vias.via_2_status) {
      rts.distribuicao_vias.via_2_base.status = vias.via_2_status;
      rts.distribuicao_vias.via_2_base.data = agora;
    }
    if (vias.via_3_status) {
      rts.distribuicao_vias.via_3_cliente.status = vias.via_3_status;
      rts.distribuicao_vias.via_3_cliente.data = agora;
      if (vias.via_3_protocolo) rts.distribuicao_vias.via_3_cliente.protocolo_cliente = vias.via_3_protocolo;
    }

    return rts;
  }

  // --- 5. CONSULTA DE DOSSIÊS DIGITAIS CONSOLIDADOS (MOMQ 6.5) ---
  public getDossiesDigitais(filtros?: {
    base?: string;
    operador?: string;
    search?: string;
  }): DossieDigitalOS[] {
    let list = this.dossiesDigitais;

    if (filtros?.base && filtros.base !== 'TODAS') {
      list = list.filter((d) => d.base === filtros.base);
    }
    if (filtros?.operador && filtros.operador !== 'TODOS') {
      list = list.filter((d) => d.operador.includes(filtros.operador!));
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.id_dossie.toLowerCase().includes(q) ||
          d.numero_os.toLowerCase().includes(q) ||
          d.matricula.toLowerCase().includes(q) ||
          d.numero_rts.toLowerCase().includes(q) ||
          d.operador.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getDossieDigitalById(id_dossie: string): DossieDigitalOS | undefined {
    return this.dossiesDigitais.find((d) => d.id_dossie === id_dossie);
  }

  public getDossieDigitalByOS(id_os: number): DossieDigitalOS | undefined {
    return this.dossiesDigitais.find((d) => d.id_os === id_os);
  }

  // --- 7. CHECKLIST FOD (I 001-09 / I 001-14) ---
  public getChecklistFodByOS(id_os: number): (ChecklistFodEncerramento & { id_os: number }) | undefined {
    return this.checklistsFod.find((f) => f.id_os === id_os);
  }

  public registrarChecklistFod(
    data: ChecklistFodEncerramento & { id_os: number }
  ): ChecklistFodEncerramento & { id_os: number } {
    const os = this.getOrdemServicoById(data.id_os);
    if (!os) throw new Error(`Ordem de Serviço ID ${data.id_os} não encontrada.`);

    const insp = this.tecnicos.find((t) => t.id_tecnico === data.id_inspetor_verificador);
    if (!insp) throw new Error(`Inspetor APRS ID ${data.id_inspetor_verificador} não encontrado.`);

    const agora = new Date();
    const checklist: ChecklistFodEncerramento & { id_os: number } = {
      ...data,
      id_os: data.id_os,
      inspetor_nome: insp.nome_completo,
      inspetor_canac: insp.canac,
      data_hora_verificacao: data.data_hora_verificacao || `${agora.toLocaleDateString('pt-BR')} ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')} UTC`,
    };

    const existIdx = this.checklistsFod.findIndex((f) => f.id_os === data.id_os);
    if (existIdx >= 0) {
      this.checklistsFod[existIdx] = checklist;
    } else {
      this.checklistsFod.unshift(checklist);
    }

    auditLogger.log({
      usuario_nome: insp.nome_completo,
      id_usuario: insp.id_tecnico,
      cargo: insp.cargo,
      entidade: 'CHECKLIST_FOD',
      id_entidade: `OS-${os.numero_os}`,
      acao: 'REGISTRO_EVIDENCIA_FOD',
      estado_posterior: checklist,
      motivo_detalhes: 'Inspeção física e checklist de desobstrução e prevenção FOD concluído com evidências.',
    }).catch(console.warn);

    return checklist;
  }

  // --- 8. RETENÇÃO DOCUMENTAL CONFIGURÁVEL (RBAC 145.211 / EASA Part-145.A.55) ---
  public getRetencoes(id_os?: number): any[] {
    if (id_os) {
      return this.retencoesDocumentais.filter((r) => r.id_os === id_os);
    }
    return this.retencoesDocumentais;
  }

  public tentarExcluirDossie(id_dossie: string): void {
    const dossie = this.getDossieDigitalById(id_dossie);
    if (!dossie) throw new Error('Dossiê não encontrado.');

    const retencao = this.retencoesDocumentais.find((r) => r.id_dossie === id_dossie);
    if (retencao && retencao.bloqueio_exclusao) {
      throw new Error(
        `BLOQUEIO DE EXCLUSÃO (RBAC 145.211 / EASA Part-145.A.55): O dossiê técnico '${id_dossie}' está sob custódia obrigatória até ${retencao.data_minima_retencao}. Exclusão de registros aeronáuticos é estritamente proibida por lei.`
      );
    }

    throw new Error('Exclusão de dossiês arquivados bloqueada pelas diretrizes de governança da organização.');
  }

  // --- 9. VERIFICAÇÃO CRIPTOGRÁFICA REAL DE INTEGRIDADE SHA-256 DO DOSSIÊ ---
  public async verificarIntegridadeDossie(id_dossie: string): Promise<{
    id_dossie: string;
    numero_os: string;
    hash_armazenado: string;
    hash_recalculado: string;
    integro: boolean;
    status: 'INTEGRO_VERIFICADO' | 'DIVERGENCIA_DETECTADA';
    data_verificacao: string;
  }> {
    const dossie = this.getDossieDigitalById(id_dossie);
    if (!dossie) throw new Error(`Dossiê digital '${id_dossie}' não encontrado.`);

    const storagePath = `dossies/${dossie.numero_os}/dossie_consolidado_${dossie.numero_os}.json`;
    let hashRecalculado = dossie.hash_integridade_digital;

    try {
      const buffer = await storageProvider.getDocument(storagePath);
      hashRecalculado = crypto.createHash('sha256').update(buffer).digest('hex');
    } catch {
      // Se não gravado em arquivo em disco (ex: dados legados em memória), recomputa sobre representação canônica
      const apts = this.getApontamentosByOS(dossie.id_os);
      const ris = this.getRelatoriosInspecao({ id_os: dossie.id_os });
      const fcdas = this.fcdas.filter((f) => f.matricula_aeronave === dossie.matricula);
      const pts = this.getPassagensTurno({ id_os: dossie.id_os });
      const tools = this.ferramentasUtilizadas.filter((t) => t.id_os === dossie.id_os);
      const mats = this.materiaisAplicados.filter((m) => m.id_os === dossie.id_os);
      const fod = this.getChecklistFodByOS(dossie.id_os);
      const os = this.getOrdemServicoById(dossie.id_os);
      const rts = this.getLiberacaoRTSByOS(dossie.id_os);

      const canonicalPayload = {
        empresa: 'Impacto Aviation Ltda (COM 200607-05 / EASA.145.1003)',
        tipo_documento: 'DOSSIE_TECNICO_DIGITAL_OS',
        numero_os: dossie.numero_os,
        matricula: dossie.matricula,
        modelo: dossie.modelo,
        msn: dossie.msn,
        operador: dossie.operador,
        base: dossie.base,
        data_fechamento_os: dossie.data_fechamento_os,
        data_rts: dossie.data_rts,
        numero_rts: dossie.numero_rts,
        tipo_release: dossie.tipo_release,
        rts: rts || null,
        os_f001_09_2: os || null,
        apontamentos_tarefas: apts,
        relatorios_inspecao_ri: ris,
        diretrizes_fcda: fcdas,
        ferramentas_utilizadas: tools,
        materiais_aplicados: mats,
        passagens_turno: pts,
        checklist_fod: fod || null,
        gerado_em: os?.atualizado_em || new Date().toISOString(),
      };
      hashRecalculado = crypto.createHash('sha256').update(JSON.stringify(canonicalPayload)).digest('hex');
    }

    const integro = hashRecalculado.toLowerCase() === dossie.hash_integridade_digital.toLowerCase();

    return {
      id_dossie,
      numero_os: dossie.numero_os,
      hash_armazenado: dossie.hash_integridade_digital,
      hash_recalculado: hashRecalculado,
      integro,
      status: integro ? 'INTEGRO_VERIFICADO' : 'DIVERGENCIA_DETECTADA',
      data_verificacao: new Date().toISOString(),
    };
  }

  // --- 10. USUÁRIOS E CONTROLE DE ACESSO RBAC ---
  public getUsuarios(): any[] {
    return this.usuarios;
  }

  public getUsuarioById(id: number): any | undefined {
    return this.usuarios.find((u) => u.id_usuario === id);
  }

  // --- 11. PAINEL EXECUTIVO DO GESTOR RESPONSÁVEL (GR) E DIRETOR TÉCNICO (RT) ---
  public getPainelExecutivoStats(): PainelExecutivoStats {
    const todasOS = this.ordensServico;
    const concluidas = todasOS.filter((o) => o.status_os === 'ENCERRADA').length;
    const emAndamento = todasOS.filter(
      (o) => o.status_os !== 'ENCERRADA' && o.status_os !== 'CANCELADA'
    ).length;
    const totalRTS = this.liberacoesRts.length;
    const totalDossies = this.dossiesDigitais.length;
    const totalRIs = this.relatoriosInspecao.length;

    return {
      total_os_concluidas: concluidas,
      total_os_em_andamento: emAndamento,
      total_rts_emitidos: totalRTS,
      taxa_conformidade_qualidade: 99.2,
      taxa_pontualidade_sla: 97.5,
      total_dossies_arquivados: totalDossies,
      dossies_custodia_vigente: totalDossies,
      total_ris_historico: totalRIs,
      tempo_medio_fechamento_horas: 14.5,
      desempenho_bases: [
        { base: 'GRU', os_concluidas: concluidas >= 1 ? 1 : 1, em_andamento: 1, pontualidade_pct: 98.0, ris_abertos: 0 },
        { base: 'CNF', os_concluidas: 0, em_andamento: 0, pontualidade_pct: 100.0, ris_abertos: 0 },
        { base: 'VCP', os_concluidas: 0, em_andamento: 1, pontualidade_pct: 95.0, ris_abertos: 1 },
      ],
      auditorias_recentes: [
        {
          data: '26/09/2026',
          numero_os: 'OS-2026-0084',
          matricula: 'PR-IMA',
          resultado: 'APROVADO_SEM_RESSALVAS',
          auditor: 'Juliana Costa e Silva',
        },
        {
          data: '21/09/2026',
          numero_os: 'OS-2026-0082',
          matricula: 'PR-TYA',
          resultado: 'APROVADO_SEM_RESSALVAS',
          auditor: 'Alexandre Pires Guimarães',
        },
        {
          data: '18/09/2026',
          numero_os: 'OS-2026-0080',
          matricula: 'PT-MEQ',
          resultado: 'APROVADO_COM_AJUSTES',
          auditor: 'Rodrigo Albuquerque da Silva',
        },
      ],
    };
  }
}

export const db = new MroDatabase();

