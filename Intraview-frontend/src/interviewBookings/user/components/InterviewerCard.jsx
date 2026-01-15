import React, { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const InterviewerCard = ({ interviewer, tokenBalance }) => {
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  
  const hasEnoughTokens = tokenBalance >= 10;
  const TOKEN_COST = 10;

  const formatExperience = (years) => {
    if (!years) return 'Experienced';
    if (years < 1) return '0-1 year';
    if (years === 1) return '1 year';
    return `${years}+ years`;
  };

  return (
    <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 overflow-hidden h-full">
      {/* Profile Picture */}
      <div className="relative mb-6">
        <div className="w-28 h-28 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 overflow-hidden">
          {interviewer.profile_picture ? (
            <img 
              src={interviewer.profile_picture}
              alt={interviewer.display_name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
            </svg>
          )}
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-emerald-500 text-white px-4 py-1 rounded-2xl text-xs font-bold shadow-lg">
            Verified
          </div>
        </div>
      </div>

      {/* Name & Experience */}
      <div className="text-center mb-6">
        <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
          {interviewer.display_name}
        </h3>
        <div className="text-lg text-slate-600 mb-4">
          {formatExperience(interviewer.years_of_experience)} experience
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Accepting Bookings Now
        </div>
      </div>

      {/* Headline */}
      <p className="text-gray-700 text-center leading-relaxed mb-8 px-4 min-h-[80px] flex items-center justify-center">
        "{interviewer.headline}"
      </p>

      {/* Token Cost & CTA */}
      <div className="space-y-4 mt-auto">
        <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-100">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-700">10 tokens</div>
            <div className="text-sm text-emerald-600 font-semibold">per session</div>
          </div>
        </div>

        {!hasEnoughTokens && (
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
            <p className="text-amber-800 text-sm font-semibold text-center">
              💰 Need 10 tokens to book • You have {tokenBalance}
            </p>
          </div>
        )}

        <Link
          to={`/interviewer/${interviewer.id}`}
          className={`w-full block text-center py-5 px-8 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
            hasEnoughTokens
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-2xl hover:-translate-y-1'
              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
          }`}
        >
          {hasEnoughTokens ? (
            <>
              View Availability
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </>
          ) : (
            'Get Tokens First'
          )}
        </Link>
      </div>
    </div>
  );
};

export default InterviewerCard;
