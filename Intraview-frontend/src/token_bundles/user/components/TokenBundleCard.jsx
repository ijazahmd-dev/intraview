import React from 'react';
import { Coins, ShoppingCart, Crown } from 'lucide-react';

export default function TokenBundleCard({ pack, onPurchase }) {
  const valuePerToken = (pack.price_inr / pack.tokens).toFixed(1);
  const isBestValue = valuePerToken <= 7.5; // Highlight packs ≤ ₹7.5/token

  return (
    <div 
      className={`
        group bg-white/70 backdrop-blur-xl border-2 rounded-3xl p-8 h-full
        shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500
        cursor-pointer hover:border-emerald-300 relative overflow-hidden
        ${isBestValue ? 'ring-4 ring-emerald-100/50 border-emerald-400 bg-emerald-50/50' : 'border-gray-200 hover:border-emerald-200'}
      `}
      onClick={() => onPurchase(pack)}
    >
      {/* Best Value Badge */}
      {isBestValue && (
        <div className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-1 rounded-2xl text-sm font-bold shadow-lg">
          <Crown className="w-3 h-3 inline -ml-1 mr-1" /> BEST VALUE
        </div>
      )}

      {/* Tokens */}
      <div className="flex items-center justify-center mb-6">
        <Coins className="w-16 h-16 text-emerald-500 shadow-lg p-3 bg-emerald-100/50 rounded-3xl group-hover:scale-110 transition-transform" />
      </div>

      {/* Pack Name */}
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-2 group-hover:text-emerald-700 transition-colors">
        {pack.name}
      </h3>

      {/* Price & Value */}
      <div className="text-center space-y-2 mb-8">
        <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
          ₹{pack.price_inr.toLocaleString()}
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>{pack.tokens.toLocaleString()} tokens</span>
          <span>•</span>
          <span>₹{valuePerToken}/token</span>
        </div>
      </div>

      {/* CTA */}
      <div className="absolute bottom-6 left-6 right-6">
        <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group-hover:gap-4">
          <ShoppingCart className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Buy Now
        </button>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}
