import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StoryDrawing } from "./StoryDrawing";
import { generateStoryWordDoc } from "../utils/wordDocGenerator";
import { toast } from "sonner";

interface StoryPage {
  pageNumber: number;
  text: string;
  drawingPrompt: string;
}

interface PremadeStory {
  _id: string;
  title: string;
  description: string;
  pages: StoryPage[];
  ageGroup: string;
  category: string;
}

export function PremadeStories() {
  const premadeStories = useQuery(api.stories.getPremadeStories) || [];
  const [selectedStory, setSelectedStory] = useState<PremadeStory | null>(null);
  const [downloadingStory, setDownloadingStory] = useState<string | null>(null);

  const handleDownloadWordDoc = async (story: PremadeStory) => {
    setDownloadingStory(story._id);
    try {
      const result = await generateStoryWordDoc(story);
      toast.success(`Downloaded ${result.fileName}! 📄`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download Word document. Please try again.");
    } finally {
      setDownloadingStory(null);
    }
  };

  if (selectedStory) {
    return (
      <StoryDrawing
        story={selectedStory}
        onBack={() => setSelectedStory(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Premade Stories 📖</h2>
        <p className="text-gray-600">Choose a story template and bring it to life with your drawings!</p>
      </div>

      {premadeStories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon!</h3>
          <p className="text-gray-600">We're preparing amazing story templates for you.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Preview cards for upcoming stories */}
            {[
              { title: "The Magic Forest", description: "Adventure through enchanted woods", pages: 8 },
              { title: "Space Explorer", description: "Journey to distant planets", pages: 10 },
              { title: "Underwater Kingdom", description: "Discover ocean mysteries", pages: 12 },
              { title: "Dragon's Quest", description: "Befriend a friendly dragon", pages: 9 },
              { title: "Fairy Garden", description: "Help tiny fairies save their home", pages: 7 },
              { title: "Time Machine", description: "Travel through different eras", pages: 11 },
            ].map((story, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-6 border border-purple-200">
                <div className="text-3xl mb-3">📖</div>
                <h4 className="font-semibold text-gray-800 mb-2">{story.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{story.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    {story.pages} pages
                  </span>
                  <button
                    disabled
                    className="px-3 py-1 bg-gray-200 text-gray-500 rounded text-sm cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premadeStories.map((story) => (
            <div key={story._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{story.title}</h3>
              <p className="text-gray-600 mb-4">{story.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                  {story.pages.length} pages
                </span>
                <span className="text-sm text-gray-500">{story.ageGroup}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStory(story)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  🎨 Start Drawing
                </button>
                <button
                  onClick={() => handleDownloadWordDoc(story)}
                  disabled={downloadingStory === story._id}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingStory === story._id ? "📄..." : "📄"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
