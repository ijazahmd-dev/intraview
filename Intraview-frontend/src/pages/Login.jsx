


// // Login.jsx — New visual design + real authentication logic

// import React, { useState } from 'react';
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { loginUser, fetchUser } from "../authentication/authSlice.js";
// import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

// // ──────────────────────────────────────────────────────────────────────────
// // Pixel pattern data  (unchanged)
// // ──────────────────────────────────────────────────────────────────────────
// const PATTERN_ROWS = [
//   '000000000000000000000000000',
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
//       <path d="M58,8 L10,8 L10,92 L58,92" fill="none" stroke="#211C18" strokeWidth="7" />
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
//       <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" />
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
// // Styles
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

//   /* ── Field: unfocused — dashed border, transparent background ── */
//   .tvs-field {
//     position: relative;
//     border: 1.5px dashed #B8B0A5;
//     background: transparent;
//     padding: 4px 20px;
//     margin-bottom: 12px;
//     transition: border 0.15s ease, background 0.15s ease;
//   }

//   /* ── Field: focused — solid border, white fill (matches the image) ── */
//   .tvs-field:focus-within {
//     border: 1.5px solid #211C18;
//     background: #FFFFFF;
//   }

//   /* Validation error border (overrides both states) */
//   .tvs-field-error {
//     border: 1.5px dashed #ef4444;
//   }

//   .tvs-field-error:focus-within {
//     border: 1.5px solid #ef4444;
//     background: #FFFFFF;
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

//   /* Inline validation error text */
//   .tvs-field-error-text {
//     display: block;
//     font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
//     font-size: 12.5px;
//     color: #ef4444;
//     margin: -8px 0 12px;
//     letter-spacing: 0.02em;
//   }

//   /* Django backend error box */
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

//   .tvs-btn:hover:not(:disabled) {
//     transform: translate(-1px, -1px);
//     box-shadow: 5px 5px 0 0 #211C18;
//   }

//   .tvs-btn:active:not(:disabled) {
//     transform: translate(2px, 2px);
//     box-shadow: 2px 2px 0 0 #211C18;
//   }

//   .tvs-btn:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   .tvs-btn-primary {
//     background: #0FAE9C;
//     border: none;
//     color: #EAFBF7;
//   }

//   .tvs-btn-primary:hover:not(:disabled) {
//     background: #0C9686;
//   }

//   .tvs-btn-outline {
//     background: #FBF7F4;
//     border: 1.5px solid #211C18;
//     color: #211C18;
//   }

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
// // ──────────────────────────────────────────────────────────────────────────
// function LoginPage() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { loading: authLoading, error: reduxAuthError } = useSelector(
//     (state) => state.auth
//   );
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

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
//         setStatus({ error: "Login failed" });
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   const isSubmitting = formik.isSubmitting || authLoading;

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

//   return (
//     <div className="tvs-page">
//       <style>{styles}</style>

//       {/* ───────── Left panel ───────── */}
//       <div className="tvs-left-panel">
//         <div className="tvs-left-panel-inner" style={{ position: 'relative' }}>

//           {/* Centered logo positioned absolutely to push it up and reduce the gap below */}
//           <div className="w-full flex justify-center" style={{ position: 'absolute', top: '20px', left: 0, zIndex: 10, pointerEvents: 'none' }}>
//             <img
//               src="https://res.cloudinary.com/dpn42vumz/image/upload/v1781793772/ChatGPT_Image_Jun_18_2026_08_08_24_PM_ivbob8.png"
//               alt="IntraView Logo"
//               style={{ height: '250px', width: 'auto', objectFit: 'contain', pointerEvents: 'auto' }}
//             />
//           </div>

//           <div className="tvs-form-area" style={{ paddingTop: '250px' }}>
//             <div className="tvs-form-card" style={{ position: 'relative', zIndex: 20 }}>
//               <h1 className="tvs-heading text-center">Log in</h1>
//               <p className="tvs-subtext">
//                 Enter your email and password below to log in
//                 <br />
//                 to your account
//               </p>

//               {/* ── Email ── */}
//               <div
//                 className={`tvs-field${formik.touched.email && formik.errors.email ? " tvs-field-error" : ""
//                   }`}
//               >
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   disabled={isSubmitting}
//                   {...formik.getFieldProps("email")}
//                 />
//               </div>
//               {formik.touched.email && formik.errors.email && (
//                 <span className="tvs-field-error-text">{formik.errors.email}</span>
//               )}

//               {/* ── Password ── */}
//               <div
//                 className={`tvs-field tvs-field-password${formik.touched.password && formik.errors.password ? " tvs-field-error" : ""
//                   }`}
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
//                 <span className="tvs-field-error-text">{formik.errors.password}</span>
//               )}

//               {/* ── Backend error ── */}
//               {parsedError && (
//                 <div className="tvs-error-box">
//                   <p>{parsedError}</p>
//                 </div>
//               )}

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

//               <button
//                 type="button"
//                 onClick={formik.handleSubmit}
//                 disabled={isSubmitting}
//                 className="tvs-btn tvs-btn-primary"
//               >
//                 {isSubmitting ? "SIGNING IN..." : "LOG IN"}
//               </button>

//               <GoogleLoginButton disabled={isSubmitting} />
//             </div>

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

//       {/* ───────── Right panel ───────── */}
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
  '000000000000000000000000000',
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
    background: #f7f4ef;
    display: flex;
    flex-direction: column;
  }

  .tvs-left-panel-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 32px 50px 50px;
  }

  .tvs-logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .tvs-logo-word {
    font-weight: 900;
    font-size: 24px;
    letter-spacing: -0.01em;
    color: #211C18;
    line-height: 1;
  }

  .tvs-form-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 120px;
  }

  .tvs-form-card {
    width: 100%;
    max-width: 360px;
  }

  .tvs-heading {
    font-family: Georgia, 'Times New Roman', Times, serif;
    font-weight: 400;
    font-size: 38px;
    line-height: 1.05;
    color: #211C18;
    margin: 0 0 11px;
  }

  .tvs-subtext {
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 14px;
    line-height: 1.55;
    color: #6B6560;
    margin: 0 0 20px;
  }

  /* ── Field: unfocused — dashed border, transparent background ── */
  .tvs-field {
    position: relative;
    border: 1.5px dashed #B8B0A5;
    background: transparent;
    padding: 3px 16px;
    margin-bottom: 10px;
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
    height: 46px;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 14px;
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
    padding-right: 28px;
  }

  .tvs-eye-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 3px;
    cursor: pointer;
    color: #A39C92;
    display: flex;
    align-items: center;
  }

  /* Inline validation error text */
  .tvs-field-error-text {
    display: block;
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: #ef4444;
    margin: -6px 0 10px;
    letter-spacing: 0.02em;
  }

  /* Django backend error box */
  .tvs-error-box {
    background: rgba(239, 68, 68, 0.07);
    border: 1.5px dashed #ef4444;
    padding: 8px 12px;
    margin-bottom: 11px;
  }

  .tvs-error-box p {
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: #ef4444;
    margin: 0;
    letter-spacing: 0.02em;
  }

  .tvs-forgot-link {
    display: block;
    text-align: center;
    margin: 14px 0 25px;
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
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
    height: 44px;
    border-radius: 2px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 14px;
    box-shadow: 3px 3px 0 0 #211C18;
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  }

  .tvs-btn:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 0 #211C18;
  }

  .tvs-btn:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 0 #211C18;
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
    margin-top: 100px;
    text-align: center;
    width: 100%;
    font-family: 'Courier New', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
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
        <div className="tvs-left-panel-inner" style={{ position: 'relative' }}>

          {/* Centered logo positioned absolutely to push it up and reduce the gap below */}
          <div className="w-full flex justify-center" style={{ position: 'absolute', top: '16px', left: 0, zIndex: 10, pointerEvents: 'none' }}>
            <img
              src="https://res.cloudinary.com/dpn42vumz/image/upload/v1781793772/ChatGPT_Image_Jun_18_2026_08_08_24_PM_ivbob8.png"
              alt="IntraView Logo"
              style={{ height: '225px', width: 'auto', objectFit: 'contain', pointerEvents: 'auto' }}
            />
          </div>

          <div className="tvs-form-area" style={{ paddingTop: '220px' }}>
            <div className="tvs-form-card" style={{ position: 'relative', zIndex: 20 }}>
              <h1 className="tvs-heading text-center">Log in</h1>
              <p className="tvs-subtext">
                Enter your email and password below to log in
                to your account
              </p>

              {/* ── Email ── */}
              <div
                className={`tvs-field${formik.touched.email && formik.errors.email ? " tvs-field-error" : ""
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
                className={`tvs-field tvs-field-password${formik.touched.password && formik.errors.password ? " tvs-field-error" : ""
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