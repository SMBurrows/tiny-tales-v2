import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { ScrapbookViewer } from "./ScrapbookViewer";
import { ScrapbookEditor } from "./ScrapbookEditor";

const LAYOUT_OPTIONS = [
  { id: "grid", name: "Grid Layout", description: "Organized grid of images" },
  { id: "collage", name: "Collage Style", description: "Artistic scattered layout" },
  { id: "timeline", name: "Timeline", description: "Chronological arrangement" },
  { id: "magazine", name: "Magazine Style", description: "Mixed sizes and layouts" },
];

type ViewMode = "list" | "view" | "edit";

export function ScrapbookCreator() {
  const [scrapbookTitle, setScrapbookTitle] = useState("");
  const [scrapbookDescription, setScrapbookDescription] = useState("");
  const [selectedLayout, setSelectedLayout] = useState("grid");
  const [selectedImages, setSelectedImages] = useState<Id<"_storage">[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedScrapbookId, setSelectedScrapbookId] = useState<Id<"scrapbooks"> | null>(null);

  const transformedImages = useQuery(api.scrapbooks.getUserTransformedImages) || [];
  const myScrapbooks = useQuery(api.scrapbooks.getMyScrapbooks) || [];
  const createScrapbook = useMutation(api.scrapbooks.createScrapbook);
  const generatePrintUrl = useMutation(api.scrapbooks.generateScrapbookPrintUrl);

  const toggleImageSelection = (imageId: Id<"_storage">) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleCreateScrapbook = async () => {
    if (!scrapbookTitle.trim()) {
      toast.error("Please enter a scrapbook title");
      return;
    }

    if (selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsCreating(true);
    try {
      await createScrapbook({
        title: scrapbookTitle,
        description: scrapbookDescription,
        imageIds: selectedImages,
        layout: selectedLayout,
      });

      toast.success("Scrapbook created successfully! 📖");
      
      // Reset form
      setScrapbookTitle("");
      setScrapbookDescription("");
      setSelectedImages([]);
      setShowImageSelector(false);
    } catch (error) {
      console.error("Create scrapbook error:", error);
      toast.error("Failed to create scrapbook. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePrint = async (scrapbookId: Id<"scrapbooks">) => {
    try {
      const result = await generatePrintUrl({ scrapbookId });
      toast.success(result.message);
      window.open(result.printUrl, '_blank');
    } catch (error) {
      toast.error("Failed to generate print URL");
    }
  };

  const handleViewScrapbook = (scrapbookId: Id<"scrapbooks">) => {
    setSelectedScrapbookId(scrapbookId);
    setViewMode("view");
  };

  const handleEditScrapbook = (scrapbookId: Id<"scrapbooks">) => {
    setSelectedScrapbookId(scrapbookId);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedScrapbookId(null);
  };

  const handleSaveEdit = () => {
    setViewMode("view");
  };

  const handleEditFromView = () => {
    setViewMode("edit");
  };

  // Handle different view modes
  if (viewMode === "view" && selectedScrapbookId) {
    return (
      <ScrapbookViewer
        scrapbookId={selectedScrapbookId}
        onBack={handleBackToList}
        onEdit={handleEditFromView}
      />
    );
  }

  if (viewMode === "edit" && selectedScrapbookId) {
    return (
      <ScrapbookEditor
        scrapbookId={selectedScrapbookId}
        onBack={handleBackToList}
        onSave={handleSaveEdit}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Scrapbook 📖</h2>
        <p className="text-gray-600">Turn your transformed art into a beautiful scrapbook!</p>
      </div>

      {/* Create New Scrapbook Button */}
      {!showImageSelector && (
        <div className="text-center">
          <button
            onClick={() => setShowImageSelector(true)}
            disabled={transformedImages.length === 0}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✨ Create New Scrapbook
          </button>
          {transformedImages.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Transform some images first to create a scrapbook!
            </p>
          )}
        </div>
      )}

      {/* Scrapbook Creation Form */}
      {showImageSelector && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Create New Scrapbook</h3>
            <button
              onClick={() => {
                setShowImageSelector(false);
                setSelectedImages([]);
                setScrapbookTitle("");
                setScrapbookDescription("");
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕ Cancel
            </button>
          </div>

          {/* Scrapbook Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scrapbook Title *
              </label>
              <input
                type="text"
                value={scrapbookTitle}
                onChange={(e) => setScrapbookTitle(e.target.value)}
                placeholder="My Art Collection..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Style
              </label>
              <select
                value={selectedLayout}
                onChange={(e) => setSelectedLayout(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {LAYOUT_OPTIONS.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={scrapbookDescription}
              onChange={(e) => setScrapbookDescription(e.target.value)}
              placeholder="Describe your scrapbook..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Image Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-800">
                Select Images ({selectedImages.length} selected)
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedImages(transformedImages.map(img => img.transformedImageId))}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedImages([])}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {transformedImages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎨</div>
                <p className="text-gray-600">No transformed images yet. Go to "Transform Images" to create some art first!</p>
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
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
                      {selectedImages.includes(image.transformedImageId) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs">{image.style}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="text-center">
            <button
              onClick={handleCreateScrapbook}
              disabled={isCreating || selectedImages.length === 0}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Scrapbook...
                </span>
              ) : (
                "📖 Create Scrapbook"
              )}
            </button>
          </div>
        </div>
      )}

      {/* My Scrapbooks */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">My Scrapbooks ({myScrapbooks.length})</h3>
        
        {myScrapbooks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📖</div>
            <p className="text-gray-600">No scrapbooks created yet. Create your first scrapbook above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myScrapbooks.map((scrapbook) => (
              <div key={scrapbook._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">{scrapbook.title}</h4>
                    {scrapbook.description && (
                      <p className="text-gray-600 text-sm mb-3">{scrapbook.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {scrapbook.isPublished ? (
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
                    <span>{scrapbook.imageIds.length} images</span>
                    <span className="capitalize">{scrapbook.layout} layout</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created {new Date(scrapbook.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => handleViewScrapbook(scrapbook._id)}
                      className="flex-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
                    >
                      📖 View
                    </button>
                    <button
                      onClick={() => handleEditScrapbook(scrapbook._id)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handlePrint(scrapbook._id)}
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
    </div>
  );
}
