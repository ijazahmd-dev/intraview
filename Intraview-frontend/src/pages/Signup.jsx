import React, { useState, useEffect, useRef } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { signup, checkAvailability } from "../api/authApi";
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
    checks: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState({ username: false, email: false });
  const navigate = useNavigate();

  const inputRefs = {
    username: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
    agreeTerms: useRef(null),
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Username is required.")
        .min(3, "Username must be at least 3 characters.")
        .max(30, "Username cannot exceed 30 characters.")
        .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
        .test("no-leading-number", "Username cannot start with a number.", value => !value || !/^\d/.test(value))
        .test("not-all-numbers", "Username cannot consist only of numbers.", value => !value || !/^\d+$/.test(value)),
      email: Yup.string()
        .transform(value => value.toLowerCase().trim())
        .required("Email is required.")
        .email("Enter a valid email address."),
      password: Yup.string()
        .required("Password is required.")
        .min(8, "Password must be at least 8 characters.")
        .max(128, "Password cannot exceed 128 characters.")
        .test("no-spaces", "Password cannot contain spaces.", value => !/\s/.test(value || ""))
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
        .matches(/[0-9]/, "Password must contain at least one number.")
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character.")
        .test("not-equal-username", "Password cannot be equal to username.", function(value) {
            return !value || !this.parent.username || value.toLowerCase() !== this.parent.username.toLowerCase();
        })
        .test("not-email-prefix", "Password cannot contain part of your email address.", function(value) {
            if (!value || !this.parent.email) return true;
            const prefix = this.parent.email.split('@')[0].toLowerCase();
            return !value.toLowerCase().includes(prefix);
        }),
      confirmPassword: Yup.string()
        .required("Confirm password is required.")
        .oneOf([Yup.ref("password"), null], "Passwords do not match."),
      agreeTerms: Yup.boolean().oneOf(
        [true],
        "Please accept the Terms and Conditions."
      ),
    }),
    onSubmit: async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        await signup({
          username: values.username.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          confirm_password: values.confirmPassword,
          agree_terms: values.agreeTerms
        });

        setEmail(values.email.trim().toLowerCase());
        setShowOtpModal(true);
        toaster.success("OTP sent to your email!");

      } catch (err) {
        const errData = err.response?.data;
        let errMsg = "Signup failed. Please try again.";
        if (errData && errData.errors) {
            setErrors(errData.errors);
            if (errData.errors.non_field_errors) {
                errMsg = errData.errors.non_field_errors[0];
            } else {
                errMsg = "Please fix the errors below.";
            }
        } else if (errData && errData.error) {
            errMsg = errData.error;
        }
        setStatus({ error: errMsg });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Focus on first error when submit fails
  useEffect(() => {
      if (formik.submitCount > 0 && !formik.isSubmitting && !formik.isValid) {
          const firstErrorKey = Object.keys(formik.errors)[0];
          if (firstErrorKey && inputRefs[firstErrorKey].current) {
              inputRefs[firstErrorKey].current.focus();
          }
      }
  }, [formik.submitCount, formik.isSubmitting, formik.errors, formik.isValid]);

  const handleBlurCheck = async (field, value) => {
      formik.handleBlur({ target: { name: field } });
      if (!value || formik.errors[field]) return;

      setCheckingAvailability(prev => ({ ...prev, [field]: true }));
      try {
          await checkAvailability({ [field]: value });
      } catch (err) {
          const errData = err.response?.data?.errors;
          if (errData && errData[field]) {
              formik.setFieldError(field, errData[field]);
          }
      } finally {
          setCheckingAvailability(prev => ({ ...prev, [field]: false }));
      }
  };

  const getBorderColor = (field) => {
      if (!formik.touched[field]) return "border-gray-300 focus:border-[#A1BC98] focus:ring-[#A1BC98]";
      if (formik.errors[field]) return "border-red-500 focus:border-red-500 focus:ring-red-500";
      return "border-green-500 focus:border-green-500 focus:ring-green-500";
  };

  const renderIcon = (field) => {
      if (!formik.touched[field]) return null;
      if (checkingAvailability[field]) {
          return <Loader2 className="w-5 h-5 text-gray-400 animate-spin absolute right-3 top-1/2 transform -translate-y-1/2" />;
      }
      if (formik.errors[field]) {
          return <XCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 bg-white" />;
      }
      return <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 bg-white" />;
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

          {/* Form */}
          <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  ref={inputRefs.username}
                  onChange={formik.handleChange}
                  onBlur={(e) => handleBlurCheck("username", e.target.value)}
                  value={formik.values.username}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-700 transition-colors ${getBorderColor("username")}`}
                  aria-invalid={formik.touched.username && !!formik.errors.username}
                />
                {renderIcon("username")}
              </div>
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  ref={inputRefs.email}
                  onChange={formik.handleChange}
                  onBlur={(e) => handleBlurCheck("email", e.target.value)}
                  value={formik.values.email}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-700 transition-colors ${getBorderColor("email")}`}
                  aria-invalid={formik.touched.email && !!formik.errors.email}
                />
                {renderIcon("email")}
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  ref={inputRefs.password}
                  value={formik.values.password}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setPasswordStrength(
                      checkPasswordStrength(e.target.value)
                    );
                  }}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-700 transition-colors ${getBorderColor("password")}`}
                  aria-invalid={formik.touched.password && !!formik.errors.password}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-white pl-1">
                  {renderIcon("password")}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
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
                  checks={passwordStrength.checks}
                />
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  ref={inputRefs.confirmPassword}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-700 transition-colors ${getBorderColor("confirmPassword")}`}
                  aria-invalid={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-white pl-1">
                  {renderIcon("confirmPassword")}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
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
                ref={inputRefs.agreeTerms}
                checked={formik.values.agreeTerms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-1 w-5 h-5 rounded cursor-pointer border-gray-300 focus:ring-[#A1BC98]"
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
              <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" />
                {formik.status.error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.values.agreeTerms}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold mb-4 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-[#778873]"
            >
              {formik.isSubmitting ? (
                  <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      CREATING ACCOUNT...
                  </>
              ) : "SIGN UP"}
            </button>
          </form>

          {/* Google & Sign In */}
          <div className="text-center text-gray-500 text-sm mb-2 mt-4">OR</div>
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
            <a href="#" className="hover:text-gray-900 transition">Company</a>
            <a href="#" className="hover:text-gray-900 transition">About Us</a>
            <a href="#" className="hover:text-gray-900 transition">Team</a>
            <a href="#" className="hover:text-gray-900 transition">Product</a>
            <a href="#" className="hover:text-gray-900 transition">Blog</a>
            <a href="#" className="hover:text-gray-900 transition">Pricing</a>
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
