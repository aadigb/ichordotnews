import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PetrichorChat from './PetrichorChat';

const API_BASE = 'https://ichordotnews.onrender.com';

export default function Home() {
  const [forYouNews, setForYouNews] = useState([]);
  const [searchNews, setSearchNews] = useState([]);
  const [topic, setTopic] = useState('');
  const [username, setUsername] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', isRegistering: false });
  const [authError, setAuthError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [modalArticle, setModalArticle] = useState(null);
  const [modalContent, setModalContent] = useState('');

  const searchRef = useRef();
  const forYouRef = useRef();

  const date = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    fetchForYouNews();
  }, [isDarkMode]);

  const fetchForYouNews = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/curated`, {
        filters: ['trending'],
        page: 1,
        username
      });
      setForYouNews(res.data);
    } catch (err) {
      console.error("For You fetch error:", err);
    }
  };

  const fetchSearchNews = async (searchTerm = topic) => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/search`, {
        topic: searchTerm,
        page: 1,
        username
      });
      setSearchNews(res.data);
    } catch (err) {
      console.error('Search fetch error:', err);
    }
  };

  const handleExpand = async (article) => {
    try {
      const full = await axios.post(`${API_BASE}/api/news/expand`, {
        content: article.summary
      });
      setModalArticle(article);
      setModalContent(full.data.full);
    } catch {
      alert("Error loading article.");
    }
  };

  const clean = (txt) => txt.replace(/^(TITLE|HOOK|SUMMARY):/gi, '').trim();
  const extractHook = (summary) => {
    const line = summary.split('\n')[1] || '';
    return line.replace(/HOOK:/gi, '').trim();
  };
  const extractBody = (summary) =>
    summary.split('\n').slice(2).join(' ').replace(/SUMMARY:/gi, '').trim();

  const handleAuth = async () => {
    try {
      const endpoint = loginForm.isRegistering ? '/api/register' : '/api/login';
      const res = await axios.post(`${API_BASE}${endpoint}`, loginForm);
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
        {article.image && (
          <img
            src={article.image}
            alt="News"
            className="w-full h-60 object-cover rounded shadow mb-2"
          />
        )}
        <h2 className="text-3xl font-extrabold">{clean(article.title)}</h2>
        <p className="italic text-blue-500">{extractHook(article.summary)}</p>
        <p className="text-md leading-relaxed">{extractBody(article.summary)}</p>
        <button onClick={() => handleExpand(article)} className="text-blue-600 hover:underline text-sm mt-2">
          Expand
        </button>
      </div>
    </div>
  );

  const presetCategories = ['US', 'World', 'Politics', 'Health', 'Entertainment', 'Sports', 'Science'];

  if (showLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{loginForm.isRegistering ? 'Register' : '🌱 Login'}</h2>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-sm border px-2 py-1 rounded">
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <input className="w-full mb-3 px-3 py-2 bg-white text-black border rounded"
            placeholder="Username"
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
          />
          <input className="w-full mb-3 px-3 py-2 bg-white text-black border rounded"
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          {authError && <div className="text-red-400 text-sm mb-2">{authError}</div>}
          <button onClick={handleAuth} className="w-full bg-blue-600 text-white py-2 rounded mb-2">
            {loginForm.isRegistering ? 'Register' : 'Login'}
          </button>
          <p className="text-sm text-center">
            {loginForm.isRegistering ? (
              <>Already have an account? <button className="text-blue-400" onClick={() => setLoginForm({ ...loginForm, isRegistering: false })}>Login</button></>
            ) : (
              <>No account? <button className="text-blue-400" onClick={() => setLoginForm({ ...loginForm, isRegistering: true })}>Register</button></>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
      <header className="relative flex items-center px-6 py-3 bg-white dark:bg-gray-900 shadow">
        <div className="flex gap-4 items-center">
          <h1 className="text-xl font-bold">🌱 Ichor News</h1>
          {presetCategories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setTopic('');
                fetchSearchNews(cat);
              }}
              className="text-sm hover:underline"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 text-sm hidden md:block">
          {date}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <input
            className="border px-2 py-1 w-48 md:w-60 text-sm dark:bg-gray-700 dark:text-white rounded"
            placeholder="Search topic..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
          <button onClick={() => fetchSearchNews()} className="bg-blue-600 text-white px-3 py-1 rounded">Go</button>
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
        {/* For You Section */}
        <div ref={forYouRef} className="h-screen overflow-y-scroll snap-y snap-mandatory px-6">
          <h2 className="text-xl font-semibold py-4">For You</h2>
          {forYouNews.map(renderArticle)}
        </div>

        {/* Search Results */}
        <div ref={searchRef} className="h-screen overflow-y-scroll snap-y snap-mandatory px-6 border-l">
          <h2 className="text-xl font-semibold py-4"></h2>
          {searchNews.map(renderArticle)}
        </div>
      </div>

      {/* Expand Modal */}
      {modalArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center" onClick={() => setModalArticle(null)}>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {modalArticle.image && (
              <img src={modalArticle.image} alt="Expanded" className="w-full h-60 object-cover rounded mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-2">{clean(modalArticle.title)}</h2>
            <p className="whitespace-pre-wrap">{clean(modalContent)}</p>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded" onClick={() => setModalArticle(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 w-full max-w-sm z-50">
        <PetrichorChat isDarkMode={isDarkMode} username={username} onQuizComplete={fetchForYouNews} />
      </div>
    </main>
  );
}
