import AccountSidebar from "./AccountSidebar";

interface AccountLayoutProps {
    title: string;
    storeId?: string;
    children: React.ReactNode;
}

export default function AccountLayout({ title, storeId, children }: AccountLayoutProps) {
    return (
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-[280px] shrink-0">
                <div className="md:sticky md:top-24">
                    <AccountSidebar storeId={storeId} />
                </div>
            </div>

            <div className="flex-grow">
                <h1 className="text-3xl font-bold mb-8 tracking-tight text-center md:text-left">{title}</h1>
                {children}
            </div>
        </main>
    );
}
