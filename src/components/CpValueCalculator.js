// src/components/CpValueCalculator.js
import React, { useState } from 'react';

function CpValueCalculator({ showPage }) {
  const [cost, setCost] = useState('');
  const [value, setValue] = useState('');
  const [cpValue, setCpValue] = useState(null);

  const calculateCpValue = () => {
    const costNum = parseFloat(cost);
    const valueNum = parseFloat(value);
    if (!isNaN(costNum) && !isNaN(valueNum) && costNum !== 0) {
      setCpValue(valueNum / costNum);
    } else {
      setCpValue('輸入無效');
    }
  };

  return (
    <div id="cp-value-calculator">
      <h2>CP值計算機</h2>
      <div>
        <label>
          成本（Cost）: 
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            style={styles.input}
          />
        </label>
      </div>
      <div>
        <label>
          價值（Value）: 
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={styles.input}
          />
        </label>
      </div>
      <button style={styles.button} onClick={calculateCpValue}>
        計算 CP值
      </button>
      {cpValue !== null && (
        <div id="cp-value-result" style={styles.cpResult}>
          CP值: {cpValue}
        </div>
      )}
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
  input: {
    padding: '8px',
    margin: '5px 0',
    width: '100%',
    maxWidth: '200px',
    boxSizing: 'border-box',
  },
  cpResult: {
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

export default CpValueCalculator;
