import React, { useMemo, useState } from 'react';
import { Users, Briefcase, Activity, Package, ArrowRight, FileText, PieChart } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import FilterRibbon from '../components/FilterRibbon';
import StatCard from '../components/StatCard';

export default function CommercialTeamsPage() {
  const {
    filteredReconciledData,
    standardizedFields,
    openDrilldown,
    setDossierProduct
  } = usePortfolio();

  const f = standardizedFields;
  const [selectedTeam, setSelectedTeam] = useState('ALL');

  // Group products by commercial team
  const teamGroups = useMemo(() => {
    const map = {};
    filteredReconciledData.forEach((row) => {
      const team = String(row[f.team] || 'Unassigned').trim();
      if (!map[team]) {
        map[team] = {
          team,
          products: [],
          therapies: new Set(),
          routes: new Set(),
          innovatorCount: 0,
        };
      }
      map[team].products.push(row);
      const area = String(row[f.therapeutic] || '').trim();
      if (area && area !== '-') map[team].therapies.add(area);
      const route = String(row[f.route] || '').trim();
      if (route && route !== '-') map[team].routes.add(route);

      const inn = String(row[f.innovatorCompany] || '').toLowerCase();
      if (inn && inn !== 'not available' && inn !== '-' && inn !== 'generic') {
        map[team].innovatorCount++;
      }
    });

    return Object.values(map).sort((a, b) => b.products.length - a.products.length);
  }, [filteredReconciledData, f]);

  const displayedTeams = useMemo(() => {
    if (selectedTeam === 'ALL') return teamGroups;
    return teamGroups.filter((t) => t.team === selectedTeam);
  }, [teamGroups, selectedTeam]);

  return (
    <div className="space-y-6">
      <FilterRibbon />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Commercial Franchises"
          value={teamGroups.length}
          icon={Users}
          colorScheme="indigo"
          onClick={() => openDrilldown('Franchises', 'Commercial Divisions', () => true)}
        />
        <StatCard
          title="Leading Franchise"
          value={teamGroups[0] ? `${teamGroups[0].team} (${teamGroups[0].products.length} SKUs)` : 'N/A'}
          icon={Briefcase}
          colorScheme="sky"
          onClick={() => {
            if (teamGroups[0]) {
              openDrilldown('Franchise', teamGroups[0].team, (r) => String(r[f.team] || '').trim() === teamGroups[0].team);
            }
          }}
        />
        <StatCard
          title="Catalog SKUs"
          value={filteredReconciledData.length}
          icon={Package}
          colorScheme="emerald"
          onClick={() => openDrilldown('Entire Portfolio', 'All Products', () => true)}
        />
        <StatCard
          title="Therapeutic Reach"
          value={new Set(filteredReconciledData.map((r) => r[f.therapeutic])).size}
          icon={Activity}
          colorScheme="purple"
          onClick={() => openDrilldown('Therapy Reach', 'All Therapies', () => true)}
        />
      </div>

      {/* Franchise Selector Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
          Filter by Team:
        </span>
        <button
          onClick={() => setSelectedTeam('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            selectedTeam === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Divisions ({teamGroups.length})
        </button>
        {teamGroups.map((tg) => (
          <button
            key={tg.team}
            onClick={() => setSelectedTeam(tg.team)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedTeam === tg.team
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{tg.team}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedTeam === tg.team ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tg.products.length}
            </span>
          </button>
        ))}
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedTeams.map((tg) => {
          const share = ((tg.products.length / (filteredReconciledData.length || 1)) * 100).toFixed(1);
          return (
            <div
              key={tg.team}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-indigo-300 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{tg.team}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-indigo-700">{tg.products.length}</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">SKUs ({share}%)</span>
                  </div>
                </div>

                {/* Therapy Footprint */}
                <div className="mt-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Therapeutic Coverage
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(tg.therapies).map((th) => (
                      <span
                        key={th}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60"
                      >
                        {th}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Delivery Modalities */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Delivery Routes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(tg.routes).map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Product Roster */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Assigned Brands
                  </span>
                  <div className="divide-y divide-slate-100">
                    {tg.products.map((p) => (
                      <div
                        key={p[f.id] || p['__group_id__']}
                        className="py-1.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 mr-2">{p[f.brand]}</span>
                          <span className="text-slate-500 text-[11px] truncate max-w-[120px] inline-block align-bottom">
                            {p[f.composition]}
                          </span>
                        </div>
                        <button
                          onClick={() => setDossierProduct(p)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Dossier
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  openDrilldown('Franchise Portfolio', tg.team, (r) => String(r[f.team] || '').trim() === tg.team)
                }
                className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold transition text-center flex items-center justify-center gap-1.5"
              >
                <span>View Catalog ({tg.products.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
