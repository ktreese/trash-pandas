"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Camera } from "lucide-react";

const navLinks = [
  { href: "/", label: "Gallery" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#2a2a2a] bg-[#0d0d0d]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="/logos/tp-icon.png"
                alt="Trash Pandas"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-bold leading-tight text-white group-hover:text-[#c4a0e8] transition-colors">
                Trash Pandas
              </p>
              <p className="text-xs text-[#8a8a8a] leading-tight">14U Baseball</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-[#6B35A3] text-white"
                    : "text-[#b8b8b8] hover:text-white hover:bg-[#252525]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/upload"
              className="ml-3 flex items-center gap-2 rounded-lg bg-[#6B35A3] hover:bg-[#8B45C8] px-4 py-2 text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(107,53,163,0.4)] hover:shadow-[0_0_30px_rgba(139,69,200,0.5)]"
            >
              <Camera size={16} />
              Share a Photo
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 rounded-lg text-[#b8b8b8] hover:text-white hover:bg-[#252525] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[#2a2a2a] bg-[#0d0d0d] px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-[#6B35A3] text-white"
                  : "text-[#b8b8b8] hover:text-white hover:bg-[#252525]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/upload"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#6B35A3] hover:bg-[#8B45C8] px-4 py-3 text-sm font-semibold text-white transition-all"
          >
            <Camera size={16} />
            Share a Photo / Video
          </Link>
        </div>
      )}
    </header>
  );
}
