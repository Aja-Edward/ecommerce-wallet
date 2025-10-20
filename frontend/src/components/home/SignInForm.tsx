// SignInForm.tsx
import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

interface SignInFormState {
  email: string;
  password: string;
}

export const SignInForm: React.FC = () => {
  const [form, setForm] = useState<SignInFormState>({
    email: '', password: ''
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill out all fields');
      return;
    }
    setError('');
    alert('Sign In Successful!');
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8 mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Sign In</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200 text-lg"
        >
          Sign In
        </button>
        <div className="text-sm text-center mt-2">
          New here? <a href="/signup" className="text-blue-500 underline">Create Account</a>
        </div>
      </form>
    </div>
  );
};
