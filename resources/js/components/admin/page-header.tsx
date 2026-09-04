import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Page header with title, optional description, and optional "Create" action button.
 */
export function PageHeader({
    title,
    description,
    createUrl,
    createLabel = 'Create',
}: {
    title: string;
    description?: string;
    createUrl?: string;
    createLabel?: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {createUrl && (
                <Button asChild>
                    <Link href={createUrl}>
                        <Plus className="size-4" />
                        {createLabel}
                    </Link>
                </Button>
            )}
        </div>
    );
}
