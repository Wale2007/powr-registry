"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconShield, IconRocket, IconScan, IconTrophy, IconBook, IconUser, IconWallet } from "./SvgIcons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: IconShield },
  { href: "/testnets", label: "Testnets", icon: IconRocket },
  { href: "/info-fi", label: "Info-Fi", icon: IconScan },
  { href: "/leaderboard", label: "Leaderboard", icon: IconTrophy },
  { href: "/trader", label: "DeFi Rep", icon: IconShield },
  { href: "/wallet", label: "Wallet", icon: IconWallet },
  { href: "/profile", label: "Profile", icon: IconUser },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(11, 17, 32, 0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1E2D4A",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-black">
              <img src="/powr_logo.png" alt="POWR Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">
              POWR<span style={{ color: "#3B82F6" }}>.PRO</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    active ? "nav-link-active" : "nav-link"
                  }`}
                  style={active ? { background: "rgba(59,130,246,0.12)", color: "#3B82F6" } : {}}
                >
                  <Icon size={14} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden btn-ghost p-2"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ borderColor: "#1E2D4A", background: "rgba(11,17,32,0.95)" }}>
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active ? "text-primary" : "text-text-secondary"
                  }`}
                  style={active ? { background: "rgba(59,130,246,0.08)", color: "#3B82F6" } : { color: "#94A3B8" }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
