import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import ExcelJS from 'exceljs';
import {
  saveDatasetToSupabase,
  fetchSavedDatasets,
  loadDatasetById,
  isSupabaseConfigured,
  SUPABASE_SETUP_SQL
} from '../services/supabase';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [activePage, setActivePage] = useState('reconcile'); // overview, therapeutic, molecules, commercial, innovators, explorer, reconcile
  const [rawDataset, setRawDataset] = useState([]);
  const [headersList, setHeadersList] = useState([]);
  const [reconciledData, setReconciledData] = useState([]);
  const [groupedSourceMap, setGroupedSourceMap] = useState({});
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  
  // Supabase states
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [lastSavedToSupabase, setLastSavedToSupabase] = useState(null);
  const [savedDatasets, setSavedDatasets] = useState([]);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  
  // Reconcile configuration settings
  const [groupKey, setGroupKey] = useState('');
  const [delimiter, setDelimiter] = useState('; ');
  const [customDelimiter, setCustomDelimiter] = useState('; ');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [sortValues, setSortValues] = useState(false);

  // Modals
  const [dossierProduct, setDossierProduct] = useState(null);
  const [auditGroup, setAuditGroup] = useState(null);
  const [drilldownModalInfo, setDrilldownModalInfo] = useState(null); // { tag, title, items }

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Cross-Filters for Analytics
  const [filters, setFilters] = useState({
    therapeutic: 'ALL',
    team: 'ALL',
    productType: 'ALL',
    route: 'ALL',
    innovator: 'ALL',
    searchQuery: '',
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  const getActiveDelimiter = () => {
    return delimiter === 'custom' ? (customDelimiter || '; ') : delimiter;
  };

  // Helper to identify standard pharma columns flexibly
  const standardizedFields = useMemo(() => {
    const findFieldKey = (candidates) => {
      for (const c of candidates) {
        const found = headersList.find(h => h.trim().toLowerCase() === c.toLowerCase());
        if (found) return found;
      }
      for (const c of candidates) {
        const found = headersList.find(h => h.toLowerCase().includes(c.toLowerCase()));
        if (found) return found;
      }
      return null;
    };

    return {
      id: groupKey || findFieldKey(['Product ID', 'ID', 'Code', 'SKU']) || headersList[0] || 'Product ID',
      brand: findFieldKey(['Brand Name', 'Brand', 'Product Name', 'Item Name']) || 'Brand Name',
      composition: findFieldKey(['Composition', 'Generic Name', 'Molecules', 'API', 'Active Ingredient']) || 'Composition',
      strength: findFieldKey(['Strength', 'Potency', 'Dose Strength']) || 'Strength',
      therapeutic: findFieldKey(['Therapeutic Area', 'Therapy', 'Indication Group', 'Domain']) || 'Therapeutic Area',
      condition: findFieldKey(['Clinical Condition / Domain', 'Clinical Condition', 'Indication', 'Disease']) || 'Clinical Condition / Domain',
      pharmClass: findFieldKey(['Pharmacological / Functional Class', 'Functional Class', 'Pharmacological Class', 'Class']) || 'Pharmacological / Functional Class',
      productType: findFieldKey(['Product Type', 'Category', 'Classification', 'Segment']) || 'Product Type',
      team: findFieldKey(['Team', 'Division', 'Sales Team', 'Franchise', 'Business Unit']) || 'Team',
      route: findFieldKey(['Route', 'Administration Route', 'Delivery Route']) || 'Route',
      dosageForm: findFieldKey(['Dosage Form', 'Form', 'Formulation']) || 'Dosage Form',
      innovatorCompany: findFieldKey(['Innovator Company', 'Originator', 'Company', 'Manufacturer']) || 'Innovator Company',
      innovatorBrand: findFieldKey(['Innovator Brand', 'Originator Brand']) || 'Innovator Brand',
      dosage: findFieldKey(['Dosage', 'Directions', 'Posology']) || 'Dosage',
      sourceRow: findFieldKey(['Source Row', 'Original Row', 'Row']) || 'Source Row'
    };
  }, [headersList, groupKey]);

  // Execute reconciliation engine
  const executeReconcile = (dataToReconcile = rawDataset, customKey = groupKey) => {
    if (!dataToReconcile || dataToReconcile.length === 0) return;

    const effectiveHeaders = Object.keys(dataToReconcile[0]);
    const effectiveGroupKey = customKey || effectiveHeaders[0];
    const delim = getActiveDelimiter();

    const groups = new Map();
    const sourceMap = {};

    for (let i = 0; i < dataToReconcile.length; i++) {
      const row = dataToReconcile[i];
      const rawVal = row[effectiveGroupKey] !== undefined ? String(row[effectiveGroupKey]).trim() : '';
      const idKey = rawVal === '' ? `__EMPTY_KEY_${i}__` : rawVal;

      if (!groups.has(idKey)) {
        groups.set(idKey, []);
        sourceMap[idKey] = [];
      }
      groups.get(idKey).push(row);
      sourceMap[idKey].push(row);
    }

    const unifiedList = [];
    groups.forEach((rows, idKey) => {
      const unifiedRow = {};
      unifiedRow[effectiveGroupKey] = rows[0][effectiveGroupKey] || '';
      unifiedRow['__row_count__'] = rows.length;
      unifiedRow['__group_id__'] = idKey;

      effectiveHeaders.forEach(col => {
        if (col === effectiveGroupKey) return;

        const collectedValues = [];
        const seenSet = new Set();

        rows.forEach(r => {
          const rawCell = r[col];
          if (rawCell === undefined || rawCell === null) return;
          const strCell = String(rawCell).trim();
          if (strCell === '') return;

          const parts = strCell.split(delim).map(p => p.trim()).filter(Boolean);
          const items = parts.length > 0 ? parts : [strCell];

          items.forEach(val => {
            const lookupKey = caseInsensitive ? val.toLowerCase() : val;
            if (!seenSet.has(lookupKey)) {
              seenSet.add(lookupKey);
              collectedValues.push(val);
            }
          });
        });

        if (sortValues) {
          collectedValues.sort((a, b) => a.localeCompare(undefined, { numeric: true, sensitivity: 'base' }));
        }

        unifiedRow[col] = collectedValues.join(delim);
      });

      unifiedList.push(unifiedRow);
    });

    setGroupedSourceMap(sourceMap);
    setReconciledData(unifiedList);
    setHeadersList(effectiveHeaders);
    setGroupKey(effectiveGroupKey);
    return unifiedList;
  };

  // Filtered dataset for all analytical views
  const filteredReconciledData = useMemo(() => {
    const f = standardizedFields;
    return reconciledData.filter(row => {
      // Global search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesAny = headersList.some(col => {
          const val = row[col] ? String(row[col]).toLowerCase() : '';
          return val.includes(query);
        });
        if (!matchesAny) return false;
      }

      // Dropdown filters
      if (filters.therapeutic !== 'ALL' && String(row[f.therapeutic] || '') !== filters.therapeutic) return false;
      if (filters.team !== 'ALL' && String(row[f.team] || '') !== filters.team) return false;
      if (filters.productType !== 'ALL' && String(row[f.productType] || '') !== filters.productType) return false;
      if (filters.route !== 'ALL' && String(row[f.route] || '') !== filters.route) return false;
      if (filters.innovator !== 'ALL' && String(row[f.innovatorCompany] || '') !== filters.innovator) return false;

      return true;
    });
  }, [reconciledData, filters, headersList, standardizedFields]);

  // Unique filter options extracted dynamically
  const filterOptions = useMemo(() => {
    const f = standardizedFields;
    const getUnique = (fieldKey) => {
      if (!fieldKey || !headersList.includes(fieldKey)) return [];
      const set = new Set();
      reconciledData.forEach(r => {
        const val = String(r[fieldKey] || '').trim();
        if (val && val !== 'Not available' && val !== '-' && val !== 'null') {
          set.add(val);
        }
      });
      return Array.from(set).sort();
    };

    return {
      therapeutic: getUnique(f.therapeutic),
      team: getUnique(f.team),
      productType: getUnique(f.productType),
      route: getUnique(f.route),
      innovator: getUnique(f.innovatorCompany),
    };
  }, [reconciledData, headersList, standardizedFields]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      therapeutic: 'ALL',
      team: 'ALL',
      productType: 'ALL',
      route: 'ALL',
      innovator: 'ALL',
      searchQuery: '',
    });
    showToast("Filters reset to show entire portfolio.");
  };

  const resetAll = () => {
    setRawDataset([]);
    setHeadersList([]);
    setReconciledData([]);
    setGroupedSourceMap({});
    setFileName('');
    setFileSize('');
    setGroupKey('');
    clearAllFilters();
    setActivePage('reconcile');
    showToast("Workspace cleared. Upload your spreadsheet to begin.");
  };

  // Drilldown helper: open subset modal by criteria
  const openDrilldown = (tag, title, predicate) => {
    const matched = filteredReconciledData.filter(predicate);
    setDrilldownModalInfo({ tag, title, items: matched });
  };

  // Open audit trail comparison for a group
  const openAuditModal = (groupId) => {
    const sources = groupedSourceMap[groupId] || [];
    const unified = reconciledData.find(r => r['__group_id__'] === groupId);
    if (!unified) return;
    setAuditGroup({
      groupId,
      idVal: unified[standardizedFields.id] || groupId,
      sources,
      unified,
    });
  };

  // Export utilities
  const exportExcel = async (items = filteredReconciledData, customName) => {
    if (!items || items.length === 0) {
      showToast("No data available to export.", "error");
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Reconciled_Products");

      worksheet.columns = headersList.map(h => ({ header: h, key: h }));

      items.forEach(r => {
        const row = {};
        headersList.forEach(col => {
          row[col] = r[col] !== undefined ? r[col] : '';
        });
        worksheet.addRow(row);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = customName || (fileName ? fileName.replace(/\.[^/.]+$/, "") + "_reconciled.xlsx" : "ReconcileX_Portfolio.xlsx");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${items.length} records to Excel!`, "success");
    } catch (err) {
      console.error("Excel export error:", err);
      showToast("Failed to export Excel file.", "error");
    }
  };

  const exportCsv = (items = filteredReconciledData, customName) => {
    if (!items || items.length === 0) {
      showToast("No data available to export.", "error");
      return;
    }
    const escapeCsv = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const headerLine = headersList.map(escapeCsv).join(',');
    const rowLines = items.map(r => {
      return headersList.map(col => escapeCsv(r[col] !== undefined ? r[col] : '')).join(',');
    });
    const csv = [headerLine, ...rowLines].join('\r\n');
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = customName || (fileName ? fileName.replace(/\.[^/.]+$/, "") + "_reconciled.csv" : "ReconcileX_Portfolio.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${items.length} records to CSV!`, "success");
  // Supabase actions
  const refreshSavedDatasetsList = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const list = await fetchSavedDatasets();
      setSavedDatasets(list);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    refreshSavedDatasetsList();
  }, []);

  const saveCurrentToSupabase = async (customName) => {
    if (!rawDataset || rawDataset.length === 0) {
      showToast('No data to save. Please upload a dataset first.', 'error');
      return { success: false };
    }

    setIsSavingSupabase(true);
    try {
      const res = await saveDatasetToSupabase({
        fileName: customName || fileName || 'Uploaded_Dataset.xlsx',
        fileSize,
        rawDataset,
        reconciledData,
        headersList
      });

      if (res.success) {
        setLastSavedToSupabase(new Date().toLocaleTimeString());
        showToast('Saved to Supabase', 'success');
        refreshSavedDatasetsList();
        return { success: true };
      } else if (res.needsTableCreation) {
        setSqlModalOpen(true);
        showToast('Table portfolio_datasets does not exist in Supabase', 'error');
        return { success: false, needsTableCreation: true };
      } else {
        showToast(res.error || 'Failed to save to Supabase', 'error');
        return { success: false, error: res.error };
      }
    } catch (err) {
      showToast(err.message || 'Error connecting to Supabase', 'error');
      return { success: false, error: err.message };
    } finally {
      setIsSavingSupabase(false);
    }
  };

  const loadSavedDataset = async (id) => {
    try {
      showToast('Loading from Supabase...', 'info');
      const item = await loadDatasetById(id);
      if (!item) {
        showToast('Dataset not found in Supabase', 'error');
        return;
      }

      const raw = item.raw_data || [];
      const headers = item.headers || (raw.length > 0 ? Object.keys(raw[0]) : []);
      
      setFileName(item.file_name || 'Supabase_Dataset.xlsx');
      setFileSize(item.file_size || '');
      setHeadersList(headers);
      setRawDataset(raw);

      if (item.reconciled_data && item.reconciled_data.length > 0) {
        setReconciledData(item.reconciled_data);
      } else if (raw.length > 0) {
        executeReconcile(raw, headers[0]);
      }

      setLastSavedToSupabase(new Date(item.created_at || Date.now()).toLocaleTimeString());
      showToast(`Loaded ${item.file_name || 'dataset'} from Supabase`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to load dataset from Supabase', 'error');
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        activePage,
        setActivePage,
        rawDataset,
        setRawDataset,
        headersList,
        setHeadersList,
        reconciledData,
        groupedSourceMap,
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
        resetAll,
        filters,
        updateFilter,
        clearAllFilters,
        filteredReconciledData,
        filterOptions,
        standardizedFields,
        dossierProduct,
        setDossierProduct,
        auditGroup,
        setAuditGroup,
        drilldownModalInfo,
        setDrilldownModalInfo,
        openDrilldown,
        openAuditModal,
        toast,
        showToast,
        exportExcel,
        exportCsv,
        copyTsv,
        // Supabase integrations
        isSavingSupabase,
        lastSavedToSupabase,
        savedDatasets,
        sqlModalOpen,
        setSqlModalOpen,
        saveCurrentToSupabase,
        loadSavedDataset,
        refreshSavedDatasetsList,
        SUPABASE_SETUP_SQL,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
