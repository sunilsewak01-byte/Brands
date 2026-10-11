import React, { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  FlaskConical,
  Users,
  Award,
  TableProperties,
  GitMerge,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Sidebar() {
  const {
    activePage,
    setActivePage,
    reconciledData,
    rawDataset,
    loadMasterData,
    resetAll
  } = usePortfolio();

  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      id: 'overview',
      label: 'Executive Overview',
      subtitle: 'KPIs & Global Mix',
      icon: LayoutDashboard,
      badge: null,
      section: 'ANALYTICAL SUITES'
    },
    {
      id: 'therapeutic',
      label: 'Therapeutic & Clinical',
      subtitle: 'Therapy & Indications',
      icon: Activity,
      badge: null,
      section: 'ANALYTICAL SUITES'
    },
    {
      id: 'molecules',
      label: 'Molecules & Forms',
      subtitle: 'APIs, FDCs & Classes',
      icon: FlaskConical,
      badge: null,
      section: 'ANALYTICAL SUITES'
    },
    {
      id: 'commercial',
      label: 'Commercial Teams',
      subtitle: 'Franchise Portfolios',
      icon: Users,
      badge: null,
      section: 'ANALYTICAL SUITES'
    },
    {
      id: 'innovators',
      label: 'Originator & Innovators',
      subtitle: 'Brand Benchmarking',
      icon: Award,
      badge: null,
      section: 'ANALYTICAL SUITES'
    },
    {
      id: 'explorer',
      label: 'Product Master Explorer',
      subtitle: 'Unified Dossiers & Table',
      icon: TableProperties,
      badge: reconciledData.length > 0 ? reconciledData.length : null,
      section: 'ANALYTICAL SUITES'
    },
    {
      id: 'reconcile',
      label: 'Reconcile Engine',
      subtitle: 'Excel Ingest & Deduplication',
      icon: GitMerge,
      badge: rawDataset.length > 0 ? `${rawDataset.length} rows` : 'Ready',
      section: 'DATA OPS & RECONCILIATION'
    }
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 z-30 select-none shadow-xl ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-sky-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">ReconcileX</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Pro
                </span>
              </div>
              <span className="text-[11px] text-slate-400 truncate">Pharma Portfolio Studio</span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2 border-b border-slate-800">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {['ANALYTICAL SUITES', 'DATA OPS & RECONCILIATION'].map((sectionTitle) => {
          const sectionItems = navItems.filter((item) => item.section === sectionTitle);
          return (
            <div key={sectionTitle} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                  {sectionTitle}
                </div>
              )}
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    title={collapsed ? `${item.label} - ${item.subtitle}` : undefined}
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-medium shadow-md shadow-sky-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 font-normal'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                      }`}
                    />
                    {!collapsed && (
                      <div className="flex-1 truncate">
                        <div className="text-xs font-semibold leading-tight text-white">{item.label}</div>
                        <div className={`text-[10px] leading-tight truncate ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Dataset Health Summary Pill */}
      {!collapsed && (
        <div className="px-3 py-2 mx-3 mb-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-slate-300">Live Workspace</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-sky-400">
            {reconciledData.length} SKUs
          </span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2">
        <button
          onClick={loadMasterData}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white transition border border-slate-700/60 shadow-sm ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Reload Master Pharma Dataset"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          {!collapsed && <span>Load Master Sample</span>}
        </button>

        <button
          onClick={resetAll}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/30 ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Reset Workspace"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Reset Workspace</span>}
        </button>
      </div>
    </aside>
  );
}
