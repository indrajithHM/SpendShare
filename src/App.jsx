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

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // 🔒 Not logged in → only login page
  if (!user) {
    return <GoogleLogin />;
  }

  return (
    <>
      <Header />

      <Routes>
        {/* Main dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Split landing page */}
        <Route path="/split" element={<SplitHome />} />

        {/* Shared split page */}
        <Route path="/split/:splitId" element={<SplitDashboard />} />
      </Routes>
    </>
  );
}
