"use client";

import { useRef, useState } from "react";
import { useCart, naira } from "@/lib/cart";

export type MenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  video?: string;
  featured: boolean;
};

export default function ItemCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [added, setAdded] = useState(false);

  const play = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };
  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const handleAdd = () => {
    add({ key: item._id, name: item.name, price: item.price, image: item.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-forest/5 transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden"
        onMouseEnter={play}
        onMouseLeave={pause}
        onTouchStart={playing ? pause : play}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            playing && item.video ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
        />
        {item.video && (
          <video
            ref={videoRef}
            src={item.video}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="none"
            poster={item.image}
          />
        )}
        {item.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-flame px-3 py-1 text-xs font-bold text-white shadow">
            Popular
          </span>
        )}
        {item.video && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {playing ? "❚❚" : "▶ watch"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold">{item.name}</h3>
          <span className="whitespace-nowrap rounded-full bg-sand px-3 py-1 font-display text-lg font-bold text-forest">
            {naira(item.price)}
          </span>
        </div>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-forest/60">
          {item.description}
        </p>
        <button
          onClick={handleAdd}
          className={`mt-4 w-full rounded-full py-3 text-sm font-bold transition ${
            added
              ? "bg-leaf text-cream"
              : "bg-forest text-cream hover:bg-flame"
          }`}
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
