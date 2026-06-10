import { useState, useCallback } from "react";

const STORAGE_KEY = "troubleshoot_history";

/**
 * 管理排故历史记录的 Hook
 * 数据存入 localStorage，页面刷新不丢失
 *
 * 每条记录结构：
 * { id: string, question: string, summary: string, createdAt: number }
 */
export function useHistory() {
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      // 数据损坏时清空
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  // 每次 records 变化时同步写入 localStorage
  const persist = useCallback((newRecords) => {
    setRecords(newRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
  }, []);

  // 添加一条历史记录
  const addRecord = useCallback(
    (question, summary) => {
      const record = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        question,
        summary: summary.slice(0, 100),
        createdAt: Date.now(),
      };
      persist([record, ...records].slice(0, 50));
    },
    [records, persist]
  );

  // 删除一条历史记录
  const removeRecord = useCallback(
    (id) => {
      persist(records.filter((r) => r.id !== id));
    },
    [records, persist]
  );

  // 清空全部历史
  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { records, addRecord, removeRecord, clearAll };
}
