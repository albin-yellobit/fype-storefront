import "./DynamicPage.css";

interface DynamicPageProps {
    title: string;
    content: string;
}

export default function DynamicPage({ title, content }: DynamicPageProps) {
    return (
        <div className="dynamic-page bg-white">
            <main className="page-main">
                <div className="page-container">
                    <article className="page-content">
                        <header className="page-header">
                            <h1 className="page-title">{title}</h1>
                        </header>

                        {content ? (
                            <div className="page-body" dangerouslySetInnerHTML={{ __html: content }} />
                        ) : (
                            <p className="text-gray-500 italic">This page doesn&apos;t have content yet.</p>
                        )}
                    </article>
                </div>
            </main>
        </div>
    );
}
