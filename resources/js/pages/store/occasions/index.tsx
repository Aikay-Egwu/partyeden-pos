import { Head } from '@inertiajs/react';
import { OccasionCard } from '@/components/store/occasion-card';
import { SectionWrapper } from '@/components/store/section-wrapper';

type Occasion = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    products_count: number;
};

type Props = {
    occasions: Occasion[];
};

export default function OccasionIndex({ occasions }: Props) {
    return (
        <>
            <Head title="Shop by Occasion" />
            <SectionWrapper
                title="Shop by Occasion"
                subtitle="Browse curated collections for every celebration"
            >
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {occasions.map((occasion) => (
                        <div key={occasion.id} className="space-y-3">
                            <OccasionCard
                                occasion={{
                                    name: occasion.name,
                                    slug: occasion.slug,
                                    image: occasion.image ?? undefined,
                                }}
                            />
                            <div className="px-1">
                                <p className="text-sm text-muted-foreground">
                                    {occasion.description ??
                                        `${occasion.products_count} products`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionWrapper>
        </>
    );
}
