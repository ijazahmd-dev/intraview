// src/features/feedback/interviewer/components/SubmitEvaluationWrapper.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

// ✅ CORRECT IMPORTS (same folder structure)
import SubmitEvaluation from '../pages/SubmitEvaluation'; 
import feedbackApi from '../feedbackInterviewerApi'; // ✅ Your API file

const SubmitEvaluationWrapper = () => {
  const { bookingId } = useParams();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const data = await feedbackApi.checkEvaluationStatus(bookingId);
        console.log('Status response:', data); // ✅ DEBUG
        setBookingData(data);
        
        if (!data.can_submit) {
          toast.error(data.reason || 'Cannot submit evaluation');
          window.location.href = '/interviewer/dashboard';
          return;
        }
        
        setShowForm(true);
      } catch (error) {
        console.error('Status check failed:', error);
        toast.error('Failed to load evaluation form');
        window.location.href = '/interviewer/dashboard';
      } finally {
        setLoading(false);
      }
    };
    
    if (bookingId) {
      fetchStatus();
    }
  }, [bookingId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Checking Eligibility</h2>
          <p className="text-slate-600">Verifying if you can submit evaluation...</p>
        </div>
      </div>
    );
  }
  
  if (!showForm || !bookingData) {
    return <div>Redirecting...</div>; // Safety
  }
  
  return (
    <SubmitEvaluation 
      bookingId={bookingId}
      bookingData={bookingData}
      isOpen={true}
      onClose={() => window.location.href = '/interviewer/dashboard'}
    />
  );
};

export default SubmitEvaluationWrapper;
