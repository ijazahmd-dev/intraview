import React, { useState } from "react";

const styles = {
  // Global-ish
  pageWrapper: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', system-ui, sans-serif",
    background: "linear-gradient(135deg, #faf9f6 0%, #f5f3f0 50%, #f0ede8 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    lineHeight: 1.5,
    position: "relative",
    overflow: "hidden",
  },

  // Soft background blobs
  softBackground: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    pointerEvents: "none",
  },
  floatingShapes: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  softBlobBase: {
    position: "absolute",
    borderRadius: "50% 40% 60% 30%",
    background:
      "linear-gradient(45deg, rgba(240, 206, 170, 0.4), rgba(224, 190, 156, 0.3))",
    filter: "blur(80px)",
  },
  blob1: {
    width: 300,
    height: 250,
    top: "-10%",
    left: "-5%",
  },
  blob2: {
    width: 200,
    height: 180,
    top: "60%",
    right: "-5%",
    background:
      "linear-gradient(45deg, rgba(210, 180, 140, 0.3), rgba(195, 165, 125, 0.2))",
  },
  blob3: {
    width: 180,
    height: 160,
    top: "20%",
    right: "20%",
    background:
      "linear-gradient(45deg, rgba(230, 200, 160, 0.25), rgba(215, 185, 145, 0.2))",
  },
  blob4: {
    width: 120,
    height: 100,
    bottom: "10%",
    left: "15%",
    background:
      "linear-gradient(45deg, rgba(220, 190, 150, 0.3), rgba(205, 175, 135, 0.25))",
  },

  loginContainer: {
    width: "100%",
    maxWidth: 420,
    position: "relative",
    zIndex: 1,
  },

  // Card
  softCard: {
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px)",
    borderRadius: 32,
    padding: "48px 40px",
    boxShadow:
      "0 20px 40px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    position: "relative",
    overflow: "hidden",
  },
  cardTopBorder: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background:
      "linear-gradient(90deg, transparent, rgba(240, 206, 170, 0.5), transparent)",
  },

  // Header
  comfortHeader: {
    textAlign: "center",
    marginBottom: 40,
  },
  gentleLogo: {
    position: "relative",
    width: 80,
    height: 80,
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    position: "relative",
    width: 64,
    height: 64,
    background: "linear-gradient(135deg, #f0ceaa, #e0be9c)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 8px 16px rgba(240, 206, 170, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
  },
  comfortIcon: {
    color: "rgba(139, 102, 85, 0.8)",
    position: "relative",
    zIndex: 2,
  },
  gentleGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle, rgba(240, 206, 170, 0.3) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  comfortTitle: {
    color: "#8b6655",
    fontSize: "2rem",
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: "-0.02em",
  },
  gentleSubtitle: {
    color: "rgba(139, 102, 85, 0.7)",
    fontSize: 15,
    fontWeight: 400,
  },

  // Form
  comfortForm: {
    width: "100%",
  },
  softField: {
    position: "relative",
    marginBottom: 24,
  },
  softFieldError: {
    borderColor: "#d97757",
    background: "rgba(217, 119, 87, 0.05)",
  },
  fieldContainer: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.7)",
    border: "1.5px solid rgba(240, 206, 170, 0.3)",
    borderRadius: 16,
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  fieldContainerFocused: {
    borderColor: "#f0ceaa",
    boxShadow: "0 0 0 3px rgba(240, 206, 170, 0.1)",
    background: "rgba(255, 255, 255, 0.9)",
  },
  fieldInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "18px 16px",
    color: "#8b6655",
    fontSize: 15,
    fontWeight: 400,
    outline: "none",
    position: "relative",
    zIndex: 2,
    fontFamily: "inherit",
  },
  fieldLabel: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(139, 102, 85, 0.6)",
    fontSize: 15,
    fontWeight: 400,
    pointerEvents: "none",
    transition: "all 0.3s ease",
    zIndex: 3,
  },
  fieldLabelFloated: {
    top: 12,
    fontSize: 12,
    color: "#8b6655",
    transform: "translateY(0)",
    fontWeight: 500,
  },
  fieldAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 0,
    height: 2,
    background: "linear-gradient(90deg, #f0ceaa, #e0be9c)",
    transition: "width 0.3s ease",
    borderRadius: 2,
  },
  fieldAccentActive: {
    width: "100%",
  },

  // Password toggle
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 56,
  },
  gentleToggle: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    zIndex: 4,
    padding: 8,
    borderRadius: 12,
    transition: "all 0.2s ease",
  },
  gentleToggleHover: {
    background: "rgba(240, 206, 170, 0.1)",
  },
  toggleIcon: {
    width: 20,
    height: 20,
    color: "rgba(139, 102, 85, 0.6)",
    transition: "color 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleIconActive: {
    color: "#8b6655",
  },

  // Options
  comfortOptions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 16,
  },
  gentleCheckboxLabel: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: 14,
    color: "#8b6655",
    fontWeight: 400,
    userSelect: "none",
  },
  checkboxSoft: {
    width: 20,
    height: 20,
    marginRight: 12,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: "100%",
    height: "100%",
    border: "1.5px solid rgba(240, 206, 170, 0.4)",
    borderRadius: 6,
    background: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease",
    position: "absolute",
  },
  checkCircleChecked: {
    background: "linear-gradient(135deg, #f0ceaa, #e0be9c)",
    borderColor: "#f0ceaa",
    boxShadow: "0 2px 4px rgba(240, 206, 170, 0.3)",
  },
  checkMark: {
    color: "transparent",
    transition: "color 0.3s ease",
    position: "relative",
    zIndex: 1,
  },
  checkMarkChecked: {
    color: "#8b6655",
  },
  checkboxText: {
    fontSize: 14,
  },

  comfortLink: {
    color: "#c19a82",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    position: "relative",
  },

  // Button
  comfortButton: {
    width: "100%",
    background: "transparent",
    color: "#8b6655",
    border: "none",
    borderRadius: 16,
    padding: 0,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 500,
    position: "relative",
    marginBottom: 32,
    overflow: "hidden",
    minHeight: 54,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  comfortButtonDisabled: {
    cursor: "default",
    opacity: 0.8,
  },
  buttonBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #f0ceaa 0%, #e0be9c 100%)",
    transition: "all 0.3s ease",
    borderRadius: 16,
  },
  buttonText: {
    position: "relative",
    zIndex: 2,
    transition: "opacity 0.3s ease",
  },
  buttonLoader: {
    position: "absolute",
    zIndex: 2,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  buttonLoaderVisible: {
    opacity: 1,
  },
  gentleSpinner: {
    width: 20,
    height: 20,
    position: "relative",
  },
  spinnerCircle: {
    width: "100%",
    height: "100%",
    border: "2px solid rgba(139, 102, 85, 0.2)",
    borderTop: "2px solid #8b6655",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  buttonGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: "linear-gradient(135deg, #f0ceaa, #e0be9c)",
    borderRadius: 18,
    opacity: 0.4,
    filter: "blur(8px)",
    zIndex: -1,
  },

  // Divider
  gentleDivider: {
    display: "flex",
    alignItems: "center",
    margin: "32px 0",
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background:
      "linear-gradient(90deg, transparent, rgba(240, 206, 170, 0.4), transparent)",
  },
  dividerText: {
    color: "rgba(139, 102, 85, 0.6)",
    fontSize: 13,
    fontWeight: 400,
  },

  // Social buttons
  comfortSocial: {
    display: "flex",
    gap: 12,
    marginBottom: 32,
  },
  socialSoft: {
    flex: 1,
    background: "transparent",
    color: "#8b6655",
    border: "1.5px solid rgba(240, 206, 170, 0.3)",
    borderRadius: 12,
    padding: 0,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.3s ease",
    minHeight: 48,
    position: "relative",
    overflow: "hidden",
  },
  socialSoftDisabled: {
    pointerEvents: "none",
    opacity: 0.5,
  },
  socialBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255, 255, 255, 0.7)",
    transition: "all 0.3s ease",
  },
  socialContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  socialGlow: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    background: "rgba(240, 206, 170, 0.3)",
    borderRadius: 13,
    opacity: 0,
    filter: "blur(6px)",
    transition: "opacity 0.3s ease",
    zIndex: 0,
  },

  // Signup
  comfortSignup: {
    textAlign: "center",
    fontSize: 14,
    color: "rgba(139, 102, 85, 0.7)",
  },
  signupText: {
    marginRight: 6,
  },

  // Error text
  gentleError: {
    color: "#d97757",
    fontSize: 13,
    fontWeight: 400,
    marginTop: 6,
    opacity: 0,
    transform: "translateY(-4px)",
    transition: "all 0.3s ease",
    position: "relative",
    zIndex: 5,
  },
  gentleErrorVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },

  // Success
  gentleSuccess: {
    display: "none",
    textAlign: "center",
    padding: "40px 20px",
    opacity: 0,
    transform: "translateY(20px)",
    transition: "all 0.4s ease",
  },
  gentleSuccessVisible: {
    display: "block",
    opacity: 1,
    transform: "translateY(0)",
  },
  successBloom: {
    position: "relative",
    width: 100,
    height: 100,
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bloomRingBase: {
    position: "absolute",
    border: "2px solid #f0ceaa",
    borderRadius: "50%",
    opacity: 0.6,
  },
  successIcon: {
    position: "relative",
    zIndex: 2,
    color: "#8b6655",
  },
  successTitle: {
    color: "#8b6655",
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: "-0.01em",
  },
  successDesc: {
    color: "rgba(139, 102, 85, 0.7)",
    fontSize: 14,
    fontWeight: 400,
  },
};

function SoftMinimalismLogin({ onSubmit, onSocialClick, onSignupClick, onForgotClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hideForm, setHideForm] = useState(false);

  const emailError = touched.email ? errors.email : "";
  const passwordError = touched.password ? errors.password : "";

  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter your email address";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Please enter your password";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setIsFocused((prev) => ({ ...prev, [field]: false }));
    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "email"
          ? validateEmail(field === "email" ? email : password)
          : validatePassword(password),
    }));
  };

  const handleInputChange = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]:
          field === "email" ? validateEmail(value) : validatePassword(value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passwordErr });

    if (emailErr || passwordErr) return;

    setLoading(true);

    try {
      // Replace with real API call
      await new Promise((res) => setTimeout(res, 2500));

      setHideForm(true);
      setShowSuccess(true);

      if (onSubmit) {
        onSubmit({ email, password, remember });
      }

      setTimeout(() => {
        // Navigation callback hook point
        // e.g., navigate("/dashboard");
      }, 3500);
    } catch {
      setErrors((prev) => ({
        ...prev,
        password: "Sign in failed. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = async (providerKey) => {
    setSocialLoading(providerKey);
    try {
      await new Promise((res) => setTimeout(res, 2000));
      if (onSocialClick) onSocialClick(providerKey);
    } finally {
      setSocialLoading(null);
    }
  };

  const fieldHasError = (field) =>
    (field === "email" ? emailError : passwordError)?.length > 0;

  const labelFloated = (field) => {
    if (field === "email") return isFocused.email || email.length > 0;
    return isFocused.password || password.length > 0;
  };

  const disabledAll = loading;

  return (
    <div style={styles.pageWrapper}>
      {/* Background blobs */}
      <div style={styles.softBackground}>
        <div style={styles.floatingShapes}>
          <div style={{ ...styles.softBlobBase, ...styles.blob1 }} />
          <div style={{ ...styles.softBlobBase, ...styles.blob2 }} />
          <div style={{ ...styles.softBlobBase, ...styles.blob3 }} />
          <div style={{ ...styles.softBlobBase, ...styles.blob4 }} />
        </div>
      </div>

      <div style={styles.loginContainer}>
        <div style={styles.softCard}>
          <div style={styles.cardTopBorder} />

          {/* Header */}
          <div style={styles.comfortHeader}>
            <div style={styles.gentleLogo}>
              <div style={styles.logoCircle}>
                <div style={styles.comfortIcon}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 16a4 4 0 108 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="20" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div style={styles.gentleGlow} />
              </div>
            </div>
            <h1 style={styles.comfortTitle}>Welcome back</h1>
            <p style={styles.gentleSubtitle}>Sign in to your peaceful space</p>
          </div>

          {/* Form */}
          {!hideForm && (
            <>
              <form style={styles.comfortForm} onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div style={styles.softField}>
                  <div
                    style={{
                      ...styles.fieldContainer,
                      ...(isFocused.email ? styles.fieldContainerFocused : {}),
                      ...(fieldHasError("email") ? styles.softFieldError : {}),
                    }}
                  >
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={() => handleBlur("email")}
                      onFocus={() =>
                        setIsFocused((prev) => ({ ...prev, email: true }))
                      }
                      style={styles.fieldInput}
                    />
                    <label
                      style={{
                        ...styles.fieldLabel,
                        ...(labelFloated("email")
                          ? styles.fieldLabelFloated
                          : {}),
                        ...(fieldHasError("email")
                          ? { color: "#d97757" }
                          : {}),
                      }}
                    >
                      Email address
                    </label>
                    <div
                      style={{
                        ...styles.fieldAccent,
                        ...(isFocused.email ? styles.fieldAccentActive : {}),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      ...styles.gentleError,
                      ...(emailError ? styles.gentleErrorVisible : {}),
                    }}
                  >
                    {emailError}
                  </span>
                </div>

                {/* Password */}
                <div style={styles.softField}>
                  <div
                    style={{
                      ...styles.fieldContainer,
                      ...(isFocused.password ? styles.fieldContainerFocused : {}),
                      ...(fieldHasError("password")
                        ? styles.softFieldError
                        : {}),
                    }}
                  >
                    <div style={styles.passwordContainer}>
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        onBlur={() => handleBlur("password")}
                        onFocus={() =>
                          setIsFocused((prev) => ({
                            ...prev,
                            password: true,
                          }))
                        }
                        style={{ ...styles.fieldInput, ...styles.passwordInput }}
                      />
                      <label
                        style={{
                          ...styles.fieldLabel,
                          ...(labelFloated("password")
                            ? styles.fieldLabelFloated
                            : {}),
                          ...(fieldHasError("password")
                            ? { color: "#d97757" }
                            : {}),
                        }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={styles.gentleToggle}
                      >
                        <div
                          style={{
                            ...styles.toggleIcon,
                            ...(showPassword ? styles.toggleIconActive : {}),
                          }}
                        >
                          {showPassword ? (
                            // Eye closed icon
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M3 3l14 14M8.5 8.5a3 3 0 004 4m2.5-2.5C15 10 12.5 7 10 7c-.5 0-1 .1-1.5.3M10 13c-2.5 0-4.5-2-5-3 .3-.6.7-1.2 1.2-1.7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            // Eye open icon
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M10 3c-4.5 0-8.3 3.8-9 7 .7 3.2 4.5 7 9 7s8.3-3.8 9-7c-.7-3.2-4.5-7-9-7z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill="none"
                              />
                              <circle
                                cx="10"
                                cy="10"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill="none"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                      <div
                        style={{
                          ...styles.fieldAccent,
                          ...(isFocused.password ? styles.fieldAccentActive : {}),
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      ...styles.gentleError,
                      ...(passwordError ? styles.gentleErrorVisible : {}),
                    }}
                  >
                    {passwordError}
                  </span>
                </div>

                {/* Options */}
                <div style={styles.comfortOptions}>
                  <label style={styles.gentleCheckboxLabel}>
                    <div style={styles.checkboxSoft}>
                      <div
                        style={{
                          ...styles.checkCircle,
                          ...(remember ? styles.checkCircleChecked : {}),
                        }}
                      />
                      <svg
                        width="12"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="none"
                        style={{
                          ...styles.checkMark,
                          ...(remember ? styles.checkMarkChecked : {}),
                        }}
                      >
                        <path
                          d="M1 5l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span style={styles.checkboxText}>Remember me</span>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      style={{ display: "none" }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={onForgotClick}
                    style={{
                      ...styles.comfortLink,
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={disabledAll}
                  style={{
                    ...styles.comfortButton,
                    ...(disabledAll ? styles.comfortButtonDisabled : {}),
                  }}
                >
                  <div style={styles.buttonBackground} />
                  <span
                    style={{
                      ...styles.buttonText,
                      opacity: loading ? 0 : 1,
                    }}
                  >
                    Sign in
                  </span>
                  <div
                    style={{
                      ...styles.buttonLoader,
                      ...(loading ? styles.buttonLoaderVisible : {}),
                    }}
                  >
                    <div style={styles.gentleSpinner}>
                      <div style={styles.spinnerCircle} />
                    </div>
                  </div>
                  <div style={styles.buttonGlow} />
                </button>
              </form>

              {/* Divider */}
              <div style={styles.gentleDivider}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerText}>or continue with</span>
                <div style={styles.dividerLine} />
              </div>

              {/* Social */}
              <div style={styles.comfortSocial}>
                <button
                  type="button"
                  style={{
                    ...styles.socialSoft,
                    ...(loading ? styles.socialSoftDisabled : {}),
                  }}
                  onClick={() => handleSocialClick("google")}
                  disabled={loading}
                >
                  <div style={styles.socialBackground} />
                  <div style={styles.socialContent}>
                    {socialLoading === "google" ? (
                      <>
                        <div style={styles.gentleSpinner}>
                          <div style={styles.spinnerCircle} />
                        </div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M9 7.4v3.2h4.6c-.2 1-.8 1.8-1.6 2.4v2h2.6c1.5-1.4 2.4-3.4 2.4-5.8 0-.6 0-1.1-.1-1.6H9z"
                            fill="#4285F4"
                          />
                          <path
                            d="M9 17c2.2 0 4-0.7 5.4-1.9l-2.6-2c-.7.5-1.6.8-2.8.8-2.1 0-3.9-1.4-4.6-3.4H1.7v2.1C3.1 15.2 5.8 17 9 17z"
                            fill="#34A853"
                          />
                          <path
                            d="M4.4 10.5c-.2-.5-.2-1.1 0-1.6V6.8H1.7c-.6 1.2-.6 2.6 0 3.8l2.7-2.1z"
                            fill="#FBBC04"
                          />
                          <path
                            d="M9 4.2c1.2 0 2.3.4 3.1 1.2l2.3-2.3C12.9 1.8 11.1 1 9 1 5.8 1 3.1 2.8 1.7 5.4l2.7 2.1C5.1 5.6 6.9 4.2 9 4.2z"
                            fill="#EA4335"
                          />
                        </svg>
                        <span>Google</span>
                      </>
                    )}
                  </div>
                  <div style={styles.socialGlow} />
                </button>

                {/* <button
                  type="button"
                  style={{
                    ...styles.socialSoft,
                    ...(loading ? styles.socialSoftDisabled : {}),
                  }}
                  onClick={() => handleSocialClick("facebook")}
                  disabled={loading}
                >
                  <div style={styles.socialBackground} />
                  <div style={styles.socialContent}>
                    {socialLoading === "facebook" ? (
                      <>
                        <div style={styles.gentleSpinner}>
                          <div style={styles.spinnerCircle} />
                        </div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="#1877F2"
                        >
                          <path d="M18 9C18 4.03 13.97 0 9 0S0 4.03 0 9c0 4.49 3.29 8.21 7.59 9v-6.37H5.31V9h2.28V7.02c0-2.25 1.34-3.49 3.39-3.49.98 0 2.01.18 2.01.18v2.21h-1.13c-1.11 0-1.46.69-1.46 1.4V9h2.49l-.4 2.63H10.4V18C14.71 17.21 18 13.49 18 9z" />
                        </svg>
                        <span>Facebook</span>
                      </>
                    )}
                  </div>
                  <div style={styles.socialGlow} />
                </button> */}
              </div>

              {/* Signup */}
              <div style={styles.comfortSignup}>
                <span style={styles.signupText}>Don't have an account?</span>
                <button
                  type="button"
                  onClick={onSignupClick}
                  style={{
                    ...styles.comfortLink,
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {/* Success state */}
          <div
            style={{
              ...styles.gentleSuccess,
              ...(showSuccess ? styles.gentleSuccessVisible : {}),
            }}
          >
            <div style={styles.successBloom}>
              <div
                style={{
                  ...styles.bloomRingBase,
                  width: 60,
                  height: 60,
                  top: 20,
                  left: 20,
                }}
              />
              <div
                style={{
                  ...styles.bloomRingBase,
                  width: 80,
                  height: 80,
                  top: 10,
                  left: 10,
                }}
              />
              <div
                style={{
                  ...styles.bloomRingBase,
                  width: 100,
                  height: 100,
                  top: 0,
                  left: 0,
                }}
              />
              <div style={styles.successIcon}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 14l5 5 11-11"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h3 style={styles.successTitle}>Welcome!</h3>
            <p style={styles.successDesc}>Taking you to your dashboard...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoftMinimalismLogin;
