"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { naira } from "@/lib/cart";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

const STATUS_STEPS = [
  { key: "awaiting_payment", label: "Order placed", emoji: "🧾" },
  { key: "receipt_submitted", label: "Receipt uploaded", emoji: "💸" },
  { key: "confirmed", label: "Payment confirmed", emoji: "✅" },
  { key: "delivered", label: "Delivered", emoji: "🛵" },
] as const;

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = id as Id<"orders">;
  const order = useQuery(api.orders.get, { id: orderId });
  const settings = useQuery(api.settings.getAll) as
    | Record<string, string>
    | undefined;
  const generateUploadUrl = useMutation(api.orders.generateReceiptUploadUrl);
  const attachReceipt = useMutation(api.orders.attachReceipt);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await generateUploadUrl({ orderId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("upload failed");
      const { storageId } = await res.json();
      await attachReceipt({ orderId, receiptId: storageId });
    } catch {
      setUploadError("Upload failed — please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (order === undefined) {
    return (
      <main>
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sand border-t-flame" />
        </div>
      </main>
    );
  }

  if (order === null) {
    return (
      <main>
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="text-5xl">🤔</p>
          <h1 className="mt-4 font-display text-2xl font-bold">
            Order not found
          </h1>
          <Link href="/" className="mt-4 inline-block font-bold text-flame">
            ← Back home
          </Link>
        </div>
      </main>
    );
  }

  const isRejected = order.status === "rejected";
  const stepIndex = isRejected
    ? 1
    : STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold text-forest/50">
          Order <span className="font-bold text-forest">{order.reference}</span>
        </p>
        <h1 className="mt-1 font-display text-4xl font-black">
          {isRejected
            ? "We couldn't verify your payment 😕"
            : order.status === "awaiting_payment"
            ? "Almost there — pay & upload your receipt"
            : order.status === "receipt_submitted"
            ? "Receipt received — confirming…"
            : order.status === "confirmed"
            ? "Payment confirmed — we're cooking! 🍳"
            : "Delivered — enjoy! 😋"}
        </h1>

        {/* progress */}
        {!isRejected && (
          <ol className="mt-8 flex items-center">
            {STATUS_STEPS.map((s, i) => (
              <li key={s.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${
                      i <= stepIndex
                        ? "bg-leaf text-cream"
                        : "bg-sand text-forest/40"
                    }`}
                  >
                    {s.emoji}
                  </div>
                  <span
                    className={`whitespace-nowrap text-[11px] font-semibold ${
                      i <= stepIndex ? "text-forest" : "text-forest/40"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={`mx-2 mb-5 h-1 flex-1 rounded ${
                      i < stepIndex ? "bg-leaf" : "bg-sand"
                    }`}
                  />
                )}
              </li>
            ))}
          </ol>
        )}

        {/* payment card */}
        {order.status === "awaiting_payment" && (
          <div className="mt-8 rounded-3xl bg-forest p-6 text-cream shadow-xl">
            <h2 className="font-display text-2xl font-bold">
              Pay {naira(order.total)} by bank transfer
            </h2>
            <div className="mt-4 grid gap-3 rounded-2xl bg-cream/10 p-4 text-sm">
              <Row label="Bank" value={settings?.bankName ?? "—"} />
              <Row label="Account name" value={settings?.accountName ?? "—"} />
              <Row
                label="Account number"
                value={settings?.accountNumber ?? "—"}
                copyable
              />
              <Row label="Reference" value={order.reference} copyable />
            </div>
            <p className="mt-3 text-xs text-cream/60">
              Tip: add <b>{order.reference}</b> to your transfer narration so we
              find it quickly.
            </p>

            <label
              className={`mt-5 block cursor-pointer rounded-2xl border-2 border-dashed border-cream/40 p-6 text-center transition hover:border-flame hover:bg-cream/5 ${
                uploading ? "opacity-60" : ""
              }`}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
              />
              <p className="text-3xl">📤</p>
              <p className="mt-2 font-bold">
                {uploading ? "Uploading…" : "Upload payment receipt"}
              </p>
              <p className="mt-1 text-xs text-cream/60">
                Screenshot or photo of your transfer confirmation
              </p>
            </label>
            {uploadError && (
              <p className="mt-3 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold">
                {uploadError}
              </p>
            )}
          </div>
        )}

        {order.status === "receipt_submitted" && (
          <div className="mt-8 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-forest/5">
            <p className="text-4xl">⏳</p>
            <p className="mt-3 font-bold">
              Thanks! We're checking your receipt now.
            </p>
            <p className="mt-1 text-sm text-forest/60">
              This page updates automatically the moment we confirm — no need to
              refresh.
            </p>
          </div>
        )}

        {isRejected && (
          <div className="mt-8 rounded-3xl bg-red-50 p-6 shadow-sm ring-1 ring-red-100">
            <p className="font-bold text-red-700">
              We couldn't match your receipt to a payment.
            </p>
            <p className="mt-2 text-sm text-red-600">
              Please reach out on WhatsApp ({settings?.whatsapp ?? ""}) with your
              order reference <b>{order.reference}</b> and we'll sort it out
              right away.
            </p>
          </div>
        )}

        {order.status === "confirmed" && (
          <div className="mt-8 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-forest/5">
            <p className="text-4xl">🎉</p>
            <p className="mt-3 font-bold">Your food is being prepared!</p>
            <p className="mt-1 text-sm text-forest/60">
              We'll reach you on {order.phone} about delivery.
            </p>
          </div>
        )}

        {/* order summary */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-forest/5">
          <h2 className="font-display text-xl font-bold">Order summary</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {order.items.map((l, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm">
                <span>
                  <span className="font-bold">{l.qty}×</span> {l.name}
                </span>
                <span className="font-semibold">{naira(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-forest/10 pt-4">
            <span className="font-bold">Total</span>
            <span className="font-display text-xl font-black">
              {naira(order.total)}
            </span>
          </div>
          <p className="mt-4 text-xs text-forest/50">
            Delivering to: {order.address}
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-forest/50">
          Save this page to track your order. Questions?{" "}
          <a
            href={`https://wa.me/${(settings?.whatsapp ?? "").replace(/[+\s]/g, "")}`}
            className="font-bold text-flame"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp us
          </a>
        </p>
      </div>
      <CartDrawer />
    </main>
  );
}

function Row({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-cream/60">{label}</span>
      <span className="flex items-center gap-2 font-bold">
        {value}
        {copyable && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              });
            }}
            className="rounded-lg bg-cream/15 px-2 py-1 text-xs font-semibold hover:bg-cream/25"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        )}
      </span>
    </div>
  );
}
