import { themeRegistry, isKnownThemeSlug, type ThemeSlug, type ThemeModule } from "@/components/themes/registry";

const DEFAULT_THEME: ThemeSlug = "theme_one";

export function resolveThemeSlug(themeId: string | null | undefined): ThemeSlug {
    if (themeId && isKnownThemeSlug(themeId)) return themeId;
    return DEFAULT_THEME;
}

export async function loadTheme(themeId: string | null | undefined): Promise<ThemeModule> {
    const slug = resolveThemeSlug(themeId);
    return themeRegistry[slug]();
}
