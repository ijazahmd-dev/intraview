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
