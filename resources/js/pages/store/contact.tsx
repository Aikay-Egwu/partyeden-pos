import { Head, useForm, usePage } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const contactInfo = [
    {
        icon: Mail,
        title: 'Email',
        details: 'info@partyeden.co.uk',
        href: 'mailto:info@partyeden.co.uk',
    },
    {
        icon: Phone,
        title: 'Phone',
        details: '0191 565 9575',
        href: 'tel:01915659575',
    },
    {
        icon: MapPin,
        title: 'Studio',
        details: '203 High Street West, Sunniside, Sunderland, SR1 1UA',
        href: undefined,
    },
    {
        icon: Clock,
        title: 'Hours',
        details:
            'Monday – Friday: 9:30 am – 5:30 pm\nSaturday: Collection from prior bookings',
        href: undefined,
    },
];

export default function Contact() {
    const { flash } = usePage().props as { flash?: { success?: string } };

    // Anti-spam: record when the form loaded for server-side timing check
    const [formLoadedAt] = useState(() => Math.floor(Date.now() / 1000));

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        event_type: '',
        event_date: '',
        message: '',
        // Honeypot: must remain empty — bots fill hidden fields
        website_url: '',
        // Timing token for server-side elapsed check
        form_loaded_at: formLoadedAt,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => reset(),
        });
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <>
            <Head title="Contact Us" />

            <div className="mx-auto max-w-6xl py-8 sm:py-14">
                {/* Page header */}
                <header className="mb-12 text-center">
                    <p className="mb-4 text-xs font-bold tracking-[0.14em] text-popjoy-purple uppercase">
                        Get in touch
                    </p>
                    <h1 className="font-plus-jakarta text-4xl font-bold tracking-tight text-popjoy-ink sm:text-5xl">
                        Let's create something{' '}
                        <span className="text-popjoy-purple">beautiful</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-popjoy-muted sm:text-lg">
                        Have a question about our services or ready to discuss
                        your event? We'd love to hear from you.
                    </p>
                </header>

                {/* Success flash message */}
                {flash?.success && (
                    <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-center text-sm font-semibold text-emerald-800">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-10 lg:grid-cols-2">
                    {/* Contact form */}
                    <section className="rounded-3xl border border-popjoy-divider bg-white p-6 shadow-sm sm:p-10">
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Send us a message
                        </h2>
                        <p className="mt-2 text-sm text-popjoy-muted">
                            Fill in the form below and we'll get back to you as
                            soon as possible.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">
                                        First name
                                    </Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) =>
                                            setData(
                                                'first_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Jane"
                                        required
                                    />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last name</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData('last_name', e.target.value)
                                        }
                                        placeholder="Doe"
                                        required
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
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
                                    placeholder="jane@example.com"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Phone number{' '}
                                    <span className="text-popjoy-muted">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    placeholder="07700 900000"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="event_type">
                                        Event type
                                    </Label>
                                    <Input
                                        id="event_type"
                                        value={data.event_type}
                                        onChange={(e) =>
                                            setData(
                                                'event_type',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Birthday, Wedding, Corporate..."
                                        required
                                    />
                                    <InputError message={errors.event_type} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="event_date">
                                        Event date{' '}
                                        <span className="text-popjoy-muted">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        min={today}
                                        value={data.event_date}
                                        onChange={(e) =>
                                            setData(
                                                'event_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.event_date} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                    value={data.message}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setData('message', e.target.value)}
                                    placeholder="Tell us about your event and what you're looking for..."
                                    required
                                />
                                <InputError message={errors.message} />
                            </div>

                            {/* Honeypot — hidden from real users, bots fill it in */}
                            <div
                                className="absolute -left-[9999px]"
                                aria-hidden="true"
                            >
                                <label htmlFor="website_url">Website</label>
                                <input
                                    id="website_url"
                                    type="text"
                                    name="website_url"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={data.website_url}
                                    onChange={(e) =>
                                        setData('website_url', e.target.value)
                                    }
                                />
                            </div>
                            <input
                                type="hidden"
                                name="form_loaded_at"
                                value={data.form_loaded_at}
                            />

                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing}
                                className="w-full rounded-full bg-popjoy-purple text-white shadow-sm hover:bg-popjoy-purple/90 disabled:opacity-60"
                            >
                                {processing ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        Send message
                                        <Send className="ml-2 size-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </section>

                    {/* Contact information sidebar */}
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-popjoy-divider bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                                Contact information
                            </h2>
                            <div className="mt-6 space-y-6">
                                {contactInfo.map((info) => {
                                    const Icon = info.icon;

                                    return (
                                        <div
                                            key={info.title}
                                            className="flex gap-4"
                                        >
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-popjoy-purple-bg text-popjoy-purple">
                                                <Icon className="size-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-popjoy-ink">
                                                    {info.title}
                                                </h3>
                                                {info.href ? (
                                                    <a
                                                        href={info.href}
                                                        className="mt-0.5 text-sm leading-6 text-popjoy-muted transition-colors hover:text-popjoy-purple"
                                                    >
                                                        {info.details}
                                                    </a>
                                                ) : (
                                                    <p className="mt-0.5 text-sm leading-6 whitespace-pre-line text-popjoy-muted">
                                                        {info.details}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-popjoy-purple/15 bg-popjoy-purple-bg p-6 sm:p-8">
                            <h3 className="font-plus-jakarta text-xl font-bold text-popjoy-ink">
                                Quick questions?
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-popjoy-muted">
                                Check out our FAQ section for immediate answers
                                to common questions about our services, pricing,
                                and delivery.
                            </p>
                            <ul className="mt-5 space-y-3 text-sm text-popjoy-ink">
                                <li className="flex items-start gap-2">
                                    <div className="mt-2 size-1.5 shrink-0 rounded-full bg-popjoy-purple" />
                                    What areas do you deliver to?
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-2 size-1.5 shrink-0 rounded-full bg-popjoy-purple" />
                                    How far in advance should I book?
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-2 size-1.5 shrink-0 rounded-full bg-popjoy-purple" />
                                    Do you offer same-day delivery?
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-2 size-1.5 shrink-0 rounded-full bg-popjoy-purple" />
                                    Can I customise colours and designs?
                                </li>
                            </ul>
                            <a
                                href="/faq"
                                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-popjoy-purple transition-colors hover:text-popjoy-purple/80"
                            >
                                View all FAQs →
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
