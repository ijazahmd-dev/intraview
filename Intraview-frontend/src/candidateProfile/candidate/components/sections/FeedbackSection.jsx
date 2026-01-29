// src/pages/candidate/components/sections/FeedbackSection.jsx
import React, { useState } from 'react';
import {
  Star,
  TrendingUp,
  ThumbsUp,
  AlertCircle,
  Download,
  ChevronDown,
  Target,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';

// Mock feedback data - replace with Redux state
const mockFeedbackData = [
  {
    id: 1,
    interviewer: 'Raj Kumar',
    date: '2026-01-28',
    interviewType: 'Technical',
    overallRating: 4.5,
    duration: 60,
    categories: [
      { name: 'Communication', rating: 4.5, weight: 20 },
      { name: 'Problem Solving', rating: 4, weight: 25 },
      { name: 'Technical Knowledge', rating: 4.5, weight: 25 },
      { name: 'Confidence', rating: 4, weight: 15 },
      { name: 'Time Management', rating: 4.5, weight: 15 },
    ],
    strengths: [
      'Clear explanation of approach before coding',
      'Good understanding of edge cases',
      'Asked clarifying questions appropriately',
      'Walked through solution step by step',
    ],
    weaknesses: [
      'Could optimize the time complexity further',
      'Minor syntax errors that took extra time',
      'Could have discussed trade-offs more',
    ],
    feedback: 'Great technical interview overall. Your problem-solving approach was systematic and well-explained. Work on optimizing solutions before implementation.',
    recommendation: 'GOOD_FIT',
    interviewLink: '/interview/1/details',
  },
  {
    id: 2,
    interviewer: 'Priya Sharma',
    date: '2026-01-15',
    interviewType: 'System Design',
    overallRating: 4,
    duration: 45,
    categories: [
      { name: 'System Design', rating: 4, weight: 30 },
      { name: 'Communication', rating: 4, weight: 20 },
      { name: 'Trade-off Analysis', rating: 3.5, weight: 25 },
      { name: 'Scalability', rating: 4, weight: 15 },
      { name: 'Follow-up Questions', rating: 4, weight: 10 },
    ],
    strengths: [
      'Good architectural thinking',
      'Considered multiple solutions',
      'Explained database design choices',
    ],
    weaknesses: [
      'Could have dived deeper into caching strategies',
      'Limited knowledge of distributed systems',
    ],
    feedback: 'Good foundation in system design. Your approach was methodical. Study caching patterns and distributed system concepts more.',
    recommendation: 'NEEDS_IMPROVEMENT',
    interviewLink: '/interview/2/details',
  },
];

const RECOMMENDATION_COLORS = {
  EXCELLENT: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-600' },
  GOOD_FIT: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-600' },
  NEEDS_IMPROVEMENT: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-600' },
  NOT_FIT: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-600' },
};

const RECOMMENDATION_LABELS = {
  EXCELLENT: 'Excellent Performance',
  GOOD_FIT: 'Good Performance',
  NEEDS_IMPROVEMENT: 'Needs Improvement',
  NOT_FIT: 'Not a Good Fit',
};

const StarRating = ({ rating, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        let isFilled = false;
        if (i < fullStars) {
          isFilled = true;
        } else if (i === fullStars && hasHalf) {
          isFilled = 'half';
        }

        return (
          <div key={i} className="relative">
            <Star className={`${sizeClass} text-slate-300`} fill="currentColor" />
            {isFilled && (
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: isFilled === 'half' ? '50%' : '100%' }}
              >
                <Star className={`${sizeClass} text-amber-400`} fill="currentColor" />
              </div>
            )}
          </div>
        );
      })}
      <span className="text-xs font-bold text-slate-900 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

const FeedbackCard = ({ feedback, index, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = RECOMMENDATION_COLORS[feedback.recommendation];

  const averageRating =
    feedback.categories.reduce((sum, cat) => sum + cat.rating * (cat.weight / 100), 0).toFixed(1);

  return (
    <div className={`rounded-3xl border-2 ${colors.border} ${colors.bg} p-4 sm:p-6 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {feedback.interviewType} Interview
            </h4>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${colors.badge}`}>
              {RECOMMENDATION_LABELS[feedback.recommendation].split(' ')[0]}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            with <span className="font-semibold">{feedback.interviewer}</span> •{' '}
            {new Date(feedback.date).toLocaleDateString('en-IN')}
          </p>
        </div>
        <StarRating rating={feedback.overallRating} size="lg" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/50 rounded-2xl">
        <div>
          <p className="text-[10px] text-slate-600">Duration</p>
          <p className="text-sm font-bold text-slate-900">{feedback.duration}m</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600">Strengths</p>
          <p className="text-sm font-bold text-slate-900">{feedback.strengths.length}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600">Areas</p>
          <p className="text-sm font-bold text-slate-900">{feedback.weaknesses.length}</p>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="mb-4 p-3 bg-white/50 rounded-2xl">
        <p className="text-xs font-semibold text-slate-900 mb-2">Category breakdown</p>
        <div className="space-y-2">
          {feedback.categories.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                <span className="text-xs font-bold text-slate-900">{cat.rating}/5</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${(cat.rating / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Text Preview */}
      <div className="p-3 bg-white/50 rounded-2xl mb-4">
        <p className="text-xs font-semibold text-slate-900 mb-1">Feedback</p>
        <p className="text-xs text-slate-700 line-clamp-2">{feedback.feedback}</p>
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-white/40 hover:bg-white/60 transition-all text-xs font-semibold text-slate-900"
      >
        View details
        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-3 pt-4 border-t-2 border-white/50">
          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold text-slate-900">Strengths</p>
            </div>
            <ul className="space-y-1">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-bold text-slate-900">Areas for improvement</p>
            </div>
            <ul className="space-y-1">
              {feedback.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">→</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Feedback */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-bold text-slate-900">Detailed feedback</p>
            </div>
            <p className="text-xs text-slate-700 p-2 bg-white/50 rounded-xl">{feedback.feedback}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => window.open(feedback.interviewLink)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white/60 hover:bg-white text-slate-900 transition-all"
            >
              Full Report
            </button>
            <button className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white/60 hover:bg-white text-slate-900 transition-all flex items-center justify-center gap-1">
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FeedbackSection = () => {
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');

  // Calculate overall stats
  const allRatings = mockFeedbackData.map((f) => f.overallRating);
  const avgRating = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
  const highestRating = Math.max(...allRatings);
  const lowestRating = Math.min(...allRatings);

  // Filter and sort
  const filteredFeedback = mockFeedbackData.filter((f) => {
    if (filterType === 'all') return true;
    return f.interviewType.toLowerCase().includes(filterType.toLowerCase());
  });

  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'rating_high') return b.overallRating - a.overallRating;
    if (sortBy === 'rating_low') return a.overallRating - b.overallRating;
    return 0;
  });

  // Calculate category averages
  const allCategories = mockFeedbackData.reduce((acc, f) => {
    f.categories.forEach((cat) => {
      if (!acc[cat.name]) {
        acc[cat.name] = { total: 0, count: 0, weight: cat.weight };
      }
      acc[cat.name].total += cat.rating;
      acc[cat.name].count += 1;
    });
    return acc;
  }, {});

  const categoryAverages = Object.entries(allCategories).map(([name, data]) => ({
    name,
    avg: (data.total / data.count).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-amber-700">Average rating</p>
            <Star className="w-4 h-4 text-amber-600" fill="currentColor" />
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-amber-900">{avgRating}</p>
            <p className="text-xs text-amber-700">/ 5</p>
          </div>
          <p className="text-[10px] text-amber-600 mt-1">across {mockFeedbackData.length} interviews</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-emerald-700">Highest rating</p>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-emerald-900">{highestRating}</p>
            <p className="text-xs text-emerald-700">/ 5</p>
          </div>
          <p className="text-[10px] text-emerald-600 mt-1">Keep up the great work!</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-blue-700">Interviews</p>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-blue-900">{mockFeedbackData.length}</p>
            <p className="text-xs text-blue-700">completed</p>
          </div>
          <p className="text-[10px] text-blue-600 mt-1">Great consistency!</p>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Your strengths by category</h4>
        <div className="space-y-3">
          {categoryAverages.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                <span className="text-xs font-bold text-slate-900">{cat.avg}/5</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    cat.avg >= 4.5
                      ? 'bg-emerald-500'
                      : cat.avg >= 4
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${(cat.avg / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips for Improvement */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl border border-violet-200 p-4">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-violet-900 mb-1">Tips for improvement</p>
            <ul className="text-violet-800 space-y-0.5">
              <li>✓ Focus on "Trade-off Analysis" - your weakest category</li>
              <li>✓ Practice explaining design decisions more clearly</li>
              <li>✓ Study advanced system design patterns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feedback History */}
      <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900">Interview feedback</h4>
          <span className="text-xs font-semibold text-slate-500">
            {sortedFeedback.length} interview{sortedFeedback.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 pb-4 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {['Technical', 'System Design', 'Behavioral', 'HR'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-600">Sort by:</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-xl px-2 py-1"
          >
            <option value="recent">Most Recent</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>

        {/* Feedback Cards */}
        <div className="space-y-3">
          {sortedFeedback.length > 0 ? (
            sortedFeedback.map((feedback, index) => (
              <FeedbackCard key={feedback.id} feedback={feedback} index={index} />
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No feedback available yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Complete your first interview to see feedback here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Export Report */}
      <button className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
        <Download className="w-4 h-4" />
        Download all feedback as PDF
      </button>
    </div>
  );
};

export default FeedbackSection;
