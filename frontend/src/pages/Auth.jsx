import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import "./auth.css";

const features = [
  { icon: "✏️", text: "Write freely, just for yourself" },
  { icon: "🌱", text: "Track your mood gently, day by day" },
  { icon: "📊", text: "See patterns in your emotional journey" },
  { icon: "🤍", text: "Build self-awareness without judgment" },
];

function Auth({ setToken }) {
  const [activeTab, setActiveTab] = useState("register");
  const navigate = useNavigate();

  const handleLogin = (token) => {
    setToken(token);
    navigate("/dashboard");
  };

  return (
    <div className="auth-shell">
      {/* LEFT PANEL — brand + features */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <span className="auth-brand-dot" />
            <span className="auth-brand-name">MirrorTalk</span>
          </div>

          <div className="auth-hero">
            <h1 className="auth-hero-title">
              A quiet space<br />for honest reflection.
            </h1>
            <p className="auth-hero-sub">
              No pressure. No streaks. No judgment.<br />
              Just you, your thoughts, and a little clarity.
            </p>
          </div>

          <ul className="auth-features">
            {features.map((f, i) => (
              <li key={i} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <span className="auth-feature-text">{f.text}</span>
              </li>
            ))}
          </ul>

          <div className="auth-left-footer">
            Built by a student, for students.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {/* Mobile-only brand */}
          <div className="auth-mobile-brand">
            <span className="auth-brand-dot" />
            <span className="auth-brand-name">MirrorTalk</span>
          </div>

          <h2 className="auth-form-title">
            {activeTab === "register" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="auth-form-sub">
            {activeTab === "register"
              ? "Start your reflection journey today."
              : "Good to see you again."}
          </p>

          {/* TOGGLE */}
          <div className="auth-toggle">
            <button
              className={activeTab === "register" ? "active" : ""}
              onClick={() => setActiveTab("register")}
            >
              Create account
            </button>
            <button
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              Sign in
            </button>
          </div>

          {/* FORM */}
          <div className="auth-form-body">
            {activeTab === "register" && <Register />}
            {activeTab === "login" && <Login setToken={handleLogin} />}
          </div>

          <p className="auth-form-footer">
            Move at your own pace 🌱
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
