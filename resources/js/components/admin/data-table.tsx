import { Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Search,
    Trash2,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

// Column definition for the data table
export type Column<T> = {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
};

// Individual page link from Laravel's paginator
export type PaginationLinkItem = {
    url: string | null;
    label: string;
    active: boolean;
};

// Pagination metadata shape (matches Laravel API resource)
export type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links?: PaginationLinkItem[];
};

export type PaginationLinks = {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
};

type DataTableProps<T> = {
    columns: Column<T>[];
    data: T[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    editUrl?: (item: T) => string;
    deleteAction?: (item: T) => void;
    customActions?: (item: T) => React.ReactNode;
    emptyMessage?: string;
    // Extract unique key for React list rendering
    rowKey: (item: T) => string;
    selectedRowKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
};

/**
 * Generic data table with search, pagination, and row actions.
 * Used across all admin list pages for consistent UI.
 */
export function DataTable<T>({
    columns,
    data,
    meta,
    links,
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
    editUrl,
    deleteAction,
    customActions,
    emptyMessage = 'No records found.',
    rowKey,
    selectedRowKeys = [],
    onSelectionChange,
}: DataTableProps<T>) {
    const [localSearch, setLocalSearch] = useState(searchValue ?? '');

    // Handle search with debounce-like behavior via parent callback
    const handleSearch = useCallback(
        (value: string) => {
            setLocalSearch(value);
            onSearchChange?.(value);
        },
        [onSearchChange],
    );

    const hasActions = editUrl || deleteAction || customActions;

    return (
        <div className="space-y-4">
            {/* Search bar */}
            {onSearchChange && (
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={localSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            {onSelectionChange && (
                                <th className="w-[40px] px-4 py-3">
                                    <Checkbox
                                        checked={
                                            data.length > 0 &&
                                            selectedRowKeys.length ===
                                                data.length
                                        }
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                onSelectionChange(
                                                    data.map(rowKey),
                                                );
                                            } else {
                                                onSelectionChange([]);
                                            }
                                        }}
                                        aria-label="Select all"
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {hasActions && (
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        columns.length +
                                        (hasActions ? 1 : 0) +
                                        (onSelectionChange ? 1 : 0)
                                    }
                                    className="px-4 py-8 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={rowKey(item)}
                                    className={`border-b last:border-0 ${
                                        selectedRowKeys.includes(rowKey(item))
                                            ? 'bg-muted/50'
                                            : ''
                                    }`}
                                >
                                    {onSelectionChange && (
                                        <td className="px-4 py-3">
                                            <Checkbox
                                                checked={selectedRowKeys.includes(
                                                    rowKey(item),
                                                )}
                                                onCheckedChange={(checked) => {
                                                    const key = rowKey(item);

                                                    if (checked) {
                                                        onSelectionChange([
                                                            ...selectedRowKeys,
                                                            key,
                                                        ]);
                                                    } else {
                                                        onSelectionChange(
                                                            selectedRowKeys.filter(
                                                                (k) =>
                                                                    k !== key,
                                                            ),
                                                        );
                                                    }
                                                }}
                                                aria-label="Select row"
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3">
                                            {col.render
                                                ? col.render(item)
                                                : String(
                                                      (
                                                          item as Record<
                                                              string,
                                                              unknown
                                                          >
                                                      )[col.key] ?? '',
                                                  )}
                                        </td>
                                    ))}
                                    {hasActions && (
                                        <td className="flex justify-end gap-1 px-4 py-3">
                                            {editUrl && (
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Link href={editUrl(item)}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {deleteAction && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        deleteAction(item)
                                                    }
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            )}
                                            {customActions?.(item)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing {meta.from} to {meta.to} of {meta.total} results
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            disabled={!links?.prev}
                        >
                            <Link
                                href={links?.prev ?? '#'}
                                preserveState
                                preserveScroll
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </Link>
                        </Button>

                        {/* Page number buttons from Laravel paginator links */}
                        {meta.links?.map((link, i) => {
                            // Laravel wraps Previous/Next with HTML entities in labels — skip those
                            const label = link.label
                                .replace(/&[a-z]+;/gi, '')
                                .trim();

                            if (
                                !label ||
                                label === 'Previous' ||
                                label === 'Next'
                            ) {
                                return null;
                            }

                            return (
                                <Button
                                    key={i}
                                    asChild
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    className="min-w-9"
                                >
                                    <Link
                                        href={link.url ?? '#'}
                                        preserveState
                                        preserveScroll
                                    >
                                        {label}
                                    </Link>
                                </Button>
                            );
                        })}

                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            disabled={!links?.next}
                        >
                            <Link
                                href={links?.next ?? '#'}
                                preserveState
                                preserveScroll
                            >
                                Next
                                <ChevronRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
