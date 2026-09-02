"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function safeReturnTo(value: string | null): string {
    if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
    if (value.startsWith("/storefront-password")) return "/";
    return value;
}

export default function StorefrontPasswordForm({ shopName }: { shopName?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch("/api/storefront-unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
            if (!res.ok || !json?.success) {
                setError(json?.message || "Incorrect password");
                return;
            }
            router.replace(safeReturnTo(searchParams.get("return_to")));
            router.refresh();
        } catch {
            setError("Could not unlock the store. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">Development mode</p>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">{shopName || "This store"} is password protected</h1>
            <p className="text-sm text-gray-500 mb-6">Enter the store password to continue.</p>
            <label htmlFor="storefront-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
            </label>
            <input
                id="storefront-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm mb-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                required
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <button
                type="submit"
                disabled={submitting || !password}
                className="w-full h-11 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
            >
                {submitting ? "Checking…" : "Enter store"}
            </button>
        </form>
    );
}
