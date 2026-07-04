"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ItemCard, { MenuItem } from "./ItemCard";

export default function MenuSection() {
  const items = useQuery(api.menu.list) as MenuItem[] | undefined;

  const categories = items
    ? Array.from(new Set(items.map((i) => i.category)))
    : [];

  return (
    <section id="menu" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="font-display text-4xl font-black sm:text-5xl">
          Our Menu
        </h2>
        <p className="mt-3 text-forest/60">
          Everything is cooked fresh when you order. Tap a dish to see it
          sizzle.
        </p>
      </div>

      {items === undefined && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-3xl bg-sand"
            />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <p className="text-center text-forest/50">
          Menu is being updated — check back soon!
        </p>
      )}

      {categories.map((cat) => (
        <div key={cat} className="mb-12">
          <h3 className="mb-6 font-display text-2xl font-bold text-olive">
            {cat}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items!
              .filter((i) => i.category === cat)
              .map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
