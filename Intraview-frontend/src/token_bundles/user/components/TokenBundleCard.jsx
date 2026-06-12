import React from 'react';
import { Coins, ShoppingCart, Star } from 'lucide-react';

export default function TokenBundleCard({ pack, onPurchase }) {
  // Mark the pack with the most tokens as "Best Value"
  const isFeatured = pack.is_featured ?? false;

  return (
    <div
      className={`
        group relative bg-white rounded-2xl border-2 overflow-hidden
        shadow hover:shadow-lg transition-all duration-300 cursor-pointer
        flex flex-col
        ${isFeatured
          ? 'border-teal-500 ring-2 ring-teal-100'
          : 'border-gray-200 hover:border-teal-300'}
      `}
      onClick={() => onPurchase(pack)}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute top-0 inset-x-0 h-1 bg-teal-500 rounded-t-2xl" />
      )}

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">

        {/* Icon + badge row */}
        <div className="flex items-center justify-between mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center
            ${isFeatured ? 'bg-teal-100' : 'bg-gray-100'}
          `}>
            <Coins className={`w-6 h-6 ${isFeatured ? 'text-teal-600' : 'text-gray-500'}`} />
          </div>

          {isFeatured && (
            <span className="inline-flex items-center gap-1 bg-yellow-400 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              <Star className="w-3 h-3" />
              Popular
            </span>
          )}
        </div>

        {/* Pack name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">
          {pack.name}
        </h3>

        {/* Token count */}
        <p className="text-sm text-gray-500 mb-5">
          {pack.tokens.toLocaleString()} tokens
        </p>

        {/* Price */}
        <div className="mt-auto">
          <div className="text-3xl font-bold text-gray-900 mb-4">
            ₹{pack.price_inr.toLocaleString()}
          </div>

          <button
            className={`
              w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
              transition-all duration-200 shadow-sm hover:shadow-md
              ${isFeatured
                ? 'bg-teal-500 hover:bg-teal-600 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'}
            `}
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
