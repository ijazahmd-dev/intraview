import React, { useEffect, useState } from "react";
import {
  adminFetchUsers,
  adminBlockUser,
  adminUnblockUser,
} from "../../api/adminAuthApi";
import EditUserModal from "./EditUserModal";
import toaster from "../../utils/toaster";

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
    <div style={styles.container}>
      <h2>Admin User Management</h2>

      {/* FILTERS */}
      <div style={styles.filterBar}>
        <input
          placeholder="Search email or username"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={styles.input}
        />

        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="interviewer">Interviewer</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={filters.active}
          onChange={(e) => setFilters({ ...filters, active: e.target.value })}
        >
          <option value="">Active + Blocked</option>
          <option value="true">Active</option>
          <option value="false">Blocked</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No users found.
        </p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Email Verified</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>{u.is_active ? "Active" : "Blocked"}</td>
                <td>{u.is_email_verified ? "Yes" : "No"}</td>

                <td>
                  <button onClick={() => setEditingUser(u)}>Edit</button>

                  {u.is_active ? (
                    <button
                      onClick={() => handleBlock(u.id)}
                      style={{ color: "red", marginLeft: "8px" }}
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnblock(u.id)}
                      style={{ color: "green", marginLeft: "8px" }}
                    >
                      Unblock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PAGINATION */}
      <div style={styles.pagination}>
        <button disabled={!meta.previous} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span>Page {page}</span>

        <button disabled={!meta.next} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>

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



const styles = {
  container: { padding: "20px", maxWidth: "900px", margin: "auto" },
  filterBar: { display: "flex", gap: "10px", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  pagination: { marginTop: "20px", display: "flex", gap: "10px" },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "350px",
  },
  saveBtn: { background: "green", color: "white", padding: "10px" },
  closeBtn: { background: "gray", color: "white", padding: "10px", marginLeft: "10px" },
};
