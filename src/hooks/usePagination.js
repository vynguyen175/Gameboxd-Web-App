import { useState, useCallback } from 'react';

export default function usePagination(fetchFn) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const loadMore = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchFn(reset ? null : cursor);
      if (reset) {
        setItems(data.reviews || data.items || data);
      } else {
        setItems(prev => [...prev, ...(data.reviews || data.items || data)]);
      }
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore !== undefined ? data.hasMore : (data.reviews || data.items || data).length > 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cursor, loading]);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
  }, []);

  return { items, loading, hasMore, loadMore, reset, setItems };
}
