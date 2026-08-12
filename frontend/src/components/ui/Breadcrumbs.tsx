import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const LABELS: Record<string, string> = {
  '':            'Dashboard',
  dashboard:     'Dashboard',
  customers:     'Customers',
  policies:      'Policies',
  claims:        'Claims',
  billing:       'Billing',
  underwriting:  'Underwriting',
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = [
    { label: 'Dashboard', path: '/' },
    ...segments.map((seg, i) => ({
      label: LABELS[seg] ?? seg,
      path: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ].filter((c, i, arr) => i === 0 || c.label !== arr[i - 1].label);

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.path} className="breadcrumbs__item">
              {isLast ? (
                <span aria-current="page" className="breadcrumbs__current">{crumb.label}</span>
              ) : (
                <>
                  <Link to={crumb.path} className="breadcrumbs__link">{crumb.label}</Link>
                  <span className="breadcrumbs__sep" aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
