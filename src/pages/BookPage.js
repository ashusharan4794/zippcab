import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateDistanceKm, useFare } from '../hooks/useFare';
import { CAB_TYPES, MOCK_DRIVERS, PAYMENT_METHODS, SAVED_ADDRESSES } from '../data/mockData';
import CabSelector from '../components/CabSelector';
import FareEstimator from '../components/FareEstimator';
import DriverCard from '../components/DriverCard';
import MapView from '../components/MapView';
import Icon from '../components/Icon';
import { formatCardNumber, formatCvv, formatExpiry, isValidCardDetails } from '../utils/paymentInputs';
import styles from './BookPage.module.css';

const LOCATION_FIELDS = {
  pickup: {
    stateKey: 'pickup',
    coordsKey: 'pickupCoords',
    action: 'SET_PICKUP',
    placeholder: 'Pickup location',
  },
  dropoff: {
    stateKey: 'dropoff',
    coordsKey: 'dropoffCoords',
    action: 'SET_DROPOFF',
    placeholder: 'Drop-off location',
  },
};

function getLocationLabel(place) {
  return place.display_name?.split(',').slice(0, 2).join(', ') || place.name || 'Selected location';
}

function getLocationAddress(place) {
  return place.display_name || place.name || '';
}

async function searchPlaces(query) {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 3) return [];

  const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
  searchUrl.searchParams.set('format', 'jsonv2');
  searchUrl.searchParams.set('limit', '5');
  searchUrl.searchParams.set('addressdetails', '1');
  searchUrl.searchParams.set('countrycodes', 'in');
  searchUrl.searchParams.set('viewbox', '77.35,13.35,77.95,12.75');
  searchUrl.searchParams.set('q', /bengaluru|bangalore|india/i.test(cleanQuery) ? cleanQuery : `${cleanQuery}, Bengaluru, India`);

  const response = await fetch(searchUrl);
  if (!response.ok) throw new Error('Location search failed');

  return response.json();
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    });
  });
}

export default function BookPage() {
  const { state, dispatch } = useApp();
  const distanceKm = calculateDistanceKm(state.pickupCoords, state.dropoffCoords);
  const fare = useFare(state.selectedCab, state.promoDiscount, distanceKm);
  const [showSuggestions, setShowSuggestions] = useState(null);
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [savedCard, setSavedCard] = useState(null);
  const [savedUpiId, setSavedUpiId] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [placeResults, setPlaceResults] = useState({ pickup: [], dropoff: [] });
  const [placeLoading, setPlaceLoading] = useState({ pickup: false, dropoff: false });

  useEffect(() => {
    let isCurrent = true;
    const timers = Object.entries(LOCATION_FIELDS).map(([field, fieldConfig]) => {
      if (field === 'pickup') return null;

      const query = state[fieldConfig.stateKey];

      if (!query || query.trim().length < 3) {
        setPlaceResults(current => ({ ...current, [field]: [] }));
        return null;
      }

      if (state[fieldConfig.coordsKey]) return null;

      setPlaceLoading(current => ({ ...current, [field]: true }));

      return window.setTimeout(() => {
        searchPlaces(query)
          .then(results => {
            if (!isCurrent) return;

            setPlaceResults(current => ({ ...current, [field]: results }));

            if (results[0]) {
              dispatch({
                type: fieldConfig.action,
                payload: {
                  address: query,
                  coords: [Number(results[0].lat), Number(results[0].lon)],
                },
              });
            }
          })
          .catch(() => {
            if (!isCurrent) return;
            setPlaceResults(current => ({ ...current, [field]: [] }));
          })
          .finally(() => {
            if (!isCurrent) return;
            setPlaceLoading(current => ({ ...current, [field]: false }));
          });
      }, 650);
    });

    return () => {
      isCurrent = false;
      timers.forEach(timer => {
        if (timer) window.clearTimeout(timer);
      });
    };
  }, [dispatch, state.pickup, state.pickupCoords, state.dropoff, state.dropoffCoords]);

  function validatePayment() {
    if (state.paymentMethod === 'card') {
      if (!savedCard) {
        return 'Please save your card details';
      }
    }

    if (state.paymentMethod === 'upi' && !savedUpiId) {
      return 'Please save your UPI details';
    }

    if (state.paymentMethod === 'wallet' && state.user.walletBalance < fare.total) {
      return 'Insufficient wallet balance';
    }

    return '';
  }

  function selectPayment(method) {
    dispatch({ type: 'SET_PAYMENT', payload: method });
    if (method === 'card') setPaymentModal('card');
    if (method === 'upi') setPaymentModal('upi');
  }

  function saveCardDetails() {
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    if (!isValidCardDetails(cardDetails)) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please enter valid card details', type: 'error' } });
      return;
    }

    setSavedCard({ ...cardDetails, number: cardNumber });
    setPaymentModal(null);
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Card details saved', type: 'success' } });
  }

  function saveUpiDetails() {
    const nextUpiId = upiId.trim();
    if (!/^[\w.-]+@[\w.-]+$/.test(nextUpiId)) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please enter a valid UPI ID', type: 'error' } });
      return;
    }

    setSavedUpiId(nextUpiId);
    setPaymentModal(null);
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'UPI details saved', type: 'success' } });
  }

  function handleBook() {
    if (!state.pickupCoords || !state.dropoffCoords) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please enter valid pickup and drop-off locations', type: 'error' } });
      return;
    }

    const paymentError = validatePayment();
    if (paymentError) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: paymentError, type: 'error' } });
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
        paymentMethod: state.paymentMethod,
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

    if (state.activeRide.paymentMethod === 'wallet') {
      dispatch({ type: 'UPDATE_WALLET', payload: -state.activeRide.amount });
    }
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

  function selectPlace(place, field) {
    const fieldConfig = LOCATION_FIELDS[field];
    dispatch({
      type: fieldConfig.action,
      payload: {
        address: getLocationAddress(place),
        coords: [Number(place.lat), Number(place.lon)],
      },
    });
    setShowSuggestions(null);
  }

  function selectCurrentLocation() {
    getCurrentLocation()
      .then(({ coords }) => {
        dispatch({
          type: 'SET_PICKUP',
          payload: {
            address: 'Current location',
            coords: [coords.latitude, coords.longitude],
          },
        });
        setShowSuggestions(null);
      })
      .catch(() => {
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please allow location access to use current location', type: 'error' } });
      });
  }

  function updateLocationInput(value, field) {
    dispatch({ type: LOCATION_FIELDS[field].action, payload: value });
    setPlaceResults(current => ({ ...current, [field]: [] }));
  }

  function renderLocationSuggestions(field) {
    if (field === 'pickup') {
      return (
        <div className={styles.suggestions}>
          <button className={styles.suggestion} onMouseDown={selectCurrentLocation}>
            <Icon name="empty" className={styles.suggIcon} title="Current location" />
            <div>
              <div className={styles.suggLabel}>Current location</div>
              <div className={styles.suggAddr}>Use your device location as pickup</div>
            </div>
          </button>
        </div>
      );
    }

    const matchingSavedAddresses = SAVED_ADDRESSES.filter(addr => {
      const query = state[LOCATION_FIELDS[field].stateKey].trim().toLowerCase();
      if (!query) return true;
      return `${addr.label} ${addr.address}`.toLowerCase().includes(query);
    });
    const results = placeResults[field];

    return (
      <div className={styles.suggestions}>
        {matchingSavedAddresses.length > 0 && (
          <div className={styles.suggestionGroup}>
            <div className={styles.suggestionHeading}>Saved places</div>
            {matchingSavedAddresses.map(a => (
              <button key={a.id} className={styles.suggestion} onMouseDown={() => selectSavedAddress(a, field)}>
                <Icon name={a.icon} className={styles.suggIcon} title={a.label} />
                <div>
                  <div className={styles.suggLabel}>{a.label}</div>
                  <div className={styles.suggAddr}>{a.address}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {(results.length > 0 || placeLoading[field]) && (
          <div className={styles.suggestionGroup}>
            <div className={styles.suggestionHeading}>Search results</div>
            {placeLoading[field] && <div className={styles.suggestionStatus}>Searching map...</div>}
            {results.map(place => (
              <button key={place.place_id} className={styles.suggestion} onMouseDown={() => selectPlace(place, field)}>
                <Icon name="empty" className={styles.suggIcon} title="Map location" />
                <div>
                  <div className={styles.suggLabel}>{getLocationLabel(place)}</div>
                  <div className={styles.suggAddr}>{getLocationAddress(place)}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!placeLoading[field] && matchingSavedAddresses.length === 0 && results.length === 0 && (
          <div className={styles.suggestionStatus}>Type an area, landmark, or address</div>
        )}
      </div>
    );
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
                  onChange={e => updateLocationInput(e.target.value, 'pickup')}
                  onFocus={() => setShowSuggestions('pickup')}
                  onBlur={() => setTimeout(() => setShowSuggestions(null), 150)}
                  disabled={isBooked}
                />
                {showSuggestions === 'pickup' && renderLocationSuggestions('pickup')}
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
                  onChange={e => updateLocationInput(e.target.value, 'dropoff')}
                  onFocus={() => setShowSuggestions('dropoff')}
                  onBlur={() => setTimeout(() => setShowSuggestions(null), 150)}
                  disabled={isBooked}
                />
                {showSuggestions === 'dropoff' && renderLocationSuggestions('dropoff')}
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
                      onClick={() => selectPayment(m.id)}
                    >
                      <Icon name={m.icon} className={styles.payIcon} title={m.label} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
                {state.paymentMethod === 'card' && savedCard && (
                  <div className={styles.savedPayment}>
                    <div>
                      <span>Saved card</span>
                      <strong>•••• {savedCard.number.slice(-4)}</strong>
                    </div>
                    <button onClick={() => setPaymentModal('card')}>Edit</button>
                  </div>
                )}
                {state.paymentMethod === 'upi' && savedUpiId && (
                  <div className={styles.savedPayment}>
                    <div>
                      <span>Saved UPI</span>
                      <strong>{savedUpiId}</strong>
                    </div>
                    <button onClick={() => setPaymentModal('upi')}>Edit</button>
                  </div>
                )}
                {state.paymentMethod === 'wallet' && (
                  <div className={styles.walletDetails}>
                    <span>Wallet balance</span>
                    <strong>₹{state.user.walletBalance.toLocaleString('en-IN')}</strong>
                    {fare.isReady && state.user.walletBalance < fare.total && (
                      <em>Insufficient balance for this ride</em>
                    )}
                  </div>
                )}
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

      {paymentModal && (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setPaymentModal(null)}>
          <div className={styles.paymentModal} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{paymentModal === 'card' ? 'Add card details' : 'Add UPI details'}</h3>
            {paymentModal === 'card' ? (
              <div className={styles.paymentDetails}>
                <input
                  className={styles.paymentInput}
                  placeholder="Cardholder name"
                  value={cardDetails.name}
                  onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                />
                <input
                  className={styles.paymentInput}
                  inputMode="numeric"
                  placeholder="Card number"
                  maxLength={19}
                  value={cardDetails.number}
                  onChange={e => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                />
                <div className={styles.paymentSplit}>
                  <input
                    className={styles.paymentInput}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    maxLength={5}
                    value={cardDetails.expiry}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && cardDetails.expiry.endsWith('/')) {
                        e.preventDefault();
                        setCardDetails({ ...cardDetails, expiry: cardDetails.expiry.slice(0, 1) });
                      }
                    }}
                    onChange={e => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                  />
                  <input
                    className={styles.paymentInput}
                    inputMode="numeric"
                    placeholder="CVV"
                    maxLength={3}
                    value={cardDetails.cvv}
                    onChange={e => setCardDetails({ ...cardDetails, cvv: formatCvv(e.target.value) })}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.paymentDetails}>
                <input
                  className={styles.paymentInput}
                  placeholder="UPI ID, e.g. name@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                />
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={styles.secondaryModalBtn} onClick={() => setPaymentModal(null)}>Cancel</button>
              <button className={styles.primaryModalBtn} onClick={paymentModal === 'card' ? saveCardDetails : saveUpiDetails}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
