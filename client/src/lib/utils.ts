import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Builds a Nevermined Checkout URL for a given agent id.
 * @param {string} agentId - The Nevermined agent identifier used by checkout.
 * @param {{ returnApiKey?: boolean, returnUrl?: string }} options - Checkout options.
 * @returns {string} The absolute checkout URL to redirect the user.
 */
export function buildNeverminedCheckoutUrl(
  agentId: string,
  options: { returnApiKey?: boolean; returnUrl?: string } = {}
): string {
  const base = `https://nevermined.dev/checkout/${encodeURIComponent(agentId)}`;
  const params = new URLSearchParams();
  if (options.returnApiKey) params.set("return_api_key", "1");
  const returnUrl = options.returnUrl || getDefaultReturnUrl();
  if (returnUrl) params.set("return_url", returnUrl);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Returns a sensible default return URL (origin + pathname) without query or hash.
 * @returns {string}
 */
export function getDefaultReturnUrl(): string {
  try {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}`;
  } catch {
    return "";
  }
}

/**
 * Extracts an API Key from the current URL query parameters and optionally cleans it.
 * Accepts multiple common parameter names: `api_key`, `nvmApiKey`.
 * @param {boolean} cleanUrl - Whether to remove the api_key parameter from the URL bar.
 * @returns {string | null} The extracted API Key or null if not present.
 */
export function extractApiKeyFromUrl(cleanUrl: boolean = true): string | null {
  try {
    const url = new URL(window.location.href);
    const apiKey =
      url.searchParams.get("api_key") ||
      url.searchParams.get("nvmApiKey") ||
      url.searchParams.get("nvm_api_key");
    if (apiKey && cleanUrl) {
      url.searchParams.delete("api_key");
      url.searchParams.delete("nvmApiKey");
      url.searchParams.delete("nvm_api_key");
      const newUrl = `${url.origin}${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }
    return apiKey;
  } catch {
    return null;
  }
}

/**
 * Builds a local link to this same page that encodes checkout intent in query params.
 * The app can detect these params and redirect to Nevermined checkout.
 * @param {string} agentId - The agent identifier.
 * @param {{ returnApiKey?: boolean }} options - Whether to request API key on return.
 * @returns {string} The local URL pointing to this page with checkout params.
 */
export function buildLocalCheckoutLink(
  agentId: string,
  options: { returnApiKey?: boolean } = {}
): string {
  try {
    const { origin, pathname } = window.location;
    const url = new URL(`${origin}${pathname}`);
    url.searchParams.set("nvm_checkout", "1");
    if (agentId) url.searchParams.set("agent_id", agentId);
    if (options.returnApiKey) url.searchParams.set("return_api_key", "1");
    return url.toString();
  } catch {
    return "";
  }
}
