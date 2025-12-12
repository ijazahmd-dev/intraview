import React, { useState } from "react";
import { verifyOtp, verifyForgotOtp, resendSignupOtp, resendForgotOtp } from "../api/authApi";
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
                response = await verifyForgotOtp({ email, otp });
                toaster.success("OTP verified successfully!");
                onSuccess(response.data.reset_token);
            } else {
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
        if (mode === "forgot-password") {
            await resendForgotOtp({ email });
        } else {
            await resendSignupOtp({ email });
        }

        toaster.success("OTP resent successfully!");
    } catch (err) {
        toaster.error(err.response?.data?.error || "Failed to resend OTP");
    } finally {
        setResending(false);
    }
};

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#faf7f7] rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    {mode === "forgot-password" ? "Reset Password" : "Verify Your Email"}
                </h2>

                {/* Description */}
                <p className="text-center text-gray-600 mb-6">
                    We've sent a verification code to
                    <span className="block font-semibold text-gray-800 mt-1">{email}</span>
                </p>

                {/* OTP Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="w-full px-4 py-3 text-center text-1.5xl font-semibold tracking-widest border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    />
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                {/* Verify button */}
                <button
                    onClick={handleVerify}
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md mb-3"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        "Verify OTP"
                    )}
                </button>

                {/* Resend button */}
                <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {resending ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Resending...
                        </span>
                    ) : (
                        "Resend OTP"
                    )}
                </button>

                {/* Help text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Didn't receive the code? Check your spam folder
                </p>
            </div>
        </div>
    );
};

export default OtpModal;