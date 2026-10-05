import { Head } from '@inertiajs/react';

export default function TermsOfService() {
    return (
        <>
            <Head title="Terms of Service" />
            <div className="mx-auto max-w-4xl py-8 sm:py-14">
                <header className="mb-10">
                    <h1 className="font-plus-jakarta text-4xl font-bold tracking-tight text-popjoy-ink sm:text-5xl">
                        Terms of Service
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
                            Acceptance of Terms
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            By accessing or using Party Eden's website and
                            services, you agree to be bound by these Terms of
                            Service. If you do not agree to these terms, please
                            do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Orders and Payment
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            All orders are subject to acceptance and
                            availability. We reserve the right to refuse or
                            cancel orders at our discretion, including cases of
                            product unavailability, pricing errors, or suspected
                            fraud. Payment must be received in full before order
                            confirmation.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Delivery
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Delivery times are estimates and not guaranteed. We
                            are not liable for delays caused by circumstances
                            beyond our control. Risk of loss passes to you upon
                            delivery. Please inspect items upon receipt and
                            report any damage within 24 hours.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Returns and Refunds
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Due to the nature of our products, all sales are
                            final unless items are defective or significantly
                            different from description. Return requests must be
                            made within 7 days of delivery. Contact us at
                            support@partyeden.co.uk for return authorization.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Product Use and Safety
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Customers are responsible for following all safety
                            instructions provided with products, particularly
                            regarding helium balloons and children. Party Eden
                            is not liable for injuries or damages resulting from
                            improper use.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Limitation of Liability
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Party Eden's liability is limited to the purchase
                            price of the products. We are not liable for
                            indirect, incidental, or consequential damages
                            arising from use of our products or services.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Changes to Terms
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            We reserve the right to modify these terms at any
                            time. Changes will be posted on this page with an
                            updated date. Continued use of our services
                            constitutes acceptance of modified terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Contact
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            For questions about these terms, please contact us
                            at support@partyeden.co.uk.
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
