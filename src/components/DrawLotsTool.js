import React, { useEffect, useRef, useState } from 'react';
import { theme, ui } from '../styles/theme';

const STORAGE_KEY = 'DRAW_LOTS_TOOL_STATE_V1';

function formatEntryNo(no) {
  return String(no).padStart(3, '0');
}

function parseEntries(inputText, dedupeInput) {
  const rawEntries = inputText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const seen = new Set();
  const parsedEntries = [];
  let duplicateCount = 0;

  rawEntries.forEach((name) => {
    if (dedupeInput && seen.has(name)) {
      duplicateCount += 1;
      return;
    }

    seen.add(name);

    parsedEntries.push({
      entryNo: parsedEntries.length + 1,
      name,
    });
  });

  return {
    rawCount: rawEntries.length,
    duplicateCount,
    entries: parsedEntries,
  };
}

function getRandomIndex(max) {
  if (max <= 0) return 0;

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function drawWithoutRepeat(entries, count) {
  const pool = [...entries];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = getRandomIndex(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}

function drawWithRepeat(entries, count) {
  return Array.from({ length: count }, () => entries[getRandomIndex(entries.length)]);
}

function DrawLotsTool() {
  const fileInputRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [drawCount, setDrawCount] = useState('1');
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [dedupeInput, setDedupeInput] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastDrawTime, setLastDrawTime] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (typeof parsed.inputText === 'string') setInputText(parsed.inputText);
      if (typeof parsed.drawCount === 'string') setDrawCount(parsed.drawCount);
      if (typeof parsed.allowRepeat === 'boolean') setAllowRepeat(parsed.allowRepeat);
      if (typeof parsed.dedupeInput === 'boolean') setDedupeInput(parsed.dedupeInput);
    } catch (e) {
      // Ignore malformed localStorage data.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ inputText, drawCount, allowRepeat, dedupeInput })
      );
    } catch (e) {
      // Ignore storage write failures (private mode / quota).
    }
  }, [inputText, drawCount, allowRepeat, dedupeInput]);

  useEffect(() => {
    if (!copied) return undefined;

    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const parsed = parseEntries(inputText, dedupeInput);
  const entries = parsed.entries;
  const requestedCount = Number.parseInt(drawCount, 10);
  const normalizedDrawCount = Number.isFinite(requestedCount) ? Math.max(1, requestedCount) : 1;

  const handleDraw = () => {
    setCopied(false);
    setError('');

    if (entries.length === 0) {
      setResults([]);
      setError('請先輸入名單（一行一個）');
      return;
    }

    if (!allowRepeat && normalizedDrawCount > entries.length) {
      setResults([]);
      setError(`名單只有 ${entries.length} 筆，無法不重複抽出 ${normalizedDrawCount} 位`);
      return;
    }

    const winners = allowRepeat
      ? drawWithRepeat(entries, normalizedDrawCount)
      : drawWithoutRepeat(entries, normalizedDrawCount);

    setResults(winners);
    setLastDrawTime(new Date().toLocaleString());
  };

  const handleImportClick = () => {
    setError('');

    if (!fileInputRef.current) {
      return;
    }

    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      setInputText(text);
      setResults([]);
      setCopied(false);
      setLastDrawTime('');
      setError('');
    } catch (e) {
      setError('匯入失敗，請確認檔案格式為文字檔');
    }
  };

  const handleExportList = () => {
    setError('');

    if (!inputText.trim()) {
      setError('目前沒有可匯出的名單');
      return;
    }

    const blob = new Blob([inputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

    link.href = url;
    link.download = `draw-lots-list-${timestamp}.txt`;
    link.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleCopyResults = async () => {
    if (results.length === 0) return;

    const output = results
      .map((item, index) => `${index + 1}. [${formatEntryNo(item.entryNo)}] ${item.name}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch (e) {
      setError('複製失敗，請手動複製結果');
    }
  };

  const handleClearResults = () => {
    setResults([]);
    setError('');
    setCopied(false);
    setLastDrawTime('');
  };

  const handleClearAll = () => {
    setInputText('');
    setDrawCount('1');
    setAllowRepeat(false);
    setDedupeInput(false);
    handleClearResults();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>抽籤工具</h2>
      <p style={styles.subtitle}>貼上名單（一行一個），設定抽出人數後開始抽籤</p>

      <label htmlFor="draw-lots-input" style={styles.label}>
        名單
      </label>
      <textarea
        id="draw-lots-input"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={'王小明\n李小華\nA組\nB組'}
        style={styles.textarea}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,text/plain"
        onChange={handleImportFileChange}
        style={styles.hiddenFileInput}
      />

      <div style={styles.listIoRow}>
        <button onClick={handleImportClick} style={{ ...styles.button, ...styles.secondaryButton }}>
          匯入名單
        </button>
        <button onClick={handleExportList} style={{ ...styles.button, ...styles.secondaryButton }}>
          匯出名單
        </button>
      </div>

      <div style={styles.optionGrid}>
        <label htmlFor="draw-count-input" style={styles.optionLabel}>
          抽出幾位
        </label>
        <input
          id="draw-count-input"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={drawCount}
          onChange={(e) => setDrawCount(e.target.value)}
          style={styles.numberInput}
        />

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={!allowRepeat}
            onChange={(e) => setAllowRepeat(!e.target.checked)}
          />
          不重複抽出
        </label>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={dedupeInput}
            onChange={(e) => setDedupeInput(e.target.checked)}
          />
          先去除完全相同項目
        </label>
      </div>

      <div style={styles.metaRow}>
        <span>原始名單：{parsed.rawCount} 筆</span>
        <span>有效名單：{entries.length} 筆</span>
        {dedupeInput && parsed.duplicateCount > 0 && (
          <span>已去除重複：{parsed.duplicateCount} 筆</span>
        )}
        <span>模式：{allowRepeat ? '可重複抽中' : '不重複抽出'}</span>
      </div>

      {entries.length > 0 && (
        <section style={styles.parsedCard}>
          <div style={styles.parsedHeader}>
            <h3 style={styles.parsedTitle}>解析後名單（自動編號）</h3>
            <span style={styles.parsedHint}>抽籤會以此名單為準</span>
          </div>

          <ul style={styles.parsedList}>
            {entries.map((item) => (
              <li key={`${item.entryNo}-${item.name}`} style={styles.parsedItem}>
                <span style={styles.entryNoBadge}>{formatEntryNo(item.entryNo)}</span>
                <span style={styles.parsedName}>{item.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div style={styles.buttonRow}>
        <button onClick={handleDraw} style={{ ...styles.button, ...styles.primaryButton }}>
          開始抽籤
        </button>
        <button onClick={handleClearResults} style={{ ...styles.button, ...styles.secondaryButton }}>
          清空結果
        </button>
        <button onClick={handleClearAll} style={{ ...styles.button, ...styles.dangerButton }}>
          清空全部
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {results.length > 0 && (
        <section style={styles.resultCard} aria-live="polite">
          <div style={styles.resultHeader}>
            <div>
              <h3 style={styles.resultTitle}>抽籤結果</h3>
              {lastDrawTime && <p style={styles.resultTime}>抽籤時間：{lastDrawTime}</p>}
            </div>
            <button onClick={handleCopyResults} style={{ ...styles.button, ...styles.successButton }}>
              {copied ? '已複製' : '複製結果'}
            </button>
          </div>

          <ol style={styles.resultList}>
            {results.map((item, index) => (
              <li key={`${item.entryNo}-${item.name}-${index}`} style={styles.resultItem}>
                <span style={styles.rank}>{index + 1}</span>
                <div style={styles.resultTextWrap}>
                  <span style={styles.resultEntryNo}>#{formatEntryNo(item.entryNo)}</span>
                  <span>{item.name}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

const styles = {
  container: {
    ...ui.toolContainer,
    maxWidth: '840px',
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
  },
  label: {
    display: 'block',
    fontWeight: 700,
    marginBottom: '8px',
    color: theme.colors.text,
  },
  textarea: {
    ...ui.input,
    width: '100%',
    minHeight: '220px',
    padding: '12px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  hiddenFileInput: {
    display: 'none',
  },
  listIoRow: {
    marginTop: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'max-content minmax(100px, 140px)',
    gap: '10px 12px',
    alignItems: 'center',
    marginTop: '16px',
  },
  optionLabel: {
    fontWeight: 700,
    color: theme.colors.text,
  },
  numberInput: {
    ...ui.input,
    width: '100%',
    padding: '8px 10px',
    fontSize: '0.95rem',
  },
  checkboxLabel: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: theme.colors.text,
    fontWeight: 500,
  },
  metaRow: {
    marginTop: '14px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    color: theme.colors.textMuted,
    fontSize: '0.9rem',
  },
  parsedCard: {
    marginTop: '16px',
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: '#fff',
    padding: '12px',
  },
  parsedHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 12px',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '10px',
  },
  parsedTitle: {
    margin: 0,
    fontSize: '1rem',
    color: theme.colors.text,
  },
  parsedHint: {
    color: theme.colors.textMuted,
    fontSize: '0.85rem',
  },
  parsedList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'grid',
    gap: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  parsedItem: {
    display: 'grid',
    gridTemplateColumns: '56px 1fr',
    gap: '10px',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.border}`,
  },
  entryNoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    color: theme.colors.info,
    fontWeight: 700,
    fontSize: '0.82rem',
    letterSpacing: '0.04em',
  },
  parsedName: {
    color: theme.colors.text,
    wordBreak: 'break-word',
  },
  buttonRow: {
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  button: {
    ...ui.buttonBase,
    padding: '10px 14px',
    fontSize: '0.95rem',
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
  errorBox: {
    marginTop: '14px',
    padding: '10px 12px',
    borderRadius: theme.radius.md,
    border: `1px solid rgba(220, 38, 38, 0.22)`,
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
    color: theme.colors.danger,
    fontWeight: 600,
  },
  resultCard: {
    marginTop: '18px',
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surfaceMuted,
    padding: '14px',
  },
  resultHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    margin: 0,
    color: theme.colors.text,
    fontSize: '1.05rem',
  },
  resultTime: {
    margin: '4px 0 0 0',
    color: theme.colors.textMuted,
    fontSize: '0.85rem',
  },
  resultList: {
    margin: '12px 0 0 0',
    padding: 0,
    listStyle: 'none',
    display: 'grid',
    gap: '8px',
  },
  resultItem: {
    display: 'grid',
    gridTemplateColumns: '32px 1fr',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: '#fff',
  },
  resultTextWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  resultEntryNo: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 8px',
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.borderStrong}`,
    color: theme.colors.textMuted,
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: theme.colors.surfaceMuted,
    whiteSpace: 'nowrap',
  },
  rank: {
    width: '28px',
    height: '28px',
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    color: theme.colors.primary,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
  },
};

export default DrawLotsTool;
