// src/features/feedback/candidate/pages/CandidateFeedbackDetailPage.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Star,
  ArrowLeft,
  Download,
  X,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  Eye,
  Share2,
} from 'lucide-react';

import {
  fetchCandidateEvaluationDetail,
  clearEvaluationDetail,
  clearCandidateFeedbackErrors,
} from '../candidateFeedbackSlice';

const CandidateFeedbackDetailPage = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    evaluationDetail,
    evaluationDetailLoading,
    evaluationDetailError,
  } = useSelector(state => state.candidateFeedback);

  // Load detail
  useEffect(() => {
    if (evaluationId) {
      dispatch(fetchCandidateEvaluationDetail(evaluationId));
    }
    return () => {
      dispatch(clearEvaluationDetail());
    };
  }, [dispatch, evaluationId]);

  // Error handling
  useEffect(() => {
    if (evaluationDetailError) {
      toast.error('Failed to load feedback details');
      dispatch(clearCandidateFeedbackErrors());
      navigate('/candidate/feedback');
    }
  }, [evaluationDetailError, dispatch, navigate]);

  // Loading state
  if (evaluationDetailLoading || !evaluationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Loading Feedback Details
          </h2>
          <p className="text-slate-600">Fetching detailed evaluation...</p>
        </div>
      </div>
    );
  }

  // No evaluation found
  if (!evaluationDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl shadow-2xl border border-slate-200">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Feedback Not Found
          </h2>
          <p className="text-slate-600 mb-8">
            The evaluation you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/candidate/feedback')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all"
          >
            Back to Feedback
          </button>
        </div>
      </div>
    );
  }

  // Extract data for easier access
  const {
    id,
    overall_score,
    hire_recommendation,
    technical_score,
    communication_score,
    problem_solving_score,
    confidence_score,
    strengths,
    areas_for_improvement,
    actionable_suggestions,
    additional_notes,
    interview_difficulty,
    topics_covered = [],
    interviewer_email,
    created_at,
  } = evaluationDetail;

  const score = parseFloat(overall_score || 0);

  const getRecommendationColor = (rec) => {
    const colors = {
      STRONG_YES: 'from-emerald-500 to-green-600 text-emerald-100',
      YES: 'from-blue-500 to-indigo-600 text-blue-100',
      MAYBE: 'from-amber-500 to-orange-600 text-amber-100',
      NO: 'from-orange-500 to-red-600 text-orange-100',
      STRONG_NO: 'from-red-500 to-rose-600 text-red-100',
    };
    return colors[rec] || 'from-slate-500 to-slate-600 text-slate-100';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      EASY: 'bg-emerald-100 text-emerald-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HARD: 'bg-amber-100 text-amber-800',
      EXPERT: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/candidate/feedback')}
                className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-transparent">
                  Evaluation Details
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Detailed feedback from your interviewer
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors"
                title="Download PDF"
                onClick={() => toast.info('PDF download coming soon!')}
              >
                <Download className="w-5 h-5 text-slate-600" />
              </button>
              <button
                className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors"
                title="Share"
                onClick={() => toast.info('Share feature coming soon!')}
              >
                <Share2 className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => navigate('/candidate/feedback')}
                className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Main score card */}
        <div className="px-6 sm:px-8 py-10 border-b border-slate-100">
          <div className="max-w-md mx-auto text-center">
            <div
              className={`p-8 rounded-3xl shadow-2xl border-4 mx-auto mb-6 ${
                score >= 4
                  ? 'bg-emerald-50 border-emerald-400'
                  : score >= 3
                  ? 'bg-blue-50 border-blue-400'
                  : score >= 2
                  ? 'bg-amber-50 border-amber-400'
                  : 'bg-red-50 border-red-400'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${
                      i <= score
                        ? 'text-amber-500 fill-amber-500 drop-shadow-lg'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">
                {overall_score}
              </div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Overall Score
              </div>
            </div>

            {/* Recommendation badge */}
            <div
              className={`px-6 py-3 rounded-2xl text-lg font-bold shadow-lg mx-auto inline-block capitalize ${
                score >= 4
                  ? 'bg-emerald-500 text-white'
                  : score >= 3
                  ? 'bg-blue-500 text-white'
                  : score >= 2
                  ? 'bg-amber-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {hire_recommendation?.replace(/_/g, ' ') || 'No recommendation'}
            </div>
          </div>
        </div>

        {/* Interviewer info */}
        <div className="px-6 sm:px-8 py-8 border-b border-slate-100 bg-slate-50/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {interviewer_email}
                </h3>
                <p className="text-sm text-slate-500">
                  {new Date(created_at).toLocaleDateString()} •{' '}
                  {new Date(created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${getDifficultyColor(
              interview_difficulty
            )}`}>
              {interview_difficulty || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="px-6 sm:px-8 py-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            Score Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: 'Technical Skills',
                score: technical_score,
                icon: 'code',
              },
              {
                label: 'Communication',
                score: communication_score,
                icon: 'message-circle',
              },
              {
                label: 'Problem Solving',
                score: problem_solving_score,
                icon: 'brain',
              },
              {
                label: 'Confidence',
                score: confidence_score,
                icon: 'zap',
              },
            ].map(({ label, score, icon }) => (
              <div
                key={label}
                className="group p-6 rounded-2xl bg-slate-50/60 border border-slate-200 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= (score || 0)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {score || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topics covered */}
        {topics_covered?.length > 0 && (
          <div className="px-6 sm:px-8 py-8 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Topics Covered</h2>
            <div className="flex flex-wrap gap-2">
              {topics_covered.map(topic => (
                <span
                  key={topic}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed feedback sections */}
        <div className="px-6 sm:px-8 py-8 space-y-8">
          {strengths && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                Strengths
              </h3>
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 prose prose-sm max-w-none">
                <p>{strengths}</p>
              </div>
            </section>
          )}

          {areas_for_improvement && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                Areas for Improvement
              </h3>
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 prose prose-sm max-w-none">
                <p>{areas_for_improvement}</p>
              </div>
            </section>
          )}

          {actionable_suggestions && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Award className="w-5 h-5 text-blue-600 mr-2" />
                Actionable Next Steps
              </h3>
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6 prose prose-sm max-w-none">
                <p>{actionable_suggestions}</p>
              </div>
            </section>
          )}

          {additional_notes && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Additional Notes
              </h3>
              <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-6 prose prose-sm max-w-none">
                <p>{additional_notes}</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/50">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center text-center">
            <button
              onClick={() => navigate('/candidate/feedback')}
              className="px-8 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 hover:shadow-md transition-all flex items-center justify-center"
            >
              ← Back to All Feedback
            </button>
            <div className="flex items-center space-x-2">
              <button
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
                title="Download PDF"
              >
                <Download className="w-5 h-5 text-slate-700" />
              </button>
              <button
                className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-indigo-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateFeedbackDetailPage;
