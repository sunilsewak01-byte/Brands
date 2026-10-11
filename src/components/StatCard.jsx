import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'sky', // 'sky', 'indigo', 'emerald', 'purple', 'amber', 'cyan', 'rose'
  onClick,
}) {
  const schemeStyles = {
    sky: {
      border: 'hover:border-sky-300',
      iconBg: 'bg-sky-50 text-sky-600',
      valueColor: 'text-slate-900',
      subColor: 'text-sky-600',
      badge: 'bg-sky-50 text-sky-700',
    },
    indigo: {
      border: 'hover:border-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-600',
      valueColor: 'text-indigo-600',
      subColor: 'text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700',
    },
    emerald: {
      border: 'hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-emerald-600',
      subColor: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700',
    },
    purple: {
      border: 'hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-600',
      valueColor: 'text-purple-600',
      subColor: 'text-purple-600',
      badge: 'bg-purple-50 text-purple-700',
    },
    amber: {
      border: 'hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600',
      valueColor: 'text-amber-600',
      subColor: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-700',
    },
    cyan: {
      border: 'hover:border-cyan-300',
      iconBg: 'bg-cyan-50 text-cyan-600',
      valueColor: 'text-cyan-700',
      subColor: 'text-cyan-600',
      badge: 'bg-cyan-50 text-cyan-700',
    },
    rose: {
      border: 'hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-600',
      valueColor: 'text-rose-600',
      subColor: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700',
    },
  }[colorScheme] || {
    border: 'hover:border-sky-300',
    iconBg: 'bg-sky-50 text-sky-600',
    valueColor: 'text-slate-900',
    subColor: 'text-sky-600',
    badge: 'bg-sky-50 text-sky-700',
  };

  return (
    <div
      onClick={onClick}
      className={`interactive-card cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between group transition-all ${schemeStyles.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition shadow-sm ${schemeStyles.iconBg}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <span className={`text-2xl sm:text-3xl font-black tracking-tight ${schemeStyles.valueColor}`}>
          {value}
        </span>
        {subtitle && (
          <p className={`text-[11px] font-semibold flex items-center gap-1 mt-1 ${schemeStyles.subColor}`}>
            <span>{subtitle}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        )}
      </div>
    </div>
  );
}
