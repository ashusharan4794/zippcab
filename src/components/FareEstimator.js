import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateDistanceKm, useFare, formatCurrency } from '../hooks/useFare';
import { OFFERS } from '../data/mockData';
import styles from './FareEstimator.module.css';

export default function FareEstimator() {
  const { state, dispatch } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const distanceKm = calculateDistanceKm(state.pickupCoords, state.dropoffCoords);
  const fare = useFare(state.selectedCab, state.promoDiscount, distanceKm);

  function applyPromo() {
    const found = OFFERS.find(o => o.code === promoInput.toUpperCase());
    if (found) {
      const discount = found.id === 'FIRST50' ? 100 : found.id === 'UPI20' ? 50 : 99;
      dispatch({ type: 'APPLY_PROMO', payload: { code: promoInput.toUpperCase(), discount } });
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  }

  function removePromo() {
    dispatch({ type: 'CLEAR_PROMO' });
    setPromoInput('');
    setPromoError('');
  }

  return (
    <div className={styles.box}>
      {!fare.isReady && (
        <div className={styles.emptyState}>Select pickup and drop-off from suggestions to calculate fare.</div>
      )}
      <div className={styles.rows}>
        <div className={styles.row}>
          <span>Base fare</span>
          <span>{formatCurrency(fare.baseFare)}</span>
        </div>
        <div className={styles.row}>
          <span>Distance ({fare.km} km)</span>
          <span>{formatCurrency(fare.distFare)}</span>
        </div>
        <div className={styles.row}>
          <span>Surge ({fare.surgeMultiplier}x)</span>
          <span>{formatCurrency(fare.surge)}</span>
        </div>
        <div className={styles.row}>
          <span>GST (5%)</span>
          <span>{formatCurrency(fare.gst)}</span>
        </div>
        {state.promoApplied && (
          <div className={`${styles.row} ${styles.discount}`}>
            <span>Promo ({state.promoCode})</span>
            <span>−{formatCurrency(fare.discount)}</span>
          </div>
        )}
      </div>

      <div className={styles.divider} />

      <div className={`${styles.row} ${styles.total}`}>
        <span>Total</span>
        <span className={styles.totalAmount}>{formatCurrency(fare.total)}</span>
      </div>

      {/* Promo Section */}
      <div className={styles.promoWrap}>
        {!state.promoApplied ? (
          <div className={styles.promoRow}>
            <input
              className={styles.promoInput}
              placeholder="Promo code"
              value={promoInput}
              onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
              onKeyDown={e => e.key === 'Enter' && applyPromo()}
            />
            <button className={styles.applyBtn} onClick={applyPromo}>Apply</button>
          </div>
        ) : (
          <div className={styles.appliedBadge}>
            <span>✓ {state.promoCode} applied</span>
            <button className={styles.removeBtn} onClick={removePromo}>Remove</button>
          </div>
        )}
        {promoError && <div className={styles.promoError}>{promoError}</div>}
      </div>
    </div>
  );
}
