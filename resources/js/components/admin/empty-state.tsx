import { Inbox } from 'lucide-react';

/**
 * Empty state placeholder for list pages with no data.
 */
export function EmptyState({
    title = 'No records found',
    description = 'Get started by creating your first record.',
}: {
    title?: string;
    description?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="mb-4 size-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
