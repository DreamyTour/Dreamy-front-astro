"use client";

import { useState, useRef, useEffect } from "react";
import type { Menu as MenuType, MenuItem, Link, Logo } from "@/interface/global";
import type { Lang } from "@/lib/i18n";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X, ChevronDown } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { rewriteUrl } from "@/lib/utils";
import { getStrapiUrl } from "@/lib/helpers";

interface MainMenuProps {
  menu: MenuType;
  logo: Logo;
  lang: Lang;
}



export default function MainMenu({ menu, logo, lang }: MainMenuProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const logoUrl = rewriteUrl(logo?.url || "/", lang);

  // Focus trap y gestión del foco al abrir/cerrar menú móvil
  useEffect(() => {
    if (mobileOpen) {
      // Enfocar el botón de cerrar cuando se abre el menú
      closeButtonRef.current?.focus();
      // Bloquear scroll del body
      document.body.style.overflow = "hidden";
    } else {
      // Restaurar scroll
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Cerrar menú con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* =======================
          DESKTOP (lg+)
          ======================= */}
      <NavigationMenu className="hidden lg:flex w-full mx-auto py-3">
        <NavigationMenuList className="gap-4">
          {menu?.menuItems?.map((menuItem: MenuItem, idx: number) => {
            const hasChildren =
              Array.isArray(menuItem.item) && menuItem.item.length > 0;

            // Lógica para abrir los menús hacia el lado seguro tempranamente
            const isRightSide = idx > 1;
            const contentPosition = isRightSide
              ? "!left-auto !right-0 !translate-x-0 md:!right-[-1rem]"
              : "!left-0 !translate-x-0 md:!left-[-1rem]";

            return (
              <NavigationMenuItem key={menuItem.id}>
                {hasChildren ? (
                  <>
                    <NavigationMenuTrigger
                      onClick={() => {
                        if (menuItem.link?.url) {
                          window.location.href = rewriteUrl(menuItem.link.url, lang);
                        }
                      }}
                    >
                      {menuItem.link.label}
                    </NavigationMenuTrigger>

                    <NavigationMenuContent className={contentPosition}>
                      <ul className="grid w-[320px] gap-x-3 gap-y-1 mt-1 p-1 md:w-max md:grid-flow-col md:grid-rows-4 md:auto-cols-[210px]">
                        {menuItem.item.map((subItem: Link) => (
                          <li key={subItem.id}>
                            <NavigationMenuLink asChild>
                              <a
                                href={rewriteUrl(subItem.url, lang)}
                                className="group flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-primary/5 hover:text-primary hover:-translate-y-0.5 hover:shadow-sm border border-transparent hover:border-primary/10"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-primary transition-colors flex-shrink-0"></span>
                                <span className="truncate">{subItem.label}</span>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <a
                      href={rewriteUrl(menuItem.link.url, lang)}
                      className="px-4 py-2 text-base font-medium text-foreground/80 transition-colors duration-200 hover:text-primary"
                    >
                      {menuItem.link.label}
                    </a>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>

      {/* =======================
          MOBILE (< lg)
          ======================= */}
      <div className="lg:hidden">
        {/* Mobile Header: Hamburguesa, Idioma, Logo */}
        <div className="flex items-center justify-between px-4 py-3 bg-background">
          {/* Logo a la derecha */}
          <div className="flex-1 flex">
            {logo && (
              <a
                href={logoUrl}
                target={logo.isExternal ? "_blank" : "_self"}
                rel={logo.isExternal ? "noopener noreferrer" : undefined}
                className="block"
              >
                {logo.imagen && (
                  <img
                    src={`${getStrapiUrl()}${logo.imagen.url}`}
                    alt={logo.imagen.alternativeText ?? logo.label ?? "Logo"}
                    className="h-10 w-auto"
                  />
                )}
              </a>
            )}
          </div>
          {/* Idioma al medio */}
          <div className="flex-1 flex justify-center">
            {lang && <LanguageSwitcher currentLang={lang} />}
          </div>
          {/* Hamburgesa */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md -ml-2 text-foreground/70 transition-colors duration-200 hover:text-primary"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile menu dropdown and overlay */}
        {mobileOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            {/* Menu items */}
            <div 
              id="mobile-menu"
              className="absolute top-[64px] left-0 w-full z-50 bg-background pb-4 rounded-b-lg"
              role="navigation"
              aria-label="Menú principal"
            >
              {/* Botón de cerrar */}
              <div className="flex justify-end px-4 pt-4">
                <button
                  ref={closeButtonRef}
                  onClick={() => setMobileOpen(false)}
                  className="p-2 -mr-2 rounded-md text-muted-foreground transition-colors duration-200 hover:text-primary"
                  aria-label="Cerrar menú"
                >
                  <X size={24} />
                </button>
              </div>

              <ul className="flex flex-col divide-y divide-border/50 px-4 py-2">
                {menu?.menuItems?.map((menuItem: MenuItem) => {
                  const hasChildren =
                    Array.isArray(menuItem.item) && menuItem.item.length > 0;

                  return (
                    <li key={menuItem.id}>
                      {hasChildren ? (
                        <MobileAccordion item={menuItem} closeMenu={() => setMobileOpen(false)} lang={lang} />
                      ) : (
                        <a
                          href={rewriteUrl(menuItem.link.url, lang)}
                          className="block py-3 font-medium text-foreground/80 transition-colors duration-200 hover:text-primary"
                          onClick={() => setMobileOpen(false)}
                        >
                          {menuItem.link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* =======================
   MOBILE ACCORDION
   ======================= */
interface MobileAccordionProps {
  item: MenuItem;
  closeMenu: () => void;
  lang: Lang;
}

function MobileAccordion({ item, closeMenu, lang }: MobileAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* TÍTULO = TOGGLE */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 font-medium text-foreground/80 transition-colors duration-200 hover:text-primary"
        aria-expanded={open}
      >
        {item.link.label}
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Submenu */}
      {open && (
        <ul className="ml-4 mt-2 flex flex-col gap-1">
          {item.item.map((subItem: Link) => (
            <li key={subItem.id}>
              <a
                href={rewriteUrl(subItem.url, lang)}
                className="block rounded px-2 py-1.5 text-sm text-foreground/60 transition-colors duration-200 hover:text-primary"
                onClick={closeMenu}
              >
                {subItem.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}