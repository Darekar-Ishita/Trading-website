import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function News() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const neonColors = [
    "#FF00FF",
    "#00FFFF",
    "#FF4500",
    "#00FF00",
    "#FFFF00",
    "#FF1493",
    "#1E90FF",
  ];

  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "#fff" : "#000";
  const dashboardBg = isDarkMode
    ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    : "linear-gradient(135deg, #e0eafc, #cfdef3, #f5f7fa)";

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/news`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNews(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch news error:", err);
      setError(err.response?.data?.error || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  // Fetch news on mount + every 5 minutes
  useEffect(() => {
    if (!user) return;

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // 5 min
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard" style={{ background: dashboardBg }}>
        <Navbar />
        <div className="main" style={{ color: textColor }}>
          Loading news...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ background: dashboardBg }}>
      <Navbar />
      <div className="main news-page">
        <div className="news-header">
          <h2 style={{ color: textColor }}>Latest Stock/Trading News</h2>
          <button
            onClick={fetchNews}
            style={{
              padding: "6px 12px",
              marginLeft: "10px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: isDarkMode ? "#00ffff30" : "#ff00ff30",
              color: textColor,
            }}
          >
            Refresh
          </button>
        </div>

        {error && <p style={{ color: textColor }}>{error}</p>}
        {!error && news.length === 0 && (
          <p style={{ color: textColor }}>No news available.</p>
        )}

        <div className="news-container">
          {news.map((item, index) => {
            const borderColor = neonColors[index % neonColors.length];
            return (
              <div
                key={index}
                className="news-card"
                style={{
                  border: `2px solid ${borderColor}40`,
                  boxShadow: `0 0 20px ${borderColor}30`,
                  color: textColor,
                  background: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  borderRadius: "20px",
                }}
              >
                {item.image && (
                  <img src={item.image} alt={item.title} className="news-image" />
                )}
                <div className="news-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    Read more
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          .news-page { padding: 10px; }
          .news-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
          }
          .news-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 40px;
          }
          .news-card {
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s, box-shadow 0.3s;
          }
          .news-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 35px rgba(0,0,0,0.15);
          }
          .news-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
          }
          .news-content {
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .news-content h3 {
            font-size: 1rem;
            font-weight: bold;
            margin: 0;
          }
          .news-content p, .news-content a {
            font-size: 0.85rem;
            color: inherit;
            text-decoration: none;
          }
          .news-content a:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    </div>
  );
}
