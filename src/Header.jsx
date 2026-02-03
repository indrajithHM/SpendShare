import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useState, useRef, useEffect } from "react";
import logo from "./assets/SpendShare.png";

export default function Header({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!user) return null;

  const logout = async () => {
    setOpen(false);
    await signOut(auth);
    navigate("/");
  };

  const goProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  /* 🔴 Close dropdown when clicking outside */
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <header className="border-bottom bg-white sticky-top">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-2">

          {/* LOGO */}
          <div
            className="d-flex align-items-center"
            role="button"
            onClick={() => navigate("/")}
          >
            <img src={logo} height={40} className="me-2" />
            <h5 className="mb-0 fw-semibold">
              Spend<span className="text-success">Share</span>
            </h5>
          </div>

          {/* PROFILE */}
          <div className="position-relative" ref={dropdownRef}>
            <button
              className="btn btn-light d-flex align-items-center"
              onClick={() => setOpen((v) => !v)}
            >
              <img
                src={user.photoURL}
                className="rounded-circle me-2"
                width={32}
                height={32}
                alt="avatar"
              />
              <span>{user.displayName?.split(" ")[0]}</span>
            </button>

            {open && (
              <div
                className="dropdown-menu dropdown-menu-end show"
                style={{ position: "absolute", right: 0 }}
              >
                <button className="dropdown-item" onClick={goProfile}>
                  Profile
                </button>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item text-danger"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}