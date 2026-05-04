import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import styles from './Notification.module.css';

export default function Notification() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.notification) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 3500);
      return () => clearTimeout(t);
    }
  }, [state.notification, dispatch]);

  if (!state.notification) return null;

  const { message, type = 'info' } = state.notification;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
