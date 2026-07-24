import { useState } from "react";
import { forgotPassword, resetPassword } from "../services/api";

function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(1); // 1 = Email, 2 = Code & New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Send Request for Reset Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: email.trim() });
      if (res?.success) {
        setSuccess(`Verification code sent to ${email.trim()}! Please check your inbox.`);
        setStep(2);
      } else {
        setError(res?.message || "Failed to request reset code.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to request reset code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with Verification Code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword: newPassword,
      });

      if (res?.success) {
        setSuccess("Password reset successful! Redirecting to Sign In... 🌿");
        setTimeout(() => {
          onBackToLogin();
        }, 1800);
      } else {
        setError(res?.message || "Password reset failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reset password. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrap">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>
          {step === 1 ? "Reset your password" : "Enter new password"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          {step === 1
            ? "Enter your account email to receive a 6-digit reset code in your inbox."
            : `Enter the 6-digit verification code sent to ${email}`}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleRequestCode} autoComplete="off">
          <input
            type="email"
            name="forgot-email"
            autoComplete="email"
            placeholder="Your registered email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          {error && <p className="error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button className="primary" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Sending email..." : "Send Reset Code →"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} autoComplete="off">
          <input
            type="text"
            name="otp-code-input"
            autoComplete="one-time-code"
            placeholder="6-Digit Reset Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
          />

          <div className="auth-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              name="new-user-password"
              autoComplete="new-password"
              placeholder="Create new password (min. 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button className="primary" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Updating..." : "Reset Password 🌱"}
          </button>
        </form>
      )}

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ width: "100%", padding: "10px" }}
          onClick={onBackToLogin}
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
