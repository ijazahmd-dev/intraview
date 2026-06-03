// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { Calendar } from 'lucide-react';

// import { candidateBookingsApi } from '../../candidateBookingsApi';
// import SessionConfigModal from '../components/SessionConfigModal';
// import BookingSummaryModal from '../components/BookingSummaryModal';



// const InterviewerDetailPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // Token state
//   const [tokenBalance, setTokenBalance] = useState(0);
//   const [tokenLoading, setTokenLoading] = useState(true);

//   // Modal state — 3-step booking flow
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [sessionConfigOpen, setSessionConfigOpen] = useState(false);
//   const [summaryOpen, setSummaryOpen] = useState(false);
//   const [sessionConfig, setSessionConfig] = useState(null);

//   // Page state
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availability, setAvailability] = useState([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   const tokenCost = profile?.base_session_rate || 10;
//   const hasEnoughTokens = tokenBalance >= tokenCost;

//   // Fetch token balance
//   const fetchTokenBalance = useCallback(async () => {
//     try {
//       setTokenLoading(true);
//       const response = await candidateBookingsApi.getTokenBalance();
//       setTokenBalance(response.data.token_balance);
//     } catch (error) {
//       console.error('Token balance fetch failed:', error);
//       setTokenBalance(0);
//     } finally {
//       setTokenLoading(false);
//     }
//   }, []);

//   // Load profile and tokens
//   useEffect(() => {
//     fetchTokenBalance();
//     const fetchProfile = async () => {
//       try {
//         setLoading(true);
//         const res = await candidateBookingsApi.getInterviewerDetail(id);
//         setProfile(res.data);
//       } catch (error) {
//         toast.error(error.response?.data?.detail || 'Interviewer not available for booking');
//         navigate('/candidate/interviewers');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, [id, navigate, fetchTokenBalance]);

//   const fetchAvailability = async (date) => {
//     try {
//       setLoadingSlots(true);
//       const res = await candidateBookingsApi.getAvailability(id, date);
//       setAvailability(res.data || []);
//       if (!res.data?.length) {
//         toast.info('No available slots for this date');
//       }
//     } catch (error) {
//       toast.error('Failed to load availability');
//     } finally {
//       setLoadingSlots(false);
//     }
//   };

//   const handleDateChange = (e) => {
//     const value = e.target.value;
//     setSelectedDate(value);
//     if (value) {
//       fetchAvailability(value);
//     } else {
//       setAvailability([]);
//     }
//   };

//   // Step 1: slot chosen → open session config
//   const handleBookClick = (slot) => {
//     const slotCost = slot.token_cost || tokenCost;
//     if (tokenBalance < slotCost) {
//       toast.error('Not enough tokens to book this session');
//       return;
//     }
//     setSelectedSlot(slot);
//     setSessionConfig(null);
//     setSessionConfigOpen(true);
//   };

//   // Step 2: session config done → move to summary
//   const handleSessionConfigNext = (config) => {
//     setSessionConfig(config);
//     setSessionConfigOpen(false);
//     setSummaryOpen(true);
//   };

//   // Step 2 → back to step 1
//   const handleSummaryBack = () => {
//     setSummaryOpen(false);
//     setSessionConfigOpen(true);
//   };

//   // Reset the full flow
//   const closeAll = () => {
//     setSessionConfigOpen(false);
//     setSummaryOpen(false);
//     setSelectedSlot(null);
//     setSessionConfig(null);
//   };

//   // Step 3: confirm & create booking with session config
//   const handleConfirmBooking = async () => {
//     if (!selectedSlot) return;
//     try {
//       setBookingLoading(true);
//       const res = await candidateBookingsApi.createBooking(
//         selectedSlot.id,
//         sessionConfig || {}
//       );
//       toast.success(`Booking confirmed! ${res.data.tokens_locked} tokens locked.`);
//       closeAll();
//       navigate('/candidate/dashboard/upcoming');
//     } catch (error) {
//       const errors = error.response?.data;
//       if (errors && typeof errors === 'object') {
//         // Show field-level validation errors from backend
//         const firstKey = Object.keys(errors)[0];
//         toast.error(`${firstKey}: ${errors[firstKey]}`);
//       } else {
//         toast.error(error.response?.data?.detail || 'Failed to create booking');
//       }
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   if (loading || !profile) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
//           <p className="text-xl font-semibold text-gray-700">Loading interviewer profile…</p>
//         </div>
//       </div>
//     );
//   }

//   const {
//     display_name,
//     headline,
//     bio,
//     profile_picture,
//     years_of_experience,
//     location,
//     timezone,
//     specializations,
//     languages,
//     education,
//     certifications,
//     industries,
//     is_accepting_bookings,
//     verification_status,
//     supported_interview_types,
//     supported_experience_levels,
//   } = profile;

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
//         <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
//           {/* Top bar */}
//           <div className="flex items-center justify-between mb-8">
//             <button
//               onClick={() => navigate(-1)}
//               className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
//             >
//               <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//               </span>
//               Back to interviewers
//             </button>

//             <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700">
//               Tokens: <span className="font-bold">{tokenLoading ? '...' : tokenBalance}</span> • Cost per
//               session: <span className="font-bold">{tokenCost}</span>
//             </div>
//           </div>

//           {/* Main card */}
//           <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
//             <div className="grid lg:grid-cols-[2fr,1.6fr] gap-0">
//               {/* Left: Profile */}
//               <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
//                 <div className="flex items-start gap-6 mb-8">
//                   <div className="relative flex-shrink-0">
//                     <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-slate-800 flex items-center justify-center">
//                       {profile_picture ? (
//                         <img src={profile_picture} alt={display_name} className="w-full h-full object-cover" />
//                       ) : (
//                         <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
//                         </svg>
//                       )}
//                     </div>
//                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
//                       <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-md">
//                         {verification_status === 'APPROVED' ? 'Verified' : 'Pending'}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">{display_name}</h1>
//                     <p className="text-lg text-slate-700 mb-3">{headline}</p>
//                     <div className="flex flex-wrap gap-3 text-sm text-slate-600">
//                       {years_of_experience != null && (
//                         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08 .402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//                           </svg>
//                           {years_of_experience}+ years experience
//                         </span>
//                       )}
//                       {location && (
//                         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                           </svg>
//                           {location}
//                         </span>
//                       )}
//                       {timezone && (
//                         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                           {timezone}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Bio */}
//                 {bio && (
//                   <div className="mb-8">
//                     <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
//                     <p className="text-slate-700 leading-relaxed whitespace-pre-line">{bio}</p>
//                   </div>
//                 )}

//                 {/* Tags */}
//                 <div className="grid md:grid-cols-2 gap-6">
//                   {Array.isArray(specializations) && specializations.length > 0 && (
//                     <TagSection title="Specializations" items={specializations} />
//                   )}
//                   {Array.isArray(industries) && industries.length > 0 && (
//                     <TagSection title="Industries" items={industries} />
//                   )}
//                   {Array.isArray(languages) && languages.length > 0 && (
//                     <TagSection title="Languages" items={languages} />
//                   )}
//                   {Array.isArray(education) && education.length > 0 && (
//                     <TagSection title="Education" items={education} />
//                   )}
//                   {Array.isArray(certifications) && certifications.length > 0 && (
//                     <TagSection title="Certifications" items={certifications} />
//                   )}
//                 </div>
//               </div>

//               {/* Right: Booking panel */}
//               <div className="p-8 lg:p-10 bg-slate-50/80">
//                 <div className="mb-6">
//                   <h2 className="text-xl font-semibold text-slate-900 mb-2">Book a session</h2>
//                   <p className="text-sm text-slate-600">
//                     Pricing scales with session duration. Base rate: <span className="font-semibold">{tokenCost} tokens</span> / 30 min.
//                     Tokens are locked at booking and released after completion or cancellation.
//                   </p>
//                 </div>

//                 {!is_accepting_bookings && (
//                   <div className="p-4 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
//                     This interviewer is currently not accepting new bookings.
//                   </div>
//                 )}

//                 {/* 🔥 NEW: Calendar + List Hybrid */}
//                 <div className="space-y-6">
//                   {/* Primary CTA: Calendar View */}
//                   <div className="group">
//                     <button
//                       onClick={() => navigate(`/candidate/interviewers/${id}/calendar`)}
//                       disabled={!is_accepting_bookings || bookingLoading}
//                       className={`w-full py-5 px-6 rounded-3xl font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-4 text-lg relative overflow-hidden ${is_accepting_bookings
//                         ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'
//                         : 'bg-slate-300 text-slate-500 cursor-not-allowed'
//                         }`}
//                     >
//                       <Calendar className="w-8 h-8" />
//                       <span>📅 View Interactive Calendar</span>
//                       <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-bold ml-4 whitespace-nowrap">
//                         {tokenCost} tokens/session
//                       </span>
//                       <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300 pointer-events-none"></div>
//                     </button>
//                     <p className="mt-3 text-xs text-slate-500 text-center">
//                       See all slots at once • Auto-refreshes • Instant booking
//                     </p>
//                   </div>
//                 </div>


//                 {/* Token warning */}
//                 {!hasEnoughTokens && !tokenLoading && (
//                   <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 mb-4">
//                     Not enough tokens to book. Each session costs {tokenCost} tokens, but your balance is {tokenBalance}.
//                   </div>
//                 )}
//                 ``
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Step 1: Session Configuration ── */}
//       <SessionConfigModal
//         isOpen={sessionConfigOpen}
//         onClose={closeAll}
//         onNext={handleSessionConfigNext}
//         slot={selectedSlot}
//         profile={profile}
//       />

//       {/* ── Step 2: Booking Summary + Confirm ── */}
//       <BookingSummaryModal
//         isOpen={summaryOpen}
//         onClose={closeAll}
//         onBack={handleSummaryBack}
//         onConfirm={handleConfirmBooking}
//         loading={bookingLoading}
//         slot={selectedSlot}
//         profile={profile}
//         sessionConfig={sessionConfig}
//         tokenCost={selectedSlot?.token_cost || tokenCost}
//         tokenBalance={tokenBalance}
//       />
//     </>
//   );
// };

// const TagSection = ({ title, items }) => (
//   <div>
//     <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
//     <div className="flex flex-wrap gap-2">
//       {items.map((item, index) => (
//         <span
//           key={item}
//           className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200"
//         >
//           {item}
//         </span>
//       ))}
//     </div>
//   </div>
// );

// export default InterviewerDetailPage;





















import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';

import { candidateBookingsApi } from '../../candidateBookingsApi';
import SessionConfigModal from '../components/SessionConfigModal';
import BookingSummaryModal from '../components/BookingSummaryModal';

/* ─── Brand palette ─────────────────────────────────────────────────────── */
const C = {
  teal: '#0BB5A0',
  tealHover: '#099688',
  tealLight: '#E8F8F6',
  tealMid: '#B2E8E3',
  navy: '#111827',
  navyMid: '#1F2937',
  yellow: '#F5C518',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  border: '#E5E7EB',
  borderSoft: '#F0F0F0',
  text: '#111827',
  textMid: '#4B5563',
  textLight: '#9CA3AF',
  rose: '#EF4444',
  roseLight: '#FEF2F2',
  roseBorder: '#FECACA',
  amberLight: '#FFFBEB',
  amberBorder: '#FDE68A',
};

/* ─── Tiny reusable atoms ───────────────────────────────────────────────── */
const Tag = ({ label, accent }) => (
  <span style={{
    display: 'inline-block',
    padding: '4px 12px', borderRadius: 999,
    background: accent ? C.tealLight : C.bg,
    border: `1px solid ${accent ? C.tealMid : C.border}`,
    color: accent ? C.tealHover : C.navyMid,
    fontSize: 12, fontWeight: 500,
  }}>{label}</span>
);

const InfoRow = ({ icon, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ color: C.teal, display: 'flex', flexShrink: 0 }}>{icon}</span>
    <span style={{ fontSize: 13, color: C.textMid }}>{value}</span>
  </div>
);

const Alert = ({ type, children }) => {
  const cfg = {
    amber: { bg: C.amberLight, border: C.amberBorder, color: '#92400E' },
    rose: { bg: C.roseLight, border: C.roseBorder, color: '#9F1239' },
  }[type];
  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 10, padding: '10px 14px',
      fontSize: 12.5, color: cfg.color, fontWeight: 500,
    }}>{children}</div>
  );
};

const SvgIcon = ({ d, size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

/* ─── Main ──────────────────────────────────────────────────────────────── */
const InterviewerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionConfigOpen, setSessionConfigOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [sessionConfig, setSessionConfig] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const tokenCost = profile?.base_session_rate || 10;
  const hasEnoughTokens = tokenBalance >= tokenCost;

  const fetchTokenBalance = useCallback(async () => {
    try {
      setTokenLoading(true);
      const r = await candidateBookingsApi.getTokenBalance();
      setTokenBalance(r.data.token_balance);
    } catch { setTokenBalance(0); }
    finally { setTokenLoading(false); }
  }, []);

  useEffect(() => {
    fetchTokenBalance();
    (async () => {
      try {
        setLoading(true);
        const r = await candidateBookingsApi.getInterviewerDetail(id);
        setProfile(r.data);
      } catch (e) {
        toast.error(e.response?.data?.detail || 'Interviewer not available');
        navigate('/candidate/interviewers');
      } finally { setLoading(false); }
    })();
  }, [id, navigate, fetchTokenBalance]);

  const closeAll = () => {
    setSessionConfigOpen(false); setSummaryOpen(false);
    setSelectedSlot(null); setSessionConfig(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    try {
      setBookingLoading(true);
      const r = await candidateBookingsApi.createBooking(selectedSlot.id, sessionConfig || {});
      toast.success(`Booking confirmed! ${r.data.tokens_locked} tokens locked.`);
      closeAll();
      navigate('/candidate/dashboard/upcoming');
    } catch (e) {
      const err = e.response?.data;
      if (err && typeof err === 'object') { const k = Object.keys(err)[0]; toast.error(`${k}: ${err[k]}`); }
      else toast.error(e.response?.data?.detail || 'Failed to create booking');
    } finally { setBookingLoading(false); }
  };

  /* ── Loading ── */
  if (loading || !profile) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.teal, animation: 'spin .7s linear infinite' }} />
      <p style={{ color: C.textMid, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading profile…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const {
    display_name, headline, bio, profile_picture,
    years_of_experience, location, timezone,
    specializations, languages, education, certifications,
    industries, is_accepting_bookings, verification_status,
    supported_interview_types, supported_experience_levels,
  } = profile;

  const isVerified = verification_status === 'APPROVED';

  const tabs = [
    { key: 'about', label: 'About' },
    { key: 'skills', label: 'Skills & Expertise' },
    { key: 'booking', label: 'Book a Session' },
  ];

  /* initials for avatar fallback */
  const initials = (display_name || 'IN').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .iv-page{font-family:'Inter',sans-serif;min-height:100vh;background:${C.bg}}
        .iv-back:hover{border-color:${C.teal}!important;color:${C.teal}!important}
        .iv-tab-btn{background:none;border:none;cursor:pointer;font-family:inherit;transition:all .15s}
        .iv-tab-btn:hover{color:${C.navy}!important}
        .iv-book-btn:hover:not(:disabled){background:${C.tealHover}!important;transform:translateY(-1px);box-shadow:0 6px 20px rgba(11,181,160,.3)!important}
        .iv-book-btn:disabled{background:#D1D5DB!important;color:#9CA3AF!important;cursor:not-allowed}
        .iv-section{animation:fadeUp .25s ease}
      `}</style>

      <div className="iv-page">

        {/* ══════════════════════════════════════════════════
            HERO BANNER — full-width teal-to-navy strip
        ══════════════════════════════════════════════════ */}
        <div style={{
          background: C.navy,
          padding: '0 0 0 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle geometric accent */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 260, height: 260, borderRadius: '50%',
            background: C.teal, opacity: 0.07, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: '40%',
            width: 180, height: 180, borderRadius: '50%',
            background: C.yellow, opacity: 0.05, pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px 0' }}>

            {/* Back + token bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 10 }}>
              <button
                className="iv-back"
                onClick={() => navigate(-1)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.15)',
                  borderRadius: 10, padding: '7px 14px',
                  fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.7)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color .15s, color .15s',
                }}
              >
                <SvgIcon d="M15 19l-7-7 7-7" size={14} />
                Back to Interviewers
              </button>

              {/* Token pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 0,
                background: 'rgba(255,255,255,.07)',
                border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 10, overflow: 'hidden',
                fontSize: 12.5, fontWeight: 600,
              }}>
                <div style={{ padding: '7px 14px', color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" fill="none" stroke={C.teal} strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4l3 2" />
                  </svg>
                  Balance:&nbsp;<strong style={{ color: C.white }}>{tokenLoading ? '—' : tokenBalance}</strong>
                </div>
                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,.12)' }} />
                <div style={{ padding: '7px 14px', color: 'rgba(255,255,255,.6)' }}>
                  Cost:&nbsp;<strong style={{ color: C.yellow }}>{tokenCost}</strong>
                </div>
              </div>
            </div>

            {/* Profile hero row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>

              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: 18,
                  overflow: 'hidden',
                  border: `3px solid rgba(255,255,255,.15)`,
                  background: C.navyMid,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {profile_picture
                    ? <img src={profile_picture} alt={display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28, fontWeight: 800, color: C.teal, letterSpacing: '-0.02em' }}>{initials}</span>
                  }
                </div>
                {/* Verified badge */}
                <div style={{
                  position: 'absolute', bottom: -6, right: -6,
                  background: isVerified ? C.teal : '#F59E0B',
                  border: `2px solid ${C.navy}`,
                  borderRadius: '50%', width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="11" height="11" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                    {isVerified
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01" />}
                  </svg>
                </div>
              </div>

              {/* Name + headline + meta chips */}
              <div style={{ flex: 1, minWidth: 240, paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: C.white, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                    {display_name}
                  </h1>
                  {isVerified && (
                    <span style={{
                      background: C.tealLight, color: C.tealHover,
                      border: `1px solid ${C.tealMid}`,
                      padding: '2px 9px', borderRadius: 999,
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Verified
                    </span>
                  )}
                  {!is_accepting_bookings && (
                    <span style={{
                      background: 'rgba(245,197,24,.12)',
                      border: '1px solid rgba(245,197,24,.3)',
                      color: C.yellow,
                      padding: '2px 9px', borderRadius: 999,
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Unavailable
                    </span>
                  )}
                </div>
                {headline && (
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', margin: '0 0 14px', lineHeight: 1.5 }}>{headline}</p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {years_of_experience != null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,.5)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 999, padding: '3px 11px' }}>
                      <SvgIcon d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" size={12} />
                      {years_of_experience}+ yrs experience
                    </span>
                  )}
                  {location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,.5)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 999, padding: '3px 11px' }}>
                      <SvgIcon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" size={12} />
                      {location}
                    </span>
                  )}
                  {timezone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,.5)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 999, padding: '3px 11px' }}>
                      <SvgIcon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={12} />
                      {timezone}
                    </span>
                  )}
                </div>
              </div>

              {/* Stat pills — right side */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 4, flexWrap: 'wrap' }}>
                {[
                  { n: years_of_experience != null ? `${years_of_experience}+` : '—', label: 'Yrs Exp' },
                  { n: Array.isArray(specializations) ? specializations.length : 0, label: 'Skills' },
                  { n: Array.isArray(supported_interview_types) ? supported_interview_types.length : 0, label: 'Types' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: i === 0 ? 'rgba(11,181,160,.15)' : 'rgba(255,255,255,.06)',
                    border: `1px solid ${i === 0 ? 'rgba(11,181,160,.35)' : 'rgba(255,255,255,.1)'}`,
                    borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 64,
                  }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: i === 0 ? C.teal : C.white, margin: 0, lineHeight: 1 }}>{s.n}</p>
                    <p style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tab Bar (attached to bottom of hero) ── */}
            <div style={{ display: 'flex', gap: 0, marginTop: 28 }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className="iv-tab-btn"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '14px 24px',
                    fontSize: 13.5, fontWeight: 600,
                    color: activeTab === tab.key ? C.teal : 'rgba(255,255,255,.45)',
                    borderBottom: activeTab === tab.key ? `2px solid ${C.teal}` : '2px solid transparent',
                    position: 'relative',
                  }}
                >
                  {tab.label}
                  {tab.key === 'booking' && (
                    <span style={{
                      marginLeft: 6,
                      background: C.teal, color: C.white,
                      borderRadius: 999, fontSize: 10, fontWeight: 700,
                      padding: '1px 6px', verticalAlign: 'middle',
                    }}>
                      {tokenCost}T
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            BODY — tab content area
        ══════════════════════════════════════════════════ */}
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px 80px' }}>

          {/* ─── TAB: ABOUT ─── */}
          {activeTab === 'about' && (
            <div className="iv-section">
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 24 }}
                className="iv-about-grid">
                <style>{`.iv-about-grid{@media(max-width:700px){grid-template-columns:1fr!important}}`}</style>

                {/* Bio card */}
                <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px 28px' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 3, height: 16, background: C.teal, borderRadius: 2, display: 'inline-block' }} />
                    About
                  </h2>
                  {bio
                    ? <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{bio}</p>
                    : <p style={{ fontSize: 14, color: C.textLight, margin: 0, fontStyle: 'italic' }}>No bio provided.</p>
                  }
                </div>

                {/* Quick info card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Details card */}
                  <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '22px 24px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Quick Info</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                      {years_of_experience != null && <InfoRow icon={<SvgIcon d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />} value={`${years_of_experience}+ years of experience`} />}
                      {location && <InfoRow icon={<SvgIcon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />} value={location} />}
                      {timezone && <InfoRow icon={<SvgIcon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />} value={timezone} />}
                      {Array.isArray(languages) && languages.length > 0 && (
                        <InfoRow icon={<SvgIcon d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />} value={languages.join(' · ')} />
                      )}
                    </div>
                  </div>

                  {/* Status card */}
                  <div style={{
                    background: is_accepting_bookings ? C.tealLight : C.amberLight,
                    border: `1px solid ${is_accepting_bookings ? C.tealMid : C.amberBorder}`,
                    borderRadius: 16, padding: '18px 22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: is_accepting_bookings ? C.tealHover : '#92400E', margin: '0 0 3px' }}>
                        Booking Status
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: is_accepting_bookings ? C.navy : '#78350F', margin: 0 }}>
                        {is_accepting_bookings ? 'Accepting Bookings' : 'Not Available'}
                      </p>
                    </div>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: is_accepting_bookings ? C.teal : '#F59E0B',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                        {is_accepting_bookings
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M5.07 19H19a2 2 0 001.75-2.96L13.75 4a2 2 0 00-3.5 0L3.25 16A2 2 0 005.07 19z" />}
                      </svg>
                    </div>
                  </div>

                  {/* CTA shortcut */}
                  {is_accepting_bookings && (
                    <button
                      onClick={() => setActiveTab('booking')}
                      style={{
                        width: '100%', padding: '13px',
                        background: C.navy, color: C.white,
                        border: 'none', borderRadius: 12,
                        fontSize: 13.5, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.navyMid}
                      onMouseLeave={e => e.currentTarget.style.background = C.navy}
                    >
                      <Calendar size={16} />
                      Book a Session →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: SKILLS ─── */}
          {activeTab === 'skills' && (
            <div className="iv-section">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
                {[
                  { title: 'Specializations', items: specializations, accent: true },
                  { title: 'Interview Types', items: supported_interview_types, accent: true },
                  { title: 'Experience Levels', items: supported_experience_levels, accent: false },
                  { title: 'Industries', items: industries, accent: false },
                  { title: 'Languages', items: languages, accent: false },
                  { title: 'Education', items: education, accent: false },
                  { title: 'Certifications', items: certifications, accent: false },
                ].filter(s => Array.isArray(s.items) && s.items.length > 0).map(section => (
                  <div key={section.title} style={{
                    background: C.white, borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    padding: '20px 22px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                      <span style={{ width: 3, height: 13, background: section.accent ? C.teal : C.textLight, borderRadius: 2, flexShrink: 0 }} />
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                        {section.title}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {section.items.map(item => <Tag key={item} label={item} accent={section.accent} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB: BOOKING ─── */}
          {activeTab === 'booking' && (
            <div className="iv-section">
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}
                className="iv-book-grid">
                <style>{`.iv-book-grid{@media(max-width:680px){grid-template-columns:1fr!important}}`}</style>

                {/* Left col: main CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Token balance card — yellow accent */}
                  <div style={{
                    background: C.navy, borderRadius: 16,
                    padding: '22px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,.4)', margin: '0 0 4px' }}>Your Balance</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: hasEnoughTokens ? C.yellow : C.rose, margin: 0, lineHeight: 1 }}>
                        {tokenLoading ? '—' : tokenBalance}
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginLeft: 6 }}>tokens</span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,.4)', margin: '0 0 4px' }}>Session Cost</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: C.teal, margin: 0, lineHeight: 1 }}>
                        {tokenCost}
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginLeft: 5 }}>tokens</span>
                      </p>
                    </div>
                  </div>

                  {/* Alerts */}
                  {!is_accepting_bookings && <Alert type="amber">This interviewer is not currently accepting new bookings.</Alert>}
                  {!hasEnoughTokens && !tokenLoading && <Alert type="rose">Insufficient tokens. You need {tokenCost} but have {tokenBalance}. Please top up your balance.</Alert>}

                  {/* Primary CTA */}
                  <button
                    className="iv-book-btn"
                    onClick={() => navigate(`/candidate/interviewers/${id}/calendar`)}
                    disabled={!is_accepting_bookings || bookingLoading}
                    style={{
                      width: '100%', padding: '17px 20px',
                      borderRadius: 14, border: 'none',
                      background: C.teal, color: C.white,
                      fontSize: 15, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: '0 4px 18px rgba(11,181,160,.22)',
                      transition: 'all .18s',
                      letterSpacing: '.01em',
                    }}
                  >
                    <Calendar size={18} />
                    View Available Slots
                    <span style={{ background: 'rgba(255,255,255,.18)', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      {tokenCost} tokens
                    </span>
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 11.5, color: C.textLight, margin: '-4px 0 0' }}>
                    See all slots · Auto-refreshes · Instant booking
                  </p>
                </div>

                {/* Right col: info cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textLight, margin: '0 0 4px' }}>Session Details</p>
                  {[
                    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', label: 'Token Cost', value: `${tokenCost} tokens / 30 min` },
                    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Token Policy', value: 'Locked at booking, released post-session' },
                    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Cancellation', value: 'Free cancellation up to 24h before' },
                    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Session Format', value: 'Live video · Real-time feedback' },
                  ].map(row => (
                    <div key={row.label} style={{
                      background: C.white, border: `1px solid ${C.border}`,
                      borderRadius: 12, padding: '13px 16px',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: C.tealLight,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: C.teal,
                      }}>
                        <SvgIcon d={row.icon} size={15} />
                      </span>
                      <div>
                        <p style={{ fontSize: 10.5, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>{row.label}</p>
                        <p style={{ fontSize: 12.5, color: C.navy, fontWeight: 500, margin: 0 }}>{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SessionConfigModal
        isOpen={sessionConfigOpen}
        onClose={closeAll}
        onNext={(cfg) => { setSessionConfig(cfg); setSessionConfigOpen(false); setSummaryOpen(true); }}
        slot={selectedSlot}
        profile={profile}
      />
      <BookingSummaryModal
        isOpen={summaryOpen}
        onClose={closeAll}
        onBack={() => { setSummaryOpen(false); setSessionConfigOpen(true); }}
        onConfirm={handleConfirmBooking}
        loading={bookingLoading}
        slot={selectedSlot}
        profile={profile}
        sessionConfig={sessionConfig}
        tokenCost={selectedSlot?.token_cost || tokenCost}
        tokenBalance={tokenBalance}
      />
    </>
  );
};

export default InterviewerDetailPage;