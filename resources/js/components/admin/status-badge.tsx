import { Badge } from '@/components/ui/badge';

// Color mapping for common status values
const statusColors: Record<string, string> = {
    // Active/inactive states
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive:
        'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
    // Order/transaction statuses
    pending:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    approved:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    // Shipment/fulfillment statuses
    shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    delivered:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    processing:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    // Till session statuses
    open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
    // Gift card / loyalty statuses
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    deactivated:
        'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
    // Draft/received
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
    received:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    void: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    refunded:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

/**
 * Colored badge for status fields.
 * Maps common status strings to appropriate colors; falls back to default for unknowns.
 */
export function StatusBadge({ value }: { value: string }) {
    const colorClass = statusColors[value.toLowerCase()] ?? '';

    return (
        <Badge
            variant="outline"
            className={`border-0 font-medium capitalize ${colorClass}`}
        >
            {value}
        </Badge>
    );
}

/**
 * Simple boolean badge: shows "Active" in green or "Inactive" in gray.
 */
export function ActiveBadge({ active }: { active: boolean }) {
    return <StatusBadge value={active ? 'active' : 'inactive'} />;
}
