import { useState } from 'react';
import { PillButton } from '@/components/store/pill-button';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
};

/**
 * Minimal inline newsletter subscribe form.
 * Posts to /newsletter/subscribe (placeholder endpoint).
 */
export function NewsletterForm({ className }: Props) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            return;
        }

        // Placeholder: would post to backend
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <p className={cn('text-sm font-medium text-primary', className)}>
                Thank you for subscribing!
            </p>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'flex w-full max-w-md flex-col gap-3 sm:flex-row',
                className,
            )}
        >
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
            <PillButton type="submit" size="default">
                Subscribe
            </PillButton>
        </form>
    );
}
