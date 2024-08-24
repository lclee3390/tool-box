// src/components/CpValueCalculator.js
import React, { useState, useEffect } from "react";

function CpValueCalculator({ showPage }) {
  const [items, setItems] = useState([
    { id: 1, volume: "", price: "", note: "", unitPrice: null },
  ]);
  const [nextId, setNextId] = useState(2); // 用來追踪下一個商品的ID
  const [highlightedItems, setHighlightedItems] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // 在網頁載入後自動加入兩個項目
    addItem();
  }, []);
  const addItem = () => {
    setItems([
      ...items,
      { id: nextId, volume: "", price: "", note: "", unitPrice: null },
    ]);
    setNextId(nextId + 1); // 更新下一個ID
  };

  const handleInputChange = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setHighlightedItems([]); // 清除高亮显示
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
      if (
        item.volume === "" ||
        isNaN(parseFloat(item.volume)) ||
        parseFloat(item.volume) <= 0
      ) {
        itemErrors.volume = "請輸入有效的容量";
        isValid = false;
      }
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
      const volumeNum = parseFloat(item.volume);
      const priceNum = parseFloat(item.price);
      let unitPrice = null;

      if (!isNaN(volumeNum) && !isNaN(priceNum) && volumeNum > 0) {
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
  };
  const exportToCSV = () => {
    const csvRows = [
      ["ID", "備註", "價格", "容量", "單位價格"],
      ...items.map((item) => [
        item.id,
        item.note,
        item.price,
        item.volume,
        item.unitPrice !== null ? item.unitPrice.toFixed(2) : "",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cp_value_calculator.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const clearAllItems = () => {
    setItems([{ id: 1, volume: "", price: "", note: "", unitPrice: null }]);
    setNextId(2); // 重置ID計數器
    setHighlightedItems([]); // 清除高亮顯示
    setErrors({}); // 清除錯誤訊息
  };
  return (
    <div id="cp-value-calculator" style={styles.container}>
      <div style={styles.header}>
        <button style={styles.addButton} onClick={addItem}>
          + 添加
        </button>
        
        <h2 style={styles.title}></h2>
        
        <button style={styles.exportButton} onClick={exportToCSV}>
            匯出
        </button>
        <button style={styles.clearButton} onClick={clearAllItems}>
            清除
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            ...styles.item,
            borderColor: highlightedItems.includes(item.id)
              ? "#4CAF50"
              : "#ccc",
            backgroundColor: highlightedItems.includes(item.id)
              ? "#eaffea"
              : "#fff",
          }}
        >
          <div style={styles.fieldsName}>
            <span style={styles.itemLabel}>No.{index + 1}</span>
            <input
              type="text"
              placeholder="備註"
              value={item.note}
              onChange={(e) =>
                handleInputChange(item.id, "note", e.target.value)
              }
              style={styles.noteInput}
            />
            <button
              style={styles.deleteButton}
              onClick={() => deleteItem(item.id)}
            >
              刪除
            </button>
           

            
          </div>
          <div style={styles.fields}>
            <div style={styles.inputGroup}>
              <span style={styles.inputLabel}>價格</span>
              {errors[item.id]?.price && (
                <div style={styles.error}>{errors[item.id].price}</div>
              )}
              <input
                type="number"
                placeholder="價格"
                value={item.price}
                onChange={(e) =>
                  handleInputChange(item.id, "price", e.target.value)
                }
                style={styles.input}
              />
              
            </div>
            <div style={styles.inputGroup}>
              <span style={styles.inputLabel}>單位</span>
              {errors[item.id]?.volume && (
                <div style={styles.error}>{errors[item.id].volume}</div>
              )}
              <input
                type="number"
                placeholder="容量"
                value={item.volume}
                onChange={(e) =>
                  handleInputChange(item.id, "volume", e.target.value)
                }
                style={styles.input}
              />
            </div>
          </div>
          {item.unitPrice !== null && (
            <div style={styles.calculation}>
              單位價格: {item.unitPrice.toFixed(2)} 元/單位
            </div>
          )}
        </div>
      ))}
      <button style={styles.calcButton} onClick={calculateBestValue}>
        計算最佳 CP值
      </button>
      <p>
        <a style={styles.backLink} onClick={() => showPage("home")}>
          回到首頁
        </a>
      </p>
    </div>
  );
}
const styles = {
    container: {
      padding: "20px",
      maxWidth: "100%",
      margin: "0 auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
      },
    title: {
      textAlign: "center",
      margin: "10px 0",
      color: "#333",
      flexGrow: 1,
    },
    item: {
      marginBottom: "15px",
      padding: "15px",
      borderRadius: "8px",
      border: "2px solid #ccc",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    fields: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "5px",
      gap: "3px",
      flexWrap: "wrap",
    },
    fieldsName: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // 保持刪除按鈕在最右側
        marginBottom: "5px",
        gap: "3px",
        flexWrap: "nowrap", // 防止換行
      },
    itemLabel: {
      fontWeight: "bold",
      color: "#4CAF50",
    //   marginRight: "10px",
    },
    noteInput: {
        flex: "1 1 auto",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        boxSizing: "border-box",
        textAlign: "left", // 確保文字靠左對齊
      },
    inputGroup: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      flex: "1 1 100%",
      flexDirection: "row",
      position: "relative",
      flexWrap: "wrap",
    },
    inputLabel: {
      flexShrink: 0,
      color: "#555",
    },
    input: {
      flex: "1 1 100%", // 在小螢幕上讓 input 填滿可用空間
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      boxSizing: "border-box",
    },
    error: {
      color: "#ff0000",
      fontSize: "0.8em",
    },
    deleteButton: {
        backgroundColor: "#FF5722",
        color: "white",
        padding: "8px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        flexShrink: 0,
        marginLeft: "10px", // 給刪除按鈕增加一點間距
      },
    calculation: {
      marginTop: "10px",
      fontSize: "1em",
      color: "#333",
      textAlign: "right",
      fontWeight: "bold",
    },
    addButton: {
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "1em",
      flexShrink: 0,
      marginBottom: "10px",
    },
    calcButton: {
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "1em",
      width: "100%",
      marginBottom: "20px",
    },
    backLink: {
      textDecoration: "none",
      color: "#4CAF50",
      fontWeight: "bold",
      textAlign: "center",
      display: "block",
      marginTop: "20px",
    },
    "@media (max-width: 768px)": {
      inputGroup: {
        flexDirection: "column", // 垂直排列
      },
      fields: {
        flexDirection: "column", // 垂直排列
      },
      input: {
        width: "100%", // 確保在小螢幕上 input 填滿容器
      },
      noteInput: {
        width: "100%", // 確保在小螢幕上 note input 填滿容器
      },
    },
    clearButton: {
        backgroundColor: "#F44336",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "1em",
        flexShrink: 0,
        marginLeft: "auto", // 將按鈕移到最右側
      },
      exportButton: {
        backgroundColor: "#2196F3",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "1em",
        flexShrink: 0,
        marginRight: "5px",
        marginLeft: "auto", // 將按鈕移到最右側

      },
  };
  
  export default CpValueCalculator;
  