import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  menuItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(), // naira
    category: v.string(),
    image: v.string(), // /media/... path or storage url
    video: v.optional(v.string()),
    available: v.boolean(),
    featured: v.boolean(),
    sortOrder: v.number(),
  }).index("by_sortOrder", ["sortOrder"]),

  orders: defineTable({
    customerName: v.string(),
    phone: v.string(),
    address: v.string(),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
        qty: v.number(),
      })
    ),
    total: v.number(),
    status: v.union(
      v.literal("awaiting_payment"),
      v.literal("receipt_submitted"),
      v.literal("confirmed"),
      v.literal("rejected"),
      v.literal("delivered")
    ),
    receiptId: v.optional(v.id("_storage")),
    reference: v.string(), // short human-friendly code e.g. LES-4F2K
  })
    .index("by_status", ["status"])
    .index("by_reference", ["reference"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
