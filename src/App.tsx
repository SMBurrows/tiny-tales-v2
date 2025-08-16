import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { ImageTransformer } from "./components/ImageTransformer";
import { StoryCreator } from "./components/StoryCreator";
import { PremadeStories } from "./components/PremadeStories";
import { CharacterCreator } from "./components/CharacterCreator";
import { MyStories } from "./components/MyStories";
import { ScrapbookCreator } from "./components/ScrapbookCreator";
import { StoryDrawing } from "./components/StoryDrawing";

type Tab = "transform" | "create" | "premade" | "characters" | "mystories" | "scrapbook";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("transform");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tiny Tales
              </h1>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Authenticated>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {loggedInUser?.name || "Creative Explorer"}! 🎨
          </h2>
          <p className="text-gray-600">Let's create some magical stories together!</p>
        </div>

        <nav className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "transform" as Tab, label: "Transform Images", icon: "🎨" },
              { id: "scrapbook" as Tab, label: "Create Scrapbook", icon: "📖" },
              { id: "create" as Tab, label: "Create Story", icon: "✍️" },
              { id: "premade" as Tab, label: "Premade Stories", icon: "📚" },
              { id: "characters" as Tab, label: "My Characters", icon: "👤" },
              { id: "mystories" as Tab, label: "My Stories", icon: "📝" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === "transform" && <ImageTransformer />}
          {activeTab === "scrapbook" && <ScrapbookCreator />}
          {activeTab === "create" && <StoryCreator />}
          {activeTab === "premade" && <PremadeStories />}
          {activeTab === "characters" && <CharacterCreator />}
          {activeTab === "mystories" && <MyStories />}
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Tiny Tales! 📚✨
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Transform your drawings into magical stories
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">🎨</div>
                <p className="text-sm text-gray-600">Transform drawings into photorealistic art</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">📖</div>
                <p className="text-sm text-gray-600">Create custom storybooks</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">👤</div>
                <p className="text-sm text-gray-600">Design unique characters</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">🖨️</div>
                <p className="text-sm text-gray-600">Print physical books</p>
              </div>
            </div>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
