import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PetrichorChat from './PetrichorChat';

export default function Home() {
  const [filters, setFilters] = useState([]);
  const [filterInput, setFilterInput] = useState('');
  const [topic, setTopic] = useState('');
  const [forYouNews, setForYouNews] = useState([]);
  const [searchNews, setSearchNews] = useState([]);
  const [modalArticle, setModalArticle] = useState(null);
  const [modalContent, setModalContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

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
      const res = await axios.post('/api/news/curated', { filters, page: 1 });
      setForYouNews(res.data);
    } catch (err) {
      console.error('Curated fetch error:', err);
    }
  };

  const fetchSearchNews = async () => {
    try {
      const res = await axios.post('/api/news/search', { topic });
      setSearchNews(res.data);
    } catch (err) {
      console.error('Search fetch error:', err);
    }
  };

  const handleExpand = async (article) => {
    try {
      const full = await axios.post('/api/news/expand', { content: article.summary });
      setModalArticle(article);
      setModalContent(full.data.full);
    } catch (err) {
      alert("Error loading article.");
    }
  };

  const handleTripleClick = (e) => {
    if (e.detail === 3) {
      setForYouNews([]);
      setSearchNews([]);
    }
  };

  const buttonStyle = 'transform transition-transform active:scale-95';

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white" onClick={handleTripleClick}>
      <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold">📰 Ichor News</h1>
        <button
          className={`${buttonStyle} border px-3 py-1 rounded`}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* For You */}
        <div>
          <h2 className="text-xl font-semibold mb-2">🧠 For You</h2>
          <div className="flex gap-2 mb-2">
            <input
              className="border px-2 py-1 rounded dark:bg-gray-800"
              value={filterInput}
              placeholder="Add filter"
              onChange={e => setFilterInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFilter()}
            />
            <button onClick={addFilter} className={`${buttonStyle} bg-blue-600 text-white px-3 rounded`}>
              Add
            </button>
            {filters.length >= 3 && (
              <button onClick={fetchCuratedNews} className={`${buttonStyle} bg-green-600 text-white px-3 rounded`}>
                Generate
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.map((f, i) => (
              <span key={i} className="bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded-full text-sm">
                {f} <button onClick={() => setFilters(filters.filter(x => x !== f))}>×</button>
              </span>
            ))}
          </div>
          {forYouNews.map((article, i) => (
            <div key={i} className="border p-4 rounded shadow mb-4">
              <h3 className="text-lg font-bold">{article.title}</h3>
              <p className="italic text-blue-500">{article.summary.split('\n')[1]}</p>
              <p className="mt-2">{article.summary.split('\n').slice(2).join('\n')}</p>
              <button onClick={() => handleExpand(article)} className={`${buttonStyle} text-blue-600 mt-2`}>Expand</button>
            </div>
          ))}
        </div>

        {/* Search */}
        <div>
          <h2 className="text-xl font-semibold mb-2">🔍 Search</h2>
          <div className="flex gap-2 mb-2">
            <input
              className="border px-2 py-1 rounded flex-1 dark:bg-gray-800"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Search topic..."
            />
            <button onClick={fetchSearchNews} className={`${buttonStyle} bg-blue-600 text-white px-3 rounded`}>
              Go
            </button>
          </div>
          {searchNews.map((article, i) => (
            <div key={i} className="border p-4 rounded shadow mb-4">
              <h3 className="text-lg font-bold">{article.title}</h3>
              <p className="italic text-blue-500">{article.summary.split('\n')[1]}</p>
              <p className="mt-2">{article.summary.split('\n').slice(2).join('\n')}</p>
              <button onClick={() => handleExpand(article)} className={`${buttonStyle} text-blue-600 mt-2`}>Expand</button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setModalArticle(null)}
              className="absolute top-2 right-4 text-red-600 text-xl font-bold"
            >
              ✕
            </button>
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
