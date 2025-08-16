import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createStory = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("custom"), v.literal("premade")),
    pages: v.array(v.object({
      pageNumber: v.number(),
      text: v.string(),
      originalImageId: v.optional(v.id("_storage")),
      transformedImageId: v.optional(v.id("_storage")),
      characterIds: v.optional(v.array(v.id("characters"))),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("stories", {
      title: args.title,
      description: args.description,
      type: args.type,
      authorId: userId,
      pages: args.pages,
      isPublished: false,
      createdAt: Date.now(),
    });
  },
});

export const getMyStories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("stories")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
  },
});

export const getPremadeStories = query({
  args: {},
  handler: async (ctx) => {
    // Demo: Return sample stories (in real app, these would be in database)
    return [
      {
        _id: "sample1" as any,
        title: "The Magic Forest Adventure",
        description: "Help Luna find her lost magic wand",
        pages: [
          { pageNumber: 1, text: "Luna the fairy lived in a magic forest.", drawingPrompt: "Draw Luna with sparkly wings" },
          { pageNumber: 2, text: "Her magic wand went missing!", drawingPrompt: "Draw Luna looking worried" },
          { pageNumber: 3, text: "She found it by the crystal waterfall.", drawingPrompt: "Draw the sparkling waterfall" },
        ],
        ageGroup: "Ages 4-8",
        category: "Fantasy",
      },
      {
        _id: "sample2" as any,
        title: "Twinkle the Unicorn and Belle Belle",
        description: "A magical friendship between a unicorn from Starwhirl and a girl on Earth",
        pages: [
          { pageNumber: 1, text: "High above the clouds, in a land called Starwhirl, lived a magical unicorn named Twinkle. She had a glittery mane, wings made of light, and hooves that sparkled like diamonds. But even in a kingdom full of magic, Twinkle felt lonely.", drawingPrompt: "Draw Twinkle the unicorn with her glittery mane and sparkling wings in the magical land of Starwhirl" },
          { pageNumber: 2, text: "One night, Twinkle saw a small blue planet through her stardust telescope. She read that Earth had something she'd never found before—a best friend. With a burst of rainbow wind, she galloped into the sky and flew toward Earth.", drawingPrompt: "Draw Twinkle looking through her stardust telescope at the blue planet Earth" },
          { pageNumber: 3, text: "Twinkle landed in a quiet field filled with daisies and butterflies. The sky was warm, the breeze was soft, and everything smelled like strawberries. She whispered, \"This place feels special.\"", drawingPrompt: "Draw a beautiful field with daisies, butterflies, and Twinkle landing softly" },
          { pageNumber: 4, text: "In the distance, she saw a girl spinning in circles and singing to the clouds. The girl wore a sparkly dress and had the brightest smile Twinkle had ever seen. \"Who is that?\" Twinkle whispered, hiding behind a tree.", drawingPrompt: "Draw Belle Belle spinning and singing in her sparkly dress while Twinkle peeks from behind a tree" },
          { pageNumber: 5, text: "The girl spotted Twinkle's shimmer and gasped with joy. She ran closer and shouted, \"A unicorn! Are you real?\" Twinkle stepped out and nodded gently.", drawingPrompt: "Draw the moment Belle Belle discovers Twinkle, with excitement and wonder on her face" },
          { pageNumber: 6, text: "\"My name's Belle Belle!\" the girl said, twirling in excitement. \"I'm Twinkle,\" the unicorn replied with a smile. And just like that, magic swirled between them.", drawingPrompt: "Draw Belle Belle and Twinkle meeting for the first time with magical sparkles swirling around them" },
          { pageNumber: 7, text: "Belle Belle brushed Twinkle's mane with her fingers and whispered, \"You're beautiful.\" Twinkle giggled, \"You're the kindest human I've ever met!\" They both felt a warm flutter in their hearts.", drawingPrompt: "Draw Belle Belle gently brushing Twinkle's glittery mane with both of them smiling happily" },
          { pageNumber: 8, text: "They played all afternoon—running through flower fields, chasing butterflies, and laughing. Twinkle showed Belle Belle how to slide on rainbows and bounce on clouds. Belle Belle showed Twinkle how to eat popsicles and do cartwheels.", drawingPrompt: "Draw Twinkle and Belle Belle playing together - sliding on rainbows, bouncing on clouds, or sharing popsicles" },
          { pageNumber: 9, text: "Twinkle had never laughed so hard in her life. Belle Belle's cheeks hurt from smiling. They both shouted at the same time, \"You're my BEST friend!\"", drawingPrompt: "Draw both friends laughing joyfully together with big smiles and happy expressions" },
          { pageNumber: 10, text: "As the sun began to set, Twinkle's horn sparkled with starlight. \"I have to return to Starwhirl before the moon rises,\" she said softly. Belle Belle's eyes filled with sparkly tears.", drawingPrompt: "Draw the sunset scene with Twinkle's horn glowing and Belle Belle looking sad but understanding" },
          { pageNumber: 11, text: "\"I don't want you to go,\" Belle Belle whispered. Twinkle nuzzled her gently. \"We'll always be connected by the stars.\"", drawingPrompt: "Draw Twinkle nuzzling Belle Belle tenderly as they share this emotional moment" },
          { pageNumber: 12, text: "Belle Belle took off her favorite charm bracelet and placed it around Twinkle's horn. \"Now you'll always remember me.\" Twinkle gave her a glowing feather from her wing.", drawingPrompt: "Draw the gift exchange - Belle Belle placing her bracelet on Twinkle's horn and receiving a glowing feather" },
          { pageNumber: 13, text: "With one last hug, Twinkle galloped into the sky, leaving a trail of glitter and love. Belle Belle waved until the sparkles faded into the stars. She whispered, \"Thank you for being my magical friend.\"", drawingPrompt: "Draw Twinkle flying away into the starry sky with a glittery trail while Belle Belle waves goodbye" },
          { pageNumber: 14, text: "Back in Starwhirl, Twinkle placed the bracelet on her cloud shelf and smiled. She told every unicorn about Belle Belle, Earth, and popsicles. But most of all, she talked about what it means to find a true friend.", drawingPrompt: "Draw Twinkle in Starwhirl showing the bracelet to other unicorns and sharing her story" },
          { pageNumber: 15, text: "Every night, Belle Belle looks up at the stars and finds the brightest one. She blows a kiss and says, \"Goodnight, Twinkle.\" And far above, a rainbow spark glows back just for her.", drawingPrompt: "Draw Belle Belle looking up at the night sky, blowing a kiss to the brightest star that sparkles back at her" },
        ],
        ageGroup: "Ages 4-10",
        category: "Fantasy",
      }
    ];
  },
});

export const publishStory = mutation({
  args: {
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const story = await ctx.db.get(args.storyId);
    if (!story || story.authorId !== userId) {
      throw new Error("Story not found or not authorized");
    }

    await ctx.db.patch(args.storyId, {
      isPublished: true,
    });
  },
});

export const generatePrintUrl = mutation({
  args: {
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const story = await ctx.db.get(args.storyId);
    if (!story || story.authorId !== userId) {
      throw new Error("Story not found or not authorized");
    }

    return {
      printUrl: `https://print-demo.com/order?story=${story._id}`,
      message: "Demo: Real printing integration coming soon!",
    };
  },
});
