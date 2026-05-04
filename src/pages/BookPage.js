import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateDistanceKm, useFare } from '../hooks/useFare';
import { CAB_TYPES, MOCK_DRIVERS, PAYMENT_METHODS, SAVED_ADDRESSES } from '../data/mockData';
import CabSelector from '../components/CabSelector';
import FareEstimator from '../components/FareEstimator';
import DriverCard from '../components/DriverCard';
import MapView from '../components/MapView';
import Icon from '../components/Icon';
import styles from './BookPage.module.css';

export default function BookPage() {
  const { state, dispatch } = useApp();
  const distanceKm = calculateDistanceKm(state.pickupCoords, state.dropoffCoords);
  const fare = useFare(state.selectedCab, state.promoDiscount, distanceKm);
  const [showSuggestions, setShowSuggestions] = useState(null);

  function handleBook() {
    if (!state.pickupCoords || !state.dropoffCoords) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please select pickup and drop-off from suggestions', type: 'error' } });
      return;
    }
    dispatch({ type: 'SET_BOOKING_STATUS', payload: 'searching' });

    setTimeout(() => {
      const driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
      const selectedCab = CAB_TYPES.find(cab => cab.id === state.selectedCab);
      const ride = {
        id: `R${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
        }),
        from: state.pickup,
        to: state.dropoff,
        cab: selectedCab?.name || state.selectedCab,
        km: fare.km,
        duration: Math.max(5, Math.round(fare.km * 2.2)),
        amount: fare.total,
        status: 'pending',
        driver: driver.name,
        rating: null,
      };

      dispatch({ type: 'SET_ACTIVE_RIDE', payload: ride });
      dispatch({ type: 'ASSIGN_DRIVER', payload: driver });
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: `Driver ${driver.name} is on the way!`, type: 'success' } });
    }, 2000);
  }

  function handleCancel() {
    if (state.activeRide) {
      dispatch({ type: 'ADD_RIDE', payload: { ...state.activeRide, status: 'cancelled', amount: 0 } });
    }
    dispatch({ type: 'CANCEL_RIDE' });
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Ride cancelled', type: 'info' } });
  }

  function handleComplete() {
    if (!state.activeRide) return;

    dispatch({ type: 'COMPLETE_RIDE', payload: { ...state.activeRide, status: 'completed' } });
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Ride completed!', type: 'success' } });
  }

  function selectSavedAddress(addr, field) {
    dispatch({
      type: field === 'pickup' ? 'SET_PICKUP' : 'SET_DROPOFF',
      payload: { address: addr.address, coords: addr.coords },
    });
    setShowSuggestions(null);
  }

  const isSearching = state.bookingStatus === 'searching';
  const isFound     = state.bookingStatus === 'found';
  const isBooked    = isSearching || isFound;

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>

          {/* Location Inputs */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Where to?</h2>

            <div className={styles.locationStack}>
              {/* Pickup */}
              <div className={styles.inputWrap}>
                <span className={`${styles.dot} ${styles.dotGreen}`} />
                <input
                  className={styles.locInput}
                  placeholder="Pickup location"
                  value={state.pickup}
                  onChange={e => dispatch({ type: 'SET_PICKUP', payload: e.target.value })}
                  onFocus={() => setShowSuggestions('pickup')}
                  onBlur={() => setTimeout(() => setShowSuggestions(null), 150)}
                  disabled={isBooked}
                />
                {showSuggestions === 'pickup' && (
                  <div className={styles.suggestions}>
                    {SAVED_ADDRESSES.map(a => (
                      <button key={a.id} className={styles.suggestion} onMouseDown={() => selectSavedAddress(a, 'pickup')}>
                        <Icon name={a.icon} className={styles.suggIcon} title={a.label} />
                        <div>
                          <div className={styles.suggLabel}>{a.label}</div>
                          <div className={styles.suggAddr}>{a.address}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.connector}>
                <div className={styles.connLine} />
                <button
                  className={styles.swapBtn}
                  onClick={() => {
                    const p = state.pickup, d = state.dropoff;
                    const pc = state.pickupCoords, dc = state.dropoffCoords;
                    dispatch({ type: 'SET_PICKUP',  payload: { address: d, coords: dc } });
                    dispatch({ type: 'SET_DROPOFF', payload: { address: p, coords: pc } });
                  }}
                  disabled={isBooked}
                  title="Swap locations"
                >⇅</button>
              </div>

              {/* Dropoff */}
              <div className={styles.inputWrap}>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <input
                  className={styles.locInput}
                  placeholder="Drop-off location"
                  value={state.dropoff}
                  onChange={e => dispatch({ type: 'SET_DROPOFF', payload: e.target.value })}
                  onFocus={() => setShowSuggestions('dropoff')}
                  onBlur={() => setTimeout(() => setShowSuggestions(null), 150)}
                  disabled={isBooked}
                />
                {showSuggestions === 'dropoff' && (
                  <div className={styles.suggestions}>
                    {SAVED_ADDRESSES.map(a => (
                      <button key={a.id} className={styles.suggestion} onMouseDown={() => selectSavedAddress(a, 'dropoff')}>
                        <Icon name={a.icon} className={styles.suggIcon} title={a.label} />
                        <div>
                          <div className={styles.suggLabel}>{a.label}</div>
                          <div className={styles.suggAddr}>{a.address}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Cab Types */}
          {!isBooked && (
            <>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Choose ride</h2>
                <CabSelector />
              </section>

              {/* Payment */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Payment</h2>
                <div className={styles.payGrid}>
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      className={`${styles.payBtn} ${state.paymentMethod === m.id ? styles.paySelected : ''}`}
                      onClick={() => dispatch({ type: 'SET_PAYMENT', payload: m.id })}
                    >
                      <Icon name={m.icon} className={styles.payIcon} title={m.label} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Fare */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Fare breakdown</h2>
                <FareEstimator />
              </section>
            </>
          )}

          {/* Driver card */}
          {isFound && state.assignedDriver && (
            <section className={styles.section}>
              <DriverCard driver={state.assignedDriver} onCancel={handleCancel} onComplete={handleComplete} />
            </section>
          )}

          {/* Book Button */}
          {!isFound && (
            <button
              className={`${styles.bookBtn} ${isSearching ? styles.bookBtnLoading : ''}`}
              onClick={handleBook}
              disabled={isSearching || !fare.isReady}
            >
              {isSearching ? (
                <>
                  <span className={styles.spinner} />
                  Finding your driver…
                </>
              ) : (
                fare.isReady ? `Book Ride · ₹${fare.total.toLocaleString('en-IN')}` : 'Select route to see fare'
              )}
            </button>
          )}
        </div>
      </aside>

      {/* ── Map ── */}
      <div className={styles.mapArea}>
        <MapView
          bookingStatus={state.bookingStatus}
          pickupCoords={state.pickupCoords}
          dropoffCoords={state.dropoffCoords}
          distanceKm={fare.km}
        />
      </div>
    </div>
  );
}
