"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCart, naira } from "@/lib/cart";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

export default function CheckoutPage() {
  const { lines, total, clear } = useCart();
  const createOrder = useMutation(api.orders.create);
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const { orderId } = await createOrder({
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim() || undefined,
        items: lines.map((l) => ({ name: l.name, price: l.price, qty: l.qty })),
      });
      clear();
      router.push(`/order/${orderId}`);
    } catch (err) {
      setError("Something went wrong placing your order. Please try again.");
      setSubmitting(false);
    }
  };

  const input =
    "w-full rounded-2xl border-2 border-forest/10 bg-white px-4 py-3.5 text-forest outline-none transition focus:border-flame";

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/#menu" className="text-sm font-semibold text-forest/50 hover:text-flame">
          ← Back to menu
        </Link>
        <h1 className="mt-3 font-display text-4xl font-black">Checkout</h1>

        {lines.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-5xl">🛒</p>
            <p className="mt-4 font-display text-xl font-bold">
              Your cart is empty
            </p>
            <Link
              href="/#menu"
              className="mt-6 inline-block rounded-full bg-flame px-8 py-3.5 font-bold text-white"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:col-span-3">
              <div>
                <label className="mb-1.5 block text-sm font-bold">Your name</label>
                <input
                  className={input}
                  required
                  placeholder="e.g. Ada Obi"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold">Phone number</label>
                <input
                  className={input}
                  required
                  type="tel"
                  placeholder="e.g. 0803 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <p className="mt-1 text-xs text-forest/50">
                  We'll call or WhatsApp you to confirm delivery.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold">Delivery address</label>
                <textarea
                  className={input}
                  required
                  rows={3}
                  placeholder="Street, area, landmark…"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  Notes <span className="font-normal text-forest/40">(optional)</span>
                </label>
                <input
                  className={input}
                  placeholder="e.g. extra pepper, call on arrival"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-full bg-flame py-4 text-base font-bold text-white shadow-lg shadow-flame/30 transition hover:bg-flame-dark disabled:opacity-60"
              >
                {submitting ? "Placing order…" : `Place order · ${naira(total)}`}
              </button>
              <p className="text-center text-xs text-forest/50">
                Next: you'll see our bank details to pay by transfer and upload
                your receipt.
              </p>
            </form>

            <aside className="md:col-span-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-forest/5">
                <h2 className="font-display text-xl font-bold">Your order</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {lines.map((l) => (
                    <li key={l.key} className="flex justify-between gap-3 text-sm">
                      <span>
                        <span className="font-bold">{l.qty}×</span> {l.name}
                      </span>
                      <span className="font-semibold">{naira(l.price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-forest/10 pt-4">
                  <span className="font-bold">Total</span>
                  <span className="font-display text-xl font-black">{naira(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
      <CartDrawer />
    </main>
  );
}
