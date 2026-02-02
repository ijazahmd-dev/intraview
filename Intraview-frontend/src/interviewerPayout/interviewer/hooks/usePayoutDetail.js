import { useState, useEffect, useCallback } from 'react';
import { getPayoutDetail } from '../../interviewerPayoutApi';

/**
 * Hook to fetch single payout detail
 */
export const usePayoutDetail = (payoutId) => {
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayout = useCallback(async () => {
    if (!payoutId) {
      setError('Invalid payout ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getPayoutDetail(payoutId);

    if (result.success) {
      setPayout(result.data);
    } else {
      setError(result.error);
      setPayout(null);
    }

    setLoading(false);
  }, [payoutId]);

  useEffect(() => {
    fetchPayout();
  }, [fetchPayout]);

  return {
    payout,
    loading,
    error,
    refetch: fetchPayout,
  };
};

export default usePayoutDetail;
