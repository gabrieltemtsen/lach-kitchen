"use client";

import { useRouter } from "next/navigation";
import { useCart, naira } from "@/lib/cart";

export default function CartDrawer() {
  const { lines, setQty, remove, total, open, setOpen } = useCart();
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-forest/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <aside className="animate-slide-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-forest/10 p-5">
          <h2 className="font-display text-2xl font-bold">Your cart</h2>
          <button
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-lg font-bold hover:bg-forest hover:text-cream"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-5xl">🍽️</p>
              <p className="mt-4 font-display text-xl font-bold">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-forest/50">
                Add something delicious from the menu!
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((l) => (
                <li
                  key={l.key}
                  className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.image}
                    alt={l.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold">{l.name}</p>
                      <button
                        onClick={() => remove(l.key)}
                        className="text-sm text-forest/40 hover:text-flame"
                        aria-label={`Remove ${l.name}`}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-forest/60">{naira(l.price)}</p>
                    <div className="mt-auto flex items-center gap-3">
                      <button
                        onClick={() => setQty(l.key, l.qty - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-sand font-bold hover:bg-forest hover:text-cream"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold">{l.qty}</span>
                      <button
                        onClick={() => setQty(l.key, l.qty + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-sand font-bold hover:bg-forest hover:text-cream"
                      >
                        +
                      </button>
                      <span className="ml-auto font-display font-bold">
                        {naira(l.price * l.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-forest/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-forest/60">Subtotal</span>
              <span className="font-display text-2xl font-black">
                {naira(total)}
              </span>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/checkout");
              }}
              className="w-full rounded-full bg-flame py-4 text-base font-bold text-white shadow-lg shadow-flame/30 transition hover:bg-flame-dark"
            >
              Checkout →
            </button>
            <p className="mt-3 text-center text-xs text-forest/50">
              Delivery fee confirmed by phone/WhatsApp after ordering
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
