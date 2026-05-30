// src/features/feedback/candidate/pages/CandidateFeedbackListPage.jsx

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Star,
  Calendar,
  Eye,
  Users,
  Award,
  Download,
  Loader2,
} from 'lucide-react';

import {
  fetchCandidateEvaluations,
  clearCandidateFeedbackErrors,
} from '../candidateFeedbackSlice';

import CandidateNavbar from "../../../../components/CandidateNavbar";
import CandidateFooter from "../../../../components/CandidateFooter";

const CandidateFeedbackListPage = () => {
  const dispatch = useDispatch();

  const {
    evaluations,
    evaluationsLoading,
    evaluationsError,
  } = useSelector(state => state.candidateFeedback);

  // Load data
  useEffect(() => {
    dispatch(fetchCandidateEvaluations());
  }, [dispatch]);

  // Error handling
  useEffect(() => {
    if (evaluationsError) {
      toast.error('Failed to load your feedback');
      dispatch(clearCandidateFeedbackErrors());
    }
  }, [evaluationsError, dispatch]);

  // Stats calculations
  const avgScore = useMemo(() => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce(
      (acc, e) => acc + parseFloat(e.overall_score || 0),
      0
    );
    return (sum / evaluations.length).toFixed(1);
  }, [evaluations]);

  const excellentCount = evaluations.filter(
    e => parseFloat(e.overall_score || 0) >= 4
  ).length;

  const getRecommendationColor = (rec) => {
    const colors = {
      STRONG_YES: 'bg-emerald-100 border-emerald-200 text-emerald-800',
      YES: 'bg-blue-100 border-blue-200 text-blue-800',
      MAYBE: 'bg-amber-100 border-amber-200 text-amber-800',
      NO: 'bg-orange-100 border-orange-200 text-orange-800',
      STRONG_NO: 'bg-red-100 border-red-200 text-red-800',
    };
    return colors[rec] || 'bg-slate-100 border-slate-200 text-slate-800';
  };

  const getScoreColor = (score) => {
    const num = parseFloat(score || 0);
    if (num >= 4) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (num >= 3) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (num >= 2) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (evaluationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Loading Your Feedback
          </h2>
          <p className="text-slate-600">Fetching evaluations from your interviewers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CandidateNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col">
        <div className="flex-grow max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-xl">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent">
                    My Feedback
                  </h1>
                  <p className="text-xl text-slate-600 mt-2">
                    {evaluations.length} evaluations received
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center space-x-3 mb-1">
                    <Users className="w-6 h-6 text-slate-600" />
                    <span className="text-2xl font-bold text-slate-900">
                      {evaluations.length}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Evaluations</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex items-center space-x-3 mb-1">
                    <Award className="w-6 h-6" />
                    <span className="text-2xl font-bold">{excellentCount}</span>
                  </div>
                  <p className="text-sm opacity-90">4+ Stars</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center space-x-3 mb-1">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-bold text-slate-900">
                      {avgScore}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Average</p>
                </div>
              </div>
            </div>
          </div>

          {/* No feedback state */}
          {evaluations.length === 0 ? (
            <div className="text-center py-32 bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/50">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-8 shadow-xl mx-auto">
                <Star className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                No feedback yet
              </h3>
              <p className="text-xl text-slate-600 mb-8 max-w-md mx-auto">
                Complete interviews with interviewers to start receiving feedback and
                build your evaluation history.
              </p>
              <Link
                to="/candidate/dashboard/upcoming"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:-translate-y-1"
              >
                Find More Interviews
              </Link>
            </div>
          ) : (
            /* Feedback cards grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {evaluations.map((evaluation) => {
                const score = parseFloat(evaluation.overall_score || 0);
                const rec = evaluation.hire_recommendation;

                return (
                  <Link
                    key={evaluation.id}
                    to={`/candidate/feedback/${evaluation.id}`}
                    className="group bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-slate-200/50 transition-all duration-300 overflow-hidden h-full"
                  >
                    <div className="p-8">
                      {/* Score header */}
                      <div
                        className={`p-5 rounded-2xl mb-6 shadow-md ${getScoreColor(
                          evaluation.overall_score
                        )}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                            Overall Score
                          </span>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i <= score
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-300'
                                  }`}
                              />
                            ))}
                            <span className="text-2xl font-black text-slate-900 ml-2">
                              {evaluation.overall_score}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation badge */}
                      <div
                        className={`px-4 py-2 rounded-2xl text-xs font-bold shadow-md mb-6 whitespace-nowrap text-center capitalize ${getRecommendationColor(
                          rec
                        )}`}
                      >
                        {rec?.replace(/_/g, ' ') || 'No recommendation'}
                      </div>

                      {/* Interviewer info */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                          {evaluation.interviewer_name || evaluation.interviewer_email}
                        </h3>
                        <p className="text-sm text-slate-500 mb-3">
                          Interviewer feedback
                        </p>
                        <div className="flex items-center text-xs text-slate-500 space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(evaluation.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action footer */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          Click to view full feedback →
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                            <Download className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-colors">
                            <Eye className="w-4 h-4 text-indigo-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <CandidateFooter />
    </>
  );
};

export default CandidateFeedbackListPage;
