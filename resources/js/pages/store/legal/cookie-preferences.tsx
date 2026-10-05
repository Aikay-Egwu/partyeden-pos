import { Head } from '@inertiajs/react';

export default function CookiePreferences() {
    return (
        <>
            <Head title="Cookie Preferences" />
            <div className="mx-auto max-w-4xl py-8 sm:py-14">
                <header className="mb-10">
                    <h1 className="font-plus-jakarta text-4xl font-bold tracking-tight text-popjoy-ink sm:text-5xl">
                        Cookie Preferences
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
                            What Are Cookies
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            Cookies are small text files stored on your device
                            when you visit a website. They help us remember your
                            preferences, understand how you use our site, and
                            improve your experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Essential Cookies
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            These cookies are necessary for the website to
                            function and cannot be disabled. They enable core
                            features like shopping cart functionality, secure
                            login, and order processing. These cookies do not
                            collect personal information.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Analytics Cookies
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            These cookies help us understand how visitors
                            interact with our website by collecting anonymous
                            information about pages visited and time spent on
                            site. This helps us improve our services. You can
                            choose to disable these below.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Marketing Cookies
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            These cookies track your browsing habits to deliver
                            relevant advertisements. They are set by our
                            advertising partners and may be used to build a
                            profile of your interests. You can choose to disable
                            these below.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Managing Your Preferences
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            You can change your cookie preferences at any time
                            by adjusting your browser settings. Note that
                            disabling certain cookies may affect website
                            functionality. Most browsers allow you to:
                        </p>
                        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-popjoy-muted">
                            <li>
                                View what cookies are stored and delete them
                                individually
                            </li>
                            <li>Block third-party cookies</li>
                            <li>Block all cookies</li>
                            <li>
                                Delete all cookies when you close your browser
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                            Contact Us
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-popjoy-muted">
                            If you have questions about our use of cookies,
                            please contact us at privacy@partyeden.co.uk.
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
