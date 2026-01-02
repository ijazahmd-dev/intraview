import { useState, useCallback, useEffect } from "react";
import {
  submitInterviewerVerification,
  getInterviewerVerificationDetail,
} from "../../interviewerProfileApi";
import { Upload, Eye, Download, CheckCircle, Clock, XCircle } from "lucide-react";

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
      setFilePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, document_file: file }));
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
      await loadVerification(); // Refresh status
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading verification status...</p>
        </div>
      </div>
    );
  }

  const status = verification?.status || "NOT_SUBMITTED";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center">
            {status === "APPROVED" ? (
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            ) : status === "PENDING" ? (
              <Clock className="w-12 h-12 text-amber-500" />
            ) : (
              <Upload className="w-12 h-12 text-slate-400" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Identity Verification
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Submit a government-issued ID to verify your identity. This step is
            required to start conducting interviews.
          </p>
        </div>

        {/* Status Message */}
        <div className="mb-8 p-6 rounded-2xl border bg-white shadow-sm">
          <StatusMessage status={status} verification={verification} />
        </div>

        {/* Upload Form - Only if not approved */}
        {status !== "APPROVED" && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Submit Document
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Type *
                </label>
                <select
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select document type</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Number (optional)
                </label>
                <input
                  type="text"
                  name="document_number"
                  value={formData.document_number}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. ABCDE1234F for PAN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Government ID Document *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="document-file"
                  />
                  <label htmlFor="document-file" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p className="text-lg font-medium text-slate-700 mb-1">
                      {formData.document_file ? "File selected" : "Click to upload"}
                    </p>
                    <p className="text-sm text-slate-500">
                      PDF, JPG, PNG (Max 5MB)
                    </p>
                  </label>
                </div>
                {filePreview && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-emerald-800">
                      <CheckCircle className="w-4 h-4" />
                      Preview ready
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreview(null);
                          setFormData((prev) => ({ ...prev, document_file: null }));
                        }}
                        className="ml-auto text-emerald-700 hover:text-emerald-900"
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
                className="w-full bg-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? (
                  <>
                    <div className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit for Review"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Current Document - Always show */}
        {verification?.document_file && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Current Document
              </h3>
              <button
                onClick={downloadDocument}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                View Document
              </button>
            </div>
            <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-xs text-slate-500">Type</span>
                  <p className="font-medium">{verification.document_type}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Number</span>
                  <p>{verification.document_number || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Submitted</span>
                  <p>
                    {verification.submitted_at
                      ? new Date(verification.submitted_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="text-xs bg-slate-100 p-2 rounded-lg">
                File: {verification.document_file.split("/").pop()}
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
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <CheckCircle className="w-6 h-6 text-emerald-600" />
        <div>
          <h3 className="font-semibold text-emerald-800">Verified ✅</h3>
          <p className="text-sm text-emerald-700">
            Your identity has been successfully verified. You can now conduct
            interviews.
          </p>
        </div>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <Clock className="w-6 h-6 text-amber-600" />
        <div>
          <h3 className="font-semibold text-amber-800">Under Review</h3>
          <p className="text-sm text-amber-700">
            Your document has been submitted and is being reviewed by our team.
            You will be notified when approved.
          </p>
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <XCircle className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="font-semibold text-red-800">Document Rejected</h3>
          <p className="text-sm text-red-700 mb-2">
            {verification?.rejection_reason || "Please upload a different document."}
          </p>
          <p className="text-xs text-red-600">
            You can submit a new document above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
      <Upload className="w-6 h-6 text-slate-500" />
      <div>
        <h3 className="font-semibold text-slate-800">Verification Required</h3>
        <p className="text-sm text-slate-600">
          Upload a government-issued ID to complete your profile and start
          interviewing.
        </p>
      </div>
    </div>
  );
}
