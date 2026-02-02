// src/hooks/useAdminPayoutStats.js
import { useState, useEffect, useCallback } from 'react';
import { getAdminPayoutStats } from '../../interviewerPayoutApi';

export const useAdminPayoutStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getAdminPayoutStats();

    if (result.success) {
      setStats(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export default useAdminPayoutStats;
