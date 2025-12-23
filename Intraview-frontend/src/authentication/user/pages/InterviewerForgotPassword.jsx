// import { useState } from "react";
// import { interviewerForgotPassword } from "../../interviewerAuthApi";
// import { useNavigate } from "react-router-dom";

// export default function InterviewerForgotPassword() {
//   const [email, setEmail] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await interviewerForgotPassword({ email });
//     navigate("/interviewer/reset-password?source=interviewer");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
//         <h2 className="text-lg font-semibold mb-4">
//           Interviewer Password Reset
//         </h2>
//         <input
//           type="email"
//           required
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="border px-4 py-2 w-full mb-4"
//           placeholder="Your email"
//         />
//         <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
//           Send OTP
//         </button>
//       </form>
//     </div>
//   );
// }























import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { requestPasswordReset } from "../../../api/authApi";
import OtpModal from "../../../components/OtpModal";
import toaster from "../../../utils/toaster";
import { useNavigate } from "react-router-dom";

const InterviewerForgotPassword = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await requestPasswordReset(values);
        setEmail(values.email);
        setShowOtpModal(true);
        toaster.success("OTP sent to your email");
      } catch (err) {
        setStatus({
          error: err.response?.data?.error || "Something went wrong",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F1F3E0' }}>
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="rounded-3xl shadow-2xl p-8" style={{ backgroundColor: 'white' }}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #D2DCB6 0%, #A1BC98 100%)' }}>
              <svg className="w-10 h-10" fill="none" stroke="#778873" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#778873' }}>
            Forgot Password?
          </h2>

          {/* Subtitle */}
          <p className="text-center mb-8" style={{ color: '#778873', opacity: 0.8 }}>
            No worries, we'll send you reset instructions
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-6">
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#778873' }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                style={{ 
                  backgroundColor: '#F1F3E0',
                  border: '2px solid #D2DCB6',
                  color: '#778873'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#A1BC98';
                  e.target.style.boxShadow = '0 0 0 3px rgba(161, 188, 152, 0.2)';
                }}
                // onBlur={(e) => {
                //   formik.handleBlur(e);
                //   e.target.style.borderColor = '#D2DCB6';
                //   e.target.style.boxShadow = 'none';
                // }}
              />

              {/* Email Error */}
              {formik.touched.email && formik.errors.email && (
                <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                  <p className="text-sm" style={{ color: '#DC2626' }}>
                    {formik.errors.email}
                  </p>
                </div>
              )}
            </div>

            {/* Status Error */}
            {formik.status?.error && (
              <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                <p className="text-sm text-center" style={{ color: '#DC2626' }}>
                  {formik.status.error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full py-4 px-4 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #778873 0%, #A1BC98 100%)',
              }}
              onMouseEnter={(e) => {
                if (!formik.isSubmitting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(119, 136, 115, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              {formik.isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Code"
              )}
            </button>

            {/* Back to Login */}
            <button
              type="button"
              onClick={() => navigate("/interviewer/login")}
              className="w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: 'transparent',
                color: '#778873'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F1F3E0';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </button>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm mt-6" style={{ color: '#778873', opacity: 0.8 }}>
          Remember your password? 
          <button 
            onClick={() => navigate("/interviewer/login")}
            className="font-semibold ml-1 underline"
            style={{ color: '#778873' }}
          >
            Sign in here
          </button>
        </p>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          email={email}
          mode="forgot-password"
          onSuccess={(resetToken) => {
            setShowOtpModal(false);
            navigate(`/interviewer/reset-password?token=${resetToken}`);
          }}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};

export default InterviewerForgotPassword;