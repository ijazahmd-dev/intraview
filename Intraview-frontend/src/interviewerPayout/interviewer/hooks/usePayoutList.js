import { useState, useEffect, useCallback } from 'react';
import { getPayoutList } from '../../interviewerPayoutApi';

/**
 * Hook to fetch payout list with filtering and pagination
 */
export const usePayoutList = (initialFilters = {}) => {
  const [payouts, setPayouts] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    page: initialFilters.page || 1,
    page_size: initialFilters.page_size || 10,
  });

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getPayoutList(filters);

    if (result.success) {
      setPayouts(result.data.results || []);
      setPagination({
        count: result.data.count || 0,
        next: result.data.next || null,
        previous: result.data.previous || null,
      });
    } else {
      setError(result.error);
      setPayouts([]);
    }

    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when changing filters (except page itself)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  // Pagination helpers
  const goToPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.next) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.next]);

  const previousPage = useCallback(() => {
    if (pagination.previous) {
      setFilters(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.previous]);

  return {
    payouts,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchPayouts,
    goToPage,
    nextPage,
    previousPage,
  };
};

export default usePayoutList;
