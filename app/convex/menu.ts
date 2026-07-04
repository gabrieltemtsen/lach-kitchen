import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_sortOrder")
      .collect();
    return items.filter((i) => i.available);
  },
});

export const listAll = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey);
    return await ctx.db.query("menuItems").withIndex("by_sortOrder").collect();
  },
});

export const upsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("menuItems")),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    video: v.optional(v.string()),
    available: v.boolean(),
    featured: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey);
    const { adminKey, id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("menuItems", data);
  },
});

export const setAvailable = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("menuItems"),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey);
    await ctx.db.patch(args.id, { available: args.available });
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("menuItems") },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});

const STARTER_MENU = [
  {
    name: "Efo Riro",
    description:
      "Rich Yoruba-style vegetable soup, slow-cooked with peppers, assorted meat and a smoky depth of flavour. A true classic.",
    price: 3500,
    category: "Soups & Stews",
    image: "/media/efo-riro-1.jpg",
    video: "/media/efo-riro.mp4",
    available: true,
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Akara",
    description:
      "Golden, fluffy bean cakes fried fresh to order. Crispy outside, soft inside — perfect with pap, bread or on their own. 10 pieces.",
    price: 1500,
    category: "Fritters & Small Chops",
    image: "/media/akara-1.jpg",
    video: "/media/akara.mp4",
    available: true,
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Masa",
    description:
      "Soft, slightly tangy Northern rice cakes with beautifully browned edges. Great with soup, honey or suya pepper. 8 pieces.",
    price: 2000,
    category: "Fritters & Small Chops",
    image: "/media/masa-poster.jpg",
    video: "/media/masa.mp4",
    available: true,
    featured: true,
    sortOrder: 3,
  },
  {
    name: "Mosa",
    description:
      "Sweet overripe-plantain fritters, fried golden and irresistibly soft. The perfect little treat. Per portion.",
    price: 1500,
    category: "Fritters & Small Chops",
    image: "/media/mosa-poster.jpg",
    video: "/media/mosa.mp4",
    available: true,
    featured: false,
    sortOrder: 4,
  },
];

const DEFAULT_SETTINGS: Record<string, string> = {
  bankName: "Your Bank",
  accountName: "Lach Eat & Smile Kitchen",
  accountNumber: "0000000000",
  phone: "+234 913 547 1036",
  whatsapp: "+2349135471036",
  email: "lach.eatnsmilekitchen@gmail.com",
  address: "7B Road C, Oba Adeyinka Oyekan, Lekki Phase I, Lagos State",
  deliveryNote:
    "We deliver across Lekki & environs. Delivery fee is confirmed by phone/WhatsApp after your order.",
};

export const seed = mutation({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey);
    const existing = await ctx.db.query("menuItems").first();
    if (!existing) {
      for (const item of STARTER_MENU) {
        await ctx.db.insert("menuItems", item);
      }
    }
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const row = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (!row) await ctx.db.insert("settings", { key, value });
    }
    return "seeded";
  },
});
