# 🚖 ZIPPcab — React Cab Booking App

A production-grade cab booking frontend built with React.js, perfect for your developer portfolio.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed ([download here](https://nodejs.org))
- npm (comes with Node.js)

### Installation & Run

```bash
# 1. Unzip the project and enter the folder
cd zippcab

# 2. Install all dependencies
npm install

# 3. Start the development server
npm start
```

The app opens at **http://localhost:3000** automatically.

---

## 📁 Project Structure

```
zippcab/
├── public/
│   └── index.html              # HTML template with Google Fonts
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Topbar.js           # Navigation bar
│   │   ├── Topbar.module.css
│   │   ├── MapView.js          # Leaflet map with markers & route
│   │   ├── MapView.module.css
│   │   ├── CabSelector.js      # Mini/Sedan/SUV/Auto picker
│   │   ├── CabSelector.module.css
│   │   ├── FareEstimator.js    # Live fare breakdown + promo codes
│   │   ├── FareEstimator.module.css
│   │   ├── DriverCard.js       # Driver info after booking
│   │   ├── DriverCard.module.css
│   │   ├── Notification.js     # Toast notifications
│   │   └── Notification.module.css
│   ├── pages/
│   │   ├── BookPage.js         # Main booking flow
│   │   ├── BookPage.module.css
│   │   ├── RidesPage.js        # Ride history with filters
│   │   ├── RidesPage.module.css
│   │   ├── AccountPage.js      # Profile, wallet, settings
│   │   └── AccountPage.module.css
│   ├── context/
│   │   └── AppContext.js       # Global state with useReducer
│   ├── hooks/
│   │   └── useFare.js          # Fare calculation hook
│   ├── data/
│   │   └── mockData.js         # Mock drivers, rides, offers
│   ├── App.js                  # Root component
│   ├── index.js                # React entry point
│   └── index.css               # Global CSS variables & resets
└── package.json
```

---

## ✨ Features

### Book Ride Page
- Live location input with saved address suggestions (Home / Work / Gym)
- Swap pickup ↔ dropoff button
- 4 cab types: Mini, Sedan, SUV, Auto — each with different rates
- 4 payment methods: Cash, UPI, Card, Wallet
- Live fare breakdown (base fare + distance + surge + GST)
- Promo code system — try `FIRST50`, `UPI20`, or `WEEKEND`
- Book button triggers driver search → driver assignment animation
- Driver card with name, vehicle, rating, progress bar, call/message/cancel
- Interactive Leaflet map with custom markers, route polyline

### My Rides Page
- Full ride history with expandable detail cards
- Filter by All / Completed / Cancelled
- Stats: total rides, total spent, cancelled count
- Re-book button on completed rides

### Account Page
- Profile with inline name editing
- Wallet balance + top-up flow
- 4 summary stats
- Saved addresses management
- Available promo offers display
- Settings & support menu

---

## 🗺️ Map Setup (Optional Enhancement)

The app uses **OpenStreetMap + Leaflet** (free, no API key needed).

To upgrade to **Google Maps** for real routing:
1. Get a Google Maps API key: https://console.cloud.google.com
2. Install: `npm install @react-google-maps/api`
3. Replace `MapView.js` with the Google Maps implementation

---

## 🔧 Adding a Real Backend

To make this production-ready, connect these services:

### Firebase (Recommended — Free Tier)
```bash
npm install firebase
```
- **Firebase Auth** → Phone OTP login (like Ola/Uber)
- **Firestore** → Store real ride history
- **Realtime Database** → Live driver location tracking

### API Integration Points
All mock data lives in `src/data/mockData.js` and `src/context/AppContext.js`.
Replace the `setTimeout` calls in `BookPage.js` with real API calls.

---

## 🎨 Tech Stack

| Technology        | Purpose                     |
|-------------------|-----------------------------|
| React 18          | UI framework                |
| useReducer + Context | Global state management  |
| CSS Modules       | Scoped component styles     |
| React Leaflet     | Interactive map             |
| OpenStreetMap     | Free map tiles (no API key) |
| Google Fonts      | Syne + DM Sans typography   |

---

## 📌 Resume Talking Points

- **State management** with `useReducer` and React Context (no Redux needed)
- **Custom hooks** — `useFare` for memoized fare calculation
- **CSS Modules** for zero-conflict component styling
- **Map integration** with Leaflet + OpenStreetMap
- **Optimistic UI** — instant feedback before "API" response
- **Component architecture** — reusable, single-responsibility components

---

## 🌐 Deployment

Deploy free on Vercel:
```bash
npm install -g vercel
vercel
```

Or Netlify:
```bash
npm run build
# drag the /build folder to netlify.com/drop
```

---

Built with ❤️ — ZIPPcab Portfolio Project
