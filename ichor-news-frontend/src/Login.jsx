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
      onLogin(res.data.username);  // Pass username up
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>

      <input
  className="w-full mb-3 px-3 py-2 bg-white border border-gray-300 rounded text-black dark:text-black placeholder-gray-500"
  placeholder="Username"
  value={username}
  onChange={e => setUsername(e.target.value)}
/>

<input
  type="password"
  className="w-full mb-3 px-3 py-2 bg-white border border-gray-300 rounded text-black dark:text-black placeholder-gray-500"
  placeholder="Password"
  value={password}
  onChange={e => setPassword(e.target.value)}
/>


        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>

        <p className="text-sm text-center mt-3">
          {isRegistering ? (
            <>Already have an account?{' '}
              <button className="text-blue-400 hover:underline" onClick={() => { setIsRegistering(false); setError(''); }}>
                Login
              </button>
            </>
          ) : (
            <>No account?{' '}
              <button className="text-blue-400 hover:underline" onClick={() => { setIsRegistering(true); setError(''); }}>
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
