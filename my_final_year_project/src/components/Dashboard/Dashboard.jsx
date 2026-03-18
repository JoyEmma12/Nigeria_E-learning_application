import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import Sidebar from "./Sidebar";
import "./Dashboard.css";
import DashboardProgress from "../Dashboard/LessonPage/DashboardProgress";
import ResumeLearning from "./ResumeLearning";
import LearningOptions from "./LearningOptions";
import QuickActions from "./QuickActions";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      setUsername(user.username);
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <div className="dashboard-main">
        <div className="dashboard-nav row align-items-center justify-content-between ">
          <h2 className="greetings col-6">Welcome back, {username}</h2>

          <button className="logout-btn col-2" onClick={handleLogout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        <div className="content-box">
          <DashboardProgress />
          <ResumeLearning />
          <LearningOptions />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
