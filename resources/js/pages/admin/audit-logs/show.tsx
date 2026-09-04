import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AuditLog = {
    id: string;
    event: string;
    auditable_type: string | null;
    auditable_id: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    description: string | null;
    created_at: string;
    user?: { id: string; name: string } | null;
};

type Props = {
    log: AuditLog;
};

/**
 * Audit log detail page (read-only).
 * Shows full audit record with old/new values.
 */
export default function AuditLogShow({ log }: Props) {
    return (
        <>
            <Head title={`Audit Log - ${log.event}`} />
            <div className="space-y-6 p-4">
                <Button asChild variant="ghost" size="sm" className="gap-1">
                    <Link href="/admin/audit-logs">
                        <ArrowLeft className="size-4" />
                        Back to audit logs
                    </Link>
                </Button>

                <h1 className="text-2xl font-semibold tracking-tight">
                    Audit Log Detail
                </h1>

                {/* Basic info */}
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Event
                        </span>
                        <p className="text-sm font-medium capitalize">
                            {log.event}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Entity
                        </span>
                        <p className="text-sm font-medium">
                            {log.auditable_type ?? '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Entity ID
                        </span>
                        <p className="font-mono text-sm font-medium">
                            {log.auditable_id ?? '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            User
                        </span>
                        <p className="text-sm font-medium">
                            {log.user?.name ?? 'System'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            IP Address
                        </span>
                        <p className="font-mono text-sm font-medium">
                            {log.ip_address ?? '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Timestamp
                        </span>
                        <p className="text-sm font-medium">
                            {new Date(log.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Description */}
                {log.description && (
                    <div className="rounded-lg border p-4">
                        <span className="text-sm font-medium">Description</span>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {log.description}
                        </p>
                    </div>
                )}

                {/* Old values */}
                {log.old_values && Object.keys(log.old_values).length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-medium text-red-600">
                            Old Values
                        </h2>
                        <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs">
                            {JSON.stringify(log.old_values, null, 2)}
                        </pre>
                    </div>
                )}

                {/* New values */}
                {log.new_values && Object.keys(log.new_values).length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-medium text-green-600">
                            New Values
                        </h2>
                        <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-xs">
                            {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                    </div>
                )}

                {/* User agent */}
                {log.user_agent && (
                    <div className="rounded-lg border p-4">
                        <span className="text-sm font-medium">User Agent</span>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            {log.user_agent}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
