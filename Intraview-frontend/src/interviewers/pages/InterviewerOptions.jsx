

import React, { useEffect, useMemo } from "react";
import { ArrowRight, LogIn, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchEligibility } from "../interviewerSlice";

export default function InterviewerOptions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state)=>state.auth)
  const { eligibility, loadingEligibility, application_id } = useSelector(
    (s) => s.interviewer
  );

  // simple key per user + application to remember they have already seen this rejection
    const rejectionSeenKey = useMemo(() => {
      if (!user || !application_id) return null;
      return `interviewer_rejection_seen_${user.id}_${application_id}`;
    }, [user, application_id]);

    const hasSeenRejectionStatus = useMemo(() => {
      if (!rejectionSeenKey) return false;
      return localStorage.getItem(rejectionSeenKey) === "true";
    }, [rejectionSeenKey]);

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

    // If there is an application already
    if (!eligibility.can_apply) {
      // PENDING or APPROVED → always view status
      if (eligibility.status === "PENDING") return "View application status";
      if (eligibility.status === "APPROVED") return "View application status";

      // REJECTED
      if (eligibility.status === "REJECTED") {
        // if user has not yet opened status page after rejection
        if (!hasSeenRejectionStatus) {
          return "View application status";
        }
        // after one view, treat as fresh apply
        return "Continue to application";
      }

      return "View application status";
    }

    // can_apply === true (no application yet or allowed to reapply)
    return "Continue to application";
  };

  const handleApplyClick = () => {
    // Not authenticated → go to signup
    if (!user) {
      navigate("/Signup");
      return;
    }

    // If we still don't have eligibility information, default to apply
    if (!eligibility) {
      navigate("/interviewer/apply");
      return;
    }

    // User has an existing application
    if (!eligibility.can_apply) {
      // For all of PENDING, APPROVED, and first-time REJECTED, go to status
      if (
        eligibility.status === "PENDING" ||
        eligibility.status === "APPROVED" ||
        (eligibility.status === "REJECTED" && !hasSeenRejectionStatus)
      ) {
        navigate("/interviewer/status");
        return;
      }

      // REJECTED and already seen → go to application
      navigate("/interviewer/apply");
      return;
    }

    // can_apply === true (no application or allowed to reapply)
    navigate("/interviewer/apply");
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
