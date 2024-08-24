// src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div id="home-page">
      <ul style={styles.ul}>
        <li style={styles.li}>
          <Link to="/coin-flip" style={styles.a}>
            擲硬幣
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/cp" style={styles.a}>
            CP值計算機
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/zh" style={styles.a}>
            簡繁轉換
          </Link>
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
