import Link from "next/link";

interface SparkHeaderProps {
    logoText: string;
    navItems: Array<{ label: string; href: string }>;
    announcementText?: string;
}

// Trimmed port of Fype-E-Commerce-UI's sections/Header.tsx (read-only design
// reference) — kept as a Server Component for now: the reference's
// multi-announcement rotation/marquee needs client state, but this bundled
// default config only ever has one announcement message, so there's nothing
// to animate yet. Revisit once real per-store config can define multiple.
export default function Header({ logoText, navItems, announcementText }: SparkHeaderProps) {
    return (
        <div className="w-full flex flex-col font-sans">
            {announcementText && (
                <div className="bg-[#111111] text-white text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase flex items-center justify-center h-9 px-4 text-center">
                    {announcementText}
                </div>
            )}

            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="font-black tracking-tighter text-2xl hover:opacity-80 transition-opacity">
                        {logoText}
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide uppercase">
                        {navItems.map((item) => (
                            <Link key={item.label} href={item.href} className="opacity-80 hover:opacity-100 transition-opacity">
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-5">
                        <Link href="/products" className="hover:opacity-70 transition-opacity">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </Link>
                        <Link href="/accounts" className="hover:opacity-70 transition-opacity">
                            <span className="material-symbols-outlined text-xl">person</span>
                        </Link>
                        <Link href="/cart" className="hover:opacity-70 transition-opacity">
                            <span className="material-symbols-outlined text-xl">shopping_bag</span>
                        </Link>
                    </div>
                </div>
            </header>
        </div>
    );
}
