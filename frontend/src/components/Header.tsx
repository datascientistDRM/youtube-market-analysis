import React from "react";

const Header: React.FC = () => (
  <header className="w-full bg-white shadow-sm py-6">
    <div className="max-w-7xl mx-auto px-6 flex items-center">
      <h1 className="text-4xl font-extrabold text-drm-navy">DRM</h1>
      <nav className="ml-auto space-x-6 text-drm-navy">
        <a href="#" className="hover:underline">Home</a>
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Contact</a>
      </nav>
    </div>
  </header>
);

export default Header;
