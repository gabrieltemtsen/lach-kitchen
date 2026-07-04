"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type CartLine = {
  key: string; // menu item id
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartCtx = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);

const STORAGE_KEY = "les-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartCtx>(() => {
    const add: CartCtx["add"] = (line, qty = 1) => {
      setLines((prev) => {
        const found = prev.find((l) => l.key === line.key);
        if (found) {
          return prev.map((l) =>
            l.key === line.key ? { ...l, qty: l.qty + qty } : l
          );
        }
        return [...prev, { ...line, qty }];
      });
      setOpen(true);
    };
    const setQty: CartCtx["setQty"] = (key, qty) =>
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => l.key !== key)
          : prev.map((l) => (l.key === key ? { ...l, qty } : l))
      );
    const remove: CartCtx["remove"] = (key) =>
      setLines((prev) => prev.filter((l) => l.key !== key));
    const clear = () => setLines([]);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
    return { lines, add, setQty, remove, clear, count, total, open, setOpen };
  }, [lines, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
