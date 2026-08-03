// API Configuration and Base URL Management for Personal Node Backend

export interface BackendStatus {
  isOnline: boolean;
  message: string;
  latencyMs?: number;
}

const DEFAULT_BASE_URL = "https://p-ecommerce-dusky.vercel.app/api";

export function getApiBaseUrl(): string {
  const stored = localStorage.getItem("mern_api_base_url");
  return stored !== null ? stored : DEFAULT_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  let cleaned = url.trim();
  if (cleaned.endsWith("/")) {
    cleaned = cleaned.slice(0, -1);
  }
  localStorage.setItem("mern_api_base_url", cleaned);
}

export function resetApiBaseUrl(): void {
  localStorage.setItem("mern_api_base_url", DEFAULT_BASE_URL);
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Avoid duplicate /api/api if baseUrl already ends with /api
  if (baseUrl.toLowerCase().endsWith("/api")) {
    if (cleanEndpoint.toLowerCase().startsWith("/api/")) {
      cleanEndpoint = cleanEndpoint.substring(4);
    } else if (cleanEndpoint.toLowerCase() === "/api") {
      cleanEndpoint = "";
    }
  }

  return `${baseUrl}${cleanEndpoint}`;
}

export async function testBackendConnection(customUrl?: string): Promise<BackendStatus> {
  const targetBase = customUrl ? customUrl.replace(/\/$/, "") : getApiBaseUrl();
  const startTime = Date.now();

  // Try checking health or products endpoint
  let testUrl = `${targetBase}/health`;
  if (targetBase.toLowerCase().endsWith("/api")) {
    // Also support checking products if health isn't implemented
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let response = await fetch(testUrl, { signal: controller.signal }).catch(() => null);

    if (!response || !response.ok) {
      // Fallback try /products
      const altUrl = `${targetBase}/products`;
      response = await fetch(altUrl, { signal: controller.signal }).catch(() => null);
    }

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (response && (response.ok || response.status < 500)) {
      return {
        isOnline: true,
        message: `Backend active at ${targetBase}`,
        latencyMs,
      };
    } else {
      return {
        isOnline: false,
        message: `Connected but returned HTTP ${response?.status || "error"}`,
        latencyMs,
      };
    }
  } catch (err: any) {
    return {
      isOnline: false,
      message: err?.name === "AbortError" ? "Connection timed out (4s)" : "Unable to reach personal backend. Check CORS & port 5000.",
    };
  }
}
