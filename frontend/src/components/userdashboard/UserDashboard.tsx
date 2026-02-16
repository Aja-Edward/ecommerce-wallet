// // Dashboard.tsx
// import React, { useState, useEffect } from 'react';
// import { getProfile, logout } from '../../services/api';
// import type { UserProfile } from '../../types/types';

// export const Dashboard: React.FC = () => {
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');

//   // ─── Fetch profile on mount ─────────────────────────────────────────────────
//   // If the token is missing or expired, the backend will reject it and we
//   // kick the user back to /signin.

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const profile = await getProfile();
//         setUser(profile);
//       } catch (err) {
//         // Token invalid or expired — route back to signin
//         setError('Session expired. Redirecting...');
//         setTimeout(() => {
//           window.location.href = '/signin';
//         }, 1500);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   // ─── Logout handler ─────────────────────────────────────────────────────────

//   const handleLogout = () => {
//     logout(); // clears tokens from sessionStorage
//     window.location.href = '/signin';
//   };

//   // ─── Loading state ──────────────────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-950 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//           <p className="text-gray-400 text-sm tracking-widest uppercase">Loading</p>
//         </div>
//       </div>
//     );
//   }

//   // ─── Error / redirect state ─────────────────────────────────────────────────

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gray-950 flex items-center justify-center">
  //       <p className="text-red-400 text-sm">{error}</p>
  //     </div>
  //   );
  // }

//   // ─── Dashboard ──────────────────────────────────────────────────────────────

//   // Derive initials from username for the avatar
//   const initials = user?.username
//     ? user.username.slice(0, 2).toUpperCase()
//     : '??';

//   // Greeting based on time of day
//   const hour = new Date().getHours();
//   const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

//       {/* ── Top nav bar ────────────────────────────────────────────────────── */}
//       <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
//         <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
//           {/* Logo / brand placeholder */}
//           <span className="text-lg font-semibold tracking-tight text-white">
//             <span className="text-blue-500">/</span>myapp
//           </span>

//           {/* Right side: avatar + logout */}
//           <div className="flex items-center gap-4">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
//               {initials}
//             </div>
//             <button
//               onClick={handleLogout}
//               className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* ── Main content ────────────────────────────────────────────────────── */}
//       <main className="max-w-6xl mx-auto px-6 py-10">

//         {/* Greeting header */}
//         <div className="mb-10">
//           <h1 className="text-3xl font-bold text-white">
//             {greeting}, <span className="text-blue-400">{user?.username}</span>
//           </h1>
//           <p className="text-gray-500 mt-1 text-sm">Here's what's happening today.</p>
//         </div>

//         {/* ── Stats row ─────────────────────────────────────────────────────── */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
//           {[
//             { label: 'Account Status', value: 'Active', accent: 'text-emerald-400' },
//             { label: 'Member Since', value: 'Today', accent: 'text-blue-400' },
//             { label: 'Last Login', value: 'Just now', accent: 'text-purple-400' },
//           ].map((stat) => (
//             <div
//               key={stat.label}
//               className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors duration-200"
//             >
//               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
//               <p className={`text-lg font-semibold ${stat.accent}`}>{stat.value}</p>
//             </div>
//           ))}
//         </div>

//         {/* ── Two-column layout ─────────────────────────────────────────────── */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* Profile card — spans 1 col */}
//           <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//             <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-5">Profile</h2>

//             {/* Avatar large */}
//             <div className="flex flex-col items-center text-center mb-6">
//               <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 mb-3">
//                 {initials}
//               </div>
//               <p className="text-white font-semibold">{user?.username}</p>
//               <p className="text-gray-500 text-sm">{user?.email}</p>
//             </div>

//             {/* Detail rows */}
//             <div className="space-y-3">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">Username</span>
//                 <span className="text-gray-200 font-medium">{user?.username}</span>
//               </div>
//               <div className="border-t border-gray-800" />
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">Email</span>
//                 <span className="text-gray-200 font-medium truncate ml-2">{user?.email}</span>
//               </div>
//               <div className="border-t border-gray-800" />
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">Role</span>
//                 <span className="text-blue-400 font-medium">User</span>
//               </div>
//             </div>
//           </div>

//           {/* Activity feed — spans 2 cols */}
//           <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
//             <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-5">Recent Activity</h2>

//             <div className="space-y-4">
//               {[
//                 { action: 'Account created', detail: 'Your account was successfully registered.', time: 'Just now', icon: '✓', color: 'bg-emerald-500' },
//                 { action: 'Email verified', detail: 'Verification is pending via Supabase.', time: 'Just now', icon: '◎', color: 'bg-yellow-500' },
//                 { action: 'First login', detail: 'You logged in for the first time.', time: 'Just now', icon: '⇥', color: 'bg-blue-500' },
//               ].map((item, i) => (
//                 <div key={i} className="flex gap-4 items-start">
//                   {/* Icon dot */}
//                   <div className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5`}>
//                     {item.icon}
//                   </div>
//                   {/* Text */}
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm text-gray-200 font-medium">{item.action}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
//                   </div>
//                   {/* Time */}
//                   <p className="text-xs text-gray-600 flex-shrink-0">{item.time}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Placeholder for future activity */}
//             <div className="mt-8 pt-6 border-t border-gray-800 text-center">
//               <p className="text-gray-600 text-sm">More activity will appear here as you use the app.</p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// import React from 'react'
// import { useAuth } from '../../context/AuthContext';



// const Dashboard = () => {
//   const {user, isAuthenticated, isLoading, logout} = useAuth();

//   if(isLoading){
//     return(<div>Loading...</div>)
//   }

//   if(!isAuthenticated){
//     alert('You are not authenticated. Redirecting to sign in page.');
//     window.location.href = '/signin';
//     return null;
//   }
  

//   const handleLogout = () =>{
//     logout();
//     window.location.href = '/signin';
//   }
// const initials = user?.username
//     ? user.username.slice(0, 2).toUpperCase()
//     : '??';


//   // Greeting based on time of day
//   const hour = new Date().getHours();
//   const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

//       {/* ── Top nav bar ────────────────────────────────────────────────────── */}
//       <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
//         <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
//           {/* Logo / brand placeholder */}
//           <span className="text-lg font-semibold tracking-tight text-white">
//             <span className="text-blue-500">/</span>
//           </span>

//           {/* Right side: avatar + logout */}
//           <div className="flex items-center gap-4">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
//               {initials}
//             </div>
//             <button
//               onClick={handleLogout}
//               className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* ── Main content ────────────────────────────────────────────────────── */}
//       <main className="max-w-6xl mx-auto px-6 py-10">

//         {/* Greeting header */}
//         <div className="mb-10">
//           <h1 className="text-3xl font-bold text-white">
//             {greeting}, <span className="text-blue-400">{user?.username}</span>
//           </h1>
//           <p className="text-gray-500 mt-1 text-sm">Here's what's happening today.</p>
//         </div>

//         {/* ── Stats row ─────────────────────────────────────────────────────── */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
//           {[
//             { label: 'Account Status', value: 'Active', accent: 'text-emerald-400' },
//             { label: 'Member Since', value: 'Today', accent: 'text-blue-400' },
//             { label: 'Last Login', value: 'Just now', accent: 'text-purple-400' },
//           ].map((stat) => (
//             <div
//               key={stat.label}
//               className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors duration-200"
//             >
//               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
//               <p className={`text-lg font-semibold ${stat.accent}`}>{stat.value}</p>
//             </div>
//           ))}
//         </div>

//         {/* ── Two-column layout ─────────────────────────────────────────────── */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* Profile card — spans 1 col */}
//           <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//             <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-5">Profile</h2>

//             {/* Avatar large */}
//             <div className="flex flex-col items-center text-center mb-6">
//               <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 mb-3">
//                 {initials}
//               </div>
//               <p className="text-white font-semibold">{user?.username}</p>
//               <p className="text-gray-500 text-sm">{user?.email}</p>
//             </div>

//             {/* Detail rows */}
//             <div className="space-y-3">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">Username</span>
//                 <span className="text-gray-200 font-medium">{user?.username}</span>
//               </div>
//               <div className="border-t border-gray-800" />
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">Email</span>
//                 <span className="text-gray-200 font-medium truncate ml-2">{user?.email}</span>
//               </div>
//               <div className="border-t border-gray-800" />
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">Role</span>
//                 <span className="text-blue-400 font-medium">User</span>
//               </div>
//             </div>
//           </div>

//           {/* Activity feed — spans 2 cols */}
//           <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
//             <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-5">Recent Activity</h2>

//             <div className="space-y-4">
//               {[
//                 { action: 'Account created', detail: 'Your account was successfully registered.', time: 'Just now', icon: '✓', color: 'bg-emerald-500' },
//                 { action: 'Email verified', detail: 'Verification is pending via Supabase.', time: 'Just now', icon: '◎', color: 'bg-yellow-500' },
//                 { action: 'First login', detail: 'You logged in for the first time.', time: 'Just now', icon: '⇥', color: 'bg-blue-500' },
//               ].map((item, i) => (
//                 <div key={i} className="flex gap-4 items-start">
//                   {/* Icon dot */}
//                   <div className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5`}>
//                     {item.icon}
//                   </div>
//                   {/* Text */}
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm text-gray-200 font-medium">{item.action}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
//                   </div>
//                   {/* Time */}
//                   <p className="text-xs text-gray-600 flex-shrink-0">{item.time}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Placeholder for future activity */}
//             <div className="mt-8 pt-6 border-t border-gray-800 text-center">
//               <p className="text-gray-600 text-sm">More activity will appear here as you use the app.</p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('You are not authenticated. Redirecting to sign in page.');
    navigate('/signin') 
   
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  // Static data for demonstration
  const walletBalance = '$24,571.93';
  const totalIncome = '$12,478';
  const totalExpenses = '$8,942';
  const transactions = 1256;
  const activeCards = 3;
  const pendingTasks = 852;

  const recentTransactions = [
    { id: 1, name: 'Spotify', type: 'Subscription', amount: -12.99, date: '2 hours ago', icon: '🎵', status: 'completed' },
    { id: 2, name: 'Salary Deposit', type: 'Income', amount: 4500.00, date: 'Yesterday', icon: '💼', status: 'completed' },
    { id: 3, name: 'Amazon Purchase', type: 'Shopping', amount: -156.42, date: '2 days ago', icon: '🛒', status: 'completed' },
    { id: 4, name: 'Netflix', type: 'Subscription', amount: -15.99, date: '3 days ago', icon: '📺', status: 'pending' },
    { id: 5, name: 'Grocery Store', type: 'Food', amount: -89.23, date: '4 days ago', icon: '🍕', status: 'completed' },
  ];

  const chartData = [
    { month: 'Jan', income: 3200, expense: 2100 },
    { month: 'Feb', income: 3800, expense: 2400 },
    { month: 'Mar', income: 4200, expense: 2800 },
    { month: 'Apr', income: 3600, expense: 2200 },
    { month: 'May', income: 4500, expense: 3100 },
    { month: 'Jun', income: 4800, expense: 2900 },
  ];

  const maxValue = Math.max(...chartData.flatMap(d => [d.income, d.expense]));

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-gray-100" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f1629] border-r border-gray-800/50 flex flex-col z-20">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">dompet</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 py-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-blue-500/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate">Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { icon: '📊', label: 'Dashboard', id: 'overview' },
            { icon: '💳', label: 'My Cards', id: 'cards', count: 3 },
            { icon: '📝', label: 'Invoices', id: 'invoices' },
            { icon: '💱', label: 'Transactions', id: 'transactions' },
            { icon: '💰', label: 'Wallets', id: 'wallets' },
            { icon: '📈', label: 'Analytics', id: 'analytics' },
            { icon: '⚙️', label: 'Settings', id: 'settings' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              {item.count && (
                <span className="px-2 py-0.5 bg-gray-800 rounded-md text-xs text-gray-400">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-800/50 bg-[#0f1629]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="h-full px-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeTab === 'overview' ? 'Dashboard' : activeTab}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.username}!</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Messages */}
              <button className="relative p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <span className="text-xl">💬</span>
              </button>

              {/* Settings */}
              <button className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <span className="text-xl">⚙️</span>
              </button>

              {/* Download Button */}
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                <span>⬇️</span>
                Download Report
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Left Section - Stats & Balance */}
            <div className="col-span-8 space-y-6">
              
              {/* Top Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Total Income */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <p className="text-orange-100 text-sm font-medium mb-1">Total Income</p>
                    <p className="text-white text-3xl font-bold mb-1">{totalIncome}</p>
                    <div className="flex items-center gap-1 text-orange-100 text-xs">
                      <span>↗</span>
                      <span>+12.5% from last month</span>
                    </div>
                  </div>
                </div>

                {/* Total Expenses */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <p className="text-emerald-100 text-sm font-medium mb-1">Total Expenses</p>
                    <p className="text-white text-3xl font-bold mb-1">{totalExpenses}</p>
                    <div className="flex items-center gap-1 text-emerald-100 text-xs">
                      <span>↘</span>
                      <span>-8.2% from last month</span>
                    </div>
                  </div>
                </div>

                {/* Active Cards */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <p className="text-purple-100 text-sm font-medium mb-1">Active Cards</p>
                    <p className="text-white text-3xl font-bold mb-1">{activeCards}</p>
                    <div className="flex items-center gap-1 text-purple-100 text-xs">
                      <span>💳</span>
                      <span>Visa, Mastercard</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Balance Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-2">Total Wallet Balance</p>
                      <p className="text-white text-5xl font-bold tracking-tight">{walletBalance}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <span className="text-white text-lg">💱</span>
                      </button>
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <span className="text-white text-lg">⚙️</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                      Send Money
                    </button>
                    <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors">
                      Receive
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Transfer */}
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Quick Transfer</h3>
                  <button className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  {[
                    { name: 'Sarah', initials: 'SM', color: 'from-pink-500 to-rose-500' },
                    { name: 'John', initials: 'JD', color: 'from-blue-500 to-cyan-500' },
                    { name: 'Emma', initials: 'EW', color: 'from-purple-500 to-pink-500' },
                    { name: 'Mike', initials: 'MJ', color: 'from-orange-500 to-red-500' },
                  ].map((contact) => (
                    <div key={contact.name} className="flex flex-col items-center gap-2 cursor-pointer group">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-semibold ring-2 ring-transparent group-hover:ring-emerald-500 transition-all`}>
                        {contact.initials}
                      </div>
                      <span className="text-xs text-gray-400">{contact.name}</span>
                    </div>
                  ))}
                  <button className="w-14 h-14 rounded-full bg-gray-800/50 hover:bg-gray-800 flex items-center justify-center text-2xl text-gray-400 transition-colors">
                    +
                  </button>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter amount"
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section - Charts & Transactions */}
            <div className="col-span-4 space-y-6">
              
              {/* Card Overview with Donut Chart */}
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Card Overview</h3>
                  <select className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none">
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Yearly</option>
                  </select>
                </div>

                {/* Donut Chart Representation */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-40 h-40">
                    {/* SVG Donut Chart */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#1f2937" strokeWidth="12" />
                      
                      {/* Orange segment (35%) */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="35" 
                        fill="none" 
                        stroke="#f97316" 
                        strokeWidth="12"
                        strokeDasharray="77 220"
                        strokeDashoffset="0"
                        className="transition-all duration-1000"
                      />
                      
                      {/* Blue segment (40%) */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="35" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="12"
                        strokeDasharray="88 220"
                        strokeDashoffset="-77"
                        className="transition-all duration-1000"
                      />
                      
                      {/* Green segment (25%) */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="35" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="12"
                        strokeDasharray="55 220"
                        strokeDashoffset="-165"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold text-white">76%</p>
                      <p className="text-xs text-gray-500">Total Usage</p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-4 w-full mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <div>
                        <p className="text-xs text-gray-500">Shopping</p>
                        <p className="text-sm font-semibold text-white">35%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-xs text-gray-500">Bills</p>
                        <p className="text-sm font-semibold text-white">40%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div>
                        <p className="text-xs text-gray-500">Food</p>
                        <p className="text-sm font-semibold text-white">25%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Chart */}
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Activity</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-gray-400">Income</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-xs text-gray-400">Expense</span>
                      </div>
                    </div>
                  </div>
                  <select className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none">
                    <option>Last 6 months</option>
                    <option>Last 3 months</option>
                    <option>This year</option>
                  </select>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-32">
                  {chartData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center gap-1 h-24">
                        {/* Income bar */}
                        <div 
                          className="w-2 bg-emerald-500 rounded-t transition-all duration-500 hover:bg-emerald-400"
                          style={{ height: `${(data.income / maxValue) * 100}%` }}
                        ></div>
                        {/* Expense bar */}
                        <div 
                          className="w-2 bg-orange-500 rounded-t transition-all duration-500 hover:bg-orange-400"
                          style={{ height: `${(data.expense / maxValue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{data.month}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800/50">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Average Income</p>
                    <p className="text-lg font-bold text-emerald-400">$76,150</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Average Expense</p>
                    <p className="text-lg font-bold text-orange-400">$42,520</p>
                  </div>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <p className="text-cyan-100 text-sm font-medium mb-1">Pending Tasks</p>
                  <p className="text-white text-3xl font-bold mb-1">{pendingTasks}</p>
                  <div className="flex items-center gap-1 text-cyan-100 text-xs">
                    <span>📋</span>
                    <span>Complete today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Overview - Full Width */}
            <div className="col-span-12 bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Transaction Overview</h3>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Download CSV
                  </button>
                  <select className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none">
                    <option>All Time</option>
                    <option>This Month</option>
                    <option>Last Month</option>
                  </select>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-lg">
                              {transaction.icon}
                            </div>
                            <span className="font-medium text-white">{transaction.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-400">{transaction.type}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-400">{transaction.date}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-semibold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800/50 flex items-center justify-between">
                <p className="text-sm text-gray-500">Showing 5 of {transactions} transactions</p>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
                  View All Transactions →
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Cards Tab */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-8 text-center">
                <span className="text-6xl mb-4 block">💳</span>
                <h3 className="text-2xl font-bold text-white mb-2">My Cards</h3>
                <p className="text-gray-400">Manage your payment cards here. This feature is coming soon!</p>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-8 text-center">
                <span className="text-6xl mb-4 block">📝</span>
                <h3 className="text-2xl font-bold text-white mb-2">Invoices</h3>
                <p className="text-gray-400">View and manage your invoices. This feature is coming soon!</p>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-8 text-center">
                <span className="text-6xl mb-4 block">💱</span>
                <h3 className="text-2xl font-bold text-white mb-2">Transactions</h3>
                <p className="text-gray-400">Full transaction history and details. This feature is coming soon!</p>
              </div>
            </div>
          )}

          {/* Wallets Tab */}
          {activeTab === 'wallets' && (
            <div className="space-y-6">
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-8 text-center">
                <span className="text-6xl mb-4 block">💰</span>
                <h3 className="text-2xl font-bold text-white mb-2">Wallets</h3>
                <p className="text-gray-400">Manage multiple wallets and currencies. This feature is coming soon!</p>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-8 text-center">
                <span className="text-6xl mb-4 block">📈</span>
                <h3 className="text-2xl font-bold text-white mb-2">Analytics</h3>
                <p className="text-gray-400">Deep insights and analytics for your finances. This feature is coming soon!</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-8 text-center">
                <span className="text-6xl mb-4 block">⚙️</span>
                <h3 className="text-2xl font-bold text-white mb-2">Settings</h3>
                <p className="text-gray-400">Customize your account settings and preferences. This feature is coming soon!</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;