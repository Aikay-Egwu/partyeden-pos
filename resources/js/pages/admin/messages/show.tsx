import { Head, router, useForm } from '@inertiajs/react';
import { Mail, Reply, Send, Trash2 } from 'lucide-react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    event_type: string;
    event_date: string | null;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    admin_reply: string | null;
    replied_at: string | null;
    read_at: string | null;
    ip_address: string | null;
    created_at: string;
};

type Props = {
    message: Message;
};

const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-800',
    replied: 'bg-green-100 text-green-800',
    archived: 'bg-gray-50 text-gray-500',
};

export default function MessageShow({ message }: Props) {
    const {
        data: replyData,
        setData: setReplyData,
        post: postReply,
        processing: replyProcessing,
        errors: replyErrors,
    } = useForm({
        reply: '',
    });

    const {
        data: statusData,
        setData: setStatusData,
        patch: patchStatus,
        processing: statusProcessing,
    } = useForm({
        status: message.status,
    });

    function handleDelete() {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(`/admin/messages/${message.id}`);
        }
    }

    function handleReply(e: React.FormEvent) {
        e.preventDefault();
        postReply(`/admin/messages/${message.id}/reply`, {
            onSuccess: () => setReplyData('reply', ''),
        });
    }

    return (
        <>
            <Head
                title={`Message from ${message.first_name} ${message.last_name}`}
            />
            <FormPage
                title={`Message from ${message.first_name} ${message.last_name}`}
                backUrl="/admin/messages"
            >
                <div className="space-y-6">
                    {/* Status bar with actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <span
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-semibold',
                                    statusColors[message.status] ?? '',
                                )}
                            >
                                {message.status}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Received{' '}
                                {new Date(
                                    message.created_at,
                                ).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`mailto:${message.email}?subject=Re: Your Party Eden Enquiry`}
                                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                            >
                                <Mail className="size-3.5" />
                                Email directly
                            </a>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-1.5 size-3.5" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* Contact details */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-4 font-semibold">Contact Details</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium">Name</p>
                                <p className="text-sm text-muted-foreground">
                                    {message.first_name} {message.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">
                                    <a
                                        href={`mailto:${message.email}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {message.email}
                                    </a>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Phone</p>
                                <p className="text-sm text-muted-foreground">
                                    {message.phone ? (
                                        <a
                                            href={`tel:${message.phone}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {message.phone}
                                        </a>
                                    ) : (
                                        '-'
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    Event Type
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {message.event_type}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    Event Date
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {message.event_date
                                        ? new Date(
                                              message.event_date,
                                          ).toLocaleDateString('en-GB', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric',
                                          })
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    IP Address
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {message.ip_address ?? '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Message body */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-3 font-semibold">Message</h3>
                        <p className="text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
                            {message.message}
                        </p>
                    </div>

                    {/* Previous reply (if any) */}
                    {message.admin_reply && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Reply className="size-4 text-green-700" />
                                <h3 className="font-semibold text-green-800">
                                    Your reply
                                </h3>
                                {message.replied_at && (
                                    <span className="text-xs text-green-600">
                                        sent{' '}
                                        {new Date(
                                            message.replied_at,
                                        ).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm leading-7 whitespace-pre-wrap text-green-900">
                                {message.admin_reply}
                            </p>
                        </div>
                    )}

                    {/* Reply form */}
                    <form
                        onSubmit={handleReply}
                        className="space-y-4 rounded-lg border p-4"
                    >
                        <h3 className="font-semibold">
                            {message.admin_reply
                                ? 'Send another reply'
                                : 'Reply to sender'}
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="reply">
                                Your reply to {message.first_name}
                            </Label>
                            <textarea
                                id="reply"
                                rows={6}
                                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                value={replyData.reply}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) => setReplyData('reply', e.target.value)}
                                placeholder={`Hi ${message.first_name}, thanks for getting in touch...`}
                                required
                            />
                            <InputError message={replyErrors.reply} />
                        </div>
                        <Button
                            type="submit"
                            disabled={replyProcessing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {replyProcessing ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send className="mr-1.5 size-4" />
                                    Send Reply
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Status management */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            patchStatus(`/admin/messages/${message.id}/status`);
                        }}
                        className="flex items-end gap-4 rounded-lg border p-4"
                    >
                        <div className="space-y-2">
                            <Label>Message Status</Label>
                            <Select
                                value={statusData.status}
                                onValueChange={(value) =>
                                    setStatusData(
                                        'status',
                                        value as typeof statusData.status,
                                    )
                                }
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="replied">
                                        Replied
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            disabled={
                                statusProcessing ||
                                statusData.status === message.status
                            }
                        >
                            Update Status
                        </Button>
                    </form>
                </div>
            </FormPage>
        </>
    );
}
