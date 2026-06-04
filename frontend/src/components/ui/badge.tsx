import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'accent';
}) {
  const variants: Record<string, string> = {
    default: 'bg-primary/12 text-primary ring-1 ring-inset ring-primary/15',
    secondary: 'bg-secondary/15 text-secondary ring-1 ring-inset ring-secondary/20',
    accent: 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/20',
    outline: 'border border-border bg-background/70 backdrop-blur-sm text-foreground/80',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
