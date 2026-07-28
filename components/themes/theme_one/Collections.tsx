import Link from "next/link";

export interface CollectionItem {
    id: string;
    name: string;
    imageUrl?: string;
}

interface CollectionsProps {
    collections: CollectionItem[];
}

export default function Collections({ collections }: CollectionsProps) {
    return (
        <section className="py-10 sm:py-14">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6 sm:mb-10">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Categories</h2>
                    <Link
                        className="text-primary font-bold hover:underline cursor-pointer text-sm sm:text-base"
                        href="/products"
                    >
                        View all
                    </Link>
                </div>

                <div
                    className={`grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 sm:grid-cols-3 ${
                        collections.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"
                    }`}
                >
                    {collections.map((collection) => (
                        <Link
                            key={collection.id}
                            href={`/products?category=${collection.id}`}
                            className="group cursor-pointer flex flex-col items-center gap-2"
                        >
                            <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                                <div className="relative w-full aspect-[3/4]">
                                    {collection.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={collection.imageUrl}
                                            alt={collection.name}
                                            loading="lazy"
                                            className="
                        absolute inset-0 w-full h-full
                        object-cover object-top
                        transition-transform duration-500 ease-out
                        group-hover:scale-105
                      "
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                            <span className="material-symbols-outlined text-4xl text-gray-400">
                                                category
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                    <p
                                        className="
                    absolute bottom-0 left-0 right-0
                    px-2 py-2 sm:px-3 sm:py-3
                    text-white text-xs sm:text-sm md:text-base
                    font-semibold text-center leading-tight
                    drop-shadow-sm
                  "
                                    >
                                        {collection.name}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
