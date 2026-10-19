import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFire, FaBolt } from "react-icons/fa";
import Layout from "../Layout";
import { Languages } from "../../signup/Languages";
import { useAuth } from "../../../Auth/AuthContext";
import { get } from "../../../api";
import { useStats } from "../../../lib/stats";
import "./LessonLangScreen.css";

// Sample greetings. Have native speakers confirm them before release.
const HELLO = {
  yoruba: ["Ẹ káàbọ̀", "Welcome"],
  igbo: ["Nnọọ", "Welcome"],
  hausa: ["Barka da zuwa", "Welcome"],
  efik: ["Sosongo", "Thank you"],
  ibibio: ["Sosongo", "Thank you"],
};
const isDone = (s) => /complet|done|pass/i.test(s);
const storedUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};

export default function LessonLangScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.name || storedUser()?.username || "";
  const { stats, error } = useStats(username);
  const [progress, setProgress] = useState({});
  const [last, setLast] = useState("");

  useEffect(() => {
    try { setLast((localStorage.getItem("selectedLanguage") || "").toLowerCase()); } catch {}
  }, []);

  useEffect(() => {
    if (!username) return;
    get("/progress/" + encodeURIComponent(username)).then(setProgress).catch(() => setProgress({}));
  }, [username]);

  // progress keys may be saved as "Yoruba" or "yoruba", so match without case
  const countsFor = (language) => {
    const entry = Object.entries(progress).find(([k]) => k.toLowerCase() === language.toLowerCase());
    const all = entry ? Object.values(entry[1]) : [];
    const done = all.filter(isDone).length;
    return { done, doing: all.length - done, started: all.length > 0 };
  };

  function choose(language) {
    const key = language.toLowerCase();
    try {
      localStorage.setItem("selectedLanguage", language);
      localStorage.setItem("lang", key);
    } catch {}
    document.documentElement.dataset.lang = key;
    navigate(`/lesson/${language}`);
  }

  return (
    <Layout>
      <header className="ll-head">
        <h1>Choose a language</h1>
        <p>Pick one language to learn. You can switch any time, and your progress is saved for each one.</p>
        {stats && !error && (
          <div className="ll-pills">
            <span className="ll-pill"><FaFire aria-hidden="true" /> {stats.streak}-day streak</span>
            <span className="ll-pill"><FaBolt aria-hidden="true" /> {stats.xp.toLocaleString()} XP</span>
          </div>
        )}
      </header>

      <div className="ll-grid">
        {Languages.map(({ id, language, text, image }, i) => {
          const key = language.toLowerCase();
          const { done, doing, started } = countsFor(language);
          const [word, meaning] = HELLO[key] || ["", ""];
          return (
            <article key={id} className={`ll-card ${key}${last === key ? " last" : ""}`} style={{ animationDelay: `${i * 70}ms` }}>
              <div className="ll-band">
                <div>
                  {last === key && <span className="ll-badge">Last learned</span>}
                  <h2>{language}</h2>
                  {word && <p className="ll-hello">{word} <span>· {meaning}</span></p>}
                </div>
                {image && <img src={image} alt="" className="ll-img" />}
              </div>
              <div className="ll-body">
                <p className="ll-text">{text}</p>
                <p className="ll-count">
                  {started
                    ? `${done} lesson${done === 1 ? "" : "s"} completed${doing > 0 ? `, ${doing} in progress` : ""}`
                    : "New to you"}
                </p>
                <button className="ll-btn" onClick={() => choose(language)} aria-label={`${started ? "Continue" : "Start"} learning ${language}`}>
                  {started ? "Continue learning" : "Start learning"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </Layout>
  );
}
