import { Form, Head } from '@inertiajs/react';
import { Gift, Sparkles, PartyPopper } from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            {/* Skip-to-content anchor for keyboard/screen-reader users */}
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded focus:bg-popjoy-purple focus:px-4 focus:py-2 focus:text-white"
            >
                Skip to content
            </a>

            {/* Full viewport page canvas with cream/lilac store background */}
            <div className="min-h-screen w-full bg-popjoy-bg">
                {/* Two-column grid on lg+; single stacked column below 1024px */}
                <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                    {/* LEFT COLUMN — Brand panel (desktop: full-height; mobile: top strip) */}
                    <section className="bg-gradient-to-br from-popjoy-purple to-[#A855F7] p-6 text-white lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-16">
                        <div className="w-full max-w-md text-center lg:max-w-sm">
                            {/* Brand heading — fluid clamp() sizing for smooth scaling */}
                            <h1
                                className="text-3xl font-extrabold tracking-tight sm:text-4xl"
                                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
                            >
                                Party &amp; Eden
                            </h1>

                            {/* Tagline beneath brand name */}
                            <p className="mt-4 text-lg opacity-90">
                                Make every moment float. Sign in to your party
                                supplies account.
                            </p>

                            {/* Decorative icon grid — three pill cards with celebration icons */}
                            <div className="mx-auto mt-8 grid max-w-xs grid-cols-3 gap-3 opacity-95 lg:mt-10 lg:gap-6">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl backdrop-blur lg:h-16 lg:w-16 lg:text-2xl">
                                    <Gift />
                                </div>
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl backdrop-blur lg:h-16 lg:w-16 lg:text-2xl">
                                    <Sparkles />
                                </div>
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl backdrop-blur lg:h-16 lg:w-16 lg:text-2xl">
                                    <PartyPopper />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT COLUMN — Form panel (cream background, dark ink text) */}
                    <section className="flex flex-col justify-center bg-popjoy-bg p-6 text-popjoy-ink sm:p-10 lg:p-16">
                        <main
                            id="main"
                            role="main"
                            className="mx-auto w-full max-w-md space-y-8"
                        >
                            {/* Passkey Verify — admin-only passkey login prompt (gated internally) */}
                            <PasskeyVerify />

                            {/* Page heading + subcopy */}
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight text-popjoy-ink sm:text-3xl">
                                    Welcome back
                                </h2>
                                <p className="mt-2 text-muted-foreground">
                                    Sign in with your email and password to
                                    continue.
                                </p>
                            </div>

                            {/* Inertia form submission via Wayfinder store.form() helper */}
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                disableWhileProcessing
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Email field */}
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-sm font-medium"
                                            >
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                className="h-12"
                                                aria-invalid={!!errors.email}
                                                aria-describedby={
                                                    errors.email
                                                        ? 'email-error'
                                                        : undefined
                                                }
                                            />
                                            <InputError
                                                id="email-error"
                                                message={errors.email}
                                            />
                                        </div>

                                        {/* Password field — label row with forgot-password link */}
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label
                                                    htmlFor="password"
                                                    className="text-sm font-medium"
                                                >
                                                    Password
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        tabIndex={5}
                                                        className="text-sm font-medium"
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                className="h-12"
                                                aria-invalid={!!errors.password}
                                                aria-describedby={
                                                    errors.password
                                                        ? 'password-error'
                                                        : undefined
                                                }
                                            />
                                            <InputError
                                                id="password-error"
                                                message={errors.password}
                                            />
                                        </div>

                                        {/* Remember me checkbox row */}
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="text-sm font-normal"
                                            >
                                                Remember me
                                            </Label>
                                        </div>

                                        {/* Submit button — full width, 48px touch target, spinner while processing */}
                                        <Button
                                            type="submit"
                                            className="mt-6 h-12 w-full rounded-xl bg-popjoy-purple text-base font-semibold text-white hover:bg-popjoy-purple/90"
                                            tabIndex={4}
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <Spinner className="mr-2" />
                                            ) : null}
                                            Log in
                                        </Button>

                                        {/* Sign up CTA — centered at bottom of form */}
                                        <div className="mt-6 text-center text-sm text-muted-foreground">
                                            Don&apos;t have an account?{' '}
                                            <TextLink
                                                href={register()}
                                                tabIndex={6}
                                                className="font-medium text-popjoy-purple hover:text-popjoy-purple/90"
                                            >
                                                Create one
                                            </TextLink>
                                        </div>
                                    </>
                                )}
                            </Form>

                            {/* Status message — shown after password reset email sent, etc. */}
                            {status && (
                                <div className="mb-4 text-center text-sm font-medium text-green-600">
                                    {status}
                                </div>
                            )}
                        </main>
                    </section>
                </div>
            </div>
        </>
    );
}

/* Preserved for layout-resolution safety (app.tsx switch statement does not
 * currently consume this property, but keeping it avoids regressions if the
 * resolution logic changes). */
Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
