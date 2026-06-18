// // My old login design with real login design

// import React, { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { login } from "../api/authApi.js";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { loginUser, fetchUser } from "../authentication/authSlice.js"; // Add this import
// import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

// const Login = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { loading: authLoading, error: reduxAuthError } = useSelector((state) => state.auth);
//   const [rememberMe, setRememberMe] = useState(false);

//   const formik = useFormik({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validationSchema: Yup.object({
//       email: Yup.string().email("Invalid email").required("Required"),
//       password: Yup.string().required("Password is required"),
//     }),
//     onSubmit: async (values, { setSubmitting, setStatus }) => {
//       try {
//         // Dispatch Redux thunk instead of direct API call
//         const result = await dispatch(loginUser(values));

//         // Check if login succeeded
//         if (loginUser.fulfilled.match(result)) {
//           // If backend didn't return user data, refresh from /auth/me/
//           if (!result.payload?.user) {
//             await dispatch(fetchUser());
//           }
//           navigate("/home");
//         }
//       } catch (err) {
//         // This won't trigger since thunks handle errors
//         setStatus({ error: "Login failed" });
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   // Disable form during auth loading
//   const isSubmitting = formik.isSubmitting || authLoading;

//   // Safely parse error messages from Django backend
//   const displayErrorRaw = formik.status?.error || reduxAuthError;
//   let parsedError = null;
//   if (displayErrorRaw) {
//     if (typeof displayErrorRaw === 'string') {
//       parsedError = displayErrorRaw;
//     } else if (typeof displayErrorRaw === 'object') {
//       parsedError =
//         displayErrorRaw.non_field_errors?.[0] ||
//         displayErrorRaw.detail ||
//         displayErrorRaw.error ||
//         (Object.values(displayErrorRaw)[0] && Object.values(displayErrorRaw)[0][0]) ||
//         "Login failed. Please check your credentials.";
//     }
//   }

//   return (
//     <div className="min-h-screen flex">
//       {/* Left Section - Form */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
//         <div className="w-full max-w-md">
//           <h1 className="text-4xl font-bold mb-2" style={{ color: '#A1BC98' }}>
//             Welcome back
//           </h1>
//           <p className="text-gray-600 mb-8">
//             Enter your email and password to sign in
//           </p>

//           <div>
//             {/* Email Field */}
//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 disabled={isSubmitting}
//                 {...formik.getFieldProps("email")}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50"
//                 style={{
//                   borderColor: formik.touched.email && formik.errors.email ? '#ef4444' : '#d1d5db'
//                 }}
//               />
//               {formik.touched.email && formik.errors.email && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {formik.errors.email}
//                 </p>
//               )}
//             </div>

//             {/* Password Field */}
//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 disabled={isSubmitting}
//                 {...formik.getFieldProps("password")}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50"
//                 style={{
//                   borderColor: formik.touched.password && formik.errors.password ? '#ef4444' : '#d1d5db'
//                 }}
//               />
//               {formik.touched.password && formik.errors.password && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {formik.errors.password}
//                 </p>
//               )}
//             </div>

//             {/* Error Message */}
//             {parsedError && (
//               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <p className="text-sm text-red-600">
//                   {parsedError}
//                 </p>
//               </div>
//             )}

//             {/* Remember Me Toggle and Forgot Password */}
//             <div className="flex items-center justify-between mb-6">
//               {/* Forgot Password Link */}
//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 disabled={isSubmitting}
//                 className="text-sm font-semibold hover:underline disabled:opacity-50"
//                 style={{ color: '#A1BC98' }}
//               >
//                 Forgot Password?
//               </button>
//             </div>

//             {/* Sign In Button */}
//             <button
//               type="button"
//               onClick={formik.handleSubmit}
//               disabled={isSubmitting}
//               className={`w-full py-3 px-4 rounded-lg text-white font-semibold mb-4 transition ${isSubmitting
//                 ? "opacity-60 cursor-not-allowed"
//                 : "hover:opacity-90"
//                 }`}
//               style={{ backgroundColor: '#A1BC98' }}
//             >
//               {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
//             </button>

//             {/* Google Login Button */}
//             <div className="mb-6">
//               <GoogleLoginButton disabled={isSubmitting} />
//             </div>

//             {/* Sign Up Link */}
//             <p className="text-center text-gray-600">
//               Don't have an account?{' '}
//               <button
//                 type="button"
//                 onClick={() => navigate("/signup")}
//                 disabled={isSubmitting}
//                 className="font-semibold hover:underline disabled:opacity-50"
//                 style={{ color: '#A1BC98' }}
//               >
//                 Sign up
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Section - Image (unchanged) */}
//       <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
//         <div
//           className="absolute inset-0"
//           style={{
//             background: `linear-gradient(135deg, 
//               #F1F3E0 0%, 
//               #D2DCB6 25%, 
//               #A1BC98 50%, 
//               #778873 75%, 
//               #778873 100%)`
//           }}
//         >
//           <svg
//             className="absolute inset-0 w-full h-full opacity-30"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <defs>
//               <pattern
//                 id="wave-pattern"
//                 x="0"
//                 y="0"
//                 width="100"
//                 height="100"
//                 patternUnits="userSpaceOnUse"
//               >
//                 <path
//                   d="M0 50 Q 25 30, 50 50 T 100 50"
//                   fill="none"
//                   stroke="rgba(255,255,255,0.3)"
//                   strokeWidth="2"
//                 />
//                 <path
//                   d="M0 60 Q 25 40, 50 60 T 100 60"
//                   fill="none"
//                   stroke="rgba(255,255,255,0.2)"
//                   strokeWidth="2"
//                 />
//               </pattern>
//             </defs>
//             <rect width="100%" height="100%" fill="url(#wave-pattern)" />
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;







































// // Login.jsx — New visual design + real authentication logic

// import React, { useState } from 'react';
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { loginUser, fetchUser } from "../authentication/authSlice.js";
// import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

// // ──────────────────────────────────────────────────────────────────────────
// // Pixel pattern data  (unchanged from new design)
// // ──────────────────────────────────────────────────────────────────────────
// const PATTERN_ROWS = [
//   '0000000000000000000000000000',
//   '0000000000000000000000000000',
//   '0000000000000000000000000000',
//   '0000000000000000000000000000',
//   '0000000000001100000001000000',
//   '0000000000101111000011000000',
//   '0000000000001111111110100100',
//   '0000000000010110011100011100',
//   '0000000000011111111100001111',
//   '0000000000011110000101110001',
//   '0000000000001011111000111111',
//   '0000000000011111110111101000',
//   '0000000000000110010101111001',
//   '0000000000000011111000011111',
//   '0000000000000000011100101111',
//   '0000000000000000001110111011',
//   '0000000000000000000101101111',
//   '0000000000000001001010111111',
//   '0000000000000000000101111101',
//   '0000000000010000000010111101',
//   '0000000000100000000100111111',
//   '0000000011000000000110011011',
//   '0000000001100000000110111111',
//   '0000000000111100110101111111',
//   '0000000000111001001001111101',
//   '0000000000111001111000111111',
//   '0000001001101001101011101100',
//   '0000000001111111111001111111',
//   '0000000011111100110000011111',
//   '0000000011101111100100101101',
//   '0000000000011100100110111111',
// ];

// function PixelPattern() {
//   return (
//     <svg
//       className="tvs-pixel-pattern"
//       viewBox="0 0 28 31"
//       preserveAspectRatio="xMidYMin slice"
//       xmlns="http://www.w3.org/2000/svg"
//       aria-hidden="true"
//     >
//       {PATTERN_ROWS.map((row, y) =>
//         row.split('').map((cell, x) =>
//           cell === '1' ? (
//             <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#359280" />
//           ) : null
//         )
//       )}
//     </svg>
//   );
// }

// function LogoIcon() {
//   return (
//     <svg width="38" height="38" viewBox="0 0 100 100" aria-hidden="true">
//       <path
//         d="M58,8 L10,8 L10,92 L58,92"
//         fill="none"
//         stroke="#211C18"
//         strokeWidth="7"
//       />
//       <path
//         d="M58,8 C72,8 78,16 76,26 C82,30 86,34 90,40 C84,42 80,44 78,48
//            C84,52 88,56 90,60 C82,60 76,62 72,66 C76,72 74,80 64,84
//            C70,88 64,92 58,92 Z"
//         fill="#211C18"
//       />
//       <rect x="44" y="26" width="9" height="9" fill="#E8E3DC" />
//       <rect x="40" y="58" width="6" height="6" fill="#E8E3DC" />
//     </svg>
//   );
// }

// function EyeIcon({ visible }) {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//       <path
//         d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
//         stroke="currentColor"
//         strokeWidth="1.6"
//       />
//       <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
//       {!visible && (
//         <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="1.6" />
//       )}
//     </svg>
//   );
// }

// function GoogleIcon() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
//       <path
//         fill="currentColor"
//         d="M12 10.2v3.84h5.34c-.23 1.38-1.66 4.04-5.34 4.04-3.21 0-5.84-2.66-5.84-5.93s2.63-5.93 5.84-5.93c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.66 3.6 14.56 2.6 12 2.6 6.98 2.6 2.9 6.7 2.9 11.71s4.08 9.11 9.1 9.11c5.25 0 8.74-3.69 8.74-8.89 0-.6-.07-1.05-.15-1.5H12Z"
//       />
//     </svg>
//   );
// }

// function AppleIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
//       <path
//         fill="currentColor"
//         d="M17.05 12.54c-.03-2.06 1.68-3.05 1.76-3.1-.96-1.4-2.45-1.59-2.98-1.61-1.36-.14-2.65.79-3.34.79-.7 0-1.76-.77-2.89-.75-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.09 8.76.72 1.05 1.58 2.23 2.71 2.19 1.08-.04 1.49-.7 2.8-.7 1.3 0 1.68.7 2.83.68 1.17-.02 1.91-1.06 2.63-2.12.83-1.21 1.17-2.38 1.19-2.45-.03-.01-2.18-.84-2.2-3.27ZM14.7 5.5c.6-.73 1.01-1.74.9-2.75-.86.04-1.92.59-2.55 1.31-.56.64-1.05 1.66-.92 2.64.96.08 1.95-.49 2.57-1.2Z"
//       />
//     </svg>
//   );
// }

// // ──────────────────────────────────────────────────────────────────────────
// // Styles — original design classes + minimal additions for disabled/error
// // states introduced by the login logic (prefixed so nothing collides).
// // ──────────────────────────────────────────────────────────────────────────
// const styles = `
//   .tvs-page {
//     display: flex;
//     min-height: 100vh;
//     width: 100%;
//     background: #E8E3DC;
//     font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//   }

//   .tvs-left-panel {
//     flex: 1 1 50%;
//     min-width: 0;
//     background: #E8E3DC;
//     display: flex;
//     flex-direction: column;
//   }

//   .tvs-left-panel-inner {
//     flex: 1;
//     display: flex;
//     flex-direction: column;
//     padding: 40px 64px 64px;
//   }

//   .tvs-logo-row {
//     display: flex;
//     align-items: center;
//     gap: 12px;
//     flex-shrink: 0;
//   }

//   .tvs-logo-word {
//     font-weight: 900;
//     font-size: 30px;
//     letter-spacing: -0.01em;
//     color: #211C18;
//     line-height: 1;
//   }

//   .tvs-form-area {
//     flex: 1;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     padding-top: 150px;
//   }

//   .tvs-form-card {
//     width: 100%;
//     max-width: 460px;
//   }

//   .tvs-heading {
//     font-family: Georgia, 'Times New Roman', Times, serif;
//     font-weight: 400;
//     font-size: 48px;
//     line-height: 1.05;
//     color: #211C18;
//     margin: 0 0 14px;
//   }

//   .tvs-subtext {
//     font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
//     font-size: 17px;
//     line-height: 1.55;
//     color: #6B6560;
//     margin: 0 0 26px;
//   }

//   /* ── Field ── */
//   .tvs-field {
//     position: relative;
//     border: 1.5px dashed #B8B0A5;
//     padding: 4px 20px;
//     margin-bottom: 12px;
//   }

//   /* Added: validation error border */
//   .tvs-field-error {
//     border-color: #ef4444;
//   }

//   .tvs-field input {
//     width: 100%;
//     height: 58px;
//     border: none;
//     outline: none;
//     background: transparent;
//     font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
//     font-size: 17px;
//     color: #211C18;
//   }

//   .tvs-field input::placeholder {
//     color: #A39C92;
//   }

//   /* Added: disabled input styling */
//   .tvs-field input:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   .tvs-field-password input {
//     padding-right: 34px;
//   }

//   .tvs-eye-btn {
//     position: absolute;
//     right: 18px;
//     top: 50%;
//     transform: translateY(-50%);
//     background: none;
//     border: none;
//     padding: 4px;
//     cursor: pointer;
//     color: #A39C92;
//     display: flex;
//     align-items: center;
//   }

//   /* Added: inline validation error text (Yup messages) */
//   .tvs-field-error-text {
//     display: block;
//     font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
//     font-size: 12.5px;
//     color: #ef4444;
//     margin: -8px 0 12px;
//     letter-spacing: 0.02em;
//   }

//   /* Added: Django backend error box */
//   .tvs-error-box {
//     background: rgba(239, 68, 68, 0.07);
//     border: 1.5px dashed #ef4444;
//     padding: 10px 16px;
//     margin-bottom: 14px;
//   }

//   .tvs-error-box p {
//     font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
//     font-size: 12.5px;
//     color: #ef4444;
//     margin: 0;
//     letter-spacing: 0.02em;
//   }

//   .tvs-forgot-link {
//     display: block;
//     text-align: center;
//     margin: 18px 0 32px;
//     font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
//     font-size: 12.5px;
//     letter-spacing: 0.06em;
//     color: #6B6560;
//     text-decoration: underline;
//     text-underline-offset: 3px;
//     cursor: pointer;
//   }

//   .tvs-forgot-link:hover {
//     color: #211C18;
//   }

//   /* ── Buttons ── */
//   .tvs-btn {
//     width: 100%;
//     height: 54px;
//     border-radius: 2px;
//     font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//     font-weight: 700;
//     font-size: 14px;
//     letter-spacing: 0.06em;
//     text-transform: uppercase;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 10px;
//     margin-bottom: 18px;
//     box-shadow: 4px 4px 0 0 #211C18;
//     transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
//   }

//   /* Modified: only animate when not disabled */
//   .tvs-btn:hover:not(:disabled) {
//     transform: translate(-1px, -1px);
//     box-shadow: 5px 5px 0 0 #211C18;
//   }

//   .tvs-btn:active:not(:disabled) {
//     transform: translate(2px, 2px);
//     box-shadow: 2px 2px 0 0 #211C18;
//   }

//   /* Added: disabled state */
//   .tvs-btn:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   .tvs-btn-primary {
//     background: #0FAE9C;
//     border: none;
//     color: #EAFBF7;
//   }

//   /* Modified: only darken on hover when not disabled */
//   .tvs-btn-primary:hover:not(:disabled) {
//     background: #0C9686;
//   }

//   .tvs-btn-outline {
//     background: #FBF7F4;
//     border: 1.5px solid #211C18;
//     color: #211C18;
//   }

//   /* Added: wrapper that hosts the GoogleLoginButton SDK widget */
//   .tvs-google-wrapper {
//     width: 100%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//   }

//   .tvs-footer-text {
//     margin-top: 130px;
//     text-align: center;
//     width: 100%;
//     font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
//     font-size: 13px;
//     letter-spacing: 0.05em;
//     color: #79716A;
//   }

//   .tvs-signup-link {
//     color: #C2455F;
//     font-weight: 700;
//     text-decoration: underline;
//     text-underline-offset: 3px;
//     cursor: pointer;
//   }

//   /* ── Right panel ── */
//   .tvs-right-panel {
//     flex: 1 1 50%;
//     position: relative;
//     overflow: hidden;
//     background: linear-gradient(135deg, #3B383C 0%, #322F33 100%);
//   }

//   .tvs-pixel-pattern {
//     position: absolute;
//     inset: 0;
//     width: 100%;
//     height: 100%;
//   }

//   /* ── Responsive ── */
//   @media (max-width: 900px) {
//     .tvs-page { flex-direction: column; }
//     .tvs-right-panel { order: -1; height: 220px; flex: none; }
//     .tvs-left-panel-inner { padding: 24px 24px 48px; }
//     .tvs-form-area { padding-top: 48px; }
//     .tvs-heading { font-size: 38px; }
//     .tvs-footer-text { margin-top: 64px; }
//   }

//   @media (max-width: 480px) {
//     .tvs-left-panel-inner { padding: 20px 18px 40px; }
//     .tvs-logo-word { font-size: 24px; }
//     .tvs-heading { font-size: 32px; }
//     .tvs-subtext { font-size: 15px; }
//     .tvs-field input { height: 50px; font-size: 15px; }
//     .tvs-btn { height: 48px; font-size: 12.5px; }
//   }
// `;

// // ──────────────────────────────────────────────────────────────────────────
// // LoginPage
// // Visual shell: new design (unchanged).
// // Logic: ported 1-to-1 from the old Login.jsx.
// // ──────────────────────────────────────────────────────────────────────────
// function LoginPage() {
//   // ── Logic from old Login.jsx ──────────────────────────────────────────
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { loading: authLoading, error: reduxAuthError } = useSelector(
//     (state) => state.auth
//   );
//   const [rememberMe, setRememberMe] = useState(false);

//   // ── UI state from new design ──────────────────────────────────────────
//   const [showPassword, setShowPassword] = useState(false);

//   // ── Formik (unchanged from old Login.jsx) ────────────────────────────
//   const formik = useFormik({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validationSchema: Yup.object({
//       email: Yup.string().email("Invalid email").required("Required"),
//       password: Yup.string().required("Password is required"),
//     }),
//     onSubmit: async (values, { setSubmitting, setStatus }) => {
//       try {
//         const result = await dispatch(loginUser(values));

//         if (loginUser.fulfilled.match(result)) {
//           if (!result.payload?.user) {
//             await dispatch(fetchUser());
//           }
//           navigate("/home");
//         }
//       } catch (err) {
//         // Thunks handle errors; this is a safety net.
//         setStatus({ error: "Login failed" });
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   // Disable everything while auth or formik is in-flight
//   const isSubmitting = formik.isSubmitting || authLoading;

//   // Safely parse error messages from Django backend (unchanged from old Login.jsx)
//   const displayErrorRaw = formik.status?.error || reduxAuthError;
//   let parsedError = null;
//   if (displayErrorRaw) {
//     if (typeof displayErrorRaw === "string") {
//       parsedError = displayErrorRaw;
//     } else if (typeof displayErrorRaw === "object") {
//       parsedError =
//         displayErrorRaw.non_field_errors?.[0] ||
//         displayErrorRaw.detail ||
//         displayErrorRaw.error ||
//         (Object.values(displayErrorRaw)[0] &&
//           Object.values(displayErrorRaw)[0][0]) ||
//         "Login failed. Please check your credentials.";
//     }
//   }

//   // ── Render ────────────────────────────────────────────────────────────
//   return (
//     <div className="tvs-page">
//       <style>{styles}</style>

//       {/* ───────── Left panel ───────── */}
//       <div className="tvs-left-panel">
//         <div className="tvs-left-panel-inner">

//           {/* Logo (unchanged) */}
//           <div className="tvs-logo-row">
//             <LogoIcon />
//             <span className="tvs-logo-word">TAVUS</span>
//           </div>

//           {/* Form area */}
//           <div className="tvs-form-area">
//             <div className="tvs-form-card">
//               <h1 className="tvs-heading">Log in</h1>
//               <p className="tvs-subtext">
//                 Enter your email and password below to log in
//                 <br />
//                 to your account
//               </p>

//               {/* ── Email field ── */}
//               <div
//                 className={`tvs-field${
//                   formik.touched.email && formik.errors.email
//                     ? " tvs-field-error"
//                     : ""
//                 }`}
//               >
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   disabled={isSubmitting}
//                   {...formik.getFieldProps("email")}
//                 />
//               </div>
//               {formik.touched.email && formik.errors.email && (
//                 <span className="tvs-field-error-text">
//                   {formik.errors.email}
//                 </span>
//               )}

//               {/* ── Password field ── */}
//               <div
//                 className={`tvs-field tvs-field-password${
//                   formik.touched.password && formik.errors.password
//                     ? " tvs-field-error"
//                     : ""
//                 }`}
//               >
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   disabled={isSubmitting}
//                   {...formik.getFieldProps("password")}
//                 />
//                 <button
//                   type="button"
//                   className="tvs-eye-btn"
//                   onClick={() => setShowPassword((v) => !v)}
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   <EyeIcon visible={showPassword} />
//                 </button>
//               </div>
//               {formik.touched.password && formik.errors.password && (
//                 <span className="tvs-field-error-text">
//                   {formik.errors.password}
//                 </span>
//               )}

//               {/* ── Backend error box ── */}
//               {parsedError && (
//                 <div className="tvs-error-box">
//                   <p>{parsedError}</p>
//                 </div>
//               )}

//               {/* ── Forgot password — navigates to /forgot-password ── */}
//               <a
//                 href="#"
//                 className="tvs-forgot-link"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   if (!isSubmitting) navigate("/forgot-password");
//                 }}
//               >
//                 FORGOT YOUR PASSWORD?
//               </a>

//               {/* ── Primary sign-in button ── */}
//               <button
//                 type="button"
//                 onClick={formik.handleSubmit}
//                 disabled={isSubmitting}
//                 className="tvs-btn tvs-btn-primary"
//               >
//                 {isSubmitting ? "SIGNING IN..." : "LOG IN"}
//               </button>

//               {/* ── Google Sign-In — custom styled button ── */}
//               <GoogleLoginButton disabled={isSubmitting} />
//             </div>

//             {/* ── Sign-up link — navigates to /signup ── */}
//             <p className="tvs-footer-text">
//               DON&apos;T HAVE AN ACCOUNT?{" "}
//               <a
//                 href="#"
//                 className="tvs-signup-link"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   if (!isSubmitting) navigate("/signup");
//                 }}
//               >
//                 SIGN UP
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* ───────── Right panel (unchanged) ───────── */}
//       <div className="tvs-right-panel">
//         <PixelPattern />
//       </div>
//     </div>
//   );
// }

// export default LoginPage;




























// Login.jsx — New visual design + real authentication logic

import React, { useState } from 'react';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchUser } from "../authentication/authSlice.js";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

// ──────────────────────────────────────────────────────────────────────────
// Pixel pattern data  (unchanged)
// ──────────────────────────────────────────────────────────────────────────
const PATTERN_ROWS = [
  '0000000000000000000000000000',
  '0000000000000000000000000000',
  '0000000000000000000000000000',
  '0000000000000000000000000000',
  '0000000000001100000001000000',
  '0000000000101111000011000000',
  '0000000000001111111110100100',
  '0000000000010110011100011100',
  '0000000000011111111100001111',
  '0000000000011110000101110001',
  '0000000000001011111000111111',
  '0000000000011111110111101000',
  '0000000000000110010101111001',
  '0000000000000011111000011111',
  '0000000000000000011100101111',
  '0000000000000000001110111011',
  '0000000000000000000101101111',
  '0000000000000001001010111111',
  '0000000000000000000101111101',
  '0000000000010000000010111101',
  '0000000000100000000100111111',
  '0000000011000000000110011011',
  '0000000001100000000110111111',
  '0000000000111100110101111111',
  '0000000000111001001001111101',
  '0000000000111001111000111111',
  '0000001001101001101011101100',
  '0000000001111111111001111111',
  '0000000011111100110000011111',
  '0000000011101111100100101101',
  '0000000000011100100110111111',
];

function PixelPattern() {
  return (
    <svg
      className="tvs-pixel-pattern"
      viewBox="0 0 28 31"
      preserveAspectRatio="xMidYMin slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {PATTERN_ROWS.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#359280" />
          ) : null
        )
      )}
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M58,8 L10,8 L10,92 L58,92" fill="none" stroke="#211C18" strokeWidth="7" />
      <path
        d="M58,8 C72,8 78,16 76,26 C82,30 86,34 90,40 C84,42 80,44 78,48
           C84,52 88,56 90,60 C82,60 76,62 72,66 C76,72 74,80 64,84
           C70,88 64,92 58,92 Z"
        fill="#211C18"
      />
      <rect x="44" y="26" width="9" height="9" fill="#E8E3DC" />
      <rect x="40" y="58" width="6" height="6" fill="#E8E3DC" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      {!visible && (
        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="1.6" />
      )}
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 10.2v3.84h5.34c-.23 1.38-1.66 4.04-5.34 4.04-3.21 0-5.84-2.66-5.84-5.93s2.63-5.93 5.84-5.93c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.66 3.6 14.56 2.6 12 2.6 6.98 2.6 2.9 6.7 2.9 11.71s4.08 9.11 9.1 9.11c5.25 0 8.74-3.69 8.74-8.89 0-.6-.07-1.05-.15-1.5H12Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.05 12.54c-.03-2.06 1.68-3.05 1.76-3.1-.96-1.4-2.45-1.59-2.98-1.61-1.36-.14-2.65.79-3.34.79-.7 0-1.76-.77-2.89-.75-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.09 8.76.72 1.05 1.58 2.23 2.71 2.19 1.08-.04 1.49-.7 2.8-.7 1.3 0 1.68.7 2.83.68 1.17-.02 1.91-1.06 2.63-2.12.83-1.21 1.17-2.38 1.19-2.45-.03-.01-2.18-.84-2.2-3.27ZM14.7 5.5c.6-.73 1.01-1.74.9-2.75-.86.04-1.92.59-2.55 1.31-.56.64-1.05 1.66-.92 2.64.96.08 1.95-.49 2.57-1.2Z"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────
const styles = `
  .tvs-page {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background: #E8E3DC;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  .tvs-left-panel {
    flex: 1 1 50%;
    min-width: 0;
    background: #E8E3DC;
    display: flex;
    flex-direction: column;
  }

  .tvs-left-panel-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 40px 64px 64px;
  }

  .tvs-logo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .tvs-logo-word {
    font-weight: 900;
    font-size: 30px;
    letter-spacing: -0.01em;
    color: #211C18;
    line-height: 1;
  }

  .tvs-form-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 150px;
  }

  .tvs-form-card {
    width: 100%;
    max-width: 460px;
  }

  .tvs-heading {
    font-family: Georgia, 'Times New Roman', Times, serif;
    font-weight: 400;
    font-size: 48px;
    line-height: 1.05;
    color: #211C18;
    margin: 0 0 14px;
  }

  .tvs-subtext {
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 17px;
    line-height: 1.55;
    color: #6B6560;
    margin: 0 0 26px;
  }

  /* ── Field: unfocused — dashed border, transparent background ── */
  .tvs-field {
    position: relative;
    border: 1.5px dashed #B8B0A5;
    background: transparent;
    padding: 4px 20px;
    margin-bottom: 12px;
    transition: border 0.15s ease, background 0.15s ease;
  }

  /* ── Field: focused — solid border, white fill (matches the image) ── */
  .tvs-field:focus-within {
    border: 1.5px solid #211C18;
    background: #FFFFFF;
  }

  /* Validation error border (overrides both states) */
  .tvs-field-error {
    border: 1.5px dashed #ef4444;
  }

  .tvs-field-error:focus-within {
    border: 1.5px solid #ef4444;
    background: #FFFFFF;
  }

  .tvs-field input {
    width: 100%;
    height: 58px;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 17px;
    color: #211C18;
  }

  .tvs-field input::placeholder {
    color: #A39C92;
  }

  .tvs-field input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .tvs-field-password input {
    padding-right: 34px;
  }

  .tvs-eye-btn {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #A39C92;
    display: flex;
    align-items: center;
  }

  /* Inline validation error text */
  .tvs-field-error-text {
    display: block;
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12.5px;
    color: #ef4444;
    margin: -8px 0 12px;
    letter-spacing: 0.02em;
  }

  /* Django backend error box */
  .tvs-error-box {
    background: rgba(239, 68, 68, 0.07);
    border: 1.5px dashed #ef4444;
    padding: 10px 16px;
    margin-bottom: 14px;
  }

  .tvs-error-box p {
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12.5px;
    color: #ef4444;
    margin: 0;
    letter-spacing: 0.02em;
  }

  .tvs-forgot-link {
    display: block;
    text-align: center;
    margin: 18px 0 32px;
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12.5px;
    letter-spacing: 0.06em;
    color: #6B6560;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .tvs-forgot-link:hover {
    color: #211C18;
  }

  /* ── Buttons ── */
  .tvs-btn {
    width: 100%;
    height: 54px;
    border-radius: 2px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 18px;
    box-shadow: 4px 4px 0 0 #211C18;
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  }

  .tvs-btn:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0 0 #211C18;
  }

  .tvs-btn:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 0 #211C18;
  }

  .tvs-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .tvs-btn-primary {
    background: #0FAE9C;
    border: none;
    color: #EAFBF7;
  }

  .tvs-btn-primary:hover:not(:disabled) {
    background: #0C9686;
  }

  .tvs-btn-outline {
    background: #FBF7F4;
    border: 1.5px solid #211C18;
    color: #211C18;
  }

  .tvs-google-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tvs-footer-text {
    margin-top: 130px;
    text-align: center;
    width: 100%;
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 13px;
    letter-spacing: 0.05em;
    color: #79716A;
  }

  .tvs-signup-link {
    color: #C2455F;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  /* ── Right panel ── */
  .tvs-right-panel {
    flex: 1 1 50%;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #3B383C 0%, #322F33 100%);
  }

  .tvs-pixel-pattern {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .tvs-page { flex-direction: column; }
    .tvs-right-panel { order: -1; height: 220px; flex: none; }
    .tvs-left-panel-inner { padding: 24px 24px 48px; }
    .tvs-form-area { padding-top: 48px; }
    .tvs-heading { font-size: 38px; }
    .tvs-footer-text { margin-top: 64px; }
  }

  @media (max-width: 480px) {
    .tvs-left-panel-inner { padding: 20px 18px 40px; }
    .tvs-logo-word { font-size: 24px; }
    .tvs-heading { font-size: 32px; }
    .tvs-subtext { font-size: 15px; }
    .tvs-field input { height: 50px; font-size: 15px; }
    .tvs-btn { height: 48px; font-size: 12.5px; }
  }
`;

// ──────────────────────────────────────────────────────────────────────────
// LoginPage
// ──────────────────────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: authLoading, error: reduxAuthError } = useSelector(
    (state) => state.auth
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        const result = await dispatch(loginUser(values));
        if (loginUser.fulfilled.match(result)) {
          if (!result.payload?.user) {
            await dispatch(fetchUser());
          }
          navigate("/home");
        }
      } catch (err) {
        setStatus({ error: "Login failed" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const isSubmitting = formik.isSubmitting || authLoading;

  const displayErrorRaw = formik.status?.error || reduxAuthError;
  let parsedError = null;
  if (displayErrorRaw) {
    if (typeof displayErrorRaw === "string") {
      parsedError = displayErrorRaw;
    } else if (typeof displayErrorRaw === "object") {
      parsedError =
        displayErrorRaw.non_field_errors?.[0] ||
        displayErrorRaw.detail ||
        displayErrorRaw.error ||
        (Object.values(displayErrorRaw)[0] &&
          Object.values(displayErrorRaw)[0][0]) ||
        "Login failed. Please check your credentials.";
    }
  }

  return (
    <div className="tvs-page">
      <style>{styles}</style>

      {/* ───────── Left panel ───────── */}
      <div className="tvs-left-panel">
        <div className="tvs-left-panel-inner">

          <div className="tvs-logo-row">
            <LogoIcon />
            <span className="tvs-logo-word">TAVUS</span>
          </div>

          <div className="tvs-form-area">
            <div className="tvs-form-card">
              <h1 className="tvs-heading">Log in</h1>
              <p className="tvs-subtext">
                Enter your email and password below to log in
                <br />
                to your account
              </p>

              {/* ── Email ── */}
              <div
                className={`tvs-field${
                  formik.touched.email && formik.errors.email ? " tvs-field-error" : ""
                }`}
              >
                <input
                  type="email"
                  placeholder="Email"
                  disabled={isSubmitting}
                  {...formik.getFieldProps("email")}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <span className="tvs-field-error-text">{formik.errors.email}</span>
              )}

              {/* ── Password ── */}
              <div
                className={`tvs-field tvs-field-password${
                  formik.touched.password && formik.errors.password ? " tvs-field-error" : ""
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  disabled={isSubmitting}
                  {...formik.getFieldProps("password")}
                />
                <button
                  type="button"
                  className="tvs-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="tvs-field-error-text">{formik.errors.password}</span>
              )}

              {/* ── Backend error ── */}
              {parsedError && (
                <div className="tvs-error-box">
                  <p>{parsedError}</p>
                </div>
              )}

              <a
                href="#"
                className="tvs-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isSubmitting) navigate("/forgot-password");
                }}
              >
                FORGOT YOUR PASSWORD?
              </a>

              <button
                type="button"
                onClick={formik.handleSubmit}
                disabled={isSubmitting}
                className="tvs-btn tvs-btn-primary"
              >
                {isSubmitting ? "SIGNING IN..." : "LOG IN"}
              </button>

              <GoogleLoginButton disabled={isSubmitting} />
            </div>

            <p className="tvs-footer-text">
              DON&apos;T HAVE AN ACCOUNT?{" "}
              <a
                href="#"
                className="tvs-signup-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isSubmitting) navigate("/signup");
                }}
              >
                SIGN UP
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ───────── Right panel ───────── */}
      <div className="tvs-right-panel">
        <PixelPattern />
      </div>
    </div>
  );
}

export default LoginPage;