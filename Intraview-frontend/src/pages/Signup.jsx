import React, { useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { signup } from "../api/authApi";
import OtpModal from "../components/OtpModal";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import { checkPasswordStrength } from "../utils/passwordStrength";
import toaster from "../utils/toaster";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

const Signup = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Weak",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "At least 3 characters")
        .required("Username is required"),
      email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
      agreeTerms: Yup.boolean().oneOf(
        [true],
        "You must agree to the terms and conditions"
      ),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await signup({
          username: values.username,
          email: values.email,
          password: values.password,
        });

        setEmail(values.email);
        setShowOtpModal(true);
        toaster.success("OTP sent to your email!");
      } catch (err) {
        setStatus({
          error: err.response?.data?.error || "Signup failed",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSocialSignUp = (provider) => {
    console.log("Sign up with:", provider);
    // Implement social signup logic here if needed
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative py-40 px-4"
        style={{
          background:
            "linear-gradient(135deg, #778873 0%, #A1BC98 50%, #D2DCB6 100%)",
        }}
      >
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="wave"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 50 Q 25 30, 50 50 T 100 50"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 60 Q 25 40, 50 60 T 100 60"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 70 Q 25 50, 50 70 T 100 70"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave)" />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome!</h1>
          <p className="text-base md:text-lg opacity-90">
            Use these awesome forms to login or create new
            <br />
            account in your project for free.
          </p>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="flex-1 flex justify-center px-4 pb-20">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative z-10 -mt-20 md:-mt-24 lg:-mt-28">
          <h2 className="text-2xl font-bold text-gray-700 text-center mb-8">
            Register with
          </h2>

          {/* Social Buttons */}
          {/* <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => handleSocialSignUp("google")}
              className="w-14 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
              type="button"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
          </div>

          <div className="text-center text-gray-500 mb-6">or</div> */}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                {...formik.getFieldProps("username")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-700"
                style={{ "--tw-ring-color": "#A1BC98" }}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                {...formik.getFieldProps("email")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-700"
                style={{ "--tw-ring-color": "#A1BC98" }}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password with Eye toggle */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setPasswordStrength(
                      checkPasswordStrength(e.target.value)
                    );
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-700"
                  style={{ "--tw-ring-color": "#A1BC98" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.password}
                </p>
              )}
              {formik.values.password && (
                <PasswordStrengthBar
                  score={passwordStrength.score}
                  label={passwordStrength.label}
                />
              )}
            </div>

            {/* Confirm Password with Eye toggle */}
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  {...formik.getFieldProps("confirmPassword")}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-700"
                  style={{ "--tw-ring-color": "#A1BC98" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 mt-5 mb-4">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formik.values.agreeTerms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: "#778873" }}
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 cursor-pointer"
              >
                I agree the{" "}
                <a
                  href="#"
                  className="font-semibold hover:underline"
                  style={{ color: "#778873" }}
                >
                  Terms and Conditions
                </a>
              </label>
            </div>
            {formik.touched.agreeTerms && formik.errors.agreeTerms && (
              <p className="text-red-500 text-sm -mt-2 mb-4">
                {formik.errors.agreeTerms}
              </p>
            )}

            {/* API Error */}
            {formik.status?.error && (
              <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg">
                {formik.status.error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold mb-4 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#778873" }}
            >
              {formik.isSubmitting ? "CREATING..." : "SIGN UP"}
            </button>
          </form>

          {/* Google & Sign In */}
          <div className="text-center text-gray-500 text-sm mb-2">OR</div>
          <div className="mb-4">
            <GoogleLoginButton />
          </div>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="font-semibold hover:underline cursor-pointer"
              style={{ color: "#778873" }}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          email={email}
          onSuccess={() => {
            toaster.success("Email verified successfully!");
            setTimeout(() => {
              navigate("/login");
            }, 800);
            setShowOtpModal(false);
          }}
          onClose={() => setShowOtpModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 mb-8 text-gray-600">
            <a href="#" className="hover:text-gray-900 transition">
              Company
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              About Us
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Team
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Product
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Blog
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Pricing
            </a>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="text-gray-500 hover:text-gray-700 transition">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm1-15h-2v6h-6v2h6v6h2v-6h6v-2h-6V7z" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <p className="text-center text-gray-500 text-sm">
            Copyright © 2021 Soft by Creative Tim.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
