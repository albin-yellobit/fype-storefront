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

interface SparkHomeProps {
    initialConfig: SparkConfig;
    navItems: Array<{ label: string; href: string }>;
}

// Client Component so it can hold live-editing state and listen for
// postMessage draft updates. Only listens at all when embedded in an iframe
// AND the page was loaded with ?editorPreview=1 — normal customer traffic
// (not in an iframe, no query param) never registers the listener, so a
// stray postMessage from an unrelated parent page can't do anything.
export default function SparkHome({ initialConfig, navItems }: SparkHomeProps) {
    const [liveConfig, setLiveConfig] = useState(initialConfig);

    useEffect(() => {
        if (typeof window === "undefined" || window.parent === window) return;
        if (new URLSearchParams(window.location.search).get("editorPreview") !== "1") return;

        function handleMessage(event: MessageEvent) {
            if (event.source !== window.parent) return;
            if (!event.data || event.data.type !== SPARK_DRAFT_UPDATE) return;
            setLiveConfig((current) => mergeSparkConfig(current, event.data.config as SparkConfigOverride));
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

    return (
        <div className="bg-white text-black">
            <Header
                logoText={header.settings.logo_text}
                navItems={navigation}
                announcementText={announcementBar.settings.show ? announcementBar.settings.text : undefined}
            />
            <ImageBanner
                imageUrl={imageBanner.settings.image_url}
                subheading={imageBanner.settings.subheading}
                heading={imageBanner.settings.heading}
                buttonLabel={imageBanner.settings.button_label}
                buttonLink={imageBanner.settings.button_link}
            />
        </div>
    );
}
