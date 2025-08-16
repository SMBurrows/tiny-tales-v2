import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const STYLE_OPTIONS = [
  { id: "photorealistic", name: "Photorealistic", description: "Transform into lifelike photos" },
  { id: "cartoon", name: "Cartoon", description: "Fun animated style" },
  { id: "watercolor", name: "Watercolor", description: "Soft painted look" },
  { id: "digital-art", name: "Digital Art", description: "Modern digital illustration" },
  { id: "sketch", name: "Sketch", description: "Pencil drawing style" },
];

export function ImageTransformer() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const transformImage = useMutation(api.images.transformImage);
  const myTransformedImages = useQuery(api.scrapbooks.getUserTransformedImages) || [];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10MB");
        return;
      }
      setSelectedImage(file);
      setTransformedImageUrl(null);
    }
  };

  const handleTransform = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsTransforming(true);
    try {
      // Upload original image
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
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
        setTransformedImageUrl(result.transformedImageUrl);
        toast.success(result.message || "Image transformed successfully! ✨");
      } else {
        toast.error("Failed to transform image. Please try again.");
      }
    } catch (error) {
      console.error("Transform error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Transform Your Art 🎨</h2>
        <p className="text-gray-600">Upload your drawings and watch them come to life!</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setShowLibrary(false)}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              !showLibrary
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🎨 Transform New Image
          </button>
          <button
            onClick={() => setShowLibrary(true)}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              showLibrary
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📚 My Image Library ({myTransformedImages.length})
          </button>
        </div>
      </div>

      {!showLibrary ? (
        <>
          {/* Image Upload */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {selectedImage ? (
                <div className="space-y-4">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="max-w-xs mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-600">{selectedImage.name}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Choose Different Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl">🖼️</div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload Your Drawing</p>
                    <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 10MB</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
                    >
                      Choose Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Style Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Choose Your Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedStyle === style.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h4 className="font-medium text-gray-800">{style.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Transform Button */}
          <div className="text-center">
            <button
              onClick={handleTransform}
              disabled={!selectedImage || isTransforming}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransforming ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Transforming Magic...
                </span>
              ) : (
                "✨ Transform Image"
              )}
            </button>
          </div>

          {/* Result */}
          {transformedImageUrl && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 text-center">Your Transformed Art! 🎉</h3>
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                {selectedImage && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Original</p>
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Original"
                      className="max-w-xs rounded-lg shadow-md"
                    />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Transformed</p>
                  <img
                    src={transformedImageUrl}
                    alt="Transformed"
                    className="max-w-xs rounded-lg shadow-md"
                  />
                </div>
              </div>
              <div className="text-center space-y-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = transformedImageUrl;
                    link.download = 'transformed-image.png';
                    link.click();
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md mr-2"
                >
                  📥 Download Image
                </button>
                <button
                  onClick={() => setShowLibrary(true)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md"
                >
                  📚 View in Library
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Image Library */
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">My Image Library 📚</h3>
            <p className="text-gray-600">All your uploaded and transformed images</p>
          </div>

          {myTransformedImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🖼️</div>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">No Images Yet</h4>
              <p className="text-gray-600 mb-6">Transform your first image to start building your library!</p>
              <button
                onClick={() => setShowLibrary(false)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
              >
                🎨 Transform First Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTransformedImages.map((image, index) => (
                <div key={image._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Before/After Images */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Original</p>
                        <img
                          src={image.originalUrl || ""}
                          alt="Original"
                          className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(image.originalUrl || "", '_blank')}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Transformed</p>
                        <img
                          src={image.transformedUrl || ""}
                          alt="Transformed"
                          className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(image.transformedUrl || "", '_blank')}
                        />
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded capitalize">
                          {image.style}
                        </span>
                        <span className="text-xs text-gray-500">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = image.originalUrl || "";
                            link.download = `original-image-${index + 1}.png`;
                            link.click();
                          }}
                          className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                        >
                          📥 Original
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = image.transformedUrl || "";
                            link.download = `transformed-image-${index + 1}.png`;
                            link.click();
                          }}
                          className="flex-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                        >
                          📥 Transformed
                        </button>
                      </div>

                      {/* View Full Size */}
                      <button
                        onClick={() => {
                          window.open(image.transformedUrl || "", '_blank');
                        }}
                        className="w-full px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        🔍 View Full Size
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {myTransformedImages.length > 0 && (
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Total Images: {myTransformedImages.length} • 
                <button
                  onClick={() => setShowLibrary(false)}
                  className="text-purple-600 hover:text-purple-800 ml-1"
                >
                  Transform More Images
                </button>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
