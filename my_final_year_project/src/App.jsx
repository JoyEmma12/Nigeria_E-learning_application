import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./Auth/AuthContext";
import { post } from "./api";
import AuthPage from "./components/signup/AuthPage";
import "./App.css";
import Dashboard from "./components/Dashboard/Dashboard";

import LessonScreen from "./components/Dashboard/LessonPage/LessonScreen";
import LessonPreviewScreen from "./components/Dashboard/LessonPage/LessonPreviewScreen";
import LessonCompleteScreen from "./components/Dashboard/LessonPage/LessonCompletedScreen";
import DashboardProgress from "./components/Dashboard/LessonPage/DashboardProgress";
import ProgressMain from "./components/Dashboard/LessonPage/ProgressMain";
import LanguageChart from "./components/Dashboard/LessonPage/LanguageChart";
import LessonLangScreen from "./components/Dashboard/LessonPage/LessonLangScreen";
import QuizScreen from "./components/Dashboard/LessonPage/Quizscreen";
import QuizLanguageSelection from "./components/Dashboard/LessonPage/QuizLanguageSelection";

// The only new piece: it feeds the redesigned AuthPage and then opens /dashboard
function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(mode, values) {
    const creds = {
      username: values.username.trim(),
      password: values.password,
    };
    if (mode === "signup") await post("/signup", creds); // create the account
    const data = await post("/login", creds); // then sign in straight away
    login({ token: data.token, user: { name: data.user } });
    localStorage.setItem("username", data.user); // see the note below
    navigate("/dashboard", { replace: true }); // a URL path, not a file path
  }

  return <AuthPage onSubmit={handleSubmit} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lesson/:language" element={<LessonScreen />} />
            <Route
              path="/lessons/:language/:lessonId"
              element={<LessonPreviewScreen />}
            />
            <Route
              path="/lessons/:language/:lessonId/completed"
              element={<LessonCompleteScreen />}
            />
            <Route path="/dashboardprogress" element={<DashboardProgress />} />
            <Route path="/progress" element={<ProgressMain />} />
            <Route path="/progress/:language" element={<LanguageChart />} />
            <Route path="/lessons" element={<LessonLangScreen />} />

            <Route path="/quiz" element={<QuizLanguageSelection />} />
            <Route path="/quiz/:language" element={<QuizScreen />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;