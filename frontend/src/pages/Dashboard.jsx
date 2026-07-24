import { useEffect, useState } from "react";
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
import MoodHeatmap from "../components/MoodHeatmap";
import ActivityBarChart from "../components/ActivityBarChart";
import "../index.css";
import "../App.css";

const moodMap = { 1: "😭", 2: "😔", 3: "😐", 4: "🙂", 5: "😄" };
const moodLabel = { 1: "Very low", 2: "Low", 3: "Neutral", 4: "Good", 5: "Very good" };

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

  const handleRemovePhoto = () => {
    setAvatar(null);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box profile-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="profile-modal-title">Edit Profile</h3>

        <div className="profile-avatar-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            className="profile-avatar-upload"
            title="Click to change photo"
            onClick={() => document.getElementById("profile-file-input")?.click()}
            style={{ cursor: 'pointer' }}
          >
            {avatar
              ? <img src={avatar} alt="Profile" className="profile-modal-avatar-img" />
              : <div className="profile-modal-avatar">{(name || "F").charAt(0).toUpperCase()}</div>
            }
            <div className="profile-avatar-overlay">📷</div>
          </div>

          <input
            id="profile-file-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 0, padding: '4px 12px', fontSize: '12px' }}
              onClick={() => document.getElementById("profile-file-input")?.click()}
            >
              {avatar ? "📷 Change Photo" : "📷 Upload Photo"}
            </button>
            {avatar && (
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: 0, padding: '4px 12px', fontSize: '12px', color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                onClick={handleRemovePhoto}
              >
                🗑️ Remove Photo
              </button>
            )}
          </div>
        </div>

        <div className="profile-form" style={{ marginTop: 16 }}>
          <label className="profile-label">Display Name</label>
          <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" />

          <label className="profile-label">Bio</label>
          <input className="profile-input" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="e.g. Student at NIT Bhopal / Exploring mindfulness" />

          <div className="modal-actions" style={{ marginTop: 18 }}>
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-primary profile-save-btn" onClick={() => onSave({ name: name.trim() || 'Friend', bio: bio.trim(), avatar })}>
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Welcome Onboarding Modal for New Joiners ── */
function WelcomeModal({ onSave }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: name.trim() || "Friend", bio: bio.trim() });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box profile-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 36 }}>🌿</span>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 8, color: "var(--text)" }}>
            Welcome to MirrorTalk!
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Let's set up your profile to make this quiet space feel like home.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <label className="profile-label">What should we call you?</label>
          <input
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex, Sam..."
            required
            autoFocus
          />

          <label className="profile-label">Bio or Intention (Optional)</label>
          <input
            className="profile-input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g. Student / Reflecting & growing daily"
          />

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 16 }}>
            Get Started →
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
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const parsed = JSON.parse(jsonPayload);
      return `mirrorTalkProfile_${parsed.id || parsed.userId || 'guest'}`;
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
    return saved ? JSON.parse(saved) : { name: "Friend", bio: "Click to edit profile", avatar: null, onboarded: false };
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
      setProfile({ name: "Friend", bio: "Click to edit profile", avatar: null, onboarded: false });
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
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length < 3) return new Date(dateStr);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const handleApiResponse = (res) => {
    const isAuthError =
      res?.message === 'Token is not valid' ||
      res?.message === 'No token, authorization denied' ||
      res?.message === 'No token, access denied' ||
      res?.message === 'Invalid token';

    if (isAuthError) {
      localStorage.removeItem('token');
      setToken(null);
      navigate('/auth');
      return [];
    }
    if (Array.isArray(res)) return res;
    if (res?.success && Array.isArray(res.data)) return res.data;
    return [];
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2500);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Promise.all([
      getMoods().then((res) => setMoods(handleApiResponse(res))),
      getWeeklyMoodSummary().then(setSummary),
      getGratitudeHistory().then((res) => setGratitudeHistory(handleApiResponse(res))),
      getJournals().then((res) => setJournals(handleApiResponse(res))),
      getTodos().then((res) => setTodos(handleApiResponse(res)))
    ])
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const saveJournal = async (e) => {
    e.preventDefault();
    if (!entry.trim()) return;
    try {
      await createJournal({
        entry_text: entry,
        entry_date: getLocalDateString(),
      });
      setEntry("");
      setJournals(handleApiResponse(await getJournals()));
      showNotification("📝 Journal saved");
    } catch {
      showNotification("❌ Failed to save journal");
    }
  };

  const saveGratitudeEntry = async () => {
    const v1 = g1.trim();
    const v2 = g2.trim();
    const v3 = g3.trim();
    if (!v1 && !v2 && !v3) return;
    try {
      await saveGratitude({
        gratitude_1: v1 || null,
        gratitude_2: v2 || null,
        gratitude_3: v3 || null,
        entry_date: getLocalDateString(),
      });
      setG1(""); setG2(""); setG3("");
      setGratitudeHistory(handleApiResponse(await getGratitudeHistory()));
      showNotification("🙏 Gratitude saved");
    } catch {
      showNotification("❌ Failed to save gratitude");
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    try {
      const res = await createTodo({
        task_text: newTodoText.trim(),
        task_date: getLocalDateString()
      });
      if (res.success) {
        showNotification("✅ Task added");
        setNewTodoText("");
        getTodos().then((r) => setTodos(handleApiResponse(r)));
      }
    } catch {
      showNotification("Failed to add task");
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      await toggleTodo(id);
      getTodos().then((r) => setTodos(handleApiResponse(r)));
    } catch {
      showNotification("Failed to update task");
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodoApi(id);
      getTodos().then((r) => setTodos(handleApiResponse(r)));
      showNotification("🗑️ Task deleted");
    } catch {
      showNotification("Failed to delete task");
    }
  };

  const todayDateStr = getLocalDateString();
  const todayMoods = moods.filter(m => m.mood_date && m.mood_date.split('T')[0] === todayDateStr);
  const todayJournals = journals.filter(j => j.entry_date && j.entry_date.split('T')[0] === todayDateStr);
  const todayGratitude = gratitudeHistory.filter(g => g.entry_date && g.entry_date.split('T')[0] === todayDateStr);
  const todayTasks = todos.filter(t => t.task_date && t.task_date.split('T')[0] === todayDateStr);
  const todayCompletedTasks = todayTasks.filter(t => t.completed);

  /* ── Delete handlers ── */
  const askDelete = (type, id, label) => {
    setConfirmDelete({ type, id, label });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    setConfirmDelete(null);

    try {
      if (type === "journal") {
        await deleteJournal(id);
        setJournals(handleApiResponse(await getJournals()));
        showNotification("🗑️ Journal deleted");
      } else if (type === "mood") {
        await deleteMood(id);
        setMoods(handleApiResponse(await getMoods()));
        setSummary(await getWeeklyMoodSummary());
        showNotification("🗑️ Mood entry deleted");
      } else if (type === "gratitude") {
        await deleteGratitude(id);
        setGratitudeHistory(handleApiResponse(await getGratitudeHistory()));
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
    (j.entry_text || '').toLowerCase().includes(journalSearch.toLowerCase())
  );

  const exportData = () => {
    let csv = 'Type,Date,Content\n';
    journals.forEach(j => {
      csv += `Journal,${j.entry_date},"${(j.entry_text || '').replace(/"/g, '""')}"\n`;
    });
    moods.forEach(m => {
      csv += `Mood,${m.mood_date},${moodLabel[m.mood_level]}\n`;
    });
    gratitudeHistory.forEach(g => {
      const items = [g.gratitude_1, g.gratitude_2, g.gratitude_3].filter(Boolean).join('; ');
      csv += `Gratitude,${g.entry_date},"${items}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirrortalk-export-${getLocalDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📥 Data exported');
  };

  const downloadSingleJournal = (journal) => {
    const formattedDate = parseLocalDate(journal.entry_date).toLocaleDateString(undefined, {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const formattedTime = journal.created_at
      ? new Date(journal.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      : "";

    const wordCount = journal.entry_text?.trim().split(/\s+/).filter(Boolean).length || 0;

    const content = `MirrorTalk Reflection Entry
--------------------------------------------------
Date: ${formattedDate} ${formattedTime ? `· ${formattedTime}` : ''}
Word Count: ${wordCount} words

${journal.entry_text}
--------------------------------------------------
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-entry-${journal.entry_date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📄 Entry downloaded');
  };

  const copySingleJournal = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showNotification('📋 Copied to clipboard');
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
    "What is something simple that made you pause and appreciate life today?"
  ];

  const [promptIndex, setPromptIndex] = useState(() => new Date().getDate() % journalPrompts.length);

  const getNextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % journalPrompts.length);
  };

  const activePrompt = journalPrompts[promptIndex];

  const calculateStreak = () => {
    if (!journals.length) return 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    const dates = [...new Set(journals.map(j => j.entry_date?.split('T')[0]))].sort().reverse();
    let streak = 0;
    let checkDate = new Date(today);
    for (const d of dates) {
      const entryDate = new Date(d + 'T00:00:00');
      const diff = Math.round((checkDate - entryDate) / (1000*60*60*24));
      if (diff <= 1) { streak++; checkDate = entryDate; }
      else break;
    }
    return streak;
  };
  const streak = calculateStreak();

  const dailyQuotes = [
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
    { text: "Feelings are just visitors. Let them come and go.", author: "Mooji" },
    { text: "Self-care is not selfish. You cannot serve from an empty vessel.", author: "Eleanor Brown" },
    { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  ];
  const todayQuote = dailyQuotes[Math.floor(Date.now() / 86400000) % dailyQuotes.length];

  return (
    <div className="dashboard-shell">
      {notification && <div className="toast">{notification}</div>}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <ConfirmModal
          message={`Delete this ${confirmDelete.type} entry? This can't be undone.`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <ConfirmModal
          message="Are you sure you want to permanently delete your account? All your journals, mood logs, and gratitude entries will be erased forever."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteAccountModal(false)}
        />
      )}

      {/* Welcome / Onboarding Modal — shows for new users */}
      {showOnboarding && (
        <WelcomeModal
          onSave={(info) => {
            const updated = { ...profile, ...info, onboarded: true };
            setProfile(updated);
            localStorage.setItem(profileKey, JSON.stringify(updated));
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onSave={(updated) => {
            const withOnboarded = { ...updated, onboarded: true };
            setProfile(withOnboarded);
            localStorage.setItem(profileKey, JSON.stringify(withOnboarded));
            setShowProfileModal(false);
            showNotification('✅ Profile updated');
          }}
          onCancel={() => setShowProfileModal(false)}
        />
      )}

      {/* SIDEBAR */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">MirrorTalk</span>
          <span className="sidebar-brand-sub">a quiet space</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Reflect</span>
          <button className={`nav-item ${activeTab === "today" ? "active" : ""}`} onClick={() => { setActiveTab("today"); setSidebarOpen(false); }}>
            <span className="nav-icon">✏️</span> Today
          </button>
          <button className={`nav-item ${activeTab === "todos" ? "active" : ""}`} onClick={() => { setActiveTab("todos"); setSidebarOpen(false); }}>
            <span className="nav-icon">✅</span> Daily Tasks
          </button>
          <button className={`nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }}>
            <span className="nav-icon">📖</span> History
          </button>

          <span className="nav-section-label">Insights</span>
          <button className={`nav-item ${activeTab === "trends" ? "active" : ""}`} onClick={() => { setActiveTab("trends"); setSidebarOpen(false); }}>
            <span className="nav-icon">📈</span> Mood trends
          </button>
          <button className={`nav-item ${activeTab === "gratitude" ? "active" : ""}`} onClick={() => { setActiveTab("gratitude"); setSidebarOpen(false); }}>
            <span className="nav-icon">🙏</span> Gratitude
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
            {profile.avatar
              ? <img src={profile.avatar} alt="avatar" className="sidebar-avatar sidebar-avatar-img" />
              : <div className="sidebar-avatar">{(profile.name || 'User').charAt(0).toUpperCase()}</div>
            }
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{profile.name || 'Set profile'}</span>
              <span className="sidebar-user-role">{profile.bio || 'Click to edit'}</span>
            </div>
            <span className="user-menu-arrow">{showUserMenu ? '▴' : '▾'}</span>
          </div>
          {showUserMenu && (
            <div className="user-menu">
              <button className="user-menu-item" onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}>
                <span>✏️</span> Edit Profile
              </button>
              <div className="user-menu-item user-menu-theme">
                <span>{darkMode ? '🌙' : '☀️'}</span>
                <span className="user-menu-theme-label">Dark Mode</span>
                <button
                  className={`theme-toggle-switch ${darkMode ? 'on' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                  aria-label="Toggle dark mode"
                >
                  <span className="theme-toggle-knob" />
                </button>
              </div>
              <div className="user-menu-divider" />
              <button className="user-menu-item user-menu-logout" onClick={logout}>
                <span>🚪</span> Logout
              </button>
              <button
                className="user-menu-item user-menu-logout"
                style={{ color: '#ef4444' }}
                onClick={() => { setShowDeleteAccountModal(true); setShowUserMenu(false); }}
              >
                <span>⚠️</span> Delete Account
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <div className="dash-topbar">
          <div>
            <p className="dash-date">{todayStr}</p>
            <h1 className="dash-greeting">{greeting} 🌿</h1>
            <p className="daily-quote">✨ "{todayQuote.text}" — {todayQuote.author}</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="skeleton-card"><div className="skeleton-line wide"></div><div className="skeleton-line"></div><div className="skeleton-line short"></div></div>
            <div className="skeleton-card"><div className="skeleton-line wide"></div><div className="skeleton-line"></div></div>
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            {streak > 0 && <div className="streak-badge">🔥 {streak} day{streak > 1 ? 's' : ''} of reflection</div>}
            <div className="stat-grid">
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

        {/* TODAY TAB */}
        {activeTab === "today" && (
          <div className="tab-content" key="today">
            <div className="dash-card journal-card">
              {!entry && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '8px 0 12px', flexWrap: 'wrap' }}>
                  <p className="journal-prompt" style={{ margin: 0, flex: 1 }}>💭 {activePrompt}</p>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginTop: 0, padding: '4px 10px', fontSize: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={getNextPrompt}
                    title="Get another writing prompt"
                  >
                    🔄 New Prompt
                  </button>
                </div>
              )}
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

            <div className="dash-card">
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
                        setMoods(handleApiResponse(await getMoods()));
                        setSummary(await getWeeklyMoodSummary());
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

            <div className="dash-card">
              <h2 className="card-title">Gratitude</h2>
              <p className="card-sub">Even one small thing is enough.</p>
              <form onSubmit={(e) => { e.preventDefault(); saveGratitudeEntry(); }}>
                <div className="gratitude-inputs">
                  <input
                    className="grat-input"
                    placeholder="Something kind"
                    value={g1}
                    onChange={(e) => setG1(e.target.value)}
                  />
                  <input
                    className="grat-input"
                    placeholder="Something simple"
                    value={g2}
                    onChange={(e) => setG2(e.target.value)}
                  />
                  <input
                    className="grat-input"
                    placeholder="Something steady"
                    value={g3}
                    onChange={(e) => setG3(e.target.value)}
                  />
                </div>
                {(g1 || g2 || g3) && (
                  <button type="submit" className="btn-secondary">Save gratitude</button>
                )}
              </form>
            </div>

            {/* DAILY TASKS & INTENTIONS CARD */}
            <div className="dash-card todo-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Daily Intentions & Tasks ✅</h2>
                  <p className="card-sub">
                    {todayTasks.length === 0
                      ? "Set small, peaceful goals for your day."
                      : `${todayCompletedTasks.length} of ${todayTasks.length} tasks completed`}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddTodo} className="todo-input-form" style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <input
                  className="grat-input"
                  style={{ flex: 1 }}
                  placeholder="Add a goal or intention for today..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ marginTop: 0, padding: '0 20px', whiteSpace: 'nowrap' }}>
                  + Add Task
                </button>
              </form>

              {todayTasks.length > 0 && (
                <div className="todo-list-wrap" style={{ marginTop: 16 }}>
                  {todayTasks.map((t) => (
                    <div key={t.id} className={`todo-item-row ${t.completed ? "completed" : ""}`}>
                      <label className="todo-label-wrap">
                        <input
                          type="checkbox"
                          className="todo-checkbox"
                          checked={Boolean(t.completed)}
                          onChange={() => handleToggleTodo(t.id)}
                        />
                        <span className="todo-text-content">{t.task_text}</span>
                      </label>
                      <button
                        className="delete-btn"
                        title="Delete task"
                        onClick={() => handleDeleteTodo(t.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* REVIEW YOUR DAY TODAY CARD */}
            <div className="dash-card review-day-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Review Your Day Today 🌙</h2>
                  <p className="card-sub">Your reflection summary for {todayStr}</p>
                </div>
              </div>

              <div className="review-stats-grid">
                <div className="review-stat-box">
                  <span className="review-stat-label">Mood Check-ins</span>
                  <span className="review-stat-num">{todayMoods.length} check-ins</span>
                  {todayMoods.length > 0 && (
                    <div className="review-mood-timeline">
                      {todayMoods.map((m, idx) => (
                        <span key={idx} className="review-mood-badge">
                          {moodMap[m.mood_level]} {moodLabel[m.mood_level]}
                          {m.created_at && (
                            <small className="review-time">
                              {' · ' + new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="review-stat-box">
                  <span className="review-stat-label">Journals Written</span>
                  <span className="review-stat-num">{todayJournals.length} entries</span>
                </div>

                <div className="review-stat-box">
                  <span className="review-stat-label">Gratitude Moments</span>
                  <span className="review-stat-num">{todayGratitude.length} moments</span>
                </div>

                <div className="review-stat-box">
                  <span className="review-stat-label">Daily Tasks Completed</span>
                  <span className="review-stat-num">{todayCompletedTasks.length} / {todayTasks.length} tasks</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DAILY TASKS TAB */}
        {activeTab === "todos" && (
          <div className="tab-content" key="todos">
            <div className="dash-card todo-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Your Daily Tasks & Intentions ✅</h2>
                  <p className="card-sub">
                    {todos.length === 0
                      ? "Keep track of small daily actions."
                      : `${todos.filter(t => t.completed).length} of ${todos.length} total tasks completed`}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddTodo} className="todo-input-form" style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <input
                  className="grat-input"
                  style={{ flex: 1 }}
                  placeholder="What would you like to achieve today?"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ marginTop: 0, padding: '0 20px', whiteSpace: 'nowrap' }}>
                  + Add Task
                </button>
              </form>

              {todos.length === 0 ? (
                <EmptyState message="No tasks yet. Add your first intention above!" />
              ) : (
                <div className="todo-list-wrap" style={{ marginTop: 20 }}>
                  {todos.map((t) => (
                    <div key={t.id} className={`todo-item-row ${t.completed ? "completed" : ""}`}>
                      <label className="todo-label-wrap">
                        <input
                          type="checkbox"
                          className="todo-checkbox"
                          checked={Boolean(t.completed)}
                          onChange={() => handleToggleTodo(t.id)}
                        />
                        <span className="todo-text-content">{t.task_text}</span>
                        <span className="todo-date-badge">
                          {parseLocalDate(t.task_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                      </label>
                      <button
                        className="delete-btn"
                        title="Delete task"
                        onClick={() => handleDeleteTodo(t.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "profile" && (
          <div className="tab-content" key="profile">
            <div className="dash-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Your words</h2>
                  <p className="card-sub">
                    {journals.length} journal {journals.length === 1 ? "entry" : "entries"} · Click any entry to copy or save as .txt 💡
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                      className="search-input"
                      placeholder="Search entries..."
                      value={journalSearch}
                      onChange={(e) => setJournalSearch(e.target.value)}
                    />
                  </div>
                  <button className="export-btn" onClick={exportData} title="Export all history to CSV">
                    📥 Export All
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
                          <span className="entry-preview">
                            {j.entry_text?.slice(0, 80)}{j.entry_text?.length > 80 ? "…" : ""}
                          </span>
                          <span className="entry-date">
                            {parseLocalDate(j.entry_date).toLocaleDateString(undefined, {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                            {j.created_at && (
                              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                                · {new Date(j.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="entry-summary-right">
                          <span className="entry-expand-badge" title="Click to view full entry & save options">Read & Save ▾</span>
                          <button
                            className="delete-btn"
                            title="Delete entry"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              askDelete("journal", j.id, j.date);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </summary>
                      <div className="entry-body">
                        <p className="entry-full-text">{j.entry_text}</p>
                        <div className="entry-body-meta">
                          <span className="word-count-badge">
                            {j.entry_text?.trim().split(/\s+/).filter(Boolean).length} words
                          </span>
                          <div className="entry-action-pills">
                            <button
                              type="button"
                              className="entry-pill-btn"
                              title="Copy full text to clipboard"
                              onClick={() => copySingleJournal(j.entry_text)}
                            >
                              📋 Copy Text
                            </button>
                            <button
                              type="button"
                              className="entry-pill-btn entry-pill-save"
                              title="Download this entry as a .txt file"
                              onClick={() => downloadSingleJournal(j)}
                            >
                              📄 Save as .txt
                            </button>
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>

            {/* Mood history with delete */}
            <div className="dash-card">
              <h2 className="card-title">Mood log</h2>
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
                          {parseLocalDate(m.mood_date).toLocaleDateString(undefined, {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <button
                        className="delete-btn"
                        title="Delete mood entry"
                        onClick={() => askDelete("mood", m.id, m.mood_date)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRENDS TAB */}
   {activeTab === "trends" && (
  <div className="tab-content" key="trends">

    <div className="analytics-grid">
      <div className="analytics-card">
        <h3>Total Mood Entries</h3>
        <p>{moods.length}</p>
      </div>

      <div className="analytics-card">
        <h3>Average Mood</h3>
        <p>
          {summary?.avg_mood
            ? `${parseFloat(summary.avg_mood).toFixed(1)} / 5`
            : "—"}
        </p>
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
    </div>

    <div className="dash-card">
      <h2 className="card-title">This week</h2>
      <p className="card-sub">It's about noticing, not fixing.</p>

      {summary ? (
        <div className="summary-pills">
          <div className="summary-pill">
            <span className="summary-pill-val">
              {moodMap[Math.round(summary.avg_mood)]}
            </span>
            <span className="summary-pill-label">
              average mood
            </span>
          </div>

          <div className="summary-pill">
            <span className="summary-pill-val">
              {summary.total_days}
            </span>
            <span className="summary-pill-label">
              days tracked
            </span>
          </div>
        </div>
      ) : (
        <EmptyState message="Your weekly reflection will appear here." />
      )}
    </div>

    <div className="dash-card">
      <h2 className="card-title">Mood Journey & Emotional Trends 📈</h2>
      <p className="card-sub">Interactive visual trend of your mood progression over time</p>
      <MoodTrendGraph moods={moods} />
    </div>

    <div className="dash-card">
      <h2 className="card-title">7-Day Reflection Activity Breakdown 📊</h2>
      <p className="card-sub">Daily comparison of Journals, Gratitude moments, and Tasks completed</p>
      <ActivityBarChart journals={journals} gratitudeHistory={gratitudeHistory} todos={todos} />
    </div>

    <div className="dash-card">
      <p className="card-title">15-Week Mood Consistency Calendar 🗓️</p>
      <p className="card-sub">Visual frequency of your daily check-ins</p>
      <MoodHeatmap moods={moods} />
    </div>
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
                  {gratitudeHistory.map((g, i) => {
  return (
    <div key={g.id ?? i} className="grat-entry">
      <span className="grat-entry-date">
        {new Date(g.entry_date).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>

      <div className="grat-items">
        {g.gratitude_1 && (
          <span className="grat-tag">{g.gratitude_1}</span>
        )}

        {g.gratitude_2 && (
          <span className="grat-tag">{g.gratitude_2}</span>
        )}

        {g.gratitude_3 && (
          <span className="grat-tag">{g.gratitude_3}</span>
        )}
      </div>

      <button
        className="delete-btn"
        title="Delete gratitude entry"
        onClick={() =>
          askDelete("gratitude", g.id, g.entry_date)
        }
      >
        🗑️
      </button>
    </div>
  );
})}
                </div>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
