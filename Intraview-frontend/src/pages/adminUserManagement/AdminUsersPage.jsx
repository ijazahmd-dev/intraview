// import React, { useEffect, useState } from "react";
// import {
//   adminFetchUsers,
//   adminBlockUser,
//   adminUnblockUser,
// } from "../../api/adminAuthApi";
// import EditUserModal from "./EditUserModal";
// import toaster from "../../utils/toaster";
// import Sidebar from "../../components/Sidebar";
// import Navbar from "../../components/Navbar";

// const AdminUsersPage = () => {
//   const [users, setUsers] = useState([]);
//   const [filters, setFilters] = useState({
//     role: "",
//     active: "",
//     search: "",
//   });
//   const [page, setPage] = useState(1);
//   const [meta, setMeta] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [editingUser, setEditingUser] = useState(null);

//   const loadUsers = async () => {
//     try {
//       setLoading(true);
//       const data = await adminFetchUsers({
//         page,
//         role: filters.role,
//         active: filters.active,
//         search: filters.search,
//       });
//       setUsers(data.results);
//       setMeta({
//         count: data.count,
//         next: data.next,
//         previous: data.previous,
//       });
//     } catch (e) {
//       toaster.error("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUsers();
//   }, [page, filters]);

//   const handleBlock = async (id) => {
//     try {
//       await adminBlockUser(id);
//       toaster.success("User blocked");
//       loadUsers();
//     } catch (e) {
//       toaster.error(e.response?.data?.error || "Failed to block user");
//     }
//   };

//   const handleUnblock = async (id) => {
//     try {
//       await adminUnblockUser(id);
//       toaster.success("User unblocked");
//       loadUsers();
//     } catch (e) {
//       toaster.error(e.response?.data?.error || "Failed to unblock user");
//     }
//   };

//   return (
//     <div className="flex min-h-screen" style={{ backgroundColor: '#ffffff' }}>
//       <Sidebar/>
//       <div className="flex-1 flex flex-col">
//         <Navbar />
//       <div className="w-full px-4 pt-12 pb-8">

        
//         {/* Header */}
//         <div className="max-w-7xl mx-auto mb-10">
//           <div className="flex items-center gap-4 mb-2">
//             <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D2DCB6 0%, #A1BC98 100%)' }}>
//               <svg className="w-6 h-6" fill="none" stroke="#778873" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold" style={{ color: '#778873' }}>
//               User Management
//             </h2>
//           </div>
//           <p style={{ color: '#778873', opacity: 0.8 }}>
//             Manage and monitor all registered users
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="rounded-2xl shadow-lg p-6 mb-6" style={{ backgroundColor: 'white' }}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div>
//               <label className="block text-sm font-semibold mb-2" style={{ color: '#778873' }}>
//                 Search Users
//               </label>
//               <input
//                 type="text"
//                 placeholder="Search email or username"
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//                 className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
//                 style={{ 
//                   backgroundColor: '#F1F3E0',
//                   border: '2px solid #D2DCB6',
//                   color: '#778873'
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = '#A1BC98';
//                   e.target.style.boxShadow = '0 0 0 3px rgba(161, 188, 152, 0.2)';
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = '#D2DCB6';
//                   e.target.style.boxShadow = 'none';
//                 }}
//               />
//             </div>

//             {/* Role Filter */}
//             <div>
//               <label className="block text-sm font-semibold mb-2" style={{ color: '#778873' }}>
//                 Role
//               </label>
//               <select
//                 value={filters.role}
//                 onChange={(e) => setFilters({ ...filters, role: e.target.value })}
//                 className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
//                 style={{ 
//                   backgroundColor: '#F1F3E0',
//                   border: '2px solid #D2DCB6',
//                   color: '#778873'
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = '#A1BC98';
//                   e.target.style.boxShadow = '0 0 0 3px rgba(161, 188, 152, 0.2)';
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = '#D2DCB6';
//                   e.target.style.boxShadow = 'none';
//                 }}
//               >
//                 <option value="">All Roles</option>
//                 <option value="user">User</option>
//                 <option value="interviewer">Interviewer</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label className="block text-sm font-semibold mb-2" style={{ color: '#778873' }}>
//                 Status
//               </label>
//               <select
//                 value={filters.active}
//                 onChange={(e) => setFilters({ ...filters, active: e.target.value })}
//                 className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
//                 style={{ 
//                   backgroundColor: '#F1F3E0',
//                   border: '2px solid #D2DCB6',
//                   color: '#778873'
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = '#A1BC98';
//                   e.target.style.boxShadow = '0 0 0 3px rgba(161, 188, 152, 0.2)';
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = '#D2DCB6';
//                   e.target.style.boxShadow = 'none';
//                 }}
//               >
//                 <option value="">Active + Blocked</option>
//                 <option value="true">Active</option>
//                 <option value="false">Blocked</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="rounded-2xl shadow-lg overflow-hidden" style={{ backgroundColor: 'white' }}>
//           {loading ? (
//             <div className="p-12 text-center">
//               <svg className="animate-spin h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" style={{ color: '#A1BC98' }}>
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               <p style={{ color: '#778873' }}>Loading users...</p>
//             </div>
//           ) : users.length === 0 ? (
//             <div className="p-12 text-center">
//               <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#A1BC98" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//               </svg>
//               <p className="text-lg font-semibold" style={{ color: '#778873' }}>No users found</p>
//               <p style={{ color: '#778873', opacity: 0.7 }}>Try adjusting your filters</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead style={{ backgroundColor: '#F1F3E0' }}>
//                   <tr>
//                     <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#778873' }}>Email</th>
//                     <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#778873' }}>Username</th>
//                     <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#778873' }}>Role</th>
//                     <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#778873' }}>Status</th>
//                     <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#778873' }}>Email Verified</th>
//                     <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#778873' }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((u, index) => (
//                     <tr 
//                       key={u.id}
//                       style={{ 
//                         borderBottom: '1px solid #F1F3E0',
//                         backgroundColor: index % 2 === 0 ? 'white' : '#FAFBF8'
//                       }}
//                     >
//                       <td className="px-6 py-4" style={{ color: '#778873' }}>{u.email}</td>
//                       <td className="px-6 py-4" style={{ color: '#778873' }}>{u.username}</td>
//                       <td className="px-6 py-4">
//                         <span 
//                           className="px-3 py-1 rounded-full text-xs font-semibold"
//                           style={{ 
//                             backgroundColor: u.role === 'admin' ? '#D2DCB6' : u.role === 'interviewer' ? '#A1BC98' : '#F1F3E0',
//                             color: '#778873'
//                           }}
//                         >
//                           {u.role}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span 
//                           className="px-3 py-1 rounded-full text-xs font-semibold"
//                           style={{ 
//                             backgroundColor: u.is_active ? '#D1FAE5' : '#FEE2E2',
//                             color: u.is_active ? '#059669' : '#DC2626'
//                           }}
//                         >
//                           {u.is_active ? 'Active' : 'Blocked'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span 
//                           className="px-3 py-1 rounded-full text-xs font-semibold"
//                           style={{ 
//                             backgroundColor: u.is_email_verified ? '#D1FAE5' : '#FEF3C7',
//                             color: u.is_email_verified ? '#059669' : '#D97706'
//                           }}
//                         >
//                           {u.is_email_verified ? 'Yes' : 'No'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => setEditingUser(u)}
//                             className="px-4 py-2 rounded-lg font-semibold transition-all duration-200"
//                             style={{ 
//                               background: 'linear-gradient(135deg, #778873 0%, #A1BC98 100%)',
//                               color: 'white'
//                             }}
//                             onMouseEnter={(e) => {
//                               e.target.style.transform = 'translateY(-2px)';
//                               e.target.style.boxShadow = '0 4px 12px rgba(119, 136, 115, 0.3)';
//                             }}
//                             onMouseLeave={(e) => {
//                               e.target.style.transform = 'translateY(0)';
//                               e.target.style.boxShadow = 'none';
//                             }}
//                           >
//                             Edit
//                           </button>

//                           {u.is_active ? (
//                             <button
//                               onClick={() => handleBlock(u.id)}
//                               className="px-4 py-2 rounded-lg font-semibold transition-all duration-200"
//                               style={{ 
//                                 backgroundColor: '#FEE2E2',
//                                 color: '#DC2626'
//                               }}
//                               onMouseEnter={(e) => {
//                                 e.target.style.backgroundColor = '#FCA5A5';
//                                 e.target.style.transform = 'translateY(-2px)';
//                                 e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
//                               }}
//                               onMouseLeave={(e) => {
//                                 e.target.style.backgroundColor = '#FEE2E2';
//                                 e.target.style.transform = 'translateY(0)';
//                                 e.target.style.boxShadow = 'none';
//                               }}
//                             >
//                               Block
//                             </button>
//                           ) : (
//                             <button
//                               onClick={() => handleUnblock(u.id)}
//                               className="px-4 py-2 rounded-lg font-semibold transition-all duration-200"
//                               style={{ 
//                                 backgroundColor: '#D1FAE5',
//                                 color: '#059669'
//                               }}
//                               onMouseEnter={(e) => {
//                                 e.target.style.backgroundColor = '#A7F3D0';
//                                 e.target.style.transform = 'translateY(-2px)';
//                                 e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
//                               }}
//                               onMouseLeave={(e) => {
//                                 e.target.style.backgroundColor = '#D1FAE5';
//                                 e.target.style.transform = 'translateY(0)';
//                                 e.target.style.boxShadow = 'none';
//                               }}
//                             >
//                               Unblock
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         {!loading && users.length > 0 && (
//           <div className="mt-6 flex items-center justify-between rounded-2xl shadow-lg p-6" style={{ backgroundColor: 'white' }}>
//             <button
//               disabled={!meta.previous}
//               onClick={() => setPage(page - 1)}
//               className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               style={{ 
//                 backgroundColor: '#D2DCB6',
//                 color: '#778873'
//               }}
//               onMouseEnter={(e) => {
//                 if (meta.previous) {
//                   e.target.style.backgroundColor = '#A1BC98';
//                   e.target.style.color = 'white';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.backgroundColor = '#D2DCB6';
//                 e.target.style.color = '#778873';
//               }}
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//               Previous
//             </button>

//             <div className="flex items-center gap-2">
//               <span className="px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: '#F1F3E0', color: '#778873' }}>
//                 Page {page}
//               </span>
//               {meta.count && (
//                 <span style={{ color: '#778873', opacity: 0.7 }}>
//                   ({meta.count} total users)
//                 </span>
//               )}
//             </div>

//             <button
//               disabled={!meta.next}
//               onClick={() => setPage(page + 1)}
//               className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               style={{ 
//                 backgroundColor: '#D2DCB6',
//                 color: '#778873'
//               }}
//               onMouseEnter={(e) => {
//                 if (meta.next) {
//                   e.target.style.backgroundColor = '#A1BC98';
//                   e.target.style.color = 'white';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.backgroundColor = '#D2DCB6';
//                 e.target.style.color = '#778873';
//               }}
//             >
//               Next
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </button>
//           </div>
//         )}
//         </div>
//       </div>

//       {/* Edit User Modal */}
//       {editingUser && (
//         <EditUserModal
//           user={editingUser}
//           onClose={() => setEditingUser(null)}
//           onUpdated={() => {
//             setEditingUser(null);
//             loadUsers();
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminUsersPage;









import React, { useEffect, useState } from "react";
import {
  adminFetchUsers,
  adminBlockUser,
  adminUnblockUser,
} from "../../api/adminAuthApi";
import EditUserModal from "./EditUserModal";
import toaster from "../../utils/toaster";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Users, Search, Filter, Edit, Ban, CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: "",
    active: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminFetchUsers({
        page,
        role: filters.role,
        active: filters.active,
        search: filters.search,
      });
      setUsers(data.results);
      setMeta({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (e) {
      toaster.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, filters]);

  const handleBlock = async (id) => {
    try {
      await adminBlockUser(id);
      toaster.success("User blocked");
      loadUsers();
    } catch (e) {
      toaster.error(e.response?.data?.error || "Failed to block user");
    }
  };

  const handleUnblock = async (id) => {
    try {
      await adminUnblockUser(id);
      toaster.success("User unblocked");
      loadUsers();
    } catch (e) {
      toaster.error(e.response?.data?.error || "Failed to unblock user");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    User Management
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Manage and monitor all registered users
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Users</span>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{meta.count || 0}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Active Users</span>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Blocked Users</span>
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Ban className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {users.filter(u => !u.is_active).length}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search email or username"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="interviewer">Interviewer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.active}
                    onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Blocked</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-spin" />
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">No users found</p>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Email Verified
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-800">{u.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{u.username}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700' 
                                : u.role === 'interviewer' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
                              u.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                u.is_active ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              {u.is_active ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              u.is_email_verified 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {u.is_email_verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>

                              {u.is_active ? (
                                <button
                                  onClick={() => handleBlock(u.id)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-all duration-200"
                                >
                                  <Ban className="w-4 h-4" />
                                  Block
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnblock(u.id)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium text-sm transition-all duration-200"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Unblock
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && users.length > 0 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-4">
                <button
                  disabled={!meta.previous}
                  onClick={() => setPage(page - 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-semibold text-sm">
                    Page {page}
                  </span>
                  {meta.count && (
                    <span className="text-sm text-gray-600">
                      of {Math.ceil(meta.count / 10)} ({meta.count} total users)
                    </span>
                  )}
                </div>

                <button
                  disabled={!meta.next}
                  onClick={() => setPage(page + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={() => {
            setEditingUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;