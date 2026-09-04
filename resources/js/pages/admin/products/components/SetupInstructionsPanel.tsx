import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { AdminProduct } from '@/types/admin-product';

export function SetupInstructionsPanel({ product }: { product: AdminProduct }) {
    const { data, setData, post, processing } = useForm({
        tools: product.setup_instruction?.tools ?? '',
        items: product.setup_instruction?.items ?? '',
        instructions: product.setup_instruction?.instructions ?? '',
        notes: product.setup_instruction?.notes ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/products/${product.id}/setup-instruction`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Setup instructions updated.'),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-lg border bg-muted/20 p-4"
        >
            <h3 className="text-sm font-medium">Setup Instructions</h3>
            <p className="text-xs text-muted-foreground">
                Internal instructions on how to set up or assemble this product.
            </p>

            <div className="space-y-2">
                <Label htmlFor="tools">Tools Required</Label>
                <textarea
                    id="tools"
                    className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                    value={data.tools}
                    onChange={(e) => setData('tools', e.target.value)}
                    placeholder="e.g. Helium tank, ribbon scissors"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="items">Items / Materials</Label>
                <textarea
                    id="items"
                    className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                    value={data.items}
                    onChange={(e) => setData('items', e.target.value)}
                    placeholder="e.g. Latex balloons x50, curling ribbon"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="instructions">Step-by-Step Instructions</Label>
                <textarea
                    id="instructions"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                    value={data.instructions}
                    onChange={(e) => setData('instructions', e.target.value)}
                    placeholder="Provide detailed instructions here..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                    id="notes"
                    className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                />
            </div>

            <div className="border-t pt-2">
                <Button type="submit" disabled={processing}>
                    Save Setup Instructions
                </Button>
            </div>
        </form>
    );
}
