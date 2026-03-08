// src/pages/feedback/FeedbackDetail.jsx (COMPLETE & READY)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  Star, Calendar, Users, Award, Download, Share2, 
  AlertCircle, CheckCircle, TrendingUp, ArrowLeft 
} from 'lucide-react';

import feedbackApi from '../feedbackInterviewerApi'; // ✅ Your API
import { useDispatch } from 'react-redux';
import { setSelectedEvaluation } from '../interviewerFeedbackSlice'; // Optional Redux integration

const FeedbackDetail = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { selectedEvaluation } = useSelector(state => state.feedback); // Redux integration
  
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Score colors (unchanged)
  const getScoreColor = (score) => {
    if (score >= 4) return { bg: 'bg-emerald-500', text: 'text-emerald-100', ring: 'ring-emerald-400/30' };
    if (score >= 3) return { bg: 'bg-blue-500', text: 'text-blue-100', ring: 'ring-blue-400/30' };
    if (score >= 2) return { bg: 'bg-amber-500', text: 'text-amber-100', ring: 'ring-amber-400/30' };
    return { bg: 'bg-red-500', text: 'text-red-100', ring: 'ring-red-400/30' };
  };
  
  // Hire badge styles (unchanged)
  const getHireBadge = (recommendation) => {
    const badges = {
      'STRONG_YES': { color: 'from-emerald-500 to-green-500', label: 'Strong Hire', icon: '✅' },
      'YES': { color: 'from-blue-500 to-cyan-500', label: 'Hire', icon: '👍' },
      'MAYBE': { color: 'from-amber-400 to-orange-400', label: 'Consider', icon: '🤔' },
      'NO': { color: 'from-orange-500 to-red-400', label: 'No Hire', icon: '❌' },
      'STRONG_NO': { color: 'from-red-500 to-rose-500', label: 'Strong No', icon: '🚫' }
    };
    return badges[recommendation] || { color: 'from-slate-400 to-slate-500', label: 'N/A', icon: '' };
  };
  
  // Load evaluation data (SIMPLIFIED - Your API is perfect!)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ✅ YOUR PERFECT API - No changes needed!
        const evalResponse = await feedbackApi.getEvaluation(evaluationId);
        setEvaluation(evalResponse);
        
        // Optional: Set in Redux for dashboard sync
        dispatch(setSelectedEvaluation(evalResponse));
        
      } catch (error) {
        console.error('Evaluation fetch error:', error);
        toast.error('Failed to load feedback details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    
    if (evaluationId) {
      fetchData();
    }
  }, [evaluationId, navigate, dispatch]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading Feedback</h2>
          <p className="text-slate-600">Fetching detailed evaluation report...</p>
        </div>
      </div>
    );
  }
  
  if (!evaluation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-20 h-20 text-slate-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Feedback Not Found</h2>
          <p className="text-slate-600 mb-8">The evaluation you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/interviewer/evaluations')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            View All Evaluations
          </button>
        </div>
      </div>
    );
  }
  
  const score = parseFloat(evaluation.overall_score);
  const { bg, text, ring } = getScoreColor(score);
  const { color, label, icon } = getHireBadge(evaluation.hire_recommendation);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center bg-white/70 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-xl border border-white/50 mb-8">
            <div className={`p-4 ${bg} rounded-2xl shadow-2xl mr-6`}>
              <Star className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
                Detailed Evaluation Report
              </h1>
              <div className="flex items-center justify-center space-x-6 text-lg">
                <div>
                  <span className="text-slate-600 font-semibold">Feedback Type:</span>
                  <span className="ml-2 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-medium">
                    {evaluation.feedback_type === 'HUMAN' ? 'Human Interview' : 'AI Interview'}
                  </span>
                </div>
                {evaluation.interviewer_email && (
                  <div>
                    <span className="text-slate-600 font-semibold">Interviewer:</span>
                    <span className="ml-2 font-medium">{evaluation.interviewer_email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Score & Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Main Score */}
            <div className="text-center lg:text-left">
              <div className={`inline-flex items-center p-8 rounded-3xl shadow-2xl ${ring} backdrop-blur-xl border-4 border-white/50 mx-auto lg:mx-0 max-w-md`}>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center space-x-3 mb-4">
                    {[1,2,3,4,5].map(i => (
                      <Star 
                        key={i} 
                        className={`w-8 h-8 ${i <= score ? 'text-amber-500 fill-amber-500 shadow-lg' : 'text-slate-300 shadow-sm'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-5xl lg:text-6xl font-black text-slate-900 mb-2">
                    {evaluation.overall_score}
                  </div>
                  <div className="text-2xl text-slate-600 font-semibold">/ 5.0</div>
                </div>
              </div>
            </div>
            
            {/* Recommendation & Context */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
                <div className={`p-6 rounded-2xl shadow-xl mr-6 bg-gradient-to-br ${color}`}>
                  <div className="text-4xl mb-4">{icon}</div>
                  <div className="text-2xl font-black text-white">{label}</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900 mb-2">
                    {evaluation.interview_difficulty}
                  </div>
                  <div className="flex items-center justify-center lg:justify-end space-x-6 text-lg mb-4">
                    <div>
                      <span className="font-bold text-slate-900">{Array.isArray(evaluation.topics_covered) ? evaluation.topics_covered.length : 0}</span>
                      <span className="text-slate-600 ml-1">Topics</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-6 h-6 text-slate-500 mr-2" />
                      <span className="text-slate-900 font-semibold">
                        {new Date(evaluation.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Individual Scores */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">
            Performance Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { label: 'Technical Skills', score: evaluation.technical_score, icon: '💻' },
              { label: 'Communication', score: evaluation.communication_score, icon: '🗣️' },
              { label: 'Problem Solving', score: evaluation.problem_solving_score, icon: '🧠' },
              { label: 'Confidence', score: evaluation.confidence_score, icon: '💪' }
            ].map(({ label, score, icon }) => {
              const color = getScoreColor(score);
              return (
                <div key={label} className="group">
                  <div className={`p-8 rounded-3xl shadow-xl border-4 hover:border-slate-200/50 transition-all ${color.ring} bg-white/80 backdrop-blur-xl hover:shadow-2xl hover:-translate-y-2`}>
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br rounded-2xl mb-6 shadow-lg mx-auto">
                      <span className="text-3xl">{icon}</span>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r shadow-lg mb-4 mx-auto ${color.bg} ${color.text}`}>
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-5 h-5 ${i <= score ? 'fill-current shadow-sm' : ''}`} />
                        ))}
                        <span className="ml-3 text-xl font-bold">{score}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{label}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* Detailed Feedback - ALL FROM EVALUATION OBJECT */}
        <section className="max-w-4xl mx-auto space-y-16 mb-24">
          {/* Strengths */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center lg:justify-start">
              <TrendingUp className="w-10 h-10 mr-4 text-emerald-600" />
              Strengths
            </h2>
            <div className="mt-8 p-8 bg-emerald-50/80 border-4 border-emerald-200/50 rounded-3xl shadow-inner">
              <div className="prose prose-lg max-w-none leading-relaxed">
                <p className="whitespace-pre-wrap text-slate-900 text-lg">
                  {evaluation.strengths || 'No specific strengths noted.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Areas for Improvement */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center lg:justify-start">
              <AlertCircle className="w-10 h-10 mr-4 text-amber-600" />
              Areas for Improvement
            </h2>
            <div className="mt-8 p-8 bg-amber-50/80 border-4 border-amber-200/50 rounded-3xl shadow-inner">
              <div className="prose prose-lg max-w-none leading-relaxed">
                <p className="whitespace-pre-wrap text-slate-900 text-lg">
                  {evaluation.areas_for_improvement || 'No specific areas identified.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actionable Suggestions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center lg:justify-start">
              <CheckCircle className="w-10 h-10 mr-4 text-green-600" />
              Actionable Next Steps
            </h2>
            <div className="mt-8 p-8 bg-blue-50/80 border-4 border-blue-200/50 rounded-3xl shadow-inner">
              <div className="prose prose-lg max-w-none leading-relaxed">
                <p className="whitespace-pre-wrap text-slate-900 text-lg">
                  {evaluation.actionable_suggestions || 'No specific recommendations provided.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Additional Notes */}
          {evaluation.additional_notes?.trim() && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Additional Observations
              </h2>
              <div className="p-8 bg-slate-50/80 border-4 border-slate-200/50 rounded-3xl shadow-inner">
                <div className="prose prose-lg max-w-none leading-relaxed">
                  <p className="whitespace-pre-wrap text-slate-800 text-lg italic">
                    {evaluation.additional_notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
        
        {/* Footer Actions */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <Download className="w-5 h-5" />
              <span>Download PDF Report</span>
            </button>
            <button className="flex items-center space-x-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200">
              <Share2 className="w-5 h-5" />
              <span>Share with Candidate</span>
            </button>
          </div>
          <button
            onClick={() => navigate('/interviewer/evaluations')}
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-semibold text-lg transition-all hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>← Back to All Evaluations</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail;
