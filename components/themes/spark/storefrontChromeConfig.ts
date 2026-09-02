import { mergeSparkConfig, sparkDefaultConfig, type SparkConfig } from "./sparkConfig";

// Account/profile/dynamic routes still pass theme_one Header/Footer props.
// Rebuild a SparkConfig from those plus bundled defaults so leftover pages
// get Spark chrome instead of the old theme_one bar.
export function sparkConfigFromStorefrontChrome(shopName?: string, logoUrl?: string, themeConfig?: Record<string, unknown>): SparkConfig {
    const merged = mergeSparkConfig(sparkDefaultConfig, themeConfig);
    const resolvedLogo = logoUrl || merged.theme_settings.logo.logo_url;
    return mergeSparkConfig(merged, {
        sections: {
            header: {
                settings: {
                    logo_text: shopName || merged.sections.header.settings.logo_text,
                    ...(resolvedLogo && merged.sections.header.settings.logo_type === "Text Only" ? { logo_type: "Logo Image" as const } : {}),
                },
            },
        },
        theme_settings: {
            logo: {
                logo_url: resolvedLogo,
            },
        },
    });
}
