import React, { useState } from 'react';

export default function OmniSearchBar({ onSearch, isSearching }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-2xl">
          🔍
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="2026 Mayıs ayı Hamburg rotası maliyet raporunu getir..."
          className="w-full pl-16 pr-32 py-5 rounded-full border-4 border-white bg-white/50 backdrop-blur-md shadow-lg focus:outline-none focus:ring-4 focus:ring-[#B2E2F2] focus:bg-white transition-all text-[#2F4F4F] text-lg placeholder:text-[#457B9D]/50"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="absolute inset-y-2 right-2 bg-[#7EB2AC] text-white px-8 rounded-full font-bold transition-all hover:bg-[#689B96] disabled:opacity-50"
        >
          {isSearching ? 'Düşünüyor...' : 'Sor'}
        </button>
      </form>
    </div>
  );
}
