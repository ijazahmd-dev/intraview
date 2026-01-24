// // src/components/InterviewerCalendarComponent.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { ArrowLeft, ArrowRight, CalendarDays, Clock, X, Check } from 'lucide-react';
// import { toast } from 'sonner';
// import { fetchAvailability } from '../../../interviewerDashboard/interviewerDashboardApi'; // ✅ SAME API

// const InterviewerCalendarComponent = ({ 
//   excludeSlotId = null,  // Exclude current booking slot for reschedule
//   onSlotSelect,          // Callback when slot clicked
//   selectedDate: externalSelectedDate,
//   onDateSelect,
//   className = ""
// }) => {
//   const [availabilities, setAvailabilities] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(externalSelectedDate || null);
//   const [loading, setLoading] = useState(true);
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   // 🔥 EXACT SAME loadAvailabilities from your AvailabilityPage
//   const loadAvailabilities = useCallback(async () => {
//     try {
//       setLoading(true);
//       const { data } = await fetchAvailability(); // ✅ YOUR EXISTING API
//       console.log('📊 Loaded availabilities:', data);
      
//       // Filter out excluded slot (for reschedule)
//       const filteredSlots = excludeSlotId 
//         ? data.filter(slot => slot.id !== excludeSlotId) 
//         : data;
//       setAvailabilities(filteredSlots);
//     } catch (error) {
//       console.error('Failed to load availability:', error);
//       toast.error('Failed to load availability');
//     } finally {
//       setLoading(false);
//     }
//   }, [excludeSlotId]);

//   useEffect(() => {
//     loadAvailabilities();
//   }, [loadAvailabilities]);

//   // 🔥 EXACT SAME functions from your AvailabilityPage
//   const getDaysInMonth = (date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();
//     const startingDayOfWeek = firstDay.getDay();
//     return { daysInMonth, startingDayOfWeek };
//   };

//   const getDateStatus = (dateStr) => {
//     const slots = availabilities.filter(s => s.date === dateStr);
//     if (slots.length === 0) return null;
    
//     const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);
//     const hasBookings = slots.some(s => (s.bookings_count || 0) > 0);
    
//     return {
//       type: isPast ? 'past' : hasBookings ? 'booked' : 'available',
//       count: slots.length,
//       slots: slots  // 🔥 Added for slot selection
//     };
//   };

//   const handleDateClick = (dateStr) => {
//     setSelectedDate(dateStr);
//     onDateSelect?.(dateStr);
//   };

//   const handleSlotClick = (slot) => {
//     if ((slot.bookings_count || 0) > 0) {
//       toast.error('Slot already booked');
//       return;
//     }
//     onSlotSelect?.(slot);
//     toast.success(`Selected: ${slot.start_time} - ${slot.end_time}`);
//   };

//   const changeMonth = (offset) => {
//     setCurrentMonth(prev => {
//       const newDate = new Date(prev);
//       newDate.setMonth(newDate.getMonth() + offset);
//       return newDate;
//     });
//   };

//   const renderCalendar = () => {
//     const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const days = [];
//     const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
//     for (let i = 0; i < startingDayOfWeek; i++) {
//       days.push(<div key={`empty-${i}`} className="h-20" />);
//     }
    
//     for (let day = 1; day <= daysInMonth; day++) {
//       const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//       const status = getDateStatus(dateStr);
//       const isSelected = dateStr === selectedDate;
//       const isToday = dateStr === new Date().toISOString().split('T')[0];
      
//       let bgColor = 'bg-white hover:bg-slate-50';
//       let borderColor = 'border-slate-200';
//       let textColor = 'text-slate-900';
      
//       if (status) {
//         if (status.type === 'past') {
//           bgColor = 'bg-gray-100';
//           borderColor = 'border-gray-300';
//           textColor = 'text-gray-500';
//         } else if (status.type === 'booked') {
//           bgColor = 'bg-orange-50 hover:bg-orange-100';
//           borderColor = 'border-orange-300';
//           textColor = 'text-orange-900';
//         } else {
//           bgColor = 'bg-emerald-50 hover:bg-emerald-100';
//           borderColor = 'border-emerald-300';
//           textColor = 'text-emerald-900';
//         }
//       }
      
//       if (isSelected) {
//         borderColor = 'border-indigo-500 ring-2 ring-indigo-200';
//       }
      
//       days.push(
//         <button
//           key={day}
//           onClick={() => handleDateClick(dateStr)}
//           className={`h-20 p-2 border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${bgColor} ${borderColor} ${textColor} hover:shadow-md relative`}
//           disabled={status?.type === 'past'}
//         >
//           <div className={`font-bold text-lg ${isToday ? 'bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center' : ''}`}>
//             {day}
//           </div>
//           {status && (
//             <div className={`text-xs mt-1 font-semibold px-2 py-0.5 rounded-full ${
//               status.type === 'past' ? 'bg-gray-200 text-gray-700' :
//               status.type === 'booked' ? 'bg-orange-200 text-orange-800' :
//               'bg-emerald-200 text-emerald-800'
//             }`}>
//               {status.count} slot{status.count > 1 ? 's' : ''}
//             </div>
//           )}
//         </button>
//       );
//     }
    
//     return (
//       <div className="space-y-4">
//         <div className="grid grid-cols-7 gap-2 mb-4">
//           {weekDays.map(day => (
//             <div key={day} className="text-center text-sm font-bold text-gray-700 py-3 bg-gray-50 rounded-lg">
//               {day}
//             </div>
//           ))}
//         </div>
//         <div className="grid grid-cols-7 gap-2">
//           {days}
//         </div>
//       </div>
//     );
//   };

//   const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//   const selectedDateSlots = selectedDate ? availabilities.filter(s => s.date === selectedDate) : [];

//   if (loading) {
//     return (
//       <div className={`flex items-center justify-center h-96 ${className}`}>
//         <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className={`space-y-8 ${className}`}>
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
//           <CalendarDays className="w-8 h-8 text-emerald-600" />
//           Select New Time Slot
//         </h3>
//         <div className="text-sm text-slate-600">
//           {availabilities.length} slots loaded
//         </div>
//       </div>

//       {/* Legend */}
//       <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
//         <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
//           <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
//           <span className="font-semibold text-emerald-800">Available</span>
//         </div>
//         <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-200">
//           <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
//           <span className="font-semibold text-orange-800">Booked</span>
//         </div>
//         <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
//           <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
//           <span className="font-semibold text-gray-700">Past</span>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-10">
//         {/* Calendar */}
//         <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
//           <div className="flex items-center justify-between mb-8">
//             <button 
//               onClick={() => changeMonth(-1)} 
//               className="p-3 hover:bg-slate-100 rounded-xl transition-all"
//               disabled={loading}
//             >
//               <ArrowLeft className="w-6 h-6" />
//             </button>
//             <h4 className="text-2xl font-bold">{monthYear}</h4>
//             <button 
//               onClick={() => changeMonth(1)} 
//               className="p-3 hover:bg-slate-100 rounded-xl transition-all"
//               disabled={loading}
//             >
//               <ArrowRight className="w-6 h-6" />
//             </button>
//           </div>
//           {renderCalendar()}
//         </div>

//         {/* Slots */}
//         <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
//           <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
//             <Clock className="w-6 h-6 text-emerald-600" />
//             {selectedDate ? `Slots - ${selectedDate}` : 'Select a Date'}
//           </h4>

//           {!selectedDate ? (
//             <div className="text-center py-20">
//               <CalendarDays className="w-24 h-24 mx-auto mb-6 text-slate-300" />
//               <h3 className="text-2xl font-bold text-slate-700 mb-2">Click a date</h3>
//               <p className="text-lg text-slate-500">Select a date to view available slots</p>
//             </div>
//           ) : (
//             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
//               {selectedDateSlots.map(slot => {
//                 const isPast = new Date(slot.date) < new Date().setHours(0, 0, 0, 0);
//                 const hasBookings = (slot.bookings_count || 0) > 0;
                
//                 return (
//                   <button
//                     key={slot.id}
//                     onClick={() => handleSlotClick(slot)}
//                     disabled={isPast || hasBookings}
//                     className={`w-full p-6 rounded-2xl shadow-lg border-2 transition-all group ${
//                       isPast 
//                         ? 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-50' 
//                         : hasBookings 
//                         ? 'bg-orange-50 border-orange-300 cursor-not-allowed hover:border-orange-400' 
//                         : 'bg-emerald-50 border-emerald-300 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
//                     }`}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-3">
//                           <Clock className={`w-6 h-6 transition-all ${
//                             isPast ? 'text-gray-400' : hasBookings ? 'text-orange-500' : 'text-emerald-600 group-hover:scale-110'
//                           }`} />
//                           <div>
//                             <p className="font-bold text-xl text-slate-900 group-hover:text-emerald-700">
//                               {slot.start_time} - {slot.end_time}
//                             </p>
//                             <p className="text-sm text-slate-500">{slot.timezone}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-3 text-sm">
//                           <span className={`px-3 py-1 rounded-full font-semibold transition-all ${
//                             isPast 
//                               ? 'bg-gray-200 text-gray-700' 
//                               : hasBookings 
//                               ? 'bg-orange-200 text-orange-800' 
//                               : 'bg-emerald-200 text-emerald-800 group-hover:bg-emerald-300 group-hover:scale-105'
//                           }`}>
//                             {isPast ? 'Past' : hasBookings ? `${slot.bookings_count} Booked` : 'Available'}
//                           </span>
//                           {slot.is_recurring && (
//                             <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
//                               Recurring
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </button>
//                 );
//               })}
              
//               {selectedDateSlots.length === 0 && (
//                 <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-2xl">
//                   <Clock className="w-20 h-20 mx-auto mb-4 text-slate-300" />
//                   <h3 className="text-xl font-bold text-slate-700 mb-2">No slots available</h3>
//                   <p className="text-slate-500 mb-6">No time slots configured for this date</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InterviewerCalendarComponent;
