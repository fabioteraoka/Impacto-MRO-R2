/**
 * Endpoints da API REST para Parte 1 do MRO
 * Impacto Aviation (COM 200607-05 / EASA.145.1003)
 */

import { Router, Request, Response } from 'express';
import { db, sanitizeNA } from './db';
import { auditLogger } from './audit/auditLogger';
import { storageProvider } from './storage/storageProvider';

export const apiRouter = Router();

// --- BASES OPERACIONAIS ---
apiRouter.get('/bases', (req: Request, res: Response) => {
  try {
    const bases = db.getBases();
    res.json({ success: true, data: bases });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/bases', (req: Request, res: Response) => {
  try {
    const { nome_base, codigo_anac, tipo_base, ativo } = req.body;
    if (!nome_base || !codigo_anac) {
      res.status(400).json({ success: false, error: 'Nome da base e código ANAC são obrigatórios' });
      return;
    }
    const newBase = db.createBase({ nome_base, codigo_anac, tipo_base, ativo });
    res.status(201).json({ success: true, data: newBase });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- PESSOAL TÉCNICO (tb_pessoal_tecnico) ---
apiRouter.get('/tecnicos', (req: Request, res: Response) => {
  try {
    const { id_base, cargo, status_qualificacao, search } = req.query;
    const filtros: any = {};
    if (id_base) filtros.id_base = Number(id_base);
    if (cargo) filtros.cargo = String(cargo);
    if (status_qualificacao) filtros.status_qualificacao = String(status_qualificacao);
    if (search) filtros.search = String(search);

    const tecnicos = db.getTecnicos(filtros);
    res.json({ success: true, total: tecnicos.length, data: tecnicos });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/tecnicos/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const tecnico = db.getTecnicoById(id);
    if (!tecnico) {
      res.status(404).json({ success: false, error: 'Técnico não encontrado' });
      return;
    }
    res.json({ success: true, data: tecnico });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/tecnicos', (req: Request, res: Response) => {
  try {
    const {
      nome_completo,
      canac,
      cpf,
      cargo,
      licenca_cct,
      data_admissao,
      status_exame_toxicologico,
      id_base_alocada,
      ativo,
    } = req.body;

    if (!nome_completo || !canac || !cpf || !cargo) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: nome_completo, canac, cpf, cargo',
      });
      return;
    }

    const novoTecnico = db.createTecnico({
      nome_completo,
      canac,
      cpf,
      cargo,
      licenca_cct: licenca_cct || 'N/A', // Regra N/A
      data_admissao: data_admissao || new Date().toISOString().split('T')[0],
      status_exame_toxicologico: status_exame_toxicologico || 'EM_DIA',
      id_base_alocada: Number(id_base_alocada) || 1,
      ativo: ativo ?? true,
    });

    res.status(201).json({ success: true, data: novoTecnico });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/tecnicos/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateTecnico(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Técnico não encontrado' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.patch('/tecnicos/:id/toggle-ativo', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const ok = db.toggleTecnicoAtivo(id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Técnico não encontrado' });
      return;
    }
    const tecnico = db.getTecnicoById(id);
    res.json({ success: true, data: tecnico });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- DESIGNAÇÃO DE FUNÇÕES (F 001-03) ---
apiRouter.get('/designacoes', (req: Request, res: Response) => {
  try {
    const id_tecnico = req.query.id_tecnico ? Number(req.query.id_tecnico) : undefined;
    const designacoes = db.getDesignacoes(id_tecnico);
    res.json({ success: true, data: designacoes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/designacoes', (req: Request, res: Response) => {
  try {
    const { id_tecnico, numero_f001_03, funcoes_autorizadas, data_emissao, data_validade, assinado_por_rt, status } =
      req.body;

    if (!id_tecnico || !funcoes_autorizadas || !data_validade) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id_tecnico, funcoes_autorizadas, data_validade',
      });
      return;
    }

    const novaDesig = db.createDesignacao({
      id_tecnico: Number(id_tecnico),
      numero_f001_03,
      funcoes_autorizadas,
      data_emissao: data_emissao || new Date().toISOString().split('T')[0],
      data_validade,
      assinado_por_rt: Boolean(assinado_por_rt),
      status: status || 'ATIVO',
    });

    res.status(201).json({ success: true, data: novaDesig });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ação de Assinatura pelo Responsável Técnico (RT)
apiRouter.post('/designacoes/:id/assinar-rt', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const ok = db.assinarDesignacaoRT(id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Designação F 001-03 não encontrada' });
      return;
    }
    res.json({
      success: true,
      message: 'Formulário F 001-03 assinado com sucesso pelo Responsável Técnico (RT). Qualificação atualizada.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/designacoes/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateDesignacao(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Designação não encontrada' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- TREINAMENTOS MNT-002 ---
apiRouter.get('/treinamentos', (req: Request, res: Response) => {
  try {
    const id_tecnico = req.query.id_tecnico ? Number(req.query.id_tecnico) : undefined;
    const treinamentos = db.getTreinamentos(id_tecnico);
    res.json({ success: true, data: treinamentos });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/treinamentos', (req: Request, res: Response) => {
  try {
    const { id_tecnico, nome_curso, carga_horaria, data_conclusao, data_reciclagem, certificado_url } = req.body;

    if (!id_tecnico || !nome_curso || !data_conclusao) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id_tecnico, nome_curso, data_conclusao',
      });
      return;
    }

    const novoTreinamento = db.createTreinamento({
      id_tecnico: Number(id_tecnico),
      nome_curso,
      carga_horaria: Number(carga_horaria) || 16,
      data_conclusao,
      data_reciclagem,
      certificado_url: certificado_url || 'N/A', // Regra N/A
    });

    res.status(201).json({ success: true, data: novoTreinamento });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/treinamentos/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateTreinamento(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Treinamento não encontrado' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- MOTOR DE AUDITORIA & QUALIFICAÇÃO ---
apiRouter.get('/tecnicos/:id/qualificacao', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const auditoria = db.calcularAuditoriaQualificacao(id);
    res.json({ success: true, data: auditoria });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simulador de Assinatura de Ordem de Serviço (Validação Regulatória Regras 3 e 6)
apiRouter.post('/auditoria/simular-assinatura', (req: Request, res: Response) => {
  try {
    const { id_tecnico, tipo_tarefa, is_iio } = req.body;
    if (!id_tecnico) {
      res.status(400).json({ success: false, error: 'id_tecnico é obrigatório' });
      return;
    }

    const tecnico = db.getTecnicoById(Number(id_tecnico));
    if (!tecnico) {
      res.status(404).json({ success: false, error: 'Técnico não encontrado' });
      return;
    }

    const audit = tecnico.qualificacao;
    const permits: {
      pode_executar: boolean;
      pode_inspecionar: boolean;
      pode_liberar_aprs: boolean;
      motivos_bloqueio: string[];
    } = {
      pode_executar: false,
      pode_inspecionar: false,
      pode_liberar_aprs: false,
      motivos_bloqueio: [...audit.motivos_bloqueio],
    };

    if (audit.is_apto) {
      permits.pode_executar = true;
      if (['Inspetor', 'Inspetor Chefe', 'RT'].includes(tecnico.cargo)) {
        permits.pode_inspecionar = true;
      }
      if (audit.aprovado_aprs) {
        permits.pode_liberar_aprs = true;
      }
    }

    if (is_iio && !permits.pode_inspecionar && tipo_tarefa === 'INSPECAO_IIO') {
      permits.motivos_bloqueio.push('Tarefa classificada como IIO exige inspetor credenciado APRS (P 001-07 / RBAC 65).');
    }

    res.json({
      success: true,
      tecnico_nome: tecnico.nome_completo,
      canac: tecnico.canac,
      cargo: tecnico.cargo,
      status: audit.status,
      permissoes: permits,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- RELATÓRIO TRIMESTRAL F 001-07 PARA A ANAC ---
apiRouter.get('/relatorios/f001-07', (req: Request, res: Response) => {
  try {
    const trimestre = req.query.trimestre ? String(req.query.trimestre) : undefined;
    const id_base = req.query.id_base ? Number(req.query.id_base) : undefined;

    const relatorio = db.gerarRelatorioTrimestralF001_07(trimestre, id_base);
    res.json({ success: true, data: relatorio });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- ESTATÍSTICAS DO DASHBOARD ---
apiRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// PARTE 2: ENDPOINTS DE FERRAMENTARIA, CALIBRAÇÃO E QUARENTENA
// =============================================================================

// --- INVENTÁRIO DE FERRAMENTAS (tb_ferramentas) ---
apiRouter.get('/ferramentas', (req: Request, res: Response) => {
  try {
    const { status, propriedade, requer_calibracao, search } = req.query;
    const filtros: any = {};
    if (status) filtros.status = String(status);
    if (propriedade) filtros.propriedade = String(propriedade);
    if (requer_calibracao !== undefined) filtros.requer_calibracao = requer_calibracao === 'true';
    if (search) filtros.search = String(search);

    const ferramentas = db.getFerramentas(filtros);
    res.json({ success: true, total: ferramentas.length, data: ferramentas });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/ferramentas/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const ferramenta = db.getFerramentaById(id);
    if (!ferramenta) {
      res.status(404).json({ success: false, error: 'Ferramenta não encontrada' });
      return;
    }
    res.json({ success: true, data: ferramenta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/ferramentas', (req: Request, res: Response) => {
  try {
    const {
      descricao,
      part_number,
      serial_number,
      posicao_localizacao,
      requer_calibracao,
      propriedade,
      status,
      fabricante,
      faixa_operacao,
      tolerancia_admissivel,
      observacoes,
    } = req.body;

    if (!descricao || !part_number || !serial_number || !posicao_localizacao) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: descricao, part_number, serial_number, posicao_localizacao',
      });
      return;
    }

    const novaFerramenta = db.createFerramenta({
      descricao,
      part_number,
      serial_number,
      posicao_localizacao,
      requer_calibracao: Boolean(requer_calibracao),
      propriedade: propriedade || 'PROPRIA',
      status: status || 'DISPONIVEL',
      fabricante: fabricante || 'N/A', // Regra N/A
      faixa_operacao: faixa_operacao || 'N/A', // Regra N/A
      tolerancia_admissivel: tolerancia_admissivel || 'N/A', // Regra N/A
      observacoes: observacoes || 'N/A', // Regra N/A
    });

    res.status(201).json({ success: true, data: novaFerramenta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/ferramentas/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateFerramenta(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Ferramenta não encontrada' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- CONTROLE DE CALIBRAÇÃO (tb_controle_calibracao_f001_06 - F 001-06) ---
apiRouter.get('/calibracoes', (req: Request, res: Response) => {
  try {
    const id_ferramenta = req.query.id_ferramenta ? Number(req.query.id_ferramenta) : undefined;
    const calibracoes = db.getCalibracoes(id_ferramenta);
    res.json({ success: true, total: calibracoes.length, data: calibracoes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/calibracoes', (req: Request, res: Response) => {
  try {
    const {
      id_ferramenta,
      numero_laudo,
      laboratorio_homologado,
      desvio_padrao_observado,
      desvio_maximo_tolerado,
      data_afericao,
      data_vencimento,
      tag_f001_06_3_aplicada,
      observacoes_laudo,
    } = req.body;

    if (!id_ferramenta || !numero_laudo || !laboratorio_homologado || !data_vencimento) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id_ferramenta, numero_laudo, laboratorio_homologado, data_vencimento',
      });
      return;
    }

    const resultado = db.createCalibracao({
      id_ferramenta: Number(id_ferramenta),
      numero_laudo,
      laboratorio_homologado,
      desvio_padrao_observado: Number(desvio_padrao_observado) || 0,
      desvio_maximo_tolerado: Number(desvio_maximo_tolerado) || 0,
      aprovado_desvio_padrao: true, // Calculado internamente
      data_afericao: data_afericao || new Date().toISOString().split('T')[0],
      data_vencimento,
      tag_f001_06_3_aplicada: Boolean(tag_f001_06_3_aplicada),
      observacoes_laudo: observacoes_laudo || 'N/A', // Regra N/A
    });

    res.status(201).json({
      success: true,
      data: resultado.calibracao,
      quarentena_acionada: resultado.quarentena_acionada,
      motivo_quarentena: resultado.motivo_quarentena,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- CONTROLE DE MOVIMENTAÇÃO DIÁRIA (Form F 001-06-1) ---
apiRouter.get('/movimentacoes', (req: Request, res: Response) => {
  try {
    const id_ferramenta = req.query.id_ferramenta ? Number(req.query.id_ferramenta) : undefined;
    const movimentacoes = db.getMovimentacoes(id_ferramenta);
    res.json({ success: true, total: movimentacoes.length, data: movimentacoes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Retirada de Ferramenta (Check-out)
apiRouter.post('/movimentacoes/check-out', (req: Request, res: Response) => {
  try {
    const { id_ferramenta, id_tecnico, ordem_servico_numero, finalidade_servico, condicoes_retirada } = req.body;

    if (!id_ferramenta || !id_tecnico) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id_ferramenta, id_tecnico',
      });
      return;
    }

    const resultado = db.checkOutFerramenta({
      id_ferramenta: Number(id_ferramenta),
      id_tecnico: Number(id_tecnico),
      ordem_servico_numero: ordem_servico_numero || 'N/A',
      finalidade_servico: finalidade_servico || 'N/A',
      condicoes_retirada,
    });

    if (!resultado.success) {
      res.status(400).json({ success: false, error: resultado.erro });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Check-out realizado com sucesso (Form F 001-06-1). Ferramenta liberada ao técnico.',
      data: resultado.movimentacao,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Devolução de Ferramenta (Check-in)
apiRouter.post('/movimentacoes/check-in', (req: Request, res: Response) => {
  try {
    const { id_ferramenta, id_tecnico_devolucao, condicoes_devolucao, observacoes_devolucao } = req.body;

    if (!id_ferramenta || !id_tecnico_devolucao) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id_ferramenta, id_tecnico_devolucao',
      });
      return;
    }

    const resultado = db.checkInFerramenta({
      id_ferramenta: Number(id_ferramenta),
      id_tecnico_devolucao: Number(id_tecnico_devolucao),
      condicoes_devolucao: condicoes_devolucao || 'INTACTA',
      observacoes_devolucao,
    });

    if (!resultado.success) {
      res.status(400).json({ success: false, error: resultado.erro });
      return;
    }

    res.json({
      success: true,
      message: resultado.quarentena_acionada
        ? 'Devolução registrada. ALERTA: Ferramenta segregada em Quarentena com Tag Vermelha F 001-01-6 devido a dano observado.'
        : 'Check-in concluído com sucesso. Ferramenta conferida e retornada ao inventário.',
      quarentena_acionada: resultado.quarentena_acionada,
      data: resultado.movimentacao,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- MÓDULO DE QUARENTENA & SEGREGAÇÃO (tb_quarentena_ferramentas_f001_06_4 - Form F 001-06-04) ---
apiRouter.get('/quarentena', (req: Request, res: Response) => {
  try {
    const quarentenas = db.getQuarentenas();
    res.json({ success: true, total: quarentenas.length, data: quarentenas });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/quarentena/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const quarentena = db.getQuarentenaById(id);
    if (!quarentena) {
      res.status(404).json({ success: false, error: 'Registro de quarentena não encontrado' });
      return;
    }
    res.json({ success: true, data: quarentena });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/quarentena/segregar', (req: Request, res: Response) => {
  try {
    const { id_ferramenta, motivo_segregacao, responsavel_segregacao, local_armazenamento_segregado } = req.body;

    if (!id_ferramenta || !motivo_segregacao || !responsavel_segregacao) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id_ferramenta, motivo_segregacao, responsavel_segregacao',
      });
      return;
    }

    const registro = db.transferirParaQuarentena({
      id_ferramenta: Number(id_ferramenta),
      motivo_segregacao,
      responsavel_segregacao: Number(responsavel_segregacao),
      local_armazenamento_segregado,
    });

    res.status(201).json({
      success: true,
      message: 'Ferramenta segregada em Quarentena com sucesso. Form F 001-06-04 e Tag Vermelha F 001-01-6 emitidos.',
      data: registro,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.patch('/quarentena/:id/resolucao', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status_resolucao, despacho_qualidade } = req.body;

    if (!status_resolucao || !despacho_qualidade) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: status_resolucao, despacho_qualidade',
      });
      return;
    }

    const updated = db.atualizarResolucaoQuarentena(id, {
      status_resolucao,
      despacho_qualidade,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Registro de quarentena não encontrado' });
      return;
    }

    res.json({
      success: true,
      message: 'Resolução de quarentena atualizada.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estatísticas da Ferramentaria
apiRouter.get('/ferramentaria/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getToolingStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// PARTE 3: CTM, DADOS TÉCNICOS & DIRETRIZES DE AERONAVEGABILIDADE (DA/AD/SB)
// =============================================================================

// Estatísticas do CTM
apiRouter.get('/ctm/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getCtmStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cartas de Concessão de Manuais
apiRouter.get('/cartas-concessao', (req: Request, res: Response) => {
  try {
    const list = db.getCartasConcessao();
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/cartas-concessao/:id', (req: Request, res: Response) => {
  try {
    const item = db.getCartaConcessaoById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false, error: 'Carta de concessão não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/cartas-concessao', (req: Request, res: Response) => {
  try {
    const nova = db.createCartaConcessao(req.body);
    res.status(201).json({ success: true, message: 'Carta de concessão registrada com sucesso.', data: nova });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/cartas-concessao/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateCartaConcessao(Number(req.params.id), req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Carta de concessão não encontrada' });
      return;
    }
    res.json({ success: true, message: 'Carta de concessão atualizada.', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Tabela Mestre de Publicações Técnicas (Form F 001-02-1)
apiRouter.get('/publicacoes', (req: Request, res: Response) => {
  try {
    const { status, tipo, fabricante, search } = req.query;
    const list = db.getPublicacoes({
      status: status as string,
      tipo: tipo as string,
      fabricante: fabricante as string,
      search: search as string,
    });
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/publicacoes/:id', (req: Request, res: Response) => {
  try {
    const item = db.getPublicacaoById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false, error: 'Publicação técnica não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/publicacoes', (req: Request, res: Response) => {
  try {
    const nova = db.createPublicacao(req.body);
    res.status(201).json({ success: true, message: 'Publicação cadastrada no Livro Mestre F 001-02-1.', data: nova });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/publicacoes/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updatePublicacao(Number(req.params.id), req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Publicação técnica não encontrada' });
      return;
    }
    res.json({ success: true, message: 'Publicação técnica atualizada.', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/publicacoes/:id/checar-revisao', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, revisao, data_revisao, id_responsavel, observacoes } = req.body;
    if (!status || !id_responsavel) {
      res.status(400).json({ success: false, error: 'Campos status e id_responsavel são obrigatórios.' });
      return;
    }
    const updated = db.checarRevisaoPublicacao(id, {
      status,
      revisao,
      data_revisao,
      id_responsavel: Number(id_responsavel),
      observacoes,
    });
    if (!updated) {
      res.status(404).json({ success: false, error: 'Publicação não encontrada' });
      return;
    }
    res.json({ success: true, message: 'Checagem de revisão registrada com sucesso.', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Registro de Ciência do Corpo Técnico (Form F 001-02-2)
apiRouter.get('/ciencias', (req: Request, res: Response) => {
  try {
    const id_pub = req.query.id_publicacao ? Number(req.query.id_publicacao) : undefined;
    const id_tec = req.query.id_tecnico ? Number(req.query.id_tecnico) : undefined;
    const list = db.getCiencias(id_pub, id_tec);
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/ciencias', (req: Request, res: Response) => {
  try {
    const { id_publicacao, id_tecnico, revisao_cientificada, observacoes } = req.body;
    if (!id_publicacao || !id_tecnico) {
      res.status(400).json({ success: false, error: 'Campos id_publicacao e id_tecnico são obrigatórios.' });
      return;
    }
    const nova = db.registrarCiencia({
      id_publicacao: Number(id_publicacao),
      id_tecnico: Number(id_tecnico),
      revisao_cientificada,
      observacoes,
    });
    res.status(201).json({ success: true, message: 'Ciência técnica confirmada e registrada (Form F 001-02-2).', data: nova });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Emissão de FCDA - Ficha de Cumprimento de DA/AD/SB (Form F 001-03-2)
apiRouter.get('/fcdas', (req: Request, res: Response) => {
  try {
    const { matricula, aplicabilidade, tipo_acao, categoria, search, mes_ano } = req.query;
    const list = db.getFcdas({
      matricula: matricula as string,
      aplicabilidade: aplicabilidade as string,
      tipo_acao: tipo_acao as string,
      categoria: categoria as string,
      search: search as string,
      mes_ano: mes_ano as string,
    });
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/fcdas/:id', (req: Request, res: Response) => {
  try {
    const item = db.getFcdaById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false, error: 'FCDA não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/fcdas', (req: Request, res: Response) => {
  try {
    const nova = db.createFcda(req.body);
    res.status(201).json({
      success: true,
      message: `FCDA ${nova.numero_fcda} emitida com sucesso conforme Form F 001-03-2 e IS 39-001A.`,
      data: nova,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/fcdas/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateFcda(Number(req.params.id), req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'FCDA não encontrada' });
      return;
    }
    res.json({ success: true, message: 'FCDA atualizada com sucesso.', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Listagem Mensal de Mandatórias Cumpridas (Form F 001-03-3 / I 001-24)
apiRouter.get('/relatorio-mandatorias', (req: Request, res: Response) => {
  try {
    const { mes_ano, prefixo } = req.query;
    const relatorio = db.getRelatorioMandatoriasMensal(mes_ano as string, prefixo as string);
    res.json({ success: true, data: relatorio });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Monitoramento de Agências Reguladoras (ANAC, FAA DRS, EASA)
apiRouter.get('/monitoramento-agencias', (req: Request, res: Response) => {
  try {
    const list = db.getMonitoramentoAgencias();
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/monitoramento-agencias/checar', (req: Request, res: Response) => {
  try {
    const { agencia, id_tecnico, observacoes } = req.body;
    if (!agencia || !id_tecnico) {
      res.status(400).json({ success: false, error: 'Campos agencia e id_tecnico são obrigatórios.' });
      return;
    }
    const updated = db.registrarChecagemAgencia(agencia, Number(id_tecnico), observacoes);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Agência não encontrada' });
      return;
    }
    res.json({ success: true, message: 'Checagem de agência reguladora registrada com sucesso.', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// =============================================================================
// PARTE 4: COMERCIAL, PCP E ABERTURA DA ORDEM DE SERVIÇO (MOMQ 6.3 / I 001-09)
// =============================================================================

// --- ESPECIFICAÇÕES OPERATIVAS & PCP STATS ---
apiRouter.get('/pcp/modelos-eo', (req: Request, res: Response) => {
  try {
    const { base } = req.query;
    const list = db.getModelosEO(base as any);
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/pcp/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getPcpStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- WORKFLOW COMERCIAL & SOLICITAÇÕES ---
apiRouter.get('/comercial/solicitacoes', (req: Request, res: Response) => {
  try {
    const { status, base, search } = req.query;
    const list = db.getSolicitacoesComerciais({
      status: status as string,
      base: base as string,
      search: search as string,
    });
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/comercial/solicitacoes/:id', (req: Request, res: Response) => {
  try {
    const item = db.getSolicitacaoComercialById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false, error: 'Solicitação comercial não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/comercial/solicitacoes', (req: Request, res: Response) => {
  try {
    const {
      operador_cliente,
      contato_responsavel,
      matricula_aeronave,
      modelo_aeronave,
      base_solicitada,
      data_hora_prevista_inicio,
    } = req.body;

    if (!operador_cliente || !matricula_aeronave || !modelo_aeronave || !base_solicitada) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: operador_cliente, matricula_aeronave, modelo_aeronave, base_solicitada',
      });
      return;
    }

    const nova = db.createSolicitacaoComercial(req.body);
    res.status(201).json({
      success: true,
      message: `Solicitação ${nova.numero_solicitacao} registrada no Workflow Comercial com checagem de antecedência e elegibilidade.`,
      data: nova,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/comercial/solicitacoes/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateSolicitacaoComercial(Number(req.params.id), req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Solicitação não encontrada' });
      return;
    }
    res.json({ success: true, message: 'Solicitação comercial atualizada.', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- VALIDAÇÃO DE ELEGIBILIDADE ANTES DE ABRIR OS ---
apiRouter.post('/ordens-servico/validar-elegibilidade', (req: Request, res: Response) => {
  try {
    const {
      modelo_aeronave,
      base_executante,
      operador,
      data_hora_abertura,
      data_hora_prevista_inicio,
      id_mecanico_executor,
      id_inspetor_aprs,
      ids_ferramentas,
    } = req.body;

    if (!modelo_aeronave || !base_executante || !operador) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios para validação: modelo_aeronave, base_executante, operador',
      });
      return;
    }

    const validacao = db.validarElegibilidadeOS({
      modelo_aeronave,
      base_executante,
      operador,
      data_hora_abertura,
      data_hora_prevista_inicio,
      id_mecanico_executor: id_mecanico_executor ? Number(id_mecanico_executor) : undefined,
      id_inspetor_aprs: id_inspetor_aprs ? Number(id_inspetor_aprs) : undefined,
      ids_ferramentas: Array.isArray(ids_ferramentas) ? ids_ferramentas.map(Number) : undefined,
    });

    res.json({ success: true, data: validacao });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- ORDENS DE SERVIÇO (Form F 001-09-2) ---
apiRouter.get(['/ordens-servico', '/pcp/ordens-servico'], (req: Request, res: Response) => {
  try {
    const { status, base, matricula, search } = req.query;
    const list = db.getOrdensServico({
      status: status as string,
      base: base as string,
      matricula: matricula as string,
      search: search as string,
    });
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get(['/ordens-servico/:id', '/pcp/ordens-servico/:id'], (req: Request, res: Response) => {
  try {
    const item = db.getOrdemServicoById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false, error: 'Ordem de Serviço não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Abertura de OS gerenciada pelo PCP com travas regulatórias ativas
apiRouter.post(['/ordens-servico', '/pcp/ordens-servico'], (req: Request, res: Response) => {
  try {
    const {
      campo_02_matricula,
      campo_03_modelo,
      campo_05_operador,
      campo_06_base_executante,
      campo_11_escopo_servico,
    } = req.body;

    if (!campo_02_matricula || !campo_03_modelo || !campo_05_operador || !campo_06_base_executante || !campo_11_escopo_servico) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios mínimos: Matrícula (02), Modelo (03), Operador (05), Base Executante (06), Escopo de Serviço (11)',
      });
      return;
    }

    const novaOS = db.createOrdemServico(req.body);
    res.status(201).json({
      success: true,
      message: `Ordem de Serviço ${novaOS.numero_os} aberta com sucesso pelo PCP (Form F 001-09-2 / MOMQ 6.3).`,
      data: novaOS,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/ordens-servico/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateOrdemServico(Number(req.params.id), req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Ordem de Serviço não encontrada' });
      return;
    }
    res.json({ success: true, message: 'Ordem de Serviço atualizada.', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.patch('/ordens-servico/:id/status', (req: Request, res: Response) => {
  try {
    const { status, data_encerramento_real, hora_encerramento_real, representante_operador, motivo } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: 'Status é obrigatório' });
      return;
    }

    const usuario_nome = (req.headers['x-user-name'] as string) || req.body.usuario_nome || 'PCP / Sistema';
    const id_usuario = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : req.body.id_usuario;
    const cargo_usuario = (req.headers['x-user-role'] as string) || req.body.cargo_usuario || 'PCP';
    const ip_origem = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const updated = db.updateStatusOrdemServico(Number(req.params.id), status, {
      data_encerramento_real,
      hora_encerramento_real,
      representante_operador,
      usuario_nome,
      id_usuario,
      cargo_usuario,
      motivo: motivo || `Transição solicitada via API para status ${status}`,
      ip_origem,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Ordem de Serviço não encontrada' });
      return;
    }

    res.json({
      success: true,
      message: `Status da OS ${updated.numero_os} atualizado para ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Transição Controlada na Máquina de Estados da OS
apiRouter.post('/ordens-servico/:id/transicao', (req: Request, res: Response) => {
  try {
    const { novo_estado, motivo } = req.body;
    if (!novo_estado) {
      res.status(400).json({ success: false, error: 'Campo "novo_estado" é obrigatório.' });
      return;
    }

    const usuario_nome = (req.headers['x-user-name'] as string) || req.body.usuario_nome || 'Auditoria de Processos';
    const id_usuario = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : req.body.id_usuario;
    const cargo_usuario = (req.headers['x-user-role'] as string) || req.body.cargo_usuario || 'PCP';
    const ip_origem = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const updated = db.updateStatusOrdemServico(Number(req.params.id), novo_estado, {
      usuario_nome,
      id_usuario,
      cargo_usuario,
      motivo: motivo || `Transição controlada para ${novo_estado}`,
      ip_origem,
      data_encerramento_real: req.body.data_encerramento_real,
      hora_encerramento_real: req.body.hora_encerramento_real,
      representante_operador: req.body.representante_operador,
    });

    res.json({
      success: true,
      message: `Transição para '${novo_estado}' realizada com sucesso. Trilha de auditoria registrada.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Histórico de Auditoria da OS
apiRouter.get('/ordens-servico/:id/historico', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const historico = auditLogger.getHistory({ entidade: 'ORDEM_SERVICO', id_entidade: id });
    res.json({ success: true, id_os: id, total: historico.length, data: historico });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Emissão e Pacote de Trabalho Estruturado da OS (Form F 001-09-2)
apiRouter.get('/ordens-servico/:id/pacote-trabalho', (req: Request, res: Response) => {
  try {
    const os = db.getOrdemServicoById(Number(req.params.id));
    if (!os) {
      res.status(404).json({ success: false, error: 'Ordem de Serviço não encontrada' });
      return;
    }

    // Estrutura pronta para renderização com zero divergência
    const pacote = {
      formulario: 'FORM F 001-09-2',
      revisao: 'R08',
      data_revisao: '15/01/2026',
      instrucao: 'I 001-09 • SISTEMA DE CONTROLE TÉCNICO PCP',
      empresa: 'IMPACTO Manutenção, Pintura, Conservação de Aeronaves e Serviços Auxiliares Ltda.',
      certificacoes: 'COM 200607-05 / EASA.145.1003',
      aviso_fod: 'AO ENCERRAR AS TAREFAS DE CUMPRIMENTO, REMOVA FERRAMENTAS E LIMPE TODA A ÁREA DE TRABALHO.',
      regra_na: 'NÃO DEIXE CAMPOS EM BRANCO. CASO O CAMPO NÃO SE APLIQUE, PREENCHA COM "N/A".',
      declaracao_easa: 'Certifies that the work specified was carried out in accordance with EASA Part-145 and in respect to that work the aircraft/aircraft component is considered ready for release to service.',
      ordem_servico: os,
    };

    res.json({ success: true, data: pacote });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PARTE 5: EXECUÇÃO DE LINHA, PASSAGEM DE TURNO E INSPEÇÕES (REST ENDPOINTS)
// ============================================================================

// --- Estatísticas do Hangar ---
apiRouter.get('/hangar/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getHangarStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Apontamentos de Tarefas da OS (Form F 001-09-2) ---
apiRouter.get('/hangar/apontamentos', (req: Request, res: Response) => {
  try {
    const { id_os, status, is_iio } = req.query;
    const items = db.getApontamentos({
      id_os: id_os ? Number(id_os) : undefined,
      status: status as string,
      is_iio: is_iio !== undefined ? is_iio === 'true' : undefined,
    });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/hangar/apontamentos/:id', (req: Request, res: Response) => {
  try {
    const item = db.getApontamentoById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false, error: 'Apontamento de tarefa não encontrado' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/hangar/apontamentos', (req: Request, res: Response) => {
  try {
    const novo = db.createApontamento(req.body);
    res.status(201).json({ success: true, message: 'Apontamento registrado na OS.', data: novo });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/hangar/apontamentos/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateApontamento(Number(req.params.id), req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Apontamento não encontrado' });
      return;
    }
    res.json({ success: true, message: 'Apontamento atualizado.', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Validação e Dupla Assinatura Obrigatória (IIO - MOMQ 5.4 / P 001-07) ---
apiRouter.post('/hangar/validar-iio', (req: Request, res: Response) => {
  try {
    const { id_mecanico, id_inspetor } = req.body;
    if (!id_mecanico || !id_inspetor) {
      res.status(400).json({ success: false, error: 'id_mecanico e id_inspetor são obrigatórios' });
      return;
    }
    const resultado = db.validarDuplaAssinaturaIio(Number(id_mecanico), Number(id_inspetor));
    res.json({ success: true, data: resultado });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/hangar/apontamentos/:id/assinar-iio-aprs', (req: Request, res: Response) => {
  try {
    const { id_inspetor, rubrica } = req.body;
    if (!id_inspetor) {
      res.status(400).json({ success: false, error: 'id_inspetor é obrigatório para validação APRS' });
      return;
    }
    const item = db.assinarInspecaoAprsIio(Number(req.params.id), Number(id_inspetor), rubrica);
    res.json({
      success: true,
      message: `Dupla inspeção IIO atestada pelo Inspetor ${item.inspetor_nome} (APRS: ${item.inspetor_canac}).`,
      data: item,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Peças e Materiais Aplicados (Campo 14) ---
apiRouter.get('/hangar/materiais', (req: Request, res: Response) => {
  try {
    const { id_os } = req.query;
    const materiais = db.getMateriaisAplicados(id_os ? Number(id_os) : undefined);
    res.json({ success: true, data: materiais });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/hangar/materiais', (req: Request, res: Response) => {
  try {
    const novo = db.addMaterialAplicado(req.body);
    res.status(201).json({ success: true, message: 'Material/Peça registrado na OS.', data: novo });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Ferramental PME Utilizado & Check-in / Check-out (Form F 001-06-1) ---
apiRouter.get('/hangar/ferramentas-utilizadas', (req: Request, res: Response) => {
  try {
    const { id_os } = req.query;
    const tools = db.getFerramentasUtilizadas(id_os ? Number(id_os) : undefined);
    res.json({ success: true, data: tools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/hangar/ferramentas-checkout', (req: Request, res: Response) => {
  try {
    const uso = db.registrarCheckoutFerramenta(req.body);
    res.status(201).json({ success: true, message: 'Check-out de ferramenta PME registrado (Form F 001-06-1).', data: uso });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/hangar/ferramentas-checkin', (req: Request, res: Response) => {
  try {
    const { id_uso, condicao, responsavel_checkin, observacoes } = req.body;
    if (!id_uso || !condicao || !responsavel_checkin) {
      res.status(400).json({ success: false, error: 'id_uso, condicao e responsavel_checkin são obrigatórios' });
      return;
    }
    const uso = db.registrarCheckinFerramenta(Number(id_uso), condicao, responsavel_checkin, observacoes);
    res.json({ success: true, message: 'Check-in de ferramenta PME concluído.', data: uso });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Gestão de Relatórios de Inspeção (RI / Form F 001-12) ---
apiRouter.get('/hangar/ris', (req: Request, res: Response) => {
  try {
    const { id_os, status, base } = req.query;
    const ris = db.getRelatoriosInspecao({
      id_os: id_os ? Number(id_os) : undefined,
      status: status as string,
      base: base as string,
    });
    res.json({ success: true, data: ris });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/hangar/ris/:id', (req: Request, res: Response) => {
  try {
    const ri = db.getRelatorioInspecaoById(Number(req.params.id));
    if (!ri) {
      res.status(404).json({ success: false, error: 'Relatório de Inspeção não encontrado' });
      return;
    }
    res.json({ success: true, data: ri });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/hangar/ris', (req: Request, res: Response) => {
  try {
    const novo = db.createRelatorioInspecao(req.body);
    res.status(201).json({
      success: true,
      message: `Relatório de Inspeção ${novo.numero_ri} aberto e vinculado à OS ${novo.numero_os}.`,
      data: novo,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/hangar/ris/:id/resolver', (req: Request, res: Response) => {
  try {
    const { acao_corretiva, id_mecanico } = req.body;
    if (!acao_corretiva || !id_mecanico) {
      res.status(400).json({ success: false, error: 'acao_corretiva e id_mecanico são obrigatórios' });
      return;
    }
    const ri = db.resolverRelatorioInspecao(Number(req.params.id), acao_corretiva, Number(id_mecanico));
    res.json({
      success: true,
      message: `Ação corretiva do RI ${ri.numero_ri} registrada. Aguardando aprovação final do Inspetor APRS.`,
      data: ri,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/hangar/ris/:id/aprovar', (req: Request, res: Response) => {
  try {
    const { id_inspetor_aprs, observacoes } = req.body;
    if (!id_inspetor_aprs) {
      res.status(400).json({ success: false, error: 'id_inspetor_aprs é obrigatório' });
      return;
    }
    const ri = db.aprovarRelatorioInspecao(Number(req.params.id), Number(id_inspetor_aprs), observacoes);
    res.json({
      success: true,
      message: `Relatório de Inspeção ${ri.numero_ri} aprovado e encerrado pelo Inspetor APRS ${ri.inspetor_aprovacao_nome}.`,
      data: ri,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Ficha de Passagem de Serviço (Form F 001-24 / I 001-14) ---
apiRouter.get('/hangar/passagens-turno', (req: Request, res: Response) => {
  try {
    const { id_os, base } = req.query;
    const pts = db.getPassagensTurno({
      id_os: id_os ? Number(id_os) : undefined,
      base: base as string,
    });
    res.json({ success: true, data: pts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/hangar/passagens-turno/:id', (req: Request, res: Response) => {
  try {
    const pt = db.getPassagemTurnoById(Number(req.params.id));
    if (!pt) {
      res.status(404).json({ success: false, error: 'Ficha de Passagem de Turno não encontrada' });
      return;
    }
    res.json({ success: true, data: pt });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/hangar/passagens-turno', (req: Request, res: Response) => {
  try {
    const nova = db.createPassagemTurno(req.body);
    res.status(201).json({
      success: true,
      message: `Ficha de Passagem de Serviço ${nova.numero_passagem} emitida com sucesso (Form F 001-24).`,
      data: nova,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- Encerramento Operacional & Checklist FOD ---
apiRouter.post('/hangar/ordens-servico/:id/encerramento-fod', (req: Request, res: Response) => {
  try {
    const { checklist, id_inspetor_aprs } = req.body;
    if (!checklist || !id_inspetor_aprs) {
      res.status(400).json({ success: false, error: 'Checklist FOD e id_inspetor_aprs são obrigatórios' });
      return;
    }

    const os = db.executarEncerramentoOperacionalFod(Number(req.params.id), checklist, Number(id_inspetor_aprs));
    res.json({
      success: true,
      message: `OS ${os.numero_os} encerrada com sucesso após validação compulsória do Checklist FOD.`,
      data: os,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PARTE 6: GARANTIA DA QUALIDADE, RTS, LTA, ARQUIVO TÉCNICO & PAINEL EXECUTIVO
// MOMQ 5.7, MOMQ 5.7.1, MOMQ 6.5, P 001-01 / RBAC 43.9, RBAC 145.219, EASA Part-145
// ============================================================================

// --- 1. AUDITORIA DE FECHAMENTO PELA QUALIDADE (MOMQ 5.7) ---
apiRouter.get('/qualidade/auditoria-os/:id', (req: Request, res: Response) => {
  try {
    const { id_auditor } = req.query;
    const auditoria = db.auditarFechamentoOS(
      Number(req.params.id),
      id_auditor ? Number(id_auditor) : undefined
    );
    res.json({ success: true, data: auditoria });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- 2. ANOTAÇÃO PARA O LIVRO TÉCNICO DA AERONAVE (LTA / ATL) ---
apiRouter.get('/qualidade/lta/:id', (req: Request, res: Response) => {
  try {
    const { id_rts } = req.query;
    const lta = db.gerarTextoLTA(Number(req.params.id), id_rts ? Number(id_rts) : undefined);
    res.json({ success: true, data: lta });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- 3. APROVAÇÃO PARA RETORNO AO SERVIÇO (RTS) COM DUAL RELEASE ---
apiRouter.get('/qualidade/rts', (req: Request, res: Response) => {
  try {
    const { id_os, base, search } = req.query;
    const list = db.getLiberacoesRTS({
      id_os: id_os ? Number(id_os) : undefined,
      base: base as string,
      search: search as string,
    });
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/qualidade/rts/:id', (req: Request, res: Response) => {
  try {
    const item = db.getLiberacaoRTSById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ success: false, error: 'Liberação RTS não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/qualidade/rts/os/:id_os', (req: Request, res: Response) => {
  try {
    const item = db.getLiberacaoRTSByOS(Number(req.params.id_os));
    if (!item) {
      res.status(404).json({ success: false, error: 'Nenhum RTS emitido para esta Ordem de Serviço' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/qualidade/rts', (req: Request, res: Response) => {
  try {
    const result = db.emitirLiberacaoRTS(req.body);
    res.status(201).json({
      success: true,
      message: `Aprovação para Retorno ao Serviço ${result.rts.numero_rts} emitida com sucesso. OS ${result.os.numero_os} homologada e encerrada.`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/qualidade/rts/:id/vias', (req: Request, res: Response) => {
  try {
    const updated = db.atualizarDistribuicaoViasRTS(Number(req.params.id), req.body);
    res.json({
      success: true,
      message: 'Distribuição de vias do RTS atualizada com sucesso.',
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- 4. ARQUIVO TÉCNICO & DOSSIÊS DIGITAIS CONSOLIDADOS (MOMQ 6.5) ---
apiRouter.get('/arquivo-tecnico/dossies', (req: Request, res: Response) => {
  try {
    const { base, operador, search } = req.query;
    const list = db.getDossiesDigitais({
      base: base as string,
      operador: operador as string,
      search: search as string,
    });
    res.json({ success: true, total: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/arquivo-tecnico/dossies/:id', (req: Request, res: Response) => {
  try {
    const item = db.getDossieDigitalById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Dossiê Digital não encontrado no arquivo técnico' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/arquivo-tecnico/dossies/os/:id_os', (req: Request, res: Response) => {
  try {
    const item = db.getDossieDigitalByOS(Number(req.params.id_os));
    if (!item) {
      res.status(404).json({ success: false, error: 'Nenhum Dossiê Digital gerado para esta OS' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 5. PAINEL EXECUTIVO DO GESTOR RESPONSÁVEL (GR) E DIRETOR TÉCNICO (RT) ---
apiRouter.get('/diretoria/painel-executivo', (req: Request, res: Response) => {
  try {
    const stats = db.getPainelExecutivoStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 6. CHECKLIST FOD DE ENCERRAMENTO (EVIDÊNCIAS REAIS - I 001-09 / I 001-14) ---
apiRouter.post('/hangar/fod-checklist', (req: Request, res: Response) => {
  try {
    const {
      id_os,
      recolhimento_todas_ferramentas,
      contagem_ferramentas_confere,
      inspecao_visual_baias_motores_paineis,
      limpeza_residuos_freio_arames_panos,
      paineis_acesso_fechados_travados,
      aviso_fod_confirmado,
      id_inspetor_verificador,
      observacoes,
    } = req.body;

    if (!id_os || !id_inspetor_verificador) {
      res.status(400).json({
        success: false,
        error: 'id_os e id_inspetor_verificador são obrigatórios.',
      });
      return;
    }

    const checklist = db.registrarChecklistFod({
      id_os: Number(id_os),
      recolhimento_todas_ferramentas: Boolean(recolhimento_todas_ferramentas),
      contagem_ferramentas_confere: Boolean(contagem_ferramentas_confere),
      inspecao_visual_baias_motores_paineis: Boolean(inspecao_visual_baias_motores_paineis),
      limpeza_residuos_freio_arames_panos: Boolean(limpeza_residuos_freio_arames_panos),
      paineis_acesso_fechados_travados: Boolean(paineis_acesso_fechados_travados),
      aviso_fod_confirmado: Boolean(aviso_fod_confirmado),
      id_inspetor_verificador: Number(id_inspetor_verificador),
      inspetor_nome: '',
      inspetor_canac: '',
      data_hora_verificacao: '',
    });

    res.status(201).json({
      success: true,
      message: 'Checklist físico de prevenção FOD registrado com sucesso.',
      data: checklist,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.get('/hangar/fod-checklist/:id_os', (req: Request, res: Response) => {
  try {
    const id_os = Number(req.params.id_os);
    const checklist = db.getChecklistFodByOS(id_os);
    if (!checklist) {
      res.status(404).json({ success: false, error: 'Checklist FOD não encontrado para esta OS.' });
      return;
    }
    res.json({ success: true, data: checklist });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 7. VERIFICAÇÃO CRIPTOGRÁFICA REAL DE INTEGRIDADE SHA-256 DO DOSSIÊ DIGITAL ---
apiRouter.post('/qualidade/dossies/:id_dossie/verificar-integridade', async (req: Request, res: Response) => {
  try {
    const id = req.params.id_dossie;
    const resultado = await db.verificarIntegridadeDossie(id);
    res.json({ success: true, data: resultado });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Tentativa de Exclusão de Dossiê (Garante Bloqueio de Exclusão Regulatória)
apiRouter.delete('/qualidade/dossies/:id_dossie', (req: Request, res: Response) => {
  try {
    db.tentarExcluirDossie(req.params.id_dossie);
    res.json({ success: true, message: 'Dossiê excluído' });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      error: error.message,
      codigo: 'RETENCAO_REGULATORIA_BLOQUEADA',
    });
  }
});

// --- 8. RETENÇÃO DOCUMENTAL CONFIGURÁVEL (RBAC 145.211 / EASA Part-145.A.55) ---
apiRouter.get('/retencao-documental', (req: Request, res: Response) => {
  try {
    const id_os = req.query.id_os ? Number(req.query.id_os) : undefined;
    const retencoes = db.getRetencoes(id_os);
    res.json({ success: true, total: retencoes.length, data: retencoes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 9. TRILHA AUDITÁVEL DE HISTÓRICO (AUDIT LOG) ---
apiRouter.get('/audit-log', (req: Request, res: Response) => {
  try {
    const { entidade, id_entidade, usuario, limit } = req.query;
    const logs = auditLogger.getHistory({
      entidade: entidade as string,
      id_entidade: id_entidade as string,
      usuario: usuario as string,
      limit: limit ? Number(limit) : 100,
    });
    res.json({ success: true, total: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 10. USUÁRIOS E PERFIS RBAC ---
apiRouter.get('/usuarios', (_req: Request, res: Response) => {
  try {
    const users = db.getUsuarios();
    res.json({ success: true, total: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/usuarios/:id', (req: Request, res: Response) => {
  try {
    const user = db.getUsuarioById(Number(req.params.id));
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 11. STORAGE DE DOCUMENTOS ---
apiRouter.get('/storage/:filepath(*)', async (req: Request, res: Response) => {
  try {
    const fileBuffer = await storageProvider.getDocument(req.params.filepath);
    res.setHeader('Content-Type', 'application/json');
    res.send(fileBuffer);
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});


