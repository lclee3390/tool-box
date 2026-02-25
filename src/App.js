// src/App.js
import React, { useLayoutEffect } from 'react';
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
import { theme, ui } from './styles/theme';

const ROUTES = [
  { path: '/', title: '工具箱', element: <HomePage /> },
  { path: '/coin-flip', title: '擲硬幣', element: <CoinFlip /> },
  { path: '/cp', title: 'CP 值計算機', element: <CpValueCalculator /> },
  { path: '/clock', title: '時鐘工具', element: <Clock /> },
  { path: '/lottery-randomizer', title: '台灣彩券隨機選號', element: <TaiwanLotteryRandomizer /> },
  { path: '/unit-converter', title: '單位換算', element: <UnitConverter /> },
  { path: '/draw-lots', title: '抽籤工具', element: <DrawLotsTool /> },
  { path: '/markdown-heading-level', title: 'Markdown 標題層級調整', element: <MarkdownHeadingLevelTool /> },
  { path: '/yt-rss', title: 'YouTube RSS 產生器', element: <YouTubeRSS /> },
  { path: '/unique-url', title: '去除重複 URL', element: <UniqueURLProcessor /> },
  { path: '/zh', title: '簡繁轉換', element: <ZhConvertTool /> },
  { path: '/bk-convert', title: '網址轉書籤工具', element: <BookmarkConverter /> },
];

const ROUTE_TITLE_MAP = Object.fromEntries(ROUTES.map(({ path, title }) => [path, title]));

function AppLayout() {
  const location = useLocation();
  const pageTitle = ROUTE_TITLE_MAP[location.pathname] || '工具箱';
  const isHome = location.pathname === '/';

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
            <div style={styles.headerSide} aria-hidden="true">
              {!isHome && (
                <span style={{ ...styles.homeLink, ...styles.headerGhost }}>回到首頁</span>
              )}
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
    gridTemplateColumns: 'max-content 1fr max-content',
    alignItems: 'center',
    gap: '12px',
  },
  headerSide: {
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
    fontSize: 'clamp(18px, 2.2vw, 24px)',
    fontWeight: 800,
    letterSpacing: '0.02em',
    lineHeight: 1.2,
    textAlign: 'center',
  },
  headerGhost: {
    visibility: 'hidden',
    pointerEvents: 'none',
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
};

export default App;
