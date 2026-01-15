import React from 'react';
import { toast } from 'sonner';

const ConfirmBookingModal = ({ 
  isOpen, 
  onClose, 
  slot, 
  tokenCost = 10,
  tokenBalance,
  onConfirm 
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Confirm Booking</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-800">Ready to book?</h3>
              <p className="text-sm text-emerald-700">Review your session details below</p>
            </div>
          </div>
        </div>

        {/* Slot Details */}
        <div className="p-8 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
            <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Session Time
            </h4>
            <div className="text-2xl font-bold text-gray-900">
              {slot.start_time} – {slot.end_time}
            </div>
            <p className="text-sm text-gray-600 mt-1">Duration: ~{Math.round((new Date(`2000-01-01T${slot.end_time}`) - new Date(`2000-01-01T${slot.start_time}`)) / 60000)} minutes</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-100">
            <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08 .402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Payment
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-emerald-700">-{tokenCost} tokens</span>
              <span className="px-4 py-2 bg-white text-emerald-800 text-sm font-bold rounded-xl border-2 border-emerald-200">
                Locked until completion
              </span>
            </div>
            <p className="text-sm text-emerald-700 mt-2 text-center">
              You'll have {tokenBalance - tokenCost} tokens remaining
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>✅ Tokens automatically refunded if interviewer cancels</p>
            <p>✅ Tokens transferred after successful completion</p>
            <p>⚠️ Cancel before session start to get refund (policy applies)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 pt-0 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={tokenBalance < tokenCost}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm & Lock {tokenCost} Tokens
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBookingModal;
