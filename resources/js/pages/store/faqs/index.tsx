import { Head } from '@inertiajs/react';
import { Snowflake, Sun, Thermometer } from 'lucide-react';

type FaqItem = {
    id: string;
    question: string;
    answer: string;
    category: 'winter' | 'summer' | 'general';
};

type Props = {
    faqs: {
        winter: FaqItem[];
        summer: FaqItem[];
        general: FaqItem[];
    };
};

function CareSection({
    title,
    intro,
    icon,
    items,
    tone,
}: {
    title: string;
    intro: string;
    icon: React.ReactNode;
    items: FaqItem[];
    tone: 'cool' | 'warm';
}) {
    return (
        <section
            className={`rounded-3xl border p-6 sm:p-8 ${
                tone === 'cool'
                    ? 'border-sky-200 bg-sky-50/80'
                    : 'border-amber-200 bg-amber-50/80'
            }`}
        >
            <div className="mb-6 flex items-start gap-4">
                <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                        tone === 'cool'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                    }`}
                >
                    {icon}
                </span>
                <div>
                    <h2 className="font-plus-jakarta text-2xl font-bold tracking-tight text-popjoy-ink">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-popjoy-muted">
                        {intro}
                    </p>
                </div>
            </div>
            <div className="divide-y divide-popjoy-divider/60">
                {items.length ? (
                    items.map((faq) => (
                        <details key={faq.id} className="group py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-left font-semibold text-popjoy-ink outline-none focus-visible:ring-2 focus-visible:ring-popjoy-purple [&::-webkit-details-marker]:hidden">
                                {faq.question}
                                <span
                                    aria-hidden="true"
                                    className="text-xl leading-none text-popjoy-purple transition-transform group-open:rotate-45"
                                >
                                    +
                                </span>
                            </summary>
                            <p className="max-w-prose pt-3 pr-8 text-sm leading-7 text-popjoy-muted">
                                {faq.answer}
                            </p>
                        </details>
                    ))
                ) : (
                    <p className="py-4 text-sm text-popjoy-muted">
                        We’re adding more care advice soon.
                    </p>
                )}
            </div>
        </section>
    );
}

export default function FaqIndex({ faqs }: Props) {
    return (
        <>
            <Head title="Helium Balloon Care" />
            <div className="mx-auto max-w-5xl py-8 sm:py-14">
                <header className="relative mb-12 overflow-hidden rounded-[2rem] bg-popjoy-purple-bg px-6 py-10 sm:px-12 sm:py-14">
                    <div className="relative z-10 max-w-2xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-popjoy-divider/60 bg-white/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-popjoy-purple uppercase">
                            <Thermometer
                                aria-hidden="true"
                                className="size-4"
                            />
                            A season-by-season guide
                        </div>
                        <h1 className="font-plus-jakarta text-4xl leading-tight font-bold tracking-[-0.04em] text-popjoy-ink sm:text-6xl">
                            A little care keeps the party afloat.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-popjoy-muted sm:text-lg">
                            Helium reacts to the temperature around it. Here’s
                            how to help your balloons look their best, from
                            frosty collection days to sunny celebrations.
                        </p>
                    </div>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-12 -bottom-16 hidden size-64 items-center justify-center rounded-full border border-popjoy-purple/15 sm:flex"
                    >
                        <div className="flex size-44 items-center justify-center rounded-full border border-popjoy-purple/20 bg-white/30">
                            <div className="flex size-28 items-center justify-center rounded-full border border-popjoy-purple/20 bg-white/70 text-popjoy-purple">
                                <Thermometer className="size-14 stroke-[1.25]" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold tracking-wide text-popjoy-ink sm:hidden">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2">
                            <Snowflake className="size-4 text-sky-700" />
                            Cold contracts
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2">
                            <Sun className="size-4 text-amber-700" />
                            Heat expands
                        </span>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-2">
                    <CareSection
                        title="Winter care"
                        intro="Cold helium contracts, so balloons may look smaller outside."
                        icon={
                            <Snowflake aria-hidden="true" className="size-6" />
                        }
                        items={faqs.winter}
                        tone="cool"
                    />
                    <CareSection
                        title="Summer care"
                        intro="Warm helium expands, so shade and gentle handling matter."
                        icon={<Sun aria-hidden="true" className="size-6" />}
                        items={faqs.summer}
                        tone="warm"
                    />
                </div>

                {faqs.general.length > 0 && (
                    <section className="mt-12">
                        <div className="mb-5">
                            <p className="text-xs font-bold tracking-[0.14em] text-popjoy-purple uppercase">
                                Any forecast
                            </p>
                            <h2 className="mt-2 font-plus-jakarta text-2xl font-bold tracking-tight text-popjoy-ink">
                                Good habits, all year round
                            </h2>
                        </div>
                        <div className="divide-y divide-popjoy-divider rounded-3xl border border-popjoy-divider bg-white px-6 sm:px-8">
                            {faqs.general.map((faq) => (
                                <details key={faq.id} className="group py-5">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-left font-semibold text-popjoy-ink outline-none focus-visible:ring-2 focus-visible:ring-popjoy-purple [&::-webkit-details-marker]:hidden">
                                        {faq.question}
                                        <span
                                            aria-hidden="true"
                                            className="text-xl leading-none text-popjoy-purple transition-transform group-open:rotate-45"
                                        >
                                            +
                                        </span>
                                    </summary>
                                    <p className="max-w-prose pt-3 pr-8 text-sm leading-7 text-popjoy-muted">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
