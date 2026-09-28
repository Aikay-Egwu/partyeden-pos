import { Search } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

type CatalogType = 'products' | 'categories';

type Props = {
    initialType?: CatalogType;
    placeholder?: string;
    value?: string;
    variant?: 'default' | 'header';
    className?: string;
};

export function CatalogSearch({
    initialType = 'products',
    placeholder = 'Search themes, ages, balloons...',
    value,
    variant = 'default',
    className,
}: Props) {
    const id = useId();
    const [type, setType] = useState<CatalogType>(initialType);

    return (
        <form
            action={type === 'categories' ? '/categories' : '/products'}
            method="get"
            role="search"
            className={cn(
                variant === 'header'
                    ? 'search-box catalog-search'
                    : 'flex h-12 w-full items-center gap-2 rounded-full border border-popjoy-divider bg-white px-4 shadow-sm transition focus-within:border-popjoy-purple focus-within:ring-2 focus-within:ring-popjoy-purple/20',
                className,
            )}
        >
            <Search
                aria-hidden="true"
                className={
                    variant === 'header'
                        ? 'shrink-0'
                        : 'size-5 shrink-0 text-popjoy-muted'
                }
            />
            <label className="sr-only" htmlFor={`${id}-query`}>
                Search products or categories
            </label>
            <input
                id={`${id}-query`}
                type="search"
                name="search"
                maxLength={100}
                defaultValue={value}
                placeholder={placeholder}
                className={
                    variant === 'header'
                        ? 'min-w-0 flex-1'
                        : 'min-w-0 flex-1 bg-transparent text-sm text-popjoy-ink outline-none placeholder:text-popjoy-muted'
                }
            />
            <label className="sr-only" htmlFor={`${id}-type`}>
                Search in
            </label>
            <select
                id={`${id}-type`}
                value={type}
                onChange={(event) =>
                    setType(
                        event.target.value === 'categories'
                            ? 'categories'
                            : 'products',
                    )
                }
                className={
                    variant === 'header'
                        ? 'catalog-search__scope'
                        : 'h-9 shrink-0 border-l border-popjoy-divider bg-transparent pl-2 text-xs font-semibold text-popjoy-purple outline-none focus-visible:ring-2 focus-visible:ring-popjoy-purple'
                }
            >
                <option value="products">Products</option>
                <option value="categories">Categories</option>
            </select>
            <button
                type="submit"
                aria-label="Search"
                className={
                    variant === 'header'
                        ? 'catalog-search__submit'
                        : 'flex size-9 shrink-0 items-center justify-center rounded-full bg-popjoy-purple text-white transition-colors hover:bg-popjoy-purple/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple'
                }
            >
                <Search aria-hidden="true" className="size-4" />
            </button>
        </form>
    );
}
