import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectOption {
    id: string;
    name: string;
    sku?: string | null;
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * A searchable dropdown/combobox component for selecting from potentially
 * large lists of options. Filters options client-side by name and SKU
 * as the user types in the built-in search input.
 *
 * Styled to match the existing shadcn/ui SelectTrigger/SelectContent pattern
 * for visual consistency across the admin interface.
 */
export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter options by search text (name and SKU)
    const filtered = options.filter((o) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            o.name.toLowerCase().includes(s) ||
            o.sku?.toLowerCase().includes(s)
        );
    });

    const selected = options.find((o) => o.id === value);

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (open) {
            // Small delay to allow the DOM to render the input
            requestAnimationFrame(() => inputRef.current?.focus());
            setActiveIndex(0);
        }
    }, [open]);

    // Reset active index when filtered results change
    useEffect(() => {
        setActiveIndex(0);
    }, [search]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filtered[activeIndex]) {
                    onChange(filtered[activeIndex].id);
                    setOpen(false);
                    setSearch('');
                }
                break;
            case 'Escape':
                setOpen(false);
                setSearch('');
                break;
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (listRef.current && activeIndex >= 0) {
            const active = listRef.current.children[activeIndex] as
                | HTMLElement
                | undefined;
            active?.scrollIntoView?.({ block: 'nearest' });
        }
    }, [activeIndex]);

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {/* Trigger button — styled like SelectTrigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={cn(
                    'border-input data-[placeholder]:text-muted-foreground',
                    'focus-visible:border-ring focus-visible:ring-ring/50',
                    'flex h-9 w-full items-center justify-between gap-2 rounded-md border',
                    'bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs',
                    'transition-[color,box-shadow] outline-none focus-visible:ring-[3px]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
                )}
            >
                <span
                    className={cn(
                        'truncate',
                        !selected && 'text-muted-foreground',
                    )}
                >
                    {selected ? selected.name : placeholder}
                </span>
                <ChevronDown className="size-4 opacity-50" />
            </button>

            {/* Dropdown popover — styled like SelectContent */}
            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                    {/* Search input row */}
                    <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 size-4 shrink-0 opacity-50" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search by name or SKU…"
                            className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Options list — styled like SelectItem */}
                    <ul
                        ref={listRef}
                        className="max-h-60 overflow-y-auto p-1"
                        role="listbox"
                    >
                        {filtered.length === 0 ? (
                            <li className="py-6 text-center text-sm text-muted-foreground">
                                No products found.
                            </li>
                        ) : (
                            filtered.map((option, i) => (
                                <li
                                    key={option.id}
                                    role="option"
                                    aria-selected={option.id === value}
                                    onClick={() => {
                                        onChange(option.id);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={cn(
                                        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 pr-8 text-sm outline-none',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        i === activeIndex &&
                                            'bg-accent text-accent-foreground',
                                    )}
                                >
                                    <span className="flex-1 truncate">
                                        {option.name}
                                    </span>
                                    {option.sku && (
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {option.sku}
                                        </span>
                                    )}
                                    {option.id === value && (
                                        <span className="absolute right-2 flex size-3.5 items-center justify-center">
                                            <Check className="size-4" />
                                        </span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
