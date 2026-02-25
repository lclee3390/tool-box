import { useState } from 'react';
import { theme, ui } from '../styles/theme';

export default function UniqueURLProcessor() {
  const [inputText, setInputText] = useState('');
  const [uniqueURLs, setUniqueURLs] = useState([]);
  const [duplicates, setDuplicates] = useState([]);

  const handleProcess = () => {
    const urls = inputText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');

    const urlSet = new Set();
    const duplicateSet = new Set();

    urls.forEach(url => {
      if (urlSet.has(url)) duplicateSet.add(url);
      urlSet.add(url);
    });

    setUniqueURLs(Array.from(urlSet));
    setDuplicates(Array.from(duplicateSet));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(uniqueURLs.join('\n'));
    alert('已複製到剪貼簿');
  };

  const handleExport = () => {
    const blob = new Blob([uniqueURLs.join('\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'unique_urls.txt';
    link.click();
  };

  return (
    <div
      style={{
        ...ui.toolContainer,
        maxWidth: '800px',
        margin: 'auto',
        padding: '30px',
      }}
    >
      <textarea
        style={{
          width: '100%',
          height: '150px',
          padding: '10px',
          borderRadius: '8px',
          border: `1px solid ${theme.colors.borderStrong}`,
          resize: 'none',
          boxSizing: 'border-box',
        }}
        placeholder="請貼入 URL，一行一個"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        onClick={handleProcess}
        style={{
          ...ui.buttonBase,
          ...ui.buttonPrimary,
          width: '100%',
          padding: '10px',
          marginTop: '15px',
          borderRadius: '8px',
          fontSize: '16px',
        }}
      >
        處理並去除重複 URL
      </button>

      {duplicates.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            border: `1px solid rgba(220, 38, 38, 0.2)`,
            padding: '15px',
            marginTop: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: theme.colors.danger }}>重複的 URL：</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {duplicates.map((url, index) => `${index + 1}. ${url}`).join('\n')}
          </pre>
        </div>
      )}

      {uniqueURLs.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(22, 163, 74, 0.08)',
            border: `1px solid rgba(22, 163, 74, 0.2)`,
            padding: '15px',
            marginTop: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: theme.colors.success }}>唯一的 URL 列表：</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {uniqueURLs.map((url, index) => `${index + 1}. ${url}`).join('\n')}
          </pre>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={handleCopy}
                style={{ ...ui.buttonBase, ...ui.buttonSuccess, padding: '8px 15px', borderRadius: '6px' }}
              >
                複製
              </button>
              <button
                onClick={handleExport}
                style={{ ...ui.buttonBase, ...ui.buttonSecondary, padding: '8px 15px', borderRadius: '6px' }}
              >
                匯出
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
