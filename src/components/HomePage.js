// src/components/HomePage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { theme, ui } from '../styles/theme';

const TOOL_ITEMS = [
  { to: '/coin-flip', label: '擲硬幣', desc: '快速決策，附抽擲紀錄', accent: '#2563eb' },
  { to: '/cp', label: 'CP 值計算機', desc: '多品項比較，找出最划算', accent: '#0ea5e9' },
  { to: '/clock', label: '時鐘工具', desc: '顯示時間與同步相關功能', accent: '#22c55e' },
  { to: '/lottery-randomizer', label: '台灣彩券隨機選號', desc: '快速產生隨機號碼組合', accent: '#84cc16' },
  { to: '/unit-converter', label: '單位換算', desc: '常用單位快速互相換算', accent: '#f59e0b' },
  { to: '/draw-lots', label: '抽籤工具', desc: '名單抽選，支援編號與匯入匯出', accent: '#f97316' },
  { to: '/markdown-heading-level', label: 'Markdown 標題層級調整', desc: '整份文件標題整體升降一級', accent: '#6366f1' },
  { to: '/mermaid-preview', label: 'Mermaid 預覽', desc: 'Mermaid 圖表即時預覽', accent: '#06b6d4' },
  { to: '/yt-rss', label: 'YouTube RSS', desc: '從頻道網址產生 RSS 連結', accent: '#ef4444' },
  { to: '/unique-url', label: '去除重複URL', desc: '清理重複連結並輸出結果', accent: '#8b5cf6' },
  { to: '/zh', label: '簡繁轉換', desc: '簡體與繁體文字互轉', accent: '#0891b2' },
  { to: '/bk-convert', label: '網址轉書籤工具', desc: '批量網址轉書籤匯入格式', accent: '#14b8a6' },
];

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return `rgba(37, 99, 235, ${alpha})`;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function HomePage() {
  const [activeItem, setActiveItem] = useState(null);

  return (
    <div id="home-page" style={styles.container}>

      <ul style={styles.ul}>
        {TOOL_ITEMS.map((item, index) => {
          const isActive = activeItem === item.to;
          const accentSoft = hexToRgba(item.accent, 0.12);
          const accentBorder = hexToRgba(item.accent, 0.22);
          return (
            <li
              key={item.to}
              style={{
                ...styles.li,
                ...(isActive ? styles.liActive : null),
                borderColor: isActive ? accentBorder : theme.colors.border,
                boxShadow: isActive
                  ? `0 12px 28px ${hexToRgba(item.accent, 0.15)}`
                  : theme.shadow.soft,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  ...styles.topAccentBar,
                  background: `linear-gradient(90deg, ${item.accent}, ${hexToRgba(item.accent, 0.35)})`,
                  opacity: isActive ? 1 : 0.85,
                }}
              />

              <Link
                to={item.to}
                style={styles.a}
                onMouseEnter={() => setActiveItem(item.to)}
                onMouseLeave={() => setActiveItem((prev) => (prev === item.to ? null : prev))}
                onFocus={() => setActiveItem(item.to)}
                onBlur={() => setActiveItem((prev) => (prev === item.to ? null : prev))}
              >
                <div style={styles.leftGroup}>
                  <span
                    style={{
                      ...styles.indexBadge,
                      color: item.accent,
                      backgroundColor: accentSoft,
                      borderColor: accentBorder,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div style={styles.textBlock}>
                    <span style={styles.itemLabel}>{item.label}</span>
                    <span style={styles.itemDesc}>{item.desc}</span>
                  </div>
                </div>

                <span
                  style={{
                    ...styles.arrowPill,
                    color: item.accent,
                    borderColor: accentBorder,
                    backgroundColor: accentSoft,
                    transform: isActive ? 'translateX(2px)' : 'translateX(0)',
                  }}
                >
                  前往
                  <span style={styles.arrow}>→</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    ...ui.toolContainer,
    padding: '20px',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 100%)',
  },
  hero: {
    marginBottom: '16px',
    textAlign: 'center',
    padding: '6px 8px 0',
  },
  title: {
    ...ui.toolTitle,
    marginBottom: '6px',
  },
  subtitle: {
    margin: 0,
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: '0.95em',
  },
  ul: {
    listStyleType: 'none',
    padding: '0',
    margin: '8px 0 0 0',
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  },
  li: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadow.soft,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
    minHeight: '92px',
  },
  liActive: {
    transform: 'translateY(-2px)',
  },
  a: {
    textDecoration: 'none',
    color: theme.colors.text,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: '12px',
    padding: '14px 16px',
    minHeight: '92px',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
  },
  leftGroup: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
    flex: 1,
  },
  textBlock: {
    display: 'grid',
    gap: '4px',
    minWidth: 0,
    alignContent: 'center',
  },
  itemLabel: {
    fontWeight: 800,
    color: theme.colors.text,
    letterSpacing: '0.01em',
    lineHeight: 1.2,
  },
  itemDesc: {
    color: theme.colors.textMuted,
    fontSize: '0.85rem',
    lineHeight: 1.35,
  },
  indexBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    fontWeight: 800,
    fontSize: '0.85rem',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  arrowPill: {
    alignSelf: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.border}`,
    fontWeight: 700,
    fontSize: '0.82rem',
    whiteSpace: 'nowrap',
    transition: 'transform 0.15s ease',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), 0 2px 6px rgba(15, 23, 42, 0.04)',
    position: 'relative',
    zIndex: 1,
  },
  arrow: {
    fontWeight: 800,
    lineHeight: 1,
  },
  topAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: '3px',
  },
};

export default HomePage;
