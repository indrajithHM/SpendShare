import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route } from "react-router-dom";
import { ref, get, set } from "firebase/database";

import { auth, db } from "./firebase";

import GoogleLogin from "./GoogleLogin";
import Dashboard from "./Dashboard";
import Header from "./Header";
import Profile from "./Profile";
import SplitHome from "./SplitHome";
import SplitDashboard from "./SplitDashboard";

import "./App.css";

/* ✅ Ensure profile exists (runs once per login) */
async function ensureUserProfile(user) {
  const userRef = ref(db, `users/${user.uid}`);
  const snap = await get(userRef);

  if (!snap.exists()) {
    await set(userRef, {
      createdAt: Date.now()
    });
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await ensureUserProfile(firebaseUser);
      }

      setUser(firebaseUser);
      setAuthLoading(false); // 🔑 auth resolved
    });

    return unsubscribe;
  }, []);

  /* ⏳ Auth still resolving */
  if (authLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <div className="text-muted">Please wait, loading…</div>
        </div>
      </div>
    );
  }

  /* 🔒 Not logged in */
  if (!user) {
    return <GoogleLogin />;
  }

  /* ✅ Logged in */
  return (
    <>
      <Header user={user} />

      <div className="p-3">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/split" element={<SplitHome />} />
          <Route path="/split/:splitId" element={<SplitDashboard />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </div>
    </>
  );
}