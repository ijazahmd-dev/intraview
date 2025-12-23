// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useState } from "react";
// import { interviewerResetPassword } from "../../interviewerAuthApi";

// export default function InterviewerResetPassword() {
//   const [params] = useSearchParams();
//   const source = params.get("source");
//   const navigate = useNavigate();

//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await interviewerResetPassword({token, new_password: password });

//     if (source === "interviewer") {
//       navigate("/interviewer/login");
//     } else {
//       navigate("/login");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
//         <h2 className="mb-4 font-semibold">Set New Password</h2>
//         <input
//           type="password"
//           required
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="border px-4 py-2 w-full mb-4"
//         />
//         <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
//           Reset Password
//         </button>
//       </form>
//     </div>
//   );
// }



























import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { resetPassword } from "../../../api/authApi";
import toaster from "../../../utils/toaster";
import { useNavigate, useSearchParams } from "react-router-dom";

const InterviewerResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  if (!resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F1F3E0' }}>
        <div className="rounded-3xl shadow-2xl p-8 text-center" style={{ backgroundColor: 'white', maxWidth: '500px' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)' }}>
            <svg className="w-10 h-10" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#DC2626' }}>Invalid Reset Link</h2>
          <p style={{ color: '#DC2626', marginBottom: '24px' }}>
            The reset token is missing or invalid. Please request a new password reset link.
          </p>
          <button
            onClick={() => navigate("/interviewer/forgot-password")}
            className="py-3 px-6 font-semibold rounded-xl transition-all duration-200"
            style={{ 
              background: 'linear-gradient(135deg, #778873 0%, #A1BC98 100%)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(119, 136, 115, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Min 8 characters")
        .required("Password required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Confirm password required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await resetPassword({
          reset_token: resetToken,
          new_password: values.password,
        });

        toaster.success("Password reset successful!");
        navigate("/interviewer/login");
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#778873' }}>
            Set New Password
          </h2>

          {/* Subtitle */}
          <p className="text-center mb-8" style={{ color: '#778873', opacity: 0.8 }}>
            Create a strong password to secure your account
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Password Input */}
            <div className="mb-6">
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#778873' }}
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
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

              {/* Password Error */}
              {formik.touched.password && formik.errors.password && (
                <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                  <p className="text-sm" style={{ color: '#DC2626' }}>
                    {formik.errors.password}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#778873' }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
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

              {/* Confirm Password Error */}
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                  <p className="text-sm" style={{ color: '#DC2626' }}>
                    {formik.errors.confirmPassword}
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
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
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

        {/* Password Requirements */}
        <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'white' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: '#778873' }}>
            Password Requirements:
          </p>
          <ul className="text-sm space-y-1" style={{ color: '#778873', opacity: 0.8 }}>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mix of letters and numbers recommended
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InterviewerResetPassword;