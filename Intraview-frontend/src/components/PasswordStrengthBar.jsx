import React from "react";

const PasswordStrengthBar = ({ score, label }) => {
    const colors = ["#dc2626", "#f59e0b", "#10b981", "#2563eb"]; // red → yellow → green → blue

    return (
        <div style={{ marginTop: "6px" }}>
            <div
                style={{
                    height: "6px",
                    width: "100%",
                    background: "#e5e7eb",
                    borderRadius: "4px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${(score / 4) * 100}%`,
                        background: colors[score - 1] || colors[0],
                        transition: "width 0.3s ease",
                    }}
                />
            </div>

            <p style={{ marginTop: "4px", fontSize: "14px" }}>
                Strength: <b>{label}</b>
            </p>
        </div>
    );
};

export default PasswordStrengthBar;
