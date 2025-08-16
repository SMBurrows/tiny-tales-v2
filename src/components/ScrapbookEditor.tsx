import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ScrapbookEditorProps {
  scrapbookId: Id<"scrapbooks">;
  onBack: () => void;
  onSave: () => void;
}

const LAYOUT_OPTIONS = [
  { id: "grid", name: "Grid Layout", description: "Organized grid of images" },
  { id: "collage", name: "Collage Style", description: "Artistic scattered layout" },
  { id: "timeline", name: "Timeline", description: "Chronological arrangement" },
  { id: "magazine", name: "Magazine Style", description: "Mixed sizes and layouts" },
];

export function ScrapbookEditor({ scrapbookId, onBack, onSave }: ScrapbookEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLayout, setSelectedLayout] = useState("grid");
  const [selectedImages, setSelectedImages] = useState<Id<"_storage">[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const scrapbook = useQuery(api.scrapbooks.getScrapbook, { scrapbookId });
  const transformedImages = useQuery(api.scrapbooks.getUserTransformedImages) || [];
  const updateScrapbook = useMutation(api.scrapbooks.updateScrapbook);

  // Initialize form with existing scrapbook data
  useEffect(() => {
    if (scrapbook) {
      setTitle(scrapbook.title);
      setDescription(scrapbook.description || "");
      setSelectedLayout(scrapbook.layout);
      setSelectedImages(scrapbook.imageIds);
    }
  }, [scrapbook]);

  const toggleImageSelection = (imageId: Id<"_storage">) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleUpdateScrapbook = async () => {
    if (!title.trim()) {
      toast.error("Please enter a scrapbook title");
      return;
    }

    if (selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsUpdating(true);
    try {
      await updateScrapbook({
        scrapbookId,
        title: title.trim(),
        description: description.trim(),
        imageIds: selectedImages,
        layout: selectedLayout,
      });

      toast.success("Scrapbook updated successfully! 📖");
      onSave();
    } catch (error) {
      console.error("Update scrapbook error:", error);
      toast.error("Failed to update scrapbook. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!scrapbook) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to View
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Scrapbook</h1>
        <button
          onClick={handleUpdateScrapbook}
          disabled={isUpdating || selectedImages.length === 0}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "💾 Saving..." : "💾 Save Changes"}
        </button>
      </div>

      {/* Edit Form */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        {/* Title and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scrapbook Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter scrapbook title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Layout Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Layout Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LAYOUT_OPTIONS.map((layout) => (
              <label key={layout.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="layout"
                  value={layout.id}
                  checked={selectedLayout === layout.id}
                  onChange={(e) => setSelectedLayout(e.target.value)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg transition-all ${
                  selectedLayout === layout.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                  <div className="font-medium text-sm">{layout.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{layout.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Image Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Images ({selectedImages.length} selected)
          </label>
          
          {transformedImages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎨</div>
              <p className="text-gray-600">No transformed images available. Go to "Transform Images" to create some art first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {transformedImages.map((image) => (
                <div
                  key={image._id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImages.includes(image.transformedImageId)
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleImageSelection(image.transformedImageId)}
                >
                  <img
                    src={image.transformedUrl || ""}
                    alt="Transformed art"
                    className="w-full h-32 object-cover"
                  />
                  {selectedImages.includes(image.transformedImageId) && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        {selectedImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preview ({selectedLayout} layout)
            </label>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className={`${
                selectedLayout === "grid" ? "grid grid-cols-3 gap-2" :
                selectedLayout === "collage" ? "flex flex-wrap gap-2" :
                selectedLayout === "timeline" ? "flex flex-col gap-2" :
                "grid grid-cols-2 gap-2"
              }`}>
                {selectedImages.slice(0, 6).map((imageId, index) => {
                  const image = transformedImages.find(img => img.transformedImageId === imageId);
                  return (
                    <div key={imageId} className="relative">
                      <img
                        src={image?.transformedUrl || ""}
                        alt={`Preview ${index + 1}`}
                        className={`${
                          selectedLayout === "collage" ? "w-16 h-16" :
                          selectedLayout === "timeline" ? "w-full h-20" :
                          "w-full h-16"
                        } object-cover rounded`}
                      />
                    </div>
                  );
                })}
                {selectedImages.length > 6 && (
                  <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center text-gray-600 text-sm">
                    +{selectedImages.length - 6} more
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
