import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Review = {
    id: string;
    name: string;
    email: string;
    rating: number;
    title?: string | null;
    feedback: string;
    status: 'pending' | 'approved' | 'rejected';
    is_featured: boolean;
    show_in_gallery: boolean;
    image_url?: string | null;
    product?: { id: string; name: string } | null;
    occasion?: { id: string; name: string } | null;
};

type Props = {
    review: Review;
};

export default function ReviewShow({ review }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        status: review.status,
        is_featured: review.is_featured,
        show_in_gallery: review.show_in_gallery,
    });

    return (
        <>
            <Head title={`Review from ${review.name}`} />
            <FormPage
                title={`Review from ${review.name}`}
                backUrl="/admin/reviews"
            >
                <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium">Customer</p>
                                <p className="text-sm text-muted-foreground">
                                    {review.name} ({review.email})
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Rating</p>
                                <p className="text-sm text-muted-foreground">
                                    {review.rating}/5
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Context</p>
                                <p className="text-sm text-muted-foreground">
                                    {review.occasion?.name ??
                                        review.product?.name ??
                                        'General review'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Title</p>
                                <p className="text-sm text-muted-foreground">
                                    {review.title || '-'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium">Feedback</p>
                            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                                {review.feedback}
                            </p>
                        </div>
                        {review.image_url && (
                            <div className="mt-4">
                                <p className="text-sm font-medium">
                                    Submitted Image
                                </p>
                                <img
                                    src={review.image_url}
                                    alt={review.title ?? review.name}
                                    className="mt-2 max-h-80 rounded-lg border object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            patch(`/admin/reviews/${review.id}`);
                        }}
                        className="space-y-4 rounded-lg border p-4"
                    >
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) =>
                                    setData(
                                        'status',
                                        value as typeof data.status,
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.is_featured}
                                onCheckedChange={(value) =>
                                    setData('is_featured', !!value)
                                }
                            />
                            <span className="text-sm">Feature on homepage</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.show_in_gallery}
                                onCheckedChange={(value) =>
                                    setData('show_in_gallery', !!value)
                                }
                            />
                            <span className="text-sm">Show in gallery</span>
                        </label>

                        <Button type="submit" disabled={processing}>
                            Save Moderation
                        </Button>
                    </form>
                </div>
            </FormPage>
        </>
    );
}
