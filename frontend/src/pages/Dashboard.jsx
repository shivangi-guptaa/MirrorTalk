import { useEffect, useState, useCallback } from "react";
import {
  PenLine,
  BookOpen,
  BarChart3,
  Heart,
  Leaf,
  CheckCircle2,
  Trash2,
  Download,
  Copy,
  Search,
  Sparkles,
  RotateCw,
  LogOut,
  UserCheck,
  AlertTriangle,
  FileText,
  TrendingUp,
  Moon,
  Sun,
  Plus
} from "lucide-react";
import {
  createJournal,
  addMood,
  getMoods,
  getWeeklyMoodSummary,
  getGratitudeHistory,
  saveGratitude,
  getJournals,
  deleteJournal,
  deleteMood,
  deleteGratitude,
  deleteAccount,
  getTodos,
  createTodo,
  toggleTodo,
  deleteTodo as deleteTodoApi,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import MoodTrendGraph from "../components/MoodTrendGraph";
import ActivityBarChart from "../components/ActivityBarChart";
import "../index.css";
import "../App.css";

const moodMap = { 1: "😭", 2: "😔", 3: "😐", 4: "🙂", 5: "😄" };
const moodLabel = { 1: "Very low", 2: "Low", 3: "Neutral", 4: "Good", 5: "Very good" };

const CARTOON_AVATARS = ["🐱", "🐼", "🦊", "🐸", "🦋", "🌻"];

/* ── Logo Component ── */
function MirrorTalkLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#4A7C59" />
      <ellipse cx="20" cy="17" rx="8" ry="10" stroke="#F9F8F3" strokeWidth="2.5" fill="none" />
      <line x1="20" y1="27" x2="20" y2="32" stroke="#F9F8F3" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="32" x2="25" y2="32" stroke="#F9F8F3" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M23 11 Q25 8 28 9" stroke="#86D49C" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="9" r="2" fill="#86D49C" />
    </svg>
  );
}

/* ── Avatar Display ── */
function AvatarDisplay({ avatar, name, size = "md" }) {
  const sizeMap = { sm: 32, md: 48, lg: 80 };
  const px = sizeMap[size] || 48;
  const fontSize = px * 0.55;

  if (!avatar) {
    return (
      <div
        className="sidebar-avatar"
        style={{ width: px, height: px, fontSize: fontSize * 0.5, flexShrink: 0 }}
      >
        {(name || "U").charAt(0).toUpperCase()}
      </div>
    );
  }

  if (avatar.startsWith("emoji:")) {
    const emoji = avatar.replace("emoji:", "");
    return (
      <div
        style={{
          width: px, height: px, borderRadius: "50%",
          background: "#EEF4F0", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: fontSize, flexShrink: 0,
          border: "2px solid rgba(74,124,89,0.2)",
        }}
      >
        {emoji}
      </div>
    );
  }

  return (
    <img
      src={avatar} alt="Profile"
      style={{ width: px, height: px, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
    />
  );
}

/* ── Edit Profile Modal ── */
function ProfileModal({ profile, onSave, onCancel }) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar || null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Please select an image smaller than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box profile-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="profile-modal-title">Edit Profile</h3>

        {/* Cartoon Avatar Selection */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>Choose an avatar</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {CARTOON_AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatar(`emoji:${emoji}`)}
                style={{
                  width: 48, height: 48, borderRadius: "50%", fontSize: 24,
                  background: avatar === `emoji:${emoji}` ? "#EEF4F0" : "transparent",
                  border: avatar === `emoji:${emoji}` ? "2.5px solid #4A7C59" : "2px solid #EBE8E1",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>or upload your own</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: 0, padding: "4px 12px", fontSize: "12px" }}
                onClick={() => document.getElementById("profile-file-input")?.click()}
              >
                {(avatar && !avatar.startsWith("emoji:")) ? "📷 Change Photo" : "📷 Upload Photo"}
              </button>
              {avatar && !avatar.startsWith("emoji:") && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: 0, padding: "4px 12px", fontSize: "12px", color: "#dc2626", borderColor: "rgba(220, 38, 38, 0.2)" }}
                  onClick={() => setAvatar(null)}
                >
                  🗑️ Remove
                </button>
              )}
            </div>
            <input id="profile-file-input" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </div>
        </div>

        <div className="profile-form">
          <label className="profile-label">Display Name</label>
          <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" />
          <label className="profile-label">Bio</label>
          <input className="profile-input" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="e.g. Student at NIT Bhopal" />
          <div className="modal-actions" style={{ marginTop: 18 }}>
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-primary profile-save-btn" onClick={() => onSave({ name: name.trim() || "User", bio: bio.trim(), avatar })}>
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Welcome Onboarding Modal ── */
function WelcomeModal({ onSave, onSkip }) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("emoji:🌻");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: name.trim() || "User", bio: "", avatar: selectedAvatar });
  };

  return (
    <div className="modal-backdrop">
      <div className="welcome-modal-center" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <MirrorTalkLogo size={52} />
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, color: "var(--text)", fontFamily: "'Poppins', sans-serif" }}>
            Welcome to MirrorTalk
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
            A quiet space just for you. No pressure, no judgment.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Selection */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 10, textAlign: "center" }}>
              Pick your avatar
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {CARTOON_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(`emoji:${emoji}`)}
                  style={{
                    width: 52, height: 52, borderRadius: "50%", fontSize: 26,
                    background: selectedAvatar === `emoji:${emoji}` ? "#EEF4F0" : "#F9F8F3",
                    border: selectedAvatar === `emoji:${emoji}` ? "3px solid #4A7C59" : "2px solid #EBE8E1",
                    cursor: "pointer", transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: selectedAvatar === `emoji:${emoji}` ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <label className="profile-label">What should we call you?</label>
          <input
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex, Shivangi..."
            autoFocus
          />

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 16 }}>
            Begin gently →
          </button>
          <button
            type="button"
            onClick={onSkip}
            style={{
              width: "100%", marginTop: 8, background: "none", border: "none",
              color: "var(--muted)", fontSize: 13, cursor: "pointer",
              padding: "8px 0", textDecoration: "underline",
            }}
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Confirm Modal ── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-msg">{message}</p>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ token, setToken, toggleTheme, darkMode }) {
  const navigate = useNavigate();

  const getProfileStorageKey = () => {
    if (!token) return "mirrorTalkProfile_guest";
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
      const parsed = JSON.parse(jsonPayload);
      return `mirrorTalkProfile_${parsed.id || parsed.userId || "guest"}`;
    } catch {
      return "mirrorTalkProfile_guest";
    }
  };

  const profileKey = getProfileStorageKey();

  const [activeTab, setActiveTab] = useState("today");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(profileKey);
    return saved ? JSON.parse(saved) : { name: "User", bio: "Click to edit profile", avatar: "emoji:🌻", onboarded: false };
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    const saved = localStorage.getItem(profileKey);
    return !saved;
  });

  useEffect(() => {
    const saved = localStorage.getItem(profileKey);
    if (saved) {
      setProfile(JSON.parse(saved));
      setShowOnboarding(false);
    } else {
      setProfile({ name: "User", bio: "Click to edit profile", avatar: "emoji:🌻", onboarded: false });
      setShowOnboarding(true);
    }
  }, [profileKey]);

  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState(3);
  const [notification, setNotification] = useState("");

  const [moods, setMoods] = useState([]);
  const [summary, setSummary] = useState(null);
  const [gratitudeHistory, setGratitudeHistory] = useState([]);
  const [journals, setJournals] = useState([]);
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");

  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [g3, setG3] = useState("");

  const [journalSearch, setJournalSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeDateStr = (d) => {
    if (!d) return "";
    if (typeof d === "string") {
      return d.split("T")[0].split(" ")[0].trim();
    }
    if (d instanceof Date) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return String(d).split("T")[0].split(" ")[0].trim();
  };

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const cleanStr = normalizeDateStr(dateStr);
    const parts = cleanStr.split("-");
    if (parts.length < 3) return new Date(dateStr);
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  };

  const safeExtractArray = useCallback((res) => {
    const isAuthError =
      res?.message === "Token is not valid" ||
      res?.message === "No token, authorization denied" ||
      res?.message === "No token, access denied" ||
      res?.message === "Invalid token";
    if (isAuthError) {
      localStorage.removeItem("token");
      setToken(null);
      navigate("/auth");
      return null;
    }
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.journals)) return res.journals;
    if (Array.isArray(res?.moods)) return res.moods;
    if (Array.isArray(res?.gratitude)) return res.gratitude;
    if (Array.isArray(res?.todos)) return res.todos;
    return null;
  }, [navigate, setToken]);

  const updateStateSafely = useCallback((setter, res) => {
    const extracted = safeExtractArray(res);
    if (extracted !== null) {
      setter(extracted);
    } else {
      console.warn("RETAINING EXISTING STATE — API returned non-array or error response:", res);
    }
  }, [safeExtractArray]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2500);
  };

  const refreshAllData = useCallback(() => {
    return Promise.allSettled([
      getMoods().then((res) => updateStateSafely(setMoods, res)).catch(console.error),
      getWeeklyMoodSummary().then((res) => res && setSummary(res)).catch(console.error),
      getGratitudeHistory().then((res) => updateStateSafely(setGratitudeHistory, res)).catch(console.error),
      getJournals().then((res) => updateStateSafely(setJournals, res)).catch(console.error),
      getTodos().then((res) => updateStateSafely(setTodos, res)).catch(console.error),
    ]);
  }, [updateStateSafely]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    refreshAllData().finally(() => setLoading(false));
  }, [refreshAllData]);

  const saveJournal = async (e) => {
    e.preventDefault();
    const textToSave = entry.trim();
    if (!textToSave) return;

    const todayDate = getLocalDateString();
    const tempId = Date.now();
    const newEntryObj = {
      id: tempId,
      entry_text: textToSave,
      entry_date: todayDate,
      created_at: new Date().toISOString(),
    };

    // 1. Instant Optimistic UI Update (0ms Latency)
    setJournals((prev) => [newEntryObj, ...prev]);
    setEntry("");
    showNotification("✨ Reflection saved gently");

    try {
      // 2. Sync with Backend DB
      await createJournal({
        entry_text: textToSave,
        entry_date: todayDate,
      });
      const freshJournals = await getJournals();
      updateStateSafely(setJournals, freshJournals);
      getWeeklyMoodSummary().then((s) => s && setSummary(s)).catch(console.error);
    } catch (err) {
      console.error("Backend journal save error:", err);
    }
  };

  const saveGratitudeEntry = async () => {
    const v1 = g1.trim();
    const v2 = g2.trim();
    const v3 = g3.trim();
    if (!v1 && !v2 && !v3) return;

    const todayDate = getLocalDateString();
    const tempId = Date.now();
    const newGratObj = {
      id: tempId,
      gratitude_1: v1 || null,
      gratitude_2: v2 || null,
      gratitude_3: v3 || null,
      entry_date: todayDate,
      created_at: new Date().toISOString(),
    };

    // 1. Instant Optimistic UI Update (0ms Latency)
    setGratitudeHistory((prev) => [newGratObj, ...prev]);
    setG1("");
    setG2("");
    setG3("");
    showNotification("🌿 Gratitude saved");

    try {
      // 2. Sync with Backend DB
      await saveGratitude({
        gratitude_1: v1 || null,
        gratitude_2: v2 || null,
        gratitude_3: v3 || null,
        entry_date: todayDate,
      });
      const freshGrat = await getGratitudeHistory();
      updateStateSafely(setGratitudeHistory, freshGrat);
    } catch (err) {
      console.error("Backend gratitude save error:", err);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    const todoText = newTodoText.trim();
    if (!todoText) return;

    const todayDate = getLocalDateString();
    const tempId = Date.now();
    const newTodoObj = {
      id: tempId,
      task_text: todoText,
      completed: 0,
      task_date: todayDate,
      created_at: new Date().toISOString(),
    };

    // 1. Instant Optimistic UI Update (0ms Latency)
    setTodos((prev) => [newTodoObj, ...prev]);
    setNewTodoText("");
    showNotification("✅ Intention added");

    try {
      // 2. Sync with Backend DB
      await createTodo({
        task_text: todoText,
        task_date: todayDate,
      });
      const freshTodos = await getTodos();
      updateStateSafely(setTodos, freshTodos);
    } catch (err) {
      console.error("Backend todo save error:", err);
    }
  };

  const handleToggleTodo = async (id) => {
    // 1. Instant Optimistic Local Toggle (0ms Latency)
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: t.completed ? 0 : 1 } : t))
    );
    try {
      // 2. Sync in Background
      await toggleTodo(id);
    } catch (err) {
      console.error("Toggle todo background error:", err);
    }
  };

  const handleDeleteTodo = async (id) => {
    // 1. Instant Optimistic Local Delete (0ms Latency)
    setTodos((prev) => prev.filter((t) => t.id !== id));
    showNotification("🗑️ Intention removed");
    try {
      // 2. Sync in Background
      await deleteTodoApi(id);
    } catch (err) {
      console.error("Delete todo background error:", err);
    }
  };

  const todayDateStr = getLocalDateString();
  const todayTasks = todos.filter((t) => {
    if (!t.task_date) return true;
    const taskDate = normalizeDateStr(t.task_date || t.created_at);
    return taskDate === todayDateStr || !t.completed;
  });
  const todayCompletedTasks = todayTasks.filter((t) => t.completed);

  // Review Day — date picker state (defaults to today)
  const [reviewDate, setReviewDate] = useState(() => getLocalDateString());
  const targetReviewDateStr = normalizeDateStr(reviewDate);
  const reviewMoods = moods.filter((m) => normalizeDateStr(m.mood_date || m.created_at) === targetReviewDateStr);
  const reviewJournals = journals.filter((j) => normalizeDateStr(j.entry_date || j.created_at) === targetReviewDateStr);
  const reviewGratitude = gratitudeHistory.filter((g) => normalizeDateStr(g.entry_date || g.created_at) === targetReviewDateStr);
  const reviewTasks = todos.filter((t) => normalizeDateStr(t.task_date || t.created_at) === targetReviewDateStr);
  const reviewCompletedTasks = reviewTasks.filter((t) => t.completed);

  const askDelete = (type, id, label) => setConfirmDelete({ type, id, label });

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    setConfirmDelete(null);
    try {
      if (type === "journal") {
        await deleteJournal(id);
        getJournals().then((res) => updateStateSafely(setJournals, res)).catch(console.error);
        getWeeklyMoodSummary().then((res) => res && setSummary(res)).catch(console.error);
        showNotification("🗑️ Journal deleted");
      } else if (type === "mood") {
        await deleteMood(id);
        getMoods().then((res) => updateStateSafely(setMoods, res)).catch(console.error);
        getWeeklyMoodSummary().then((res) => res && setSummary(res)).catch(console.error);
        showNotification("🗑️ Mood entry deleted");
      } else if (type === "gratitude") {
        await deleteGratitude(id);
        getGratitudeHistory().then((res) => updateStateSafely(setGratitudeHistory, res)).catch(console.error);
        showNotification("🗑️ Gratitude deleted");
      }
    } catch {
      showNotification("❌ Failed to delete");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await deleteAccount();
      if (res?.success) {
        localStorage.clear();
        setToken(null);
        navigate("/auth");
      } else {
        showNotification(res?.message || "Failed to delete account");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete account");
    }
  };

  const greeting =
    new Date().getHours() < 12 ? "Good morning" :
    new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const filteredJournals = journals.filter((j) =>
    (j.entry_text || "").toLowerCase().includes(journalSearch.toLowerCase())
  );

  const exportData = () => {
    let csv = "Type,Date,Content\n";
    journals.forEach((j) => { csv += `Journal,${j.entry_date},"${(j.entry_text || "").replace(/"/g, '""')}"\n`; });
    moods.forEach((m) => { csv += `Mood,${m.mood_date},${moodLabel[m.mood_level]}\n`; });
    gratitudeHistory.forEach((g) => {
      const items = [g.gratitude_1, g.gratitude_2, g.gratitude_3].filter(Boolean).join("; ");
      csv += `Gratitude,${g.entry_date},"${items}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mirrortalk-export-${getLocalDateString()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showNotification("📥 CSV Exported");
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showNotification("⚠️ Please allow popups to export PDF");
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MirrorTalk - Personal Reflection Report</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #2D3732; line-height: 1.6; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #4A7C59; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: bold; color: #4A7C59; }
          .sub { font-size: 13px; color: #78867D; margin-top: 4px; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 15px; font-weight: bold; color: #1E3524; border-bottom: 1px solid #EBE8E1; padding-bottom: 6px; margin-bottom: 12px; }
          .entry { background: #FAFAF7; border: 1px solid #EBE8E1; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
          .entry-date { font-size: 11px; font-weight: bold; color: #4A7C59; }
          .entry-text { font-size: 13px; margin-top: 4px; white-space: pre-wrap; color: #2D3732; }
          .tag { display: inline-block; background: #EEF4F0; color: #4A7C59; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 4px; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">🌿 MirrorTalk</div>
          <div class="sub">Personal Reflection Report — Generated for ${profile.name || "User"} on ${todayStr}</div>
        </div>

        <div class="section">
          <div class="section-title">📓 Journal Entries (${journals.length})</div>
          ${journals.map(j => `
            <div class="entry">
              <div class="entry-date">${parseLocalDate(j.entry_date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
              <div class="entry-text">${(j.entry_text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </div>
          `).join('') || '<p style="color:#78867D; font-size: 13px;">No journal entries recorded.</p>'}
        </div>

        <div class="section">
          <div class="section-title">😊 Mood History (${moods.length})</div>
          ${moods.map(m => `
            <div style="margin-bottom:6px; font-size:13px;">
              <strong>${parseLocalDate(m.mood_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}:</strong> 
              ${moodMap[m.mood_level]} (${moodLabel[m.mood_level]})
            </div>
          `).join('') || '<p style="color:#78867D; font-size: 13px;">No mood logs recorded.</p>'}
        </div>

        <div class="section">
          <div class="section-title">🙏 Gratitude Moments (${gratitudeHistory.length})</div>
          ${gratitudeHistory.map(g => `
            <div class="entry">
              <div class="entry-date">${parseLocalDate(g.entry_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</div>
              <div style="margin-top:6px;">
                ${[g.gratitude_1, g.gratitude_2, g.gratitude_3].filter(Boolean).map(item => `<span class="tag">${item.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`).join('')}
              </div>
            </div>
          `).join('') || '<p style="color:#78867D; font-size: 13px;">No gratitude entries recorded.</p>'}
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    showNotification("📄 PDF Report Ready");
  };

  const downloadSingleJournal = (journal) => {
    const formattedDate = parseLocalDate(journal.entry_date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const content = `MirrorTalk Reflection Entry\n--------------------------------------------------\nDate: ${formattedDate}\n\n${journal.entry_text}\n--------------------------------------------------\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `journal-entry-${journal.entry_date}.txt`; a.click();
    URL.revokeObjectURL(url);
    showNotification("📄 Entry downloaded (.txt)");
  };

  const downloadSingleJournalPDF = (journal) => {
    const formattedDate = parseLocalDate(journal.entry_date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showNotification("⚠️ Please allow popups to save PDF");
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Journal Entry - ${journal.entry_date}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #2D3732; line-height: 1.7; background: #fff; }
          .card { border: 1px solid #EBE8E1; border-radius: 16px; padding: 32px; background: #FAFAF7; max-width: 600px; margin: 0 auto; }
          .brand { font-size: 20px; font-weight: bold; color: #4A7C59; margin-bottom: 4px; }
          .date { font-size: 12px; color: #78867D; margin-bottom: 20px; border-bottom: 1px solid #EBE8E1; padding-bottom: 12px; }
          .content { font-size: 15px; white-space: pre-wrap; color: #111; }
          .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">🌿 MirrorTalk Reflection</div>
          <div class="date">${formattedDate}</div>
          <div class="content">${(journal.entry_text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          <div class="footer">Move at your own pace 🌱</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    showNotification("📄 Exporting PDF...");
  };

  const copySingleJournal = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showNotification("📋 Copied to clipboard");
  };

  const journalPrompts = [
    "What made you smile today?",
    "What's one thing you're grateful for right now?",
    "How did your body and mind feel today?",
    "What's something inspiring you learned recently?",
    "Describe a moment of peace or quiet from today.",
    "What would you tell your past self about today?",
    "What are you most looking forward to tomorrow?",
    "What was a small challenge you faced today and how did you handle it?",
    "Name three things that brought you comfort today.",
    "What is a thought or feeling you want to let go of?",
    "Who is someone who made your day a little brighter today?",
    "If today was a chapter in a book, what would the title be?",
    "What is one gentle promise you can make to yourself for tomorrow?",
    "What made you feel proud or accomplished today?",
    "What is something simple that made you pause and appreciate life today?",
  ];

  const [promptIndex, setPromptIndex] = useState(() => new Date().getDate() % journalPrompts.length);
  const getNextPrompt = () => setPromptIndex((prev) => (prev + 1) % journalPrompts.length);
  const activePrompt = journalPrompts[promptIndex];

  const calculateStreak = () => {
    if (!journals.length) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [...new Set(journals.map((j) => j.entry_date?.split("T")[0]))].sort().reverse();
    let streak = 0;
    let checkDate = new Date(today);
    for (const d of dates) {
      const entryDate = new Date(d + "T00:00:00");
      const diff = Math.round((checkDate - entryDate) / (1000 * 60 * 60 * 24));
      if (diff <= 1) { streak++; checkDate = entryDate; } else break;
    }
    return streak;
  };
  const streak = calculateStreak();

  // Smart Reflection Insights Calculations
  const getMostCommonMood = () => {
    if (!moods.length) return "Not enough data yet";
    const counts = {};
    moods.forEach((m) => {
      counts[m.mood_level] = (counts[m.mood_level] || 0) + 1;
    });
    let maxLevel = 3;
    let maxCount = 0;
    Object.keys(counts).forEach((level) => {
      if (counts[level] > maxCount) {
        maxCount = counts[level];
        maxLevel = Number(level);
      }
    });
    return `${moodMap[maxLevel]} ${moodLabel[maxLevel]}`;
  };

  const getDaysWrittenThisMonth = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const distinctDates = new Set(
      journals
        .filter((j) => {
          const d = parseLocalDate(j.entry_date);
          return d.getFullYear() === curYear && d.getMonth() === curMonth;
        })
        .map((j) => j.entry_date?.split("T")[0])
    );
    return distinctDates.size;
  };

  const getPeakReflectionTime = () => {
    const hours = journals
      .map((j) => (j.created_at ? new Date(j.created_at).getHours() : null))
      .filter((h) => h !== null && !isNaN(h));
    if (!hours.length) return "around 9 PM";
    const slots = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    hours.forEach((h) => {
      if (h >= 5 && h < 12) slots.Morning++;
      else if (h >= 12 && h < 17) slots.Afternoon++;
      else if (h >= 17 && h < 22) slots.Evening++;
      else slots.Night++;
    });
    let maxSlot = "Evening";
    let maxCount = -1;
    Object.keys(slots).forEach((s) => {
      if (slots[s] > maxCount) {
        maxCount = slots[s];
        maxSlot = s;
      }
    });
    const timeLabels = {
      Morning: "around 9 AM",
      Afternoon: "around 2 PM",
      Evening: "around 9 PM",
      Night: "around 11 PM",
    };
    return timeLabels[maxSlot] || "around 9 PM";
  };

  const getGratitudeCount = () => {
    return gratitudeHistory.length;
  };

  const getReflectionPattern = () => {
    if (!journals.length && !moods.length) return "Keep reflecting to unlock personalized emotional patterns";
    const allText = journals.map((j) => j.entry_text?.toLowerCase() || "").join(" ");
    if (allText.includes("exam") || allText.includes("study") || allText.includes("test") || allText.includes("assignment")) {
      return "Stress & focus increase before exams; quiet journaling restores calm";
    }
    if (allText.includes("work") || allText.includes("busy") || allText.includes("project") || allText.includes("internship")) {
      return "Work and project milestones correlate with heightened reflection depth";
    }
    if (allText.includes("peace") || allText.includes("calm") || allText.includes("happy") || allText.includes("grateful")) {
      return "Positive reflection notes correlate directly with peaceful mood logs";
    }
    return "Consistent daily reflections cultivate self-awareness and emotional steadying";
  };

  const dailyQuotes = [
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
    { text: "Feelings are just visitors. Let them come and go.", author: "Mooji" },
    { text: "Self-care is not selfish. You cannot serve from an empty vessel.", author: "Eleanor Brown" },
    { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
    { text: "You are enough, just as you are.", author: "Meghan Markle" },
  ];
  const todayQuote = dailyQuotes[Math.floor(Date.now() / 86400000) % dailyQuotes.length];

  const navItems = [
    { id: "today", icon: <PenLine size={17} />, label: "Today", section: "Reflect" },
    { id: "history", icon: <BookOpen size={17} />, label: "History", section: "Reflect" },
    { id: "stats", icon: <BarChart3 size={17} />, label: "Stats", section: "Insights" },
    { id: "gratitude", icon: <Heart size={17} />, label: "Gratitude", section: "Insights" },
  ];

  const switchTab = (tab) => { setActiveTab(tab); setSidebarOpen(false); };

  return (
    <div className="dashboard-shell">
      {notification && <div className="toast">{notification}</div>}

      {confirmDelete && (
        <ConfirmModal
          message={`Delete this ${confirmDelete.type} entry? This can't be undone.`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showDeleteAccountModal && (
        <ConfirmModal
          message="Are you sure you want to permanently delete your account? All your journals, mood logs, and gratitude entries will be erased forever."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteAccountModal(false)}
        />
      )}

      {showOnboarding && (
        <WelcomeModal
          onSave={(info) => {
            const updated = { ...profile, ...info, onboarded: true };
            setProfile(updated);
            localStorage.setItem(profileKey, JSON.stringify(updated));
            setShowOnboarding(false);
          }}
          onSkip={() => {
            const updated = { name: "User", bio: "", avatar: "emoji:🌻", onboarded: true };
            setProfile(updated);
            localStorage.setItem(profileKey, JSON.stringify(updated));
            setShowOnboarding(false);
          }}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onSave={(updated) => {
            const withOnboarded = { ...updated, onboarded: true };
            setProfile(withOnboarded);
            localStorage.setItem(profileKey, JSON.stringify(withOnboarded));
            setShowProfileModal(false);
            showNotification("✅ Profile updated");
          }}
          onCancel={() => setShowProfileModal(false)}
        />
      )}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <MirrorTalkLogo size={28} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="sidebar-brand-name">MirrorTalk</span>
                <span className="sidebar-brand-sub">Reflect gently.</span>
              </div>
            </div>
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {["Reflect", "Insights"].map((section) => (
            <div key={section}>
              <span className="nav-section-label">{section}</span>
              {navItems.filter((n) => n.section === section).map((n) => (
                <button
                  key={n.id}
                  className={`nav-item ${activeTab === n.id ? "active" : ""}`}
                  onClick={() => switchTab(n.id)}
                >
                  <span className="nav-icon" style={{ display: "flex", alignItems: "center" }}>{n.icon}</span> {n.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
            <AvatarDisplay avatar={profile.avatar} name={profile.name} size="sm" />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{profile.name || "User"}</span>
              <span className="sidebar-user-role">{profile.bio || "Click to edit"}</span>
            </div>
            <span className="user-menu-arrow">{showUserMenu ? "▴" : "▾"}</span>
          </div>

          {showUserMenu && (
            <div className="user-menu">
              <button className="user-menu-item" onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}>
                <UserCheck size={16} /> Edit Profile
              </button>
              <div className="user-menu-item user-menu-theme">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span className="user-menu-theme-label">Dark Mode</span>
                <button
                  className={`theme-toggle-switch ${darkMode ? "on" : ""}`}
                  onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                  aria-label="Toggle dark mode"
                >
                  <span className="theme-toggle-knob" />
                </button>
              </div>
              <div className="user-menu-divider" />
              <button className="user-menu-item user-menu-logout" onClick={logout}>
                <LogOut size={16} /> Logout
              </button>
              <button
                className="user-menu-item user-menu-logout"
                style={{ color: "#ef4444" }}
                onClick={() => { setShowDeleteAccountModal(true); setShowUserMenu(false); }}
              >
                <AlertTriangle size={16} /> Delete Account
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        {/* TOPBAR */}
        <div className="dash-topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="topbar-brand-mobile">
            <MirrorTalkLogo size={22} />
            <span>MirrorTalk</span>
          </div>
          <div className="topbar-right-mobile">
            <button className="avatar-btn-mobile" onClick={() => setShowProfileModal(true)}>
              <AvatarDisplay avatar={profile.avatar} name={profile.name} size="sm" />
            </button>
          </div>
        </div>

        <div className="dash-header-block">
          <p className="dash-date">{todayStr}</p>
          <h1 className="dash-greeting">{greeting}, {profile.name || "User"} 🌿</h1>
          <p className="daily-quote">✨ "{todayQuote.text}" — {todayQuote.author}</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="skeleton-card"><div className="skeleton-line wide"></div><div className="skeleton-line"></div><div className="skeleton-line short"></div></div>
            <div className="skeleton-card"><div className="skeleton-line wide"></div><div className="skeleton-line"></div></div>
          </div>
        ) : (
          <>
            {/* TODAY TAB */}
            {activeTab === "today" && (
              <div className="tab-content" key="today">
                {/* Journal Card */}
                <div className="dash-card journal-card">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <p className="journal-prompt" style={{ margin: 0, flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles size={16} color="#4A7C59" /> {activePrompt}
                    </p>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: 0, padding: "4px 10px", fontSize: "12px", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                      onClick={getNextPrompt}
                    >
                      <RotateCw size={12} /> New Prompt
                    </button>
                  </div>
                  <form onSubmit={saveJournal}>
                    <textarea
                      className="journal-textarea"
                      placeholder="Write freely. This space is just for you."
                      value={entry}
                      onChange={(e) => setEntry(e.target.value)}
                    />
                    {entry.trim() && (
                      <div className="journal-meta-row">
                        <span className="word-count">{entry.trim().split(/\s+/).filter(Boolean).length} words</span>
                        <button type="submit" className="btn-primary">Save gently</button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Mood Card */}
                <div className="dash-card mood-card">
                  <h2 className="card-title">Mood</h2>
                  <p className="card-sub">There's no right or wrong answer.</p>
                  <div className="mood-row">
                    {[1, 2, 3, 4, 5].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`mood-pill ${mood === m ? "active" : ""}`}
                        onClick={async () => {
                          setMood(m);
                          try {
                            await addMood({ mood_level: m, mood_date: getLocalDateString() });
                            getMoods().then((res) => updateStateSafely(setMoods, res)).catch(console.error);
                            getWeeklyMoodSummary().then((res) => res && setSummary(res)).catch(console.error);
                            showNotification("😊 Mood saved");
                          } catch {
                            showNotification("❌ Failed to save mood");
                          }
                        }}
                      >
                        <span className="mood-emoji-big">{moodMap[m]}</span>
                        <span className="mood-pill-label">{moodLabel[m]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gratitude Card */}
                <div className="dash-card gratitude-card">
                  <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Heart size={18} color="#4A7C59" /> Gratitude
                  </h2>
                  <p className="card-sub">Even one small thing is enough.</p>
                  <form onSubmit={(e) => { e.preventDefault(); saveGratitudeEntry(); }}>
                    <div className="gratitude-inputs">
                      <input className="grat-input" placeholder="Something kind" value={g1} onChange={(e) => setG1(e.target.value)} />
                      <input className="grat-input" placeholder="Something simple" value={g2} onChange={(e) => setG2(e.target.value)} />
                      <input className="grat-input" placeholder="Something steady" value={g3} onChange={(e) => setG3(e.target.value)} />
                    </div>
                    {(g1 || g2 || g3) && <button type="submit" className="btn-secondary">Save gratitude</button>}
                  </form>
                </div>

                {/* Daily Tasks Card */}
                <div className="dash-card todo-card">
                  <div className="card-header-row">
                    <div>
                      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={18} color="#4A7C59" /> Daily Intentions
                      </h2>
                      <p className="card-sub">
                        {todayTasks.length === 0 ? "Set small, peaceful goals for your day." : `${todayCompletedTasks.length} of ${todayTasks.length} completed`}
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleAddTodo} style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <input
                      className="grat-input"
                      style={{ flex: 1, minWidth: 0 }}
                      placeholder="Add a goal or intention..."
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ marginTop: 0, padding: "0 20px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Plus size={16} /> Add
                    </button>
                  </form>
                  {todayTasks.length > 0 && (
                    <div className="todo-list-wrap" style={{ marginTop: 16 }}>
                      {todayTasks.map((t) => (
                        <div key={t.id} className={`todo-item-row ${t.completed ? "completed" : ""}`}>
                          <label className="todo-label-wrap">
                            <input type="checkbox" className="todo-checkbox" checked={Boolean(t.completed)} onChange={() => handleToggleTodo(t.id)} />
                            <span className="todo-text-content">{t.task_text}</span>
                          </label>
                          <button className="delete-btn" onClick={() => handleDeleteTodo(t.id)} title="Delete todo">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HISTORY SUPER-TAB (Reflections, Charts, Archives) */}
            {activeTab === "history" && (
              <div className="tab-content" key="history">
                {/* 1. Date Review Card */}
                <div className="dash-card review-day-card">
                  <div className="card-header-row" style={{ flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <BookOpen size={18} color="#4A7C59" /> Day Reflection Review
                      </h2>
                      <p className="card-sub">Select any date to view reflections and check-ins for that day</p>
                    </div>
                    <input
                      type="date"
                      value={reviewDate}
                      max={getLocalDateString()}
                      onChange={(e) => setReviewDate(e.target.value)}
                      style={{
                        border: "1px solid #EBE8E1",
                        borderRadius: 10,
                        padding: "6px 12px",
                        fontSize: 13,
                        color: "var(--text)",
                        background: "var(--surface, #FAFAF7)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {reviewMoods.length === 0 && reviewJournals.length === 0 && reviewGratitude.length === 0 && reviewTasks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "28px 16px", color: "var(--muted)" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Leaf size={28} color="#4A7C59" /></div>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>No entries recorded for this date.</p>
                      {reviewDate === getLocalDateString() && (
                        <p style={{ fontSize: 12, marginTop: 4 }}>Go to the <strong>Today</strong> tab to log your thoughts!</p>
                      )}
                    </div>
                  ) : (
                    <div className="review-stats-grid">
                      <div className="review-stat-box">
                        <span className="review-stat-label">Mood Check-ins</span>
                        <span className="review-stat-num">{reviewMoods.length}</span>
                        {reviewMoods.length > 0 && (
                          <div className="review-mood-timeline">
                            {reviewMoods.map((m, idx) => (
                              <span key={idx} className="review-mood-badge">
                                {moodMap[m.mood_level]} {moodLabel[m.mood_level]}
                                {m.created_at && !isNaN(new Date(m.created_at).getTime()) && (
                                  <small className="review-time"> · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="review-stat-box">
                        <span className="review-stat-label">Journals Written</span>
                        <span className="review-stat-num">{reviewJournals.length}</span>
                        {reviewJournals.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            {reviewJournals.map((j, i) => (
                              <p key={i} style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0", lineHeight: 1.4 }}>
                                "{j.entry_text?.slice(0, 60)}{j.entry_text?.length > 60 ? "…" : ""}"
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="review-stat-box">
                        <span className="review-stat-label">Gratitude Moments</span>
                        <span className="review-stat-num">{reviewGratitude.length}</span>
                      </div>
                      <div className="review-stat-box">
                        <span className="review-stat-label">Tasks Completed</span>
                        <span className="review-stat-num">{reviewCompletedTasks.length} / {reviewTasks.length}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Visual Charts */}
                <div className="dash-card chart-card">
                  <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TrendingUp size={18} color="#4A7C59" /> Mood Journey
                  </h2>
                  <p className="card-sub">Your emotional trend over time</p>
                  <MoodTrendGraph moods={moods} />
                </div>

                <div className="dash-card chart-card">
                  <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BarChart3 size={18} color="#4A7C59" /> 7-Day Activity
                  </h2>
                  <p className="card-sub">Journals, Gratitude & Tasks — last 7 days</p>
                  <ActivityBarChart journals={journals} gratitudeHistory={gratitudeHistory} todos={todos} />
                </div>

                {/* 3. Journal Archives */}
                <div className="dash-card archive-card">
                  <div className="card-header-row" style={{ flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PenLine size={18} color="#4A7C59" /> Your words
                      </h2>
                      <p className="card-sub">{journals.length} journal {journals.length === 1 ? "entry" : "entries"}</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div className="search-wrap">
                        <span className="search-icon" style={{ display: "flex", alignItems: "center" }}><Search size={14} color="var(--muted)" /></span>
                        <input
                          className="search-input"
                          placeholder="Search entries..."
                          value={journalSearch}
                          onChange={(e) => setJournalSearch(e.target.value)}
                        />
                      </div>
                      <button className="export-btn" onClick={exportData} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Download size={14} /> Export CSV
                      </button>
                      <button className="export-btn" onClick={exportPDF} style={{ background: "#EEF4F0", color: "#4A7C59", border: "1px solid rgba(74,124,89,0.2)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <FileText size={14} /> Export PDF
                      </button>
                    </div>
                  </div>

                  {filteredJournals.length === 0 ? (
                    <EmptyState message={journalSearch ? "No entries match your search." : "Your journal entries will appear here."} />
                  ) : (
                    <div className="entries-list">
                      {filteredJournals.map((j, i) => (
                        <details key={j.id ?? i} className="entry-row">
                          <summary className="entry-summary">
                            <div className="entry-summary-left">
                              <span className="entry-preview">{j.entry_text?.slice(0, 80)}{j.entry_text?.length > 80 ? "…" : ""}</span>
                              <span className="entry-date">
                                {parseLocalDate(j.entry_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                                {j.created_at && !isNaN(new Date(j.created_at).getTime()) && (
                                  <span style={{ marginLeft: 6, opacity: 0.6 }}>
                                    · {new Date(j.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="entry-summary-right">
                              <span className="entry-expand-badge">Read ▾</span>
                              <button className="delete-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); askDelete("journal", j.id, j.entry_date); }} title="Delete entry">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </summary>
                          <div className="entry-body">
                            <p className="entry-full-text">{j.entry_text}</p>
                            <div className="entry-body-meta">
                              <span className="word-count-badge">{j.entry_text?.trim().split(/\s+/).filter(Boolean).length} words</span>
                              <div className="entry-action-pills">
                                <button type="button" className="entry-pill-btn" onClick={() => copySingleJournal(j.entry_text)} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <Copy size={12} /> Copy
                                </button>
                                <button type="button" className="entry-pill-btn entry-pill-save" onClick={() => downloadSingleJournal(j)} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <Download size={12} /> Save .txt
                                </button>
                                <button type="button" className="entry-pill-btn entry-pill-save" onClick={() => downloadSingleJournalPDF(j)} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <FileText size={12} /> Save .pdf
                                </button>
                              </div>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Mood Log */}
                <div className="dash-card archive-card">
                  <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BarChart3 size={18} color="#4A7C59" /> Mood log
                  </h2>
                  <p className="card-sub">{moods.length} mood {moods.length === 1 ? "entry" : "entries"}</p>
                  {moods.length === 0 ? (
                    <EmptyState message="Your mood entries will appear here." />
                  ) : (
                    <div className="entries-list">
                      {moods.slice().reverse().map((m, i) => (
                        <div key={m.id ?? i} className="mood-log-row">
                          <span className="mood-log-emoji">{moodMap[m.mood_level]}</span>
                          <div className="mood-log-info">
                            <span className="mood-log-label">{moodLabel[m.mood_level]}</span>
                            <span className="mood-log-date">
                              {parseLocalDate(m.mood_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <button className="delete-btn" onClick={() => askDelete("mood", m.id, m.mood_date)} title="Delete mood">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STATS TAB */}
            {activeTab === "stats" && (
              <div className="tab-content" key="stats">
                {streak > 0 && (
                  <div className="streak-badge" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={14} color="#92400e" /> {streak} day{streak > 1 ? "s" : ""} of reflection
                  </div>
                )}

                {/* SMART PERSONAL INSIGHTS CARD */}
                <div className="dash-card insights-highlight-card" style={{ marginTop: 16 }}>
                  <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Sparkles size={18} color="#4A7C59" /> Smart Personal Insights
                  </h2>
                  <p className="card-sub">Patterns & trends discovered from your reflection logs</p>

                  <div className="insights-list-grid">
                    <div className="insight-item-box">
                      <span className="insight-item-icon">😊</span>
                      <div className="insight-item-info">
                        <span className="insight-item-title">Most common mood</span>
                        <span className="insight-item-val">{getMostCommonMood()}</span>
                      </div>
                    </div>

                    <div className="insight-item-box">
                      <span className="insight-item-icon">📅</span>
                      <div className="insight-item-info">
                        <span className="insight-item-title">Monthly reflection</span>
                        <span className="insight-item-val">{getDaysWrittenThisMonth()} day{getDaysWrittenThisMonth() === 1 ? "" : "s"} written this month</span>
                      </div>
                    </div>

                    <div className="insight-item-box">
                      <span className="insight-item-icon">🌙</span>
                      <div className="insight-item-info">
                        <span className="insight-item-title">Peak reflection hour</span>
                        <span className="insight-item-val">You journal most {getPeakReflectionTime()}</span>
                      </div>
                    </div>

                    <div className="insight-item-box">
                      <span className="insight-item-icon">❤️</span>
                      <div className="insight-item-info">
                        <span className="insight-item-title">Gratitude practice</span>
                        <span className="insight-item-val">Gratitude appears in {getGratitudeCount()} moment{getGratitudeCount() === 1 ? "" : "s"}</span>
                      </div>
                    </div>

                    <div className="insight-item-box wide">
                      <span className="insight-item-icon">💡</span>
                      <div className="insight-item-info">
                        <span className="insight-item-title">Reflection Pattern</span>
                        <span className="insight-item-val">{getReflectionPattern()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stat-grid" style={{ marginTop: 16 }}>
                  <div className="stat-card">
                    <span className="stat-label">This week</span>
                    <span className="stat-num">{summary?.total_days ?? "—"}</span>
                    <span className="stat-sub">days tracked</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Avg mood</span>
                    <span className="stat-num stat-emoji">
                      {summary?.avg_mood ? moodMap[Math.round(summary.avg_mood)] : "—"}
                    </span>
                    <span className="stat-sub">
                      {summary?.avg_mood ? moodLabel[Math.round(summary.avg_mood)] : "no data"}
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Entries</span>
                    <span className="stat-num">{journals.length}</span>
                    <span className="stat-sub">total journals</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Gratitude</span>
                    <span className="stat-num">{gratitudeHistory.length}</span>
                    <span className="stat-sub">moments noticed</span>
                  </div>
                </div>

                <div className="analytics-grid" style={{ marginTop: 20 }}>
                  <div className="analytics-card">
                    <h3>Total Mood Entries</h3>
                    <p>{moods.length}</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Average Mood</h3>
                    <p>{summary?.avg_mood ? `${parseFloat(summary.avg_mood).toFixed(1)} / 5` : "—"}</p>
                    {summary?.avg_mood && (
                      <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 500 }}>
                        {moodMap[Math.round(summary.avg_mood)]} {moodLabel[Math.round(summary.avg_mood)]}
                      </span>
                    )}
                  </div>
                  <div className="analytics-card">
                    <h3>Days Tracked</h3>
                    <p>{summary?.total_days || 0}</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Journal Streak</h3>
                    <p>{streak}</p>
                    <span style={{ fontSize: "13px", color: "var(--muted)" }}>{streak > 0 ? "days 🔥" : "Start today!"}</span>
                  </div>
                </div>

                {summary && (
                  <div className="dash-card" style={{ marginTop: 20 }}>
                    <h2 className="card-title">This Week</h2>
                    <p className="card-sub">It's about noticing, not fixing.</p>
                    <div className="summary-pills">
                      <div className="summary-pill">
                        <span className="summary-pill-val">{moodMap[Math.round(summary.avg_mood)]}</span>
                        <span className="summary-pill-label">average mood</span>
                      </div>
                      <div className="summary-pill">
                        <span className="summary-pill-val">{summary.total_days}</span>
                        <span className="summary-pill-label">days tracked</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GRATITUDE TAB */}
            {activeTab === "gratitude" && (
              <div className="tab-content" key="gratitude">
                <div className="dash-card">
                  <h2 className="card-title">Moments you noticed</h2>
                  <p className="card-sub">{gratitudeHistory.length} entries</p>
                  {gratitudeHistory.length === 0 ? (
                    <EmptyState message="Your gratitude entries will appear here." />
                  ) : (
                    <div className="gratitude-history">
                      {gratitudeHistory.map((g, i) => (
                        <div key={g.id ?? i} className="grat-entry">
                          <span className="grat-entry-date">
                            {parseLocalDate(g.entry_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <div className="grat-items">
                            {g.gratitude_1 && <span className="grat-tag">{g.gratitude_1}</span>}
                            {g.gratitude_2 && <span className="grat-tag">{g.gratitude_2}</span>}
                            {g.gratitude_3 && <span className="grat-tag">{g.gratitude_3}</span>}
                          </div>
                          <button className="delete-btn" onClick={() => askDelete("gratitude", g.id, g.entry_date)}>🗑️</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* BOTTOM NAV (Mobile only) */}
        <nav className="bottom-nav">
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`bottom-nav-item ${activeTab === n.id ? "active" : ""}`}
              onClick={() => switchTab(n.id)}
            >
              <span className="bottom-nav-icon">{n.icon}</span>
              <span className="bottom-nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}

export default Dashboard;
