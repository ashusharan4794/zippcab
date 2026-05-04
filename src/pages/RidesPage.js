import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import styles from './RidesPage.module.css';

const STATUS_LABELS = {
  completed: { label: 'Completed', cls: 'completed' },
  cancelled:  { label: 'Cancelled',  cls: 'cancelled'  },
};

const FILTERS = ['All', 'Completed', 'Cancelled'];

export default function RidesPage() {
  const { state } = useApp();
  const [filter, setFilter]   = useState('All');
  const [expanded, setExpanded] = useState(null);

  const rides = state.rideHistory.filter(r => {
    if (filter === 'All') return true;
    return r.status === filter.toLowerCase();
  });

  const totalSpent    = state.rideHistory.filter(r => r.status === 'completed').reduce((s, r) => s + r.amount, 0);
  const completedCount = state.rideHistory.filter(r => r.status === 'completed').length;
  const totalRides = Math.max(state.user.totalRides, state.rideHistory.length);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Header stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statVal}>{totalRides}</span>
            <span className={styles.statLbl}>Total Rides</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statVal} ${styles.yellow}`}>₹{totalSpent.toLocaleString('en-IN')}</span>
            <span className={styles.statLbl}>Total Spent</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statVal}>{completedCount}</span>
            <span className={styles.statLbl}>Completed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statVal}>{state.rideHistory.length - completedCount}</span>
            <span className={styles.statLbl}>Cancelled</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Ride list */}
        <div className={styles.list}>
          {rides.length === 0 && (
            <div className={styles.empty}>
              <Icon name="sedan" className={styles.emptyIcon} title="No rides" />
              <p>No rides found</p>
            </div>
          )}

          {rides.map(ride => (
            <div
              key={ride.id}
              className={`${styles.card} ${expanded === ride.id ? styles.cardExpanded : ''}`}
              onClick={() => setExpanded(expanded === ride.id ? null : ride.id)}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                  <div className={styles.routeRow}>
                    <span className={styles.fromCity}>{ride.from}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.toCity}>{ride.to}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    <span>{ride.date}</span>
                    <span className={styles.dot2}>·</span>
                    <span>{ride.cab}</span>
                    {ride.km && (
                      <>
                        <span className={styles.dot2}>·</span>
                        <span>{ride.km} km</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.amount}>
                    {ride.amount > 0 ? `₹${ride.amount.toLocaleString('en-IN')}` : '—'}
                  </span>
                  <span className={`${styles.badge} ${styles[STATUS_LABELS[ride.status].cls]}`}>
                    {STATUS_LABELS[ride.status].label}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === ride.id && (
                <div className={styles.details}>
                  <div className={styles.detailGrid}>
                    {ride.duration && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLbl}>Duration</span>
                        <span className={styles.detailVal}>{ride.duration} min</span>
                      </div>
                    )}
                    {ride.driver && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLbl}>Driver</span>
                        <span className={styles.detailVal}>{ride.driver}</span>
                      </div>
                    )}
                    {ride.rating && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLbl}>Your Rating</span>
                        <span className={styles.detailVal}>{'★'.repeat(ride.rating)}{'☆'.repeat(5 - ride.rating)}</span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <span className={styles.detailLbl}>Ride ID</span>
                      <span className={styles.detailVal}>{ride.id}</span>
                    </div>
                  </div>
                  {ride.status === 'completed' && (
                    <button className={styles.rebookBtn}>
                      ↻ Book same ride again
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
