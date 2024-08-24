// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './components/HomePage';
import CoinFlip from './components/CoinFlip';
import CpValueCalculator from './components/CpValueCalculator';
import ZhConvertTool from './components/ZhConvertTool';

function App() {
  return (
    <Router>
      <header style={styles.header}>
        <Link to="/" style={styles.a}>
          回到首頁
        </Link>
      </header>
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/coin-flip" element={<CoinFlip />} />
          <Route path="/cp" element={<CpValueCalculator />} />
          <Route path="/zh" element={<ZhConvertTool />} />
        </Routes>
      </main>
    </Router>
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
  a: {
    textDecoration: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: 'white',
  },
};

export default App;
