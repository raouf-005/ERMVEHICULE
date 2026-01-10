"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Button } from "./button";

const navItems = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/customers", label: "Clients", icon: Users },
  { href: "/vehicles", label: "Véhicules", icon: Car },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Topbar() {
  const pathname = usePathname();

  // Déterminer si on est sur une page détail (avec un ID ou /new)
  const isDetailPage =
    pathname.split("/").length > 2 && pathname !== "/" ? true : false;

  // Trouver le chemin parent pour le bouton retour
  const getParentPath = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 1) {
      return `/${segments[0]}`;
    }
    return "/";
  };

  // Trouver le titre de la page actuelle
  const getCurrentSection = () => {
    const segment = pathname.split("/")[1];
    const item = navItems.find(
      (item) =>
        item.href === `/${segment}` || (segment === "" && item.href === "/")
    );
    return item?.label || "Page";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo et bouton retour */}
          <div className="flex items-center gap-4">
            {isDetailPage ? (
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={getParentPath()}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Retour</span>
                </Link>
              </Button>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg hidden sm:inline">
                  Garage ERP
                </span>
              </Link>
            )}

            {isDetailPage && (
              <span className="text-sm text-muted-foreground">
                {getCurrentSection()}
              </span>
            )}
          </div>

          {/* Navigation principale */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={isActive ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
