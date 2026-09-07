import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getApiBaseUrl(): Promise<string> {
    try {
        const { env } = await getCloudflareContext({ async: true });
        if (env.API_BASE_URL) return env.API_BASE_URL;
    } catch {
        // next dev can run without Worker bindings in some middleware paths
    }

    const fromEnv = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!fromEnv) throw new Error("API_BASE_URL is not configured");
    return fromEnv;
}
