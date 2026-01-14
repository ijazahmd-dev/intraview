import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import CurrentInterviewerSubscription from '../components/CurrentInterviewerSubscription.jsx';
import InterviewerPlanCard from '../components/InterviewerPlanCard.jsx';
import InterviewerSubscriptionModal from '../components/InterviewerSubscriptionModal.jsx';
import { interviewerSubscriptionsApi } from '../../interviewerSubscriptionsApi.js';

const InterviewerSubscriptionsPage = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is interviewer (from Redux or context)
  const user = useSelector((state) => state.auth?.user);
  const isInterviewer = user?.is_interviewer || user?.role === 'interviewer';

  useEffect(() => {
  // 🔥 REMOVE isInterviewer CHECK - Always load for authenticated users
  console.log("🟢 LOADING INTERVIEWER SUBSCRIPTIONS..."); // DEBUG
  
  Promise.all([
    interviewerSubscriptionsApi.getPlans(),
    interviewerSubscriptionsApi.getCurrentSubscription()
  ])
  .then(([plansRes, currentRes]) => {
    console.log("✅ PLANS:", plansRes.data); // DEBUG
    console.log("✅ CURRENT:", currentRes.data); // DEBUG
    setPlans(plansRes.data);
    setCurrentSubscription(currentRes.data);
  })
  .catch((error) => {
    console.error("❌ API ERROR:", error); // DEBUG
    toast.error('Failed to load subscription data');
  })
  .finally(() => {
    setLoading(false);
  });
}, []); // Empty dependency array

  const openPlanModal = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Loading your subscription plans...</p>
        </div>
      </div>
    );
  }

//   if (!isInterviewer) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-2xl mx-auto text-center">
//           <h1 className="text-4xl font-bold text-gray-900 mb-8">Interviewer Subscriptions</h1>
//           <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-200">
//             <svg className="w-24 h-24 text-gray-400 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//             </svg>
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Interviewer Only</h2>
//             <p className="text-xl text-gray-600 mb-8">This page is only available to registered interviewers.</p>
//             <a href="/become-interviewer" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">
//               Become an Interviewer
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//               </svg>
//             </a>
//           </div>
//         </div>
//       </div>
//     );
//   }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-6">
            Interviewer Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Go live, accept bookings from candidates, and start earning. 
            Choose the perfect plan for your interviewing style.
          </p>
        </div>

        {/* Current Subscription */}
        <div className="mb-20">
          <CurrentInterviewerSubscription currentSubscription={currentSubscription} />
        </div>

        {/* Plans Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 text-center mb-16">
            All plans include unlimited bookings and full profile visibility
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <InterviewerPlanCard
                key={plan.id}
                plan={plan}
                currentSubscription={currentSubscription} 
                // currentPlanName={currentSubscription?.plan?.name}
                onSelect={openPlanModal}
                disabled={!plan.is_active}
              />
            ))}
          </div>
        </div>

        {/* Modal */}
        <InterviewerSubscriptionModal
          plan={selectedPlan}
          currentSubscription={currentSubscription}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default InterviewerSubscriptionsPage;
