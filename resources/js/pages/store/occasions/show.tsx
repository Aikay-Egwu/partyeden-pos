import { Head, router } from '@inertiajs/react';
import { ProductCard } from '@/components/store/product-card';
import { SectionWrapper } from '@/components/store/section-wrapper';
import { Input } from '@/components/ui/input';

type Product = {
    id: string;
    name: string;
    sku: string;
    selling_price: string;
    product_type: string;
    is_active: boolean;
    category?: { id: string; name: string } | null;
    primary_image?: string | null;
};

type Props = {
    occasion: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        hero_title?: string | null;
        hero_text?: string | null;
        image?: string | null;
    };
    products: {
        data: Product[];
    };
    filters: {
        search?: string;
    };
};

export default function OccasionShow({ occasion, products, filters }: Props) {
    return (
        <>
            <Head title={occasion.name} />
            <section className="-mx-4 -mt-6 overflow-hidden bg-muted/30 px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Occasion Collection
                        </p>
                        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                            {occasion.hero_title || occasion.name}
                        </h1>
                        <p className="mt-4 max-w-2xl text-muted-foreground">
                            {occasion.hero_text || occasion.description}
                        </p>
                    </div>
                    {occasion.image && (
                        <div className="overflow-hidden rounded-3xl">
                            <img
                                src={occasion.image}
                                alt={occasion.name}
                                className="aspect-[4/3] w-full object-cover"
                            />
                        </div>
                    )}
                </div>
            </section>

            <SectionWrapper
                title={`${occasion.name} Products`}
                subtitle="Find the right balloons and arrangements for this event"
            >
                <div className="mb-6 max-w-sm">
                    <Input
                        value={filters.search ?? ''}
                        onChange={(e) =>
                            router.get(
                                `/occasions/${occasion.slug}`,
                                { search: e.target.value },
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            )
                        }
                        placeholder="Search this occasion..."
                    />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.data.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </SectionWrapper>
        </>
    );
}
