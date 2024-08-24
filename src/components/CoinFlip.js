// src/components/CoinFlip.js
import React, { useState } from 'react';

function CoinFlip({ showPage }) {
  const [coinResult, setCoinResult] = useState('請擲硬幣');

  const flipCoin = () => {
    const result = Math.random() < 0.5 ? '正面' : '反面';
    setCoinResult(result);
  };

  return (
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
  );
}

const styles = {
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
  coinResult: {
    fontSize: '1.5em',
    marginTop: '20px',
    textAlign: 'center',
  },
  a: {
    textDecoration: 'none',
    color: '#4CAF50',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default CoinFlip;
