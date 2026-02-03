// SignUpForm.tsx
import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { register, login } from '../../services/api';

interface SignUpFormState {
  name: string;
  email: string;
  password: string;
}

export const SignUpForm: React.FC = () => {
  const [form, setForm] = useState<SignUpFormState>({
    name: '', email: '', password: ''
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError('Please fill out all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Register the user (backend expects: email, password, username)
      await register({
        email: form.email,
        password: form.password,
        username: form.name,
      });

      // 2. Auto-login immediately after successful registration
      //    This stores the tokens in sessionStorage via setTokens()
      await login({
        email: form.email,
        password: form.password,
      });

      window.location.href = '/dashboard';

    } catch (err) {
      // err.message is pulled from the backend's error response by request()
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8 mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Sign Up</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <div className="text-sm text-center mt-2">
          Already have an account? <a href="/signin" className="text-blue-500 underline">Sign In</a>
        </div>
      </form>
    </div>
  );
};