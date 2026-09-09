import type { CSSProperties } from "react";
import type { SparkThemeSettings } from "./sparkConfig";

const measurement = (value: number, fallback: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Number.isFinite(value) ? value : fallback));

// Shared by live previews and saved pages, including catalog and product pages.
export function sparkLayoutStyle(layout: SparkThemeSettings["layout"]): CSSProperties {
    return {
        "--spark-page-width": `${measurement(layout.page_width, 1200, 1000, 1600)}px`,
        "--spark-section-spacing": `${measurement(layout.section_spacing, 40, 0, 100)}px`,
        // Preserve spacing in themes saved with the previous layout controls.
        "--spark-horizontal-spacing": `${measurement(layout.horizontal_spacing, 0, 0, 100)}px`,
        "--spark-vertical-spacing": `${measurement(layout.vertical_spacing, 0, 0, 100)}px`,
    } as CSSProperties;
}
