import type { CSSProperties } from "react";

const ShimmerBox = ({ className = "", style = {} }: { className?: string; style?: CSSProperties }) => (
    <div
        className={className}
        style={{
            background: "linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%)",
            backgroundSize: "1600px 100%",
            animation: "shimmer 1.4s infinite linear",
            borderRadius: "6px",
            ...style,
        }}
    />
);

export const HeroShimmer = () => <ShimmerBox style={{ width: "100%", height: "480px", borderRadius: "0px" }} />;

export const ProductGridShimmer = () => (
    <div className="py-12 px-4 max-w-7xl mx-auto">
        <ShimmerBox style={{ width: "180px", height: "28px", marginBottom: "32px" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                    <ShimmerBox style={{ width: "100%", paddingBottom: "120%", borderRadius: "8px" }} />
                    <ShimmerBox style={{ width: "75%", height: "14px" }} />
                    <ShimmerBox style={{ width: "45%", height: "14px" }} />
                </div>
            ))}
        </div>
    </div>
);

export const CollectionsShimmer = () => (
    <div className="py-12 px-4 max-w-7xl mx-auto">
        <ShimmerBox style={{ width: "200px", height: "28px", marginBottom: "32px" }} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <ShimmerBox key={i} style={{ width: "100%", height: "160px", borderRadius: "10px" }} />
            ))}
        </div>
    </div>
);
