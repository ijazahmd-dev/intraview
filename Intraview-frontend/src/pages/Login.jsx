// // Login.jsx — Cohere-inspired design + existing authentication logic preserved
// // Design source: /home/ijaz/Documents/ijas/dashboard.cohere.com/welcome/login.html

// import React, { useState } from 'react';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { loginUser, fetchUser } from '../authentication/authSlice.js';
// import GoogleLoginButton from '../components/GoogleLoginButton.jsx';

// // ─────────────────────────────────────────────────────────────────────────────
// // Colour palette extracted from the Cohere dashboard CSS
// // ─────────────────────────────────────────────────────────────────────────────
// // green-50  : rgb(238, 240, 239)  →  #EEF0EF  (page background)
// // green-700 : rgb( 57,  89,  77)  →  #39594D  (primary brand)
// // green-800 : rgb( 43,  66,  57)  →  #2B4239
// // green-900 : rgb( 22,  33,  28)  →  #16211C
// // marble-100: rgb(250, 250, 250)  →  #FAFAFA   (input bg)
// // marble-400: rgb(224, 224, 224)  →  #E0E0E0   (card border)
// // marble-500: rgb(189, 189, 189)  →  #BDBDBD   (input border)
// // marble-300: rgb(238, 238, 238)  →  #EEEEEE
// // volcanic-900: rgb(33, 33, 33)   →  #212121   (main text)
// // volcanic-700: rgb(97, 97, 97)   →  #616161   (secondary text)

// // ─────────────────────────────────────────────────────────────────────────────
// // SVG: Cohere logo (replicated from HTML source)
// // ─────────────────────────────────────────────────────────────────────────────
// function CohereLogo() {
//   return (
//     <svg
//       viewBox="0 0 96 16"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       style={{ height: '16px', width: '96px' }}
//       aria-label="Cohere"
//     >
//       <path
//         d="M27.0165 15.9968C29.3932 15.9968 31.4732 14.8084 32.2955 12.4092C32.4552 11.9287 32.2262 11.6094 31.7699 11.6094H30.8782C30.4671 11.6094 30.193 11.7916 30.0091 12.1802C29.3013 13.5749 28.3177 14.0764 27.0842 14.0764C24.8897 14.0764 23.5417 12.5446 23.5417 9.98569C23.5417 7.42679 24.9365 5.89499 27.0375 5.89499C28.3177 5.89499 29.369 6.44321 30.0317 7.74604C30.2381 8.13464 30.488 8.31684 30.9008 8.31684H31.7925C32.2488 8.31684 32.4777 8.02015 32.3181 7.5848C31.3587 4.97914 29.2094 3.9746 27.0165 3.9746C23.703 3.9746 21.2344 6.42064 21.2344 9.98569C21.2344 13.5507 23.5885 15.9968 27.0165 15.9968ZM86.8226 8.93439C87.1193 6.99143 88.4447 5.78051 90.2506 5.78051C92.0565 5.78051 93.4045 7.01401 93.5641 8.93439H86.8226ZM90.3425 15.9968C92.4451 15.9968 94.5477 15.0148 95.5764 12.7977C95.8279 12.2721 95.599 11.9061 95.1427 11.9061H94.2978C93.8866 11.9061 93.6351 12.0883 93.4287 12.4543C92.7434 13.6652 91.555 14.1683 90.3441 14.1683C88.2641 14.1683 86.9161 12.751 86.7565 10.4436H95.1443C95.6006 10.4436 95.8989 10.1921 95.8989 9.71158C95.807 6.12395 93.477 3.97622 90.2538 3.97622C87.0306 3.97622 84.4717 6.30777 84.4717 9.9873C84.4717 13.6668 86.9629 15.9984 90.3457 15.9984L90.3425 15.9968ZM77.0417 10.284H77.7963C78.2526 10.284 78.5041 10.0325 78.5735 9.55195C79.0088 6.46417 80.8164 6.05462 82.7383 6.14653C83.1495 6.16588 83.4865 5.84984 83.4865 5.43707V4.72922C83.4865 4.2729 83.2575 3.99718 82.8012 3.9746C81.1001 3.91011 79.5829 4.4938 78.7057 6.14653C78.6573 6.23682 78.5219 6.21264 78.5106 6.11106L78.3687 4.86466C78.3236 4.40834 78.072 4.17938 77.6141 4.17938H74.1635C73.7604 4.17938 73.4315 4.5067 73.4315 4.91142V5.30001C73.4315 5.70311 73.7588 6.03205 74.1635 6.03205H75.5808C75.9839 6.03205 76.3129 6.35937 76.3129 6.76408V9.55195C76.3129 9.95505 76.6402 10.284 77.0449 10.284H77.0417ZM73.9571 15.7694H81.1098C81.5661 15.7694 81.8418 15.4953 81.8418 15.0374V14.6488C81.8418 14.1925 81.5677 13.9168 81.1098 13.9168H79.2813C78.825 13.9168 78.5493 13.6426 78.5493 13.1847V11.927C78.5493 11.4707 78.2752 11.195 77.8173 11.195H77.0401C76.5838 11.195 76.308 11.4691 76.308 11.927V13.1847C76.308 13.641 76.0339 13.9168 75.576 13.9168H73.9539C73.4976 13.9168 73.2219 14.1909 73.2219 14.6488V15.0374C73.2219 15.4937 73.496 15.7694 73.9539 15.7694H73.9571ZM62.9185 8.93601C63.2152 6.99305 64.5406 5.78212 66.3465 5.78212C68.1524 5.78212 69.5004 7.01562 69.6601 8.93601H62.9185ZM66.4384 15.9984C68.541 15.9984 70.6436 15.0164 71.6723 12.7994C71.9239 12.2737 71.6949 11.9077 71.2386 11.9077H70.3937C69.9825 11.9077 69.731 12.0899 69.5246 12.4559C68.8393 13.6668 67.651 14.1699 66.4401 14.1699C64.36 14.1699 63.0121 12.7526 62.8524 10.4452H71.2402C71.6965 10.4452 71.9948 10.1937 71.9948 9.71319C71.9029 6.12557 69.573 3.97783 66.3498 3.97783C63.1265 3.97783 60.5676 6.30938 60.5676 9.98891C60.5676 13.6684 63.0588 16 66.4417 16L66.4384 15.9984ZM39.9981 15.9984C43.426 15.9984 45.8721 13.4621 45.8721 9.9873C45.8721 6.51255 43.426 3.97622 39.9981 3.97622C36.5701 3.97622 34.124 6.55931 34.124 9.9873C34.124 10.7871 34.2611 11.6787 34.6722 12.6607C34.8786 13.1412 35.2672 13.2089 35.6784 12.9122L36.3411 12.4317C36.6845 12.1802 36.7748 11.8835 36.6604 11.4498C36.4782 10.879 36.4314 10.3759 36.4314 9.94215C36.4314 7.54288 37.8713 5.8966 39.9964 5.8966C42.1216 5.8966 43.5615 7.51869 43.5615 9.9873C43.5615 12.4559 42.1442 14.078 40.0416 14.078C39.3096 14.078 38.6243 13.9409 37.8019 13.3234C37.4585 13.0493 37.1392 13.0041 36.7732 13.2782L36.2701 13.6443C35.859 13.9409 35.8138 14.3521 36.2008 14.673C37.3892 15.6324 38.7597 15.9984 39.9948 15.9984H39.9981ZM48.7728 15.7694H49.5274C49.9305 15.7694 50.2595 15.4421 50.2595 15.0374V9.57614C50.2595 7.26877 51.493 5.8966 53.4133 5.8966C55.1499 5.8966 56.1561 7.03981 56.1561 9.1424V15.039C56.1561 15.4421 56.4834 15.771 56.8881 15.771H57.6653C58.0684 15.771 58.3973 15.4437 58.3973 15.039V8.77638C58.3973 5.69183 56.8204 3.97783 54.147 3.97783C52.3266 3.97783 51.2511 4.72277 50.4481 5.75955C50.3868 5.83856 50.2627 5.79502 50.2627 5.69666V0.732037C50.2579 0.32732 49.9305 0 49.5274 0H48.7728C48.3697 0 48.0408 0.32732 48.0408 0.732037V15.0374C48.0408 15.4405 48.3681 15.7694 48.7728 15.7694Z"
//         fill="rgb(57, 89, 77)"
//       />
//       <path
//         fillRule="evenodd"
//         clipRule="evenodd"
//         d="M5.18375 9.52649C5.6144 9.52649 6.47106 9.50284 7.65517 9.01533C9.03504 8.44723 11.7804 7.41592 13.7607 6.35661C15.1458 5.6157 15.7529 4.63579 15.7529 3.31618C15.7529 1.48471 14.2682 0 12.4368 0H4.76324C2.13257 0 0 2.13257 0 4.76324C0 7.39392 1.99672 9.52649 5.18375 9.52649Z"
//         fill="rgb(57, 89, 77)"
//       />
//       <path
//         fillRule="evenodd"
//         clipRule="evenodd"
//         d="M6.48047 12.8071C6.48047 11.5176 7.25678 10.3549 8.44779 9.86059L10.8644 8.85769C13.3087 7.84323 15.9991 9.63954 15.9991 12.2861C15.9991 14.3365 14.3366 15.9985 12.2862 15.998L9.6698 15.9973C7.90823 15.9968 6.48047 14.5686 6.48047 12.8071Z"
//         fill="rgb(209, 142, 226)"
//       />
//       <path
//         d="M2.74588 10.1523H2.74583C1.22935 10.1523 0 11.3817 0 12.8982V13.2538C0 14.7703 1.22935 15.9996 2.74583 15.9996H2.74588C4.26235 15.9996 5.4917 14.7703 5.4917 13.2538V12.8982C5.4917 11.3817 4.26235 10.1523 2.74588 10.1523Z"
//         fill="rgb(255, 119, 89)"
//       />
//     </svg>
//   );
// }


// // ─────────────────────────────────────────────────────────────────────────────
// // SVG: GitHub icon (from the design HTML source)
// // ─────────────────────────────────────────────────────────────────────────────
// function GitHubIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
//       <path
//         fillRule="evenodd"
//         clipRule="evenodd"
//         d="M8 0C3.58011 0 0 3.67017 0 8.20125C0 11.8261 2.29343 14.8972 5.47084 15.9846C5.86863 16.0602 6.01596 15.8084 6.01596 15.5869C6.01596 15.3906 6.01105 14.877 6.00614 14.1923C3.78146 14.6857 3.31001 13.0948 3.31001 13.0948C2.94659 12.1483 2.42112 11.8966 2.42112 11.8966C1.69429 11.3881 2.47514 11.3982 2.47514 11.3982C3.27563 11.4586 3.70288 12.244 3.70288 12.244C4.41498 13.4976 5.57397 13.1351 6.03069 12.9236C6.10436 12.395 6.31062 12.0325 6.53653 11.8261C4.75875 11.6197 2.89257 10.9149 2.89257 7.77332C2.89257 6.87717 3.20196 6.14716 3.71762 5.57323C3.63413 5.36681 3.35912 4.53108 3.79619 3.40334C3.79619 3.40334 4.469 3.18182 5.99632 4.24411C6.63474 4.06287 7.31737 3.97224 8 3.96721C8.67772 3.96721 9.36525 4.06287 10.0037 4.24411C11.531 3.18182 12.2038 3.40334 12.2038 3.40334C12.6409 4.53108 12.3659 5.36681 12.2824 5.57323C12.7931 6.14716 13.1025 6.87717 13.1025 7.77332C13.1025 10.9249 11.2314 11.6147 9.44874 11.8211C9.73358 12.0728 9.99386 12.5763 9.99386 13.3415C9.99386 14.439 9.98404 15.3201 9.98404 15.5919C9.98404 15.8135 10.1265 16.0652 10.5341 15.9846C13.7115 14.8972 16 11.8261 16 8.20628C16 3.67017 12.4199 0 8 0Z"
//         fill="currentColor"
//       />
//     </svg>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SVG: Eye icons for password show/hide
// // ─────────────────────────────────────────────────────────────────────────────
// function EyeOpenIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//       <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
//       <circle cx="12" cy="12" r="3" />
//     </svg>
//   );
// }

// function EyeClosedIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//       <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
//       <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
//       <line x1="1" y1="1" x2="23" y2="23" />
//     </svg>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SVG: Arrow-right icon used inside the Login button
// // ─────────────────────────────────────────────────────────────────────────────
// function ArrowRightIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//       <polyline points="9 18 15 12 9 6" />
//     </svg>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Scoped CSS — mirrors the Cohere dashboard design faithfully.
// // All class names are prefixed with "clp-" (Cohere Login Page) to avoid
// // collisions with any global styles already in the project.
// // ─────────────────────────────────────────────────────────────────────────────
// const PAGE_STYLES = `
//   /* ── Google Fonts ── */
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

//   /* ── Page shell ── */
//   .clp-page {
//     position: relative;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     min-height: 100vh;
//     width: 100%;
//     background-color: rgb(238, 240, 239);
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//     overflow-y: auto;
//     padding: 80px 16px 24px;
//     box-sizing: border-box;
//   }

//   /* ── Cell background — contain default, cover at ≥1024px ── */
//   .clp-cell-bg {
//     position: fixed;
//     inset: 0;
//     z-index: 0;
//     background-image: url('/kycCellBackground.png');
//     background-size: contain;
//     background-repeat: no-repeat;
//     background-position: center;
//     pointer-events: none;
//   }
//   @media (min-width: 1024px) {
//     .clp-cell-bg { background-size: cover; }
//   }

//   /* ── Fixed top nav ── */
//   .clp-nav {
//     position: fixed;
//     top: 0;
//     left: 0;
//     right: 0;
//     z-index: 20;
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     padding: 24px 28px;
//   }
//   .clp-nav-logo {
//     display: flex;
//     align-items: center;
//     text-decoration: none;
//     cursor: default;
//   }
//   .clp-nav-signup {
//     font-size: 1rem;
//     font-weight: 400;
//     color: rgb(57, 89, 77);
//     text-transform: capitalize;
//     line-height: 1.5;
//     letter-spacing: 0;
//     border-bottom: 1px solid transparent;
//     transition: color 0.15s ease, border-color 0.15s ease;
//     cursor: pointer;
//     background: none;
//     border-top: none;
//     border-left: none;
//     border-right: none;
//     padding: 0;
//   }
//   .clp-nav-signup:hover {
//     color: rgb(22, 33, 28);
//     border-bottom-color: rgb(22, 33, 28);
//   }

//   /* ── Card — p-10 = 40px, rounded-lg, border marble-400, bg-white ── */
//   .clp-card {
//     position: relative;
//     z-index: 10;
//     display: flex;
//     flex-direction: column;
//     width: 100%;
//     max-width: 448px;
//     border-radius: 8px;
//     border: 1px solid rgb(224, 224, 224);
//     background: #ffffff;
//     padding: 32px;
//     box-sizing: border-box;
//     margin-top: 0;
//     box-shadow: 0 4px 12px rgba(0,0,0,0.05);
//   }

//   /* ── Heading — text-h3-m = 1.75rem, font-variable font-[420] ── */
//   .clp-heading {
//     font-size: 1.75rem;
//     font-weight: 400;
//     line-height: 1.2;
//     color: rgb(33, 33, 33);
//     margin: 0;
//     text-align: center;
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//     letter-spacing: -0.01em;
//   }

//   /* ── OAuth row — mt-10 = 40px, sm:h-10, sm:flex-row ── */
//   .clp-oauth-row {
//     display: flex;
//     flex-direction: row;
//     gap: 4px;
//     width: 100%;
//     margin-top: 40px;
//     height: 40px;
//     align-items: stretch;
//   }
//   @media (max-width: 540px) {
//     .clp-oauth-row { flex-direction: column; height: auto; }
//   }

//   /* ── OAuth button — !rounded=4px, border #dadce0, bg-white, h-10, flex-auto ── */
//   .clp-oauth-btn {
//     display: inline-flex;
//     align-items: center;
//     justify-content: center;
//     flex: 1;
//     gap: 5px;
//     height: 40px;
//     padding: 8px 8px;
//     border-radius: 4px;
//     border: 1px solid rgb(218, 220, 224);
//     background: #ffffff;
//     color: rgb(33, 33, 33);
//     font-size: 0.875rem;
//     font-weight: 400;
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//     line-height: 1.5;
//     letter-spacing: 0.0025em;
//     cursor: pointer;
//     white-space: nowrap;
//     transition: background 0.15s ease, border-color 0.15s ease;
//     box-sizing: border-box;
//     min-width: 0;
//     overflow: hidden;
//   }
//   .clp-oauth-btn:hover:not(:disabled) {
//     background: rgb(245, 245, 245);
//     border-color: rgb(117, 117, 117);
//   }
//   .clp-oauth-btn:active:not(:disabled) {
//     background: rgb(250, 250, 250);
//     border-color: rgb(33, 33, 33);
//   }
//   .clp-oauth-btn:disabled { opacity: 0.55; cursor: not-allowed; }

//   /* ── Form — mt-10 = 40px ── */
//   .clp-form {
//     display: flex;
//     flex-direction: column;
//     margin-top: 40px;
//     width: 100%;
//   }

//   /* ── Stacked input group ── */
//   .clp-input-wrap { position: relative; width: 100%; }
//   .clp-input-wrap--top input {
//     border-radius: 8px 8px 0 0;
//     border-bottom-width: 0;
//   }
//   .clp-input-wrap--bottom {
//     margin-bottom: 8px;
//   }
//   .clp-input-wrap--bottom input {
//     border-radius: 0 0 8px 8px;
//     border-top-width: 1px;
//     padding-right: 40px;
//   }

//   /* Floating label — pl-3 pt-2.5 = 12px 10px, text-label = 0.75rem, uppercase, font-code */
//   .clp-input-label {
//     position: absolute;
//     top: 0;
//     left: 0;
//     z-index: 10;
//     display: flex;
//     flex-direction: column;
//     padding: 10px 12px 0;
//     pointer-events: none;
//   }
//   .clp-input-label-text {
//     font-size: 0.75rem;
//     font-weight: 500;
//     letter-spacing: 0.08em;
//     text-transform: uppercase;
//     color: rgb(33, 33, 33);
//     font-family: 'Inter', ui-monospace, Consolas, monospace;
//     line-height: 1.4;
//   }

//   /* Input — bg-marble-100, border-marble-500, pt-7 pb-2.5 = 28px 10px */
//   .clp-input {
//     display: block;
//     width: 100%;
//     background: rgb(250, 250, 250);
//     border: 1px solid rgb(189, 189, 189);
//     padding: 28px 12px 10px;
//     font-size: 0.875rem;
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//     color: rgb(33, 33, 33);
//     outline: none;
//     box-sizing: border-box;
//     transition: border-color 0.15s ease, box-shadow 0.15s ease;
//     -webkit-appearance: none;
//   }
//   .clp-input::placeholder { color: rgb(189, 189, 189); }
//   .clp-input:focus {
//     border-color: rgb(57, 89, 77);
//     box-shadow: 0 0 0 1px rgb(57, 89, 77);
//     position: relative;
//     z-index: 5;
//     background: #ffffff;
//   }
//   .clp-input:disabled { color: rgb(97, 97, 97); cursor: not-allowed; }
//   .clp-input--error { border-color: #ef4444 !important; box-shadow: 0 0 0 1px #ef4444 !important; }
//   .clp-input--error:focus { border-color: #ef4444 !important; box-shadow: 0 0 0 1px #ef4444 !important; }

//   /* Eye toggle — right-3 bottom-3.5 */
//   .clp-eye-btn {
//     position: absolute;
//     right: 12px;
//     bottom: 14px;
//     background: none;
//     border: none;
//     padding: 2px;
//     cursor: pointer;
//     color: rgb(97, 97, 97);
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     z-index: 10;
//     transition: color 0.12s ease;
//   }
//   .clp-eye-btn:hover { color: rgb(33, 33, 33); }

//   /* Validation errors */
//   .clp-error-text {
//     font-size: 0.75rem;
//     color: #ef4444;
//     margin: 2px 0 6px 2px;
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//     letter-spacing: 0.01em;
//     line-height: 1.4;
//   }
//   .clp-error-box {
//     background: rgba(239, 68, 68, 0.06);
//     border: 1px solid #ef4444;
//     border-radius: 6px;
//     padding: 10px 14px;
//     margin-bottom: 12px;
//   }
//   .clp-error-box p {
//     font-size: 0.8125rem;
//     color: #ef4444;
//     margin: 0;
//     line-height: 1.5;
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//   }

//   /* Forgot password — text-p-lg = 1rem, green, self-end */
//   .clp-forgot {
//     display: flex;
//     width: fit-content;
//     align-self: flex-end;
//     font-size: 1rem;
//     font-weight: 400;
//     color: rgb(57, 89, 77);
//     line-height: 1.5;
//     letter-spacing: 0;
//     border-bottom: 1px solid transparent;
//     transition: color 0.15s ease, border-color 0.15s ease;
//     background: none;
//     border-top: none;
//     border-left: none;
//     border-right: none;
//     cursor: pointer;
//     padding: 0;
//     margin-top: 0;
//   }
//   .clp-forgot:hover {
//     color: rgb(22, 33, 28);
//     border-bottom-color: rgb(22, 33, 28);
//   }

//   /* Submit — mt-10 = 40px, Cohere cell button */
//   .clp-submit-wrap {
//     margin-top: 40px;
//     width: 100%;
//     display: flex;
//     justify-content: center;
//   }
//   .clp-cell-btn {
//     display: inline-flex;
//     align-items: stretch;
//     height: 40px;
//     cursor: pointer;
//     background: none;
//     border: none;
//     padding: 0;
//     min-width: 160px;
//     transition: filter 0.15s ease, opacity 0.15s ease;
//   }
//   .clp-cell-btn:disabled { opacity: 0.55; cursor: not-allowed; }
//   .clp-cell-btn:hover:not(:disabled) { filter: brightness(0.88); }
//   .clp-cell-btn:active:not(:disabled) { filter: brightness(0.78); }

//   .clp-cell-l {
//     width: 12px;
//     background: rgb(57, 89, 77);
//     border-radius: 6px 0 0 6px;
//     flex-shrink: 0;
//     margin-right: -2px;
//   }
//   .clp-cell-mid {
//     flex: 1;
//     background: rgb(57, 89, 77);
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding: 0 10px;
//     color: #ffffff;
//     font-size: 0.875rem;
//     font-weight: 500;
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//     letter-spacing: 0.0025em;
//     line-height: 1.5;
//     white-space: nowrap;
//   }
//   .clp-cell-skew {
//     width: 24px;
//     background: rgb(57, 89, 77);
//     transform: skewX(-21deg);
//     border-radius: 0 10px 4px 0;
//     flex-shrink: 0;
//     margin-right: -2px;
//   }
//   /* arrow cap */
//   .clp-cell-arrow {
//     width: 36px;
//     background: rgb(57, 89, 77);
//     border-radius: 0 6px 6px 0;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     color: #ffffff;
//     flex-shrink: 0;
//     margin-left: -10px;
//   }

//   /* ── Terms text ── */
//   .clp-terms {
//     margin-top: 20px;
//     font-size: 0.875rem;
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//     color: rgb(33, 33, 33);
//     line-height: 1.5;
//     letter-spacing: 0.0025em;
//   }
//   .clp-terms a {
//     color: rgb(57, 89, 77);
//     text-decoration: underline;
//     transition: color 0.15s ease;
//   }
//   .clp-terms a:hover { color: rgb(22, 33, 28); }

//   /* ── "New user? Sign up" footer ── */
//   .clp-signup-row {
//     margin-top: 40px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 4px;
//     font-size: 0.875rem;
//     font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
//     color: rgb(97, 97, 97);
//     line-height: 1.5;
//     letter-spacing: 0.0025em;
//   }
//   .clp-signup-link {
//     color: rgb(57, 89, 77);
//     text-decoration: none;
//     border-bottom: 1px solid transparent;
//     transition: color 0.15s ease, border-color 0.15s ease;
//     background: none;
//     border-top: none;
//     border-left: none;
//     border-right: none;
//     cursor: pointer;
//     padding: 0;
//     font-size: inherit;
//     font-family: inherit;
//   }
//   .clp-signup-link:hover {
//     color: rgb(22, 33, 28);
//     border-bottom-color: rgb(22, 33, 28);
//   }

//   /* ── Google SDK wrapper override ── */
//   .clp-google-sdk-wrap {
//     display: flex;
//     justify-content: center;
//     width: 100%;
//   }

//   /* ── Responsive ── */
//   @media (max-width: 520px) {
//     .clp-card {
//       padding: 28px 20px;
//       border-radius: 6px;
//       margin-top: 72px;
//     }
//     .clp-heading { font-size: 1.4rem; }
//     .clp-nav { padding: 16px 18px; }
//   }
// `;

// // ─────────────────────────────────────────────────────────────────────────────
// // LoginPage Component
// // ─────────────────────────────────────────────────────────────────────────────
// function LoginPage() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { loading: authLoading, error: reduxAuthError } = useSelector(
//     (state) => state.auth
//   );
//   const [showPassword, setShowPassword] = useState(false);

//   // ── Formik setup (unchanged logic) ───────────────────────────────────────
//   const formik = useFormik({
//     initialValues: {
//       email: '',
//       password: '',
//     },
//     validationSchema: Yup.object({
//       email: Yup.string().email('Invalid email').required('Required'),
//       password: Yup.string().required('Password is required'),
//     }),
//     onSubmit: async (values, { setSubmitting, setStatus }) => {
//       try {
//         const result = await dispatch(loginUser(values));
//         if (loginUser.fulfilled.match(result)) {
//           if (!result.payload?.user) {
//             await dispatch(fetchUser());
//           }
//           navigate('/home');
//         }
//       } catch (err) {
//         setStatus({ error: 'Login failed' });
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   const isSubmitting = formik.isSubmitting || authLoading;

//   // ── Backend error parsing (unchanged logic) ───────────────────────────────
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
//         (Object.values(displayErrorRaw)[0] &&
//           Object.values(displayErrorRaw)[0][0]) ||
//         'Login failed. Please check your credentials.';
//     }
//   }

//   // ── Email field error class ───────────────────────────────────────────────
//   const emailErrorClass =
//     formik.touched.email && formik.errors.email ? ' clp-input--error' : '';
//   const passwordErrorClass =
//     formik.touched.password && formik.errors.password ? ' clp-input--error' : '';

//   return (
//     <div className="clp-page">
//       {/* ── Injected scoped styles ── */}
//       <style>{PAGE_STYLES}</style>

//       {/* ── Decorative cell background ── */}
//       <div className="clp-cell-bg" aria-hidden="true" />

//       {/* ── Top navigation bar ── */}
//       <nav className="clp-nav" aria-label="Site navigation">
//         <span className="clp-nav-logo" aria-label="Cohere">
//           <CohereLogo />
//         </span>
//         <button
//           type="button"
//           className="clp-nav-signup"
//           onClick={() => { if (!isSubmitting) navigate('/signup'); }}
//           aria-label="Go to sign up"
//         >
//           Sign up
//         </button>
//       </nav>

//       {/* ── Login card ── */}
//       <div className="clp-card" role="main">

//         {/* Heading */}
//         <h1 className="clp-heading">Log in</h1>

//         {/* ── OAuth buttons row ── */}
//         <div className="clp-oauth-row">

//           {/* Google — Cohere-styled button wrapping the official Google SDK */}
//           <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
//             <GoogleLoginButton disabled={isSubmitting} variant="cohere" />
//           </div>

//           {/* GitHub — UI only, functionality preserved as-is */}
//           <button
//             type="button"
//             className="clp-oauth-btn"
//             disabled={isSubmitting}
//             aria-label="Continue with GitHub"
//             style={{ flex: 1 }}
//           >
//             <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
//               <GitHubIcon />
//             </div>
//             <span>Continue with Github</span>
//           </button>
//         </div>

//         {/* ── Email / Password form ── */}
//         <form
//           className="clp-form"
//           onSubmit={formik.handleSubmit}
//           noValidate
//         >
//           {/* ── Email field ── */}
//           <div className="clp-input-wrap clp-input-wrap--top">
//             <label className="clp-input-label" htmlFor="clp-email">
//               <div className="clp-input-label-text">Email</div>
//             </label>
//             <input
//               id="clp-email"
//               type="email"
//               placeholder="yourname@email.com"
//               spellCheck={false}
//               autoComplete="off"
//               className={`clp-input${emailErrorClass}`}
//               disabled={isSubmitting}
//               {...formik.getFieldProps('email')}
//             />
//           </div>
//           {formik.touched.email && formik.errors.email && (
//             <span className="clp-error-text" role="alert">
//               {formik.errors.email}
//             </span>
//           )}

//           {/* ── Password field ── */}
//           <div className="clp-input-wrap clp-input-wrap--bottom">
//             <label className="clp-input-label" htmlFor="clp-password">
//               <div className="clp-input-label-text">Password</div>
//             </label>
//             <input
//               id="clp-password"
//               type={showPassword ? 'text' : 'password'}
//               placeholder="••••••••••••"
//               spellCheck={false}
//               autoComplete="off"
//               className={`clp-input${passwordErrorClass}`}
//               disabled={isSubmitting}
//               {...formik.getFieldProps('password')}
//             />
//             <button
//               type="button"
//               className="clp-eye-btn"
//               onClick={() => setShowPassword((v) => !v)}
//               aria-label={showPassword ? 'Hide password' : 'Show password'}
//               tabIndex={-1}
//             >
//               {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
//             </button>
//           </div>
//           {formik.touched.password && formik.errors.password && (
//             <span className="clp-error-text" role="alert">
//               {formik.errors.password}
//             </span>
//           )}

//           {/* ── Backend error box ── */}
//           {parsedError && (
//             <div className="clp-error-box" role="alert">
//               <p>{parsedError}</p>
//             </div>
//           )}

//           {/* ── Forgot password link ── */}
//           <button
//             type="button"
//             className="clp-forgot"
//             onClick={() => { if (!isSubmitting) navigate('/forgot-password'); }}
//             disabled={isSubmitting}
//           >
//             Forgot Password
//           </button>

//           {/* ── Submit button ("cell" design from Cohere) ── */}
//           <div className="clp-submit-wrap">
//             <button
//               type="submit"
//               className="clp-cell-btn"
//               disabled={isSubmitting}
//               aria-label={isSubmitting ? 'Signing in…' : 'Log in'}
//             >
//               {/* left rounded cap */}
//               <span className="clp-cell-l" />
//               {/* main label */}
//               <span className="clp-cell-mid">
//                 {isSubmitting ? 'Signing in…' : 'Log in'}
//               </span>
//               {/* skewed separator */}
//               <span className="clp-cell-skew" />
//               {/* arrow icon cap */}
//               <span className="clp-cell-arrow">
//                 <ArrowRightIcon />
//               </span>
//             </button>
//           </div>
//         </form>

//         {/* ── Terms ── */}
//         <p className="clp-terms">
//           By signing up, you agree to the{' '}
//           <a
//             href="https://cohere.com/terms-of-use"
//             target="_blank"
//             rel="noreferrer"
//           >
//             Terms of Use
//           </a>{' '}
//           and{' '}
//           <a
//             href="https://cohere.com/privacy"
//             target="_blank"
//             rel="noreferrer"
//           >
//             Privacy Policy
//           </a>.
//         </p>

//         {/* ── Sign up footer ── */}
//         <div className="clp-signup-row">
//           <span>New user?</span>
//           <button
//             type="button"
//             className="clp-signup-link"
//             onClick={() => { if (!isSubmitting) navigate('/signup'); }}
//             disabled={isSubmitting}
//           >
//             Sign up
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;





















// Login.jsx — accurate Cohere dashboard login recreation
import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchUser } from '../authentication/authSlice.js';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';
import { signup, checkAvailability } from '../api/authApi';
import OtpModal from '../components/OtpModal';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { checkPasswordStrength } from '../utils/passwordStrength';
import toaster from '../utils/toaster';

const LOGO_URL = "https://res.cloudinary.com/dpn42vumz/image/upload/v1790803589/7a01858e-5b2d-420e-b5da-6722ef1f99d90000000000_injfdo.png";

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58011 0 0 3.67017 0 8.20125C0 11.8261 2.29343 14.8972 5.47084 15.9846C5.86863 16.0602 6.01596 15.8084 6.01596 15.5869C6.01596 15.3906 6.01105 14.877 6.00614 14.1923C3.78146 14.6857 3.31001 13.0948 3.31001 13.0948C2.94659 12.1483 2.42112 11.8966 2.42112 11.8966C1.69429 11.3881 2.47514 11.3982 2.47514 11.3982C3.27563 11.4586 3.70288 12.244 3.70288 12.244C4.41498 13.4976 5.57397 13.1351 6.03069 12.9236C6.10436 12.395 6.31062 12.0325 6.53653 11.8261C4.75875 11.6197 2.89257 10.9149 2.89257 7.77332C2.89257 6.87717 3.20196 6.14716 3.71762 5.57323C3.63413 5.36681 3.35912 4.53108 3.79619 3.40334C3.79619 3.40334 4.469 3.18182 5.99632 4.24411C6.63474 4.06287 7.31737 3.97224 8 3.96721C8.67772 3.96721 9.36525 4.06287 10.0037 4.24411C11.531 3.18182 12.2038 3.40334 12.2038 3.40334C12.6409 4.53108 12.3659 5.36681 12.2824 5.57323C12.7931 6.14716 13.1025 6.87717 13.1025 7.77332C13.1025 10.9249 11.2314 11.6147 9.44874 11.8211C9.73358 12.0728 9.99386 12.5763 9.99386 13.3415C9.99386 14.439 9.98404 15.3201 9.98404 15.5919C9.98404 15.8135 10.1265 16.0652 10.5341 15.9846C13.7115 14.8972 16 11.8261 16 8.20628C16 3.67017 12.4199 0 8 0Z" fill="currentColor" />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Scoped CSS ────────────────────────────────────────────────────────────────
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  /* Hide scrollbars across all browsers */
  html,
  body,
  .clp-page,
  .clp-shell,
  .clp-card-back {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  .clp-page::-webkit-scrollbar,
  .clp-shell::-webkit-scrollbar,
  .clp-card-back::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
  }

  .clp-page {
    position: relative;
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: rgb(238, 240, 239);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    overflow-x: hidden;
  }

  .clp-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    margin: 0 auto;
    background-image: url('https://res.cloudinary.com/dpn42vumz/image/upload/v1790798661/d2507caf-1682-47c3-bc02-146b7fff50b9_tjtjtl.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center calc(50% + 240px);
    pointer-events: none;
  }
  @media (min-width: 1024px) {
    .clp-bg { background-size: cover; }
  }

  .clp-shell {
    position: relative;
    margin: 0 auto;
    display: flex;
    min-height: 100vh;
    width: 100%;
    max-width: 1800px;
    flex-direction: column;
    overflow-x: hidden;
  }

  /* ── Nav: static on mobile, fixed on desktop — matches 'md:fixed' ── */
  .clp-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1800px;
    padding: 24px 28px;
    top: 0;
    z-index: 20;
  }
  @media (min-width: 768px) {
    .clp-nav { position: fixed; }
  }

  .clp-nav-logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  .clp-nav-logo:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
  .clp-nav-logo-img {
    height: 80px;
    width: 135px;
    object-fit: fill;
    display: block;
    transition: transform 0.15s ease;
  }
  @media (max-width: 640px) {
    .clp-nav-logo-img {
      height: 64px;
      width: 110px;
    }
  }

  .clp-nav-link {
    font-size: 1rem;
    font-weight: 400;
    color: rgb(57, 89, 77);
    line-height: 1.5;
    border-bottom: 1px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
    cursor: pointer;
    background: none;
    border-top: none; border-left: none; border-right: none;
    padding: 0;
  }
  .clp-nav-link:hover { color: rgb(22, 33, 28); border-bottom-color: rgb(22, 33, 28); }

  /* ── Card wrapper: centers card ── */
  .clp-card-wrap {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    margin: auto 0;
    width: 100%;
    padding: 0 24px 24px;
  }
  @media (min-width: 768px) {
    .clp-card-wrap { width: fit-content; margin: auto auto; padding: 16px 0; }
  }

  /* Card size adjustments as requested */
  /* ── Flip wrapper ── */
  .clp-flip-scene {
    perspective: 1400px;
    width: 648px;
    max-width: 100%;
  }

  .clp-flip-card {
    width: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.85s cubic-bezier(0.4, 0.2, 0.2, 1);
    /* height driven by the front face (.clp-card); back is absolutely positioned */
  }

  .clp-flip-card.is-flipped {
    transform: rotateY(180deg);
  }

  .clp-card {
    display: flex;
    width: 648px;
    max-width: 100%;
    min-height: 604.94px;
    height: auto;
    flex-direction: column;
    border-radius: 24px;
    border: 1px solid rgb(224, 224, 224);
    background: #ffffff;
    padding: 24px;
    box-sizing: border-box;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  @media (min-width: 768px) {
    .clp-card { padding: 40px 44px; }
  }

  /* Back face — signup */
  .clp-card-back {
    display: flex;
    width: 648px;
    max-width: 100%;
    height: auto;
    flex-direction: column;
    border-radius: 24px;
    border: 1px solid rgb(224, 224, 224);
    background: #ffffff;
    padding: 24px;
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    transform: rotateY(180deg);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  @media (min-width: 768px) {
    .clp-card-back { padding: 40px 44px; }
  }

  /* ── Signup-specific reuse of same field styles ── */
  .clp-input--top { border: 1px solid rgb(189, 189, 189); border-bottom: none; border-radius: 8px 8px 0 0; }
  .clp-input--mid-field { border: 1px solid rgb(189, 189, 189); border-bottom: none; border-radius: 0; }
  .clp-input--bottom-field { border: 1px solid rgb(189, 189, 189); border-radius: 0 0 8px 8px; padding-right: 40px; }

  /* Checkbox row for signup */
  .clp-terms-row { display: flex; align-items: flex-start; gap: 10px; margin: 16px 0 4px; }
  .clp-terms-checkbox { width: 16px; height: 16px; margin-top: 2px; flex-shrink: 0; accent-color: rgb(57, 89, 77); cursor: pointer; }
  .clp-terms-label { font-size: 0.875rem; color: rgb(97, 97, 97); line-height: 1.5; cursor: pointer; }
  .clp-terms-label a { color: rgb(57, 89, 77); text-decoration: underline; transition: color 0.15s ease; }
  .clp-terms-label a:hover { color: rgb(22, 33, 28); }

  /* Field status icons */
  .clp-field-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); z-index: 10; display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .clp-avail-spinner { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; border: 2px solid rgb(189,189,189); border-top-color: rgb(57,89,77); border-radius: 50%; animation: clp-spin 0.6s linear infinite; z-index: 10; display: block; }
  @keyframes clp-spin { to { transform: translateY(-50%) rotate(360deg); } }

  /* Password strength wrap */
  .clp-strength-wrap { margin-top: 6px; margin-bottom: 4px; }

  .clp-heading {
    font-size: 1.75rem;
    font-weight: 420;
    line-height: 1.36;
    color: rgb(33, 33, 33);
    margin: 0;
    text-align: center;
  }
  @media (min-width: 1024px) {
    .clp-heading { font-size: 2.375rem; line-height: 1.2; }
  }

  /* ── OAuth row ── */
  .clp-oauth-row {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 24px;
  }

  /* ── Circular Google button ── */
  .clp-google-circle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid rgb(218, 220, 224);
    background: #ffffff;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
    padding: 0;
    box-sizing: border-box;
    flex-shrink: 0;
    outline: none;
  }
  .clp-google-circle-btn:hover:not(:disabled) {
    background: rgb(248, 249, 250);
    border-color: rgb(180, 185, 182);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  .clp-google-circle-btn:active:not(:disabled) {
    background: rgb(241, 243, 244);
    border-color: rgb(57, 89, 77);
    transform: translateY(0) scale(0.96);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  .clp-google-circle-btn:focus-visible {
    box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px rgb(57, 89, 77);
  }
  .clp-google-circle-btn:disabled {
    opacity: 0.55;
    background: rgb(238, 238, 238);
    border-color: rgb(238, 238, 238);
    cursor: not-allowed;
    box-shadow: none;
  }

  /* ── Divider ("or") ── */
  .clp-divider {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 22px 0;
  }
  .clp-divider-line {
    flex: 1;
    height: 1.5px;
    background-color: rgb(57, 89, 77) !important;
    display: block;
    border: none;
  }
  .clp-divider-text {
    padding: 0 16px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(57, 89, 77);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    user-select: none;
    line-height: 1;
  }

  .clp-oauth-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    gap: 8px;
    height: 40px;
    max-width: 400px;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #dadce0;
    background: #ffffff;
    color: rgb(33, 33, 33);
    font-size: 0.875rem;
    font-weight: 400;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    line-height: 1.5;
    letter-spacing: 0.0025em;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .clp-oauth-btn:hover:not(:disabled) { background: rgb(245, 245, 245); border-color: rgb(117, 117, 117); }
  .clp-oauth-btn:active:not(:disabled) { background: rgb(250, 250, 250); border-color: rgb(33, 33, 33); }
  .clp-oauth-btn:disabled { background: rgb(238, 238, 238); border-color: rgb(238, 238, 238); color: rgb(97, 97, 97); cursor: not-allowed; }

  .clp-form { display: flex; flex-direction: column; margin-top: 0; width: 100%; }

  .clp-input-wrap { position: relative; width: 100%; }
  .clp-input-wrap--password { margin-bottom: 8px; }

  .clp-input-label {
    position: absolute;
    top: 0; left: 0;
    z-index: 10;
    padding: 10px 12px 0;
    pointer-events: none;
  }
  .clp-input-label-text {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(33, 33, 33);
    line-height: 1.36;
  }

  .clp-input {
    display: block;
    width: 100%;
    background: rgb(250, 250, 250);
    padding: 28px 12px 10px;
    font-size: 0.875rem;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    color: rgb(33, 33, 33);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .clp-input::placeholder { color: rgb(189, 189, 189); }
  .clp-input--email {
    border: 1px solid rgb(189, 189, 189);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
  }
  .clp-input--password {
    border: 1px solid rgb(189, 189, 189);
    border-radius: 0 0 8px 8px;
    padding-right: 40px;
  }
  .clp-input:focus { position: relative; z-index: 5; box-shadow: 0 0 0 1px rgb(33,33,33); }
  .clp-input:disabled { color: rgb(97, 97, 97); cursor: not-allowed; }
  .clp-input--error { border-color: #ef4444 !important; box-shadow: 0 0 0 1px #ef4444 !important; }

  .clp-eye-btn {
    position: absolute;
    right: 12px; bottom: 14px;
    background: none; border: none; padding: 2px;
    cursor: pointer;
    color: rgb(57, 89, 77);
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
    transition: color 0.12s ease;
  }
  .clp-eye-btn:hover { color: rgb(22, 33, 28); }

  .clp-error-text {
    font-size: 0.75rem;
    color: #ef4444;
    margin: 2px 0 6px 2px;
    line-height: 1.4;
  }
  .clp-error-box {
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 12px;
  }
  .clp-error-box p { font-size: 0.8125rem; color: #ef4444; margin: 0; line-height: 1.5; }

  .clp-forgot {
    display: flex;
    width: fit-content;
    align-self: flex-end;
    font-size: 1rem;
    color: rgb(57, 89, 77);
    line-height: 1.5;
    border-bottom: 1px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
    background: none;
    border-top: none; border-left: none; border-right: none;
    cursor: pointer;
    padding: 0;
  }
  .clp-forgot:hover { color: rgb(22, 33, 28); border-bottom-color: rgb(22, 33, 28); }

  /* ── Submit "cell" button ── */
  .clp-submit-wrap { margin-top: 40px; width: 100%; display: flex; justify-content: center; }

  .clp-cell-btn {
    display: flex;
    align-items: stretch;
    gap: 4px;
    height: 40px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  .clp-cell-btn:disabled { cursor: not-allowed; opacity: 0.55; }

  .clp-cell-part {
    display: flex;
    height: 100%;
    transition: transform 0.15s ease;
  }
  .clp-cell-btn:hover:not(:disabled) .clp-cell-part {
    transform: translateX(-4px);
  }
  .clp-cell-part-main {
    flex: 1;
    min-width: 80px;
  }
  .clp-cell-part-arrow {
    flex: none;
  }

  .clp-bg-color { background: rgb(57, 89, 77); transition: background 0.15s ease; }
  .clp-cell-btn:hover:not(:disabled) .clp-bg-color { background: rgb(43, 66, 57); }
  .clp-cell-btn:active:not(:disabled) .clp-bg-color { background: rgb(22, 33, 28); }
  .clp-cell-btn:disabled .clp-bg-color { background: rgb(238, 238, 238); color: rgb(97,97,97); }

  .clp-cell-l {
    width: 12px;
    border-radius: 6px 0 0 6px;
    margin-right: -2px;
    transform-origin: top right;
  }
  .clp-cell-mid {
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 0 8px;
    font-size: 0.875rem;
    font-weight: 400;
  }
  .clp-cell-skew-r {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 0 10px 4px 0;
    transform-origin: top right;
  }
  .clp-cell-skew-l {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 4px 0 0 10px;
    transform-origin: top right;
    margin-right: -16px;
  }
  .clp-cell-r {
    width: 12px;
    border-radius: 0 6px 6px 0;
    margin-left: -2px;
    transform-origin: top right;
  }
  .clp-cell-btn:disabled .clp-cell-mid { color: rgb(97,97,97); }

  .clp-cell-arrow-icon { display: flex; align-items: center; justify-content: center; transition: transform 0.15s ease; padding: 0 4px; }

  .clp-terms {
    margin-top: 20px;
    font-size: 0.875rem;
    color: rgb(33, 33, 33);
    line-height: 1.5;
    text-align: center;
  }
  .clp-terms a { color: rgb(57, 89, 77); text-decoration: underline; transition: color 0.15s ease; }
  .clp-terms a:hover { color: rgb(22, 33, 28); }

  .clp-signup-row {
    margin-top: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 0.875rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
  }
  .clp-signup-link {
    color: rgb(57, 89, 77);
    border-bottom: 1px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
    background: none;
    border-top: none; border-left: none; border-right: none;
    cursor: pointer;
    padding: 0;
    font: inherit;
  }
  .clp-signup-link:hover { color: rgb(22, 33, 28); border-bottom-color: rgb(22, 33, 28); }
`;

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: authLoading, error: reduxAuthError } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // ── Signup state ────────────────────────────────────────────────────────
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [supPasswordStrength, setSupPasswordStrength] = useState({ score: 0, label: 'Weak', checks: null });
  const [supShowPassword, setSupShowPassword] = useState(false);
  const [supShowConfirmPassword, setSupShowConfirmPassword] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState({ username: false, email: false });

  const supInputRefs = {
    username: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
    agreeTerms: useRef(null),
  };

  const signupFormik = useFormik({
    initialValues: { username: '', email: '', password: '', confirmPassword: '', agreeTerms: false },
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema: Yup.object({
      username: Yup.string()
        .required('Username is required.')
        .min(3, 'Username must be at least 3 characters.')
        .max(30, 'Username cannot exceed 30 characters.')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.')
        .test('no-leading-number', 'Username cannot start with a number.', v => !v || !/^\d/.test(v))
        .test('not-all-numbers', 'Username cannot consist only of numbers.', v => !v || !/^\d+$/.test(v)),
      email: Yup.string()
        .transform(v => v.toLowerCase().trim())
        .required('Email is required.')
        .email('Enter a valid email address.'),
      password: Yup.string()
        .required('Password is required.')
        .min(8, 'Password must be at least 8 characters.')
        .max(128, 'Password cannot exceed 128 characters.')
        .test('no-spaces', 'Password cannot contain spaces.', v => !/\s/.test(v || ''))
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter.')
        .matches(/[0-9]/, 'Password must contain at least one number.')
        .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character.')
        .test('not-equal-username', 'Password cannot be equal to username.', function(v) {
          return !v || !this.parent.username || v.toLowerCase() !== this.parent.username.toLowerCase();
        })
        .test('not-email-prefix', 'Password cannot contain part of your email address.', function(v) {
          if (!v || !this.parent.email) return true;
          const prefix = this.parent.email.split('@')[0].toLowerCase();
          return !v.toLowerCase().includes(prefix);
        }),
      confirmPassword: Yup.string()
        .required('Confirm password is required.')
        .oneOf([Yup.ref('password'), null], 'Passwords do not match.'),
      agreeTerms: Yup.boolean().oneOf([true], 'Please accept the Terms and Conditions.'),
    }),
    onSubmit: async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        await signup({
          username: values.username.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          confirm_password: values.confirmPassword,
          agree_terms: values.agreeTerms,
        });
        setOtpEmail(values.email.trim().toLowerCase());
        setShowOtpModal(true);
        toaster.success('OTP sent to your email!');
      } catch (err) {
        const errData = err.response?.data;
        let errMsg = 'Signup failed. Please try again.';
        if (errData?.errors) {
          setErrors(errData.errors);
          errMsg = errData.errors.non_field_errors ? errData.errors.non_field_errors[0] : 'Please fix the errors below.';
        } else if (errData?.error) {
          errMsg = errData.error;
        }
        setStatus({ error: errMsg });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleBlurCheck = async (field, value) => {
    signupFormik.handleBlur({ target: { name: field } });
    if (!value || signupFormik.errors[field]) return;
    setCheckingAvailability(prev => ({ ...prev, [field]: true }));
    try {
      await checkAvailability({ [field]: value });
    } catch (err) {
      const errData = err.response?.data?.errors;
      if (errData?.[field]) signupFormik.setFieldError(field, errData[field]);
    } finally {
      setCheckingAvailability(prev => ({ ...prev, [field]: false }));
    }
  };

  const supFieldIcon = (field) => {
    if (!signupFormik.touched[field]) return null;
    if (checkingAvailability[field]) return <span className="clp-avail-spinner" />;
    if (signupFormik.errors[field]) return (
      <span className="clp-field-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </span>
    );
    return (
      <span className="clp-field-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(34,197,94)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
    );
  };

  const supErrClass = (field) => signupFormik.touched[field] && signupFormik.errors[field] ? ' clp-input--error' : '';

  // ── Formik setup (unchanged logic) ─────────────────────────────────────
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const result = await dispatch(loginUser(values));
        if (loginUser.fulfilled.match(result)) {
          if (!result.payload?.user) await dispatch(fetchUser());
          navigate('/home');
        }
      } catch {
        setStatus({ error: 'Login failed' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const isSubmitting = formik.isSubmitting || authLoading;

  // ── Backend error parsing (unchanged logic) ─────────────────────────────
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
        'Login failed. Please check your credentials.';
    }
  }

  const emailErrorClass = formik.touched.email && formik.errors.email ? ' clp-input--error' : '';
  const passwordErrorClass = formik.touched.password && formik.errors.password ? ' clp-input--error' : '';

  return (
    <div className="clp-page">
      <style>{PAGE_STYLES}</style>
      <div className="clp-bg" aria-hidden="true" />

      <div className="clp-shell">
        <nav className="clp-nav" aria-label="Site navigation">
          <button
            type="button"
            className="clp-nav-logo"
            onClick={() => { if (!isSubmitting) navigate('/'); }}
            aria-label="IntraView home"
          >
            <img
              src={LOGO_URL}
              alt="IntraView"
              className="clp-nav-logo-img"
            />
          </button>
          <button type="button" className="clp-nav-link" onClick={() => { if (!isSubmitting) setIsFlipped(true); }} aria-label="Go to sign up">
            Sign up
          </button>
        </nav>

        <div className="clp-card-wrap">
          <div className="clp-flip-scene">
          <div className={`clp-flip-card${isFlipped ? ' is-flipped' : ''}`}>
          <div className="clp-card" role="main">
            <h1 className="clp-heading">Log in</h1>

            <div className="clp-oauth-row">
              <GoogleLoginButton disabled={isSubmitting} variant="circle" />
            </div>

            <div className="clp-divider" role="separator" aria-label="Or continue with email">
              <span className="clp-divider-line" style={{ backgroundColor: 'rgb(57, 89, 77)', height: '1.5px', flex: 1, display: 'block' }} />
              <span className="clp-divider-text" style={{ color: 'rgb(57, 89, 77)' }}>or</span>
              <span className="clp-divider-line" style={{ backgroundColor: 'rgb(57, 89, 77)', height: '1.5px', flex: 1, display: 'block' }} />
            </div>

            <form className="clp-form" onSubmit={formik.handleSubmit} noValidate>
              <div className="clp-input-wrap">
                <label className="clp-input-label" htmlFor="clp-email">
                  <span className="clp-input-label-text">Email</span>
                </label>
                <input
                  id="clp-email"
                  type="email"
                  placeholder="yourname@email.com"
                  spellCheck={false}
                  autoComplete="off"
                  className={`clp-input clp-input--email${emailErrorClass}`}
                  disabled={isSubmitting}
                  {...formik.getFieldProps('email')}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <span className="clp-error-text" role="alert">{formik.errors.email}</span>
              )}

              <div className="clp-input-wrap clp-input-wrap--password">
                <label className="clp-input-label" htmlFor="clp-password">
                  <span className="clp-input-label-text">Password</span>
                </label>
                <input
                  id="clp-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  spellCheck={false}
                  autoComplete="off"
                  className={`clp-input clp-input--password${passwordErrorClass}`}
                  disabled={isSubmitting}
                  {...formik.getFieldProps('password')}
                />
                <button
                  type="button"
                  className="clp-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="clp-error-text" role="alert">{formik.errors.password}</span>
              )}

              {parsedError && (
                <div className="clp-error-box" role="alert"><p>{parsedError}</p></div>
              )}

              <button
                type="button"
                className="clp-forgot"
                onClick={() => { if (!isSubmitting) navigate('/forgot-password'); }}
                disabled={isSubmitting}
              >
                Forgot Password
              </button>

              <div className="clp-submit-wrap">
                <button type="submit" className="clp-cell-btn" disabled={isSubmitting} aria-label={isSubmitting ? 'Signing in…' : 'Log in'}>
                  <div className="clp-cell-part clp-cell-part-main">
                    <span className="clp-bg-color clp-cell-l"></span>
                    <div className="clp-bg-color clp-cell-mid">{isSubmitting ? 'Signing in…' : 'Log in'}</div>
                    <span className="clp-bg-color clp-cell-skew-r"></span>
                  </div>
                  <div className="clp-cell-part clp-cell-part-arrow">
                    <span className="clp-bg-color clp-cell-skew-l"></span>
                    <div className="clp-bg-color clp-cell-mid clp-cell-arrow-icon"><ArrowRightIcon /></div>
                    <span className="clp-bg-color clp-cell-r"></span>
                  </div>
                </button>
              </div>
            </form>

            <p className="clp-terms">
              By logging in, you agree to the{' '}
              <Link to="/terms-of-use">Terms of Use</Link>{' '}
              and{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>

            <div className="clp-signup-row">
              <span>New user?</span>
              <button type="button" className="clp-signup-link" onClick={() => { if (!isSubmitting) setIsFlipped(true); }} disabled={isSubmitting}>
                Sign up
              </button>
            </div>
          </div>

          {/* ── Back face: Signup form ── */}
          <div className="clp-card-back">
            <h1 className="clp-heading">Sign up</h1>

            <div className="clp-oauth-row">
              <GoogleLoginButton disabled={signupFormik.isSubmitting} variant="circle" />
            </div>

            <div className="clp-divider" role="separator" aria-label="Or continue with email">
              <span className="clp-divider-line" style={{ backgroundColor: 'rgb(57, 89, 77)', height: '1.5px', flex: 1, display: 'block' }} />
              <span className="clp-divider-text" style={{ color: 'rgb(57, 89, 77)' }}>or</span>
              <span className="clp-divider-line" style={{ backgroundColor: 'rgb(57, 89, 77)', height: '1.5px', flex: 1, display: 'block' }} />
            </div>

            <form className="clp-form" onSubmit={signupFormik.handleSubmit} noValidate>
              {/* Username */}
              <div className="clp-input-wrap">
                <label className="clp-input-label" htmlFor="clp-sup-username">
                  <span className="clp-input-label-text">Username</span>
                </label>
                <input
                  id="clp-sup-username"
                  type="text"
                  placeholder="your_username"
                  spellCheck={false}
                  autoComplete="off"
                  className={`clp-input clp-input--top${supErrClass('username')}`}
                  disabled={signupFormik.isSubmitting}
                  ref={supInputRefs.username}
                  {...signupFormik.getFieldProps('username')}
                  onBlur={e => handleBlurCheck('username', e.target.value)}
                />
                {supFieldIcon('username')}
              </div>
              {signupFormik.touched.username && signupFormik.errors.username && (
                <span className="clp-error-text" role="alert">{signupFormik.errors.username}</span>
              )}

              {/* Email */}
              <div className="clp-input-wrap">
                <label className="clp-input-label" htmlFor="clp-sup-email">
                  <span className="clp-input-label-text">Email</span>
                </label>
                <input
                  id="clp-sup-email"
                  type="email"
                  placeholder="yourname@email.com"
                  spellCheck={false}
                  autoComplete="off"
                  className={`clp-input clp-input--mid-field${supErrClass('email')}`}
                  disabled={signupFormik.isSubmitting}
                  ref={supInputRefs.email}
                  {...signupFormik.getFieldProps('email')}
                  onBlur={e => handleBlurCheck('email', e.target.value)}
                />
                {supFieldIcon('email')}
              </div>
              {signupFormik.touched.email && signupFormik.errors.email && (
                <span className="clp-error-text" role="alert">{signupFormik.errors.email}</span>
              )}

              {/* Password */}
              <div className="clp-input-wrap">
                <label className="clp-input-label" htmlFor="clp-sup-password">
                  <span className="clp-input-label-text">Password</span>
                </label>
                <input
                  id="clp-sup-password"
                  type={supShowPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  spellCheck={false}
                  autoComplete="off"
                  className={`clp-input clp-input--mid-field${supErrClass('password')}`}
                  disabled={signupFormik.isSubmitting}
                  ref={supInputRefs.password}
                  {...signupFormik.getFieldProps('password')}
                  onChange={e => {
                    signupFormik.handleChange(e);
                    setSupPasswordStrength(checkPasswordStrength(e.target.value));
                  }}
                />
                <button type="button" className="clp-eye-btn" onClick={() => setSupShowPassword(v => !v)} aria-label={supShowPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>
                  {supShowPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="clp-input-wrap">
                <label className="clp-input-label" htmlFor="clp-sup-confirm-password">
                  <span className="clp-input-label-text">Confirm Password</span>
                </label>
                <input
                  id="clp-sup-confirm-password"
                  type={supShowConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  spellCheck={false}
                  autoComplete="off"
                  className={`clp-input clp-input--bottom-field${supErrClass('confirmPassword')}`}
                  disabled={signupFormik.isSubmitting}
                  ref={supInputRefs.confirmPassword}
                  {...signupFormik.getFieldProps('confirmPassword')}
                />
                <button type="button" className="clp-eye-btn" onClick={() => setSupShowConfirmPassword(v => !v)} aria-label={supShowConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} tabIndex={-1}>
                  {supShowConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              {signupFormik.touched.confirmPassword && signupFormik.errors.confirmPassword && (
                <span className="clp-error-text" role="alert">{signupFormik.errors.confirmPassword}</span>
              )}
              {signupFormik.touched.password && signupFormik.errors.password && (
                <span className="clp-error-text" role="alert">{signupFormik.errors.password}</span>
              )}

              {/* Password strength & requirements */}
              {signupFormik.values.password && (
                <div className="clp-strength-wrap">
                  <PasswordStrengthBar score={supPasswordStrength.score} label={supPasswordStrength.label} checks={supPasswordStrength.checks} />
                </div>
              )}

              {/* Terms */}
              <div className="clp-terms-row">
                <input
                  type="checkbox"
                  id="clp-sup-terms"
                  name="agreeTerms"
                  className="clp-terms-checkbox"
                  ref={supInputRefs.agreeTerms}
                  checked={signupFormik.values.agreeTerms}
                  onChange={signupFormik.handleChange}
                  onBlur={signupFormik.handleBlur}
                  disabled={signupFormik.isSubmitting}
                />
                <label htmlFor="clp-sup-terms" className="clp-terms-label">
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" onClick={e => e.stopPropagation()}>Terms and Conditions</Link>
                </label>
              </div>
              {signupFormik.touched.agreeTerms && signupFormik.errors.agreeTerms && (
                <span className="clp-error-text" role="alert">{signupFormik.errors.agreeTerms}</span>
              )}

              {/* API error */}
              {signupFormik.status?.error && (
                <div className="clp-error-box" role="alert"><p>{signupFormik.status.error}</p></div>
              )}

              {/* Submit */}
              <div className="clp-submit-wrap">
                <button type="submit" className="clp-cell-btn" disabled={signupFormik.isSubmitting || !signupFormik.values.agreeTerms} aria-label={signupFormik.isSubmitting ? 'Creating account…' : 'Sign up'}>
                  <div className="clp-cell-part clp-cell-part-main">
                    <span className="clp-bg-color clp-cell-l"></span>
                    <div className="clp-bg-color clp-cell-mid">{signupFormik.isSubmitting ? 'Creating account…' : 'Sign up'}</div>
                    <span className="clp-bg-color clp-cell-skew-r"></span>
                  </div>
                  <div className="clp-cell-part clp-cell-part-arrow">
                    <span className="clp-bg-color clp-cell-skew-l"></span>
                    <div className="clp-bg-color clp-cell-mid clp-cell-arrow-icon"><ArrowRightIcon /></div>
                    <span className="clp-bg-color clp-cell-r"></span>
                  </div>
                </button>
              </div>
            </form>

            <p className="clp-terms">
              By signing up, you agree to the{' '}
              <Link to="/terms-of-use">Terms of Use</Link>{' '}
              and{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>

            <div className="clp-signup-row">
              <span>Already have an account?</span>
              <button type="button" className="clp-signup-link" onClick={() => setIsFlipped(false)}>
                Log in
              </button>
            </div>
          </div>

          </div>{/* end clp-flip-card */}
          </div>{/* end clp-flip-scene */}
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          email={otpEmail}
          onSuccess={() => {
            toaster.success('Email verified successfully!');
            setTimeout(() => navigate('/login'), 800);
            setShowOtpModal(false);
            setIsFlipped(false);
          }}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
}

export default LoginPage;