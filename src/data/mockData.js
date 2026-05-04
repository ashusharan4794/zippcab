// ===== MOCK DATA =====

export const CAB_TYPES = [
  {
    id: 'bike',
    name: 'Bike',
    icon: 'bike',
    logo: '/bike.png',
    description: 'Affordable',
    ratePerKm: 10,
    baseFare: 20,
    capacity: 1,
    etaMin: 2,
    etaMax: 5,
  },
  {
    id: 'sedan',
    name: 'Sedan',
    icon: 'sedan',
    logo: '/sedan.png',
    description: 'Comfortable & Spacious',
    ratePerKm: 50,
    baseFare: 50,
    capacity: 4,
    etaMin: 5,
    etaMax: 10,
  },
  {
    id: 'suv',
    name: 'SUV',
    icon: 'suv',
    logo: '/SUV.png',
    description: 'Premium family ride',
    ratePerKm: 150,
    baseFare: 100,
    capacity: 6,
    etaMin: 5,
    etaMax: 10,
  },
  {
    id: 'auto',
    name: 'Auto',
    icon: 'auto',
    logo: '/auto.png',
    description: 'Quick & budget-friendly',
    ratePerKm: 25,
    baseFare: 25,
    capacity: 3,
    etaMin: 2,
    etaMax: 5,
  },
];

export const PAYMENT_METHODS = [
  { id: 'cash',   label: 'Cash',   icon: 'cash' },
  { id: 'upi',    label: 'UPI',    icon: 'upi' },
  { id: 'card',   label: 'Card',   icon: 'card' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
];

export const MOCK_DRIVERS = [
  { id: 1, name: 'Arun Kumar',    initials: 'AK', vehicle: 'KA 05 MN 4421', model: 'Bajaj Pulsar',        rating: 4.9, trips: 1240 },
  { id: 2, name: 'Suresh Reddy',  initials: 'SR', vehicle: 'KA 01 AB 7823', model: 'Silver Dzire',       rating: 4.7, trips: 876  },
  { id: 3, name: 'Manoj Singh',   initials: 'MS', vehicle: 'KA 03 CD 5512', model: 'Black Ertiga',       rating: 4.8, trips: 2100 },
  { id: 4, name: 'Prakash Nair',  initials: 'PN', vehicle: 'KA 09 EF 3341', model: 'Grey Bajaj Auto',    rating: 4.6, trips: 530  },
];

export const MOCK_RIDE_HISTORY = [];

export const SAVED_ADDRESSES = [
  { id: 1, label: 'Home',   icon: 'home', address: 'Celebrity Paradise Layout, Electronic City, Bengaluru 560100', coords: [12.8452, 77.6602] },
  { id: 2, label: 'Work',   icon: 'work', address: 'Indiranagar 12th Main, Bengaluru 560008', coords: [12.9784, 77.6408] },
  { id: 3, label: 'Gym',    icon: 'gym', address: 'Cult.fit, Electronic City, Bengaluru 560100', coords: [12.8399, 77.6770] },
  { id: 4, label: 'Koramangala', icon: 'work', address: 'Koramangala 5th Block, Bengaluru', coords: [12.9352, 77.6245] },
  { id: 5, label: 'Airport', icon: 'work', address: 'Kempegowda International Airport, Bengaluru', coords: [13.1986, 77.7066] },
  { id: 6, label: 'Whitefield', icon: 'work', address: 'Whitefield IT Park, Bengaluru', coords: [12.9698, 77.7500] },
  { id: 7, label: 'Jayanagar', icon: 'home', address: 'Jayanagar 4th Block, Bengaluru', coords: [12.9250, 77.5938] },
  { id: 8, label: 'HSR Layout', icon: 'home', address: 'HSR Layout Sector 2, Bengaluru', coords: [12.9121, 77.6446] },
];

export const OFFERS = [
  { id: 'FIRST50', code: 'FIRST50', title: '50% off first ride',  desc: 'Up to ₹100 savings',  color: '#22C55E' },
  { id: 'UPI20',   code: 'UPI20',   title: '20% off on UPI pay',  desc: 'Max discount ₹50',     color: '#3B82F6' },
  { id: 'WEEKEND', code: 'WEEKEND', title: 'Weekend flat fare',   desc: 'Fixed ₹99 under 8km', color: '#F97316' },
];

// Bengaluru coords for map
export const BENGALURU_CENTER = [12.9716, 77.5946];

export const MAP_MARKERS = {
  pickup: [12.9352, 77.6245],   // Koramangala
  dropoff: [13.1986, 77.7066],  // Kempegowda Airport
};
