import { useEffect, useState } from "react";
import {
  createJournal,
  addMood,
  getMoods,
  getWeeklyMoodSummary,
  getGratitudeHistory,
  saveGratitude,
  getJournals
} from "../services/api";

import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import MoodTrendGraph from "../components/MoodTrendGraph";

function Dashboard({ setToken, toggleTheme }) {
  const [activeTab, setActiveTab] = useState("today");

  /* ---------------- TODAY ---------------- */
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState(3);

  /* ---------------- PROFILE DATA ---------------- */
  const [moods, setMoods] = useState([]);
  const [summary, setSummary] = useState(null);
  const [gratitudeHistory, setGratitudeHistory] = useState([]);
  const [journals, setJournals] = useState([]);

  /* ---------------- GRATITUDE INPUT ---------------- */
  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [g3, setG3] = useState("");

  const moodMap = {
    1: "Very low 😞",
    2: "Low 😕",
    3: "Neutral 😐",
    4: "Good 🙂",
    5: "Very good 😁"
  };

  /* ---------------- NORMALIZER (FIX) ---------------- */
  const normalizeArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res?.success && Array.isArray(res.data)) return res.data;
    return [];
  };

  /* ---------------- LOADERS ---------------- */
  useEffect(() => {
    getMoods().then((res) => setMoods(normalizeArray(res)));
    getWeeklyMoodSummary().then(setSummary);
    getGratitudeHistory().then((res) =>
      setGratitudeHistory(normalizeArray(res))
    );
    getJournals().then((res) => setJournals(normalizeArray(res)));
  }, []);

  /* ---------------- ACTIONS ---------------- */

  const saveJournal = async (e) => {
    e.preventDefault();
    if (!entry.trim()) return;

    await createJournal({
      entry_text: entry,
      entry_date: new Date().toISOString().split("T")[0]
    });

    setEntry("");

    const res = await getJournals();
    setJournals(normalizeArray(res));
  };

  const saveMood = async () => {
    await addMood({
      mood_level: mood,
      mood_date: new Date().toISOString().split("T")[0]
    });

    setMoods(normalizeArray(await getMoods()));
    setSummary(await getWeeklyMoodSummary());
  };

  const saveGratitudeEntry = async () => {
    if (!g1 && !g2 && !g3) return;

    await saveGratitude({
      gratitude_1: g1 || null,
      gratitude_2: g2 || null,
      gratitude_3: g3 || null,
      entry_date: new Date().toISOString().split("T")[0]
    });

    setG1("");
    setG2("");
    setG3("");

    setGratitudeHistory(normalizeArray(await getGratitudeHistory()));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="container page-transition">
      {/* HEADER */}
      <header className="header">
        <h1>MirrorTalk</h1>
        <div>
          <button className="secondary" onClick={toggleTheme}>🌙</button>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* TABS */}
      <div className="tabs">
        <button
          className={activeTab === "today" ? "tab active" : "tab"}
          onClick={() => setActiveTab("today")}
        >
          Today
        </button>
        <button
          className={activeTab === "profile" ? "tab active" : "tab"}
          onClick={() => setActiveTab("profile")}
        >
          My Profile
        </button>
      </div>

      {/* TODAY */}
      {activeTab === "today" && (
        <>
          <Card title="📝 Journal" subtitle="Write honestly. This is just for you.">
            <form onSubmit={saveJournal}>
              <textarea
                placeholder="What stayed with you today?"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
              />
              <button className="primary">Save</button>
            </form>
          </Card>

          <Card title="😊 Mood" subtitle="There’s no right or wrong answer.">
            <select value={mood} onChange={(e) => setMood(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((m) => (
                <option key={m} value={m}>
                  {moodMap[m]}
                </option>
              ))}
            </select>
            <button className="secondary" onClick={saveMood}>Save mood</button>
          </Card>

          <Card title="🙏 Gratitude" subtitle="Even one small thing is enough.">
            <input placeholder="Something kind" value={g1} onChange={(e) => setG1(e.target.value)} />
            <input placeholder="Something simple" value={g2} onChange={(e) => setG2(e.target.value)} />
            <input placeholder="Something steady" value={g3} onChange={(e) => setG3(e.target.value)} />
            <button className="secondary" onClick={saveGratitudeEntry}>Save gratitude</button>
          </Card>
        </>
      )}

      {/* PROFILE */}
      {activeTab === "profile" && (
        <>
          <Card title="📊 This week" subtitle="It’s about noticing, not fixing.">
            {summary ? (
              <ul>
                <li>Average mood: {moodMap[Math.round(summary.avg_mood)]}</li>
                <li>Days tracked: {summary.total_days}</li>
              </ul>
            ) : (
              <EmptyState message="Your weekly reflection will appear here." />
            )}
          </Card>

          <Card title="📈 Patterns over time">
            <MoodTrendGraph moods={moods} />
          </Card>

          <Card title="🙏 Moments you noticed">
            {gratitudeHistory.length === 0 ? (
              <EmptyState message="Your gratitude entries will appear here." />
            ) : (
              gratitudeHistory.map((g, i) => (
                <div key={i} className="gratitude">
                  <b>{new Date(g.entry_date).toLocaleDateString()}</b>
                  <ul>
                    {g.gratitude_1 && <li>{g.gratitude_1}</li>}
                    {g.gratitude_2 && <li>{g.gratitude_2}</li>}
                    {g.gratitude_3 && <li>{g.gratitude_3}</li>}
                  </ul>
                </div>
              ))
            )}
          </Card>

          <Card title="🗂 Your words">
            {journals.length === 0 ? (
              <EmptyState message="Your journal entries will appear here." />
            ) : (
              journals.map((j, i) => (
                <details key={i} className="journal-item">
                  <summary>{new Date(j.entry_date).toLocaleDateString()}</summary>
                  <p className="journal-text">{j.entry_text}</p>
                </details>
              ))
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default Dashboard;
