import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import logo from "./assets/SpendShare.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const showBack = location.pathname !== "/";

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <header className="border-bottom bg-white sticky-top">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-2">
          {/* LEFT: BACK + LOGO + NAME */}
          <div className="d-flex align-items-center">
            {/* {showBack && (
              <button
                className="btn btn-link me-2 p-0"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <i className="bi bi-arrow-left fs-4"></i>
              </button>
            )} */}

            {/* LOGO + NAME → HOME */}
            <div
              className="d-flex align-items-center"
              role="button"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            >
              <img
                src={logo}
                alt="SpendShare logo"
                style={{
                  height: "40px",
                  width: "40px",
                  objectFit: "contain",
                }}
                className="me-2"
              />

              <h5 className="mb-0 fw-semibold">
                Spend<span className="text-success">Share</span>
              </h5>
            </div>
          </div>

          {/* RIGHT: LOGOUT */}
          <button className="btn btn-outline-danger btn-sm" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1"></i>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
