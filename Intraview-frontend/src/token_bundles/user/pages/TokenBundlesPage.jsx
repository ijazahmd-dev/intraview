import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchTokenPacks, clearError } from '../../tokenSlice.js';
import TokenBundleCard from '../components/TokenBundleCard.jsx';
import TokenPurchaseModal from '../components/TokenPurchaseModal.jsx';
import { tokenApi } from '../../tokensApi.js';
import CandidateNavbar from '../../../components/CandidateNavbar.jsx';
import CandidateFooter from '../../../components/CandidateFooter.jsx';
import { Coins, Zap, Shield, Clock } from 'lucide-react';

const PERKS = [
  { icon: Zap,    title: 'Instant Delivery',  desc: 'Tokens credited to your wallet immediately after payment.' },
  { icon: Shield, title: 'Secure Checkout',   desc: '100% secure payments powered by Stripe.' },
  { icon: Clock,  title: 'Never Expire',      desc: 'Use your tokens whenever you need them — no rush.' },
];

export default function TokenBundlesPage() {
  const dispatch = useDispatch();
  const { packs, loading, error } = useSelector(state => state.tokens);
  const [selectedPack, setSelectedPack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTokenPacks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const openPurchaseModal = (pack) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPack(null);
  };

  const handlePurchase = async (tokenPackId) => {
    const toastId = toast.loading('Creating secure checkout...');
    try {
      const response = await tokenApi.createPurchase(tokenPackId);
      toast.success('Redirecting to payment...', { id: toastId });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error(
        `Error ${error.response?.status || '???'}: ${JSON.stringify(error.response?.data || error.message)}`,
        { id: toastId }
      );
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <>
        <CandidateNavbar />
        <div className="min-h-screen bg-gray-50 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            {/* hero skeleton */}
            <div className="text-center mb-16">
              <div className="h-6 w-32 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse" />
              <div className="h-12 w-72 bg-gray-200 rounded-xl mx-auto mb-4 animate-pulse" />
              <div className="h-5 w-96 bg-gray-100 rounded-lg mx-auto animate-pulse" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-6 h-72 shadow border border-gray-100" />
              ))}
            </div>
          </div>
        </div>
        <CandidateFooter />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-up   { animation: fadeUp 0.55s ease both; }
        .anim-up-1 { animation-delay: 0.08s; }
        .anim-up-2 { animation-delay: 0.18s; }
        .anim-up-3 { animation-delay: 0.28s; }
        .anim-up-4 { animation-delay: 0.38s; }
      `}</style>

      <CandidateNavbar />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">

          {/* live pill */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-6 anim-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span className="text-sm font-semibold text-teal-700">Token Bundles</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 anim-up anim-up-1 leading-tight">
            Power Your <span className="bg-yellow-400 px-2">Interviews</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto anim-up anim-up-2 leading-relaxed">
            Buy token bundles to book sessions with top interviewers.
            Choose the pack that fits your prep goals.
          </p>
        </div>
      </section>

      {/* ── Perks strip ── */}
      <section className="bg-gray-50 border-b border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 anim-up anim-up-3">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Packs grid ── */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {packs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 anim-up anim-up-4">
              {packs.map((pack) => (
                <TokenBundleCard
                  key={pack.id}
                  pack={pack}
                  onPurchase={openPurchaseModal}
                />
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Coins className="w-10 h-10 text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Packs Available Yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Token bundles will appear here once they've been configured. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-10 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Ace Your Next Interview?</h2>
            <p className="text-teal-50 mb-6 text-sm leading-relaxed">
              Pick a bundle, load your wallet, and start booking sessions with expert interviewers.
            </p>
            {packs.length > 0 && (
              <button
                onClick={() => openPurchaseModal(packs[0])}
                className="bg-white text-teal-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Buy Tokens Now
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      <TokenPurchaseModal
        pack={selectedPack}
        isOpen={isModalOpen}
        onClose={closeModal}
        onPurchase={handlePurchase}
      />

      <CandidateFooter />
    </>
  );
}
