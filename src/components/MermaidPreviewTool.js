import React, { useEffect, useRef, useState } from 'react';
import { theme, ui } from '../styles/theme';

const STORAGE_KEY = 'MERMAID_PREVIEW_TOOL_DRAFT_V1';
let mermaidModulePromise = null;
let mermaidInitialized = false;

function getFenceInfo(line) {
  const match = line.match(/^ {0,3}((`{3,})|(~{3,}))/);
  if (!match) return null;

  const fence = match[1];
  return {
    char: fence[0],
    length: fence.length,
  };
}

function getMermaidFenceStart(line) {
  const fenceInfo = getFenceInfo(line);
  if (!fenceInfo) return null;

  const trimmed = line.trimStart();
  const infoString = trimmed.slice(fenceInfo.length).trim();

  if (!/^mermaid(?:\s|$)/i.test(infoString)) {
    return null;
  }

  return fenceInfo;
}

function extractMermaidBlocks(markdownText) {
  if (!markdownText) return [];

  const lines = markdownText.split(/\r?\n/);
  const blocks = [];
  let openFence = null;
  let buffer = [];
  let startLine = 0;

  lines.forEach((line, index) => {
    if (!openFence) {
      const mermaidFence = getMermaidFenceStart(line);
      if (mermaidFence) {
        openFence = mermaidFence;
        buffer = [];
        startLine = index + 1;
      }
      return;
    }

    const fenceInfo = getFenceInfo(line);
    if (
      fenceInfo &&
      fenceInfo.char === openFence.char &&
      fenceInfo.length >= openFence.length
    ) {
      const code = buffer.join('\n');
      if (code.trim()) {
        blocks.push({
          code,
          startLine,
          source: 'markdown',
        });
      }

      openFence = null;
      buffer = [];
      startLine = 0;
      return;
    }

    buffer.push(line);
  });

  return blocks;
}

function parsePreviewBlocks(inputText) {
  if (!inputText.trim()) {
    return {
      mode: 'empty',
      blocks: [],
    };
  }

  const mermaidBlocks = extractMermaidBlocks(inputText);
  if (mermaidBlocks.length > 0) {
    return {
      mode: 'markdown',
      blocks: mermaidBlocks,
    };
  }

  return {
    mode: 'raw',
    blocks: [
      {
        code: inputText.trim(),
        startLine: 1,
        source: 'raw',
      },
    ],
  };
}

async function loadMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid').then((mod) => mod.default || mod);
  }

  const mermaid = await mermaidModulePromise;

  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      suppressErrorRendering: true,
      theme: 'default',
    });
    mermaidInitialized = true;
  }

  return mermaid;
}

function MermaidDiagramCard({ block, index }) {
  const previewFrameRef = useRef(null);
  const previewContentRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef(null);
  const pendingWheelZoomRef = useRef(null);

  useEffect(() => {
    let disposed = false;

    async function renderDiagram() {
      setSvg('');
      setRenderError('');

      if (!block.code.trim()) return;

      setIsRendering(true);

      try {
        const mermaid = await loadMermaid();
        const renderId = `mermaid-tool-${index}-${Math.random().toString(36).slice(2)}`;
        const result = await mermaid.render(renderId, block.code);

        if (disposed) return;
        setSvg(result.svg);
      } catch (e) {
        if (disposed) return;
        setRenderError(e?.message || e?.str || 'Mermaid 渲染失敗');
      } finally {
        if (!disposed) {
          setIsRendering(false);
        }
      }
    }

    renderDiagram();

    return () => {
      disposed = true;
    };
  }, [block.code, index]);

  useEffect(() => {
    setZoomPercent(100);
    setIsDragging(false);
    dragStateRef.current = null;
    pendingWheelZoomRef.current = null;
  }, [block.code]);

  useEffect(() => {
    const container = previewContentRef.current;
    if (!container) return;

    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    svgElement.style.width = `${zoomPercent}%`;
    svgElement.style.height = 'auto';
    svgElement.style.maxWidth = 'none';
    svgElement.style.display = 'block';

    const pendingWheelZoom = pendingWheelZoomRef.current;
    const frame = previewFrameRef.current;
    if (pendingWheelZoom && frame) {
      const { ratio, localX, localY, prevScrollLeft, prevScrollTop } = pendingWheelZoom;
      pendingWheelZoomRef.current = null;

      window.requestAnimationFrame(() => {
        frame.scrollLeft = (prevScrollLeft + localX) * ratio - localX;
        frame.scrollTop = (prevScrollTop + localY) * ratio - localY;
      });
    }
  }, [svg, zoomPercent]);

  useEffect(() => {
    return () => {
      setIsDragging(false);
      dragStateRef.current = null;
      pendingWheelZoomRef.current = null;
    };
  }, []);

  const handleZoomIn = () => {
    setZoomPercent((prev) => Math.min(400, prev + 25));
  };

  const handleZoomOut = () => {
    setZoomPercent((prev) => Math.max(25, prev - 25));
  };

  const handleResetZoom = () => {
    setZoomPercent(100);
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    const frame = previewFrameRef.current;
    if (!frame) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      scrollLeft: frame.scrollLeft,
      scrollTop: frame.scrollTop,
    };

    setIsDragging(true);

    if (frame.setPointerCapture) {
      try {
        frame.setPointerCapture(event.pointerId);
      } catch (e) {
        // Ignore pointer capture failures.
      }
    }

    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    const frame = previewFrameRef.current;
    const dragState = dragStateRef.current;
    if (!frame || !dragState) return;

    if (dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.clientX;
    const deltaY = event.clientY - dragState.clientY;

    frame.scrollLeft = dragState.scrollLeft - deltaX;
    frame.scrollTop = dragState.scrollTop - deltaY;
    event.preventDefault();
  };

  const endDrag = (event) => {
    const frame = previewFrameRef.current;
    const dragState = dragStateRef.current;
    if (!dragState) return;
    if (event && dragState.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    setIsDragging(false);

    if (frame && event && frame.releasePointerCapture) {
      try {
        frame.releasePointerCapture(event.pointerId);
      } catch (e) {
        // Ignore pointer capture release failures.
      }
    }
  };

  const canInteract = Boolean(svg) && !isRendering && !renderError;

  useEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame || !canInteract) return undefined;

    const onWheel = (event) => {
      // Prevent the page from scrolling while zooming on the diagram.
      event.preventDefault();
      event.stopPropagation();

      const step = event.shiftKey ? 25 : 10;
      const direction = event.deltaY < 0 ? 1 : -1;
      const nextZoom = Math.max(25, Math.min(400, zoomPercent + direction * step));

      if (nextZoom === zoomPercent) {
        return;
      }

      const rect = frame.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const ratio = nextZoom / zoomPercent;

      pendingWheelZoomRef.current = {
        ratio,
        localX,
        localY,
        prevScrollLeft: frame.scrollLeft,
        prevScrollTop: frame.scrollTop,
      };

      setZoomPercent(nextZoom);
    };

    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      frame.removeEventListener('wheel', onWheel);
    };
  }, [canInteract, zoomPercent]);

  return (
    <article style={styles.diagramCard}>
      <div style={styles.diagramHeader}>
        <div style={styles.diagramHeaderText}>
          <strong>圖表 {index + 1}</strong>
          <span style={styles.diagramMeta}>
            {block.source === 'markdown' ? `Markdown 區塊（起始行 ${block.startLine}）` : '直接 Mermaid 輸入'}
          </span>
        </div>

        <div style={styles.zoomToolbar} aria-label={`圖表 ${index + 1} 縮放控制`}>
          <button
            type="button"
            onClick={handleZoomOut}
            style={{ ...styles.zoomButton, ...styles.zoomButtonGhost }}
            title="縮小 25%"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            style={{ ...styles.zoomButton, ...styles.zoomButtonGhost }}
            title="放大 25%"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            style={{ ...styles.zoomButton, ...styles.zoomButtonPrimary }}
            title="重設為 100%"
          >
            適應寬度
          </button>
          <span style={styles.zoomLabel}>{zoomPercent}%</span>
        </div>
      </div>

      <div
        ref={previewFrameRef}
        style={{
          ...styles.previewFrame,
          ...(canInteract ? styles.previewFrameInteractive : null),
          cursor: canInteract ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onPointerDown={canInteract ? handlePointerDown : undefined}
        onPointerMove={canInteract ? handlePointerMove : undefined}
        onPointerUp={canInteract ? endDrag : undefined}
        onPointerCancel={canInteract ? endDrag : undefined}
      >
        {isRendering && <div style={styles.hintText}>Mermaid 渲染中...</div>}
        {!isRendering && renderError && <div style={styles.errorText}>{renderError}</div>}
        {!isRendering && !renderError && svg && (
          <div
            ref={previewContentRef}
            style={styles.svgWrap}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>

      <div style={styles.interactionHint}>
        拖曳可平移，滾輪可縮放（`Shift + 滾輪` 每次 25%）
      </div>

      <details style={styles.details}>
        <summary style={styles.summary}>查看原始碼</summary>
        <pre style={styles.codeBlock}>
          <code>{block.code}</code>
        </pre>
      </details>
    </article>
  );
}

function MermaidPreviewTool() {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem(STORAGE_KEY);
      if (typeof draft === 'string') {
        setInputText(draft);
      }
    } catch (e) {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, inputText);
    } catch (e) {
      // Ignore storage failures.
    }
  }, [inputText]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const parsed = parsePreviewBlocks(inputText);

  const handleLoadSample = () => {
    setError('');
    setCopied(false);
    setInputText(`flowchart TD
  A[開始] --> B{有資料嗎?}
  B -->|有| C[解析 Mermaid]
  B -->|沒有| D[顯示提示]
  C --> E[渲染預覽]
  D --> E
`);
  };

  const handleCopyInput = async () => {
    if (!inputText.trim()) {
      setError('目前沒有可複製的內容');
      return;
    }

    try {
      await navigator.clipboard.writeText(inputText);
      setCopied(true);
      setError('');
    } catch (e) {
      setError('複製失敗，請手動複製');
    }
  };

  const handleClear = () => {
    setInputText('');
    setCopied(false);
    setError('');
  };

  return (
    <div style={styles.container}>
      <p style={styles.subtitle}>
        可直接貼 Mermaid 語法，或貼含 ` ```mermaid ` fenced block 的 Markdown（會自動抓出預覽）
      </p>

      <div style={styles.toolbar}>
        <button type="button" onClick={handleLoadSample} style={{ ...styles.button, ...styles.primaryButton }}>
          載入範例
        </button>
        <button type="button" onClick={handleCopyInput} style={{ ...styles.button, ...styles.secondaryButton }}>
          {copied ? '已複製' : '複製輸入'}
        </button>
        <button type="button" onClick={handleClear} style={{ ...styles.button, ...styles.dangerButton }}>
          清空
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <label htmlFor="mermaid-preview-input" style={styles.label}>
        Mermaid / Markdown 輸入
      </label>
      <textarea
        id="mermaid-preview-input"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={'flowchart TD\n  A --> B\n\n或貼上含 ```mermaid 的 Markdown'}
        style={styles.textarea}
      />

      <div style={styles.metaRow}>
        <span>
          模式：
          {parsed.mode === 'empty' && '等待輸入'}
          {parsed.mode === 'raw' && '直接 Mermaid'}
          {parsed.mode === 'markdown' && 'Markdown 取出 Mermaid 區塊'}
        </span>
        {parsed.mode !== 'empty' && <span>圖表數量：{parsed.blocks.length}</span>}
      </div>

      <section style={styles.previewSection}>
        <div style={styles.previewHeader}>
          <h3 style={styles.previewTitle}>預覽結果</h3>
        </div>

        {parsed.mode === 'empty' && <div style={styles.emptyBox}>貼上 Mermaid 語法後會顯示預覽。</div>}

        {parsed.mode !== 'empty' && parsed.blocks.length === 0 && (
          <div style={styles.emptyBox}>沒有找到可預覽的 Mermaid 內容。</div>
        )}

        {parsed.blocks.length > 0 && (
          <div style={styles.diagramGrid}>
            {parsed.blocks.map((block, index) => (
              <MermaidDiagramCard
                key={`${block.source}-${block.startLine}-${index}-${block.code.slice(0, 20)}`}
                block={block}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    ...ui.toolContainer,
    maxWidth: '980px',
    margin: '0 auto',
    padding: '24px',
  },
  title: {
    ...ui.toolTitle,
    marginBottom: '6px',
  },
  subtitle: {
    margin: '0 0 14px 0',
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: '0.95rem',
    lineHeight: 1.45,
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '10px',
  },
  button: {
    ...ui.buttonBase,
    padding: '10px 14px',
    fontSize: '0.92rem',
  },
  primaryButton: {
    ...ui.buttonPrimary,
  },
  secondaryButton: {
    ...ui.buttonSecondary,
  },
  dangerButton: {
    ...ui.buttonDanger,
  },
  errorBox: {
    marginBottom: '10px',
    padding: '10px 12px',
    borderRadius: theme.radius.md,
    border: `1px solid rgba(220, 38, 38, 0.2)`,
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
    color: theme.colors.danger,
    fontWeight: 600,
  },
  label: {
    display: 'block',
    fontWeight: 700,
    color: theme.colors.text,
    marginBottom: '8px',
  },
  textarea: {
    ...ui.input,
    width: '100%',
    minHeight: '260px',
    boxSizing: 'border-box',
    padding: '12px',
    resize: 'vertical',
    lineHeight: 1.5,
    fontSize: '0.92rem',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    whiteSpace: 'pre',
  },
  metaRow: {
    marginTop: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    color: theme.colors.textMuted,
    fontSize: '0.9rem',
  },
  previewSection: {
    marginTop: '12px',
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: '#fff',
    padding: '12px',
    boxShadow: theme.shadow.soft,
  },
  previewHeader: {
    marginBottom: '8px',
  },
  previewTitle: {
    margin: 0,
    color: theme.colors.text,
    fontSize: '1rem',
  },
  emptyBox: {
    borderRadius: theme.radius.md,
    border: `1px dashed ${theme.colors.borderStrong}`,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textMuted,
    padding: '12px',
    fontSize: '0.9rem',
  },
  diagramGrid: {
    display: 'grid',
    gap: '12px',
  },
  diagramCard: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    padding: '10px',
  },
  diagramHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: theme.colors.text,
    marginBottom: '8px',
  },
  diagramHeaderText: {
    display: 'grid',
    gap: '2px',
    minWidth: 0,
  },
  diagramMeta: {
    color: theme.colors.textMuted,
    fontSize: '0.82rem',
  },
  zoomToolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
  },
  zoomButton: {
    ...ui.buttonBase,
    border: `1px solid ${theme.colors.borderStrong}`,
    backgroundColor: '#fff',
    color: theme.colors.text,
    padding: '4px 8px',
    lineHeight: 1.1,
    minHeight: '30px',
    minWidth: '30px',
    fontSize: '0.85rem',
  },
  zoomButtonGhost: {
    backgroundColor: '#fff',
    color: theme.colors.text,
  },
  zoomButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: '#fff',
    padding: '4px 10px',
  },
  zoomLabel: {
    minWidth: '48px',
    textAlign: 'right',
    color: theme.colors.textMuted,
    fontSize: '0.82rem',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700,
  },
  previewFrame: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    backgroundColor: '#fff',
    minHeight: '96px',
    padding: '8px',
    overflow: 'auto',
    maxHeight: '70vh',
    overscrollBehavior: 'contain',
  },
  previewFrameInteractive: {
    userSelect: 'none',
    touchAction: 'none',
  },
  hintText: {
    color: theme.colors.textMuted,
    fontSize: '0.9rem',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: '0.88rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  svgWrap: {
    width: '100%',
    minWidth: '100%',
  },
  interactionHint: {
    marginTop: '6px',
    color: theme.colors.textMuted,
    fontSize: '0.78rem',
  },
  details: {
    marginTop: '8px',
  },
  summary: {
    cursor: 'pointer',
    color: theme.colors.primary,
    fontWeight: 600,
    fontSize: '0.88rem',
  },
  codeBlock: {
    margin: '8px 0 0 0',
    padding: '10px',
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: '#fff',
    color: theme.colors.text,
    fontSize: '0.82rem',
    lineHeight: 1.45,
    overflowX: 'auto',
  },
};

export default MermaidPreviewTool;
