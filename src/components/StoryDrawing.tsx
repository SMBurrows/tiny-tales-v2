import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { generateStoryWordDoc } from "../utils/wordDocGenerator";

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

interface StoryDrawingProps {
  story: PremadeStory;
  onBack: () => void;
}

interface PageDrawing {
  pageNumber: number;
  imageFile?: File;
  imageUrl?: string;
  transformedImageId?: Id<"_storage">;
}

const STYLE_OPTIONS = [
  { id: "cartoon", name: "Cartoon", description: "Fun animated style" },
  { id: "watercolor", name: "Watercolor", description: "Soft painted look" },
  { id: "digital-art", name: "Digital Art", description: "Modern digital illustration" },
  { id: "sketch", name: "Sketch", description: "Pencil drawing style" },
];

export function StoryDrawing({ story, onBack }: StoryDrawingProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageDrawings, setPageDrawings] = useState<Map<number, PageDrawing>>(new Map());
  const [selectedStyle, setSelectedStyle] = useState("cartoon");
  const [isTransforming, setIsTransforming] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const transformImage = useMutation(api.images.transformImage);
  const createStory = useMutation(api.stories.createStory);

  const currentPage = story.pages[currentPageIndex];
  const currentDrawing = pageDrawings.get(currentPage.pageNumber);
  const totalPages = story.pages.length;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const newDrawing: PageDrawing = {
      pageNumber: currentPage.pageNumber,
      imageFile: file,
      imageUrl,
    };

    setPageDrawings(prev => new Map(prev.set(currentPage.pageNumber, newDrawing)));
    toast.success("Drawing uploaded! 🎨");
  };

  const handleTransformImage = async () => {
    if (!currentDrawing?.imageFile) {
      toast.error("Please upload a drawing first");
      return;
    }

    setIsTransforming(true);
    try {
      // Upload original image
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": currentDrawing.imageFile.type },
        body: currentDrawing.imageFile,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await uploadResult.json();

      // Transform image
      const result = await transformImage({
        originalImageId: storageId,
        style: selectedStyle,
      });

      if (result.success) {
        // Update the drawing with transformed image
        const updatedDrawing: PageDrawing = {
          ...currentDrawing,
          transformedImageId: storageId,
        };
        setPageDrawings(prev => new Map(prev.set(currentPage.pageNumber, updatedDrawing)));
        toast.success("Drawing transformed! ✨");
        setShowStyleSelector(false);
      } else {
        toast.error("Failed to transform image. Please try again.");
      }
    } catch (error) {
      console.error("Transform error:", error);
      toast.error("Failed to transform image. Please try again.");
    } finally {
      setIsTransforming(false);
    }
  };

  const handleDownloadWordDoc = async () => {
    setIsDownloading(true);
    try {
      const result = await generateStoryWordDoc(story);
      toast.success(`Downloaded ${result.fileName}! 📄`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download Word document. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveStory = async () => {
    const drawingsArray = Array.from(pageDrawings.values());
    if (drawingsArray.length === 0) {
      toast.error("Please add at least one drawing before saving");
      return;
    }

    try {
      const storyPages = story.pages.map(page => {
        const drawing = pageDrawings.get(page.pageNumber);
        return {
          pageNumber: page.pageNumber,
          text: page.text,
          originalImageId: drawing?.transformedImageId,
          transformedImageId: drawing?.transformedImageId,
        };
      });

      await createStory({
        title: `My ${story.title}`,
        description: `My illustrated version of ${story.title}`,
        type: "custom",
        pages: storyPages,
      });

      toast.success("Story saved to My Stories! 📚");
      onBack();
    } catch (error) {
      console.error("Save story error:", error);
      toast.error("Failed to save story. Please try again.");
    }
  };

  const nextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex);
  };

  const getPageStatus = (pageNumber: number) => {
    return pageDrawings.has(pageNumber) ? "completed" : "empty";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Stories
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{story.title}</h1>
          <p className="text-gray-600">Page {currentPageIndex + 1} of {totalPages}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadWordDoc}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? "📄 Downloading..." : "📄 Download Word Doc"}
          </button>
          <button
            onClick={handleSaveStory}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            💾 Save Story
          </button>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex justify-center">
        <div className="flex gap-2 bg-gray-100 p-2 rounded-lg">
          {story.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                index === currentPageIndex
                  ? "bg-purple-500 text-white"
                  : getPageStatus(index + 1) === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Story Text */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Story Text</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{currentPage.text}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Drawing Prompt</h3>
            <p className="text-gray-700 leading-relaxed">{currentPage.drawingPrompt}</p>
          </div>
        </div>

        {/* Drawing Area */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Drawing</h3>
            
            {currentDrawing?.imageUrl ? (
              <div className="space-y-4">
                <img
                  src={currentDrawing.imageUrl}
                  alt={`Drawing for page ${currentPage.pageNumber}`}
                  className="w-full h-64 object-contain bg-gray-50 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    📷 Replace Drawing
                  </button>
                  <button
                    onClick={() => setShowStyleSelector(true)}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    ✨ Transform Style
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-gray-600 mb-4">Upload your drawing for this page</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  📷 Upload Drawing
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevPage}
          disabled={currentPageIndex === 0}
          className={`px-6 py-3 rounded-lg transition-all ${
            currentPageIndex === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
        >
          ← Previous Page
        </button>

        <div className="text-sm text-gray-600">
          {Array.from(pageDrawings.keys()).length} of {totalPages} pages completed
        </div>

        <button
          onClick={nextPage}
          disabled={currentPageIndex === totalPages - 1}
          className={`px-6 py-3 rounded-lg transition-all ${
            currentPageIndex === totalPages - 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          Next Page →
        </button>
      </div>

      {/* Style Selector Modal */}
      {showStyleSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Choose Art Style</h3>
            <div className="space-y-3 mb-6">
              {STYLE_OPTIONS.map((style) => (
                <label key={style.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="style"
                    value={style.id}
                    checked={selectedStyle === style.id}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="text-purple-500"
                  />
                  <div>
                    <div className="font-medium">{style.name}</div>
                    <div className="text-sm text-gray-600">{style.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStyleSelector(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransformImage}
                disabled={isTransforming}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isTransforming ? "Transforming..." : "Transform"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
