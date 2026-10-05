import { cn } from '@/lib/utils';

/**
 * Thumbnail tile shown under the preview stage.
 */
export type FigmaProductThumbnail = {
    /** Label displayed over the image, e.g. "Hero", "Unbox", "Macro" */
    label: string;
    /** Image source; when omitted a gradient placeholder is used */
    imageSrc?: string;
    /** Tile background color for the placeholder gradient */
    tileBg?: string;
};

/**
 * Add-on control chip shown below the stage (LED, rotate, zoom, share, fullscreen).
 */
export type FigmaStageControl = {
    /** SVG icon source path */
    iconSrc: string;
    /** Label text, e.g. "Fairy LED String (+£4.00)" */
    label?: string;
    /** Whether the chip is an outlined pill (with label) vs small square icon */
    pill?: boolean;
};

/**
 * Props for the FigmaProductPreview component.
 * Matches Figma `.liveInteractiveVisua` + `.thumbnailGalleryStri`:
 * LIVE 3D PREVIEW + SPEC pill row, the crystal balloon stage with
 * interior fills + vinyl lettering + satin neck/tassel, floating
 * reassurance badges, stage control chips, and 4 thumbnail tiles.
 */
export type FigmaProductPreviewProps = {
    /** Vinyl wording line 1 rendered inside the bubble (e.g. "Happy 30th\nBirthday") */
    vinylLine1?: string;
    /** Vinyl wording line 2 rendered inside the bubble (e.g. "Sophia! ✨") */
    vinylLine2?: string;
    /** VINYL SPEC pill text, e.g. "Metallic Gold Foil • Signature Calligraphy" */
    vinylSpec?: string;
    /** Optional add-on / stage control chips (defaults: LED + rotate/zoom/share/fullscreen) */
    stageControls?: FigmaStageControl[];
    /** Thumbnail gallery strip of 4 tiles */
    thumbnails?: FigmaProductThumbnail[];
    /** Optional additional className for the outer card */
    className?: string;
    /** Optional id attribute for the outer card */
    id?: string;
};

const defaultThumbnails: FigmaProductThumbnail[] = [
    { label: 'Hero', tileBg: '#eaddff' },
    { label: 'Unbox', tileBg: '#fff4d6' },
    {
        label: 'Macro',
        tileBg: '#f9f1ff',
        imageSrc: '/figma-img/mui8gtp5-bsv6af9.png',
    },
    { label: 'Scale', tileBg: '#f3e8ff' },
];

const defaultControls: FigmaStageControl[] = [
    {
        pill: true,
        iconSrc: '/figma-img/mui8gto1-d9n3yza.svg',
        label: 'Fairy LED String (+£4.00)',
    },
    { iconSrc: '/figma-img/mui8gto1-57taafh.svg' },
    { iconSrc: '/figma-img/mui8gto1-thex2sx.svg' },
    { iconSrc: '/figma-img/mui8gto1-1juuefs.svg' },
    { iconSrc: '/figma-img/mui8gto1-f5q2s7s.svg' },
];

/**
 * Left-column hero card: live 3D preview stage showing the personalised
 * crystal bubble balloon with its interior feather/confetti fill, dynamic
 * vinyl calligraphy, satin neck bow, and tassel tail.
 *
 * Card is wrapped in a 48px rounded white surface with soft drop shadow
 * matching Figma `.liveInteractiveVisua`.
 *
 * @example
 * <FigmaProductPreview
 *   vinylLine1="Happy 30th\nBirthday"
 *   vinylLine2="Sophia! ✨"
 * />
 */
export function FigmaProductPreview({
    vinylLine1 = 'Happy 30th\nBirthday',
    vinylLine2 = 'Sophia! ✨',
    vinylSpec = 'VINYL SPEC: Metallic Gold Foil • Signature Calligraphy',
    stageControls = defaultControls,
    thumbnails = defaultThumbnails,
    className,
    id,
}: FigmaProductPreviewProps) {
    return (
        <div
            id={id}
            className={cn(
                'flex shrink-0 flex-col items-center self-stretch overflow-hidden rounded-[48px] bg-white p-4 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]',
                className,
            )}
        >
            {/* Status pill bar */}
            <div
                className="flex w-full items-center justify-between pb-3"
                style={{ minWidth: '548px' }}
            >
                {/* LIVE 3D PREVIEW pill */}
                <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-popjoy-gold px-3 py-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                    <img
                        src="/figma-img/mui8gto1-dkiw22q.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-[14px] w-[14px] shrink-0"
                    />
                    <p className="shrink-0 text-[12px] leading-[16px] font-bold tracking-[0.6px] text-popjoy-gold-ink uppercase">
                        LIVE 3D PREVIEW
                    </p>
                </div>
                {/* Vinyl spec pill */}
                <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-popjoy-purple-surface/50 px-3 py-1">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#785a00]" />
                    <p className="shrink-0 text-[11px] leading-[14px] font-semibold tracking-[0.33px] text-popjoy-ink">
                        {vinylSpec}
                    </p>
                </div>
            </div>

            {/* Main stage */}
            <div
                className="relative flex items-center justify-center overflow-hidden rounded-[32px] py-[114px]"
                style={{
                    width: '548px',
                    backgroundImage:
                        'linear-gradient(180deg, #f9f1ff 0%, #f4eaff 50%, #eee4ff 100%)',
                }}
            >
                {/* Virtual 3D balloon + neck */}
                <div
                    className="flex flex-col items-center justify-center"
                    style={{ width: '320px' }}
                >
                    {/* Crystal clear bubble */}
                    <div
                        className="relative shrink-0 overflow-hidden rounded-full"
                        style={{
                            width: '256px',
                            height: '224px',
                            boxShadow:
                                'inset 0px 0px 24px 0px rgba(255,255,255,0.9), 0px 20px 35px -8px rgba(124,58,237,0.22)',
                            backgroundImage:
                                'linear-gradient(41.19deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 100%)',
                            backdropFilter: 'blur(1px)',
                        }}
                    >
                        {/* Specular highlights */}
                        <div
                            className="absolute top-3 left-6 rounded-full opacity-70 blur-[1px]"
                            style={{
                                width: '80px',
                                height: '40px',
                                background: 'rgba(255,255,255,0.7)',
                                transform: 'rotate(-45deg)',
                            }}
                        />
                        <div
                            className="absolute right-6 bottom-4 rounded-full blur-[2px]"
                            style={{
                                width: '96px',
                                height: '48px',
                                background: 'rgba(255,255,255,0.25)',
                                transform: 'rotate(12deg)',
                            }}
                        />
                        {/* Interior fill layer (feathers + confetti) */}
                        <div
                            className="absolute inset-0 opacity-90"
                            style={{ padding: '105px 34px 65px 25px' }}
                        >
                            <img
                                src="/figma-img/mui8gto1-cymmtz4.svg"
                                alt=""
                                aria-hidden="true"
                                className="relative mt-4 h-[30px] w-[30px]"
                                style={{ transform: 'rotate(-12deg)' }}
                            />
                            <img
                                src="/figma-img/mui8gto1-ofdu4y8.svg"
                                alt=""
                                aria-hidden="true"
                                className="absolute h-[40px] w-[40px]"
                                style={{
                                    top: '76px',
                                    left: '65px',
                                    transform: 'rotate(45deg)',
                                }}
                            />
                            <img
                                src="/figma-img/mui8gto1-ybxc8vm.svg"
                                alt=""
                                aria-hidden="true"
                                className="absolute h-[25px] w-[25px]"
                                style={{
                                    top: '100px',
                                    left: '132px',
                                    transform: 'rotate(-45deg)',
                                }}
                            />
                            <img
                                src="/figma-img/mui8gto1-c22zahw.svg"
                                alt=""
                                aria-hidden="true"
                                className="relative z-10 mt-6 ml-[73px] h-[30px] w-[30px]"
                                style={{ transform: 'rotate(12deg)' }}
                            />
                            <img
                                src="/figma-img/mui8gto1-vjs0235.svg"
                                alt=""
                                aria-hidden="true"
                                className="relative ml-[33px] h-[30px] w-[30px]"
                                style={{ transform: 'rotate(90deg)' }}
                            />
                        </div>
                        {/* Vinyl lettering overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <div
                                className="text-center font-plus-jakarta"
                                style={{
                                    fontSize: '26px',
                                    fontWeight: 800,
                                    letterSpacing: '-0.4px',
                                    lineHeight: '30px',
                                    color: '#6d5200',
                                    textShadow:
                                        '0px 1px 0px rgba(255,255,255,0.6), 0px 2px 4px rgba(109,82,0,0.18)',
                                }}
                            >
                                {vinylLine1.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i <
                                            vinylLine1.split('\n').length -
                                                1 && <br />}
                                    </span>
                                ))}
                            </div>
                            <div
                                className="mt-1 text-center font-plus-jakarta"
                                style={{
                                    fontSize: '28px',
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    lineHeight: '32px',
                                    color: '#6d5200',
                                    textShadow:
                                        '0px 1px 0px rgba(255,255,255,0.6), 0px 2px 4px rgba(109,82,0,0.18)',
                                }}
                            >
                                {vinylLine2}
                            </div>
                        </div>
                    </div>
                    {/* Satin neck + tiered tassel tail */}
                    <div className="relative -mt-2 flex flex-col items-center">
                        <div className="relative">
                            <div
                                className="h-4 w-8 rounded-b-lg"
                                style={{
                                    background:
                                        'linear-gradient(180deg, #7c3aed 0%, #630ed4 100%)',
                                    boxShadow:
                                        'inset 0px 1px 2px 0px rgba(255,255,255,0.3), 0px 2px 4px -2px rgba(99,14,212,0.3)',
                                }}
                            />
                        </div>
                        {/* Tassel tiers */}
                        <div className="relative flex flex-col items-center">
                            <div
                                className="-mt-1 h-3 w-12 rounded-sm"
                                style={{
                                    background:
                                        'linear-gradient(90deg, #7c3aed 0%, #630ed4 50%, #7c3aed 100%)',
                                    opacity: 0.88,
                                    filter: 'drop-shadow(0px 2px 2px rgba(99,14,212,0.25))',
                                }}
                            />
                            <div
                                className="-mt-1 h-3 w-10 rounded-sm"
                                style={{
                                    background:
                                        'linear-gradient(90deg, #fdc425 0%, #f59e0b 50%, #fdc425 100%)',
                                    opacity: 0.9,
                                    filter: 'drop-shadow(0px 2px 2px rgba(109,82,0,0.25))',
                                }}
                            />
                            <div
                                className="-mt-1 h-3 w-8 rounded-sm"
                                style={{
                                    background:
                                        'linear-gradient(90deg, #f472b6 0%, #db2777 50%, #f472b6 100%)',
                                    opacity: 0.85,
                                    filter: 'drop-shadow(0px 2px 2px rgba(219,39,119,0.25))',
                                }}
                            />
                            <div
                                className="mt-1 inline-flex items-center justify-center rounded-full bg-popjoy-purple-soft/30 px-2 py-0.5"
                                style={{ width: '52px', height: '20px' }}
                            >
                                <span
                                    className="font-plus-jakarta text-[10px] leading-[14px] font-bold text-popjoy-purple"
                                    style={{ letterSpacing: '0.3px' }}
                                >
                                    POP
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating reassurance badges */}
                <div
                    className="absolute bottom-6 left-4 inline-flex items-center gap-2 rounded-full border border-popjoy-gold-border bg-white px-3 py-2"
                    style={{
                        boxShadow:
                            '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
                    }}
                >
                    <img
                        src="/figma-img/mui8gto1-4wyd727.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                    />
                    <p className="text-[12px] leading-[16px] font-semibold tracking-[0.24px] text-popjoy-purple">
                        100% Helium Inflated & Weighted
                    </p>
                </div>
                <div
                    className="absolute right-4 bottom-6 inline-flex items-center gap-2 rounded-full border border-popjoy-purple-surface bg-white px-3 py-2"
                    style={{
                        boxShadow:
                            '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
                    }}
                >
                    <img
                        src="/figma-img/mui8gto1-a9libh8.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                    />
                    <p className="text-[12px] leading-[16px] font-semibold tracking-[0.24px] text-popjoy-ink">
                        Floats 10–14 Days Guaranteed
                    </p>
                </div>

                {/* Stage control chips (LED pill + icon buttons) */}
                <div className="absolute top-4 right-4 inline-flex items-center gap-2">
                    {stageControls.slice(0, 1).map((control, i) => (
                        <div
                            key={`led-${i}`}
                            className="inline-flex items-center gap-2 rounded-full border border-popjoy-purple-surface bg-white px-3 py-2 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                        >
                            <img
                                src={control.iconSrc}
                                alt=""
                                aria-hidden="true"
                                className="h-[14px] w-[14px] shrink-0"
                            />
                            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.24px] text-popjoy-ink">
                                {control.label}
                            </p>
                        </div>
                    ))}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 p-1 backdrop-blur">
                        {stageControls.slice(1).map((control, i) => (
                            <button
                                key={`icon-${i}`}
                                type="button"
                                aria-label={
                                    control.label || `Stage control ${i + 1}`
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-popjoy-purple-bg transition hover:bg-popjoy-purple-surface"
                            >
                                <img
                                    src={control.iconSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[14px] w-[14px] shrink-0"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Thumbnail gallery strip */}
            <div className="mt-4 flex w-full items-center justify-between gap-3">
                {thumbnails.slice(0, 4).map((t, i) => (
                    <button
                        key={`thumb-${i}-${t.label}`}
                        type="button"
                        aria-label={`View ${t.label} image`}
                        className="group relative flex h-[86px] w-[128px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-popjoy-divider/40 transition hover:border-popjoy-purple-surface"
                        style={{ background: t.tileBg || '#f9f1ff' }}
                    >
                        {t.imageSrc ? (
                            <img
                                src={t.imageSrc}
                                alt={t.label}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : (
                            <img
                                src="/figma-img/mui8bfpc-2tu7w0f.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-10 w-10 opacity-30"
                            />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-popjoy-ink/20">
                            <p className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-white uppercase">
                                {t.label}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
