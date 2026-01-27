import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

function Auth({ setToken }) {
  const [activeTab, setActiveTab] = useState("register");
  const navigate = useNavigate();

  const handleLogin = (token) => {
    setToken(token);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      {/* BRANDING */}
      <h1 className="logo">MirrorTalk</h1>
      <p className="tagline">A quiet space for honest reflection</p>

      {/* CARD */}
      <div className="auth-card">
        {/* TABS */}
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

        {/* CONTENT */}
        {activeTab === "register" && <Register />}
        {activeTab === "login" && <Login setToken={handleLogin} />}
      </div>

      {/* FOOTER TEXT */}
      <p className="auth-footer">
        No pressure. No judgment.
        <br />
        Move at your own pace 🌱
      </p>
    </div>
  );
}

export default Auth;
