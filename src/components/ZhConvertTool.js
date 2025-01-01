import React, { useState } from 'react';
import chineseConv from 'chinese-conv';

const ZhConvertTool = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('simplified');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
  };

  const handleConvert = () => {
    if (mode === 'simplified') {
      setOutputText(chineseConv.tify(inputText));
    } else {
      setOutputText(chineseConv.sify(inputText));
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const handleCopy = async () => {
    if (outputText) {
      try {
        // 優先使用現代的 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(outputText);
        } else {
          // 回退到傳統方法
          const textarea = document.createElement('textarea');
          textarea.value = outputText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 3000);
      } catch (err) {
        console.error('複製失敗:', err);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>簡繁轉換工具</h2>
      
      <div style={styles.inputSection}>
        <div style={styles.sectionHeader}>
          <button 
            onClick={handleClear}
            style={styles.clearButton}
          >
            清除輸入
          </button>
        </div>
        <div style={styles.textareaContainer}>
          <textarea
            style={styles.textarea}
            rows="6"
            value={inputText}
            onChange={handleInputChange}
            placeholder="請輸入要轉換的文字"
          />
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.radioGroup}>
          <div style={styles.radioOption}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="simplified"
                checked={mode === 'simplified'}
                onChange={handleModeChange}
              />
              簡體轉繁體
            </label>
          </div>
          <div style={styles.radioOption}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="traditional"
                checked={mode === 'traditional'}
                onChange={handleModeChange}
              />
              繁體轉簡體
            </label>
          </div>
        </div>
        <button 
          onClick={handleConvert}
          style={styles.convertButton}
        >
          開始轉換
        </button>
      </div>

      <div style={styles.outputSection}>
        <div style={styles.textareaContainer}>
          <textarea
            style={styles.textarea}
            rows="6"
            value={outputText}
            readOnly
            placeholder="轉換後的文字"
          />
        </div>
        <div style={styles.outputControls}>
          <div style={styles.copyContainer}>
            <button 
              onClick={handleCopy}
              style={{
                ...styles.copyButton,
                opacity: outputText ? 1 : 0.5,
                cursor: outputText ? 'pointer' : 'not-allowed'
              }}
              disabled={!outputText}
            >
              複製結果
            </button>
            {copySuccess && (
              <span style={styles.copySuccess}>複製成功!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px 20px",
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  inputSection: {
    marginBottom: '20px',
  },
  outputSection: {
    marginTop: '20px',
  },
  textareaContainer: {
    width: '100%',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    resize: 'vertical',
    fontFamily: 'inherit',
    minHeight: '120px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '20px 0',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxSizing: 'border-box',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioOption: {
    padding: '4px 0',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '15px',
  },
  inputControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  outputControls: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  convertButton: {
    padding: '10px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
    fontWeight: 'bold',
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#ff6666',
    }
  },
  copyButton: {
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#1976D2',
    }
  },
  copyContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  copySuccess: {
    color: '#4CAF50',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '10px',
  },
};

export default ZhConvertTool;
