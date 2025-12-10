import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { resetPassword } from "../api/authApi";
import toaster from "../utils/toaster";
import { useNavigate, useSearchParams } from "react-router-dom";


const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resetToken = searchParams.get("token");

    if (!resetToken) {
        return (
            <p style={{ color: "red", textAlign: "center", marginTop: "50px" }}>
            Invalid or missing reset token.
            </p>
        );
        }



  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Min 8 characters")
        .required("Password required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Confirm password required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await resetPassword({
          reset_token: resetToken,
          new_password: values.password,
        });

        toaster.success("Password reset successful!");
        navigate("/login");

      } catch (err) {
        setStatus({
           error: err.response?.data?.error || "Something went wrong"
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={{ width: "400px", margin: "auto", marginTop: "40px" }}>
      <h2>Reset Password</h2>

      <form onSubmit={formik.handleSubmit}>
        <label>New Password</label>
        <input
          name="password"
          type="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />

        {formik.touched.password && formik.errors.password && (
          <p style={{ color: "red" }}>{formik.errors.password}</p>
        )}

        <label>Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
        />

        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p style={{ color: "red" }}>{formik.errors.confirmPassword}</p>
        )}

        {formik.status?.error && (
          <p style={{ color: "red" }}>{formik.status.error}</p>
        )}

        <button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
