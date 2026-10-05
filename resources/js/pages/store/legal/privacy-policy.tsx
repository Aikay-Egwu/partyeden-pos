import { Head } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Privacy Policy" />
            <div className="mx-auto max-w-4xl py-8 sm:py-14">
                <header className="mb-10">
                    <h1 className="font-plus-jakarta text-4xl font-bold tracking-tight text-popjoy-ink sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-3 text-sm text-popjoy-muted">
                        Last updated:{' '}
                        {new Date().toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </header>

                <div className="prose prose-popjoy max-w-none space-y-8">
                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Introduction
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Party Eden ("we", "us", or "our") respects your
                            privacy and is committed to protecting your personal
                            data. This privacy policy explains how we collect,
                            use, and safeguard your information when you use our
                            website and services.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Information We Collect
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            We collect information you provide directly,
                            including:
                        </p>
                        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-popjoy-muted">
                            <li>
                                Name, email address, and phone number when you
                                place an order
                            </li>
                            <li>Delivery address for order fulfillment</li>
                            <li>
                                Payment information (processed securely via
                                Stripe)
                            </li>
                            <li>
                                Communication preferences and correspondence
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            How We Use Your Information
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            We use your data to:
                        </p>
                        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-popjoy-muted">
                            <li>Process and deliver your orders</li>
                            <li>Send order confirmations and updates</li>
                            <li>Provide customer support</li>
                            <li>Improve our products and services</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Data Sharing
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            We do not sell your personal data. We share
                            information only with trusted service providers
                            (payment processors, delivery partners) who need it
                            to fulfill orders, and only under strict
                            confidentiality agreements.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Your Rights
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Under UK GDPR, you have the right to access,
                            correct, delete, or restrict use of your personal
                            data. To exercise these rights, contact us at
                            privacy@partyeden.co.uk.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Contact Us
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            If you have questions about this privacy policy or
                            our data practices, please contact us at
                            privacy@partyeden.co.uk.
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
