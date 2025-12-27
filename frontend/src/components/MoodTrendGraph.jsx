import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

const moodMap = {
  1: "Very Low",
  2: "Low",
  3: "Neutral",
  4: "Good",
  5: "Very Good"
};

function MoodTrendGraph({ moods }) {
  if (!moods || moods.length < 2) {
    return (
      <p className="muted">
        Track your mood for a few days to see trends 🌱
      </p>
    );
  }

  const data = {
    labels: moods.map(m =>
      new Date(m.mood_date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Mood Trend",
        data: moods.map(m => m.mood_level),
        borderColor: "#6c63ff",
        backgroundColor: "rgba(108, 99, 255, 0.1)",
        tension: 0.4,
        pointRadius: 5
      }
    ]
  };

  const options = {
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: value => moodMap[value]
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return <Line data={data} options={options} />;
}

export default MoodTrendGraph;
