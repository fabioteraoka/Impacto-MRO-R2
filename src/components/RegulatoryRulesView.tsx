import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertTriangle,
  Scale,
  Lock,
  FileSignature,
  FileCheck2,
} from 'lucide-react';

export const RegulatoryRulesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded">
            MANUAL MOMQ MNT-001 (REV 08)
          </span>
          <span className="text-slate-400 text-xs font-mono">
            RBAC 145 • RBAC 43 • RBAC 65 • EASA PART-145
          </span>
        </div>
        <h2 className="text-lg font-bold text-white mt-1">
          Regras Invioláveis de Negócio e Auditoria (Zero Risk Audit)
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Estas 6 diretrizes são rigorosamente aplicadas no backend e frontend do sistema de MRO da Impacto Aviation. Qualquer violação causa bloqueio preventivo automático no banco de dados e impede assinaturas em Ordens de Serviço.
        </p>
      </div>

      {/* Grid of 6 rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Regra 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              REGRA 1
            </span>
            <span className="text-emerald-400 text-[11px] font-mono flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> ATIVA NO CÓDIGO
            </span>
          </div>
          <h3 className="font-bold text-sm text-white font-sans">
            REGRA DO "N/A" OBRIGATÓRIO (Zero Blank Fields)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Conforme o MOMQ e Instruções de Qualidade, <strong>NUNCA</strong> é permitido campos ou formulários em branco no banco de dados ou nas telas. Se um item não for aplicável (ex: licença CCT para PCP ou motivo não aplicável em FCDA), o sistema registra e exibe compulsoriamente a string <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">"N/A"</code>.
          </p>
        </div>

        {/* Regra 2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              REGRA 2
            </span>
            <span className="text-slate-400 text-[11px] font-mono">PARTE 2: FERRAMENTARIA</span>
          </div>
          <h3 className="font-bold text-sm text-white font-sans">
            TRAVA DE QUARENTENA E FERRAMENTAL (F 001-06 / BTI-PMP-05)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Ferramentas com data de calibração vencida (F 001-06), danificadas ou sem laudo com desvio padrão (BTI-PMP-05) são bloqueadas imediatamente pelo sistema e movidas para Quarentena (Tag Vermelha F 001-01-6 / Form F 001-06-4). O sistema <strong>IMPEDE</strong> que qualquer ferramenta em quarentena seja vinculada a uma OS.
          </p>
        </div>

        {/* Regra 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              REGRA 3
            </span>
            <span className="text-emerald-400 text-[11px] font-mono flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> SIMULADOR ATIVO
            </span>
          </div>
          <h3 className="font-bold text-sm text-white font-sans">
            DUPLA ASSINATURA EM IIO (Item de Inspeção Obrigatória)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Tarefas marcadas como Item de Inspeção Obrigatória (IIO conforme P 001-07 e RBAC 65) exigem <strong>OBRIGATORIAMENTE duas validações distintas</strong> registradas no sistema: a assinatura do Mecânico Habilitado executante e a contra-assinatura do Inspetor Credenciado (APRS).
          </p>
        </div>

        {/* Regra 4 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              REGRA 4
            </span>
            <span className="text-slate-400 text-[11px] font-mono">PARTE 5/6: RTS</span>
          </div>
          <h3 className="font-bold text-sm text-white font-sans">
            DECLARAÇÃO DUAL RELEASE EASA (Form 001-09-2)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Na aprovação para Retorno ao Serviço (RTS) de aeronaves europeias, o sistema exige obrigatoriamente o texto exato do EASA Part-145:
            <em className="block bg-slate-950 p-2 rounded border border-slate-800 text-indigo-300 font-mono mt-1 text-[10px]">
              "Certifies that the work specified, except as otherwise specified, was carried out in accordance with EASA Part145 and in respect that work the aircraft is considered ready for release to service."
            </em>
          </p>
        </div>

        {/* Regra 5 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              REGRA 5
            </span>
            <span className="text-slate-400 text-[11px] font-mono">PARTE 5/6: TURNO</span>
          </div>
          <h3 className="font-bold text-sm text-white font-sans">
            PASSAGEM DE TURNO (I 001-14 / Form F 001-24)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Caso uma OS ou Relatório de Inspeção (RI) possua tarefas pendentes ao final do expediente, o sistema exige o preenchimento da Ficha de Passagem de Serviço (Form F 001-24) antes do encerramento do turno do técnico.
          </p>
        </div>

        {/* Regra 6 */}
        <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl p-5 shadow-lg space-y-3 bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-rose-400 font-mono font-bold text-xs bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
              REGRA 6 (FOCO PARTE 1)
            </span>
            <span className="text-emerald-400 text-[11px] font-mono flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> ATIVA NO CÓDIGO
            </span>
          </div>
          <h3 className="font-bold text-sm text-white font-sans">
            BLOQUEIO POR QUALIFICAÇÃO (F 001-03 & MNT-002)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Mecânicos ou inspetores com treinamentos vencidos (MNT-002) ou sem o Formulário de Designação de Funções (F 001-03) ativo e assinado pelo RT <strong>ficam totalmente impedidos de assinar ordens de serviço no sistema</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
