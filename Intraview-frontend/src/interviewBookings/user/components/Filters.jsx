import React from 'react';

const Filters = ({ filters, onFilterChange, onClearFilters, interviewers }) => {
  const specializations = Array.from(
    new Set(interviewers.map(i => i.headline?.split(',')[0]?.trim() || ''))
  ).filter(Boolean).slice(0, 8);

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 lg:p-12">
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {/* Specialization */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Specialization
          </label>
          <select
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Max Price (tokens)
          </label>
          <select
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Any Price</option>
            <option value="10">10 tokens</option>
            <option value="20">20 tokens</option>
            <option value="30">30 tokens</option>
            <option value="50">50+ tokens</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Available From
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md text-left"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-slate-200">
        <div className="flex-1 text-sm text-gray-600">
          <span className="font-semibold">{interviewers.length}</span> total interviewers
          {filters.specialization && (
            <span> • {filters.specialization}</span>
          )}
          {filters.maxPrice && (
            <span> • ≤ {filters.maxPrice} tokens</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClearFilters}
            className="px-8 py-3 text-sm font-semibold text-gray-700 border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
          >
            Clear All
          </button>
          <button
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Apply Filters ({interviewers.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
