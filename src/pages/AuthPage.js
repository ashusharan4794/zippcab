import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import emailjs from '@emailjs/browser';
import styles from './AuthPage.module.css';

const SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const USERS_STORAGE_KEY = 'zippcab_users';
const EMAIL_EXISTS_ERROR = 'The email id already exists.';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getStoredUsers() {
  try {
    return JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Local storage may be unavailable in restricted browser modes.
  }
}

function emailAlreadyExists(email) {
  const normalizedEmail = email.trim().toLowerCase();
  return getStoredUsers().some(user => user.email === normalizedEmail);
}

export default function AuthPage() {
  const { dispatch } = useApp();
  const [tab, setTab]             = useState('login');   // login | signup
  const [step, setStep]           = useState(1);         // 1=form, 2=otp
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');

  // Form fields
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');

  function reset() {
    setStep(1); setError(''); setSuccess('');
    setName(''); setPhone(''); setEmail('');
    setPassword(''); setEnteredOTP(''); setGeneratedOTP('');
  }

  async function handleSendOTP() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address'); return;
    }
    if (!password) {
      setError('Please enter your password'); return;
    }

    if (tab === 'login') {
      const user = getStoredUsers().find(
        savedUser => savedUser.email === email.trim().toLowerCase() && savedUser.password === password
      );

      if (!user) {
        setError('Invalid email or password'); return;
      }

      dispatch({ type: 'LOGIN_USER', payload: user.profile });
      return;
    }

    if (tab === 'signup' && (!name || !phone)) {
      setError('Please fill in all fields'); return;
    }
    if (emailAlreadyExists(email)) {
      setError(EMAIL_EXISTS_ERROR); return;
    }

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setError('EmailJS is not configured. Please add keys to .env file'); return;
    }

    setLoading(true);
    setError('');

    const otp = generateOTP();
    setGeneratedOTP(otp);

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email: email,
          to_name:  name || email.split('@')[0],
          otp_code: otp,
        },
        PUBLIC_KEY
      );
      setStep(2);
      setSuccess(`OTP sent to ${email}`);
    } catch (err) {
      setError('Failed to send OTP. Please check your EmailJS configuration.');
      console.error('EmailJS error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleVerifyOTP() {
    if (!enteredOTP) { setError('Please enter the OTP'); return; }
    if (enteredOTP === generatedOTP) {
      if (emailAlreadyExists(email)) {
        setError(EMAIL_EXISTS_ERROR);
        setStep(1);
        return;
      }

      const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : email.slice(0, 2).toUpperCase();
      const normalizedEmail = email.trim().toLowerCase();
      const profile = {
        name:         name || email.split('@')[0],
        phone:        phone || '',
        email:        normalizedEmail,
        initials:     initials,
        walletBalance: 0,
        memberSince:  new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        totalRides:   0,
        totalSpent:   0,
      };

      saveStoredUsers([...getStoredUsers(), { email: normalizedEmail, password, profile }]);
      setTab('login');
      setStep(1);
      setName('');
      setPhone('');
      setPassword('');
      setEnteredOTP('');
      setGeneratedOTP('');
      setError('');
      setSuccess('Signup successful. Please login with your email and password.');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logo}>ZIPP<span>cab</span></div>
        <div className={styles.subtitle}>
          {step === 1
            ? tab === 'signup' ? 'Create your account' : 'Welcome back'
            : 'Enter the OTP sent to your email'}
        </div>

        {/* Tabs */}
        {step === 1 && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => { setTab('login'); reset(); }}
            >Login</button>
            <button
              className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
              onClick={() => { setTab('signup'); reset(); }}
            >Sign Up</button>
          </div>
        )}

        {/* Step 1 — Form */}
        {step === 1 && (
          <div className={styles.form}>
            {tab === 'signup' && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    className={styles.input}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    className={styles.input}
                    placeholder="Enter your mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                className={styles.input}
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error   && <div className={styles.error}>{error}</div>}

            <button
              className={styles.mainBtn}
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Sending OTP...' : tab === 'signup' ? 'Send Email OTP' : 'Login'}
            </button>

            {success && <div className={styles.successMsg}>{success}</div>}

            <div className={styles.switchText}>
              {tab === 'login'
                ? <>Don't have an account? <button className={styles.switchBtn} onClick={() => { setTab('signup'); reset(); }}>Sign Up</button></>
                : <>Already have credentials? <button className={styles.switchBtn} onClick={() => { setTab('login'); reset(); }}>Login</button></>
              }
            </div>
          </div>
        )}

        {/* Step 2 — OTP Entry */}
        {step === 2 && (
          <div className={styles.form}>
            {success && <div className={styles.successMsg}>{success}</div>}
            <div className={styles.otpHint}>
              Check your inbox at <strong>{email}</strong> for a 6-digit code
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Enter OTP</label>
              <input
                className={`${styles.input} ${styles.otpInput}`}
                placeholder="123456"
                maxLength={6}
                value={enteredOTP}
                onChange={e => setEnteredOTP(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button className={styles.mainBtn} onClick={handleVerifyOTP}>
              Verify OTP & Continue
            </button>

            <button className={styles.resendBtn} onClick={() => { setStep(1); setError(''); setSuccess(''); }}>
              ← Back / Resend OTP
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
