import { useCallback, useEffect, useState } from 'react';

// Loads data from an API function and exposes loading / error / reload.
export function useFetch(fetcher) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setData(await fetcher()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [fetcher]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

// Auto-clearing flash message.
export function useFlash(ms = 3500) {
  const [flash, setFlash] = useState(null);
  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(null), ms);
    return () => clearTimeout(t);
  }, [flash, ms]);
  return [flash, (text, type = 'success') => setFlash({ text, type })];
}
