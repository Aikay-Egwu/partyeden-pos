import { cn } from '@/lib/utils';

/**
 * Single link item inside a footer navigation column.
 */
export type FigmaFooterLink = {
    /** Visible link label */
    label: string;
    /** Href destination */
    href: string;
};

/**
 * A footer navigation column with a heading and a list of link items.
 */
export type FigmaFooterColumn = {
    /** Uppercase heading label, e.g. "SHOP COLLECTIONS" */
    heading: string;
    /** Links rendered below the heading */
    links: FigmaFooterLink[];
};

/**
 * Social media icon item used in the brand column.
 */
export type FigmaSocialIcon = {
    /** Image source path for the SVG icon */
    iconSrc: string;
    /** Accessible label for the social link */
    label: string;
    /** Href to the social profile */
    href: string;
};

/**
 * Props for the FigmaFooter component.
 * Matches Figma `.container93`: 4-column footer (brand, shop, care, services)
 * plus a bottom copyright bar with Privacy/Terms/Cookies links.
 */
export type FigmaFooterProps = {
    /** Brand name shown next to the balloon icon */
    brandName?: string;
    /** Brand description blurb shown under the logo */
    brandDescription?: string;
    /** 3 social icons rendered in the brand column */
    socialIcons?: FigmaSocialIcon[];
    /** Custom navigation columns — defaults to the 3 Party Eden columns. */
    columns?: FigmaFooterColumn[];
    /** Copyright text shown on the left of the bottom bar */
    copyrightText?: string;
    /** Bottom-bar legal link labels */
    legalLinks?: FigmaFooterLink[];
    /** Optional additional className for the outer footer */
    className?: string;
    /** Optional id attribute for the outer footer */
    id?: string;
};

const defaultSocialIcons: FigmaSocialIcon[] = [
    {
        iconSrc: '/figma-img/muhjqso4-281ep9t.svg',
        label: 'Instagram',
        href: '#',
    },
    {
        iconSrc: '/figma-img/muhjqso4-l70vzbr.svg',
        label: 'Facebook',
        href: '#',
    },
    {
        iconSrc: '/figma-img/muhjqso4-r6143ke.svg',
        label: 'TikTok',
        href: '#',
    },
];

const defaultColumns: FigmaFooterColumn[] = [
    {
        heading: 'SHOP COLLECTIONS',
        links: [
            { label: 'Personalised Bubbles', href: '#' },
            { label: 'Milestone Numbers', href: '#' },
            { label: 'Birthday Clusters', href: '#' },
            { label: 'Organic Garlands', href: '#' },
            { label: 'Kids Party Themes', href: '#' },
        ],
    },
    {
        heading: 'CUSTOMER CARE',
        links: [
            { label: 'Check Delivery Dates', href: '#' },
            { label: 'Helium Float Care Guide', href: '/faq' },
            { label: 'Track Order (DPD)', href: '#' },
            { label: 'Returns & Replacements', href: '#' },
            { label: 'Contact Studio Support', href: '#' },
        ],
    },
    {
        heading: 'EVENT SERVICES',
        links: [
            { label: 'Ceiling Installs London', href: '#' },
            { label: 'Corporate PR Launches', href: '#' },
            { label: 'Wedding Moongates', href: '#' },
            { label: 'Download Lookbook', href: '#' },
            { label: 'Wholesale & Trade', href: '#' },
        ],
    },
];

const defaultLegalLinks: FigmaFooterLink[] = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Preferences', href: '#' },
];

/**
 * Store footer matching the Figma `.container93` + `.container91` spec.
 * Light purple/cream background with a 4-column top section:
 * - Col 1: balloon icon, "Party Eden Boutique" brand name, description, 3 social SVGs.
 * - Col 2: SHOP COLLECTIONS — 5 product category links.
 * - Col 3: CUSTOMER CARE — 5 support/tracking links.
 * - Col 4: EVENT SERVICES — 5 installations/lookbook links.
 *
 * Bottom copyright bar with a horizontal divider,
 * © 2025 Party Eden Balloon Boutique Ltd text + biodegradable promise on the left,
 * Privacy / Terms / Cookies links on the right.
 *
 * @example
 * <FigmaFooter />
 */
export function FigmaFooter({
    brandName = 'Party Eden Boutique',
    brandDescription = "The UK's premier destination for luxury pre-inflated balloon gifts, event styling, and personalized party decor. Handcrafted in our bespoke London studio.",
    socialIcons = defaultSocialIcons,
    columns = defaultColumns,
    copyrightText = '© 2025 Party Eden Balloon Boutique Ltd. All rights reserved. 100% Biodegradable Latex Promise.',
    legalLinks = defaultLegalLinks,
    className,
    id,
}: FigmaFooterProps) {
    const sectionId = id ? `${id}-footer` : 'site-footer';

    return (
        <footer
            id={sectionId}
            role="contentinfo"
            className={cn(
                'flex w-full flex-col items-start border-t border-popjoy-divider/40 bg-popjoy-purple-bg',
                className,
            )}
        >
            {/* Top: 4-column content — grid with responsive breakdown */}
            <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 px-4 pt-12 pb-8 sm:grid-cols-2 sm:px-6 sm:pt-16 sm:pb-10 lg:grid-cols-4 lg:px-8">
                {/* Col 1: Brand + socials — spans all cols on mobile */}
                <div className="sm:col-span-2 flex max-w-[360px] flex-col items-start gap-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-popjoy-purple-surface">
                            <span
                                aria-hidden="true"
                                className="text-2xl leading-8"
                            >
                                🎈
                            </span>
                        </div>
                        <span className="font-plus-jakarta text-xl leading-7 font-bold tracking-tight text-popjoy-ink">
                            {brandName}
                        </span>
                    </div>
                    <p className="font-sans text-sm leading-6 text-popjoy-muted">
                        {brandDescription}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                        {socialIcons.map((social, sIndex) => (
                            <a
                                key={`${social.label}-${sIndex}`}
                                href={social.href}
                                aria-label={social.label}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-popjoy-divider/50 bg-white transition-colors hover:bg-popjoy-purple-surface/40"
                            >
                                <img
                                    src={social.iconSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[18px] w-[18px] shrink-0"
                                />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Cols 2-4: navigation columns */}
                {columns.map((column, cIndex) => (
                    <nav
                        key={`${column.heading}-${cIndex}`}
                        aria-label={column.heading}
                        className="flex flex-col items-start gap-4"
                    >
                        <h3 className="font-sans text-[11px] leading-[17px] font-bold tracking-[1.1px] text-popjoy-purple uppercase">
                            {column.heading}
                        </h3>
                        <ul className="flex flex-col items-start gap-3">
                            {column.links.map((link, lIndex) => (
                                <li key={`${link.label}-${lIndex}`}>
                                    <a
                                        href={link.href}
                                        className="font-sans text-sm leading-6 text-popjoy-muted transition-colors hover:text-popjoy-purple"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>

            {/* Bottom: copyright bar — stacks on mobile, row on md+ */}
            <div className="w-full border-t border-popjoy-divider/50">
                <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center lg:px-8">
                    <p className="font-sans text-xs leading-4 text-popjoy-muted-light">
                        {copyrightText}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {legalLinks.map((link, lIndex) => (
                            <a
                                key={`legal-${link.label}-${lIndex}`}
                                href={link.href}
                                className="font-sans text-xs leading-4 text-popjoy-muted-light transition-colors hover:text-popjoy-purple"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
