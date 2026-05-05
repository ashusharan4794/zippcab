import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Topbar from './components/Topbar';
import Notification from './components/Notification';
import BookPage from './pages/BookPage';
import RidesPage from './pages/RidesPage';
import AccountPage from './pages/AccountPage';
import AuthPage from './pages/AuthPage';
import './index.css';

function AppShell() {
  const { state } = useApp();

  if (!state.isLoggedIn) {
    return <AuthPage />;
  }

  const pages = {
    book:    <BookPage />,
    rides:   <RidesPage />,
    account: <AccountPage />,
  };

  return (
    <div className="appShell">
      <Topbar />
      <main className="appMain">
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
