import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";

export const generateCharacterImage = action({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const character = await ctx.runQuery(internal.characters.getCharacterForGeneration, {
      characterId: args.characterId,
    });

    if (!character) {
      throw new Error("Character not found");
    }

    const openai = new OpenAI({
      baseURL: process.env.CONVEX_OPENAI_BASE_URL,
      apiKey: process.env.CONVEX_OPENAI_API_KEY,
    });

    // Create a detailed prompt based on character description and style
    const stylePrompts = {
      cartoon: "cartoon style, animated, colorful, Disney-like",
      photorealistic: "photorealistic, detailed, high quality, professional photography",
      watercolor: "watercolor painting, soft colors, artistic, painted texture",
      "digital-art": "digital art, modern illustration, vibrant colors, clean lines",
      sketch: "pencil sketch, hand-drawn, artistic, black and white or light colors",
    };

    const prompt = `Create a ${stylePrompts[character.style as keyof typeof stylePrompts] || "cartoon style"} image of a character: ${character.description}. The character's name is ${character.name}. Make it suitable for children's storybooks, friendly and engaging.`;

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error("No image generated");
      }

      // Download the image and store it in Convex storage
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      
      const storageId = await ctx.storage.store(imageBlob);

      // Update the character with the generated image
      await ctx.runMutation(internal.characters.updateCharacterImage, {
        characterId: args.characterId,
        transformedImageId: storageId,
      });

      return {
        success: true,
        message: "Character image generated successfully! ✨",
        imageUrl: await ctx.storage.getUrl(storageId),
      };
    } catch (error) {
      console.error("Image generation error:", error);
      return {
        success: false,
        message: "Failed to generate character image. Please try again.",
      };
    }
  },
});
