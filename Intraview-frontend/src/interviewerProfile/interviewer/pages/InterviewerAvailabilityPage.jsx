



// import { useEffect, useState } from "react";
// import {
//   fetchAvailability,
//   createAvailability,
//   deleteAvailability,
// } from "../../../interviewerDashboard/interviewerDashboardApi";

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
//       // Reset form
//       setForm({
//         date: "",
//         start_time: "",
//         end_time: "",
//         timezone: form.timezone,
//         is_recurring: false,
//         recurrence_type: "WEEKLY",
//         recurrence_end_date: "",
//       });
//     } catch (err) {
//       setError("Failed to add availability.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await deleteAvailability(id);
//       const { data } = await fetchAvailability();
//       setSlots(data || []);
//     } catch {
//       setError("Failed to delete slot.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 p-8">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
//             <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//           </div>
//           <div>
//             <h2 className="text-lg font-medium text-slate-800">Manage Availability</h2>
//             <p className="text-sm text-slate-500 font-light">Control when candidates can book sessions with you</p>
//           </div>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         {/* Left: Add Availability Form */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//           <div className="flex items-center gap-2 mb-6">
//             <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
//               <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//               </svg>
//             </div>
//             <h3 className="text-base font-medium text-slate-800">Add Time Slot</h3>
//           </div>

//           <form onSubmit={handleCreate} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Timezone
//               </label>
//               <select
//                 value={form.timezone}
//                 onChange={(e) => handleChange("timezone", e.target.value)}
//                 className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
//               >
//                 <option value="Asia/Kolkata">India Standard Time (IST)</option>
//                 <option value="UTC">UTC</option>
//                 <option value="America/New_York">Eastern Time (ET)</option>
//                 <option value="America/Los_Angeles">Pacific Time (PT)</option>
//                 <option value="Europe/London">Europe/London (GMT)</option>
//                 <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
//                 <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={form.date}
//                 onChange={(e) => handleChange("date", e.target.value)}
//                 required
//                 className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Start Time
//                 </label>
//                 <input
//                   type="time"
//                   value={form.start_time}
//                   onChange={(e) => handleChange("start_time", e.target.value)}
//                   required
//                   className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   End Time
//                 </label>
//                 <input
//                   type="time"
//                   value={form.end_time}
//                   onChange={(e) => handleChange("end_time", e.target.value)}
//                   required
//                   className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
//                 />
//               </div>
//             </div>

//             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={form.is_recurring}
//                   onChange={(e) => handleChange("is_recurring", e.target.checked)}
//                   className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-2 focus:ring-slate-300"
//                 />
//                 <div>
//                   <span className="text-sm font-medium text-slate-800">Set as recurring slot</span>
//                   <p className="text-xs text-slate-500 font-light">Automatically repeat this time slot</p>
//                 </div>
//               </label>
//             </div>

//             {form.is_recurring && (
//               <div className="space-y-4 pl-4 border-l-2 border-amber-200">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       Recurrence Pattern
//                     </label>
//                     <select
//                       value={form.recurrence_type}
//                       onChange={(e) => handleChange("recurrence_type", e.target.value)}
//                       className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
//                     >
//                       <option value="DAILY">Daily</option>
//                       <option value="WEEKLY">Weekly</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       End Date
//                     </label>
//                     <input
//                       type="date"
//                       value={form.recurrence_end_date}
//                       onChange={(e) => handleChange("recurrence_end_date", e.target.value)}
//                       className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {error && (
//               <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
//                 <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//                 <p className="text-sm text-red-700 font-medium">{error}</p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={saving}
//               className="w-full px-6 py-3 rounded-xl bg-slate-800 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-300/50 flex items-center justify-center gap-2"
//             >
//               {saving ? (
//                 <>
//                   <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Adding Slot...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                   </svg>
//                   Add Time Slot
//                 </>
//               )}
//             </button>
//           </form>
//         </div>

//         {/* Right: Existing Slots List */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//           <div className="flex items-center gap-2 mb-6">
//             <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
//               <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
//               </svg>
//             </div>
//             <div className="flex-1">
//               <h3 className="text-base font-medium text-slate-800">Your Time Slots</h3>
//               <p className="text-xs text-slate-500 font-light">{slots.length} slot{slots.length !== 1 ? 's' : ''} available</p>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-12">
//               <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
//                 <svg className="w-6 h-6 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//               </div>
//               <p className="text-sm text-slate-500 font-light">Loading slots...</p>
//             </div>
//           ) : slots.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
//                 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//               <p className="text-sm font-medium text-slate-800 mb-1">No availability added yet</p>
//               <p className="text-xs text-slate-500 font-light">Add your first time slot to get started</p>
//             </div>
//           ) : (
//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {slots.map((slot) => (
//                 <div
//                   key={slot.id}
//                   className="group bg-slate-50 hover:bg-slate-100 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all"
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                         <p className="font-medium text-slate-800 text-sm">
//                           {new Date(slot.date).toLocaleDateString('en-US', { 
//                             weekday: 'short', 
//                             month: 'short', 
//                             day: 'numeric',
//                             year: 'numeric'
//                           })}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2 mb-2">
//                         <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <p className="text-sm text-slate-700">
//                           {slot.start_time} – {slot.end_time}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2 text-xs text-slate-500">
//                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <span>{slot.timezone}</span>
//                         {slot.is_recurring && (
//                           <>
//                             <span>•</span>
//                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
//                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                               </svg>
//                               Recurring {slot.recurrence_type?.toLowerCase()}
//                             </span>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => handleDelete(slot.id)}
//                       className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600"
//                       title="Delete slot"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//     </div>
//   );
// }

































import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Clock, CalendarDays, Trash2, Lock, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAvailability, createAvailability, deleteAvailability } from '../../../interviewerDashboard/interviewerDashboardApi';

const InterviewerAvailabilityPage = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    timezone: 'Asia/Kolkata',
    is_recurring: false,
    recurrence_type: 'WEEKLY',
    recurrence_end_date: '',
  });

  const loadAvailabilities = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await fetchAvailability();
      console.log('📊 Loaded availabilities:', data);
      setAvailabilities(data || []);
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailabilities();
  }, [loadAvailabilities]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const getDateStatus = (dateStr) => {
    const slots = availabilities.filter(s => s.date === dateStr);
    if (slots.length === 0) return null;
    
    const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);
    const hasBookings = slots.some(s => (s.bookings_count || 0) > 0);
    
    return {
      type: isPast ? 'past' : hasBookings ? 'booked' : 'available',
      count: slots.length
    };
  };

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setForm(prev => ({ ...prev, date: dateStr }));
  };

  const handleCreateClick = () => {
    if (!selectedDate) {
      toast.error('Please select a date first');
      return;
    }
    setForm(prev => ({ ...prev, date: selectedDate }));
    setShowCreateModal(true);
  };

  const handleFormContinue = () => {
    if (!form.date || !form.start_time || !form.end_time) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.start_time >= form.end_time) {
      toast.error('Start time must be before end time');
      return;
    }
    if (form.is_recurring && !form.recurrence_end_date) {
      toast.error('Please select recurring end date');
      return;
    }
    setShowCreateModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    setSaving(true);
    try {
      const payload = {
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        timezone: form.timezone,
        is_recurring: form.is_recurring,
      };
      
      if (form.is_recurring) {
        payload.recurrence_type = form.recurrence_type;
        payload.recurrence_end_date = form.recurrence_end_date;
      }
      
      console.log('📤 Creating availability:', payload);
      const response = await createAvailability(payload);
      console.log('✅ Created:', response.data);
      
      toast.success(response.data.message || 'Availability created successfully!');
      setShowConfirmModal(false);
      await loadAvailabilities();
      
      // Reset form
      setForm({
        date: selectedDate || '',
        start_time: '',
        end_time: '',
        timezone: 'Asia/Kolkata',
        is_recurring: false,
        recurrence_type: 'WEEKLY',
        recurrence_end_date: '',
      });
    } catch (error) {
      console.error('❌ Create failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to create availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId, hasBookings) => {
    if (hasBookings) {
      toast.error('Cannot delete slots with bookings');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      console.log('🗑️ Deleting slot:', slotId);
      await deleteAvailability(slotId);
      toast.success('Slot deleted successfully');
      await loadAvailabilities();
    } catch (error) {
      console.error('❌ Delete failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete slot');
    }
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = getDateStatus(dateStr);
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      let bgColor = 'bg-white hover:bg-slate-50';
      let borderColor = 'border-slate-200';
      let textColor = 'text-slate-900';
      
      if (status) {
        if (status.type === 'past') {
          bgColor = 'bg-gray-100';
          borderColor = 'border-gray-300';
          textColor = 'text-gray-500';
        } else if (status.type === 'booked') {
          bgColor = 'bg-orange-50 hover:bg-orange-100';
          borderColor = 'border-orange-300';
          textColor = 'text-orange-900';
        } else {
          bgColor = 'bg-emerald-50 hover:bg-emerald-100';
          borderColor = 'border-emerald-300';
          textColor = 'text-emerald-900';
        }
      }
      
      if (isSelected) {
        borderColor = 'border-indigo-500 ring-2 ring-indigo-200';
      }
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(dateStr)}
          className={`h-20 p-2 border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${bgColor} ${borderColor} ${textColor} hover:shadow-md relative`}
        >
          <div className={`font-bold text-lg ${isToday ? 'bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center' : ''}`}>
            {day}
          </div>
          {status && (
            <div className={`text-xs mt-1 font-semibold px-2 py-0.5 rounded-full ${
              status.type === 'past' ? 'bg-gray-200 text-gray-700' :
              status.type === 'booked' ? 'bg-orange-200 text-orange-800' :
              'bg-emerald-200 text-emerald-800'
            }`}>
              {status.count} slot{status.count > 1 ? 's' : ''}
            </div>
          )}
        </button>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-bold text-gray-700 py-3 bg-gray-50 rounded-lg">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDateSlots = selectedDate ? availabilities.filter(s => s.date === selectedDate) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-2xl transition-all">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Availability Calendar
                </h1>
                <p className="text-slate-600 mt-1">{availabilities.length} time slots configured</p>
              </div>
            </div>
            <button
              onClick={handleCreateClick}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Slot
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Calendar */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <CalendarDays className="w-8 h-8 text-emerald-600" />
                Select Date
              </h2>
              
              <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="font-semibold text-emerald-800">Available</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="font-semibold text-orange-800">Booked</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span className="font-semibold text-gray-700">Past</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold">{monthYear}</h3>
              <button onClick={() => changeMonth(1)} className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {renderCalendar()}
          </div>

          {/* Right: Slots */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Clock className="w-8 h-8 text-emerald-600" />
                {selectedDate ? `Slots - ${selectedDate}` : 'Select a Date'}
              </h2>
            </div>

            {!selectedDate ? (
              <div className="text-center py-20">
                <CalendarDays className="w-24 h-24 mx-auto mb-6 text-slate-300" />
                <h3 className="text-2xl font-bold text-slate-700 mb-2">Click a date</h3>
                <p className="text-lg text-slate-500">Select a date to manage time slots</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {selectedDateSlots.map(slot => {
                  const isPast = new Date(slot.date) < new Date().setHours(0, 0, 0, 0);
                  const hasBookings = (slot.bookings_count || 0) > 0;
                  
                  return (
                    <div
                      key={slot.id}
                      className={`p-6 rounded-2xl shadow-lg border-2 transition-all group ${
                        isPast 
                          ? 'bg-gray-50 border-gray-300' 
                          : hasBookings 
                          ? 'bg-orange-50 border-orange-300 hover:border-orange-400' 
                          : 'bg-emerald-50 border-emerald-300 hover:border-emerald-400 hover:shadow-xl'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Clock className={`w-6 h-6 ${
                              isPast ? 'text-gray-400' : hasBookings ? 'text-orange-500' : 'text-emerald-600'
                            }`} />
                            <div>
                              <p className="font-bold text-xl text-slate-900">
                                {slot.start_time} - {slot.end_time}
                              </p>
                              <p className="text-sm text-slate-500">{slot.timezone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`px-3 py-1 rounded-full font-semibold ${
                              isPast 
                                ? 'bg-gray-200 text-gray-700' 
                                : hasBookings 
                                ? 'bg-orange-200 text-orange-800' 
                                : 'bg-emerald-200 text-emerald-800'
                            }`}>
                              {isPast ? 'Past' : hasBookings ? `${slot.bookings_count} Booked` : 'Available'}
                            </span>
                            {slot.is_recurring && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                                Recurring
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!isPast && !hasBookings ? (
                            <button
                              onClick={() => handleDelete(slot.id, hasBookings)}
                              className="p-2 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-700 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          ) : hasBookings ? (
                            <div className="p-2 text-orange-500">
                              <Lock className="w-5 h-5" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {selectedDateSlots.length === 0 && (
                  <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-2xl">
                    <Clock className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No slots yet</h3>
                    <p className="text-slate-500 mb-6">Add your first time slot for this date</p>
                    <button
                      onClick={handleCreateClick}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Slot
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8 pb-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Add Time Slot</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Start Time</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">End Time</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Timezone</label>
                <select
                  value={form.timezone}
                  onChange={e => setForm({ ...form, timezone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_recurring}
                    onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                    className="w-5 h-5 rounded border-purple-300 text-purple-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">Make Recurring</span>
                    <p className="text-sm text-slate-600">Repeat this slot automatically</p>
                  </div>
                </label>

                {form.is_recurring && (
                  <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Pattern</label>
                      <select
                        value={form.recurrence_type}
                        onChange={e => setForm({ ...form, recurrence_type: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={form.recurrence_end_date}
                        onChange={e => setForm({ ...form, recurrence_end_date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-2xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormContinue}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">Confirm Availability</h2>
              
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl mb-6">
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-bold text-lg">{form.date}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Start Time</p>
                    <p className="font-bold">{form.start_time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">End Time</p>
                    <p className="font-bold">{form.end_time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Timezone</p>
                  <p className="font-bold">{form.timezone}</p>
                </div>
                {form.is_recurring && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-2">Recurring</p>
                    <p className="font-bold">{form.recurrence_type}</p>
                    <p className="text-sm text-slate-600 mt-2">Until: {form.recurrence_end_date}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowCreateModal(true);
                  }}
                  disabled={saving}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-2xl font-semibold hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Confirm & Create'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerAvailabilityPage;