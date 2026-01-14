


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminUsersPage from "./pages/adminUserManagement/AdminUsersPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";

import InterviewerStatus from "./interviewers/pages/InterviewerStatus";
import InterviewerApply from "./interviewers/pages/InterviewerApply";
import InterviewerOptions from "./interviewers/pages/InterviewerOptions";
import AdminInterviewerApplications from "./interviewers/admin/pages/AdminInterviewerApplications";
import AdminInterviewerApplicationDetail from "./interviewers/admin/pages/AdminInterviewerApplicationDetail";
import InterviewerLogin from "./authentication/user/pages/InterviewerLogin";
import ProfileStep from "./interviewerOnboarding/user/pages/ProfileStep";
import AvailabilityStep from "./interviewerOnboarding/user/pages/AvailabilityStep";
import VerificationStep from "./interviewerOnboarding/user/pages/VerificationStep";
import CompleteStep from "./interviewerOnboarding/user/pages/CompleteStep";
import InterviewerOnboardingLayout from "./interviewerOnboarding/user/pages/InterviewerOnboardingLayout";
import InterviewerDashboardLayout from "./interviewerDashboard/interviewer/InterviewerDashboardLayout";
import InterviewerDashboardHome from "./interviewerDashboard/interviewer/pages/InterviewerDashboardHome";
import InterviewerProfilePage from "./interviewerProfile/interviewer/pages/InterviewerProfilePage";
import InterviewerAvailabilityPage from "./interviewerProfile/interviewer/pages/InterviewerAvailabilityPage";

import { useEffect } from "react"; 
import { useDispatch, useSelector } from "react-redux"; 
import { fetchUser } from "./authentication/authSlice";  
import { fetchAdmin } from "./authentication/adminAuthSlice";  
import AdminInterviewerVerificationsPage from "./interviewerProfile/admin/pages/AdminInterviewerVerificationsPage";
import InterviewerVerificationPage from "./interviewerProfile/interviewer/pages/InterviewerVerificationPage";
import UserSubscriptionsPage from "./subscriptions/user/pages/UserSubscriptionsPage";
import SubscriptionSuccess from "./subscriptions/user/pages/SubscriptionSuccess";
import SubscriptionCancel from "./subscriptions/user/pages/SubscriptionCancel";
import TokenBundlesPage from "./token_bundles/user/pages/TokenBundlesPage";
import PaymentSuccess from "./token_bundles/user/pages/PaymentSuccess";
import PaymentCancel from "./token_bundles/user/pages/PaymentCancel";
import InterviewerSubscriptionsPage from "./subscriptions/interviewer/pages/InterviewerSubscriptionsPage";
import InterviewerSubscriptionSuccess from "./subscriptions/interviewer/pages/InterviewerSubscriptionSuccess";
import InterviewerSubscriptionCancel from "./subscriptions/interviewer/pages/InterviewerSubscriptionCancel";





function AppInner() {
  const dispatch = useDispatch();
  const authBootstrapped = useSelector((state) => state.auth.bootstrapped);
  const adminBootstrapped = useSelector((state) => state.adminAuth.bootstrapped);



  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchAdmin());
  }, [dispatch]);

  // Show loading until auth is bootstrapped
  if (!authBootstrapped || !adminBootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <Routes>

        <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} /> 
                    <Route path="/home" element={
                                                // <ProtectedRoute>
                                                    <Home/>
                                                // </ProtectedRoute>
                                                } />
                    <Route path="/subscriptions" element={<UserSubscriptionsPage />} /> 
                    <Route path="/subscriptions/success" element={<SubscriptionSuccess />} />
                    <Route path="/subscriptions/cancel" element={<SubscriptionCancel />} />

                    <Route path="/tokens" element={<TokenBundlesPage />} />   
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/cancel" element={<PaymentCancel />} />                        









                    {/* Interviewer flow */}
                    <Route path="/interviewer/login" element={<InterviewerLogin />} />
                    <Route path="/interviewer/request" element={<InterviewerOptions/>} /> 
                    <Route path="/interviewer/apply" element={<InterviewerApply />} />
                    <Route path="/interviewer/status" element={<InterviewerStatus />} />

                    {/* Interviewer onboarding flow */}
                    <Route
                        path="/interviewer/onboarding"
                        element={<InterviewerOnboardingLayout />}
                    >
                        <Route path="profile" element={<ProfileStep />} />
                        <Route path="availability" element={<AvailabilityStep />} />
                        <Route path="verification" element={<VerificationStep />} />
                        {/* tutorials step could just reuse verification or be a simple content page */}
                        <Route path="tutorials" element={<VerificationStep />} />
                        <Route path="complete" element={<CompleteStep />} />
                    </Route>


                    <Route
                        path="/interviewer/dashboard"
                        element={<InterviewerDashboardLayout />}
                        >
                        <Route index element={<InterviewerDashboardHome />} />
                        <Route path="profile" element={<InterviewerProfilePage />} />
                        <Route path="availability" element={<InterviewerAvailabilityPage />} />
                        <Route path="verification" element={<InterviewerVerificationPage />} /> 
                    </Route>

                    <Route path="interviewer/subscriptions" element={<InterviewerSubscriptionsPage />} />
                    <Route path="/interviewer/subscription/success" element={<InterviewerSubscriptionSuccess />} />
                    <Route path="/interviewer/subscription/cancel" element={<InterviewerSubscriptionCancel />} />
                                                
                                        






                    {/* Admin side Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin/users"
                        element={
                            <AdminProtectedRoute>
                                <AdminUsersPage />
                            </AdminProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/interviewers"
                        element={
                            <AdminProtectedRoute>
                                <AdminInterviewerApplications />
                            </AdminProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/interviewers/:id"
                        element={
                            <AdminProtectedRoute>
                                <AdminInterviewerApplicationDetail />
                            </AdminProtectedRoute>
                        }
                    />
                    <Route path="/admin/interviewers/verifications"element={
                          <AdminProtectedRoute>
                            <AdminInterviewerVerificationsPage />
                          </AdminProtectedRoute>
                    }/>
                    

      </Routes>
    </>
  );
}





function App() {
    return (
      <>
        <BrowserRouter>
            <AppInner />
        </BrowserRouter>
        
        </>
    );
}

export default App;














































