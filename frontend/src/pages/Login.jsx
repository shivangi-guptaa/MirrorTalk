import { useState } from "react";
import { loginUser, googleAuth } from "../services/api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Login({ setToken, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await loginUser({ email, password });

    if (res?.success) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } else {
      setError("Invalid email or password. Please try again.");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await googleAuth(idToken);
      if (res?.success) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      } else {
        setError("Google authentication failed");
      }
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <div className="auth-input-wrap">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="auth-eye-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div style={{ textAlign: "right", margin: "-6px 0 12px" }}>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontSize: "12.5px",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <button className="primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign in →"}
        </button>
      </form>

      <div style={{ margin: "16px 0", textAlign: "center", opacity: 0.6 }}>or</div>

      <button
        type="button"
        className="google-btn"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        Continue with Google
      </button>
    </>
  );
}

export default Login;
