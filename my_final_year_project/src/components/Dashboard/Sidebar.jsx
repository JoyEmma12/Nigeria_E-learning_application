import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaBookOpen, FaPuzzlePiece, FaChartLine, FaSignOutAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../../Auth/AuthContext";
import "./Sidebar.css";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: <FaHome />, match: (p) => p === "/dashboard" },
  { to: "/lessons", label: "Lessons", icon: <FaBookOpen />, match: (p) => p.startsWith("/lesson") },
  { to: "/quiz", label: "Quizzes", icon: <FaPuzzlePiece />, match: (p) => p.startsWith("/quiz") },
  { to: "/progress", label: "Progress", icon: <FaChartLine />, match: (p) => p.startsWith("/progress") || p === "/dashboardprogress" },
];

const storedUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};

export default function Sidebar({ collapsed = false, toggleSidebar = () => {} }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const name = user?.name || storedUser()?.username || "";

  const handleLogout = () => {
    logout();
    const keep = localStorage.getItem("lang");
    localStorage.clear();
    if (keep) localStorage.setItem("lang", keep);
    navigate("/", { replace: true });
  };

  return (
    <aside className={"sb" + (collapsed ? " collapsed" : "")} aria-label="Main navigation">
      <div className="sb-top">
        <Link to="/dashboard" className="sb-brand" title="Nigeria Lingua">
          <span className="sb-logo" aria-hidden="true" />
          <span className="sb-name">Nigeria Lingua</span>
        </Link>
        <button className="sb-toggle" onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <nav className="sb-nav">
        {LINKS.map((l) => {
          const active = l.match(pathname);
          return (
            <Link key={l.to} to={l.to} title={l.label} className={"sb-link" + (active ? " active" : "")} aria-current={active ? "page" : undefined}>
              <span className="sb-icon" aria-hidden="true">{l.icon}</span>
              <span className="sb-label">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sb-foot">
        {name && (
          <div className="sb-user" title={name}>
            <span className="sb-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
            <span className="sb-uname">{name}</span>
          </div>
        )}
        <button className="sb-link sb-logout" onClick={handleLogout} title="Logout">
          <span className="sb-icon" aria-hidden="true"><FaSignOutAlt /></span>
          <span className="sb-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
