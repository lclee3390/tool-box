import React, { useState, useEffect, useCallback, useRef } from 'react';
import NoSleep from 'nosleep.js';
import { theme, ui } from '../styles/theme';

const SYNC_SAMPLES = 5; // 採樣次數
const AUTO_SYNC_INTERVAL = 30 * 60 * 1000; // 30分鐘自動同步一次
const TAIPEI_UTC_OFFSET_HOURS = 8;

// 添加 debug 模式控制
const DEBUG_MODE = false;  // 設置為 false 來預設關閉 debug 訊息

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [serverTime, setServerTime] = useState(null);
  const [wakeLock, setWakeLock] = useState(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [wakeLockError, setWakeLockError] = useState(null);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [debugMessages, setDebugMessages] = useState([]);
  const [noSleep] = useState(() => new NoSleep());  // 創建 NoSleep 實例
  const wakeLockRef = useRef(null);
  const wakeLockIntentRef = useRef(false);

  useEffect(() => {
    wakeLockRef.current = wakeLock;
  }, [wakeLock]);

  // 修改 addDebugMessage 函數，只在 DEBUG_MODE 開啟時添加訊息
  const addDebugMessage = useCallback((message, error = null) => {
    if (!DEBUG_MODE) return;  // 如果 debug 模式關閉，直接返回
    
    const timestamp = new Date().toLocaleTimeString();
    const debugMessage = `[${timestamp}] ${message}${error ? '\nError: ' + error.toString() : ''}`;
    setDebugMessages(prev => [...prev.slice(-4), debugMessage]);
  }, []);

  // 檢測設備支援
  const checkDeviceSupport = useCallback(() => {
    if ('wakeLock' in navigator) {
      return { type: 'wakeLock' };
    }
    return { type: 'ios' };  // 使用 NoSleep 作為備選方案
  }, []);

  // 新增 iOS 的替代方案
  const enableIOSWakeLock = useCallback(() => {
    try {
      // 啟用 NoSleep
      noSleep.enable();
      addDebugMessage('NoSleep 已啟動');

      return {
        cleanup: () => {
          noSleep.disable();
          addDebugMessage('NoSleep 已停止');
        }
      };
    } catch (err) {
      addDebugMessage('NoSleep 啟動失敗', err);
      throw err;
    }
  }, [noSleep, addDebugMessage]);

  // 啟用螢幕常亮
  const enableWakeLock = useCallback(async () => {
    const support = checkDeviceSupport();
    setWakeLockError(null);
    addDebugMessage('嘗試啟用螢幕常亮');

    try {
      if (support.type === 'wakeLock' && !window.isSecureContext) {
        throw new Error('Wake Lock API 需要 HTTPS 安全環境');
      }

      const currentWakeLock = wakeLockRef.current;
      if (currentWakeLock?.type === 'wakeLock' && !currentWakeLock.lock?.released) {
        addDebugMessage('Wake Lock 已啟用，略過重複請求');
        return;
      }

      if (support.type === 'ios') {
        addDebugMessage('使用 NoSleep 方案');
        const wakeLockMethods = await enableIOSWakeLock();
        setWakeLock({ type: 'ios', ...wakeLockMethods });
        addDebugMessage('NoSleep 啟動成功');
      } else if (support.type === 'wakeLock') {
        addDebugMessage('使用 Wake Lock API');
        const lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => {
          addDebugMessage('Wake Lock 被系統釋放');
          setWakeLock((prev) => {
            if (prev?.type === 'wakeLock' && prev.lock === lock) {
              return null;
            }
            return prev;
          });
        });
        setWakeLock({ type: 'wakeLock', lock });
        addDebugMessage('Wake Lock API 啟用成功');
      }
    } catch (err) {
      addDebugMessage('啟用螢幕常亮失敗', err);
      setWakeLockError('無法啟用螢幕常亮（請確認 HTTPS、前景頁面，並嘗試再次點擊）');
    }
  }, [checkDeviceSupport, enableIOSWakeLock, addDebugMessage]);

  // 禁用螢幕常亮
  const disableWakeLock = useCallback(async () => {
    try {
      addDebugMessage('嘗試關閉螢幕常亮');
      if (wakeLock?.type === 'ios') {
        wakeLock.cleanup();
        addDebugMessage('NoSleep 已停止');
      } else if (wakeLock?.type === 'wakeLock') {
        await wakeLock.lock.release();
        addDebugMessage('Wake Lock API 已釋放');
      }
      setWakeLock(null);
      setWakeLockError(null);
    } catch (err) {
      addDebugMessage('關閉螢幕常亮時發生錯誤', err);
    }
  }, [wakeLock]);

  // 處理頁面可見性變化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || !wakeLockIntentRef.current) {
        return;
      }

      const currentWakeLock = wakeLockRef.current;
      if (!currentWakeLock) {
        enableWakeLock();
        return;
      }

      if (currentWakeLock.type === 'ios') {
        // NoSleep 在 iPhone Safari 切到背景後可能需要再次嘗試啟用
        enableWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableWakeLock]);

  const toggleWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      wakeLockIntentRef.current = false;
      await disableWakeLock();
      return;
    }

    wakeLockIntentRef.current = true;
    await enableWakeLock();
  }, [enableWakeLock, disableWakeLock]);

  // 渲染螢幕常亮控制部分
  const renderWakeLockControl = () => (
    <div style={styles.wakeLockContainer}>
      <div style={styles.wakeLockStatus}>
        <div style={styles.wakeLockStatusText}>
          螢幕常亮：<span style={{ color: wakeLock ? '#2ecc71' : '#e74c3c' }}>
            {wakeLock ? '開啟' : '關閉'}
          </span>
        </div>
        {wakeLockError && (
          <div style={styles.wakeLockError}>
            {wakeLockError}
          </div>
        )}
      </div>
      <button
        onClick={toggleWakeLock}
        style={{
          ...styles.button,
          ...styles.wakeLockButton,
          backgroundColor: wakeLock ? '#e74c3c' : '#2ecc71'
        }}
      >
        {wakeLock ? '關閉螢幕常亮' : '開啟螢幕常亮'}
      </button>
      
      {/* Debug 區域只在 DEBUG_MODE 為 true 時顯示 */}
      {DEBUG_MODE && debugMessages.length > 0 && (
        <div style={styles.debugContainer}>
          <div style={styles.debugTitle}>Debug 訊息:</div>
          {debugMessages.map((message, index) => (
            <div key={index} style={styles.debugMessage}>
              {message}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 格式化時間的函數
  const formatTime = useCallback((date) => {
    if (!date) return '載入中...';
    
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }, []);

  // 更新設備時間
  const updateDeviceTime = useCallback(() => {
    setCurrentTime(new Date());
  }, []);

  // 更新網路時間
  const updateNetworkTime = useCallback(() => {
    if (initialSyncDone && serverTimeOffset !== null) {
      // 使用本地計時更新網路時間顯示
      const now = Date.now();
      setServerTime(new Date(now + serverTimeOffset));
    }
  }, [serverTimeOffset, initialSyncDone]);

  // 獲取伺服器時間
  const fetchServerTime = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setError(null);
    
    try {
      // 進行多次採樣
      const samples = [];
      for (let i = 0; i < SYNC_SAMPLES; i++) {
        const sample = await fetchTimeSample();
        samples.push(sample);
        
        // 在採樣之間稍作延遲，避免請求過於密集
        if (i < SYNC_SAMPLES - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // 排序並去除異常值
      samples.sort((a, b) => a.offset - b.offset);
      const validSamples = samples.slice(1, -1); // 去除最高和最低值
      
      // 計算平均偏移
      const avgOffset = validSamples.reduce((sum, sample) => sum + sample.offset, 0) / validSamples.length;
      
      setServerTimeOffset(avgOffset);
      setServerTime(new Date(Date.now() + avgOffset));
      setInitialSyncDone(true);
      
      console.log('Time synced:', {
        samples: samples,
        finalOffset: avgOffset,
        currentTime: new Date(),
        adjustedTime: new Date(Date.now() + avgOffset)
      });
      
    } catch (error) {
      console.error('同步時間失敗:', error);
      setError('無法從網路同步時間，請檢查網路連線');
      setServerTime(new Date());
      setServerTimeOffset(0);
      setInitialSyncDone(true);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 500);
    }
  }, [isSyncing]);

  // 添加新的採樣函數
  const fetchTimeSample = async () => {
    const t0 = performance.now();
    const requestStartTime = Date.now();
    
    const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Taipei');
    if (!response.ok) {
      throw new Error(`時間 API 回應失敗: ${response.status}`);
    }
    const data = await response.json();
    
    const t1 = performance.now();
    const requestEndTime = Date.now();
    
    const networkLatency = (t1 - t0) / 2;
    // timeapi.io 的 dateTime 不含時區資訊，直接 new Date() 會依使用者本地時區解析，導致偏差。
    // 這裡改用 API 回傳欄位組出 Asia/Taipei 的實際 UTC 時間。
    const serverUtcTime = Date.UTC(
      data.year,
      data.month - 1,
      data.day,
      data.hour - TAIPEI_UTC_OFFSET_HOURS,
      data.minute,
      data.seconds,
      data.milliSeconds || 0
    );
    const serverDateTime = new Date(serverUtcTime);
    const offset = serverDateTime.getTime() - (requestEndTime - networkLatency);
    
    return {
      offset,
      latency: networkLatency,
      serverTime: serverDateTime,
      localTime: new Date(requestEndTime)
    };
  };

  // 設備時間更新效果
  useEffect(() => {
    const deviceTimeInterval = setInterval(updateDeviceTime, 1000);
    return () => clearInterval(deviceTimeInterval);
  }, [updateDeviceTime]);

  // 網路時間更新效果
  useEffect(() => {
    let isActive = true;

    // 初始化時獲取伺服器時間
    if (!initialSyncDone) {
      fetchServerTime();
    }

    // 定期同步時間
    const syncInterval = setInterval(() => {
      if (isActive) {
        fetchServerTime();
      }
    }, AUTO_SYNC_INTERVAL);

    // 以秒級更新顯示即可，避免 requestAnimationFrame 持續重繪造成效能浪費
    const networkTimeInterval = setInterval(() => {
      if (isActive) {
        updateNetworkTime();
      }
    }, 1000);

    return () => {
      isActive = false;
      clearInterval(syncInterval);
      clearInterval(networkTimeInterval);
    };
  }, [fetchServerTime, updateNetworkTime, initialSyncDone]);

  // 清理函數
  useEffect(() => {
    return () => {
      if (wakeLock) {
        disableWakeLock();
      }
    };
  }, [wakeLock, disableWakeLock]);

  return (
    <div style={styles.container}>
      <div style={styles.clockContainer}>
        <div style={styles.timeSection}>
          <div style={styles.timeLabel}>設備時間</div>
          <div style={styles.time}>{formatTime(currentTime)}</div>
        </div>
        
        <div style={styles.timeSection}>
          <div style={styles.timeLabel}>網路時間</div>
          <div style={styles.time}>
            {formatTime(serverTime)}
          </div>
          {error && <div style={styles.warning}>{error}</div>}
          <button
            onClick={fetchServerTime}
            style={{
              ...styles.button,
              ...styles.syncButton,
              ...(isSyncing ? styles.disabledButton : {})
            }}
            disabled={isSyncing}
          >
            {isSyncing ? '同步中...' : '手動同步'}
          </button>
        </div>

        {renderWakeLockControl()}
      </div>
    </div>
  );
};

const styles = {
  container: {
    ...ui.toolContainer,
    maxWidth: "800px",
  },
  title: {
    ...ui.toolTitle,
    marginBottom: "20px",
  },
  clockContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  timeSection: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  timeLabel: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '5px',
  },
  time: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'monospace',
  },
  wakeLockContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    marginTop: '20px',
    padding: '15px',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
  },
  wakeLockStatus: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  button: {
    ...ui.buttonBase,
    padding: "10px 20px",
    ...ui.buttonSuccess,
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  syncButton: {
    backgroundColor: '#3498db',
    marginTop: '10px',
    fontSize: '12px',
    padding: '8px 16px',
    ':disabled': {
      backgroundColor: '#95a5a6',
      cursor: 'not-allowed',
    },
  },
  error: {
    color: '#e74c3c',
    fontSize: '14px',
    marginTop: '5px',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  warning: {
    color: '#f39c12',  // 使用警告色而不是錯誤色
    fontSize: '14px',
    marginTop: '5px',
  },
  wakeLockError: {
    fontSize: '14px',
    color: '#e74c3c',
    marginTop: '8px',
    textAlign: 'center',
    padding: '4px 8px',
    backgroundColor: '#fde8e8',
    borderRadius: '4px',
  },
  wakeLockButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '200px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
  },
  wakeLockStatusText: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '5px',
  },
  debugContainer: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.border}`,
    width: '100%',
    maxWidth: '500px',
  },
  debugTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    marginBottom: '5px',
  },
  debugMessage: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#333',
    padding: '4px',
    borderBottom: '1px solid #eee',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  wakeLockDescription: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
    textAlign: 'center',
  },
};

export default Clock; 
