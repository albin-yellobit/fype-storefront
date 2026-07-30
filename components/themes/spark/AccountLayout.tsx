import AccountSidebar from "./AccountSidebar";

interface AccountLayoutProps {
    title: string;
    storeId?: string;
    children: React.ReactNode;
}

// Overrides theme_one's AccountLayout in the registry (see registry.ts —
// this must match theme_one's exact prop signature to type-check as a
// ThemeModule override, unlike the self-contained *Page components which
// have their own dedicated types). The content components rendered inside
// (AccountOverview, ProfileView, AddressList, OrderList, OrderDetailLoader)
// still fall back to theme_one's — only WishlistView has a Spark version so
// far — so most account pages are a Spark shell around theme_one content,
// same "unbuilt parts render via theme_one" pattern as everywhere else.
export default function AccountLayout({ title, storeId, children }: AccountLayoutProps) {
    return (
        <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12 md:py-16 flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="w-full md:w-56 shrink-0">
                <div className="md:sticky md:top-24">
                    <AccountSidebar storeId={storeId} />
                </div>
            </div>

            <div className="flex-grow min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">{title}</h1>
                {children}
            </div>
        </main>
    );
}
