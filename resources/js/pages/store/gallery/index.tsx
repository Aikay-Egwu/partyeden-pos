import { Head } from '@inertiajs/react';
import { SectionWrapper } from '@/components/store/section-wrapper';

type GalleryItem = {
    id: string;
    src: string;
    alt: string;
    label: string;
    feedback: string;
    name: string;
};

type Props = {
    galleryItems: {
        data: GalleryItem[];
    };
};

export default function GalleryIndex({ galleryItems }: Props) {
    return (
        <>
            <Head title="Customer Gallery" />
            <SectionWrapper
                title="Customer Gallery"
                subtitle="Photos shared by customers after their Party Eden celebrations"
            >
                <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
                    {galleryItems.data.map((item) => (
                        <div
                            key={item.id}
                            className="mb-5 overflow-hidden rounded-2xl border bg-card"
                        >
                            <img
                                src={item.src}
                                alt={item.alt}
                                className="w-full object-cover"
                            />
                            <div className="space-y-2 p-4">
                                <p className="text-sm font-medium">
                                    {item.label}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {item.feedback}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Shared by {item.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionWrapper>
        </>
    );
}
