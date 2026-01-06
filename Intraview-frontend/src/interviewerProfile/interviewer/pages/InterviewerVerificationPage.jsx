// import { useState, useCallback, useEffect } from "react";
// import {
//   submitInterviewerVerification,
//   getInterviewerVerificationDetail,
// } from "../../interviewerProfileApi";
// import { Upload, Eye, Download, CheckCircle, Clock, XCircle } from "lucide-react";

// export default function InterviewerVerificationPage() {
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState(null);
//   const [verification, setVerification] = useState(null);

//   const [formData, setFormData] = useState({
//     document_type: "",
//     document_number: "",
//   });
//   const [filePreview, setFilePreview] = useState(null);

//   const loadVerification = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await getInterviewerVerificationDetail();
//       setVerification(data);
//       setError(null);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load verification status.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFilePreview(URL.createObjectURL(file));
//       setFormData((prev) => ({ ...prev, document_file: file }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.document_type || !formData.document_file) {
//       setError("Please fill document type and select a file.");
//       return;
//     }

//     setUploading(true);
//     setError(null);
//     try {
//       await submitInterviewerVerification(formData);
//       await loadVerification(); // Refresh status
//       setFilePreview(null);
//       setFormData({ document_type: "", document_number: "" });
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.detail || "Failed to submit verification.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const downloadDocument = () => {
//     if (verification?.document_file) {
//       window.open(verification.document_file, "_blank");
//     }
//   };

//   useEffect(() => {
//     loadVerification();
//   }, [loadVerification]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-slate-500">Loading verification status...</p>
//         </div>
//       </div>
//     );
//   }

//   const status = verification?.status || "NOT_SUBMITTED";

//   return (
//     <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center">
//             {status === "APPROVED" ? (
//               <CheckCircle className="w-12 h-12 text-emerald-600" />
//             ) : status === "PENDING" ? (
//               <Clock className="w-12 h-12 text-amber-500" />
//             ) : (
//               <Upload className="w-12 h-12 text-slate-400" />
//             )}
//           </div>
//           <h1 className="text-3xl font-bold text-slate-900 mb-3">
//             Identity Verification
//           </h1>
//           <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//             Submit a government-issued ID to verify your identity. This step is
//             required to start conducting interviews.
//           </p>
//         </div>

//         {/* Status Message */}
//         <div className="mb-8 p-6 rounded-2xl border bg-white shadow-sm">
//           <StatusMessage status={status} verification={verification} />
//         </div>

//         {/* Upload Form - Only if not approved */}
//         {status !== "APPROVED" && (
//           <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
//             <h2 className="text-xl font-semibold text-slate-900 mb-6">
//               Submit Document
//             </h2>

//             {error && (
//               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Document Type *
//                 </label>
//                 <select
//                   name="document_type"
//                   value={formData.document_type}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 >
//                   <option value="">Select document type</option>
//                   <option value="Aadhaar Card">Aadhaar Card</option>
//                   <option value="Passport">Passport</option>
//                   <option value="Driving License">Driving License</option>
//                   <option value="PAN Card">PAN Card</option>
//                   <option value="Voter ID">Voter ID</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Document Number (optional)
//                 </label>
//                 <input
//                   type="text"
//                   name="document_number"
//                   value={formData.document_number}
//                   onChange={handleInputChange}
//                   className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                   placeholder="e.g. ABCDE1234F for PAN"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Government ID Document *
//                 </label>
//                 <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-slate-400 transition-colors">
//                   <input
//                     type="file"
//                     accept=".pdf,.jpg,.jpeg,.png"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     id="document-file"
//                   />
//                   <label htmlFor="document-file" className="cursor-pointer">
//                     <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
//                     <p className="text-lg font-medium text-slate-700 mb-1">
//                       {formData.document_file ? "File selected" : "Click to upload"}
//                     </p>
//                     <p className="text-sm text-slate-500">
//                       PDF, JPG, PNG (Max 5MB)
//                     </p>
//                   </label>
//                 </div>
//                 {filePreview && (
//                   <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
//                     <div className="flex items-center gap-2 text-sm text-emerald-800">
//                       <CheckCircle className="w-4 h-4" />
//                       Preview ready
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setFilePreview(null);
//                           setFormData((prev) => ({ ...prev, document_file: null }));
//                         }}
//                         className="ml-auto text-emerald-700 hover:text-emerald-900"
//                       >
//                         Change
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={uploading || !formData.document_type || !formData.document_file}
//                 className="w-full bg-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//               >
//                 {uploading ? (
//                   <>
//                     <div className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit for Review"
//                 )}
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Current Document - Always show */}
//         {verification?.document_file && (
//           <div className="bg-white rounded-2xl shadow-sm border p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-slate-900">
//                 Current Document
//               </h3>
//               <button
//                 onClick={downloadDocument}
//                 className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 rounded-xl transition-colors"
//               >
//                 <Download className="w-4 h-4" />
//                 View Document
//               </button>
//             </div>
//             <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                 <div>
//                   <span className="text-xs text-slate-500">Type</span>
//                   <p className="font-medium">{verification.document_type}</p>
//                 </div>
//                 <div>
//                   <span className="text-xs text-slate-500">Number</span>
//                   <p>{verification.document_number || "—"}</p>
//                 </div>
//                 <div>
//                   <span className="text-xs text-slate-500">Submitted</span>
//                   <p>
//                     {verification.submitted_at
//                       ? new Date(verification.submitted_at).toLocaleDateString()
//                       : "—"}
//                   </p>
//                 </div>
//               </div>
//               <div className="text-xs bg-slate-100 p-2 rounded-lg">
//                 File: {verification.document_file.split("/").pop()}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function StatusMessage({ status, verification }) {
//   if (status === "APPROVED") {
//     return (
//       <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
//         <CheckCircle className="w-6 h-6 text-emerald-600" />
//         <div>
//           <h3 className="font-semibold text-emerald-800">Verified ✅</h3>
//           <p className="text-sm text-emerald-700">
//             Your identity has been successfully verified. You can now conduct
//             interviews.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (status === "PENDING") {
//     return (
//       <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
//         <Clock className="w-6 h-6 text-amber-600" />
//         <div>
//           <h3 className="font-semibold text-amber-800">Under Review</h3>
//           <p className="text-sm text-amber-700">
//             Your document has been submitted and is being reviewed by our team.
//             You will be notified when approved.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (status === "REJECTED") {
//     return (
//       <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
//         <XCircle className="w-6 h-6 text-red-600" />
//         <div>
//           <h3 className="font-semibold text-red-800">Document Rejected</h3>
//           <p className="text-sm text-red-700 mb-2">
//             {verification?.rejection_reason || "Please upload a different document."}
//           </p>
//           <p className="text-xs text-red-600">
//             You can submit a new document above.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
//       <Upload className="w-6 h-6 text-slate-500" />
//       <div>
//         <h3 className="font-semibold text-slate-800">Verification Required</h3>
//         <p className="text-sm text-slate-600">
//           Upload a government-issued ID to complete your profile and start
//           interviewing.
//         </p>
//       </div>
//     </div>
//   );
// }






























import { useState, useCallback, useEffect } from "react";
import {
  submitInterviewerVerification,
  getInterviewerVerificationDetail,
} from "../../interviewerProfileApi";

export default function InterviewerVerificationPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [verification, setVerification] = useState(null);

  const [formData, setFormData] = useState({
    document_type: "",
    document_number: "",
  });
  const [filePreview, setFilePreview] = useState(null);

  const loadVerification = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInterviewerVerificationDetail();
      setVerification(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load verification status.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setFilePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, document_file: file }));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.document_type || !formData.document_file) {
      setError("Please fill document type and select a file.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      await submitInterviewerVerification(formData);
      await loadVerification();
      setFilePreview(null);
      setFormData({ document_type: "", document_number: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to submit verification.");
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = () => {
    if (verification?.document_file) {
      window.open(verification.document_file, "_blank");
    }
  };

  useEffect(() => {
    loadVerification();
  }, [loadVerification]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-light">Loading verification status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = verification?.status || "NOT_SUBMITTED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-start gap-6">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm ${
              status === "APPROVED" ? "bg-emerald-100" :
              status === "PENDING" ? "bg-amber-100" :
              status === "REJECTED" ? "bg-red-100" :
              "bg-slate-100"
            }`}>
              {status === "APPROVED" ? (
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : status === "PENDING" ? (
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : status === "REJECTED" ? (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-medium text-slate-800 mb-2">Identity Verification</h1>
              <p className="text-slate-600 font-light">
                Submit a government-issued ID to verify your identity. This step is required to start conducting interviews on IntraView.
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <StatusMessage status={status} verification={verification} />

        {/* Upload Form - Only if not approved */}
        {status !== "APPROVED" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-base font-medium text-slate-800">Submit Verification Document</h2>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
                >
                  <option value="">Select document type</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Other">Other Government ID</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Number <span className="text-slate-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="document_number"
                  value={formData.document_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
                  placeholder="e.g., ABCDE1234F for PAN Card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Document <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-300 transition-colors bg-slate-50">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="document-file"
                  />
                  <label htmlFor="document-file" className="cursor-pointer">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-base font-medium text-slate-700 mb-1">
                      {formData.document_file ? "Document selected" : "Click to upload document"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Supported formats: PDF, JPG, PNG (Maximum size: 5MB)
                    </p>
                  </label>
                </div>
                
                {filePreview && formData.document_file && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-emerald-800">File ready for upload</p>
                          <p className="text-xs text-emerald-600">{formData.document_file.name}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreview(null);
                          setFormData((prev) => ({ ...prev, document_file: null }));
                        }}
                        className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !formData.document_type || !formData.document_file}
                className="w-full px-6 py-3 rounded-xl bg-slate-800 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-300/50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Document...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit for Review
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Current Document */}
        {verification?.document_file && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-slate-800">Submitted Document</h3>
              </div>
              <button
                onClick={downloadDocument}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Document
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Document Type</p>
                  <p className="text-sm font-medium text-slate-800">{verification.document_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Document Number</p>
                  <p className="text-sm font-medium text-slate-800">{verification.document_number || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Submitted On</p>
                  <p className="text-sm font-medium text-slate-800">
                    {verification.submitted_at
                      ? new Date(verification.submitted_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : "Not available"}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-1">File Name</p>
                <p className="text-sm text-slate-700 font-mono break-all">
                  {verification.document_file.split("/").pop()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusMessage({ status, verification }) {
  if (status === "APPROVED") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-emerald-800 mb-1">Identity Verified Successfully</h3>
            <p className="text-sm text-emerald-700 font-light">
              Your identity has been successfully verified. You are now authorized to conduct interviews on IntraView.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-amber-800 mb-1">Verification Under Review</h3>
            <p className="text-sm text-amber-700 font-light">
              Your document has been submitted and is currently being reviewed by our verification team. You will be notified once the review is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-red-800 mb-1">Document Rejected</h3>
            <p className="text-sm text-red-700 font-light mb-2">
              {verification?.rejection_reason || "The submitted document could not be verified. Please upload a clear, valid government-issued ID."}
            </p>
            <p className="text-xs text-red-600 font-medium">
              You can submit a new document using the form below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-medium text-slate-800 mb-1">Verification Required</h3>
          <p className="text-sm text-slate-600 font-light">
            To start conducting interviews on IntraView, please submit a valid government-issued ID for identity verification.
          </p>
        </div>
      </div>
    </div>
  );
}