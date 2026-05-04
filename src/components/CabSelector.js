import React from 'react';
import { CAB_TYPES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import styles from './CabSelector.module.css';

export default function CabSelector() {
  const { state, dispatch } = useApp();

  return (
    <div className={styles.grid}>
      {CAB_TYPES.map(cab => (
        <button
          key={cab.id}
          className={`${styles.card} ${state.selectedCab === cab.id ? styles.selected : ''}`}
          onClick={() => dispatch({ type: 'SET_CAB', payload: cab.id })}
        >
          <img className={styles.logo} src={cab.logo} alt="" aria-hidden="true" />
          <div className={styles.name}>{cab.name}</div>
          <div className={styles.rate}>₹{cab.ratePerKm}/km</div>
          <div className={styles.eta}>{cab.etaMin}–{cab.etaMax} min</div>
          <div className={styles.seats}>{cab.capacity} seats</div>
        </button>
      ))}
    </div>
  );
}
