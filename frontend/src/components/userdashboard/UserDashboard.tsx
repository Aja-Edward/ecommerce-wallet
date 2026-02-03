// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { getProfile, logout } from '../../services/api';
import type { UserProfile } from '../../types/types';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // ─── Fetch profile on mount ─────────────────────────────────────────────────
  // If the token is missing or expired, the backend will reject it and we
  // kick the user back to /signin.

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        // Token invalid or expired — route back to signin
        setError('Session expired. Redirecting...');
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ─── Logout handler ─────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout(); // clears tokens from sessionStorage
    window.location.href = '/signin';
  };

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // ─── Error / redirect state ─────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  // Derive initials from username for the avatar
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Top nav bar ────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo / brand placeholder */}
          <span className="text-lg font-semibold tracking-tight text-white">
            <span className="text-blue-500">/</span>myapp
          </span>

          {/* Right side: avatar + logout */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Greeting header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            {greeting}, <span className="text-blue-400">{user?.username}</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's what's happening today.</p>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Account Status', value: 'Active', accent: 'text-emerald-400' },
            { label: 'Member Since', value: 'Today', accent: 'text-blue-400' },
            { label: 'Last Login', value: 'Just now', accent: 'text-purple-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors duration-200"
            >
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-lg font-semibold ${stat.accent}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile card — spans 1 col */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-5">Profile</h2>

            {/* Avatar large */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 mb-3">
                {initials}
              </div>
              <p className="text-white font-semibold">{user?.username}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>

            {/* Detail rows */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Username</span>
                <span className="text-gray-200 font-medium">{user?.username}</span>
              </div>
              <div className="border-t border-gray-800" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-200 font-medium truncate ml-2">{user?.email}</span>
              </div>
              <div className="border-t border-gray-800" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Role</span>
                <span className="text-blue-400 font-medium">User</span>
              </div>
            </div>
          </div>

          {/* Activity feed — spans 2 cols */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-5">Recent Activity</h2>

            <div className="space-y-4">
              {[
                { action: 'Account created', detail: 'Your account was successfully registered.', time: 'Just now', icon: '✓', color: 'bg-emerald-500' },
                { action: 'Email verified', detail: 'Verification is pending via Supabase.', time: 'Just now', icon: '◎', color: 'bg-yellow-500' },
                { action: 'First login', detail: 'You logged in for the first time.', time: 'Just now', icon: '⇥', color: 'bg-blue-500' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  {/* Icon dot */}
                  <div className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5`}>
                    {item.icon}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 font-medium">{item.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                  </div>
                  {/* Time */}
                  <p className="text-xs text-gray-600 flex-shrink-0">{item.time}</p>
                </div>
              ))}
            </div>

            {/* Placeholder for future activity */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-600 text-sm">More activity will appear here as you use the app.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};