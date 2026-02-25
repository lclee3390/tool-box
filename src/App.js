// src/App.js
import React, { useLayoutEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import CoinFlip from './components/CoinFlip';
import CpValueCalculator from './components/CpValueCalculator';
import ZhConvertTool from './components/ZhConvertTool';
import BookmarkConverter from './components/BookmarkConverter';
import Clock from './components/Clock';
import YouTubeRSS from './components/YouTubeRSS';
import UniqueURLProcessor from './components/UniqueUrlInput';
import TaiwanLotteryRandomizer from './components/TaiwanLotteryRandomizer';
import UnitConverter from './components/UnitConverter';
import DrawLotsTool from './components/DrawLotsTool';
import MarkdownHeadingLevelTool from './components/MarkdownHeadingLevelTool';
import MermaidPreviewTool from './components/MermaidPreviewTool';
import { theme, ui } from './styles/theme';

const THEME_MODE_STORAGE_KEY = 'TOOLBOX_THEME_MODE_V1';

const ROUTES = [
  { path: '/', title: '工具箱', element: <HomePage /> },
  { path: '/coin-flip', title: '擲硬幣', element: <CoinFlip /> },
  { path: '/cp', title: 'CP 值計算機', element: <CpValueCalculator /> },
  { path: '/clock', title: '時鐘工具', element: <Clock /> },
  { path: '/lottery-randomizer', title: '台灣彩券隨機選號', element: <TaiwanLotteryRandomizer /> },
  { path: '/unit-converter', title: '單位換算', element: <UnitConverter /> },
  { path: '/draw-lots', title: '抽籤工具', element: <DrawLotsTool /> },
  { path: '/markdown-heading-level', title: 'Markdown 標題層級調整', element: <MarkdownHeadingLevelTool /> },
  { path: '/mermaid-preview', title: 'Mermaid 預覽', element: <MermaidPreviewTool /> },
  { path: '/yt-rss', title: 'YouTube RSS 產生器', element: <YouTubeRSS /> },
  { path: '/unique-url', title: '去除重複 URL', element: <UniqueURLProcessor /> },
  { path: '/zh', title: '簡繁轉換', element: <ZhConvertTool /> },
  { path: '/bk-convert', title: '網址轉書籤工具', element: <BookmarkConverter /> },
];

const ROUTE_TITLE_MAP = Object.fromEntries(ROUTES.map(({ path, title }) => [path, title]));

function getInitialThemeMode() {
  if (typeof window === 'undefined') return 'dark';

  try {
    const saved = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (e) {
    // Ignore storage access errors.
  }

  return 'dark';
}

function AppLayout() {
  const location = useLocation();
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const pageTitle = ROUTE_TITLE_MAP[location.pathname] || '工具箱';
  const isHome = location.pathname === '/';

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeMode;
    root.style.colorScheme = themeMode;

    try {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode);
    } catch (e) {
      // Ignore storage access errors.
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerRow}>
            <div style={styles.headerSide}>
              {!isHome && (
                <Link to="/" style={styles.homeLink}>
                  回到首頁
                </Link>
              )}
            </div>
            <h1 style={styles.headerTitle}>{pageTitle}</h1>
            <div style={{ ...styles.headerSide, ...styles.headerSideRight }}>
              <button
                type="button"
                onClick={toggleThemeMode}
                style={styles.themeToggleButton}
                aria-label={`切換為${themeMode === 'dark' ? '淺色模式' : '黑色模式'}`}
                title={themeMode === 'dark' ? '切換為淺色模式' : '切換為黑色模式'}
              >
                <span style={styles.themeToggleIcon}>{themeMode === 'dark' ? '深' : '淺'}</span>
                <span style={styles.themeToggleText}>
                  {themeMode === 'dark' ? '黑色模式' : '淺色模式'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <Routes>
          {ROUTES.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </>
  );
}

function ScrollToTopOnRouteChange() {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTopOnRouteChange />
      <AppLayout />
    </Router>
  );
}

const styles = {
  header: {
    ...ui.appHeader,
    padding: '8px 0',
  },
  headerInner: {
    width: '100%',
    maxWidth: '980px',
    margin: '0 auto',
    padding: '0 20px',
    boxSizing: 'border-box',
  },
  headerRow: {
    minHeight: '36px',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '12px',
  },
  headerSide: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
  headerSideRight: {
    justifyContent: 'flex-end',
  },
  headerTitle: {
    margin: 0,
    fontSize: 'clamp(18px, 2.2vw, 24px)',
    fontWeight: 800,
    letterSpacing: '0.02em',
    lineHeight: 1.2,
    textAlign: 'center',
  },
  headerBadge: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.9)',
    padding: '3px 10px',
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.16)',
    whiteSpace: 'nowrap',
  },
  main: ui.appMain,
  homeLink: {
    textDecoration: 'none',
    fontWeight: '700',
    cursor: 'pointer',
    color: 'white',
    padding: '6px 12px',
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    fontSize: '0.9rem',
  },
  themeToggleButton: {
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    color: 'white',
    borderRadius: theme.radius.pill,
    padding: '6px 12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    fontSize: '0.88rem',
    fontWeight: 700,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  themeToggleIcon: {
    lineHeight: 1,
    fontSize: '0.78rem',
    width: '18px',
    height: '18px',
    borderRadius: theme.radius.pill,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    border: '1px solid rgba(255,255,255,0.18)',
  },
  themeToggleText: {
    lineHeight: 1.1,
  },
};

export default App;
