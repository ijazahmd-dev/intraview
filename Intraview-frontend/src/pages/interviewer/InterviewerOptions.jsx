import React from 'react';
import { UserPlus, LogIn } from 'lucide-react';

export default function InterviewerOptions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F3E0] via-white to-[#F1F3E0] flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2f2f2f] mb-4">
            Become a SkillVerse Interviewer
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Share your expertise, conduct mock interviews, and guide learners. Whether you are applying for the first time or returning as an interviewer, choose an option below.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Apply as Interviewer Card */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center h-full">
              {/* Icon */}
              <div className="w-20 h-20 bg-[#778873] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                <UserPlus className="w-10 h-10 text-[#778873]" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-[#2f2f2f] mb-4">
                Apply as Interviewer
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                Submit your application to start conducting mock interviews. Mentor candidates, share your expertise, and earn through personalized interview sessions.
              </p>

              {/* Button */}
              <button className="w-full bg-[#778873] text-white py-4 rounded-xl hover:bg-[#5F6E60] transition-colors duration-300 font-medium text-lg flex items-center justify-center">
                Continue to Application →
              </button>
            </div>
          </div>

          {/* Interviewer Login Card */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center h-full">
              {/* Icon */}
              <div className="w-20 h-20 bg-[#778873] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                <LogIn className="w-10 h-10 text-[#778873]" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-[#2f2f2f] mb-4">
                Interviewer Login
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                Already applied or already an interviewer? Sign in to access your dashboard, manage interviews, and review feedback.
              </p>

              {/* Button */}
              <button className="w-full bg-[#5F6E60] text-white py-4 rounded-xl hover:bg-[#4a5449] transition-colors duration-300 font-medium text-lg flex items-center justify-center">
                Login as Interviewer →
              </button>
            </div>
          </div>
        </div>

        {/* Optional Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Have questions? Visit our{' '}
            <a href="#" className="text-[#778873] hover:text-[#5F6E60] font-medium underline">
              Help Center
            </a>{' '}
            or{' '}
            <a href="#" className="text-[#778873] hover:text-[#5F6E60] font-medium underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}