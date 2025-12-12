import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
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
        const res = await login(values);
        setUser(res.data.user);
        navigate("/home");
      } catch (err) {
        setStatus({ error: err.response?.data?.message || "Login failed" });
      } finally {
        setSubmitting(false);
      }
    },
  });

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
                {...formik.getFieldProps("email")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
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
                {...formik.getFieldProps("password")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
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

            {/* API Error Message */}
            {formik.status?.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formik.status.error}</p>
              </div>
            )}

            {/* Remember Me Toggle and Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              {/* <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full shadow-inner transition ${
                      rememberMe ? 'bg-gray-700' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full shadow top-0.5 transition ${
                      rememberMe ? 'left-6' : 'left-0.5'
                    }`}
                  ></div>
                </div>
                <span className="ml-3 text-gray-700 font-medium">Remember me</span>
              </label> */}

              {/* Forgot Password Link */}
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-semibold hover:underline"
                style={{ color: '#A1BC98' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              onClick={formik.handleSubmit}
              disabled={formik.isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold mb-4 transition ${
                formik.isSubmitting
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
              style={{ backgroundColor: '#A1BC98' }}
            >
              {formik.isSubmitting ? "SIGNING IN..." : "SIGN IN"}
            </button>

            {/* Google Login Button */}
            <div className="mb-6">
              <GoogleLoginButton />
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-semibold hover:underline"
                style={{ color: '#A1BC98' }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Image */}
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
          {/* Decorative wavy pattern overlay */}
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