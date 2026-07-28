import BottomNav from "./BottomNav";
import "./tokens.css";

interface LayoutProps {
    shopName?: string;
    storeId?: string;
    children: React.ReactNode;
}

// Equivalent of the SPA's RootLayout: BottomNav is global chrome (mobile-only,
// via CSS), while Header/Footer are rendered per-page since each page needs a
// different Header variant (default vs products) — see HomePage/ProductsPage.
export default function Layout({ shopName, storeId, children }: LayoutProps) {
    return (
        <div className="App">
            {children}
            <BottomNav shopName={shopName} storeId={storeId} />
        </div>
    );
}
