import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./Dashboard.css";
import "./DashboardTheme.css";

/** Wrap any logged-in page: <Layout>...page content...</Layout>
 *  Gives it the sidebar, the language colours and the same spacing as the dashboard. */
export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar") === "closed"; } catch { return false; }
  });

  useEffect(() => {
    try { document.documentElement.dataset.lang = localStorage.getItem("lang") || "yoruba"; } catch {}
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      try { localStorage.setItem("sidebar", c ? "open" : "closed"); } catch {}
      return !c;
    });

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={collapsed} toggleSidebar={toggle} />
      <div className="dashboard-main dx">{children}</div>
    </div>
  );
}
