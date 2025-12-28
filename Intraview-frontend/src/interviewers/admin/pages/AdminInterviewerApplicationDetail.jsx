
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   clearSelected,
//   getApplicationDetail,
//   reviewApplication,
// } from "../adminInterviewerSlice";
// import ReviewModal from "../components/ReviewModal";
// import StatusBadge from "../components/StatusBadge";

// export default function AdminInterviewerApplicationDetail() {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { selected, detailLoading, reviewLoading } = useSelector(
//     (s) => s.adminInterviewer
//   );
//   const [showReject, setShowReject] = useState(false);

//   useEffect(() => {
//     dispatch(getApplicationDetail(id));
//     return () => {
//       dispatch(clearSelected());
//     };
//   }, [dispatch, id]);

//   const handleApprove = async () => {
//     await dispatch(reviewApplication({ id, action: "approve" }));
//     dispatch(getApplicationDetail(id));
//   };

//   const handleReject = async (reason) => {
//     await dispatch(
//       reviewApplication({
//         id,
//         action: "reject",
//         rejection_reason: reason,
//       })
//     );
//     setShowReject(false);
//     dispatch(getApplicationDetail(id));
//   };

//   if (detailLoading || !selected) {
//     return (
//       <div className="p-6">
//         <p className="text-sm text-slate-500">Loading application...</p>
//       </div>
//     );
//   }

//   const {
//     user_email,
//     first_name,
//     last_name,
//     phone_number,
//     location,
//     timezone,
//     years_of_experience,
//     years_of_interview_experience,
//     education,
//     specializations = [],
//     languages = [],
//     linkedin_url,
//     github_url,
//     portfolio_url,
//     expertise_summary,
//     motivation,
//     resume,
//     certifications,
//     additional_docs,
//     created_at,
//     reviewed_at,
//     reviewed_by_name,
//     status,
//     rejection_reason,
//   } = selected;

//   return (
//     <div className="p-6 max-w-5xl mx-auto space-y-6">
//       {/* Top bar */}
//       <div className="flex items-center justify-between">
//         <button
//           onClick={() => navigate(-1)}
//           className="text-xs text-slate-500 hover:text-slate-800"
//         >
//           ← Back to list
//         </button>
//         <StatusBadge status={status} />
//       </div>

//       {/* Header */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
//             {(first_name?.[0] || "").toUpperCase()}
//             {(last_name?.[0] || "").toUpperCase()}
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-slate-800">
//               {first_name} {last_name}
//             </p>
//             <p className="text-xs text-slate-500">
//               {user_email} · {phone_number}
//             </p>
//             <p className="text-[11px] text-slate-400">
//               {location} · {timezone}
//             </p>
//           </div>
//         </div>
//         <div className="text-right text-xs text-slate-500">
//           <p>Applied: {created_at}</p>
//           {reviewed_at && (
//             <p>
//               Reviewed: {reviewed_at}{" "}
//               {reviewed_by_name && `by ${reviewed_by_name}`}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Main content grid */}
//       <div className="grid lg:grid-cols-3 gap-5 items-start">
//         {/* Left 2/3: professional & narrative */}
//         <div className="lg:col-span-2 space-y-4">
//           {/* Experience summary */}
//           <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 text-sm">
//             <h2 className="text-sm font-semibold text-slate-800 mb-3">
//               Professional Background
//             </h2>
//             <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-600 mb-3">
//               <div>
//                 <p className="text-[11px] text-slate-400">
//                   Years of experience
//                 </p>
//                 <p className="font-semibold">
//                   {years_of_experience} years
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[11px] text-slate-400">
//                   Interviewing experience
//                 </p>
//                 <p className="font-semibold">
//                   {years_of_interview_experience} years
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[11px] text-slate-400">Education</p>
//                 <p>{education || "Not provided"}</p>
//               </div>
//             </div>

//             <div className="mb-3">
//               <p className="text-[11px] text-slate-400 mb-1">
//                 Specializations
//               </p>
//               {specializations.length ? (
//                 <div className="flex flex-wrap gap-1">
//                   {specializations.map((s) => (
//                     <span
//                       key={s}
//                       className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
//                     >
//                       {s}
//                     </span>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-xs text-slate-500">None specified</p>
//               )}
//             </div>

//             <div>
//               <p className="text-[11px] text-slate-400 mb-1">Languages</p>
//               {languages.length ? (
//                 <p className="text-xs text-slate-600">
//                   {languages.join(", ")}
//                 </p>
//               ) : (
//                 <p className="text-xs text-slate-500">Not specified</p>
//               )}
//             </div>
//           </section>

//           {/* Narrative answers */}
//           <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 text-sm space-y-4">
//             <div>
//               <h3 className="text-sm font-semibold text-slate-800 mb-1">
//                 Expertise Summary
//               </h3>
//               <p className="text-xs text-slate-600 whitespace-pre-line">
//                 {expertise_summary}
//               </p>
//             </div>
//             {motivation && (
//               <div>
//                 <h3 className="text-sm font-semibold text-slate-800 mb-1">
//                   Motivation
//                 </h3>
//                 <p className="text-xs text-slate-600 whitespace-pre-line">
//                   {motivation}
//                 </p>
//               </div>
//             )}
//           </section>
//         </div>

//         {/* Right 1/3: links, docs, admin info */}
//         <div className="space-y-4 text-xs">
//           {/* Links */}
//           <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
//             <h2 className="text-sm font-semibold text-slate-800 mb-2">
//               Links
//             </h2>
//             <div className="space-y-1">
//               <ExternalLink label="LinkedIn" url={linkedin_url} />
//               <ExternalLink label="GitHub" url={github_url} />
//               <ExternalLink label="Portfolio" url={portfolio_url} />
//             </div>
//           </section>

//           {/* Documents */}
//           <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
//             <h2 className="text-sm font-semibold text-slate-800 mb-2">
//               Documents
//             </h2>
//             <div className="space-y-1">
//               <FileLink label="Resume" file={resume} />
//               <FileLink label="Certifications" file={certifications} />
//               <FileLink label="Additional Docs" file={additional_docs} />
//             </div>
//           </section>

//           {/* Admin notes */}
//           {status === "REJECTED" && rejection_reason && (
//             <section className="bg-red-50 rounded-2xl border border-red-100 p-4">
//               <h2 className="text-sm font-semibold text-red-700 mb-1">
//                 Rejection Reason
//               </h2>
//               <p className="text-xs text-red-700 whitespace-pre-line">
//                 {rejection_reason}
//               </p>
//             </section>
//           )}
//         </div>
//       </div>

//       {/* Actions */}
//       {status === "PENDING" && (
//         <div className="flex gap-3 pt-4 border-t border-slate-100">
//           <button
//             disabled={reviewLoading}
//             onClick={handleApprove}
//             className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg disabled:opacity-60"
//           >
//             {reviewLoading ? "Approving..." : "Approve"}
//           </button>

//           <button
//             disabled={reviewLoading}
//             onClick={() => setShowReject(true)}
//             className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg disabled:opacity-60"
//           >
//             Reject
//           </button>
//         </div>
//       )}

//       {showReject && (
//         <ReviewModal
//           onClose={() => setShowReject(false)}
//           onSubmit={handleReject}
//           loading={reviewLoading}
//         />
//       )}
//     </div>
//   );
// }

// function ExternalLink({ label, url }) {
//   if (!url) {
//     return (
//       <p className="text-slate-400">
//         {label}: <span className="italic">Not provided</span>
//       </p>
//     );
//   }
//   return (
//     <a
//       href={url}
//       target="_blank"
//       rel="noreferrer"
//       className="text-slate-700 hover:text-slate-900 underline decoration-slate-300"
//     >
//       {label}
//     </a>
//   );
// }

// function FileLink({ label, file }) {
//   if (!file) {
//     return (
//       <p className="text-slate-400">
//         {label}: <span className="italic">Not uploaded</span>
//       </p>
//     );
//   }
//   return (
//     <a
//       href={file}
//       target="_blank"
//       rel="noreferrer"
//       className="text-slate-700 hover:text-slate-900 underline decoration-slate-300"
//     >
//       {label} file
//     </a>
//   );
// }

























import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearSelected,
  getApplicationDetail,
  reviewApplication,
} from "../adminInterviewerSlice";
import ReviewModal from "../components/ReviewModal";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Clock, Briefcase,
  GraduationCap, Award, Globe, Github, Linkedin, FileText,
  Download, CheckCircle, XCircle, AlertCircle, Loader2,
  MessageSquare, Calendar
} from "lucide-react";

export default function AdminInterviewerApplicationDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selected, detailLoading, reviewLoading } = useSelector(
    (s) => s.adminInterviewer
  );
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    dispatch(getApplicationDetail(id));
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, id]);

  const handleApprove = async () => {
    await dispatch(reviewApplication({ id, action: "approve" }));
    dispatch(getApplicationDetail(id));
  };

  const handleReject = async (reason) => {
    await dispatch(
      reviewApplication({
        id,
        action: "reject",
        rejection_reason: reason,
      })
    );
    setShowReject(false);
    dispatch(getApplicationDetail(id));
  };

  if (detailLoading || !selected) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-spin" />
              <p className="text-gray-600">Loading application details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    user_email,
    first_name,
    last_name,
    phone_number,
    location,
    timezone,
    years_of_experience,
    years_of_interview_experience,
    education,
    specializations = [],
    languages = [],
    linkedin_url,
    github_url,
    portfolio_url,
    expertise_summary,
    motivation,
    resume,
    certifications,
    additional_docs,
    created_at,
    reviewed_at,
    reviewed_by_name,
    status,
    rejection_reason,
  } = selected;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {(first_name?.[0] || "").toUpperCase()}
                    {(last_name?.[0] || "").toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                      {first_name} {last_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {user_email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {phone_number}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {timezone}
                      </div>
                    </div>
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>

              {/* Timeline Info */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Applied:</span>
                  {created_at ? new Date(created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </div>
                {reviewed_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Reviewed:</span>
                    {new Date(reviewed_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    {reviewed_by_name && <span>by {reviewed_by_name}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - Left 2/3 */}
              <div className="lg:col-span-2 space-y-6">
                {/* Professional Background */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Briefcase className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-gray-800">
                      Professional Background
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Total Experience</p>
                      <p className="text-2xl font-bold text-gray-800">{years_of_experience}</p>
                      <p className="text-xs text-gray-600">years</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Interview Experience</p>
                      <p className="text-2xl font-bold text-gray-800">{years_of_interview_experience}</p>
                      <p className="text-xs text-gray-600">years</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-500">Education</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {education || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-orange-500" />
                      <p className="text-sm font-semibold text-gray-700">Specializations</p>
                    </div>
                    {specializations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {specializations.map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No specializations specified</p>
                    )}
                  </div>

                  {/* Languages */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-orange-500" />
                      <p className="text-sm font-semibold text-gray-700">Languages</p>
                    </div>
                    {languages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No languages specified</p>
                    )}
                  </div>
                </div>

                {/* Expertise Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-gray-800">
                      Expertise Summary
                    </h2>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {expertise_summary}
                  </p>
                </div>

                {/* Motivation */}
                {motivation && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-orange-500" />
                      <h2 className="text-lg font-bold text-gray-800">
                        Motivation
                      </h2>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {motivation}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar - Right 1/3 */}
              <div className="space-y-6">
                {/* Links */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Professional Links</h3>
                  <div className="space-y-3">
                    <LinkItem
                      icon={<Linkedin className="w-4 h-4" />}
                      label="LinkedIn"
                      url={linkedin_url}
                      color="blue"
                    />
                    <LinkItem
                      icon={<Github className="w-4 h-4" />}
                      label="GitHub"
                      url={github_url}
                      color="gray"
                    />
                    <LinkItem
                      icon={<Globe className="w-4 h-4" />}
                      label="Portfolio"
                      url={portfolio_url}
                      color="purple"
                    />
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Documents</h3>
                  <div className="space-y-3">
                    <DocumentLink label="Resume" file={resume} required />
                    <DocumentLink label="Certifications" file={certifications} />
                    <DocumentLink label="Additional Documents" file={additional_docs} />
                  </div>
                </div>

                {/* Rejection Reason */}
                {status === "REJECTED" && rejection_reason && (
                  <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-bold text-red-800">
                        Rejection Reason
                      </h3>
                    </div>
                    <p className="text-sm text-red-700 leading-relaxed whitespace-pre-line">
                      {rejection_reason}
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
                  <h3 className="text-sm font-bold text-orange-800 mb-4">Application Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700">Status:</span>
                      <StatusBadge status={status} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700">Experience:</span>
                      <span className="font-semibold text-orange-900">{years_of_experience}y</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700">Specializations:</span>
                      <span className="font-semibold text-orange-900">{specializations.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700">Languages:</span>
                      <span className="font-semibold text-orange-900">{languages.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {status === "PENDING" && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Review Application</h3>
                <div className="flex gap-3">
                  <button
                    disabled={reviewLoading}
                    onClick={handleApprove}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {reviewLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approve Application
                      </>
                    )}
                  </button>

                  <button
                    disabled={reviewLoading}
                    onClick={() => setShowReject(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReject && (
        <ReviewModal
          onClose={() => setShowReject(false)}
          onSubmit={handleReject}
          loading={reviewLoading}
        />
      )}
    </div>
  );
}

// Helper Components
function LinkItem({ icon, label, url, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  };

  if (!url) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="text-gray-400">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-400">{label}</p>
          <p className="text-xs text-gray-400 italic">Not provided</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 p-3 ${colorClasses[color]} rounded-lg transition-all duration-200 group`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{label}</p>
        <p className="text-xs truncate opacity-75">View profile →</p>
      </div>
    </a>
  );
}

function DocumentLink({ label, file, required }) {
  if (!file) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-400">{label}</p>
            <p className="text-xs text-gray-400 italic">
              {required ? 'Required - Not uploaded' : 'Not uploaded'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={file}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-gray-600" />
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-500">Click to view</p>
        </div>
      </div>
      <Download className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
    </a>
  );
}