// //  src/interviewers/components/StepDocuments.jsx
// export default function StepDocuments({ data, setData, next, back }) {
//   const handleFile = (field) => (e) => {
//     const file = e.target.files?.[0] || null;
//     setData((prev) => ({ ...prev, [field]: file }));
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-slate-800 mb-6">
//         Document Upload
//       </h2>

//       <div className="space-y-5">
//         {/* Resume */}
//         <div>
//           <label className="block text-xs font-medium text-slate-600 mb-1">
//             Resume / CV<span className="text-red-500">*</span>
//           </label>
//           <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-8 text-center cursor-pointer hover:border-emerald-400">
//             <input
//               type="file"
//               accept=".pdf,.doc,.docx"
//               className="hidden"
//               onChange={handleFile("resume")}
//             />
//             <span className="text-sm text-slate-600">
//               Drag and drop your resume here, or click to browse
//             </span>
//             <span className="mt-1 text-xs text-slate-400">
//               Supported formats: PDF, DOC, DOCX (max 10MB)
//             </span>
//             {data.resume && (
//               <span className="mt-2 text-xs text-emerald-600">
//                 Selected: {data.resume.name}
//               </span>
//             )}
//           </label>
//         </div>

//         {/* Certifications */}
//         <div>
//           <label className="block text-xs font-medium text-slate-600 mb-1">
//             Certifications (Optional)
//           </label>
//           <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-emerald-400">
//             <input
//               type="file"
//               accept=".pdf,.jpg,.jpeg,.png"
//               className="hidden"
//               onChange={handleFile("certifications")}
//             />
//             <span className="text-sm text-slate-600">
//               Upload certificates
//             </span>
//             {data.certifications && (
//               <span className="mt-2 text-xs text-emerald-600">
//                 Selected: {data.certifications.name}
//               </span>
//             )}
//           </label>
//         </div>

//         {/* Additional docs */}
//         <div>
//           <label className="block text-xs font-medium text-slate-600 mb-1">
//             Additional Documents (Optional)
//           </label>
//           <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-emerald-400">
//             <input
//               type="file"
//               className="hidden"
//               onChange={handleFile("additional_docs")}
//             />
//             <span className="text-sm text-slate-600">
//               Upload reference letters, portfolio samples, or other docs
//             </span>
//             {data.additional_docs && (
//               <span className="mt-2 text-xs text-emerald-600">
//                 Selected: {data.additional_docs.name}
//               </span>
//             )}
//           </label>
//         </div>
//       </div>

//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={back}
//           className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
//         >
//           Back
//         </button>
//         <button
//           onClick={next}
//           className="px-5 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }




























// src/interviewers/components/StepDocuments.jsx

/**
 * StepDocuments — file upload step.
 *
 * When re-applying after rejection, the form is pre-populated with the
 * previous application's file names (stored in data._existing_resume etc.).
 * If the user doesn't select a new file, the backend keeps the existing file.
 * If they do select a new file, it replaces the old one.
 */
export default function StepDocuments({ data, setData, next, back }) {
  const handleFile = (field) => (e) => {
    const file = e.target.files?.[0] || null;
    setData((prev) => ({ ...prev, [field]: file }));
  };

  /**
   * Returns a label showing either:
   *   • The newly selected file name, or
   *   • The existing file name from the previous application (if re-applying), or
   *   • Nothing
   */
  const fileLabel = (newFile, existingUrl) => {
    if (newFile) {
      return (
        <span className="mt-2 text-xs text-emerald-600">
          New file: {newFile.name}
        </span>
      );
    }
    if (existingUrl) {
      // existingUrl is a server path like "/media/interviewers/resumes/cv.pdf"
      const filename = existingUrl.split("/").pop();
      return (
        <span className="mt-2 text-xs text-blue-500">
          Current: {filename} (leave empty to keep)
        </span>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">
        Document Upload
      </h2>

      <div className="space-y-5">

        {/* Resume */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Resume / CV
            {/* Required only if no existing resume */}
            {!data._existing_resume && <span className="text-red-500">*</span>}
          </label>
          <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-8 text-center cursor-pointer hover:border-emerald-400">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFile("resume")}
            />
            <span className="text-sm text-slate-600">
              Drag and drop your resume here, or click to browse
            </span>
            <span className="mt-1 text-xs text-slate-400">
              Supported formats: PDF, DOC, DOCX (max 10MB)
            </span>
            {fileLabel(data.resume, data._existing_resume)}
          </label>
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Certifications (Optional)
          </label>
          <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-emerald-400">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFile("certifications")}
            />
            <span className="text-sm text-slate-600">Upload certificates</span>
            {fileLabel(data.certifications, data._existing_certifications)}
          </label>
        </div>

        {/* Additional docs */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Additional Documents (Optional)
          </label>
          <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-emerald-400">
            <input
              type="file"
              className="hidden"
              onChange={handleFile("additional_docs")}
            />
            <span className="text-sm text-slate-600">
              Upload reference letters, portfolio samples, or other docs
            </span>
            {fileLabel(data.additional_docs, data._existing_additional_docs)}
          </label>
        </div>

      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={back}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
        >
          Back
        </button>
        <button
          onClick={next}
          className="px-5 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}