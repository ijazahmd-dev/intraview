import React, { useEffect, useRef, useState } from "react";
import { googleLogin } from "../api/authApi";
import toaster from "../utils/toaster";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleLoginButton = () => {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Wait until the container is mounted
    const interval = setInterval(() => {
      if (!window.google) return;                   // Script not ready
      if (!buttonRef.current) return;              // DOM not ready

      console.log("GOOGLE?", window.google);
      console.log("BUTTON REF?", buttonRef.current);
      console.log("CLIENT ID:", GOOGLE_CLIENT_ID);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: "350",
        shape: "rectangular",
        text: "signin_with",
      });

      clearInterval(interval); // Stop checking once mounted
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleCredentialResponse = async (response) => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    setLoading(true);

    try {
      await googleLogin(response.credential);

            // Wait for cookies to be stored
      await new Promise((r) => setTimeout(r, 200));

      // Fetch the logged-in user into AuthContext
      if (window.fetchUser) {
          await window.fetchUser();
      }

      toaster.success("Google Login Successful!");
      navigate("/home");
    } catch (err) {
      console.error("Google login error:", err);
      toaster.error(err.response?.data?.error || "Google login failed");
    } finally {
      setLoading(false);
      setIsSigningIn(false);
    }
  };

  return (
    <div style={{ marginTop: "10px", textAlign: "center" }}>
      {loading && <p>Signing in...</p>}
      <div ref={buttonRef} style={{ minHeight: "50px" }}></div>
    </div>
  );
};

export default GoogleLoginButton;
