// Supabase client and REST API service for ReconcileX
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hplccolccovhwcsouifc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VcSOkhUWP_LkfaZfuXXcdA_KGcupEiy';

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
};

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export const getSupabaseConfig = () => {
  return {
    url: SUPABASE_URL,
    hasKey: Boolean(SUPABASE_ANON_KEY)
  };
};

/**
 * Saves the uploaded dataset and reconciled data into Supabase
 */
export const saveDatasetToSupabase = async ({
  fileName = 'Uploaded_Dataset.xlsx',
  fileSize = '',
  rawDataset = [],
  reconciledData = [],
  headersList = []
}) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured in .env');
  }

  const payload = {
    file_name: fileName,
    file_size: fileSize,
    row_count: rawDataset.length,
    reconciled_count: reconciledData.length,
    headers: headersList,
    reconciled_data: reconciledData,
    raw_data: rawDataset,
    created_at: new Date().toISOString()
  };

  const endpoint = `${SUPABASE_URL}/rest/v1/portfolio_datasets`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = { message: errorText };
      }

      // Check if table does not exist
      if (
        response.status === 404 ||
        response.status === 400 ||
        (parsedError.message && (parsedError.message.includes('relation') || parsedError.message.includes('does not exist')))
      ) {
        return {
          success: false,
          needsTableCreation: true,
          table: 'portfolio_datasets',
          error: parsedError.message || 'Table portfolio_datasets does not exist in Supabase yet.'
        };
      }

      throw new Error(parsedError.message || `Supabase error (${response.status})`);
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data[0] : data
    };
  } catch (err) {
    console.error('Supabase save error:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Fetch list of saved datasets from Supabase
 */
export const fetchSavedDatasets = async () => {
  if (!isSupabaseConfigured()) return [];

  const endpoint = `${SUPABASE_URL}/rest/v1/portfolio_datasets?select=id,file_name,file_size,row_count,reconciled_count,created_at&order=created_at.desc`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (err) {
    console.warn('Failed to fetch datasets from Supabase:', err);
    return [];
  }
};

/**
 * Load full dataset records by ID from Supabase
 */
export const loadDatasetById = async (id) => {
  if (!isSupabaseConfigured() || !id) return null;

  const endpoint = `${SUPABASE_URL}/rest/v1/portfolio_datasets?id=eq.${id}&select=*`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load dataset from Supabase');
    }

    const data = await response.json();
    return data && data[0] ? data[0] : null;
  } catch (err) {
    console.error('Failed to load dataset by ID:', err);
    throw err;
  }
};

/**
 * Recommended SQL schema for creating the table in Supabase SQL editor
 */
export const SUPABASE_SETUP_SQL = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.portfolio_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text,
  file_size text,
  row_count integer,
  reconciled_count integer,
  headers jsonb,
  reconciled_data jsonb,
  raw_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_datasets ENABLE ROW LEVEL SECURITY;

-- Allow read/write access via Supabase key
CREATE POLICY "Allow public all access" 
  ON public.portfolio_datasets 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);
`;
