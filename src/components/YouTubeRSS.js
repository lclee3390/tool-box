import React, { useState } from "react";
import { theme, ui } from "../styles/theme";

const YT_FEED_BASE = "https://www.youtube.com/feeds/videos.xml?channel_id=";
const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);

function normalizeYouTubeInput(input) {
  const raw = input.trim();
  if (!raw) {
    return { error: "請輸入 YouTube Channel ID 或頻道網址。" };
  }

  // 直接貼 Channel ID（一般以 UC 開頭）
  if (/^UC[\w-]{10,}$/.test(raw)) {
    return { channelId: raw };
  }

  // 若貼的是既有 RSS 連結，直接取 channel_id
  if (raw.includes("feeds/videos.xml")) {
    try {
      const url = new URL(raw);
      const channelId = url.searchParams.get("channel_id");
      if (channelId && /^UC[\w-]{10,}$/.test(channelId)) {
        return { channelId };
      }
      return { error: "RSS 連結中找不到有效的 channel_id。" };
    } catch (error) {
      return { error: "RSS 連結格式不正確。" };
    }
  }

  // 支援貼 /channel/UC... 網址
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    const hostname = url.hostname.toLowerCase();

    if (!YT_HOSTS.has(hostname)) {
      return { error: "請輸入 YouTube 的頻道網址或 Channel ID。" };
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    if (pathSegments[0] === "channel" && pathSegments[1]) {
      const channelId = pathSegments[1];
      if (/^UC[\w-]{10,}$/.test(channelId)) {
        return { channelId };
      }
      return { error: "這個 /channel/ 網址中的 Channel ID 格式不正確。" };
    }

    if (url.pathname.startsWith("/@")) {
      return {
        error:
          "目前無法直接由 @handle 取得 RSS，請改貼 Channel ID（UC...）或 /channel/UC... 網址。",
      };
    }

    if (pathSegments[0] === "watch") {
      return { error: "請貼頻道網址或 Channel ID，不是單支影片網址。" };
    }

    return { error: "無法從這個網址解析 Channel ID，請改貼 /channel/UC... 網址。" };
  } catch (error) {
    return { error: "輸入格式不正確，請貼 Channel ID 或完整 YouTube 頻道網址。" };
  }
}

const YouTubeRSS = () => {
  const [inputValue, setInputValue] = useState("");
  const [channelId, setChannelId] = useState("");
  const [rssUrl, setRssUrl] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateRSS = () => {
    setError(null);
    setRssUrl(null);
    setCopied(false);

    const parsed = normalizeYouTubeInput(inputValue);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    setChannelId(parsed.channelId);
    setRssUrl(`${YT_FEED_BASE}${parsed.channelId}`);
  };

  const copyRssUrl = async () => {
    if (!rssUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(rssUrl);
      setCopied(true);
    } catch (err) {
      console.error("複製失敗:", err);
      window.alert("複製失敗，請手動複製。");
    }
  };

  return (
    <div style={styles.container}>
      <p style={styles.desc}>
        支援輸入 <strong>Channel ID（UC...）</strong>、<strong>/channel/UC...</strong> 網址、
        或已存在的 RSS 連結。
      </p>

      <div style={styles.inputBlock}>
        <label htmlFor="youtube-rss-input" style={styles.label}>
          頻道資訊
        </label>
        <input
          id="youtube-rss-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              generateRSS();
            }
          }}
          placeholder="貼上 Channel ID 或 https://www.youtube.com/channel/UC..."
          style={styles.input}
        />
        <div style={styles.helper}>
          目前不支援直接由 <code>@handle</code> 轉換，請改貼 Channel ID 或 /channel/ 網址。
        </div>
      </div>

      <button onClick={generateRSS} style={styles.primaryButton}>
        取得 RSS
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {rssUrl && (
        <div style={styles.resultCard}>
          <div style={styles.resultTitle}>RSS 連結</div>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Channel ID</span>
            <code style={styles.code}>{channelId}</code>
          </div>
          <a href={rssUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
            {rssUrl}
          </a>
          <div style={styles.buttonRow}>
            <button onClick={copyRssUrl} style={styles.secondaryButton}>
              {copied ? "已複製" : "複製連結"}
            </button>
            <button
              onClick={() => window.open(rssUrl, "_blank", "noopener,noreferrer")}
              style={styles.ghostButton}
            >
              開啟連結
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    ...ui.toolContainer,
    padding: "24px",
    maxWidth: "640px",
    margin: "24px auto",
  },
  title: {
    ...ui.toolTitle,
    marginBottom: "12px",
  },
  desc: {
    marginBottom: "16px",
    textAlign: "center",
    color: "#444",
    lineHeight: 1.5,
  },
  inputBlock: {
    marginBottom: "12px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  helper: {
    marginTop: "8px",
    color: "#666",
    fontSize: "0.9em",
    lineHeight: 1.4,
  },
  primaryButton: {
    ...ui.buttonBase,
    ...ui.buttonPrimary,
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    fontWeight: "bold",
  },
  error: {
    color: "#dc2626",
    marginTop: "12px",
    textAlign: "center",
    lineHeight: 1.4,
  },
  resultCard: {
    marginTop: "16px",
    backgroundColor: "#fff",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: "12px",
  },
  resultTitle: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },
  metaRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  metaLabel: {
    color: "#6b7280",
    fontSize: "0.9em",
  },
  code: {
    backgroundColor: "#f3f4f6",
    borderRadius: "4px",
    padding: "2px 6px",
    wordBreak: "break-all",
  },
  link: {
    color: "#2563eb",
    textDecoration: "underline",
    wordBreak: "break-all",
    display: "block",
    lineHeight: 1.5,
  },
  buttonRow: {
    marginTop: "12px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  secondaryButton: {
    ...ui.buttonBase,
    ...ui.buttonSuccess,
    borderRadius: "6px",
    padding: "10px 12px",
    fontWeight: "bold",
  },
  ghostButton: {
    backgroundColor: "#fff",
    color: theme.colors.text,
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: "6px",
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default YouTubeRSS;
