import React, { useState } from 'react';

function CoinFlip({ showPage }) {
  const [coinResult, setCoinResult] = useState({ result: '請擲硬幣', timestamp: '' });
  const [history, setHistory] = useState([]);
  const [count, setCount] = useState({ heads: 0, tails: 0 });

  const flipCoin = () => {
    const result = Math.random() < 0.5 ? '正面' : '反面';
    const timestamp = new Date().toLocaleString();
    setCoinResult({ result, timestamp });
    setHistory([{ result, timestamp }, ...history]);
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
      <h2 style={styles.title}>擲硬幣</h2>
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
    padding: "20px",
    maxWidth: "100%",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  },
  title: {
    marginBottom: "20px",
    textAlign: "center",
    margin: "10px 0",
    color: "#333",
    flexGrow: 1,
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.1em',
    transition: 'background-color 0.3s',
  },
  actionBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonHover: {
    backgroundColor: '#45a049',
  },
  coinResult: {
    marginTop: '20px',
    color: '#555',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  resultText: {
    fontSize: '2em',
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: '0.9em',
    color: '#888',
    marginTop: '5px',
  },
  count: {
    marginTop: '20px',
    fontSize: '1.2em',
    color: '#333',
    textAlign: 'center',
  },
  history: {
    marginTop: '40px',
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: '1.5em',
    color: '#666',
    marginBottom: '10px',
  },
  historyList: {
    maxHeight: '150px',
    overflowY: 'scroll',
    paddingLeft: '0',
    listStyleType: 'none',
    margin: '0',
    border: '1px solid #eee',
    borderRadius: '5px',
  },
  historyItem: {
    fontSize: '1em',
    color: '#333',
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  clearButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    marginTop: '20px',
    transition: 'background-color 0.3s',
  },
  clearButtonHover: {
    backgroundColor: '#d32f2f',
  },
};

export default CoinFlip;
