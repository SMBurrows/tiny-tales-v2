import { useState, useRef } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function CharacterCreator() {
  const [characterName, setCharacterName] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("cartoon");
  const [isCreating, setIsCreating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myCharacters = useQuery(api.characters.getMyCharacters) || [];
  const createCharacter = useMutation(api.characters.createCharacter);
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const generateCharacterImage = useAction(api.aiGeneration.generateCharacterImage);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleCreateCharacter = async () => {
    if (!characterName.trim()) {
      toast.error("Please enter a character name");
      return;
    }

    if (!characterDescription.trim()) {
      toast.error("Please enter a character description");
      return;
    }

    setIsCreating(true);
    try {
      let originalImageId = undefined;

      if (selectedImage) {
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
        originalImageId = storageId;
      }

      const characterId = await createCharacter({
        name: characterName,
        description: characterDescription,
        originalImageId,
        style: selectedStyle,
      });

      toast.success("Character created successfully! 👤");
      
      // Reset form
      setCharacterName("");
      setCharacterDescription("");
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Auto-generate AI image if no image was uploaded
      if (!originalImageId) {
        handleGenerateImage(characterId);
      }
    } catch (error) {
      console.error("Create character error:", error);
      toast.error("Failed to create character. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateImage = async (characterId: Id<"characters">) => {
    setGeneratingImages(prev => new Set(prev).add(characterId));
    
    try {
      const result = await generateCharacterImage({ characterId });
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Generate image error:", error);
      toast.error("Failed to generate character image. Please try again.");
    } finally {
      setGeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(characterId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Characters 👤</h2>
        <p className="text-gray-600">Create unique characters with AI-generated images!</p>
      </div>

      {/* Character Creation Form */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Create New Character</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Name *
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter character name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Description *
              </label>
              <textarea
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value)}
                placeholder="Describe your character in detail for AI generation..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Be descriptive! Include appearance, clothing, personality traits for better AI generation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Art Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="cartoon">Cartoon</option>
                <option value="photorealistic">Photorealistic</option>
                <option value="watercolor">Watercolor</option>
                <option value="digital-art">Digital Art</option>
                <option value="sketch">Sketch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
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
                    alt="Character"
                    className="max-w-32 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-600">{selectedImage.name}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-4xl">🤖</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Upload Image or Use AI Generation</p>
                    <p className="text-xs text-gray-500 mb-3">Leave empty to auto-generate with AI!</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Choose Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleCreateCharacter}
            disabled={isCreating}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Character...
              </span>
            ) : (
              "✨ Create Character"
            )}
          </button>
        </div>
      </div>

      {/* My Characters List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">My Characters ({myCharacters.length})</h3>
        
        {myCharacters.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👤</div>
            <p className="text-gray-600">No characters created yet. Create your first character above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCharacters.map((character) => (
              <div key={character._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="mb-4 relative">
                  {character.transformedImageUrl ? (
                    <img
                      src={character.transformedImageUrl}
                      alt={character.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      {generatingImages.has(character._id) ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500">Generating...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-3xl mb-2">👤</div>
                          <button
                            onClick={() => handleGenerateImage(character._id)}
                            className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                          >
                            🤖 Generate AI Image
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">{character.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{character.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    {character.style}
                  </span>
                  {character.transformedImageUrl && (
                    <button
                      onClick={() => handleGenerateImage(character._id)}
                      disabled={generatingImages.has(character._id)}
                      className="text-xs text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50"
                    >
                      🔄 Regenerate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
