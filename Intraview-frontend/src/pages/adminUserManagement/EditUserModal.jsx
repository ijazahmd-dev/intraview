import React, { useState, useEffect } from "react";
import { adminUpdateUser } from "../../api/adminAuthApi";
import toaster from "../../utils/toaster";

const EditUserModal = ({ user, onClose, onUpdated, currentAdminId }) => {
  const [form, setForm] = useState({
    username: user.username,
    role: user.role,
  });

  const [saving, setSaving] = useState(false);

  // Keep form updated if a different user is opened in modal
  useEffect(() => {
    setForm({
      username: user.username,
      role: user.role,
    });
  }, [user]);

  const handleSave = async () => {
    // BASIC CLIENT-SIDE VALIDATION
    if (!form.username || form.username.trim().length < 3) {
      toaster.error("Username must be at least 3 characters.");
      return;
    }

    // OPTIONAL: Prevent admin from demoting themselves
    if (user.id === currentAdminId && form.role !== "admin") {
      toaster.error("You cannot change your own role.");
      return;
    }

    try {
      setSaving(true);
      await adminUpdateUser(user.id, form);
      toaster.success("User updated successfully!");
      onUpdated(); // closes modal + refreshes list
    } catch (e) {
      toaster.error(e.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Edit User</h3>

        {/* EMAIL DISPLAY (not editable) */}
        <p><b>Email:</b> {user.email}</p>

        <label>Username</label>
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          style={styles.input}
        />

        <label>Role</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={styles.input}
        >
          <option value="user">User</option>
          <option value="interviewer">Interviewer</option>
          <option value="admin">Admin</option>
        </select>

        <div style={styles.buttonRow}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button onClick={onClose} style={styles.closeBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;

// -----------------------------------------------------
// INLINE STYLES (simple, clean, production-safe)
// -----------------------------------------------------
const styles = {
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
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "360px",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid gray",
    borderRadius: "5px",
    marginTop: "5px",
    marginBottom: "15px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  saveBtn: {
    padding: "10px 20px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  closeBtn: {
    padding: "10px 20px",
    background: "gray",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
};
