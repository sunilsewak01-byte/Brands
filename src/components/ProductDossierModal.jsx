import React from 'react';
import { X, FileText, Pill, Shield, Activity, Users, Award, Compass, Layers, CheckCircle } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function ProductDossierModal() {
  const { dossierProduct, setDossierProduct, standardizedFields } = usePortfolio();

  if (!dossierProduct) return null;

  const f = standardizedFields;
  const p = dossierProduct;

  const idVal = p[f.id] || p['__group_id__'] || 'PRD-0000';
  const brandVal = p[f.brand] || 'Unknown Brand';
  const compVal = p[f.composition] || '-';
  const strVal = p[f.strength] || '';
  const teamVal = p[f.team] || '-';
  const areaVal = p[f.therapeutic] || '-';
  const condVal = p[f.condition] || '-';
  const pClassVal = p[f.pharmClass] || '-';
  const typeVal = p[f.productType] || '-';
  const routeVal = p[f.route] || '-';
  const formVal = p[f.dosageForm] || '-';
  const innComp = p[f.innovatorCompany] || '-';
  const innBrand = p[f.innovatorBrand] || 'Generic / Non-referenced';
  const dosageVal = p[f.dosage] || 'No specific posology instructions recorded in dataset.';

  const isFDC = compVal.includes(';') || compVal.includes('+') || compVal.includes(',');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-sky-50/30 to-indigo-50/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                  {idVal}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isFDC ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isFDC ? 'Multi-API / FDC' : 'Single Active Molecule'}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1 tracking-tight">
                {brandVal}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setDossierProduct(null)}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Ingredients & Potency */}
          <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-sky-600" />
              Active Pharmaceutical Ingredient(s) & Strength
            </span>
            <p className="text-base font-extrabold text-slate-900">{compVal}</p>
            {strVal && (
              <p className="text-xs font-mono font-medium text-slate-600 bg-white/70 px-2.5 py-1 rounded-lg w-fit border border-sky-200/50 mt-1">
                Potency: {strVal}
              </p>
            )}
          </div>

          {/* Grid of Key Properties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                Therapeutic Area
              </span>
              <p className="font-bold text-sky-800 text-sm">{areaVal}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Commercial Franchise
              </span>
              <p className="font-bold text-slate-900 text-sm">{teamVal}</p>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1 mb-1">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Pharmacological / Functional Class
              </span>
              <p className="font-bold text-slate-900 text-sm">{pClassVal}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Clinical Condition / Domain
              </span>
              <p className="font-semibold text-slate-800">{condVal}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Product Segment / Classification
              </span>
              <p className="font-semibold text-slate-800">{typeVal}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                Delivery Route & Form
              </span>
              <p className="font-semibold text-slate-800">
                {routeVal} &bull; {formVal}
              </p>
            </div>

            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/80">
              <span className="text-[10px] uppercase font-bold text-purple-700 flex items-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                Originator / Innovator Reference
              </span>
              <p className="font-semibold text-slate-900">
                {innComp} <span className="text-slate-500">({innBrand})</span>
              </p>
            </div>
          </div>

          {/* Posology & Clinical Directions */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Dosage & Administration Instructions
            </span>
            <p className="text-xs font-medium text-slate-800 italic leading-relaxed">
              "{dosageVal}"
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end text-xs text-slate-500">
          <button
            onClick={() => setDossierProduct(null)}
            className="px-5 py-2 font-bold text-xs bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm transition active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
