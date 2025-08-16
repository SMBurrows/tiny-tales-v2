import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

import { Id } from "../../convex/_generated/dataModel";

interface StoryPage {
  pageNumber: number;
  text: string;
  originalImageId?: Id<"_storage">;
  transformedImageId?: Id<"_storage">;
  characterIds?: Id<"characters">[];
}

export function StoryCreator() {
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [pages, setPages] = useState<StoryPage[]>([
    { pageNumber: 1, text: "" }
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const createStory = useMutation(api.stories.createStory);
  const myCharacters = useQuery(api.characters.getMyCharacters) || [];

  const addPage = () => {
    setPages([...pages, { pageNumber: pages.length + 1, text: "" }]);
  };

  const updatePageText = (pageIndex: number, text: string) => {
    const updatedPages = [...pages];
    updatedPages[pageIndex].text = text;
    setPages(updatedPages);
  };

  const removePage = (pageIndex: number) => {
    if (pages.length > 1) {
      const updatedPages = pages.filter((_, index) => index !== pageIndex);
      // Renumber pages
      updatedPages.forEach((page, index) => {
        page.pageNumber = index + 1;
      });
      setPages(updatedPages);
    }
  };

  const handleCreateStory = async () => {
    if (!storyTitle.trim()) {
      toast.error("Please enter a story title");
      return;
    }

    if (pages.some(page => !page.text.trim())) {
      toast.error("Please fill in all page content");
      return;
    }

    setIsCreating(true);
    try {
      await createStory({
        title: storyTitle,
        description: storyDescription,
        type: "custom",
        pages: pages.map(page => ({
          pageNumber: page.pageNumber,
          text: page.text,
          originalImageId: page.originalImageId,
          transformedImageId: page.transformedImageId,
          characterIds: page.characterIds,
        })),
      });

      toast.success("Story created successfully! 📚");
      
      // Reset form
      setStoryTitle("");
      setStoryDescription("");
      setPages([{ pageNumber: 1, text: "" }]);
    } catch (error) {
      console.error("Create story error:", error);
      toast.error("Failed to create story. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Story ✍️</h2>
        <p className="text-gray-600">Write your own magical tale!</p>
      </div>

      {/* Story Details */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Title *
          </label>
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="Enter your story title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Description
          </label>
          <textarea
            value={storyDescription}
            onChange={(e) => setStoryDescription(e.target.value)}
            placeholder="What's your story about?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pages */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">Story Pages</h3>
          <button
            onClick={addPage}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            + Add Page
          </button>
        </div>

        <div className="space-y-6">
          {pages.map((page, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-800">
                  Page {page.pageNumber}
                </h4>
                {pages.length > 1 && (
                  <button
                    onClick={() => removePage(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Content *
                  </label>
                  <textarea
                    value={page.text}
                    onChange={(e) => updatePageText(index, e.target.value)}
                    placeholder="Write what happens on this page..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-sm text-gray-600 mb-2">Add Drawing</p>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                      Upload Image
                    </button>
                  </div>

                  {myCharacters.length > 0 && (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Add Characters</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {myCharacters.map((character) => (
                          <label key={character._id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">{character.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Button */}
      <div className="text-center">
        <button
          onClick={handleCreateStory}
          disabled={isCreating}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Story...
            </span>
          ) : (
            "📚 Create Story"
          )}
        </button>
      </div>
    </div>
  );
}
