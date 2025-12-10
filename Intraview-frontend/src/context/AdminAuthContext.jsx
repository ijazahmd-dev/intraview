import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchAdminMe } from "../api/adminApi";

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load admin data once at mount
  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const data = await fetchAdminMe();
        setAdmin(data);
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    loadAdmin();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
