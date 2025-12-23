import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginInterviewer } from "../../interviewerAuthSlice";
import { useNavigate, Link } from "react-router-dom";

export default function InterviewerLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, interviewerStatus } =
    useSelector((s) => s.interviewerAuth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!interviewerStatus) return;

    if (interviewerStatus === "APPROVED_NOT_ONBOARDED") {
      navigate("/interviewer/onboarding");
    } else if (interviewerStatus === "ACTIVE") {
      navigate("/interviewer/dashboard");
    } else if (interviewerStatus === "SUSPENDED") {
      alert("Your interviewer account is suspended.");
    }
  }, [interviewerStatus, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginInterviewer({...form, email: form.email.trim(),}));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold mb-6">
          Interviewer Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
        />

        {error && (
        <p className="text-red-600 text-sm mb-3">
            {error.message || error.detail || "Login failed"}
        </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-sm text-center">
          <Link
            to="/interviewer/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
