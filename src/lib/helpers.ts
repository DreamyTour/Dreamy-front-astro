import type { Lang } from "./i18n";

const strapiUrl = import.meta.env.VITE_STRAPI_URL?.replace(/\/$/, "") || "http://localhost:1337";

/**
 * Get image URL from Strapi image object
 */
export function getImageUrl(image: unknown, baseUrl?: string): string {
  if (!image) return "/og-default.jpg";
  
  const imgObj = Array.isArray(image) ? image[0] : image;
  if (!imgObj || typeof imgObj !== "object") return "/og-default.jpg";
  
  const url = (imgObj as { url?: string }).url;
  if (!url) return "/og-default.jpg";
  
  const resolvedBaseUrl = baseUrl || strapiUrl;
  return url.startsWith("http") ? url : `${resolvedBaseUrl}${url}`;
}

/**
 * Get thumbnail URL for videos
 */
export function getThumbnailUrl(thumbnail: unknown): string | null {
  if (!thumbnail) return null;
  
  const thumbObj = Array.isArray(thumbnail) ? thumbnail[0] : thumbnail;
  if (!thumbObj || typeof thumbObj !== "object") return null;
  
  const url = (thumbObj as { url?: string }).url;
  if (!url) return null;
  
  return url.startsWith("http") ? url : `${strapiUrl}${url}`;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  
  return null;
}

/**
 * Generate meta description from content
 */
export function generateDescription(content: unknown, maxLength = 160): string {
  if (!content) return "";
  
  const contentStr = typeof content === "string" ? content : JSON.stringify(content);
  const plainText = contentStr
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + "...";
}

/**
 * Format date for SEO
 */
export function formatDate(dateString: string | null | undefined, locale: Lang = "es"): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "pt" ? "pt-BR" : locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Rewrite URL based on current language
 */
export function rewriteUrl(url: string | undefined, currentLang: Lang): string {
  if (!url) return "/";
  
  // External URLs
  if (url.startsWith("http")) return url;
  
  // Root
  if (url === "/") return `/${currentLang}`;
  
  // Already has language prefix
  const langPattern = /^\/(en|es|pt)(\/|$)/;
  if (langPattern.test(url)) {
    return url.replace(/^\/(en|es|pt)/, `/${currentLang}`);
  }
  
  return `/${currentLang}${url.startsWith("/") ? url : "/" + url}`;
}

/**
 * Get Strapi URL
 */
export function getStrapiUrl(): string {
  return strapiUrl;
}
