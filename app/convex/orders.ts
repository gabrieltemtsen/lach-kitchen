import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "LES-";
  for (let i = 0; i < 4; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

export const create = mutation({
  args: {
    customerName: v.string(),
    phone: v.string(),
    address: v.string(),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({ name: v.string(), price: v.number(), qty: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) throw new Error("Cart is empty");
    const total = args.items.reduce((s, i) => s + i.price * i.qty, 0);
    const reference = makeReference();
    const orderId = await ctx.db.insert("orders", {
      ...args,
      total,
      status: "awaiting_payment",
      reference,
    });
    await ctx.scheduler.runAfter(0, internal.telegram.notify, {
      orderId,
      kind: "new_order",
    });
    return { orderId, reference };
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const generateReceiptUploadUrl = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    return await ctx.storage.generateUploadUrl();
  },
});

export const attachReceipt = mutation({
  args: { orderId: v.id("orders"), receiptId: v.id("_storage") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(args.orderId, {
      receiptId: args.receiptId,
      status: "receipt_submitted",
    });
    await ctx.scheduler.runAfter(0, internal.telegram.notify, {
      orderId: args.orderId,
      kind: "receipt_uploaded",
    });
  },
});

export const receiptUrl = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order?.receiptId) return null;
    return await ctx.storage.getUrl(order.receiptId);
  },
});

export const listAdmin = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey);
    return await ctx.db.query("orders").order("desc").take(200);
  },
});

export const setStatus = mutation({
  args: {
    adminKey: v.string(),
    orderId: v.id("orders"),
    status: v.union(
      v.literal("awaiting_payment"),
      v.literal("receipt_submitted"),
      v.literal("confirmed"),
      v.literal("rejected"),
      v.literal("delivered")
    ),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey);
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});
