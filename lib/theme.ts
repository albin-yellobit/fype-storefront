import { themeRegistry, isKnownThemeSlug, type ThemeSlug, type ResolvedThemeModule } from "@/components/themes/registry";

// theme_one is a testing/staging-only theme, never servable in production —
// Spark is the real, shippable theme. `resolveThemeSlug` enforces this
// regardless of what a store's saved themeId says, so a stray theme_one
// reference (e.g. a store that was never migrated off it) can't leak into
// production; it silently resolves to Spark instead.
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const DEFAULT_THEME: ThemeSlug = IS_PRODUCTION ? "spark" : "theme_one";

export function resolveThemeSlug(themeId: string | null | undefined): ThemeSlug {
    if (themeId && isKnownThemeSlug(themeId)) {
        if (IS_PRODUCTION && themeId === "theme_one") return "spark";
        return themeId;
    }
    return DEFAULT_THEME;
}

// Merges the requested theme's module onto theme_one as a baseline (see
// PartialThemeModule's docstring in registry.ts) — a theme that only
// implements e.g. Layout + HomePage still gets a working Header/Footer/
// ProductGrid/etc. for every route it hasn't built yet, rather than those
// routes crashing on an undefined component.
export async function loadTheme(themeId: string | null | undefined): Promise<ResolvedThemeModule> {
    const slug = resolveThemeSlug(themeId);
    if (slug === "theme_one") return themeRegistry.theme_one() as Promise<ResolvedThemeModule>;

    const [base, override] = await Promise.all([themeRegistry.theme_one(), themeRegistry[slug]()]);
    // Safe: `base` (theme_one) guarantees every ThemeModule field is present;
    // `override` only ever adds to or replaces those, never removes any.
    return { ...base, ...override } as ResolvedThemeModule;
}
