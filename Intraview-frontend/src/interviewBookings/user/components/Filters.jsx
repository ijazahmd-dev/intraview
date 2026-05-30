// import React from 'react';

// const Filters = ({ filters, onFilterChange, onClearFilters, interviewers }) => {
//   const specializations = Array.from(
//     new Set(interviewers.map(i => i.headline?.split(',')[0]?.trim() || ''))
//   ).filter(Boolean).slice(0, 8);

//   const handleFilterChange = (key, value) => {
//     onFilterChange({ ...filters, [key]: value });
//   };

//   return (
//     <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 lg:p-12">
//       <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
//         {/* Specialization */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
//             Specialization
//           </label>
//           <select
//             value={filters.specialization}
//             onChange={(e) => handleFilterChange('specialization', e.target.value)}
//             className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
//           >
//             <option value="">All Specializations</option>
//             {specializations.map((spec) => (
//               <option key={spec} value={spec}>{spec}</option>
//             ))}
//           </select>
//         </div>

//         {/* Price */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
//             Max Price (tokens)
//           </label>
//           <select
//             value={filters.maxPrice}
//             onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
//             className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
//           >
//             <option value="">Any Price</option>
//             <option value="10">10 tokens</option>
//             <option value="20">20 tokens</option>
//             <option value="30">30 tokens</option>
//             <option value="50">50+ tokens</option>
//           </select>
//         </div>

//         {/* Date */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
//             Available From
//           </label>
//           <input
//             type="date"
//             value={filters.date}
//             onChange={(e) => handleFilterChange('date', e.target.value)}
//             className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md text-left"
//           />
//         </div>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-slate-200">
//         <div className="flex-1 text-sm text-gray-600">
//           <span className="font-semibold">{interviewers.length}</span> total interviewers
//           {filters.specialization && (
//             <span> • {filters.specialization}</span>
//           )}
//           {filters.maxPrice && (
//             <span> • ≤ {filters.maxPrice} tokens</span>
//           )}
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={onClearFilters}
//             className="px-8 py-3 text-sm font-semibold text-gray-700 border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
//           >
//             Clear All
//           </button>
//           <button
//             className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
//           >
//             Apply Filters ({interviewers.length})
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Filters;































import React from 'react';

/* ─── Inject styles once (module-level) ─── */
const ivfCSS = `
  .ivf-bar {
    background: #FFFFFF;
    border: 1px solid #E4EAF0;
    border-top: 3px solid #1D9E75;
    border-radius: 12px;
    padding: 22px 28px 20px;
    width: 100%;
    box-sizing: border-box;
    font-family: 'DM Sans', sans-serif;
  }

  .ivf-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #1D9E75;
    margin-bottom: 16px;
  }

  .ivf-head-count {
    margin-left: auto;
    font-weight: 400;
    color: #9AA5B4;
    font-size: 11px;
    text-transform: none;
    letter-spacing: 0;
  }

  .ivf-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 16px;
    align-items: end;
  }

  .ivf-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ivf-lbl {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #4A5568;
  }

  .ivf-field-wrap {
    position: relative;
  }

  .ivf-select-wrap::after {
    content: '';
    position: absolute;
    right: 13px;
    top: 50%;
    transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid #9AA5B4;
    pointer-events: none;
  }

  .ivf-select,
  .ivf-input {
    width: 100%;
    height: 42px;
    box-sizing: border-box;
    background: #F7F9FC;
    border: 1.5px solid #E4EAF0;
    border-radius: 8px;
    padding: 0 36px 0 13px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #0D1B2A;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
    cursor: pointer;
  }

  .ivf-input {
    padding: 0 13px;
    cursor: default;
  }

  .ivf-select:focus,
  .ivf-input:focus {
    border-color: #1D9E75;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.12);
  }

  .ivf-select option {
    color: #0D1B2A;
  }

  /* Action buttons */
  .ivf-actions {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .ivf-btn-search {
    height: 42px;
    background: #1D9E75;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    padding: 0 22px;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }

  .ivf-btn-search:hover { background: #0F6E56; }

  .ivf-btn-reset {
    height: 42px;
    background: transparent;
    color: #6B7280;
    border: 1.5px solid #E4EAF0;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    padding: 0 16px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .ivf-btn-reset:hover {
    border-color: #9AA5B4;
    color: #0D1B2A;
    background: #F7F9FC;
  }

  /* Active filters summary */
  .ivf-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
    padding-top: 13px;
    border-top: 1px solid #F0F4F8;
    font-size: 11.5px;
    color: #9AA5B4;
  }

  .ivf-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #E1F5EE;
    color: #0F6E56;
    font-size: 11.5px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .ivf-row {
      grid-template-columns: 1fr 1fr;
    }
    .ivf-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }
  }

  @media (max-width: 580px) {
    .ivf-bar { padding: 18px 16px 16px; }
    .ivf-row { grid-template-columns: 1fr; }
    .ivf-actions {
      grid-column: unset;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .ivf-btn-search,
    .ivf-btn-reset { justify-content: center; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('ivf-styles')) {
  const el = document.createElement('style');
  el.id = 'ivf-styles';
  el.textContent = ivfCSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────
   Filters Component
───────────────────────────────────────────── */
const Filters = ({ filters, onFilterChange, onClearFilters, interviewers }) => {
  const specializations = Array.from(
    new Set(interviewers.map(i => i.headline?.split(',')[0]?.trim() || ''))
  ).filter(Boolean).slice(0, 8);

  const handle = (key, val) => onFilterChange({ ...filters, [key]: val });

  const hasActive = filters.specialization || filters.maxPrice || filters.date;
  const total = interviewers.length;

  return (
    <div className="ivf-bar">

      {/* ── Heading ── */}
      <div className="ivf-head">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M1 2.5h11M2.5 6.5h8M4.5 10.5h4" strokeLinecap="round" />
        </svg>
        Refine Your Search
        <span className="ivf-head-count">
          {total} interviewer{total !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* ── Filter Row ── */}
      <div className="ivf-row">

        {/* Specialization */}
        <div className="ivf-group">
          <label className="ivf-lbl">Specialization</label>
          <div className="ivf-field-wrap ivf-select-wrap">
            <select
              className="ivf-select"
              value={filters.specialization}
              onChange={e => handle('specialization', e.target.value)}
            >
              <option value="">All specializations</option>
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Max Price */}
        <div className="ivf-group">
          <label className="ivf-lbl">Max Price (tokens)</label>
          <div className="ivf-field-wrap ivf-select-wrap">
            <select
              className="ivf-select"
              value={filters.maxPrice}
              onChange={e => handle('maxPrice', e.target.value)}
            >
              <option value="">Any price</option>
              <option value="10">Up to 10 tokens</option>
              <option value="20">Up to 20 tokens</option>
              <option value="30">Up to 30 tokens</option>
              <option value="50">Up to 50 tokens</option>
            </select>
          </div>
        </div>

        {/* Date */}
        <div className="ivf-group">
          <label className="ivf-lbl">Available From</label>
          <div className="ivf-field-wrap">
            <input
              type="date"
              className="ivf-input"
              value={filters.date}
              onChange={e => handle('date', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ivf-actions">
          <button className="ivf-btn-reset" onClick={onClearFilters}>
            Reset
          </button>
          <button className="ivf-btn-search">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="5.5" cy="5.5" r="4" />
              <path d="M9.5 9.5l2.5 2.5" />
            </svg>
            Search
          </button>
        </div>

      </div>

      {/* ── Active filter summary ── */}
      {hasActive && (
        <div className="ivf-meta">
          Active:
          {filters.specialization && (
            <span className="ivf-pill">{filters.specialization}</span>
          )}
          {filters.maxPrice && (
            <span className="ivf-pill">≤ {filters.maxPrice} tokens</span>
          )}
          {filters.date && (
            <span className="ivf-pill">From {filters.date}</span>
          )}
        </div>
      )}

    </div>
  );
};

export default Filters;