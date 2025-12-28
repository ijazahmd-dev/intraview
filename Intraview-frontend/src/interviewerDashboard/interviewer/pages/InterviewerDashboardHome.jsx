// import { useOutletContext } from "react-router-dom";

// export default function InterviewerDashboardHome() {
//   const { summary } = useOutletContext();

//   const stats = summary?.stats || {};
//   const upcoming = summary?.upcoming_interviews || [];
//   const notifications = summary?.notifications || [];
//   const performance = summary?.performance || {};
//   const breakdown = summary?.session_breakdown || {};
//   const availWeek = summary?.availability_this_week || {};
//   const avgDuration = summary?.average_session_duration || {};

//   return (
//     <div className="space-y-6">
//       {/* Top stat cards */}
//       <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-4">
//         <StatCard
//           label="Total Interviews"
//           value={stats.total_interviews ?? 0}
//           caption={stats.total_interviews_change}
//         />
//         <StatCard
//           label="Average Rating"
//           value={stats.average_rating ?? "-"}
//           caption={stats.average_rating_change}
//         />
//         <StatCard
//           label="Completion Rate"
//           value={
//             typeof stats.completion_rate === "number"
//               ? `${Math.round(stats.completion_rate * 100)}%`
//               : "-"
//           }
//           caption={stats.completion_rate_note}
//         />
//         <StatCard
//           label="Total Earnings"
//           value={`$${stats.total_earnings ?? 0}`}
//           caption={stats.total_earnings_change}
//         />
//       </div>

//       {/* Middle row: upcoming + notifications */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         {/* Upcoming interviews */}
//         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
//           <div className="flex items-center justify-between mb-3">
//             <p className="text-sm font-semibold text-slate-800">
//               Upcoming Interviews
//             </p>
//             <div className="flex gap-2 text-xs text-slate-400">
//               <button className="px-2 py-1 rounded-full bg-slate-900 text-white">
//                 List
//               </button>
//               <button className="px-2 py-1 rounded-full bg-slate-100">
//                 Calendar
//               </button>
//             </div>
//           </div>
//           <div className="space-y-2">
//             {upcoming.length === 0 ? (
//               <p className="text-xs text-slate-500">
//                 No upcoming interviews yet.
//               </p>
//             ) : (
//               upcoming.map((item) => (
//                 <div
//                   key={item.id}
//                   className="flex items-center justify-between bg-slate-50 rounded-2xl px-3 py-2"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
//                       {item.candidate_name
//                         .split(" ")
//                         .map((p) => p[0])
//                         .join("")}
//                     </div>
//                     <div className="text-xs">
//                       <p className="font-semibold text-slate-800">
//                         {item.candidate_name}
//                       </p>
//                       <p className="text-slate-500">
//                         {item.type} • {item.date} • {item.time} {item.timezone}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span
//                       className={[
//                         "px-2 py-0.5 rounded-full text-[11px]",
//                         item.status === "Confirmed"
//                           ? "bg-emerald-50 text-emerald-600"
//                           : item.status === "Pending"
//                           ? "bg-amber-50 text-amber-600"
//                           : "bg-slate-100 text-slate-500",
//                       ].join(" ")}
//                     >
//                       {item.status}
//                     </span>
//                     <button className="px-3 py-1 rounded-full bg-slate-900 text-[11px] text-white">
//                       Join
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Notifications */}
//         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
//           <p className="text-sm font-semibold text-slate-800 mb-3">
//             Recent Notifications
//           </p>
//           <div className="space-y-3">
//             {notifications.length === 0 ? (
//               <p className="text-xs text-slate-500">
//                 No recent notifications.
//               </p>
//             ) : (
//               notifications.map((n) => (
//                 <div
//                   key={n.id}
//                   className="bg-slate-50 rounded-2xl px-3 py-2 text-xs"
//                 >
//                   <p className="font-semibold text-slate-800">{n.title}</p>
//                   <p className="text-slate-500">{n.description}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Bottom row: performance + small cards */}
//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* Performance */}
//         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 col-span-2">
//           <p className="text-sm font-semibold text-slate-800 mb-3">
//             Performance Trends
//           </p>
//           {/* Simple fake chart using bars */}
//           <div className="flex items-end gap-3 h-40">
//             {(performance.months || []).map((m, idx) => {
//               const value = performance.interviews?.[idx] ?? 0;
//               const max = Math.max(...(performance.interviews || [1]));
//               const height = (value / max) * 100;
//               return (
//                 <div
//                   key={m}
//                   className="flex flex-col items-center flex-1 gap-1"
//                 >
//                   <div
//                     className="w-full bg-emerald-100 rounded-t-xl"
//                     style={{ height: `${height || 5}%` }}
//                   />
//                   <span className="text-[11px] text-slate-400">{m}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Right column small cards */}
//         <div className="space-y-3">
//           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 text-xs">
//             <p className="text-sm font-semibold text-slate-800 mb-1">
//               Session Breakdown
//             </p>
//             <p className="text-slate-600">
//               Human Interviews:{" "}
//               <span className="font-semibold">
//                 {breakdown.human_interviews ?? 0}
//               </span>
//             </p>
//             <p className="text-slate-600">
//               Peer Reviews:{" "}
//               <span className="font-semibold">
//                 {breakdown.peer_reviews ?? 0}
//               </span>
//             </p>
//             <p className="text-slate-600">
//               AI‑Assisted:{" "}
//               <span className="font-semibold">
//                 {breakdown.ai_assisted ?? 0}
//               </span>
//             </p>
//           </div>

//           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 text-xs">
//             <p className="text-sm font-semibold text-slate-800 mb-1">
//               Availability This Week
//             </p>
//             <p className="text-slate-600">
//               Available Hours:{" "}
//               <span className="font-semibold">
//                 {availWeek.available_hours ?? 0}h
//               </span>
//             </p>
//             <p className="text-slate-600">
//               Booked Hours:{" "}
//               <span className="font-semibold">
//                 {availWeek.booked_hours ?? 0}h
//               </span>
//             </p>
//             <p className="text-slate-600">
//               Open Slots:{" "}
//               <span className="font-semibold">
//                 {availWeek.open_slots ?? 0}
//               </span>
//             </p>
//           </div>

//           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 text-xs">
//             <p className="text-sm font-semibold text-slate-800 mb-1">
//               Average Session Duration
//             </p>
//             <p className="text-slate-600">
//               Technical:{" "}
//               <span className="font-semibold">
//                 {avgDuration.technical ?? 0} min
//               </span>
//             </p>
//             <p className="text-slate-600">
//               Behavioral:{" "}
//               <span className="font-semibold">
//                 {avgDuration.behavioral ?? 0} min
//               </span>
//             </p>
//             <p className="text-slate-600">
//               Overall:{" "}
//               <span className="font-semibold">
//                 {avgDuration.overall ?? 0} min
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, caption }) {
//   return (
//     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 px-4 py-3">
//       <p className="text-[11px] text-slate-400 mb-1">{label}</p>
//       <p className="text-lg font-semibold text-slate-800">{value}</p>
//       {caption && (
//         <p className="text-[11px] text-emerald-600 mt-1">{caption}</p>
//       )}
//     </div>
//   );
// }























import { useOutletContext } from "react-router-dom";

export default function InterviewerDashboardHome() {
  const { summary } = useOutletContext();

  const stats = summary?.stats || {};
  const upcoming = summary?.upcoming_interviews || [];
  const notifications = summary?.notifications || [];
  const performance = summary?.performance || {};
  const breakdown = summary?.session_breakdown || {};
  const availWeek = summary?.availability_this_week || {};
  const avgDuration = summary?.average_session_duration || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-slate-800 mb-1">Dashboard</h1>
            <p className="text-slate-500 font-light">Welcome back to your interviewer portal</p>
          </div>
          {/* <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </button>
            <button className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-all shadow-lg shadow-slate-300/50">
              Schedule Interview
            </button>
          </div> */}
        </div>

        {/* Top stat cards */}
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6">
          <StatCard
            label="Total Interviews"
            value={stats.total_interviews ?? 0}
            caption={stats.total_interviews_change}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            label="Average Rating"
            value={stats.average_rating ?? "-"}
            caption={stats.average_rating_change}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
          <StatCard
            label="Completion Rate"
            value={
              typeof stats.completion_rate === "number"
                ? `${Math.round(stats.completion_rate * 100)}%`
                : "-"
            }
            caption={stats.completion_rate_note}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Total Earnings"
            value={`$${stats.total_earnings ?? 0}`}
            caption={stats.total_earnings_change}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Middle row: upcoming + notifications */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming interviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-slate-800">Upcoming Interviews</h3>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium">
                  List
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
                  Calendar
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 font-light">No upcoming interviews scheduled</p>
                </div>
              ) : (
                upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-medium text-white shadow-sm">
                        {item.candidate_name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-slate-800 mb-0.5">
                          {item.candidate_name}
                        </p>
                        <p className="text-xs text-slate-500 font-light">
                          {item.type} • {item.date} • {item.time} {item.timezone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "px-3 py-1 rounded-full text-xs font-medium",
                          item.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200",
                        ].join(" ")}
                      >
                        {item.status}
                      </span>
                      <button className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-900 transition-colors shadow-sm">
                        Join
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-slate-800">Recent Notifications</h3>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 font-light">No recent notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <p className="font-medium text-slate-800 text-sm mb-1">{n.title}</p>
                    <p className="text-xs text-slate-500 font-light">{n.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: performance + small cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-slate-800">Performance Trends</h3>
            </div>
            {/* Chart */}
            <div className="flex items-end justify-between gap-4 h-48">
              {(performance.months || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]).map((m, idx) => {
                const value = performance.interviews?.[idx] ?? Math.floor(Math.random() * 20) + 5;
                const max = Math.max(...(performance.interviews || [25]));
                const height = (value / max) * 100;
                return (
                  <div
                    key={m}
                    className="flex flex-col items-center flex-1 gap-2"
                  >
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <div
                        className="w-full bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-lg hover:from-amber-600 hover:to-amber-500 transition-all cursor-pointer shadow-sm relative group"
                        style={{ height: `${height || 10}%` }}
                      >
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {value}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-light">{m}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column small cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-slate-800">Session Breakdown</h4>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">Human Interviews</span>
                  <span className="text-sm font-medium text-slate-800">{breakdown.human_interviews ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">Peer Reviews</span>
                  <span className="text-sm font-medium text-slate-800">{breakdown.peer_reviews ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">AI‑Assisted</span>
                  <span className="text-sm font-medium text-slate-800">{breakdown.ai_assisted ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-slate-800">Availability This Week</h4>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">Available Hours</span>
                  <span className="text-sm font-medium text-slate-800">{availWeek.available_hours ?? 0}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">Booked Hours</span>
                  <span className="text-sm font-medium text-slate-800">{availWeek.booked_hours ?? 0}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">Open Slots</span>
                  <span className="text-sm font-medium text-slate-800">{availWeek.open_slots ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-slate-800">Avg. Session Duration</h4>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">Technical</span>
                  <span className="text-sm font-medium text-slate-800">{avgDuration.technical ?? 0} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">Behavioral</span>
                  <span className="text-sm font-medium text-slate-800">{avgDuration.behavioral ?? 0} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-light">Overall</span>
                  <span className="text-sm font-medium text-slate-800">{avgDuration.overall ?? 0} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, caption, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 font-light mb-2">{label}</p>
      <p className="text-2xl font-light text-slate-800 mb-1">{value}</p>
      {caption && (
        <p className="text-xs text-emerald-600 font-medium">{caption}</p>
      )}
    </div>
  );
}
























// import { useOutletContext } from "react-router-dom";

// export default function InterviewerDashboardHome() {
//   const { summary } = useOutletContext();

//   const stats = summary?.stats || {};
//   const upcoming = summary?.upcoming_interviews || [];
//   const notifications = summary?.notifications || [];
//   const performance = summary?.performance || {};
//   const breakdown = summary?.session_breakdown || {};
//   const availWeek = summary?.availability_this_week || {};
//   const avgDuration = summary?.average_session_duration || {};

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50 p-8">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-light text-neutral-800 mb-1">Dashboard</h1>
//             <p className="text-neutral-500 font-light">Welcome back to your interviewer portal</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm">
//               <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//               </svg>
//               Notifications
//             </button>
//             <button className="px-4 py-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25">
//               Schedule Interview
//             </button>
//           </div>
//         </div>

//         {/* Top stat cards */}
//         <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6">
//           <StatCard
//             label="Total Interviews"
//             value={stats.total_interviews ?? 0}
//             caption={stats.total_interviews_change}
//             bgColor="from-blue-500 to-blue-600"
//             icon={
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//             }
//           />
//           <StatCard
//             label="Average Rating"
//             value={stats.average_rating ?? "-"}
//             caption={stats.average_rating_change}
//             bgColor="from-amber-500 to-amber-600"
//             icon={
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//               </svg>
//             }
//           />
//           <StatCard
//             label="Completion Rate"
//             value={
//               typeof stats.completion_rate === "number"
//                 ? `${Math.round(stats.completion_rate * 100)}%`
//                 : "-"
//             }
//             caption={stats.completion_rate_note}
//             bgColor="from-emerald-500 to-emerald-600"
//             icon={
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             }
//           />
//           <StatCard
//             label="Total Earnings"
//             value={`$${stats.total_earnings ?? 0}`}
//             caption={stats.total_earnings_change}
//             bgColor="from-violet-500 to-violet-600"
//             icon={
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             }
//           />
//         </div>

//         {/* Middle row: upcoming + notifications */}
//         <div className="grid lg:grid-cols-2 gap-6">
//           {/* Upcoming interviews */}
//           <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
//             <div className="flex items-center justify-between mb-5">
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
//                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-base font-medium text-neutral-800">Upcoming Interviews</h3>
//               </div>
//               <div className="flex gap-2">
//                 <button className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-medium shadow-sm">
//                   List
//                 </button>
//                 <button className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-medium hover:bg-neutral-200 transition-colors">
//                   Calendar
//                 </button>
//               </div>
//             </div>
//             <div className="space-y-3">
//               {upcoming.length === 0 ? (
//                 <div className="text-center py-8">
//                   <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                     <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                   <p className="text-sm text-neutral-500 font-light">No upcoming interviews scheduled</p>
//                 </div>
//               ) : (
//                 upcoming.map((item) => (
//                   <div
//                     key={item.id}
//                     className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 hover:bg-neutral-100 transition-colors border border-neutral-100"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-xs font-medium text-white shadow-sm">
//                         {item.candidate_name
//                           .split(" ")
//                           .map((p) => p[0])
//                           .join("")}
//                       </div>
//                       <div className="text-sm">
//                         <p className="font-medium text-neutral-800 mb-0.5">
//                           {item.candidate_name}
//                         </p>
//                         <p className="text-xs text-neutral-500 font-light">
//                           {item.type} • {item.date} • {item.time} {item.timezone}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span
//                         className={[
//                           "px-3 py-1 rounded-full text-xs font-medium",
//                           item.status === "Confirmed"
//                             ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
//                             : item.status === "Pending"
//                             ? "bg-amber-50 text-amber-700 border border-amber-200"
//                             : "bg-neutral-100 text-neutral-600 border border-neutral-200",
//                         ].join(" ")}
//                       >
//                         {item.status}
//                       </span>
//                       <button className="px-4 py-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm">
//                         Join
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Notifications */}
//           <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
//             <div className="flex items-center gap-2 mb-5">
//               <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
//                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                 </svg>
//               </div>
//               <h3 className="text-base font-medium text-neutral-800">Recent Notifications</h3>
//             </div>
//             <div className="space-y-3">
//               {notifications.length === 0 ? (
//                 <div className="text-center py-8">
//                   <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                     <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                     </svg>
//                   </div>
//                   <p className="text-sm text-neutral-500 font-light">No recent notifications</p>
//                 </div>
//               ) : (
//                 notifications.map((n) => (
//                   <div
//                     key={n.id}
//                     className="bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100 hover:border-neutral-200 transition-colors"
//                   >
//                     <p className="font-medium text-neutral-800 text-sm mb-1">{n.title}</p>
//                     <p className="text-xs text-neutral-500 font-light">{n.description}</p>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Bottom row: performance + small cards */}
//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* Performance */}
//           <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 lg:col-span-2">
//             <div className="flex items-center gap-2 mb-6">
//               <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
//                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                 </svg>
//               </div>
//               <h3 className="text-base font-medium text-neutral-800">Performance Trends</h3>
//             </div>
//             {/* Chart */}
//             <div className="flex items-end justify-between gap-4 h-48">
//               {(performance.months || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]).map((m, idx) => {
//                 const value = performance.interviews?.[idx] ?? Math.floor(Math.random() * 20) + 5;
//                 const max = Math.max(...(performance.interviews || [25]));
//                 const height = (value / max) * 100;
//                 return (
//                   <div
//                     key={m}
//                     className="flex flex-col items-center flex-1 gap-2"
//                   >
//                     <div className="w-full flex flex-col items-center justify-end h-40">
//                       <div
//                         className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg hover:from-violet-600 hover:to-violet-500 transition-all cursor-pointer shadow-sm relative group"
//                         style={{ height: `${height || 10}%` }}
//                       >
//                         <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-sm">
//                           {value}
//                         </span>
//                       </div>
//                     </div>
//                     <span className="text-xs text-neutral-500 font-light">{m}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Right column small cards */}
//           <div className="space-y-4">
//             <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5">
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
//                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                   </svg>
//                 </div>
//                 <h4 className="text-sm font-medium text-neutral-800">Session Breakdown</h4>
//               </div>
//               <div className="space-y-2.5">
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">Human Interviews</span>
//                   <span className="text-sm font-medium text-neutral-800">{breakdown.human_interviews ?? 0}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">Peer Reviews</span>
//                   <span className="text-sm font-medium text-neutral-800">{breakdown.peer_reviews ?? 0}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">AI‑Assisted</span>
//                   <span className="text-sm font-medium text-neutral-800">{breakdown.ai_assisted ?? 0}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5">
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
//                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <h4 className="text-sm font-medium text-neutral-800">Availability This Week</h4>
//               </div>
//               <div className="space-y-2.5">
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">Available Hours</span>
//                   <span className="text-sm font-medium text-neutral-800">{availWeek.available_hours ?? 0}h</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">Booked Hours</span>
//                   <span className="text-sm font-medium text-neutral-800">{availWeek.booked_hours ?? 0}h</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">Open Slots</span>
//                   <span className="text-sm font-medium text-neutral-800">{availWeek.open_slots ?? 0}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5">
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
//                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <h4 className="text-sm font-medium text-neutral-800">Avg. Session Duration</h4>
//               </div>
//               <div className="space-y-2.5">
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">Technical</span>
//                   <span className="text-sm font-medium text-neutral-800">{avgDuration.technical ?? 0} min</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">Behavioral</span>
//                   <span className="text-sm font-medium text-neutral-800">{avgDuration.behavioral ?? 0} min</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-neutral-600 font-light">Overall</span>
//                   <span className="text-sm font-medium text-neutral-800">{avgDuration.overall ?? 0} min</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, caption, icon, bgColor }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
//       <div className="flex items-start justify-between mb-4">
//         <div className={`w-10 h-10 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center text-white shadow-sm`}>
//           {icon}
//         </div>
//       </div>
//       <p className="text-xs text-neutral-500 font-light mb-2">{label}</p>
//       <p className="text-2xl font-light text-neutral-800 mb-1">{value}</p>
//       {caption && (
//         <p className="text-xs text-emerald-600 font-medium">{caption}</p>
//       )}
//     </div>
//   );
// }