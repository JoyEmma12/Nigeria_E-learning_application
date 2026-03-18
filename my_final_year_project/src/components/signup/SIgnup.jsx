import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Signup.css";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaTwitter } from "react-icons/fa";
import { BsEye, BsEyeSlash } from "react-icons/bs";

const Signup = () => {
  const navigate = useNavigate();
  const [signupSetup, setSignupSetup] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    confirmpassword: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleSignupInput = (e) => {
    const { name, value } = e.target;
    setSignupSetup({ ...signupSetup, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupSetup.email || !signupSetup.fullname || !signupSetup.username) {
      alert("All fields are required!");
      return;
    }
    if (signupSetup.password !== signupSetup.confirmpassword) {
      alert("Passwords do not match");
      return;
    }
//http://127.0.0.1:5000/signup
    try {
      const res = await fetch("https://glorious-lamp-45gw674xjwr3qq5w-5000.app.github.dev/signup", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupSetup.username,
          password: signupSetup.password,
        }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        localStorage.setItem(
          "user",
          JSON.stringify({ username: signupSetup.username })
        );

        alert("Sign up successful! You can now login");

        setSignupSetup({
          fullname: "",
          email: "",
          username: "",
          password: "",
          confirmpassword: "",
        });
        navigate("/");
      }
    } catch (error) {
      setMessage("Error connecting to server", error);
    }
  };

  return (
    <div className="Login-container p-4">
      <div className="Login-subcontainer m-auto p-3" data-aos="fade-up">
        <div className="Login-contents p-4">
          <form onSubmit={handleSignup}>
            <header className="form-header p-1">
              <h2 className=" fs-3">Nigeria Lingua</h2>
              <h3 className="mt-3">Create Your Free Account</h3>
              <p className="mt-4">
                Join our community and start learning Nigerian indigenous
                languages today!
              </p>
            </header>

            <div className="otherOptions d-flex flex-column flex-lg-row align-items-center justify-content-center gap-2 mt-4">
              <button
                type="button"
                className="otherOptions-btn d-flex align-items-center justify-content-center gap-2">
                <FcGoogle className="fs-4" />
                <span>Sign in with Google</span>
              </button>
              <button
                type="button"
                className="otherOptions-btn d-flex align-items-center justify-content-center gap-2">
                <FaTwitter className="fs-4" />
                <span>Sign in with Twitter</span>
              </button>
            </div>

            <p className="text-center mt-4 fs-6">or sign in with</p>

            <div className="Login-form d-flex flex-column gap-4">
              {["fullname", "email", "username"].map((field) => (
                <div
                  className="login-info d-flex flex-column gap-2"
                  key={field}>
                  <label>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    className="login-input"
                    value={signupSetup[field]}
                    onChange={handleSignupInput}
                    required
                  />
                </div>
              ))}

              <div className="login-info d-flex flex-column gap-2 position-relative">
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="login-input"
                  value={signupSetup.password}
                  onChange={handleSignupInput}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <BsEye /> : <BsEyeSlash />}
                </span>
              </div>

              <div className="login-info d-flex flex-column gap-2 position-relative">
                <label>Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmpassword"
                  className="login-input"
                  value={signupSetup.confirmpassword}
                  onChange={handleSignupInput}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <BsEye /> : <BsEyeSlash />}
                </span>
              </div>

              <div>
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  {" "}
                  I agree to the terms and conditions
                </label>
              </div>
            </div>

            <div className="login-options d-flex flex-column align-items-center gap-2 mt-4">
              <button type="submit" className="Login-btn">
                Start Learning Now
              </button>
              <p>
                Already have an account?{" "}
                <Link to="/" className="redirect-link">
                  Login Here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <p className="text-center text-danger mt-3">{message}</p>
    </div>
  );
};

export default Signup;
