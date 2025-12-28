import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { fetchOnboardingStatus } from "../../interviewerOnboardingApi";

const steps = [
  { key: "PROFILE", label: "Profile Creation", path: "/interviewer/onboarding/profile" },
  { key: "AVAILABILITY", label: "Availability", path: "/interviewer/onboarding/availability" },
  { key: "VERIFICATION", label: "Verification", path: "/interviewer/onboarding/verification" },
  { key: "TUTORIALS", label: "Tutorials", path: "/interviewer/onboarding/tutorials" },
  { key: "COMPLETED", label: "Complete", path: "/interviewer/onboarding/complete" },
];

export default function InterviewerOnboardingLayout() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await fetchOnboardingStatus();
        if (!mounted) return;

        // Guard: only APPROVED_NOT_ONBOARDED or ACTIVE can be here
        if (data.interviewer_status !== "APPROVED_NOT_ONBOARDED" &&
            data.interviewer_status !== "ACTIVE") {
          navigate("/home", { replace: true });
          return;
        }

        setStatus(data);
      } catch (err) {
        navigate("/home", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [navigate]);

  if (loading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading onboarding...</p>
      </div>
    );
  }

  const currentPath = location.pathname;
  const currentStepIndex = steps.findIndex((s) =>
    currentPath.startsWith(s.path)
  );

  const handleStepClick = (targetIndex) => {
    // Allow only backward navigation or to already-unlocked steps
    if (targetIndex <= currentStepIndex) {
      navigate(steps[targetIndex].path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <span className="text-emerald-500 text-xl">✓</span>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2">
              Welcome to IntraView, Interviewer!
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl">
              Congratulations on being approved as an interviewer. Set up your profile,
              availability, and verification in a few simple steps. This usually takes
              about 10–15 minutes.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Need help? Contact our support team anytime.
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => handleStepClick(index)}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div
                    className={[
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold",
                      isActive
                        ? "bg-emerald-500 text-white"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400",
                    ].join(" ")}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={[
                      "mt-2 text-xs md:text-sm",
                      isActive
                        ? "text-slate-900 font-medium"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    {step.label}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Progress line */}
          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-8">
          <Outlet context={{ onboardingStatus: status, refreshStatus: setStatus }} />
        </div>
      </div>
    </div>
  );
}
