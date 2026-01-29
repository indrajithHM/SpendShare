import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import logo from "./assets/SpendShare.png";

export default function GoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Auth state change listener should handle navigation
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{ minHeight: "80vh" }}
    >
      {/* LOGO */}
      <img
        src={logo}
        alt="SpendShare logo"
        style={{ width: "90px", height: "90px", objectFit: "contain" }}
        className="mb-3"
      />

      {/* APP NAME */}
      <h2 className="fw-bold mb-1">
        Spend<span className="text-success">Share</span>
      </h2>

      {/* TAGLINE */}
      <p className="text-muted mb-4 px-3">
        Track expenses. Split bills. Settle instantly with friends.
      </p>

      {/* LOGIN BUTTON */}
      <button
        className="btn btn-primary btn-lg px-4 d-flex align-items-center justify-content-center"
        onClick={login}
        disabled={loading}
        style={{ minWidth: "240px" }}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            />
            Signing in…
          </>
        ) : (
          <>
            <i className="bi bi-google me-2"></i>
            Continue with Google
          </>
        )}
      </button>

      {/* ERROR MESSAGE */}
      {error && <div className="text-danger mt-3 small">{error}</div>}

      {/* FOOT NOTE */}
      <small className="text-muted mt-4 px-3">
        Simple • Transparent • No sign-up hassle
      </small>
    </div>
  );
}
