// import React, { useState, useEffect } from "react";
// import { adminUpdateUser } from "../../api/adminAuthApi";
// import toaster from "../../utils/toaster";

// const EditUserModal = ({ user, onClose, onUpdated, currentAdminId }) => {
//   const [form, setForm] = useState({
//     username: user.username,
//     role: user.role,
//   });

//   const [saving, setSaving] = useState(false);

//   // Keep form updated if a different user is opened in modal
//   useEffect(() => {
//     setForm({
//       username: user.username,
//       role: user.role,
//     });
//   }, [user]);

//   const handleSave = async () => {
//     // BASIC CLIENT-SIDE VALIDATION
//     if (!form.username || form.username.trim().length < 3) {
//       toaster.error("Username must be at least 3 characters.");
//       return;
//     }

//     // OPTIONAL: Prevent admin from demoting themselves
//     if (user.id === currentAdminId && form.role !== "admin") {
//       toaster.error("You cannot change your own role.");
//       return;
//     }

//     try {
//       setSaving(true);
//       await adminUpdateUser(user.id, form);
//       toaster.success("User updated successfully!");
//       onUpdated(); // closes modal + refreshes list
//     } catch (e) {
//       toaster.error(e.response?.data?.error || "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div style={styles.overlay}>
//       <div style={styles.modal}>
//         <h3>Edit User</h3>

//         {/* EMAIL DISPLAY (not editable) */}
//         <p><b>Email:</b> {user.email}</p>

//         <label>Username</label>
//         <input
//           value={form.username}
//           onChange={(e) => setForm({ ...form, username: e.target.value })}
//           style={styles.input}
//         />

//         <label>Role</label>
//         <select
//           value={form.role}
//           onChange={(e) => setForm({ ...form, role: e.target.value })}
//           style={styles.input}
//         >
//           <option value="user">User</option>
//           <option value="interviewer">Interviewer</option>
//           <option value="admin">Admin</option>
//         </select>

//         <div style={styles.buttonRow}>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>

//           <button onClick={onClose} style={styles.closeBtn}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditUserModal;

// // -----------------------------------------------------
// // INLINE STYLES (simple, clean, production-safe)
// // -----------------------------------------------------
// const styles = {
//   overlay: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//     background: "rgba(0,0,0,0.5)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1000,
//   },
//   modal: {
//     background: "#fff",
//     padding: "20px",
//     borderRadius: "10px",
//     width: "360px",
//     textAlign: "left",
//   },
//   input: {
//     width: "100%",
//     padding: "10px",
//     border: "1px solid gray",
//     borderRadius: "5px",
//     marginTop: "5px",
//     marginBottom: "15px",
//   },
//   buttonRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     marginTop: "20px",
//   },
//   saveBtn: {
//     padding: "10px 20px",
//     background: "#10b981",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//   },
//   closeBtn: {
//     padding: "10px 20px",
//     background: "gray",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//   },
// };



















import React, { useState, useEffect } from "react";
import { adminUpdateUser } from "../../api/adminAuthApi";
import toaster from "../../utils/toaster";
import { X, User, Mail, Shield, Save, Loader2, AlertCircle } from "lucide-react";

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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Edit User</h3>
              <p className="text-xs text-gray-500">Update user information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Email Display (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 text-orange-500" />
              Email Address
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
              {user.email}
            </div>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Email cannot be modified
            </p>
          </div>

          {/* Username Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 text-orange-500" />
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username (min. 3 characters)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700 placeholder:text-gray-400"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Minimum 3 characters required
            </p>
          </div>

          {/* Role Select */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Shield className="w-4 h-4 text-orange-500" />
              User Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700"
              disabled={saving}
            >
              <option value="user">User - Standard access</option>
              <option value="interviewer">Interviewer - Conduct interviews</option>
              <option value="admin">Admin - Full system access</option>
            </select>
            {user.id === currentAdminId && form.role !== 'admin' && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  Warning: You cannot change your own role. This change will not be saved.
                </p>
              </div>
            )}
          </div>


        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;