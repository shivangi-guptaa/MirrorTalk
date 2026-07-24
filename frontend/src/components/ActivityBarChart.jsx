import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

function ActivityBarChart({ journals, gratitudeHistory, todos }) {
  // Aggregate last 7 days activity
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const displayLabel = d.toLocaleDateString(undefined, { weekday: "short" });

      const dayJournals = journals.filter((j) => j.entry_date && j.entry_date.split("T")[0] === dateStr).length;
      const dayGratitude = gratitudeHistory.filter((g) => g.entry_date && g.entry_date.split("T")[0] === dateStr).length;
      const dayTasks = todos.filter((t) => t.task_date && t.task_date.split("T")[0] === dateStr && t.completed).length;

      data.push({
        day: displayLabel,
        Journals: dayJournals,
        Gratitude: dayGratitude,
        Tasks: dayTasks,
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  return (
    <div style={{ width: "100%", height: 250, marginTop: 14 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE8E1" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#78867D" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#78867D" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #EBE8E1",
              borderRadius: "10px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Bar dataKey="Journals" fill="#4A7C59" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="Gratitude" fill="#d97706" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="Tasks" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ActivityBarChart;
