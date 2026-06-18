import React from "react";

const PasswordStrengthBar = ({ score, label, checks }) => {
    const colors = ["#dc2626", "#f59e0b", "#10b981", "#2563eb"]; // red → yellow → green → blue

    const requirements = [
        { key: 'length', text: '8+ characters' },
        { key: 'uppercase', text: 'One uppercase letter' },
        { key: 'lowercase', text: 'One lowercase letter' },
        { key: 'number', text: 'One number' },
        { key: 'special', text: 'One special character' },
    ];

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
                        background: score > 0 ? (colors[score - 1] || colors[colors.length - 1]) : "transparent",
                        transition: "width 0.3s ease, background 0.3s ease",
                    }}
                />
            </div>

            <p style={{ marginTop: "4px", fontSize: "14px", fontWeight: 500, color: score > 0 ? (colors[score - 1] || colors[colors.length - 1]) : "#6b7280" }}>
                Strength: <b>{label}</b>
            </p>

            {checks && (
                <div className="mt-3 space-y-1">
                    {requirements.map((req) => (
                        <div key={req.key} className="flex items-center text-sm">
                            {checks[req.key] ? (
                                <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 mr-2 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            )}
                            <span className={checks[req.key] ? "text-gray-700" : "text-gray-400"}>
                                {req.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthBar;
