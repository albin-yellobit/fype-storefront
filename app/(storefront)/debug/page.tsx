import { headers } from "next/headers";

export default async function DebugPage() {
    const headersList = await headers();
    const shopId = headersList.get("x-shop-id") ?? "unresolved";
    const themeId = headersList.get("x-theme-id") ?? "unresolved";
    const storeDomain = headersList.get("x-store-domain") ?? "unresolved";

    return (
        <div style={{ padding: 24, fontFamily: "monospace" }}>
            <h1>Tenant debug</h1>
            <p>resolved shopId: {shopId}</p>
            <p>resolved themeId: {themeId}</p>
            <p>resolved storeDomain: {storeDomain}</p>
            <hr />
            <p>See / for the real registry-driven theme render (Home page).</p>
        </div>
    );
}
