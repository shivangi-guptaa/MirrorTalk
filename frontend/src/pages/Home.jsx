import "./home.css";
import { useNavigate } from "react-router-dom";



function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <div className="calm-bg" />

      <div className="home-card">
        <h1 className="home-title">MirrorTalk</h1>

        <p className="home-subtitle">
          A quiet space to slow down, reflect, and understand yourself — without judgment.
        </p>

        <ul className="home-points">
          <li>📝 Write freely, just for yourself</li>
          <li>🌱 Track your mood gently</li>
          <li>🤍 Build self-awareness, one day at a time</li>
        </ul>

        <button className="home-button" onClick={() => navigate("/auth")}>
          Begin gently
        </button>

        <p className="home-note">
          No pressure. No streaks. Just honesty.
        </p>
      </div>
    </div>
  );
}

export default Home;
