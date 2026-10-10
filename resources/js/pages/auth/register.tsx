import { useForm, Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { Gift, Sparkles, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { useFlashToast } from '@/hooks/use-flash-toast';

type Props = {
    // Human-readable bullet list of password requirements (e.g. "At least 8
    // characters long"). Rendered as a <ul> below the password input.
    passwordRulesList: string[];
    // One-off flash message from backend — for example after redirect from a
    // successful registration and before the user logs in.
    status?: string;
};

export default function Register({ passwordRulesList, status }: Props) {
    // Listens for Inertia `flash` events dispatched by the backend after
    // redirects (e.g. after login success the login page uses status flashes).
    useFlashToast();

    // The `status` prop comes directly from the Laravel session flash. When
    // the user arrives here (currently only on first load — redirects from
    // successful registration go to /login instead, which toasts its own
    // status) we show a one-shot toast. The dependency array is empty because
    // we only want to fire once on initial mount (the prop won't change).
    useEffect(() => {
        if (typeof status === 'string' && status.length > 0) {
            toast.success(status);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/register', {
            onSuccess: () => {
                // Clear passwords from memory after the redirect has started.
                // Inertia follows the backend redirect (to /login with a
                // "account created" status flash) so we only need to tidy up.
                reset('password', 'password_confirmation');
            },
            onError: () => {
                // Ensure the user can see the inline errors — keep the form
                // populated so they can fix and re-submit without retyping.
            },
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Create customer account" />

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

                            {/* Tagline beneath brand name — customer registration focused */}
                            <p className="mt-4 text-lg opacity-90">
                                Make every moment float. Create your customer
                                account today.
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
                            {/* Page heading + subcopy */}
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight text-popjoy-ink sm:text-3xl">
                                    Create your account
                                </h2>
                                <p className="mt-2 text-muted-foreground">
                                    Join Party &amp; Eden for faster checkout,
                                    order tracking, and exclusive rewards.
                                </p>
                            </div>

                            {/* Inertia form submission via raw router.post (custom controller) */}
                            <form
                                onSubmit={submit}
                                method="post"
                                className="space-y-6"
                            >
                                {/* Name row — first + last name in two columns on sm+ */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* First name field */}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="first_name"
                                            className="text-sm font-medium"
                                        >
                                            First name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="given-name"
                                            placeholder="Ada"
                                            value={data.first_name}
                                            onChange={(e) =>
                                                setData(
                                                    'first_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-12"
                                            aria-invalid={!!errors.first_name}
                                            aria-describedby={
                                                errors.first_name
                                                    ? 'first_name-error'
                                                    : undefined
                                            }
                                        />
                                        <InputError
                                            id="first_name-error"
                                            message={errors.first_name}
                                        />
                                    </div>

                                    {/* Last name field */}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="last_name"
                                            className="text-sm font-medium"
                                        >
                                            Last name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            autoComplete="family-name"
                                            placeholder="Lovelace"
                                            value={data.last_name}
                                            onChange={(e) =>
                                                setData(
                                                    'last_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-12"
                                            aria-invalid={!!errors.last_name}
                                            aria-describedby={
                                                errors.last_name
                                                    ? 'last_name-error'
                                                    : undefined
                                            }
                                        />
                                        <InputError
                                            id="last_name-error"
                                            message={errors.last_name}
                                        />
                                    </div>
                                </div>

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
                                        name="email"
                                        type="email"
                                        required
                                        tabIndex={3}
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
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

                                {/* Password field — includes password rules hint */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        placeholder="Create a password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
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
                                    {/* Bullet list of human-readable password
                                        requirements. Maps the backend
                                        `passwordRulesList` string array to a
                                        small check-mark list so users can
                                        visually confirm which rules they've
                                        met (or need to meet). */}
                                    <div className="mt-2 rounded-xl border border-popjoy-divider bg-popjoy-purple-bg/30 px-4 py-3 text-xs text-muted-foreground">
                                        <p className="mb-2 text-xs font-semibold text-popjoy-ink">
                                            Your password must have:
                                        </p>
                                        <ul
                                            role="list"
                                            className="grid gap-1.5 pl-1"
                                        >
                                            {passwordRulesList.map((rule) => (
                                                <li
                                                    key={rule}
                                                    className="flex items-start gap-2"
                                                >
                                                    <span
                                                        className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-popjoy-purple"
                                                        aria-hidden
                                                    />
                                                    <span>{rule}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Confirm password field */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-sm font-medium"
                                    >
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        placeholder="Confirm your password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className="h-12"
                                        aria-invalid={
                                            !!errors.password_confirmation
                                        }
                                        aria-describedby={
                                            errors.password_confirmation
                                                ? 'password_confirmation-error'
                                                : undefined
                                        }
                                    />
                                    <InputError
                                        id="password_confirmation-error"
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                {/* Submit button — full width, 48px touch target, spinner while processing */}
                                <Button
                                    type="submit"
                                    className="mt-6 h-12 w-full rounded-xl bg-popjoy-purple text-base font-semibold text-white hover:bg-popjoy-purple/90"
                                    tabIndex={6}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Spinner className="mr-2" />
                                    ) : null}
                                    Create customer account
                                </Button>

                                {/* Login CTA — centered at bottom of form */}
                                <div className="mt-6 text-center text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <TextLink
                                        href={login()}
                                        tabIndex={7}
                                        className="font-medium text-popjoy-purple hover:text-popjoy-purple/90"
                                    >
                                        Log in
                                    </TextLink>
                                </div>
                            </form>
                        </main>
                    </section>
                </div>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Create your customer account',
    description:
        'Enter your details below to create your Party Eden customer account',
};
