import { Head, Link } from '@inertiajs/react';
import { Heart, Package, Sparkles, Truck } from 'lucide-react';
import { CategoryCard } from '@/components/store/category-card';
import { NewsletterForm } from '@/components/store/newsletter-form';
import { OccasionCard } from '@/components/store/occasion-card';
import { PillButton } from '@/components/store/pill-button';
import { ProductCarousel } from '@/components/store/product-carousel';
import { SectionWrapper } from '@/components/store/section-wrapper';
import { TestimonialCard } from '@/components/store/testimonial-card';

type StoreCategory = {
    id: string;
    name: string;
    slug: string;
    image_path?: string | null;
};

type StoreProduct = {
    id: string;
    name: string;
    sku: string;
    selling_price: string;
    product_type: string;
    is_active: boolean;
    category?: { id: string; name: string } | null;
    primary_image?: string | null;
};

type Occasion = {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
};

type Testimonial = {
    id: string;
    name: string;
    role?: string | null;
    quote: string;
    rating: number;
    avatar?: string | null;
};

type GalleryItem = {
    id: string;
    src: string;
    alt: string;
    label: string;
};

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    cover_image?: string | null;
    published_at?: string | null;
};

type Props = {
    categories: StoreCategory[];
    occasions: Occasion[];
    bestSellers: StoreProduct[];
    latestProducts: StoreProduct[];
    featuredTestimonials: Testimonial[];
    galleryPreview: GalleryItem[];
    latestBlogPosts: BlogPost[];
};

const features = [
    {
        icon: Sparkles,
        title: 'Handmade with Care',
        description:
            'Every balloon arrangement is crafted by our skilled team.',
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        description:
            'Reliable local delivery for birthdays, showers, weddings, and more.',
    },
    {
        icon: Package,
        title: 'Premium Quality',
        description:
            'We use quality materials so every setup looks polished and celebration-ready.',
    },
    {
        icon: Heart,
        title: 'Loved By Customers',
        description:
            'Approved ratings and feedback now power the review and gallery sections.',
    },
];

export default function Home({
    categories,
    occasions,
    bestSellers,
    latestProducts,
    featuredTestimonials,
    galleryPreview,
    latestBlogPosts,
}: Props) {
    return (
        <>
            <Head title="Party Eden | Beautiful Personalised Balloons" />

            <section className="-mx-4 -my-6 overflow-hidden bg-linear-to-br from-secondary/40 via-background to-primary/10 px-4 py-20 sm:-mx-6 sm:px-6 sm:py-28 lg:-mx-8 lg:px-8 lg:py-36">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Celebrate Every Moment
                        </h1>
                        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                            Beautiful personalised balloons crafted for
                            birthdays, weddings, baby showers, graduations, and
                            unforgettable celebrations.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <PillButton asChild>
                                <Link href="/products">Shop Balloons</Link>
                            </PillButton>
                            <PillButton variant="secondary" asChild>
                                <Link href="/reviews">Read Reviews</Link>
                            </PillButton>
                        </div>
                    </div>

                    <div className="hidden items-center justify-center lg:flex">
                        <div className="relative size-80 lg:size-96">
                            <div className="absolute top-0 left-1/2 size-32 -translate-x-1/2 rounded-full bg-primary/60 shadow-lg" />
                            <div className="absolute bottom-4 left-4 size-28 rounded-full bg-secondary/70 shadow-lg" />
                            <div className="absolute right-4 bottom-6 size-24 rounded-full bg-accent/70 shadow-lg" />
                            <div className="absolute top-24 left-8 size-20 rounded-full bg-primary/40 shadow-lg" />
                            <div className="absolute top-20 right-8 size-20 rounded-full bg-secondary/50 shadow-lg" />
                        </div>
                    </div>
                </div>
            </section>

            <SectionWrapper
                title="Shop by Occasion"
                subtitle="Find the perfect balloons for every celebration"
            >
                <div className="scrollbar-hide flex gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-6">
                    {occasions.map((occasion) => (
                        <div
                            key={occasion.id}
                            className="w-[180px] shrink-0 sm:w-auto"
                        >
                            <OccasionCard
                                occasion={{
                                    name: occasion.name,
                                    slug: occasion.slug,
                                    image: occasion.image ?? undefined,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </SectionWrapper>

            <SectionWrapper background>
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/20 lg:aspect-square">
                        <div className="text-center">
                            <span className="text-6xl">🎈</span>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Personalised just for you
                            </p>
                        </div>
                    </div>
                    <div className="lg:pl-8">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Make It Personal
                        </h2>
                        <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                            Add names, messages, and choose your colours to
                            create a one-of-a-kind balloon setup for your next
                            event.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {[
                                'Name Balloons',
                                'Birthday Balloons',
                                'Wedding Balloons',
                            ].map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionWrapper>

            <SectionWrapper
                title="Shop by Category"
                subtitle="Explore our full range of balloon styles"
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={{
                                id: category.id,
                                name: category.name,
                                slug: category.slug,
                                href: `/categories/${category.id}`,
                                image: category.image_path
                                    ? `/storage/${category.image_path}`
                                    : undefined,
                            }}
                        />
                    ))}
                </div>
            </SectionWrapper>

            {bestSellers.length > 0 && (
                <SectionWrapper
                    title="Best Sellers"
                    subtitle="Admin-ranked favourites with automatic sales-based backfill"
                    background
                >
                    <ProductCarousel products={bestSellers} />
                </SectionWrapper>
            )}

            {galleryPreview.length > 0 && (
                <SectionWrapper
                    title="Inspiration Gallery"
                    subtitle="See how our customers celebrate with Party Eden"
                >
                    <div className="columns-2 gap-4 sm:columns-3">
                        {galleryPreview.map((image) => (
                            <Link
                                key={image.id}
                                href="/gallery"
                                className="group relative mb-4 block overflow-hidden rounded-2xl"
                            >
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-end rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent p-4">
                                    <span className="text-sm font-medium text-white">
                                        {image.label}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <PillButton variant="secondary" asChild>
                            <Link href="/gallery">View Full Gallery</Link>
                        </PillButton>
                    </div>
                </SectionWrapper>
            )}

            <SectionWrapper background>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex flex-col items-center gap-4 text-center"
                        >
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <feature.icon className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">
                                    {feature.title}
                                </h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionWrapper>

            {featuredTestimonials.length > 0 && (
                <SectionWrapper
                    title="What Our Customers Say"
                    subtitle="Approved ratings and feedback from recent celebrations"
                >
                    <div className="scrollbar-hide flex gap-5 overflow-x-auto pb-2">
                        {featuredTestimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="w-[320px] shrink-0"
                            >
                                <TestimonialCard
                                    testimonial={{
                                        name: testimonial.name,
                                        role: testimonial.role ?? undefined,
                                        avatar: testimonial.avatar ?? undefined,
                                        quote: testimonial.quote,
                                        rating: testimonial.rating,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <PillButton variant="secondary" asChild>
                            <Link href="/reviews">Read More Reviews</Link>
                        </PillButton>
                    </div>
                </SectionWrapper>
            )}

            {latestBlogPosts.length > 0 && (
                <SectionWrapper
                    title="From the Blog"
                    subtitle="Planning tips, ideas, and inspiration from Party Eden"
                >
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {latestBlogPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md"
                            >
                                {post.cover_image && (
                                    <img
                                        src={post.cover_image}
                                        alt={post.title}
                                        className="aspect-[16/10] w-full object-cover"
                                    />
                                )}
                                <div className="space-y-3 p-5">
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        {post.published_at}
                                    </p>
                                    <h3 className="text-xl font-semibold">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </SectionWrapper>
            )}

            <SectionWrapper>
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Celebrate More Moments
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Sign up for exclusive offers, new arrivals, and
                        celebration inspiration delivered to your inbox.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <NewsletterForm />
                    </div>
                </div>
            </SectionWrapper>

            {latestProducts.length > 0 && (
                <SectionWrapper
                    title="Latest Arrivals"
                    subtitle="Fresh balloons just added to our collection"
                    background
                >
                    <ProductCarousel products={latestProducts} />
                </SectionWrapper>
            )}
        </>
    );
}
