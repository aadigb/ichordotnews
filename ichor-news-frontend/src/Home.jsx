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
  const [username, setUsername] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', isRegistering: false });
  const [authError, setAuthError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true; // Default to dark
  });

  const forYouRef = useRef();
  const searchRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const cleanLabel = (text) => {
    return text.replace(/^(TITLE|HOOK|SUMMARY):\s*/i, '').trim();
  };

  const addFilter = () => {
    const trimmed = filterInput.trim();
    if (trimmed && !filters.includes(trimmed)) {
      setFilters(prev => [...prev, trimmed]);
    }
    setFilterInput('');
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
      setModalArticle(article);
      setModalContent(full.data.full);
    } catch (err) {
      alert("Error loading article.");
    }
  };

const extractHook = (summary) => {
  const hookLine = summary.split('\n')[1] || '';
  return hookLine.replace(/HOOK:\s*/i, '').replace(/["“”]/g, '').trim();
};

const extractBody = (summary) => {
  const lines = summary.split('\n').slice(2);
  const cleaned = lines.map(line =>
    line.replace(/SUMMARY:\s*/i, '').replace(/HOOK:\s*/i, '').replace(/["“”]/g, '').trim()
  );
  return cleaned.join('\n').trim();
};



  const handleTripleClick = (e) => {
    if (e.detail === 3) {
      setForYouNews([]);
      setSearchNews([]);
    }
  };

  const handleAuth = async () => {
    try {
      const endpoint = loginForm.isRegistering ? '/api/register' : '/api/login';
      const res = await axios.post(`${API_BASE}${endpoint}`, {
        username: loginForm.username,
        password: loginForm.password
      });
      setUsername(res.data.username);
      setShowLogin(false);
      setAuthError('');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Invalid credentials or registration failed.');
    }
  };

  const renderArticle = (article, idx) => (
    <div key={idx} className="snap-start h-screen flex flex-col justify-center items-center px-6 py-8">
      <div className="max-w-xl w-full space-y-6">
        <h2 className="text-3xl font-extrabold">{cleanLabel(article.title)}</h2>
        <p className="italic text-blue-500">{extractHook(article.summary)}</p>
        <p className="text-md leading-relaxed">{extractBody(article.summary)}</p>
        <button onClick={() => handleExpand(article)} className="text-blue-600 hover:underline text-sm mt-2">
          Expand
        </button>
      </div>
    </div>
  );

  if (showLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen transition-colors bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{loginForm.isRegistering ? 'Register' : '🌱 Login'}</h2>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-sm border px-2 py-1 rounded"
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <input
            className="w-full mb-3 px-3 py-2 bg-white border border-gray-300 rounded text-black placeholder-gray-500"
            placeholder="Username"
            value={loginForm.username}
            onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
          />
          <input
            type="password"
            className="w-full mb-3 px-3 py-2 bg-white border border-gray-300 rounded text-black placeholder-gray-500"
            placeholder="Password"
            value={loginForm.password}
            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          {authError && <div className="text-red-400 text-sm mb-2">{authError}</div>}
          <button
            onClick={handleAuth}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          >
            {loginForm.isRegistering ? 'Register' : 'Login'}
          </button>
          <p className="text-sm text-center mt-3">
            {loginForm.isRegistering ? (
              <>Already have an account?{' '}
                <button className="text-blue-400 hover:underline" onClick={() => setLoginForm({ ...loginForm, isRegistering: false })}>
                  Login
                </button>
              </>
            ) : (
              <>No account?{' '}
                <button className="text-blue-400 hover:underline" onClick={() => setLoginForm({ ...loginForm, isRegistering: true })}>
                  Register
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans" onClick={handleTripleClick}>
      <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 shadow">
        <h1 className="text-2xl font-bold">🌱 Ichor News</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">👤 {username}</span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-sm border px-2 py-1 rounded dark:bg-gray-700"
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* FOR YOU */}
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory border-r px-6" ref={forYouRef}>
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
              <button onClick={addFilter} className="bg-blue-600 text-white px-3 rounded">Add</button>
              {filters.length >= 3 && (
                <button onClick={fetchCuratedNews} className="bg-green-600 text-white px-3 rounded">Generate</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((f, i) => (
                <span key={i} className="bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded-full text-sm">
                  {f} <button onClick={() => setFilters(filters.filter(x => x !== f))}>×</button>
                </span>
              ))}
            </div>
          </div>
          {forYouNews.map(renderArticle)}
        </div>

        {/* SEARCH */}
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory px-6" ref={searchRef}>
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2">🔍 Search</h2>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border px-2 py-1 dark:bg-gray-700 dark:text-white"
                placeholder="Search topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button onClick={fetchSearchNews} className="bg-blue-600 text-white px-3 rounded">Go</button>
            </div>
          </div>
          {searchNews.map(renderArticle)}
        </div>
      </div>

      {/* MODAL */}
      {modalArticle && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={() => setModalArticle(null)}
        >
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">{cleanLabel(modalArticle.title)}</h2>
            <p className="whitespace-pre-wrap">{cleanLabel(modalContent)}</p>
            <button
              onClick={() => setModalArticle(null)}
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
