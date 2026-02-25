import React, { useEffect, useState } from 'react';
import { theme, ui } from '../styles/theme';

const STORAGE_KEY = 'MARKDOWN_HEADING_LEVEL_TOOL_DRAFT_V1';

function detectNewline(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function getFenceInfo(line) {
  const match = line.match(/^ {0,3}((`{3,})|(~{3,}))/);
  if (!match) return null;

  const fence = match[1];
  return {
    char: fence[0],
    length: fence.length,
  };
}

function clampHeadingLevel(level) {
  return Math.min(6, Math.max(1, level));
}

function adjustMarkdownHeadingLevels(text, delta) {
  const newline = detectNewline(text);
  const lines = text.split(/\r?\n/);

  let inFence = null;
  let changedCount = 0;
  let unchangedAtBoundaryCount = 0;

  const outputLines = lines.map((line) => {
    const fenceInfo = getFenceInfo(line);
    if (fenceInfo) {
      if (!inFence) {
        inFence = fenceInfo;
      } else if (inFence.char === fenceInfo.char && fenceInfo.length >= inFence.length) {
        inFence = null;
      }
      return line;
    }

    if (inFence) {
      return line;
    }

    const headingMatch = line.match(/^( {0,3})(#{1,6})([ \t]+)(.*)$/);
    if (!headingMatch) {
      return line;
    }

    const [, indent, hashes, space, content] = headingMatch;
    const currentLevel = hashes.length;
    const nextLevel = clampHeadingLevel(currentLevel + delta);

    if (nextLevel === currentLevel) {
      unchangedAtBoundaryCount += 1;
      return line;
    }

    changedCount += 1;
    return `${indent}${'#'.repeat(nextLevel)}${space}${content}`;
  });

  return {
    outputText: outputLines.join(newline),
    changedCount,
    unchangedAtBoundaryCount,
  };
}

function MarkdownHeadingLevelTool() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem(STORAGE_KEY);
      if (draft != null) {
        setInputText(draft);
      }
    } catch (e) {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, inputText);
    } catch (e) {
      // Ignore storage failures.
    }
  }, [inputText]);

  useEffect(() => {
    if (!copied) return undefined;

    const timer = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const runAdjust = (delta) => {
    setCopied(false);
    setError('');
    setMessage('');

    if (!inputText.trim()) {
      setOutputText('');
      setError('請先貼上 Markdown 內容');
      return;
    }

    const result = adjustMarkdownHeadingLevels(inputText, delta);
    setOutputText(result.outputText);

    const actionText = delta < 0 ? '升一級' : '降一級';
    const boundaryText =
      result.unchangedAtBoundaryCount > 0
        ? `，另有 ${result.unchangedAtBoundaryCount} 個標題已在邊界（H1/H6）未變更`
        : '';

    setMessage(`已${actionText} ${result.changedCount} 個標題${boundaryText}`);
  };

  const handleApplyOutputToInput = () => {
    setError('');
    setMessage('');

    if (!outputText) {
      setError('目前沒有可套用的結果');
      return;
    }

    setInputText(outputText);
    setMessage('已將結果覆蓋到輸入區');
  };

  const handleCopyOutput = async () => {
    if (!outputText) {
      setError('目前沒有可複製的結果');
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setError('');
    } catch (e) {
      setError('複製失敗，請手動複製');
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setMessage('');
    setError('');
    setCopied(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Markdown 標題層級調整</h2>
      <p style={styles.subtitle}>
        將整份 Markdown 的 `#` 標題整體升一級或降一級（會略過 fenced code block）
      </p>

      <div style={styles.buttonRow}>
        <button
          type="button"
          onClick={() => runAdjust(-1)}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          標題升一級
        </button>
        <button
          type="button"
          onClick={() => runAdjust(1)}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          標題降一級
        </button>
        <button
          type="button"
          onClick={handleApplyOutputToInput}
          style={{ ...styles.button, ...styles.successButton }}
        >
          套用結果到輸入
        </button>
        <button
          type="button"
          onClick={handleCopyOutput}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          {copied ? '已複製' : '複製結果'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          style={{ ...styles.button, ...styles.dangerButton }}
        >
          清空
        </button>
      </div>

      {message && <div style={styles.messageBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.editorGrid}>
        <div style={styles.panel}>
          <label htmlFor="markdown-heading-input" style={styles.label}>
            輸入 Markdown
          </label>
          <textarea
            id="markdown-heading-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              '# 標題一\n## 標題二\n一般文字\n\n```js\n# code block 內不會被改\n```\n'
            }
            style={styles.textarea}
          />
        </div>

        <div style={styles.panel}>
          <label htmlFor="markdown-heading-output" style={styles.label}>
            輸出結果
          </label>
          <textarea
            id="markdown-heading-output"
            value={outputText}
            readOnly
            placeholder="按下上方按鈕後，結果會顯示在這裡"
            style={{ ...styles.textarea, ...styles.outputTextarea }}
          />
        </div>
      </div>

      <div style={styles.noteBox}>
        <strong>說明：</strong>目前處理 `#` ~ `######` 標題（ATX heading），不會調整 Setext
        標題（`===` / `---`）。
      </div>
    </div>
  );
}

const styles = {
  container: {
    ...ui.toolContainer,
    maxWidth: '980px',
    margin: '0 auto',
    padding: '24px',
  },
  title: {
    ...ui.toolTitle,
    marginBottom: '6px',
  },
  subtitle: {
    margin: '0 0 16px 0',
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: '0.95rem',
    lineHeight: 1.45,
  },
  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '12px',
  },
  button: {
    ...ui.buttonBase,
    padding: '10px 14px',
    fontSize: '0.92rem',
  },
  primaryButton: {
    ...ui.buttonPrimary,
  },
  secondaryButton: {
    ...ui.buttonSecondary,
  },
  successButton: {
    ...ui.buttonSuccess,
  },
  dangerButton: {
    ...ui.buttonDanger,
  },
  messageBox: {
    marginBottom: '10px',
    padding: '10px 12px',
    borderRadius: theme.radius.md,
    border: `1px solid rgba(22, 163, 74, 0.2)`,
    backgroundColor: 'rgba(22, 163, 74, 0.06)',
    color: theme.colors.success,
    fontWeight: 600,
  },
  errorBox: {
    marginBottom: '10px',
    padding: '10px 12px',
    borderRadius: theme.radius.md,
    border: `1px solid rgba(220, 38, 38, 0.2)`,
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
    color: theme.colors.danger,
    fontWeight: 600,
  },
  editorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
  },
  panel: {
    display: 'grid',
    gap: '8px',
  },
  label: {
    fontWeight: 700,
    color: theme.colors.text,
  },
  textarea: {
    ...ui.input,
    width: '100%',
    minHeight: '320px',
    boxSizing: 'border-box',
    padding: '12px',
    fontSize: '0.92rem',
    lineHeight: 1.5,
    resize: 'vertical',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    whiteSpace: 'pre',
  },
  outputTextarea: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  noteBox: {
    marginTop: '12px',
    padding: '10px 12px',
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textMuted,
    fontSize: '0.88rem',
    lineHeight: 1.45,
  },
};

export default MarkdownHeadingLevelTool;
