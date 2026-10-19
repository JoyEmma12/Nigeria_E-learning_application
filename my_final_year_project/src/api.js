// src/api.js
export const API = "http://127.0.0.1:5000"; // your Flask server

const token = () => {
  try { return JSON.parse(localStorage.getItem("session"))?.token; } catch { return undefined; }
};

/** fetch that adds the login token and returns parsed JSON. Throws Error(message) on failure. */
export async function request(path, options = {}) {
  const t = token();
  const res = await fetch(API + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Something went wrong. Try again.");
  return data;
}

export const post = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
export const get = (path) => request(path);

// Examples:
//   await post("/progress", { language: "yoruba", lesson: "greetings-1", status: "completed" });
//   const progress = await get("/progress/" + username);
//   await post("/quiz-score", { language: "yoruba", score: 8 });
