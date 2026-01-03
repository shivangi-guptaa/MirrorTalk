import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <div className="app-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth setToken={setToken} />} />
          <Route
            path="/dashboard"
            element={
              token ? (
                <Dashboard setToken={setToken} toggleTheme={toggleTheme} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
