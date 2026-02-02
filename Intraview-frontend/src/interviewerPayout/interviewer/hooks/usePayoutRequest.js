import { useState } from 'react';
import { createPayoutRequest } from '../../interviewerPayoutApi';
import { toast } from 'sonner';

/**
 * Hook to handle payout request submission
 * Used in PayoutRequestForm
 */
export const usePayoutRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const submitRequest = async (payoutData) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const result = await createPayoutRequest(payoutData);

    setLoading(false);

    if (result.success) {
      toast.success(result.message || 'Payout request created successfully!');
      return {
        success: true,
        data: result.data,
      };
    } else {
      setError(result.error);
      setFieldErrors(result.fieldErrors || {});
      toast.error(result.error || 'Failed to create payout request');
      return {
        success: false,
        error: result.error,
      };
    }
  };

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  return {
    submitRequest,
    loading,
    error,
    fieldErrors,
    clearErrors,
  };
};

export default usePayoutRequest;
