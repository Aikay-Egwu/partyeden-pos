export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

/** Authenticated storefront shopper (separate Customer model with a UUID id). */
export type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    date_of_birth?: string | null;
    company_name?: string | null;
    is_active?: boolean;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
};

/**
 * The currently authenticated user: either an admin `User` or a storefront
 * `Customer`. Guests have no entry here (resolved to `null` at runtime).
 */
export type Auth = {
    user: User | Customer;
};

/**
 * Human-readable display name for either authenticated user type.
 * Admins use `name`; customers compose `first_name` + `last_name`.
 */
export function getUserDisplayName(user: User | Customer): string {
    if ('first_name' in user) {
        return [user.first_name, user.last_name]
            .filter(Boolean)
            .join(' ')
            .trim();
    }

    return user.name;
}

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
