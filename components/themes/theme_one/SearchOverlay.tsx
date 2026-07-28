"use client";

// Phase 1 placeholder — the SPA's SearchOverlay does live search-as-you-type
// against the product API plus a localStorage recent-searches list. Rebuilding
// that (without pulling in the Redux-coupled services/api.ts) is Phase 2 scope
// alongside cart/auth. This keeps Header/BottomNav's search trigger functional.

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-white" onClick={onClose}>
            <div className="p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-black/40">search</span>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search products..."
                        className="flex-1 bg-transparent border-b border-black/10 py-2 outline-none text-lg"
                        disabled
                    />
                    <button className="p-2 rounded-full hover:bg-black/5" onClick={onClose} aria-label="Close">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <p className="text-black/40 text-sm mt-4">Search is coming soon.</p>
            </div>
        </div>
    );
}
