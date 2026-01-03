import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Auth({ setToken }) {
  const [activeTab, setActiveTab] = useState("register"); // ✅ Register first
  const navigate = useNavigate();

  const handleLogin = (token) => {
    setToken(token);
    navigate("/dashboard");
  };

  return (
    <>
      <Header />

      <div className="auth-container">
        {/* AUTH TABS */}
        <div className="auth-tabs">
          <button
            className={activeTab === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => setActiveTab("register")}
          >
            Create account
          </button>

          <button
            className={activeTab === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => setActiveTab("login")}
          >
            Sign in
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "register" && <Register />}
        {activeTab === "login" && <Login setToken={handleLogin} />}
      </div>

      <Footer />
    </>
  );
}

export default Auth;
