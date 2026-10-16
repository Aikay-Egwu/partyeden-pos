import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { SectionWrapper } from '@/components/store/section-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Option = {
    id: string;
    name: string;
};

type Props = {
    order: {
        id: string;
        order_number: string;
    };
    prefill: {
        name: string;
        email: string;
    };
    products: Option[];
    occasions: Option[];
};

/**
 * Order-linked review form opened from the post-delivery feedback email.
 * Submits to the same POST /reviews endpoint as the public reviews page,
 * carrying the order_id so the review is attributed to the order.
 */
export default function ReviewsCreate({
    order,
    prefill,
    products,
    occasions,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        order_id: order.id,
        name: prefill.name,
        email: prefill.email,
        rating: '5',
        title: '',
        feedback: '',
        product_id: products[0]?.id ?? '',
        occasion_id: '',
        image: null as File | null,
    });

    return (
        <>
            <Head title="Share Your Feedback" />
            <SectionWrapper
                title="How Did We Do?"
                subtitle={`Tell us about your experience with order ${order.order_number}`}
            >
                <div className="mx-auto max-w-xl">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/reviews', { forceFormData: true });
                        }}
                        className="space-y-4 rounded-2xl border bg-card p-6"
                    >
                        <p className="text-sm text-muted-foreground">
                            We read every review — it only takes two minutes.
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="rating">Rating</Label>
                                <select
                                    id="rating"
                                    value={data.rating}
                                    onChange={(e) =>
                                        setData('rating', e.target.value)
                                    }
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                >
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <option key={rating} value={rating}>
                                            {rating} stars
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.rating} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                />
                                <InputError message={errors.title} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="feedback">Feedback</Label>
                            <textarea
                                id="feedback"
                                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                value={data.feedback}
                                onChange={(e) =>
                                    setData('feedback', e.target.value)
                                }
                            />
                            <InputError message={errors.feedback} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="occasion_id">Occasion</Label>
                                <select
                                    id="occasion_id"
                                    value={data.occasion_id}
                                    onChange={(e) =>
                                        setData('occasion_id', e.target.value)
                                    }
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                >
                                    <option value="">Select occasion</option>
                                    {occasions.map((occasion) => (
                                        <option
                                            key={occasion.id}
                                            value={occasion.id}
                                        >
                                            {occasion.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product_id">Product</Label>
                                <select
                                    id="product_id"
                                    value={data.product_id}
                                    onChange={(e) =>
                                        setData('product_id', e.target.value)
                                    }
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                >
                                    <option value="">Select product</option>
                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Optional Photo</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setData(
                                        'image',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <InputError message={errors.image} />
                        </div>

                        <Button type="submit" disabled={processing}>
                            Submit Review
                        </Button>
                    </form>
                </div>
            </SectionWrapper>
        </>
    );
}
