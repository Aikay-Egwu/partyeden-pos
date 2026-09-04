import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { SectionWrapper } from '@/components/store/section-wrapper';
import { TestimonialCard } from '@/components/store/testimonial-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Review = {
    id: string;
    name: string;
    title?: string | null;
    feedback: string;
    rating: number;
    image?: string | null;
    occasion?: { id: string; name: string } | null;
    product?: { id: string; name: string } | null;
    approved_at?: string | null;
};

type Option = {
    id: string;
    name: string;
};

type Props = {
    reviews: {
        data: Review[];
    };
    summary: {
        average_rating: number;
        total_reviews: number;
    };
    products: Option[];
    occasions: Option[];
};

export default function ReviewsIndex({
    reviews,
    summary,
    products,
    occasions,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        rating: '5',
        title: '',
        feedback: '',
        product_id: '',
        occasion_id: '',
        image: null as File | null,
    });

    return (
        <>
            <Head title="Customer Reviews" />
            <SectionWrapper
                title="Customer Reviews"
                subtitle="Real feedback from Party Eden celebrations"
            >
                <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-6">
                        <div className="rounded-2xl border bg-card p-6">
                            <p className="text-sm text-muted-foreground">
                                Average rating
                            </p>
                            <p className="mt-2 text-4xl font-semibold">
                                {summary.average_rating || 0}/5
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Based on {summary.total_reviews} approved
                                reviews
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            {reviews.data.map((review) => (
                                <TestimonialCard
                                    key={review.id}
                                    testimonial={{
                                        name: review.name,
                                        role:
                                            review.occasion?.name ??
                                            review.product?.name ??
                                            undefined,
                                        avatar: review.image ?? undefined,
                                        quote: review.feedback,
                                        rating: review.rating,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/reviews', {
                                forceFormData: true,
                                onSuccess: () => reset(),
                            });
                        }}
                        className="space-y-4 rounded-2xl border bg-card p-6"
                    >
                        <div>
                            <h2 className="text-xl font-semibold">
                                Leave a Review
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Share your rating, feedback, and an optional
                                celebration photo.
                            </p>
                        </div>

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
