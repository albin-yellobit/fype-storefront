import type { ThemeTemplate } from "@/types/storefront";

// Catalog-browse theme preview (Phase 4) — fetches a ThemeTemplate for
// rendering with dummy content, never real store data. The backend's
// GET /theme-templates/:templateId already filters `isActive: true` and
// 404s otherwise, so a failed fetch here just means "not a valid preview
// target" — callers fall back to normal rendering, no error state needed.
export async function getThemeTemplate(apiBaseUrl: string, templateId: string): Promise<ThemeTemplate | null> {
    try {
        const res = await fetch(`${apiBaseUrl}/commerce/theme-templates/${encodeURIComponent(templateId)}`, {
            headers: { "Content-Type": "application/json" },
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;

        const json = (await res.json()) as { data: { template: ThemeTemplate } };
        return json.data.template;
    } catch {
        return null;
    }
}
