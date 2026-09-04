import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const messages = [
    'Free Next Day Delivery over £75',
    'Personalised Balloons Made to Order',
    'Same Day Dispatch',
];

/**
 * Thin sticky announcement bar with auto-rotating messages.
 * Uses a CSS fade transition for message cycling.
 */
export function AnnouncementBar() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out, change message, fade in
            setVisible(false);
            setTimeout(() => {
                setActiveIndex((prev) => (prev + 1) % messages.length);
                setVisible(true);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="sticky top-0 z-50 border-b border-border/50 bg-secondary/60 backdrop-blur-sm">
            <div className="flex h-9 items-center justify-center px-4">
                <p
                    className={cn(
                        'text-xs font-medium text-secondary-foreground/80 transition-opacity duration-300',
                        visible ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    {messages[activeIndex]}
                </p>
            </div>
        </div>
    );
}
