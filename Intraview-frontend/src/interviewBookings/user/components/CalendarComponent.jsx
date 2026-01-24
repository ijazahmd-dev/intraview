import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { candidateBookingsApi } from '../../candidateBookingsApi';

const CalendarComponent = ({
  interviewerId,
  excludeSlotId = null,
  minDate = null,
  onDateSelect,
  onSlotSelect
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  
  // Transform slots → date summaries for calendar
  const transformSlotsToDates = (slots) => {
    if (!slots || !Array.isArray(slots)) return [];

    const dateMap = {};
    
    slots.forEach(slot => {
      let date = null;
      
      if (slot.date) {
        date = slot.date;
      } else if (slot.start_time) {
        date = slot.start_time.split(' ')[0].split('T')[0];
      } else if (slot.start_datetime) {
        date = slot.start_datetime.split(' ')[0].split('T')[0];
      }
      
      // 🔥 FILTER OUT EXCLUDED SLOT
      if (excludeSlotId && slot.id === excludeSlotId) {
        return; // Skip current booking slot
      }
      
      // 🔥 FILTER MIN DATE
      if (minDate && date && date < minDate) {
        return; // Skip past dates for rescheduling
      }
      
      if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        if (!dateMap[date]) {
          dateMap[date] = { date, remaining_capacity: 0, slot_count: 0 };
        }
        dateMap[date].remaining_capacity += (slot.remaining_capacity ?? 1);
        dateMap[date].slot_count += 1;
      }
    });
    
    return Object.values(dateMap).filter(d => d.remaining_capacity > 0);
  };

  const fetchAvailability = useCallback(async (date) => {
    if (!date || !interviewerId) {
      setAvailability([]);
      return;
    }
    
    try {
      setLoadingSlots(true);
      const res = await candidateBookingsApi.getCalendarAvailability(interviewerId, date);
      setAvailability(res.data || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setAvailability([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [interviewerId]);

  const fetchCalendarEvents = useCallback(async () => {
    if (!interviewerId) return;
    
    try {
      const res = await candidateBookingsApi.getCalendarAvailability(interviewerId);
      const dates = transformSlotsToDates(res.data);
      setAvailableDates(dates);
    } catch (error) {
      console.error('❌ Calendar events failed:', error);
      setAvailableDates([]);
    }
  }, [interviewerId, excludeSlotId, minDate]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, fetchAvailability]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const isDateAvailable = (dateStr) => {
    return availableDates.some(d => d.date === dateStr && d.remaining_capacity > 0);
  };

  const getDateCapacity = (dateStr) => {
    const dateInfo = availableDates.find(d => d.date === dateStr);
    return dateInfo?.remaining_capacity || 0;
  };

  const handleDateClick = (dateStr) => {
    if (isDateAvailable(dateStr)) {
      setSelectedDate(dateStr);
      onDateSelect?.(dateStr);
    } else {
      toast.info('No slots available on this date');
    }
  };

  const handleBookClick = (slot) => {
    onSlotSelect?.(slot);
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
      const isAvailable = isDateAvailable(dateStr);
      const capacity = getDateCapacity(dateStr);
      const isSelected = dateStr === selectedDate;
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(dateStr)}
          disabled={!isAvailable}
          className={`h-20 p-2 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 group hover:shadow-lg ${
            isSelected
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl scale-105 ring-4 ring-emerald-200/50'
              : isAvailable
              ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800 cursor-pointer hover:scale-105 hover:shadow-emerald-200/50 group-hover:ring-2 group-hover:ring-emerald-300'
              : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-50'
          }`}
          title={isAvailable ? `${capacity} slots available` : 'No slots'}
        >
          <div className="font-bold text-lg">{day}</div>
          {isAvailable && (
            <div className={`text-xs mt-1 font-semibold px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm ${
              isSelected ? 'text-emerald-900' : 'text-emerald-700'
            }`}>
              {capacity} slots
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

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Availability Calendar</h2>
            <p className="text-sm text-slate-600">{availableDates.length} dates available</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => changeMonth(-1)} 
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {monthYear}
          </h3>
          <button 
            onClick={() => changeMonth(1)} 
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar */}
      {renderCalendar()}

      {/* Slots List */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <Clock className="w-7 h-7 text-emerald-600" />
            {selectedDate ? `Available Slots - ${selectedDate}` : 'Select a Date'}
          </h3>
          {loadingSlots && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
        </div>

        {selectedDate && availability.length === 0 && !loadingSlots ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-semibold mb-2">No slots available</p>
            <p className="text-sm">Try clicking another green date</p>
          </div>
        ) : !selectedDate ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-semibold mb-2">Select a date first</p>
            <p className="text-sm">Click any green date to see times</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {availability.map((slot) => {
              const capacityAvailable = slot.remaining_capacity > 0;
              return (
                <button
                  key={slot.id}
                  onClick={() => handleBookClick(slot)}
                  disabled={!capacityAvailable}
                  className={`w-full p-6 rounded-3xl shadow-lg transition-all duration-300 flex items-center justify-between relative overflow-hidden group hover:shadow-2xl ${
                    capacityAvailable
                      ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-2 border-slate-700 hover:from-slate-800 hover:to-slate-800 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer'
                      : 'bg-slate-100 border-2 border-slate-200 text-slate-500 cursor-not-allowed opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-4 z-10">
                    <Clock className={`w-7 h-7 ${capacityAvailable ? 'text-white' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-black text-xl tracking-wide">{slot.start_time} - {slot.end_time}</div>
                      <div className={`text-sm mt-1 font-semibold ${
                        capacityAvailable ? 'text-white/90' : 'text-slate-500'
                      }`}>
                        {slot.remaining_capacity} spots remaining
                      </div>
                    </div>
                  </div>
                  
                  <CheckCircle className={`w-8 h-8 ${capacityAvailable ? 'text-white group-hover:scale-110 group-hover:rotate-12' : 'text-slate-400'}`} />
                  
                  {!capacityAvailable && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500/30 to-slate-600/30 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white font-black px-6 py-3 bg-slate-900/70 rounded-2xl backdrop-blur-sm shadow-2xl text-lg">
                        All Booked
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarComponent;
