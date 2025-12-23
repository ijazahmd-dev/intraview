import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminUsersPage from "./pages/adminUserManagement/AdminUsersPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import InterviewerStatus from "./interviewers/pages/InterviewerStatus";
import InterviewerApply from "./interviewers/pages/InterviewerApply";
import InterviewerOptions from "./interviewers/pages/InterviewerOptions";
import AdminInterviewerApplications from "./interviewers/admin/pages/AdminInterviewerApplications";
import AdminInterviewerApplicationDetail from "./interviewers/admin/pages/AdminInterviewerApplicationDetail";
import InterviewerLogin from "./authentication/user/pages/InterviewerLogin";
import InterviewerForgotPassword from "./authentication/user/pages/InterviewerForgotPassword";
import InterviewerResetPassword from "./authentication/user/pages/InterviewerResetPassword";





function App() {
    return (
      <>
        <BrowserRouter>
            <ToastContainer />
            <AuthProvider>
                <AdminAuthProvider>
            
                
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




                    {/* Interviewer flow */}
                    <Route path="/interviewer/login" element={<InterviewerLogin />} />
                    <Route path="/interviewer/forgot-password" element={<InterviewerForgotPassword />} />
                    <Route path="/interviewer/reset-password" element={<InterviewerResetPassword />} />
                    <Route path="/interviewer/request" element={<InterviewerOptions/>} /> 
                    <Route path="/interviewer/apply" element={<InterviewerApply />} />
                    <Route path="/interviewer/status" element={<InterviewerStatus />} />
                                                
                                        



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


            </Routes>
            </AdminAuthProvider>
        </AuthProvider>    
        </BrowserRouter>
        
        </>
    );
}

export default App;
