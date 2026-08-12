import './SkeletonLoader.css';

interface Props {
  width?: string;
  height?: string;
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
}

export function SkeletonLoader({ width = '100%', height = '16px', variant = 'rect', className = '' }: Props) {
  return (
    <span
      className={`skeleton skeleton--${variant} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

interface RowsProps { rows?: number; }
export function SkeletonRows({ rows = 4 }: RowsProps) {
  return (
    <div className="skeleton-rows" aria-busy="true" aria-label="Loading…">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLoader key={i} height="14px" width={i % 3 === 2 ? '60%' : '100%'} />
      ))}
    </div>
  );
}
