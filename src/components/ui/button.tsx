import type { ButtonHTMLAttributes } from 'react';

/**
 * Props for the shared Button component.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional visual variant. */
  variant?: 'default' | 'secondary';
}

/**
 * Minimal shadcn-style button component for shared extension UI.
 */
export function Button({
  className,
  variant = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:brightness-95',
    secondary: 'bg-muted text-foreground hover:bg-muted/80'
  };

  return (
    <button
      className={[base, variants[variant], className].filter(Boolean).join(' ')}
      type={type}
      {...props}
    />
  );
}
