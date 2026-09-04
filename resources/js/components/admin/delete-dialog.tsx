import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

/**
 * Delete confirmation dialog with Inertia form submission.
 * Shows a modal asking for confirmation before performing a DELETE request.
 */
export function DeleteDialog({
    open,
    onOpenChange,
    deleteUrl,
    itemName,
    resource = 'item',
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deleteUrl: string;
    itemName?: string;
    resource?: string;
}) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(deleteUrl, {
            onSuccess: () => onOpenChange(false),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {resource}</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        {itemName ? (
                            <strong>{itemName}</strong>
                        ) : (
                            `this ${resource.toLowerCase()}`
                        )}
                        ? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook to manage delete dialog state. Returns open state, handlers, and the dialog component.
 */
export function useDeleteDialog<
    T extends { id: string | number; name?: string },
>() {
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState<T | null>(null);

    const openDialog = (target: T) => {
        setItem(target);
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
        setItem(null);
    };

    return { open, item, openDialog, closeDialog, onOpenChange: setOpen };
}
