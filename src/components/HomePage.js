// src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { theme, ui } from '../styles/theme';

const TOOL_ITEMS = [
  { to: '/coin-flip', label: '擲硬幣' },
  { to: '/cp', label: 'CP值計算機' },
  { to: '/zh', label: '簡繁轉換' },
  { to: '/bk-convert', label: '網址轉書籤工具' },
  { to: '/clock', label: '時鐘工具' },
  { to: '/lottery-randomizer', label: '台灣彩券隨機選號' },
  { to: '/unit-converter', label: '單位換算' },
  { to: '/draw-lots', label: '抽籤工具' },
  { to: '/yt-rss', label: 'YouTube RSS' },
  { to: '/unique-url', label: '去除重複URL' },
];

function HomePage() {
  return (
    <div id="home-page" style={styles.container}>
      <ul style={styles.ul}>
        {TOOL_ITEMS.map((item) => (
          <li key={item.to} style={styles.li}>
            <Link to={item.to} style={styles.a}>
              <span>{item.label}</span>
              <span style={styles.arrow}>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    ...ui.toolContainer,
    padding: '20px',
  },
  hero: {
    marginBottom: '12px',
  },
  title: {
    ...ui.toolTitle,
    marginBottom: '4px',
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
    margin: '16px 0 0 0',
    display: 'grid',
    gap: '10px',
  },
  li: {
    backgroundColor: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadow.soft,
  },
  a: {
    textDecoration: 'none',
    color: theme.colors.text,
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
  },
  arrow: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
};

export default HomePage;
