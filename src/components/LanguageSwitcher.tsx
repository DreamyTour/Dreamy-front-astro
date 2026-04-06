"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { LANGS, type Lang } from "@/lib/i18n";

const languageNames: Record<Lang, string> = {
  en: "Ingles",
  es: "Español",
  pt: "Portugues",
};

export function LanguageSwitcher({ currentLang }: { currentLang: Lang }) {
  const [value, setValue] = React.useState(currentLang);

  const handleValueChange = (val: string | null) => {
    if (!val || val === currentLang) return;

    setValue(val as Lang);

    const pathname = window.location.pathname;
    let newPathname = pathname;

    // Buscar mapa de slugs para tours localizados
    const tourSlugMapEl = document.getElementById("tour-slug-map");
    if (tourSlugMapEl) {
      try {
        const slugMap: Record<string, string> = JSON.parse(
          tourSlugMapEl.textContent ?? "{}"
        );
        const targetSlug = slugMap[val];
        if (targetSlug) {
          newPathname = `/${val}/${targetSlug}`;
          window.location.href = newPathname;
          return;
        }
      } catch { }
    }

    // Buscar mapa de slugs para páginas localizadas
    const pageSlugMapEl = document.getElementById("page-slug-map");
    if (pageSlugMapEl) {
      try {
        const slugMap: Record<string, string> = JSON.parse(
          pageSlugMapEl.textContent ?? "{}"
        );
        const targetSlug = slugMap[val];
        if (targetSlug) {
          newPathname = `/${val}/${targetSlug}`;
          window.location.href = newPathname;
          return;
        }
      } catch { }
    }

    // Buscar mapa de slugs para posts del blog localizados
    const blogSlugMapEl = document.getElementById("blog-slug-map");
    if (blogSlugMapEl) {
      try {
        const slugMap: Record<string, string> = JSON.parse(
          blogSlugMapEl.textContent ?? "{}"
        );
        const targetSlug = slugMap[val];
        if (targetSlug) {
          // Cambiar tanto el prefijo de idioma como el slug: /es/blog/completo3 -> /en/blog/complete3
          const currentLangMatch = pathname.match(/^\/([^/]+)(\/.*)$/);
          if (currentLangMatch) {
            newPathname = `/${val}${currentLangMatch[2].replace(/\/blog\/[^/]+$/, `/blog/${targetSlug}`)}`;
          }
          window.location.href = newPathname;
          return;
        }
      } catch { }
    }

    // Fallback: reemplazar solo el prefijo de idioma
    const currentPrefix = LANGS.find(l => pathname.startsWith(`/${l}`) && (pathname.length === l.length + 1 || pathname.charAt(l.length + 1) === '/'));

    if (currentPrefix) {
      newPathname = pathname.replace(`/${currentPrefix}`, `/${val}`);
    } else {
      newPathname = `/${val}${pathname === '/' ? '' : pathname}`;
    }

    window.location.href = newPathname;
  };

  return (
    <div className="w-30">
      <Combobox
        value={value}
        onValueChange={(val) => handleValueChange(val as string)}
        aria-label="Seleccionar idioma"
      >
        <ComboboxInput
          readOnly
          showTrigger
          showClear={false}
          value={languageNames[value as Lang]}
          className="cursor-pointer bg-white border shadow-sm"
          aria-label="Idioma actual"
        />
        <ComboboxContent align="end" sideOffset={4}>
          <ComboboxList>
            {LANGS.map((lang) => (
              <ComboboxItem key={lang} value={lang}>
                {languageNames[lang]}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
