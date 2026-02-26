// src/components/CpValueCalculator.js
import React, { useState, useEffect, useRef } from "react";
import { theme, ui } from "../styles/theme";

const CP_VALUE_CALCULATOR_DRAFT_KEY = "cp-value-calculator-draft-v1";

const createEmptyItem = (id) => ({
  id,
  units: [{ value: "" }],
  price: "",
  note: "",
  unitPrice: null,
});

const normalizeImportedItems = (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("匯入檔案格式錯誤，找不到商品資料");
  }

  return rawItems.map((item, index) => {
    const units =
      Array.isArray(item?.units) && item.units.length > 0
        ? item.units.map((unit) => ({
            value:
              unit?.value === undefined || unit?.value === null
                ? ""
                : String(unit.value),
          }))
        : [{ value: "" }];

    return {
      id: index + 1,
      units,
      price:
        item?.price === undefined || item?.price === null
          ? ""
          : String(item.price),
      note:
        item?.note === undefined || item?.note === null
          ? ""
          : String(item.note),
      unitPrice:
        typeof item?.unitPrice === "number" && Number.isFinite(item.unitPrice)
          ? item.unitPrice
          : null,
    };
  });
};

const loadDraftState = () => {
  try {
    const raw = window.localStorage.getItem(CP_VALUE_CALCULATOR_DRAFT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const rawItems = Array.isArray(parsed) ? parsed : parsed?.items;
    const items = normalizeImportedItems(rawItems);
    const maxId = items.reduce((max, item) => Math.max(max, item.id), 0);
    const nextId =
      Number.isInteger(parsed?.nextId) && parsed.nextId > maxId
        ? parsed.nextId
        : maxId + 1;

    return { items, nextId };
  } catch (error) {
    console.error("讀取草稿失敗:", error);
    return null;
  }
};

function CpValueCalculator({ showPage }) {
  const initialDraftRef = useRef(null);
  if (initialDraftRef.current === null) {
    initialDraftRef.current = loadDraftState();
  }
  const hasDraftOnLoadRef = useRef(Boolean(initialDraftRef.current));
  const [items, setItems] = useState(
    () => initialDraftRef.current?.items ?? [createEmptyItem(1)]
  );
  const [nextId, setNextId] = useState(
    () => initialDraftRef.current?.nextId ?? 2
  ); // 用來追踪下一個商品的ID
  const [highlightedItems, setHighlightedItems] = useState([]);
  const [errors, setErrors] = useState({});
  const importFileInputRef = useRef(null);
  const initialAutoAddCheckedRef = useRef(false);

  useEffect(() => {
    if (initialAutoAddCheckedRef.current) {
      return;
    }

    initialAutoAddCheckedRef.current = true;
    if (!hasDraftOnLoadRef.current && items.length === 1) {
      // 確保只在初次載入時添加
      addItem();
    }
  }, [addItem, items.length]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CP_VALUE_CALCULATOR_DRAFT_KEY,
        JSON.stringify({
          version: 1,
          savedAt: new Date().toISOString(),
          nextId,
          items,
        })
      );
    } catch (error) {
      console.error("儲存草稿失敗:", error);
    }
  }, [items, nextId]);

  function addItem() {
    setItems([
      ...items,
      {
        id: nextId,
        units: [{ value: "" }],
        price: "",
        note: "",
        unitPrice: null,
      },
    ]);
    setNextId(nextId + 1); // 更新下一個ID
  }

  const handleInputChange = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setHighlightedItems([]); // 清除高亮显示
  };

  const handleUnitChange = (id, index, value) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              units: item.units.map((unit, unitIndex) =>
                unitIndex === index ? { ...unit, value } : unit
              ),
            }
          : item
      )
    );
    setHighlightedItems([]);
  };

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
    setHighlightedItems(
      highlightedItems.filter((highlightId) => highlightId !== id)
    );
    const newErrors = { ...errors };
    delete newErrors[id];
    setErrors(newErrors);
  };

  const addUnit = (id) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, units: [...item.units, { value: "" }] }
          : item
      )
    );
  };

  const removeUnit = (id, index) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              units: item.units.filter((_, unitIndex) => unitIndex !== index),
            }
          : item
      )
    );
  };

  const validateItems = () => {
    const newErrors = {};
    let isValid = true;

    items.forEach((item) => {
      const itemErrors = {};
      if (
        item.price === "" ||
        isNaN(parseFloat(item.price)) ||
        parseFloat(item.price) <= 0
      ) {
        itemErrors.price = "請輸入有效的價格";
        isValid = false;
      }
      item.units.forEach((unit, index) => {
        if (
          unit.value === "" ||
          isNaN(parseFloat(unit.value)) ||
          parseFloat(unit.value) <= 0
        ) {
          unit.value = 1
          // itemErrors[`unit${index + 1}`] = `請輸入有效的單位${index + 1}`;
          // isValid = false;
        }
      });
      if (Object.keys(itemErrors).length > 0) {
        newErrors[item.id] = itemErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const calculateBestValue = () => {
    if (!validateItems()) {
      return;
    }

    let lowestUnitPrice = Infinity;
    let highlightedItemsTemp = [];

    const updatedItems = items.map((item) => {
      // 計算 volumeNum，處理空值或0值
      let volumeNum = item.units.reduce((acc, unit) => {
        const unitValue = parseFloat(unit.value);
        return acc * (isNaN(unitValue) || unitValue === 0 ? 1 : unitValue);
      }, 1);

      const priceNum = parseFloat(item.price);
      let unitPrice = null;

      if (!isNaN(priceNum) && volumeNum > 0) {
        unitPrice = priceNum / volumeNum;

        if (unitPrice < lowestUnitPrice) {
          lowestUnitPrice = unitPrice;
          highlightedItemsTemp = [item.id];
        } else if (unitPrice === lowestUnitPrice) {
          highlightedItemsTemp.push(item.id);
        }
      }

      return { ...item, unitPrice };
    });

    setItems(updatedItems);
    setHighlightedItems(highlightedItemsTemp);

    console.log("highlightedItemsTemp:", highlightedItemsTemp); // 檢查計算結果
  };

  const exportToJSON = () => {
    const hasExportableData = items.some((item) => {
      const hasNote = item.note.trim() !== "";
      const hasPrice = String(item.price).trim() !== "";
      const hasUnitValue = item.units.some(
        (unit) => String(unit?.value ?? "").trim() !== ""
      );
      return hasNote || hasPrice || hasUnitValue;
    });

    if (!hasExportableData) {
      window.alert("目前沒有可匯出的資料。");
      return;
    }

    const timestamp = new Date().toISOString();
    const fileTimestamp = timestamp.replace(/[:.]/g, "-");

    const exportPayload = {
      version: 1,
      timestamp,
      exportedAt: timestamp,
      items,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cp-value-calculator-data-${fileTimestamp}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importFromJSON = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rawItems = Array.isArray(parsed) ? parsed : parsed?.items;
      const importedItems = normalizeImportedItems(rawItems);

      setItems(importedItems);
      setNextId(importedItems.length + 1);
      setHighlightedItems([]);
      setErrors({});
    } catch (error) {
      console.error("匯入失敗:", error);
      window.alert("匯入失敗，請確認檔案為有效的 JSON 匯出檔。");
    } finally {
      event.target.value = "";
    }
  };

  const clearAllItems = () => {
    setItems([createEmptyItem(1), createEmptyItem(2)]);
    setNextId(3); // 重置ID計數器
    setHighlightedItems([]); // 清除高亮顯示
    setErrors({}); // 清除錯誤訊息
  };

  return (
    <div id="cp-value-calculator" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerSummary}>
          <div style={styles.headerSummaryTitle}>商品清單</div>
          <div style={styles.headerSummaryText}>
            共 {items.length} 項，輸入價格與單位後即可比較每單位成本
          </div>
        </div>
        <div style={styles.headerActions}>
          <input
            ref={importFileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={importFromJSON}
            style={styles.hiddenFileInput}
          />
          <button
            style={styles.importButton}
            onClick={() => importFileInputRef.current?.click()}
          >
            匯入
          </button>
          <button style={styles.exportButton} onClick={exportToJSON}>
            匯出
          </button>
          <button style={styles.clearButton} onClick={clearAllItems}>
            清除
          </button>
        </div>
      </div>
      <div style={styles.itemsList}>
        {items.map((item, index) => {
          const isBest = highlightedItems.includes(item.id);

          return (
            <div
              key={item.id}
              style={{
                ...styles.item,
                ...(isBest ? styles.itemBest : null),
              }}
            >
              <div style={styles.itemTopRow}>
                <div style={styles.itemMeta}>
                  <span style={styles.itemLabel}>商品 {index + 1}</span>
                  {isBest && <span style={styles.bestBadge}>最佳 CP</span>}
                </div>
                <button
                  style={styles.deleteItemButton}
                  onClick={() => deleteItem(item.id)}
                >
                  刪除
                </button>
              </div>

              <div style={styles.noteRow}>
                <label style={styles.fieldLabel} htmlFor={`cp-note-${item.id}`}>
                  備註
                </label>
                <input
                  id={`cp-note-${item.id}`}
                  type="text"
                  placeholder="例如：大包裝 / 特價款"
                  value={item.note}
                  onChange={(e) =>
                    handleInputChange(item.id, "note", e.target.value)
                  }
                  style={styles.noteInput}
                />
              </div>

              <div style={styles.editorGrid}>
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <span style={styles.panelTitle}>價格</span>
                  </div>
                  <input
                    type="number"
                    placeholder="輸入價格"
                    value={item.price}
                    onChange={(e) =>
                      handleInputChange(item.id, "price", e.target.value)
                    }
                    style={styles.input}
                  />
                  {errors[item.id]?.price && (
                    <div style={styles.error}>{errors[item.id].price}</div>
                  )}
                </div>

                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <span style={styles.panelTitle}>單位（相乘）</span>
                    <button
                      style={styles.addUnitButton}
                      onClick={() => addUnit(item.id)}
                    >
                      + 添加單位
                    </button>
                  </div>

                  <div style={styles.unitList}>
                    {item.units.map((unit, unitIndex) => (
                      <div style={styles.unitRow} key={unitIndex}>
                        <span style={styles.unitIndex}>#{unitIndex + 1}</span>
                        <input
                          type="number"
                          placeholder={`單位 ${unitIndex + 1}`}
                          value={unit.value}
                          onChange={(e) =>
                            handleUnitChange(item.id, unitIndex, e.target.value)
                          }
                          style={styles.input}
                        />
                        {unitIndex > 0 && (
                          <button
                            style={styles.removeUnitButton}
                            onClick={() => removeUnit(item.id, unitIndex)}
                          >
                            移除
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...styles.calculation,
                  ...(isBest ? styles.calculationBest : null),
                }}
              >
                {item.unitPrice !== null
                  ? `單位價格：${item.unitPrice.toFixed(2)} 元 / 單位`
                  : "尚未計算單位價格"}
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.footerActions}>
        <button style={styles.addButton} onClick={addItem}>
          + 添加商品項目
        </button>
        <button style={styles.calcButton} onClick={calculateBestValue}>
          計算最佳 CP值
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    ...ui.toolContainer,
    display: "grid",
    gap: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    padding: "12px",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.border}`,
  },
  headerSummary: {
    minWidth: "220px",
    flex: "1 1 280px",
  },
  headerSummaryTitle: {
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: "2px",
  },
  headerSummaryText: {
    color: theme.colors.textMuted,
    fontSize: "0.9rem",
    lineHeight: 1.35,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  hiddenFileInput: {
    display: "none",
  },
  item: {
    padding: "14px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.borderStrong}`,
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.soft,
  },
  itemBest: {
    borderColor: theme.colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.10)",
    boxShadow: "0 6px 16px rgba(22, 163, 74, 0.12)",
  },
  itemsList: {
    display: "grid",
    gap: "12px",
  },
  itemTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
  },
  itemMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  itemLabel: {
    fontWeight: "700",
    color: theme.colors.primary,
    padding: "4px 8px",
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(37,99,235,0.08)",
    border: "1px solid rgba(37,99,235,0.15)",
    fontSize: "0.9rem",
  },
  bestBadge: {
    fontWeight: "700",
    color: theme.colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.14)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    borderRadius: theme.radius.pill,
    padding: "4px 8px",
    fontSize: "0.8rem",
  },
  noteRow: {
    display: "grid",
    gridTemplateColumns: "72px minmax(0, 1fr)",
    alignItems: "center",
    gap: "8px",
    marginTop: "10px",
    marginBottom: "12px",
  },
  fieldLabel: {
    color: theme.colors.textMuted,
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  noteInput: {
    ...ui.input,
    width: "100%",
    padding: "10px 12px",
    borderRadius: theme.radius.sm,
    boxSizing: "border-box",
    textAlign: "left",
  },
  editorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
    alignItems: "start",
  },
  panel: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    padding: "12px",
    minWidth: 0,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  panelTitle: {
    fontWeight: "700",
    color: theme.colors.text,
  },
  input: {
    ...ui.input,
    width: "100%",
    padding: "10px 12px",
    borderRadius: theme.radius.sm,
    boxSizing: "border-box",
  },
  unitList: {
    display: "grid",
    gap: "8px",
  },
  unitRow: {
    display: "grid",
    gridTemplateColumns: "46px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: "8px",
  },
  unitIndex: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    height: "34px",
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.borderStrong}`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textMuted,
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  error: {
    color: theme.colors.danger,
    fontSize: "0.8rem",
    marginTop: "6px",
  },
  deleteItemButton: {
    ...ui.buttonBase,
    ...ui.buttonDanger,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  removeUnitButton: {
    ...ui.buttonBase,
    ...ui.buttonDanger,
    padding: "8px 10px",
    borderRadius: theme.radius.sm,
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  calculation: {
    marginTop: "12px",
    borderRadius: theme.radius.sm,
    padding: "10px 12px",
    fontSize: "0.95rem",
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.border}`,
    fontWeight: "600",
  },
  calculationBest: {
    color: theme.colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
  },
  addButton: {
    ...ui.buttonBase,
    ...ui.buttonSecondary,
    padding: "10px 14px",
    borderRadius: theme.radius.sm,
    fontSize: "0.95rem",
    flexShrink: 0,
  },
  addUnitButton: {
    ...ui.buttonBase,
    ...ui.buttonSuccess,
    padding: "8px 10px",
    borderRadius: theme.radius.sm,
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  calcButton: {
    ...ui.buttonBase,
    ...ui.buttonPrimary,
    padding: "10px 18px",
    borderRadius: theme.radius.sm,
    fontSize: "0.95rem",
    flex: "1 1 220px",
    minWidth: "200px",
  },
  clearButton: {
    ...ui.buttonBase,
    ...ui.buttonDanger,
    padding: "10px 12px",
    borderRadius: theme.radius.sm,
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  exportButton: {
    ...ui.buttonBase,
    ...ui.buttonPrimary,
    padding: "10px 12px",
    borderRadius: theme.radius.sm,
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  importButton: {
    ...ui.buttonBase,
    ...ui.buttonSecondary,
    padding: "10px 12px",
    borderRadius: theme.radius.sm,
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  footerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    paddingTop: "4px",
  },
};

export default CpValueCalculator;
