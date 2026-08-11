import { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import type { NavItem } from '../../types';
import './Sidebar.css';

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '⊞', path: '/' },
  { id: 'customers',    label: 'Customers',    icon: '👥', path: '/customers' },
  { id: 'policies',     label: 'Policies',     icon: '📋', path: '/policies' },
  { id: 'claims',       label: 'Claims',       icon: '🗂', path: '/claims' },
  { id: 'billing',      label: 'Billing',      icon: '💳', path: '/billing' },
  { id: 'underwriting', label: 'Underwriting', icon: '🔍', path: '/underwriting' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus to close button when sidebar opens on mobile
  useEffect(() => {
    if (mobileOpen) closeRef.current?.focus();
  }, [mobileOpen]);

  const classNames = [
    'sidebar',
    collapsed ? 'sidebar--collapsed' : '',
    mobileOpen ? 'sidebar--mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <aside
      className={classNames}
      aria-label="Main navigation"
      aria-modal={mobileOpen ? 'true' : undefined}
    >
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">🛡</span>
        {!collapsed && <span className="sidebar__brand-name">InsureAdmin</span>}
        {/* Mobile-only close button */}
        <button
          ref={closeRef}
          type="button"
          className="sidebar__mobile-close"
          onClick={onMobileClose}
          aria-label="Close navigation"
        >
          ✕
        </button>
      </div>

      <nav>
        <ul className="sidebar__nav" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                onClick={() => onMobileClose()}
              >
                <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>
                {!collapsed && <span className="sidebar__label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <span aria-hidden="true">{collapsed ? '▶' : '◀'}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
