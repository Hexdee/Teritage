import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-muted disabled:opacity-70 disabled:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:opacity-90',
        momo: 'bg-momo text-momo-foreground hover:bg-momo',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-primary-foreground text-muted-foreground hover:opacity-80',
        ghost: 'hover:bg-card hover:text-muted-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-4 py-2 rounded-md w-full',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-14 drounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  iconSize?: number;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, startIcon, loadingText, endIcon, isLoading, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn('flex items-center space-x-2', buttonVariants({ variant, size, className }))} disabled={isLoading} ref={ref} {...props}>
        {startIcon && React.cloneElement(startIcon as React.ReactElement)}
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            {loadingText}
          </div>
        ) : (
          <React.Fragment>{props.children}</React.Fragment>
        )}

        {endIcon && React.cloneElement(endIcon as React.ReactElement)}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
