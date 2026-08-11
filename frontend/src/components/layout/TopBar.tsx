import { useState, useEffect, useRef } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import './TopBar.css';

interface Props {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export function TopBar({ onMenuToggle, menuOpen = false }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Dismiss dropdowns on Escape or outside click
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setUserOpen(false);
      }
    }
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__left">
        {onMenuToggle && (
          <button
            type="button"
            className="topbar__menu-btn"
            onClick={onMenuToggle}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="sidebar"
          >
            <span aria-hidden="true">?</span>
          </button>
        )}
        <Breadcrumbs />
      </div>

      <div className="topbar__right">
        {/* Search */}
        <div className="topbar__search">
          <label htmlFor="global-search" className="sr-only">Search</label>
          <span className="topbar__search-icon" aria-hidden="true">??</span>
          <input
            id="global-search"
            type="search"
            placeholder="Search policies, claims…"
            className="topbar__search-input"
          />
        </div>

        {/* Notifications */}
        <div className="topbar__dropdown" ref={notifRef}>
          <button
            type="button"
            className="topbar__icon-btn"
            onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            aria-haspopup="menu"
          >
            ??
            <span className="topbar__badge" aria-label="3 unread">3</span>
          </button>
          {notifOpen && (
            <div className="topbar__dropdown-panel" role="menu" aria-label="Notifications">
              <p className="topbar__dropdown-heading">Notifications</p>
              <button type="button" className="topbar__notif-item" role="menuitem">Claim #CLM-0042 approved</button>
              <button type="button" className="topbar__notif-item" role="menuitem">Policy #POL-1091 expiring soon</button>
              <button type="button" className="topbar__notif-item" role="menuitem">New customer onboarding pending</button>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="topbar__dropdown" ref={userRef}>
          <button
            type="button"
            className="topbar__avatar"
            onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }}
            aria-label="User menu"
            aria-expanded={userOpen}
            aria-haspopup="menu"
          >
            KM
          </button>
          {userOpen && (
            <div className="topbar__dropdown-panel topbar__dropdown-panel--right" role="menu" aria-label="User menu">
              <p className="topbar__dropdown-heading">Kevin Manu</p>
              <button type="button" className="topbar__menu-item" role="menuitem">Profile</button>
              <button type="button" className="topbar__menu-item" role="menuitem">Settings</button>
              <button type="button" className="topbar__menu-item topbar__menu-item--danger" role="menuitem">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}