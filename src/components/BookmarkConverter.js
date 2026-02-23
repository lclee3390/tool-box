import React, { useState } from 'react';
import { theme, ui } from '../styles/theme';

const BookmarkConverter = () => {
  const [urls, setUrls] = useState('');
  const [bookmarkOutput, setBookmarkOutput] = useState('');

  const convertToBookmark = () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    const validUrls = urlList.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    const bookmarkContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${validUrls.map(url => `    <DT><A HREF="${url}">${url}</A>`).join('\n')}
</DL><p>`;

    setBookmarkOutput(bookmarkContent);
  };

  const handleClear = () => {
    setUrls('');
    setBookmarkOutput('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkOutput);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.section}>
          <label style={styles.label}>
            輸入網址（每行一個）
          </label>
          <textarea
            style={styles.textarea}
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://example.com&#10;https://another-example.com"
          />
          <div style={styles.buttonGroup}>
            <button
              onClick={convertToBookmark}
              style={styles.button}
            >
              轉換成書籤格式
            </button>
            <button
              onClick={handleClear}
              style={{...styles.button, ...styles.clearButton}}
            >
              清除
            </button>
          </div>
        </div>
        
        <div style={styles.section}>
          <label style={styles.label}>
            書籤輸出結果
          </label>
          <textarea
            style={{...styles.textarea, ...styles.outputTextarea}}
            value={bookmarkOutput}
            readOnly
          />
          <button
            onClick={handleCopy}
            style={{...styles.button, ...styles.copyButton}}
            disabled={!bookmarkOutput}
          >
            複製全部
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    ...ui.toolContainer,
    maxWidth: "800px",
  },
  title: {
    ...ui.toolTitle,
    marginBottom: "20px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#4a5568",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    height: "150px",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "vertical",
    backgroundColor: "white",
    marginBottom: "10px",
    whiteSpace: "pre",
    overflowX: "auto",
    overflowWrap: "normal",
  },
  outputTextarea: {
    backgroundColor: "#f8fafc",
    color: "#4a5568",
    whiteSpace: "pre",
    overflowX: "auto",
    overflowWrap: "normal",
  },
  button: {
    ...ui.buttonBase,
    ...ui.buttonPrimary,
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    alignSelf: "flex-start",
    ':hover': {
      backgroundColor: "#45a049",
    },
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  clearButton: {
    backgroundColor: theme.colors.danger,
    ':hover': {
      backgroundColor: "#c53030",
    },
  },
  copyButton: {
    backgroundColor: theme.colors.info,
    ':hover': {
      backgroundColor: "#3182ce",
    },
    ':disabled': {
      backgroundColor: "#cbd5e0",
      cursor: "not-allowed",
    },
  },
};

export default BookmarkConverter; 
