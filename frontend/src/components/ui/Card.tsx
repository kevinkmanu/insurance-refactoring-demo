import type { ReactNode } from 'react';
import './Card.css';

interface Props {
  title?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ title, children, className = '', noPadding = false }: Props) {
  return (
    <section className={`card ${className}`} aria-label={title}>
      {title && <div className="card__header"><h2 className="card__title">{title}</h2></div>}
      <div className={noPadding ? '' : 'card__body'}>{children}</div>
    </section>
  );
}
