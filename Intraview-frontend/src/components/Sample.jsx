import React, { useState } from "react";
import { verifyOtp, verifyForgotOtp, resendOtp } from "../api/authApi";
import toaster from "../utils/toaster";

const OtpModal = ({ email, mode = "signup", onSuccess, onClose }) => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async () => {
        setLoading(true);
        setError("");

        try {
            let response;

            if (mode === "forgot-password") {
                // Verify OTP for forgot password
                response = await verifyForgotOtp({ email, otp });
                toaster.success("OTP verified successfully!");
                onSuccess(response.data.reset_token); // return reset_token
            } else {
                // Normal signup OTP verification
                await verifyOtp({ email, otp });
                toaster.success("Email verified successfully!");
                onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.error || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await resendOtp({ email });
            toaster.success("OTP resent successfully!");
        } catch (err) {
            toaster.error(err.response?.data?.error || "Failed to resend OTP");
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>{mode === "forgot-password" ? "Reset Password OTP" : "Email Verification"}</h2>

                <p>
                    We sent an OTP to <b>{email}</b>
                </p>

                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    style={styles.input}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button
                    onClick={handleVerify}
                    disabled={loading}
                    style={styles.btnPrimary}
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                    onClick={handleResend}
                    disabled={resending}
                    style={styles.btnSecondary}
                >
                    {resending ? "Resending..." : "Resend OTP"}
                </button>

                <button onClick={onClose} style={styles.closeBtn}>
                    Close
                </button>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0, left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    modal: {
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "350px",
        textAlign: "center",
    },
    input: {
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    btnPrimary: {
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        background: "#3b82f6",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
    },
    btnSecondary: {
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        background: "#10b981",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
    },
    closeBtn: {
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        background: "#ccc",
        color: "#000",
        border: "none",
        borderRadius: "5px",
    },
};

export default OtpModal;
