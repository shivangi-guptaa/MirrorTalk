import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function Auth({ setToken }) {
  const [mode, setMode] = useState("login");

  return (
    <div className="home-root">
      <div className="calm-bg" />

      <div className="home-card">
        <h1 className="home-title">MirrorTalk</h1>

        <p className="home-subtitle">
          {mode === "login"
            ? "Welcome back. Take your time."
            : "Create a quiet space for yourself."}
        </p>

        <div className="tabs">
          <button
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <Login setToken={setToken} />
        ) : (
          <Register />
        )}

        <p className="home-note">
          No pressure. No judgment. You’re allowed to move slowly.
        </p>
      </div>
    </div>
  );
}

export default Auth;
