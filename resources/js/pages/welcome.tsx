import { Head, Link } from '@inertiajs/react';
import {
    ShoppingBag,
    UserRound,
    ChevronDown,
    ArrowRight,
    Sparkles,
    Truck,
    Gift,
} from 'lucide-react';
import { CatalogSearch } from '@/components/store/catalog-search';
import '../../../resources/css/balloon-shop.css';

const categories = [
    {
        title: 'Birthday',
        emoji: '🎂',
        copy: 'Big birthdays, little birthdays & everything between.',
    },
    {
        title: 'Baby & Newborn',
        emoji: '🧸',
        copy: 'Baby showers, arrivals and gender reveals.',
    },
    {
        title: 'Weddings',
        emoji: '💍',
        copy: 'Elegant balloons for the big day.',
    },
    {
        title: 'Kids Parties',
        emoji: '🦄',
        copy: 'Colourful themes they will love.',
    },
    {
        title: 'Milestones',
        emoji: '🥂',
        copy: '18th, 21st, 30th, 40th and beyond.',
    },
    {
        title: 'Bespoke',
        emoji: '✨',
        copy: 'Tell us the vibe. We’ll make it balloon.',
    },
];

const products = [
    {
        name: 'Purple Party Balloon Stack',
        price: '£34.99',
        tag: 'Bestseller',
        tone: 'violet',
        art: '🎈',
    },
    {
        name: 'Golden Birthday Number',
        price: '£18.99',
        tag: 'Popular',
        tone: 'gold',
        art: '2️⃣',
    },
    {
        name: 'Lilac & Lemon Garland Kit',
        price: '£27.50',
        tag: 'New',
        tone: 'lilac',
        art: '🎊',
    },
    {
        name: 'Personalised Birthday Orb',
        price: '£29.99',
        tag: 'Personalise',
        tone: 'cream',
        art: '💜',
    },
];

export default function Home() {
    return (
        <>
            <Head title="PartyPop Balloons — Make Every Moment Float" />

            <div className="balloon-shop">
                <div className="announcement">
                    <span>FREE UK DELIVERY OVER £50</span>
                    <span className="announcement-dot">•</span>
                    <span>Need it sooner? Express delivery available</span>
                </div>

                <header className="site-header">
                    <div className="header-main">
                        <Link
                            href="/"
                            className="brand"
                            aria-label="PartyPop home"
                        >
                            <span className="brand-mark">✦</span>
                            <span>
                                <strong>PartyPop</strong>
                                <small>BALLOONS & CELEBRATIONS</small>
                            </span>
                        </Link>

                        <CatalogSearch variant="header" />

                        <div className="header-actions">
                            <button
                                className="icon-action"
                                aria-label="Account"
                            >
                                <UserRound size={21} />
                                <span>Account</span>
                            </button>
                            <button
                                className="icon-action bag-action"
                                aria-label="Shopping bag"
                            >
                                <ShoppingBag size={21} />
                                <span>Bag</span>
                                <b>2</b>
                            </button>
                        </div>
                    </div>

                    <nav className="category-nav" aria-label="Main navigation">
                        <button>
                            SHOP BALLOONS <ChevronDown size={15} />
                        </button>
                        <button>
                            BY OCCASION <ChevronDown size={15} />
                        </button>
                        <button>
                            BY COLOUR <ChevronDown size={15} />
                        </button>
                        <button>PERSONALISED</button>
                        <button>PARTY DECOR</button>
                        <button>DIY KITS</button>
                        <button className="nav-sale">SALE</button>
                        <button className="nav-custom">BESPOKE EVENTS</button>
                    </nav>
                </header>

                <main>
                    <section className="hero">
                        <div className="hero-copy">
                            <span className="eyebrow">
                                <Sparkles size={15} /> CELEBRATE IN COLOUR
                            </span>
                            <h1>
                                Make it a <em>balloon</em> kind of day.
                            </h1>
                            <p>
                                Beautiful balloons, personalised touches and
                                party-ready displays for birthdays, weddings,
                                baby showers and all the moments worth
                                celebrating.
                            </p>
                            <div className="hero-buttons">
                                <Link href="/shop" className="btn btn-primary">
                                    Shop balloons <ArrowRight size={18} />
                                </Link>
                                <Link href="/bespoke" className="btn btn-light">
                                    Create something bespoke
                                </Link>
                            </div>
                            <div className="hero-proof">
                                <span>★ ★ ★ ★ ★</span>
                                <span>4.9/5 from happy party people</span>
                            </div>
                        </div>

                        <div className="hero-art" aria-hidden="true">
                            <div className="confetti confetti-a">✦</div>
                            <div className="confetti confetti-b">•</div>
                            <div className="balloon balloon-purple">🎈</div>
                            <div className="balloon balloon-yellow">🎈</div>
                            <div className="balloon balloon-lilac">🎈</div>
                            <div className="hero-card">
                                <span>MAKE IT PERSONAL</span>
                                <strong>Add a name, age or message</strong>
                                <small>Made especially for them ✨</small>
                            </div>
                        </div>
                    </section>

                    <section className="value-strip">
                        <div>
                            <Truck />
                            <div>
                                <strong>Party-ready delivery</strong>
                                <span>Carefully packed across the UK</span>
                            </div>
                        </div>
                        <div>
                            <Gift />
                            <div>
                                <strong>Personalised balloons</strong>
                                <span>Names, ages, messages & photos</span>
                            </div>
                        </div>
                        <div>
                            <Sparkles />
                            <div>
                                <strong>Made with magic</strong>
                                <span>Beautifully styled by our team</span>
                            </div>
                        </div>
                    </section>

                    <section className="section">
                        <div className="section-heading">
                            <div>
                                <span className="eyebrow purple">
                                    SHOP YOUR CELEBRATION
                                </span>
                                <h2>What are we celebrating?</h2>
                            </div>
                            <Link href="/shop" className="text-link">
                                Shop all <ArrowRight size={17} />
                            </Link>
                        </div>
                        <div className="occasion-grid">
                            {categories.map((category) => (
                                <Link
                                    href="/shop"
                                    className="occasion-card"
                                    key={category.title}
                                >
                                    <span className="occasion-emoji">
                                        {category.emoji}
                                    </span>
                                    <h3>{category.title}</h3>
                                    <p>{category.copy}</p>
                                    <span className="circle-arrow">
                                        <ArrowRight size={16} />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="featured-banner">
                        <div>
                            <span className="eyebrow yellow">
                                JUST ADD CONFETTI
                            </span>
                            <h2>Your party deserves a little extra.</h2>
                            <p>
                                Pair your balloons with our curated party
                                decorations, cake toppers, table details and
                                finishing touches.
                            </p>
                            <Link href="/party-decor" className="btn btn-light">
                                Shop party decor <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="mini-balloons" aria-hidden="true">
                            🎈 🎈 🎈
                        </div>
                    </section>

                    <section className="section">
                        <div className="section-heading">
                            <div>
                                <span className="eyebrow purple">
                                    PEOPLE ARE LOVING
                                </span>
                                <h2>Bestselling balloons</h2>
                            </div>
                            <Link
                                href="/shop?sort=bestsellers"
                                className="text-link"
                            >
                                View all <ArrowRight size={17} />
                            </Link>
                        </div>
                        <div className="product-grid">
                            {products.map((product) => (
                                <article
                                    className="product-card"
                                    key={product.name}
                                >
                                    <Link
                                        href="/shop"
                                        className={`product-image ${product.tone}`}
                                    >
                                        <span className="product-tag">
                                            {product.tag}
                                        </span>
                                        <span className="product-art">
                                            {product.art}
                                        </span>
                                        <button
                                            className="quick-add"
                                            aria-label={`Quick add ${product.name}`}
                                        >
                                            +
                                        </button>
                                    </Link>
                                    <div className="product-info">
                                        <span className="stars">★★★★★</span>
                                        <h3>{product.name}</h3>
                                        <strong>{product.price}</strong>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="personalise">
                        <div className="personalise-art" aria-hidden="true">
                            <div className="orb orb-one">18</div>
                            <div className="orb orb-two">A</div>
                            <div className="orb orb-three">♥</div>
                        </div>
                        <div className="personalise-copy">
                            <span className="eyebrow yellow">
                                MAKE IT UNIQUELY THEIRS
                            </span>
                            <h2>
                                Add a name. Add a photo. Add a little magic.
                            </h2>
                            <p>
                                Our personalised balloon range is made for the
                                moments that deserve more than an ordinary card.
                            </p>
                            <Link
                                href="/personalised"
                                className="btn btn-primary"
                            >
                                Shop personalised <ArrowRight size={18} />
                            </Link>
                        </div>
                    </section>

                    <section className="reviews">
                        <div className="section-heading centered">
                            <div>
                                <span className="eyebrow purple">
                                    KIND WORDS
                                </span>
                                <h2>Party people said...</h2>
                            </div>
                        </div>
                        <div className="review-grid">
                            <blockquote>
                                “The balloons arrived beautifully packed and
                                looked even better than the photos. They made
                                the room!”<cite>— Hannah, Newcastle</cite>
                            </blockquote>
                            <blockquote>
                                “The personalised balloon was the star of the
                                birthday. So easy to order and genuinely
                                gorgeous.”<cite>— Sophie, Manchester</cite>
                            </blockquote>
                            <blockquote>
                                “Fantastic quality, quick delivery and the
                                colours were exactly what I wanted.”
                                <cite>— Amy, Leeds</cite>
                            </blockquote>
                        </div>
                    </section>

                    <section className="newsletter">
                        <div>
                            <span className="eyebrow yellow">
                                JOIN THE PARTY
                            </span>
                            <h2>10% off your first order</h2>
                            <p>
                                Sign up for party ideas, new balloon drops and
                                subscriber-only treats.
                            </p>
                        </div>
                        <form
                            className="newsletter-form"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                type="email"
                                placeholder="Your email address"
                                aria-label="Email address"
                            />
                            <button className="btn btn-primary">
                                Sign me up
                            </button>
                        </form>
                    </section>
                </main>

                <footer className="site-footer">
                    <div className="footer-brand">
                        <Link href="/" className="brand light-brand">
                            <span className="brand-mark">✦</span>
                            <span>
                                <strong>PartyPop</strong>
                                <small>BALLOONS & CELEBRATIONS</small>
                            </span>
                        </Link>
                        <p>
                            Big colour. Big smiles. Balloons for life's best
                            moments.
                        </p>
                    </div>
                    <div>
                        <h4>Shop</h4>
                        <Link href="/shop">All balloons</Link>
                        <Link href="/personalised">Personalised</Link>
                        <Link href="/shop">Number balloons</Link>
                        <Link href="/party-decor">Party decor</Link>
                    </div>
                    <div>
                        <h4>Help</h4>
                        <Link href="/delivery">Delivery</Link>
                        <Link href="/faq">FAQs</Link>
                        <Link href="/contact">Contact us</Link>
                        <Link href="/returns">Returns</Link>
                    </div>
                    <div>
                        <h4>Follow the fun</h4>
                        <p>@partypopballoons</p>
                        <p>hello@partypop.example</p>
                    </div>
                    <div className="footer-bottom">
                        © {new Date().getFullYear()} PartyPop Balloons · Made
                        for celebrations
                    </div>
                </footer>
            </div>
        </>
    );
}
