"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/logo.png"
            alt="Lach Eat & Smile Kitchen"
            className="h-11 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium sm:flex">
          <Link href="/#menu" className="hover:text-flame">
            Menu
          </Link>
          <Link href="/#how" className="hover:text-flame">
            How it works
          </Link>
          <Link href="/#contact" className="hover:text-flame">
            Contact
          </Link>
        </nav>
        <button
          onClick={() => setOpen(true)}
          className="relative flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-leaf"
        >
          <span aria-hidden>🛒</span> Cart
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-flame text-xs font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
