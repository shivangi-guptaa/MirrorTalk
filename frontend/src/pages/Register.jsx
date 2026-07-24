import { useState } from "react";
import { registerUser, loginUser, googleAuth } from "../services/api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Register({ onSwitchToLogin, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleExistingUserAutoLogin = async () => {
    try {
      const loginRes = await loginUser({ email, password });
      if (loginRes?.success && loginRes?.data?.token) {
        localStorage.setItem("token", loginRes.data.token);
        setSuccess("You're already registered! Logging you in... 🌿");
        setTimeout(() => {
          if (onLogin) onLogin(loginRes.data.token);
        }, 800);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    setError("Account already exists, but password was incorrect.");
    setTimeout(() => onSwitchToLogin(), 1800);
    return false;
  };

  // Email Registration — auto-login on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ Client-side validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ email, password });

      if (res?.success && res?.data?.token) {
        // ✅ New account created — auto-login directly
        localStorage.setItem("token", res.data.token);
        setSuccess("Account created! Taking you in... 🌱");
        setTimeout(() => {
          if (onLogin) onLogin(res.data.token);
        }, 800);
        return;
      }

      if (res?.message?.toLowerCase().includes("already exists")) {
        await handleExistingUserAutoLogin();
        return;
      }

      setError(res?.message || "Registration failed");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "";
      if (message.toLowerCase().includes("already exists")) {
        await handleExistingUserAutoLogin();
      } else {
        setError(message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign Up / Login — auto-login
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await googleAuth(idToken);

      if (res?.success) {
        localStorage.setItem("token", res.data.token);
        setSuccess("Signed in with Google! 🎉");
        setTimeout(() => {
          if (onLogin) onLogin(res.data.token);
        }, 600);
        return;
      }

      setError("Google authentication failed");
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
        />

        <div className="auth-input-wrap">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
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

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {success && (
          <p className="auth-success">
            {success}
          </p>
        )}

        <button
          className="primary"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create account"}
        </button>
      </form>

      <div
        style={{
          margin: "16px 0",
          textAlign: "center",
          opacity: 0.6,
        }}
      >
        or
      </div>

      <button
        type="button"
        className="google-btn"
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        Continue with Google
      </button>
    </>
  );
}

export default Register;