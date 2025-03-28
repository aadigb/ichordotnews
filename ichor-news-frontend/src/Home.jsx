import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PetrichorChat from './PetrichorChat';

export default function Home() {
  const [filters, setFilters] = useState([]);
  const [filterInput, setFilterInput] = useState('');
  const [topic, setTopic] = useState('');
  const [forYouNews, setForYouNews] = useState([]);
  const [searchNews, setSearchNews] = useState([]);
  const [modal, setModal] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const API_BASE = 'https://ichordotnews.onrender.com';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const addFilter = () => {
    const trimmed = filterInput.trim();
    if (trimmed && !filters.includes(trimmed)) {
      setFilters([...filters, trimmed]);
      setFilterInput('');
    }
  };

  const fetchCuratedNews = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/curated`, { filters, page: 1 });
      setForYouNews(res.data);
    } catch (err) {
      console.error('Curated fetch error:', err);
    }
  };

  const fetchSearchNews = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/search`, { topic, page: 1 });
      setSearchNews(res.data);
    } catch (err) {
      console.error('Search fetch error:', err);
    }
  };

  const handleExpand = async (article) => {
    try {
      const full = await axios.post(`${API_BASE}/api/news/expand`, { content: article.summary });
      const img = await axios.post(`${API_BASE}/api/news/image`, { prompt: article.title });
      setModal({ article, fullContent: full.data.full, image: img.data.image_url });
    } catch {
      alert("Error loading article.");
    }
  };

  const extractHook = (summary) => summary.split('\n')[1] || '';
  const extractBody = (summary) => summary.split('\n').slice(2).join('\n');

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
      <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 shadow">
        <h1 className="text-2xl font-bold">📰 Ichor News</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-sm border px-2 py-1 rounded dark:bg-gray-700"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* FOR YOU */}
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory border-r px-6">
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2">🧠 For You</h2>
            <div className="flex gap-2 mb-2">
              <input
                className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Add filter"
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFilter()}
              />
              <button onClick={addFilter} className="bg-blue-600 text-white px-3 rounded">
                Add
              </button>
              {filters.length >= 3 && (
                <button
                  onClick={fetchCuratedNews}
                  className="bg-green-600 text-white px-3 rounded"
                >
                  Generate
                </button>
              )}
            </div>
            {filters.map((f, i) => (
              <span key={i} className="text-sm bg-blue-200 px-2 py-1 rounded-full mr-2 dark:bg-blue-800">
                {f} <button onClick={() => setFilters(filters.filter(x => x !== f))}>×</button>
              </span>
            ))}
          </div>
          {forYouNews.map((article, idx) => (
            <div key={idx} className="border p-4 rounded shadow mb-4">
              <h3 className="text-lg font-bold">{article.title}</h3>
              <p className="italic text-blue-500">{extractHook(article.summary)}</p>
              <p className="mt-2">{extractBody(article.summary)}</p>
              <button onClick={() => handleExpand(article)} className="text-blue-600 mt-2">Expand</button>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory px-6">
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2">🔍 Search</h2>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border px-2 py-1 dark:bg-gray-700 dark:text-white"
                placeholder="Search topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button onClick={fetchSearchNews} className="bg-blue-600 text-white px-3 rounded">
                Go
              </button>
            </div>
          </div>
          {searchNews.map((article, idx) => (
            <div key={idx} className="border p-4 rounded shadow mb-4">
              <h3 className="text-lg font-bold">{article.title}</h3>
              <p className="italic text-blue-500">{extractHook(article.summary)}</p>
              <p className="mt-2">{extractBody(article.summary)}</p>
              <button onClick={() => handleExpand(article)} className="text-blue-600 mt-2">Expand</button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-8" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-2xl w-full relative overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {modal.image && <img src={modal.image} alt="Generated" className="w-full mb-4 rounded" />}
            <h2 className="text-2xl font-bold mb-2">{modal.article.title}</h2>
            <p className="whitespace-pre-wrap">{modal.fullContent}</p>
            <button onClick={() => setModal(null)} className="absolute top-2 right-4 text-red-600 font-semibold">✕</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 w-full max-w-sm z-50">
        <PetrichorChat isDarkMode={isDarkMode} />
      </div>
    </main>
  );
}
