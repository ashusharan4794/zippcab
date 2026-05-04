import React from 'react';
import styles from './DriverCard.module.css';

export default function DriverCard({ driver, onCancel, onComplete }) {
  const stars = '★'.repeat(Math.round(driver.rating)) + '☆'.repeat(5 - Math.round(driver.rating));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.statusDot} />
        <span className={styles.statusText}>Driver on the way</span>
        <span className={styles.etaBadge}>2 min away</span>
      </div>

      <div className={styles.driverRow}>
        <div className={styles.avatar}>{driver.initials}</div>
        <div className={styles.info}>
          <div className={styles.name}>{driver.name}</div>
          <div className={styles.vehicle}>{driver.vehicle} · {driver.model}</div>
          <div className={styles.meta}>{driver.trips.toLocaleString()} Trips completed</div>
        </div>
        <div className={styles.rating}>
          <span className={styles.ratingNum}>{driver.rating}</span>
          <span className={styles.stars}>{stars.slice(0,5)}</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} />
      </div>

      <div className={styles.actions}>
        <a href={`tel:+919876543210`} className={styles.actionBtn}>
          Call Driver
        </a>
        <button className={styles.actionBtn}>
          Message
        </button>
        <button className={styles.actionBtn} onClick={onComplete}>
          Complete
        </button>
        <button className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
