import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Settings, Maximize2, Mic, Target, Clock, Lightbulb } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authentication/authSlice';
import { Link } from "react-router-dom";
import NotificationBell from '../features/notification/user/components/NotificationBell';
import CandidateNavbar from '../components/CandidateNavbar';
import CandidateFooter from '../components/CandidateFooter';
import { fetchSubscriptionPlans } from '../subscriptions/subscriptionSlice';
export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useSelector((state) => state.auth)
  const { plans, loading } = useSelector((state) => state.subscription) || { plans: [], loading: false };
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const handleLogin = () => navigate('/login')
  const handleSignup = () => navigate('/signup')
  const handleInterviewRequest = () => navigate('/interviewer/request')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">In</span>
              </div>
              <span className="text-xl font-bold text-gray-900">IntraView</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">FAQ</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Support</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Demo</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Subscribe</a>
            </nav>
              <div className="flex items-center space-x-4">
              {user ? (
                <button 
                  onClick={() => dispatch(logoutUser())}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleLogin}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={handleSignup}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header> */}

      <CandidateNavbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Real Practice,<br />
              Real <span className="bg-yellow-400 px-2">Confidence</span>
            </h1>
            <p className="text-gray-600 mb-8">
              AI-powered mock interviews that feel authentic. Practice with voice, get instant feedback, and build the confidence to land the job.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <button onClick={() => navigate('/ai-interview/roles')} className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition font-medium">
                Start AI Mock Interview Now
              </button>
              {/* <button className="text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium flex items-center">
                Try a Demo →
              </button> */}
            </div>
            <p className="text-sm text-gray-500">
              Trusted by candidates preparing for roles at
            </p>
            <div className="flex flex-wrap gap-6 mt-4 text-gray-400">
              <span>Google</span>
              <span>Apple</span>
              <span>Netflix</span>
              <span>Meta</span>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop" alt="Professional interview" className="rounded-lg shadow-lg w-full h-48 object-cover" />
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop" alt="Remote work" className="rounded-lg shadow-lg w-full h-48 object-cover mt-8" />
              <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop" alt="Collaboration" className="rounded-lg shadow-lg w-full h-48 object-cover" />
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop" alt="Success" className="rounded-lg shadow-lg w-full h-48 object-cover mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Smarter Interview Prep Starts Here
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Voice-Based Realism</h3>
              <p className="text-gray-600">
                Simulate real interviews using natural, two-way voice — not tedious, clunky typing.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Personalized Practice</h3>
              <p className="text-gray-600">
                Upload your resume and role to get tailored questions that match your background.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">On-Demand and Flexible</h3>
              <p className="text-gray-600">
                Practice anytime, on your schedule — whether at lunch or late at night.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Smart Feedback</h3>
              <p className="text-gray-600">
                Get clear insights on clarity, pacing, filler words, and communication quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div
          className="rounded-3xl bg-gray-100 p-10 md:p-16 shadow-xl"

        >
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT SIDE – TEXT */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
                Become an Interviewer on IntraView
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Share your expertise and mentor the next generation of professionals.
                IntraView allows seasoned candidates, working professionals, and
                industry experts to conduct mock interviews and get paid for each
                session. Flexible hours. Meaningful impact.
              </p>

              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  Flexible interview scheduling
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  Earn for every mock interview you conduct
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  Help candidates improve with real-world insights
                </li>
              </ul>

              <button
                className="px-8 py-3 bg-teal-500 rounded-xl text-white font-semibold shadow-md transition transform hover:scale-[1.02]"
                onClick={handleInterviewRequest}
              >
                Apply to Become an Interviewer →
              </button>
            </div>

            {/* RIGHT SIDE – ILLUSTRATION BLOCK */}
            <div className="relative">
              <div
                className="rounded-2xl shadow-2xl p-6 md:p-8"
                style={{ backgroundColor: "#ffffff" }}
              >
                <img
                  src=""
                  alt="Interviewer illustration"
                  className="w-full h-auto object-contain opacity-95"
                />
              </div>

              {/* Decorative floating shape */}
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-30 blur-xl"
                style={{ backgroundColor: "#A1BC98" }}
              ></div>

              <div
                className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-20 blur-xl"
                style={{ backgroundColor: "#D2DCB6" }}
              ></div>
            </div>

          </div>
        </div>
      </section>



      {/* Pricing Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Interview Smarter. Prepare Better.
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Get access to AI mock interviews, expert interviewers, and guided feedback — all in one platform.
          </p>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading plans...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans?.filter(p => !p.name.toLowerCase().includes("basic") && p.is_active).map(plan => {
                const isPro = plan.name.toLowerCase().includes("pro");
                return (
                  <div key={plan.id} className={isPro ? "bg-gray-900 text-white rounded-xl p-8 relative" : "bg-white border-2 border-gray-200 rounded-xl p-8 relative"}>

                    {!isPro && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm">
                        Most Popular
                      </span>
                    )}

                    <p className={`text-sm font-medium mb-1 ${isPro ? "text-gray-400" : "text-gray-600"}`}>
                      {plan.name}
                    </p>
                    <div className="mb-2">
                      <span className={`text-4xl font-bold ${isPro ? "text-white" : "text-gray-900"}`}>₹{plan.price_inr}</span>
                      <span className={isPro ? "text-gray-400" : "text-gray-600"}> /{plan.billing_cycle_days === 30 ? "month" : plan.billing_cycle_days + " days"}</span>
                    </div>

                    <p className={`text-sm mb-6 ${isPro ? "text-gray-400" : "text-gray-500"}`}>
                      {plan.description || (isPro ? "Built for serious candidates preparing aggressively." : "Best for beginners preparing consistently.")}
                    </p>

                    <ul className={`space-y-3 mb-8 ${isPro ? "text-white" : "text-gray-700"}`}>
                      <li className="flex items-center">
                        <span className={`mr-3 ${isPro ? "text-yellow-400" : "text-teal-500"}`}>✓</span>
                        {plan.monthly_free_tokens} free tokens/month
                      </li>
                      <li className="flex items-center">
                        <span className={`mr-3 ${isPro ? "text-yellow-400" : "text-teal-500"}`}>✓</span>
                        {plan.ai_interviews_per_month === -1 || plan.ai_interviews_per_month > 999 ? "Unlimited AI interviews" : `${plan.ai_interviews_per_month} AI mock interviews`}
                      </li>

                      {!isPro && (
                        <>
                          <li className="flex items-center">
                            <span className="text-teal-500 mr-3">✓</span>
                            Practice with multiple interview types
                          </li>
                          <li className="flex items-center">
                            <span className="text-teal-500 mr-3">✓</span>
                            Technical + behavioral preparation
                          </li>
                          <li className="flex items-center">
                            <span className="text-teal-500 mr-3">✓</span>
                            Better interview readiness
                          </li>
                        </>
                      )}

                      {isPro && (
                        <>
                          {plan.has_priority_booking && (
                            <li className="flex items-center">
                              <span className="text-yellow-400 mr-3">✓</span>
                              Priority booking
                            </li>
                          )}
                          {plan.has_advanced_ai_feedback && (
                            <li className="flex items-center">
                              <span className="text-yellow-400 mr-3">✓</span>
                              Advanced AI feedback
                            </li>
                          )}
                          <li className="flex items-center">
                            <span className="text-yellow-400 mr-3">✓</span>
                            Faster interview preparation
                          </li>
                          <li className="flex items-center">
                            <span className="text-yellow-400 mr-3">✓</span>
                            Premium mock interview experience
                          </li>
                        </>
                      )}
                    </ul>
                    <button
                      onClick={() => navigate('/subscriptions')}
                      className={`w-full py-3 mt-auto rounded-lg transition font-medium shadow-sm ${isPro ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500" : "bg-teal-500 text-white hover:bg-teal-600"}`}
                    >
                      {isPro ? "Go Pro" : "Start Preparing"}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Practice Like It's the Real Thing?
          </h2>
          <p className="text-teal-50 mb-8">
            Get started free and build the confidence to ace your next interview with<br />
            personalized, voice-driven sessions.
          </p>
          <button onClick={() => navigate('/candidate/interviewers')} className="bg-white text-teal-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium">
            Start Mock Interview Now
          </button>
        </div>
      </section>

      <CandidateFooter />
    </div>
  );
}




























// // src/Home.jsx  — Full redesign, all original logic preserved

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Mic, Target, Clock, Lightbulb,
//   ArrowRight, Star, Users, Zap,
//   CheckCircle, TrendingUp, Award,
//   Play, Pause, ChevronRight,
// } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { logoutUser } from '../authentication/authSlice';
// import { Link } from 'react-router-dom';
// import NotificationBell from '../features/notification/user/components/NotificationBell';
// import CandidateNavbar from '../components/CandidateNavbar';
// import CandidateFooter from '../components/CandidateFooter';
// import { fetchSubscriptionPlans } from '../subscriptions/subscriptionSlice';

// // ── Static data ──────────────────────────────────────────────
// const STATS = [
//   { num: '18K+', label: 'Mock Interviews Completed' },
//   { num: '4.9★', label: 'Average Candidate Rating' },
//   { num: '500+', label: 'Expert Interviewers' },
//   { num: '150+', label: 'Partner Companies' },
// ];

// const FEATURES = [
//   { icon: Mic, n: '01', title: 'Voice-Based Realism', body: 'Simulate real interviews using natural, two-way voice — not tedious, clunky typing.' },
//   { icon: Target, n: '02', title: 'AI-Personalized Practice', body: 'Upload your resume and role to get tailored questions that match your background.' },
//   { icon: Clock, n: '03', title: 'On-Demand and Flexible', body: 'Practice anytime, on your schedule — whether at lunch or late at night.' },
//   { icon: Lightbulb, n: '04', title: 'Instant Smart Feedback', body: 'Get clear insights on clarity, pacing, filler words, and communication quality.' },
// ];

// const STEPS = [
//   { icon: Users, n: '01', title: 'Choose Your Path', body: 'Pick a live peer interviewer or start an AI-powered session — instantly, any time.' },
//   { icon: Mic, n: '02', title: 'Practice Live', body: 'Have a real conversation. Voice-based, realistic, and focused on your target role.' },
//   { icon: TrendingUp, n: '03', title: 'Get Smarter Feedback', body: 'Receive detailed AI analysis on your answers, tone, clarity, confidence, and pacing.' },
// ];

// const INTERVIEWER_STATS = [
//   { icon: Users, val: '500+', label: 'Active Interviewers', accent: 'teal' },
//   { icon: Star, val: '4.8★', label: 'Avg Interviewer Rating', accent: 'yellow' },
//   { icon: TrendingUp, val: '2.4K', label: 'Sessions This Month', accent: 'teal' },
//   { icon: Award, val: '24', label: 'Countries Represented', accent: 'yellow' },
// ];

// // ── Component ────────────────────────────────────────────────
// export default function Home() {
//   const [isPlaying, setIsPlaying] = useState(false);

//   const { user } = useSelector((s) => s.auth);
//   const { plans, loading } = useSelector((s) => s.subscription) || { plans: [], loading: false };
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   useEffect(() => { dispatch(fetchSubscriptionPlans()); }, [dispatch]);

//   const handleLogin = () => navigate('/login');
//   const handleSignup = () => navigate('/signup');
//   const handleInterviewRequest = () => navigate('/interviewer/request');

//   return (
//     <div className="min-h-screen bg-white overflow-x-hidden">

//       {/* ── Custom fonts + keyframes ─────────────────────── */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700;12..96,800;12..96,900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

//         .bg-home  { font-family: 'DM Sans', sans-serif; }
//         .ff-disp  { font-family: 'Bricolage Grotesque', sans-serif; }
//         .ff-body  { font-family: 'DM Sans', sans-serif; }

//         @keyframes floatY  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)} }
//         @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.15);opacity:0} }

//         .anim-float   { animation: floatY 3.5s ease-in-out infinite; }
//         .anim-float-d { animation: floatY 4.2s 1s ease-in-out infinite; }
//         .anim-up      { animation: fadeUp 0.65s ease both; }
//         .anim-up-1    { animation-delay:.10s }
//         .anim-up-2    { animation-delay:.22s }
//         .anim-up-3    { animation-delay:.34s }
//         .anim-up-4    { animation-delay:.46s }

//         .live-pulse::before {
//           content:''; position:absolute; inset:0; border-radius:99px;
//           background:#14b8a6; animation:pulseRing 2s ease-out infinite;
//         }

//         .feat-card:hover .feat-num   { color:#ccfbf1; }
//         .feat-card:hover              { background:#f0fdfa; border-color:#99f6e4; }
//         .step-card:hover              { border-color:#14b8a6; box-shadow:0 8px 32px rgba(20,184,166,0.12); }

//         .price-card-starter:hover     { border-color:#14b8a6; box-shadow:0 8px 24px rgba(20,184,166,0.10); }
//       `}</style>

//       <CandidateNavbar />

//       {/* ═══════════════════════════════════════════════════
//           HERO
//       ═══════════════════════════════════════════════════ */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 bg-home">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">

//           {/* Left */}
//           <div>
//             {/* Tag pill */}
//             <div className="inline-flex items-center gap-2 border border-teal-200 bg-teal-50 rounded-full px-4 py-1.5 mb-7 anim-up">
//               <span className="relative w-2 h-2 live-pulse">
//                 <span className="absolute inset-0 bg-teal-500 rounded-full block" />
//               </span>
//               <span className="ff-body text-sm font-semibold text-teal-700">AI-Powered Mock Interviews</span>
//             </div>

//             <h1 className="ff-disp font-black leading-[1.03] text-gray-900 mb-6 anim-up anim-up-1"
//               style={{ fontSize: 'clamp(40px, 5vw, 68px)' }}>
//               Real Practice,<br />
//               Real{' '}
//               <span className="relative">
//                 <span className="relative z-10 px-2 py-0.5" style={{ background: '#facc15' }}>
//                   Confidence
//                 </span>
//               </span>
//             </h1>

//             <p className="ff-body text-lg text-gray-500 mb-8 max-w-lg leading-relaxed anim-up anim-up-2">
//               AI-powered mock interviews that feel authentic. Practice with voice,
//               get instant feedback, and build the confidence to land the job.
//             </p>

//             <div className="flex flex-wrap gap-3 mb-10 anim-up anim-up-3">
//               <button
//                 onClick={() => navigate('/ai-interview/roles')}
//                 className="ff-body font-semibold bg-teal-500 hover:bg-teal-600 text-white px-7 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg"
//                 style={{ boxShadow: '0 4px 18px rgba(20,184,166,0.35)' }}
//               >
//                 Start AI Mock Interview
//                 <ArrowRight size={15} />
//               </button>
//               <button
//                 onClick={() => navigate('/candidate/interviewers')}
//                 className="ff-body font-medium border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700 px-7 py-3.5 rounded-xl transition-all duration-200"
//               >
//                 Browse Interviewers
//               </button>
//             </div>

//             <div className="anim-up anim-up-4">
//               <p className="ff-body text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
//                 Trusted by candidates preparing for roles at
//               </p>
//               <div className="flex flex-wrap gap-6 ff-body text-sm font-bold text-gray-300">
//                 {['Google', 'Apple', 'Netflix', 'Meta'].map(c => (
//                   <span key={c} className="hover:text-gray-500 transition-colors cursor-default">{c}</span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right — dynamic collage */}
//           <div className="relative hidden lg:block anim-up anim-up-2">
//             {/* Main image */}
//             <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ height: 420 }}>
//               <img
//                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&h=420&fit=crop"
//                 alt="Professional interview"
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 rounded-3xl"
//                 style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.25) 0%, transparent 60%)' }} />
//             </div>

//             {/* Top-right floating image */}
//             <div className="absolute -top-5 -right-5 w-36 h-28 rounded-2xl overflow-hidden border-[3px] border-white shadow-xl anim-float">
//               <img
//                 src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=200&h=140&fit=crop"
//                 alt="Remote work"
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             {/* Bottom-right floating image */}
//             <div className="absolute -bottom-4 -right-7 w-32 h-24 rounded-2xl overflow-hidden border-[3px] border-white shadow-xl anim-float-d">
//               <img
//                 src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200&h=120&fit=crop"
//                 alt="Collaboration"
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             {/* Review card */}
//             <div className="absolute -left-8 bottom-16 bg-white rounded-2xl shadow-xl p-4 w-60 border border-gray-100 anim-float" style={{ animationDelay: '0.6s' }}>
//               <div className="flex gap-0.5 mb-2">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />
//                 ))}
//               </div>
//               <p className="ff-body text-xs font-semibold text-gray-800 mb-1 leading-snug">
//                 "Landed my Google offer after just 4 sessions!"
//               </p>
//               <p className="ff-body text-[10px] text-gray-400">— Arjun S., Software Engineer</p>
//             </div>

//             {/* Live badge */}
//             <div className="absolute top-5 left-5 bg-teal-500 text-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg"
//               style={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
//               <Zap size={11} />
//               Live AI Feedback
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════
//           STATS STRIP
//       ═══════════════════════════════════════════════════ */}
//       <section style={{ background: '#0f172a' }} className="py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-800">
//             {STATS.map(({ num, label }, i) => (
//               <div key={i} className="text-center px-6 py-2">
//                 <p className="ff-disp font-black text-teal-400 mb-1"
//                   style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}>{num}</p>
//                 <p className="ff-body text-xs text-gray-500">{label}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════
//           FEATURES
//       ═══════════════════════════════════════════════════ */}
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="max-w-lg mb-14">
//             <span className="ff-body text-xs font-bold text-teal-500 uppercase tracking-widest">Why IntraView</span>
//             <h2 className="ff-disp font-extrabold text-gray-900 mt-2 leading-tight"
//               style={{ fontSize: 'clamp(30px, 4vw, 46px)' }}>
//               Smarter Interview<br />Prep Starts Here
//             </h2>
//           </div>

//           <div className="grid md:grid-cols-2 gap-px rounded-2xl overflow-hidden"
//             style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
//             {FEATURES.map(({ icon: Icon, n, title, body }) => (
//               <div
//                 key={n}
//                 className="feat-card bg-white p-8 md:p-10 transition-all duration-200 cursor-default"
//                 style={{ borderColor: 'transparent', borderWidth: 1 }}
//               >
//                 <div className="flex items-start gap-5">
//                   <div className="flex-shrink-0">
//                     <span className="feat-num ff-disp font-black block leading-none mb-4 transition-colors duration-200"
//                       style={{ fontSize: 52, color: '#f1f5f9' }}>{n}</span>
//                     <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
//                       <Icon size={19} className="text-teal-600" />
//                     </div>
//                   </div>
//                   <div className="pt-3">
//                     <h3 className="ff-disp font-bold text-gray-900 mb-2" style={{ fontSize: 17 }}>{title}</h3>
//                     <p className="ff-body text-gray-500 text-sm leading-relaxed">{body}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════
//           HOW IT WORKS  (NEW)
//       ═══════════════════════════════════════════════════ */}
//       <section className="py-24" style={{ background: '#f8fafc' }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <span className="ff-body text-xs font-bold text-teal-500 uppercase tracking-widest">Simple Process</span>
//             <h2 className="ff-disp font-extrabold text-gray-900 mt-2"
//               style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
//               Land Your Job in 3 Steps
//             </h2>
//           </div>

//           <div className="grid md:grid-cols-3 gap-6 relative">
//             {/* Connecting line (desktop) */}
//             <div className="hidden md:block absolute top-10 left-1/4 right-1/4"
//               style={{ height: 1, background: 'linear-gradient(90deg, #14b8a6 0%, #99f6e4 100%)', top: 44 }} />

//             {STEPS.map(({ icon: Icon, n, title, body }, i) => (
//               <div
//                 key={n}
//                 className="step-card bg-white rounded-2xl p-8 border-2 border-gray-100 transition-all duration-200"
//               >
//                 <div className="flex items-center gap-4 mb-6">
//                   <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-md"
//                     style={{ boxShadow: '0 4px 14px rgba(20,184,166,0.35)' }}>
//                     <Icon size={22} className="text-white" />
//                   </div>
//                   <span className="ff-disp font-black text-gray-100" style={{ fontSize: 48 }}>{n}</span>
//                 </div>
//                 <h3 className="ff-disp font-bold text-gray-900 mb-2" style={{ fontSize: 18 }}>{title}</h3>
//                 <p className="ff-body text-gray-500 text-sm leading-relaxed">{body}</p>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-12">
//             <button
//               onClick={() => navigate('/ai-interview/roles')}
//               className="ff-body font-semibold bg-teal-500 hover:bg-teal-600 text-white px-8 py-3.5 rounded-xl transition-all duration-200 inline-flex items-center gap-2"
//               style={{ boxShadow: '0 4px 14px rgba(20,184,166,0.30)' }}
//             >
//               Start Practicing Now
//               <ArrowRight size={15} />
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════
//           BECOME AN INTERVIEWER
//       ═══════════════════════════════════════════════════ */}
//       <section className="py-24"
//         style={{ background: 'linear-gradient(135deg, #0f172a 0%, #052e16 60%, #134e4a 100%)' }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-16 items-center">

//             {/* Left text */}
//             <div>
//               <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-teal-500/30"
//                 style={{ background: 'rgba(20,184,166,0.12)' }}>
//                 <Award size={13} className="text-teal-400" />
//                 <span className="ff-body text-sm font-semibold text-teal-300">Earn While You Share</span>
//               </div>

//               <h2 className="ff-disp font-extrabold text-white leading-tight mb-6"
//                 style={{ fontSize: 'clamp(30px, 4vw, 50px)' }}>
//                 Become an<br />
//                 <span className="text-teal-400">Interviewer</span><br />
//                 on IntraView
//               </h2>

//               <p className="ff-body text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
//                 Share your expertise and mentor the next generation of professionals.
//                 Flexible hours. Meaningful impact. Real earnings per session.
//               </p>

//               <ul className="space-y-3 mb-10">
//                 {[
//                   'Flexible interview scheduling — your terms',
//                   'Earn tokens for every session you conduct',
//                   'Help candidates improve with real-world insights',
//                 ].map((item, i) => (
//                   <li key={i} className="flex items-start gap-3 ff-body text-gray-300">
//                     <CheckCircle size={17} className="text-teal-400 flex-shrink-0 mt-0.5" />
//                     {item}
//                   </li>
//                 ))}
//               </ul>

//               <button
//                 onClick={handleInterviewRequest}
//                 className="ff-body font-semibold bg-teal-500 hover:bg-teal-400 text-white px-8 py-3.5 rounded-xl inline-flex items-center gap-2 transition-all duration-200"
//                 style={{ boxShadow: '0 4px 20px rgba(20,184,166,0.40)' }}
//               >
//                 Apply to Become an Interviewer
//                 <ArrowRight size={15} />
//               </button>
//             </div>

//             {/* Right stats grid */}
//             <div className="grid grid-cols-2 gap-4">
//               {INTERVIEWER_STATS.map(({ icon: Icon, val, label, accent }, i) => (
//                 <div
//                   key={i}
//                   className="rounded-2xl p-6 transition-colors duration-200"
//                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
//                 >
//                   <Icon size={18} className={accent === 'teal' ? 'text-teal-400 mb-3' : 'text-yellow-400 mb-3'} />
//                   <p className={`ff-disp font-extrabold mb-1 ${accent === 'teal' ? 'text-teal-400' : 'text-yellow-400'}`}
//                     style={{ fontSize: 30 }}>{val}</p>
//                   <p className="ff-body text-xs text-gray-400">{label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════
//           PRICING
//       ═══════════════════════════════════════════════════ */}
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-14">
//             <span className="ff-body text-xs font-bold text-teal-500 uppercase tracking-widest">Plans & Pricing</span>
//             <h2 className="ff-disp font-extrabold text-gray-900 mt-2 leading-tight"
//               style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
//               Interview Smarter.<br />Prepare Better.
//             </h2>
//             <p className="ff-body text-gray-500 mt-4 max-w-xl mx-auto">
//               Get access to AI mock interviews, expert interviewers, and guided feedback — all in one platform.
//             </p>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center py-16 gap-3">
//               <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
//               <span className="ff-body text-gray-500">Loading plans…</span>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
//               {plans
//                 ?.filter(p => !p.name.toLowerCase().includes('basic') && p.is_active)
//                 .map(plan => {
//                   const isPro = plan.name.toLowerCase().includes('pro');
//                   return (
//                     <div
//                       key={plan.id}
//                       className={`relative rounded-2xl p-8 border-2 transition-all duration-200 ${isPro
//                           ? 'bg-gray-900 border-gray-700 text-white'
//                           : 'price-card-starter bg-white border-gray-200'
//                         }`}
//                     >
//                       {/* Badges */}
//                       {!isPro && (
//                         <span className="absolute -top-3 left-6 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full ff-body">
//                           Most Popular
//                         </span>
//                       )}
//                       {isPro && (
//                         <span className="absolute -top-3 left-6 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full ff-body">
//                           Pro
//                         </span>
//                       )}

//                       <p className={`ff-body text-sm font-medium mb-2 ${isPro ? 'text-gray-400' : 'text-gray-500'}`}>
//                         {plan.name}
//                       </p>

//                       <div className="flex items-end gap-1 mb-1">
//                         <span className={`ff-disp font-black ${isPro ? 'text-white' : 'text-gray-900'}`}
//                           style={{ fontSize: 48 }}>
//                           ₹{plan.price_inr}
//                         </span>
//                         <span className={`ff-body text-sm mb-2 ${isPro ? 'text-gray-400' : 'text-gray-500'}`}>
//                           /{plan.billing_cycle_days === 30 ? 'month' : `${plan.billing_cycle_days}d`}
//                         </span>
//                       </div>

//                       <p className={`ff-body text-sm mb-5 ${isPro ? 'text-gray-400' : 'text-gray-500'}`}>
//                         {plan.description || (isPro ? 'For serious candidates preparing aggressively.' : 'Best for beginners preparing consistently.')}
//                       </p>

//                       <div className={`w-full h-px mb-6 ${isPro ? 'bg-gray-700' : 'bg-gray-100'}`} />

//                       <ul className="space-y-3 mb-8">
//                         {[
//                           `${plan.monthly_free_tokens} free tokens/month`,
//                           plan.ai_interviews_per_month === -1 || plan.ai_interviews_per_month > 999
//                             ? 'Unlimited AI mock interviews'
//                             : `${plan.ai_interviews_per_month} AI mock interviews`,
//                           ...(!isPro ? ['Multiple interview types', 'Technical + behavioral prep'] : []),
//                           ...(isPro && plan.has_priority_booking ? ['Priority booking'] : []),
//                           ...(isPro && plan.has_advanced_ai_feedback ? ['Advanced AI feedback'] : []),
//                           ...(isPro ? ['Premium mock experience'] : []),
//                         ].map((item, i) => (
//                           <li key={i} className="flex items-center gap-3 ff-body text-sm">
//                             <CheckCircle size={14} className={isPro ? 'text-teal-400' : 'text-teal-500'} />
//                             <span className={isPro ? 'text-gray-300' : 'text-gray-600'}>{item}</span>
//                           </li>
//                         ))}
//                       </ul>

//                       <button
//                         onClick={() => navigate('/subscriptions')}
//                         className={`w-full py-3.5 rounded-xl ff-body font-semibold transition-all duration-200 ${isPro
//                             ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900'
//                             : 'bg-teal-500 hover:bg-teal-600 text-white'
//                           }`}
//                         style={!isPro ? { boxShadow: '0 4px 14px rgba(20,184,166,0.25)' } : {}}
//                       >
//                         {isPro ? 'Go Pro →' : 'Start Preparing →'}
//                       </button>
//                     </div>
//                   );
//                 })}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════
//           CTA BANNER
//       ═══════════════════════════════════════════════════ */}
//       <section className="py-24"
//         style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)' }}>
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 border border-white/25"
//             style={{ background: 'rgba(255,255,255,0.12)' }}>
//             <Zap size={12} className="text-white" />
//             <span className="ff-body text-sm font-medium text-white">Start free — no credit card needed</span>
//           </div>

//           <h2 className="ff-disp font-extrabold text-white mb-5 leading-tight"
//             style={{ fontSize: 'clamp(30px, 5vw, 52px)' }}>
//             Ready to Practice Like<br className="hidden sm:block" />
//             It's the Real Thing?
//           </h2>

//           <p className="ff-body text-teal-100 text-lg mb-10 max-w-xl mx-auto">
//             Get started free and build the confidence to ace your next interview with
//             personalized, voice-driven sessions.
//           </p>

//           <div className="flex flex-wrap justify-center gap-4">
//             <button
//               onClick={() => navigate('/candidate/interviewers')}
//               className="ff-body font-semibold bg-white text-teal-700 hover:bg-teal-50 px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-xl"
//             >
//               Start Mock Interview Now
//               <ArrowRight size={15} />
//             </button>
//             <button
//               onClick={() => navigate('/ai-interview/roles')}
//               className="ff-body font-medium border-2 border-white/40 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl transition-all duration-200"
//             >
//               Try AI Interview →
//             </button>
//           </div>
//         </div>
//       </section>

//       <CandidateFooter />
//     </div>
//   );
// }