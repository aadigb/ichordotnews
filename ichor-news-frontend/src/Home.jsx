import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PetrichorChat from './PetrichorChat';

export default function Home() {
  const [filters, setFilters] = useState([]);
  const [filterInput, setFilterInput] = useState('');
  const [topic, setTopic] = useState('');
  const [forYouNews, setForYouNews] = useState([]);
  const [searchNews, setSearchNews] = useState([]);
  const [forYouPage, setForYouPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [modal, setModal] = useState(null);

  const forYouRef = useRef();
  const searchRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (topic) fetchSearchNews(searchPage);
  }, [searchPage]);

  const fetchCuratedNews = async (page = 1) => {
    try {
      const res = await axios.post('/api/news/curated', { filters, page });
      setForYouNews((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error('FYP fetch error:', err);
    }
  };

  const fetchSearchNews = async (page = 1) => {
    try {
      const res = await axios.post('/api/news/search', { topic, page });
      console.log("Search results:", res.data);
      setSearchNews(prev => [...prev, ...res.data]);
    } catch (err) {
      console.error('Search fetch error:', err);
    }
  };

  const handleScroll = (ref, callback) => {
    if (!ref.current) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    if (scrollTop + clientHeight >= scrollHeight - 200) callback();
  };

  const extractHook = (summary) => summary.split('\n')[1] || '';
  const extractBody = (summary) => summary.split('\n').slice(2).join('\n');

  const handleArticleClick = async (article) => {
    try {
      const full = await axios.post('/api/news/expand', { content: article.summary });
      const img = await axios.post('/api/news/image', { prompt: article.title });
      setModal({ article, fullContent: full.data.full, image: img.data.image_url });
    } catch {
      alert("Error loading article.");
    }
  };

  const renderArticle = (article, idx) => (
    <div
      key={idx}
      className="snap-start h-screen flex flex-col justify-center items-center px-6 py-8 cursor-pointer"
      onDoubleClick={() => handleArticleClick(article)}
    >
      <div className="max-w-xl w-full space-y-6">
        <h2 className="text-3xl font-extrabold">{article.title}</h2>
        <p className="italic text-lg text-blue-500">{extractHook(article.summary)}</p>
        <p className="text-md leading-relaxed">{extractBody(article.summary)}</p>
      </div>
    </div>
  );

  const handleGenerateClick = () => {
    setForYouNews([]);
    setForYouPage(1);
    if (filters.length >= 3) fetchCuratedNews(1);
    else alert("Please enter at least 3 filters.");
  };

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
        <div
          className="h-screen overflow-y-scroll snap-y snap-mandatory border-r px-6"
          ref={forYouRef}
          onScroll={() => handleScroll(forYouRef, () => setForYouPage((p) => p + 1))}
        >
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2">🧠 For You</h2>
            <div className="flex gap-2 mb-2">
              <input
                className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Add filter"
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setFilters([...filters, filterInput])}
              />
              <button onClick={() => setFilters([...filters, filterInput])} className="bg-blue-600 text-white px-3 rounded">
                Add
              </button>
              <button
                onClick={handleGenerateClick}
                className="bg-green-600 text-white px-3 rounded"
              >
                Generate
              </button>
            </div>
            {filters.map((f, i) => (
              <span key={i} className="text-sm bg-blue-200 px-2 py-1 rounded-full mr-2 dark:bg-blue-800">
                {f} <button onClick={() => setFilters(filters.filter((x) => x !== f))}>×</button>
              </span>
            ))}
          </div>
          {forYouNews.map(renderArticle)}
        </div>

        {/* SEARCH */}
        <div
          className="h-screen overflow-y-scroll snap-y snap-mandatory px-6"
          ref={searchRef}
          onScroll={() => handleScroll(searchRef, () => setSearchPage((p) => p + 1))}
        >
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2">🔍 Search</h2>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border px-2 py-1 dark:bg-gray-700 dark:text-white"
                placeholder="Search topic..."
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setSearchNews([]); setSearchPage(1);
                }}
              />
              <button
                onClick={() => {
                  setSearchPage(1);
                  fetchSearchNews(1);
                }}
                className="bg-blue-600 text-white px-3 rounded"
              >
                Go
              </button>
            </div>
          </div>
          {searchNews.map(renderArticle)}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          onClick={() => setModal(null)}
        >
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {modal.image && <img src={modal.image} alt="Generated" className="w-full mb-4 rounded" />}
            <h2 className="text-2xl font-bold mb-2">{modal.article.title}</h2>
            <p className="whitespace-pre-wrap">{modal.fullContent}</p>
            <button
              onClick={() => setModal(null)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 w-full max-w-sm z-50">
        <PetrichorChat isDarkMode={isDarkMode} />
      </div>
    </main>
  );
}
