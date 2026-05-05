import React, { createContext, useContext, useReducer } from 'react';
import { MOCK_RIDE_HISTORY, SAVED_ADDRESSES } from '../data/mockData';

const AppContext = createContext();
const USERS_STORAGE_KEY = 'zippcab_users';

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

function normalizeAddress(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U';
}

function createFreshUser({ name, contact, email }) {
  return {
    name: name.trim(),
    phone: contact.trim(),
    email: email.trim().toLowerCase(),
    initials: getInitials(name),
    walletBalance: 0,
    memberSince: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    totalRides: 0,
    totalSpent: 0,
  };
}

function getAddressPayload(payload) {
  if (typeof payload !== 'string') return payload;

  const savedAddress = SAVED_ADDRESSES.find(addr =>
    normalizeAddress(addr.address) === normalizeAddress(payload) ||
    normalizeAddress(addr.label) === normalizeAddress(payload)
  );

  return savedAddress
    ? { address: savedAddress.address, coords: savedAddress.coords }
    : { address: payload, coords: null };
}

const initialState = {
  // Auth
  isAuthenticated: false,
  isLoggedIn: false,

  // Booking
  pickup:       '',
  dropoff:      '',
  pickupCoords: null,
  dropoffCoords:null,
  selectedCab:  'bike',
  paymentMethod:'cash',
  promoCode:    '',
  promoApplied: false,
  promoDiscount:0,

  // Booking flow: idle | searching | found | riding | completed
  bookingStatus: 'idle',
  assignedDriver: null,
  activeRide: null,
  rideProgress: 0,

  // History
  rideHistory: MOCK_RIDE_HISTORY,

  // User
  user: {
    name: '',
    phone: '',
    email: '',
    initials: 'AS',
    walletBalance: 0,
    memberSince: '',
    totalRides: 0,
    totalSpent: 0,
  },

  // UI
  activeNav: 'book',
  notification: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      const users = getStoredUsers();
      const email = action.payload.email.trim().toLowerCase();
      const found = users.find(user => user.email === email && user.password === action.payload.password);

      if (!found) {
        return { ...state, notification: { message: 'Invalid email or password', type: 'error' } };
      }

      return {
        ...state,
        isAuthenticated: true,
        isLoggedIn: true,
        user: found.profile,
        activeNav: 'book',
        notification: { message: `Welcome back, ${found.profile.name.split(' ')[0]}!`, type: 'success' },
      };
    }
    case 'SIGN_UP': {
      const users = getStoredUsers();
      const email = action.payload.email.trim().toLowerCase();
      const exists = users.some(user => user.email === email);

      if (exists) {
        return { ...state, notification: { message: 'An account already exists with this email', type: 'error' } };
      }

      const profile = createFreshUser(action.payload);
      saveStoredUsers([...users, { email, password: action.payload.password, profile }]);

      return {
        ...state,
        isAuthenticated: true,
        isLoggedIn: true,
        user: profile,
        activeNav: 'book',
        notification: { message: 'Signup complete. Welcome to ZippCab!', type: 'success' },
      };
    }
    case 'LOGIN_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isLoggedIn: true,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, isAuthenticated: false };
    case 'SET_PICKUP': {
      const pickup = getAddressPayload(action.payload);
      return { ...state, pickup: pickup.address, pickupCoords: pickup.coords };
    }
    case 'SET_DROPOFF': {
      const dropoff = getAddressPayload(action.payload);
      return { ...state, dropoff: dropoff.address, dropoffCoords: dropoff.coords };
    }
    case 'SET_CAB':
      return { ...state, selectedCab: action.payload };
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload };
    case 'APPLY_PROMO':
      return { ...state, promoCode: action.payload.code, promoApplied: true, promoDiscount: action.payload.discount };
    case 'CLEAR_PROMO':
      return { ...state, promoCode: '', promoApplied: false, promoDiscount: 0 };
    case 'SET_BOOKING_STATUS':
      return { ...state, bookingStatus: action.payload };
    case 'SET_ACTIVE_RIDE':
      return { ...state, activeRide: action.payload };
    case 'ASSIGN_DRIVER':
      return { ...state, assignedDriver: action.payload, bookingStatus: 'found' };
    case 'ADD_RIDE':
      return {
        ...state,
        rideHistory: [action.payload, ...state.rideHistory],
        user: {
          ...state.user,
          totalRides: state.user.totalRides + 1,
          totalSpent: action.payload.status === 'completed'
            ? state.user.totalSpent + action.payload.amount
            : state.user.totalSpent,
        },
      };
    case 'SET_RIDE_PROGRESS':
      return { ...state, rideProgress: action.payload };
    case 'COMPLETE_RIDE':
      return {
        ...state,
        bookingStatus: 'completed',
        rideHistory: [action.payload, ...state.rideHistory],
        activeRide: null,
        assignedDriver: null,
        user: {
          ...state.user,
          totalRides: state.user.totalRides + 1,
          totalSpent: state.user.totalSpent + action.payload.amount,
        },
      };
    case 'CANCEL_RIDE':
      return { ...state, bookingStatus: 'idle', assignedDriver: null, activeRide: null, rideProgress: 0 };
    case 'RESET_BOOKING':
      return { ...state, bookingStatus: 'idle', assignedDriver: null, activeRide: null, rideProgress: 0, promoApplied: false, promoDiscount: 0, promoCode: '' };
    case 'SET_NAV':
      return { ...state, activeNav: action.payload };
    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };
    case 'UPDATE_WALLET':
      return { ...state, user: { ...state.user, walletBalance: state.user.walletBalance + action.payload } };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
