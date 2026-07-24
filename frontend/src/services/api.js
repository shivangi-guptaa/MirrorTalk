const rawApiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
let cleanUrl = rawApiUrl.trim().replace(/\/+$/, "");
if (!cleanUrl.endsWith("/api")) {
  cleanUrl = `${cleanUrl}/api`;
}
const API_URL = cleanUrl;

/* ================= AUTH ================= */

export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const googleAuth = async (firebaseToken) => {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: firebaseToken }),
  });
  return res.json();
};

export const deleteAccount = async () => {
  const res = await fetch(`${API_URL}/auth/account`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return res.json();
};

/* ================= AUTH HEADER ================= */

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* ================= JOURNAL ================= */

export const getJournals = async () => {
  const res = await fetch(`${API_URL}/journals`, {
    headers: getAuthHeader(),
  });
  return res.json();
};

export const createJournal = async (data) => {
  const res = await fetch(`${API_URL}/journals`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteJournal = async (id) => {
  const res = await fetch(`${API_URL}/journals/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return res.json();
};

/* ================= MOOD ================= */

export const addMood = async (data) => {
  const res = await fetch(`${API_URL}/moods`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMoods = async () => {
  const res = await fetch(`${API_URL}/moods`, {
    headers: getAuthHeader(),
  });
  return res.json();
};

export const getWeeklyMoodSummary = async () => {
  const res = await fetch(`${API_URL}/moods/weekly-summary`, {
    headers: getAuthHeader(),
  });
  return res.json();
};

export const deleteMood = async (id) => {
  const res = await fetch(`${API_URL}/moods/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return res.json();
};

/* ================= GRATITUDE ================= */

export const saveGratitude = async (data) => {
  const res = await fetch(`${API_URL}/gratitude`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getGratitudeHistory = async () => {
  const res = await fetch(`${API_URL}/gratitude`, {
    headers: getAuthHeader(),
  });
  return res.json();
};

export const deleteGratitude = async (id) => {
  const res = await fetch(`${API_URL}/gratitude/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return res.json();
};

/* ================= TODOS ================= */

export const getTodos = async () => {
  const res = await fetch(`${API_URL}/todos`, {
    headers: getAuthHeader(),
  });
  return res.json();
};

export const createTodo = async (data) => {
  const res = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const toggleTodo = async (id) => {
  const res = await fetch(`${API_URL}/todos/${id}/toggle`, {
    method: "PUT",
    headers: getAuthHeader(),
  });
  return res.json();
};

export const deleteTodo = async (id) => {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return res.json();
};

/* ================= PASSWORD RESET ================= */

export const forgotPassword = async (data) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const verifyResetCode = async (data) => {
  const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const resetPassword = async (data) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
