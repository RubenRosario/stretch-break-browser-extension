import type { HTMLAttributes } from 'react';

/**
 * Shared card container props.
 */
export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * Basic shadcn-style card container.
 */
export function Card({ className, ...props }: CardProps) {
  return (
    <section
      className={[
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

/**
 * Card content wrapper.
 */
export type CardContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * Basic card content wrapper with consistent spacing.
 */
export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={['p-5', className].filter(Boolean).join(' ')} {...props} />;
}
