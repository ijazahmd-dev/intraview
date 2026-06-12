import React from 'react';
import { X, Coins, ShieldCheck, Zap, Clock } from 'lucide-react';

const FEATURES = [
  { icon: Zap,         text: 'Tokens credited instantly to your wallet' },
  { icon: ShieldCheck, text: '100% secure checkout via Stripe' },
  { icon: Clock,       text: 'Tokens never expire — use them anytime' },
];

export default function TokenPurchaseModal({ pack, isOpen, onClose, onPurchase }) {
  if (!isOpen || !pack) return null;

  return (
    <>
      <style>{`
        @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp    { from { opacity:0; transform:translateY(28px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        .modal-backdrop { animation: backdropIn 0.2s ease both; }
        .modal-card     { animation: slideUp   0.3s ease both; }
      `}</style>

      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Card */}
        <div
          className="modal-card bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Coins className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">{pack.name}</h2>
                  <p className="text-teal-100 text-sm mt-0.5">
                    {pack.tokens.toLocaleString()} tokens
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Big price */}
            <div className="mt-5 pt-5 border-t border-white/20">
              <p className="text-teal-100 text-xs font-semibold uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-4xl font-bold text-white">₹{pack.price_inr.toLocaleString()}</p>
            </div>
          </div>

          {/* ── Features ── */}
          <div className="p-6 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">What you get</p>

            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-sm text-gray-700">{text}</p>
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="px-6 pb-6 flex flex-col gap-3">
            <button
              onClick={() => onPurchase(pack.id)}
              className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl
                         transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Coins className="w-5 h-5" />
              Pay ₹{pack.price_inr.toLocaleString()}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl
                         hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm"
            >
              Cancel
            </button>

            <p className="text-center text-xs text-gray-400 mt-1">
              Secure checkout via Stripe · No contracts · Instant delivery
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
