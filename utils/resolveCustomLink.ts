const UNSAFE_LINK_SCHEME = /^(javascript|data|vbscript|file):/i;

export type ResolvedCustomLink = { href: string; external: boolean } | null;

// Resolves the product custom-link setting into either an internal page path
// (same-tab nav) or a validated external URL (new-tab nav) — never both, and
// never a raw string, since a scheme-less value like "custom.com" would
// otherwise resolve as a *relative* href off the current page instead of an
// external site.
export function resolveCustomLink(
    customLinkPageId: string | undefined,
    customLinkUrl: string | undefined,
    pagesToSearch: { _id: string; slug?: string }[]
): ResolvedCustomLink {
    if (customLinkPageId) {
        const slug = pagesToSearch.find((p) => p._id === customLinkPageId)?.slug;
        return slug ? { href: `/${slug}`, external: false } : null;
    }

    const raw = customLinkUrl?.trim();
    if (!raw || UNSAFE_LINK_SCHEME.test(raw)) return null;

    const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw);
    const candidate = hasScheme ? raw : raw.startsWith("//") ? `https:${raw}` : `https://${raw}`;

    try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
        return { href: parsed.toString(), external: true };
    } catch {
        return null;
    }
}
