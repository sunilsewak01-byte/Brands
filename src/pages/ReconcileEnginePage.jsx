import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import Papa from 'papaparse';
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
  Database,
  CloudUpload,
  Copy,
  Check,
  X,
  Loader2,
  RefreshCw
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
    showToast,
    setActivePage,
    // Supabase
    isSavingSupabase,
    lastSavedToSupabase,
    savedDatasets,
    sqlModalOpen,
    setSqlModalOpen,
    saveCurrentToSupabase,
    loadSavedDataset,
    refreshSavedDatasetsList,
    SUPABASE_SETUP_SQL
  } = usePortfolio();

  const [isDragging, setIsDragging] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);

  // File parsing
  const handleFileUpload = async (file) => {
    if (!file) return;

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const processParsedData = (parsed) => {
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
    };

    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      if (isCsv) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              processParsedData(results.data);
            } else {
              showToast('The uploaded CSV contains no data rows.', 'error');
            }
          },
          error: (err) => {
            console.error('CSV parse error:', err);
            showToast('Failed to parse CSV file.', 'error');
          }
        });
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          showToast('The uploaded workbook contains no worksheets.', 'error');
          return;
        }

        const headers = [];
        const parsed = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) {
            row.eachCell((cell, colNumber) => {
              const val = cell.value;
              headers[colNumber] = String(val?.text || val || '').trim();
            });
          } else {
            const rowObj = {};
            let hasAnyVal = false;
            headers.forEach((h, colNumber) => {
              if (!h) return;
              const cellVal = row.getCell(colNumber).value;
              let val = '';
              if (cellVal !== null && cellVal !== undefined) {
                if (typeof cellVal === 'object') {
                  val = cellVal.text !== undefined ? cellVal.text : (cellVal.result !== undefined ? cellVal.result : JSON.stringify(cellVal));
                } else {
                  val = String(cellVal);
                }
              }
              if (val !== '') hasAnyVal = true;
              rowObj[h] = val;
            });
            if (hasAnyVal) {
              parsed.push(rowObj);
            }
          }
        });

        processParsedData(parsed);
      }
    } catch (err) {
      console.error('File parsing error:', err);
      showToast('Failed to parse file. Please verify format (.xlsx, .csv).', 'error');
    }
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
              {savedDatasets && savedDatasets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSavedList(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <Database className="w-3.5 h-3.5 text-sky-600" />
                  <span>Supabase ({savedDatasets.length})</span>
                </button>
              )}
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
            </div>
          </div>

          {fileName && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold font-mono">
                  ACTIVE
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {fileName}
                </span>
                <span className="text-slate-400">({fileSize})</span>
              </div>

              <div className="flex items-center gap-2">
                {lastSavedToSupabase ? (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Saved to Supabase
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => saveCurrentToSupabase()}
                    disabled={isSavingSupabase || rawDataset.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    {isSavingSupabase ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Database className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingSupabase ? 'Saving...' : 'Save to Supabase'}</span>
                  </button>
                )}
              </div>
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
            <span>Reconcile</span>
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

      {/* Quick Jump Buttons & Supabase Action */}
      {reconciledData.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActivePage('overview')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shadow-sm active:scale-95"
          >
            <PieChart className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>
          <button
            onClick={() => setActivePage('explorer')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-sm"
          >
            <TableProperties className="w-4 h-4" />
            <span>Product Master Table</span>
          </button>
          <button
            onClick={() => saveCurrentToSupabase()}
            disabled={isSavingSupabase}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition shadow-sm disabled:opacity-50"
          >
            {isSavingSupabase ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Database className="w-4 h-4 text-emerald-600" />
            )}
            <span>{isSavingSupabase ? 'Saving...' : 'Save to Supabase'}</span>
          </button>
        </div>
      )}

      {/* Supabase Saved Datasets Modal */}
      {showSavedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Supabase Datasets</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshSavedDatasetsList}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowSavedList(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
              {savedDatasets && savedDatasets.length > 0 ? (
                savedDatasets.map((ds) => (
                  <div
                    key={ds.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/30 transition text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{ds.file_name || 'Dataset'}</p>
                      <p className="text-slate-400 font-medium">
                        {ds.row_count || 0} rows • {ds.created_at ? new Date(ds.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        loadSavedDataset(ds.id);
                        setShowSavedList(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold transition"
                    >
                      Load
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                  No datasets stored in Supabase yet.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSavedList(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase SQL Table Setup Modal */}
      {sqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Supabase Table Setup</h3>
              </div>
              <button
                onClick={() => setSqlModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <pre className="p-3 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto max-h-64 selection:bg-emerald-900 selection:text-white">
                  {SUPABASE_SETUP_SQL}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSqlModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
