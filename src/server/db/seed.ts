/**
 * Seed Inicial de Dados para PostgreSQL
 * Carrega a massa regulatória completa da Impacto Aviation MRO
 * Uso: npm run db:seed
 */

import { dbConnection } from './connection';
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
  INITIAL_MODELOS_EO,
  INITIAL_SOLICITACOES_COMERCIAIS,
  INITIAL_ORDENS_SERVICO,
  INITIAL_MATERIAIS_APLICADOS,
  INITIAL_APONTAMENTOS_TAREFAS,
  INITIAL_RELATORIOS_INSPECAO,
  INITIAL_PASSAGENS_TURNO,
  INITIAL_LIBERACOES_RTS,
  INITIAL_DOSSIES_DIGITAIS,
} from '../seedData';

export async function seedDatabase() {
  console.log('[Seed] Iniciando povoamento de dados regulatórios no PostgreSQL...');

  const isConnected = await dbConnection.testConnection();
  if (!isConnected) {
    console.error('[Seed] FALHA: Conexão com o PostgreSQL não estabelecida.');
    process.exit(1);
  }

  await dbConnection.withTransaction(async (client) => {
    // 1. BASES
    console.log('[Seed] Inserindo Bases Operacionais...');
    for (const b of INITIAL_BASES) {
      await client.query(
        `INSERT INTO tb_bases_operacionais (id_base, nome_base, codigo_anac, tipo_base, ativo)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id_base) DO UPDATE SET nome_base = EXCLUDED.nome_base, codigo_anac = EXCLUDED.codigo_anac`,
        [b.id_base, b.nome_base, b.codigo_anac, b.tipo_base, b.ativo ?? true]
      );
    }

    // 2. USUÁRIOS BÁSICOS RBAC
    console.log('[Seed] Inserindo Usuários do Sistema RBAC...');
    const usuariosIniciais = [
      { id: 1, nome: 'Eng. Roberto Albuquerque Mendonça', email: 'rt@impactoaviation.com.br', cargo: 'Responsável Técnico (RT)', perfil: 'RT', canac: '104820' },
      { id: 2, nome: 'Juliana Costa e Silva', email: 'qualidade@impactoaviation.com.br', cargo: 'Gerente da Garantia da Qualidade (GQ)', perfil: 'GERENTE_QUALIDADE', canac: '114520' },
      { id: 3, nome: 'Alexandre Pires Guimarães', email: 'inspetor.chefe@impactoaviation.com.br', cargo: 'Inspetor Chefe (APRS)', perfil: 'INSPETOR_CHEFE', canac: '109312' },
      { id: 4, nome: 'Carlos Eduardo Silveira', email: 'mecanico.lider@impactoaviation.com.br', cargo: 'MMA / Mecânico Líder', perfil: 'MECANICO', canac: '128450' },
      { id: 5, nome: 'Fernanda Lima Rocha', email: 'pcp@impactoaviation.com.br', cargo: 'Analista de Planejamento (PCP)', perfil: 'PCP', canac: '139820' },
    ];

    for (const u of usuariosIniciais) {
      await client.query(
        `INSERT INTO tb_usuarios (id_usuario, nome, email, cargo, perfil, canac, ativo)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)
         ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome, cargo = EXCLUDED.cargo`,
        [u.id, u.nome, u.email, u.cargo, u.perfil, u.canac]
      );
    }

    // 3. PESSOAL TÉCNICO
    console.log('[Seed] Inserindo Pessoal Técnico...');
    for (const t of INITIAL_TECNICOS) {
      await client.query(
        `INSERT INTO tb_pessoal_tecnico (id_tecnico, nome_completo, canac, cpf, cargo, licenca_cct, data_admissao, status_exame_toxicologico, id_base_alocada, ativo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id_tecnico) DO UPDATE SET nome_completo = EXCLUDED.nome_completo, cargo = EXCLUDED.cargo`,
        [t.id_tecnico, t.nome_completo, t.canac, t.cpf, t.cargo, t.licenca_cct, t.data_admissao, t.status_exame_toxicologico, t.id_base_alocada, t.ativo ?? true]
      );
    }

    // 4. DESIGNAÇÕES F 001-03
    console.log('[Seed] Inserindo Designações de Funções (F 001-03)...');
    for (const d of INITIAL_DESIGNACOES) {
      await client.query(
        `INSERT INTO tb_designacao_funcoes_f001_03 (id_designacao, id_tecnico, numero_f001_03, funcoes_autorizadas, data_emissao, data_validade, assinado_por_rt, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id_designacao) DO UPDATE SET funcoes_autorizadas = EXCLUDED.funcoes_autorizadas`,
        [d.id_designacao, d.id_tecnico, d.numero_f001_03, d.funcoes_autorizadas, d.data_emissao, d.data_validade || null, d.assinado_por_rt, d.status]
      );
    }

    // 5. TREINAMENTOS MNT-002
    console.log('[Seed] Inserindo Treinamentos MNT-002...');
    for (const tr of INITIAL_TREINAMENTOS) {
      await client.query(
        `INSERT INTO tb_treinamento_mnt002 (id_treinamento, id_tecnico, nome_curso, carga_horaria, data_conclusao, data_reciclagem, certificado_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id_treinamento) DO UPDATE SET nome_curso = EXCLUDED.nome_curso`,
        [tr.id_treinamento, tr.id_tecnico, tr.nome_curso, tr.carga_horaria, tr.data_conclusao, tr.data_reciclagem, tr.certificado_url || 'N/A']
      );
    }

    // 6. FERRAMENTAS E CALIBRAÇÕES
    console.log('[Seed] Inserindo Ferramental e Metrologia...');
    for (const f of INITIAL_FERRAMENTAS) {
      await client.query(
        `INSERT INTO tb_ferramentas (id_ferramenta, descricao, part_number, serial_number, posicao_localizacao, requer_calibracao, propriedade, status, fabricante, faixa_operacao, tolerancia_admissivel, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id_ferramenta) DO UPDATE SET status = EXCLUDED.status, posicao_localizacao = EXCLUDED.posicao_localizacao`,
        [f.id_ferramenta, f.descricao, f.part_number, f.serial_number, f.posicao_localizacao, f.requer_calibracao, f.propriedade, f.status, f.fabricante || 'N/A', f.faixa_operacao || 'N/A', f.tolerancia_admissivel || 'N/A', f.observacoes || 'N/A']
      );
    }

    for (const c of INITIAL_CALIBRACOES) {
      await client.query(
        `INSERT INTO tb_controle_calibracao_f001_06 (id_calibracao, id_ferramenta, numero_laudo, laboratorio_homologado, desvio_padrao_observado, desvio_maximo_tolerado, aprovado_desvio_padrao, data_afericao, data_vencimento, tag_f001_06_3_aplicada, observacoes_laudo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id_calibracao) DO NOTHING`,
        [c.id_calibracao, c.id_ferramenta, c.numero_laudo, c.laboratorio_homologado, c.desvio_padrao_observado, c.desvio_maximo_tolerado, c.aprovado_desvio_padrao, c.data_afericao, c.data_vencimento, c.tag_f001_06_3_aplicada, c.observacoes_laudo || 'N/A']
      );
    }

    // 7. MODELOS HOMOLOGADOS EO
    console.log('[Seed] Inserindo Modelos Homologados EO...');
    for (const m of INITIAL_MODELOS_EO) {
      await client.query(
        `INSERT INTO tb_modelos_homologados_eo (fabricante, modelo, tipo_aeronave, bases_autorizadas)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (modelo) DO UPDATE SET bases_autorizadas = EXCLUDED.bases_autorizadas`,
        [m.fabricante, m.codigo_modelo, m.familia, m.bases_homologadas]
      );
    }

    // 8. CARTAS DE CONCESSÃO
    console.log('[Seed] Inserindo Cartas de Concessão...');
    for (const c of INITIAL_CARTAS_CONCESSAO) {
      await client.query(
        `INSERT INTO tb_cartas_concessao_manuais (id_carta, numero_carta, operador_cliente, modelos_aeronave, data_emissao, data_validade, status, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id_carta) DO NOTHING`,
        [c.id_carta_concessao, c.numero_carta, c.operador_cliente, [c.frotas_modelos], c.data_emissao, c.data_validade, c.status, c.observacoes || 'N/A']
      );
    }

    // 9. ORDENS DE SERVIÇO F 001-09-2
    console.log('[Seed] Inserindo Ordens de Serviço...');
    for (const os of INITIAL_ORDENS_SERVICO) {
      await client.query(
        `INSERT INTO tb_ordens_servico_f001_09_2 (
          id_os, numero_os, id_solicitacao, numero_solicitacao, status_os,
          campo_01_numero_os, campo_02_matricula, campo_03_modelo, campo_04_msn,
          campo_05_operador, campo_06_base_executante, campo_07_data_abertura,
          campo_07_hora_abertura, campo_08_data_encerramento_real, campo_08_hora_encerramento_real,
          campo_09_tsn, campo_10_csn, campo_11_escopo_servico, campo_12_manuais_texto_formatado,
          campo_13_ferramental_pme_texto, campo_14_materiais_pecas_texto, campo_16_testes_funcionais,
          id_mecanico_executor, mecanico_executor_nome, mecanico_executor_canac,
          id_inspetor_aprs, inspetor_aprs_nome, inspetor_aprs_canac,
          id_rt, rt_nome, rt_canac, rt_crea,
          representante_operador_nome, observacoes, tipo_release_aplicavel,
          declaracao_easa_part145_aplicada, aviso_fod_incluido, regra_na_declarada
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38
        ) ON CONFLICT (numero_os) DO UPDATE SET status_os = EXCLUDED.status_os`,
        [
          os.id_os, os.numero_os, os.id_solicitacao || null, os.numero_solicitacao || 'N/A', os.status_os,
          os.campo_01_numero_os, os.campo_02_matricula, os.campo_03_modelo, os.campo_04_msn,
          os.campo_05_operador, os.campo_06_base_executante, os.campo_07_data_abertura,
          os.campo_07_hora_abertura, os.campo_08_data_encerramento_real || null, os.campo_08_hora_encerramento_real || null,
          os.campo_09_tsn, os.campo_10_csn, os.campo_11_escopo_servico, os.campo_12_manuais_texto_formatado,
          os.campo_13_ferramental_pme_texto, os.campo_14_materiais_pecas_texto, os.campo_16_testes_funcionais,
          os.id_mecanico_executor, os.mecanico_executor_nome, os.mecanico_executor_canac,
          os.id_inspetor_aprs, os.inspetor_aprs_nome, os.inspetor_aprs_canac,
          os.id_rt, os.rt_nome, os.rt_canac, os.rt_crea || 'CREA-SP 50628912-D',
          os.representante_operador_nome || 'N/A', os.observacoes || 'N/A',
          os.declaracao_easa_part145_aplicada ? 'DUAL_RELEASE_ANAC_EASA' : 'ANAC_RBAC_43_9',
          os.declaracao_easa_part145_aplicada, os.aviso_fod_incluido ?? true, os.regra_na_declarada ?? true
        ]
      );
    }

    // 10. LIBERAÇÕES RTS
    console.log('[Seed] Inserindo Liberações RTS...');
    for (const r of INITIAL_LIBERACOES_RTS) {
      await client.query(
        `INSERT INTO tb_liberacoes_rts (
          id_rts, numero_rts, id_os, numero_os, matricula_aeronave, modelo_aeronave,
          msn_aeronave, operador_cliente, base_liberacao, data_hora_liberacao,
          tsn_liberacao, csn_liberacao, tipo_declaracao, texto_declaracao_anac,
          texto_declaracao_easa, requer_declaracao_easa, id_inspetor_aprs,
          inspetor_aprs_nome, inspetor_aprs_canac, assinatura_digital_aprs,
          id_rt, rt_nome, rt_canac, rt_crea, assinatura_digital_rt,
          texto_anotacao_lta, codigo_anotacao_lta, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
        ) ON CONFLICT (numero_rts) DO NOTHING`,
        [
          r.id_rts, r.numero_rts, r.id_os, r.numero_os, r.matricula_aeronave, r.modelo_aeronave,
          r.msn_aeronave, r.operador_cliente, r.base_liberacao, r.data_hora_liberacao,
          r.tsn_liberacao, r.csn_liberacao, r.tipo_declaracao, r.texto_declaracao_anac,
          r.texto_declaracao_easa || null, r.requer_declaracao_easa, r.id_inspetor_aprs,
          r.inspetor_aprs_nome, r.inspetor_aprs_canac, r.assinatura_digital_aprs,
          r.id_rt, r.rt_nome, r.rt_canac, r.rt_crea, r.assinatura_digital_rt,
          r.texto_anotacao_lta, r.codigo_anotacao_lta, r.status
        ]
      );
    }

    // 11. AUDIT LOG INICIAL
    await client.query(
      `INSERT INTO tb_audit_log (usuario_nome, cargo, acao, entidade, id_entidade, motivo_detalhes)
       VALUES ('Sistema MRO', 'ADMIN', 'SEED_INICIAL', 'DATABASE', 'ALL', 'Povoamento inicial de tabelas relacionais do sistema Impacto Aviation MRO')`
    );
  });

  console.log('[Seed] Povoamento concluído com sucesso!');
  await dbConnection.close();
}

// Se executado diretamente via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase().catch((err) => {
    console.error('[Seed] Erro fatal:', err);
    process.exit(1);
  });
}
