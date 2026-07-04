import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("settings").collect();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  },
});

export const set = mutation({
  args: { adminKey: v.string(), key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey);
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (row) {
      await ctx.db.patch(row._id, { value: args.value });
    } else {
      await ctx.db.insert("settings", { key: args.key, value: args.value });
    }
  },
});
