import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ScrapbookViewerProps {
  scrapbookId: Id<"scrapbooks">;
  onBack: () => void;
  onEdit: () => void;
}

export function ScrapbookViewer({ scrapbookId, onBack, onEdit }: ScrapbookViewerProps) {
  const scrapbook = useQuery(api.scrapbooks.getScrapbook, { scrapbookId });

  if (!scrapbook) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const getLayoutClasses = () => {
    switch (scrapbook.layout) {
      case "grid":
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
      case "collage":
        return "flex flex-wrap gap-4 justify-center";
      case "timeline":
        return "flex flex-col gap-6";
      case "magazine":
        return "grid grid-cols-1 md:grid-cols-2 gap-6";
      default:
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    }
  };

  const getImageClasses = (index: number) => {
    switch (scrapbook.layout) {
      case "collage":
        // Vary sizes for collage effect
        const sizes = ["w-32 h-32", "w-40 h-28", "w-28 h-40", "w-36 h-36"];
        return `${sizes[index % sizes.length]} object-cover rounded-lg shadow-md`;
      case "timeline":
        return "w-full max-w-md mx-auto h-64 object-cover rounded-lg shadow-md";
      case "magazine":
        // Alternate between large and small images
        return index % 3 === 0 
          ? "w-full h-80 object-cover rounded-lg shadow-md col-span-2" 
          : "w-full h-40 object-cover rounded-lg shadow-md";
      default:
        return "w-full h-48 object-cover rounded-lg shadow-md";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Scrapbooks
        </button>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{scrapbook.title}</h1>
          {scrapbook.description && (
            <p className="text-gray-600 mt-1">{scrapbook.description}</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          ✏️ Edit
        </button>
      </div>

      {/* Scrapbook Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            📸 {scrapbook.images.length} images
          </span>
          <span className="flex items-center gap-1">
            🎨 {scrapbook.layout} layout
          </span>
          <span className="flex items-center gap-1">
            📅 Created {new Date(scrapbook.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            {scrapbook.isPublished ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                Published
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                Draft
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Scrapbook Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {scrapbook.images.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Empty Scrapbook</h3>
            <p className="text-gray-600 mb-6">This scrapbook doesn't have any images yet.</p>
            <button
              onClick={onEdit}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              ✏️ Add Images
            </button>
          </div>
        ) : (
          <div className={getLayoutClasses()}>
            {scrapbook.images.map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url || ""}
                  alt={`Scrapbook image ${index + 1}`}
                  className={getImageClasses(index)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium"
                  >
                    🔍 View Full Size
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Layout Preview */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Layout: {scrapbook.layout}</h3>
        <p className="text-blue-700 text-sm">
          {scrapbook.layout === "grid" && "Images arranged in a clean, organized grid pattern."}
          {scrapbook.layout === "collage" && "Images scattered artistically with varying sizes for a creative look."}
          {scrapbook.layout === "timeline" && "Images displayed in a chronological, story-like sequence."}
          {scrapbook.layout === "magazine" && "Mixed layout with alternating large and small images like a magazine spread."}
        </p>
      </div>
    </div>
  );
}
