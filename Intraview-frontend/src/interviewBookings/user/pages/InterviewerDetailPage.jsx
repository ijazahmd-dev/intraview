// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { toast } from 'sonner';
// import { candidateBookingsApi } from '../../candidateBookingsApi';

// const TOKEN_COST = 10;

// const InterviewerDetailPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availability, setAvailability] = useState([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   const tokenBalance = useSelector(
//     (state) => state.auth?.user?.token_balance || 0
//   );

//   const hasEnoughTokens = tokenBalance >= TOKEN_COST;

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         setLoading(true);
//         const res = await candidateBookingsApi.getInterviewerDetail(id);
//         setProfile(res.data);
//       } catch (error) {
//         toast.error(
//           error.response?.data?.detail || 'Interviewer not available for booking'
//         );
//         navigate('/candidate/interviewers');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [id, navigate]);

//   const fetchAvailability = async (date) => {
//     try {
//       setLoadingSlots(true);
//       const res = await candidateBookingsApi.getAvailability(id, date);
//       setAvailability(res.data || []);
//       if (!res.data || res.data.length === 0) {
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

//   const handleBook = async (slotId) => {
//     if (!hasEnoughTokens) {
//       toast.error('Not enough tokens to book this session');
//       return;
//     }

//     const confirmed = window.confirm(
//       `This will lock ${TOKEN_COST} tokens for this interview. Continue?`
//     );
//     if (!confirmed) return;

//     try {
//       setBookingLoading(true);
//       const res = await candidateBookingsApi.createBooking(slotId);
//       toast.success(
//         `Booking confirmed. ${res.data.tokens_locked} tokens locked.`
//       );
//       navigate('/candidate/dashboard/upcoming');
//     } catch (error) {
//       toast.error(
//         error.response?.data?.detail || 'Failed to create booking'
//       );
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   if (loading || !profile) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
//           <p className="text-xl font-semibold text-gray-700">
//             Loading interviewer profile…
//           </p>
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
//   } = profile;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
//       <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
//         {/* Top bar */}
//         <div className="flex items-center justify-between mb-8">
//           <button
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
//           >
//             <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 19l-7-7 7-7"
//                 />
//               </svg>
//             </span>
//             Back to interviewers
//           </button>

//           <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700">
//             Tokens: <span className="font-bold">{tokenBalance}</span> • Cost per
//             session: <span className="font-bold">{TOKEN_COST}</span>
//           </div>
//         </div>

//         {/* Main card */}
//         <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
//           <div className="grid lg:grid-cols-[2fr,1.6fr] gap-0">
//             {/* Left: Profile */}
//             <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
//               <div className="flex items-start gap-6 mb-8">
//                 <div className="relative">
//                   <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-slate-800 flex items-center justify-center">
//                     {profile_picture ? (
//                       <img
//                         src={profile_picture}
//                         alt={display_name}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <svg
//                         className="w-16 h-16 text-white"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={1.5}
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
//                     <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-md">
//                       {verification_status === 'APPROVED'
//                         ? 'Verified'
//                         : 'Pending'}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex-1">
//                   <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
//                     {display_name}
//                   </h1>
//                   <p className="text-lg text-slate-700 mb-3">{headline}</p>
//                   <div className="flex flex-wrap gap-3 text-sm text-slate-600">
//                     {years_of_experience != null && (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
//                           />
//                         </svg>
//                         {years_of_experience}+ years experience
//                       </span>
//                     )}
//                     {location && (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 11c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z"
//                           />
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 22s7-4.686 7-11a7 7 0 10-14 0c0 6.314 7 11 7 11z"
//                           />
//                         </svg>
//                         {location}
//                       </span>
//                     )}
//                     {timezone && (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                           />
//                         </svg>
//                         {timezone}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Bio */}
//               {bio && (
//                 <div className="mb-8">
//                   <h2 className="text-lg font-semibold text-slate-900 mb-3">
//                     About
//                   </h2>
//                   <p className="text-slate-700 leading-relaxed whitespace-pre-line">
//                     {bio}
//                   </p>
//                 </div>
//               )}

//               {/* Tags */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 {Array.isArray(specializations) && specializations.length > 0 && (
//                   <TagSection title="Specializations" items={specializations} />
//                 )}
//                 {Array.isArray(industries) && industries.length > 0 && (
//                   <TagSection title="Industries" items={industries} />
//                 )}
//                 {Array.isArray(languages) && languages.length > 0 && (
//                   <TagSection title="Languages" items={languages} />
//                 )}
//                 {Array.isArray(education) && education.length > 0 && (
//                   <TagSection title="Education" items={education} />
//                 )}
//                 {Array.isArray(certifications) &&
//                   certifications.length > 0 && (
//                     <TagSection
//                       title="Certifications"
//                       items={certifications}
//                     />
//                   )}
//               </div>
//             </div>

//             {/* Right: Booking panel */}
//             <div className="p-8 lg:p-10 bg-slate-50/80">
//               <div className="mb-6">
//                 <h2 className="text-xl font-semibold text-slate-900 mb-2">
//                   Book a session
//                 </h2>
//                 <p className="text-sm text-slate-600">
//                   Each session costs{' '}
//                   <span className="font-semibold">{TOKEN_COST} tokens</span>. Your
//                   tokens are locked at booking and released after completion or
//                   cancellation (as per policy).
//                 </p>
//               </div>

//               {!is_accepting_bookings && (
//                 <div className="p-4 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
//                   This interviewer is currently not accepting new bookings.
//                 </div>
//               )}

//               {/* Date picker */}
//               <div className="mb-6">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Choose a date
//                 </label>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={handleDateChange}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
//                 />
//                 {timezone && (
//                   <p className="mt-2 text-xs text-slate-500">
//                     Times shown in interviewer&apos;s timezone: {timezone}
//                   </p>
//                 )}
//               </div>

//               {/* Slots */}
//               <div className="mb-6">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-semibold text-slate-800">
//                     Available slots
//                   </h3>
//                   {loadingSlots && (
//                     <span className="text-xs text-slate-500">
//                       Loading slots…
//                     </span>
//                   )}
//                 </div>

//                 <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
//                   {selectedDate && availability.length === 0 && !loadingSlots && (
//                     <div className="text-sm text-slate-500">
//                       No slots available for this date.
//                     </div>
//                   )}

//                   {!selectedDate && (
//                     <div className="text-sm text-slate-500">
//                       Select a date to see available slots.
//                     </div>
//                   )}

//                   {availability.map((slot) => (
//                     <button
//                       key={slot.id}
//                       onClick={() => handleBook(slot.id)}
//                       disabled={
//                         !hasEnoughTokens ||
//                         !is_accepting_bookings ||
//                         bookingLoading
//                       }
//                       className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-medium transition-all duration-200 ${
//                         hasEnoughTokens && is_accepting_bookings
//                           ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-800'
//                           : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
//                       }`}
//                     >
//                       <span>
//                         {slot.start_time} – {slot.end_time}
//                       </span>
//                       <span className="inline-flex items-center gap-1">
//                         <span className="text-xs font-semibold">
//                           Book • {TOKEN_COST}
//                         </span>
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M17 8l4 4m0 0l-4 4m4-4H3"
//                           />
//                         </svg>
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Token warning */}
//               {!hasEnoughTokens && (
//                 <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 mb-4">
//                   Not enough tokens to book. Each session costs {TOKEN_COST}{' '}
//                   tokens, but your balance is {tokenBalance}.
//                 </div>
//               )}

//               <p className="text-xs text-slate-500">
//                 By booking, you agree to the platform&apos;s session and
//                 cancellation policy. Tokens are handled automatically based on
//                 session status.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TagSection = ({ title, items }) => (
//   <div>
//     <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
//     <div className="flex flex-wrap gap-2">
//       {items.map((item) => (
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



















// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { candidateBookingsApi } from '../../candidateBookingsApi';

// const TOKEN_COST = 10;

// const InterviewerDetailPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   // 🔥 TOKEN STATE (like BrowseInterviewers)
//   const [tokenBalance, setTokenBalance] = useState(0);
//   const [tokenLoading, setTokenLoading] = useState(true);
  
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availability, setAvailability] = useState([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   const hasEnoughTokens = tokenBalance >= TOKEN_COST;

//   // 🔥 DEDICATED TOKEN FETCH (same as BrowseInterviewers)
//   const fetchTokenBalance = useCallback(async () => {
//     try {
//       setTokenLoading(true);
//       const response = await candidateBookingsApi.getTokenBalance();
//       setTokenBalance(response.data.token_balance);
//     } catch (error) {
//       console.error('Token balance fetch failed:', error);
//       toast.error('Failed to load token balance');
//       setTokenBalance(0);
//     } finally {
//       setTokenLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         setLoading(true);
//         const res = await candidateBookingsApi.getInterviewerDetail(id);
//         setProfile(res.data);
//       } catch (error) {
//         toast.error(
//           error.response?.data?.detail || 'Interviewer not available for booking'
//         );
//         navigate('/candidate/interviewers');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//     fetchTokenBalance(); // 🔥 LOAD TOKENS ON MOUNT
//   }, [id, navigate, fetchTokenBalance]);

//   const fetchAvailability = async (date) => {
//     try {
//       setLoadingSlots(true);
//       const res = await candidateBookingsApi.getAvailability(id, date);
//       setAvailability(res.data || []);
//       if (!res.data || res.data.length === 0) {
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

//   const handleBook = async (slotId) => {
//     if (!hasEnoughTokens) {
//       toast.error('Not enough tokens to book this session');
//       return;
//     }

//     const confirmed = window.confirm(
//       `This will lock ${TOKEN_COST} tokens for this interview. Continue?`
//     );
//     if (!confirmed) return;

//     try {
//       setBookingLoading(true);
//       const res = await candidateBookingsApi.createBooking(slotId);
//       toast.success(
//         `Booking confirmed. ${res.data.tokens_locked} tokens locked.`
//       );
//       navigate('/candidate/dashboard/upcoming');
//     } catch (error) {
//       toast.error(
//         error.response?.data?.detail || 'Failed to create booking'
//       );
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   if (loading || !profile) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
//           <p className="text-xl font-semibold text-gray-700">
//             Loading interviewer profile…
//           </p>
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
//   } = profile;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
//       <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
//         {/* Top bar */}
//         <div className="flex items-center justify-between mb-8">
//           <button
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
//           >
//             <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 19l-7-7 7-7"
//                 />
//               </svg>
//             </span>
//             Back to interviewers
//           </button>

//           {/* 🔥 FIXED TOKEN DISPLAY */}
//           <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700">
//             Tokens: <span className="font-bold">{tokenLoading ? '...' : tokenBalance}</span> • Cost per
//             session: <span className="font-bold">{TOKEN_COST}</span>
//           </div>
//         </div>

//         {/* Main card */}
//         <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
//           <div className="grid lg:grid-cols-[2fr,1.6fr] gap-0">
//             {/* Left: Profile */}
//             <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
//               <div className="flex items-start gap-6 mb-8">
//                 <div className="relative">
//                   <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-slate-800 flex items-center justify-center">
//                     {profile_picture ? (
//                       <img
//                         src={profile_picture}
//                         alt={display_name}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <svg
//                         className="w-16 h-16 text-white"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={1.5}
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
//                     <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-md">
//                       {verification_status === 'APPROVED'
//                         ? 'Verified'
//                         : 'Pending'}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex-1">
//                   <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
//                     {display_name}
//                   </h1>
//                   <p className="text-lg text-slate-700 mb-3">{headline}</p>
//                   <div className="flex flex-wrap gap-3 text-sm text-slate-600">
//                     {years_of_experience != null && (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//                         </svg>
//                         {years_of_experience}+ years experience
//                       </span>
//                     )}
//                     {location && (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" />
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s7-4.686 7-11a7 7 0 10-14 0c0 6.314 7 11 7 11z" />
//                         </svg>
//                         {location}
//                       </span>
//                     )}
//                     {timezone && (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         {timezone}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Bio */}
//               {bio && (
//                 <div className="mb-8">
//                   <h2 className="text-lg font-semibold text-slate-900 mb-3">
//                     About
//                   </h2>
//                   <p className="text-slate-700 leading-relaxed whitespace-pre-line">
//                     {bio}
//                   </p>
//                 </div>
//               )}

//               {/* Tags */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 {Array.isArray(specializations) && specializations.length > 0 && (
//                   <TagSection title="Specializations" items={specializations} />
//                 )}
//                 {Array.isArray(industries) && industries.length > 0 && (
//                   <TagSection title="Industries" items={industries} />
//                 )}
//                 {Array.isArray(languages) && languages.length > 0 && (
//                   <TagSection title="Languages" items={languages} />
//                 )}
//                 {Array.isArray(education) && education.length > 0 && (
//                   <TagSection title="Education" items={education} />
//                 )}
//                 {Array.isArray(certifications) && certifications.length > 0 && (
//                   <TagSection title="Certifications" items={certifications} />
//                 )}
//               </div>
//             </div>

//             {/* Right: Booking panel */}
//             <div className="p-8 lg:p-10 bg-slate-50/80">
//               <div className="mb-6">
//                 <h2 className="text-xl font-semibold text-slate-900 mb-2">
//                   Book a session
//                 </h2>
//                 <p className="text-sm text-slate-600">
//                   Each session costs <span className="font-semibold">{TOKEN_COST} tokens</span>. Your
//                   tokens are locked at booking and released after completion or
//                   cancellation (as per policy).
//                 </p>
//               </div>

//               {!is_accepting_bookings && (
//                 <div className="p-4 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
//                   This interviewer is currently not accepting new bookings.
//                 </div>
//               )}

//               {/* Date picker */}
//               <div className="mb-6">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Choose a date
//                 </label>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={handleDateChange}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
//                 />
//                 {timezone && (
//                   <p className="mt-2 text-xs text-slate-500">
//                     Times shown in interviewer's timezone: {timezone}
//                   </p>
//                 )}
//               </div>

//               {/* Slots */}
//               <div className="mb-6">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-semibold text-slate-800">
//                     Available slots
//                   </h3>
//                   {loadingSlots && (
//                     <span className="text-xs text-slate-500">Loading slots…</span>
//                   )}
//                 </div>

//                 <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
//                   {selectedDate && availability.length === 0 && !loadingSlots && (
//                     <div className="text-sm text-slate-500">
//                       No slots available for this date.
//                     </div>
//                   )}

//                   {!selectedDate && (
//                     <div className="text-sm text-slate-500">
//                       Select a date to see available slots.
//                     </div>
//                   )}

//                   {availability.map((slot) => (
//                     <button
//                       key={slot.id}
//                       onClick={() => handleBook(slot.id)}
//                       disabled={
//                         !hasEnoughTokens ||
//                         !is_accepting_bookings ||
//                         bookingLoading
//                       }
//                       className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-medium transition-all duration-200 ${
//                         hasEnoughTokens && is_accepting_bookings
//                           ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-800'
//                           : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
//                       }`}
//                     >
//                       <span>
//                         {slot.start_time} – {slot.end_time}
//                       </span>
//                       <span className="inline-flex items-center gap-1">
//                         <span className="text-xs font-semibold">
//                           Book • {TOKEN_COST}
//                         </span>
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                         </svg>
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Token warning */}
//               {!hasEnoughTokens && !tokenLoading && (
//                 <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 mb-4">
//                   Not enough tokens to book. Each session costs {TOKEN_COST} tokens, but your balance is {tokenBalance}.
//                 </div>
//               )}

//               <p className="text-xs text-slate-500">
//                 By booking, you agree to the platform's session and cancellation policy. Tokens are handled automatically based on session status.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TagSection = ({ title, items }) => (
//   <div>
//     <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
//     <div className="flex flex-wrap gap-2">
//       {items.map((item) => (
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
import { candidateBookingsApi } from '../../candidateBookingsApi';

const TOKEN_COST = 10;

const InterviewerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Token state
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenLoading, setTokenLoading] = useState(true);
  
  // Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Page state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const hasEnoughTokens = tokenBalance >= TOKEN_COST;

  // Fetch token balance
  const fetchTokenBalance = useCallback(async () => {
    try {
      setTokenLoading(true);
      const response = await candidateBookingsApi.getTokenBalance();
      setTokenBalance(response.data.token_balance);
    } catch (error) {
      console.error('Token balance fetch failed:', error);
      setTokenBalance(0);
    } finally {
      setTokenLoading(false);
    }
  }, []);

  // Load profile and tokens
  useEffect(() => {
    fetchTokenBalance();
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await candidateBookingsApi.getInterviewerDetail(id);
        setProfile(res.data);
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Interviewer not available for booking');
        navigate('/candidate/interviewers');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, navigate, fetchTokenBalance]);

  const fetchAvailability = async (date) => {
    try {
      setLoadingSlots(true);
      const res = await candidateBookingsApi.getAvailability(id, date);
      setAvailability(res.data || []);
      if (!res.data?.length) {
        toast.info('No available slots for this date');
      }
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value);
    if (value) {
      fetchAvailability(value);
    } else {
      setAvailability([]);
    }
  };

  // Open booking modal
  const handleBookClick = (slot) => {
    if (!hasEnoughTokens) {
      toast.error('Not enough tokens to book this session');
      return;
    }
    setSelectedSlot(slot);
    setBookingModalOpen(true);
  };

  // Confirm booking from modal
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    try {
      setBookingLoading(true);
      // ✅ CORRECT ENDPOINT: POST /api/bookings/ with availability_id
      const res = await candidateBookingsApi.createBooking(selectedSlot.id);
      toast.success(`Booking confirmed! ${res.data.tokens_locked} tokens locked.`);
      setBookingModalOpen(false);
      setSelectedSlot(null);
      navigate('/candidate/dashboard/upcoming');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Loading interviewer profile…</p>
        </div>
      </div>
    );
  }

  const {
    display_name,
    headline,
    bio,
    profile_picture,
    years_of_experience,
    location,
    timezone,
    specializations,
    languages,
    education,
    certifications,
    industries,
    is_accepting_bookings,
    verification_status,
  } = profile;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              Back to interviewers
            </button>

            <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700">
              Tokens: <span className="font-bold">{tokenLoading ? '...' : tokenBalance}</span> • Cost per
              session: <span className="font-bold">{TOKEN_COST}</span>
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="grid lg:grid-cols-[2fr,1.6fr] gap-0">
              {/* Left: Profile */}
              <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative flex-shrink-0">
                    <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-slate-800 flex items-center justify-center">
                      {profile_picture ? (
                        <img src={profile_picture} alt={display_name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
                        </svg>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-md">
                        {verification_status === 'APPROVED' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">{display_name}</h1>
                    <p className="text-lg text-slate-700 mb-3">{headline}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      {years_of_experience != null && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08 .402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {years_of_experience}+ years experience
                        </span>
                      )}
                      {location && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {location}
                        </span>
                      )}
                      {timezone && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {timezone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {bio && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{bio}</p>
                  </div>
                )}

                {/* Tags */}
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.isArray(specializations) && specializations.length > 0 && (
                    <TagSection title="Specializations" items={specializations} />
                  )}
                  {Array.isArray(industries) && industries.length > 0 && (
                    <TagSection title="Industries" items={industries} />
                  )}
                  {Array.isArray(languages) && languages.length > 0 && (
                    <TagSection title="Languages" items={languages} />
                  )}
                  {Array.isArray(education) && education.length > 0 && (
                    <TagSection title="Education" items={education} />
                  )}
                  {Array.isArray(certifications) && certifications.length > 0 && (
                    <TagSection title="Certifications" items={certifications} />
                  )}
                </div>
              </div>

              {/* Right: Booking panel */}
              <div className="p-8 lg:p-10 bg-slate-50/80">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Book a session</h2>
                  <p className="text-sm text-slate-600">
                    Each session costs <span className="font-semibold">{TOKEN_COST} tokens</span>. Your
                    tokens are locked at booking and released after completion or cancellation.
                  </p>
                </div>

                {!is_accepting_bookings && (
                  <div className="p-4 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                    This interviewer is currently not accepting new bookings.
                  </div>
                )}

                {/* Date picker */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Choose a date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
                  />
                  {timezone && (
                    <p className="mt-2 text-xs text-slate-500">Times shown in interviewer&apos;s timezone: {timezone}</p>
                  )}
                </div>

                {/* Slots */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-800">Available slots</h3>
                    {loadingSlots && <span className="text-xs text-slate-500">Loading slots…</span>}
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedDate && availability.length === 0 && !loadingSlots && (
                      <div className="text-sm text-slate-500 text-center py-8">No slots available for this date.</div>
                    )}

                    {!selectedDate && (
                      <div className="text-sm text-slate-500 text-center py-8">Select a date to see available slots.</div>
                    )}

                    {availability.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleBookClick(slot)}
                        disabled={!hasEnoughTokens || !is_accepting_bookings || bookingLoading}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-medium transition-all duration-200 group ${
                          hasEnoughTokens && is_accepting_bookings
                            ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-800 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                            : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <span>{slot.start_time} – {slot.end_time}</span>
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs font-semibold">Book • {TOKEN_COST}</span>
                          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Token warning */}
                {!hasEnoughTokens && !tokenLoading && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 mb-4">
                    Not enough tokens to book. Each session costs {TOKEN_COST} tokens, but your balance is {tokenBalance}.
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  By booking, you agree to the platform&apos;s session and cancellation policy. Tokens are handled automatically based on session status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 CONFIRM BOOKING MODAL */}
      {selectedSlot && (
        <ConfirmBookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedSlot(null);
          }}
          slot={selectedSlot}
          tokenCost={TOKEN_COST}
          tokenBalance={tokenBalance}
          onConfirm={handleConfirmBooking}
          loading={bookingLoading}
        />
      )}
    </>
  );
};

const TagSection = ({ title, items }) => (
  <div>
    <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={item}
          className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const ConfirmBookingModal = ({ 
  isOpen, 
  onClose, 
  slot, 
  tokenCost, 
  tokenBalance, 
  onConfirm,
  loading 
}) => {
  if (!isOpen || !slot) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const durationMinutes = Math.round(
    (new Date(`2000-01-01T${slot.end_time}`) - new Date(`2000-01-01T${slot.start_time}`)) / 60000
  );

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
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
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
            <p className="text-sm text-gray-600 mt-1">Duration: ~{durationMinutes} minutes</p>
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
              <span className="px-4 py-2 bg-white text-emerald-800 text-sm font-bold rounded-xl border-2 border-emerald-200 shadow-sm">
                Locked until completion
              </span>
            </div>
            <p className="text-sm text-emerald-700 mt-2 text-center">
              You'll have <span className="font-semibold">{tokenBalance - tokenCost}</span> tokens remaining
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>✅ Tokens automatically refunded if interviewer cancels (24h policy)</p>
            <p>✅ Tokens transferred after successful session completion</p>
            <p>⚠️ Cancel before session start to get full refund (policy applies)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 pt-0 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={tokenBalance < tokenCost || loading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating booking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm & Lock {tokenCost} Tokens
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerDetailPage;
