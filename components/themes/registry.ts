// Dumb lookup table: themeSlug -> dynamic import of the theme's whole module.
// Keep it dumb — see storefront-multi-theme-architecture.md §4 on why this
// stays a plain object instead of growing into a plugin system.
export type ThemeSlug = "theme_one";

export type ThemeModule = typeof import("./theme_one");

export const themeRegistry: Record<ThemeSlug, () => Promise<ThemeModule>> = {
    theme_one: () => import("./theme_one"),
};

export function isKnownThemeSlug(slug: string): slug is ThemeSlug {
    return slug in themeRegistry;
}
