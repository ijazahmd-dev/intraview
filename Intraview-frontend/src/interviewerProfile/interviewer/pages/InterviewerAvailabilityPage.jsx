// import { useEffect, useState } from "react";
// import {
//   fetchAvailability,
//   createAvailability,
//   deleteAvailability,
// } from "../../interviewerDashboardApi";

// export default function InterviewerAvailabilityPage() {
//   const [slots, setSlots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);

//   const [form, setForm] = useState({
//     date: "",
//     start_time: "",
//     end_time: "",
//     timezone: "Asia/Kolkata",
//     is_recurring: false,
//     recurrence_type: "WEEKLY",
//     recurrence_end_date: "",
//   });

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       try {
//         const { data } = await fetchAvailability();
//         if (!mounted) return;
//         setSlots(data || []);
//       } catch {
//         setError("Failed to load availability.");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleChange = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);
//     try {
//       const payload = {
//         ...form,
//         is_recurring: Boolean(form.is_recurring),
//       };
//       if (!payload.is_recurring) {
//         delete payload.recurrence_type;
//         delete payload.recurrence_end_date;
//       }
//       await createAvailability(payload);
//       const { data } = await fetchAvailability();
//       setSlots(data || []);
//     } catch (err) {
//       setError("Failed to add availability.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     await deleteAvailability(id);
//     const { data } = await fetchAvailability();
//     setSlots(data || []);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
//         <div>
//           <p className="text-sm font-semibold text-slate-800">
//             Manage Availability
//           </p>
//           <p className="text-xs text-slate-500">
//             Control when candidates can book sessions with you.
//           </p>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 gap-6">
//         {/* Left: form */}
//         <form
//           onSubmit={handleCreate}
//           className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-4"
//         >
//           <div>
//             <label className="block text-xs font-medium text-slate-600 mb-1">
//               Timezone
//             </label>
//             <select
//               value={form.timezone}
//               onChange={(e) => handleChange("timezone", e.target.value)}
//               className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             >
//               <option value="Asia/Kolkata">India Standard Time (IST)</option>
//               <option value="UTC">UTC</option>
//               <option value="America/New_York">Eastern Time (ET)</option>
//               <option value="Europe/London">Europe/London</option>
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-medium text-slate-600 mb-1">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={form.date}
//                 onChange={(e) => handleChange("date", e.target.value)}
//                 className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-slate-600 mb-1">
//                 Start time
//               </label>
//               <input
//                 type="time"
//                 value={form.start_time}
//                 onChange={(e) => handleChange("start_time", e.target.value)}
//                 className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-medium text-slate-600 mb-1">
//                 End time
//               </label>
//               <input
//                 type="time"
//                 value={form.end_time}
//                 onChange={(e) => handleChange("end_time", e.target.value)}
//                 className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//             </div>
//             <div className="flex items-end">
//               <label className="inline-flex items-center gap-2 text-xs text-slate-600">
//                 <input
//                   type="checkbox"
//                   checked={form.is_recurring}
//                   onChange={(e) => handleChange("is_recurring", e.target.checked)}
//                 />
//                 Set as recurring
//               </label>
//             </div>
//           </div>

//           {form.is_recurring && (
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-slate-600 mb-1">
//                   Recurs
//                 </label>
//                 <select
//                   value={form.recurrence_type}
//                   onChange={(e) =>
//                     handleChange("recurrence_type", e.target.value)
//                   }
//                   className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 >
//                   <option value="DAILY">Daily</option>
//                   <option value="WEEKLY">Weekly</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-slate-600 mb-1">
//                   Until
//                 </label>
//                 <input
//                   type="date"
//                   value={form.recurrence_end_date}
//                   onChange={(e) =>
//                     handleChange("recurrence_end_date", e.target.value)
//                   }
//                   className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>
//             </div>
//           )}

//           {error && (
//             <p className="text-xs text-red-600">{error}</p>
//           )}

//           <button
//             type="submit"
//             disabled={saving}
//             className="mt-2 px-4 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
//           >
//             {saving ? "Adding..." : "Add Slot"}
//           </button>
//         </form>

//         {/* Right: list of slots */}
//         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
//           <p className="text-sm font-semibold text-slate-800 mb-3">
//             Existing Time Slots
//           </p>
//           {loading ? (
//             <p className="text-xs text-slate-500">Loading...</p>
//           ) : slots.length === 0 ? (
//             <p className="text-xs text-slate-500">
//               No availability added yet.
//             </p>
//           ) : (
//             <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
//               {slots.map((slot) => (
//                 <div
//                   key={slot.id}
//                   className="flex items-center justify-between bg-slate-50 rounded-2xl px-3 py-2"
//                 >
//                   <div>
//                     <p className="font-semibold text-slate-800">
//                       {slot.date} • {slot.start_time}–{slot.end_time}
//                     </p>
//                     <p className="text-slate-500 text-[11px]">
//                       {slot.timezone} {slot.is_recurring ? "• Recurring" : ""}
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => handleDelete(slot.id)}
//                     className="text-[11px] text-red-500 hover:text-red-600"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




















import { useEffect, useState } from "react";
import {
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from "../../../interviewerDashboard/interviewerDashboardApi";

export default function InterviewerAvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    timezone: "Asia/Kolkata",
    is_recurring: false,
    recurrence_type: "WEEKLY",
    recurrence_end_date: "",
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await fetchAvailability();
        if (!mounted) return;
        setSlots(data || []);
      } catch {
        setError("Failed to load availability.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        is_recurring: Boolean(form.is_recurring),
      };
      if (!payload.is_recurring) {
        delete payload.recurrence_type;
        delete payload.recurrence_end_date;
      }
      await createAvailability(payload);
      const { data } = await fetchAvailability();
      setSlots(data || []);
      // Reset form
      setForm({
        date: "",
        start_time: "",
        end_time: "",
        timezone: form.timezone,
        is_recurring: false,
        recurrence_type: "WEEKLY",
        recurrence_end_date: "",
      });
    } catch (err) {
      setError("Failed to add availability.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAvailability(id);
      const { data } = await fetchAvailability();
      setSlots(data || []);
    } catch {
      setError("Failed to delete slot.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-800">Manage Availability</h2>
            <p className="text-sm text-slate-500 font-light">Control when candidates can book sessions with you</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Add Availability Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-slate-800">Add Time Slot</h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timezone
              </label>
              <select
                value={form.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_recurring}
                  onChange={(e) => handleChange("is_recurring", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-2 focus:ring-slate-300"
                />
                <div>
                  <span className="text-sm font-medium text-slate-800">Set as recurring slot</span>
                  <p className="text-xs text-slate-500 font-light">Automatically repeat this time slot</p>
                </div>
              </label>
            </div>

            {form.is_recurring && (
              <div className="space-y-4 pl-4 border-l-2 border-amber-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Recurrence Pattern
                    </label>
                    <select
                      value={form.recurrence_type}
                      onChange={(e) => handleChange("recurrence_type", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={form.recurrence_end_date}
                      onChange={(e) => handleChange("recurrence_end_date", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 rounded-xl bg-slate-800 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-300/50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Slot...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Time Slot
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Existing Slots List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-slate-800">Your Time Slots</h3>
              <p className="text-xs text-slate-500 font-light">{slots.length} slot{slots.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-sm text-slate-500 font-light">Loading slots...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-800 mb-1">No availability added yet</p>
              <p className="text-xs text-slate-500 font-light">Add your first time slot to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="group bg-slate-50 hover:bg-slate-100 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="font-medium text-slate-800 text-sm">
                          {new Date(slot.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-slate-700">
                          {slot.start_time} – {slot.end_time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{slot.timezone}</span>
                        {slot.is_recurring && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Recurring {slot.recurrence_type?.toLowerCase()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(slot.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600"
                      title="Delete slot"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}