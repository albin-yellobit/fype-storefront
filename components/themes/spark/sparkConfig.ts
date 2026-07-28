// Spark's own config schema — genuinely different shape from theme_one's
// ThemeCustomization/ThemeSections (see MIGRATION_RUNBOOK.md Phase 4 decision
// #2: "each theme owns an arbitrary, theme-specific config schema"). Ported
// from Fype-E-Commerce-UI/src/themes/spark/spark.config.json (read-only
// design reference, not part of this codebase) — that file documents the
// intended Shopify-style "sections + presets.order" model; this is the same
// shape as a real TypeScript type, plus a bundled default instance used as
// this theme's placeholder/preview content until per-store persistence of a
// merchant's own edited config exists (deferred — see runbook).

export interface SparkAnnouncementBarSettings {
    text: string;
    show: boolean;
}

export interface SparkHeaderSettings {
    logo_text: string;
    navigation: string[];
}

export interface SparkImageBannerSettings {
    image_url: string;
    subheading: string;
    heading: string;
    button_label: string;
    button_link: string;
}

export interface SparkSectionsConfig {
    announcement_bar: { type: "announcement_bar"; settings: SparkAnnouncementBarSettings };
    header: { type: "header"; settings: SparkHeaderSettings };
    image_banner: { type: "image_banner"; settings: SparkImageBannerSettings };
    // Other section types (rich_text, featured_collection, featured_product,
    // multicolumn, collection_list, slideshow, collapsible_content,
    // contact_form, email_signup, footer) exist in the design reference but
    // aren't ported yet — deliberately deferred, see runbook. Home only
    // renders the sections above for now.
}

export interface SparkConfig {
    name: string;
    version: string;
    theme_id: string;
    settings: {
        colors: {
            primary: string;
            secondary: string;
            accent: string;
            text: string;
            text_muted: string;
            border: string;
        };
        typography: {
            heading_font: string;
            body_font: string;
            accent_font: string;
        };
    };
    sections: SparkSectionsConfig;
}

// Shape of a merchant's saved/draft overrides (Theme.themeConfig on the
// backend, or a customization editor's unsaved draft) — every field optional
// since it's only ever merged onto sparkDefaultConfig, never used standalone.
export interface SparkConfigOverride {
    settings?: {
        colors?: Partial<SparkConfig["settings"]["colors"]>;
        typography?: Partial<SparkConfig["settings"]["typography"]>;
    };
    sections?: {
        announcement_bar?: { settings?: Partial<SparkAnnouncementBarSettings> };
        header?: { settings?: Partial<SparkHeaderSettings> };
        image_banner?: { settings?: Partial<SparkImageBannerSettings> };
    };
}

// One-level-deep merge (per section/settings key), mirroring how the backend
// (crmApp's theme.controller.ts updateTheme) merges partial saves — so a
// draft that only edits the hero banner never drops header/announcement
// overrides, and vice versa.
export function mergeSparkConfig(base: SparkConfig, override?: SparkConfigOverride | Record<string, unknown> | null): SparkConfig {
    if (!override) return base;
    const o = override as SparkConfigOverride;
    return {
        ...base,
        settings: {
            colors: { ...base.settings.colors, ...(o.settings?.colors ?? {}) },
            typography: { ...base.settings.typography, ...(o.settings?.typography ?? {}) },
        },
        sections: {
            announcement_bar: {
                type: "announcement_bar",
                settings: { ...base.sections.announcement_bar.settings, ...(o.sections?.announcement_bar?.settings ?? {}) },
            },
            header: {
                type: "header",
                settings: { ...base.sections.header.settings, ...(o.sections?.header?.settings ?? {}) },
            },
            image_banner: {
                type: "image_banner",
                settings: { ...base.sections.image_banner.settings, ...(o.sections?.image_banner?.settings ?? {}) },
            },
        },
    };
}

export const sparkDefaultConfig: SparkConfig = {
    name: "Spark",
    version: "1.0.0",
    theme_id: "spark-core-theme",
    settings: {
        colors: {
            primary: "#000000",
            secondary: "#ffffff",
            accent: "#f5f5f5",
            text: "#111827",
            text_muted: "#6b7280",
            border: "#e5e7eb",
        },
        typography: {
            heading_font: "Outfit, sans-serif",
            body_font: "Outfit, sans-serif",
            accent_font: "Playfair Display, serif",
        },
    },
    sections: {
        announcement_bar: {
            type: "announcement_bar",
            settings: { text: "Free shipping on orders over $150", show: true },
        },
        header: {
            type: "header",
            settings: { logo_text: "SPARK", navigation: ["Shop", "Collections", "About", "Blog"] },
        },
        image_banner: {
            type: "image_banner",
            settings: {
                image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
                subheading: "The New Standard",
                heading: "Ignite your style",
                button_label: "Discover More",
                button_link: "/products",
            },
        },
    },
};
