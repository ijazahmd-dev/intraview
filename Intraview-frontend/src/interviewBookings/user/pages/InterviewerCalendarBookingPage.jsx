import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Clock, Coins, CheckCircle, X } from 'lucide-react';
import { candidateBookingsApi } from '../../candidateBookingsApi';

const TOKEN_COST = 10;

const CalendarBookingPage = () => {
  const { interviewerId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const hasEnoughTokens = tokenBalance >= TOKEN_COST;

  // Transform slots → date summaries for calendar
  const transformSlotsToDates = (slots) => {
    if (!slots || !Array.isArray(slots)) {
      console.warn('⚠️ No slots array received:', slots);
      return [];
    }

    const dateMap = {};
    
    slots.forEach(slot => {
      // Try multiple ways to extract the date
      let date = null;
      
      if (slot.date) {
        date = slot.date;
      } else if (slot.start_time) {
        // Handle "2025-01-23 09:00:00" or "2025-01-23T09:00:00"
        date = slot.start_time.split(' ')[0].split('T')[0];
      } else if (slot.start_datetime) {
        date = slot.start_datetime.split(' ')[0].split('T')[0];
      }
      
      if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        if (!dateMap[date]) {
          dateMap[date] = { date, remaining_capacity: 0, slot_count: 0 };
        }
        dateMap[date].remaining_capacity += (slot.remaining_capacity ?? 1);
        dateMap[date].slot_count += 1;
      } else {
        console.warn('⚠️ Could not extract date from slot:', slot);
      }
    });
    
    const result = Object.values(dateMap).filter(d => d.remaining_capacity > 0);
    console.log('✅ Transformed dates:', result);
    return result;
  };

  const fetchTokenBalance = useCallback(async () => {
    try {
      const response = await candidateBookingsApi.getTokenBalance();
      setTokenBalance(response.data.token_balance);
    } catch (error) {
      console.error('Token balance fetch failed:', error);
      setTokenBalance(0);
    }
  }, []);

  const fetchAvailability = useCallback(async (date) => {
    if (!date) {
      setAvailability([]);
      return;
    }
    
    try {
      setLoadingSlots(true);
      const res = await candidateBookingsApi.getCalendarAvailability(interviewerId, date);
      console.log('🟢 Single date slots:', res.data);
      setAvailability(res.data || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setAvailability([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [interviewerId]);

  const fetchCalendarEvents = useCallback(async () => {
    try {
      console.log('🔍 Fetching calendar for interviewer:', interviewerId);
      const res = await candidateBookingsApi.getCalendarAvailability(interviewerId);
      console.log('🔍 Backend response:', res);
      console.log('🔍 Backend slots data:', res.data);
      
      const dates = transformSlotsToDates(res.data);
      console.log('🟢 Transformed dates for calendar:', dates);
      
      if (dates.length === 0) {
        console.warn('⚠️ No available dates found after transformation');
      }
      
      setAvailableDates(dates);
    } catch (error) {
      console.error('❌ Calendar events failed:', error);
      console.error('Error details:', error.response?.data);
      setAvailableDates([]);
    }
  }, [interviewerId]);

  const loadProfile = useCallback(async () => {
    try {
      const profileRes = await candidateBookingsApi.getInterviewerDetail(interviewerId);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Interviewer not found');
      navigate(-1);
    }
  }, [interviewerId, navigate]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadProfile(),
        fetchTokenBalance(),
        fetchCalendarEvents()
      ]);
      setLoading(false);
    };
    init();
  }, [loadProfile, fetchTokenBalance, fetchCalendarEvents]);

  useEffect(() => {
    fetchAvailability(selectedDate);
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
    console.log('📅 Date clicked:', dateStr, 'Available:', isDateAvailable(dateStr));
    if (isDateAvailable(dateStr)) {
      setSelectedDate(dateStr);
    } else {
      toast.info('No slots available on this date');
    }
  };

  const handleBookClick = (slot) => {
    if (!hasEnoughTokens) {
      toast.error(`Need ${TOKEN_COST} tokens (${tokenBalance} available)`);
      return;
    }
    setSelectedSlot(slot);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    try {
      setBookingLoading(true);
      const res = await candidateBookingsApi.createBooking(selectedSlot.id);
      toast.success(`✅ Booking confirmed! ${res.data.tokens_locked || TOKEN_COST} tokens locked.`);
      
      await Promise.all([
        fetchTokenBalance(),
        fetchCalendarEvents()
      ]);
      
      setBookingModalOpen(false);
      setSelectedSlot(null);
      setAvailability([]);
      navigate('/candidate/dashboard/upcoming');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <Calendar className="w-7 h-7 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{profile?.display_name || 'Booking Calendar'}</h1>
                <p className="text-sm text-slate-600">Click green dates to see available slots</p>
              </div>
            </div>
            <div className="ml-auto">
              <div className={`px-5 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 ${
                hasEnoughTokens 
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200' 
                  : 'bg-rose-100 text-rose-800 border-2 border-rose-200'
              }`}>
                <Coins className="w-5 h-5" />
                {tokenBalance} tokens
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-emerald-600" />
                Availability Calendar
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"></div>
                  <span className="font-semibold text-emerald-800">Available dates ({availableDates.length})</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span className="font-semibold text-gray-600">No availability</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-slate-100 rounded-xl transition-all hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {monthYear}
              </h3>
              <button onClick={() => changeMonth(1)} className="p-3 hover:bg-slate-100 rounded-xl transition-all hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {renderCalendar()}

            <div className="mt-12 pt-8 border-t border-slate-200 space-y-3">
              <button className="w-full py-4 px-6 border-2 border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-xl bg-white/80 backdrop-blur-sm flex items-center justify-center gap-3 text-sm font-semibold text-slate-700 transition-all hover:scale-[1.02]">
                <Calendar className="w-5 h-5" />
                Sync with Google Calendar
              </button>
              <button className="w-full py-4 px-6 border-2 border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-xl bg-white/80 backdrop-blur-sm flex items-center justify-center gap-3 text-sm font-semibold text-slate-700 transition-all hover:scale-[1.02]">
                <Calendar className="w-5 h-5" />
                Sync with Outlook
              </button>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Clock className="w-7 h-7 text-emerald-600" />
                {selectedDate ? `Available Slots - ${selectedDate}` : 'Select a Date'}
              </h2>
              {loadingSlots && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                  Loading...
                </div>
              )}
            </div>

            {selectedDate && (
              <div className="mb-8 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-sm">
                <p className="text-sm font-semibold text-emerald-800">
                  Choose your preferred time for <span className="font-bold">{selectedDate}</span>
                </p>
              </div>
            )}

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {selectedDate && availability.length === 0 && !loadingSlots ? (
                <div className="text-center py-20 text-slate-500">
                  <Calendar className="w-20 h-20 mx-auto mb-6 text-slate-200" />
                  <p className="text-2xl font-bold mb-3 text-slate-700">No slots available</p>
                  <p className="text-lg">Try clicking another green date on the calendar</p>
                </div>
              ) : !selectedDate ? (
                <div className="text-center py-20 text-slate-500">
                  <Calendar className="w-20 h-20 mx-auto mb-6 text-slate-200" />
                  <p className="text-2xl font-bold mb-3 text-slate-700">Select a date first</p>
                  <p className="text-lg">Click any green date to see available times</p>
                </div>
              ) : (
                availability.map((slot) => {
                  const capacityAvailable = slot.remaining_capacity > 0;
                  const canBook = capacityAvailable && hasEnoughTokens;
                  
                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleBookClick(slot)}
                      disabled={!canBook || bookingLoading}
                      className={`w-full p-6 rounded-3xl shadow-lg transition-all duration-300 flex items-center justify-between relative overflow-hidden group hover:shadow-2xl ${
                        canBook
                          ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-2 border-slate-700 hover:from-slate-800 hover:to-slate-800 hover:scale-[1.02] hover:-translate-y-1'
                          : 'bg-slate-100 border-2 border-slate-200 text-slate-500 cursor-not-allowed opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-4 z-10">
                        <Clock className={`w-7 h-7 ${canBook ? 'text-white' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-black text-xl tracking-wide">{slot.start_time} - {slot.end_time}</div>
                          <div className={`text-sm mt-1 font-semibold ${
                            canBook ? 'text-white/90' : 'text-slate-500'
                          }`}>
                            {slot.remaining_capacity} spots remaining
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 z-10">
                        <div className={`px-4 py-2 rounded-2xl text-xs font-black shadow-lg ${
                          canBook 
                            ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {TOKEN_COST} tokens
                        </div>
                        <CheckCircle className={`w-8 h-8 ${canBook ? 'text-white group-hover:scale-110 group-hover:rotate-12' : 'text-slate-400'}`} />
                      </div>
                      
                      {!canBook && (
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-500/30 to-slate-600/30 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-white font-black px-6 py-3 bg-slate-900/70 rounded-2xl backdrop-blur-sm shadow-2xl text-lg">
                            {capacityAvailable ? 'Low Tokens' : 'All Booked'}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {bookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-6">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-white/50">
            <div className="p-8 pb-6 border-b bg-gradient-to-r from-slate-50 to-white/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Confirm Booking
                </h2>
                <button 
                  onClick={() => setBookingModalOpen(false)} 
                  className="p-3 hover:bg-slate-100 rounded-2xl transition-all hover:scale-105 shadow-sm"
                  disabled={bookingLoading}
                >
                  <X className="w-7 h-7 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border-2 border-blue-100 shadow-xl">
                <h4 className="font-black text-xl mb-4 flex items-center gap-3 text-slate-900">
                  📅 Session Details
                </h4>
                <div className="text-3xl font-black text-slate-900 mb-2">
                  {selectedSlot.start_time} – {selectedSlot.end_time}
                </div>
                <p className="text-lg text-slate-600 font-semibold">Duration: ~30 minutes</p>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-3xl border-2 border-emerald-100 shadow-xl">
                <h4 className="font-black text-xl mb-4 flex items-center gap-3 text-slate-900">
                  💰 Payment Summary
                </h4>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-black text-emerald-700 tracking-wide">-{TOKEN_COST} tokens</span>
                  <span className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black rounded-2xl shadow-2xl text-lg border-2 border-emerald-600/50">
                    Locked
                  </span>
                </div>
                <p className="text-lg font-semibold text-emerald-800 text-center bg-emerald-100/50 p-3 rounded-2xl">
                  Remaining: <span className="text-2xl">{tokenBalance - TOKEN_COST}</span> tokens
                </p>
              </div>
            </div>
            
            <div className="p-8 pt-0 border-t bg-gradient-to-r from-slate-50 to-white/50">
              <div className="flex gap-4">
                <button 
                  onClick={() => setBookingModalOpen(false)} 
                  disabled={bookingLoading}
                  className="flex-1 py-5 px-8 border-2 border-slate-300 rounded-3xl font-black text-lg hover:bg-slate-50 hover:shadow-xl hover:border-slate-400 transition-all shadow-lg text-slate-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmBooking} 
                  disabled={bookingLoading || !hasEnoughTokens}
                  className="flex-1 py-5 px-8 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-lg rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Lock Tokens'
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

export default CalendarBookingPage;