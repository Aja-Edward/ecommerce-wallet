// pages/dashboard/SettingsPage.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type Tab = 'profile' | 'security' | 'notifications' | 'preferences';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [notifications, setNotifications] = useState({
    email_transfers: true,
    email_login: true,
    push_transfers: false,
    push_promotions: false,
    sms_otp: true,
    sms_alerts: false,
  });

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  const toggle = (key: keyof typeof notifications) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile',       label: 'Profile',       icon: '👤' },
    { id: 'security',      label: 'Security',      icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences',   label: 'Preferences',   icon: '🎨' },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar tabs */}
      <div className="w-56 shrink-0">
        <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-3 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5">
        {/* ── Profile ── */}
        {activeTab === 'profile' && (
          <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Profile Information</h3>

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-500/20">
                {initials}
              </div>
              <div>
                <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors">
                  Upload Photo
                </button>
                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Username', value: user?.username ?? '', placeholder: 'johndoe' },
                { label: 'Email Address', value: user?.email ?? '', placeholder: 'you@example.com' },
                { label: 'Phone Number', value: '', placeholder: '+234 800 000 0000' },
                { label: 'Date of Birth', value: '', placeholder: 'DD/MM/YYYY' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-sm text-gray-400 mb-2">{field.label}</label>
                  <input
                    type="text"
                    defaultValue={field.value}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
              />
            </div>
            <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
              Save Changes
            </button>
          </div>
        )}

        {/* ── Security ── */}
        {activeTab === 'security' && (
          <div className="space-y-5">
            <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Change Password</h3>
              {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                <div key={label}>
                  <label className="block text-sm text-gray-400 mb-2">{label}</label>
                  <input
                    type="password"
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              ))}
              <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
                Update Password
              </button>
            </div>

            <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Authenticator App</p>
                  <p className="text-xs text-gray-500 mt-0.5">Use an app like Google Authenticator</p>
                </div>
                <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium rounded-lg transition-colors">
                  Enable
                </button>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>

            {[
              { section: 'Email Notifications', items: [
                { key: 'email_transfers' as const, label: 'Transfer alerts', desc: 'Get notified when you send or receive money' },
                { key: 'email_login' as const, label: 'Login alerts', desc: 'Get notified of new sign-ins to your account' },
              ]},
              { section: 'Push Notifications', items: [
                { key: 'push_transfers' as const, label: 'Transfer updates', desc: 'Real-time push notifications for transactions' },
                { key: 'push_promotions' as const, label: 'Promotions', desc: 'News about products and feature updates' },
              ]},
              { section: 'SMS', items: [
                { key: 'sms_otp' as const, label: 'OTP codes', desc: 'Receive one-time passwords via SMS' },
                { key: 'sms_alerts' as const, label: 'Transaction alerts', desc: 'SMS for every transaction' },
              ]},
            ].map(group => (
              <div key={group.section}>
                <p className="text-sm font-semibold text-gray-300 mb-3">{group.section}</p>
                <div className="space-y-3">
                  {group.items.map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => toggle(item.key)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${notifications[item.key] ? 'bg-emerald-500' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Preferences ── */}
        {activeTab === 'preferences' && (
          <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">App Preferences</h3>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Default Currency</label>
              <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50">
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Language</label>
              <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Yoruba</option>
                <option>Igbo</option>
                <option>Hausa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-3">Theme</label>
              <div className="flex gap-3">
                {['Dark', 'Light', 'System'].map(t => (
                  <button
                    key={t}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${
                      t === 'Dark'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;