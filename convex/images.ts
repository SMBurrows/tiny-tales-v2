import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const transformImage = mutation({
  args: {
    originalImageId: v.id("_storage"),
    style: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // For now, we'll return a mock success response
    // In a real implementation, this would call an AI image transformation service
    const originalImageUrl = await ctx.storage.getUrl(args.originalImageId);
    
    // Create a transformation record
    await ctx.db.insert("imageTransformations", {
      originalImageId: args.originalImageId,
      transformedImageId: args.originalImageId, // Using same image for demo
      style: args.style,
      userId,
      status: "completed",
    });

    return {
      success: true,
      transformedImageUrl: originalImageUrl,
      message: `Demo: Transforming to ${args.style} style! Real AI integration coming soon.`,
    };
  },
});

export const getImageUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
