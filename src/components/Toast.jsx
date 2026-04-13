import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

let _toastFn = null;

export function toast(message, type = 'success', duration = 3000) {
  if (_toastFn) _toastFn(message, type, duration);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  useEffect(() => { _toastFn = addToast; return () => { _toastFn = null; }; }, [addToast]);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className={styles.container} aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`} onClick={() => remove(t.id)}>
            <span className={styles.icon}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'info' ? 'ℹ' : '⚠'}
            </span>
            <span className={styles.msg}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
