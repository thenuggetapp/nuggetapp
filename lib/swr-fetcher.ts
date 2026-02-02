import { supabase } from '@/lib/supabase/client';

// Fetcher for API routes
export const apiFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // @ts-ignore
    error.info = await res.json();
    // @ts-ignore
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  // Handle your API response format: { data, error }
  if (json.error) {
    throw new Error(json.error);
  }
  return json.data;
};

// Fetcher for direct Supabase queries (optional, for advanced use)
export const supabaseFetcher = async (key: string) => {
  // Parse key format: "supabase:table:query"
  const [, table, ...queryParts] = key.split(':');
  const query = queryParts.join(':');
  
  // This is a simplified version - you can extend it
  // For now, prefer using API routes with apiFetcher
  const { data, error } = await supabase
    .from(table)
    .select(query || '*');
    
  if (error) throw error;
  return data;
};

// Default fetcher (uses API routes)
export const defaultFetcher = apiFetcher;

