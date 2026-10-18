import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Printer,
  Download,
  Building,
  Calendar,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { RelatorioTrimestralF001_07, BaseOperacional } from '../types/mro';
import { api } from '../services/apiClient';
import { OfficialFormHeader } from './OfficialFormHeader';
import { NaRuleNotice, EasaReleaseDeclaration } from './OfficialFormNotices';

interface ReportF00107ViewProps {
  bases: BaseOperacional[];
}

export const ReportF00107View: React.FC<ReportF00107ViewProps> = ({ bases }) => {
  const [relatorio, setRelatorio] = useState<RelatorioTrimestralF001_07 | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTrimestre, setSelectedTrimestre] = useState('3º Trimestre / 2026');
  const [selectedBase, setSelectedBase] = useState<string>('TODAS');

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      const baseId = selectedBase !== 'TODAS' ? Number(selectedBase) : undefined;
      const data = await api.getRelatorioF00107(selectedTrimestre, baseId);
      setRelatorio(data);
    } catch (err) {
      console.error('Erro ao gerar F 001-07:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, [selectedTrimestre, selectedBase]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!relatorio) return;
    const blob = new Blob([JSON.stringify(relatorio, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ANAC_F001-07_${selectedTrimestre.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Controls (hidden on print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded">
              FORMULÁRIO F 001-07 • ANAC / EASA
            </span>
            <span className="text-slate-400 text-xs font-mono">
              RBAC 145.163 / MOMQ MNT-001 (Rev 08)
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Relatório Trimestral de Pessoal Técnico e Inspetores Qualificados
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Documento regulatório oficial para fiscalização e auditoria da ANAC e EASA. Registra o status de habilitações, designações F 001-03, treinamentos mandatórios e condição operacional (Regra N/A aplicada).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={carregarRelatorio}
            disabled={loading}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5"
            title="Atualizar dados do relatório"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar JSON ANAC</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/25 transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Selection (hidden on print) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4 text-xs print:hidden">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-medium">Período / Trimestre:</span>
          <select
            value={selectedTrimestre}
            onChange={(e) => setSelectedTrimestre(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="1º Trimestre / 2026">1º Trimestre / 2026 (Jan - Mar)</option>
            <option value="2º Trimestre / 2026">2º Trimestre / 2026 (Abr - Jun)</option>
            <option value="3º Trimestre / 2026">3º Trimestre / 2026 (Jul - Set)</option>
            <option value="4º Trimestre / 2026">4º Trimestre / 2026 (Out - Dez)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-medium">Base Operacional:</span>
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="TODAS">Todas as Bases Homologadas</option>
            {bases.map((b) => (
              <option key={b.id_base} value={String(b.id_base)}>
                {b.nome_base} ({b.codigo_anac})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Printable Report Document */}
      {relatorio && (
        <div className="bg-white text-black p-4 sm:p-6 shadow-2xl space-y-4 border border-slate-300 rounded-xl print:rounded-none print:border-none print:p-0 print:shadow-none print-landscape">
          {/* Official Document Header */}
          <OfficialFormHeader
            codigoFormulario="FORM F 001-07"
            numeroRevisao="R08"
            dataRevisao="15/01/2026"
            tituloDocumento="RELAÇÃO DE PESSOAL DE MANUTENÇÃO E INSPEÇÃO QUALIFICADO (FORM F 001-07)"
            subtituloDocumento="ROSTER OF MAINTENANCE AND INSPECTION PERSONNEL (RBAC 145.161 / MOMQ I 001-07 / EASA PART-145)"
            instrucaoMOMQ="INSTRUÇÃO DE TRABALHO I 001-07 • AUDITORIA REGULAMENTAR ANAC / EASA"
            numeroDocumento={`REF: ${selectedTrimestre.toUpperCase()}`}
            baseOperacional={selectedBase !== 'TODAS' ? bases.find(b => String(b.id_base) === selectedBase)?.codigo_anac || 'GRU' : 'GRU'}
            paginaInfo="PÁG. 1 DE 1"
          />

          {/* Mandatory N/A Regulatory Notice */}
          <NaRuleNotice />

          {/* SEÇÃO I: DADOS DE CONTROLE TRIMESTRAL E BASE OPERACIONAL */}
          <div className="border border-black p-2 bg-slate-50 font-mono text-[9px] grid grid-cols-4 gap-2">
            <div>
              <span className="font-bold block text-slate-700 uppercase">Campo 01 • Trimestre:</span>
              <span className="font-black text-black">{relatorio.cabecalho.trimestre}</span>
            </div>
            <div>
              <span className="font-bold block text-slate-700 uppercase">Campo 02 • Base Homologada:</span>
              <span className="font-black text-black">
                {selectedBase === 'TODAS' ? 'TODAS AS BASES (GRU, CNF, VCP)' : bases.find(b => String(b.id_base) === selectedBase)?.nome_base || 'GRU'}
              </span>
            </div>
            <div>
              <span className="font-bold block text-slate-700 uppercase">Campo 03 • Data Emissão:</span>
              <span className="font-black text-black">{relatorio.cabecalho.data_geracao}</span>
            </div>
            <div>
              <span className="font-bold block text-slate-700 uppercase">Campo 04 • Homologações:</span>
              <span className="font-black text-blue-900">ANAC 200607-05 / EASA.145.1003</span>
            </div>
          </div>

          {/* Regulatory Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-[9px]">
            <div className="p-1.5 bg-slate-100 rounded border border-black">
              <span className="text-[8px] text-slate-700 block uppercase">TOTAL TÉCNICOS</span>
              <span className="text-xs font-black text-black">
                {relatorio.estatisticas.total_tecnicos}
              </span>
            </div>
            <div className="p-1.5 bg-emerald-50 rounded border border-black">
              <span className="text-[8px] text-emerald-900 block uppercase">APTOS OPERACIONAIS</span>
              <span className="text-xs font-black text-emerald-950">
                {relatorio.estatisticas.total_aptos}
              </span>
            </div>
            <div className="p-1.5 bg-rose-50 rounded border border-black">
              <span className="text-[8px] text-rose-900 block uppercase">BLOQUEADOS (REGRA 6)</span>
              <span className="text-xs font-black text-rose-950">
                {relatorio.estatisticas.total_bloqueados}
              </span>
            </div>
            <div className="p-1.5 bg-blue-50 rounded border border-black">
              <span className="text-[8px] text-blue-900 block uppercase">HABILITADOS APRS</span>
              <span className="text-xs font-black text-blue-950">
                {relatorio.estatisticas.total_aprs_habilitados}
              </span>
            </div>
            <div className="p-1.5 bg-cyan-50 rounded border border-black">
              <span className="text-[8px] text-cyan-900 block uppercase">CONFORMIDADE</span>
              <span className="text-xs font-black text-cyan-950">
                {relatorio.estatisticas.taxa_conformidade_percentual}%
              </span>
            </div>
          </div>

          {/* Regulatory Data Table */}
          <div className="overflow-x-auto border border-black">
            <table className="w-full text-left text-[9px] border-collapse">
              <thead>
                <tr className="bg-slate-200 text-black font-mono uppercase text-[8px] border-b border-black">
                  <th className="p-1.5 border-r border-black text-center w-8">Item</th>
                  <th className="p-1.5 border-r border-black min-w-[130px]">Campo 05 • Nome Completo</th>
                  <th className="p-1.5 border-r border-black">Campo 06 • CANAC</th>
                  <th className="p-1.5 border-r border-black">Campo 07 • CPF</th>
                  <th className="p-1.5 border-r border-black">Campo 08 • Cargo</th>
                  <th className="p-1.5 border-r border-black text-center">Campo 09 • Licença</th>
                  <th className="p-1.5 border-r border-black">Campo 10 • Base</th>
                  <th className="p-1.5 border-r border-black">Campo 11 • F 001-03</th>
                  <th className="p-1.5 border-r border-black text-center">Campo 12 • RT?</th>
                  <th className="p-1.5 border-r border-black text-center">Campo 13 • Treinamentos</th>
                  <th className="p-1.5 border-r border-black text-center">Campo 14 • PPSP</th>
                  <th className="p-1.5 border-r border-black text-center">Campo 15 • Condição</th>
                  <th className="p-1.5 min-w-[150px]">Campo 16 • Parecer Regulamentar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-sans">
                {relatorio.itens.map((item) => (
                  <tr
                    key={item.id_tecnico}
                    className={item.condicao_operacional === 'BLOQUEADO' ? 'bg-rose-50' : 'hover:bg-slate-50'}
                  >
                    <td className="p-1.5 border-r border-black text-center font-mono font-bold text-black">
                      {String(item.item).padStart(2, '0')}
                    </td>
                    <td className="p-1.5 border-r border-black font-bold text-black">
                      {item.nome_completo}
                    </td>
                    <td className="p-1.5 border-r border-black font-mono font-black text-blue-950">
                      {item.canac}
                    </td>
                    <td className="p-1.5 border-r border-black font-mono text-black">
                      {item.cpf}
                    </td>
                    <td className="p-1.5 border-r border-black font-medium text-black">
                      {item.cargo}
                    </td>
                    <td className="p-1.5 border-r border-black text-center font-mono font-bold text-black">
                      {item.licenca_cct}
                    </td>
                    <td className="p-1.5 border-r border-black text-black truncate max-w-[90px]">
                      {item.base_alocada.split('-')[0].trim()}
                    </td>
                    <td className="p-1.5 border-r border-black font-mono text-[8.5px]">
                      <div className="font-bold text-black">{item.f001_03_numero}</div>
                      <div className="text-slate-600 text-[8px]">{item.f001_03_validade}</div>
                    </td>
                    <td className="p-1.5 border-r border-black text-center font-mono">
                      {item.f001_03_rt_assinado === 'SIM' ? (
                        <span className="text-emerald-900 font-black">SIM</span>
                      ) : (
                        <span className="text-rose-900 font-black">NÃO</span>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-black text-center font-mono text-[8.5px]">
                      {item.cursos_mandatorios_status === 'CONFORME' ? (
                        <span className="text-emerald-900 font-bold">EM DIA</span>
                      ) : (
                        <span className="text-rose-900 font-black">IRREGULAR</span>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-black text-center font-mono text-[8.5px]">
                      {item.exame_toxicologico}
                    </td>
                    <td className="p-1.5 border-r border-black text-center font-mono font-bold">
                      {item.condicao_operacional === 'APTO' ? (
                        <span className="text-emerald-900 font-black">
                          APTO
                        </span>
                      ) : (
                        <span className="text-rose-900 font-black">
                          BLOQUEADO
                        </span>
                      )}
                    </td>
                    <td className="p-1.5 text-[8.5px] text-slate-800 leading-tight">
                      {item.motivo_bloqueio_resumo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EASA Part-145 Release Declaration */}
          <EasaReleaseDeclaration dataAprovacao={relatorio.cabecalho.data_geracao} />

          {/* Signatures Regulatory Box */}
          <div className="border-2 border-black p-3 bg-slate-50 page-break-avoid">
            <div className="text-[9px] font-mono text-black font-extrabold uppercase text-center mb-4">
              TERMO DE RESPONSABILIDADE E CONFORMIDADE REGULAMENTAR (RBAC 145.161 / MOMQ MNT-001)
            </div>
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-1">
                <div className="border-b border-black pb-1 mb-1 font-mono text-black font-bold text-[9.5px]">
                  {relatorio.cabecalho.responsavel_tecnico}
                </div>
                <div className="font-extrabold text-black text-[9px]">RESPONSÁVEL TÉCNICO (RT)</div>
                <div className="text-[8px] text-slate-600 font-mono">
                  ANAC RBAC 145 / CREA • Impacto Aviation
                </div>
              </div>

              <div className="space-y-1">
                <div className="border-b border-black pb-1 mb-1 font-mono text-black font-bold text-[9.5px]">
                  {relatorio.cabecalho.gerente_qualidade}
                </div>
                <div className="font-extrabold text-black text-[9px]">GERENTE DA GARANTIA DA QUALIDADE (GQ)</div>
                <div className="text-[8px] text-slate-600 font-mono">
                  MOMQ MNT-001 • Auditoria Interna
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
