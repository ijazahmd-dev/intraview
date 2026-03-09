// src/features/feedback/candidate/pages/SubmitInterviewerReviewPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Star,
  ArrowLeft,
  X,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';

import { submitInterviewerReview } from '../candidateFeedbackSlice';
import API from '../../../../utils/axiosClient'; // only for booking info

const SubmitInterviewerReviewPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { submittingReview } = useSelector(
    state => state.candidateFeedback
  );

  // Minimal booking context (interviewer name, time, etc.)
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  // Form state – matches InterviewerReviewCreateSerializer
  const [formData, setFormData] = useState({
    overall_rating: 0,
    was_interviewer_prepared: null,
    was_professional: true,
    would_recommend: null,
    comment: '',
    reported_issues: [],
    is_anonymous: false,
  });

  const [errors, setErrors] = useState({});

  const ISSUE_OPTIONS = [
    'Interviewer was late',
    'Unprofessional behavior',
    'Inappropriate questions',
    'Low audio/video quality',
    'Technical issues',
    'Other',
  ];

  // --------- Load booking context (optional but useful) ----------
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setBookingLoading(true);
        // you said you have this endpoint:
        // /api/bookings/dashboard/interviewer/bookings/:booking_id/
        // but this is candidate-side; if you have a candidate detail
        // endpoint instead, replace the URL accordingly.
        const res = await API.get(
          `/api/bookings/dashboard/interviewer/bookings/${bookingId}/`
        );
        setBooking(res.data);
      } catch (err) {
        // Booking info is optional for the form; just log & continue
        console.error('Failed to load booking info', err);
      } finally {
        setBookingLoading(false);
      }
    };

    if (bookingId) fetchBooking();
  }, [bookingId]);

  // --------- Derived helpers ----------

  const isFormBasicallyValid = useMemo(() => {
    return (
      formData.overall_rating >= 1 &&
      formData.overall_rating <= 5 &&
      formData.was_interviewer_prepared !== null &&
      formData.would_recommend !== null &&
      // comment is optional but if filled, must be >= 5 chars
      (!formData.comment || formData.comment.trim().length >= 5)
    );
  }, [
    formData.overall_rating,
    formData.was_interviewer_prepared,
    formData.would_recommend,
    formData.comment,
  ]);

  // --------- Handlers ----------

  const handleRatingClick = (value) => {
    setFormData(prev => ({ ...prev, overall_rating: value }));
    if (errors.overall_rating) {
      setErrors(prev => ({ ...prev, overall_rating: '' }));
    }
  };

  const handleBooleanChoice = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIssueToggle = (issue) => {
    setFormData(prev => {
      const exists = prev.reported_issues.includes(issue);
      const nextIssues = exists
        ? prev.reported_issues.filter(i => i !== issue)
        : [...prev.reported_issues, issue];
      return { ...prev, reported_issues: nextIssues };
    });
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, comment: value }));
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: '' }));
    }
  };

  const handleAnonymousToggle = () => {
    setFormData(prev => ({ ...prev, is_anonymous: !prev.is_anonymous }));
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (formData.overall_rating < 1 || formData.overall_rating > 5) {
      newErrors.overall_rating = 'Please give a rating from 1 to 5.';
    }

    if (formData.was_interviewer_prepared === null) {
      newErrors.was_interviewer_prepared = 'Please answer this question.';
    }

    if (formData.would_recommend === null) {
      newErrors.would_recommend = 'Please answer this question.';
    }

    if (formData.comment && formData.comment.trim().length < 5) {
      newErrors.comment = 'Comment must be at least 5 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      toast.error('Please fix the errors above.');
      return;
    }

    try {
      await dispatch(
        submitInterviewerReview({ bookingId, data: formData })
      ).unwrap();

      // After successful submission, redirect back to candidate dashboard
      navigate('/candidate/dashboard/upcoming?review_submitted=true');
    } catch (err) {
      // Error toast already shown in thunk
      console.error('Submit review failed', err);
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg text-slate-700">
            Invalid booking. Please go back to your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-2xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-transparent">
                Rate Your Interviewer
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Your feedback helps improve the quality of our interviewers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Booking summary */}
        <div className="px-6 sm:px-8 pt-4 pb-2 border-b border-slate-100 bg-slate-50/60">
          {bookingLoading ? (
            <div className="text-sm text-slate-500">Loading interview details…</div>
          ) : booking ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Interviewer:{' '}
                  <span className="font-bold">
                    {booking.interviewer_name || booking.interviewer_email}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {booking.start_datetime
                    ? new Date(booking.start_datetime).toLocaleString()
                    : 'Completed session'}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>
                  Be honest and constructive. Reviews may be used for moderation.
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Could not load interview details, but you can still submit a review.
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-8">
          {/* Overall rating */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                Overall Rating
              </h2>
              {errors.overall_rating && (
                <span className="text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.overall_rating}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-all ${
                      value <= formData.overall_rating
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                        : 'text-slate-300 hover:text-yellow-300 hover:fill-yellow-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm font-medium text-slate-700">
                {formData.overall_rating
                  ? `${formData.overall_rating}/5`
                  : 'Tap to rate'}
              </span>
            </div>
          </section>

          {/* Prepared & professional & recommend */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Prepared? */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-800 mb-3 uppercase tracking-wide">
                Was the interviewer prepared?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleBooleanChoice('was_interviewer_prepared', true)
                  }
                  className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    formData.was_interviewer_prepared === true
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleBooleanChoice('was_interviewer_prepared', false)
                  }
                  className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    formData.was_interviewer_prepared === false
                      ? 'bg-red-500 text-white border-red-500 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  No
                </button>
              </div>
              {errors.was_interviewer_prepared && (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.was_interviewer_prepared}
                </p>
              )}
            </div>

            {/* Professional? */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-800 mb-3 uppercase tracking-wide">
                Was the interviewer professional?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleBooleanChoice('was_professional', true)
                  }
                  className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    formData.was_professional === true
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleBooleanChoice('was_professional', false)
                  }
                  className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    formData.was_professional === false
                      ? 'bg-red-500 text-white border-red-500 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  No
                </button>
              </div>
            </div>

            {/* Would recommend? */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-800 mb-3 uppercase tracking-wide">
                Would you recommend this interviewer?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleBooleanChoice('would_recommend', true)
                  }
                  className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    formData.would_recommend === true
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleBooleanChoice('would_recommend', false)
                  }
                  className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    formData.would_recommend === false
                      ? 'bg-red-500 text-white border-red-500 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                  }`}
                >
                  <X className="w-3 h-3 mr-1" />
                  No
                </button>
              </div>
              {errors.would_recommend && (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.would_recommend}
                </p>
              )}
            </div>
          </section>

          {/* Reported issues */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide flex items-center">
              Reported Issues (optional)
              {formData.reported_issues.length > 0 && (
                <span className="ml-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  {formData.reported_issues.length} selected
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ISSUE_OPTIONS.map(issue => {
                const active = formData.reported_issues.includes(issue);
                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => handleIssueToggle(issue)}
                    className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      active
                        ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {issue}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Comment */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                Comment (optional)
              </h2>
              <span className="text-[11px] text-slate-500">
                Min 5 characters if you write something
              </span>
            </div>
            <textarea
              rows={4}
              value={formData.comment}
              onChange={handleCommentChange}
              className={`w-full p-4 text-sm rounded-2xl border resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-slate-50 ${
                errors.comment
                  ? 'border-red-300 bg-red-50/60'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              placeholder="Share anything that went particularly well or needs improvement..."
            />
            {errors.comment && (
              <p className="text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.comment}
              </p>
            )}
          </section>

          {/* Anonymous toggle */}
          <section className="flex items-start space-x-3">
            <button
              type="button"
              onClick={handleAnonymousToggle}
              className="mt-0.5 w-5 h-5 rounded-md border border-slate-300 flex items-center justify-center bg-white"
            >
              {formData.is_anonymous && (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
            </button>
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Submit this review anonymously
              </p>
              <p>
                If enabled, the interviewer will see the feedback but not your
                name. Our team can still see it for moderation purposes.
              </p>
            </div>
          </section>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submittingReview}
              className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview || !isFormBasicallyValid}
              className="inline-flex items-center px-8 py-2.5 text-sm font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingReview ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitInterviewerReviewPage;
