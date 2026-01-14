import React from 'react';
import { X, Coins, Shield, Truck, ShieldCheck } from 'lucide-react';

export default function TokenPurchaseModal({ pack, isOpen, onClose, onPurchase }) {
  if (!isOpen || !pack) return null;

  const valuePerToken = (pack.price_inr / pack.tokens).toFixed(1);
  const savings = 8 - parseFloat(valuePerToken);

  const benefits = [
    { icon: Coins, text: `${pack.tokens.toLocaleString()} tokens instantly` },
    { icon: ShieldCheck, text: '100% secure Stripe payment' },
    { icon: Truck, text: 'Instant wallet credit after payment' },
    { icon: Shield, text: 'Cancel anytime, no contracts' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{pack.name}</h2>
                <p className="text-emerald-600 font-semibold text-xl">₹{pack.price_inr.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
            >
              <X className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-8 space-y-8">
          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-3xl border-2 border-emerald-100 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Perfect for Interviews</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Coins className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{pack.tokens.toLocaleString()} tokens</div>
                      <div className="text-sm text-gray-500">₹{valuePerToken}/token</div>
                      {savings > 0 && (
                        <div className="text-emerald-600 font-semibold text-sm">
                          Save ₹{savings}/token vs regular price
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-600 mb-4">⚡</div>
                <div className="text-4xl font-bold text-gray-900">Instant Delivery</div>
                <p className="text-xl text-gray-600 mt-2">Tokens credited immediately after payment</p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What's Included</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map(({ icon: Icon, text }, idx) => (
                <div key={idx} className="flex items-start gap-4 p-6 bg-gray-50/50 hover:bg-gray-100 rounded-2xl group transition-all duration-200">
                  <div className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-0 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-8 border-2 border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              onClick={() => onPurchase(pack.id)}
              className="flex-1 py-4 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Coins className="w-6 h-6" />
              Pay ₹{pack.price_inr.toLocaleString()}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Secure checkout via Stripe. No contracts. Instant token delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
