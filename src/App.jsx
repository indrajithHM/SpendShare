import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route } from "react-router-dom";

import { auth } from "./firebase";
import GoogleLogin from "./GoogleLogin";
import Dashboard from "./Dashboard";
import Header from "./Header";

import SplitHome from "./SplitHome";
import SplitDashboard from "./SplitDashboard";
import "./App.css"

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false); // 🔑 auth state resolved
    });

    return unsubscribe;
  }, []);

  // ⏳ Auth state still resolving
  if (authLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <div className="text-muted">Please Wait Loading...</div>
        </div>
      </div>
    );
  }

  // 🔒 Not logged in → only login page
  if (!user) {
    return <GoogleLogin />;
  }

  return (
    <>
      <Header />
      <div className="p-3">
      <Routes>
        {/* Main dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Split landing page */}
        <Route path="/split" element={<SplitHome />} />

        {/* Shared split page */}
        <Route path="/split/:splitId" element={<SplitDashboard />} />
      </Routes>
      </div>
    </>
  );
}
