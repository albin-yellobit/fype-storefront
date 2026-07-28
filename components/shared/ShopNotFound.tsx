// Theme-agnostic on purpose: if we don't have a shop, we don't have a themeId
// to resolve a themed error page with, so this can't live under components/themes/.
export default function ShopNotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background-light px-6 text-center">
            <span className="material-symbols-outlined text-6xl text-black/30">storefront</span>
            <h1 className="text-2xl font-bold text-black">Store not found</h1>
            <p className="text-black/60 max-w-sm">
                We couldn&apos;t find a store for this domain. Double-check the URL, or contact the store owner if you
                think this is a mistake.
            </p>
        </div>
    );
}
