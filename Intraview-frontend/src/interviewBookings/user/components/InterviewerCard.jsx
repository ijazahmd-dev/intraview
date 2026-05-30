// import React, { useState } from 'react';
// import { toast } from 'sonner';
// import { Link } from 'react-router-dom';

// const InterviewerCard = ({ interviewer, tokenBalance }) => {
//   const [loadingAvailability, setLoadingAvailability] = useState(false);

//   const tokenCost = interviewer.base_session_rate || 10;
//   const hasEnoughTokens = tokenBalance >= tokenCost;

//   const formatExperience = (years) => {
//     if (!years) return 'Experienced';
//     if (years < 1) return '0-1 year';
//     if (years === 1) return '1 year';
//     return `${years}+ years`;
//   };

//   return (
//     <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 overflow-hidden h-full">
//       {/* Profile Picture */}
//       <div className="relative mb-6">
//         <div className="w-28 h-28 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 overflow-hidden">
//           {interviewer.profile_picture ? (
//             <img
//               src={interviewer.profile_picture}
//               alt={interviewer.display_name}
//               className="w-full h-full object-cover rounded-2xl"
//             />
//           ) : (
//             <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
//             </svg>
//           )}
//         </div>
//         <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
//           <div className="bg-emerald-500 text-white px-4 py-1 rounded-2xl text-xs font-bold shadow-lg">
//             Verified
//           </div>
//         </div>
//       </div>

//       {/* Name & Experience */}
//       <div className="text-center mb-6">
//         <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
//           {interviewer.display_name}
//         </h3>
//         <div className="text-lg text-slate-600 mb-4">
//           {formatExperience(interviewer.years_of_experience)} experience
//         </div>
//         <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold">
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//           </svg>
//           Accepting Bookings Now
//         </div>
//       </div>

//       {/* Headline */}
//       <p className="text-gray-700 text-center leading-relaxed mb-8 px-4 min-h-[80px] flex items-center justify-center">
//         "{interviewer.headline}"
//       </p>

//       {/* Token Cost & CTA */}
//       <div className="space-y-4 mt-auto">
//         <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-100">
//           <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//             </svg>
//           </div>
//           <div className="text-center">
//             <div className="text-3xl font-black text-emerald-700">{tokenCost} tokens</div>
//             <div className="text-sm text-emerald-600 font-semibold">per session</div>
//           </div>
//         </div>

//         {!hasEnoughTokens && (
//           <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
//             <p className="text-amber-800 text-sm font-semibold text-center">
//               💰 Need {tokenCost} tokens to book • You have {tokenBalance}
//             </p>
//           </div>
//         )}

//         <Link
//           to={`/interviewer/${interviewer.id}`}
//           className={`w-full block text-center py-5 px-8 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${hasEnoughTokens
//               ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-2xl hover:-translate-y-1'
//               : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
//             }`}
//         >
//           {hasEnoughTokens ? (
//             <>
//               View Availability
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//               </svg>
//             </>
//           ) : (
//             'Get Tokens First'
//           )}
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default InterviewerCard;



























import React from 'react';
import { Link } from 'react-router-dom';

/* ─── Inject card styles once (module-level) ─── */
const ivcCSS = `
  /* ── Card Shell ── */
  .ivc-card {
    background: #FFFFFF;
    border: 1px solid #E4EAF0;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    transition: box-shadow 0.22s ease, transform 0.22s ease;
    position: relative;
    height: 100%;
  }

  /* 3-px teal accent line at top */
  .ivc-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1D9E75, #5DCAA5);
    z-index: 1;
  }

  .ivc-card:hover {
    box-shadow: 0 10px 36px rgba(13, 27, 42, 0.10);
    transform: translateY(-3px);
  }

  /* ── Header ── */
  .ivc-header {
    padding: 30px 24px 20px;
    display: flex;
    align-items: flex-start;
    gap: 18px;
  }

  /* Avatar */
  .ivc-avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .ivc-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(140deg, #1D9E75 0%, #0A5C47 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 3px solid #E1F5EE;
  }

  .ivc-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ivc-initial {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 26px;
    color: #FFFFFF;
    line-height: 1;
    user-select: none;
  }

  /* Verified tick on avatar */
  .ivc-verified-dot {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 20px;
    height: 20px;
    background: #1D9E75;
    border: 2.5px solid #FFFFFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Identity block */
  .ivc-identity {
    flex: 1;
    min-width: 0;
  }

  .ivc-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
  }

  .ivc-name {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    font-weight: 400;
    color: #0D1B2A;
    margin: 0;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ivc-verified-tag {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: #E1F5EE;
    color: #0F6E56;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 100px;
  }

  .ivc-exp-line {
    font-size: 13px;
    color: #6B7280;
    margin: 0 0 10px;
  }

  .ivc-accepting-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: #0F6E56;
  }

  .ivc-accepting-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #1D9E75;
    animation: ivc-pulse 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes ivc-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  /* ── Divider ── */
  .ivc-hr {
    height: 1px;
    background: #F0F4F8;
    margin: 0;
    flex-shrink: 0;
  }

  /* ── Headline / Bio ── */
  .ivc-headline {
    padding: 16px 24px;
    font-size: 13px;
    color: #6B7280;
    line-height: 1.7;
    font-style: italic;
    flex: 1;
    display: flex;
    align-items: center;
    min-height: 68px;
  }

  /* ── Stats Row ── */
  .ivc-stats {
    display: flex;
    gap: 0;
    padding: 0 20px 0;
  }

  .ivc-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 14px 8px;
    background: #F7F9FC;
    margin: 14px 4px;
    border-radius: 8px;
  }

  .ivc-stat-val {
    font-size: 14px;
    font-weight: 700;
    color: #0D1B2A;
    line-height: 1;
    margin-bottom: 3px;
  }

  .ivc-stat-lbl {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #9AA5B4;
  }

  /* ── Token warning ── */
  .ivc-warn {
    margin: 0 20px 12px;
    padding: 8px 12px;
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: 8px;
    font-size: 11.5px;
    color: #92400E;
    text-align: center;
    font-weight: 500;
  }

  /* ── Footer ── */
  .ivc-footer {
    padding: 14px 20px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #FAFBFC;
    border-top: 1px solid #F0F4F8;
    flex-shrink: 0;
  }

  .ivc-price {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .ivc-price-num {
    font-family: 'DM Serif Display', serif;
    font-size: 24px;
    color: #0D1B2A;
    display: block;
    margin-bottom: 2px;
  }

  .ivc-price-unit {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #9AA5B4;
    display: block;
  }

  /* CTA button */
  .ivc-cta {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    text-decoration: none !important;
    background: #1D9E75;
    color: #FFFFFF !important;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ivc-cta:hover {
    background: #0F6E56;
    transform: translateY(-1px);
    text-decoration: none !important;
  }

  /* Locked state when not enough tokens */
  .ivc-cta.ivc-locked {
    background: #E4EAF0 !important;
    color: #9AA5B4 !important;
    cursor: not-allowed;
    pointer-events: none;
    transform: none !important;
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('ivc-styles')) {
  const el = document.createElement('style');
  el.id = 'ivc-styles';
  el.textContent = ivcCSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────
   InterviewerCard Component
───────────────────────────────────────────── */
const InterviewerCard = ({ interviewer, tokenBalance }) => {
  const tokenCost = interviewer.base_session_rate || 10;
  const canBook = tokenBalance >= tokenCost;

  const formatExp = (yrs) => {
    if (!yrs && yrs !== 0) return 'Experienced';
    if (yrs < 1) return 'Under 1 year exp.';
    if (yrs === 1) return '1 year exp.';
    return `${yrs}+ years exp.`;
  };

  return (
    <div className="ivc-card">

      {/* ── Header: Avatar + Identity ── */}
      <div className="ivc-header">

        {/* Avatar */}
        <div className="ivc-avatar-wrap">
          <div className="ivc-avatar">
            {interviewer.profile_picture ? (
              <img src={interviewer.profile_picture} alt={interviewer.display_name} />
            ) : (
              <span className="ivc-initial">
                {interviewer.display_name?.charAt(0) ?? 'I'}
              </span>
            )}
          </div>
          <div className="ivc-verified-dot" title="Verified interviewer">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1.5,5 4,7.5 8.5,2.5" />
            </svg>
          </div>
        </div>

        {/* Identity */}
        <div className="ivc-identity">
          <div className="ivc-name-row">
            <h3 className="ivc-name">{interviewer.display_name}</h3>
            <span className="ivc-verified-tag">Verified</span>
          </div>
          <p className="ivc-exp-line">{formatExp(interviewer.years_of_experience)}</p>
          <span className="ivc-accepting-badge">
            <span className="ivc-accepting-dot" />
            Accepting Bookings
          </span>
        </div>

      </div>

      <div className="ivc-hr" />

      {/* ── Headline ── */}
      <p className="ivc-headline">
        "{interviewer.headline}"
      </p>

      <div className="ivc-hr" />

      {/* ── Stats ── */}
      <div className="ivc-stats">
        <div className="ivc-stat">
          <span className="ivc-stat-val">
            {interviewer.years_of_experience
              ? `${interviewer.years_of_experience}yr`
              : '—'}
          </span>
          <span className="ivc-stat-lbl">Experience</span>
        </div>
        <div className="ivc-stat">
          <span className="ivc-stat-val" style={{ color: '#1D9E75' }}>Active</span>
          <span className="ivc-stat-lbl">Status</span>
        </div>
        <div className="ivc-stat">
          <span className="ivc-stat-val">{tokenCost}</span>
          <span className="ivc-stat-lbl">Tokens</span>
        </div>
      </div>

      {/* ── Insufficient tokens notice ── */}
      {!canBook && (
        <div className="ivc-warn">
          Need {tokenCost} tokens · You have {tokenBalance}
        </div>
      )}

      {/* ── Footer: Price + CTA ── */}
      <div className="ivc-footer">
        <div className="ivc-price">
          <span className="ivc-price-num">{tokenCost}</span>
          <span className="ivc-price-unit">tokens / session</span>
        </div>

        <Link
          to={`/interviewer/${interviewer.id}`}
          className={`ivc-cta${!canBook ? ' ivc-locked' : ''}`}
        >
          {canBook ? (
            <>
              View Profile
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 6h9M7 2.5l4 3.5-4 3.5" />
              </svg>
            </>
          ) : (
            'Get Tokens'
          )}
        </Link>
      </div>

    </div>
  );
};

export default InterviewerCard;