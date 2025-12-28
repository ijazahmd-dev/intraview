// import { createContext, useContext, useEffect, useState } from "react";
// import { getCurrentUser, logout } from "../api/authApi";


// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // Restore login session from cookies
//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const res = await getCurrentUser();
//                 setUser(res.data);
//             } catch (err) {
//                 if (err.response?.status === 401) {
//                 // User is simply NOT logged in → do NOT treat as error
//                 setUser(null);
//                 return;
//                 }
//                 console.error("Unexpected error:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         window.fetchUser = fetchUser;

//         fetchUser();
//     }, []);

//     const logoutUser = async () => {
//         await logout();
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ user, setUser, logoutUser, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);