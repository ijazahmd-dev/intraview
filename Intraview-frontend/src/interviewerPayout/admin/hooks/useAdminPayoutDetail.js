// src/hooks/useAdminPayoutDetail.js
import { useState, useEffect, useCallback } from 'react';
import {
  getAdminPayoutDetail,
  approvePayout,
  rejectPayout,
  markPayoutPaid,
} from '../../adminPayoutApi';

export const useAdminPayoutDetail = (payoutId) => {
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchPayout = useCallback(async () => {
    if (!payoutId) {
      setError('Invalid payout ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getAdminPayoutDetail(payoutId);

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

  const performAction = async (apiFn, payload) => {
    setActionLoading(true);
    setActionError(null);
    const result = await apiFn(payoutId, payload);
    if (result.success) {
      await fetchPayout();
    } else {
      setActionError(result.error);
    }
    setActionLoading(false);
    return result;
  };

  const handleApprove = (payload = {}) => performAction(approvePayout, payload);
  const handleReject = (payload) => performAction(rejectPayout, payload);
  const handleMarkPaid = (payload = {}) => performAction(markPayoutPaid, payload);

  return {
    payout,
    loading,
    error,
    refetch: fetchPayout,
    actionLoading,
    actionError,
    handleApprove,
    handleReject,
    handleMarkPaid,
  };
};

export default useAdminPayoutDetail;
