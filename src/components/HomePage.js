// src/components/HomePage.js
import React from 'react';

function HomePage({ showPage }) {
  return (
    <div id="home-page">
      <ul style={styles.ul}>
        <li style={styles.li}>
          <a style={styles.a} onClick={() => showPage('coin-flip')}>
            擲硬幣
          </a>
        </li>
        <li style={styles.li}>
          <a style={styles.a} onClick={() => showPage('cp-value-calculator')}>
            CP值計算機
          </a>
        </li>
      </ul>
    </div>
  );
}

const styles = {
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
};

export default HomePage;
