import React, { useState } from "react";

const PasswordInput = ({ value, onChange, onBlur, name }) => {
    const [show, setShow] = useState(false);

    return (
        <div style={{ position: "relative" }}>
            <input
                type={show ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                style={{
                    width: "100%",
                    padding: "10px",
                    paddingRight: "40px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                }}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                {show ? "🙈" : "👁"}
            </button>
        </div>
    );
};

export default PasswordInput;
