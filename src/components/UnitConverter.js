import React, { useState } from 'react';
import { theme, ui } from '../styles/theme';

const UNIT_CATEGORIES = {
  length: {
    id: 'length',
    name: '長度',
    description: '常見長度單位換算',
    type: 'linear',
    units: [
      { id: 'mm', label: '毫米 (mm)', factor: 0.001 },
      { id: 'cm', label: '公分 (cm)', factor: 0.01 },
      { id: 'm', label: '公尺 (m)', factor: 1 },
      { id: 'km', label: '公里 (km)', factor: 1000 },
      { id: 'in', label: '英吋 (in)', factor: 0.0254 },
      { id: 'ft', label: '英尺 (ft)', factor: 0.3048 },
      { id: 'yd', label: '碼 (yd)', factor: 0.9144 },
      { id: 'mi', label: '英里 (mi)', factor: 1609.344 },
    ],
  },
  weight: {
    id: 'weight',
    name: '重量',
    description: '公制、英制與台斤換算',
    type: 'linear',
    units: [
      { id: 'mg', label: '毫克 (mg)', factor: 0.001 },
      { id: 'g', label: '公克 (g)', factor: 1 },
      { id: 'kg', label: '公斤 (kg)', factor: 1000 },
      { id: 't', label: '公噸 (t)', factor: 1000000 },
      { id: 'tai_jin', label: '台斤', factor: 600 },
      { id: 'oz', label: '盎司 (oz)', factor: 28.349523125 },
      { id: 'lb', label: '磅 (lb)', factor: 453.59237 },
    ],
  },
  volume: {
    id: 'volume',
    name: '體積',
    description: '毫升、公升與常見美制容量單位',
    type: 'linear',
    units: [
      { id: 'ml', label: '毫升 (mL)', factor: 1 },
      { id: 'cc', label: '立方公分 (cc)', factor: 1 },
      { id: 'l', label: '公升 (L)', factor: 1000 },
      { id: 'tsp', label: '茶匙 (tsp, US)', factor: 4.92892159375 },
      { id: 'tbsp', label: '湯匙 (tbsp, US)', factor: 14.78676478125 },
      { id: 'cup', label: '杯 (cup, US)', factor: 236.5882365 },
      { id: 'pt', label: '品脫 (pt, US)', factor: 473.176473 },
      { id: 'qt', label: '夸脫 (qt, US)', factor: 946.352946 },
      { id: 'gal', label: '加侖 (gal, US)', factor: 3785.411784 },
    ],
  },
  temperature: {
    id: 'temperature',
    name: '溫度',
    description: '攝氏、華氏、開爾文換算',
    type: 'custom',
    units: [
      {
        id: 'c',
        label: '攝氏 (°C)',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'f',
        label: '華氏 (°F)',
        toBase: (value) => (value - 32) * (5 / 9),
        fromBase: (value) => value * (9 / 5) + 32,
      },
      {
        id: 'k',
        label: '開爾文 (K)',
        toBase: (value) => value - 273.15,
        fromBase: (value) => value + 273.15,
      },
    ],
  },
  area: {
    id: 'area',
    name: '面積',
    description: '平方公尺、公頃、坪等面積單位',
    type: 'linear',
    units: [
      { id: 'cm2', label: '平方公分 (cm²)', factor: 0.0001 },
      { id: 'm2', label: '平方公尺 (m²)', factor: 1 },
      { id: 'ping', label: '坪', factor: 3.305785124 },
      { id: 'ft2', label: '平方英尺 (ft²)', factor: 0.09290304 },
      { id: 'ha', label: '公頃 (ha)', factor: 10000 },
      { id: 'km2', label: '平方公里 (km²)', factor: 1000000 },
    ],
  },
  time: {
    id: 'time',
    name: '時間',
    description: '秒、分、時、日、週換算',
    type: 'linear',
    units: [
      { id: 'ms', label: '毫秒 (ms)', factor: 0.001 },
      { id: 's', label: '秒 (s)', factor: 1 },
      { id: 'min', label: '分鐘 (min)', factor: 60 },
      { id: 'hr', label: '小時 (hr)', factor: 3600 },
      { id: 'day', label: '天 (day)', factor: 86400 },
      { id: 'week', label: '週 (week)', factor: 604800 },
    ],
  },
  data: {
    id: 'data',
    name: '資料容量',
    description: '十進位與二進位資料容量換算（以 Byte 為基底）',
    type: 'linear',
    units: [
      { id: 'B', label: 'Byte (B)', factor: 1 },
      { id: 'KB', label: 'Kilobyte (KB)', factor: 1000 },
      { id: 'MB', label: 'Megabyte (MB)', factor: 1000 ** 2 },
      { id: 'GB', label: 'Gigabyte (GB)', factor: 1000 ** 3 },
      { id: 'TB', label: 'Terabyte (TB)', factor: 1000 ** 4 },
      { id: 'KiB', label: 'Kibibyte (KiB)', factor: 1024 },
      { id: 'MiB', label: 'Mebibyte (MiB)', factor: 1024 ** 2 },
      { id: 'GiB', label: 'Gibibyte (GiB)', factor: 1024 ** 3 },
      { id: 'TiB', label: 'Tebibyte (TiB)', factor: 1024 ** 4 },
    ],
  },
  networkSpeed: {
    id: 'networkSpeed',
    name: '網速',
    description: '網路傳輸速度換算（以 bit/s 為基底，1 Byte/s = 8 bit/s）',
    type: 'linear',
    units: [
      { id: 'bps', label: 'bit/s (bps)', factor: 1 },
      { id: 'Kbps', label: 'Kilobit/s (Kbps)', factor: 1000 },
      { id: 'Mbps', label: 'Megabit/s (Mbps)', factor: 1000 ** 2 },
      { id: 'Gbps', label: 'Gigabit/s (Gbps)', factor: 1000 ** 3 },
      { id: 'Tbps', label: 'Terabit/s (Tbps)', factor: 1000 ** 4 },
      { id: 'Bps', label: 'Byte/s (B/s)', factor: 8 },
      { id: 'KBps', label: 'Kilobyte/s (KB/s)', factor: 8 * 1000 },
      { id: 'MBps', label: 'Megabyte/s (MB/s)', factor: 8 * (1000 ** 2) },
      { id: 'GBps', label: 'Gigabyte/s (GB/s)', factor: 8 * (1000 ** 3) },
      { id: 'KiBps', label: 'Kibibyte/s (KiB/s)', factor: 8 * 1024 },
      { id: 'MiBps', label: 'Mebibyte/s (MiB/s)', factor: 8 * (1024 ** 2) },
      { id: 'GiBps', label: 'Gibibyte/s (GiB/s)', factor: 8 * (1024 ** 3) },
    ],
  },
};

function convertValue(category, fromUnitId, toUnitId, rawValue) {
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  const fromUnit = category.units.find((unit) => unit.id === fromUnitId);
  const toUnit = category.units.find((unit) => unit.id === toUnitId);

  if (!fromUnit || !toUnit) {
    return null;
  }

  if (category.type === 'custom') {
    const baseValue = fromUnit.toBase(parsedValue);
    return toUnit.fromBase(baseValue);
  }

  const baseValue = parsedValue * fromUnit.factor;
  return baseValue / toUnit.factor;
}

function formatConvertedValue(value) {
  if (!Number.isFinite(value)) {
    return '';
  }

  const absValue = Math.abs(value);
  if (absValue !== 0 && (absValue >= 1e9 || absValue < 1e-6)) {
    return value.toExponential(8);
  }

  return parseFloat(value.toPrecision(12)).toString();
}

function UnitConverter() {
  const initialCategory = Object.values(UNIT_CATEGORIES)[0];
  const [categoryId, setCategoryId] = useState(initialCategory.id);
  const [fromUnitId, setFromUnitId] = useState(initialCategory.units[0].id);
  const [toUnitId, setToUnitId] = useState(
    (initialCategory.units[2] || initialCategory.units[1] || initialCategory.units[0]).id
  );
  const [inputValue, setInputValue] = useState('1');

  const category = UNIT_CATEGORIES[categoryId];
  const convertedValue = convertValue(category, fromUnitId, toUnitId, inputValue);

  const handleCategoryChange = (nextCategoryId) => {
    const nextCategory = UNIT_CATEGORIES[nextCategoryId];
    setCategoryId(nextCategoryId);
    setFromUnitId(nextCategory.units[0].id);
    setToUnitId((nextCategory.units[1] || nextCategory.units[0]).id);
  };

  const swapUnits = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const clearInput = () => {
    setInputValue('');
  };

  const fromUnit = category.units.find((unit) => unit.id === fromUnitId);
  const toUnit = category.units.find((unit) => unit.id === toUnitId);

  return (
    <div id="unit-converter" style={styles.container}>
      <div style={styles.subtitle}>支援長度、重量、體積、溫度、面積、時間、資料容量與網速</div>

      <div style={styles.card}>
        <div style={styles.formRow}>
          <label htmlFor="converter-category" style={styles.label}>類別</label>
          <select
            id="converter-category"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={styles.select}
          >
            {Object.values(UNIT_CATEGORIES).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.helperText}>{category.description}</div>

        <div style={styles.grid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>來源</div>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="請輸入數值"
              style={styles.numberInput}
            />
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              style={styles.select}
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.centerActions}>
            <button style={styles.swapButton} onClick={swapUnits}>
              交換
            </button>
            <button style={styles.clearButton} onClick={clearInput}>
              清空
            </button>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>結果</div>
            <div style={styles.resultBox}>
              {inputValue === '' ? '請輸入數值' : (convertedValue === null ? '請輸入有效數值' : formatConvertedValue(convertedValue))}
            </div>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              style={styles.select}
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {inputValue !== '' && convertedValue !== null && fromUnit && toUnit && (
          <div style={styles.summary}>
            {inputValue} {fromUnit.label} = {formatConvertedValue(convertedValue)} {toUnit.label}
          </div>
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
    margin: '0 0 8px 0',
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginBottom: '16px',
    fontSize: '0.95em',
  },
  card: {
    backgroundColor: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: '16px',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  label: {
    minWidth: '44px',
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  select: {
    width: '100%',
    padding: '8px',
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: '5px',
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    boxSizing: 'border-box',
  },
  helperText: {
    marginTop: '10px',
    color: theme.colors.textMuted,
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    borderRadius: '6px',
    padding: '8px 10px',
    lineHeight: 1.5,
  },
  grid: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  panel: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: theme.colors.surfaceMuted,
    minWidth: 0,
  },
  panelTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: '8px',
  },
  numberInput: {
    width: '100%',
    padding: '10px',
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: '5px',
    marginBottom: '8px',
    boxSizing: 'border-box',
    fontSize: '1em',
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  resultBox: {
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: '5px',
    backgroundColor: theme.colors.surface,
    marginBottom: '8px',
    fontFamily: 'monospace',
    fontSize: '1.1em',
    color: theme.colors.text,
    wordBreak: 'break-word',
  },
  centerActions: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  swapButton: {
    ...ui.buttonBase,
    ...ui.buttonPrimary,
    borderRadius: '5px',
    padding: '10px 12px',
    minWidth: '72px',
  },
  clearButton: {
    ...ui.buttonBase,
    ...ui.buttonDanger,
    borderRadius: '5px',
    padding: '10px 12px',
    minWidth: '72px',
  },
  summary: {
    marginTop: '12px',
    padding: '10px',
    borderRadius: '6px',
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
};

export default UnitConverter;
