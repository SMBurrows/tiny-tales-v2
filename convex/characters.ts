import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCharacter = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    originalImageId: v.optional(v.id("_storage")),
    style: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("characters", {
      name: args.name,
      description: args.description,
      creatorId: userId,
      originalImageId: args.originalImageId,
      transformedImageId: args.originalImageId, // For demo, using same image
      style: args.style,
      isPublic: false,
    });
  },
});

export const getMyCharacters = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_creator", (q) => q.eq("creatorId", userId))
      .collect();

    // Get URLs for character images
    const charactersWithUrls = await Promise.all(
      characters.map(async (character) => {
        let transformedImageUrl = null;
        if (character.transformedImageId) {
          transformedImageUrl = await ctx.storage.getUrl(character.transformedImageId);
        }
        
        return {
          ...character,
          transformedImageUrl,
        };
      })
    );

    return charactersWithUrls;
  },
});

export const getPublicCharacters = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();
  },
});

export const makeCharacterPublic = mutation({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const character = await ctx.db.get(args.characterId);
    if (!character || character.creatorId !== userId) {
      throw new Error("Character not found or not authorized");
    }

    await ctx.db.patch(args.characterId, {
      isPublic: true,
    });
  },
});

export const getCharacterForGeneration = internalQuery({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.characterId);
  },
});

export const updateCharacterImage = internalMutation({
  args: {
    characterId: v.id("characters"),
    transformedImageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.characterId, {
      transformedImageId: args.transformedImageId,
    });
  },
});
