// src/hooks/useAdminPayoutList.js
import { useState, useEffect, useCallback } from 'react';
import { getAdminPayoutQueue, getAdminPayoutHistory } from '../../adminPayoutApi';

export const useAdminPayoutList = (mode = 'queue', initialFilters = {}) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    page: initialFilters.page || 1,
    page_size: initialFilters.page_size || 10,
    search: initialFilters.search || '',
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    const apiFn = mode === 'queue' ? getAdminPayoutQueue : getAdminPayoutHistory;
    const result = await apiFn(filters);

    if (result.success) {
      setItems(result.data.results || []);
      setPagination({
        count: result.data.count || 0,
        next: result.data.next || null,
        previous: result.data.previous || null,
      });
    } else {
      setError(result.error);
      setItems([]);
    }

    setLoading(false);
  }, [mode, filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const goToPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return {
    items,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    goToPage,
    refetch: fetchItems,
  };
};

export default useAdminPayoutList;
