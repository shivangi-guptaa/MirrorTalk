import { useMemo } from "react";

const MOOD_COLORS = {
  0: "#eef0f2",   // no entry
  1: "#fee2e2",   // very low — red-ish
  2: "#fde68a",   // low — yellow
  3: "#d1fae5",   // neutral — light green
  4: "#86efac",   // good — green
  5: "#22c55e",   // very good — vibrant green
};

const MOOD_COLORS_DARK = {
  0: "#1f2937",
  1: "#7f1d1d",
  2: "#78350f",
  3: "#14532d",
  4: "#166534",
  5: "#15803d",
};

const MOOD_LABELS = { 1: "Very Low", 2: "Low", 3: "Neutral", 4: "Good", 5: "Very Good" };
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MoodHeatmap({ moods, isDark }) {
  const { weeks, months } = useMemo(() => {
    // Build a map of date -> mood_level
    const moodMap = {};
    (moods || []).forEach(m => {
      const dateStr = m.mood_date?.split('T')[0];
      if (dateStr) moodMap[dateStr] = m.mood_level;
    });

    // Go back 15 weeks (105 days) from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find start: go back to Sunday before 15 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - 15 * 7);
    // Roll back to Sunday
    start.setDate(start.getDate() - start.getDay());

    const weeks = [];
    const monthLabels = []; // { month, colIndex }
    let current = new Date(start);
    let weekIndex = 0;
    let lastMonth = -1;

    while (current <= today) {
      const week = [];
      const weekStart = new Date(current);

      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        const isFuture = current > today;
        week.push({
          date: dateStr,
          level: isFuture ? null : (moodMap[dateStr] ?? 0),
          isFuture,
          dayOfWeek: current.getDay(),
        });
        current.setDate(current.getDate() + 1);
      }

      // Track month label at first week of that month
      const monthOfWeek = weekStart.getMonth();
      if (monthOfWeek !== lastMonth) {
        monthLabels.push({
          label: weekStart.toLocaleDateString('en', { month: 'short' }),
          col: weekIndex,
        });
        lastMonth = monthOfWeek;
      }

      weeks.push(week);
      weekIndex++;
    }

    return { weeks, months: monthLabels };
  }, [moods]);

  const colors = isDark ? MOOD_COLORS_DARK : MOOD_COLORS;

  if (!moods || moods.length === 0) {
    return (
      <div className="heatmap-empty">
        <p className="muted">Track your mood daily to see your heatmap 🌱</p>
      </div>
    );
  }

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-scroll">
        {/* Month labels */}
        <div className="heatmap-months">
          <div className="heatmap-day-labels-spacer" />
          {weeks.map((_, wi) => {
            const label = months.find(m => m.col === wi);
            return (
              <div key={wi} className="heatmap-month-cell">
                {label ? <span>{label.label}</span> : null}
              </div>
            );
          })}
        </div>

        {/* Grid: day rows x week columns */}
        <div className="heatmap-grid-wrap">
          {/* Day-of-week labels */}
          <div className="heatmap-day-labels">
            {DAY_LABELS.map((d, i) => (
              <div key={d} className="heatmap-day-label">
                {i % 2 === 1 ? d : ""}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div className="heatmap-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-col">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className="heatmap-cell"
                    style={{
                      background: day.isFuture ? 'transparent' : colors[day.level ?? 0],
                      border: day.isFuture ? '1px dashed rgba(0,0,0,0.08)' : 'none',
                    }}
                    title={day.isFuture ? '' : `${day.date}: ${day.level ? MOOD_LABELS[day.level] : 'No entry'}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="heatmap-legend-label">Less</span>
        {[0, 1, 2, 3, 4, 5].map(l => (
          <div key={l} className="heatmap-legend-cell" style={{ background: colors[l] }} title={MOOD_LABELS[l] || 'No entry'} />
        ))}
        <span className="heatmap-legend-label">More</span>
      </div>
    </div>
  );
}

export default MoodHeatmap;
