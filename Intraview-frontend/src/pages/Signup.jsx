import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { signup } from "../api/authApi";
import OtpModal from "../components/OtpModal";
import PasswordInput from "../components/PasswordInput";
import toaster from "../utils/toaster";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import { checkPasswordStrength } from "../utils/passwordStrength";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";



const Signup = () => {
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [email, setEmail] = useState("");
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "Weak" });
    const navigate = useNavigate();



    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object({
            username: Yup.string()
                .min(3, "At least 3 characters")
                .required("Username is required"),

            email: Yup.string()
                .email("Invalid email")
                .required("Email is required"),

            password: Yup.string()
                .min(8, "Password must be at least 8 characters")
                .required("Password is required"),

            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password"), null], "Passwords must match")
                .required("Confirm Password is required"),
        }),
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                await signup({
                    username: values.username,
                    email: values.email,
                    password: values.password,
                });

                setEmail(values.email);
                setShowOtpModal(true);
                toaster.success("OTP sent to your email!");

            } catch (err) {
                setStatus({
                    error: err.response?.data?.error || "Signup failed",
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div style={styles.container}>
            <h2>Create Account</h2>

            <form onSubmit={formik.handleSubmit} noValidate style={styles.form}>
                
                {/* USERNAME */}
                <label>Username</label>
                <input
                    type="text"
                    name="username"
                    {...formik.getFieldProps("username")}
                    style={styles.input}
                />
                {formik.touched.username && formik.errors.username && (
                    <p style={styles.error}>{formik.errors.username}</p>
                )}

                {/* EMAIL */}
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

                {/* PASSWORD */}
                <label>Password</label>
                <PasswordInput
                    name="password"
                    value={formik.values.password}
                    onChange={(e) => {
                        formik.handleChange(e);
                        setPasswordStrength(checkPasswordStrength(e.target.value));
                    }}
                    onBlur={formik.handleBlur}
                />

                {formik.touched.password && formik.errors.password && (
                    <p style={styles.error}>{formik.errors.password}</p>
                )}

                <PasswordStrengthBar
                    score={passwordStrength.score}
                    label={passwordStrength.label}
                />

                {/* CONFIRM PASSWORD */}
                <label>Confirm Password</label>
                <PasswordInput
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />

                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <p style={styles.error}>{formik.errors.confirmPassword}</p>
                )}

                {formik.status?.error && (
                    <p style={styles.error}>{formik.status.error}</p>
                )}

                <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    style={styles.submitBtn}
                >
                    {formik.isSubmitting ? "Creating..." : "Sign Up"}
                </button>
            </form>

            {showOtpModal && (
                <OtpModal
                    email={email}
                    onSuccess={() => {
                        toaster.success("Email verified successfully!");

                        setTimeout(() => {
                            navigate("/login");
                        }, 800);

                        setShowOtpModal(false);
                    }}
                    onClose={() => setShowOtpModal(false)}
                />
            )}
            <div style={{ marginTop: "10px", textAlign: "center" }}>
            <p>
                Already have an account?{" "}
                <span
                style={{ color: "#3b82f6", cursor: "pointer" }}
                onClick={() => navigate("/login")}
                >
                Login
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
    container: {
        width: "400px",
        margin: "auto",
        marginTop: "60px",
        padding: "20px",
        borderRadius: "10px",
        border: "1px solid #ddd",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    input: {
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid gray",
    },
    error: {
        color: "red",
        fontSize: "14px",
    },
    submitBtn: {
        padding: "12px",
        background: "#3b82f6",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        marginTop: "10px",
    },
};

export default Signup;
