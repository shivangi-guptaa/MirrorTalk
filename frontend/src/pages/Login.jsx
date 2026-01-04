import { useState } from "react";
import { loginUser, googleAuth } from "../services/api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Email / Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await loginUser({ email, password });

    if (res?.success) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } else {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  // 🔹 Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const idToken = await user.getIdToken();

      // 🔥 Send token to backend
      const res = await googleAuth(idToken);

      if (res?.success) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      } else {
        setError("Google authentication failed");
      }
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed");
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

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button className="primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div style={{ margin: "16px 0", textAlign: "center", opacity: 0.6 }}>
        or
      </div>

      {/* Google Button */}
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
