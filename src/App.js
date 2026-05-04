import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Topbar from './components/Topbar';
import Notification from './components/Notification';
import BookPage from './pages/BookPage';
import RidesPage from './pages/RidesPage';
import AccountPage from './pages/AccountPage';
import './index.css';

function AppShell() {
  const { state } = useApp();

  const pages = {
    book:    <BookPage />,
    rides:   <RidesPage />,
    account: <AccountPage />,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar />
      <main style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {pages[state.activeNav] || <BookPage />}
      </main>
      <Notification />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
