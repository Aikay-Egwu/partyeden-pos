import { cn } from '@/lib/utils';

type Props = {
    children: React.ReactNode;
    /** Section heading */
    title?: string;
    /** Subtitle below heading */
    subtitle?: string;
    /** Additional container classes */
    className?: string;
    /** Whether to use a pastel background */
    background?: boolean;
    /** HTML id for anchor linking */
    id?: string;
};

/**
 * Consistent section wrapper with generous vertical spacing (80-140px).
 * Provides optional heading, subtitle, and pastel background.
 */
export function SectionWrapper({
    children,
    title,
    subtitle,
    className,
    background,
    id,
}: Props) {
    return (
        <section
            id={id}
            className={cn(
                'py-16 md:py-24',
                // Break out of the layout container to achieve full-width backgrounds
                background &&
                    '-mx-4 -my-6 bg-secondary/30 px-4 py-16 sm:-mx-6 sm:px-6 sm:py-20 md:py-24 lg:-mx-8 lg:px-8 lg:py-28',
                className,
            )}
        >
            <div className={cn(!background && 'mx-auto max-w-7xl')}>
                {(title || subtitle) && (
                    <div className="mb-10 text-center">
                        {title && (
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
}
