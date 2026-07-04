import { query } from "./_generated/server";
import { v } from "convex/values";

/** Throws unless the provided key matches the ADMIN_PASSWORD env var. */
export function requireAdmin(adminKey: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Run: npx convex env set ADMIN_PASSWORD yourpassword"
    );
  }
  if (adminKey !== expected) {
    throw new Error("Invalid admin password");
  }
}

export const verify = query({
  args: { adminKey: v.string() },
  handler: async (_ctx, args) => {
    try {
      requireAdmin(args.adminKey);
      return true;
    } catch {
      return false;
    }
  },
});
