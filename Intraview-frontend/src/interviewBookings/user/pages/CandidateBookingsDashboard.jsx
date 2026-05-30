


import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { candidateBookingsApi } from '../../candidateBookingsApi';
import { INTERVIEW_TYPE_LABELS } from '../components/SessionConfigModal';
import CandidateNavbar from '../../../components/CandidateNavbar';
import CandidateFooter from '../../../components/CandidateFooter';

const CandidateBookingsDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      console.log('🔥 fetchBookings STARTED - tab:', activeTab);
      setLoading(true);

      let res;
      if (activeTab === 'upcoming') {
        res = await candidateBookingsApi.getUpcomingBookings();
      } else {
        res = await candidateBookingsApi.getPastBookings();
      }

      console.log('✅ RAW API DATA:', res.data);
      setBookings(res.data || []);

    } catch (error) {
      console.error('💥 ERROR:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 🔥 FIXED FILTERING - Handle missing/undefined fields
  const filteredBookings = bookings.filter(booking => {
    const interviewerName = booking.interviewer_name || booking.interviewer__interviewer_profile__display_name || '';
    const startDateTime = booking.start_datetime || '';

    const matchesSearch = interviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startDateTime.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || booking.interview_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleBookingClick = (bookingId) => {
    navigate(`/candidate/bookings-detail/${bookingId}`);
  };

  // 🔥 BookingStatusBadge Component
  const BookingStatusBadge = ({ status }) => {
    console.log('🔥 Status from API:', status, typeof status);

    const statusConfig = {
      'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
      'CONFIRMED': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
      'pending': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
      'PENDING': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
      'completed': { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completed' },
      'COMPLETED': { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completed' },
      'cancelled': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
      'CANCELLED': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
      'cancelled_by_candidate': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
      'CANCELLED_BY_CANDIDATE': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
    };

    const config = statusConfig[status?.toLowerCase()] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Unknown'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // 🔥 NEW SessionCard with Timer + Join + Reschedule + Pending Reschedule Banner
  const SessionCard = ({ booking }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLive, setIsLive] = useState(false);

    // NEW: pending reschedule info from backend
    const hasPendingReschedule = booking.reschedule_status === 'PENDING';
    const proposedSlot = booking.proposed_slot || null;
    const rescheduleNote = booking.reschedule_note || '';

    // 🔥 COUNTDOWN TIMER + LIVE STATUS
    useEffect(() => {
      const now = new Date();
      const startTime = new Date(booking.start_datetime);
      const endTime = booking.end_datetime ?
        new Date(booking.end_datetime) :
        new Date(startTime.getTime() + 30 * 60 * 1000); // Default 30min

      const updateTimer = () => {
        const now = new Date();
        const diffToStart = startTime - now;
        const diffToEnd = endTime - now;

        if (diffToStart <= 0 && diffToEnd > 0) {
          // LIVE SESSION
          setIsLive(true);
          setTimeLeft('LIVE NOW');
        } else if (diffToEnd <= 0) {
          // ENDED
          setIsLive(false);
          setTimeLeft('ENDED');
        } else {
          // COUNTDOWN
          const hours = Math.floor(diffToStart / (1000 * 60 * 60));
          const minutes = Math.floor((diffToStart / (1000 * 60)) % 60);
          const seconds = Math.floor((diffToStart / 1000) % 60);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      };

      const interval = setInterval(updateTimer, 1000);
      updateTimer(); // Initial call
      return () => clearInterval(interval);
    }, [booking.start_datetime, booking.end_datetime]);

    const formatTime = (timeString) => {
      if (!timeString) return 'Time unavailable';
      try {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', hour12: true
        });
      } catch {
        return timeString;
      }
    };

    const getFormattedDate = (dateString) => {
      if (!dateString) return 'Date unavailable';
      try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    const canReschedule =
      booking.status === 'CONFIRMED' &&
      new Date(booking.start_datetime) > new Date() &&
      !hasPendingReschedule; // disable if request is already pending

    const isUpcoming = new Date(booking.start_datetime) > new Date();

    const handleJoinClick = (e) => {
      e.stopPropagation();
      if (isLive) {
        navigate(`/interview/room/${booking.id}`);
      } else {
        toast.info(`Session starts in ${timeLeft}`);
      }
    };

    const handleRescheduleClick = (e) => {
      e.stopPropagation();
      navigate(`/candidate/bookings-detail/${booking.id}?action=reschedule`);
    };

    const interviewerName = booking.interviewer_name || 'Unknown Interviewer';
    const interviewDate = booking.date;
    const startTime = booking.start_time;
    const endTime = booking.end_time;
    const bookingType = INTERVIEW_TYPE_LABELS[booking.interview_type] || booking.interview_type || 'Technical Interview';
    const status = booking.status || 'CONFIRMED';

    return (
      <div
        className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-300 cursor-pointer"
        onClick={() => handleBookingClick(booking.id)}
      >
        {/* Top: Type + Status */}
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold">
            {bookingType}
          </span>
          <BookingStatusBadge status={status} />
        </div>

        {/* Meta Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{getFormattedDate(interviewDate)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
            </svg>
            <span className="font-semibold text-slate-900">{interviewerName}</span>
          </div>
        </div>

        {/* NEW: Pending reschedule banner */}
        {hasPendingReschedule && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
              Reschedule request pending
            </p>
            {proposedSlot && (
              <p className="text-sm text-amber-900">
                Proposed slot:{' '}
                <span className="font-medium">
                  {proposedSlot.date}{' '}
                  {formatTime(proposedSlot.start_time)} -{' '}
                  {formatTime(proposedSlot.end_time)}
                </span>
              </p>
            )}
            {rescheduleNote && (
              <p className="text-sm text-amber-900 mt-1">
                Your note:{' '}
                <span className="italic">{rescheduleNote}</span>
              </p>
            )}
            <p className="text-xs text-amber-700 mt-2">
              Waiting for the interviewer to accept or reject this request. You
              cannot send another reschedule until they respond.
            </p>
          </div>
        )}

        {/* 🔥 TIMER DISPLAY */}
        {isUpcoming && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Starts in:</span>
              <span className={`font-mono font-bold text-lg px-3 py-1 rounded-lg ${isLive
                ? 'bg-emerald-500 text-white animate-pulse shadow-lg'
                : parseInt(timeLeft.split(' ')[0]) < 1
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-blue-500 text-white shadow-lg'
                }`}>
                {timeLeft}
              </span>
            </div>
          </div>
        )}

        {/* 🔥 ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className={`flex-1 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm ${isLive
              ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }`}
            onClick={handleJoinClick}
          >
            {isLive ? '🎥 JOIN NOW' : '📱 Join Session'}
          </button>

          {canReschedule && (
            <button
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm flex items-center justify-center gap-2"
              onClick={handleRescheduleClick}
            >
              🔄 Reschedule
            </button>
          )}
        </div>
      </div>
    );
  };

  // 🔥 DEBUG INFO
  console.log('🔥 ACTIVE TAB:', activeTab);
  console.log('🔥 RAW BOOKINGS:', bookings);
  console.log('🔥 FILTERED BOOKINGS:', filteredBookings);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <CandidateNavbar />
      <main className="flex-1 py-12 px-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
              Sessions
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              View and manage your upcoming and past interview sessions
            </p>
          </div>

          {/* Controls */}
          <div className="max-w-4xl mx-auto mb-12">
            {/* Search + Filter */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by interviewer, type, or notes…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-sm shadow-lg"
                />
              </div>
              <div className="w-full lg:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full lg:w-48 px-6 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-sm shadow-lg appearance-none"
                >
                  <option value="all">All Types</option>
                  <option value="TECHNICAL">Technical Interview</option>
                  <option value="BEHAVIORAL">Behavioral Interview</option>
                  <option value="SYSTEM_DESIGN">System Design</option>
                  <option value="CODING">Coding Interview</option>
                </select>
              </div>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-slate-100/50 backdrop-blur-sm rounded-3xl p-1 max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 ${activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                Upcoming Sessions
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 ${activeTab === 'past'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                Past Sessions
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* No results */}
          {!loading && filteredBookings.length === 0 && (
            <div className="text-center py-20">
              <svg className="w-24 h-24 text-slate-300 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {activeTab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {activeTab === 'upcoming'
                  ? 'Book an interview with one of our expert interviewers to get started.'
                  : 'All your past sessions will appear here.'}
              </p>
            </div>
          )}

          {/* Sessions Grid */}
          {!loading && filteredBookings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredBookings.map((booking) => (
                <SessionCard key={booking.id} booking={booking} />
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