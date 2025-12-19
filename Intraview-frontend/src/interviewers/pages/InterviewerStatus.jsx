// src/features/interviewer/pages/InterviewerStatus.jsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, HelpCircle, AlertTriangle } from "lucide-react";
import { fetchInterviewerStatus } from "../interviewerSlice";

export default function InterviewerStatus() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    status,
    loading,
    rejection_reason,
    submitted_at, // assuming you store this from API, else remove
  } = useSelector((state) => state.interviewer);

  // 1. Fetch status on mount
  useEffect(() => {
    dispatch(fetchInterviewerStatus());
  }, [dispatch]);

  // 2. Redirect for states that don't need this page
  useEffect(() => {
    if (!status) return;
    if (status === "ACTIVE") {
      navigate("/interviewer/dashboard", { replace: true });
    }
    if (status === "NOT_APPLIED") {
      navigate("/interviewer/request", { replace: true });
    }
  }, [status, navigate]);

  if (loading || status === "IDLE" || !status) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-gray-600 text-sm">
          Checking interviewer application status...
        </p>
      </div>
    );
  }

  const statusTitleMap = {
    PENDING: "Your Application has been Successfully Submitted!",
    APPROVED_NOT_ONBOARDED: "You’re Approved! Just one more step.",
    REJECTED: "Application Reviewed",
    SUSPENDED: "Account Status",
  };

  const statusSubtitleMap = {
    PENDING:
      "Thank you for applying to become an interviewer. We’ve received your application and will review it carefully.",
    APPROVED_NOT_ONBOARDED:
      "Your application looks great. Complete onboarding to activate your interviewer account and start accepting sessions.",
    REJECTED:
      "Your interviewer application has been reviewed. See the details below and improve your profile before applying again.",
    SUSPENDED:
      "Your interviewer account is currently restricted. Please review the notes below or contact support.",
  };

  const mainTitle = statusTitleMap[status] || "Interviewer Application Status";
  const subtitle =
    statusSubtitleMap[status] || "Here’s the latest information about your interviewer profile.";

  const formatDate = (value) => {
    if (!value) return "Today";
    try {
      const d = new Date(value);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Today";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
            {mainTitle}
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl">
            {subtitle}
          </p>
          {submitted_at && (
            <p className="mt-3 text-xs text-slate-400">
              Application submitted on{" "}
              <span className="font-medium text-slate-500">
                {formatDate(submitted_at)}
              </span>
            </p>
          )}
        </div>

        {/* Status badge */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center justify-center bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3 text-xs md:text-sm text-sky-800">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Current status:
              <span className="font-semibold uppercase">
                {status.replace("_", " ")}
              </span>
            </span>
          </div>
        </div>

        {/* What happens next / status timeline */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6">
          <h2 className="text-sm md:text-base font-semibold text-slate-800 mb-4">
            What Happens Next?
          </h2>

          <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            <ol className="space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Application Received
                  </p>
                  <p className="text-xs text-slate-500">
                    Your application has been submitted and stored in our review
                    queue.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Date: {formatDate(submitted_at)}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "PENDING" || status === "APPROVED_NOT_ONBOARDED"
                        ? "bg-amber-400"
                        : "bg-slate-300"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Under Review by Admin
                  </p>
                  <p className="text-xs text-slate-500">
                    Our team validates your experience, resume, and links to
                    ensure quality across interviewers.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Typical duration: 1–3 business days.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "APPROVED_NOT_ONBOARDED" || status === "ACTIVE"
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Qualification Assessment
                  </p>
                  <p className="text-xs text-slate-500">
                    We look at your specialties, seniority, and domains to
                    decide which candidates you’re best suited to help.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You may receive follow-up questions if we need clarification.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "REJECTED" || status === "SUSPENDED"
                        ? "bg-red-400"
                        : status === "APPROVED_NOT_ONBOARDED" ||
                          status === "ACTIVE"
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Notification of Outcome
                  </p>
                  <p className="text-xs text-slate-500">
                    You’ll receive an email with the decision and next steps.
                    Approved interviewers proceed to onboarding; others can
                    update their profile and reapply later.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    We’ll always explain any important actions you should take.
                  </p>
                </div>
              </li>
            </ol>

            {/* Side block varies by status */}
            <div className="space-y-4">
              {(status === "PENDING" || status === "APPROVED_NOT_ONBOARDED") && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-600">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                    <HelpCircle className="w-4 h-4 text-sky-500" />
                    While you wait
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Keep your LinkedIn and resume up to date.</li>
                    <li>Think about your preferred interview slots each week.</li>
                    <li>Prepare 2–3 common scenarios you like to use in interviews.</li>
                  </ul>
                </div>
              )}

              {status === "REJECTED" && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-700">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Application Feedback
                  </h3>
                  <p className="mb-1">Reason from our team:</p>
                  <p className="text-xs bg-white/60 border border-red-100 rounded-lg p-2">
                    {rejection_reason || "No specific reason was provided."}
                  </p>
                  <p className="mt-2">
                    You can improve your profile (experience, resume, or links)
                    and reapply after a few weeks.
                  </p>
                </div>
              )}

              {status === "SUSPENDED" && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Important
                  </h3>
                  <p>
                    Your interviewer account has been temporarily suspended.
                    This may be due to repeated no-shows, low quality feedback,
                    or a violation of platform guidelines.
                  </p>
                  <p className="mt-2">
                    Please reach out to{" "}
                    <span className="font-semibold">
                      support@intraview.app
                    </span>{" "}
                    if you believe this is an error.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assistance */}
        <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 md:p-8 mb-6">
          <h2 className="text-sm md:text-base font-semibold text-slate-800 mb-3 text-center">
            Need Assistance?
          </h2>
          <p className="text-xs md:text-sm text-slate-500 text-center mb-5 max-w-xl mx-auto">
            If you have any questions or need help with your application, our
            support team is here to assist you.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-xs md:text-sm">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
              <p className="font-semibold text-slate-800 mb-1">Email Support</p>
              <p className="text-slate-500">support@intraview.app</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
              <p className="font-semibold text-slate-800 mb-1">Phone Support</p>
              <p className="text-slate-500">+91-00000-00000</p>
            </div>
          </div>
        </div>

        {/* Important reminders */}
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 md:p-7 text-xs md:text-sm text-amber-900">
          <h3 className="font-semibold mb-2">Important Reminders</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Check your email regularly (including spam) for updates about your
              application.
            </li>
            <li>
              If your status changes to <span className="font-semibold">APPROVED</span>, you&apos;ll be able to complete onboarding and
              set availability.
            </li>
            <li>
              Please keep your contact information accurate to receive timely
              notifications.
            </li>
          </ul>
          <div className="mt-4 flex justify-center gap-3">
            {status === "APPROVED_NOT_ONBOARDED" && (
              <button
                onClick={() => navigate("/interviewer/onboarding")}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm font-semibold hover:bg-emerald-700"
              >
                Complete Onboarding
              </button>
            )}
            <button
              onClick={() => navigate("/home")}
              className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs md:text-sm font-medium hover:bg-white"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
