import React from 'react';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Toast() {
  const { toast } = usePortfolio();

  if (!toast.show) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
      {icons[toast.type] || icons.info}
      <span className="font-medium">{toast.message}</span>
    </div>
  );
}
