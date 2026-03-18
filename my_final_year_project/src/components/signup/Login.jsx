import React, { useState, useEffect } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaTwitter } from "react-icons/fa";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import AOS from "aos";
import "aos/dist/aos.css";

const Login = () => {
  const [loginSetup, setLoginSetup] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleGoogleLogin = () => {
    navigate("/google-login");
  };

  const handleLoginInput = (e) => {

    const { name, value } = e.target;
    setLoginSetup({ ...loginSetup, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://glorious-lamp-45gw674xjwr3qq5w-5000.app.github.dev/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginSetup),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Login successful!");
        localStorage.setItem("user", JSON.stringify({ username: data.user }));
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Error connecting to server", error);
    }
  };

  return (
    <div className="Login-container p-5">
      <div className="Login-subcontainer m-auto p-3">
        <div className="Login-contents p-4" data-aos="fade-in">
          <form onSubmit={handleLogin}>
            <header className="form-header p-1" data-aos="fade-down">
              <h2 className="fs-3 p-1">Nigeria Lingua</h2>
              <h3 className="mt-3">Welcome Back!</h3>
              <p className="mt-4">
                Log into your account and continue your language-learning
                journey
              </p>
            </header>

            <div
              className="otherOptions d-flex flex-column flex-lg-row align-items-center justify-content-center gap-1 gap-lg-3"
              data-aos="fade-up"
              data-aos-delay="100">
              <button
                type="button"
                className="otherOptions-btn d-flex flex-row align-items-center justify-content-center gap-2"
                onClick={handleGoogleLogin}>
                <FcGoogle className="fs-4" />
                <span>Login with Google</span>
              </button>
              <button
                type="button"
                className="otherOptions-btn d-flex flex-lg-row align-items-center justify-content-center gap-2">
                <FaTwitter className="fs-4" />
                <span>Login with Twitter</span>
              </button>
            </div>

            <p className="text-center m-4 fs-6">or login with</p>

            <div className="Login-form d-flex flex-column gap-4">
              <div
                className="login-info d-flex flex-column gap-2"
                data-aos="fade-up"
                data-aos-delay="200">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  className="login-input"
                  value={loginSetup.username}
                  onChange={handleLoginInput}
                  required
                />
              </div>
              <div
                className="login-info d-flex flex-column gap-2 position-relative"
                data-aos="fade-up"
                data-aos-delay="300">
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="login-input"
                  value={loginSetup.password}
                  onChange={handleLoginInput}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <BsEye /> : <BsEyeSlash />}
                </span>
              </div>
              <p className="fp-link">Forgot password?</p>
            </div>

            <div
              className="login-options d-flex flex-column align-items-center gap-2 mt-5"
              data-aos="zoom-in">
              <button className="Login-btn" type="submit">
                Login
              </button>
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="redirect-link">
                  Signup Now
                </Link>
              </p>
            </div>
            <p className="text-center text-danger mt-2">{message}</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
