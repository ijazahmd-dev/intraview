// import React from 'react';
// import { UserPlus, LogIn } from 'lucide-react';
// import { useNavigate } from "react-router-dom";

// export default function InterviewerOptions() {
//   const navigate = useNavigate();
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#F1F3E0] via-white to-[#F1F3E0] flex items-center justify-center px-4 py-12">
//       <div className="max-w-6xl w-full">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold text-[#2f2f2f] mb-4">
//             Become a SkillVerse Interviewer
//           </h1>
//           <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
//             Share your expertise, conduct mock interviews, and guide learners. Whether you are applying for the first time or returning as an interviewer, choose an option below.
//           </p>
//         </div>

//         {/* Cards Grid */}
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Apply as Interviewer Card */}
//           <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
//             <div className="flex flex-col items-center text-center h-full">
//               {/* Icon */}
//               <div className="w-20 h-20 bg-[#778873] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
//                 <UserPlus className="w-10 h-10 text-[#778873]" />
//               </div>

//               {/* Content */}
//               <h2 className="text-2xl font-bold text-[#2f2f2f] mb-4">
//                 Apply as Interviewer
//               </h2>
//               <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
//                 Submit your application to start conducting mock interviews. Mentor candidates, share your expertise, and earn through personalized interview sessions.
//               </p>

//               {/* Button */}
//               <button onClick={() => navigate("/interviewer/apply")} className="w-full bg-[#778873] text-white py-4 rounded-xl hover:bg-[#5F6E60] transition-colors duration-300 font-medium text-lg flex items-center justify-center">
//                 Continue to Application →
//               </button>
//             </div>
//           </div>

//           {/* Interviewer Login Card */}
//           <div onClick={() => navigate("/interviewer/login")} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
//             <div className="flex flex-col items-center text-center h-full">
//               {/* Icon */}
//               <div className="w-20 h-20 bg-[#778873] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
//                 <LogIn className="w-10 h-10 text-[#778873]" />
//               </div>

//               {/* Content */}
//               <h2 className="text-2xl font-bold text-[#2f2f2f] mb-4">
//                 Interviewer Login
//               </h2>
//               <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
//                 Already applied or already an interviewer? Sign in to access your dashboard, manage interviews, and review feedback.
//               </p>

//               {/* Button */}
//               <button className="w-full bg-[#5F6E60] text-white py-4 rounded-xl hover:bg-[#4a5449] transition-colors duration-300 font-medium text-lg flex items-center justify-center">
//                 Login as Interviewer →
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Optional Footer Note */}
//         <div className="text-center mt-12">
//           <p className="text-gray-500 text-sm">
//             Have questions? Visit our{' '}
//             <a href="#" className="text-[#778873] hover:text-[#5F6E60] font-medium underline">
//               Help Center
//             </a>{' '}
//             or{' '}
//             <a href="#" className="text-[#778873] hover:text-[#5F6E60] font-medium underline">
//               Contact Support
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }







import React, { useEffect } from "react";
import { ArrowRight, LogIn, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { fetchEligibility } from "../interviewerSlice";

export default function InterviewerOptions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { eligibility, loadingEligibility } = useSelector(
    (s) => s.interviewer
  );

  // Fetch eligibility when authenticated
  useEffect(() => {
    if (user) {
      dispatch(fetchEligibility());
    }
  }, [user, dispatch]);

  const renderApplyButtonLabel = () => {
    if (!user) return "Register or login to apply";
    if (loadingEligibility) return "Checking eligibility...";
    if (!eligibility) return "Continue to application";

    if (!eligibility.can_apply) {
      if (eligibility.status === "PENDING") return "View application status";
      if (eligibility.status === "APPROVED") return "Go to interviewer login";
      return "View application status";
    }

    return "Continue to application";
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate("/Signup"); // or /login
      return;
    }

    if (!eligibility || eligibility.can_apply) {
      navigate("/interviewer/apply");
      return;
    }

    // has application already
    if (eligibility.status === "APPROVED") {
      navigate("/interviewer/login");
    } else {
      navigate("/interviewer/status");
    }
  };

  const handleInterviewerLoginClick = () => {
    navigate("/interviewer/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="text-center pt-8 pb-4">
        <p className="text-gray-500 text-sm mb-2">Interviewer hub</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        {/* Title Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Share your experience, shape the next hire.
          </h1>
          <p className="text-gray-600 text-lg">
            Join IntraView as an interviewer to run high-signal mock interviews,
            give precise feedback, and help candidates walk into the real thing
            with confidence.
          </p>
        </div>

        {/* Cards Container */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Apply as Interviewer Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Apply as Interviewer
                </h2>
                <p className="text-teal-600 text-sm">New to IntraView</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Tell us about your background, roles you have hired for, and
              preferred interview types. We will review your profile and get you
              ready to run your first mock interview.
            </p>

            <ol className="space-y-3 mb-6">
              <li className="flex gap-3 text-gray-700">
                <span className="font-semibold">1</span>
                <span>
                  Complete a short profile about your domain and seniority.
                </span>
              </li>
              <li className="flex gap-3 text-gray-700">
                <span className="font-semibold">2</span>
                <span>Record a quick intro so candidates know your style.</span>
              </li>
              <li className="flex gap-3 text-gray-700">
                <span className="font-semibold">3</span>
                <span>
                  Get matched with candidates preparing for your specialties.
                </span>
              </li>
            </ol>

            <p className="text-sm text-gray-500 mb-4">
              Takes about 5-7 minutes to complete.
            </p>

            {/* Button now uses eligibility logic */}
            <button
              onClick={handleApplyClick}
              disabled={loadingEligibility && !!user}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {renderApplyButtonLabel()}
            </button>
          </div>

          {/* Interviewer Login Card */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start gap-4 mb-6">
              <LogIn className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Interviewer Login</h2>
                <p className="text-blue-200 text-sm">Already approved</p>
              </div>
            </div>

            <p className="text-gray-200 mb-6">
              Access your dashboard to view upcoming mock interviews, review
              past sessions, and refine the feedback you share with candidates.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>See your schedule and manage availability in one place.</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Replay interview moments and refine written feedback.</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Track impact across candidates you have helped.</span>
              </li>
            </ul>

            <p className="text-sm text-gray-300 mb-4">
              Jump back into your interviewer workspace.
            </p>

            <button
              onClick={handleInterviewerLoginClick}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Login as interviewer
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-6xl mx-auto text-center mt-8">
          <p className="text-gray-600">
            Have questions about becoming an interviewer? Visit the{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Help Center
            </a>{" "}
            or{" "}
            <a href="#" className="text-blue-600 hover:underline">
              contact support
            </a>{" "}
            and our team will follow up.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">
              Home
            </a>
            <a href="#" className="hover:text-gray-900">
              About
            </a>
            <a href="#" className="hover:text-gray-900">
              Blog
            </a>
            <a href="#" className="hover:text-gray-900">
              FAQ
            </a>
            <a href="#" className="hover:text-gray-900">
              Interview
            </a>
            <a href="#" className="hover:text-gray-900">
              Support
            </a>
            <a href="#" className="hover:text-gray-900">
              Privacy Policy
            </a>
          </nav>
          <p className="text-sm text-gray-500">
            © 2025 IntraView. Interviewer experience.
          </p>
        </div>
      </footer>

      {/* Floating Arrow Button */}
      <button className="fixed bottom-8 right-8 w-12 h-12 bg-gray-400 hover:bg-gray-500 rounded-full flex items-center justify-center shadow-lg transition-colors">
        <ArrowRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
