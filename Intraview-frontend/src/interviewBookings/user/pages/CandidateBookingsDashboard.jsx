





// import React, { useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { candidateBookingsApi } from '../../candidateBookingsApi';
// import { INTERVIEW_TYPE_LABELS } from '../components/SessionConfigModal';
// import CandidateNavbar from '../../../components/CandidateNavbar';
// import CandidateFooter from '../../../components/CandidateFooter';

// // ─── Design tokens matching IntraView brand ────────────────────────────────
// const styles = {
//   teal: '#0BB5A0',
//   tealDark: '#099688',
//   tealLight: '#E6F7F5',
//   tealBorder: '#B2E8E3',
//   navy: '#111827',
//   navyMid: '#1F2937',
//   yellow: '#F5C518',
//   yellowLight: '#FFFBEB',
//   yellowBorder: '#FDE68A',
//   gray50: '#F9FAFB',
//   gray100: '#F3F4F6',
//   gray200: '#E5E7EB',
//   gray400: '#9CA3AF',
//   gray600: '#4B5563',
//   gray800: '#1F2937',
//   white: '#FFFFFF',
//   rose: '#F43F5E',
//   roseLight: '#FFF1F2',
//   roseBorder: '#FECDD3',
//   emerald: '#10B981',
//   emeraldLight: '#ECFDF5',
//   emeraldBorder: '#A7F3D0',
//   amber: '#F59E0B',
//   amberLight: '#FFFBEB',
//   amberBorder: '#FDE68A',
// };

// // ─── Status Badge ──────────────────────────────────────────────────────────
// const BookingStatusBadge = ({ status }) => {
//   const lower = status?.toLowerCase() || '';
//   const map = {
//     confirmed: { bg: styles.tealLight, color: styles.tealDark, border: styles.tealBorder, label: 'Confirmed' },
//     pending: { bg: styles.amberLight, color: '#92400E', border: styles.amberBorder, label: 'Pending' },
//     completed: { bg: styles.gray100, color: styles.gray800, border: styles.gray200, label: 'Completed' },
//     cancelled: { bg: styles.roseLight, color: '#9F1239', border: styles.roseBorder, label: 'Cancelled' },
//     cancelled_by_candidate: { bg: styles.roseLight, color: '#9F1239', border: styles.roseBorder, label: 'Cancelled' },
//   };
//   const cfg = map[lower] || { bg: styles.gray100, color: styles.gray600, border: styles.gray200, label: 'Unknown' };

//   return (
//     <span style={{
//       background: cfg.bg,
//       color: cfg.color,
//       border: `1px solid ${cfg.border}`,
//       padding: '3px 10px',
//       borderRadius: 999,
//       fontSize: 11,
//       fontWeight: 700,
//       letterSpacing: '0.04em',
//       textTransform: 'uppercase',
//     }}>
//       {cfg.label}
//     </span>
//   );
// };

// // ─── Interview type pill ───────────────────────────────────────────────────
// const TypePill = ({ label }) => (
//   <span style={{
//     background: styles.navy,
//     color: styles.white,
//     padding: '4px 12px',
//     borderRadius: 999,
//     fontSize: 11,
//     fontWeight: 700,
//     letterSpacing: '0.05em',
//     textTransform: 'uppercase',
//   }}>
//     {label}
//   </span>
// );

// // ─── Session Card ──────────────────────────────────────────────────────────
// const SessionCard = ({ booking, onClick }) => {
//   const navigate = useNavigate();
//   const [timeLeft, setTimeLeft] = useState('');
//   const [isLive, setIsLive] = useState(false);
//   const [hovered, setHovered] = useState(false);

//   const hasPendingReschedule = booking.reschedule_status === 'PENDING';
//   const proposedSlot = booking.proposed_slot || null;
//   const rescheduleNote = booking.reschedule_note || '';

//   useEffect(() => {
//     const startTime = new Date(booking.start_datetime);
//     const endTime = booking.end_datetime
//       ? new Date(booking.end_datetime)
//       : new Date(startTime.getTime() + 30 * 60 * 1000);

//     const updateTimer = () => {
//       const now = new Date();
//       const diffToStart = startTime - now;
//       const diffToEnd = endTime - now;
//       if (diffToStart <= 0 && diffToEnd > 0) {
//         setIsLive(true);
//         setTimeLeft('LIVE NOW');
//       } else if (diffToEnd <= 0) {
//         setIsLive(false);
//         setTimeLeft('ENDED');
//       } else {
//         setIsLive(false);
//         const h = Math.floor(diffToStart / 3600000);
//         const m = Math.floor((diffToStart % 3600000) / 60000);
//         const s = Math.floor((diffToStart % 60000) / 1000);
//         setTimeLeft(`${h}h ${m}m ${s}s`);
//       }
//     };
//     const interval = setInterval(updateTimer, 1000);
//     updateTimer();
//     return () => clearInterval(interval);
//   }, [booking.start_datetime, booking.end_datetime]);

//   const formatTime = (t) => {
//     if (!t) return '—';
//     try {
//       const [h, m] = t.split(':');
//       const d = new Date();
//       d.setHours(+h, +m, 0);
//       return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
//     } catch { return t; }
//   };

//   const formatDate = (ds) => {
//     if (!ds) return '—';
//     try {
//       return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', {
//         weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
//       });
//     } catch { return ds; }
//   };

//   const isUpcoming = new Date(booking.start_datetime) > new Date();
//   const canReschedule = booking.status === 'CONFIRMED' && isUpcoming && !hasPendingReschedule;

//   const handleJoin = (e) => {
//     e.stopPropagation();
//     if (timeLeft === 'ENDED') { toast.info('This session has already ended'); return; }
//     const minutesToStart = (new Date(booking.start_datetime) - new Date()) / 60000;
//     if (isLive || minutesToStart <= 15) {
//       navigate(`/interview/room/${booking.id}`);
//     } else {
//       toast.info(`Session starts in ${timeLeft}`);
//     }
//   };

//   const handleReschedule = (e) => {
//     e.stopPropagation();
//     navigate(`/candidate/bookings-detail/${booking.id}?action=reschedule`);
//   };

//   const interviewerName = booking.interviewer_name || 'Unknown Interviewer';
//   const bookingType = INTERVIEW_TYPE_LABELS[booking.interview_type] || booking.interview_type || 'Interview';
//   const status = booking.status || 'CONFIRMED';

//   return (
//     <div
//       onClick={() => onClick(booking.id)}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         background: styles.white,
//         borderRadius: 16,
//         border: `1.5px solid ${hovered ? styles.teal : styles.gray200}`,
//         padding: '28px 28px 24px',
//         cursor: 'pointer',
//         transition: 'all 0.22s ease',
//         boxShadow: hovered
//           ? `0 12px 32px rgba(11,181,160,0.13), 0 2px 8px rgba(0,0,0,0.06)`
//           : '0 2px 8px rgba(0,0,0,0.05)',
//         transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: 0,
//       }}
//     >
//       {/* Top row */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//         <TypePill label={bookingType} />
//         <BookingStatusBadge status={status} />
//       </div>

//       {/* Interviewer name */}
//       <div style={{ marginBottom: 16 }}>
//         <p style={{ fontSize: 11, fontWeight: 600, color: styles.gray400, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
//           Interviewer
//         </p>
//         <p style={{ fontSize: 17, fontWeight: 700, color: styles.navy, lineHeight: 1.3 }}>
//           {interviewerName}
//         </p>
//       </div>

//       {/* Divider */}
//       <div style={{ height: 1, background: styles.gray100, marginBottom: 16 }} />

//       {/* Date + Time */}
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
//         {/* Date row */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <span style={{
//             width: 34, height: 34, borderRadius: 10,
//             background: styles.tealLight,
//             display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//           }}>
//             <svg width="16" height="16" fill="none" stroke={styles.teal} strokeWidth="2" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//           </span>
//           <span style={{ fontSize: 13.5, color: styles.gray600, fontWeight: 500 }}>
//             {formatDate(booking.date)}
//           </span>
//         </div>

//         {/* Time row */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <span style={{
//             width: 34, height: 34, borderRadius: 10,
//             background: styles.tealLight,
//             display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//           }}>
//             <svg width="16" height="16" fill="none" stroke={styles.teal} strokeWidth="2" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </span>
//           <span style={{ fontSize: 13.5, color: styles.gray600, fontWeight: 500 }}>
//             {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
//           </span>
//         </div>
//       </div>

//       {/* Pending reschedule banner */}
//       {hasPendingReschedule && (
//         <div style={{
//           background: styles.amberLight,
//           border: `1px solid ${styles.amberBorder}`,
//           borderRadius: 10,
//           padding: '12px 14px',
//           marginBottom: 16,
//         }}>
//           <p style={{ fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
//             ⏳ Reschedule Pending
//           </p>
//           {proposedSlot && (
//             <p style={{ fontSize: 12.5, color: '#78350F', marginBottom: 2 }}>
//               Proposed: <strong>{proposedSlot.date} · {formatTime(proposedSlot.start_time)} – {formatTime(proposedSlot.end_time)}</strong>
//             </p>
//           )}
//           {rescheduleNote && (
//             <p style={{ fontSize: 12.5, color: '#78350F', fontStyle: 'italic' }}>"{rescheduleNote}"</p>
//           )}
//           <p style={{ fontSize: 11, color: '#B45309', marginTop: 6 }}>
//             Awaiting interviewer response
//           </p>
//         </div>
//       )}

//       {/* Timer */}
//       {isUpcoming && (
//         <div style={{
//           background: isLive ? styles.tealLight : styles.gray50,
//           border: `1px solid ${isLive ? styles.tealBorder : styles.gray200}`,
//           borderRadius: 10,
//           padding: '10px 14px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           marginBottom: 18,
//         }}>
//           <span style={{ fontSize: 12, fontWeight: 600, color: styles.gray600 }}>
//             {isLive ? 'Session is live' : 'Starts in'}
//           </span>
//           <span style={{
//             fontFamily: 'monospace',
//             fontWeight: 800,
//             fontSize: 14,
//             color: isLive ? styles.tealDark : styles.navy,
//             background: isLive ? styles.teal + '22' : styles.gray200,
//             padding: '3px 10px',
//             borderRadius: 6,
//             letterSpacing: '0.02em',
//           }}>
//             {timeLeft}
//           </span>
//         </div>
//       )}

//       {/* Action buttons */}
//       <div style={{ display: 'flex', gap: 10 }}>
//         <button
//           onClick={handleJoin}
//           style={{
//             flex: 1,
//             background: isLive ? styles.teal : styles.navy,
//             color: styles.white,
//             border: 'none',
//             borderRadius: 10,
//             padding: '11px 0',
//             fontSize: 13,
//             fontWeight: 700,
//             cursor: 'pointer',
//             letterSpacing: '0.02em',
//             transition: 'background 0.15s',
//           }}
//           onMouseEnter={e => e.currentTarget.style.background = isLive ? styles.tealDark : '#374151'}
//           onMouseLeave={e => e.currentTarget.style.background = isLive ? styles.teal : styles.navy}
//         >
//           {isLive ? '🎥 Join Now' : 'Join Session'}
//         </button>

//         {canReschedule && (
//           <button
//             onClick={handleReschedule}
//             style={{
//               flex: 1,
//               background: styles.white,
//               color: styles.tealDark,
//               border: `1.5px solid ${styles.teal}`,
//               borderRadius: 10,
//               padding: '11px 0',
//               fontSize: 13,
//               fontWeight: 700,
//               cursor: 'pointer',
//               letterSpacing: '0.02em',
//               transition: 'all 0.15s',
//             }}
//             onMouseEnter={e => { e.currentTarget.style.background = styles.tealLight; }}
//             onMouseLeave={e => { e.currentTarget.style.background = styles.white; }}
//           >
//             Reschedule
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// // ─── Main Dashboard ────────────────────────────────────────────────────────
// const CandidateBookingsDashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('upcoming');
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('all');

//   const fetchBookings = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = activeTab === 'upcoming'
//         ? await candidateBookingsApi.getUpcomingBookings()
//         : await candidateBookingsApi.getPastBookings();
//       setBookings(res.data || []);
//     } catch {
//       toast.error('Failed to load bookings');
//       setBookings([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [activeTab]);

//   useEffect(() => { fetchBookings(); }, [fetchBookings]);

//   const filteredBookings = bookings.filter(b => {
//     const name = b.interviewer_name || b.interviewer__interviewer_profile__display_name || '';
//     const dt = b.start_datetime || '';
//     const matchesSearch =
//       name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       dt.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterType === 'all' || b.interview_type === filterType;
//     return matchesSearch && matchesFilter;
//   });

//   const handleBookingClick = (id) => navigate(`/candidate/bookings-detail/${id}`);

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: styles.gray50, fontFamily: "'Geist', 'Inter', sans-serif" }}>
//       <CandidateNavbar />

//       <main style={{ flex: 1, padding: '56px 16px 80px' }}>
//         <div style={{ maxWidth: 1200, margin: '0 auto' }}>

//           {/* ── Page Header ── */}
//           <div style={{ marginBottom: 48 }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
//               <span style={{
//                 width: 6, height: 32, background: styles.teal, borderRadius: 3, display: 'inline-block',
//               }} />
//               <h1 style={{
//                 fontSize: 32,
//                 fontWeight: 800,
//                 color: styles.navy,
//                 margin: 0,
//                 letterSpacing: '-0.02em',
//               }}>
//                 My Sessions
//               </h1>
//             </div>
//             <p style={{ color: styles.gray400, fontSize: 15, margin: '0 0 0 18px', paddingLeft: 18 }}>
//               View and manage all your interview bookings in one place
//             </p>
//           </div>

//           {/* ── Controls Bar ── */}
//           <div style={{
//             background: styles.white,
//             borderRadius: 14,
//             border: `1px solid ${styles.gray200}`,
//             padding: '20px 24px',
//             marginBottom: 32,
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: 14,
//             alignItems: 'center',
//             boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
//           }}>
//             {/* Search */}
//             <div style={{ flex: '1 1 240px', position: 'relative', minWidth: 200 }}>
//               <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
//                 width="16" height="16" fill="none" stroke={styles.gray400} strokeWidth="2" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search sessions…"
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 style={{
//                   width: '100%',
//                   paddingLeft: 38,
//                   paddingRight: 14,
//                   paddingTop: 10,
//                   paddingBottom: 10,
//                   border: `1.5px solid ${styles.gray200}`,
//                   borderRadius: 10,
//                   fontSize: 13.5,
//                   color: styles.navy,
//                   background: styles.gray50,
//                   outline: 'none',
//                   boxSizing: 'border-box',
//                   fontFamily: 'inherit',
//                   transition: 'border-color 0.15s',
//                 }}
//                 onFocus={e => e.target.style.borderColor = styles.teal}
//                 onBlur={e => e.target.style.borderColor = styles.gray200}
//               />
//             </div>

//             {/* Filter */}
//             <div style={{ position: 'relative', flexShrink: 0 }}>
//               <select
//                 value={filterType}
//                 onChange={e => setFilterType(e.target.value)}
//                 style={{
//                   padding: '10px 36px 10px 14px',
//                   border: `1.5px solid ${styles.gray200}`,
//                   borderRadius: 10,
//                   fontSize: 13.5,
//                   color: styles.navy,
//                   background: styles.gray50,
//                   appearance: 'none',
//                   cursor: 'pointer',
//                   fontFamily: 'inherit',
//                   outline: 'none',
//                 }}
//               >
//                 <option value="all">All Types</option>
//                 <option value="TECHNICAL">Technical</option>
//                 <option value="BEHAVIORAL">Behavioral</option>
//                 <option value="SYSTEM_DESIGN">System Design</option>
//                 <option value="CODING">Coding</option>
//               </select>
//               <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
//                 width="14" height="14" fill="none" stroke={styles.gray400} strokeWidth="2" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//               </svg>
//             </div>

//             {/* Tab Toggle */}
//             <div style={{
//               display: 'flex',
//               background: styles.gray100,
//               borderRadius: 10,
//               padding: 3,
//               gap: 2,
//               marginLeft: 'auto',
//               flexShrink: 0,
//             }}>
//               {['upcoming', 'past'].map(tab => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   style={{
//                     padding: '8px 20px',
//                     borderRadius: 8,
//                     border: 'none',
//                     fontSize: 13,
//                     fontWeight: 600,
//                     cursor: 'pointer',
//                     transition: 'all 0.18s',
//                     fontFamily: 'inherit',
//                     background: activeTab === tab ? styles.teal : 'transparent',
//                     color: activeTab === tab ? styles.white : styles.gray600,
//                     boxShadow: activeTab === tab ? '0 2px 8px rgba(11,181,160,0.25)' : 'none',
//                   }}
//                 >
//                   {tab === 'upcoming' ? 'Upcoming' : 'Past'}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* ── Stats Row ── */}
//           {!loading && bookings.length > 0 && (
//             <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
//               {[
//                 { label: 'Total', value: filteredBookings.length, color: styles.navy },
//                 {
//                   label: 'Confirmed',
//                   value: filteredBookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
//                   color: styles.teal,
//                 },
//                 {
//                   label: 'Pending',
//                   value: filteredBookings.filter(b => b.status?.toLowerCase() === 'pending').length,
//                   color: styles.amber,
//                 },
//               ].map(stat => (
//                 <div key={stat.label} style={{
//                   background: styles.white,
//                   border: `1px solid ${styles.gray200}`,
//                   borderRadius: 12,
//                   padding: '14px 22px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 10,
//                 }}>
//                   <span style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</span>
//                   <span style={{ fontSize: 12, color: styles.gray400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//                     {stat.label}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* ── Loading ── */}
//           {loading && (
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16 }}>
//               <div style={{
//                 width: 44, height: 44, borderRadius: '50%',
//                 border: `3px solid ${styles.gray200}`,
//                 borderTopColor: styles.teal,
//                 animation: 'spin 0.75s linear infinite',
//               }} />
//               <p style={{ color: styles.gray400, fontSize: 14 }}>Loading sessions…</p>
//               <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//             </div>
//           )}

//           {/* ── Empty State ── */}
//           {!loading && filteredBookings.length === 0 && (
//             <div style={{
//               textAlign: 'center',
//               padding: '80px 24px',
//               background: styles.white,
//               borderRadius: 16,
//               border: `1px dashed ${styles.gray200}`,
//             }}>
//               <div style={{
//                 width: 72, height: 72, borderRadius: '50%',
//                 background: styles.tealLight,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 margin: '0 auto 20px',
//               }}>
//                 <svg width="30" height="30" fill="none" stroke={styles.teal} strokeWidth="1.5" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//               <h3 style={{ fontSize: 20, fontWeight: 700, color: styles.navy, margin: '0 0 8px' }}>
//                 {activeTab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
//               </h3>
//               <p style={{ color: styles.gray400, fontSize: 14, maxWidth: 360, margin: '0 auto' }}>
//                 {activeTab === 'upcoming'
//                   ? 'Book an interview with one of our expert interviewers to get started.'
//                   : 'Your completed sessions will appear here once you have some.'}
//               </p>
//             </div>
//           )}

//           {/* ── Grid ── */}
//           {!loading && filteredBookings.length > 0 && (
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
//               gap: 20,
//             }}>
//               {filteredBookings.map(booking => (
//                 <SessionCard key={booking.id} booking={booking} onClick={handleBookingClick} />
//               ))}
//             </div>
//           )}
//         </div>
//       </main>

//       <CandidateFooter />
//     </div>
//   );
// };

// export default CandidateBookingsDashboard;






























import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { candidateBookingsApi } from '../../candidateBookingsApi';
import { INTERVIEW_TYPE_LABELS } from '../components/SessionConfigModal';
import CandidateNavbar from '../../../components/CandidateNavbar';
import CandidateFooter from '../../../components/CandidateFooter';

// ─── Design Tokens ─────────────────────────────────────────────────────────
const T = {
  teal: '#0BB5A0',
  tealDark: '#099688',
  tealLight: '#E8FAF8',
  tealBorder: '#B0EDE7',
  tealMid: '#5FD0C6',

  yellow: '#F5C518',
  yellowLight: '#FEFCE8',
  yellowBorder: '#FDE68A',
  yellowDark: '#D4A017',

  // Navy used ONLY where truly needed
  navy: '#111827',

  // Neutral grays (used for most text & surfaces)
  slate900: '#1E2A38',
  slate700: '#374151',
  slate500: '#6B7280',
  slate400: '#9CA3AF',
  slate300: '#D1D5DB',
  slate200: '#E5E7EB',
  slate100: '#F3F4F6',
  slate50: '#F5F5F5',

  white: '#FFFFFF',

  rose: '#F43F5E',
  roseLight: '#FFF1F2',
  roseBorder: '#FECDD3',
  roseDark: '#9F1239',
};

// ─── Inject global keyframes ───────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    * { box-sizing: border-box; }
  `}</style>
);

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const lower = status?.toLowerCase() || '';
  const cfg = {
    confirmed: { bg: T.tealLight, color: T.tealDark, border: T.tealBorder, label: 'Confirmed' },
    pending: { bg: T.yellowLight, color: T.yellowDark, border: T.yellowBorder, label: 'Pending' },
    completed: { bg: T.slate100, color: T.slate700, border: T.slate200, label: 'Completed' },
    cancelled: { bg: T.roseLight, color: T.roseDark, border: T.roseBorder, label: 'Cancelled' },
    cancelled_by_candidate: { bg: T.roseLight, color: T.roseDark, border: T.roseBorder, label: 'Cancelled' },
  }[lower] || { bg: T.slate100, color: T.slate500, border: T.slate200, label: status || 'Unknown' };

  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      padding: '3px 10px', borderRadius: 999,
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>{cfg.label}</span>
  );
};

// ─── Type Pill ─────────────────────────────────────────────────────────────
const TypePill = ({ label }) => (
  <span style={{
    background: T.tealLight, color: T.tealDark,
    border: `1px solid ${T.tealBorder}`,
    padding: '3px 10px', borderRadius: 999,
    fontSize: 10, fontWeight: 700,
    letterSpacing: '0.06em', textTransform: 'uppercase',
  }}>{label}</span>
);

// ─── Avatar ────────────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = name
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: `linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, color: T.white,
      fontSize: 14, fontWeight: 700, letterSpacing: '0.03em',
    }}>{initials || '??'}</div>
  );
};

// ─── Icon Box helper ───────────────────────────────────────────────────────
const IconBox = ({ children }) => (
  <span style={{
    width: 30, height: 30, borderRadius: 8,
    background: T.tealLight,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>{children}</span>
);

// ─── Session Card ──────────────────────────────────────────────────────────
const SessionCard = ({ booking, onClick, isPast }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [hovered, setHovered] = useState(false);

  const hasPendingReschedule = booking.reschedule_status === 'PENDING';
  const proposedSlot = booking.proposed_slot || null;
  const rescheduleNote = booking.reschedule_note || '';

  useEffect(() => {
    // Build ISO datetime — prefer pre-combined start_datetime from API,
    // fall back to constructing from separate date + start_time fields.
    const buildDate = (datetimeStr, dateStr, timeStr) => {
      if (datetimeStr) return new Date(datetimeStr);
      if (dateStr && timeStr) return new Date(`${dateStr}T${timeStr}`);
      return null;
    };

    const startTime = buildDate(booking.start_datetime, booking.date, booking.start_time);
    const endTime = booking.end_datetime
      ? new Date(booking.end_datetime)
      : startTime
      ? new Date(startTime.getTime() + 30 * 60 * 1000)
      : null;

    if (!startTime || isNaN(startTime.getTime())) return; // can't compute, skip

    const update = () => {
      const now = new Date();
      const toStart = startTime - now;
      const toEnd = endTime - now;
      if (toStart <= 0 && toEnd > 0) { setIsLive(true); setTimeLeft('LIVE'); }
      else if (toEnd <= 0) { setIsLive(false); setTimeLeft('Ended'); }
      else {
        setIsLive(false);
        const h = Math.floor(toStart / 3600000);
        const m = Math.floor((toStart % 3600000) / 60000);
        const s = Math.floor((toStart % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };
    const iv = setInterval(update, 1000);
    update();
    return () => clearInterval(iv);
  }, [booking.start_datetime, booking.end_datetime, booking.date, booking.start_time]);

  const fmt12 = (t) => {
    if (!t) return '—';
    try {
      const [h, m] = t.split(':');
      const d = new Date(); d.setHours(+h, +m, 0);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return t; }
  };

  const fmtDate = (ds) => {
    if (!ds) return '—';
    try {
      return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return ds; }
  };

  const isUpcoming = (() => {
    if (booking.start_datetime) return new Date(booking.start_datetime) > new Date();
    if (booking.date && booking.start_time) return new Date(`${booking.date}T${booking.start_time}`) > new Date();
    return false;
  })();
  const canReschedule = booking.status === 'CONFIRMED' && isUpcoming && !hasPendingReschedule;

  const handleJoin = (e) => {
    e.stopPropagation();
    if (timeLeft === 'Ended') { toast.info('This session has already ended.'); return; }
    // Allow joining when live OR within 15 minutes of start
    const buildDate = (datetimeStr, dateStr, timeStr) => {
      if (datetimeStr) return new Date(datetimeStr);
      if (dateStr && timeStr) return new Date(`${dateStr}T${timeStr}`);
      return null;
    };
    const startTime = buildDate(booking.start_datetime, booking.date, booking.start_time);
    const mins = startTime ? (startTime - new Date()) / 60000 : Infinity;
    if (isLive || mins <= 15) {
      navigate(`/interview/room/${booking.id}`);
    } else {
      toast.info(`Session starts in ${timeLeft}. You can join 15 minutes before start.`);
    }
  };

  const handleReschedule = (e) => {
    e.stopPropagation();
    navigate(`/candidate/bookings-detail/${booking.id}?action=reschedule`);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/candidate/bookings-detail/${booking.id}`);
  };

  const interviewerName = booking.interviewer_name || 'Unknown Interviewer';
  const bookingType = INTERVIEW_TYPE_LABELS[booking.interview_type] || booking.interview_type || 'Interview';
  const status = booking.status || 'CONFIRMED';

  return (
    <div
      onClick={() => onClick(booking.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white,
        borderRadius: 18,
        border: `1.5px solid ${hovered ? T.tealMid : T.slate200}`,
        padding: 0,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hovered
          ? `0 8px 28px rgba(11,181,160,0.12), 0 2px 8px rgba(0,0,0,0.04)`
          : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeUp 0.3s ease both',
      }}
    >
      {/* ── Teal top bar (thicker if live) ── */}
      {isLive && (
        <div style={{
          height: 4, background: T.yellow,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      )}

      <div style={{ padding: '22px 22px 20px' }}>
        {/* ── Top row: type + status ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <TypePill label={bookingType} />
          <StatusBadge status={status} />
        </div>

        {/* ── Interviewer row ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
        }}>
          <Avatar name={interviewerName} />
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: T.slate400, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>
              Interviewer
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.slate900, margin: 0, lineHeight: 1.2 }}>
              {interviewerName}
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: T.slate100, marginBottom: 16 }} />

        {/* ── Date & Time ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconBox>
              <svg width="14" height="14" fill="none" stroke={T.teal} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </IconBox>
            <span style={{ fontSize: 13, color: T.slate700, fontWeight: 500 }}>
              {fmtDate(booking.date)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconBox>
              <svg width="14" height="14" fill="none" stroke={T.teal} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </IconBox>
            <span style={{ fontSize: 13, color: T.slate700, fontWeight: 500 }}>
              {fmt12(booking.start_time)} – {fmt12(booking.end_time)}
            </span>
          </div>
        </div>

        {/* ── Pending reschedule banner ── */}
        {hasPendingReschedule && (
          <div style={{
            background: T.yellowLight, border: `1px solid ${T.yellowBorder}`,
            borderRadius: 10, padding: '10px 12px', marginBottom: 14,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.yellowDark, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
              ⏳ Reschedule Pending
            </p>
            {proposedSlot && (
              <p style={{ fontSize: 12, color: '#78350F', margin: '0 0 2px' }}>
                Proposed: <strong>{proposedSlot.date} · {fmt12(proposedSlot.start_time)} – {fmt12(proposedSlot.end_time)}</strong>
              </p>
            )}
            {rescheduleNote && (
              <p style={{ fontSize: 12, color: '#92400E', fontStyle: 'italic', margin: '0 0 4px' }}>"{rescheduleNote}"</p>
            )}
            <p style={{ fontSize: 11, color: '#B45309', margin: 0 }}>Awaiting interviewer response</p>
          </div>
        )}

        {/* ── Countdown timer (upcoming only) ── */}
        {isUpcoming && (
          <div style={{
            background: isLive ? T.tealLight : T.slate50,
            border: `1px solid ${isLive ? T.tealBorder : T.slate200}`,
            borderRadius: 10, padding: '9px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.slate500 }}>
              {isLive ? 'Session is live' : 'Starts in'}
            </span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 800, fontSize: 13,
              color: isLive ? T.white : T.slate700,
              background: isLive ? T.teal : T.slate200,
              padding: '3px 10px', borderRadius: 6,
              letterSpacing: '0.02em',
              animation: isLive ? 'pulse 1.2s ease-in-out infinite' : 'none',
            }}>
              {isLive ? '● LIVE' : timeLeft}
            </span>
          </div>
        )}

        {/* ── Past session: completion chip ── */}
        {isPast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: T.slate50, border: `1px solid ${T.slate200}`,
            borderRadius: 10, padding: '9px 14px', marginBottom: 16,
          }}>
            <svg width="14" height="14" fill="none" stroke={T.teal} strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.slate500 }}>Session completed</span>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {isPast ? (
            /* Past: View Details only */
            <button
              onClick={handleViewDetails}
              style={{
                flex: 1,
                background: T.tealLight,
                color: T.tealDark,
                border: `1.5px solid ${T.tealBorder}`,
                borderRadius: 10, padding: '10px 0',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.02em',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.teal; e.currentTarget.style.color = T.white; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.tealLight; e.currentTarget.style.color = T.tealDark; }}
            >
              View Details →
            </button>
          ) : (
            <>
              {/* Upcoming: Join Session */}
              <button
                onClick={handleJoin}
                style={{
                  flex: 1,
                  background: isLive ? T.yellow : T.teal,
                  color: isLive ? T.navy : T.white,
                  border: 'none',
                  borderRadius: 10, padding: '10px 0',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  transition: 'background 0.15s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.currentTarget.style.background = isLive ? T.yellowDark : T.tealDark}
                onMouseLeave={e => e.currentTarget.style.background = isLive ? T.yellow : T.teal}
              >
                {isLive ? '● Join Now' : 'Join Session'}
              </button>

              {/* Reschedule */}
              {canReschedule && (
                <button
                  onClick={handleReschedule}
                  style={{
                    flex: 1,
                    background: T.white, color: T.tealDark,
                    border: `1.5px solid ${T.teal}`,
                    borderRadius: 10, padding: '10px 0',
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.02em',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.tealLight; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.white; }}
                >
                  Reschedule
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ value, label, accent }) => (
  <div style={{
    background: T.white,
    border: `1px solid ${T.slate200}`,
    borderRadius: 14, padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 12,
    flexShrink: 0,
  }}>
    <span style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 }}>
      {value}
    </span>
    <span style={{
      fontSize: 11, color: T.slate400,
      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {label}
    </span>
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────
const CandidateBookingsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = activeTab === 'upcoming'
        ? await candidateBookingsApi.getUpcomingBookings()
        : await candidateBookingsApi.getPastBookings();
      setBookings(res.data || []);
    } catch {
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filteredBookings = bookings.filter(b => {
    const name = b.interviewer_name || b.interviewer__interviewer_profile__display_name || '';
    const dt = b.start_datetime || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || b.interview_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleBookingClick = (id) => navigate(`/candidate/bookings-detail/${id}`);

  const isPast = activeTab === 'past';

  const stats = [
    { value: filteredBookings.length, label: 'Total', accent: T.teal },
    { value: filteredBookings.filter(b => b.status?.toLowerCase() === 'confirmed').length, label: 'Confirmed', accent: T.teal },
    { value: filteredBookings.filter(b => b.status?.toLowerCase() === 'pending').length, label: 'Pending', accent: T.yellow },
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: T.slate50, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
    }}>
      <GlobalStyle />
      <CandidateNavbar />

      <main style={{ flex: 1, padding: '48px 20px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Page Header ── */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                {/* Label chip */}
                {/* <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: T.tealLight, border: `1px solid ${T.tealBorder}`,
                  borderRadius: 999, padding: '4px 12px', marginBottom: 10,
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: T.teal,
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.tealDark, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Interview Sessions
                  </span>
                </div> */}
                {/* Title — navy used minimally here */}
                <h1 style={{
                  fontSize: 30, fontWeight: 800, color: T.navy,
                  margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
                }}>
                  My Sessions
                </h1>
                <p style={{ color: T.slate400, fontSize: 14, margin: '6px 0 0', fontWeight: 400 }}>
                  View and manage all your interview bookings in one place
                </p>
              </div>

              {/* Tab Toggle (header-level) */}
              <div style={{
                display: 'flex', background: T.white,
                border: `1.5px solid ${T.slate200}`,
                borderRadius: 12, padding: 4, gap: 4,
              }}>
                {[
                  { key: 'upcoming', label: 'Upcoming' },
                  { key: 'past', label: 'Past' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: '8px 22px', borderRadius: 9, border: 'none',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.18s', fontFamily: 'inherit',
                      background: activeTab === tab.key ? T.teal : 'transparent',
                      color: activeTab === tab.key ? T.white : T.slate500,
                      boxShadow: activeTab === tab.key ? `0 2px 10px rgba(11,181,160,0.3)` : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Controls Bar ── */}
          <div style={{
            background: T.white,
            borderRadius: 14,
            border: `1px solid ${T.slate200}`,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex', flexWrap: 'wrap',
            gap: 12, alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            {/* Search */}
            <div style={{ flex: '1 1 220px', position: 'relative', minWidth: 180 }}>
              <svg style={{
                position: 'absolute', left: 11, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
              }} width="15" height="15" fill="none" stroke={T.slate400} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" placeholder="Search by interviewer or date…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 34, paddingRight: 12,
                  paddingTop: 9, paddingBottom: 9,
                  border: `1.5px solid ${T.slate200}`, borderRadius: 9,
                  fontSize: 13, color: T.slate900,
                  background: T.slate50, outline: 'none',
                  fontFamily: 'inherit', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = T.teal}
                onBlur={e => e.target.style.borderColor = T.slate200}
              />
            </div>

            {/* Filter */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{
                  padding: '9px 34px 9px 12px',
                  border: `1.5px solid ${T.slate200}`,
                  borderRadius: 9, fontSize: 13,
                  color: T.slate700, background: T.slate50,
                  appearance: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', outline: 'none',
                }}
              >
                <option value="all">All Types</option>
                <option value="TECHNICAL">Technical</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="CODING">Coding</option>
              </select>
              <svg style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
              }} width="12" height="12" fill="none" stroke={T.slate400} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Result count */}
            {!loading && (
              <div style={{
                marginLeft: 'auto',
                fontSize: 12, color: T.slate400, fontWeight: 500,
              }}>
                {filteredBookings.length} session{filteredBookings.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* ── Stats Row ── */}
          {!loading && bookings.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              {stats.map(s => (
                <StatCard key={s.label} value={s.value} label={s.label} accent={s.accent} />
              ))}
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '80px 0', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `3px solid ${T.slate200}`,
                borderTopColor: T.teal,
                animation: 'spin 0.7s linear infinite',
              }} />
              <p style={{ color: T.slate400, fontSize: 13, margin: 0 }}>Loading sessions…</p>
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && filteredBookings.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '72px 24px',
              background: T.white, borderRadius: 18,
              border: `1.5px dashed ${T.slate200}`,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: T.tealLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <svg width="28" height="28" fill="none" stroke={T.teal} strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.slate700, margin: '0 0 8px' }}>
                {isPast ? 'No past sessions' : 'No upcoming sessions'}
              </h3>
              <p style={{ color: T.slate400, fontSize: 13, maxWidth: 340, margin: '0 auto 0' }}>
                {isPast
                  ? 'Your completed sessions will appear here once you have some.'
                  : 'Book an interview with one of our expert interviewers to get started.'}
              </p>
            </div>
          )}

          {/* ── Card Grid ── */}
          {!loading && filteredBookings.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 18,
            }}>
              {filteredBookings.map((booking, i) => (
                <div key={booking.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <SessionCard
                    booking={booking}
                    onClick={handleBookingClick}
                    isPast={isPast}
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <CandidateFooter />
    </div>
  );
};

export default CandidateBookingsDashboard;