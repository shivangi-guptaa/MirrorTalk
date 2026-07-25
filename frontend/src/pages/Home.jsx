import "./home.css";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "📓", text: "Write freely, just for yourself" },
  { icon: "🌱", text: "Track your mood gently, day by day" },
  { icon: "📊", text: "See patterns in your emotional journey" },
  { icon: "🤍", text: "Build self-awareness without judgment" },
];

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleStart = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="home-shell">
      {/* LEFT — dark green brand panel */}
      <div className="home-left">
        <div className="home-left-content">
          <div className="home-brand">
            <span className="home-brand-dot" />
            <span className="home-brand-name">MirrorTalk</span>
          </div>

          <div className="home-hero">
            <h1 className="home-hero-title">
              A quiet space<br />for honest reflection.
            </h1>
            <p className="home-hero-sub">
              No pressure. No streaks. No judgment.<br />
              Just you, your thoughts, and a little clarity.
            </p>
          </div>

          <ul className="home-features">
            {features.map((f, i) => (
              <li key={i} className="home-feature-item">
                <span className="home-feature-icon">{f.icon}</span>
                <span className="home-feature-text">{f.text}</span>
              </li>
            ))}
          </ul>

          <div className="home-left-footer">
            Built by a student, for students.
          </div>
        </div>
      </div>

      {/* RIGHT — CTA panel */}
      <div className="home-right">
        <div className="home-cta-wrap">
          <h2 className="home-cta-title">Begin your journey</h2>
          <p className="home-cta-sub">
            A quiet space to slow down, reflect, and understand yourself — without judgment.
          </p>

          <ul className="home-cta-points">
            <li>✦ No streaks. No pressure.</li>
            <li>✦ Private and just for you.</li>
            <li>✦ One entry at a time.</li>
          </ul>

          <button className="home-cta-btn" onClick={handleStart}>
            {token ? "Open your journal" : "Begin gently"} <span className="home-btn-arrow">→</span>
          </button>

          {!token && (
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#4A7C59",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: 500,
                  textDecoration: "underline",
                }}
                onClick={() => navigate("/auth?mode=login", { state: { mode: "login" } })}
              >
                Already have an account? Sign in
              </button>
            </div>
          )}

          <p className="home-cta-note">Move at your own pace 🌱</p>
        </div>
      </div>
    </div>
  );
}

export default Home;