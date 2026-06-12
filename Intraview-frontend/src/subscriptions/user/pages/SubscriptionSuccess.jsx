import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, Download, Calendar, CreditCard, Zap, Shield, Star } from 'lucide-react';
import { subscriptionsApi } from '../../subscriptionsApi';
import CandidateNavbar from '../../../components/CandidateNavbar.jsx';
import CandidateFooter from '../../../components/CandidateFooter.jsx';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const subResponse = await subscriptionsApi.getCurrentSubscription();
        setSubscription(subResponse.data);
        toast.success('Welcome to your new plan!');
      } catch (error) {
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleDownloadInvoice = useCallback(async () => {
    if (!orderId) { toast.error('No order ID found'); return; }
    try {
      setDownloadLoading(true);
      const blob = await subscriptionsApi.downloadSubscriptionInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Intraview_Subscription_Invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded!');
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloadLoading(false);
    }
  }, [orderId]);

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <CandidateNavbar />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Finalizing your subscription...</p>
        </div>
        <CandidateFooter />
      </>
    );
  }

  const sub = subscription;

  const benefits = [
    sub?.monthly_free_tokens > 0 && { icon: Star,    label: 'Free Tokens', value: `${sub.monthly_free_tokens} tokens/month` },
    sub?.ai_interviews_per_month && { icon: Zap,     label: 'AI Interviews', value: sub.ai_interviews_per_month === -1 ? 'Unlimited' : `${sub.ai_interviews_per_month}/month` },
    sub?.has_priority_booking    && { icon: Calendar, label: 'Priority Booking', value: 'Skip the queue' },
    sub?.has_advanced_ai_feedback && { icon: Shield,  label: 'Advanced AI Feedback', value: 'Detailed insights' },
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        .su-fade  { animation: fadeUp  0.6s ease both; }
        .su-scale { animation: scaleIn 0.5s ease both; }
        .su-d1    { animation-delay: 0.1s; }
        .su-d2    { animation-delay: 0.25s; }
        .su-d3    { animation-delay: 0.4s; }
      `}</style>

      <CandidateNavbar />

      <div className="min-h-screen bg-gray-50">

        {/* ── Success banner ── */}
        <div className="bg-white border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">

            {/* Check icon */}
            <div className="su-scale w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-11 h-11 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 su-fade su-d1 leading-tight">
              Subscription <span className="bg-yellow-400 px-2">Active!</span>
            </h1>

            {sub?.has_subscription && (
              <p className="text-lg text-gray-600 su-fade su-d1">
                Welcome to the <strong className="text-teal-600">{sub.plan_name}</strong> plan
              </p>
            )}

            {orderId && (
              <p className="text-xs text-gray-400 mt-2 su-fade su-d1">
                Order #{orderId.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {sub?.has_subscription && (
            <div className="grid md:grid-cols-2 gap-6 mb-10">

              {/* Benefits card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow p-7 su-fade su-d2">
                <h2 className="text-base font-bold text-gray-900 mb-5 uppercase tracking-wide text-xs text-gray-400">
                  Your New Benefits
                </h2>
                <div className="space-y-3">
                  {benefits.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Renews</p>
                    <p className="text-sm font-medium text-gray-700">
                      {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'Monthly'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="text-xl font-bold text-teal-600">₹{sub.price_inr}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                  </div>
                </div>
              </div>

              {/* Invoice card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow p-7 flex flex-col items-center justify-center text-center su-fade su-d2">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                  <CreditCard className="w-7 h-7 text-gray-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Download Receipt</h3>
                <p className="text-sm text-gray-500 mb-6">Get your official invoice as a PDF for your records.</p>

                <button
                  onClick={handleDownloadInvoice}
                  disabled={!orderId || downloadLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm
                    ${orderId && !downloadLoading
                      ? 'bg-teal-500 hover:bg-teal-600 text-white hover:shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {downloadLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-r-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Invoice (PDF)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Next steps ── */}
          <div className="su-fade su-d3">
            <h2 className="text-lg font-bold text-gray-900 mb-5">What's Next?</h2>
            <div className="grid sm:grid-cols-2 gap-5">

              <div
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate('/candidate/interviewers')}
              >
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors">
                  <Calendar className="w-5 h-5 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Book an Interview</h3>
                <p className="text-sm text-gray-500 mb-4">Use your new plan benefits to book sessions now.</p>
                <span className="text-sm font-semibold text-teal-600 group-hover:underline">Browse Interviewers →</span>
              </div>

              <div
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate('/subscriptions')}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Manage Subscription</h3>
                <p className="text-sm text-gray-500 mb-4">View plan details, billing, and manage your account.</p>
                <span className="text-sm font-semibold text-teal-600 group-hover:underline">View Subscription →</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
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

export default SubscriptionSuccess;
