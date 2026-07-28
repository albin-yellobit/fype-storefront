interface CommunityProps {
    instagramImages?: string[];
    brandHashtag?: string;
    brandName?: string;
}

const defaultImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmmfASOxcsM1dymzBBub0F8q1C-wRHKH5u7XeFvyaD94Ki7ztZupNPloSXS_IAv5_7fY_1XpqQYg0o7V5QMc7KakF3houWDHgdTwnuJK0WxIeuN_rjxWaTNyjlBnLhDcaYh8O0iFPkC82jIDKbHfm-tfpB0cxYVioIl0Wo2443js3F5deMtphwnCkS3-cHLszf1dR7IdmXyR0zPmV7QJJQ54OHTv-LzFReQBK6hfktMgR27PJQgAQIO4Xf4YB4241Zn-Jd6mlBA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBfSrp_94A7CMdAoTm71I_hDp4kT0xm3Gc0VNHPngiUvF3uq3RhgoZF2Ewk5zKRcejKtecNInQtTg0G7cPNilmtaI_1Y-f6QGbb0o5rN-dL8066fxVh86EzoGOTzTLTeE4Hy1UrhunB_NhOA7Ay794LMshXWqC2AjylIlKmcQj__MsLRn58HrS6G_Rlq-iMETYmbV-5UjCnX0PktfupAPH2UOGnMdjy7ImDUzUrXbzr110GinMuxRkjcTIoi6KzpcXmbU4FwawddA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC61j0UFm9-C4woC0Srgpcsb6ET6pxfmWZ-Ux55tP9xfR9MyJt4jSe1G-kB94Wy8TLhVJRiRcmtW6RwLdZbvrYaLAqOqmjAFmTnNdXWF_7K8fxax21dx0imPelbSG-O8W1_eNZhI4HmO4MoOzdXG9ll7hX-ntdcwT0TS9cssMmI0yIvz_2XKpUfKtDk7doXe3p-XLI7t0V9FIIDo4hxxwpa4iRaiFWXKXPc2VhBEPooJOZyEjvYUoiItRouXZ6Lltg7S7FwMzMK-Q",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC7rEAZTA7VlrCSHdBj5DwI_DKpAbNVcMpNIX7qjp__hpvmZChOrEP_ooG_cmnyOPwuW0rWbFf_oxlc8-R6JNmx-zyIRNoj4Wxv3XU90bKb-c5oQ2W44_XZ2t65O2jaqpWYu04Obrkiy_HIHUAvUQK52RNf7MCGRz-Q6bbG0GdXpqOk_SiOfGzwVKEz2HGUcIxcvEAjZ8HftncPZ-t6tI80Z-M1GbXUY1cCtabGRCTl-_9Q9K9nnXU1tqJk1ups-4KDePfZLYmOVA",
];

export default function Community({
    instagramImages = defaultImages,
    brandHashtag = "#whimbrim",
    brandName = "WHIM BRIM",
}: CommunityProps) {
    return (
        <section className="py-16 sm:py-24 text-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">
                    Join the {brandName} Community
                </h2>
                <p className="text-lg mt-2 text-primary font-bold">{brandHashtag}</p>

                <div className="mt-8 flex justify-center">
                    <button className="bg-primary/10 text-primary font-bold py-3 px-6 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2">
                        <svg
                            fill="currentColor"
                            height="20px"
                            viewBox="0 0 256 256"
                            width="20px"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
                        </svg>
                        <span>Follow us on Instagram</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                    {instagramImages.map((image, index) => (
                        <div
                            key={index}
                            className="aspect-square bg-cover bg-center rounded-lg"
                            style={{ backgroundImage: `url("${image}")` }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
