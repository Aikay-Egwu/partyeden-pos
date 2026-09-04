import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const pillButtonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/85 hover:shadow-md',
                secondary:
                    'border-2 border-foreground/10 bg-background text-foreground hover:border-foreground/20 hover:bg-muted/50',
                ghost: 'text-foreground/70 hover:bg-muted hover:text-foreground',
            },
            size: {
                default: 'h-11 px-7 has-[>svg]:px-5',
                sm: 'h-9 px-5 text-xs has-[>svg]:px-4',
                lg: 'h-13 px-9 text-base has-[>svg]:px-6',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function PillButton({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof pillButtonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="pill-button"
            className={cn(pillButtonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { PillButton, pillButtonVariants };
