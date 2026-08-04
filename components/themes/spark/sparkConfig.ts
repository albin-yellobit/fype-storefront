// Spark's own config schema — genuinely different shape from theme_one's
// ThemeCustomization/ThemeSections (see MIGRATION_RUNBOOK.md Phase 4 decision
// #2: "each theme owns an arbitrary, theme-specific config schema"). Ported
// from Fype-E-Commerce-UI/src/themes/spark/spark.config.json (read-only
// design reference, not part of this codebase) — that file documents the
// intended Shopify-style "sections + presets.order" model; this is the same
// shape as a real TypeScript type, plus a bundled default instance used as
// this theme's placeholder/preview content until per-store persistence of a
// merchant's own edited config exists (deferred — see runbook).

export interface SparkAnnouncementBarBlockSettings {
    text: string;
    link: string;
    text_animation: "Scroll" | "Slide";
    speed: number;
    appear_after: number;
    background_color: string;
    text_color: string;
}

export interface SparkAnnouncementBarBlock {
    id: string;
    settings: SparkAnnouncementBarBlockSettings;
}

export interface SparkAnnouncementBarSettings {
    show: boolean;
    blocks: SparkAnnouncementBarBlock[];
}

export interface SparkHeaderSettings {
    logo_type: "Logo Image" | "Text Only" | "Text + Logo Image";
    logo_text: string;
    logo_image_url: string;
    logo_position: "Left" | "Center";
    menu_style: "Drawer" | "Tabs";
    navigation: string[];
    sticky_header: boolean;
    glass_effect: boolean;
    background_color: string;
    foreground_color: string;
}

export interface SparkImageBannerImageSettings {
    image_url: string;
    image_fit: "Cover" | "Contain" | "Stretch" | "Original Size";
    overlay_color: string;
    overlay_opacity: number;
    object_position_x: number;
    object_position_y: number;
}

export interface SparkImageBannerHeadingSettings {
    text: string;
    size: "Small" | "Medium" | "Large";
    color: string;
}

export interface SparkImageBannerTextBlockSettings {
    text: string;
    style: "Body" | "Subtitle";
    color: string;
}

export interface SparkImageBannerTextBlock {
    id: string;
    settings: SparkImageBannerTextBlockSettings;
}

export interface SparkImageBannerButtonBlockSettings {
    label: string;
    link: string;
    style: "Outline" | "Filled";
    button_color: string;
}

export interface SparkImageBannerButtonBlock {
    id: string;
    settings: SparkImageBannerButtonBlockSettings;
}

export interface SparkImageBannerSettings {
    content_horizontal_alignment: "Left" | "Center" | "Right";
    content_vertical_alignment: "Top" | "Center" | "Bottom";
    background_color: string;
    padding_top: number;
    padding_bottom: number;
    banner_height: "Small" | "Medium" | "Large";
    image: SparkImageBannerImageSettings;
    heading: SparkImageBannerHeadingSettings;
    // Both capped at 2, matching THEME_SCHEMA's block "limit" — enforced by
    // the editor's add-block UI, not re-validated here.
    text_blocks: SparkImageBannerTextBlock[];
    button_blocks: SparkImageBannerButtonBlock[];
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
// `blocks` arrays are replaced wholesale rather than merged element-by-element
// when present — the editor always sends the full resolved snapshot (see
// SparkCustomizeTheme.tsx's handleSave), so there's never a sparse partial
// blocks list to reconcile against the base.
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
            settings: {
                show: true,
                blocks: [
                    {
                        id: "announcement_1",
                        settings: {
                            text: "Free shipping on orders over $150",
                            link: "",
                            text_animation: "Slide",
                            speed: 20,
                            appear_after: 5,
                            background_color: "#111111",
                            text_color: "#ffffff",
                        },
                    },
                ],
            },
        },
        header: {
            type: "header",
            settings: {
                logo_type: "Text Only",
                logo_text: "SPARK",
                logo_image_url: "",
                logo_position: "Left",
                menu_style: "Tabs",
                navigation: ["Shop", "Collections", "About", "Blog"],
                sticky_header: true,
                glass_effect: true,
                background_color: "#ffffff",
                foreground_color: "#000000",
            },
        },
        image_banner: {
            type: "image_banner",
            settings: {
                content_horizontal_alignment: "Center",
                content_vertical_alignment: "Center",
                background_color: "#f9fafb",
                padding_top: 0,
                padding_bottom: 0,
                banner_height: "Large",
                image: {
                    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
                    image_fit: "Cover",
                    overlay_color: "#000000",
                    overlay_opacity: 40,
                    object_position_x: 50,
                    object_position_y: 50,
                },
                heading: {
                    text: "Ignite your style",
                    size: "Large",
                    color: "#ffffff",
                },
                text_blocks: [
                    {
                        id: "image_banner_text_1",
                        settings: { text: "The New Standard", style: "Subtitle", color: "#ffffff" },
                    },
                ],
                button_blocks: [
                    {
                        id: "image_banner_button_1",
                        settings: { label: "Discover More", link: "/products", style: "Outline", button_color: "#ffffff" },
                    },
                ],
            },
        },
    },
};
