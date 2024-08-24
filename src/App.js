// src/App.js
import React, { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [coinResult, setCoinResult] = useState('請擲硬幣');

  const showPage = (pageId) => {
    setCurrentPage(pageId);
  };

  const flipCoin = () => {
    const result = Math.random() < 0.5 ? '正面' : '反面';
    setCoinResult(result);
  };

  return (
    <div>
      <header style={styles.header}>
        <h1>Tool Box</h1>
      </header>
      <main style={styles.main}>
        {currentPage === 'home' && (
          <div id="home-page">
            <ul style={styles.ul}>
              <li style={styles.li}>
                <a style={styles.a} onClick={() => showPage('coin-flip-page')}>
                  擲硬幣
                </a>
              </li>
              {/* 可以在這裡添加更多工具的連結 */}
            </ul>
          </div>
        )}

        {currentPage === 'coin-flip-page' && (
          <div id="coin-flip-page">
            <h2>擲硬幣</h2>
            <button style={styles.button} onClick={flipCoin}>
              擲一下
            </button>
            <div id="coin-result" style={styles.coinResult}>
              {coinResult}
            </div>
            <p>
              <a style={styles.a} onClick={() => showPage('home')}>
                回到首頁
              </a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#4CAF50',
    color: 'white',
    textAlign: 'center',
    padding: '10px 0',
  },
  main: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  ul: {
    listStyleType: 'none',
    padding: '0',
  },
  li: {
    backgroundColor: 'white',
    margin: '10px 0',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  a: {
    textDecoration: 'none',
    color: '#4CAF50',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  coinResult: {
    fontSize: '1.5em',
    marginTop: '20px',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    display: 'block',
    margin: '20px auto',
  },
};

export default App;
