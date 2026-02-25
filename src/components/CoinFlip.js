import React, { useState } from 'react';
import { theme, ui } from '../styles/theme';

function CoinFlip({ showPage }) {
  const [coinResult, setCoinResult] = useState({ result: '請擲硬幣', timestamp: '' });
  const [history, setHistory] = useState([]);
  const [count, setCount] = useState({ heads: 0, tails: 0 });

  const flipCoin = () => {
    const randomBytes = new Uint32Array(1);
    window.crypto.getRandomValues(randomBytes);
    const result = (randomBytes[0] & 1) === 0 ? '正面' : '反面';
    const timestamp = new Date().toLocaleString();
    setCoinResult({ result, timestamp });
    setHistory(prevHistory => [{ result, timestamp }, ...prevHistory]);
    if (result === '正面') {
      setCount(prevCount => ({ ...prevCount, heads: prevCount.heads + 1 }));
    } else {
      setCount(prevCount => ({ ...prevCount, tails: prevCount.tails + 1 }));
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setCount({ heads: 0, tails: 0 });
  };

  return (
    <div id="coin-flip-page" style={styles.container}>
      <div style={styles.actionBox}>
        <button
          style={styles.button}
          onClick={flipCoin}
          onMouseEnter={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
        >
          擲一下
        </button>
      </div>
      <div id="coin-result" style={styles.coinResult}>
        <span style={styles.resultText}>{coinResult.result}</span>
        {coinResult.timestamp && (
          <div style={styles.timestamp}>{coinResult.timestamp}</div>
        )}
      </div>
      <div id="count" style={styles.count}>
        <div>正面次數: {count.heads}</div>
        <div>反面次數: {count.tails}</div>
      </div>
      <div id="history" style={styles.history}>
        <h3 style={styles.historyTitle}>歷史紀錄</h3>
        {history.length > 0 && (
          <button
            style={styles.clearButton}
            onClick={clearHistory}
            onMouseEnter={(e) => (e.target.style.backgroundColor = styles.clearButtonHover.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = styles.clearButton.backgroundColor)}
          >
            清除歷史
          </button>
        )}
        <ul style={styles.historyList}>
          {history.map((entry, index) => (
            <li key={index} style={styles.historyItem}>
              {entry.timestamp} - {entry.result}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    ...ui.toolContainer,
  },
  title: {
    ...ui.toolTitle,
    margin: "10px 0",
    flexGrow: 1,
  },
  button: {
    ...ui.buttonBase,
    ...ui.buttonSuccess,
    padding: '8px 12px',
    borderRadius: '5px',
    fontSize: '1.1em',
    transition: 'background-color 0.3s',
  },
  actionBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonHover: {
    backgroundColor: theme.colors.successHover,
  },
  coinResult: {
    marginTop: '20px',
    color: theme.colors.textMuted,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  resultText: {
    fontSize: '2em',
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: '0.9em',
    color: theme.colors.textMuted,
    marginTop: '5px',
  },
  count: {
    marginTop: '20px',
    fontSize: '1.2em',
    color: theme.colors.text,
    textAlign: 'center',
  },
  history: {
    marginTop: '40px',
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: '1.5em',
    color: theme.colors.textMuted,
    marginBottom: '10px',
  },
  historyList: {
    maxHeight: '150px',
    overflowY: 'scroll',
    paddingLeft: '0',
    listStyleType: 'none',
    margin: '0',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '5px',
    backgroundColor: theme.colors.surfaceMuted,
  },
  historyItem: {
    fontSize: '1em',
    color: theme.colors.text,
    padding: '10px',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  clearButton: {
    ...ui.buttonBase,
    ...ui.buttonDanger,
    padding: '10px 20px',
    borderRadius: '5px',
    fontSize: '1em',
    marginTop: '20px',
    transition: 'background-color 0.3s',
  },
  clearButtonHover: {
    backgroundColor: theme.colors.dangerHover,
  },
};

export default CoinFlip;
