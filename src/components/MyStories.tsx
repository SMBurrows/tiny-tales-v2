import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function MyStories() {
  const myStories = useQuery(api.stories.getMyStories) || [];
  const generatePrintUrl = useMutation(api.stories.generatePrintUrl);

  const handlePrint = async (storyId: Id<"stories">) => {
    try {
      const result = await generatePrintUrl({ storyId });
      toast.success(result.message);
      // In real app, would redirect to print service
      window.open(result.printUrl, '_blank');
    } catch (error) {
      toast.error("Failed to generate print URL");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Stories 📚</h2>
        <p className="text-gray-600">View and manage your created stories</p>
      </div>

      {myStories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Stories Yet</h3>
          <p className="text-gray-600 mb-6">Start creating your first magical story!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md">
              ✍️ Create New Story
            </button>
            <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              📖 Browse Premade Stories
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myStories.map((story) => (
            <div key={story._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{story.title}</h3>
                  {story.description && (
                    <p className="text-gray-600 text-sm mb-3">{story.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {story.isPublished ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{story.pages.length} pages</span>
                  <span>{story.type === "custom" ? "Custom" : "Premade"}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(story.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 pt-3">
                  <button className="flex-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm">
                    📖 View
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handlePrint(story._id)}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
