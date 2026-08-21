import ScrollToTop from "@/components/shared/ScrollToTop";
import "./globals.css";

export const metadata = {
    title: "Storefront",
    description: "Fype storefront",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full antialiased">
            <ScrollToTop />
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
