import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Lang } from "@/lib/i18n"
import type { Global, MenuItem, Link } from "@/interface/global"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function rewriteUrl(url: string | undefined, currentLang: Lang): string {
  if (!url || url === "#" || url.startsWith("http")) return url || "#";
  
  // Normalizar: asegurar que empiece con /
  let normalized = url.startsWith("/") ? url : `/${url}`;
  
  const LANG_CODES = ["en", "es", "pt"];
  
  // 1. Si ya tiene un prefijo de idioma, lo reemplazamos si es necesario
  for (const langCode of LANG_CODES) {
    if (normalized === `/${langCode}` || normalized.startsWith(`/${langCode}/`)) {
      if (langCode === currentLang) return normalized;
      return normalized.replace(`/${langCode}`, `/${currentLang}`);
    }
  }
  
  // 2. Si no tiene prefijo, se lo agregamos
  return `/${currentLang}${normalized === "/" ? "" : normalized}`;
}

export function rewriteMenuUrls<T extends Global>(
  data: T,
  currentLang: Lang
): T {
  const rw = (url: string | undefined) => rewriteUrl(url, currentLang);

  const rewriteLink = (link: Link): Link => ({
    ...link,
    url: rw(link.url),
  })

  if (data?.menu?.menuItems) {
    data.menu.menuItems = data.menu.menuItems.map((item: MenuItem) => ({
      ...item,
      link: rewriteLink(item.link),
      item: item.item?.map(rewriteLink) || [],
    }))
  }

  if (data?.headerTop?.headerLink) {
    data.headerTop.headerLink = data.headerTop.headerLink.map(rewriteLink)
  }

  if (data?.headerTop?.button) {
    data.headerTop.button = data.headerTop.button.map(rewriteLink)
  }

  if (data?.footer) {
    if (data.footer.destination?.link) {
      data.footer.destination.link = data.footer.destination.link.map(rewriteLink)
    }
    if (data.footer.dreamyAbout?.link) {
      data.footer.dreamyAbout.link = data.footer.dreamyAbout.link.map(rewriteLink)
    }
    if (data.footer.contact?.link) {
      data.footer.contact.link = data.footer.contact.link.map(rewriteLink)
    }
  }

  return data
}
