import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";


const AdminProtectedRoute = ({ children }) => {
  const { admin, bootstrapped } = useSelector((s) => s.adminAuth);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  // ✅ FIX: Check admin?.role OR admin?.user?.role
  const isAdmin = admin?.role === "admin" || admin?.user?.role === "admin";
  

  if (!admin || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;