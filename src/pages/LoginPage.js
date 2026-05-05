import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import styles from './LoginPage.module.css';

const USERS_STORAGE_KEY = 'zippcab_users';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

function getStoredUsers() {
  try {
    return JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendEmailOtp(email, otp) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error('Email OTP is not set up yet. Add EmailJS keys to .env and restart the app.');
  }

  if (
    EMAILJS_SERVICE_ID.startsWith('replace_with_') ||
    EMAILJS_TEMPLATE_ID.startsWith('replace_with_') ||
    EMAILJS_PUBLIC_KEY.startsWith('replace_with_')
  ) {
    throw new Error('Replace the EmailJS placeholder values in .env, then restart the app.');
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: email,
        otp,
        app_name: 'ZippCab',
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to send OTP email. Check your EmailJS service, template, public key, and template fields.');
  }
}

export default function LoginPage() {
  const { dispatch } = useApp();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', contact: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setOtp('');
    setOtpInput('');
    setOtpSent(false);
  }

  function validateSignup() {
    if (!signupForm.name.trim()) return 'Enter your name';
    if (!/^[0-9+\-\s]{10,15}$/.test(signupForm.contact.trim())) return 'Enter a valid contact number';
    if (!EMAIL_PATTERN.test(signupForm.email.trim())) return 'Enter a valid email address';
    if (signupForm.password.length < 6) return 'Password must be at least 6 characters';

    const email = signupForm.email.trim().toLowerCase();
    if (getStoredUsers().some(user => user.email === email)) {
      return 'An account already exists with this email';
    }

    return '';
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(loginForm.email.trim())) {
      setError('Enter a valid email address');
      return;
    }

    if (!loginForm.password) {
      setError('Enter your password');
      return;
    }

    setError('');
    dispatch({ type: 'LOGIN', payload: loginForm });
  }

  async function sendOtp(event) {
    event.preventDefault();

    const validationError = validateSignup();
    if (validationError) {
      setError(validationError);
      return;
    }

    const nextOtp = createOtp();
    setError('');

    try {
      await sendEmailOtp(signupForm.email.trim().toLowerCase(), nextOtp);
      setOtp(nextOtp);
      setOtpInput('');
      setOtpSent(true);
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: `OTP sent to ${signupForm.email}`, type: 'success' } });
    } catch (err) {
      setError(err.message);
    }
  }

  function verifyOtp(event) {
    event.preventDefault();

    if (otpInput.trim() !== otp) {
      setError('Incorrect OTP');
      return;
    }

    setError('');
    dispatch({ type: 'SIGN_UP', payload: signupForm });
  }

  const isLogin = mode === 'login';

  return (
    <main className={styles.page}>
      <section className={styles.authPanel}>
        <div className={styles.brand}>ZippCab</div>
        <h1 className={styles.title}>{isLogin ? 'Login to your account' : 'Create your account'}</h1>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`} onClick={() => switchMode('login')}>Login</button>
          <button className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`} onClick={() => switchMode('signup')}>Signup</button>
        </div>

        {isLogin ? (
          <form className={styles.form} onSubmit={handleLogin}>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Enter password"
              />
            </label>
            {error && <div className={styles.error}>{error}</div>}
            <button className={styles.primaryBtn} type="submit">Login</button>
            <button className={styles.linkBtn} type="button" onClick={() => switchMode('signup')}>
              New user? Signup
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={otpSent ? verifyOtp : sendOtp}>
            <label className={styles.field}>
              <span>Name</span>
              <input
                value={signupForm.name}
                onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                placeholder="Full name"
                disabled={otpSent}
              />
            </label>
            <label className={styles.field}>
              <span>Contact Number</span>
              <input
                value={signupForm.contact}
                onChange={e => setSignupForm({ ...signupForm, contact: e.target.value })}
                placeholder="+91 98765 43210"
                disabled={otpSent}
              />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                value={signupForm.email}
                onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                placeholder="you@example.com"
                disabled={otpSent}
              />
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                value={signupForm.password}
                onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                placeholder="Minimum 6 characters"
                disabled={otpSent}
              />
            </label>

            {otpSent && (
              <>
                <div className={styles.otpNote}>OTP sent to {signupForm.email}. Check your inbox and enter the code below.</div>
                <label className={styles.field}>
                  <span>Email OTP</span>
                  <input
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    autoFocus
                  />
                </label>
              </>
            )}

            {error && <div className={styles.error}>{error}</div>}
            <button className={styles.primaryBtn} type="submit">{otpSent ? 'Verify & Signup' : 'Send Email OTP'}</button>
            {otpSent && (
              <button className={styles.linkBtn} type="button" onClick={sendOtp}>Resend OTP</button>
            )}
            <button className={styles.linkBtn} type="button" onClick={() => switchMode('login')}>
              Already have credentials? Login
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
