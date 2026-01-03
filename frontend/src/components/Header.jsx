import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="auth-header">
      <h1 className="brand" onClick={() => navigate("/")}>
        MirrorTalk
      </h1>
      <p className="tagline">A quiet space for honest reflection</p>
    </header>
  );
}

export default Header;
