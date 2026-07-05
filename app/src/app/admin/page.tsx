"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { naira } from "@/lib/cart";

const KEY_STORAGE = "les-admin-key";

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <Admin />
    </Suspense>
  );
}

function Admin() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAdminKey(localStorage.getItem(KEY_STORAGE));
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!adminKey) {
    return (
      <Login
        onSuccess={(key) => {
          localStorage.setItem(KEY_STORAGE, key);
          setAdminKey(key);
        }}
      />
    );
  }
  return (
    <Dashboard
      adminKey={adminKey}
      onLogout={() => {
        localStorage.removeItem(KEY_STORAGE);
        setAdminKey(null);
      }}
    />
  );
}

/* ---------- Login ---------- */

function Login({ onSuccess }: { onSuccess: (key: string) => void }) {
  const convex = useConvex();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await convex.query(api.admin.verify, { adminKey: password });
    if (ok) onSuccess(password);
    else {
      setError("Wrong password");
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl bg-cream p-8 shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/logo.png" alt="" className="mx-auto h-16 w-auto" />
        <h1 className="mt-4 text-center font-display text-2xl font-black">
          Admin dashboard
        </h1>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-6 w-full rounded-2xl border-2 border-forest/10 bg-white px-4 py-3.5 outline-none focus:border-flame"
          autoFocus
        />
        {error && (
          <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
        )}
        <button
          disabled={busy || !password}
          className="mt-4 w-full rounded-full bg-forest py-3.5 font-bold text-cream transition hover:bg-flame disabled:opacity-50"
        >
          {busy ? "Checking…" : "Log in"}
        </button>
      </form>
    </main>
  );
}

/* ---------- Dashboard ---------- */

type Tab = "orders" | "menu" | "settings";

const STATUS_META: Record<
  Doc<"orders">["status"],
  { label: string; cls: string }
> = {
  awaiting_payment: { label: "Awaiting payment", cls: "bg-amber-100 text-amber-800" },
  receipt_submitted: { label: "Receipt uploaded", cls: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Confirmed", cls: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
  delivered: { label: "Delivered", cls: "bg-forest/10 text-forest" },
};

function Dashboard({
  adminKey,
  onLogout,
}: {
  adminKey: string;
  onLogout: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deepLinkOrder = searchParams.get("order");
  const [tab, setTab] = useState<Tab>("orders");
  const [selectedOrder, setSelectedOrder] = useState<Id<"orders"> | null>(
    (deepLinkOrder as Id<"orders">) ?? null
  );

  return (
    <main className="min-h-screen bg-sand/60">
      <header className="sticky top-0 z-30 border-b border-forest/10 bg-cream">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/logo.png" alt="" className="h-10 w-auto" />
            <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-cream">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1 rounded-full bg-sand p-1">
              {(["orders", "menu", "settings"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize transition ${
                    tab === t ? "bg-forest text-cream" : "hover:bg-forest/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </nav>
            <button
              onClick={onLogout}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest/50 hover:text-flame"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === "orders" && (
          <OrdersTab
            adminKey={adminKey}
            selectedOrder={selectedOrder}
            setSelectedOrder={(id) => {
              setSelectedOrder(id);
              if (!id) router.replace("/admin");
            }}
          />
        )}
        {tab === "menu" && <MenuTab adminKey={adminKey} />}
        {tab === "settings" && <SettingsTab adminKey={adminKey} />}
      </div>
    </main>
  );
}

/* ---------- Orders ---------- */

function OrdersTab({
  adminKey,
  selectedOrder,
  setSelectedOrder,
}: {
  adminKey: string;
  selectedOrder: Id<"orders"> | null;
  setSelectedOrder: (id: Id<"orders"> | null) => void;
}) {
  const orders = useQuery(api.orders.listAdmin, { adminKey });
  const [filter, setFilter] = useState<string>("all");

  const filtered = orders?.filter(
    (o) => filter === "all" || o.status === filter
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto font-display text-2xl font-black">Orders</h1>
        {["all", "receipt_submitted", "awaiting_payment", "confirmed", "delivered", "rejected"].map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filter === f
                  ? "bg-forest text-cream"
                  : "bg-white text-forest/60 hover:bg-forest/10"
              }`}
            >
              {f === "all" ? "All" : STATUS_META[f as keyof typeof STATUS_META].label}
            </button>
          )
        )}
      </div>

      {orders === undefined && (
        <div className="h-40 animate-pulse rounded-3xl bg-white" />
      )}
      {filtered && filtered.length === 0 && (
        <p className="rounded-3xl bg-white p-10 text-center text-forest/50">
          No orders here yet.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {filtered?.map((o) => (
          <li key={o._id}>
            <button
              onClick={() => setSelectedOrder(o._id)}
              className="flex w-full flex-wrap items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-forest/5 transition hover:ring-flame/40"
            >
              <span className="font-mono text-sm font-bold">{o.reference}</span>
              <span className="font-semibold">{o.customerName}</span>
              <span className="text-sm text-forest/50">
                {o.items.reduce((s, i) => s + i.qty, 0)} items
              </span>
              <span className="ml-auto font-display font-bold">
                {naira(o.total)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_META[o.status].cls}`}
              >
                {STATUS_META[o.status].label}
              </span>
              <span className="text-xs text-forest/40">
                {new Date(o._creationTime).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selectedOrder && (
        <OrderDetail
          adminKey={adminKey}
          orderId={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

function OrderDetail({
  adminKey,
  orderId,
  onClose,
}: {
  adminKey: string;
  orderId: Id<"orders">;
  onClose: () => void;
}) {
  const order = useQuery(api.orders.get, { id: orderId });
  const receiptUrl = useQuery(api.orders.receiptUrl, { orderId });
  const setStatus = useMutation(api.orders.setStatus);
  const [pending, setPending] = useState<Doc<"orders">["status"] | null>(null);
  const [acting, setActing] = useState(false);

  const act = async (status: Doc<"orders">["status"]) => {
    setActing(true);
    try {
      await setStatus({ adminKey, orderId, status });
      setPending(null);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-forest/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl">
        {order === undefined ? (
          <div className="h-40 animate-pulse rounded-2xl bg-sand" />
        ) : order === null ? (
          <p>Order not found.</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-bold text-forest/50">
                  {order.reference}
                </p>
                <h2 className="font-display text-2xl font-black">
                  {order.customerName}
                </h2>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${STATUS_META[order.status].cls}`}
                >
                  {STATUS_META[order.status].label}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sand font-bold hover:bg-forest hover:text-cream"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 text-sm">
                <p className="font-bold">Contact</p>
                <p className="mt-1">
                  📞{" "}
                  <a href={`tel:${order.phone}`} className="font-semibold text-leaf">
                    {order.phone}
                  </a>
                </p>
                <p className="mt-1">📍 {order.address}</p>
                {order.notes && (
                  <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 font-semibold text-amber-900 ring-1 ring-amber-200">
                    📝 Notes/allergies: {order.notes}
                  </p>
                )}
              </div>
              <div className="rounded-2xl bg-white p-4 text-sm">
                <p className="font-bold">Items</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {order.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>
                        {i.qty}× {i.name}
                      </span>
                      <span className="font-semibold">
                        {naira(i.price * i.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 border-t border-forest/10 pt-2 text-right font-display text-lg font-black">
                  {naira(order.total)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="font-bold">Payment receipt</p>
              {receiptUrl ? (
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receiptUrl}
                    alt="Payment receipt"
                    className="mt-2 max-h-96 rounded-xl object-contain ring-1 ring-forest/10"
                  />
                  <span className="mt-1 block text-xs font-semibold text-leaf">
                    Open full size ↗
                  </span>
                </a>
              ) : (
                <p className="mt-1 text-sm text-forest/50">
                  No receipt uploaded yet.
                </p>
              )}
            </div>

            {pending ? (
              <div className="mt-5 rounded-2xl border-2 border-flame/40 bg-white p-4">
                <p className="font-bold">
                  {pending === "confirmed" &&
                    `Confirm payment of ${naira(order.total)} for ${order.reference}?`}
                  {pending === "rejected" &&
                    `Reject the payment for ${order.reference}?`}
                  {pending === "delivered" &&
                    `Mark ${order.reference} as delivered?`}
                </p>
                <p className="mt-1 text-sm text-forest/60">
                  {pending === "confirmed" &&
                    "Only do this after checking your bank account for the transfer. The customer's page will switch to \"we're cooking\" immediately."}
                  {pending === "rejected" &&
                    "The customer will be asked to contact you on WhatsApp to resolve it."}
                  {pending === "delivered" &&
                    "This closes the order on the customer's tracking page."}
                </p>
                {pending === "confirmed" && !receiptUrl && (
                  <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900 ring-1 ring-amber-200">
                    ⚠️ No receipt has been uploaded for this order yet.
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => act(pending)}
                    disabled={acting}
                    className={`rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${
                      pending === "rejected" ? "bg-red-600" : "bg-leaf"
                    }`}
                  >
                    {acting
                      ? "Working…"
                      : pending === "confirmed"
                      ? "Yes, payment received"
                      : pending === "rejected"
                      ? "Yes, reject it"
                      : "Yes, delivered"}
                  </button>
                  <button
                    onClick={() => setPending(null)}
                    disabled={acting}
                    className="rounded-full bg-sand px-5 py-2.5 text-sm font-bold hover:bg-forest/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => setPending("confirmed")}
                  className="rounded-full bg-leaf px-5 py-2.5 text-sm font-bold text-cream hover:opacity-90"
                >
                  ✅ Confirm payment
                </button>
                <button
                  onClick={() => setPending("delivered")}
                  className="rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-cream hover:opacity-90"
                >
                  🛵 Mark delivered
                </button>
                <button
                  onClick={() => setPending("rejected")}
                  className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
                >
                  ✕ Reject
                </button>
                <a
                  href={`https://wa.me/${order.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-sand px-5 py-2.5 text-sm font-bold hover:bg-forest/10"
                >
                  💬 WhatsApp customer
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Menu ---------- */

type EditState = Partial<Doc<"menuItems">> & { isNew?: boolean };

function MenuTab({ adminKey }: { adminKey: string }) {
  const items = useQuery(api.menu.listAll, { adminKey });
  const upsert = useMutation(api.menu.upsert);
  const setAvailable = useMutation(api.menu.setAvailable);
  const remove = useMutation(api.menu.remove);
  const seed = useMutation(api.menu.seed);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      await upsert({
        adminKey,
        id: editing.isNew ? undefined : (editing._id as Id<"menuItems">),
        name: editing.name ?? "",
        description: editing.description ?? "",
        price: Number(editing.price) || 0,
        category: editing.category ?? "Mains",
        image: editing.image ?? "/media/efo-riro-1.jpg",
        video: editing.video || undefined,
        available: editing.available ?? true,
        featured: editing.featured ?? false,
        sortOrder: Number(editing.sortOrder) || 99,
      });
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border-2 border-forest/10 bg-white px-3 py-2 text-sm outline-none focus:border-flame";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-black">Menu</h1>
        <button
          onClick={() =>
            setEditing({ isNew: true, available: true, featured: false, sortOrder: 99 })
          }
          className="rounded-full bg-flame px-5 py-2.5 text-sm font-bold text-white hover:bg-flame-dark"
        >
          + Add dish
        </button>
      </div>

      {items && items.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center">
          <p className="font-bold">No menu items yet.</p>
          <button
            onClick={() => seed({ adminKey })}
            className="mt-4 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream hover:bg-flame"
          >
            Load starter menu (Efo Riro, Akara, Masa, Mosa)
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {items?.map((item) => (
          <li
            key={item._id}
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-forest/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{item.name}</p>
              <p className="text-xs text-forest/50">{item.category}</p>
            </div>
            <PriceEditor
              price={item.price}
              onSave={(price) =>
                upsert({
                  adminKey,
                  id: item._id,
                  name: item.name,
                  description: item.description,
                  price,
                  category: item.category,
                  image: item.image,
                  video: item.video,
                  available: item.available,
                  featured: item.featured,
                  sortOrder: item.sortOrder,
                })
              }
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={item.available}
                onChange={(e) =>
                  setAvailable({ adminKey, id: item._id, available: e.target.checked })
                }
                className="h-4 w-4 accent-leaf"
              />
              Available
            </label>
            <button
              onClick={() => setEditing(item)}
              className="rounded-full bg-sand px-4 py-2 text-sm font-bold hover:bg-forest/10"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${item.name}"?`)) remove({ adminKey, id: item._id });
              }}
              className="rounded-full px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-forest/50 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl">
            <h2 className="font-display text-xl font-black">
              {editing.isNew ? "Add dish" : `Edit ${editing.name}`}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <Field label="Name">
                <input
                  className={input}
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <textarea
                  className={input}
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (₦)">
                  <input
                    className={input}
                    type="number"
                    min={0}
                    value={editing.price ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Category">
                  <input
                    className={input}
                    value={editing.category ?? ""}
                    placeholder="e.g. Soups & Stews"
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Image path or URL">
                <input
                  className={input}
                  value={editing.image ?? ""}
                  placeholder="/media/efo-riro-1.jpg"
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                />
              </Field>
              <Field label="Video path or URL (optional)">
                <input
                  className={input}
                  value={editing.video ?? ""}
                  placeholder="/media/efo-riro.mp4"
                  onChange={(e) => setEditing({ ...editing, video: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sort order">
                  <input
                    className={input}
                    type="number"
                    value={editing.sortOrder ?? 99}
                    onChange={(e) =>
                      setEditing({ ...editing, sortOrder: Number(e.target.value) })
                    }
                  />
                </Field>
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={editing.featured ?? false}
                      onChange={(e) =>
                        setEditing({ ...editing, featured: e.target.checked })
                      }
                      className="h-4 w-4 accent-flame"
                    />
                    Popular badge
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={save}
                disabled={busy || !editing.name}
                className="rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream hover:bg-flame disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="rounded-full px-5 py-3 text-sm font-bold text-forest/50 hover:text-forest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceEditor({
  price,
  onSave,
}: {
  price: number;
  onSave: (p: number) => void;
}) {
  const [val, setVal] = useState(String(price));
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setVal(String(price));
    setDirty(false);
  }, [price]);
  return (
    <div className="flex items-center gap-1">
      <span className="font-bold text-forest/50">₦</span>
      <input
        className="w-24 rounded-xl border-2 border-forest/10 bg-white px-2 py-1.5 text-sm font-bold outline-none focus:border-flame"
        type="number"
        min={0}
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setDirty(true);
        }}
      />
      {dirty && (
        <button
          onClick={() => {
            onSave(Number(val) || 0);
            setDirty(false);
          }}
          className="rounded-full bg-leaf px-3 py-1.5 text-xs font-bold text-cream"
        >
          Save
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-forest/60">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ---------- Settings ---------- */

const SETTING_FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "bankName", label: "Bank name" },
  { key: "accountName", label: "Account name" },
  { key: "accountNumber", label: "Account number" },
  { key: "phone", label: "Phone number" },
  { key: "whatsapp", label: "WhatsApp number", hint: "with country code, e.g. +23480…" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "deliveryNote", label: "Delivery note", hint: "shown in cart & footer" },
];

function SettingsTab({ adminKey }: { adminKey: string }) {
  const settings = useQuery(api.settings.getAll) as
    | Record<string, string>
    | undefined;
  const set = useMutation(api.settings.set);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-black">Settings</h1>
      <p className="mt-1 text-sm text-forest/60">
        Bank details shown to customers at checkout, plus your contact info.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        {SETTING_FIELDS.map((f) => {
          const current = draft[f.key] ?? settings?.[f.key] ?? "";
          const dirty =
            draft[f.key] !== undefined && draft[f.key] !== (settings?.[f.key] ?? "");
          return (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-bold text-forest/60">
                {f.label}
                {f.hint && (
                  <span className="ml-1 font-normal text-forest/40">({f.hint})</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-xl border-2 border-forest/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-flame"
                  value={current}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                />
                {dirty && (
                  <button
                    onClick={async () => {
                      await set({ adminKey, key: f.key, value: draft[f.key] });
                      setSavedKey(f.key);
                      setTimeout(() => setSavedKey(null), 1200);
                    }}
                    className="whitespace-nowrap rounded-xl bg-leaf px-4 text-sm font-bold text-cream"
                  >
                    Save
                  </button>
                )}
                {savedKey === f.key && (
                  <span className="self-center text-sm font-bold text-leaf">✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
