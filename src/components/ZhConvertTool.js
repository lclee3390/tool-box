import React, { useState } from 'react';
import chineseConv from 'chinese-conv';

const ZhConvertTool = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('simplified'); // 默認模式為簡體轉繁體

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
  };

  const handleConvert = () => {
    if (mode === 'simplified') {
      setOutputText(chineseConv.tify(inputText)); // 簡體轉繁體
    } else {
      setOutputText(chineseConv.sify(inputText)); // 繁體轉簡體
    }
  };

  return (
    <div style={styles.container}>
      <h2>簡繁轉換工具</h2>
      <div>
        <textarea
          rows="4"
          cols="50"
          value={inputText}
          onChange={handleInputChange}
          placeholder="輸入文字"
        />
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="simplified"
            checked={mode === 'simplified'}
            onChange={handleModeChange}
          />
          簡體轉繁體
        </label>
        <label>
          <input
            type="radio"
            value="traditional"
            checked={mode === 'traditional'}
            onChange={handleModeChange}
          />
          繁體轉簡體
        </label>
      </div>
      <div>
        <button onClick={handleConvert}>轉換</button>
      </div>
      <div>
        <textarea
          rows="4"
          cols="50"
          value={outputText}
          readOnly
          placeholder="轉換後的文字"
        />
      </div>
    </div>
  );
};

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
    container: {
      padding: "20px",
      maxWidth: "100%",
      margin: "0 auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    },
  };
export default ZhConvertTool;
