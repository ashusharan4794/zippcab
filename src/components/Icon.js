import React from 'react';

const ICONS = {
  mini: (
    <>
      <path d="M5 14.5 6.4 11a3 3 0 0 1 2.8-2h5.6a3 3 0 0 1 2.8 2l1.4 3.5" />
      <path d="M6.2 14.5h11.6a1.7 1.7 0 0 1 1.7 1.7V17H4.5v-.8a1.7 1.7 0 0 1 1.7-1.7Z" />
      <path d="M8.2 12h7.6M9.5 9.2 8.7 12M14.5 9.2l.8 2.8" />
      <circle cx="7.5" cy="17" r="1.4" />
      <circle cx="16.5" cy="17" r="1.4" />
    </>
  ),
  sedan: (
    <>
      <path d="M3.8 14.5h16.4l-2.3-3.7A3.8 3.8 0 0 0 14.6 9H9.4a3.8 3.8 0 0 0-3.3 1.8l-2.3 3.7Z" />
      <path d="M5.2 14.5v2h13.6v-2M8.3 12h7.4M10 9.1 9.1 12M14 9.1l.9 2.9" />
      <circle cx="7.2" cy="17" r="1.4" />
      <circle cx="16.8" cy="17" r="1.4" />
    </>
  ),
  suv: (
    <>
      <path d="M4.5 15V9.8A2.8 2.8 0 0 1 7.3 7h7.9a3 3 0 0 1 2.5 1.3l1.8 2.7v4" />
      <path d="M5.5 15h14v2H4.5v-1a1 1 0 0 1 1-1ZM8 10.5h8.5M9 7v3.5M14 7v3.5" />
      <circle cx="7.3" cy="17" r="1.4" />
      <circle cx="16.7" cy="17" r="1.4" />
    </>
  ),
  auto: (
    <>
      <path d="M5.5 16V10.8A2.8 2.8 0 0 1 8.3 8h5.4l3.8 3.8V16" />
      <path d="M8.5 8v8M13.7 8l3.8 8M5 12.2h3.5M17.5 12.2H20" />
      <path d="M6 16h12" />
      <circle cx="8" cy="17" r="1.4" />
      <circle cx="17" cy="17" r="1.4" />
    </>
  ),
  cash: (
    <>
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7 10h1M16 14h1" />
    </>
  ),
  upi: (
    <>
      <rect x="8" y="3.5" width="8" height="17" rx="2" />
      <path d="M10.5 17.5h3M11 7h2M11 10l2 2-2 2M13 10l2 2-2 2" />
    </>
  ),
  card: (
    <>
      <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
      <path d="M3.5 10h17M7 14h4" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5.8A1.8 1.8 0 0 1 4 16.7V7.5Z" />
      <path d="M4 8.5 15.5 5.5A2 2 0 0 1 18 7.4v1.1" />
      <path d="M16 13h4" />
    </>
  ),
  offer: (
    <>
      <path d="M4.5 10.5V7a1.5 1.5 0 0 1 1.5-1.5h3.5l9 9a1.8 1.8 0 0 1 0 2.5L16 19.5a1.8 1.8 0 0 1-2.5 0l-9-9Z" />
      <circle cx="8.2" cy="8.2" r="1.2" />
      <path d="M12 10.5 9.8 15M14.2 15l-2.2-4.5" />
    </>
  ),
  empty: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M8.5 10h7M8.5 13h4.5M15.5 16.5l2 2M18 16l-2.5 2.5" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6.5 10.5V19h11v-8.5" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  work: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="1.8" />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8M5 12h14M12 12v2" />
    </>
  ),
  gym: (
    <>
      <path d="M6 9v6M18 9v6M3.5 11v2M20.5 11v2M8 12h8" />
      <path d="M4.8 10h2.4v4H4.8zM16.8 10h2.4v4h-2.4z" />
    </>
  ),
  alert: (
    <>
      <path d="M18 16v-5a6 6 0 0 0-12 0v5l-1.5 2h15L18 16Z" />
      <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10" width="13" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10M12 14v2.5" />
    </>
  ),
  refer: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <path d="M16.5 8.5h3M18 7v3M16 15l2 2 3-4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.8 9.5a2.3 2.3 0 1 1 3.6 1.9c-.9.6-1.4 1.1-1.4 2.1" />
      <path d="M12 16.7v.1" />
    </>
  ),
  rate: (
    <>
      <path d="m12 4 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 4Z" />
    </>
  ),
  legal: (
    <>
      <path d="M7 4.5h7l3 3V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z" />
      <path d="M14 4.5V8h3M8 12h8M8 15h8M8 18h5" />
    </>
  ),
};

export default function Icon({ name, className, title }) {
  const key = String(name || '').toLowerCase();
  const paths = ICONS[key] || ICONS.help;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {paths}
    </svg>
  );
}
