

// // src/features/interviewer/pages/InterviewerStatus.jsx

// import { useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { CheckCircle2, HelpCircle, AlertTriangle } from "lucide-react";
// import { fetchInterviewerStatus } from "../interviewerSlice";


// export default function InterviewerStatus() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state)=> state.auth)

//   const {
//     status,
//     loading,
//     rejection_reason,
//     submitted_at,
//     application_id,
//   } = useSelector((state) => state.interviewer);

//   // 1. Fetch status on mount
//   useEffect(() => {
//     dispatch(fetchInterviewerStatus());
//   }, [dispatch]);

//   // 2. Build localStorage key for "rejection seen" per user+application
//   const rejectionSeenKey = useMemo(() => {
//     if (!user || !application_id) return null;
//     return `interviewer_rejection_seen_${user.id}_${application_id}`;
//   }, [user, application_id]);

//   // 3. When user opens this page with REJECTED, mark as seen
//   useEffect(() => {
//     if (status === "REJECTED" && rejectionSeenKey) {
//       localStorage.setItem(rejectionSeenKey, "true");
//     }
//   }, [status, rejectionSeenKey]);

//   // 4. Redirect for states that don't use this page
//   useEffect(() => {
//     if (!status) return;
//     if (status === "ACTIVE") {
//       navigate("/interviewer/dashboard", { replace: true });
//     }
//     if (status === "NOT_APPLIED") {
//       navigate("/interviewer/request", { replace: true });
//     }
//   }, [status, navigate]);

//   if (loading || status === "IDLE" || !status) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-slate-50">
//         <p className="text-gray-600 text-sm">
//           Checking interviewer application status...
//         </p>
//       </div>
//     );
//   }

//   // Titles / subtitles tuned per status
//   const statusTitleMap = {
//     PENDING: "Your Application has been Successfully Submitted!",
//     APPROVED_NOT_ONBOARDED: "Congratulations — You’ve been selected as an Interviewer!",
//     REJECTED: "Your Application has been Reviewed",
//     SUSPENDED: "Account Status",
//   };

//   const statusSubtitleMap = {
//     PENDING:
//       "Thank you for applying to become an interviewer. We’ve received your application and will review it carefully.",
//     APPROVED_NOT_ONBOARDED:
//       "You’ve been approved as an interviewer on IntraView. You can now access your interviewer workspace and start preparing for your first sessions.",
//     REJECTED:
//       "This time your application was not selected. Review the feedback below, strengthen your profile, and you’re welcome to apply again.",
//     SUSPENDED:
//       "Your interviewer account is currently restricted. Please review the notes below or contact support.",
//   };

//   const mainTitle = statusTitleMap[status] || "Interviewer Application Status";
//   const subtitle =
//     statusSubtitleMap[status] ||
//     "Here’s the latest information about your interviewer profile.";

//   const formatDate = (value) => {
//     if (!value) return "Today";
//     try {
//       const d = new Date(value);
//       return d.toLocaleDateString(undefined, {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch {
//       return "Today";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10">
//       <div className="max-w-5xl mx-auto px-4">
//         {/* Header */}
//         <div className="flex flex-col items-center text-center mb-8">
//           <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
//             <CheckCircle2 className="w-8 h-8 text-emerald-500" />
//           </div>
//           <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
//             {mainTitle}
//           </h1>
//           <p className="text-slate-500 text-sm md:text-base max-w-2xl">
//             {subtitle}
//           </p>
//           {submitted_at && (
//             <p className="mt-3 text-xs text-slate-400">
//               Application submitted on{" "}
//               <span className="font-medium text-slate-500">
//                 {formatDate(submitted_at)}
//               </span>
//             </p>
//           )}
//         </div>

//         {/* Status badge */}
//         <div className="max-w-3xl mx-auto mb-6">
//           <div className="flex items-center justify-center bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3 text-xs md:text-sm text-sky-800">
//             <span className="inline-flex items-center gap-2">
//               <span className="h-2 w-2 rounded-full bg-emerald-500" />
//               Current status:
//               <span className="font-semibold uppercase">
//                 {status.replace("_", " ")}
//               </span>
//             </span>
//           </div>
//         </div>

//         {/* What happens next / status timeline */}
//         <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6">
//           <h2 className="text-sm md:text-base font-semibold text-slate-800 mb-4">
//             What Happens Next?
//           </h2>

//           <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
//             <ol className="space-y-4 text-sm text-slate-700">
//               <li className="flex items-start gap-3">
//                 <div className="mt-1">
//                   <div className="w-3 h-3 rounded-full bg-emerald-500" />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-slate-800">
//                     Application Received
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     Your application has been submitted and stored in our review
//                     queue.
//                   </p>
//                   <p className="text-[11px] text-slate-400 mt-1">
//                     Date: {formatDate(submitted_at)}
//                   </p>
//                 </div>
//               </li>

//               <li className="flex items-start gap-3">
//                 <div className="mt-1">
//                   <div
//                     className={`w-3 h-3 rounded-full ${
//                       status === "PENDING" || status === "APPROVED_NOT_ONBOARDED"
//                         ? "bg-amber-400"
//                         : "bg-slate-300"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-slate-800">
//                     Under Review by Admin
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     Our team validates your experience, resume, and links to
//                     ensure quality across interviewers.
//                   </p>
//                   <p className="text-[11px] text-slate-400 mt-1">
//                     Typical duration: 1–3 business days.
//                   </p>
//                 </div>
//               </li>

//               <li className="flex items-start gap-3">
//                 <div className="mt-1">
//                   <div
//                     className={`w-3 h-3 rounded-full ${
//                       status === "APPROVED_NOT_ONBOARDED" || status === "ACTIVE"
//                         ? "bg-emerald-500"
//                         : "bg-slate-300"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-slate-800">
//                     Qualification Assessment
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     We look at your specialties, seniority, and domains to
//                     decide which candidates you’re best suited to help.
//                   </p>
//                   <p className="text-[11px] text-slate-400 mt-1">
//                     You may receive follow-up questions if we need clarification.
//                   </p>
//                 </div>
//               </li>

//               <li className="flex items-start gap-3">
//                 <div className="mt-1">
//                   <div
//                     className={`w-3 h-3 rounded-full ${
//                       status === "REJECTED" || status === "SUSPENDED"
//                         ? "bg-red-400"
//                         : status === "APPROVED_NOT_ONBOARDED" ||
//                           status === "ACTIVE"
//                         ? "bg-emerald-500"
//                         : "bg-slate-300"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-slate-800">
//                     Notification of Outcome
//                   </p>
//                   <p className="text-xs text-slate-500">
//                     You’ll receive an email with the decision and next steps.
//                     Approved interviewers can access their workspace; others can
//                     update their profile and reapply later.
//                   </p>
//                   <p className="text-[11px] text-slate-400 mt-1">
//                     We’ll always explain any important actions you should take.
//                   </p>
//                 </div>
//               </li>
//             </ol>

//             {/* Side block varies by status */}
//             <div className="space-y-4">
//               {status === "PENDING" && (
//                 <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-600">
//                   <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
//                     <HelpCircle className="w-4 h-4 text-sky-500" />
//                     While you wait
//                   </h3>
//                   <ul className="list-disc list-inside space-y-1">
//                     <li>Keep your LinkedIn and resume up to date.</li>
//                     <li>Think about your preferred interview slots each week.</li>
//                     <li>Prepare 2–3 real interview scenarios you like to use.</li>
//                   </ul>
//                 </div>
//               )}

//               {status === "APPROVED_NOT_ONBOARDED" && (
//                 <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-800">
//                   <h3 className="text-sm font-semibold mb-2">
//                     Welcome to the interviewer pool
//                   </h3>
//                   <p className="mb-2">
//                     You&apos;re now eligible to conduct mock interviews on
//                     IntraView. From your interviewer workspace you&apos;ll be
//                     able to:
//                   </p>
//                   <ul className="list-disc list-inside space-y-1">
//                     <li>Set your availability for upcoming weeks.</li>
//                     <li>Choose preferred interview formats and difficulty levels.</li>
//                     <li>Track feedback and impact across candidates you help.</li>
//                   </ul>
//                   <button
//                     onClick={() => navigate("/interviewer/login")}
//                     className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
//                   >
//                     Go to Interviewer Login
//                   </button>
//                 </div>
//               )}

//               {status === "REJECTED" && (
//                 <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-700">
//                   <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
//                     <AlertTriangle className="w-4 h-4" />
//                     Application Feedback
//                   </h3>
//                   <p className="mb-1">Reason from our team:</p>
//                   <p className="text-xs bg-white/60 border border-red-100 rounded-lg p-2">
//                     {rejection_reason || "No specific reason was provided."}
//                   </p>
//                   <p className="mt-2">
//                     To improve your chances next time, make sure your resume
//                     clearly highlights:
//                   </p>
//                   <ul className="list-disc list-inside mt-1 space-y-1">
//                     <li>Real interview experience and hiring responsibilities.</li>
//                     <li>Depth in the domains you want to interview for.</li>
//                     <li>Clean LinkedIn and up-to-date project portfolio.</li>
//                   </ul>
//                 </div>
//               )}

//               {status === "SUSPENDED" && (
//                 <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800">
//                   <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
//                     <AlertTriangle className="w-4 h-4" />
//                     Important
//                   </h3>
//                   <p>
//                     Your interviewer account has been temporarily suspended.
//                     This may be due to repeated no-shows, low quality feedback,
//                     or a violation of platform guidelines.
//                   </p>
//                   <p className="mt-2">
//                     Please reach out to{" "}
//                     <span className="font-semibold">
//                       support@intraview.app
//                     </span>{" "}
//                     if you believe this is an error.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Assistance */}
//         <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 md:p-8 mb-6">
//           <h2 className="text-sm md:text-base font-semibold text-slate-800 mb-3 text-center">
//             Need Assistance?
//           </h2>
//           <p className="text-xs md:text-sm text-slate-500 text-center mb-5 max-w-xl mx-auto">
//             If you have any questions or need help with your application, our
//             support team is here to assist you.
//           </p>
//           <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-xs md:text-sm">
//             <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
//               <p className="font-semibold text-slate-800 mb-1">Email Support</p>
//               <p className="text-slate-500">support@intraview.app</p>
//             </div>
//             <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
//               <p className="font-semibold text-slate-800 mb-1">Phone Support</p>
//               <p className="text-slate-500">+91-00000-00000</p>
//             </div>
//           </div>
//         </div>

//         {/* Important reminders + CTA */}
//         <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 md:p-7 text-xs md:text-sm text-amber-900">
//           <h3 className="font-semibold mb-2">Important Reminders</h3>
//           <ul className="list-disc list-inside space-y-1">
//             <li>
//               Check your email regularly (including spam) for updates about your
//               application.
//             </li>
//             <li>
//               Keep your contact information and LinkedIn profile up to date.
//             </li>
//             <li>
//               You can always return to the interviewer hub from the home page to
//               start a new application later.
//             </li>
//           </ul>
//           <div className="mt-4 flex justify-center gap-3">
//             {status === "APPROVED_NOT_ONBOARDED" && (
//               <button
//                 onClick={() => navigate("/interviewer/login")}
//                 className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm font-semibold hover:bg-emerald-700"
//               >
//                 Go to Interviewer Login
//               </button>
//             )}
//             <button
//               onClick={() => navigate("/home")}
//               className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs md:text-sm font-medium hover:bg-white"
//             >
//               Back to Home
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }













// src/features/interviewer/pages/InterviewerStatus.jsx

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  PartyPopper,
  ArrowRight,
  XCircle,
  RefreshCw
} from "lucide-react";
import { fetchInterviewerStatus } from "../interviewerSlice";

export default function InterviewerStatus() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const {
    status,
    loading,
    rejection_reason,
    submitted_at,
    application_id,
  } = useSelector((state) => state.interviewer);


  console.log('🚀 ~ file: InterviewerStatus.jsx:37 ~ status:', status)

  // 1. Fetch status on mount
  useEffect(() => {
    dispatch(fetchInterviewerStatus());
  }, [dispatch]);

  // 2. Build localStorage key for "rejection seen" per user+application
  const rejectionSeenKey = useMemo(() => {
    if (!user || !application_id) return null;
    return `interviewer_rejection_seen_${user.id}_${application_id}`;
  }, [user, application_id]);

  // 3. When user opens this page with REJECTED, mark as seen
  useEffect(() => {
    if (status === "REJECTED" && rejectionSeenKey) {
      localStorage.setItem(rejectionSeenKey, "true");
    }
  }, [status, rejectionSeenKey]);

  // 4. Redirect for states that don't use this page
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

  // ========================================
  // APPROVED STATUS - CELEBRATION VIEW
  // ========================================
  if (status === "APPROVED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* 🎉 Celebration Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 shadow-lg animate-bounce">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              🎊 Congratulations! 🎊
            </h1>
            <p className="text-lg md:text-xl text-emerald-600 font-semibold mb-2">
              You've been approved as an IntraView Interviewer!
            </p>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl">
              Welcome to our community of expert interviewers. You can now start helping candidates prepare for their dream jobs.
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

          {/* Status Badge */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex items-center justify-center bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-4 py-3 text-sm text-emerald-800">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Status:
                <span className="font-bold">APPROVED</span>
              </span>
            </div>
          </div>

          {/* Big CTA Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 mb-6 border-2 border-emerald-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                🚀 Ready to Start Your Journey?
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                You're all set! Click the button below to access your interviewer workspace and start setting up your availability.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/interviewer/login")}
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-base font-semibold hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Go to Interviewer Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/home")}
                className="px-8 py-4 rounded-xl border-2 border-slate-200 text-slate-700 text-base font-medium hover:bg-slate-50 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Journey Timeline - ALL GREEN */}
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">
              ✅ Your Application Journey
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    Application Received
                  </p>
                  <p className="text-sm text-slate-500">
                    Your application was successfully submitted and stored in our review queue.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(submitted_at)}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              <div className="ml-3 h-6 w-0.5 bg-emerald-500"></div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    Reviewed by Admin
                  </p>
                  <p className="text-sm text-slate-500">
                    Our team validated your experience, resume, and qualifications.
                  </p>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    ✓ Completed
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              <div className="ml-3 h-6 w-0.5 bg-emerald-500"></div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    Qualification Assessment
                  </p>
                  <p className="text-sm text-slate-500">
                    Your specialties and domains were matched with our candidate needs.
                  </p>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    ✓ Completed
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              <div className="ml-3 h-6 w-0.5 bg-emerald-500"></div>

              {/* Step 4 - APPROVED */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-emerald-700">
                    ✅ Application Approved!
                  </p>
                  <p className="text-sm text-slate-500">
                    You're now part of the IntraView interviewer community.
                  </p>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    Today
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 md:p-8 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              What's Next?
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
              <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-blue-100">
                <p className="font-semibold text-slate-800 mb-2">1. Access Your Dashboard</p>
                <p className="text-xs text-slate-600">
                  Login to your interviewer workspace and complete your profile setup.
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-blue-100">
                <p className="font-semibold text-slate-800 mb-2">2. Set Your Availability</p>
                <p className="text-xs text-slate-600">
                  Choose your preferred interview slots for the upcoming weeks.
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-blue-100">
                <p className="font-semibold text-slate-800 mb-2">3. Prepare Your Materials</p>
                <p className="text-xs text-slate-600">
                  Review common interview formats and prepare your question bank.
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-blue-100">
                <p className="font-semibold text-slate-800 mb-2">4. Start Interviewing</p>
                <p className="text-xs text-slate-600">
                  Accept booking requests and begin conducting mock interviews.
                </p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8">
            <h2 className="text-base font-semibold text-slate-800 mb-3 text-center">
              Need Help Getting Started?
            </h2>
            <p className="text-sm text-slate-500 text-center mb-5 max-w-xl mx-auto">
              Our support team is here to help you with onboarding and any questions you might have.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-sm">
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-center">
                <p className="font-semibold text-slate-800 mb-1">Email Support</p>
                <p className="text-slate-600 text-xs">support@intraview.app</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-center">
                <p className="font-semibold text-slate-800 mb-1">Phone Support</p>
                <p className="text-slate-600 text-xs">+91-00000-00000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // REJECTED STATUS - EMPATHETIC VIEW
  // ========================================
  if (status === "REJECTED") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
              Application Not Approved
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl">
              Thank you for your interest in becoming an IntraView interviewer. After careful review, we're unable to approve your application at this time.
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

          {/* Status Badge */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-sm text-red-800">
              <span className="inline-flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Status:
                <span className="font-bold">REJECTED</span>
              </span>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-red-100 p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Feedback from Our Review Team
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
              <p className="text-sm text-red-800 leading-relaxed">
                {rejection_reason || "No specific reason was provided. Please contact support for more details."}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-900 mb-3 text-sm">
                💡 How to Improve Your Application
              </h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <span>Highlight specific interview experience and hiring responsibilities in your resume</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <span>Demonstrate deep expertise in your chosen domains with concrete examples</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <span>Ensure your LinkedIn profile is up-to-date and showcases relevant projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <span>Add certifications or credentials that validate your technical expertise</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Reapply CTA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 md:p-8 mb-6 text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Don't Give Up!
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-xl mx-auto">
              You're welcome to strengthen your profile and reapply. Many successful interviewers were initially rejected but came back with improved applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/interviewer/request")}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Submit New Application
              </button>
              <button
                onClick={() => navigate("/home")}
                className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-medium hover:bg-white transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8">
            <h2 className="text-base font-semibold text-slate-800 mb-3 text-center">
              Questions About Your Application?
            </h2>
            <p className="text-sm text-slate-500 text-center mb-5 max-w-xl mx-auto">
              Our team can provide additional context about the decision and help you prepare for reapplication.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-sm">
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-center">
                <p className="font-semibold text-slate-800 mb-1">Email Support</p>
                <p className="text-slate-600 text-xs">support@intraview.app</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-center">
                <p className="font-semibold text-slate-800 mb-1">Phone Support</p>
                <p className="text-slate-600 text-xs">+91-00000-00000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // PENDING STATUS - ORIGINAL DESIGN
  // ========================================
  // Titles / subtitles tuned per status
  const statusTitleMap = {
    PENDING: "Your Application has been Successfully Submitted!",
    SUSPENDED: "Account Status",
  };

  const statusSubtitleMap = {
    PENDING:
      "Thank you for applying to become an interviewer. We've received your application and will review it carefully.",
    SUSPENDED:
      "Your interviewer account is currently restricted. Please review the notes below or contact support.",
  };

  const mainTitle = statusTitleMap[status] || "Interviewer Application Status";
  const subtitle =
    statusSubtitleMap[status] ||
    "Here's the latest information about your interviewer profile.";

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
                      status === "PENDING"
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
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Qualification Assessment
                  </p>
                  <p className="text-xs text-slate-500">
                    We look at your specialties, seniority, and domains to
                    decide which candidates you're best suited to help.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You may receive follow-up questions if we need clarification.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Notification of Outcome
                  </p>
                  <p className="text-xs text-slate-500">
                    You'll receive an email with the decision and next steps.
                    Approved interviewers can access their workspace; others can
                    update their profile and reapply later.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    We'll always explain any important actions you should take.
                  </p>
                </div>
              </li>
            </ol>

            {/* Side block varies by status */}
            <div className="space-y-4">
              {status === "PENDING" && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-600">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                    <HelpCircle className="w-4 h-4 text-sky-500" />
                    While you wait
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Keep your LinkedIn and resume up to date.</li>
                    <li>Think about your preferred interview slots each week.</li>
                    <li>Prepare 2–3 real interview scenarios you like to use.</li>
                  </ul>
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

        {/* Important reminders + CTA */}
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 md:p-7 text-xs md:text-sm text-amber-900">
          <h3 className="font-semibold mb-2">Important Reminders</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Check your email regularly (including spam) for updates about your
              application.
            </li>
            <li>
              Keep your contact information and LinkedIn profile up to date.
            </li>
            <li>
              You can always return to the interviewer hub from the home page to
              start a new application later.
            </li>
          </ul>
          <div className="mt-4 flex justify-center">
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
