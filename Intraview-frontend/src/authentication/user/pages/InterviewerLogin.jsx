// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { loginInterviewer } from "../../interviewerAuthSlice";
// import { useNavigate, Link } from "react-router-dom";

// export default function InterviewerLogin() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { loading, error, interviewerStatus } =
//     useSelector((s) => s.interviewerAuth);

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   useEffect(() => {
//     if (!interviewerStatus) return;

//     if (interviewerStatus === "APPROVED_NOT_ONBOARDED") {
//       navigate("/interviewer/onboarding/profile");
//     } else if (interviewerStatus === "ACTIVE") {
//       navigate("/interviewer/dashboard");
//     } else if (interviewerStatus === "SUSPENDED") {
//       alert("Your interviewer account is suspended.");
//     }
//   }, [interviewerStatus, navigate]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     dispatch(loginInterviewer({...form, email: form.email.trim(),}));

//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-xl shadow w-full max-w-md"
//       >
//         <h1 className="text-2xl font-semibold mb-6">
//           Interviewer Login
//         </h1>

//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full mb-4 px-4 py-2 border rounded"
//           value={form.email}
//           onChange={(e) =>
//             setForm({ ...form, email: e.target.value })
//           }
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full mb-4 px-4 py-2 border rounded"
//           value={form.password}
//           onChange={(e) =>
//             setForm({ ...form, password: e.target.value })
//           }
//           required
//         />

//         {error && (
//         <p className="text-red-600 text-sm mb-3">
//             {error.message || error.detail || "Login failed"}
//         </p>
//         )}

//         <button
//           disabled={loading}
//           className="w-full bg-green-600 text-white py-2 rounded"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         <div className="mt-4 text-sm text-center">
//           <Link
//             to="/interviewer/forgot-password"
//             className="text-blue-600 hover:underline"
//           >
//             Forgot password?
//           </Link>
//         </div>
//       </form>
//     </div>
//   );
// }


















// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { loginInterviewer } from "../../interviewerAuthSlice";
// import { useNavigate, Link } from "react-router-dom";

// export default function InterviewerLogin() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { loading, error, interviewerStatus } =
//     useSelector((s) => s.interviewerAuth);

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     if (!interviewerStatus) return;

//     if (interviewerStatus === "APPROVED_NOT_ONBOARDED") {
//       navigate("/interviewer/onboarding/profile");
//     } else if (interviewerStatus === "ACTIVE") {
//       navigate("/interviewer/dashboard");
//     } else if (interviewerStatus === "SUSPENDED") {
//       alert("Your interviewer account is suspended.");
//     }
//   }, [interviewerStatus, navigate]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     dispatch(loginInterviewer({...form, email: form.email.trim()}));
//   };

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50">
//       {/* Left side - Branding */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-gray-800 p-12 flex-col justify-between relative overflow-hidden">
//         <div className="absolute inset-0 opacity-5">
//           <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
//           <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
//         </div>
        
//         <div className="relative z-10">
//           <div className="flex items-center space-x-3 mb-3">
//             <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
//               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//               </svg>
//             </div>
//             <h1 className="text-3xl font-light text-white tracking-wide">IntraView</h1>
//           </div>
//           <p className="text-slate-300 text-lg font-light ml-13">Interviewer Portal</p>
//         </div>
        
//         <div className="relative z-10 space-y-8">
//           <div className="flex items-start space-x-4">
//             <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-10">
//               <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-white font-normal text-lg mb-1">Conduct Professional Interviews</h3>
//               <p className="text-slate-300 font-light text-sm">Connect with candidates and provide valuable feedback</p>
//             </div>
//           </div>
          
//           <div className="flex items-start space-x-4">
//             <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-10">
//               <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-white font-normal text-lg mb-1">Flexible Scheduling</h3>
//               <p className="text-slate-300 font-light text-sm">Manage your availability and interview sessions</p>
//             </div>
//           </div>
          
//           <div className="flex items-start space-x-4">
//             <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-10">
//               <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-white font-normal text-lg mb-1">Streamlined Dashboard</h3>
//               <p className="text-slate-300 font-light text-sm">Access all your tools and resources in one place</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="relative z-10">
//           <p className="text-slate-400 text-sm font-light">© 2024 IntraView. All rights reserved.</p>
//         </div>
//       </div>

//       {/* Right side - Login Form */}
//       <div className="flex-1 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           {/* Logo for mobile */}
//           <div className="lg:hidden mb-8 text-center">
//             <div className="flex items-center justify-center space-x-3 mb-2">
//               <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                 </svg>
//               </div>
//               <h1 className="text-3xl font-light text-slate-800 tracking-wide">IntraView</h1>
//             </div>
//             <p className="text-slate-500 font-light">Interviewer Portal</p>
//           </div>

//           <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
//             <div className="mb-8">
//               <h2 className="text-3xl font-light text-slate-800 mb-2">Welcome Back</h2>
//               <p className="text-slate-500 font-light">Sign in to access your interviewer dashboard</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//                     </svg>
//                   </div>
//                   <input
//                     id="email"
//                     type="email"
//                     placeholder="interviewer@example.com"
//                     className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all outline-none bg-slate-50 focus:bg-white text-slate-700 placeholder-slate-400"
//                     value={form.email}
//                     onChange={(e) => setForm({ ...form, email: e.target.value })}
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                     </svg>
//                   </div>
//                   <input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all outline-none bg-slate-50 focus:bg-white text-slate-700 placeholder-slate-400"
//                     value={form.password}
//                     onChange={(e) => setForm({ ...form, password: e.target.value })}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 pr-4 flex items-center"
//                   >
//                     {showPassword ? (
//                       <svg className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.478 0-8.268-2.943-9.543-7a10.025 10.025 0 014.134-5.411z" />
//                       </svg>
//                     ) : (
//                       <svg className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3">
//                   <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                   <p className="text-red-700 text-sm font-medium">
//                     {error.message || error.detail || "Login failed. Please check your credentials and try again."}
//                   </p>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-300/50 hover:shadow-xl hover:shadow-slate-400/50"
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Signing in...
//                   </span>
//                 ) : (
//                   "Sign In"
//                 )}
//               </button>

//               <div className="flex items-center justify-center pt-2">
//                 <Link
//                   to="/interviewer/forgot-password"
//                   className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
//                 >
//                   Forgot your password?
//                 </Link>
//               </div>
//             </form>
//           </div>

//           <div className="mt-8 text-center">
//             <p className="text-sm text-slate-600 font-light">
//               Not an interviewer yet?{" "}
//               <Link to="/interviewer/signup" className="font-medium text-slate-800 hover:text-amber-600 transition-colors">
//                 Apply to join
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




































import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginInterviewer } from "../../interviewerAuthSlice";
import { useNavigate, Link } from "react-router-dom";

export default function InterviewerLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, interviewerStatus } =
    useSelector((s) => s.interviewerAuth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!interviewerStatus) return;

    if (interviewerStatus === "APPROVED_NOT_ONBOARDED") {
      navigate("/interviewer/onboarding/profile");
    } else if (interviewerStatus === "ACTIVE") {
      navigate("/interviewer/dashboard");
    } else if (interviewerStatus === "SUSPENDED") {
      alert("Your interviewer account is suspended.");
    }
  }, [interviewerStatus, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginInterviewer({...form, email: form.email.trim()}));
  };

  return (
    <div className="min-h-screen flex relative bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 overflow-hidden">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-gray-800 p-12 flex-col justify-between relative overflow-hidden" style={{clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)'}}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-light text-white tracking-wide">IntraView</h1>
          </div>
          <p className="text-slate-300 text-lg font-light ml-13">Interviewer Portal</p>
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-10">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-normal text-lg mb-1">Conduct Professional Interviews</h3>
              <p className="text-slate-300 font-light text-sm">Connect with candidates and provide valuable feedback</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-10">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-normal text-lg mb-1">Flexible Scheduling</h3>
              <p className="text-slate-300 font-light text-sm">Manage your availability and interview sessions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-10">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-normal text-lg mb-1">Streamlined Dashboard</h3>
              <p className="text-slate-300 font-light text-sm">Access all your tools and resources in one place</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-light">© 2024 IntraView. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:pl-24">
        <div className="w-full max-w-md -ml-20 mt-10">
          {/* Logo for mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-light text-slate-800 tracking-wide">IntraView</h1>
            </div>
            <p className="text-slate-500 font-light">Interviewer Portal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
            <div className="mb-8">
              <h2 className="text-3xl font-light text-slate-800 mb-2">Welcome Back</h2>
              <p className="text-slate-500 font-light">Sign in to access your interviewer dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="interviewer@example.com"
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all outline-none bg-slate-50 focus:bg-white text-slate-700 placeholder-slate-400"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all outline-none bg-slate-50 focus:bg-white text-slate-700 placeholder-slate-400"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.478 0-8.268-2.943-9.543-7a10.025 10.025 0 014.134-5.411z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">
                    {error.message || error.detail || "Login failed. Please check your credentials and try again."}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-300/50 hover:shadow-xl hover:shadow-slate-400/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="flex items-center justify-center pt-2">
                <Link
                  to="/interviewer/forgot-password"
                  className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 font-light">
              Not an interviewer yet?{" "}
              <Link to="/interviewer/signup" className="font-medium text-slate-800 hover:text-amber-600 transition-colors">
                Apply to join
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}