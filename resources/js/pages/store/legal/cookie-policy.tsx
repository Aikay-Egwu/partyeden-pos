import { Head } from '@inertiajs/react';

export default function CookiePolicy() {
    return (
        <>
            <Head title="Our Use of Cookies and Other Technologies" />
            <div className="mx-auto max-w-4xl py-8 sm:py-14">
                <header className="mb-10">
                    <h1 className="font-plus-jakarta text-4xl font-bold tracking-tight text-popjoy-ink sm:text-5xl">
                        Our Use of Cookies and Other Technologies
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
                            Party Eden ("we", "us", or "our") uses cookies and
                            similar technologies (together, "technologies") to
                            help our website function, understand how visitors
                            use it, and deliver a more personalised experience.
                            This page explains what these technologies are, why
                            we use them, and how you can control them.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            What Are Cookies and Other Technologies
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Cookies are small text files stored on your device
                            when you visit a website. We also use other similar
                            technologies, including:
                        </p>
                        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-popjoy-muted">
                            <li>
                                Web beacons and pixels, which track when you
                                view a page or open an email
                            </li>
                            <li>
                                Local storage, which saves information directly
                                in your browser
                            </li>
                            <li>
                                Session storage, which is cleared when you close
                                your browser tab
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            How We Use These Technologies
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            We use cookies and other technologies to:
                        </p>
                        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-popjoy-muted">
                            <li>
                                Keep your shopping cart and order details intact
                                between pages
                            </li>
                            <li>Remember your preferences and settings</li>
                            <li>
                                Keep you signed in securely where applicable
                            </li>
                            <li>
                                Understand how visitors use our site so we can
                                improve it
                            </li>
                            <li>
                                Measure the effectiveness of our marketing and
                                communications
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Categories of Cookies We Use
                        </h2>
                        <div className="mt-4 space-y-5">
                            <div>
                                <h3 className="font-plus-jakarta text-lg font-bold text-popjoy-ink">
                                    Strictly Necessary Cookies
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-popjoy-muted">
                                    These are essential for the website to work
                                    and cannot be switched off. They enable core
                                    features such as the shopping cart,
                                    checkout, secure login, and remembering your
                                    cookie preferences. They do not gather
                                    information used for marketing.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-plus-jakarta text-lg font-bold text-popjoy-ink">
                                    Performance and Analytics Cookies
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-popjoy-muted">
                                    These help us understand how visitors
                                    interact with our site by collecting
                                    anonymous information about pages visited,
                                    time spent on site, and any error messages.
                                    This information helps us improve how the
                                    website works.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-plus-jakarta text-lg font-bold text-popjoy-ink">
                                    Functionality Cookies
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-popjoy-muted">
                                    These allow us to remember choices you make
                                    (such as your language or region) and
                                    provide enhanced, more personalised
                                    features.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-plus-jakarta text-lg font-bold text-popjoy-ink">
                                    Marketing Cookies
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-popjoy-muted">
                                    These track your browsing activity to show
                                    you relevant adverts on our site and
                                    elsewhere. They may be set by our
                                    advertising partners and used to build a
                                    profile of your interests.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Third-Party Technologies
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Some technologies on our site are set by third
                            parties that provide services on our behalf, such as
                            analytics, payment processing, and advertising
                            partners. These third parties may use their own
                            cookies and similar technologies in line with their
                            own privacy policies. We encourage you to review the
                            policies of those providers for more information.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Managing Your Choices
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            You can manage your cookie preferences at any time
                            by visiting our Cookie Preferences page or by
                            adjusting your browser settings. Most browsers allow
                            you to:
                        </p>
                        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-popjoy-muted">
                            <li>
                                View and delete cookies stored on your device
                            </li>
                            <li>Block third-party cookies</li>
                            <li>Block all cookies</li>
                            <li>
                                Clear all cookies when you close your browser
                            </li>
                        </ul>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Please note that disabling strictly necessary
                            cookies may prevent parts of our website from
                            working properly.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Changes to This Policy
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            We may update this page from time to time to reflect
                            changes in the technologies we use or for legal and
                            regulatory reasons. Any changes will be posted here
                            with an updated date.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Contact Us
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            If you have any questions about our use of cookies
                            and other technologies, please contact us at
                            privacy@partyeden.co.uk.
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
