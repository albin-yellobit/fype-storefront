export function isEditorPreview(): boolean {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("editorPreview") === "1";
}

export function isEmbedPreview(): boolean {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("embedPreview") === "1";
}
