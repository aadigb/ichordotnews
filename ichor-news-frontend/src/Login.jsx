import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

const handleSubmit = async () => {
  try {
    const endpoint = isRegistering ? `${API_BASE}/api/register` : `${API_BASE}/api/login`;
    const res = await axios.post(endpoint, { username, password });
    onLogin(res.data.username);  // Will close modal and show main UI
  } catch (err) {
    setError(err.response?.data?.error || 'Something went wrong');
  }
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">{isRegistering ? 'Register' : 'Login'}</h2>
        <input
          className="w-full mb-2 px-3 py-2 border rounded dark:bg-gray-700"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 border rounded dark:bg-gray-700"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <p className="text-center text-sm">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="ml-1 text-blue-500 hover:underline"
          >
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}
