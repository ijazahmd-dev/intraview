// src/pages/candidate/components/sections/BookingSummary.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  X,
  MessageSquare,
  User,
  ArrowRight,
  AlertCircle,
  Video,
  Loader2,
} from 'lucide-react';

// Mock data - replace with Redux state
const mockBookingData = {
  upcoming: [
    {
      id: 1,
      title: 'Technical Interview',
      interviewer: 'Raj Kumar',
      date: '2026-01-31',
      time: '14:00',
      duration: 60,
      status: 'confirmed',
      avatar: 'RK',
      link: '/interviews/1',
    },
    {
      id: 2,
      title: 'System Design Round',
      interviewer: 'Priya Sharma',
      date: '2026-02-05',
      time: '10:30',
      duration: 45,
      status: 'confirmed',
      avatar: 'PS',
      link: '/interviews/2',
    },
  ],
  completed: 12,
  cancelled: 2,
  nextInterview: {
    id: 1,
    interviewer: 'Raj Kumar',
    date: '2026-01-31',
    time: '14:00',
    status: 'confirmed',
  },
};

const BookingSummary = () => {
  const navigate = useNavigate();
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate time until next interview
  const getTimeUntilInterview = (date, time) => {
    const now = new Date();
    const interviewTime = new Date(`${date}T${time}`);
    const diff = interviewTime - now;

    if (diff < 0) return 'Interview in progress';
    if (diff < 3600000) return 'Starting soon';
    if (diff < 86400000) return 'Tomorrow';
    const days = Math.ceil(diff / 86400000);
    return `In ${days} days`;
  };

  const handleJoinInterview = (id) => {
    setIsLoading(true);
    // Navigate to interview room
    setTimeout(() => {
      navigate(`/interview/${id}`);
    }, 500);
  };

  const stats = [
    {
      label: 'Upcoming',
      value: mockBookingData.upcoming.length,
      icon: Calendar,
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Completed',
      value: mockBookingData.completed,
      icon: CheckCircle2,
      color: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Cancelled',
      value: mockBookingData.cancelled,
      icon: X,
      color: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.color} rounded-2xl border ${stat.borderColor} p-3 text-center`}
            >
              <Icon className={`w-5 h-5 ${stat.textColor} mx-auto mb-1`} />
              <p className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Next Interview Preview */}
      {mockBookingData.nextInterview && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl border-2 border-indigo-200 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 mb-2">
            Next interview
          </p>

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg sm:text-xl font-bold text-slate-900">
                {mockBookingData.nextInterview.interviewer}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {new Date(mockBookingData.nextInterview.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                at {mockBookingData.nextInterview.time}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Confirmed</span>
            </span>
          </div>

          <button
            onClick={() => handleJoinInterview(mockBookingData.nextInterview.id)}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Join Interview
              </>
            )}
          </button>
        </div>
      )}

      {/* Upcoming Interviews */}
      <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setUpcomingExpanded(!upcomingExpanded)}
        >
          <h4 className="text-lg font-bold text-slate-900">
            Upcoming interviews ({mockBookingData.upcoming.length})
          </h4>
          <ArrowRight
            className={`w-5 h-5 text-slate-400 transition-transform ${
              upcomingExpanded ? 'rotate-90' : ''
            }`}
          />
        </div>

        {upcomingExpanded && (
          <div className="mt-4 space-y-3">
            {mockBookingData.upcoming.length > 0 ? (
              mockBookingData.upcoming.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-start justify-between p-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">
                        {interview.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {interview.interviewer}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {interview.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(interview.date).toLocaleDateString('en-IN')}
                        <Clock className="w-3 h-3 ml-1" />
                        {interview.time}
                        <span className="text-slate-400">•</span>
                        {interview.duration}m
                      </div>
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                        {getTimeUntilInterview(interview.date, interview.time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleJoinInterview(interview.id)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-2xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600">No upcoming interviews</p>
                <button
                  onClick={() => navigate('/bookings')}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Book an interview
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View All */}
      <button
        onClick={() => navigate('/bookings')}
        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
      >
        View all interviews
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-200 p-4">
        <div className="flex gap-3">
          <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-amber-900 mb-1">Interview tips</p>
            <ul className="text-amber-800 space-y-0.5">
              <li>✓ Join 5 minutes early</li>
              <li>✓ Check your camera & microphone</li>
              <li>✓ Refer to your notes if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
