import React, { useState } from "react";

const YouTubeRSS = () => {
  const [channelId, setChannelId] = useState("");
  const [rssUrl, setRssUrl] = useState(null);
  const [error, setError] = useState(null);

  // 產生 RSS
  const generateRSS = () => {
    setError(null);
    setRssUrl(null);

    if (!channelId.trim()) {
      setError("請輸入正確的 YouTube Channel ID。");
      return;
    }
    setRssUrl(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId.trim()}`);
  };

  return (
    <div
      style={{
        backgroundColor: "#f3f4f6",
        padding: "24px",
        maxWidth: "480px",
        margin: "40px auto",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#222", marginBottom: "16px", textAlign: "center" }}>
        YouTube RSS 產生器
      </h2>
      <p style={{ marginBottom: "16px", textAlign: "center", color: "#444" }}>
        請輸入您的 YouTube 頻道 ID（如：<strong>UCxxxxxxxxxx</strong>）
      </p>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="channelId"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          頻道 ID:
        </label>
        <input
          id="channelId"
          type="text"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          placeholder="如：UCxxxxxxxxxx"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={generateRSS}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#3b82f6",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        取得 RSS
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "16px", textAlign: "center" }}>
          {error}
        </p>
      )}

      {rssUrl && (
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <p style={{ marginBottom: "8px" }}>以下是您的 RSS 連結：</p>
          <a
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb", textDecoration: "underline" }}
          >
            {rssUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default YouTubeRSS;
