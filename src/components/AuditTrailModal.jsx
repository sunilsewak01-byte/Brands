import React from 'react';
import { X, GitMerge, CheckCircle, ArrowDown } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function AuditTrailModal() {
  const { auditGroup, setAuditGroup, headersList } = usePortfolio();

  if (!auditGroup) return null;

  const { idVal, sources, unified } = auditGroup;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Audit Trail
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Consolidated Record: <span className="text-sky-700 font-mono">{idVal}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={() => setAuditGroup(null)}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Raw Source Rows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Input Rows ({sources.length})
              </h4>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    {headersList.map((col) => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sources.map((sRow, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      {headersList.map((col) => (
                        <td key={col} className="py-2 px-3 whitespace-nowrap text-slate-700 font-normal">
                          {sRow[col] !== undefined && sRow[col] !== '' ? (
                            String(sRow[col])
                          ) : (
                            <span className="text-slate-300 italic">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          {/* Section 2: Reconciled Row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Reconciled Record
              </h4>
            </div>
            <div className="overflow-x-auto border-2 border-emerald-200 bg-emerald-50/20 rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-emerald-100/70 text-emerald-900 font-semibold border-b border-emerald-200">
                  <tr>
                    {headersList.map((col) => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    {headersList.map((col) => (
                      <td
                        key={col}
                        className="py-3 px-3 whitespace-nowrap font-medium text-emerald-900"
                      >
                        {unified[col] !== undefined && unified[col] !== '' ? (
                          String(unified[col])
                        ) : (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setAuditGroup(null)}
            className="px-5 py-2 font-bold text-xs bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
