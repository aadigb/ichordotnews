import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PetrichorChat from './PetrichorChat';

const API_BASE = 'https://ichordotnews.onrender.com';

export default function Home() {
  const [forYouNews, setForYouNews] = useState([]);
  const [searchNews, setSearchNews] = useState([]);
  const [topic, setTopic] = useState('');
  const [username, setUsername] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', isRegistering: false });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (username) {
      fetchTrendingNews();
    }
  }, [username]);

  const fetchTrendingNews = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/curated`, {
        filters: ['breaking', 'top headlines', 'trending'],
        page: 1,
        username
      });
      setForYouNews(res.data);
    } catch (err) {
      console.error('Trending fetch error:', err);
    }
  };

  const fetchSearchNews = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/search`, { topic, page: 1, username });
      setSearchNews(res.data);
    } catch (err) {
      console.error('Search fetch error:', err);
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
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  const renderArticle = (article, idx) => {
    const lines = article.summary.split('\n').map(line => line.replace(/^(TITLE|HOOK|SUMMARY):/i, '').trim());
    const hook = lines[1] || '';
    const body = lines.slice(2).join(' ');

    return (
      <div key={idx} className="snap-start h-screen flex flex-col justify-center items-center px-6 py-8">
        <div className="max-w-xl w-full space-y-6">
          <h2 className="text-3xl font-extrabold">{article.title.replace(/^TITLE:/i, '').trim()}</h2>
          <p className="italic text-blue-500">{hook}</p>
          <p className="text-md leading-relaxed">{body}</p>
        </div>
      </div>
    );
  };

  if (showLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{loginForm.isRegistering ? 'Register' : 'Login'}</h2>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-sm border px-2 py-1 rounded">
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <input
            className="w-full mb-3 px-3 py-2 bg-white border border-gray-300 rounded text-black"
            placeholder="Username"
            value={loginForm.username}
            onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
          />
          <input
            type="password"
            className="w-full mb-3 px-3 py-2 bg-white border border-gray-300 rounded text-black"
            placeholder="Password"
            value={loginForm.password}
            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          {authError && <div className="text-red-400 text-sm mb-2">{authError}</div>}
          <button onClick={handleAuth} className="w-full bg-blue-600 text-white py-2 rounded">
            {loginForm.isRegistering ? 'Register' : 'Login'}
          </button>
          <p className="text-sm text-center mt-3">
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
      <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 shadow">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">🌱 Ichor News</h1>
          {['US', 'World', 'Politics', 'Health', 'Entertainment', 'Sports', 'Science'].map(cat => (
            <button key={cat} onClick={() => setTopic(cat)} className="text-sm hover:underline">{cat}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="px-2 py-1 border dark:bg-gray-800 dark:text-white text-sm rounded"
            placeholder="Search topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button onClick={fetchSearchNews} className="bg-blue-600 text-white px-3 rounded text-sm">Go</button>
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
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory border-r px-6">
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-4">For You</h2>
            {forYouNews.map(renderArticle)}
          </div>
        </div>

        <div className="h-screen overflow-y-scroll snap-y snap-mandatory px-6">
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-4"></h2>
            {searchNews.map(renderArticle)}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 w-full max-w-sm z-50">
        <PetrichorChat isDarkMode={isDarkMode} username={username} onQuizComplete={fetchTrendingNews} />
      </div>
    </main>
  );
}
