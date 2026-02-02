import { useState, useEffect, useCallback } from 'react';
import { checkPayoutEligibility } from '../../interviewerPayoutApi';

/**
 * Hook to check payout eligibility
 * Used in PayoutRequestPage
 */
export const usePayoutEligibility = () => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEligibility = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await checkPayoutEligibility();

    if (result.success) {
      setEligibility(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  return {
    eligibility,
    loading,
    error,
    refetch: fetchEligibility,
    
    // Computed values for easy access
    canRequest: eligibility?.can_request || false,
    walletBalance: eligibility?.wallet_balance || { total: 0, available: 0, locked: 0 },
    verificationStatus: eligibility?.verification_status || 'UNKNOWN',
    activePayout: eligibility?.active_payout || null,
    minTokensRequired: eligibility?.min_tokens_required || 50,
  };
};

export default usePayoutEligibility;
