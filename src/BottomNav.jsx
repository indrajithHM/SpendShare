import { useNavigate } from "react-router-dom";

export default function BottomNav({
  mode = "dashboard", // dashboard | split
  active,
  setActive,
}) {
  const navigate = useNavigate();

  const go = (tab) => {
    if (mode === "dashboard") {
      if (tab === "SPLIT") {
        navigate("/split");
      } else {
        setActive(tab);
      }
    } else {
      // coming FROM split
      if (tab === "SPLIT") {
        navigate("/split");
      } else {
        navigate("/", {
          state: { tab },
        });
      }
    }
  };

  return (
    <nav className="bottom-nav">
      <NavItem
        label="Add"
        icon="plus-circle"
        active={active === "ADD"}
        onClick={() => go("ADD")}
      />

      <NavItem
        label="Summary"
        icon="bar-chart"
        active={active === "SUMMARY"}
        onClick={() => go("SUMMARY")}
      />

      <NavItem
        label="Split"
        icon="people"
        active={active === "SPLIT"}
        onClick={() => go("SPLIT")}
      />
    </nav>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <i className={`bi bi-${icon}`}></i>
      <span>{label}</span>
    </button>
  );
}
