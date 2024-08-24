// src/components/CpValueCalculator.js
import React, { useState } from 'react';

function CpValueCalculator({ showPage }) {
  const [items, setItems] = useState([{ id: 1, volume: '', price: '', note: '', unitPrice: null }]);
  const [nextId, setNextId] = useState(2); // 用來追踪下一個商品的ID
  const [highlightedItems, setHighlightedItems] = useState([]);
  const [errors, setErrors] = useState({});

  const addItem = () => {
    setItems([...items, { id: nextId, volume: '', price: '', note: '', unitPrice: null }]);
    setNextId(nextId + 1); // 更新下一個ID
  };

  const handleInputChange = (id, field, value) => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    setHighlightedItems([]);  // 清除高亮显示
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setHighlightedItems(highlightedItems.filter(highlightId => highlightId !== id));
    const newErrors = { ...errors };
    delete newErrors[id];
    setErrors(newErrors);
  };

  const validateItems = () => {
    const newErrors = {};
    let isValid = true;

    items.forEach(item => {
      const itemErrors = {};
      if (item.price === '' || isNaN(parseFloat(item.price)) || parseFloat(item.price) <= 0) {
        itemErrors.price = '請輸入有效的價格';
        isValid = false;
      }
      if (item.volume === '' || isNaN(parseFloat(item.volume)) || parseFloat(item.volume) <= 0) {
        itemErrors.volume = '請輸入有效的容量';
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

    const updatedItems = items.map(item => {
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

  return (
    <div id="cp-value-calculator" style={styles.container}>
      <div style={styles.header}>
        <button style={styles.addButton} onClick={addItem}>
          + 添加
        </button>
        <h2 style={styles.title}>CP值計算機</h2>
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            ...styles.item,
            borderColor: highlightedItems.includes(item.id) ? '#4CAF50' : '#ccc',
            backgroundColor: highlightedItems.includes(item.id) ? '#eaffea' : '#fff',
          }}
        >
          <div style={styles.fields}>
            <span style={styles.itemLabel}>商品 {index + 1}</span>
            <input
              type="text"
              placeholder="備註"
              value={item.note}
              onChange={(e) => handleInputChange(item.id, 'note', e.target.value)}
              style={styles.noteInput}
            />
          </div>
          <div style={styles.fields}>
            <div style={styles.inputGroup}>
              <span style={styles.inputLabel}>價格</span>
              <input
                type="number"
                placeholder="價格"
                value={item.price}
                onChange={(e) => handleInputChange(item.id, 'price', e.target.value)}
                style={styles.input}
              />
              {errors[item.id]?.price && <div style={styles.error}>{errors[item.id].price}</div>}
            </div>
            <div style={styles.inputGroup}>
              <span style={styles.inputLabel}>單位</span>
              <input
                type="number"
                placeholder="容量"
                value={item.volume}
                onChange={(e) => handleInputChange(item.id, 'volume', e.target.value)}
                style={styles.input}
              />
              {errors[item.id]?.volume && <div style={styles.error}>{errors[item.id].volume}</div>}
            </div>
            <button style={styles.deleteButton} onClick={() => deleteItem(item.id)}>
              刪除
            </button>
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
        <a style={styles.backLink} onClick={() => showPage('home')}>
          回到首頁
        </a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '700px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    textAlign: 'center',
    margin: 0,
    color: '#333',
    flexGrow: 1,
  },
  item: {
    marginBottom: '15px',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #ccc',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  fields: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'space-between',
  },
  itemLabel: {
    fontWeight: 'bold',
    color: '#4CAF50',
    flexShrink: 0,
  },
  noteInput: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    marginRight: '10px',
  },
  inputGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row', // 將元素水平排列
    alignItems: 'center', // 確保元素在垂直方向上對齊
    gap: '3px', // 設定元素之間的距離

  },
  inputLabel: {
    color: '#555',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    marginTop: '5px',
  },
  error: {
    color: '#ff0000',
    fontSize: '0.9em',
    marginTop: '5px',
  },
  deleteButton: {
    backgroundColor: '#FF5722',
    color: 'white',
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: '25px',
  },
  calculation: {
    marginTop: '10px',
    fontSize: '1em',
    color: '#333',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
  },
  calcButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    display: 'block',
    width: '100%',
    marginBottom: '20px',
  },
  backLink: {
    textDecoration: 'none',
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    display: 'block',
  },
};

export default CpValueCalculator;
