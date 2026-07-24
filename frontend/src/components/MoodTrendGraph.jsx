import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const moodMap = {
  1: "😭 Very Low",
  2: "😔 Low",
  3: "😐 Neutral",
  4: "🙂 Good",
  5: "😄 Very Good",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #EBE8E1",
          borderRadius: "10px",
          padding: "8px 12px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          fontSize: "12px",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "#2D3732" }}>{label}</p>
        <p style={{ margin: "4px 0 0", color: "#4A7C59", fontWeight: 500 }}>
          Mood: {moodMap[val] || val} ({val} / 5)
        </p>
      </div>
    );
  }
  return null;
};

function MoodTrendGraph({ moods }) {
  if (!moods || moods.length < 2) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#78867D", fontSize: "13px" }}>
        🌱 Track your mood for at least 2 days to visualize your emotional trend graph.
      </div>
    );
  }

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length < 3) return new Date(dateStr);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  // Sort chronologically (oldest to newest left-to-right)
  const chartData = [...moods].reverse().map((m) => ({
    date: parseLocalDate(m.mood_date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    mood: m.mood_level,
  }));

  return (
    <div style={{ width: "100%", height: 260, marginTop: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4A7C59" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE8E1" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#78867D" }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(v) => moodMap[v]?.split(" ")[0] || v}
            tick={{ fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#4A7C59"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMood)"
            dot={{ r: 4, fill: "#4A7C59", strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 6, fill: "#4A7C59", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MoodTrendGraph;
