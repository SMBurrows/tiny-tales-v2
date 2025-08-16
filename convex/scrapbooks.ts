import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createScrapbook = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    imageIds: v.array(v.id("_storage")),
    layout: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("scrapbooks", {
      title: args.title,
      description: args.description,
      creatorId: userId,
      imageIds: args.imageIds,
      layout: args.layout,
      isPublished: false,
      createdAt: Date.now(),
    });
  },
});

export const getMyScrapbooks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("scrapbooks")
      .withIndex("by_creator", (q) => q.eq("creatorId", userId))
      .order("desc")
      .collect();
  },
});

export const getUserTransformedImages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const transformations = await ctx.db
      .query("imageTransformations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Get URLs for both original and transformed images
    const imagesWithUrls = await Promise.all(
      transformations.map(async (transformation) => {
        const originalUrl = await ctx.storage.getUrl(transformation.originalImageId);
        const transformedUrl = await ctx.storage.getUrl(transformation.transformedImageId);
        
        return {
          ...transformation,
          originalUrl,
          transformedUrl,
        };
      })
    );

    return imagesWithUrls;
  },
});

export const generateScrapbookPrintUrl = mutation({
  args: {
    scrapbookId: v.id("scrapbooks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const scrapbook = await ctx.db.get(args.scrapbookId);
    if (!scrapbook || scrapbook.creatorId !== userId) {
      throw new Error("Scrapbook not found or not authorized");
    }

    return {
      printUrl: `https://print-demo.com/scrapbook?id=${scrapbook._id}`,
      message: "Demo: Scrapbook printing integration coming soon!",
    };
  },
});
