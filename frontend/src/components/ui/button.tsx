import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.55)] hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-8px_hsl(var(--primary)/0.65)]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[0_6px_18px_-6px_hsl(var(--secondary)/0.5)] hover:bg-secondary/90 hover:-translate-y-0.5',
        outline:
          'border border-input bg-background/60 backdrop-blur hover:bg-background hover:border-foreground/30',
        ghost: 'hover:bg-foreground/5',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_6px_18px_-6px_hsl(var(--destructive)/0.5)] hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
