import "./spark.css";

interface LayoutProps {
    shopName?: string;
    storeId?: string;
    children: React.ReactNode;
}

// No BottomNav yet (theme_one's is a theme_one-specific mobile chrome
// component, not ported) — Spark doesn't have mobile bottom navigation in
// the design reference either, so this stays a plain wrapper for now.
export default function Layout({ children }: LayoutProps) {
    return <div className="spark-theme-root">{children}</div>;
}
