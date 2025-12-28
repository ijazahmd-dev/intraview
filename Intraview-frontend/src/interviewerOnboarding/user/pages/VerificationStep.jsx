import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  submitVerification,
  fetchVerificationStatus,
} from "../../interviewerOnboardingApi";

export default function VerificationStep() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("NOT_SUBMITTED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await fetchVerificationStatus();
        if (!mounted) return;
        setStatus(data.status);
        setRejectionReason(data.rejection_reason || "");
      } catch {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !documentType) return;
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("document_type", documentType);
      fd.append("document_number", documentNumber);
      fd.append("document_file", file);
      await submitVerification(fd);
      setStatus("PENDING");
      setRejectionReason("");
    } catch (err) {
      const msg = err.response?.data || "Failed to submit verification.";
      setError(typeof msg === "string" ? msg : "Failed to submit verification.");
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = true; // verification optional for onboarding

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-1">
          Additional Verification & Agreements
        </h2>
        <p className="text-slate-500 text-sm">
          Upload documents and confirm platform agreements. Verification can
          continue in the background.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: documents */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Additional Verification
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select document</option>
                  <option value="Passport">Passport</option>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Document Number (optional)
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Upload Document
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-xs"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Accepted formats: PDF, JPG, PNG.
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-600">{String(error)}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !file || !documentType}
                className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>

              <p className="mt-3 text-[11px] text-slate-500">
                Status:{" "}
                <span className="font-medium">
                  {status === "NOT_SUBMITTED" && "Not submitted"}
                  {status === "PENDING" && "Pending review"}
                  {status === "APPROVED" && "Approved"}
                  {status === "REJECTED" && "Rejected"}
                </span>
              </p>

              {status === "REJECTED" && rejectionReason && (
                <p className="mt-1 text-[11px] text-red-500">
                  Reason: {rejectionReason}
                </p>
              )}

              <p className="mt-3 text-[11px] text-slate-400">
                All uploaded documents are encrypted and stored securely. We use them
                only for verification purposes.
              </p>
            </div>
          </form>
        </div>

        {/* Right: Agreements & progress */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Platform Agreements
          </h3>
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-xs space-y-3">
            <label className="flex items-start gap-2">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                <span className="font-semibold">I agree to the Code of Conduct</span>
                <br />
                <span className="text-slate-500">
                  Professional behavior, respect, and ethical standards.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                <span className="font-semibold">I agree to the Payout Policy</span>
                <br />
                <span className="text-slate-500">
                  Payment terms, schedules, and processing guidelines.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                <span className="font-semibold">I agree to the Privacy Policy</span>
                <br />
                <span className="text-slate-500">
                  Data handling, confidentiality, and privacy protection.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                <span className="font-semibold">I agree to the Terms of Service</span>
                <br />
                <span className="text-slate-500">
                  Platform rules, responsibilities, and usage terms.
                </span>
              </span>
            </label>

            <div className="mt-4">
              <p className="text-[11px] text-slate-500 mb-1">
                Progress
              </p>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "80%" }} />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                4 of 5 steps completed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => navigate("/interviewer/onboarding/availability")}
          className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => navigate("/interviewer/onboarding/complete")}
          className="px-6 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  );
}
