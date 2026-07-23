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
} from "../services/api";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import MoodTrendGraph from "../components/MoodTrendGraph";
import "../index.css";
import "../App.css";

const moodMap = { 1: "😭", 2: "😔", 3: "😐", 4: "🙂", 5: "😄" };
const moodLabel = { 1: "Very low", 2: "Low", 3: "Neutral", 4: "Good", 5: "Very good" };

/* ── Edit Profile Modal ── */
function ProfileModal({ profile, onSave, onCancel }) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box profile-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="profile-modal-title">Edit Profile</h3>
        <div className="profile-modal-avatar">{name.charAt(0).toUpperCase()}</div>
        <div className="profile-form">
          <label className="profile-label">Display Name</label>
          <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <label className="profile-label">Bio</label>
          <input className="profile-input" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="e.g. NIT Bhopal" />
        </div>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-primary profile-save-btn" onClick={() => onSave({ name: name.trim() || 'User', bio: bio.trim() })}>Save</button>
        </div>
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

function Dashboard({ setToken, toggleTheme }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("today");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('mirrorTalkProfile');
    return saved ? JSON.parse(saved) : { name: 'Shivangi', bio: 'NIT Bhopal' };
  });

  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState(3);
  const [notification, setNotification] = useState("");

  const [moods, setMoods] = useState([]);
  const [summary, setSummary] = useState(null);
  const [gratitudeHistory, setGratitudeHistory] = useState([]);
  const [journals, setJournals] = useState([]);

  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [g3, setG3] = useState("");

  const [journalSearch, setJournalSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleApiResponse = (res) => {
    if (res?.message === 'Token is not valid' || res?.message === 'No token, authorization denied') {
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

  useEffect(() => {
    Promise.all([
      getMoods().then((res) => setMoods(handleApiResponse(res))),
      getWeeklyMoodSummary().then(setSummary),
      getGratitudeHistory().then((res) => setGratitudeHistory(handleApiResponse(res))),
      getJournals().then((res) => setJournals(handleApiResponse(res)))
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
        entry_date: new Date().toISOString().split("T")[0],
      });
      setEntry("");
      setJournals(handleApiResponse(await getJournals()));
      showNotification("📝 Journal saved");
    } catch {
      showNotification("❌ Failed to save journal");
    }
  };

  const saveGratitudeEntry = async () => {
    if (!g1 && !g2 && !g3) return;
    try {
      await saveGratitude({
        gratitude_1: g1 || null,
        gratitude_2: g2 || null,
        gratitude_3: g3 || null,
        entry_date: new Date().toISOString().split("T")[0],
      });
      setG1(""); setG2(""); setG3("");
      setGratitudeHistory(handleApiResponse(await getGratitudeHistory()));
      showNotification("🙏 Gratitude saved");
    } catch {
      showNotification("❌ Failed to save gratitude");
    }
  };

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
        showNotification("🗑️ Gratitude entry deleted");
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
    a.download = `mirrortalk-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📥 Data exported');
  };

  const journalPrompts = [
    "What made you smile today?",
    "What's one thing you're grateful for right now?",
    "How did your body feel today?",
    "What's something you learned recently?",
    "Describe a moment of peace from today.",
    "What would you tell your past self?",
    "What are you looking forward to?",
  ];
  const todayPrompt = journalPrompts[new Date().getDate() % journalPrompts.length];

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

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onSave={(updated) => {
            setProfile(updated);
            localStorage.setItem('mirrorTalkProfile', JSON.stringify(updated));
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
            <div className="sidebar-avatar">{profile.name.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{profile.name}</span>
              <span className="sidebar-user-role">{profile.bio}</span>
            </div>
            <span className="user-menu-arrow">{showUserMenu ? '▴' : '▾'}</span>
          </div>
          {showUserMenu && (
            <div className="user-menu">
              <button className="user-menu-item" onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}>
                <span>✏️</span> Edit Profile
              </button>
              <button className="user-menu-item" onClick={() => { toggleTheme(); setShowUserMenu(false); }}>
                <span>🌙</span> Toggle Theme
              </button>
              <div className="user-menu-divider" />
              <button className="user-menu-item user-menu-logout" onClick={logout}>
                <span>🚪</span> Logout
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
          <button className="export-btn" onClick={exportData} title="Export your data">📥 Export</button>
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
          <div className="tab-content">
            <div className="dash-card journal-card">
              <p className="journal-date-label">{todayStr}</p>
              <h2 className="journal-heading">How are you feeling right now?</h2>
              {!entry && <p className="journal-prompt">💭 {todayPrompt}</p>}
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
                        await addMood({ mood_level: m, mood_date: new Date().toISOString().split("T")[0] });
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
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "profile" && (
          <div className="tab-content">
            <div className="dash-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Your words</h2>
                  <p className="card-sub">{journals.length} journal {journals.length === 1 ? "entry" : "entries"}</p>
                </div>
                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    className="search-input"
                    placeholder="Search entries..."
                    value={journalSearch}
                    onChange={(e) => setJournalSearch(e.target.value)}
                  />
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
                            {j.entry_text?.slice(0, 65)}{j.entry_text?.length > 65 ? "…" : ""}
                          </span>
                          <span className="entry-date">
                            {new Date(j.entry_date).toLocaleDateString(undefined, {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                        <button
                          className="delete-btn"
                          title="Delete entry"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            askDelete("journal", j.id, j.entry_date);
                          }}
                        >
                          🗑️
                        </button>
                      </summary>
                      <div className="entry-body">
                        <p className="entry-full-text">{j.entry_text}</p>
                        <div className="entry-body-meta">
                          <span>{j.entry_text?.trim().split(/\s+/).filter(Boolean).length} words</span>
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
                          {new Date(m.mood_date).toLocaleDateString(undefined, {
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
  <div className="tab-content">

    <div className="analytics-grid">
      <div className="analytics-card">
        <h3>Total Mood Entries</h3>
        <p>{moods.length}</p>
      </div>

      <div className="analytics-card">
        <h3>Average Mood</h3>
        <p>
          {summary?.avg_mood
            ? summary.avg_mood.toFixed(1)
            : "-"}
        </p>
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
      <h2 className="card-title">Patterns over time</h2>
      <p className="card-sub">Your mood journey</p>
      <MoodTrendGraph moods={moods} />
    </div>

  </div>
)}

        {/* GRATITUDE TAB */}
        {activeTab === "gratitude" && (
          <div className="tab-content">
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
