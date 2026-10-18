import React, { useState } from 'react';
import {
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Wrench,
  BookOpen,
  FileCheck2,
  FileSpreadsheet,
  Package,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { BaseOperacional, PessoalTecnico, Ferramenta } from '../types/mro';
import { WorkOrderPrintModal } from './WorkOrderPrintModal';
import { MaterialRequisitionModal } from './MaterialRequisitionModal';
import { CalibrationMasterSheetModal } from './CalibrationMasterSheetModal';
import { ToolTagModal } from './ToolTagModal';

interface OfficialFormsDirectoryViewProps {
  bases: BaseOperacional[];
  tecnicos: PessoalTecnico[];
  onNavigateToTab?: (tab: string) => void;
}

export interface FormularioRegistro {
  codigo: string;
  instrucao: string;
  revisao: string;
  dataRevisao: string;
  nomeOficial: string;
  nomeIngles: string;
  modulo: 'ORDEM DE SERVIÇO' | 'CTM & DIRETRIZES' | 'FERRAMENTARIA' | 'RECURSOS HUMANOS' | 'SUPRIMENTOS' | 'EXECUÇÃO & HANGAR' | 'GARANTIA DA QUALIDADE';
  normasRegulamentares: string;
  descricaoUso: string;
  acaoTipo: 'modal_os' | 'modal_req' | 'modal_cal' | 'modal_tags' | 'nav_ctm' | 'nav_fcda' | 'nav_mandatorias' | 'nav_f001_07' | 'nav_designacoes' | 'nav_hangar' | 'nav_pcp' | 'nav_qualidade';
}

const FORMULARIOS_OFICIAIS: FormularioRegistro[] = [
  {
    codigo: 'FORM F 001-09-2 (RTS)',
    instrucao: 'MOMQ 5.7.1',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Aprovação para Retorno ao Serviço (RTS / Campo 19)',
    nomeIngles: 'Return to Service Approval & EASA Dual Release Declaration',
    modulo: 'GARANTIA DA QUALIDADE',
    normasRegulamentares: 'RBAC 43.9 / EASA Part-145 / MOMQ 5.7.1 / FAA 14 CFR 43.9',
    descricaoUso: 'Campo de liberação formal compulsório com carimbo e assinatura digital dupla (Inspetor APRS e Diretor Técnico/RT), declaração oficial bilíngue EASA Part-145 e distribuição das 3 vias lógicas (PCP, Base e Operador).',
    acaoTipo: 'nav_qualidade',
  },
  {
    codigo: 'LTA / LOGBOOK',
    instrucao: 'MOMQ 5.7.1',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Anotação Padronizada para o Livro Técnico da Aeronave (LTA)',
    nomeIngles: 'Standardized Aircraft Flight Logbook Maintenance Endorsement',
    modulo: 'GARANTIA DA QUALIDADE',
    normasRegulamentares: 'RBAC 43.9(a) / EASA 145.A.50 / MOMQ 5.7.1',
    descricaoUso: 'Texto e código de validação regulatória da anotação a ser transcrita ou colada no diário de bordo/livro de registro da aeronave, identificando dados aprovados, número da OS, datas, local e licença do aprovador.',
    acaoTipo: 'nav_qualidade',
  },
  {
    codigo: 'DOSSIÊ MOMQ 6.5',
    instrucao: 'P 001-01 / MOMQ 6.5',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Dossiê Técnico Consolidado & Arquivo Digital Permanente',
    nomeIngles: 'Consolidated Work Order Technical Dossier & Regulatory Archive',
    modulo: 'GARANTIA DA QUALIDADE',
    normasRegulamentares: 'RBAC 145.219 / MOMQ 6.5 / EASA 145.A.55 (Retenção 5 Anos)',
    descricaoUso: 'Agrupamento em arquivo único contendo OS F 001-09-2, Task Cards, RIs F 001-12, FCDA F 001-03-2, Fichas de Recebimento de Materiais e Certificados ARC/Form 1/8130-3 sob controle de prazo legal de retenção.',
    acaoTipo: 'nav_qualidade',
  },
  {
    codigo: 'FORM F 001-12',
    instrucao: 'I 001-12',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Relatório de Inspeção de Não Conformidades (RI)',
    nomeIngles: 'Discrepancy & Inspection Non-Conformance Report',
    modulo: 'EXECUÇÃO & HANGAR',
    normasRegulamentares: 'RBAC 145.109 / RBAC 43 / EASA Part-145 / MOMQ 5.4',
    descricaoUso: 'Abertura compulsória ao constatar discrepâncias durante inspeções preliminares ou de trânsito. Possui trava regulatória que bloqueia o encerramento da OS enquanto houver RI não resolvido ou sem aprovação APRS.',
    acaoTipo: 'nav_hangar',
  },
  {
    codigo: 'FORM F 001-24',
    instrucao: 'I 001-14',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Ficha de Passagem de Serviço e Turno Técnico (Handover)',
    nomeIngles: 'Maintenance Shift Handover Continuity Record',
    modulo: 'EXECUÇÃO & HANGAR',
    normasRegulamentares: 'RBAC 145.109 / MOMQ I 001-14 / EASA Part-145',
    descricaoUso: 'Registro formal de continuidade de manutenção com status das tarefas em andamento, ferramentas retidas na aeronave, discrepâncias abertas e identificação detalhada dos técnicos saindo e assumindo o turno.',
    acaoTipo: 'nav_hangar',
  },
  {
    codigo: 'FORM F 001-06-1',
    instrucao: 'I 001-06',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Controle Diário de Utilização e Devolução de Ferramental PME',
    nomeIngles: 'Precision Measuring Equipment Check-in & Check-out Record',
    modulo: 'FERRAMENTARIA',
    normasRegulamentares: 'RBAC 145.109 / MOMQ I 001-06 / BTI-PMP-05',
    descricaoUso: 'Registro de retirada e devolução de ferramentas na OS, exigindo apontamento do estado físico, conformidade metrológica e inspeção de integridade pós-uso com bloqueio em caso de avaria.',
    acaoTipo: 'nav_hangar',
  },
  {
    codigo: 'FORM F 001-09-2',
    instrucao: 'I 001-09',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Ordem de Serviço de Manutenção Aeronáutica (OS)',
    nomeIngles: 'Aircraft Maintenance Work Order',
    modulo: 'ORDEM DE SERVIÇO',
    normasRegulamentares: 'RBAC 145 / RBAC 43 / EASA Part-145.A.50',
    descricaoUso: 'Documento mandatório de abertura, execução, registro de discrepâncias, ferramentas utilizadas, peças aplicadas e liberação (Release to Service) com dupla assinatura (Executor e APRS).',
    acaoTipo: 'modal_os',
  },
  {
    codigo: 'FORM F 001-03-2',
    instrucao: 'I 001-03',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Ficha de Cumprimento de Diretriz de Aeronavegabilidade (FCDA)',
    nomeIngles: 'Airworthiness Directive & Service Bulletin Compliance Record',
    modulo: 'CTM & DIRETRIZES',
    normasRegulamentares: 'IS 39-001A / RBAC 145.109 / RBAC 43',
    descricaoUso: 'Ficha individual bilíngue de cumprimento de Diretrizes de Aeronavegabilidade (AD/DA) e Boletins de Serviço (SB), com justificativa técnica compulsória em caso de Não-Aplicabilidade.',
    acaoTipo: 'nav_fcda',
  },
  {
    codigo: 'FORM F 001-01-1',
    instrucao: 'I 001-05',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Requisição e Recebimento de Materiais e Peças',
    nomeIngles: 'Aeronautical Material Requisition & Receiving Inspection',
    modulo: 'SUPRIMENTOS',
    normasRegulamentares: 'RBAC 145.109 / MOMQ I 001-05 / EASA Form 1',
    descricaoUso: 'Formulário de requisição formal de componentes, materiais aeronáuticos e verificação física e documental de rastreabilidade (ARC, 8130-3, Form 1) antes da aplicação na OS.',
    acaoTipo: 'modal_req',
  },
  {
    codigo: 'FORM F 001-03',
    instrucao: 'I 001-03',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Ficha de Designação de Funções Técnicas e Autorizações',
    nomeIngles: 'Technical Scope & Authorization Designation Record',
    modulo: 'RECURSOS HUMANOS',
    normasRegulamentares: 'RBAC 145.163 / MOMQ MNT-001 / EASA Part-145',
    descricaoUso: 'Instrumento de homologação do escopo de autorização individual do técnico/inspetor (APRS, Célula, GMP, Aviônica), com trava digital que bloqueia assinatura de OS sem aprovação do RT.',
    acaoTipo: 'nav_designacoes',
  },
  {
    codigo: 'FORM F 001-06',
    instrucao: 'I 001-06',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Ficha Mestre de Calibração e Controle Metrológico (PME)',
    nomeIngles: 'Precision Measuring Equipment Calibration Control Record',
    modulo: 'FERRAMENTARIA',
    normasRegulamentares: 'RBAC 145.109 / BTI-PMP-05 / RBC-INMETRO',
    descricaoUso: 'Controle de histórico metrológico, rastreabilidade a padrões RBC/INMETRO, validação do desvio padrão tolerado e periodicidade de aferição.',
    acaoTipo: 'modal_cal',
  },
  {
    codigo: 'FORM F 001-07',
    instrucao: 'I 001-07',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Relação Trimestral de Pessoal de Manutenção e Inspeção',
    nomeIngles: 'Quarterly Roster of Maintenance and Inspection Personnel',
    modulo: 'RECURSOS HUMANOS',
    normasRegulamentares: 'RBAC 145.161 / MOMQ I 001-07 / EASA Part-145',
    descricaoUso: 'Relatório oficial submetido à fiscalização da ANAC e EASA com status de habilitações CCT, designações F 001-03 vigentes, exames toxicológicos PPSP e condição operacional.',
    acaoTipo: 'nav_f001_07',
  },
  {
    codigo: 'FORM F 001-03-3 / F 001-24',
    instrucao: 'I 001-24',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Relatório Mensal de Diretrizes Mandatórias Cumpridas',
    nomeIngles: 'Monthly Summary of Airworthiness Directives Compliance',
    modulo: 'CTM & DIRETRIZES',
    normasRegulamentares: 'MOMQ I 001-24 / RBAC 145.109 / IS 39-001A',
    descricaoUso: 'Relatório consolidado mensal de todas as DAs, ADs e SBs executados pela Impacto Aviation para envio formal ao CTM do operador/cliente e arquivamento permanente no PCP.',
    acaoTipo: 'nav_mandatorias',
  },
  {
    codigo: 'FORM F 001-06-04',
    instrucao: 'I 001-06',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Termo de Transferência para Quarentena e Segregação',
    nomeIngles: 'Quarantine and Segregation Area Transfer Record',
    modulo: 'FERRAMENTARIA',
    normasRegulamentares: 'RBAC 145.109 / MOMQ MNT-001 Rev 08 (Regra #2)',
    descricaoUso: 'Documento mandatório emitido ao detectar ferramenta vencida ou reprovada por desvio padrão, formalizando sua retenção imediata na área de quarentena.',
    acaoTipo: 'modal_tags',
  },
  {
    codigo: 'FORM F 001-01-6 (Tag Vermelha)',
    instrucao: 'I 001-06 / I 001-01',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Etiqueta de Material Não Utilizável (Tag Vermelha)',
    nomeIngles: 'Unserviceable Material Red Tag',
    modulo: 'FERRAMENTARIA',
    normasRegulamentares: 'RBAC 145 / MOMQ MNT-001 (Regra Inviolável #2)',
    descricaoUso: 'Etiqueta vermelha de afixação física obrigatória em qualquer ferramenta, peça ou equipamento reprovado, bloqueado ou em quarentena técnica.',
    acaoTipo: 'modal_tags',
  },
  {
    codigo: 'FORM F 001-06-3 (Tag Amarela)',
    instrucao: 'I 001-06',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Etiqueta de Instrumento Calibrado (Tag Amarela)',
    nomeIngles: 'Calibrated Tool Yellow Tag',
    modulo: 'FERRAMENTARIA',
    normasRegulamentares: 'RBAC 145.109 / BTI-PMP-05 / RBC',
    descricaoUso: 'Etiqueta amarela afixada na ferramenta com número de certificado RBC, data de aferição, próximo vencimento e desvio padrão metrológico atestado.',
    acaoTipo: 'modal_tags',
  },
  {
    codigo: 'FORM F 001-02-1',
    instrucao: 'I 001-02',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Tabela Mestre de Publicações Técnicas',
    nomeIngles: 'Master Technical Publications Index',
    modulo: 'CTM & DIRETRIZES',
    normasRegulamentares: 'IS 145.109-001 / RBAC 145.109 / MOMQ I 001-02',
    descricaoUso: 'Controle de títulos de manuais de manutenção (AMM, IPC, MPD, WDM, SRM), revisão atualizada, data de revisão, responsável técnico e carta de concessão associada.',
    acaoTipo: 'nav_ctm',
  },
  {
    codigo: 'FORM F 001-02-2',
    instrucao: 'I 001-02',
    revisao: 'R08',
    dataRevisao: '15/01/2026',
    nomeOficial: 'Registro de Ciência do Corpo Técnico em Manuais',
    nomeIngles: 'Technical Staff Manual Revision Acknowledgment Record',
    modulo: 'CTM & DIRETRIZES',
    normasRegulamentares: 'IS 145.109-001 / MOMQ MNT-001 / EASA Part-145',
    descricaoUso: 'Evidência formal de ciência eletrônica e assinatura digital de mecânicos e inspetores para novas revisões incorporadas no Livro Mestre de Manuais.',
    acaoTipo: 'nav_ctm',
  },
];

export const OfficialFormsDirectoryView: React.FC<OfficialFormsDirectoryViewProps> = ({
  bases,
  tecnicos,
  onNavigateToTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduloFiltro, setModuloFiltro] = useState<string>('TODOS');

  // Modals state
  const [isOsModalOpen, setIsOsModalOpen] = useState(false);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

  // Sample tool conforming to Ferramenta interface
  const sampleTool: Ferramenta = {
    id_ferramenta: 1,
    descricao: 'Torquímetro de Estalo Snap-On 1/2" (20 - 250 Nm)',
    part_number: 'QD3R250',
    serial_number: 'SN-88219-SP',
    posicao_localizacao: 'Armário Metrológico A-02 / Gaveta 3',
    requer_calibracao: true,
    propriedade: 'PROPRIA',
    status: 'DISPONIVEL',
    fabricante: 'Snap-On Tools Corp.',
    faixa_operacao: '20 - 250 Nm',
    tolerancia_admissivel: '± 2.5%',
    observacoes: 'Calibração realizada conforme BTI-PMP-05.',
    periodicidade_meses: 12,
    data_ultima_calibracao: '15/01/2026',
    data_proxima_calibracao: '15/01/2027',
    status_calibracao: 'EM_DIA',
    status_operacional: 'DISPONIVEL',
    nome_base: 'Base Principal GRU',
  };

  const handleAction = (form: FormularioRegistro) => {
    switch (form.acaoTipo) {
      case 'modal_os':
        setIsOsModalOpen(true);
        break;
      case 'modal_req':
        setIsReqModalOpen(true);
        break;
      case 'modal_cal':
        setIsCalModalOpen(true);
        break;
      case 'modal_tags':
        setIsTagsModalOpen(true);
        break;
      case 'nav_ctm':
        onNavigateToTab?.('ctm');
        break;
      case 'nav_fcda':
        onNavigateToTab?.('fcda');
        break;
      case 'nav_mandatorias':
        onNavigateToTab?.('relatorio-mandatorias');
        break;
      case 'nav_f001_07':
        onNavigateToTab?.('relatorio-f001-07');
        break;
      case 'nav_designacoes':
        onNavigateToTab?.('designacoes');
        break;
      case 'nav_hangar':
        onNavigateToTab?.('hangar');
        break;
      case 'nav_pcp':
        onNavigateToTab?.('pcp');
        break;
      case 'nav_qualidade':
        onNavigateToTab?.('qualidade');
        break;
      default:
        break;
    }
  };

  const filtrados = FORMULARIOS_OFICIAIS.filter((f) => {
    if (moduloFiltro !== 'TODOS' && f.modulo !== moduloFiltro) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        f.codigo.toLowerCase().includes(q) ||
        f.nomeOficial.toLowerCase().includes(q) ||
        f.instrucao.toLowerCase().includes(q) ||
        f.normasRegulamentares.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 font-mono font-bold text-xs bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded">
              DIRETÓRIO MESTRE • ZERO DIVERGÊNCIA
            </span>
            <span className="text-slate-400 text-xs font-mono">
              COM ANAC 200607-05 • EASA.145.1003 • MOMQ MNT-001 (Rev 08)
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            Central de Formulários Oficiais da Impacto Aviation
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Todos os formulários, telas de impressão A4 (@media print), relatórios e etiquetas oficiais seguem rigorosamente a estrutura dos manuais e instruções regulamentares ("I"):
            cabeçalho oficial obrigatório, ordem e numeração sequencial de campos (Campo 01, Campo 02...), aviso compulsório da <strong>Regra Inviolável #1 (N/A)</strong>,
            nota mandatória de prevenção FOD e declarações formais de Retorno ao Serviço EASA Part-145.
          </p>
        </div>

        {/* Quick Print Demonstration Buttons */}
        <div className="flex flex-wrap gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => setIsOsModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Emitir OS (F 001-09-2)</span>
          </button>
          <button
            onClick={() => setIsReqModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Requisição (F 001-01-1)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por formulário (ex: F 001-09-2), instrução (I 001-03) ou norma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 transition font-mono"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          {['TODOS', 'GARANTIA DA QUALIDADE', 'ORDEM DE SERVIÇO', 'EXECUÇÃO & HANGAR', 'CTM & DIRETRIZES', 'FERRAMENTARIA', 'RECURSOS HUMANOS', 'SUPRIMENTOS'].map((m) => (
            <button
              key={m}
              onClick={() => setModuloFiltro(m)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                moduloFiltro === m
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Official Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((form) => (
          <div
            key={form.codigo}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between transition group"
          >
            <div>
              {/* Form Code Badge & Revision */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded bg-black text-amber-400 font-mono font-black text-xs border border-amber-500/40">
                  {form.codigo}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {form.instrucao} • {form.revisao} ({form.dataRevisao})
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                {form.nomeOficial}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 italic">
                {form.nomeIngles}
              </p>

              {/* Module Badge & Rules */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                  {form.modulo}
                </span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-medium bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                  {form.normasRegulamentares}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                {form.descricaoUso}
              </p>
            </div>

            {/* Action Bottom */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                A4 Impressão Rigorosa
              </span>
              <button
                onClick={() => handleAction(form)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold rounded-lg text-xs transition flex items-center space-x-1.5 group-hover:bg-amber-400 group-hover:text-slate-950"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Visualizar / Imprimir A4</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Print & Preview Modals */}
      <WorkOrderPrintModal
        isOpen={isOsModalOpen}
        onClose={() => setIsOsModalOpen(false)}
      />

      <MaterialRequisitionModal
        isOpen={isReqModalOpen}
        onClose={() => setIsReqModalOpen(false)}
      />

      <CalibrationMasterSheetModal
        tool={sampleTool}
        isOpen={isCalModalOpen}
        onClose={() => setIsCalModalOpen(false)}
      />

      <ToolTagModal
        tool={sampleTool}
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
      />
    </div>
  );
};
