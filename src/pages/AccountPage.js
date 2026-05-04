import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAVED_ADDRESSES, OFFERS } from '../data/mockData';
import Icon from '../components/Icon';
import styles from './AccountPage.module.css';

export default function AccountPage() {
  const { state, dispatch } = useApp();
  const [addingWallet, setAddingWallet] = useState(false);
  const [walletAmt, setWalletAmt]       = useState('');
  const [editingName, setEditingName]   = useState(false);
  const [nameInput, setNameInput]       = useState(state.user.name);

  function topUpWallet() {
    const amt = parseInt(walletAmt, 10);
    if (!amt || amt <= 0) return;
    dispatch({ type: 'UPDATE_WALLET', payload: amt });
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: `₹${amt} added to wallet!`, type: 'success' } });
    setWalletAmt('');
    setAddingWallet(false);
  }

  const avgAmountPerRide = state.user.totalRides > 0
    ? Math.round(state.user.totalSpent / state.user.totalRides)
    : 0;

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
          <div className={styles.walletBox}>
            <div className={styles.walletLabel}>Wallet Balance</div>
            <div className={styles.walletAmt}>₹{state.user.walletBalance}</div>
            <button className={styles.topUpBtn} onClick={() => setAddingWallet(v => !v)}>
              + Top Up
            </button>
            {addingWallet && (
              <div className={styles.topUpRow}>
                <input
                  className={styles.topUpInput}
                  type="number"
                  placeholder="₹ Amount"
                  value={walletAmt}
                  onChange={e => setWalletAmt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && topUpWallet()}
                  autoFocus
                />
                <button className={styles.topUpConfirm} onClick={topUpWallet}>Add</button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {[
            { label: 'Total Rides',  value: state.user.totalRides,  fmt: v => v                             },
            { label: 'Total Spent',  value: state.user.totalSpent,   fmt: v => `₹${v.toLocaleString('en-IN')}` },
            { label: 'Avg Per Ride', value: avgAmountPerRide,        fmt: v => `₹${v}`                       },
            { label: 'Wallet',       value: state.user.walletBalance, fmt: v => `₹${v}`                      },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statVal}>{s.fmt(s.value)}</div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.twoCol}>
          {/* Saved Addresses */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Saved Addresses</h3>
            <div className={styles.addrList}>
              {SAVED_ADDRESSES.map(addr => (
                <div key={addr.id} className={styles.addrItem}>
                  <Icon name={addr.icon} className={styles.addrIcon} title={addr.label} />
                  <div>
                    <div className={styles.addrLabel}>{addr.label}</div>
                    <div className={styles.addrText}>{addr.address}</div>
                  </div>
                  <button className={styles.addrEdit}>Edit</button>
                </div>
              ))}
              <button className={styles.addAddrBtn}>+ Add new address</button>
            </div>
          </div>

          {/* Offers */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Available Offers</h3>
            <div className={styles.offerList}>
              {OFFERS.map(offer => (
                <div key={offer.id} className={styles.offerCard} style={{ '--offer-color': offer.color }}>
                  <div className={styles.offerCode}>{offer.code}</div>
                  <div className={styles.offerTitle}>{offer.title}</div>
                  <div className={styles.offerDesc}>{offer.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className={styles.panel} style={{ marginTop: 0 }}>
          <h3 className={styles.panelTitle}>Settings & Support</h3>
          <div className={styles.settingsList}>
            {[
              { icon: 'alert', label: 'Notifications',       sub: 'Ride updates & offers' },
              { icon: 'lock',  label: 'Privacy & Security',  sub: 'Account protection'    },
              { icon: 'refer', label: 'Refer & Earn',        sub: 'Code: ZIPP-RK47',       highlight: true },
              { icon: 'help',  label: 'Help & Support',      sub: 'FAQs and contact us'   },
              { icon: 'rate',  label: 'Rate the App',        sub: 'Share your feedback'   },
              { icon: 'legal', label: 'Terms & Privacy',     sub: 'Legal documents'       },
            ].map(item => (
              <div key={item.label} className={`${styles.settingItem} ${item.highlight ? styles.highlight : ''}`}>
                <Icon name={item.icon} className={styles.settingIcon} title={item.label} />
                <div className={styles.settingText}>
                  <div className={styles.settingLabel}>{item.label}</div>
                  <div className={styles.settingSub}>{item.sub}</div>
                </div>
                <span className={styles.chevron}>›</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
