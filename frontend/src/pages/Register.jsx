import { useState } from "react";
import { registerUser, googleAuth } from "../services/api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Email / Password Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await registerUser({ name, email, password });
      if (res?.success) {
        alert("Account created. You can now sign in.");
      } else {
        setError(res?.message || "Registration failed");
      }
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google Signup / Login
  const handleGoogleSignup = async () => {
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
        alert("Signed in with Google successfully!");
      } else {
        setError("Google authentication failed");
      }
    } catch (err) {
      console.error(err);
      setError("Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button className="primary" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
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
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        Continue with Google
      </button>
    </>
  );
}

export default Register;
