
import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom'; 
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Settings, Maximize2, Mic, Target, Clock, Lightbulb } from 'lucide-react';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate()

  const handleLogin = () => navigate('/login')
  const handleSignup = () => navigate('/signup')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
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
                  onClick={logoutUser}
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
      </header>

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
              <button className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition font-medium">
                Start Mock Interview Now
              </button>
              <button className="text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium flex items-center">
                Try a Demo →
              </button>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-100 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Experience a Voice-Based Mock Interview Now
              </h2>
              <p className="text-gray-600 mb-6">
                Try a sample mock interview — no signup required. See SkillVerse simulate real interview scenarios with voice and instant insights.
              </p>
              <button className="text-teal-600 font-medium hover:text-teal-700 flex items-center">
                Try a Free Demo Interview →
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-2xl">
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Interviewer" className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="text-white font-medium">Just in Case</p>
                    <p className="text-gray-400 text-sm">@ Morgan Winters</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-white">
                <button className="hover:bg-gray-700 p-2 rounded">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-white text-gray-900 hover:bg-gray-100 p-3 rounded-full"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button className="hover:bg-gray-700 p-2 rounded">
                  <SkipForward className="w-5 h-5" />
                </button>
                <button className="hover:bg-gray-700 p-2 rounded">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button className="hover:bg-gray-700 p-2 rounded">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="hover:bg-gray-700 p-2 rounded">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Say Goodbye to $200 Mock Interviews
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Our unlimited, voice-based mock interviews for less than a <span className="font-semibold">cappuccino a session</span>.<br />
            Practice as you'd like — whenever you need it.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
              <p className="text-sm font-medium text-gray-600 mb-2">Starter</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$14</span>
                <span className="text-gray-600"> /month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-500 mr-2">✓</span>
                  10 mock interviews / month
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-500 mr-2">✓</span>
                  Multiple interview types
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-500 mr-2">✓</span>
                  Role-specific prompts
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-teal-500 mr-2">✓</span>
                  Smart AI model
                </li>
              </ul>
              <button className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition font-medium">
                Start Now
              </button>
            </div>
            <div className="bg-gray-900 text-white rounded-xl p-8 relative">
              <p className="text-sm font-medium text-gray-400 mb-2">Pro</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$39</span>
                <span className="text-gray-400"> /month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">✓</span>
                  Unlimited mock interviews
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">✓</span>
                  All interview types
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">✓</span>
                  Advanced performance feedback
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">✓</span>
                  Priority support access
                </li>
              </ul>
              <button className="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg hover:bg-yellow-500 transition font-medium">
                Get Unlimited
              </button>
            </div>
          </div>
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
          <button className="bg-white text-teal-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium">
            Start Mock Interview Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center space-x-8 mb-6">
            <a href="#" className="hover:text-white">Home</a>
            <a href="#" className="hover:text-white">About</a>
            <a href="#" className="hover:text-white">Blog</a>
            <a href="#" className="hover:text-white">FAQ</a>
            <a href="#" className="hover:text-white">Interview</a>
            <a href="#" className="hover:text-white">Support</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
          <p className="text-center text-sm">
            © 2025 IntraView. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
