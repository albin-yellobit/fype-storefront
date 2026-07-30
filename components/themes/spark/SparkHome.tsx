"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import ImageBanner from "./sections/ImageBanner";
import { mergeSparkConfig, type SparkConfig, type SparkConfigOverride } from "./sparkConfig";

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

export type SparkSectionKey = "header" | "image_banner";

interface SparkHomeProps {
    initialConfig: SparkConfig;
    navItems: Array<{ label: string; href: string }>;
}

function SectionOutline({ label, active }: { label: string; active: boolean }) {
    if (!active) return null;
    return (
        <div className="absolute inset-0 z-30 pointer-events-none ring-2 ring-inset ring-blue-500">
            <span className="absolute -top-px left-0 bg-blue-500 text-white text-[11px] font-medium px-2 py-0.5">{label}</span>
        </div>
    );
}

// Client Component so it can hold live-editing state and listen for
// postMessage draft updates. Only listens at all when embedded in an iframe
// AND the page was loaded with ?editorPreview=1 — normal customer traffic
// (not in an iframe, no query param) never registers the listener, so a
// stray postMessage from an unrelated parent page can't do anything.
export default function SparkHome({ initialConfig, navItems }: SparkHomeProps) {
    const [liveConfig, setLiveConfig] = useState(initialConfig);
    const [activeSection, setActiveSection] = useState<SparkSectionKey | null>(null);
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

    const { header, image_banner: imageBanner, announcement_bar: announcementBar } = liveConfig.sections;
    const navigation = navItems.length > 0 ? navItems : header.settings.navigation.map((label) => ({ label, href: "/products" }));

    const selectSection = (section: SparkSectionKey) => {
        setActiveSection(section);
        window.parent.postMessage({ type: SPARK_SECTION_CLICKED, section }, "*");
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

    return (
        <div className="bg-white text-black">
            <div {...sectionProps("header")}>
                <SectionOutline label="Header" active={activeSection === "header"} />
                <Header
                    logoText={header.settings.logo_text}
                    navItems={navigation}
                    announcementText={announcementBar.settings.show ? announcementBar.settings.text : undefined}
                />
            </div>
            <div {...sectionProps("image_banner")}>
                <SectionOutline label="Image Banner" active={activeSection === "image_banner"} />
                <ImageBanner
                    imageUrl={imageBanner.settings.image_url}
                    subheading={imageBanner.settings.subheading}
                    heading={imageBanner.settings.heading}
                    buttonLabel={imageBanner.settings.button_label}
                    buttonLink={imageBanner.settings.button_link}
                />
            </div>
        </div>
    );
}
