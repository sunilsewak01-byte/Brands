import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  Sliders,
  Play,
  Layers,
  CheckCheck,
  Shrink,
  Columns,
  PieChart,
  TableProperties,
  Sparkles
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function ReconcileEnginePage() {
  const {
    rawDataset,
    setRawDataset,
    reconciledData,
    headersList,
    setHeadersList,
    fileName,
    setFileName,
    fileSize,
    setFileSize,
    groupKey,
    setGroupKey,
    delimiter,
    setDelimiter,
    customDelimiter,
    setCustomDelimiter,
    caseInsensitive,
    setCaseInsensitive,
    sortValues,
    setSortValues,
    executeReconcile,
    loadMasterData,
    showToast,
    setActivePage
  } = usePortfolio();

  const [isDragging, setIsDragging] = useState(false);

  // File parsing
  const handleFileUpload = (file) => {
    if (!file) return;

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsed = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!parsed || parsed.length === 0) {
          showToast('The uploaded spreadsheet contains no data rows.', 'error');
          return;
        }

        const headers = Object.keys(parsed[0]);
        setRawDataset(parsed);
        setHeadersList(headers);

        // Auto select key column
        const matchPatterns = [/product.*id/i, /prod.*id/i, /^id$/i, /code/i, /sku/i, /item.*id/i];
        let autoSelected = headers[0];
        for (const pattern of matchPatterns) {
          const found = headers.find((h) => pattern.test(h.trim()));
          if (found) {
            autoSelected = found;
            break;
          }
        }
        setGroupKey(autoSelected);

        // Run reconciliation
        executeReconcile(parsed, autoSelected);
        showToast(`Successfully loaded & reconciled ${parsed.length} rows!`, 'success');
      } catch (err) {
        console.error('File parsing error:', err);
        showToast('Failed to parse file. Please verify format (.xlsx, .csv).', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onReconcileClick = () => {
    if (rawDataset.length === 0) {
      showToast('Please upload a file or load master sample first.', 'error');
      return;
    }
    executeReconcile(rawDataset, groupKey);
    showToast('Reconciliation complete! Switching to Portfolio Dashboard.', 'success');
    setActivePage('overview');
  };

  const mergedCount = rawDataset.length - reconciledData.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step 1: File Dropzone */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-sky-600" />
                1. Upload Data File
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Supports .xlsx, .xls, .csv
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition cursor-pointer flex flex-col items-center justify-center relative ${
                isDragging
                  ? 'border-sky-500 bg-sky-50/70'
                  : 'border-slate-200 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/30'
              }`}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="w-14 h-14 mb-3 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-sky-600 transition">
                <FileSpreadsheet className="w-7 h-7 text-sky-600" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                <span className="text-sky-600 underline underline-offset-2">Click to browse</span> or drag & drop your spreadsheet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Reconcile raw multi-row records or load pre-reconciled pharmaceutical catalogs
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadMasterData();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Or Load Master Sample Dataset (18 SKUs)</span>
                </button>
              </div>
            </div>
          </div>

          {fileName && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold font-mono">
                  ACTIVE
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[240px]">
                  {fileName}
                </span>
                <span className="text-slate-400">({fileSize})</span>
              </div>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Loaded
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Reconciliation Rules & Triggers */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              2. Reconcile Rules
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Primary Key / ID Column
                </label>
                <select
                  value={groupKey}
                  disabled={headersList.length === 0}
                  onChange={(e) => setGroupKey(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white custom-ring transition disabled:opacity-50 font-medium"
                >
                  {headersList.length === 0 ? (
                    <option value="">Upload a file first</option>
                  ) : (
                    headersList.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Join Delimiter Token
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white custom-ring transition font-medium"
                  >
                    <option value="; ">Semicolon (; )</option>
                    <option value=";">Compact Semicolon (;)</option>
                    <option value=", ">Comma (, )</option>
                    <option value=" | ">Pipe ( | )</option>
                    <option value="custom">Custom...</option>
                  </select>
                  {delimiter === 'custom' && (
                    <input
                      type="text"
                      placeholder="Custom"
                      value={customDelimiter}
                      onChange={(e) => setCustomDelimiter(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white custom-ring transition"
                    />
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={caseInsensitive}
                    onChange={(e) => setCaseInsensitive(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <span>Case-insensitive deduplication</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={sortValues}
                    onChange={(e) => setSortValues(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <span>Sort combined values alphabetically</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={onReconcileClick}
            disabled={rawDataset.length === 0}
            className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Reconcile & Open Dashboard</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      {reconciledData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Input Rows</p>
              <p className="text-2xl font-black text-slate-900">{rawDataset.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Consolidated Records</p>
              <p className="text-2xl font-black text-sky-700">{reconciledData.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Shrink className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Rows Merged</p>
              <p className="text-2xl font-black text-amber-700">{mergedCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Columns Retained</p>
              <p className="text-2xl font-black text-indigo-700">{headersList.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Jump Buttons */}
      {reconciledData.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('overview')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shadow-sm active:scale-95"
          >
            <PieChart className="w-4 h-4" />
            <span>Launch Executive Dashboard</span>
          </button>
          <button
            onClick={() => setActivePage('explorer')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-sm"
          >
            <TableProperties className="w-4 h-4" />
            <span>Inspect Product Master Table</span>
          </button>
        </div>
      )}
    </div>
  );
}
