import { cn } from '@/lib/utils';

/**
 * Single link item inside a footer navigation column.
 */
export type CatalogFooterLink = {
    /** Visible link label */
    label: string;
    /** Href destination */
    href: string;
};

/**
 * A footer navigation column with a heading and a list of link items.
 */
export type CatalogFooterColumn = {
    /** Column heading label (e.g. "Celebrations") */
    heading: string;
    /** Links rendered below the heading */
    links: CatalogFooterLink[];
};

/**
 * Props for the CatalogNewsletterFooter component.
 * Combines:
 *   - Newsletter signup block (Figma `.container114` tail — Celebration Club £10 off)
 *   - 4-col footer grid (Figma `.container136` footer — brand + 3 nav cols)
 *   - Copyright bar with legal links.
 */
export type CatalogNewsletterFooterProps = {
    /* ===== Newsletter block ===== */
    /** Uppercase CELEBRATION CLUB eyebrow */
    newsletterEyebrow?: string;
    /** £10-off headline */
    newsletterHeadline?: string;
    /** Supporting description about birthday club & voucher */
    newsletterDescription?: string;
    /** Email input placeholder */
    emailPlaceholder?: string;
    /** CTA label on the voucher button */
    voucherCtaLabel?: string;

    /* ===== Footer Brand column ===== */
    /** "Pop & Joy" brand name */
    brandName?: string;
    /** Brand description blurb (curators of luxury balloons...) */
    brandDescription?: string;
    /** Balloon "Helium Quality Certified" chip icon */
    heliumBadgeIconSrc?: string;
    /** "Helium Quality Certified" chip label */
    heliumBadgeLabel?: string;

    /* ===== 3 Nav columns ===== */
    /** Nav columns: Celebrations, Customer Care, Studio Hours (or custom) */
    columns?: CatalogFooterColumn[];

    /* ===== Studio Hours special text items ===== */
    /** Mon-Fri line */
    studioHoursWeekday?: string;
    /** Sat-Sun line */
    studioHoursWeekend?: string;
    /** London Studio & White Glove Courier Hub line */
    studioLocation?: string;

    /* ===== Copyright bar ===== */
    /** Copyright line text */
    copyrightText?: string;
    /** Legal links (Privacy / Terms / Eco-Friendly Promise) */
    legalLinks?: CatalogFooterLink[];

    /** Optional additional className for the outer footer */
    className?: string;
    /** Optional id attribute for the outer footer */
    id?: string;
};

const defaultColumns: CatalogFooterColumn[] = [
    {
        heading: 'Celebrations',
        links: [
            { label: 'Personalised Bubbles', href: '#' },
            { label: 'Milestone Numbers', href: '#' },
            { label: 'Balloon Garlands & Arches', href: '#' },
            { label: 'Corporate Installs', href: '#' },
            { label: 'Theme Collections', href: '#' },
        ],
    },
    {
        heading: 'Customer Care',
        links: [
            { label: 'Delivery Tracker', href: '#' },
            { label: 'Helium Longevity Guide', href: '#' },
            { label: 'Balloon Float Times', href: '#' },
            { label: 'Refund & Replacements', href: '#' },
            { label: 'Contact Our Studio', href: '#' },
        ],
    },
];

const defaultLegalLinks: CatalogFooterLink[] = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Eco-Friendly Latex Promise', href: '#' },
];

/**
 * Combined newsletter signup + 4-col site footer + copyright bar,
 * matching the Figma `.container114` tail + `.container136` spec.
 *
 * Layout (3 stacked blocks):
 *
 * 1) NEWSLETTER BLOCK — rounded-3xl purple-surface card with shadow:
 *    - LEFT: uppercase purple "CELEBRATION CLUB" eyebrow,
 *            22px Plus-Jakarta "Get £10 off your first birthday balloon bunch",
 *            description about birthday club inspiration + £10 voucher.
 *    - RIGHT: rounded-full white pill email input + purple "Claim £10 Voucher"
 *             gold-shadow pill button.
 *
 * 2) 4-COL FOOTER GRID (popjoy-purple-bg section):
 *    - Col 1 "Pop & Joy": large purple brand heading + description +
 *      rounded-pill "Helium Quality Certified" badge (balloon icon).
 *    - Col 2 "Celebrations" — 5 category links.
 *    - Col 3 "Customer Care" — 5 support/delivery links.
 *    - Col 4 "Studio Hours": Mon-Fri, Sat-Sun lines +
 *      purple "London Studio & White Glove Courier Hub" text.
 *
 * 3) COPYRIGHT BAR — horizontal popjoy-divider border above:
 *    - LEFT: © 2025 Pop & Joy Balloons Boutique Ltd text.
 *    - RIGHT: 3 legal links (Privacy / Terms / Eco Promise).
 *
 * @example
 * <CatalogNewsletterFooter />
 */
export function CatalogNewsletterFooter({
    newsletterEyebrow = 'CELEBRATION CLUB',
    newsletterHeadline = 'Get £10 off your first birthday balloon bunch',
    newsletterDescription = 'Join our birthday club for bespoke bouquet inspiration, secret seasonal drops, and a celebratory £10 gift voucher delivered directly on your birthday.',
    emailPlaceholder = 'Enter your celebratory email...',
    voucherCtaLabel = 'Claim £10 Voucher',

    brandName = 'Pop & Joy',
    brandDescription = 'Curators of luxury inflated balloon moments, helium centerpieces, organic party arches, and unforgettable bespoke installations delivered across the UK.',
    heliumBadgeIconSrc = '/figma-img/mui8bfpf-w56anb1.svg',
    heliumBadgeLabel = 'Helium Quality Certified',

    columns = defaultColumns,
    studioHoursWeekday = 'Mon - Fri: 8:00am - 6:00pm',
    studioHoursWeekend = 'Sat - Sun: 9:00am - 4:00pm',
    studioLocation = 'London Studio & White Glove Courier Hub',

    copyrightText = '© 2025 Pop & Joy Balloons Boutique Ltd. All celebration rights reserved.',
    legalLinks = defaultLegalLinks,

    className,
    id,
}: CatalogNewsletterFooterProps) {
    const newsletterHeadingId = id
        ? `${id}-newsletter-heading`
        : 'newsletter-footer-heading';
    const footerId = id ? `${id}-footer` : 'catalog-footer';

    return (
        <footer
            id={footerId}
            role="contentinfo"
            aria-labelledby={newsletterHeadingId}
            className={cn(
                'mt-16 flex w-full flex-col items-start self-stretch',
                className,
            )}
            style={{
                boxShadow: '0px -4px 24px 0px rgba(99,14,212,0.03)',
                background: '#F9F1FF',
                padding: '64px 40px 40px',
                rowGap: '64px',
            }}
        >
            {/* =========================================================
             * BLOCK 1: NEWSLETTER (Celebration Club £10 voucher)
             * ========================================================= */}
            <div
                className="flex w-full shrink-0 items-center self-stretch rounded-[32px]"
                style={{ background: '#F4EAFF' }}
            >
                <div
                    className="flex flex-1 items-center justify-between self-stretch rounded-[32px] px-10 py-10"
                    style={{
                        boxShadow: '0px 8px 24px -4px rgba(124,58,237,0.12)',
                        background: 'rgba(255,255,255,0.005)',
                        width: '1200px',
                        minWidth: '1200px',
                        height: '188px',
                    }}
                >
                    {/* LEFT: eyebrow + headline + description */}
                    <div
                        className="inline-flex max-w-[576px] flex-col items-start pt-[6px]"
                        style={{ rowGap: '7px' }}
                    >
                        <span
                            className="shrink-0 self-stretch font-sans font-bold text-popjoy-purple uppercase"
                            style={{
                                fontSize: '12px',
                                lineHeight: '16px',
                                letterSpacing: '1.2px',
                            }}
                        >
                            {newsletterEyebrow}
                        </span>
                        <h2
                            id={newsletterHeadingId}
                            className="shrink-0 self-stretch font-plus-jakarta font-bold text-popjoy-ink"
                            style={{
                                fontSize: '22px',
                                lineHeight: '28px',
                                letterSpacing: '0',
                            }}
                        >
                            {newsletterHeadline}
                        </h2>
                        <div className="flex shrink-0 flex-col items-start self-stretch pt-[2px]">
                            <p
                                className="shrink-0 font-sans text-popjoy-muted"
                                style={{
                                    width: '554px',
                                    fontSize: '15px',
                                    lineHeight: '22px',
                                    letterSpacing: '0',
                                }}
                            >
                                {newsletterDescription}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: email input pill + claim voucher button */}
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        role="form"
                        aria-label="Celebration Club newsletter signup"
                        className="inline-flex items-start"
                        style={{ columnGap: '8px' }}
                    >
                        {/* Rounded-full white email input */}
                        <div
                            className="inline-flex shrink-0 flex-col items-start justify-center self-stretch overflow-hidden rounded-full px-4 py-[13px]"
                            style={{ background: '#FFFFFF' }}
                        >
                            <label
                                htmlFor="newsletter-footer-email"
                                className="sr-only"
                            >
                                {emailPlaceholder}
                            </label>
                            <input
                                id="newsletter-footer-email"
                                type="email"
                                placeholder={emailPlaceholder}
                                className="w-[260px] min-w-[260px] bg-transparent font-sans text-popjoy-muted outline-none placeholder:text-popjoy-muted"
                                style={{
                                    fontSize: '13px',
                                    lineHeight: '16px',
                                    letterSpacing: '0',
                                }}
                            />
                        </div>

                        {/* Purple "Claim £10 Voucher" button with gold shadow */}
                        <button
                            type="submit"
                            className="flex shrink-0 items-center rounded-full bg-popjoy-purple-soft transition-opacity hover:opacity-90"
                            style={{
                                boxShadow:
                                    '0px 8px 20px -4px rgba(124,58,237,0.35)',
                            }}
                        >
                            <span
                                className="px-6 py-3 font-sans font-semibold text-white"
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '18px',
                                    letterSpacing: '0.14px',
                                }}
                            >
                                {voucherCtaLabel}
                            </span>
                        </button>
                    </form>
                </div>
            </div>

            {/* =========================================================
             * BLOCK 2: 4-COL FOOTER GRID
             * ========================================================= */}
            <div
                className="flex w-full shrink-0 items-center justify-between self-stretch"
                style={{ height: '158px' }}
            >
                {/* ----- Col 1: Brand ----- */}
                <div
                    className="flex flex-col items-start pb-6"
                    style={{ rowGap: '12px' }}
                >
                    <span
                        className="shrink-0 self-stretch font-plus-jakarta font-bold text-popjoy-purple"
                        style={{
                            fontSize: '22px',
                            lineHeight: '28px',
                            letterSpacing: '-0.55px',
                        }}
                    >
                        {brandName}
                    </span>
                    <div
                        className="flex shrink-0 flex-col items-start"
                        style={{ width: '384px' }}
                    >
                        <p
                            className="shrink-0 font-sans text-popjoy-muted"
                            style={{
                                width: '331px',
                                fontSize: '13px',
                                lineHeight: '18px',
                                letterSpacing: '0',
                            }}
                        >
                            {brandDescription}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center self-stretch pt-1">
                        <div
                            className="inline-flex flex-1 shrink-0 items-center rounded-full px-3 py-1"
                            style={{
                                columnGap: '4px',
                                marginRight: '279px',
                                background: '#F4EAFF',
                            }}
                        >
                            <img
                                src={heliumBadgeIconSrc}
                                alt=""
                                aria-hidden="true"
                                className="h-[15px] w-[15px] shrink-0"
                            />
                            <span
                                className="font-sans font-semibold text-popjoy-ink"
                                style={{
                                    fontSize: '12px',
                                    lineHeight: '16px',
                                    letterSpacing: '0.24px',
                                }}
                            >
                                {heliumBadgeLabel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ----- Cols 2 + 3: Generic nav columns ----- */}
                {columns.map((col, cIdx) => (
                    <nav
                        key={`footer-col-${cIdx}`}
                        aria-label={col.heading}
                        className="flex shrink-0 flex-col items-start"
                        style={{ rowGap: '12px' }}
                    >
                        <h3
                            className="shrink-0 self-stretch font-plus-jakarta font-semibold text-popjoy-ink"
                            style={{
                                fontSize: '18px',
                                lineHeight: '24px',
                                letterSpacing: '0',
                            }}
                        >
                            {col.heading}
                        </h3>
                        <ul
                            className="flex shrink-0 flex-col items-start self-stretch"
                            style={{ rowGap: '8px' }}
                        >
                            {col.links.map((link, lIdx) => (
                                <li key={`${col.heading}-link-${lIdx}`}>
                                    <a
                                        href={link.href}
                                        className="font-sans text-popjoy-muted transition-colors hover:text-popjoy-purple"
                                        style={{
                                            fontSize: '13px',
                                            lineHeight: '18px',
                                            letterSpacing: '0',
                                        }}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}

                {/* ----- Col 4: Studio Hours ----- */}
                <div
                    className="flex shrink-0 flex-col items-start pb-[38px]"
                    style={{ rowGap: '8px' }}
                >
                    <h3
                        className="shrink-0 self-stretch font-plus-jakarta font-semibold text-popjoy-ink"
                        style={{
                            fontSize: '18px',
                            lineHeight: '24px',
                            letterSpacing: '0',
                        }}
                    >
                        Studio Hours
                    </h3>
                    <p
                        className="shrink-0 self-stretch pt-1 font-sans text-popjoy-muted"
                        style={{
                            fontSize: '13px',
                            lineHeight: '18px',
                            letterSpacing: '0',
                        }}
                    >
                        {studioHoursWeekday}
                    </p>
                    <p
                        className="shrink-0 self-stretch font-sans text-popjoy-muted"
                        style={{
                            fontSize: '13px',
                            lineHeight: '18px',
                            letterSpacing: '0',
                        }}
                    >
                        {studioHoursWeekend}
                    </p>
                    <div className="flex shrink-0 flex-col items-start self-stretch pt-1">
                        <p
                            className="shrink-0 self-stretch font-sans font-bold text-popjoy-purple"
                            style={{
                                width: '221px',
                                fontSize: '11px',
                                lineHeight: '14px',
                                letterSpacing: '0.33px',
                            }}
                        >
                            {studioLocation}
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================================
             * BLOCK 3: COPYRIGHT BAR
             * ========================================================= */}
            <div
                className="flex w-full shrink-0 items-center justify-between self-stretch pt-[23px]"
                style={{
                    borderTop: '1px solid rgba(204,195,216,0.30)',
                }}
            >
                <p
                    className="shrink-0 font-sans font-medium text-popjoy-muted-light"
                    style={{
                        fontSize: '11px',
                        lineHeight: '14px',
                        letterSpacing: '0.33px',
                    }}
                >
                    {copyrightText}
                </p>
                <div
                    className="inline-flex shrink-0 items-center"
                    style={{ columnGap: '16px' }}
                >
                    {legalLinks.map((link, lIdx) => (
                        <a
                            key={`legal-link-${lIdx}`}
                            href={link.href}
                            className="font-sans font-medium text-popjoy-muted-light transition-colors hover:text-popjoy-purple"
                            style={{
                                fontSize: '11px',
                                lineHeight: '14px',
                                letterSpacing: '0.33px',
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
