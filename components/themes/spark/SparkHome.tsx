"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import BannerSlider from "./sections/BannerSlider";
import RichText from "./sections/RichText";
import FeaturedCollection from "./sections/FeaturedCollection";
import FeaturedProduct from "./sections/FeaturedProduct";
import Multicolumn from "./sections/Multicolumn";
import ImageWithText from "./sections/ImageWithText";
import CollectionList from "./sections/CollectionList";
import Slideshow from "./sections/Slideshow";
import CollapsibleContent from "./sections/CollapsibleContent";
import ContactForm from "./sections/ContactForm";
import { mergeSparkConfig, type SparkConfig, type SparkConfigOverride } from "./sparkConfig";
import type { CollectionSummary, ProductDetail, ProductVariant, ShopIdentity, StorefrontProduct } from "@/types/storefront";

// Message protocol between ecommerce_app's customization editor (parent
// frame) and this page (embedded in an iframe). See MIGRATION_RUNBOOK.md
// Phase 4.5's customization-editor section for the full design.
export const SPARK_DRAFT_UPDATE = "SPARK_DRAFT_CONFIG_UPDATE";
export const SPARK_DRAFT_READY = "SPARK_DRAFT_READY";
// Sent by the editor when the merchant selects a section in its section
// list — mirrors Fype-E-Commerce-UI's ThemeCustomizePage.tsx (read-only
// design reference), which outlines the selected section directly on the
// canvas with a blue border + label tag rather than leaving the canvas
// unannotated. "header" covers both the announcement bar and header
// settings (the editor's section list bundles them into one "Header" item,
// matching the reference).
export const SPARK_SET_ACTIVE_SECTION = "SPARK_SET_ACTIVE_SECTION";
// Sent by this page back to the editor when the merchant clicks a section
// directly in the canvas (not just via the editor's own section list) —
// keeps both selection UIs in sync, matching the reference's click-anywhere
// selection model.
export const SPARK_SECTION_CLICKED = "SPARK_SECTION_CLICKED";
// Block-level counterparts of the two messages above — lets the merchant
// click a specific block (an announcement, a text block, a button) directly
// in the canvas, not just the section it lives in, matching the reference's
// per-block click selection (ring highlight + right-panel scoped to that
// block alone).
export const SPARK_SET_ACTIVE_BLOCK = "SPARK_SET_ACTIVE_BLOCK";
export const SPARK_BLOCK_CLICKED = "SPARK_BLOCK_CLICKED";

export type SparkSectionKey =
    | "header"
    | "image_banner"
    | "rich_text"
    | "featured_collection"
    | "featured_product"
    | "multicolumn"
    | "image_with_text"
    | "collection_list"
    | "slideshow"
    | "collapsible_content"
    | "contact_form";

export type SparkActiveBlock =
    | { section: "header"; kind: "announcement"; id: string }
    | { section: "image_banner"; kind: "banner_slide"; id: string }
    | { section: "rich_text"; kind: "heading" | "text" | "button"; id: string }
    | { section: "multicolumn"; kind: "column"; id: string }
    | { section: "image_with_text"; kind: "image" | "heading" | "text" | "button"; id: string }
    | { section: "slideshow"; kind: "slide"; id: string }
    | { section: "collapsible_content"; kind: "item"; id: string };

interface SparkHomeProps {
    initialConfig: SparkConfig;
    navItems: Array<{ label: string; href: string }>;
    // Only needed by Featured Collection (real product data, unlike every
    // other section here which is pure config) — storeId for its client
    // refetch/add-to-cart calls.
    shop: ShopIdentity;
    initialFeaturedCollectionProducts?: StorefrontProduct[];
    initialFeaturedProduct?: (ProductDetail & { variants?: ProductVariant[] }) | null;
    initialCollectionListCollections?: CollectionSummary[];
}

function SectionOutline({ label, active }: { label: string; active: boolean }) {
    if (!active) return null;
    return (
        // z-100: above every in-section element (Header's own bar is z-40,
        // its announcement bar z-50, its mobile drawer z-60/z-70) — an
        // editor selection outline must always paint on top of real content.
        <div className="absolute inset-0 z-100 pointer-events-none ring-2 ring-inset ring-blue-500">
            <span className="absolute -top-px left-0 bg-blue-500 text-white text-[11px] font-medium px-2 py-0.5">{label}</span>
        </div>
    );
}

// Client Component so it can hold live-editing state and listen for
// postMessage draft updates. Only listens at all when embedded in an iframe
// AND the page was loaded with ?editorPreview=1 — normal customer traffic
// (not in an iframe, no query param) never registers the listener, so a
// stray postMessage from an unrelated parent page can't do anything.
export default function SparkHome({
    initialConfig,
    navItems,
    shop,
    initialFeaturedCollectionProducts = [],
    initialFeaturedProduct = null,
    initialCollectionListCollections = [],
}: SparkHomeProps) {
    const [liveConfig, setLiveConfig] = useState(initialConfig);
    const [activeSection, setActiveSection] = useState<SparkSectionKey | null>(null);
    const [activeBlock, setActiveBlock] = useState<SparkActiveBlock | null>(null);
    // Set once on mount (client-only, see effect below) — used to gate both
    // the postMessage listener AND click-to-select-in-canvas, and to stop
    // real nav-link navigation from firing when a merchant is just trying to
    // select the Header section while editing.
    const [isEditorPreview, setIsEditorPreview] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || window.parent === window) return;
        if (new URLSearchParams(window.location.search).get("editorPreview") !== "1") return;
        // Genuinely tied to a client-only check (parent frame + query
        // param) that can't be known at initial render — not derivable from
        // props/state the way most effect-body setState calls are.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsEditorPreview(true);

        function handleMessage(event: MessageEvent) {
            if (event.source !== window.parent) return;
            if (!event.data) return;
            if (event.data.type === SPARK_DRAFT_UPDATE) {
                setLiveConfig((current) => mergeSparkConfig(current, event.data.config as SparkConfigOverride));
            } else if (event.data.type === SPARK_SET_ACTIVE_SECTION) {
                setActiveSection((event.data.section as SparkSectionKey | null) ?? null);
            } else if (event.data.type === SPARK_SET_ACTIVE_BLOCK) {
                setActiveBlock((event.data.block as SparkActiveBlock | null) ?? null);
            }
        }

        window.addEventListener("message", handleMessage);
        // Handshake: tell the parent we're mounted and ready to receive the
        // current draft (avoids a race where the parent posts before we're
        // listening), and hand it our real merged starting config so its
        // property panel can prefill fields with actual values instead of
        // blanks — the parent has no other way to know the resolved
        // (defaults + saved themeConfig) starting point.
        window.parent.postMessage({ type: SPARK_DRAFT_READY, config: initialConfig }, "*");
        return () => window.removeEventListener("message", handleMessage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {
        header,
        image_banner: imageBanner,
        announcement_bar: announcementBar,
        rich_text: richText,
        featured_collection: featuredCollection,
        featured_product: featuredProduct,
        multicolumn,
        image_with_text: imageWithText,
        collection_list: collectionList,
        slideshow,
        collapsible_content: collapsibleContent,
        contact_form: contactForm,
    } = liveConfig.sections;
    const navigation = navItems.length > 0 ? navItems : header.settings.navigation.map((label) => ({ label, href: "/products" }));

    const selectSection = (section: SparkSectionKey) => {
        setActiveSection(section);
        window.parent.postMessage({ type: SPARK_SECTION_CLICKED, section }, "*");
    };

    const selectBlock = (block: SparkActiveBlock) => {
        setActiveBlock(block);
        window.parent.postMessage({ type: SPARK_BLOCK_CLICKED, block }, "*");
    };

    // Selecting a section in the editor must never actually follow the
    // real nav/search/account/cart links inside Header — preventDefault in
    // the capture phase runs before those <Link>s' own click handlers,
    // which (like every Next.js Link) skip navigation when the event
    // arrives already defaultPrevented.
    const sectionProps = (section: SparkSectionKey) =>
        isEditorPreview
            ? {
                  className: "relative cursor-pointer",
                  onClickCapture: (e: React.MouseEvent) => {
                      e.preventDefault();
                      selectSection(section);
                  },
              }
            : { className: "relative" };

    // Merchant-toggled visibility (SparkCustomizeTheme.tsx's sidebar eye
    // icon) — persisted on the section/block itself, so hidden here means
    // hidden for real customers too, not just an editor-preview convenience.
    const visibleAnnouncementBlocks = announcementBar.settings.show
        ? announcementBar.settings.blocks.filter((b) => !b.hidden)
        : [];
    const visibleBannerSlides = imageBanner.banner_slides.filter((s) => !s.hidden);
    const visibleRichTextBlocks = richText.blocks.filter((b) => !b.hidden);
    const visibleColumns = multicolumn.blocks.filter((b) => !b.hidden);
    const visibleImageWithTextBlocks = imageWithText.blocks.filter((b) => !b.hidden);
    const visibleSlides = slideshow.blocks.filter((s) => !s.hidden);
    const visibleFaqItems = collapsibleContent.blocks.filter((b) => !b.hidden);

    return (
        <div className="bg-white text-black">
            {!header.hidden && (
                <div {...sectionProps("header")}>
                    <SectionOutline label="Header" active={activeSection === "header"} />
                    <Header
                        header={header.settings}
                        navItems={navigation}
                        announcementBlocks={visibleAnnouncementBlocks}
                        isEditorPreview={isEditorPreview}
                        activeAnnouncementId={activeBlock?.section === "header" ? activeBlock.id : null}
                        onAnnouncementClick={(id) => selectBlock({ section: "header", kind: "announcement", id })}
                    />
                </div>
            )}
            {!imageBanner.hidden && (
                <div {...sectionProps("image_banner")}>
                    <SectionOutline label="Image Banner" active={activeSection === "image_banner"} />
                    <BannerSlider
                        settings={imageBanner.settings}
                        slides={visibleBannerSlides}
                        isEditorPreview={isEditorPreview}
                        activeSlideId={activeBlock?.section === "image_banner" ? activeBlock.id : null}
                        onSlideClick={(id) => selectBlock({ section: "image_banner", kind: "banner_slide", id })}
                    />
                </div>
            )}
            {!richText.hidden && (
                <div {...sectionProps("rich_text")}>
                    <SectionOutline label="Rich Text" active={activeSection === "rich_text"} />
                    <RichText
                        settings={richText.settings}
                        blocks={visibleRichTextBlocks}
                        isEditorPreview={isEditorPreview}
                        activeBlockId={activeBlock?.section === "rich_text" ? activeBlock.id : null}
                        onBlockClick={(kind, id) => selectBlock({ section: "rich_text", kind, id })}
                    />
                </div>
            )}
            {!featuredCollection.hidden && (
                <div {...sectionProps("featured_collection")}>
                    <SectionOutline label="Featured Collection" active={activeSection === "featured_collection"} />
                    <FeaturedCollection
                        settings={featuredCollection.settings}
                        storeId={shop.shopId}
                        globalTax={shop.settings?.tax}
                        initialProducts={initialFeaturedCollectionProducts}
                        isEditorPreview={isEditorPreview}
                    />
                </div>
            )}
            {!featuredProduct.hidden && (
                <div {...sectionProps("featured_product")}>
                    <SectionOutline label="Featured Product" active={activeSection === "featured_product"} />
                    <FeaturedProduct
                        settings={featuredProduct.settings}
                        storeId={shop.shopId}
                        globalTax={shop.settings?.tax}
                        initialProduct={initialFeaturedProduct}
                        isEditorPreview={isEditorPreview}
                    />
                </div>
            )}
            {!multicolumn.hidden && (
                <div {...sectionProps("multicolumn")}>
                    <SectionOutline label="Multicolumn" active={activeSection === "multicolumn"} />
                    <Multicolumn
                        settings={multicolumn.settings}
                        blocks={visibleColumns}
                        isEditorPreview={isEditorPreview}
                        activeBlockId={activeBlock?.section === "multicolumn" ? activeBlock.id : null}
                        onBlockClick={(id) => selectBlock({ section: "multicolumn", kind: "column", id })}
                    />
                </div>
            )}
            {!imageWithText.hidden && (
                <div {...sectionProps("image_with_text")}>
                    <SectionOutline label="Image with Text" active={activeSection === "image_with_text"} />
                    <ImageWithText
                        settings={imageWithText.settings}
                        blocks={visibleImageWithTextBlocks}
                        isEditorPreview={isEditorPreview}
                        activeBlockId={activeBlock?.section === "image_with_text" ? activeBlock.id : null}
                        onBlockClick={(kind, id) => selectBlock({ section: "image_with_text", kind, id })}
                    />
                </div>
            )}
            {!collectionList.hidden && (
                <div {...sectionProps("collection_list")}>
                    <SectionOutline label="Collection List" active={activeSection === "collection_list"} />
                    <CollectionList
                        settings={collectionList.settings}
                        storeId={shop.shopId}
                        initialCollections={initialCollectionListCollections}
                        isEditorPreview={isEditorPreview}
                    />
                </div>
            )}
            {!slideshow.hidden && (
                <div {...sectionProps("slideshow")}>
                    <SectionOutline label="Slideshow" active={activeSection === "slideshow"} />
                    <Slideshow
                        settings={slideshow.settings}
                        slides={visibleSlides}
                        isEditorPreview={isEditorPreview}
                        activeSlideId={activeBlock?.section === "slideshow" ? activeBlock.id : null}
                        onSlideClick={(id) => selectBlock({ section: "slideshow", kind: "slide", id })}
                    />
                </div>
            )}
            {!collapsibleContent.hidden && (
                <div {...sectionProps("collapsible_content")}>
                    <SectionOutline label="Collapsible Content" active={activeSection === "collapsible_content"} />
                    <CollapsibleContent
                        settings={collapsibleContent.settings}
                        items={visibleFaqItems}
                        isEditorPreview={isEditorPreview}
                        activeBlockId={activeBlock?.section === "collapsible_content" ? activeBlock.id : null}
                        onBlockClick={(id) => selectBlock({ section: "collapsible_content", kind: "item", id })}
                    />
                </div>
            )}
            {!contactForm.hidden && (
                <div {...sectionProps("contact_form")}>
                    <SectionOutline label="Contact Form" active={activeSection === "contact_form"} />
                    <ContactForm settings={contactForm.settings} />
                </div>
            )}
        </div>
    );
}
