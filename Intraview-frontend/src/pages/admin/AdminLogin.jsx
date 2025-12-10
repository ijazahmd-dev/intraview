import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { adminLogin } from "../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import toaster from "../../utils/toaster";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { setAdmin } = useAdminAuth();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const data = await adminLogin(values);

        // Save admin info locally
        setAdmin(data.user);
        toaster.success("Admin login successful!");

        navigate("/admin/users"); // Redirect to admin dashboard

      } catch (err) {
        console.log("ADMIN LOGIN ERROR:", err.response?.data);
        const msg =
          err.response?.data?.error ||
          err.response?.data?.email ||
          err.response?.data?.password ||
          "Login failed";
        setStatus({ error: msg });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={styles.container}>
      <h2>Admin Login</h2>

      <form onSubmit={formik.handleSubmit} style={styles.form}>

        <label>Email</label>
        <input
          type="email"
          name="email"
          {...formik.getFieldProps("email")}
          style={styles.input}
        />
        {formik.touched.email && formik.errors.email && (
          <p style={styles.error}>{formik.errors.email}</p>
        )}

        <label>Password</label>
        <input
          type="password"
          name="password"
          {...formik.getFieldProps("password")}
          style={styles.input}
        />
        {formik.touched.password && formik.errors.password && (
          <p style={styles.error}>{formik.errors.password}</p>
        )}

        {formik.status?.error && (
          <p style={styles.error}>{formik.status.error}</p>
        )}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          style={styles.button}
        >
          {formik.isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: "400px",
    margin: "80px auto",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #999" },
  error: { color: "red", fontSize: "14px" },
  button: {
    padding: "12px",
    background: "#1e40af",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AdminLogin;
