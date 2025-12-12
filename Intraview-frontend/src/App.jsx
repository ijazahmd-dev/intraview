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
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import InterviewerOptions from "./pages/interviewer/InterviewerOptions";




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
                    <Route path="/admin-sidebar" element={<Sidebar/>} /> 
                    <Route path="/admin-navbar" element={<Navbar/>} /> 
                    <Route path="/interviewer/request" element={<InterviewerOptions/>} /> 

                    <Route path="/home" element={
                                                // <ProtectedRoute>
                                                    <Home/>
                                                // </ProtectedRoute>
                                                } />

                                                
                                        

                <Route path="/admin/login" element={<AdminLogin />} />

                <Route
                path="/admin/users"
                element={
                    <AdminProtectedRoute>
                    <AdminUsersPage />
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
