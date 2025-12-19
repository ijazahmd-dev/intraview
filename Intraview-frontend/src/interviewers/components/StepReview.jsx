// src/features/interviewer/components/StepReview.jsx
export default function StepReview({
  data,
  back,
  submit,
  loading,
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">
        Review &amp; Submit
      </h2>

      <div className="space-y-5 text-sm text-slate-700">
        {/* Personal */}
        <section className="border border-slate-100 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Personal Information
            </h3>
          </div>
          <p><span className="font-medium">Phone:</span> {data.phone_number || "-"}</p>
          <p><span className="font-medium">Location:</span> {data.location || "-"}</p>
          <p><span className="font-medium">Timezone:</span> {data.timezone || "-"}</p>
          <p><span className="font-medium">LinkedIn:</span> {data.linkedin_url || "-"}</p>
          <p><span className="font-medium">GitHub:</span> {data.github_url || "-"}</p>
        </section>

        {/* Professional */}
        <section className="border border-slate-100 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Professional Experience
            </h3>
          </div>
          <p>
            <span className="font-medium">Professional Experience:</span>{" "}
            {data.years_of_experience || "-"} years
          </p>
          <p>
            <span className="font-medium">Interview Experience:</span>{" "}
            {data.years_of_interview_experience || "-"} years
          </p>
          <p>
            <span className="font-medium">Specializations:</span>{" "}
            {data.specializations?.length
              ? data.specializations.join(", ")
              : "-"}
          </p>
          <p>
            <span className="font-medium">Languages:</span>{" "}
            {data.languages?.length ? data.languages.join(", ") : "-"}
          </p>
          <p>
            <span className="font-medium">Education:</span> {data.education || "-"}
          </p>
          <p className="mt-2">
            <span className="font-medium">Expertise Summary:</span>
            <br />
            {data.expertise_summary || "-"}
          </p>
        </section>

        {/* Documents */}
        <section className="border border-slate-100 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Documents
            </h3>
          </div>
          <p>
            <span className="font-medium">Resume:</span>{" "}
            {data.resume ? data.resume.name : "Not uploaded"}
          </p>
          <p>
            <span className="font-medium">Certifications:</span>{" "}
            {data.certifications ? data.certifications.name : "None"}
          </p>
          <p>
            <span className="font-medium">Additional Docs:</span>{" "}
            {data.additional_docs ? data.additional_docs.name : "None"}
          </p>
        </section>

        {/* Terms */}
        <section className="border border-amber-100 bg-amber-50 rounded-xl p-4 text-xs text-amber-900">
          <p className="font-semibold mb-1">Terms &amp; Consent</p>
          <p>
            By submitting this application, you confirm that all information
            provided is accurate and complete. You agree to Intraview&apos;s
            terms, confidentiality expectations, and interviewer code of
            conduct.
          </p>
        </section>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={back}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
        >
          Back
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
