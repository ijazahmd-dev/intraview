import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchTokenPacks, clearError } from '../../tokenSlice.js';
import TokenBundleCard from '../components/TokenBundleCard.jsx';
import TokenPurchaseModal from '../components/TokenPurchaseModal.jsx';
import { tokenApi } from '../../tokensApi.js';

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
  console.log("🔥 PURCHASE STARTED:", { tokenPackId, type: typeof tokenPackId });
  
  const toastId = toast.loading('Creating secure checkout...');
  try {
    const response = await tokenApi.createPurchase(tokenPackId);
    console.log("✅ SUCCESS RESPONSE:", response.data);
    toast.success('Redirecting to payment...', { id: toastId });
    window.location.href = response.data.checkout_url;
  } catch (error) {
    console.error("❌ FULL ERROR:", error);
    console.error("❌ ERROR RESPONSE:", error.response?.data);
    console.error("❌ ERROR STATUS:", error.response?.status);
    console.error("❌ ERROR URL:", error.config?.url);
    
    toast.error(
      `Error ${error.response?.status || '???'}:\n${JSON.stringify(error.response?.data || error.message)}`,
      { id: toastId }
    );
  }
};



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl p-8 h-96 shadow-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-4 rounded-3xl shadow-xl mb-8">
            <div className="w-3 h-3 bg-white/30 rounded-full animate-ping"></div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Buy Tokens
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Get tokens instantly to book interviews with top interviewers. 
            The more you buy, the better the value!
          </p>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 px-6 py-3 rounded-2xl border border-emerald-200 shadow-lg">
              <span className="text-2xl font-bold text-emerald-700">₹8 per token</span>
              <span className="text-sm text-gray-600">Best value packs</span>
            </div>
          </div>
        </div>

        {/* Token Packs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {packs.map((pack) => (
            <TokenBundleCard
              key={pack.id}
              pack={pack}
              onPurchase={openPurchaseModal}
            />
          ))}
        </div>

        {/* Empty State */}
        {packs.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Token Packs Available</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Token bundles will appear here when admins add them.
            </p>
          </div>
        )}

        {/* Purchase Modal */}
        <TokenPurchaseModal
          pack={selectedPack}
          isOpen={isModalOpen}
          onClose={closeModal}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
}
