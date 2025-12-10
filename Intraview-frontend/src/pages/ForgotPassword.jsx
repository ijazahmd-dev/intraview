import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { requestPasswordReset } from "../api/authApi";
import OtpModal from "../components/OtpModal";
import toaster from "../utils/toaster";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();


  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await requestPasswordReset(values);
        setEmail(values.email);
        setShowOtpModal(true);
        toaster.success("OTP sent to your email");
      } catch (err) {
        setStatus({
          error: err.response?.data?.error || "Something went wrong",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={{ width: "400px", margin: "auto", marginTop: "40px" }}>
      <h2>Forgot Password</h2>

      <form onSubmit={formik.handleSubmit}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />

        {formik.touched.email && formik.errors.email && (
          <p style={{ color: "red" }}>{formik.errors.email}</p>
        )}

        {formik.status?.error && (
          <p style={{ color: "red" }}>{formik.status.error}</p>
        )}

        <button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Sending..." : "Send OTP"}
        </button>
      </form>

      {showOtpModal && (
        <OtpModal
          email={email}
          mode="forgot-password"
          onSuccess={(resetToken) => {
            setShowOtpModal(false);
            navigate(`/reset-password?token=${resetToken}`);
          }}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
