import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet } from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import usePayoutEligibility from '../hooks/usePayoutEligibility';
import { usePayoutStats } from '../hooks/usePayoutStats';

// Components
import PayoutEligibilityCard from '../components/PayoutEligibilityCard';
import PayoutStatsCards from '../components/PayoutStatsCards';
import PayoutRequestForm from '../components/PayoutRequestForm';

/**
 * PayoutRequestPage - Main page for requesting payout
 * Route: /interviewer/payout/request
 */
const PayoutRequestPage = () => {
  const navigate = useNavigate();
  
  // Fetch eligibility and stats
  const { 
    eligibility, 
    loading: eligibilityLoading, 
    error: eligibilityError,
    refetch: refetchEligibility 
  } = usePayoutEligibility();

  console.log("🔥 ELIGIBILITY:", eligibility);

  const { 
    stats, 
    loading: statsLoading, 
    error: statsError,
    refetch: refetchStats
  } = usePayoutStats();

  // Handle successful payout request
  const handlePayoutSuccess = (payoutData) => {
    toast.success(
      `Payout request created! Reference: ${payoutData.payout.reference_number}`,
      {
        duration: 5000,
      }
    );

    // Refetch data
    refetchEligibility();
    refetchStats();

    // Navigate to history after 2 seconds
    setTimeout(() => {
      navigate('/interviewer/payout/history');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/interviewer/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-7 h-7 text-primary" />
                  Request Payout
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Withdraw your earned tokens to your bank account
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/interviewer/payout/history')}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              View History →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <PayoutStatsCards 
            stats={stats} 
            loading={statsLoading} 
            error={statsError} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Eligibility */}
            <div className="lg:col-span-1">
              <PayoutEligibilityCard
                eligibility={eligibility}
                loading={eligibilityLoading}
                error={eligibilityError}
              />
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Payout Request Form
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Fill in your bank details to request a payout
                </p>

                {eligibilityLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : !eligibility?.can_request ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-6 text-center">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You are not currently eligible to request a payout.
                      <br />
                      Please resolve the issues shown in the eligibility card.
                    </p>
                  </div>
                ) : (
                  <PayoutRequestForm
                    eligibility={eligibility}
                    onSuccess={handlePayoutSuccess}
                    disabled={!eligibility.can_request}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutRequestPage;
