
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { getApplications } from "../adminInterviewerSlice";
// import StatusBadge from "../components/StatusBadge";

// export default function AdminInterviewerApplications() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { list, listLoading } = useSelector((s) => s.adminInterviewer);

//   const [status, setStatus] = useState("PENDING");

//   useEffect(() => {
//     dispatch(getApplications(status));
//   }, [dispatch, status]);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-6">
//         Interviewer Applications
//       </h1>

//       <select
//         value={status}
//         onChange={(e) => setStatus(e.target.value)}
//         className="mb-4 border px-3 py-2 rounded"
//       >
//         <option value="">All</option>
//         <option value="PENDING">Pending</option>
//         <option value="APPROVED">Approved</option>
//         <option value="REJECTED">Rejected</option>
//       </select>

//       {listLoading ? (
//         <p className="text-sm text-gray-500 mt-6">Loading applications…</p>
//       ) : list.length === 0 ? (
//         <p className="text-sm text-gray-500 mt-6">
//           No applications found for this filter.
//         </p>
//       ) : (
//         <table className="w-full bg-white rounded shadow">
//           <thead>
//             <tr className="text-left text-sm text-gray-600 border-b">
//               <th className="p-3">Email</th>
//               <th>Status</th>
//               <th>Applied At</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {list.map((app) => (
//               <tr key={app.id} className="border-b text-sm">
//                 <td className="p-3">{app.user_email}</td>
//                 <td>
//                   <StatusBadge status={app.status} />
//                 </td>
//                 <td>
//                   {app.created_at
//                     ? new Date(app.created_at).toLocaleString()
//                     : "—"}
//                 </td>
//                 <td>
//                   <button
//                     onClick={() =>
//                       navigate(`/admin/interviewers/${app.id}`)
//                     }
//                     className="text-blue-600 hover:underline"
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }












import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getApplications } from "../adminInterviewerSlice";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import { 
  UserCheck, Filter, Search, Eye, Calendar, 
  MapPin, Clock, Briefcase, Award, Loader2,
  FileText, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

export default function AdminInterviewerApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, listLoading } = useSelector((s) => s.adminInterviewer);

  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getApplications(status));
  }, [dispatch, status]);

  // Filter applications by search query
  const filteredApplications = list.filter(app => 
    app.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.specializations?.some(spec => 
      spec.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Count applications by status
  const statusCounts = {
    total: list.length,
    pending: list.filter(app => app.status === 'PENDING').length,
    approved: list.filter(app => app.status === 'APPROVED').length,
    rejected: list.filter(app => app.status === 'REJECTED').length,
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
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Interviewer Applications
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Review and manage interviewer applications
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Applications</span>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.total}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Pending Review</span>
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.pending}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Approved</span>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.approved}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Rejected</span>
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.rejected}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Applications
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by email, location, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved</option>PENDING
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {listLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-spin" />
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    No applications found
                  </p>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try adjusting your search criteria' : 'No applications match this filter'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Experience
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Specializations
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                                {app.user_email?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {app.user_email}
                                </p>
                                {app.phone_number && (
                                  <p className="text-xs text-gray-500">{app.phone_number}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {app.years_of_experience || 0} years
                                </p>
                                {app.years_of_interview_experience > 0 && (
                                  <p className="text-xs text-gray-500">
                                    {app.years_of_interview_experience} yrs interviewing
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-800">{app.location || '—'}</p>
                                {app.timezone && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {app.timezone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {app.specializations && app.specializations.length > 0 ? (
                                app.specializations.slice(0, 2).map((spec, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                  >
                                    {spec}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">—</span>
                              )}
                              {app.specializations && app.specializations.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                  +{app.specializations.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {app.created_at
                                ? new Date(app.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate(`/admin/interviewers/${app.id}`)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Results Summary */}
            {!listLoading && filteredApplications.length > 0 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-800">{filteredApplications.length}</span> of{' '}
                  <span className="font-semibold text-gray-800">{list.length}</span> applications
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}