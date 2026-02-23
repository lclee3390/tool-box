import React, { useState } from 'react';
import { theme, ui } from '../styles/theme';

const GAME_CONFIGS = {
  powerLottery: {
    id: 'powerLottery',
    name: '威力彩',
    price: 100,
    description: '第一區 01-38 選 6 個不重複號碼，第二區 01-08 選 1 個號碼',
    generate: () => {
      const main = pickUniqueNumbers(38, 6);
      const second = padNumber(randomInt(1, 8));
      return {
        lines: [
          { label: '第一區', value: formatNumberList(main) },
          { label: '第二區', value: second },
        ],
      };
    },
  },
  lotto649: {
    id: 'lotto649',
    name: '大樂透',
    price: 50,
    description: '01-49 選 6 個不重複號碼，另產生 1 個特別號（由剩餘號碼）',
    generate: () => {
      const mainNumbers = pickUniqueNumbers(49, 6);
      const mainSet = new Set(mainNumbers);
      const specialCandidates = [];
      for (let i = 1; i <= 49; i += 1) {
        const padded = padNumber(i);
        if (!mainSet.has(padded)) {
          specialCandidates.push(padded);
        }
      }
      const special = specialCandidates[randomInt(0, specialCandidates.length - 1)];
      return {
        lines: [
          { label: '號碼', value: formatNumberList(mainNumbers) },
          { label: '特別號', value: special },
        ],
      };
    },
  },
  daily539: {
    id: 'daily539',
    name: '今彩539',
    price: 50,
    description: '01-39 選 5 個不重複號碼',
    generate: () => ({
      lines: [{ label: '號碼', value: formatNumberList(pickUniqueNumbers(39, 5)) }],
    }),
  },
  lotto1224: {
    id: 'lotto1224',
    name: '雙贏彩',
    price: 50,
    description: '01-24 選 12 個不重複號碼',
    generate: () => ({
      lines: [{ label: '號碼', value: formatNumberList(pickUniqueNumbers(24, 12)) }],
    }),
  },
  threeStar: {
    id: 'threeStar',
    name: '3星彩',
    price: 25,
    description: '000-999（3 位數字，可重複）',
    generate: () => ({
      lines: [{ label: '號碼', value: randomDigits(3) }],
    }),
  },
  fourStar: {
    id: 'fourStar',
    name: '4星彩',
    price: 25,
    description: '0000-9999（4 位數字，可重複）',
    generate: () => ({
      lines: [{ label: '號碼', value: randomDigits(4) }],
    }),
  },
};

function randomInt(min, max) {
  if (max < min) {
    throw new Error('Invalid random range');
  }

  const range = max - min + 1;
  const randomValues = new Uint32Array(1);
  const maxUint = 0xFFFFFFFF;
  const limit = maxUint - ((maxUint + 1) % range);

  let value;
  do {
    window.crypto.getRandomValues(randomValues);
    value = randomValues[0];
  } while (value > limit);

  return min + (value % range);
}

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function pickUniqueNumbers(maxNumber, count) {
  const selected = new Set();
  while (selected.size < count) {
    selected.add(randomInt(1, maxNumber));
  }
  return Array.from(selected)
    .sort((a, b) => a - b)
    .map((num) => padNumber(num));
}

function formatNumberList(numbers) {
  return numbers.join('、');
}

function randomDigits(length) {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += String(randomInt(0, 9));
  }
  return result;
}

function TaiwanLotteryRandomizer() {
  const [selectedGameId, setSelectedGameId] = useState('powerLottery');
  const [drawCount, setDrawCount] = useState(1);
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(false);

  const selectedGame = GAME_CONFIGS[selectedGameId];

  const buildResultsText = () => {
    return [
      `${selectedGame.name} 隨機號碼`,
      ...results.map((result) => {
        const lines = result.lines.map((line) => `${line.label}: ${line.value}`).join(' | ');
        return `第 ${result.order} 組 - ${lines}`;
      }),
    ].join('\n');
  };

  const generateNumbers = () => {
    const count = Math.min(20, Math.max(1, Number(drawCount) || 1));
    const generatedResults = Array.from({ length: count }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      order: index + 1,
      ...selectedGame.generate(),
    }));

    setDrawCount(count);
    setResults(generatedResults);
    setCopied(false);
  };

  const copyResults = async () => {
    if (results.length === 0) {
      window.alert('請先產生號碼。');
      return;
    }
    const content = buildResultsText();

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch (error) {
      console.error('複製失敗:', error);
      window.alert('複製失敗，請手動複製。');
    }
  };

  const exportTxt = () => {
    if (results.length === 0) {
      window.alert('請先產生號碼。');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const content = `${buildResultsText()}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taiwan-lottery-${selectedGame.id}-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderLineValue = (value) => {
    const parts = String(value)
      .split('、')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      return <span style={styles.resultPlainText}>-</span>;
    }

    return (
      <div style={styles.resultValueWrap}>
        {parts.map((part, index) => (
          <span key={`${part}-${index}`} style={styles.numberChip}>
            {part}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div id="taiwan-lottery-randomizer" style={styles.container}>
      <div style={styles.note}>依玩法範圍隨機產生號碼，僅供娛樂與參考。</div>

      <div style={styles.controlCard}>
        <div style={styles.formRow}>
          <label style={styles.label} htmlFor="lottery-game-select">
            玩法
          </label>
          <select
            id="lottery-game-select"
            value={selectedGameId}
            onChange={(e) => {
              setSelectedGameId(e.target.value);
              setResults([]);
              setCopied(false);
            }}
            style={styles.select}
          >
            {Object.values(GAME_CONFIGS).map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formRow}>
          <label style={styles.label} htmlFor="lottery-draw-count">
            組數
          </label>
          <input
            id="lottery-draw-count"
            type="number"
            min="1"
            max="20"
            value={drawCount}
            onChange={(e) => setDrawCount(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.gameMeta}>
          <div>{selectedGame.description}</div>
          <div>單注金額：NT$ {selectedGame.price}</div>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.primaryButton} onClick={generateNumbers}>
            產生號碼
          </button>
          <button style={styles.secondaryButton} onClick={copyResults}>
            {copied ? '已複製' : '複製結果'}
          </button>
          <button style={styles.exportButton} onClick={exportTxt}>
            匯出 TXT
          </button>
        </div>
      </div>

      <div style={styles.resultsCard}>
        <div style={styles.resultsHeader}>
          <span>{selectedGame.name} 產生結果</span>
          {results.length > 0 && <span>共 {results.length} 組</span>}
        </div>

        {results.length === 0 ? (
          <div style={styles.emptyState}>請先選擇玩法並產生號碼。</div>
        ) : (
          <ul style={styles.resultList}>
            {results.map((result) => (
              <li key={result.id} style={styles.resultItem}>
                <div style={styles.resultOrder}>第 {result.order} 組</div>
                {result.lines.map((line) => (
                  <div key={`${result.id}-${line.label}`} style={styles.resultLine}>
                    <span style={styles.resultLabel}>{line.label}</span>
                    <div style={styles.resultValue}>{renderLineValue(line.value)}</div>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    ...ui.toolContainer,
  },
  title: {
    ...ui.toolTitle,
    margin: '0 0 10px 0',
  },
  note: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '16px',
    fontSize: '0.95em',
  },
  controlCard: {
    backgroundColor: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: '16px',
    marginBottom: '16px',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  label: {
    minWidth: '50px',
    color: '#333',
    fontWeight: 'bold',
  },
  select: {
    flex: '1 1 220px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
  },
  input: {
    width: '120px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  gameMeta: {
    color: '#555',
    backgroundColor: '#f6fbff',
    border: '1px solid #d6ecff',
    borderRadius: '6px',
    padding: '10px',
    lineHeight: 1.6,
    marginTop: '4px',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    ...ui.buttonBase,
    ...ui.buttonSuccess,
    padding: '10px 14px',
    borderRadius: '5px',
    fontSize: '1em',
  },
  secondaryButton: {
    ...ui.buttonBase,
    ...ui.buttonPrimary,
    padding: '10px 14px',
    borderRadius: '5px',
    fontSize: '1em',
  },
  exportButton: {
    ...ui.buttonBase,
    ...ui.buttonSecondary,
    padding: '10px 14px',
    borderRadius: '5px',
    fontSize: '1em',
  },
  resultsCard: {
    backgroundColor: '#fff',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: '16px',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  emptyState: {
    color: '#777',
    backgroundColor: '#fafafa',
    border: '1px dashed #ddd',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center',
  },
  resultList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '10px',
  },
  resultItem: {
    border: '1px solid #eee',
    borderRadius: '6px',
    padding: '12px',
    backgroundColor: '#fcfcfc',
  },
  resultOrder: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '6px',
  },
  resultLine: {
    display: 'grid',
    gridTemplateColumns: '60px minmax(0, 1fr)',
    columnGap: '8px',
    rowGap: '6px',
    alignItems: 'start',
    marginTop: '4px',
  },
  resultLabel: {
    color: '#666',
    lineHeight: 1.8,
  },
  resultValue: {
    minWidth: 0,
  },
  resultValueWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  numberChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    padding: '4px 8px',
    borderRadius: '999px',
    border: '1px solid #dfe6ee',
    backgroundColor: '#ffffff',
    color: '#111',
    fontFamily: 'monospace',
    fontSize: '1.05em',
    lineHeight: 1.2,
  },
  resultPlainText: {
    color: '#111',
    fontFamily: 'monospace',
  },
};

export default TaiwanLotteryRandomizer;
