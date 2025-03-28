import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PetrichorChat from './PetrichorChat';

const API_BASE = 'https://ichordotnews.onrender.com';

export default function Home() {
  const [filters, setFilters] = useState([]);
  const [filterInput, setFilterInput] = useState('');
  const [topic, setTopic] = useState('');
  const [forYouNews, setForYouNews] = useState([]);
  const [searchNews, setSearchNews] = useState([]);
  const [modalArticle, setModalArticle] = useState(null);
  const [modalContent, setModalContent] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const forYouPage = useRef(1);
  const searchPage = useRef(1);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const addFilter = () => {
    const trimmed = filterInput.trim();
    if (trimmed && !filters.includes(trimmed)) {
      setFilters(prev => [...prev, trimmed]);
    }
    setFilterInput('');
  };

  const fetchCuratedNews = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/curated`, { filters, page: forYouPage.current });
      setForYouNews(prev => [...prev, ...res.data]);
      forYouPage.current += 1;
    } catch (err) {
      console.error('FYP fetch error:', err);
    }
  };

  const fetchSearchNews = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/search`, { topic, page: searchPage.current });
      setSearchNews(prev => [...prev, ...res.data]);
      searchPage.current += 1;
    } catch (err) {
      console.error('Search fetch error:', err);
    }
  };

  const handleScroll = () => {
    const y = window.scrollY + window.innerHeight;
    const height = document.documentElement.scrollHeight;
    if (y >= height - 300) {
      if (topic) fetchSearchNews();
      if (filters.length >= 3) fetchCuratedNews();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const extractHook = (summary) => summary.split('\n')[1] || '';
  const extractBody = (summary) => summary.split('\n').slice(2).join('\n');

  const handleExpand = async (article) => {
    try {
      const full = await axios.post(`${API_BASE}/api/news/expand`, { content: article.summary });
      const img = await axios.post(`${API_BASE}/api/news/image`, { prompt: article.title });
      setModalArticle(article);
      setModalContent(full.data.full);
      setModalImage(img.data.image_url);
    } catch (err) {
      console.error("Error loading article:", err);
      alert("Error loading article.");
    }
  };

  const renderArticle = (article, idx) => (
    <div
      key={idx}
      className="h-screen flex flex-col justify-center items-center px-6 py-10 border-b dark:border-gray-800 snap-start"
    >
      <div className="max-w-2xl w-full space-y-6">
        <h2 className="text-3xl font-bold">{article.title}</h2>
        <p className="italic text-blue-500">{extractHook(article.summary)}</p>
        <p className="text-md">{extractBody(article.summary)}</p>
        <button
          onClick={() => handleExpand(article)}
          className="text-sm text-blue-600 underline transform transition active:scale-95"
        >
          Expand
        </button>
      </div>
    </div>
  );

  const handleGenerateClick = () => {
    if (filters.length < 3) return alert("Add at least 3 filters");
    setForYouNews([]);
    forYouPage.current = 1;
    fetchCuratedNews();
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans snap-y snap-mandatory overflow-y-scroll">
      <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 shadow z-10">
        <h1 className="text-2xl font-bold">📰 Ichor News</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-sm border px-2 py-1 rounded dark:bg-gray-700 active:scale-95"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* FOR YOU */}
        <div className="border-r px-6 py-4">
          <h2 className="text-xl font-semibold mb-2">🧠 For You</h2>
          <div className="flex gap-2 mb-2">
            <input
              className="border px-2 py-1 rounded text-sm dark:bg-gray-800"
              value={filterInput}
              placeholder="Add filter"
              onChange={e => setFilterInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFilter()}
            />
            <button
              onClick={addFilter}
              className="bg-blue-600 text-white px-3 rounded active:scale-95"
            >
              Add
            </button>
            <button
              onClick={handleGenerateClick}
              className="bg-green-600 text-white px-3 rounded active:scale-95"
            >
              Generate
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.map((f, i) => (
              <span key={i} className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full text-sm">
                {f} <button onClick={() => setFilters(filters.filter(x => x !== f))}>×</button>
              </span>
            ))}
          </div>
          {forYouNews.map(renderArticle)}
        </div>

        {/* SEARCH */}
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-2">🔍 Search</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 border px-2 py-1 rounded dark:bg-gray-800"
              value={topic}
              placeholder="Search..."
              onChange={(e) => {
                setTopic(e.target.value);
                setSearchNews([]);
                searchPage.current = 1;
              }}
            />
            <button
              onClick={() => {
                setSearchNews([]);
                searchPage.current = 1;
                fetchSearchNews();
              }}
              className="bg-blue-600 text-white px-3 rounded active:scale-95"
            >
              Go
            </button>
          </div>
          {searchNews.map(renderArticle)}
        </div>
      </section>

      {/* MODAL */}
      {modalArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setModalArticle(null)}
              className="absolute top-2 right-4 text-red-600 text-xl font-bold"
            >
              ✕
            </button>
            {modalImage && (
              <img src={modalImage} alt="Generated" className="w-full mb-4 rounded" />
            )}
            <h2 className="text-2xl font-bold mb-2">{modalArticle.title}</h2>
            <p className="whitespace-pre-wrap">{modalContent}</p>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 w-full max-w-sm z-50">
        <PetrichorChat isDarkMode={isDarkMode} />
      </div>
    </main>
  );
}
