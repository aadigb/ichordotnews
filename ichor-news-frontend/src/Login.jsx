import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
      <div className="bg-[#161b22] p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isRegistering ? 'Register' : 'Login'}
        </h2>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full mb-3 px-3 py-2 bg-[#0d1117] text-white placeholder-gray-400 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-3 px-3 py-2 bg-[#0d1117] text-white placeholder-gray-400 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-150"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>

        <p className="mt-3 text-sm text-center text-gray-300">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className="text-blue-400 hover:underline"
              >
                Login
              </button>
            </>
          ) : (
            <>
              No account?{' '}
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
                className="text-blue-400 hover:underline"
              >
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
