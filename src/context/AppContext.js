import React, { createContext, useContext, useReducer } from 'react';
import { MOCK_RIDE_HISTORY, SAVED_ADDRESSES } from '../data/mockData';

const AppContext = createContext();

function normalizeAddress(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
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
    name: 'Ashu Sharan',
    phone: '+91 72958 67927',
    initials: 'AS',
    walletBalance: 0,
    memberSince: 'March 2026',
    totalRides: 0,
    totalSpent: 0,
  },

  // UI
  activeNav: 'book',
  notification: null,
};

function reducer(state, action) {
  switch (action.type) {
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
