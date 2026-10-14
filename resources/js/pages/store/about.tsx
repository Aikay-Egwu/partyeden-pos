import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Award, Heart, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
    {
        icon: Palette,
        title: 'Bespoke by design',
        description:
            'Every arrangement is designed around your vision. No templates, no shortcuts — just handcrafted artistry tailored to your event.',
    },
    {
        icon: Award,
        title: 'Luxury in every detail',
        description:
            'We source only the finest biodegradable latex and premium foil balloons, ensuring a finish that looks as exquisite as it feels.',
    },
    {
        icon: Heart,
        title: 'Passion-led',
        description:
            'Party Eden was founded on a love for celebration. Every balloon we inflate carries the care and joy we put into our craft.',
    },
    {
        icon: Sparkles,
        title: 'Unforgettable moments',
        description:
            "We don't just decorate rooms — we transform spaces into experiences your guests will remember long after the last balloon floats away.",
    },
];

const occasions = [
    'Weddings & engagements',
    'Birthdays & milestones',
    'Gender reveals & baby showers',
    'Store openings & product launches',
    'Corporate galas & brand activations',
    'Anniversaries & private celebrations',
];

export default function About() {
    return (
        <>
            <Head title="About Us" />

            <div className="mx-auto max-w-6xl py-8 sm:py-14">
                {/* Hero section */}
                <header className="relative mb-16 overflow-hidden rounded-[2rem] bg-popjoy-purple-bg px-6 py-12 sm:px-12 sm:py-16">
                    <div className="relative z-10 max-w-2xl">
                        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-popjoy-divider/60 bg-white/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-popjoy-purple uppercase">
                            <Sparkles aria-hidden="true" className="size-4" />
                            Our story
                        </p>
                        <h1 className="font-plus-jakarta text-4xl leading-tight font-bold tracking-tight text-popjoy-ink sm:text-5xl lg:text-6xl">
                            Where imagination{' '}
                            <span className="text-popjoy-purple">
                                takes flight
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-popjoy-muted sm:text-lg">
                            Party Eden is a bespoke balloon boutique dedicated
                            to the art of celebration. From luxurious wedding
                            installations to show-stopping birthday
                            arrangements, we design and craft balloon decor that
                            turns ordinary spaces into extraordinary
                            experiences.
                        </p>
                    </div>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-12 -bottom-16 hidden size-64 items-center justify-center rounded-full border border-popjoy-purple/15 sm:flex"
                    >
                        <div className="flex size-44 items-center justify-center rounded-full border border-popjoy-purple/20 bg-white/30">
                            <div className="flex size-28 items-center justify-center rounded-full border border-popjoy-purple/20 bg-white/70 text-popjoy-purple">
                                <Heart className="size-14 stroke-[1.25]" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* What we do */}
                <section className="mb-16">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="mb-3 text-xs font-bold tracking-[0.14em] text-popjoy-purple uppercase">
                                What we do
                            </p>
                            <h2 className="font-plus-jakarta text-3xl font-bold tracking-tight text-popjoy-ink sm:text-4xl">
                                Luxury balloon artistry, made for your moment
                            </h2>
                            <div className="mt-6 space-y-4 text-base leading-7 text-popjoy-muted">
                                <p>
                                    Whether you're planning an intimate birthday
                                    gathering, a grand wedding reception, a
                                    store opening that demands attention, or a
                                    product launch that needs to make a
                                    statement — we're the team to call.
                                </p>
                                <p>
                                    Based in Sunderland and serving clients
                                    across the North East and beyond, our studio
                                    specialises in creating bespoke balloon
                                    arrangements that elevate every occasion.
                                    From elegant organic garlands and moongate
                                    installations to playful clusters and
                                    personalised bubble balloons, each piece is
                                    designed with your vision in mind.
                                </p>
                                <p>
                                    Wherever you need to brighten a room, spark
                                    a smile, or create a backdrop that stops
                                    people in their tracks — that's where you'll
                                    find Party Eden.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-popjoy-divider bg-white p-6 shadow-sm sm:p-8">
                            <h3 className="font-plus-jakarta text-xl font-bold text-popjoy-ink">
                                Occasions we love
                            </h3>
                            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                                {occasions.map((occasion) => (
                                    <li
                                        key={occasion}
                                        className="flex items-start gap-2 text-sm text-popjoy-ink"
                                    >
                                        <div className="mt-2 size-1.5 shrink-0 rounded-full bg-popjoy-purple" />
                                        {occasion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Our values */}
                <section className="mb-16">
                    <div className="mb-10 text-center">
                        <p className="mb-3 text-xs font-bold tracking-[0.14em] text-popjoy-purple uppercase">
                            Our values
                        </p>
                        <h2 className="font-plus-jakarta text-3xl font-bold tracking-tight text-popjoy-ink sm:text-4xl">
                            What sets us apart
                        </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {values.map((value) => {
                            const Icon = value.icon;

                            return (
                                <div
                                    key={value.title}
                                    className="rounded-3xl border border-popjoy-divider bg-white p-6 shadow-sm sm:p-8"
                                >
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-popjoy-purple-bg text-popjoy-purple">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-5 font-plus-jakarta text-xl font-bold text-popjoy-ink">
                                        {value.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-popjoy-muted">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Our promise */}
                <section className="mb-16 rounded-3xl border border-popjoy-purple/15 bg-popjoy-purple-bg p-6 sm:p-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-plus-jakarta text-3xl font-bold tracking-tight text-popjoy-ink sm:text-4xl">
                            Our promise
                        </h2>
                        <p className="mt-5 text-base leading-7 text-popjoy-muted sm:text-lg">
                            Every balloon we use is 100% biodegradable latex. We
                            believe that beautiful celebrations shouldn't come
                            at the planet's expense. When you choose Party Eden,
                            you're choosing luxury that's as kind to the earth
                            as it is stunning to behold.
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center">
                    <h2 className="font-plus-jakarta text-3xl font-bold tracking-tight text-popjoy-ink sm:text-4xl">
                        Ready to bring your vision to life?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-popjoy-muted">
                        Tell us about your event and let's design something
                        unforgettable together.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="rounded-full bg-popjoy-purple text-white shadow-sm hover:bg-popjoy-purple/90"
                        >
                            <Link href="/contact">
                                Contact us
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="rounded-full border-popjoy-divider text-popjoy-ink hover:bg-popjoy-purple-bg"
                        >
                            <Link href="/products">Browse our collections</Link>
                        </Button>
                    </div>
                </section>
            </div>
        </>
    );
}
