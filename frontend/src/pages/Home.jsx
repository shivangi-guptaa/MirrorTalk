function Home({ onStart }) {
  return (
    <div className="home-root">
      {/* Abstract calming background */}
      <div className="calm-bg">
        <span className="shape shape-1" />
        <span className="shape shape-2" />
        <span className="shape shape-3" />
      </div>

      <div className="home-card">
        <h1 className="home-title">MirrorTalk</h1>

        <p className="home-subtitle">
          A quiet space to slow down, reflect, and meet yourself —
          without judgment.
        </p>

        <ul className="home-points">
          <li>📝 Write freely, just for you</li>
          <li>🌱 Notice your moods gently</li>
          <li>🤍 Build clarity one day at a time</li>
        </ul>

        <button className="home-button" onClick={onStart}>
          Begin gently
        </button>

        <p className="home-note">
          No pressure. No streaks. You’re allowed to move slowly.
        </p>
      </div>
    </div>
  );
}

export default Home;
