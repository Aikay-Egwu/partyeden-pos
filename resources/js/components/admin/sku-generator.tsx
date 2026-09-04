import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface SkuGeneratorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: string;
}

export function SkuGenerator({
    value,
    onChange,
    disabled = false,
    error,
}: SkuGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);

        try {
            const response = await fetch('/admin/skus/generate', {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Unable to generate a SKU.');
            }

            const payload = await response.json();

            if (typeof payload?.sku === 'string' && payload.sku) {
                onChange(payload.sku);

                return;
            }

            throw new Error('The server did not return a valid SKU.');
        } catch {
            toast.error('Unable to generate a SKU right now.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="SKU-001"
                    disabled={disabled}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={disabled || isGenerating}
                >
                    {isGenerating ? <Spinner className="size-4" /> : 'Generate'}
                </Button>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
