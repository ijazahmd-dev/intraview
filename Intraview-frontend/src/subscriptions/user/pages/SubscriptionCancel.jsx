import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { XCircle, RotateCcw, Home, Shield, Clock } from 'lucide-react';
import CandidateNavbar from '../../../components/CandidateNavbar.jsx';
import CandidateFooter from '../../../components/CandidateFooter.jsx';

const REASSURANCES = [
  { icon: Shield, text: 'No payment was processed — your card is safe.' },
  { icon: Clock,  text: 'Plans are always available — try again anytime.' },
];

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    toast.info('No worries! You can upgrade anytime.');
    navigate('/subscriptions');
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .sc-anim   { animation: fadeUp 0.55s ease both; }
        .sc-anim-1 { animation-delay: 0.08s; }
        .sc-anim-2 { animation-delay: 0.2s; }
        .sc-anim-3 { animation-delay: 0.32s; }
      `}</style>

      <CandidateNavbar />

      <div className="min-h-screen bg-gray-50">

        {/* ── Header ── */}
        <section className="bg-white border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">

            {/* Icon */}
            <div className="sc-anim w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-11 h-11 text-gray-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 sc-anim sc-anim-1 leading-tight">
              Payment <span className="bg-yellow-400 px-2">Cancelled</span>
            </h1>

            <p className="text-lg text-gray-600 sc-anim sc-anim-1">
              No worries — your subscription was not activated and no charges were made.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Reassurances */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow p-6 mb-8 space-y-4 sc-anim sc-anim-2">
            {REASSURANCES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sc-anim sc-anim-3">
            <button
              onClick={handleTryAgain}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Questions?{' '}
            <a href="mailto:support@intraview.app" className="text-teal-600 hover:underline font-medium">
              Contact support
            </a>
          </p>
        </div>
      </div>

      <CandidateFooter />
    </>
  );
};

export default SubscriptionCancel;
