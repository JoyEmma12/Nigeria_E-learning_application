import { useState, useEffect } from "react";
import "./auth.css";

// Greetings are samples. Have native speakers confirm them before release.
const LANGS = {
  yoruba: { name: "Yoruba", word: "Ẹ káàbọ̀", mean: "Welcome" },
  igbo: { name: "Igbo", word: "Nnọọ", mean: "Welcome" },
  hausa: { name: "Hausa", word: "Barka da zuwa", mean: "Welcome" },
  efik: { name: "Efik", word: "Sosongo", mean: "Thank you" },
  ibibio: { name: "Ibibio", word: "Sosongo", mean: "Thank you" },
};
const USERNAME = /^[A-Za-z0-9_]{3,20}$/;

const Eye = ({ off }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.57-5.17 3.57-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

function Field({ id, label, error, children }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="auth-err" id={id + "-err"}>{error}</p>}
    </div>
  );
}

/**
 * onSubmit(mode, values) should return a promise: call your Python API there.
 * mode is "login" or "signup". Throw an Error to show its message to the user.
 */
export default function AuthPage({ onSubmit, onGoogle }) {
  const [mode, setMode] = useState("login");
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("lang") || "yoruba"; } catch { return "yoruba"; }
  });
  const [v, setV] = useState({ username: "", password: "", remember: true });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    document.documentElement.dataset.lang = lang;
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang]);

  const signup = mode === "signup";
  const L = LANGS[lang];
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const switchMode = (m) => { setMode(m); setErrors({}); setStatus(""); };

  function validate() {
    const e = {};
    if (!v.username.trim()) e.username = "Enter your username.";
    else if (signup && !USERNAME.test(v.username)) e.username = "Use 3 to 20 letters, numbers or underscores.";
    if (signup && v.password.length < 8) e.password = "Use at least 8 characters.";
    if (!signup && !v.password) e.password = "Enter your password.";
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true); setStatus("");
    try {
      await (onSubmit ? onSubmit(mode, { ...v, language: lang }) : new Promise((r) => setTimeout(r, 900)));
      setStatus(signup ? "Account created. Taking you to your lessons..." : "Signed in. Taking you to your lessons...");
    } catch (ex) {
      setStatus(ex.message || "Something went wrong. Try again.");
    } finally { setLoading(false); }
  }

  const inv = (k) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? k + "-err" : undefined });

  return (
    <div className="auth">
      <aside className="auth-brand">
        <div className="auth-logo">Nigeria Lingua</div>
        <div>
          <p className="auth-word">{L.word}</p>
          <p className="auth-mean">{L.mean} in {L.name}</p>
        </div>
        <div className="auth-langs" role="group" aria-label="Choose a language">
          {Object.entries(LANGS).map(([k, x]) => (
            <button key={k} type="button" className="auth-chip" aria-pressed={k === lang} onClick={() => setLang(k)}>{x.name}</button>
          ))}
        </div>
      </aside>

      <main className="auth-form">
        <div className="auth-box">
          <div className="auth-tabs" role="tablist">
            <button type="button" role="tab" className="auth-tab" aria-selected={!signup} onClick={() => switchMode("login")}>Log in</button>
            <button type="button" role="tab" className="auth-tab" aria-selected={signup} onClick={() => switchMode("signup")}>Create account</button>
          </div>

          <h1>{signup ? `Start learning ${L.name}` : "Welcome back"}</h1>
          <p className="auth-sub">{signup ? "Free to join. Lessons come with audio." : `Pick up your ${L.name} lessons where you stopped.`}</p>

          <button type="button" className="auth-btn google" onClick={onGoogle}><GoogleG />Continue with Google</button>
          <div className="auth-or">or use a username</div>

          <form onSubmit={submit} noValidate>
            <Field id="username" label="Username" error={errors.username}>
              <input id="username" className="auth-input" autoComplete="username" autoCapitalize="none" value={v.username} onChange={set("username")} {...inv("username")} />
            </Field>
            <Field id="password" label="Password" error={errors.password}>
              <div className="auth-pw">
                <input id="password" type={show ? "text" : "password"} className="auth-input"
                  autoComplete={signup ? "new-password" : "current-password"} value={v.password} onChange={set("password")} {...inv("password")} />
                <button type="button" className="auth-eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}><Eye off={show} /></button>
              </div>
            </Field>

            {!signup && (
              <div className="auth-row">
                <label className="auth-check"><input type="checkbox" checked={v.remember} onChange={set("remember")} />Remember me</label>
                <button type="button" className="auth-link">Forgot password?</button>
              </div>
            )}

            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? "Please wait..." : signup ? "Create account" : "Log in"}
            </button>
            <div role="status">{status && <p className="auth-status">{status}</p>}</div>
          </form>

          <p className="auth-switch">
            {signup ? "Already learning with us? " : "New here? "}
            <button type="button" className="auth-link" onClick={() => switchMode(signup ? "login" : "signup")}>{signup ? "Log in" : "Create an account"}</button>
          </p>
        </div>
      </main>
    </div>
  );
}