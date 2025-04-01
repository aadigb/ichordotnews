import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'light' ? false : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSubmit = async () => {
    try {
      const endpoint = isRegistering ? '/api/register' : '/api/login';
      const res = await axios.post(endpoint, { username, password });
      onLogin(res.data.username);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-black transition-colors`}>
      <div className={`p-6 rounded shadow-lg w-full max-w-sm bg-white dark:bg-gray-800 transition-colors`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isRegistering ? 'Register' : '🌱 Login'}</h2>
          <button
            onClick={() => setIsDark(!isDark)}
            className="text-sm border px-2 py-1 rounded dark:bg-gray-700"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <input
          className={`w-full mb-2 px-3 py-2 border rounded focus:outline-none transition-colors ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-black border-gray-300'}`}
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          className={`w-full mb-4 px-3 py-2 border rounded focus:outline-none transition-colors ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-black border-gray-300'}`}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2 transition"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>

        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          className="text-sm text-blue-500"
        >
          {isRegistering ? 'Already have an account? Login' : 'No account? Register'}
        </button>
      </div>
    </div>
  );
}
