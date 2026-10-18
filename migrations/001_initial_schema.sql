-- =============================================================================
-- IMPACTO AVIATION MRO - ESQUEMA RELACIONAL POSTGRESQL (COM 200607-05 / EASA.145.1003)
-- Migração Inicial: 001_initial_schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE CONTROLE DE MIGRAÇÕES
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BASES OPERACIONAIS
CREATE TABLE IF NOT EXISTS tb_bases_operacionais (
    id_base SERIAL PRIMARY KEY,
    nome_base VARCHAR(100) NOT NULL,
    codigo_anac VARCHAR(20) NOT NULL UNIQUE,
    tipo_base VARCHAR(30) DEFAULT 'SECUNDARIA' CHECK (tipo_base IN ('PRINCIPAL', 'SECUNDARIA', 'LINHA', 'SUB_BASE')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USUÁRIOS E AUTENTICAÇÃO / AUTORIZAÇÃO (RBAC)
CREATE TABLE IF NOT EXISTS tb_usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255),
    cargo VARCHAR(100) NOT NULL,
    perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('ADMIN', 'RT', 'GERENTE_QUALIDADE', 'INSPETOR_CHEFE', 'INSPETOR', 'MECANICO', 'PCP', 'ALMOXARIFE', 'AUDITOR')),
    canac VARCHAR(20),
    id_base INT REFERENCES tb_bases_operacionais(id_base) ON DELETE SET NULL,
    permissoes TEXT[] NOT NULL DEFAULT '{}',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PESSOAL TÉCNICO (BNT / FORM F 001-03 / MNT-001)
CREATE TABLE IF NOT EXISTS tb_pessoal_tecnico (
    id_tecnico SERIAL PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    canac VARCHAR(20) NOT NULL UNIQUE,
    cpf VARCHAR(20) NOT NULL UNIQUE,
    cargo VARCHAR(100) NOT NULL,
    licenca_cct VARCHAR(50) NOT NULL DEFAULT 'N/A',
    data_admissao DATE NOT NULL,
    status_exame_toxicologico VARCHAR(30) NOT NULL DEFAULT 'EM_DIA' CHECK (status_exame_toxicologico IN ('EM_DIA', 'A_VENCER_30D', 'VENCIDO', 'PENDENTE_COLETA')),
    id_base_alocada INT NOT NULL REFERENCES tb_bases_operacionais(id_base),
    id_usuario INT REFERENCES tb_usuarios(id_usuario) ON DELETE SET NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DESIGNAÇÃO DE FUNÇÕES F 001-03
CREATE TABLE IF NOT EXISTS tb_designacao_funcoes_f001_03 (
    id_designacao SERIAL PRIMARY KEY,
    id_tecnico INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico) ON DELETE CASCADE,
    numero_f001_03 VARCHAR(50) NOT NULL UNIQUE,
    funcoes_autorizadas TEXT NOT NULL,
    data_emissao DATE NOT NULL,
    data_validade DATE,
    assinado_por_rt BOOLEAN NOT NULL DEFAULT FALSE,
    id_rt_assinante INT REFERENCES tb_pessoal_tecnico(id_tecnico),
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'VENCIDO', 'REVOGADO', 'SUSPENSO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TREINAMENTOS MANDATÓRIOS MNT-002
CREATE TABLE IF NOT EXISTS tb_treinamento_mnt002 (
    id_treinamento SERIAL PRIMARY KEY,
    id_tecnico INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico) ON DELETE CASCADE,
    nome_curso VARCHAR(200) NOT NULL,
    carga_horaria INT NOT NULL DEFAULT 8,
    data_conclusao DATE NOT NULL,
    data_reciclagem DATE NOT NULL,
    certificado_url TEXT DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. MODELOS HOMOLOGADOS NAS ESPECIFICAÇÕES OPERATIVAS (EO)
CREATE TABLE IF NOT EXISTS tb_modelos_homologados_eo (
    id_modelo SERIAL PRIMARY KEY,
    fabricante VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL UNIQUE,
    tipo_aeronave VARCHAR(50) NOT NULL,
    homologado_anac BOOLEAN NOT NULL DEFAULT TRUE,
    homologado_easa BOOLEAN NOT NULL DEFAULT FALSE,
    bases_autorizadas TEXT[] NOT NULL DEFAULT '{}',
    limite_cheques VARCHAR(100) DEFAULT 'Cheque A / Linha / Trânsito',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CARTAS DE CONCESSÃO DE MANUAIS
CREATE TABLE IF NOT EXISTS tb_cartas_concessao_manuais (
    id_carta SERIAL PRIMARY KEY,
    numero_carta VARCHAR(100) NOT NULL UNIQUE,
    operador_cliente VARCHAR(100) NOT NULL,
    modelos_aeronave TEXT[] NOT NULL DEFAULT '{}',
    data_emissao DATE NOT NULL,
    data_validade DATE NOT NULL,
    url_concessao_manuais TEXT DEFAULT 'N/A',
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'VENCIDA', 'REVOGADA')),
    observacoes TEXT DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SOLICITAÇÕES COMERCIAIS
CREATE TABLE IF NOT EXISTS tb_solicitacoes_comerciais (
    id_solicitacao SERIAL PRIMARY KEY,
    numero_solicitacao VARCHAR(50) NOT NULL UNIQUE,
    operador_cliente VARCHAR(150) NOT NULL,
    contato_responsavel VARCHAR(150) NOT NULL,
    email_contato VARCHAR(150) NOT NULL,
    telefone_contato VARCHAR(50) NOT NULL,
    matricula_aeronave VARCHAR(20) NOT NULL,
    modelo_aeronave VARCHAR(100) NOT NULL,
    msn_aeronave VARCHAR(50) NOT NULL,
    base_solicitada VARCHAR(20) NOT NULL,
    data_solicitacao TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_prevista_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_prevista_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    horas_antecedencia NUMERIC(6, 1) NOT NULL,
    antecedencia_valida_24h BOOLEAN NOT NULL DEFAULT FALSE,
    alerta_antecedencia TEXT,
    elegivel_eo_base BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_incompatibilidade_eo TEXT,
    possui_carta_concessao_ativa BOOLEAN NOT NULL DEFAULT FALSE,
    numero_carta_concessao VARCHAR(100),
    motivo_incompatibilidade_manuais TEXT,
    escopo_servico TEXT NOT NULL,
    diretrizes_mandatorias_solicitadas JSONB DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'NOVA' CHECK (status IN ('NOVA', 'EM_ANALISE_PCP', 'APROVADA', 'RECUSADA_REPROVADA', 'CONVERTIDA_EM_OS')),
    id_ordem_servico_gerada INT,
    numero_os_gerada VARCHAR(50),
    observacoes TEXT DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. ORDENS DE SERVIÇO (FORM F 001-09-2 / PCP / MOMQ 6.3)
CREATE TABLE IF NOT EXISTS tb_ordens_servico_f001_09_2 (
    id_os SERIAL PRIMARY KEY,
    numero_os VARCHAR(50) NOT NULL UNIQUE,
    id_solicitacao INT REFERENCES tb_solicitacoes_comerciais(id_solicitacao),
    numero_solicitacao VARCHAR(50) DEFAULT 'N/A',
    status_os VARCHAR(50) NOT NULL DEFAULT 'ABERTA' CHECK (status_os IN ('ABERTA', 'EM_EXECUCAO', 'AGUARDANDO_INSPECAO', 'GQ', 'RTS', 'ENCERRADA', 'CANCELADA')),
    
    campo_01_numero_os VARCHAR(50) NOT NULL,
    campo_02_matricula VARCHAR(20) NOT NULL,
    campo_03_modelo VARCHAR(100) NOT NULL,
    campo_04_msn VARCHAR(50) NOT NULL,
    campo_05_operador VARCHAR(150) NOT NULL,
    campo_06_base_executante VARCHAR(20) NOT NULL,
    
    campo_07_data_abertura VARCHAR(30) NOT NULL,
    campo_07_hora_abertura VARCHAR(20) NOT NULL,
    campo_08_data_encerramento_real VARCHAR(30),
    campo_08_hora_encerramento_real VARCHAR(20),
    
    campo_09_tsn VARCHAR(50) NOT NULL DEFAULT 'N/A',
    campo_10_csn VARCHAR(50) NOT NULL DEFAULT 'N/A',
    campo_11_escopo_servico TEXT NOT NULL,
    campo_12_manuais_texto_formatado TEXT NOT NULL DEFAULT 'N/A',
    campo_13_ferramental_pme_texto TEXT NOT NULL DEFAULT 'N/A',
    campo_14_materiais_pecas_texto TEXT NOT NULL DEFAULT 'N/A',
    campo_16_testes_funcionais TEXT NOT NULL DEFAULT 'N/A',
    
    id_mecanico_executor INT REFERENCES tb_pessoal_tecnico(id_tecnico),
    mecanico_executor_nome VARCHAR(150) NOT NULL,
    mecanico_executor_canac VARCHAR(20) NOT NULL,
    
    id_inspetor_aprs INT REFERENCES tb_pessoal_tecnico(id_tecnico),
    inspetor_aprs_nome VARCHAR(150) NOT NULL,
    inspetor_aprs_canac VARCHAR(20) NOT NULL,
    
    id_rt INT REFERENCES tb_pessoal_tecnico(id_tecnico),
    rt_nome VARCHAR(150) NOT NULL,
    rt_canac VARCHAR(20) NOT NULL,
    rt_crea VARCHAR(50) NOT NULL,
    
    representante_operador_nome VARCHAR(150) DEFAULT 'N/A',
    observacoes TEXT DEFAULT 'N/A',
    
    -- Configuração EASA / Dual Release explícita (sem default automático!)
    tipo_release_aplicavel VARCHAR(50) NOT NULL DEFAULT 'ANAC_RBAC_43_9' CHECK (tipo_release_aplicavel IN ('ANAC_RBAC_43_9', 'EASA_PART_145', 'DUAL_RELEASE_ANAC_EASA', 'NAO_APLICAVEL')),
    declaracao_easa_part145_aplicada BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_aplicabilidade_easa TEXT DEFAULT 'N/A',
    
    aviso_fod_incluido BOOLEAN NOT NULL DEFAULT FALSE,
    regra_na_declarada BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. HISTÓRICO DE MUDANÇA DE ESTADO DA OS (MÁQUINA DE ESTADOS CONTROLADA)
CREATE TABLE IF NOT EXISTS tb_os_status_history (
    id_history SERIAL PRIMARY KEY,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE CASCADE,
    estado_anterior VARCHAR(50) NOT NULL,
    novo_estado VARCHAR(50) NOT NULL,
    id_usuario INT REFERENCES tb_usuarios(id_usuario),
    usuario_nome VARCHAR(150) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT NOT NULL,
    ip_origem VARCHAR(50)
);

-- 12. TAREFAS E DISCREPÂNCIAS DA OS
CREATE TABLE IF NOT EXISTS tb_tarefas_discrepancias_os (
    id_tarefa SERIAL PRIMARY KEY,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE CASCADE,
    item_ordem INT NOT NULL,
    descricao_tarefa TEXT NOT NULL,
    referencia_amm_task VARCHAR(100) NOT NULL,
    is_iio BOOLEAN NOT NULL DEFAULT FALSE,
    status_tarefa VARCHAR(50) NOT NULL DEFAULT 'PENDENTE' CHECK (status_tarefa IN ('PENDENTE', 'EM_ANDAMENTO', 'EXECUTADA', 'INSPECIONADA', 'CANCELADA')),
    mecanico_responsavel VARCHAR(150) DEFAULT 'N/A',
    inspetor_aprs VARCHAR(150) DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. APONTAMENTOS DE TAREFAS DA OS
CREATE TABLE IF NOT EXISTS tb_apontamentos_tarefas_os (
    id_apontamento SERIAL PRIMARY KEY,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE CASCADE,
    id_tarefa_os INT REFERENCES tb_tarefas_discrepancias_os(id_tarefa),
    item_tarefa INT NOT NULL,
    titulo_tarefa VARCHAR(255) NOT NULL,
    referencia_amm_task VARCHAR(100) NOT NULL,
    is_iio BOOLEAN NOT NULL DEFAULT FALSE,
    id_mecanico_executor INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    mecanico_nome VARCHAR(150) NOT NULL,
    mecanico_canac VARCHAR(20) NOT NULL,
    data_hora_execucao TIMESTAMP WITH TIME ZONE NOT NULL,
    assinatura_executor VARCHAR(255) NOT NULL,
    id_inspetor_aprs INT REFERENCES tb_pessoal_tecnico(id_tecnico),
    inspetor_nome VARCHAR(150) DEFAULT 'N/A',
    inspetor_canac VARCHAR(20) DEFAULT 'N/A',
    data_hora_inspecao TIMESTAMP WITH TIME ZONE,
    assinatura_inspetor VARCHAR(255) DEFAULT 'N/A',
    assinatura_dupla_iio_valida BOOLEAN NOT NULL DEFAULT FALSE,
    violacao_independencia_iio BOOLEAN NOT NULL DEFAULT FALSE,
    status_apontamento VARCHAR(50) NOT NULL DEFAULT 'EXECUTADA' CHECK (status_apontamento IN ('PENDENTE', 'EXECUTADA', 'APROVADA_INSPETOR', 'REPROVADA_RETRABALHO')),
    observacoes_tecnicas TEXT DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. MATERIAIS E COMPONENTES APLICADOS NA OS
CREATE TABLE IF NOT EXISTS tb_materiais_aplicados_os (
    id_material SERIAL PRIMARY KEY,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE CASCADE,
    descricao_peca VARCHAR(200) NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL DEFAULT 'N/A',
    lote_batch VARCHAR(100) NOT NULL DEFAULT 'N/A',
    quantidade NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unidade_medida VARCHAR(20) NOT NULL DEFAULT 'UN',
    tipo_documento_rastreabilidade VARCHAR(50) NOT NULL CHECK (tipo_documento_rastreabilidade IN ('SEGRAC', 'FORM_1_EASA', 'FAA_8130_3', 'COA_FABRICANTE', 'NOTA_FISCAL_HOMOLOGADA')),
    numero_documento_rastreabilidade VARCHAR(100) NOT NULL,
    data_validade_shelf_life DATE,
    aplicado_por_id_tecnico INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    aplicado_por_nome VARCHAR(150) NOT NULL,
    aplicado_por_canac VARCHAR(20) NOT NULL,
    data_hora_aplicacao TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. FERRAMENTAL PME (METROLOGIA E CALIBRAÇÃO)
CREATE TABLE IF NOT EXISTS tb_ferramentas (
    id_ferramenta SERIAL PRIMARY KEY,
    descricao VARCHAR(200) NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    posicao_localizacao VARCHAR(100) NOT NULL,
    requer_calibracao BOOLEAN NOT NULL DEFAULT TRUE,
    propriedade VARCHAR(30) NOT NULL DEFAULT 'PROPRIA' CHECK (propriedade IN ('PROPRIA', 'CLIENTE', 'TERCEIROS', 'ALUGADA')),
    status VARCHAR(30) NOT NULL DEFAULT 'DISPONIVEL' CHECK (status IN ('DISPONIVEL', 'EM_USO', 'EM_CALIBRACAO', 'QUARENTENA', 'DESATIVADA')),
    fabricante VARCHAR(100) NOT NULL DEFAULT 'N/A',
    faixa_operacao VARCHAR(100) NOT NULL DEFAULT 'N/A',
    tolerancia_admissivel VARCHAR(100) NOT NULL DEFAULT 'N/A',
    observacoes TEXT DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. CONTROLE DE CALIBRAÇÃO F 001-06
CREATE TABLE IF NOT EXISTS tb_controle_calibracao_f001_06 (
    id_calibracao SERIAL PRIMARY KEY,
    id_ferramenta INT NOT NULL REFERENCES tb_ferramentas(id_ferramenta) ON DELETE CASCADE,
    numero_laudo VARCHAR(100) NOT NULL,
    laboratorio_homologado VARCHAR(200) NOT NULL,
    desvio_padrao_observado NUMERIC(10, 4) NOT NULL,
    desvio_maximo_tolerado NUMERIC(10, 4) NOT NULL,
    aprovado_desvio_padrao BOOLEAN NOT NULL DEFAULT TRUE,
    data_afericao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    tag_f001_06_3_aplicada BOOLEAN NOT NULL DEFAULT TRUE,
    observacoes_laudo TEXT DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. MOVIMENTAÇÃO DE FERRAMENTAS F 001-06-1 (CHECK-IN / CHECK-OUT)
CREATE TABLE IF NOT EXISTS tb_movimentacao_ferramenta_f001_06_1 (
    id_movimentacao SERIAL PRIMARY KEY,
    numero_f001_06_1 VARCHAR(50) NOT NULL UNIQUE,
    id_ferramenta INT NOT NULL REFERENCES tb_ferramentas(id_ferramenta),
    id_tecnico INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    tipo_movimentacao VARCHAR(30) NOT NULL CHECK (tipo_movimentacao IN ('CHECK_OUT', 'CHECK_IN')),
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    ordem_servico_numero VARCHAR(50) NOT NULL DEFAULT 'N/A',
    finalidade_servico VARCHAR(200) NOT NULL DEFAULT 'N/A',
    condicoes_retirada VARCHAR(100) NOT NULL DEFAULT 'INTACTA_CALIBRADA',
    devolvido_em TIMESTAMP WITH TIME ZONE,
    condicoes_devolucao VARCHAR(100) DEFAULT 'N/A',
    id_tecnico_devolucao INT REFERENCES tb_pessoal_tecnico(id_tecnico),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. QUARENTENA DE FERRAMENTAS F 001-06-4
CREATE TABLE IF NOT EXISTS tb_quarentena_ferramentas_f001_06_4 (
    id_quarentena SERIAL PRIMARY KEY,
    numero_f001_06_4 VARCHAR(50) NOT NULL UNIQUE,
    id_ferramenta INT NOT NULL REFERENCES tb_ferramentas(id_ferramenta),
    motivo_segregacao TEXT NOT NULL,
    tag_vermelha_f001_01_6 VARCHAR(100) NOT NULL,
    data_entrada TIMESTAMP WITH TIME ZONE NOT NULL,
    responsavel_segregacao INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    local_armazenamento_segregado VARCHAR(200) NOT NULL,
    status_resolucao VARCHAR(50) NOT NULL DEFAULT 'RETIDO' CHECK (status_resolucao IN ('RETIDO', 'AGUARDANDO_ENVIO_LAB', 'LIBERADO_RECALIBRADO', 'SUCATEADO')),
    data_resolucao TIMESTAMP WITH TIME ZONE,
    despacho_qualidade TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. PUBLICAÇÕES TÉCNICAS F 001-02-1
CREATE TABLE IF NOT EXISTS tb_publicacoes_tecnicas_f001_02_1 (
    id_publicacao SERIAL PRIMARY KEY,
    codigo_manual VARCHAR(100) NOT NULL UNIQUE,
    titulo_manual VARCHAR(255) NOT NULL,
    fabricante VARCHAR(100) NOT NULL,
    modelo_aplicavel VARCHAR(100) NOT NULL,
    revisao_atual VARCHAR(50) NOT NULL,
    data_revisao DATE NOT NULL,
    data_proxima_consulta_mandatoria DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'VIGENTE' CHECK (status IN ('VIGENTE', 'REVISAO_PENDENTE', 'OBSOLETO')),
    tipo_midia VARCHAR(50) NOT NULL DEFAULT 'PORTAL_FABRICANTE_ONLINE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. CIÊNCIA DO CORPO TÉCNICO F 001-02-2
CREATE TABLE IF NOT EXISTS tb_ciencia_corpo_tecnico_f001_02_2 (
    id_ciencia SERIAL PRIMARY KEY,
    id_publicacao INT NOT NULL REFERENCES tb_publicacoes_tecnicas_f001_02_1(id_publicacao) ON DELETE CASCADE,
    id_tecnico INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    data_hora_ciencia TIMESTAMP WITH TIME ZONE NOT NULL,
    revisao_reconhecida VARCHAR(50) NOT NULL,
    declaracao_leitura_confirmada BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. FICHAS DE CUMPRIMENTO DE DIRETRIZES FCDA F 001-03-2
CREATE TABLE IF NOT EXISTS tb_fcda_f001_03_2 (
    id_fcda SERIAL PRIMARY KEY,
    numero_fcda VARCHAR(50) NOT NULL UNIQUE,
    numero_da_ad VARCHAR(100) NOT NULL,
    orgao_emissor VARCHAR(50) NOT NULL CHECK (orgao_emissor IN ('ANAC', 'FAA', 'EASA', 'TCCA')),
    titulo_diretriz TEXT NOT NULL,
    modelo_aeronave VARCHAR(100) NOT NULL,
    matricula_aeronave VARCHAR(20) NOT NULL,
    id_os INT REFERENCES tb_ordens_servico_f001_09_2(id_os),
    metodo_cumprimento TEXT NOT NULL,
    efetividade_atestada BOOLEAN NOT NULL DEFAULT FALSE,
    id_mecanico_executor INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    id_inspetor_aprs INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    data_cumprimento DATE NOT NULL,
    status_fcda VARCHAR(50) NOT NULL DEFAULT 'PENDENTE' CHECK (status_fcda IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. RELATÓRIOS DE INSPEÇÃO RI F 001-12
CREATE TABLE IF NOT EXISTS tb_relatorios_inspecao_f001_12 (
    id_ri SERIAL PRIMARY KEY,
    numero_ri VARCHAR(50) NOT NULL UNIQUE,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE CASCADE,
    numero_os VARCHAR(50) NOT NULL,
    matricula_aeronave VARCHAR(20) NOT NULL,
    descricao_discrepancia TEXT NOT NULL,
    origem_discrepancia VARCHAR(50) NOT NULL CHECK (origem_discrepancia IN ('INSPECAO_RECEBIMENTO', 'INSPECAO_PREVIA_CHEQUE', 'EM_SERVICO', 'PROCURA_DEFEITO_TROUBLESHOOTING', 'VISTORIA_QUALIDADE')),
    acao_corretiva_tomada TEXT DEFAULT 'N/A',
    referencia_amm_resolucao VARCHAR(100) DEFAULT 'N/A',
    id_mecanico_abertura INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    id_inspetor_aprs_liberacao INT REFERENCES tb_pessoal_tecnico(id_tecnico),
    status_ri VARCHAR(50) NOT NULL DEFAULT 'ABERTO' CHECK (status_ri IN ('ABERTO', 'EM_EXECUCAO', 'AGUARDANDO_APRS', 'APROVADO_ENCERRADO', 'CANCELADO')),
    data_hora_abertura TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fechamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. PASSAGEM DE TURNO F 001-24
CREATE TABLE IF NOT EXISTS tb_passagens_turno_f001_24 (
    id_passagem SERIAL PRIMARY KEY,
    numero_passagem VARCHAR(50) NOT NULL UNIQUE,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE CASCADE,
    numero_os VARCHAR(50) NOT NULL,
    matricula_aeronave VARCHAR(20) NOT NULL,
    turno_sainte VARCHAR(50) NOT NULL,
    turno_entrante VARCHAR(50) NOT NULL,
    id_tecnico_sainte INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    id_tecnico_entrante INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    data_passagem DATE NOT NULL,
    hora_passagem VARCHAR(20) NOT NULL,
    itens_pendentes TEXT NOT NULL,
    riscos_identificados TEXT DEFAULT 'N/A',
    todas_ferramentas_recolhidas BOOLEAN NOT NULL DEFAULT FALSE,
    area_trabalho_limpa_fod BOOLEAN NOT NULL DEFAULT FALSE,
    aceite_formal_entrante BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. CHECKLIST FOD DE ENCERRAMENTO (EVIDÊNCIA REAL DE LIMPEZA E DESOBSTRUÇÃO)
CREATE TABLE IF NOT EXISTS tb_checklist_fod (
    id_fod SERIAL PRIMARY KEY,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE CASCADE,
    todas_ferramentas_recolhidas BOOLEAN NOT NULL DEFAULT FALSE,
    area_limpa_inspecionada BOOLEAN NOT NULL DEFAULT FALSE,
    paineis_fechados_conferidos BOOLEAN NOT NULL DEFAULT FALSE,
    itens_estranhos_ausentes BOOLEAN NOT NULL DEFAULT FALSE,
    inspecao_visual_motores_concluida BOOLEAN NOT NULL DEFAULT FALSE,
    id_inspetor_responsavel INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    inspetor_nome VARCHAR(150) NOT NULL,
    inspetor_canac VARCHAR(20) NOT NULL,
    data_hora_inspecao TIMESTAMP WITH TIME ZONE NOT NULL,
    assinatura_fod VARCHAR(255) NOT NULL,
    observacoes TEXT DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 25. LIBERAÇÕES PARA RETORNO AO SERVIÇO (RTS)
CREATE TABLE IF NOT EXISTS tb_liberacoes_rts (
    id_rts SERIAL PRIMARY KEY,
    numero_rts VARCHAR(50) NOT NULL UNIQUE,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os),
    numero_os VARCHAR(50) NOT NULL,
    matricula_aeronave VARCHAR(20) NOT NULL,
    modelo_aeronave VARCHAR(100) NOT NULL,
    msn_aeronave VARCHAR(50) NOT NULL,
    operador_cliente VARCHAR(150) NOT NULL,
    base_liberacao VARCHAR(20) NOT NULL,
    data_hora_liberacao TIMESTAMP WITH TIME ZONE NOT NULL,
    tsn_liberacao VARCHAR(50) NOT NULL,
    csn_liberacao VARCHAR(50) NOT NULL,
    tipo_declaracao VARCHAR(50) NOT NULL CHECK (tipo_declaracao IN ('ANAC_RBAC_43_9', 'EASA_PART_145', 'DUAL_RELEASE_ANAC_EASA', 'NAO_APLICAVEL')),
    texto_declaracao_anac TEXT NOT NULL,
    texto_declaracao_easa TEXT,
    requer_declaracao_easa BOOLEAN NOT NULL DEFAULT FALSE,
    id_inspetor_aprs INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    inspetor_aprs_nome VARCHAR(150) NOT NULL,
    inspetor_aprs_canac VARCHAR(20) NOT NULL,
    assinatura_digital_aprs VARCHAR(255) NOT NULL,
    id_rt INT NOT NULL REFERENCES tb_pessoal_tecnico(id_tecnico),
    rt_nome VARCHAR(150) NOT NULL,
    rt_canac VARCHAR(20) NOT NULL,
    rt_crea VARCHAR(50) NOT NULL,
    assinatura_digital_rt VARCHAR(255) NOT NULL,
    texto_anotacao_lta TEXT NOT NULL,
    codigo_anotacao_lta VARCHAR(100) NOT NULL,
    distribuicao_vias JSONB NOT NULL DEFAULT '{}',
    observacoes_limitacoes TEXT DEFAULT 'N/A',
    status VARCHAR(30) NOT NULL DEFAULT 'VIGENTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 26. DOSSIÊ DIGITAL CONSOLIDADO DA OS (MOMQ 6.5 / RBAC 145.219 / EASA 145.A.55)
CREATE TABLE IF NOT EXISTS tb_dossies_digitais_os (
    id_dossie VARCHAR(100) PRIMARY KEY,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE CASCADE,
    numero_os VARCHAR(50) NOT NULL,
    matricula VARCHAR(20) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    msn VARCHAR(50) NOT NULL,
    operador VARCHAR(150) NOT NULL,
    base VARCHAR(20) NOT NULL,
    data_fechamento_os VARCHAR(30) NOT NULL,
    data_rts VARCHAR(30) NOT NULL,
    numero_rts VARCHAR(50) NOT NULL,
    tipo_release VARCHAR(50) NOT NULL,
    total_tarefas_apontadas INT NOT NULL DEFAULT 0,
    total_tarefas_iio INT NOT NULL DEFAULT 0,
    total_ris_f001_12_inclusos INT NOT NULL DEFAULT 0,
    total_fcdas_f001_03_2_inclusas INT NOT NULL DEFAULT 0,
    passagem_turno_f001_24_inclusa BOOLEAN NOT NULL DEFAULT FALSE,
    ferramentas_f001_06_1_inclusas INT NOT NULL DEFAULT 0,
    materiais_rastreabilidade_inclusos INT NOT NULL DEFAULT 0,
    checklist_fod_concluido BOOLEAN NOT NULL DEFAULT FALSE,
    anotacao_lta_emitida BOOLEAN NOT NULL DEFAULT TRUE,
    data_limite_retencao_anac_5anos VARCHAR(30) NOT NULL,
    data_limite_retencao_easa_3anos VARCHAR(30) NOT NULL,
    status_custodia VARCHAR(50) NOT NULL DEFAULT 'CUSTODIA_OBRIGATORIA_VIGENTE',
    local_armazenamento_fisico VARCHAR(255) NOT NULL,
    storage_key VARCHAR(255),
    storage_driver VARCHAR(50) DEFAULT 'local',
    -- HASH CRIPTOGRÁFICO REAL SHA-256 (NUNCA FICTÍCIO)
    hash_integridade_digital VARCHAR(64) NOT NULL,
    tamanho_estimado_pdf VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 27. CONTROLE CONFIGURÁVEL DE RETENÇÃO DOCUMENTAL (MOMQ / RBAC 145.211 / EASA)
CREATE TABLE IF NOT EXISTS tb_retencao_documental (
    id_retencao SERIAL PRIMARY KEY,
    id_dossie VARCHAR(100) NOT NULL REFERENCES tb_dossies_digitais_os(id_dossie) ON DELETE RESTRICT,
    id_os INT NOT NULL REFERENCES tb_ordens_servico_f001_09_2(id_os) ON DELETE RESTRICT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL,
    data_encerramento TIMESTAMP WITH TIME ZONE NOT NULL,
    data_rts TIMESTAMP WITH TIME ZONE NOT NULL,
    data_minima_retencao DATE NOT NULL,
    politica_retencao VARCHAR(100) NOT NULL DEFAULT 'RBAC 145.211 / EASA 145.A.55 (MÍNIMO 5 ANOS)',
    status_retencao VARCHAR(50) NOT NULL DEFAULT 'VIGENTE' CHECK (status_retencao IN ('VIGENTE', 'ARQUIVADO', 'RETIDO_LEGALMENTE', 'APTO_DESCARTE')),
    bloqueio_exclusao BOOLEAN NOT NULL DEFAULT TRUE,
    motivo_bloqueio TEXT NOT NULL DEFAULT 'Retenção regulatória obrigatória em conformidade com RBAC 145.211 / EASA 145.A.55.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 28. LOG PERSISTENTE DE AUDITORIA (TRILHA AUDITÁVEL DE TODAS AS ALTERAÇÕES CRÍTICAS)
CREATE TABLE IF NOT EXISTS tb_audit_log (
    id_audit SERIAL PRIMARY KEY,
    usuario_nome VARCHAR(150) NOT NULL,
    id_usuario INT REFERENCES tb_usuarios(id_usuario),
    cargo VARCHAR(100) NOT NULL DEFAULT 'N/A',
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    entidade VARCHAR(100) NOT NULL,
    id_entidade VARCHAR(100) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    estado_anterior JSONB,
    estado_posterior JSONB,
    motivo_detalhes TEXT NOT NULL,
    ip_origem VARCHAR(50) DEFAULT '127.0.0.1',
    hash_evento VARCHAR(64),
    hash_evento_anterior VARCHAR(64)
);

-- =============================================================================
-- ÍNDICES BÁSICOS DE PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tecnicos_canac ON tb_pessoal_tecnico(canac);
CREATE INDEX IF NOT EXISTS idx_tecnicos_base ON tb_pessoal_tecnico(id_base_alocada);
CREATE INDEX IF NOT EXISTS idx_os_numero ON tb_ordens_servico_f001_09_2(numero_os);
CREATE INDEX IF NOT EXISTS idx_os_status ON tb_ordens_servico_f001_09_2(status_os);
CREATE INDEX IF NOT EXISTS idx_os_matricula ON tb_ordens_servico_f001_09_2(campo_02_matricula);
CREATE INDEX IF NOT EXISTS idx_apontamentos_os ON tb_apontamentos_tarefas_os(id_os);
CREATE INDEX IF NOT EXISTS idx_ris_os ON tb_relatorios_inspecao_f001_12(id_os);
CREATE INDEX IF NOT EXISTS idx_ferramentas_sn ON tb_ferramentas(serial_number);
CREATE INDEX IF NOT EXISTS idx_ferramentas_status ON tb_ferramentas(status);
CREATE INDEX IF NOT EXISTS idx_dossie_os ON tb_dossies_digitais_os(id_os);
CREATE INDEX IF NOT EXISTS idx_rts_numero ON tb_liberacoes_rts(numero_rts);
CREATE INDEX IF NOT EXISTS idx_audit_entidade ON tb_audit_log(entidade, id_entidade);
CREATE INDEX IF NOT EXISTS idx_audit_data ON tb_audit_log(data_hora);

-- REGISTRO DA MIGRAÇÃO
INSERT INTO schema_migrations (migration_name) 
VALUES ('001_initial_schema.sql') 
ON CONFLICT (migration_name) DO NOTHING;
