import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export const getOrder = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const notify = internalAction({
  args: {
    orderId: v.id("orders"),
    kind: v.union(v.literal("new_order"), v.literal("receipt_uploaded")),
  },
  handler: async (ctx, args) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      console.log(
        "Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing) — skipping notification."
      );
      return;
    }

    const order: Doc<"orders"> | null = await ctx.runQuery(
      internal.telegram.getOrder,
      { orderId: args.orderId }
    );
    if (!order) return;

    const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
    const adminLink = `${siteUrl}/admin?order=${args.orderId}`;

    const lines = order.items
      .map((i) => `  • ${i.qty} × ${i.name} — ${naira(i.price * i.qty)}`)
      .join("\n");

    const header =
      args.kind === "new_order"
        ? `🧾 <b>New order ${order.reference}</b>`
        : `💸 <b>Payment receipt uploaded — ${order.reference}</b>`;

    const text = [
      header,
      "",
      `👤 ${order.customerName}`,
      `📞 ${order.phone}`,
      `📍 ${order.address}`,
      order.notes ? `📝 ${order.notes}` : null,
      "",
      lines,
      "",
      `💰 <b>Total: ${naira(order.total)}</b>`,
      args.kind === "receipt_uploaded"
        ? "\n✅ Review the receipt and confirm the order:"
        : "\nView & manage:",
      adminLink,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    if (!res.ok) {
      console.error("Telegram sendMessage failed:", await res.text());
    }
  },
});
