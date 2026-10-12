import React, { useMemo, useState } from 'react';
import { Activity, Stethoscope, HeartPulse, Layers, Pill, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import FilterRibbon from '../components/FilterRibbon';
import StatCard from '../components/StatCard';

export default function TherapeuticAnalyticsPage() {
  const {
    filteredReconciledData,
    standardizedFields,
    openDrilldown,
    setDossierProduct
  } = usePortfolio();

  const f = standardizedFields;
  const [selectedTherapy, setSelectedTherapy] = useState('ALL');

  // Group products by therapeutic area
  const therapyGroups = useMemo(() => {
    const map = {};
    filteredReconciledData.forEach((row) => {
      const area = String(row[f.therapeutic] || 'Unassigned').trim();
      if (!map[area]) {
        map[area] = {
          area,
          products: [],
          conditions: new Set(),
          teams: new Set(),
          singleCount: 0,
          fdcCount: 0,
        };
      }
      map[area].products.push(row);
      const cond = String(row[f.condition] || '').trim();
      if (cond && cond !== '-') map[area].conditions.add(cond);
      const team = String(row[f.team] || '').trim();
      if (team && team !== '-') map[area].teams.add(team);

      const comp = String(row[f.composition] || '');
      if (comp.includes(';') || comp.includes('+') || comp.includes(',')) {
        map[area].fdcCount++;
      } else {
        map[area].singleCount++;
      }
    });

    return Object.values(map).sort((a, b) => b.products.length - a.products.length);
  }, [filteredReconciledData, f]);

  const totalTherapies = therapyGroups.length;
  const topTherapy = therapyGroups[0] ? `${therapyGroups[0].area} (${therapyGroups[0].products.length})` : 'N/A';
  const totalConditions = useMemo(() => {
    const s = new Set();
    filteredReconciledData.forEach((r) => {
      const c = String(r[f.condition] || '').trim();
      if (c && c !== '-') s.add(c);
    });
    return s.size;
  }, [filteredReconciledData, f]);

  const displayedTherapies = useMemo(() => {
    if (selectedTherapy === 'ALL') return therapyGroups;
    return therapyGroups.filter((t) => t.area === selectedTherapy);
  }, [therapyGroups, selectedTherapy]);

  return (
    <div className="space-y-6">
      <FilterRibbon />

      {/* Therapy KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Therapeutic Areas"
          value={totalTherapies}
          icon={Activity}
          colorScheme="sky"
          onClick={() => openDrilldown('Therapeutic Areas', 'All Therapy Areas', () => true)}
        />
        <StatCard
          title="Clinical Conditions"
          value={totalConditions}
          icon={Stethoscope}
          colorScheme="indigo"
          onClick={() => openDrilldown('Clinical Conditions', 'All Indication Domains', () => true)}
        />
        <StatCard
          title="Leading Therapy Area"
          value={topTherapy}
          icon={HeartPulse}
          colorScheme="purple"
          onClick={() => {
            if (therapyGroups[0]) {
              openDrilldown('Top Therapy', therapyGroups[0].area, (r) => String(r[f.therapeutic] || '') === therapyGroups[0].area);
            }
          }}
        />
        <StatCard
          title="Portfolio SKUs"
          value={filteredReconciledData.length}
          icon={Layers}
          colorScheme="emerald"
          onClick={() => openDrilldown('Entire Portfolio', 'All Products', () => true)}
        />
      </div>

      {/* Therapy Filter Selector Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
          Focus Therapy:
        </span>
        <button
          onClick={() => setSelectedTherapy('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            selectedTherapy === 'ALL'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({therapyGroups.length})
        </button>
        {therapyGroups.map((tg) => (
          <button
            key={tg.area}
            onClick={() => setSelectedTherapy(tg.area)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedTherapy === tg.area
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{tg.area}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedTherapy === tg.area ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tg.products.length}
            </span>
          </button>
        ))}
      </div>

      {/* Therapy Area Deep-Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayedTherapies.map((tg) => {
          const share = ((tg.products.length / (filteredReconciledData.length || 1)) * 100).toFixed(1);
          return (
            <div
              key={tg.area}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{tg.area}</h4>
                      <p className="text-[11px] text-slate-400">
                        {tg.teams.size} Commercial Team{tg.teams.size > 1 ? 's' : ''}: {Array.from(tg.teams).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-sky-700">{tg.products.length}</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">SKUs ({share}%)</span>
                  </div>
                </div>

                {/* Formulation breakdown bar */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Monotherapy: {tg.singleCount}</span>
                    <span>FDC Combinations: {tg.fdcCount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(tg.singleCount / tg.products.length) * 100}%` }}
                      title="Single Ingredient"
                    />
                    <div
                      className="bg-indigo-500 h-full"
                      style={{ width: `${(tg.fdcCount / tg.products.length) * 100}%` }}
                      title="Fixed-Dose Combination"
                    />
                  </div>
                </div>

                {/* Key Indications / Domains */}
                <div className="mt-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Key Clinical Conditions / Indications
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(tg.conditions).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Representative Products */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Product Roster
                  </span>
                  <div className="divide-y divide-slate-100">
                    {tg.products.map((p) => (
                      <div
                        key={p[f.id] || p['__group_id__']}
                        className="py-1.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 mr-2">{p[f.brand]}</span>
                          <span className="text-slate-500 text-[11px]">{p[f.composition]}</span>
                        </div>
                        <button
                          onClick={() => setDossierProduct(p)}
                          className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-0.5"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Dossier</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  openDrilldown('Therapeutic Area', tg.area, (r) => String(r[f.therapeutic] || '').trim() === tg.area)
                }
                className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-sky-700 font-semibold text-xs transition border border-slate-200/80 hover:border-sky-200 flex items-center justify-center gap-1.5"
              >
                <span>Inspect Products ({tg.products.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
