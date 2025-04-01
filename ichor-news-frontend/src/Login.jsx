import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(true); // Default to dark

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleSubmit = async () => {
    try {
      const endpoint = isRegistering ? '/api/register' : '/api/login';
      const res = await axios.post(endpoint, { username, password });
      onLogin(res.data.username); // Pass user back to parent
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className={`p-6 rounded shadow-lg w-full max-w-sm transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isRegistering ? 'Register' : '🌱 Login'}</h2>
          <button onClick={() => setIsDark(!isDark)} className="text-sm border px-2 py-1 rounded">
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <input
          className={`w-full mb-2 px-3 py-2 border rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          className={`w-full mb-4 px-3 py-2 border rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <button
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          className="text-sm text-blue-500"
        >
          {isRegistering ? 'Already have an account? Login' : 'No account? Register'}
        </button>
      </div>
    </div>
  );
}
