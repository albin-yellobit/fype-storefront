import Link from "next/link";
import type { FooterCustomization, NavbarCustomization, Page } from "@/types/storefront";

interface FooterProps {
    footer?: FooterCustomization;
    navbar?: NavbarCustomization;
    footerText?: string;
    shopName?: string;
    footerPages: Page[];
}

const socialIconMap = {
    instagram: "/logos/instagram.png",
    facebook: "/logos/facebook.png",
    twitter: "/logos/twitter.png",
    linkedin: "/logos/linkedin.png",
} as const;

function getSocialLinks(footer?: FooterCustomization) {
    const socialLinks = footer?.socialLinks;
    const links: { name: string; icon: string; url: string }[] = [];

    if (socialLinks?.instagram) links.push({ name: "Instagram", icon: socialIconMap.instagram, url: socialLinks.instagram });
    if (socialLinks?.facebook) links.push({ name: "Facebook", icon: socialIconMap.facebook, url: socialLinks.facebook });
    if (socialLinks?.twitter) links.push({ name: "Twitter", icon: socialIconMap.twitter, url: socialLinks.twitter });
    if (socialLinks?.linkedin) links.push({ name: "LinkedIn", icon: socialIconMap.linkedin, url: socialLinks.linkedin });

    return links;
}

export default function Footer({ footer, navbar, footerText, shopName, footerPages }: FooterProps) {
    const brandName = footer?.title || shopName || "Our Shop";
    const description = footer?.description || footerText || "Follow us on social media";
    const socialLinks = getSocialLinks(footer);

    const genericPages = footerPages.filter((page) => page.pageType === "generic");
    const termsPolicyPages = footerPages.filter((page) => page.pageType === "terms-policy");

    const defaultGenericPages: Pick<Page, "_id" | "title" | "slug" | "pageType">[] = [
        { _id: "home", title: "Home", slug: "", pageType: "generic" },
        { _id: "shop", title: "Shop", slug: "products", pageType: "generic" },
    ];

    const allGenericPages = [...defaultGenericPages, ...genericPages];

    const renderFooterBrand = () => {
        const displayType = footer?.displayType || "title";
        const logoUrl = footer?.logoUrl || navbar?.logoUrl;

        if (displayType === "logo" && logoUrl) {
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={brandName} className="h-10 max-w-[200px] object-contain mx-auto md:mx-0" />
            );
        }

        if (displayType === "logo-title" && logoUrl) {
            return (
                <div className="flex flex-col gap-2 items-center md:items-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt={brandName} className="h-8 max-w-[150px] object-contain" />
                    <h2 className="text-xl font-extrabold tracking-tight">{brandName}</h2>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
                </svg>
                <h2 className="text-xl font-extrabold tracking-tight">{brandName}</h2>
            </div>
        );
    };

    return (
        <footer className="bg-black text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className={`grid gap-12 ${termsPolicyPages.length > 0 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                    <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
                        {renderFooterBrand()}
                        <p className="text-white/60">{description}</p>

                        {socialLinks.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-2">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={social.icon}
                                            alt={social.name}
                                            className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
                                        />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="font-bold text-lg mb-4">Discover More</h3>
                        <ul className="space-y-2">
                            {allGenericPages.map((page) => (
                                <li key={page._id}>
                                    <Link className="text-white/60 hover:text-white transition-colors" href={`/${page.slug}`}>
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {termsPolicyPages.length > 0 && (
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-lg mb-4">Policies & Terms</h3>
                            <ul className="space-y-2">
                                {termsPolicyPages.map((page) => (
                                    <li key={page._id}>
                                        <Link
                                            className="text-white/60 hover:text-white transition-colors"
                                            href={`/${page.slug}`}
                                        >
                                            {page.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60 text-sm">
                    <p>
                        © {new Date().getFullYear()} {brandName} powered by Fype. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
