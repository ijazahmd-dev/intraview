import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';

import { candidateBookingsApi } from '../../candidateBookingsApi';
import SessionConfigModal from '../components/SessionConfigModal';
import BookingSummaryModal from '../components/BookingSummaryModal';



const InterviewerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Token state
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenLoading, setTokenLoading] = useState(true);

  // Modal state — 3-step booking flow
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionConfigOpen, setSessionConfigOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [sessionConfig, setSessionConfig] = useState(null);

  // Page state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const tokenCost = profile?.base_session_rate || 10;
  const hasEnoughTokens = tokenBalance >= tokenCost;

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

  // Step 1: slot chosen → open session config
  const handleBookClick = (slot) => {
    const slotCost = slot.token_cost || tokenCost;
    if (tokenBalance < slotCost) {
      toast.error('Not enough tokens to book this session');
      return;
    }
    setSelectedSlot(slot);
    setSessionConfig(null);
    setSessionConfigOpen(true);
  };

  // Step 2: session config done → move to summary
  const handleSessionConfigNext = (config) => {
    setSessionConfig(config);
    setSessionConfigOpen(false);
    setSummaryOpen(true);
  };

  // Step 2 → back to step 1
  const handleSummaryBack = () => {
    setSummaryOpen(false);
    setSessionConfigOpen(true);
  };

  // Reset the full flow
  const closeAll = () => {
    setSessionConfigOpen(false);
    setSummaryOpen(false);
    setSelectedSlot(null);
    setSessionConfig(null);
  };

  // Step 3: confirm & create booking with session config
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    try {
      setBookingLoading(true);
      const res = await candidateBookingsApi.createBooking(
        selectedSlot.id,
        sessionConfig || {}
      );
      toast.success(`Booking confirmed! ${res.data.tokens_locked} tokens locked.`);
      closeAll();
      navigate('/candidate/dashboard/upcoming');
    } catch (error) {
      const errors = error.response?.data;
      if (errors && typeof errors === 'object') {
        // Show field-level validation errors from backend
        const firstKey = Object.keys(errors)[0];
        toast.error(`${firstKey}: ${errors[firstKey]}`);
      } else {
        toast.error(error.response?.data?.detail || 'Failed to create booking');
      }
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
    supported_interview_types,
    supported_experience_levels,
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
              session: <span className="font-bold">{tokenCost}</span>
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
                    Pricing scales with session duration. Base rate: <span className="font-semibold">{tokenCost} tokens</span> / 30 min.
                    Tokens are locked at booking and released after completion or cancellation.
                  </p>
                </div>

                {!is_accepting_bookings && (
                  <div className="p-4 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                    This interviewer is currently not accepting new bookings.
                  </div>
                )}

                {/* 🔥 NEW: Calendar + List Hybrid */}
                <div className="space-y-6">
                  {/* Primary CTA: Calendar View */}
                  <div className="group">
                    <button
                      onClick={() => navigate(`/candidate/interviewers/${id}/calendar`)}
                      disabled={!is_accepting_bookings || bookingLoading}
                      className={`w-full py-5 px-6 rounded-3xl font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-4 text-lg relative overflow-hidden ${is_accepting_bookings
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                      <Calendar className="w-8 h-8" />
                      <span>📅 View Interactive Calendar</span>
                      <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-bold ml-4 whitespace-nowrap">
                        {tokenCost} tokens/session
                      </span>
                      <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300 pointer-events-none"></div>
                    </button>
                    <p className="mt-3 text-xs text-slate-500 text-center">
                      See all slots at once • Auto-refreshes • Instant booking
                    </p>
                  </div>
                </div>


                {/* Token warning */}
                {!hasEnoughTokens && !tokenLoading && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 mb-4">
                    Not enough tokens to book. Each session costs {tokenCost} tokens, but your balance is {tokenBalance}.
                  </div>
                )}
                ``
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Step 1: Session Configuration ── */}
      <SessionConfigModal
        isOpen={sessionConfigOpen}
        onClose={closeAll}
        onNext={handleSessionConfigNext}
        slot={selectedSlot}
        profile={profile}
      />

      {/* ── Step 2: Booking Summary + Confirm ── */}
      <BookingSummaryModal
        isOpen={summaryOpen}
        onClose={closeAll}
        onBack={handleSummaryBack}
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

export default InterviewerDetailPage;
