import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  stories: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("custom"), v.literal("premade")),
    authorId: v.id("users"),
    pages: v.array(v.object({
      pageNumber: v.number(),
      text: v.string(),
      originalImageId: v.optional(v.id("_storage")),
      transformedImageId: v.optional(v.id("_storage")),
      characterIds: v.optional(v.array(v.id("characters"))),
    })),
    isPublished: v.boolean(),
    createdAt: v.number(),
  }).index("by_author", ["authorId"])
    .index("by_type", ["type"])
    .index("by_published", ["isPublished"]),

  characters: defineTable({
    name: v.string(),
    description: v.string(),
    creatorId: v.id("users"),
    originalImageId: v.optional(v.id("_storage")),
    transformedImageId: v.optional(v.id("_storage")),
    style: v.string(),
    isPublic: v.boolean(),
  }).index("by_creator", ["creatorId"])
    .index("by_public", ["isPublic"]),

  premadeStories: defineTable({
    title: v.string(),
    description: v.string(),
    pages: v.array(v.object({
      pageNumber: v.number(),
      text: v.string(),
      drawingPrompt: v.string(),
    })),
    ageGroup: v.string(),
    category: v.string(),
  }).index("by_category", ["category"])
    .index("by_age_group", ["ageGroup"]),

  imageTransformations: defineTable({
    originalImageId: v.id("_storage"),
    transformedImageId: v.id("_storage"),
    style: v.string(),
    userId: v.id("users"),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  scrapbooks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("users"),
    imageIds: v.array(v.id("_storage")),
    layout: v.string(),
    isPublished: v.boolean(),
    createdAt: v.number(),
  }).index("by_creator", ["creatorId"])
    .index("by_published", ["isPublished"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
