import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Building2, 
  CreditCard, 
  Phone, 
  User,
  AlertCircle,
  Info,
  IndianRupee
} from 'lucide-react';
import { usePayoutRequest } from '../hooks/usePayoutRequest';

/**
 * PayoutRequestForm Component
 * Complete form for requesting payout with validation
 */
const PayoutRequestForm = ({ 
  eligibility, 
  onSuccess, 
  disabled = false 
}) => {
  const { submitRequest, loading, error, fieldErrors, clearErrors } = usePayoutRequest();

  // Form state
  const [formData, setFormData] = useState({
    tokens_requested: '',
    bank_account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    mobile_number: '',
  });

  // Calculated INR amount
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  // Local validation errors
  const [localErrors, setLocalErrors] = useState({});

  const TOKEN_RATE = 10; // ₹10 per token
  const minTokens = eligibility?.min_tokens_required || 50;
  const maxTokens = eligibility?.wallet_balance?.available || 0;

  // Calculate INR amount when tokens change
  useEffect(() => {
    const tokens = parseInt(formData.tokens_requested) || 0;
    setCalculatedAmount(tokens * TOKEN_RATE);
  }, [formData.tokens_requested]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors for this field
    if (localErrors[name]) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (fieldErrors[name]) {
      clearErrors();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Tokens validation
    const tokens = parseInt(formData.tokens_requested);
    if (!formData.tokens_requested) {
      errors.tokens_requested = 'Please enter token amount';
    } else if (isNaN(tokens) || tokens < minTokens) {
      errors.tokens_requested = `Minimum ${minTokens} tokens required`;
    } else if (tokens > maxTokens) {
      errors.tokens_requested = `Maximum ${maxTokens} tokens available`;
    }

    // Bank account validation
    if (!formData.bank_account_number) {
      errors.bank_account_number = 'Bank account number is required';
    } else if (!/^\d{9,18}$/.test(formData.bank_account_number)) {
      errors.bank_account_number = 'Must be 9-18 digits';
    }

    // IFSC code validation
    if (!formData.ifsc_code) {
      errors.ifsc_code = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code.toUpperCase())) {
      errors.ifsc_code = 'Invalid IFSC format (e.g., SBIN0001234)';
    }

    // Account holder name validation
    if (!formData.account_holder_name) {
      errors.account_holder_name = 'Account holder name is required';
    } else if (formData.account_holder_name.trim().length < 3) {
      errors.account_holder_name = 'Must be at least 3 characters';
    }

    // Mobile number validation
    if (!formData.mobile_number) {
      errors.mobile_number = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile_number)) {
      errors.mobile_number = 'Invalid 10-digit mobile number';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await submitRequest({
      ...formData,
      tokens_requested: parseInt(formData.tokens_requested),
      ifsc_code: formData.ifsc_code.toUpperCase(),
    });

    if (result.success) {
      // Clear form
      setFormData({
        tokens_requested: '',
        bank_account_number: '',
        ifsc_code: '',
        account_holder_name: '',
        mobile_number: '',
      });
      setCalculatedAmount(0);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }
    }
  };

  const isFormDisabled = disabled || loading || !eligibility?.can_request;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                Request Failed
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Token Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Wallet className="w-4 h-4 inline mr-2" />
          Token Amount *
        </label>
        <input
          type="number"
          name="tokens_requested"
          value={formData.tokens_requested}
          onChange={handleChange}
          min={minTokens}
          max={maxTokens}
          disabled={isFormDisabled}
          placeholder={`Enter tokens (min: ${minTokens})`}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            localErrors.tokens_requested || fieldErrors.tokens_requested
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {(localErrors.tokens_requested || fieldErrors.tokens_requested) && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {localErrors.tokens_requested || fieldErrors.tokens_requested}
          </p>
        )}
        
        {/* Calculated Amount */}
        {formData.tokens_requested && !localErrors.tokens_requested && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-600 dark:text-green-400">
              You will receive: ₹{calculatedAmount.toLocaleString()}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ({formData.tokens_requested} × ₹{TOKEN_RATE})
            </span>
          </div>
        )}
        
        {/* Range Helper */}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Available: {maxTokens} tokens (₹{maxTokens * TOKEN_RATE})
        </p>
      </div>

      {/* Bank Account Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <CreditCard className="w-4 h-4 inline mr-2" />
          Bank Account Number *
        </label>
        <input
          type="text"
          name="bank_account_number"
          value={formData.bank_account_number}
          onChange={handleChange}
          disabled={isFormDisabled}
          placeholder="Enter 9-18 digit account number"
          maxLength={18}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            localErrors.bank_account_number || fieldErrors.bank_account_number
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {(localErrors.bank_account_number || fieldErrors.bank_account_number) && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {localErrors.bank_account_number || fieldErrors.bank_account_number}
          </p>
        )}
      </div>

      {/* IFSC Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Building2 className="w-4 h-4 inline mr-2" />
          IFSC Code *
        </label>
        <input
          type="text"
          name="ifsc_code"
          value={formData.ifsc_code}
          onChange={handleChange}
          disabled={isFormDisabled}
          placeholder="e.g., SBIN0001234"
          maxLength={11}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            localErrors.ifsc_code || fieldErrors.ifsc_code
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 uppercase focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ textTransform: 'uppercase' }}
        />
        {(localErrors.ifsc_code || fieldErrors.ifsc_code) && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {localErrors.ifsc_code || fieldErrors.ifsc_code}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Find your IFSC code on your bank passbook or cheque
        </p>
      </div>

      {/* Account Holder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Account Holder Name *
        </label>
        <input
          type="text"
          name="account_holder_name"
          value={formData.account_holder_name}
          onChange={handleChange}
          disabled={isFormDisabled}
          placeholder="Enter name as per bank account"
          className={`w-full px-4 py-2.5 rounded-lg border ${
            localErrors.account_holder_name || fieldErrors.account_holder_name
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {(localErrors.account_holder_name || fieldErrors.account_holder_name) && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {localErrors.account_holder_name || fieldErrors.account_holder_name}
          </p>
        )}
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          Mobile Number *
        </label>
        <input
          type="tel"
          name="mobile_number"
          value={formData.mobile_number}
          onChange={handleChange}
          disabled={isFormDisabled}
          placeholder="Enter 10-digit mobile number"
          maxLength={10}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            localErrors.mobile_number || fieldErrors.mobile_number
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {(localErrors.mobile_number || fieldErrors.mobile_number) && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {localErrors.mobile_number || fieldErrors.mobile_number}
          </p>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Important Information</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Ensure all bank details are correct. Changes cannot be made after submission.</li>
              <li>Processing time: 3-5 business days after approval.</li>
              <li>You will receive an email confirmation once approved.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            Request Payout
          </>
        )}
      </button>
    </form>
  );
};

export default PayoutRequestForm;
