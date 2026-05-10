// // src/pages/RoleInterviewSetupPage.jsx

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   fetchAiInterviewRole,
//   createAiInterviewSession,
//   setConfigField,
//   setSystemCheckField,
//   resetAiInterviewSessionState,
//   checkAiInterviewNetwork,
// } from "../slice/aiInterviewSessionSlice";

// const ROUND_OPTIONS = [
//   { value: "WARMUP", label: "Warm Up", subtitle: "Non-technical" },
//   { value: "ROLE_RELATED", label: "Role Related", subtitle: "Technical" },
//   { value: "BEHAVIORAL", label: "Behavioral", subtitle: "HR" },
//   { value: "CODING", label: "Coding", subtitle: "Programming" },
// ];

// const DIFFICULTY_OPTIONS = [
//   { value: "BEGINNER", label: "Beginner" },
//   { value: "PROFESSIONAL", label: "Professional" },
// ];

// const DURATION_OPTIONS = [
//   { value: 5, label: "5 mins" },
//   { value: 15, label: "15 mins" },
//   { value: 30, label: "30 mins" },
// ];

// export default function RoleInterviewSetupPage() {
//   const { slug } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [localError, setLocalError] = useState(null);
//   const [audioLevel, setAudioLevel] = useState(0); // 0..1

//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const mediaStreamRef = useRef(null);
//   const animationFrameRef = useRef(null);
//   const videoRef = useRef(null);

//   const {
//     role,
//     roleLoading,
//     roleError,
//     config,
//     systemCheck,
//     session,
//   } = useSelector((state) => state.aiInterviewSession);

//   // Load role and reset state
//   useEffect(() => {
//     dispatch(resetAiInterviewSessionState());
//     if (slug) {
//       dispatch(fetchAiInterviewRole(slug));
//     }

//     // browser capabilities
//     const mediaSupported = !!(
//       navigator.mediaDevices && navigator.mediaDevices.getUserMedia
//     );
//     dispatch(
//       setSystemCheckField({
//         field: "browserOk",
//         value: mediaSupported,
//       })
//     );

//     // network ping
//     dispatch(checkAiInterviewNetwork());

//     return () => {
//       stopMediaAndAudio();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [slug, dispatch]);

//   const configComplete = useMemo(() => {
//     return (
//       !!config.roundType &&
//       !!config.difficulty &&
//       !!config.durationMinutes &&
//       !!role
//     );
//   }, [config.roundType, config.difficulty, config.durationMinutes, role]);

//   const canStartInterview = useMemo(() => {
//     // Required: config + browserOk + mic permission granted.
//     // Optional: mic activity, camera, network.
//     return (
//       configComplete &&
//       systemCheck.browserOk &&
//       systemCheck.micPermission === "granted" &&
//       session.status !== "creating"
//     );
//   }, [
//     configComplete,
//     systemCheck.browserOk,
//     systemCheck.micPermission,
//     session.status,
//   ]);

//   const handleSelectRound = (value) => {
//     dispatch(setConfigField({ field: "roundType", value }));
//   };

//   const handleSelectDifficulty = (value) => {
//     dispatch(setConfigField({ field: "difficulty", value }));
//   };

//   const handleSelectDuration = (value) => {
//     dispatch(setConfigField({ field: "durationMinutes", value }));
//   };

//   // Request mic + camera and start simple audio level meter
//   const handleTestDevices = async () => {
//     setLocalError(null);

//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       setLocalError(
//         "Your browser does not support microphone access. Please try a modern browser."
//       );
//       dispatch(
//         setSystemCheckField({ field: "micPermission", value: "denied" })
//       );
//       return;
//     }

//     try {
//       // Audio mandatory, video optional but we ask both for preview.
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       mediaStreamRef.current = stream;

//       // Mic permission granted
//       dispatch(
//         setSystemCheckField({ field: "micPermission", value: "granted" })
//       );
//       dispatch(
//         setSystemCheckField({ field: "cameraPermission", value: "granted" })
//       );

//       // Attach to video for preview (optional)
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play().catch(() => {});
//       }

//       setupAudioAnalyser(stream);
//     } catch (err) {
//       console.error("getUserMedia error", err);
//       dispatch(
//         setSystemCheckField({
//           field: "micPermission",
//           value: "denied",
//         })
//       );
//       setLocalError(
//         "Could not access microphone. Please allow mic access and try again."
//       );
//     }
//   };

//   const setupAudioAnalyser = (stream) => {
//     try {
//       const AudioContext =
//         window.AudioContext || window.webkitAudioContext || null;
//       if (!AudioContext) {
//         console.warn("AudioContext not supported; cannot show level meter.");
//         return;
//       }

//       const audioContext = new AudioContext();
//       audioContextRef.current = audioContext;

//       const analyser = audioContext.createAnalyser();
//       analyser.fftSize = 512;
//       analyserRef.current = analyser;

//       const source = audioContext.createMediaStreamSource(stream);
//       source.connect(analyser);

//       const dataArray = new Uint8Array(analyser.frequencyBinCount);

//       const updateLevel = () => {
//         analyser.getByteFrequencyData(dataArray);
//         let sum = 0;
//         for (let i = 0; i < dataArray.length; i += 1) {
//           sum += dataArray[i];
//         }
//         const avg = sum / dataArray.length; // 0..255
//         const norm = avg / 255; // 0..1

//         setAudioLevel(norm);

//         if (norm > 0.15) {
//           // some voice activity detected
//           dispatch(
//             setSystemCheckField({ field: "micActivityOk", value: true })
//           );
//         }

//         animationFrameRef.current = requestAnimationFrame(updateLevel);
//       };

//       updateLevel();
//     } catch (e) {
//       console.warn("Failed to setup audio analyser", e);
//     }
//   };

//   const stopMediaAndAudio = () => {
//     if (animationFrameRef.current) {
//       cancelAnimationFrame(animationFrameRef.current);
//       animationFrameRef.current = null;
//     }
//     if (audioContextRef.current) {
//       audioContextRef.current.close().catch(() => {});
//       audioContextRef.current = null;
//     }
//     if (mediaStreamRef.current) {
//       mediaStreamRef.current.getTracks().forEach((t) => t.stop());
//       mediaStreamRef.current = null;
//     }
//   };

//   const handleStartInterview = async () => {
//     setLocalError(null);
//     if (!canStartInterview || !role) return;

//     const payload = {
//       role_slug: role.slug,
//       round_type: config.roundType,
//       difficulty: config.difficulty,
//       duration_minutes: config.durationMinutes,
//     };

//     try {
//       const action = await dispatch(createAiInterviewSession(payload));
//       if (createAiInterviewSession.fulfilled.match(action)) {
//         const newSession = action.payload;
//         // we can stop media preview now; LiveKit will take over later
//         stopMediaAndAudio();
//         navigate(`/ai-interview/live/${newSession.id}`);
//       } else {
//         setLocalError(
//           action.payload?.detail || "Failed to start AI interview session."
//         );
//       }
//     } catch (err) {
//       setLocalError("Failed to start AI interview session.");
//     }
//   };

//   return (
//     <div
//       className="min-h-screen bg-gray-50 font-sans py-10"
//       style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
//     >
//       <style>{`
//         .font-display { font-family: 'Sora', system-ui, sans-serif; }
//         .pill-option { transition: all 0.18s ease; }
//         .pill-option-active {
//           background: #0F172A;
//           color: white;
//           border-color: #0F172A;
//         }
//         .pill-option-inactive {
//           background: white;
//           color: #374151;
//           border-color: #E5E7EB;
//         }
//         .pill-option:hover {
//           box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08);
//           transform: translateY(-1px);
//         }
//         .duration-pill-active {
//           background: #0D9488;
//           color: white;
//           border-color: #0D9488;
//         }
//         .duration-pill-inactive {
//           background: white;
//           color: #374151;
//           border-color: #E5E7EB;
//         }
//       `}</style>

//       <div className="max-w-5xl mx-auto px-4 sm:px-6">
//         {/* Header / Breadcrumb */}
//         <div className="mb-6 flex items-center justify-between gap-3">
//           <div>
//             <button
//               onClick={() => navigate("/ai-interview/roles")}
//               className="inline-flex items-center text-xs text-gray-500 hover:text-teal-600"
//             >
//               <svg
//                 className="w-3.5 h-3.5 mr-1"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M15 19l-7-7 7-7" />
//               </svg>
//               Back to roles
//             </button>
//             <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-gray-900">
//               {role ? role.name : "Loading role..."}
//             </h1>
//             {role?.category && (
//               <p className="text-xs uppercase tracking-wide text-gray-400 mt-1">
//                 {role.category}
//               </p>
//             )}
//           </div>

//           <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
//             <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 font-semibold">
//               <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
//               AI Practice
//             </span>
//             <span>Step 1 of 2 · Setup</span>
//           </div>
//         </div>

//         {/* Loading / Error */}
//         {roleLoading && (
//           <div className="mb-4 text-sm text-gray-500">
//             Loading role details...
//           </div>
//         )}
//         {roleError && (
//           <div className="mb-4 text-sm text-red-500">{roleError}</div>
//         )}

//         {/* Main layout: left config, right checklist */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* LEFT: Interview Details */}
//           <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
//             <h2 className="font-display text-lg font-bold text-gray-900 mb-1">
//               Interview Details
//             </h2>
//             <p className="text-xs text-gray-500 mb-4">
//               Configure your AI interview round before joining.
//             </p>

//             {/* Role + Round summary */}
//             <div className="mb-5">
//               <div className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                 <div>
//                   <div className="text-sm font-semibold text-gray-900">
//                     {role ? role.name : "Role"}
//                   </div>
//                   {config.roundType && (
//                     <div className="text-xs text-gray-500 mt-0.5">
//                       {(() => {
//                         const opt = ROUND_OPTIONS.find(
//                           (r) => r.value === config.roundType
//                         );
//                         return opt ? opt.label : "";
//                       })()}
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-[11px] text-gray-400">
//                   Duration:{" "}
//                   {config.durationMinutes
//                     ? `${config.durationMinutes} mins`
//                     : "Not selected"}
//                 </div>
//               </div>
//             </div>

//             {/* Resume-based (Coming soon) */}
//             <div className="mb-6">
//               <div className="flex items-center justify-between mb-2">
//                 <div>
//                   <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
//                     Resume Based Interview (Optional)
//                   </p>
//                   <p className="text-[11px] text-gray-500">
//                     Coming soon – get questions tailored to your resume.
//                   </p>
//                 </div>
//                 <button
//                   disabled
//                   className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-dashed border-gray-300 text-gray-400 cursor-not-allowed"
//                 >
//                   Upload Resume (Soon)
//                 </button>
//               </div>
//             </div>

//             {/* Round selection */}
//             <div className="mb-5">
//               <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
//                 Select Round *
//               </p>
//               <div className="grid grid-cols-2 gap-2">
//                 {ROUND_OPTIONS.map((opt) => {
//                   const active = config.roundType === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => handleSelectRound(opt.value)}
//                       className={`pill-option flex flex-col items-start px-3 py-2 rounded-xl border ${
//                         active
//                           ? "pill-option-active"
//                           : "pill-option-inactive"
//                       } text-xs`}
//                     >
//                       <span className="font-semibold text-[11px]">
//                         {opt.label}
//                       </span>
//                       <span className="text-[10px] opacity-80">
//                         {opt.subtitle}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Difficulty */}
//             <div className="mb-5">
//               <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
//                 Difficulty Level *
//               </p>
//               <div className="flex gap-2">
//                 {DIFFICULTY_OPTIONS.map((opt) => {
//                   const active = config.difficulty === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => handleSelectDifficulty(opt.value)}
//                       className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
//                         active
//                           ? "bg-purple-600 text-white border-purple-600"
//                           : "bg-white text-gray-700 border-gray-200"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Duration */}
//             <div className="mb-3">
//               <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
//                 Interview Duration *
//               </p>
//               <div className="flex gap-2">
//                 {DURATION_OPTIONS.map((opt) => {
//                   const active = config.durationMinutes === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => handleSelectDuration(opt.value)}
//                       className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
//                         active
//                           ? "duration-pill-active"
//                           : "duration-pill-inactive"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <p className="mt-3 text-[11px] text-gray-400">
//               * You can change these options by creating a new session later.
//             </p>
//           </section>

//           {/* RIGHT: Setup Checklist + Device Test */}
//           <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h2 className="font-display text-lg font-bold text-gray-900">
//                   Practice Prerequisite
//                 </h2>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Test your devices and confirm everything is ready.
//                 </p>
//               </div>
//               <div className="text-xs text-gray-400">
//                 <span className="font-semibold">
//                   {configComplete &&
//                   systemCheck.micPermission === "granted"
//                     ? 2
//                     : 1}
//                   /2
//                 </span>{" "}
//                 required steps
//               </div>
//             </div>

//             {/* Device test panel */}
//             <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3 flex flex-col gap-3">
//               {/* Video preview */}
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="flex-1">
//                   <div className="text-[11px] font-semibold text-gray-600 mb-1">
//                     Camera Preview (optional)
//                   </div>
//                   <div className="aspect-video rounded-lg bg-gray-900/90 flex items-center justify-center overflow-hidden border border-gray-800 relative">
//                     <video
//                       ref={videoRef}
//                       className="w-full h-full object-cover"
//                       muted
//                       playsInline
//                     />
//                     {!mediaStreamRef.current && (
//                       <span className="absolute text-[11px] text-gray-400">
//                         Camera will appear here after you allow access.
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Mic meter */}
//                 <div className="w-full sm:w-40 flex flex-col justify-between">
//                   <div>
//                     <div className="text-[11px] font-semibold text-gray-600 mb-1">
//                       Mic Level
//                     </div>
//                     <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
//                       <div
//                         className="h-2 rounded-full bg-emerald-500 transition-all"
//                         style={{
//                           width: `${Math.min(audioLevel * 100, 100)}%`,
//                         }}
//                       />
//                     </div>
//                     <p className="mt-1.5 text-[11px] text-gray-400">
//                       Speak normally and watch the bar move.
//                     </p>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={handleTestDevices}
//                     className="mt-3 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
//                   >
//                     {systemCheck.micPermission === "granted"
//                       ? "Retest mic & camera"
//                       : "Test mic & camera"}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Checklist items */}
//             <ul className="space-y-3 text-sm flex-1">
//               {/* Config */}
//               <ChecklistItem
//                 label="Interview setup completed"
//                 description="Role, round, difficulty and duration are selected."
//                 done={configComplete}
//                 required
//               />

//               {/* Browser compatibility */}
//               <ChecklistItem
//                 label="Browser is compatible"
//                 description="Supports microphone and camera access."
//                 done={systemCheck.browserOk}
//                 warn={!systemCheck.browserOk}
//                 required
//               />

//               {/* Mic permission (required) */}
//               <ChecklistItem
//                 label="Microphone is enabled"
//                 description="You have allowed mic access for this browser tab."
//                 done={systemCheck.micPermission === "granted"}
//                 warn={systemCheck.micPermission !== "granted"}
//                 required
//               />

//               {/* Mic activity (optional but recommended) */}
//               <ChecklistItem
//                 label="Mic input detected"
//                 description="We detected your voice input while you were speaking."
//                 done={systemCheck.micActivityOk}
//                 warn={!systemCheck.micActivityOk}
//               />

//               {/* Camera (optional) */}
//               <ChecklistItem
//                 label="Camera preview (optional)"
//                 description="Recommended for a more realistic interview experience."
//                 done={systemCheck.cameraPermission === "granted"}
//                 warn={!systemCheck.cameraPermission === "granted"}
//               />

//               {/* Network */}
//               <ChecklistItem
//                 label="Network looks stable (optional)"
//                 description={
//                   systemCheck.networkLatencyMs != null
//                     ? `Ping: ~${Math.round(
//                         systemCheck.networkLatencyMs
//                       )} ms. Under 800 ms is recommended.`
//                     : "We will run a quick ping test when you arrive."
//                 }
//                 done={systemCheck.networkOk}
//                 warn={!systemCheck.networkOk}
//               />
//             </ul>

//             {/* Errors */}
//             {localError && (
//               <div className="mt-3 text-xs text-red-500">{localError}</div>
//             )}
//             {session.createError && (
//               <div className="mt-3 text-xs text-red-500">
//                 {session.createError}
//               </div>
//             )}

//             {/* Start button */}
//             <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
//               <p className="text-[11px] text-gray-400 max-w-xs">
//                 Required: interview config and microphone access. Camera and
//                 network checks are recommended but optional.
//               </p>
//               <button
//                 type="button"
//                 disabled={!canStartInterview}
//                 onClick={handleStartInterview}
//                 className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm ${
//                   canStartInterview
//                     ? "bg-teal-500 hover:bg-teal-600"
//                     : "bg-gray-300 cursor-not-allowed"
//                 }`}
//               >
//                 {session.status === "creating"
//                   ? "Starting..."
//                   : "Start Interview"}
//               </button>
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ChecklistItem({ label, description, done, warn, required }) {
//   const iconClass = done
//     ? "text-emerald-500"
//     : warn
//     ? "text-amber-500"
//     : "text-gray-300";

//   return (
//     <li className="flex items-start gap-3">
//       <div
//         className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${iconClass} border-current`}
//       >
//         {done ? (
//           <svg
//             className="w-3 h-3"
//             viewBox="0 0 20 20"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2.2"
//           >
//             <path d="M16 5L8 15l-4-4" />
//           </svg>
//         ) : (
//           <svg
//             className="w-2.5 h-2.5"
//             viewBox="0 0 20 20"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <circle cx="10" cy="10" r="7" />
//           </svg>
//         )}
//       </div>
//       <div>
//         <p className="text-xs font-semibold text-gray-800">
//           {label}{" "}
//           {required && (
//             <span className="text-[10px] text-red-400 font-normal">(required)</span>
//           )}
//         </p>
//         {description && (
//           <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
//         )}
//       </div>
//     </li>
//   );
// }































// // src/pages/RoleInterviewSetupPage.jsx

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   fetchAiInterviewRole,
//   createAiInterviewSession,
//   setConfigField,
//   setSystemCheckField,
//   resetAiInterviewSessionState,
//   checkAiInterviewNetwork,
// } from "../slice/aiInterviewSessionSlice";

// // Base round options – coding will be conditionally hidden for non-coding roles
// const ROUND_OPTIONS_BASE = [
//   { value: "WARMUP", label: "Warm Up", subtitle: "Non-technical" },
//   { value: "ROLE_RELATED", label: "Role Related", subtitle: "Technical" },
//   { value: "BEHAVIORAL", label: "Behavioral", subtitle: "HR" },
//   { value: "CODING", label: "Coding", subtitle: "Programming" },
// ];

// const DIFFICULTY_OPTIONS = [
//   { value: "BEGINNER", label: "Beginner" },
//   { value: "INTERMEDIATE", label: "Intermediate" },
//   { value: "PROFESSIONAL", label: "Professional" },
// ];

// const DURATION_OPTIONS = [
//   { value: 5, label: "5 mins" },
//   { value: 15, label: "15 mins" },
//   { value: 30, label: "30 mins" },
// ];

// export default function RoleInterviewSetupPage() {
//   const { slug } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [localError, setLocalError] = useState(null);
//   const [audioLevel, setAudioLevel] = useState(0); // 0..1

//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const mediaStreamRef = useRef(null);
//   const animationFrameRef = useRef(null);
//   const videoRef = useRef(null);

//   const {
//     role,
//     roleLoading,
//     roleError,
//     config,
//     systemCheck,
//     session,
//   } = useSelector((state) => state.aiInterviewSession);

//   // Load role and reset state
//   useEffect(() => {
//     dispatch(resetAiInterviewSessionState());
//     if (slug) {
//       dispatch(fetchAiInterviewRole(slug));
//     }

//     // browser capabilities
//     const mediaSupported = !!(
//       navigator.mediaDevices && navigator.mediaDevices.getUserMedia
//     );
//     dispatch(
//       setSystemCheckField({
//         field: "browserOk",
//         value: mediaSupported,
//       })
//     );

//     // network ping
//     dispatch(checkAiInterviewNetwork());

//     return () => {
//       stopMediaAndAudio();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [slug, dispatch]);

//   // Determine if this is a coding-related role, based on name/category keywords
//   const isCodingRole = useMemo(() => {
//     if (!role) return false;
//     const haystack = `${role.name ?? ""} ${role.category ?? ""}`.toLowerCase();
//     const codingKeywords = [
//       "engineer",
//       "developer",
//       "software",
//       "backend",
//       "front-end",
//       "frontend",
//       "full stack",
//       "programmer",
//       "sde",
//       "swe",
//     ];
//     return codingKeywords.some((kw) => haystack.includes(kw));
//   }, [role]);

//   // Only show Coding round for coding-related roles
//   const visibleRoundOptions = useMemo(() => {
//     if (!isCodingRole) {
//       return ROUND_OPTIONS_BASE.filter((opt) => opt.value !== "CODING");
//     }
//     return ROUND_OPTIONS_BASE;
//   }, [isCodingRole]);

//   const configComplete = useMemo(() => {
//     return (
//       !!config.roundType &&
//       !!config.difficulty &&
//       !!config.durationMinutes &&
//       !!role
//     );
//   }, [config.roundType, config.difficulty, config.durationMinutes, role]);

//   const canStartInterview = useMemo(() => {
//     // Required: config + browserOk + mic permission granted.
//     // Optional: mic activity, camera, network.
//     return (
//       configComplete &&
//       systemCheck.browserOk &&
//       systemCheck.micPermission === "granted" &&
//       session.status !== "creating"
//     );
//   }, [
//     configComplete,
//     systemCheck.browserOk,
//     systemCheck.micPermission,
//     session.status,
//   ]);

//   const handleSelectRound = (value) => {
//     dispatch(setConfigField({ field: "roundType", value }));
//   };

//   const handleSelectDifficulty = (value) => {
//     dispatch(setConfigField({ field: "difficulty", value }));
//   };

//   const handleSelectDuration = (value) => {
//     dispatch(setConfigField({ field: "durationMinutes", value }));
//   };

//   // Request mic + camera and start simple audio level meter
//   const handleTestDevices = async () => {
//     setLocalError(null);

//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       setLocalError(
//         "Your browser does not support microphone access. Please try a modern browser."
//       );
//       dispatch(
//         setSystemCheckField({ field: "micPermission", value: "denied" })
//       );
//       return;
//     }

//     try {
//       // Audio mandatory, video optional but we ask both for preview.
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       mediaStreamRef.current = stream;

//       // Mic permission granted
//       dispatch(
//         setSystemCheckField({ field: "micPermission", value: "granted" })
//       );
//       dispatch(
//         setSystemCheckField({ field: "cameraPermission", value: "granted" })
//       );

//       // Attach to video for preview (optional)
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play().catch(() => {});
//       }

//       setupAudioAnalyser(stream);
//     } catch (err) {
//       console.error("getUserMedia error", err);
//       dispatch(
//         setSystemCheckField({
//           field: "micPermission",
//           value: "denied",
//         })
//       );
//       setLocalError(
//         "Could not access microphone. Please allow mic access and try again."
//       );
//     }
//   };

//   const setupAudioAnalyser = (stream) => {
//     try {
//       const AudioContext =
//         window.AudioContext || window.webkitAudioContext || null;
//       if (!AudioContext) {
//         console.warn("AudioContext not supported; cannot show level meter.");
//         return;
//       }

//       const audioContext = new AudioContext();
//       audioContextRef.current = audioContext;

//       const analyser = audioContext.createAnalyser();
//       analyser.fftSize = 512;
//       analyserRef.current = analyser;

//       const source = audioContext.createMediaStreamSource(stream);
//       source.connect(analyser);

//       const dataArray = new Uint8Array(analyser.frequencyBinCount);

//       const updateLevel = () => {
//         analyser.getByteFrequencyData(dataArray);
//         let sum = 0;
//         for (let i = 0; i < dataArray.length; i += 1) {
//           sum += dataArray[i];
//         }
//         const avg = sum / dataArray.length; // 0..255
//         const norm = avg / 255; // 0..1

//         setAudioLevel(norm);

//         if (norm > 0.15) {
//           // some voice activity detected
//           dispatch(
//             setSystemCheckField({ field: "micActivityOk", value: true })
//           );
//         }

//         animationFrameRef.current = requestAnimationFrame(updateLevel);
//       };

//       updateLevel();
//     } catch (e) {
//       console.warn("Failed to setup audio analyser", e);
//     }
//   };

//   const stopMediaAndAudio = () => {
//     if (animationFrameRef.current) {
//       cancelAnimationFrame(animationFrameRef.current);
//       animationFrameRef.current = null;
//     }
//     if (audioContextRef.current) {
//       audioContextRef.current.close().catch(() => {});
//       audioContextRef.current = null;
//     }
//     if (mediaStreamRef.current) {
//       mediaStreamRef.current.getTracks().forEach((t) => t.stop());
//       mediaStreamRef.current = null;
//     }
//   };

//   const handleStartInterview = async () => {
//     setLocalError(null);
//     if (!canStartInterview || !role) return;

//     const payload = {
//       role_slug: role.slug,
//       round_type: config.roundType,
//       difficulty: config.difficulty,
//       duration_minutes: config.durationMinutes,
//     };

//     try {
//       const action = await dispatch(createAiInterviewSession(payload));
//       if (createAiInterviewSession.fulfilled.match(action)) {
//         const newSession = action.payload;
//         // we can stop media preview now; LiveKit will take over later
//         stopMediaAndAudio();
//          navigate(`/ai-interview/live/${newSession.id}`);
//         // TODO: navigate to live page when ready
//         console.log("Session created:", newSession);
//       } else {
//         setLocalError(
//           action.payload?.detail || "Failed to start AI interview session."
//         );
//       }
//     } catch (err) {
//       setLocalError("Failed to start AI interview session.");
//     }
//   };

//   return (
//     <div
//       className="min-h-screen bg-gray-50 font-sans py-10"
//       style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
//     >
//       <style>{`
//         .font-display { font-family: 'Sora', system-ui, sans-serif; }
//         .pill-option { transition: all 0.18s ease; }
//         .pill-option-active {
//           background: #0F172A;
//           color: white;
//           border-color: #0F172A;
//         }
//         .pill-option-inactive {
//           background: white;
//           color: #374151;
//           border-color: #E5E7EB;
//         }
//         .pill-option:hover {
//           box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08);
//           transform: translateY(-1px);
//         }
//         .duration-pill-active {
//           background: #0D9488;
//           color: white;
//           border-color: #0D9488;
//         }
//         .duration-pill-inactive {
//           background: white;
//           color: #374151;
//           border-color: #E5E7EB;
//         }
//       `}</style>

//       <div className="max-w-5xl mx-auto px-4 sm:px-6">
//         {/* Header / Breadcrumb */}
//         <div className="mb-6 flex items-center justify-between gap-3">
//           <div>
//             <button
//               onClick={() => navigate("/ai-interview/roles")}
//               className="inline-flex items-center text-xs text-gray-500 hover:text-teal-600"
//             >
//               <svg
//                 className="w-3.5 h-3.5 mr-1"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M15 19l-7-7 7-7" />
//               </svg>
//               Back to roles
//             </button>
//             <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-gray-900">
//               {role ? role.name : "Loading role..."}
//             </h1>
//             {role?.category && (
//               <p className="text-xs uppercase tracking-wide text-gray-400 mt-1">
//                 {role.category}
//               </p>
//             )}
//           </div>

//           <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
//             <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 font-semibold">
//               <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
//               AI Practice
//             </span>
//             <span>Step 1 of 2 · Setup</span>
//           </div>
//         </div>

//         {/* Loading / Error */}
//         {roleLoading && (
//           <div className="mb-4 text-sm text-gray-500">
//             Loading role details...
//           </div>
//         )}
//         {roleError && (
//           <div className="mb-4 text-sm text-red-500">{roleError}</div>
//         )}

//         {/* Main layout: left config, right checklist */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* LEFT: Interview Details */}
//           <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
//             <h2 className="font-display text-lg font-bold text-gray-900 mb-1">
//               Interview Details
//             </h2>
//             <p className="text-xs text-gray-500 mb-4">
//               Configure your AI interview round before joining.
//             </p>

//             {/* Role + Round summary */}
//             <div className="mb-5">
//               <div className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                 <div>
//                   <div className="text-sm font-semibold text-gray-900">
//                     {role ? role.name : "Role"}
//                   </div>
//                   {config.roundType && (
//                     <div className="text-xs text-gray-500 mt-0.5">
//                       {(() => {
//                         const opt = ROUND_OPTIONS_BASE.find(
//                           (r) => r.value === config.roundType
//                         );
//                         return opt ? opt.label : "";
//                       })()}
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-[11px] text-gray-400">
//                   Duration:{" "}
//                   {config.durationMinutes
//                     ? `${config.durationMinutes} mins`
//                     : "Not selected"}
//                 </div>
//               </div>
//             </div>

//             {/* Resume-based (Coming soon) */}
//             <div className="mb-6">
//               <div className="flex items-center justify-between mb-2">
//                 <div>
//                   <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
//                     Resume Based Interview (Optional)
//                   </p>
//                   <p className="text-[11px] text-gray-500">
//                     Coming soon – get questions tailored to your resume.
//                   </p>
//                 </div>
//                 <button
//                   disabled
//                   className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-dashed border-gray-300 text-gray-400 cursor-not-allowed"
//                 >
//                   Upload Resume (Soon)
//                 </button>
//               </div>
//             </div>

//             {/* Round selection */}
//             <div className="mb-5">
//               <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
//                 Select Round *
//               </p>
//               <div className="grid grid-cols-2 gap-2">
//                 {visibleRoundOptions.map((opt) => {
//                   const active = config.roundType === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => handleSelectRound(opt.value)}
//                       className={`pill-option flex flex-col items-start px-3 py-2 rounded-xl border ${
//                         active
//                           ? "pill-option-active"
//                           : "pill-option-inactive"
//                       } text-xs`}
//                     >
//                       <span className="font-semibold text-[11px]">
//                         {opt.label}
//                       </span>
//                       <span className="text-[10px] opacity-80">
//                         {opt.subtitle}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Difficulty */}
//             <div className="mb-5">
//               <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
//                 Difficulty Level *
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {DIFFICULTY_OPTIONS.map((opt) => {
//                   const active = config.difficulty === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => handleSelectDifficulty(opt.value)}
//                       className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
//                         active
//                           ? "bg-purple-600 text-white border-purple-600"
//                           : "bg-white text-gray-700 border-gray-200"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Duration */}
//             <div className="mb-3">
//               <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
//                 Interview Duration *
//               </p>
//               <div className="flex gap-2">
//                 {DURATION_OPTIONS.map((opt) => {
//                   const active = config.durationMinutes === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => handleSelectDuration(opt.value)}
//                       className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
//                         active
//                           ? "duration-pill-active"
//                           : "duration-pill-inactive"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <p className="mt-3 text-[11px] text-gray-400">
//               * You can change these options by creating a new session later.
//             </p>
//           </section>

//           {/* RIGHT: Setup Checklist + Device Test */}
//           <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h2 className="font-display text-lg font-bold text-gray-900">
//                   Practice Prerequisite
//                 </h2>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Test your devices and confirm everything is ready.
//                 </p>
//               </div>
//               <div className="text-xs text-gray-400">
//                 <span className="font-semibold">
//                   {configComplete &&
//                   systemCheck.micPermission === "granted"
//                     ? 2
//                     : 1}
//                   /2
//                 </span>{" "}
//                 required steps
//               </div>
//             </div>

//             {/* Device test panel */}
//             <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3 flex flex-col gap-3">
//               {/* Video preview */}
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="flex-1">
//                   <div className="text-[11px] font-semibold text-gray-600 mb-1">
//                     Camera Preview (optional)
//                   </div>
//                   <div className="aspect-video rounded-lg bg-gray-900/90 flex items-center justify-center overflow-hidden border border-gray-800 relative">
//                     <video
//                       ref={videoRef}
//                       className="w-full h-full object-cover"
//                       muted
//                       playsInline
//                     />
//                     {!mediaStreamRef.current && (
//                       <span className="absolute text-[11px] text-gray-400">
//                         Camera will appear here after you allow access.
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Mic meter */}
//                 <div className="w-full sm:w-40 flex flex-col justify-between">
//                   <div>
//                     <div className="text-[11px] font-semibold text-gray-600 mb-1">
//                       Mic Level
//                     </div>
//                     <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
//                       <div
//                         className="h-2 rounded-full bg-emerald-500 transition-all"
//                         style={{
//                           width: `${Math.min(audioLevel * 100, 100)}%`,
//                         }}
//                       />
//                     </div>
//                     <p className="mt-1.5 text-[11px] text-gray-400">
//                       Speak normally and watch the bar move.
//                     </p>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={handleTestDevices}
//                     className="mt-3 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
//                   >
//                     {systemCheck.micPermission === "granted"
//                       ? "Retest mic & camera"
//                       : "Test mic & camera"}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Checklist items */}
//             <ul className="space-y-3 text-sm flex-1">
//               {/* Config */}
//               <ChecklistItem
//                 label="Interview setup completed"
//                 description="Role, round, difficulty and duration are selected."
//                 done={configComplete}
//                 required
//               />

//               {/* Browser compatibility */}
//               <ChecklistItem
//                 label="Browser is compatible"
//                 description="Supports microphone and camera access."
//                 done={systemCheck.browserOk}
//                 warn={!systemCheck.browserOk}
//                 required
//               />

//               {/* Mic permission (required) */}
//               <ChecklistItem
//                 label="Microphone is enabled"
//                 description="You have allowed mic access for this browser tab."
//                 done={systemCheck.micPermission === "granted"}
//                 warn={systemCheck.micPermission !== "granted"}
//                 required
//               />

//               {/* Mic activity (optional but recommended) */}
//               <ChecklistItem
//                 label="Mic input detected"
//                 description="We detected your voice input while you were speaking."
//                 done={systemCheck.micActivityOk}
//                 warn={!systemCheck.micActivityOk}
//               />

//               {/* Camera (optional) */}
//               <ChecklistItem
//                 label="Camera preview (optional)"
//                 description="Recommended for a more realistic interview experience."
//                 done={systemCheck.cameraPermission === "granted"}
//                 warn={!systemCheck.cameraPermission === "granted"}
//               />

//               {/* Network */}
//               <ChecklistItem
//                 label="Network looks stable (optional)"
//                 description={
//                   systemCheck.networkLatencyMs != null
//                     ? `Ping: ~${Math.round(
//                         systemCheck.networkLatencyMs
//                       )} ms. Under 800 ms is recommended.`
//                     : "We will run a quick ping test when you arrive."
//                 }
//                 done={systemCheck.networkOk}
//                 warn={!systemCheck.networkOk}
//               />
//             </ul>

//             {/* Errors */}
//             {localError && (
//               <div className="mt-3 text-xs text-red-500">{localError}</div>
//             )}
//             {session.createError && (
//               <div className="mt-3 text-xs text-red-500">
//                 {session.createError}
//               </div>
//             )}

//             {/* Start button */}
//             <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
//               <p className="text-[11px] text-gray-400 max-w-xs">
//                 Required: interview config and microphone access. Camera and
//                 network checks are recommended but optional.
//               </p>
//               <button
//                 type="button"
//                 disabled={!canStartInterview}
//                 onClick={handleStartInterview}
//                 className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm ${
//                   canStartInterview
//                     ? "bg-teal-500 hover:bg-teal-600"
//                     : "bg-gray-300 cursor-not-allowed"
//                 }`}
//               >
//                 {session.status === "creating"
//                   ? "Starting..."
//                   : "Start Interview"}
//               </button>
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ChecklistItem({ label, description, done, warn, required }) {
//   const iconClass = done
//     ? "text-emerald-500"
//     : warn
//     ? "text-amber-500"
//     : "text-gray-300";

//   return (
//     <li className="flex items-start gap-3">
//       <div
//         className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${iconClass} border-current`}
//       >
//         {done ? (
//           <svg
//             className="w-3 h-3"
//             viewBox="0 0 20 20"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2.2"
//           >
//             <path d="M16 5L8 15l-4-4" />
//           </svg>
//         ) : (
//           <svg
//             className="w-2.5 h-2.5"
//             viewBox="0 0 20 20"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             ircle cx="10" cy="10" r="7" /
//           </svg>
//         )}
//       </div>
//       <div>
//         <p className="text-xs font-semibold text-gray-800">
//           {label}{" "}
//           {required && (
//             <span className="text-[10px] text-red-400 font-normal">(required)</span>
//           )}
//         </p>
//         {description && (
//           <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
//         )}
//       </div>
//     </li>
//   );
// }






























// src/features/aiInterview/pages/RoleInterviewSetupPage.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchAiInterviewRole,
  createAiInterviewSession,
  setConfigField,
  setSystemCheckField,
  resetAiInterviewSessionState,
  checkAiInterviewNetwork,
} from "../slice/aiInterviewSessionSlice";

const ROUND_OPTIONS_BASE = [
  { value: "WARMUP", label: "Warm Up", subtitle: "Non-technical", icon: "🌤️" },
  { value: "ROLE_RELATED", label: "Role Related", subtitle: "Technical", icon: "🎯" },
  { value: "BEHAVIORAL", label: "Behavioral", subtitle: "HR Round", icon: "🤝" },
  { value: "CODING", label: "Coding", subtitle: "Programming", icon: "💻" },
];

const DIFFICULTY_OPTIONS = [
  { value: "BEGINNER", label: "Beginner", color: "emerald", desc: "Entry level" },
  { value: "INTERMEDIATE", label: "Intermediate", color: "amber", desc: "Mid level" },
  { value: "PROFESSIONAL", label: "Professional", color: "rose", desc: "Senior level" },
];

const DURATION_OPTIONS = [
  { value: 5, label: "5 mins", desc: "Quick" },
  { value: 15, label: "15 mins", desc: "Standard" },
  { value: 30, label: "30 mins", desc: "Full" },
];

export default function RoleInterviewSetupPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [localError, setLocalError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const videoRef = useRef(null);

  const { role, roleLoading, roleError, config, systemCheck, session } =
    useSelector((state) => state.aiInterviewSession);

  useEffect(() => {
    dispatch(resetAiInterviewSessionState());
    if (slug) dispatch(fetchAiInterviewRole(slug));
    const mediaSupported = !!(navigator.mediaDevices?.getUserMedia);
    dispatch(setSystemCheckField({ field: "browserOk", value: mediaSupported }));
    dispatch(checkAiInterviewNetwork());
    return () => stopMediaAndAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, dispatch]);

  const isCodingRole = useMemo(() => {
    if (!role) return false;
    const haystack = `${role.name ?? ""} ${role.category ?? ""}`.toLowerCase();
    return ["engineer","developer","software","backend","front-end","frontend","full stack","programmer","sde","swe"].some((kw) => haystack.includes(kw));
  }, [role]);

  const visibleRoundOptions = useMemo(() =>
    isCodingRole ? ROUND_OPTIONS_BASE : ROUND_OPTIONS_BASE.filter((o) => o.value !== "CODING"),
  [isCodingRole]);

  const configComplete = useMemo(() =>
    !!config.roundType && !!config.difficulty && !!config.durationMinutes && !!role,
  [config.roundType, config.difficulty, config.durationMinutes, role]);

  const canStartInterview = useMemo(() =>
    configComplete && systemCheck.browserOk && systemCheck.micPermission === "granted" && session.status !== "creating",
  [configComplete, systemCheck.browserOk, systemCheck.micPermission, session.status]);

  const handleTestDevices = async () => {
    setLocalError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setLocalError("Your browser does not support microphone access.");
      dispatch(setSystemCheckField({ field: "micPermission", value: "denied" }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      dispatch(setSystemCheckField({ field: "micPermission", value: "granted" }));
      dispatch(setSystemCheckField({ field: "cameraPermission", value: "granted" }));
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
      setupAudioAnalyser(stream);
    } catch (err) {
      dispatch(setSystemCheckField({ field: "micPermission", value: "denied" }));
      setLocalError("Could not access microphone. Please allow mic access and try again.");
    }
  };

  const setupAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        setAudioLevel(avg);
        if (avg > 0.15) dispatch(setSystemCheckField({ field: "micActivityOk", value: true }));
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) { console.warn(e); }
  };

  const stopMediaAndAudio = () => {
    if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach((t) => t.stop()); mediaStreamRef.current = null; }
  };

  const handleStartInterview = async () => {
    setLocalError(null);
    if (!canStartInterview || !role) return;
    try {
      const action = await dispatch(createAiInterviewSession({
        role_slug: role.slug, round_type: config.roundType, difficulty: config.difficulty, duration_minutes: config.durationMinutes,
      }));
      if (createAiInterviewSession.fulfilled.match(action)) {
        const newSession = action.payload;
        stopMediaAndAudio();
        navigate(`/ai-interview/live/${newSession.id}`);
        console.log("Session created:", action.payload);
      } else {
        setLocalError(action.payload?.detail || "Failed to start session.");
      }
    } catch { setLocalError("Failed to start AI interview session."); }
  };

  const selectedRound = ROUND_OPTIONS_BASE.find((r) => r.value === config.roundType);
  const selectedDifficulty = DIFFICULTY_OPTIONS.find((d) => d.value === config.difficulty);

  const checklistItems = [
    { label: "Interview setup completed", description: "Role, round, difficulty and duration are selected.", done: configComplete, warn: !configComplete, required: true },
    { label: "Browser is compatible", description: "Supports microphone and camera access.", done: systemCheck.browserOk, warn: !systemCheck.browserOk, required: true },
    { label: "Microphone is enabled", description: "You have allowed mic access for this browser tab.", done: systemCheck.micPermission === "granted", warn: systemCheck.micPermission !== "granted", required: true },
    { label: "Mic input detected", description: "We detected your voice input while you were speaking.", done: systemCheck.micActivityOk, warn: !systemCheck.micActivityOk },
    { label: "Camera preview", description: "Recommended for a more realistic interview experience.", done: systemCheck.cameraPermission === "granted", warn: false },
    {
      label: "Network stability",
      description: systemCheck.networkLatencyMs != null
        ? `Ping: ~${Math.round(systemCheck.networkLatencyMs)} ms — under 800 ms is recommended.`
        : "A quick ping test will run in the background.",
      done: systemCheck.networkOk,
      warn: !systemCheck.networkOk,
    },
  ];

  const requiredDone = checklistItems.filter((c) => c.required && c.done).length;
  const requiredTotal = checklistItems.filter((c) => c.required).length;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        .font-display { font-family: 'Sora', system-ui, sans-serif; }
        .card { background: white; border-radius: 1.25rem; border: 1px solid #F1F5F9; box-shadow: 0 1px 12px rgba(0,0,0,0.05); }
        .round-btn { transition: all 0.16s ease; border: 1.5px solid #E5E7EB; background: white; }
        .round-btn:hover { border-color: #0D9488; box-shadow: 0 4px 16px rgba(13,148,136,0.1); transform: translateY(-1px); }
        .round-btn-active { border-color: #0F172A !important; background: #0F172A !important; color: white !important; box-shadow: 0 4px 20px rgba(15,23,42,0.2) !important; }
        .diff-btn { transition: all 0.16s ease; border: 1.5px solid #E5E7EB; background: white; }
        .diff-btn:hover { transform: translateY(-1px); }
        .dur-btn { transition: all 0.16s ease; border: 1.5px solid #E5E7EB; background: white; }
        .dur-btn-active { border-color: #0D9488 !important; background: #0D9488 !important; color: white !important; }
        .dur-btn:hover { border-color: #0D9488; }
        .progress-ring { transition: stroke-dashoffset 0.5s ease; }
        .checklist-item { transition: background 0.15s; }
        .checklist-item:hover { background: #F8FAFC; }
        .mic-bar { transition: width 0.08s ease; }
        .start-btn { transition: all 0.18s ease; }
        .start-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(13,148,136,0.3); }
      `}</style>

      {/* ─── TOP NAV BAR ─── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo + Back */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <span className="text-white font-display font-bold text-xs">IV</span>
              </div>
              <span className="font-display font-bold text-gray-900 text-base tracking-tight hidden sm:block">Intraview</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <button
              onClick={() => navigate("/ai-interview/roles")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-teal-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              Back to roles
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 rounded-full px-3 py-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                AI Practice
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">1</div>
                <span className="text-[10px] text-teal-600 font-semibold hidden sm:block">Setup</span>
              </div>
              <div className="w-5 h-px bg-gray-200" />
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-[10px] font-bold flex items-center justify-center">2</div>
                <span className="text-[10px] text-gray-400 font-semibold hidden sm:block">Interview</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── PAGE BODY ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Page header ── */}
        <div className="mb-7">
          {roleLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading role details…
            </div>
          )}
          {roleError && (
            <div className="mb-3 inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {roleError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-1">Interview Setup</p>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {role ? role.name : "Loading role…"}
              </h1>
              {role?.category && (
                <p className="text-xs uppercase tracking-widest text-gray-400 mt-1 font-medium">{role.category}</p>
              )}
            </div>

            {/* Config summary chips */}
            {(config.roundType || config.difficulty || config.durationMinutes) && (
              <div className="flex flex-wrap gap-2">
                {config.roundType && (
                  <span className="inline-flex items-center gap-1 bg-slate-900 text-white text-[11px] font-semibold rounded-full px-3 py-1">
                    {selectedRound?.icon} {selectedRound?.label}
                  </span>
                )}
                {config.difficulty && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-3 py-1 ${
                    selectedDifficulty?.color === "emerald" ? "bg-emerald-100 text-emerald-700" :
                    selectedDifficulty?.color === "amber" ? "bg-amber-100 text-amber-700" :
                    "bg-rose-100 text-rose-700"
                  }`}>
                    {selectedDifficulty?.label}
                  </span>
                )}
                {config.durationMinutes && (
                  <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-full px-3 py-1">
                    {config.durationMinutes} mins
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ════════ LEFT: Interview Details ════════ */}
          <div className="card p-6 flex flex-col gap-6">

            {/* Card header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">Interview Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">Configure your session before joining.</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500 bg-teal-50 border border-teal-100 rounded-full px-2.5 py-1">Step 1</span>
            </div>

            {/* Role + duration summary pill */}
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100 rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{role?.name ?? "—"}</p>
                {selectedRound && (
                  <p className="text-[11px] text-gray-400 mt-0.5">{selectedRound.label} · {selectedRound.subtitle}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Duration</p>
                <p className="text-sm font-bold text-gray-700">{config.durationMinutes ? `${config.durationMinutes} min` : "—"}</p>
              </div>
            </div>

            {/* Resume-based banner */}
            <div className="flex items-center justify-between gap-3 border border-dashed border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50">
              <div>
                <p className="text-xs font-semibold text-gray-700">Resume-Based Interview <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5 font-bold">Coming Soon</span></p>
                <p className="text-[11px] text-gray-400 mt-0.5">Get questions tailored to your specific background.</p>
              </div>
              <button disabled className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-300 border border-gray-200 cursor-not-allowed">
                Upload Resume
              </button>
            </div>

            {/* ── Round selection ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Select Round <span className="text-red-400 ml-0.5">*</span></p>
                <p className="text-[10px] text-gray-400">{visibleRoundOptions.length} available</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {visibleRoundOptions.map((opt) => {
                  const active = config.roundType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => dispatch(setConfigField({ field: "roundType", value: opt.value }))}
                      className={`round-btn flex items-center gap-3 px-3.5 py-3 rounded-xl text-left ${active ? "round-btn-active" : ""}`}
                    >
                      <span className="text-lg leading-none">{opt.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold leading-tight ${active ? "text-white" : "text-gray-800"}`}>{opt.label}</p>
                        <p className={`text-[10px] mt-0.5 ${active ? "text-white/70" : "text-gray-400"}`}>{opt.subtitle}</p>
                      </div>
                      {active && (
                        <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Difficulty ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Difficulty Level <span className="text-red-400 ml-0.5">*</span></p>
              <div className="grid grid-cols-3 gap-2.5">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const active = config.difficulty === opt.value;
                  const colors = {
                    emerald: { bg: "bg-emerald-500", ring: "ring-emerald-300", light: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                    amber:   { bg: "bg-amber-400",   ring: "ring-amber-300",   light: "bg-amber-50   border-amber-200   text-amber-700"   },
                    rose:    { bg: "bg-rose-500",     ring: "ring-rose-300",     light: "bg-rose-50   border-rose-200   text-rose-700"     },
                  }[opt.color];
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => dispatch(setConfigField({ field: "difficulty", value: opt.value }))}
                      className={`diff-btn flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center ${
                        active
                          ? `${colors.light} ring-2 ${colors.ring} border-transparent`
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${active ? colors.bg : "bg-gray-300"}`} />
                      <p className={`text-[11px] font-bold ${active ? "" : "text-gray-700"}`}>{opt.label}</p>
                      <p className={`text-[10px] ${active ? "opacity-70" : "text-gray-400"}`}>{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Duration ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Interview Duration <span className="text-red-400 ml-0.5">*</span></p>
              <div className="grid grid-cols-3 gap-2.5">
                {DURATION_OPTIONS.map((opt) => {
                  const active = config.durationMinutes === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => dispatch(setConfigField({ field: "durationMinutes", value: opt.value }))}
                      className={`dur-btn flex flex-col items-center gap-0.5 py-3 px-2 rounded-xl border text-center ${active ? "dur-btn-active" : ""}`}
                    >
                      <p className={`text-sm font-extrabold font-display ${active ? "text-white" : "text-gray-800"}`}>{opt.label}</p>
                      <p className={`text-[10px] font-medium ${active ? "text-white/70" : "text-gray-400"}`}>{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-3">
              * These settings can be changed by creating a new session at any time.
            </p>
          </div>

          {/* ════════ RIGHT: Prerequisites & Device Test ════════ */}
          <div className="card p-6 flex flex-col gap-5">

            {/* Card header with progress ring */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">Practice Prerequisites</h2>
                <p className="text-xs text-gray-400 mt-0.5">Confirm your devices are ready before joining.</p>
              </div>
              {/* Circle progress */}
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke={requiredDone === requiredTotal ? "#0D9488" : "#F59E0B"}
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - requiredDone / requiredTotal)}`}
                    className="progress-ring"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-gray-700">{requiredDone}/{requiredTotal}</span>
                </div>
              </div>
            </div>

            {/* ── Device test panel ── */}
            <div className="rounded-xl border border-gray-100 bg-gradient-to-b from-gray-50 to-gray-50/50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">Device Check</p>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Camera preview */}
                <div className="flex-1">
                  <p className="text-[11px] text-gray-500 font-medium mb-1.5">Camera Preview <span className="text-gray-400">(optional)</span></p>
                  <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center relative border border-slate-800">
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    {!mediaStreamRef.current && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.72v6.56a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                        </div>
                        <p className="text-[10px] text-white/40 text-center px-3">Camera preview after you allow access</p>
                      </div>
                    )}
                    {systemCheck.cameraPermission === "granted" && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] text-white font-semibold">LIVE</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mic panel */}
                <div className="w-full sm:w-36 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium mb-1.5">Mic Level</p>
                    {/* Vertical bars visualiser */}
                    <div className="flex items-end gap-0.5 h-10 mb-2">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const threshold = i / 16;
                        const active = audioLevel > threshold;
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-sm transition-all duration-75 ${active ? "bg-emerald-500" : "bg-gray-200"}`}
                            style={{ height: `${20 + i * 5}%` }}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">Speak naturally and watch the bars move.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestDevices}
                    className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors"
                  >
                    {systemCheck.micPermission === "granted" ? "↺ Retest" : "▶ Test Devices"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Checklist ── */}
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Readiness Checklist</p>
              <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {checklistItems.map((item, idx) => (
                  <ChecklistItem key={idx} {...item} />
                ))}
              </div>
            </div>

            {/* Errors */}
            {(localError || session.createError) && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/></svg>
                <p className="text-xs text-red-600">{localError || session.createError}</p>
              </div>
            )}

            {/* ── Start button ── */}
            <div className="border-t border-gray-100 pt-4">
              {/* Status note */}
              {!canStartInterview && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {!configComplete && <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 font-medium">⚠ Complete interview setup</span>}
                  {systemCheck.micPermission !== "granted" && <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 font-medium">⚠ Enable microphone access</span>}
                </div>
              )}

              <button
                type="button"
                disabled={!canStartInterview}
                onClick={handleStartInterview}
                className={`start-btn w-full py-3.5 rounded-xl text-sm font-bold text-white relative overflow-hidden ${
                  canStartInterview
                    ? "bg-teal-500 hover:bg-teal-600 cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {canStartInterview && (
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 opacity-0 hover:opacity-100 transition-opacity" />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {session.status === "creating" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Starting session…
                    </>
                  ) : (
                    <>
                      Start Interview
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </>
                  )}
                </span>
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-2.5">
                Microphone access is required · Camera & network are optional
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ label, description, done, warn, required }) {
  return (
    <div className="checklist-item flex items-start gap-3 px-3.5 py-3">
      {/* Icon */}
      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        done
          ? "bg-emerald-500"
          : warn
          ? "bg-amber-100 border-2 border-amber-300"
          : "bg-gray-100 border-2 border-gray-200"
      }`}>
        {done ? (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
        ) : warn ? (
          <svg className="w-2.5 h-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-semibold text-gray-800">{label}</p>
          {required && (
            <span className="text-[9px] font-bold uppercase tracking-wide text-red-400 bg-red-50 border border-red-100 rounded-full px-1.5 py-0.5">required</span>
          )}
          {!required && (
            <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-1.5 py-0.5">optional</span>
          )}
        </div>
        {description && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>

      {/* Status badge */}
      <div className="shrink-0">
        {done ? (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">Ready</span>
        ) : warn ? (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Pending</span>
        ) : (
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">—</span>
        )}
      </div>
    </div>
  );
}































// // src/pages/RoleInterviewSetupPage.jsx

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   fetchAiInterviewRole,
//   createAiInterviewSession,
//   setConfigField,
//   setSystemCheckField,
//   resetAiInterviewSessionState,
//   checkAiInterviewNetwork,
// } from "../slice/aiInterviewSessionSlice";

// const ROUND_OPTIONS_BASE = [
//   { value: "WARMUP", label: "Warm Up", subtitle: "Non-technical", icon: "🌤️" },
//   { value: "ROLE_RELATED", label: "Role Related", subtitle: "Technical", icon: "🎯" },
//   { value: "BEHAVIORAL", label: "Behavioral", subtitle: "HR Round", icon: "🤝" },
//   { value: "CODING", label: "Coding", subtitle: "Programming", icon: "💻" },
// ];

// const DIFFICULTY_OPTIONS = [
//   { value: "BEGINNER", label: "Beginner", color: "emerald", desc: "Entry level" },
//   { value: "INTERMEDIATE", label: "Intermediate", color: "amber", desc: "Mid level" },
//   { value: "PROFESSIONAL", label: "Professional", color: "rose", desc: "Senior level" },
// ];

// const DURATION_OPTIONS = [
//   { value: 5, label: "5 mins", desc: "Quick" },
//   { value: 15, label: "15 mins", desc: "Standard" },
//   { value: 30, label: "30 mins", desc: "Full" },
// ];

// export default function RoleInterviewSetupPage() {
//   const { slug } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [localError, setLocalError] = useState(null);
//   const [audioLevel, setAudioLevel] = useState(0);

//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const mediaStreamRef = useRef(null);
//   const animationFrameRef = useRef(null);
//   const videoRef = useRef(null);

//   const { role, roleLoading, roleError, config, systemCheck, session } =
//     useSelector((state) => state.aiInterviewSession);

//   useEffect(() => {
//     dispatch(resetAiInterviewSessionState());
//     if (slug) dispatch(fetchAiInterviewRole(slug));
//     const mediaSupported = !!(navigator.mediaDevices?.getUserMedia);
//     dispatch(setSystemCheckField({ field: "browserOk", value: mediaSupported }));
//     dispatch(checkAiInterviewNetwork());
//     return () => stopMediaAndAudio();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [slug, dispatch]);

//   const isCodingRole = useMemo(() => {
//     if (!role) return false;
//     const haystack = `${role.name ?? ""} ${role.category ?? ""}`.toLowerCase();
//     return ["engineer","developer","software","backend","front-end","frontend","full stack","programmer","sde","swe"].some((kw) => haystack.includes(kw));
//   }, [role]);

//   const visibleRoundOptions = useMemo(() =>
//     isCodingRole ? ROUND_OPTIONS_BASE : ROUND_OPTIONS_BASE.filter((o) => o.value !== "CODING"),
//   [isCodingRole]);

//   const configComplete = useMemo(() =>
//     !!config.roundType && !!config.difficulty && !!config.durationMinutes && !!role,
//   [config.roundType, config.difficulty, config.durationMinutes, role]);

//   const canStartInterview = useMemo(() =>
//     configComplete && systemCheck.browserOk && systemCheck.micPermission === "granted" && session.status !== "creating",
//   [configComplete, systemCheck.browserOk, systemCheck.micPermission, session.status]);

//   const handleTestDevices = async () => {
//     setLocalError(null);
//     if (!navigator.mediaDevices?.getUserMedia) {
//       setLocalError("Your browser does not support microphone access.");
//       dispatch(setSystemCheckField({ field: "micPermission", value: "denied" }));
//       return;
//     }
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
//       mediaStreamRef.current = stream;
//       dispatch(setSystemCheckField({ field: "micPermission", value: "granted" }));
//       dispatch(setSystemCheckField({ field: "cameraPermission", value: "granted" }));
//       if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
//       setupAudioAnalyser(stream);
//     } catch (err) {
//       dispatch(setSystemCheckField({ field: "micPermission", value: "denied" }));
//       setLocalError("Could not access microphone. Please allow mic access and try again.");
//     }
//   };

//   const setupAudioAnalyser = (stream) => {
//     try {
//       const AudioCtx = window.AudioContext || window.webkitAudioContext;
//       if (!AudioCtx) return;
//       const ctx = new AudioCtx();
//       audioContextRef.current = ctx;
//       const analyser = ctx.createAnalyser();
//       analyser.fftSize = 512;
//       analyserRef.current = analyser;
//       ctx.createMediaStreamSource(stream).connect(analyser);
//       const data = new Uint8Array(analyser.frequencyBinCount);
//       const tick = () => {
//         analyser.getByteFrequencyData(data);
//         const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
//         setAudioLevel(avg);
//         if (avg > 0.15) dispatch(setSystemCheckField({ field: "micActivityOk", value: true }));
//         animationFrameRef.current = requestAnimationFrame(tick);
//       };
//       tick();
//     } catch (e) { console.warn(e); }
//   };

//   const stopMediaAndAudio = () => {
//     if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; }
//     if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
//     if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach((t) => t.stop()); mediaStreamRef.current = null; }
//   };

//   const handleStartInterview = async () => {
//     setLocalError(null);
//     if (!canStartInterview || !role) return;
//     try {
//       const action = await dispatch(createAiInterviewSession({
//         role_slug: role.slug, round_type: config.roundType, difficulty: config.difficulty, duration_minutes: config.durationMinutes,
//       }));
//       if (createAiInterviewSession.fulfilled.match(action)) {
//         stopMediaAndAudio();
//         console.log("Session created:", action.payload);
//       } else {
//         setLocalError(action.payload?.detail || "Failed to start session.");
//       }
//     } catch { setLocalError("Failed to start AI interview session."); }
//   };

//   const selectedRound = ROUND_OPTIONS_BASE.find((r) => r.value === config.roundType);
//   const selectedDifficulty = DIFFICULTY_OPTIONS.find((d) => d.value === config.difficulty);

//   const checklistItems = [
//     { label: "Interview setup completed", description: "Role, round, difficulty and duration are selected.", done: configComplete, warn: !configComplete, required: true },
//     { label: "Browser is compatible", description: "Supports microphone and camera access.", done: systemCheck.browserOk, warn: !systemCheck.browserOk, required: true },
//     { label: "Microphone is enabled", description: "You have allowed mic access for this browser tab.", done: systemCheck.micPermission === "granted", warn: systemCheck.micPermission !== "granted", required: true },
//     { label: "Mic input detected", description: "We detected your voice input while you were speaking.", done: systemCheck.micActivityOk, warn: !systemCheck.micActivityOk },
//     { label: "Camera preview", description: "Recommended for a more realistic interview experience.", done: systemCheck.cameraPermission === "granted", warn: false },
//     {
//       label: "Network stability",
//       description: systemCheck.networkLatencyMs != null
//         ? `Ping: ~${Math.round(systemCheck.networkLatencyMs)} ms — under 800 ms is recommended.`
//         : "A quick ping test will run in the background.",
//       done: systemCheck.networkOk,
//       warn: !systemCheck.networkOk,
//     },
//   ];

//   const requiredDone = checklistItems.filter((c) => c.required && c.done).length;
//   const requiredTotal = checklistItems.filter((c) => c.required).length;

//   return (
//     <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');
//         .font-display { font-family: 'Sora', system-ui, sans-serif; }
//         .card { background: white; border-radius: 1.25rem; border: 1px solid #F1F5F9; box-shadow: 0 1px 12px rgba(0,0,0,0.05); }
//         .round-btn { transition: all 0.16s ease; border: 1.5px solid #E5E7EB; background: white; }
//         .round-btn:hover { border-color: #0D9488; box-shadow: 0 4px 16px rgba(13,148,136,0.1); transform: translateY(-1px); }
//         .round-btn-active { border-color: #0F172A !important; background: #0F172A !important; color: white !important; box-shadow: 0 4px 20px rgba(15,23,42,0.2) !important; }
//         .diff-btn { transition: all 0.16s ease; border: 1.5px solid #E5E7EB; background: white; }
//         .diff-btn:hover { transform: translateY(-1px); }
//         .dur-btn { transition: all 0.16s ease; border: 1.5px solid #E5E7EB; background: white; }
//         .dur-btn-active { border-color: #0D9488 !important; background: #0D9488 !important; color: white !important; }
//         .dur-btn:hover { border-color: #0D9488; }
//         .progress-ring { transition: stroke-dashoffset 0.5s ease; }
//         .checklist-item { transition: background 0.15s; }
//         .checklist-item:hover { background: #F8FAFC; }
//         .mic-bar { transition: width 0.08s ease; }
//         .start-btn { transition: all 0.18s ease; }
//         .start-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(13,148,136,0.3); }
//       `}</style>

//       {/* ─── TOP NAV BAR ─── */}
//       <nav className="sticky top-0 z-50 bg-white border-b border-gray-100" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
//         <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
//           {/* Logo + Back */}
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
//                 <span className="text-white font-display font-bold text-xs">IV</span>
//               </div>
//               <span className="font-display font-bold text-gray-900 text-base tracking-tight hidden sm:block">Intraview</span>
//             </div>
//             <div className="h-4 w-px bg-gray-200" />
//             <button
//               onClick={() => navigate("/ai-interview/roles")}
//               className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-teal-600 transition-colors"
//             >
//               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
//               Back to roles
//             </button>
//           </div>

//           {/* Step indicator */}
//           <div className="flex items-center gap-3">
//             <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
//               <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 rounded-full px-3 py-1 font-semibold">
//                 <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
//                 AI Practice
//               </span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <div className="flex items-center gap-1">
//                 <div className="w-6 h-6 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">1</div>
//                 <span className="text-[10px] text-teal-600 font-semibold hidden sm:block">Setup</span>
//               </div>
//               <div className="w-5 h-px bg-gray-200" />
//               <div className="flex items-center gap-1">
//                 <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-[10px] font-bold flex items-center justify-center">2</div>
//                 <span className="text-[10px] text-gray-400 font-semibold hidden sm:block">Interview</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* ─── PAGE BODY ─── */}
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

//         {/* ── Page header ── */}
//         <div className="mb-7">
//           {roleLoading && (
//             <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
//               <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
//               Loading role details…
//             </div>
//           )}
//           {roleError && (
//             <div className="mb-3 inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg px-3 py-2">
//               <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
//               {roleError}
//             </div>
//           )}

//           <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
//             <div>
//               <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-1">Interview Setup</p>
//               <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
//                 {role ? role.name : "Loading role…"}
//               </h1>
//               {role?.category && (
//                 <p className="text-xs uppercase tracking-widest text-gray-400 mt-1 font-medium">{role.category}</p>
//               )}
//             </div>

//             {/* Config summary chips */}
//             {(config.roundType || config.difficulty || config.durationMinutes) && (
//               <div className="flex flex-wrap gap-2">
//                 {config.roundType && (
//                   <span className="inline-flex items-center gap-1 bg-slate-900 text-white text-[11px] font-semibold rounded-full px-3 py-1">
//                     {selectedRound?.icon} {selectedRound?.label}
//                   </span>
//                 )}
//                 {config.difficulty && (
//                   <span className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-3 py-1 ${
//                     selectedDifficulty?.color === "emerald" ? "bg-emerald-100 text-emerald-700" :
//                     selectedDifficulty?.color === "amber" ? "bg-amber-100 text-amber-700" :
//                     "bg-rose-100 text-rose-700"
//                   }`}>
//                     {selectedDifficulty?.label}
//                   </span>
//                 )}
//                 {config.durationMinutes && (
//                   <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-full px-3 py-1">
//                     {config.durationMinutes} mins
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Single-column stack ── */}
//         <div className="flex flex-col gap-6">

//           {/* ════════ Interview Details ════════ */}
//           <div className="card p-6 flex flex-col gap-6 w-full">

//             {/* Card header */}
//             <div className="flex items-start justify-between">
//               <div>
//                 <h2 className="font-display text-lg font-bold text-gray-900">Interview Details</h2>
//                 <p className="text-xs text-gray-400 mt-0.5">Configure your session before joining.</p>
//               </div>
//               <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500 bg-teal-50 border border-teal-100 rounded-full px-2.5 py-1">Step 1</span>
//             </div>

//             {/* Role + duration summary pill */}
//             <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100 rounded-xl px-4 py-3">
//               <div className="min-w-0">
//                 <p className="text-sm font-semibold text-gray-900 truncate">{role?.name ?? "—"}</p>
//                 {selectedRound && (
//                   <p className="text-[11px] text-gray-400 mt-0.5">{selectedRound.label} · {selectedRound.subtitle}</p>
//                 )}
//               </div>
//               <div className="text-right shrink-0">
//                 <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Duration</p>
//                 <p className="text-sm font-bold text-gray-700">{config.durationMinutes ? `${config.durationMinutes} min` : "—"}</p>
//               </div>
//             </div>

//             {/* Resume-based banner */}
//             <div className="flex items-center justify-between gap-3 border border-dashed border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50">
//               <div>
//                 <p className="text-xs font-semibold text-gray-700">Resume-Based Interview <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5 font-bold">Coming Soon</span></p>
//                 <p className="text-[11px] text-gray-400 mt-0.5">Get questions tailored to your specific background.</p>
//               </div>
//               <button disabled className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-300 border border-gray-200 cursor-not-allowed">
//                 Upload Resume
//               </button>
//             </div>

//             {/* ── Round selection ── */}
//             <div>
//               <div className="flex items-center justify-between mb-3">
//                 <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Select Round <span className="text-red-400 ml-0.5">*</span></p>
//                 <p className="text-[10px] text-gray-400">{visibleRoundOptions.length} available</p>
//               </div>
//               <div className="grid grid-cols-2 gap-2.5">
//                 {visibleRoundOptions.map((opt) => {
//                   const active = config.roundType === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => dispatch(setConfigField({ field: "roundType", value: opt.value }))}
//                       className={`round-btn flex items-center gap-3 px-3.5 py-3 rounded-xl text-left ${active ? "round-btn-active" : ""}`}
//                     >
//                       <span className="text-lg leading-none">{opt.icon}</span>
//                       <div className="min-w-0">
//                         <p className={`text-xs font-bold leading-tight ${active ? "text-white" : "text-gray-800"}`}>{opt.label}</p>
//                         <p className={`text-[10px] mt-0.5 ${active ? "text-white/70" : "text-gray-400"}`}>{opt.subtitle}</p>
//                       </div>
//                       {active && (
//                         <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
//                           <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
//                         </div>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* ── Difficulty ── */}
//             <div>
//               <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Difficulty Level <span className="text-red-400 ml-0.5">*</span></p>
//               <div className="grid grid-cols-3 gap-2.5">
//                 {DIFFICULTY_OPTIONS.map((opt) => {
//                   const active = config.difficulty === opt.value;
//                   const colors = {
//                     emerald: { bg: "bg-emerald-500", ring: "ring-emerald-300", light: "bg-emerald-50 border-emerald-200 text-emerald-700" },
//                     amber:   { bg: "bg-amber-400",   ring: "ring-amber-300",   light: "bg-amber-50   border-amber-200   text-amber-700"   },
//                     rose:    { bg: "bg-rose-500",     ring: "ring-rose-300",     light: "bg-rose-50   border-rose-200   text-rose-700"     },
//                   }[opt.color];
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => dispatch(setConfigField({ field: "difficulty", value: opt.value }))}
//                       className={`diff-btn flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center ${
//                         active
//                           ? `${colors.light} ring-2 ${colors.ring} border-transparent`
//                           : "border-gray-200 bg-white hover:border-gray-300"
//                       }`}
//                     >
//                       <div className={`w-2 h-2 rounded-full ${active ? colors.bg : "bg-gray-300"}`} />
//                       <p className={`text-[11px] font-bold ${active ? "" : "text-gray-700"}`}>{opt.label}</p>
//                       <p className={`text-[10px] ${active ? "opacity-70" : "text-gray-400"}`}>{opt.desc}</p>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* ── Duration ── */}
//             <div>
//               <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Interview Duration <span className="text-red-400 ml-0.5">*</span></p>
//               <div className="grid grid-cols-3 gap-2.5">
//                 {DURATION_OPTIONS.map((opt) => {
//                   const active = config.durationMinutes === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => dispatch(setConfigField({ field: "durationMinutes", value: opt.value }))}
//                       className={`dur-btn flex flex-col items-center gap-0.5 py-3 px-2 rounded-xl border text-center ${active ? "dur-btn-active" : ""}`}
//                     >
//                       <p className={`text-sm font-extrabold font-display ${active ? "text-white" : "text-gray-800"}`}>{opt.label}</p>
//                       <p className={`text-[10px] font-medium ${active ? "text-white/70" : "text-gray-400"}`}>{opt.desc}</p>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-3">
//               * These settings can be changed by creating a new session at any time.
//             </p>
//           </div>

//           {/* ════════ Practice Prerequisites ════════ */}
//           <div className="card p-6 flex flex-col gap-5 w-full">

//             {/* Card header with progress ring */}
//             <div className="flex items-start justify-between">
//               <div>
//                 <h2 className="font-display text-lg font-bold text-gray-900">Practice Prerequisites</h2>
//                 <p className="text-xs text-gray-400 mt-0.5">Confirm your devices are ready before joining.</p>
//               </div>
//               {/* Circle progress */}
//               <div className="relative w-12 h-12 shrink-0">
//                 <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
//                   <circle cx="24" cy="24" r="20" fill="none" stroke="#F1F5F9" strokeWidth="4" />
//                   <circle
//                     cx="24" cy="24" r="20" fill="none"
//                     stroke={requiredDone === requiredTotal ? "#0D9488" : "#F59E0B"}
//                     strokeWidth="4" strokeLinecap="round"
//                     strokeDasharray={`${2 * Math.PI * 20}`}
//                     strokeDashoffset={`${2 * Math.PI * 20 * (1 - requiredDone / requiredTotal)}`}
//                     className="progress-ring"
//                   />
//                 </svg>
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <span className="text-[11px] font-bold text-gray-700">{requiredDone}/{requiredTotal}</span>
//                 </div>
//               </div>
//             </div>

//             {/* ── Device test panel ── */}
//             <div className="rounded-xl border border-gray-100 bg-gradient-to-b from-gray-50 to-gray-50/50 p-4">
//               <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">Device Check</p>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 {/* Camera preview */}
//                 <div className="flex-1">
//                   <p className="text-[11px] text-gray-500 font-medium mb-1.5">Camera Preview <span className="text-gray-400">(optional)</span></p>
//                   <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center relative border border-slate-800 max-h-48">
//                     <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
//                     {!mediaStreamRef.current && (
//                       <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
//                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
//                           <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.72v6.56a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
//                         </div>
//                         <p className="text-[10px] text-white/40 text-center px-3">Camera preview after you allow access</p>
//                       </div>
//                     )}
//                     {systemCheck.cameraPermission === "granted" && (
//                       <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-2 py-0.5">
//                         <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
//                         <span className="text-[9px] text-white font-semibold">LIVE</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Mic panel */}
//                 <div className="w-full sm:w-52 flex flex-col justify-between gap-3">
//                   <div>
//                     <p className="text-[11px] text-gray-500 font-medium mb-1.5">Mic Level</p>
//                     {/* Vertical bars visualiser */}
//                     <div className="flex items-end gap-0.5 h-10 mb-2">
//                       {Array.from({ length: 16 }).map((_, i) => {
//                         const threshold = i / 16;
//                         const active = audioLevel > threshold;
//                         return (
//                           <div
//                             key={i}
//                             className={`flex-1 rounded-sm transition-all duration-75 ${active ? "bg-emerald-500" : "bg-gray-200"}`}
//                             style={{ height: `${20 + i * 5}%` }}
//                           />
//                         );
//                       })}
//                     </div>
//                     <p className="text-[10px] text-gray-400 leading-relaxed">Speak naturally and watch the bars move.</p>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={handleTestDevices}
//                     className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors"
//                   >
//                     {systemCheck.micPermission === "granted" ? "↺ Retest" : "▶ Test Devices"}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* ── Checklist ── */}
//             <div className="flex-1">
//               <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Readiness Checklist</p>
//               <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
//                 {checklistItems.map((item, idx) => (
//                   <ChecklistItem key={idx} {...item} />
//                 ))}
//               </div>
//             </div>

//             {/* Errors */}
//             {(localError || session.createError) && (
//               <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
//                 <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/></svg>
//                 <p className="text-xs text-red-600">{localError || session.createError}</p>
//               </div>
//             )}

//             {/* ── Start button ── */}
//             <div className="border-t border-gray-100 pt-4">
//               {/* Status note */}
//               {!canStartInterview && (
//                 <div className="mb-3 flex flex-wrap gap-2">
//                   {!configComplete && <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 font-medium">⚠ Complete interview setup</span>}
//                   {systemCheck.micPermission !== "granted" && <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 font-medium">⚠ Enable microphone access</span>}
//                 </div>
//               )}

//               <button
//                 type="button"
//                 disabled={!canStartInterview}
//                 onClick={handleStartInterview}
//                 className={`start-btn w-full py-3.5 rounded-xl text-sm font-bold text-white relative overflow-hidden ${
//                   canStartInterview
//                     ? "bg-teal-500 hover:bg-teal-600 cursor-pointer"
//                     : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                 }`}
//               >
//                 {canStartInterview && (
//                   <span className="absolute inset-0 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 opacity-0 hover:opacity-100 transition-opacity" />
//                 )}
//                 <span className="relative flex items-center justify-center gap-2">
//                   {session.status === "creating" ? (
//                     <>
//                       <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
//                       Starting session…
//                     </>
//                   ) : (
//                     <>
//                       Start Interview
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
//                     </>
//                   )}
//                 </span>
//               </button>

//               <p className="text-center text-[11px] text-gray-400 mt-2.5">
//                 Microphone access is required · Camera & network are optional
//               </p>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// function ChecklistItem({ label, description, done, warn, required }) {
//   return (
//     <div className="checklist-item flex items-start gap-3 px-3.5 py-3">
//       {/* Icon */}
//       <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
//         done
//           ? "bg-emerald-500"
//           : warn
//           ? "bg-amber-100 border-2 border-amber-300"
//           : "bg-gray-100 border-2 border-gray-200"
//       }`}>
//         {done ? (
//           <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
//         ) : warn ? (
//           <svg className="w-2.5 h-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
//         ) : (
//           <div className="w-2 h-2 rounded-full bg-gray-300" />
//         )}
//       </div>

//       {/* Text */}
//       <div className="min-w-0 flex-1">
//         <div className="flex items-center gap-2 flex-wrap">
//           <p className="text-xs font-semibold text-gray-800">{label}</p>
//           {required && (
//             <span className="text-[9px] font-bold uppercase tracking-wide text-red-400 bg-red-50 border border-red-100 rounded-full px-1.5 py-0.5">required</span>
//           )}
//           {!required && (
//             <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-1.5 py-0.5">optional</span>
//           )}
//         </div>
//         {description && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{description}</p>}
//       </div>

//       {/* Status badge */}
//       <div className="shrink-0">
//         {done ? (
//           <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">Ready</span>
//         ) : warn ? (
//           <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Pending</span>
//         ) : (
//           <span className="text-[10px] font-bold text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">—</span>
//         )}
//       </div>
//     </div>
//   );
// }