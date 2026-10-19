import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaFire, FaBolt, FaRedo } from "react-icons/fa";
import Sidebar from "./Sidebar";
import "./Dashboard.css";
import "./DashboardTheme.css";
import DashboardProgress from "../Dashboard/LessonPage/DashboardProgress";
import ResumeLearning from "./ResumeLearning";
import LearningOptions from "./LearningOptions";
import QuickActions from "./QuickActions";
import { useAuth } from "../../Auth/AuthContext";
import { get } from "../../api";
import { useStats, dueCount } from "../../lib/stats";

const LANGS = {
  yoruba: "Yoruba",
  igbo: "Igbo",
  hausa: "Hausa",
  efik: "Efik",
  ibibio: "Ibibio",
};
const nameOf = (k) =>
  LANGS[String(k).toLowerCase()] ||
  String(k).charAt(0).toUpperCase() + String(k).slice(1);
const isDone = (s) => /complet|done|pass/i.test(s);

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};
const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const Section = ({ title, hint, children }) => (
  <section className="dx-card">
    <div className="dx-card-head">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
    {children}
  </section>
);

const Ring = ({ pct }) => (
  <svg className="dx-ring" viewBox="0 0 36 36" aria-hidden="true">
    <circle
      cx="18"
      cy="18"
      r="15.9"
      fill="none"
      className="dx-ring-bg"
      strokeWidth="4"
    />
    <circle
      cx="18"
      cy="18"
      r="15.9"
      fill="none"
      className="dx-ring-fg"
      strokeWidth="4"
      strokeLinecap="round"
      pathLength="100"
      strokeDasharray={`${pct} 100`}
    />
  </svg>
);

const Stat = ({ icon, value, label, sub }) => (
  <div className="dx-stat">
    <div className="dx-stat-icon" aria-hidden="true">
      {icon}
    </div>
    <div>
      <b>{value}</b>
      <span>{label}</span>
      {sub && <em>{sub}</em>}
    </div>
  </div>
);

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState(null); // null = loading
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("lang") || "yoruba";
    } catch {
      return "yoruba";
    }
  });
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // works for the new login and for any older saved session
  const username = user?.name || storedUser()?.username || "";
  const { stats, error } = useStats(username);

  const toggleSidebar = () => setCollapsed(!collapsed);

  useEffect(() => {
    if (!username) navigate("/", { replace: true });
  }, [username, navigate]);

  useEffect(() => {
    document.documentElement.dataset.lang = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch {}
  }, [lang]);

  useEffect(() => {
    if (!username) return;
    get("/progress/" + encodeURIComponent(username))
      .then(setProgress)
      .catch(() => setProgress({}));
  }, [username]);

  const handleLogout = () => {
    logout();
    const keep = localStorage.getItem("lang");
    localStorage.clear();
    if (keep) localStorage.setItem("lang", keep);
    navigate("/", { replace: true });
  };

  // progress looks like { yoruba: { "lesson-1": "completed" }, igbo: {...} }
  const started = progress ? Object.entries(progress) : [];
  const goalPct = stats
    ? Math.min(100, Math.round((stats.todayXp / stats.goal) * 100))
    : 0;
  const due = stats ? dueCount(stats.cards) : 0;

  let sub = "Ready to learn some " + nameOf(lang) + " today?";
  if (stats && !error) {
    if (stats.todayXp >= stats.goal) sub = "Daily goal done. Well done!";
    else if (stats.streak > 0)
      sub = `${stats.streak}-day streak. Earn ${stats.goal - stats.todayXp} more XP to keep today's goal.`;
    else sub = `Earn ${stats.goal} XP today to start a streak.`;
  }

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <div className="dashboard-main dx">
        <header className="dx-head">
          <div className="dx-head-top">
            <div>
              <h2 className="greetings">
                {greeting()}, {username}
              </h2>
              <p className="dx-sub">{sub}</p>
            </div>
            <button className="dx-logout" onClick={handleLogout}>
              <FaSignOutAlt aria-hidden="true" /> Logout
            </button>
          </div>
          <div
            className="dx-langs"
            role="group"
            aria-label="Choose your language theme"
          >
            {Object.entries(LANGS).map(([k, n]) => (
              <button
                key={k}
                className="dx-chip"
                aria-pressed={k === lang}
                onClick={() => setLang(k)}
              >
                {n}
              </button>
            ))}
          </div>
        </header>

        <div className="dx-stats">
          <Stat
            icon={<FaFire />}
            value={stats ? stats.streak : "–"}
            label="Day streak"
            sub={stats && !error ? `Best: ${stats.bestStreak}` : ""}
          />
          <Stat
            icon={<FaBolt />}
            value={stats ? stats.xp.toLocaleString() : "–"}
            label="Total XP"
          />
          <Stat
            icon={<Ring pct={goalPct} />}
            value={stats ? `${stats.todayXp}/${stats.goal}` : "–"}
            label="Today's XP goal"
          />
          <Stat
            icon={<FaRedo />}
            value={stats ? due : "–"}
            label="Words to review"
            sub={stats && !error && due === 0 ? "Nothing due" : ""}
          />
        </div>
        {error && (
          <p className="dx-note">
            Stats are unavailable right now. Check that the backend is running
            and up to date.
          </p>
        )}

        <div className="content-box dx-body">
          <Section title="Pick up where you left off">
            <ResumeLearning />
          </Section>

          <Section
            title="Your languages"
            hint="Open a language to continue its lessons."
          >
            {progress === null ? (
              <p className="dx-muted">Loading your progress...</p>
            ) : started.length === 0 ? (
              <div className="dx-empty">
                <p>
                  You haven't started a lesson yet. Pick a language and learn
                  your first words.
                </p>
                <button className="dx-cta" onClick={() => navigate("/lessons")}>
                  Start your first lesson
                </button>
              </div>
            ) : (
              <div className="dx-langcards">
                {started.map(([key, lessons]) => {
                  const all = Object.values(lessons);
                  const done = all.filter(isDone).length;
                  return (
                    <div key={key} className="dx-langcard">
                      <b>{nameOf(key)}</b>
                      <span>
                        {done} completed
                        {all.length - done > 0
                          ? `, ${all.length - done} in progress`
                          : ""}
                      </span>
                      <div className="dx-bar" aria-hidden="true">
                        <i
                          style={{
                            width: `${all.length ? (done / all.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <button
                        className="dx-cta small"
                        onClick={() => navigate(`/lesson/${key}`)}
                      >
                        Continue
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="Your progress">
            <DashboardProgress />
          </Section>
          <Section
            title="Learn something new"
            hint="Choose a language to start a lesson or take a quiz."
          >
            <LearningOptions />
          </Section>
          <Section title="Quick actions">
            <QuickActions />
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
