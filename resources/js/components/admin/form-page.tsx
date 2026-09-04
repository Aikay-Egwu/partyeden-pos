import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Wrapper layout for create/edit form pages.
 * Shows a back link and page title, then renders children inside a form-friendly container.
 */
export function FormPage({
    title,
    backUrl,
    backLabel = 'Back to list',
    children,
}: {
    title: string;
    backUrl: string;
    backLabel?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-6 p-4">
            {/* Back navigation */}
            <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link href={backUrl}>
                    <ArrowLeft className="size-4" />
                    {backLabel}
                </Link>
            </Button>

            {/* Page title */}
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

            {/* Form content */}
            <div className="max-w-2xl space-y-6">{children}</div>
        </div>
    );
}
