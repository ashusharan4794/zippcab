import React from 'react';
import { useApp } from '../context/AppContext';
import styles from './Topbar.module.css';

const NAV_ITEMS = [
  { id: 'book',    label: 'Book Ride' },
  { id: 'rides',   label: 'My Rides'  },
];

export default function Topbar() {
  const { state, dispatch } = useApp();

  return (
    <header className={styles.topbar}>
      <div className={styles.logo} aria-label="ZippCab">ZippCab</div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`${styles.navBtn} ${state.activeNav === item.id ? styles.active : ''}`}
            onClick={() => dispatch({ type: 'SET_NAV', payload: item.id })}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        className={`${styles.userChip} ${state.activeNav === 'account' ? styles.userChipActive : ''}`}
        onClick={() => dispatch({ type: 'SET_NAV', payload: 'account' })}
        title="My account"
      >
        <div className={styles.avatar}>{state.user.initials}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{state.user.name.split(' ')[0]}</span>
          <span className={styles.walletBadge}>₹{state.user.walletBalance}</span>
        </div>
      </button>
    </header>
  );
}
