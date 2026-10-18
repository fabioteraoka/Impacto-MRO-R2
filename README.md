# Impacto Aviation MRO

Sistema de Gestão e Auditoria Técnica de Manutenção Aeronáutica  
Homologações de Referência: **ANAC COM 200607-05** / **EASA.145.1003**  
Normas Base: **RBAC 145**, **RBAC 43**, **EASA Part-145**, **IS 145.109-001** e **Manual da Organização de Manutenção da Qualidade (MOMQ)**

---

## 1. Objetivo

Transformar a base do sistema Impacto Aviation MRO em uma arquitetura técnica robusta, transacional, auditável e preparada para migração contínua de banco de dados local para a nuvem. O sistema é projetado para operar com estrita integridade documental e operacional, registrando evidências reais de execução e bloqueando transições irregulares no ciclo de vida de Ordens de Serviço (OS), pessoal técnico, ferramentaria, inspeções e retenção.

---

## 2. Status Atual do Projeto

| Dimensão | Classificação | Detalhamento |
|---|---|---|
| **Arquitetura de Banco Relacional** | **IMPLEMENTADO** | Esquema SQL relacional em `migrations/001_initial_schema.sql` com tabelas, PKs, FKs, constraints, timestamps, índices, pool de conexões e transações ACID. |
| **Persistência Híbrida / Resiliência** | **IMPLEMENTADO** | Conector PostgreSQL com fallback resiliente para motor em memória com rollback estrito e integridade operacional contínua no ambiente de desenvolvimento/preview. |
| **Máquina de Estados da OS** | **IMPLEMENTADO** | Transição controlada `ABERTA -> EM_EXECUCAO -> AGUARDANDO_INSPECAO -> GQ -> RTS -> ENCERRADA` com bloqueio prévio a mutações de estado e validação de pré-requisitos. |
| **Trilha de Auditoria Persistente** | **IMPLEMENTADO** | Registro persistente com usuário, data/hora, entidade, ID, ação, estado anterior/posterior, motivo e encadeamento SHA-256 de eventos. |
| **Cálculo Criptográfico Real SHA-256** | **IMPLEMENTADO** | Eliminação completa de hashes fictícios ou vazios. O hash do dossiê é calculado sobre o JSON canônico consolidado de evidências da OS, com verificação de integridade via API. |
| **Controle de Resíduos e Prevenção FOD** | **IMPLEMENTADO** | Eliminação da aprovação cega por booleano. Exigência de execução física do checklist FOD com inspeção de áreas, fechamento de acessos e recolhimento 100% de ferramentas. |
| **Independência de Inspeção IIO** | **IMPLEMENTADO** | Validação que impede que o mecânico executor assine como inspetor APRS da mesma tarefa crítica. |
| **Controle de Qualificação de Pessoal** | **IMPLEMENTADO** | Validação multifatorial: licença CCT ativa, designação F 001-03 com assinatura do RT, exame toxicológico PPSP em dia e treinamentos mandatórios MNT-002 válidos. |
| **Regra de Antecedência de 24h** | **IMPLEMENTADO** | Validação com base no delta entre data/hora de abertura/solicitação e previsão real de início dos trabalhos. |
| **EASA / Dual Release Explícito** | **IMPLEMENTADO** | Remoção de defaults automáticos. Aplicação restrita baseada na matrícula/operador ou seleção justificada. |
| **Retenção Documental Regulatória** | **IMPLEMENTADO** | Controle configurável de custódia obrigatória (mínimo 5 anos para ANAC RBAC 145.211 / 3 anos para EASA), com bloqueio de exclusão por API. |
| **Formulários e Relatórios Físicos** | **PARCIAL** | Layouts e visões atuais são **modelos provisórios** para validação operacional de fluxos, pendentes de aprovação e padronização com a identidade oficial da organização. |
| **Integração Externa com SEI-SIGRAC** | **PLANEJADO** | Não há integração via API em tempo real com os sistemas da ANAC. O sistema apenas gera relatórios estruturados prontos para submissão manual/protocolar. |

---

## 3. Arquitetura

O sistema adota uma arquitetura em camadas orientada a serviços e desacoplada da infraestrutura:

```
[ Frontend SPA - React 19 / TypeScript / Vite / Tailwind CSS ]
                         │  (Chamadas REST / JSON)
                         ▼
        [ API Gateway / Express Router (src/server/api.ts) ]
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
[ State Machine ]   [ Audit Engine ]  [ Storage Provider ]
(os/stateMachine)   (auditLogger)     (storageProvider)
     │                   │                   │
     └───────────────────┼───────────────────┘
                         ▼
       [ Camada de Domínio / Regras MRO (src/server/db.ts) ]
                         │
        [ Gerenciador Transacional (src/server/db/connection.ts) ]
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
[ PostgreSQL Local / Nuvem ]    [ Motor Resiliente ]
(Migrations & Transações SQL)    (Testes e Execução Ágil)
```

---

## 4. Stack

- **Linguagem:** TypeScript 5.7+
- **Backend:** Node.js 22+, Express 4.21, `pg` (node-postgres 8.13)
- **Frontend:** React 19, Vite 6, Tailwind CSS 4, Lucide Icons, Motion
- **Banco de Dados:** PostgreSQL 15+ (Local / Docker / Cloud SQL)
- **Criptografia & Hashing:** Módulo nativo Node.js `crypto` (SHA-256)
- **Execução & Transpilação:** `tsx` (TypeScript Execute)

---

## 5. Banco de Dados Local

### 5.1 Instalação do PostgreSQL

#### Opção A: Docker (Recomendada para Desenvolvimento)
```bash
docker run --name pg-impacto-mro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=impacto_mro \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### Opção B: Instalação Nativa (Linux / Ubuntu / Debian)
```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE impacto_mro OWNER postgres;"
```

#### Opção C: macOS (Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
createuser -s postgres
createdb -U postgres impacto_mro
```

---

## 6. Instalação e Execução

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd impacto-mro

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Executar migrações do banco de dados
npm run db:migrate

# 5. Carregar massa inicial de dados regulatórios (Seed)
npm run db:seed

# 6. Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 7. Variáveis de Ambiente

Arquivo de configuração: `.env` (referência em `.env.example`):

```ini
# Conexão Principal PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/impacto_mro"

# Parâmetros Específicos
PGHOST="localhost"
PGPORT="5432"
PGUSER="postgres"
PGPASSWORD="postgres"
PGDATABASE="impacto_mro"
PGSSL="false"
PG_POOL_MAX="10"

# Provedor de Armazenamento de Dossiês ("local" ou "s3")
STORAGE_DRIVER="local"
STORAGE_BASE_PATH="./storage"

# Servidor Web
PORT=3000
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

---

## 8. Migrations

O sistema possui um runner dedicado de migrações em `src/server/db/migrate.ts`.
As migrações são executadas em ordem lexicográfica estrita, com controle transacional e registro na tabela `schema_migrations`.

```bash
npm run db:migrate
```

### Arquivos de Migração Disponíveis:
- `migrations/001_initial_schema.sql`: Criação das 28 tabelas relacionais, chaves primárias, integridade referencial (FKs), constraints e índices.

---

## 9. Seed

O script `src/server/db/seed.ts` popula o banco de dados com dados regulatórios consistentes e estruturados:

```bash
npm run db:seed
```

Massa de dados carregada:
- Bases operacionais (GRU, CNF, VCP, SDU);
- Usuários com perfis RBAC (RT, Gerente da Qualidade, Inspetor Chefe, Mecânico Líder, PCP);
- Pessoal técnico com licenças CCT e históricos;
- Designações de funções F 001-03 assinadas;
- Treinamentos mandatórios MNT-002;
- Ferramental calibrado e histórico de aferições;
- Especificações Operativas (EO) e Cartas de Concessão;
- Ordens de Serviço (F 001-09-2), apontamentos e Liberações RTS.

---

## 10. Estrutura de Dados (Principais Tabelas)

| Tabela | Descrição |
|---|---|
| `tb_bases_operacionais` | Bases homologadas com código ANAC e classificação operacional. |
| `tb_usuarios` | Contas de acesso, perfis funcionais e permissões granulares. |
| `tb_pessoal_tecnico` | Cadastro técnico (CANAC, CPF, cargo, exame toxicológico PPSP). |
| `tb_designacao_funcoes_f001_03` | Autorizações formais de escopo assinadas pelo RT. |
| `tb_treinamento_mnt002` | Cursos mandatórios (RBAC 145, Fatores Humanos, SGSO). |
| `tb_ordens_servico_f001_09_2` | Registro central da OS (Campos 01 a 16). |
| `tb_os_status_history` | Histórico cronológico e imutável de transições de status da OS. |
| `tb_apontamentos_tarefas_os` | Execuções de tarefas, referências AMM, rubricas e marcas de IIO. |
| `tb_materiais_aplicados_os` | Rastreabilidade de peças (P/N, S/N, Lote, Form 1 / 8130-3). |
| `tb_ferramentas` | Catálogo de ferramental com calibração metrológica (P/N, S/N). |
| `tb_controle_calibracao_f001_06` | Laudos de aferição, laboratório e tolerância BTI-PMP-05. |
| `tb_movimentacao_ferramenta_f001_06_1` | Registro de Check-Out e Check-In vinculado à OS. |
| `tb_quarentena_ferramentas_f001_06_4` | Segregação preventiva com Tag Vermelha F 001-01-6. |
| `tb_relatorios_inspecao_f001_12` | Registro e resolução de discrepâncias técnicas (RI). |
| `tb_passagens_turno_f001_24` | Formalização de transição entre equipes de trabalho. |
| `tb_checklist_fod` | Evidências físicas de desobstrução e inspeção de resíduos. |
| `tb_liberacoes_rts` | Declarações formais de liberação para retorno ao serviço. |
| `tb_dossies_digitais_os` | Consolidação técnica com hash criptográfico SHA-256. |
| `tb_retencao_documental` | Política configurável de custódia e bloqueio de exclusão. |
| `tb_audit_log` | Trilha de auditoria encadeada de eventos críticos. |

---

## 11. Regras de Negócio Implementadas

1. **Regra Inviolável #1 (Preenchimento Obrigatório / Sanitização N/A):** Proibição de campos nulos ou em branco em registros técnicos; preenchimento automático com `'N/A'` quando não aplicável.
2. **Regra #2 (Bloqueio Automático de Ferramental Vencido):** Ferramentas com calibração periódica vencida ou desvio metrológico são movidas imediatamente para `QUARENTENA` com afixação de Tag Vermelha, bloqueando alocação em OS.
3. **Regra #3 (Independência de Inspeção IIO):** Tarefas com criticidade IIO (Item de Inspeção Obrigatória) exigem dupla assinatura; o Inspetor APRS não pode ser a mesma pessoa que o mecânico executor (`id_mecanico_executor !== id_inspetor_aprs`).
4. **Regra #4 (Bloqueio de Encerramento por RI Pendente):** A OS não pode ser encerrada se houver qualquer Relatório de Inspeção (RI / F 001-12) em aberto.
5. **Regra #5 (Bloqueio por Ferramental Não Devolvido):** O fechamento da OS exige check-in de 100% das ferramentas retiradas na Ferramentaria.
6. **Regra #6 (Bloqueio por Qualificação Técnica):** Mecânicos ou inspetores com treinamentos mandatórios vencidos, toxicológico pendente ou sem F 001-03 assinado pelo RT são impedidos de assinar serviços.
7. **Regra #7 (Validação de Antecedência de 24h):** O PCP calcula a antecedência entre o registro e o início previsto dos trabalhos; violações geram bloqueio que exige concessão de urgência formal.
8. **Regra #8 (Evidência Real de Prevenção FOD):** Não basta flag textual; o encerramento exige registro do checklist FOD com conferência física de ferramentas, áreas limpas e painéis fechados.
9. **Regra #9 (Validação de Usuários Sem Fallback Silencioso):** Se mecânico, inspetor ou RT informado não existir no cadastro ativo, a operação é rejeitada com erro explícito.

---

## 12. Fluxo da Ordem de Serviço (Máquina de Estados)

```
[ ABERTA ]
    │
    ▼ (Exige: Mecânico e Inspetor qualificados + Antecedência 24h)
[ EM_EXECUCAO ]
    │
    ▼ (Exige: 100% das tarefas apontadas e executadas)
[ AGUARDANDO_INSPECAO ]
    │
    ▼ (Exige: RIs resolvidos + IIO com dupla assinatura independente)
[ GQ (Garantia da Qualidade) ]
    │
    ▼ (Exige: Auditoria GQ aprovada + Checklist FOD executado + 100% ferramentas devolvidas)
[ RTS (Aprovação para Retorno ao Serviço) ]
    │
    ▼ (Exige: RTS emitido e assinado + Passagem de turno aceita + Retenção gerada)
[ ENCERRADA ]  <-- Estado Terminal (Dossiê Consolidado & Hash SHA-256 gravados)
```

Qualquer tentativa de salto de estado é interceptada pelo módulo `src/server/os/stateMachine.ts`, retornando código de erro e registrando a tentativa na trilha de auditoria.

---

## 13. Auditoria

Todas as alterações estruturais são registradas de forma persistente através do `auditLogger`:
- **Campos registrados:** Usuário responsável, ID do usuário, cargo, data/hora ISO, entidade afetada, ID da entidade, ação realizada, estado anterior (JSON), estado posterior (JSON), justificativa técnica e IP de origem.
- **Encadeamento de Eventos:** Cada registro calcula um hash SHA-256 encadeado com o hash do evento anterior (`hash_evento` e `hash_evento_anterior`), permitindo validar a cronologia da trilha de eventos.

---

## 14. Dossiê Digital e Verificação SHA-256

Ao emitir a Liberação RTS e encerrar a OS:
1. É construído o documento canônico de evidências (`OS`, `Tarefas`, `RIs`, `IIO`, `FCDA`, `Ferramentas`, `Materiais`, `RTS`, `FOD`, `Passagem de Turno` e `Auditoria`).
2. É calculado o hash criptográfico real **SHA-256** sobre o conteúdo serializado.
3. O documento é arquivado via `storageProvider` e o hash é gravado no registro `tb_dossies_digitais_os`.
4. **Verificação de Integridade:** Endpoint `POST /api/qualidade/dossies/:id_dossie/verificar-integridade` reconstrói ou lê o arquivo físico, recalcula o SHA-256 e compara com o valor registrado no banco, identificando imediatamente qualquer alteração ou corrupção de dados.

---

## 15. Segurança e Permissões (RBAC)

O sistema define perfis de acesso granulares:
- **RT (Responsável Técnico):** Autorização plena, emissão de RTS, assinatura de F 001-03, encerramento de OS.
- **GERENTE_QUALIDADE:** Auditoria compulsória GQ, gestão de quarentena, fiscalização de normas.
- **INSPETOR_CHEFE / INSPETOR:** Dupla assinatura IIO, aprovação de RIs, inspeção FOD, aprovação de tarefas.
- **MECANICO:** Apontamento de tarefas, abertura de RIs, movimentação de ferramentas.
- **PCP:** Abertura e planejamento de OS, análise de solicitações comerciais.
- **AUDITOR:** Acesso somente-leitura e emissão de relatórios de conformidade.

---

## 16. FORMULÁRIOS E RELATÓRIOS — STATUS

> **AVISO IMPORTANTE:**
> 
> Os layouts de formulários e relatórios visualizados nesta versão do sistema (**F 001-09-2**, **F 001-03**, **F 001-06**, **F 001-12**, **F 001-24**, **LTA**, **RTS** e **Relatório Trimestral F 001-07**) são **PROTÓTIPOS PROVISÓRIOS**.
> 
> - Posteriormente serão padronizados estritamente de acordo com os documentos controlados, procedimentos operacionais padrão e manual de identidade visual da organização.
> - Números de formulário, revisões vigentes, campos formais, cabeçalhos, rodapés normativos, campos de carimbo/assinatura e formatação gráfica serão refinados em ciclo de controle de documentos.
> - A versão final será submetida ao processo interno de aprovação formal da Gerência de Garantia da Qualidade e Diretoria Técnica.
> - **Somente após esse processo interno formal os formulários devem ser considerados para uso oficial ou apresentação perante a autoridade de aviação civil.**
> - Nenhuma afirmação de fidelidade documental estrita deve ser assumida antes da validação final contra os documentos controlados da empresa.

---

## 17. Retenção Documental

Em estrito atendimento ao **RBAC 145.211** e **EASA Part-145.A.55**, o sistema implementa controle configurável de retenção documental:
- **Prazo Mínimo Obrigatório:** 5 anos a contar da data de RTS para a ANAC; 3 anos para a EASA.
- **Bloqueio de Exclusão:** Registros arquivados possuem `bloqueio_exclusao: true`. Tentativas de exclusão via API retornam HTTP 403 (`RETENCAO_REGULATORIA_BLOQUEADA`), impedindo destruição acidental ou intencional de registros de aeronavegabilidade.

---

## 18. Backup e Restauração

### Backup do Banco de Dados PostgreSQL
```bash
# Backup completo em formato comprimido
pg_dump -U postgres -h localhost -d impacto_mro -F c -b -v -f backup_impacto_mro_$(date +%Y%m%d_%H%M%S).dump

# Backup em SQL puro para auditoria visual
pg_dump -U postgres -h localhost -d impacto_mro --clean --if-exists -f backup_impacto_mro.sql
```

### Restauração do Banco de Dados
```bash
# Recriação e restauração a partir do dump
dropdb -U postgres -h localhost impacto_mro
createdb -U postgres -h localhost impacto_mro
pg_restore -U postgres -h localhost -d impacto_mro -v backup_impacto_mro_*.dump
```

---

## 19. Preparação para Nuvem

A arquitetura foi estruturada para transição direta para provedores de nuvem (AWS / GCP / Azure):
- **Isolamento de Infraestrutura:** Configuração 100% externalizada via variáveis de ambiente (`DATABASE_URL`, `PGHOST`, `PGPORT`).
- **Abstração de Armazenamento:** Interface `IDocumentStorageProvider` com implementação `LocalStorageProvider` e driver desacoplado `S3StorageProvider` pronto para ativação via `STORAGE_DRIVER="s3"`.
- **Independência de Provedor:** Nenhuma dependência proprietária de vendor cloud na camada de regras de negócio.
- **Conexão Segura:** Suporte a conexões SSL com banco de dados em nuvem (`PGSSL="true"`).

---

## 20. Pendências Conhecidas

1. **Protocolo SEI-SIGRAC da ANAC:** O envio de relatórios e notificações à autoridade ainda depende de transmissão manual via portal gov.br / SEI da ANAC.
2. **Padronização Gráfica Oficial de Formulários:** Substituição dos layouts prototípicos pelos modelos oficiais aprovados pelo controle de documentos da empresa.
3. **Assinatura Digital ICP-Brasil (A3/Nuvem):** A autenticação atual utiliza carimbo digital e hashes de integridade internos; a integração com certificados digitais ICP-Brasil está em fase de especificação.

---

## 21. Roadmap

- [x] Criação de schema PostgreSQL relacional e transações ACID.
- [x] Implementação da máquina de estados controlada da OS.
- [x] Auditoria persistente com trilha encadeada de eventos.
- [x] Verificação criptográfica real SHA-256 de dossiês.
- [x] Controle de evidências reais para prevenção FOD e Passagem de Turno.
- [x] Validação rigorosa de 24h e eliminação de defaults automáticos EASA.
- [ ] Integração com repositório de storage S3 / Cloud Storage em produção.
- [ ] Módulo de padronização visual e aprovação interna de formulários controlados.
- [ ] Assinatura com certificado digital compatível com padrão ICP-Brasil.

---

## 22. Status de Conformidade

> **DECLARAÇÃO DE STATUS DE CONFORMIDADE:**  
> 
> *Este software está em desenvolvimento e não deve ser considerado, nesta versão, como sistema aprovado pela autoridade ou como evidência de conformidade regulatória. Os controles implementados devem ser validados contra os procedimentos, documentos controlados e requisitos aplicáveis da organização.*

---

## 23. Diferenciação de Relatórios e Integração ANAC / SEI-SIGRAC

Para garantir absoluta transparência técnica:
1. **Relatório Gerado pelo Sistema:** Documento estruturado pelo software (ex: F 001-07, LTA, RTS) contendo os dados operacionais compilados internamente.
2. **Arquivo Preparado para Envio:** Pacote de dados formatado segundo as diretrizes regulatórias, pronto para ser anexado em peticionamentos ou protocolos.
3. **Integração Efetiva com Sistema Externo:** Conexão direta via webservice/API com os sistemas da ANAC (SEI / SIGRAC). **Esta integração NÃO existe nesta versão.**
