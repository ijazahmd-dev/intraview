
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getApplications } from "../adminInterviewerSlice";
import StatusBadge from "../components/StatusBadge";

export default function AdminInterviewerApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, listLoading } = useSelector((s) => s.adminInterviewer);

  const [status, setStatus] = useState("PENDING");

  useEffect(() => {
    dispatch(getApplications(status));
  }, [dispatch, status]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Interviewer Applications
      </h1>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mb-4 border px-3 py-2 rounded"
      >
        <option value="">All</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>

      {listLoading ? (
        <p className="text-sm text-gray-500 mt-6">Loading applications…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500 mt-6">
          No applications found for this filter.
        </p>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="text-left text-sm text-gray-600 border-b">
              <th className="p-3">Email</th>
              <th>Status</th>
              <th>Applied At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((app) => (
              <tr key={app.id} className="border-b text-sm">
                <td className="p-3">{app.user_email}</td>
                <td>
                  <StatusBadge status={app.status} />
                </td>
                <td>
                  {app.created_at
                    ? new Date(app.created_at).toLocaleString()
                    : "—"}
                </td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/admin/interviewers/${app.id}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}