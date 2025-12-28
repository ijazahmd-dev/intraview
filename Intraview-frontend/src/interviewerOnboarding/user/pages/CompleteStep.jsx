import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "../../interviewerOnboardingApi";

export default function CompleteStep() {
  const navigate = useNavigate();
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    try {
      await completeOnboarding();
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.detail || "Unable to complete onboarding.";
      setError(msg);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-emerald-500 text-2xl">✓</span>
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-1">
          {done ? "You’re All Set!" : "Review & Go Live"}
        </h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          {done
            ? "Your onboarding is complete. Your schedule is ready and you can start accepting interview requests."
            : "Once you confirm, your profile will go live and candidates can start booking sessions with you."}
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}

      <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 md:p-8 text-center space-y-5">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2">
              <span className="text-emerald-500 text-lg">📅</span>
            </div>
            <p className="font-semibold text-slate-800">Availability Set</p>
            <p className="text-xs text-slate-600">
              Your schedule is ready for bookings.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2">
              <span className="text-emerald-500 text-lg">👤</span>
            </div>
            <p className="font-semibold text-slate-800">Profile Live</p>
            <p className="text-xs text-slate-600">
              Candidates can now view your profile.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2">
              <span className="text-emerald-500 text-lg">💸</span>
            </div>
            <p className="font-semibold text-slate-800">Ready to Earn</p>
            <p className="text-xs text-slate-600">
              Start accepting interview requests.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={done ? () => navigate("/interviewer/dashboard") : handleComplete}
            disabled={completing}
            className="px-6 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {done ? "Go to Dashboard" : completing ? "Finishing..." : "Finish Onboarding"}
          </button>
          {done && (
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => navigate("/interviewer/profile")}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-white"
              >
                View My Profile
              </button>
              <button
                type="button"
                onClick={() => navigate("/interviewer/dashboard/requests")}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-white"
              >
                Browse Interview Requests
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-100 p-4 text-xs text-slate-600">
        <p className="font-semibold mb-2">What’s Next?</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Check your dashboard for new interview requests.</li>
          <li>Update your availability regularly for best results.</li>
          <li>Review resources to sharpen your interview flows.</li>
          <li>Join the community to connect with other interviewers.</li>
        </ul>
      </div>
    </div>
  );
}
