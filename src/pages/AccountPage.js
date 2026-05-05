import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OFFERS } from '../data/mockData';
import Icon from '../components/Icon';
import { formatCardNumber, formatCvv, formatExpiry, isValidCardDetails } from '../utils/paymentInputs';
import styles from './AccountPage.module.css';

export default function AccountPage() {
  const { state, dispatch } = useApp();
  const [addingWallet, setAddingWallet] = useState(false);
  const [walletAmt, setWalletAmt]       = useState('');
  const [topUpPaymentMethod, setTopUpPaymentMethod] = useState('');
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [editingName, setEditingName]   = useState(false);
  const [nameInput, setNameInput]       = useState(state.user.name);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [referContact, setReferContact] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  function openTopUpPayment() {
    const amt = parseInt(walletAmt, 10);
    if (!amt || amt <= 0) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please enter a valid top-up amount', type: 'error' } });
      return;
    }

    setTopUpPaymentMethod('');
    setTopUpModalOpen(true);
  }

  function resetTopUp() {
    setWalletAmt('');
    setAddingWallet(false);
    setTopUpPaymentMethod('');
    setTopUpModalOpen(false);
    setCardDetails({ name: '', number: '', expiry: '', cvv: '' });
    setUpiId('');
  }

  function topUpWallet() {
    const amt = parseInt(walletAmt, 10);
    if (!amt || amt <= 0) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please enter a valid top-up amount', type: 'error' } });
      return;
    }

    if (!topUpPaymentMethod) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please select UPI or card', type: 'error' } });
      return;
    }

    if (topUpPaymentMethod === 'card') {
      if (!isValidCardDetails(cardDetails)) {
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please enter valid card details', type: 'error' } });
        return;
      }
    }

    if (topUpPaymentMethod === 'upi' && !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please enter a valid UPI ID', type: 'error' } });
      return;
    }

    dispatch({ type: 'UPDATE_WALLET', payload: amt });
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: `₹${amt} added to wallet!`, type: 'success' } });
    resetTopUp();
  }

  function selectOffer(offer) {
    const discount = offer.id === 'FIRST50' ? 100 : offer.id === 'UPI20' ? 50 : 99;
    dispatch({ type: 'APPLY_PROMO', payload: { code: offer.code, discount } });
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: `${offer.code} selected for your next ride`, type: 'success' } });
    setShowOffersModal(false);
  }

  const avgAmountPerRide = state.user.totalRides > 0
    ? Math.round(state.user.totalSpent / state.user.totalRides)
    : 0;

  const settings = [
    { id: 'notifications', icon: 'alert', label: 'Notifications', sub: 'Ride updates & offers' },
    { id: 'privacy', icon: 'lock', label: 'Privacy & Security', sub: 'Account protection' },
    { id: 'refer', icon: 'refer', label: 'Refer & Earn', sub: 'Code: ZIPP-RK47', highlight: true },
    { id: 'help', icon: 'help', label: 'Help & Support', sub: 'FAQs and contact us' },
    { id: 'rate', icon: 'rate', label: 'Rate the App', sub: 'Share your feedback' },
    { id: 'terms', icon: 'legal', label: 'Terms & Privacy', sub: 'Legal documents' },
  ];

  function submitReferral() {
    if (!referContact.trim()) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please enter a contact to refer', type: 'error' } });
      return;
    }

    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: `Referral sent to ${referContact.trim()}`, type: 'success' } });
    setReferContact('');
  }

  function submitFeedback() {
    if (!feedbackRating) {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Please select a star rating', type: 'error' } });
      return;
    }

    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Thanks for your feedback!', type: 'success' } });
    setFeedbackRating(0);
    setFeedbackText('');
  }

  function renderAccountSection() {
    const section = settings.find(item => item.id === activeSection);
    if (!section) return null;

    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <button className={styles.backBtn} onClick={() => setActiveSection(null)}>‹ Back</button>
          <div className={styles.panel}>
            <div className={styles.subpageHeader}>
              <Icon name={section.icon} className={styles.subpageIcon} title={section.label} />
              <div>
                <h2 className={styles.subpageTitle}>{section.label}</h2>
                <p className={styles.subpageSub}>{section.sub}</p>
              </div>
            </div>

            {activeSection === 'notifications' && (
              <div className={styles.emptyPanel}>
                <Icon name="empty" className={styles.emptyPanelIcon} title="No notifications" />
                <strong>No notification</strong>
                <span>You do not have any ride updates or offer alerts right now.</span>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className={styles.statementList}>
                <p>Your account information is used only to operate your bookings, payments, wallet, and ride history.</p>
                <p>Payment details are validated before use and should never be shared with drivers or support agents.</p>
                <p>Location access is requested only when you choose current location for pickup or map-related ride features.</p>
                <p>Always keep your password private and log out on shared devices.</p>
              </div>
            )}

            {activeSection === 'refer' && (
              <div className={styles.actionPanel}>
                <div className={styles.referralCode}>ZIPP-RK47</div>
                <input
                  className={styles.sectionInput}
                  placeholder="Enter contact number or email"
                  value={referContact}
                  onChange={e => setReferContact(e.target.value)}
                />
                <button className={styles.sectionPrimaryBtn} onClick={submitReferral}>Send referral</button>
              </div>
            )}

            {activeSection === 'help' && (
              <div className={styles.statementList}>
                <p>For booking issues, check that pickup and drop-off locations are valid and payment details are saved.</p>
                <p>For wallet top-ups, choose UPI or card and complete the required payment details.</p>
                <p>For ride cancellations or completed ride questions, open My Rides and review the ride details.</p>
                <p>Support response time may vary, but urgent ride safety concerns should be reported immediately.</p>
              </div>
            )}

            {activeSection === 'rate' && (
              <div className={styles.actionPanel}>
                <div className={styles.starRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`${styles.starBtn} ${feedbackRating >= star ? styles.starActive : ''}`}
                      onClick={() => setFeedbackRating(star)}
                      title={`${star} star`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.sectionTextarea}
                  placeholder="Share your feedback"
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
                <button className={styles.sectionPrimaryBtn} onClick={submitFeedback}>Submit feedback</button>
              </div>
            )}

            {activeSection === 'terms' && (
              <div className={styles.statementList}>
                <p>Ride fares, driver assignment, and estimated times may vary based on distance, availability, and traffic.</p>
                <p>Users are responsible for entering accurate pickup, drop-off, and payment information.</p>
                <p>Wallet credits are intended for rides and in-app payments within ZippCab.</p>
                <p>By using the app, you agree to respectful conduct, safe ride behavior, and compliance with local laws.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection) {
    return renderAccountSection();
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileLeft}>
            <div className={styles.bigAvatar}>{state.user.initials}</div>
            <div>
              {editingName ? (
                <div className={styles.editRow}>
                  <input
                    className={styles.nameInput}
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    className={styles.saveBtn}
                    onClick={() => {
                      // In real app: dispatch update
                      setEditingName(false);
                    }}
                  >Save</button>
                </div>
              ) : (
                <div className={styles.profileName} onClick={() => setEditingName(true)}>
                  {state.user.name} <span className={styles.editHint}>✏</span>
                </div>
              )}
              <div className={styles.profilePhone}>{state.user.phone}</div>
              <div className={styles.profileSince}>Member since {state.user.memberSince} · Verified ✓</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {[
            { label: 'Total Rides',  value: state.user.totalRides,  fmt: v => v                             },
            { label: 'Total Spent',  value: state.user.totalSpent,   fmt: v => `₹${v.toLocaleString('en-IN')}` },
            { label: 'Avg Per Ride', value: avgAmountPerRide,        fmt: v => `₹${v}`                       },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statVal}>{s.fmt(s.value)}</div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Wallet */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Wallet Balance</h3>
          <div className={styles.walletLauncher}>
            <span className={styles.walletIconWrap}>
              <Icon name="wallet" className={styles.walletLauncherIcon} title="Wallet balance" />
            </span>
            <span className={styles.walletLauncherText}>
              <strong>₹{state.user.walletBalance.toLocaleString('en-IN')}</strong>
              <span>Available balance</span>
            </span>
            <button className={styles.topUpBtn} onClick={() => setAddingWallet(v => !v)}>
              + Top Up
            </button>
          </div>
          {addingWallet && (
            <div className={styles.topUpRow}>
              <input
                className={styles.topUpInput}
                type="number"
                placeholder="₹ Amount"
                value={walletAmt}
                onChange={e => setWalletAmt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && openTopUpPayment()}
                autoFocus
              />
              <button className={styles.topUpConfirm} onClick={openTopUpPayment}>Add</button>
            </div>
          )}
        </div>

        {/* Offers */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Available Offers</h3>
          <button className={styles.offerLauncher} onClick={() => setShowOffersModal(true)}>
            <span className={styles.offerIconWrap}>
              <Icon name="offer" className={styles.offerLauncherIcon} title="Available offers" />
            </span>
            <span className={styles.offerLauncherText}>
              <strong>{state.promoApplied ? state.promoCode : 'View offers'}</strong>
              <span>{state.promoApplied ? 'Selected for your next ride' : 'Choose an offer for your next ride'}</span>
            </span>
            <span className={styles.chevron}>›</span>
          </button>
        </div>

        {/* Settings List */}
        <div className={styles.panel} style={{ marginTop: 0 }}>
          <h3 className={styles.panelTitle}>Settings & Support</h3>
          <div className={styles.settingsList}>
            {settings.map(item => (
              <button
                key={item.id}
                className={`${styles.settingItem} ${item.highlight ? styles.highlight : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon name={item.icon} className={styles.settingIcon} title={item.label} />
                <div className={styles.settingText}>
                  <div className={styles.settingLabel}>{item.label}</div>
                  <div className={styles.settingSub}>{item.sub}</div>
                </div>
                <span className={styles.chevron}>›</span>
              </button>
            ))}
            <button
              className={`${styles.settingItem} ${styles.logoutItem}`}
              onClick={() => setShowLogoutConfirm(true)}
            >
              <Icon name="lock" className={styles.settingIcon} title="Logout" />
              <div className={styles.settingText}>
                <div className={styles.settingLabel}>Logout</div>
                <div className={styles.settingSub}>Sign out of this account</div>
              </div>
              <span className={styles.chevron}>›</span>
            </button>
          </div>
        </div>

      </div>

      {showLogoutConfirm && (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.confirmModal} role="dialog" aria-modal="true" aria-labelledby="logout-title" onClick={e => e.stopPropagation()}>
            <h3 id="logout-title" className={styles.confirmTitle}>Logout?</h3>
            <p className={styles.confirmText}>Are you sure you want to exit your account?</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelLogoutBtn} onClick={() => setShowLogoutConfirm(false)}>
                No, stay
              </button>
              <button className={styles.confirmLogoutBtn} onClick={() => dispatch({ type: 'LOGOUT' })}>
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showOffersModal && (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setShowOffersModal(false)}>
          <div className={styles.offersModal} role="dialog" aria-modal="true" aria-labelledby="offers-title" onClick={e => e.stopPropagation()}>
            <h3 id="offers-title" className={styles.confirmTitle}>Available offers</h3>
            <p className={styles.confirmText}>Select one offer to use on your next booking.</p>
            <div className={styles.offerList}>
              {OFFERS.map(offer => (
                <button
                  key={offer.id}
                  className={`${styles.offerCard} ${state.promoCode === offer.code ? styles.offerSelected : ''}`}
                  style={{ '--offer-color': offer.color }}
                  onClick={() => selectOffer(offer)}
                >
                  <Icon name="offer" className={styles.offerCardIcon} title={offer.code} />
                  <span>
                    <strong className={styles.offerCode}>{offer.code}</strong>
                    <span className={styles.offerTitle}>{offer.title}</span>
                    <span className={styles.offerDesc}>{offer.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.cancelLogoutBtn} onClick={() => setShowOffersModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {topUpModalOpen && (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setTopUpModalOpen(false)}>
          <div className={styles.paymentModal} role="dialog" aria-modal="true" aria-labelledby="topup-title" onClick={e => e.stopPropagation()}>
            <h3 id="topup-title" className={styles.confirmTitle}>Top up wallet</h3>
            <p className={styles.confirmText}>Add ₹{parseInt(walletAmt, 10).toLocaleString('en-IN')} using your preferred payment method.</p>

            <div className={styles.paymentOptions}>
              <button
                className={`${styles.paymentOption} ${topUpPaymentMethod === 'upi' ? styles.paymentSelected : ''}`}
                onClick={() => setTopUpPaymentMethod('upi')}
              >
                <Icon name="upi" className={styles.paymentIcon} title="UPI" />
                <span>UPI</span>
              </button>
              <button
                className={`${styles.paymentOption} ${topUpPaymentMethod === 'card' ? styles.paymentSelected : ''}`}
                onClick={() => setTopUpPaymentMethod('card')}
              >
                <Icon name="card" className={styles.paymentIcon} title="Card" />
                <span>Card</span>
              </button>
            </div>

            {topUpPaymentMethod === 'upi' && (
              <div className={styles.paymentDetails}>
                <input
                  className={styles.paymentInput}
                  placeholder="UPI ID, e.g. name@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                />
              </div>
            )}

            {topUpPaymentMethod === 'card' && (
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
            )}

            <div className={styles.confirmActions}>
              <button className={styles.cancelLogoutBtn} onClick={() => setTopUpModalOpen(false)}>
                Cancel
              </button>
              <button className={styles.confirmTopUpBtn} onClick={topUpWallet}>
                Add ₹{parseInt(walletAmt, 10).toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
