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
    // Set by the editor's Rich Text font dropdown — not a THEME_SCHEMA
    // property, applied as inline font-family when rendering.
    font?: string;
}

export interface SparkAnnouncementBarBlock {
    id: string;
    // Merchant-toggled per-block visibility (the sidebar's eye icon in
    // SparkCustomizeTheme.tsx) — persisted, not just an editor-preview
    // convenience, so a hidden block is skipped for real customers too.
    hidden?: boolean;
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

// "Image Banner" is now a carousel (THEME_SCHEMA renamed its block to
// "Banner Slide", capped at 10, replacing the old fixed Image/Heading/
// Text/Button-block shape) — see Fype-E-Commerce-UI commit c9cb197
// "feat(theme): replace ImageBanner with BannerSlider". Section-level
// Content Alignment moved down into each slide.
export interface SparkBannerSlideBlockSettings {
    image_url: string;
    image_fit: "Cover" | "Contain" | "Stretch" | "Original Size";
    overlay_color: string;
    overlay_opacity: number;
    object_position_x: number;
    object_position_y: number;
    // Real, editable property — but BannerSlider (both here and in the
    // reference) never reads it. Autoplay is a hardcoded 5s interval
    // regardless of this value. Kept editable for schema parity, not wired
    // to the timer, matching the reference exactly.
    appear_after: number;
    content_horizontal_alignment: "Left" | "Center" | "Right";
    content_vertical_alignment: "Top" | "Center" | "Bottom";
    heading_text: string;
    heading_size: "Small" | "Medium" | "Large";
    heading_color: string;
    text: string;
    text_style: "Body" | "Subtitle";
    text_color: string;
    button_label: string;
    button_link: string;
    button_style: "Outline" | "Filled";
    button_color: string;
    // Only meaningful when button_style is "Filled" (Outline uses
    // button_color for both border and text).
    button_text_color: string;
}

export interface SparkBannerSlideBlock {
    id: string;
    hidden?: boolean;
    settings: SparkBannerSlideBlockSettings;
}

export interface SparkImageBannerSettings {
    banner_height: "Small" | "Medium" | "Large";
    background_color: string;
    padding_top: number;
    padding_bottom: number;
}

// Rich Text has 3 block types (Heading limit 1, Text limit 2, Button limit
// 1) coexisting in one ordered, freely-interleavable list — matching the
// reference's own model exactly (a single `blocks` array holding any block
// type; per-type limits are enforced by the editor's "Add block" UI, not
// this shape). Unlike Header's vestigial `font` field, Font here is a real,
// rendering-affecting property (see sections/RichText.tsx).
export interface SparkRichTextSettings {
    background_color: string;
    padding_top: number;
    padding_bottom: number;
}

export interface SparkRichTextHeadingBlockSettings {
    text: string;
    size: "Small" | "Medium" | "Large";
    color: string;
    font: "Outfit" | "Playfair Display";
}

export interface SparkRichTextTextBlockSettings {
    text: string;
    style: "Body" | "Subtitle";
    color: string;
    font: "Outfit" | "Playfair Display";
}

export interface SparkRichTextButtonBlockSettings {
    label: string;
    link: string;
    style: "Outline" | "Filled";
    button_color: string;
}

export type SparkRichTextBlock =
    | { id: string; type: "Heading"; hidden?: boolean; settings: SparkRichTextHeadingBlockSettings }
    | { id: string; type: "Text"; hidden?: boolean; settings: SparkRichTextTextBlockSettings }
    | { id: string; type: "Button"; hidden?: boolean; settings: SparkRichTextButtonBlockSettings };

// Unlike every other section so far, this one has no addable blocks (matches
// the reference's THEME_SCHEMA — "No addable blocks" on every property) and
// its content isn't stored in themeConfig at all: `collection_id` is a
// pointer to a real Collection doc, resolved to real products at render time
// via a new backend endpoint (CollectionController.fetchCollectionStorefrontProducts)
// rather than the reference's 8 hardcoded mock products.
export interface SparkFeaturedCollectionSettings {
    section_heading: string;
    collection_id: string;
    products_to_show: number;
    goto_label: string;
    goto_link: string;
    background_color: string;
    padding_top: number;
    padding_bottom: number;
}

// Same "no addable blocks" shape as Featured Collection, and the same
// real-vs-reference divergence: `product_id` points at a real Product doc,
// resolved to real product data at render time via the storefront's
// existing product-detail endpoint (already used by the PDP) rather than
// the reference's 5 hardcoded mock products keyed off a slug string.
export interface SparkFeaturedProductSettings {
    section_heading: string;
    product_id: string;
    show_description: boolean;
    show_price: boolean;
    show_add_to_cart: boolean;
    image_position: "Left" | "Right";
    background_color: string;
    padding_top: number;
    padding_bottom: number;
}

// Column blocks are a single homogeneous type capped at 4 (matches the
// reference's "Add up to 4 columns" note on every property) — same shape as
// Banner Slide, not Rich Text's mixed-type list. `font` is vestigial, same
// precedent as SparkAnnouncementBarBlockSettings.font: THEME_SCHEMA marks
// Heading/Text "Rich Text Editor", which the reference's generic property
// panel renders with a font dropdown, but Multicolumn.tsx (both here and in
// the reference) never applies it when rendering — kept only so the shared
// rich-text editor widget has somewhere to write it.
export interface SparkColumnBlockSettings {
    image_url: string;
    heading: string;
    text: string;
    link: string;
    font?: string;
}

export interface SparkColumnBlock {
    id: string;
    hidden?: boolean;
    settings: SparkColumnBlockSettings;
}

export interface SparkMulticolumnSettings {
    section_heading: string;
    columns_on_desktop: number;
    column_alignment: "Left" | "Center";
    background_color: string;
    padding_top: number;
    padding_bottom: number;
}

// Image with Text is the second mixed-type block list (after Rich Text) —
// Image (limit 1), Heading (limit 1), Text (limit 2), Button (limit 2)
// freely coexist in one ordered array, matching the reference's THEME_SCHEMA
// exactly. Unlike Rich Text, the Image block is never part of the visual
// text-column flow — it's always independently positioned by its own
// `image_position` (see sections/ImageWithText.tsx) — but it lives in the
// same `blocks` array for the editor's sidebar/reorder/type-picker to stay
// one consistent mechanism across both sections. `font` on Heading/Text is
// vestigial (see SparkColumnBlockSettings' comment) — the reference's own
// ImageWithText.tsx never applies it either. Object Position X/Y are real
// (image `object-position`), but the reference's drag-to-adjust canvas
// interaction isn't ported — plain sliders, same simplification already
// made for Banner Slide's identical properties.
export interface SparkImageWithTextSettings {
    background_color: string;
    padding_top: number;
    padding_bottom: number;
    content_horizontal_alignment: "Left" | "Center" | "Right";
    content_vertical_alignment: "Top" | "Center" | "Bottom";
}

export interface SparkImageWithTextImageBlockSettings {
    image_url: string;
    image_position: "Left" | "Right";
    image_size: "Small" | "Medium" | "Large";
    overlay_color: string;
    overlay_opacity: number;
    object_position_x: number;
    object_position_y: number;
}

export interface SparkImageWithTextHeadingBlockSettings {
    text: string;
    size: "Small" | "Medium" | "Large";
    color: string;
    font?: string;
}

export interface SparkImageWithTextTextBlockSettings {
    text: string;
    style: "Body" | "Subtitle";
    color: string;
    font?: string;
}

export interface SparkImageWithTextButtonBlockSettings {
    label: string;
    link: string;
    style: "Outline" | "Filled";
    button_color: string;
}

export type SparkImageWithTextBlock =
    | { id: string; type: "Image"; hidden?: boolean; settings: SparkImageWithTextImageBlockSettings }
    | { id: string; type: "Heading"; hidden?: boolean; settings: SparkImageWithTextHeadingBlockSettings }
    | { id: string; type: "Text"; hidden?: boolean; settings: SparkImageWithTextTextBlockSettings }
    | { id: string; type: "Button"; hidden?: boolean; settings: SparkImageWithTextButtonBlockSettings };

// No addable blocks (matches the reference's THEME_SCHEMA — "blocks": {}).
// `collection_ids` points at real Collection docs (checkbox multi-select in
// the editor, reusing the same collections redux slice as Featured
// Collection's dropdown) rather than the reference's array of plain name
// strings matched against a static image lookup table
// (Fype-E-Commerce-UI/src/themes/spark/sections/CollectionList.tsx's
// `collectionImages` record). `columns_on_desktop` is real (rendering-
// affecting — see CollectionList.tsx's own `sectionSettings['Columns on
// Desktop']` read) but genuinely absent from THEME_SCHEMA's declared
// properties, so the reference's own settings panel never lets a merchant
// edit it either — permanently fixed at its default (3) there. Matched
// exactly: kept here since it's still real, but the editor
// (sparkThemeSchema.ts's SPARK_COLLECTION_LIST_PROPERTIES) deliberately
// doesn't expose a control for it.
export interface SparkCollectionListSettings {
    section_heading: string;
    collection_ids: string[];
    columns_on_desktop: number;
    goto_label: string;
    goto_link: string;
    background_color: string;
    padding_top: number;
    padding_bottom: number;
}

// Slide is a single homogeneous block type capped at 8 (matches the
// reference's THEME_SCHEMA "limit": 8) — same shape as Banner Slide, just a
// second, independently-configurable carousel section. "Sleek" style
// renders as a contained rounded card (aspect-ratio box); "Full Width" is a
// full-bleed fixed-height hero, matching Slideshow.tsx's own `isSleek`
// branching exactly.
export interface SparkSlideshowSettings {
    style: "Full Width" | "Sleek";
    color: string;
    padding_top: number;
    padding_bottom: number;
}

export interface SparkSlideBlockSettings {
    image_url: string;
    overlay_color: string;
    overlay_opacity: number;
    text: string;
    heading: string;
    button_text: string;
    button_style: "Outline" | "Filled";
    button_color: string;
    button_text_color: string;
    button_link: string;
}

export interface SparkSlideBlock {
    id: string;
    hidden?: boolean;
    settings: SparkSlideBlockSettings;
}

// Item is a single homogeneous block type capped at 12 (matches the
// reference's THEME_SCHEMA "limit": 12) — an FAQ-style accordion, no
// addable-block-type picker needed (same shape as Column/Slide/Banner
// Slide).
export interface SparkCollapsibleContentSettings {
    section_heading: string;
    background_color: string;
    block_color: string;
    text_color: string;
    padding_top: number;
    padding_bottom: number;
}

export interface SparkCollapsibleItemBlockSettings {
    title: string;
    content: string;
    open_by_default: boolean;
}

export interface SparkCollapsibleItemBlock {
    id: string;
    hidden?: boolean;
    settings: SparkCollapsibleItemBlockSettings;
}

// No addable blocks (matches the reference's THEME_SCHEMA — "blocks": {}).
// The reference's own submit handler is entirely decorative (a local
// setTimeout-based fake "submitted" state, no request anywhere) — matched
// exactly rather than building a real submission pipeline (new backend
// model/endpoint, likely email-notify wiring), which is genuinely separate
// scope from porting this section. `fields` mirrors the reference's "Field
// Checkboxes" property with a fixed option set (Name/Email/Phone
// Number/Subject/Location/Message) — unlike Collection List's Checkboxes,
// these options are static, not resolved from real store data.
export interface SparkContactFormSettings {
    heading: string;
    subtext: string;
    fields: string[];
    submit_button_label: string;
    success_message: string;
    background_color: string;
    padding_top: number;
    padding_bottom: number;
}

export interface SparkSectionsConfig {
    announcement_bar: { type: "announcement_bar"; settings: SparkAnnouncementBarSettings };
    // Section-level `hidden` (the sidebar's eye icon on the Header/Image
    // Banner row itself, not a block within it) — same persisted-visibility
    // model as the block-level `hidden` above.
    header: { type: "header"; hidden?: boolean; settings: SparkHeaderSettings };
    image_banner: { type: "image_banner"; hidden?: boolean; settings: SparkImageBannerSettings; banner_slides: SparkBannerSlideBlock[] };
    rich_text: { type: "rich_text"; hidden?: boolean; settings: SparkRichTextSettings; blocks: SparkRichTextBlock[] };
    featured_collection: { type: "featured_collection"; hidden?: boolean; settings: SparkFeaturedCollectionSettings };
    featured_product: { type: "featured_product"; hidden?: boolean; settings: SparkFeaturedProductSettings };
    multicolumn: { type: "multicolumn"; hidden?: boolean; settings: SparkMulticolumnSettings; blocks: SparkColumnBlock[] };
    image_with_text: { type: "image_with_text"; hidden?: boolean; settings: SparkImageWithTextSettings; blocks: SparkImageWithTextBlock[] };
    collection_list: { type: "collection_list"; hidden?: boolean; settings: SparkCollectionListSettings };
    slideshow: { type: "slideshow"; hidden?: boolean; settings: SparkSlideshowSettings; blocks: SparkSlideBlock[] };
    collapsible_content: { type: "collapsible_content"; hidden?: boolean; settings: SparkCollapsibleContentSettings; blocks: SparkCollapsibleItemBlock[] };
    contact_form: { type: "contact_form"; hidden?: boolean; settings: SparkContactFormSettings };
    // Other section types (email_signup, footer) exist in the design
    // reference but aren't ported yet — deliberately deferred, see runbook.
    // Home only renders the sections above for now.
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
        header?: { hidden?: boolean; settings?: Partial<SparkHeaderSettings> };
        image_banner?: { hidden?: boolean; settings?: Partial<SparkImageBannerSettings>; banner_slides?: SparkBannerSlideBlock[] };
        rich_text?: { hidden?: boolean; settings?: Partial<SparkRichTextSettings>; blocks?: SparkRichTextBlock[] };
        featured_collection?: { hidden?: boolean; settings?: Partial<SparkFeaturedCollectionSettings> };
        featured_product?: { hidden?: boolean; settings?: Partial<SparkFeaturedProductSettings> };
        multicolumn?: { hidden?: boolean; settings?: Partial<SparkMulticolumnSettings>; blocks?: SparkColumnBlock[] };
        image_with_text?: { hidden?: boolean; settings?: Partial<SparkImageWithTextSettings>; blocks?: SparkImageWithTextBlock[] };
        collection_list?: { hidden?: boolean; settings?: Partial<SparkCollectionListSettings> };
        slideshow?: { hidden?: boolean; settings?: Partial<SparkSlideshowSettings>; blocks?: SparkSlideBlock[] };
        collapsible_content?: { hidden?: boolean; settings?: Partial<SparkCollapsibleContentSettings>; blocks?: SparkCollapsibleItemBlock[] };
        contact_form?: { hidden?: boolean; settings?: Partial<SparkContactFormSettings> };
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
                hidden: o.sections?.header?.hidden ?? base.sections.header.hidden,
                settings: { ...base.sections.header.settings, ...(o.sections?.header?.settings ?? {}) },
            },
            image_banner: {
                type: "image_banner",
                hidden: o.sections?.image_banner?.hidden ?? base.sections.image_banner.hidden,
                settings: { ...base.sections.image_banner.settings, ...(o.sections?.image_banner?.settings ?? {}) },
                banner_slides: o.sections?.image_banner?.banner_slides ?? base.sections.image_banner.banner_slides,
            },
            rich_text: {
                type: "rich_text",
                hidden: o.sections?.rich_text?.hidden ?? base.sections.rich_text.hidden,
                settings: { ...base.sections.rich_text.settings, ...(o.sections?.rich_text?.settings ?? {}) },
                blocks: o.sections?.rich_text?.blocks ?? base.sections.rich_text.blocks,
            },
            featured_collection: {
                type: "featured_collection",
                hidden: o.sections?.featured_collection?.hidden ?? base.sections.featured_collection.hidden,
                settings: { ...base.sections.featured_collection.settings, ...(o.sections?.featured_collection?.settings ?? {}) },
            },
            featured_product: {
                type: "featured_product",
                hidden: o.sections?.featured_product?.hidden ?? base.sections.featured_product.hidden,
                settings: { ...base.sections.featured_product.settings, ...(o.sections?.featured_product?.settings ?? {}) },
            },
            multicolumn: {
                type: "multicolumn",
                hidden: o.sections?.multicolumn?.hidden ?? base.sections.multicolumn.hidden,
                settings: { ...base.sections.multicolumn.settings, ...(o.sections?.multicolumn?.settings ?? {}) },
                blocks: o.sections?.multicolumn?.blocks ?? base.sections.multicolumn.blocks,
            },
            image_with_text: {
                type: "image_with_text",
                hidden: o.sections?.image_with_text?.hidden ?? base.sections.image_with_text.hidden,
                settings: { ...base.sections.image_with_text.settings, ...(o.sections?.image_with_text?.settings ?? {}) },
                blocks: o.sections?.image_with_text?.blocks ?? base.sections.image_with_text.blocks,
            },
            collection_list: {
                type: "collection_list",
                hidden: o.sections?.collection_list?.hidden ?? base.sections.collection_list.hidden,
                settings: { ...base.sections.collection_list.settings, ...(o.sections?.collection_list?.settings ?? {}) },
            },
            slideshow: {
                type: "slideshow",
                hidden: o.sections?.slideshow?.hidden ?? base.sections.slideshow.hidden,
                settings: { ...base.sections.slideshow.settings, ...(o.sections?.slideshow?.settings ?? {}) },
                blocks: o.sections?.slideshow?.blocks ?? base.sections.slideshow.blocks,
            },
            collapsible_content: {
                type: "collapsible_content",
                hidden: o.sections?.collapsible_content?.hidden ?? base.sections.collapsible_content.hidden,
                settings: { ...base.sections.collapsible_content.settings, ...(o.sections?.collapsible_content?.settings ?? {}) },
                blocks: o.sections?.collapsible_content?.blocks ?? base.sections.collapsible_content.blocks,
            },
            contact_form: {
                type: "contact_form",
                hidden: o.sections?.contact_form?.hidden ?? base.sections.contact_form.hidden,
                settings: { ...base.sections.contact_form.settings, ...(o.sections?.contact_form?.settings ?? {}) },
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
                banner_height: "Large",
                background_color: "#f9fafb",
                padding_top: 0,
                padding_bottom: 0,
            },
            banner_slides: [
                {
                    id: "banner_slide_1",
                    settings: {
                        image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
                        image_fit: "Cover",
                        overlay_color: "#000000",
                        overlay_opacity: 40,
                        object_position_x: 50,
                        object_position_y: 50,
                        appear_after: 5,
                        content_horizontal_alignment: "Center",
                        content_vertical_alignment: "Center",
                        heading_text: "Ignite your style",
                        heading_size: "Large",
                        heading_color: "#ffffff",
                        text: "The New Standard",
                        text_style: "Subtitle",
                        text_color: "#ffffff",
                        button_label: "Discover More",
                        button_link: "/products",
                        button_style: "Outline",
                        button_color: "#ffffff",
                        button_text_color: "#000000",
                    },
                },
                {
                    id: "banner_slide_2",
                    settings: {
                        image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
                        image_fit: "Cover",
                        overlay_color: "#000000",
                        overlay_opacity: 40,
                        object_position_x: 50,
                        object_position_y: 50,
                        appear_after: 5,
                        content_horizontal_alignment: "Center",
                        content_vertical_alignment: "Center",
                        heading_text: "Winter Collection",
                        heading_size: "Large",
                        heading_color: "#ffffff",
                        text: "Stay warm and stylish",
                        text_style: "Subtitle",
                        text_color: "#ffffff",
                        button_label: "Shop Winter",
                        button_link: "/products",
                        button_style: "Filled",
                        button_color: "#ffffff",
                        button_text_color: "#000000",
                    },
                },
            ],
        },
        rich_text: {
            type: "rich_text",
            settings: {
                background_color: "#ffffff",
                padding_top: 128,
                padding_bottom: 128,
            },
            blocks: [
                {
                    id: "rich_text_heading_1",
                    type: "Heading",
                    settings: {
                        text: 'We believe in creating products that <span class="font-medium">last</span>. Crafted with the finest <span class="italic text-gray-500" style="font-family: \'Playfair Display\', serif;">sustainable materials</span>.',
                        size: "Large",
                        color: "#111827",
                        font: "Outfit",
                    },
                },
                {
                    id: "rich_text_text_1",
                    type: "Text",
                    settings: {
                        text: "Experience the perfect balance of form and function",
                        style: "Body",
                        color: "#9ca3af",
                        font: "Outfit",
                    },
                },
                {
                    id: "rich_text_button_1",
                    type: "Button",
                    settings: {
                        label: "Read our story",
                        link: "",
                        style: "Outline",
                        button_color: "#000000",
                    },
                },
            ],
        },
        featured_collection: {
            type: "featured_collection",
            // Empty collection_id until a merchant picks a real one in the
            // editor — FeaturedCollection.tsx renders nothing (not a mock
            // grid) when unset, unlike the reference's always-populated mock.
            settings: {
                section_heading: "New Arrivals",
                collection_id: "",
                products_to_show: 4,
                goto_label: "View all",
                goto_link: "/products",
                background_color: "#ffffff",
                padding_top: 128,
                padding_bottom: 128,
            },
        },
        featured_product: {
            type: "featured_product",
            // Empty product_id until a merchant picks a real one — matches
            // Featured Collection's empty-default convention.
            settings: {
                section_heading: "",
                product_id: "",
                show_description: true,
                show_price: true,
                show_add_to_cart: true,
                image_position: "Left",
                background_color: "#f9fafb",
                padding_top: 128,
                padding_bottom: 128,
            },
        },
        // Pure static content (like Rich Text/Image Banner, not data-driven
        // like Featured Collection/Product), so — matching those sections'
        // own precedent — ships pre-filled with real default content rather
        // than starting empty. Icons/copy match the reference's own default
        // 3 columns exactly.
        multicolumn: {
            type: "multicolumn",
            settings: {
                section_heading: "Why choose us",
                columns_on_desktop: 3,
                column_alignment: "Center",
                background_color: "#ffffff",
                padding_top: 128,
                padding_bottom: 128,
            },
            blocks: [
                {
                    id: "column_1",
                    settings: {
                        image_url:
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3"/><path d="M14 18h-4"/><path d="M14 12V4a2 2 0 0 1 2-2h3l4 6v8h-3"/><path d="M19 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg>',
                        heading: "Free Shipping",
                        text: "On all orders over $150. Fast, reliable delivery straight to your door.",
                        link: "",
                    },
                },
                {
                    id: "column_2",
                    settings: {
                        image_url:
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
                        heading: "Sustainable",
                        text: "We offset 100% of carbon emissions from shipping and packaging.",
                        link: "",
                    },
                },
                {
                    id: "column_3",
                    settings: {
                        image_url:
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.76 0 4.96.88 7 2a1 1 0 0 1 1 1v7Z"/><path d="m9 12 2 2 4-4"/></svg>',
                        heading: "Lifetime Guarantee",
                        text: "Our products are built to last a lifetime. We stand behind our quality.",
                        link: "",
                    },
                },
            ],
        },
        // Pure static content, same precedent as Multicolumn — ships
        // pre-filled with the reference's own default Image/Heading/Text
        // (no default Button — the reference's own default has none either).
        image_with_text: {
            type: "image_with_text",
            settings: {
                background_color: "#ffffff",
                padding_top: 80,
                padding_bottom: 80,
                content_horizontal_alignment: "Left",
                content_vertical_alignment: "Center",
            },
            blocks: [
                {
                    id: "iwt_image",
                    type: "Image",
                    settings: {
                        image_url: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                        image_position: "Left",
                        image_size: "Medium",
                        overlay_color: "#000000",
                        overlay_opacity: 0,
                        object_position_x: 50,
                        object_position_y: 50,
                    },
                },
                {
                    id: "iwt_heading",
                    type: "Heading",
                    settings: {
                        text: '<span class="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4 block">Sustainability</span>Conscious Creation.',
                        size: "Large",
                        color: "",
                        font: "Outfit",
                    },
                },
                {
                    id: "iwt_text",
                    type: "Text",
                    settings: {
                        text: "Every material we use is traced back to its origin. We offset 100% of our carbon emissions and partner exclusively with factories that guarantee living wages and safe conditions for their workers.",
                        style: "Body",
                        color: "",
                        font: "Outfit",
                    },
                },
            ],
        },
        // Empty collection_ids until a merchant picks real ones — matches
        // Featured Collection/Product's empty-default convention (data-driven
        // section, not pure static content like Multicolumn/Image with Text).
        collection_list: {
            type: "collection_list",
            settings: {
                section_heading: "Shop by Category",
                collection_ids: [],
                columns_on_desktop: 3,
                goto_label: "",
                goto_link: "",
                background_color: "#ffffff",
                padding_top: 128,
                padding_bottom: 128,
            },
        },
        // Pure static content, same precedent as Multicolumn/Image with
        // Text — ships pre-filled with the reference's own default 3 slides.
        slideshow: {
            type: "slideshow",
            settings: {
                style: "Full Width",
                color: "#ffffff",
                padding_top: 0,
                padding_bottom: 0,
            },
            blocks: [
                {
                    id: "slide_1",
                    settings: {
                        image_url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
                        overlay_color: "#000000",
                        overlay_opacity: 40,
                        text: "New Collection",
                        heading: "The Wash Series",
                        button_text: "Explore Now",
                        button_style: "Outline",
                        button_color: "#ffffff",
                        button_text_color: "#000000",
                        button_link: "#",
                    },
                },
                {
                    id: "slide_2",
                    settings: {
                        image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
                        overlay_color: "#000000",
                        overlay_opacity: 40,
                        text: "Essentials",
                        heading: "Everyday Comfort",
                        button_text: "Shop Essentials",
                        button_style: "Outline",
                        button_color: "#ffffff",
                        button_text_color: "#000000",
                        button_link: "#",
                    },
                },
                {
                    id: "slide_3",
                    settings: {
                        image_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
                        overlay_color: "#000000",
                        overlay_opacity: 40,
                        text: "Accessories",
                        heading: "The Finishing Touch",
                        button_text: "Shop Accessories",
                        button_style: "Outline",
                        button_color: "#ffffff",
                        button_text_color: "#000000",
                        button_link: "#",
                    },
                },
            ],
        },
        // Pure static content — ships pre-filled with the reference's own
        // default 4 FAQ items.
        collapsible_content: {
            type: "collapsible_content",
            settings: {
                section_heading: "Frequently Asked Questions",
                background_color: "transparent",
                block_color: "#ffffff",
                text_color: "#000000",
                padding_top: 128,
                padding_bottom: 128,
            },
            blocks: [
                {
                    id: "faq_1",
                    settings: {
                        title: "What is your return policy?",
                        content:
                            "We accept returns within 30 days of delivery. Items must be in their original condition and packaging. Please note that return shipping costs are the responsibility of the customer.",
                        open_by_default: false,
                    },
                },
                {
                    id: "faq_2",
                    settings: {
                        title: "How long does shipping take?",
                        content: "Standard shipping usually takes 3-5 business days within the contiguous US. Expedited options are available at checkout.",
                        open_by_default: false,
                    },
                },
                {
                    id: "faq_3",
                    settings: {
                        title: "Do you ship internationally?",
                        content: "Yes, we offer worldwide shipping. International shipping rates and times vary by location and are calculated at checkout.",
                        open_by_default: false,
                    },
                },
                {
                    id: "faq_4",
                    settings: {
                        title: "Are your products ethically made?",
                        content: "Absolutely. We work directly with skilled artisans and responsible manufacturing partners who ensure fair wages and safe working conditions.",
                        open_by_default: false,
                    },
                },
            ],
        },
        // Fully decorative, matching the reference exactly (its own submit
        // handler never sends anything anywhere either) — see
        // SparkContactFormSettings' comment.
        contact_form: {
            type: "contact_form",
            settings: {
                heading: "Get in touch",
                subtext: "Have a question? We'd love to hear from you.",
                fields: ["Name", "Email", "Message"],
                submit_button_label: "Send Message",
                success_message: "Thanks for contacting us. We'll get back to you as soon as possible.",
                background_color: "#f9fafb",
                padding_top: 128,
                padding_bottom: 128,
            },
        },
    },
};
