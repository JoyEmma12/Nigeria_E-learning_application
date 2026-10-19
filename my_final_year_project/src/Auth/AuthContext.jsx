/* eslint-disable no-empty */
import { createContext, useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const read = () => {
  try { return JSON.parse(localStorage.getItem("session")); } catch { return null; }
};

export function AuthProvider({ children }) {
  // session = { token, user: { name, ... } }
  const [session, setSession] = useState(read);

  const login = (data) => {
    setSession(data);
    try { localStorage.setItem("session", JSON.stringify(data)); } catch {}
  };
  const logout = () => {
    setSession(null);
    try { localStorage.removeItem("session"); } catch {}
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Wrap any page that needs a signed-in user. Visitors are sent to /login. */
export function ProtectedRoute({ children }) {
  const { session } = useAuth();
  const location = useLocation();
  return session ? children : <Navigate to="/login" replace state={{ from: location }} />;
}