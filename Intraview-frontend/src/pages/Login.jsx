import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";


const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const res = await login(values);
        setUser(res.data.user);
        navigate("/home");
      } catch (err) {
        setStatus(err.response?.data || "Login failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      <form onSubmit={formik.handleSubmit} style={styles.form}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          {...formik.getFieldProps("email")}
        />
        {formik.touched.email && formik.errors.email && (
          <p style={styles.error}>{formik.errors.email}</p>
        )}

        <label>Password</label>
        <input
          type="password"
          name="password"
          {...formik.getFieldProps("password")}
        />
        {formik.touched.password && formik.errors.password && (
          <p style={styles.error}>{formik.errors.password}</p>
        )}

        {formik.status && (
          <p style={styles.error}>{formik.status.error}</p>
        )}

        <button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <p
          style={{ color: "#3b82f6", cursor: "pointer" }}
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

        <p style={{ marginTop: "10px" }}>
          Don't have an account?{" "}
          <span
            style={{ color: "#3b82f6", cursor: "pointer" }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>OR</p>
        <GoogleLoginButton />
      </div>

    </div>
  );
};

const styles = {
  container: { maxWidth: 400, margin: "auto", paddingTop: 50 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  error: { color: "red", fontSize: 14 },
};

export default Login;
