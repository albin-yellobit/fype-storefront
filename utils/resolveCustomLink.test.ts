import { describe, expect, it } from "vitest";
import { resolveCustomLink } from "./resolveCustomLink";

const pages = [{ _id: "p1", slug: "about-us" }];

describe("resolveCustomLink", () => {
    it("normalizes a bare domain (no scheme) to https:// instead of resolving as a relative path", () => {
        expect(resolveCustomLink(undefined, "custom.com", pages)).toEqual({
            href: "https://custom.com/",
            external: true,
        });
    });

    it("keeps an https:// URL as-is", () => {
        expect(resolveCustomLink(undefined, "https://custom.com", pages)).toEqual({
            href: "https://custom.com/",
            external: true,
        });
    });

    it("keeps an http:// URL as-is", () => {
        expect(resolveCustomLink(undefined, "http://custom.com", pages)).toEqual({
            href: "http://custom.com/",
            external: true,
        });
    });

    it("rejects a javascript: URI", () => {
        expect(resolveCustomLink(undefined, "javascript:alert(1)", pages)).toBeNull();
    });

    it("resolves an internal page selection to its slug, ignoring custom_link_url", () => {
        expect(resolveCustomLink("p1", "ignored-when-page-id-set", pages)).toEqual({
            href: "/about-us",
            external: false,
        });
    });

    it("returns null for an empty string", () => {
        expect(resolveCustomLink(undefined, "", pages)).toBeNull();
    });

    it("returns null for a whitespace-only string", () => {
        expect(resolveCustomLink(undefined, "   ", pages)).toBeNull();
    });

    it("returns null when custom_link_page_id points at a page that no longer exists", () => {
        expect(resolveCustomLink("missing-id", "https://fallback.com", pages)).toBeNull();
    });
});
