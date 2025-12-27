import { useState } from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [started, setStarted] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className={`app ${theme}`}>
      {!started && <Home onStart={() => setStarted(true)} />}

      {started && !token && <Auth setToken={setToken} />}

      {started && token && (
        <Dashboard setToken={setToken} toggleTheme={toggleTheme} />
      )}
    </div>
  );
}

export default App;
