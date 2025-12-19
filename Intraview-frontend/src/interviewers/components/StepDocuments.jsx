// src/features/interviewer/components/StepDocuments.jsx
export default function StepDocuments({ data, setData, next, back }) {
  const handleFile = (field) => (e) => {
    const file = e.target.files?.[0] || null;
    setData((prev) => ({ ...prev, [field]: file }));
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
            Resume / CV<span className="text-red-500">*</span>
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
            {data.resume && (
              <span className="mt-2 text-xs text-emerald-600">
                Selected: {data.resume.name}
              </span>
            )}
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
            <span className="text-sm text-slate-600">
              Upload certificates
            </span>
            {data.certifications && (
              <span className="mt-2 text-xs text-emerald-600">
                Selected: {data.certifications.name}
              </span>
            )}
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
            {data.additional_docs && (
              <span className="mt-2 text-xs text-emerald-600">
                Selected: {data.additional_docs.name}
              </span>
            )}
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
