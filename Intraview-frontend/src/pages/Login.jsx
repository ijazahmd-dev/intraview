

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { login } from "../api/authApi.js";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchUser } from "../authentication/authSlice.js"; // Add this import
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: authLoading, error: reduxAuthError } = useSelector((state) => state.auth);
  const [rememberMe, setRememberMe] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        // Dispatch Redux thunk instead of direct API call
        const result = await dispatch(loginUser(values));

        // Check if login succeeded
        if (loginUser.fulfilled.match(result)) {
          // If backend didn't return user data, refresh from /auth/me/
          if (!result.payload?.user) {
            await dispatch(fetchUser());
          }
          navigate("/home");
        }
      } catch (err) {
        // This won't trigger since thunks handle errors
        setStatus({ error: "Login failed" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Disable form during auth loading
  const isSubmitting = formik.isSubmitting || authLoading;

  // Safely parse error messages from Django backend
  const displayErrorRaw = formik.status?.error || reduxAuthError;
  let parsedError = null;
  if (displayErrorRaw) {
    if (typeof displayErrorRaw === 'string') {
      parsedError = displayErrorRaw;
    } else if (typeof displayErrorRaw === 'object') {
      parsedError =
        displayErrorRaw.non_field_errors?.[0] ||
        displayErrorRaw.detail ||
        displayErrorRaw.error ||
        (Object.values(displayErrorRaw)[0] && Object.values(displayErrorRaw)[0][0]) ||
        "Login failed. Please check your credentials.";
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#A1BC98' }}>
            Welcome back
          </h1>
          <p className="text-gray-600 mb-8">
            Enter your email and password to sign in
          </p>

          <div>
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                disabled={isSubmitting}
                {...formik.getFieldProps("email")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50"
                style={{
                  borderColor: formik.touched.email && formik.errors.email ? '#ef4444' : '#d1d5db'
                }}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                disabled={isSubmitting}
                {...formik.getFieldProps("password")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50"
                style={{
                  borderColor: formik.touched.password && formik.errors.password ? '#ef4444' : '#d1d5db'
                }}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Error Message */}
            {parsedError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {parsedError}
                </p>
              </div>
            )}

            {/* Remember Me Toggle and Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              {/* Forgot Password Link */}
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                disabled={isSubmitting}
                className="text-sm font-semibold hover:underline disabled:opacity-50"
                style={{ color: '#A1BC98' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={formik.handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold mb-4 transition ${isSubmitting
                ? "opacity-60 cursor-not-allowed"
                : "hover:opacity-90"
                }`}
              style={{ backgroundColor: '#A1BC98' }}
            >
              {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
            </button>

            {/* Google Login Button */}
            <div className="mb-6">
              <GoogleLoginButton disabled={isSubmitting} />
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                disabled={isSubmitting}
                className="font-semibold hover:underline disabled:opacity-50"
                style={{ color: '#A1BC98' }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Image (unchanged) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, 
              #F1F3E0 0%, 
              #D2DCB6 25%, 
              #A1BC98 50%, 
              #778873 75%, 
              #778873 100%)`
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="wave-pattern"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 50 Q 25 30, 50 50 T 100 50"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                <path
                  d="M0 60 Q 25 40, 50 60 T 100 60"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave-pattern)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Login;
