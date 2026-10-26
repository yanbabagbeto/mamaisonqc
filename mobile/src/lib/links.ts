import * as WebBrowser from "expo-web-browser";

/**
 * Opens a web URL in the in-app browser sheet. Used for legal pages and data sources.
 * Failures are swallowed on purpose: opening a browser is a secondary action, never a blocker.
 */
export async function openExternal(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    // The user can still find the page from the website; no crash from a failed sheet.
  }
}

/** Absolute URL for a path on the MaMaisonQC web app (legal pages, sources). */
export function webUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
