// src/App.js
import React, { useState } from 'react';
import HomePage from './components/HomePage';
import CoinFlip from './components/CoinFlip';
import CpValueCalculator from './components/CpValueCalculator';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const showPage = (pageId) => {
    setCurrentPage(pageId);
  };

  return (
    <div>
      <header style={styles.header}>
        <h1>Tool Box</h1>
      </header>
      <main style={styles.main}>
        {currentPage === 'home' && <HomePage showPage={showPage} />}
        {currentPage === 'coin-flip' && <CoinFlip showPage={showPage} />}
        {currentPage === 'cp-value-calculator' && (
          <CpValueCalculator showPage={showPage} />
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
};

export default App;
