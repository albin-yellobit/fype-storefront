import "./spark.css";
import SparkCartShell from "./SparkCartShell";

interface LayoutProps {
    shopName?: string;
    storeId?: string;
    children: React.ReactNode;
}

// Cart drawer + header count badge live here so every Spark page shares
// the same add-to-cart behavior as Fype-E-Commerce-UI SparkTheme.
export default function Layout({ storeId, children }: LayoutProps) {
    return (
        <div className="spark-theme-root">
            <SparkCartShell storeId={storeId}>{children}</SparkCartShell>
        </div>
    );
}
