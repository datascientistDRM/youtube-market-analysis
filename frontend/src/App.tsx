import React from "react";
import Header from "./components/Header";
import ChatBox from "./components/ChatBox";

const App: React.FC = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex items-start justify-center p-6">
      <div className="w-full max-w-2xl">
        <ChatBox />
      </div>
    </main>
    <footer className="py-4 text-center text-gray-500">
      © {new Date().getFullYear()} DRM Market Analysis
    </footer>
  </div>
);

export default App;
