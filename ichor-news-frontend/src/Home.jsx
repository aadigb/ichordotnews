import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PetrichorChat from './PetrichorChat';

const API_BASE = 'https://ichordotnews.onrender.com';
const PRESET_TOPICS = ["US", "World", "Politics", "Health", "Entertainment", "Sports", "Science"];

export default function Home() {
  const [topic, setTopic] = useState('');
  const [forYouNews, setForYouNews] = useState([]);
  const [topicNews, setTopicNews] = useState([]);
  const [searchNews, setSearchNews] = useState([]);
  const [modalArticle, setModalArticle] = useState(null);
  const [modalContent, setModalContent] = useState('');
  const [username, setUsername] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', isRegistering: false });
  const [authError, setAuthError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true;
  });
  const [quizJustCompleted, setQuizJustCompleted] = useState(false);

  const feedRef = useRef();
  const topicRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (username) fetchForYou();
  }, [username]);

  const fetchForYou = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/curated`, { filters: ["trending"], page: 1, username });
      setForYouNews(res.data);
    } catch (err) {
      console.error('FYP fetch error:', err);
    }
  };

  const fetchTopicNews = async (selectedTopic) => {
    try {
      const res = await axios.post(`${API_BASE}/api/news/search`, {
        topic: selectedTopic,
        page: 1,
        username
      });
      setTopicNews(res.data);
    } catch (err) {
      console.error('Topic fetch error:', err);
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

  const cleanText = (text) =>
    text.replace(/^(TITLE|HOOK|SUMMARY):/gi, '').trim();

  const extractHook = (summary) =>
    summary.split('\n')[1]?.replace(/HOOK:/gi, '').trim() || '';

  const extractBody = (summary) =>
    summary.split('\n').slice(2).join(' ').replace(/SUMMARY:/gi, '').trim();

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
      setAuthError(err.response?.data?.error || 'Login failed');
    }
  };

  const renderArticle = (article, idx) => (
    <div key={idx} className="snap-start h-screen flex flex-col justify-center items-center px-6 py-8">
      <div className="max-w-xl w-full space-y-6">
        <h2 className="text-3xl font-extrabold">{cleanText(article.title)}</h2>
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm">
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
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
          />
          <input
            type="password"
            className="w-full mb-3 px-3 py-2 bg-white border border-gray-300 rounded text-black placeholder-gray-500"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          {authError && <div className="text-red-400 text-sm mb-2">{authError}</div>}
          <button
            onClick={handleAuth}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
          >
            {loginForm.isRegistering ? 'Register' : 'Login'}
          </button>
          <p className="text-sm text-center mt-3">
            {loginForm.isRegistering ? (
              <>Already have an account? <button className="text-blue-400 hover:underline" onClick={() => setLoginForm({ ...loginForm, isRegistering: false })}>Login</button></>
            ) : (
              <>No account? <button className="text-blue-400 hover:underline" onClick={() => setLoginForm({ ...loginForm, isRegistering: true })}>Register</button></>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
      <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 shadow">
        <h1 className="text-2xl font-bold">🌱 Ichor News</h1>
        <div className="flex gap-4">
          {PRESET_TOPICS.map((t) => (
            <button key={t} onClick={() => fetchTopicNews(t)} className="text-sm hover:underline">
              {t}
            </button>
          ))}
        </div>
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
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory border-r px-6" ref={feedRef}>
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2">🧠 For You</h2>
            {quizJustCompleted && (
              <div className="text-sm text-green-500 mb-4">
                Quiz submitted! Your personalized feed will reflect next time you log in.
              </div>
            )}
          </div>
          {forYouNews.map(renderArticle)}
        </div>

        <div className="h-screen overflow-y-scroll snap-y snap-mandatory px-6" ref={topicRef}>
          <div className="py-4">
            <h2 className="text-xl font-semibold mb-2">🔎 Topic</h2>
          </div>
          {topicNews.map(renderArticle)}
        </div>
      </div>

      {modalArticle && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={() => setModalArticle(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">{cleanText(modalArticle.title)}</h2>
            <p className="whitespace-pre-wrap">{cleanText(modalContent)}</p>
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
        <PetrichorChat
          isDarkMode={isDarkMode}
          username={username}
          onQuizComplete={() => setQuizJustCompleted(true)}
        />
      </div>
    </main>
  );
}
