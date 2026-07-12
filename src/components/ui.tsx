import React from 'react';
import { cn } from '../lib/cn';

export function Button({
  className,
  variant = 'brand',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'brand' | 'ghost' | 'outline' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none';
  const sizes = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
    icon: 'p-2.5',
  };
  const variants = {
    brand: 'btn-brand shadow-lg shadow-brand-700/20',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5',
    outline: 'border border-white/15 text-white hover:bg-white/5',
    danger: 'bg-red-500/90 text-white hover:bg-red-500',
    subtle: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props} />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('glass rounded-2xl p-4', className)}>{children}</div>;
}

export function SectionTitle({
  icon,
  title,
  hint,
  right,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-brand-300">{icon}</span>}
        <h3 className="text-sm font-semibold tracking-wide text-white/90">{title}</h3>
      </div>
      {right ?? (hint && <span className="text-[11px] text-white/40">{hint}</span>)}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  format?: (v: number) => string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/70">{label}</span>
        <span className="text-xs font-medium text-brand-300 tabular-nums">
          {format ? format(value) : `${value}${suffix ?? ''}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border',
        active
          ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white border-transparent shadow-md shadow-brand-700/30'
          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10',
      )}
    >
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-white/15 border-t-brand-400',
        className ?? 'h-5 w-5',
      )}
    />
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in">
      <div className="mb-4 text-5xl opacity-80">{icon}</div>
      <h3 className="text-base font-semibold text-white/90">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-white/50 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition',
          checked ? 'bg-gradient-to-r from-brand-500 to-accent-500' : 'bg-white/15',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
      {label && <span className="text-xs text-white/70">{label}</span>}
    </label>
  );
}
