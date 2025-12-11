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



function App() {
    return (
      <>
        <BrowserRouter>
            <ToastContainer />
            <AuthProvider>
            
                
                <Routes>
                    <Route path="/" element={<Navigate to="/signup" />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} /> 
                    <Route path="/home" element={
                                                <ProtectedRoute>
                                                    <Home/>
                                                </ProtectedRoute>
                                                } />

                                                
                                        
                </Routes>
            
            </AuthProvider>

            <AdminAuthProvider>
            <Routes>
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
        </BrowserRouter>
        
        </>
    );
}

export default App;
