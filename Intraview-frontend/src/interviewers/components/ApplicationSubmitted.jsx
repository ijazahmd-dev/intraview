// src/features/interviewer/components/ApplicationSubmitted.jsx
import { useNavigate } from "react-router-dom";

export default function ApplicationSubmitted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center py-10">
      <div className="max-w-3xl w-full mx-4 bg-white rounded-3xl shadow-xl p-8 md:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
            Your Application has been Successfully Submitted!
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-xl">
            Thank you for applying to become an interviewer. Our team will
            review your application carefully and notify you via email.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">
            What Happens Next?
          </h2>
          <ol className="space-y-4 text-sm text-slate-700">
            <li>
              <span className="font-semibold">1. Application Received</span> – Your application has been submitted.
            </li>
            <li>
              <span className="font-semibold">2. Under Review by Admin</span> – Our team will verify your credentials (1–3 business days).
            </li>
            <li>
              <span className="font-semibold">3. Qualification Assessment</span> – Evaluation of your experience and skills (2–4 business days).
            </li>
            <li>
              <span className="font-semibold">4. Notification of Outcome</span> – You&apos;ll receive an email with the decision.
            </li>
          </ol>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            Need Assistance?
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            If you have questions or need help with your application, our support team is here to assist you.
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div className="border border-slate-200 rounded-xl p-3">
              <p className="font-semibold text-slate-800">Email Support</p>
              <p className="text-slate-500">support@intraview.app</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-3">
              <p className="font-semibold text-slate-800">Phone Support</p>
              <p className="text-slate-500">+91-00000-00000</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
