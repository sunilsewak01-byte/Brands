import React, { useMemo } from 'react';
import {
  Package,
  GitMerge,
  Pill,
  Award,
  Dna,
  ShieldCheck,
  TrendingUp,
  Activity,
  Users,
  PieChart as PieIcon,
  Compass,
  ArrowRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { usePortfolio } from '../context/PortfolioContext';
import StatCard from '../components/StatCard';
import FilterRibbon from '../components/FilterRibbon';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ExecutiveDashboardPage() {
  const {
    filteredReconciledData,
    standardizedFields,
    openDrilldown,
    setActivePage
  } = usePortfolio();

  const f = standardizedFields;

  // Compute executive metrics
  const metrics = useMemo(() => {
    let fdcCount = 0;
    let singleCount = 0;
    let innovatorCount = 0;
    let oralCount = 0;
    const pharmClasses = new Set();

    filteredReconciledData.forEach((r) => {
      const comp = String(r[f.composition] || '');
      const route = String(r[f.route] || '').toLowerCase();
      const inn = String(r[f.innovatorCompany] || '').toLowerCase();
      const pClass = String(r[f.pharmClass] || '').trim();

      if (comp.includes(';') || comp.includes('+') || comp.includes(',')) {
        fdcCount++;
      } else {
        singleCount++;
      }

      if (inn && inn !== 'not available' && inn !== '-' && inn !== 'generic' && inn !== 'null') {
        innovatorCount++;
      }

      if (route.includes('oral')) {
        oralCount++;
      }

      if (pClass && pClass !== 'Not available' && pClass !== '-' && pClass !== 'null') {
        pharmClasses.add(pClass);
      }
    });

    return {
      total: filteredReconciledData.length,
      fdc: fdcCount,
      single: singleCount,
      innovator: innovatorCount,
      oral: oralCount,
      classes: pharmClasses.size,
    };
  }, [filteredReconciledData, f]);

  // Aggregate helpers
  const getCounts = (key) => {
    const counts = {};
    filteredReconciledData.forEach((r) => {
      let val = String(r[key] || '').trim();
      if (!val || val === 'null' || val === 'undefined') val = 'Unassigned';
      counts[val] = (counts[val] || 0) + 1;
    });
    return counts;
  };

  // 1. Therapeutic Area Chart Data
  const therapeuticChartData = useMemo(() => {
    const counts = getCounts(f.therapeutic);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      labels: sorted.map((s) => s[0]),
      datasets: [
        {
          label: 'Products',
          data: sorted.map((s) => s[1]),
          backgroundColor: 'rgba(2, 132, 199, 0.85)',
          hoverBackgroundColor: 'rgba(3, 105, 161, 1)',
          borderRadius: 6,
        },
      ],
    };
  }, [filteredReconciledData, f.therapeutic]);

  // 2. Commercial Teams Chart Data
  const teamChartData = useMemo(() => {
    const counts = getCounts(f.team);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      labels: sorted.map((s) => s[0]),
      datasets: [
        {
          label: 'SKUs',
          data: sorted.map((s) => s[1]),
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
          borderRadius: 6,
        },
      ],
    };
  }, [filteredReconciledData, f.team]);

  // 3. Product Types Doughnut Data
  const productTypeChartData = useMemo(() => {
    const counts = getCounts(f.productType);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'];
    return {
      labels: sorted.map((s) => s[0]),
      datasets: [
        {
          data: sorted.map((s) => s[1]),
          backgroundColor: colors.slice(0, sorted.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [filteredReconciledData, f.productType]);

  // 4. Route Modality Pie Data
  const routeChartData = useMemo(() => {
    const counts = getCounts(f.route);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const colors = ['#0ea5e9', '#3b82f6', '#6366f1', '#14b8a6', '#f97316', '#a855f7'];
    return {
      labels: sorted.map((s) => s[0]),
      datasets: [
        {
          data: sorted.map((s) => s[1]),
          backgroundColor: colors.slice(0, sorted.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [filteredReconciledData, f.route]);

  // 5. Originator Innovator Footprint
  const innovatorChartData = useMemo(() => {
    const counts = {};
    filteredReconciledData.forEach((r) => {
      const val = String(r[f.innovatorCompany] || '').trim();
      if (val && val !== 'Not available' && val !== '-' && val !== 'Unassigned' && val !== 'null') {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      labels: sorted.map((s) => s[0]),
      datasets: [
        {
          label: 'Referenced Innovators',
          data: sorted.map((s) => s[1]),
          backgroundColor: 'rgba(147, 51, 234, 0.85)',
          hoverBackgroundColor: 'rgba(126, 34, 206, 1)',
          borderRadius: 6,
        },
      ],
    };
  }, [filteredReconciledData, f.innovatorCompany]);

  return (
    <div className="space-y-6">
      {/* Universal Cross-Filter Ribbon */}
      <FilterRibbon />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Products"
          value={metrics.total}
          subtitle="Click to view all"
          icon={Package}
          colorScheme="sky"
          onClick={() =>
            openDrilldown('Entire Portfolio', 'All Unified SKUs', () => true)
          }
        />
        <StatCard
          title="FDCs / Multi-APIs"
          value={metrics.fdc}
          subtitle="Fixed combinations"
          icon={GitMerge}
          colorScheme="indigo"
          onClick={() =>
            openDrilldown('Combination Class', 'Multi-API / FDCs', (r) => {
              const comp = String(r[f.composition] || '');
              return comp.includes(';') || comp.includes('+') || comp.includes(',');
            })
          }
        />
        <StatCard
          title="Single Active"
          value={metrics.single}
          subtitle="Single molecule"
          icon={Pill}
          colorScheme="emerald"
          onClick={() =>
            openDrilldown('Single Molecule', 'Single Active Ingredient', (r) => {
              const comp = String(r[f.composition] || '');
              return !(comp.includes(';') || comp.includes('+') || comp.includes(','));
            })
          }
        />
        <StatCard
          title="Innovator Origin"
          value={metrics.innovator}
          subtitle="Originator brands"
          icon={Award}
          colorScheme="purple"
          onClick={() =>
            openDrilldown('Originator Assigned', 'Known Innovator Brands', (r) => {
              const inn = String(r[f.innovatorCompany] || '').toLowerCase();
              return inn && inn !== 'not available' && inn !== '-' && inn !== 'generic';
            })
          }
        />
        <StatCard
          title="Pharm Classes"
          value={metrics.classes}
          subtitle="Functional classes"
          icon={Dna}
          colorScheme="amber"
          onClick={() =>
            openDrilldown('Classification', 'Pharmacological & Functional Classes', (r) => {
              const pClass = String(r[f.pharmClass] || '').trim();
              return pClass && pClass !== 'Not available' && pClass !== '-' && pClass !== 'null';
            })
          }
        />
        <StatCard
          title="Oral Delivery"
          value={metrics.oral}
          subtitle="Tablets / Capsules"
          icon={ShieldCheck}
          colorScheme="cyan"
          onClick={() =>
            openDrilldown('Delivery Route', 'Oral Delivery Modality', (r) => {
              const route = String(r[f.route] || '').toLowerCase();
              return route.includes('oral');
            })
          }
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Therapeutic Area Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                Therapeutic Area Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Click any bar to inspect matching products</p>
            </div>
            <button
              onClick={() => setActivePage('therapeutic')}
              className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 flex items-center gap-1 transition"
            >
              <span>Deep Dive</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="h-64 relative">
            <Bar
              data={therapeuticChartData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: '#f8fafc' }, ticks: { stepSize: 1, font: { size: 10 } } },
                  y: { grid: { display: false }, ticks: { font: { size: 10 } } },
                },
                onClick: (evt, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    const area = therapeuticChartData.labels[idx];
                    openDrilldown('Therapeutic Area', area, (r) => String(r[f.therapeutic] || '').trim() === area);
                  }
                },
              }}
            />
          </div>
        </div>

        {/* Chart 2: Commercial Teams Allocation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Commercial Franchise Allocation
              </h3>
              <p className="text-[11px] text-slate-400">Click any team bar to view franchise SKUs</p>
            </div>
            <button
              onClick={() => setActivePage('commercial')}
              className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 flex items-center gap-1 transition"
            >
              <span>Team Analysis</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="h-64 relative">
            <Bar
              data={teamChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: '#f8fafc' }, ticks: { stepSize: 1, font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                },
                onClick: (evt, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    const team = teamChartData.labels[idx];
                    openDrilldown('Commercial Team', team, (r) => String(r[f.team] || '').trim() === team);
                  }
                },
              }}
            />
          </div>
        </div>

        {/* Chart 3: Product Classification Mix */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                Product Classification Mix
              </h3>
              <p className="text-[11px] text-slate-400">Click any doughnut slice to isolate products</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase">
              Segments
            </span>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <Doughnut
              data={productTypeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                },
                onClick: (evt, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    const type = productTypeChartData.labels[idx];
                    openDrilldown('Product Type', type, (r) => String(r[f.productType] || '').trim() === type);
                  }
                },
              }}
            />
          </div>
        </div>

        {/* Chart 4: Route of Administration Modality */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                Delivery Route Modality
              </h3>
              <p className="text-[11px] text-slate-400">Click any pie slice to filter route</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold uppercase">
              Delivery
            </span>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <Pie
              data={routeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                },
                onClick: (evt, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    const route = routeChartData.labels[idx];
                    openDrilldown('Delivery Route', route, (r) => String(r[f.route] || '').trim() === route);
                  }
                },
              }}
            />
          </div>
        </div>

        {/* Chart 5: Originator Footprint (Full Width) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Top Originator & Innovator Footprint
              </h3>
              <p className="text-[11px] text-slate-400">
                Pharmaceutical corporations with referenced originator brands
              </p>
            </div>
            <button
              onClick={() => setActivePage('innovators')}
              className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 flex items-center gap-1 transition"
            >
              <span>Innovator Landscape</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="h-64 relative">
            <Bar
              data={innovatorChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: '#f8fafc' }, ticks: { stepSize: 1, font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                },
                onClick: (evt, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    const comp = innovatorChartData.labels[idx];
                    openDrilldown('Innovator Company', comp, (r) => String(r[f.innovatorCompany] || '').trim() === comp);
                  }
                },
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
