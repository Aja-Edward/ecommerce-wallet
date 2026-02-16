// // SignUpForm.tsx
// import React, { useState } from 'react';
// import type { ChangeEvent, FormEvent } from 'react';
// import { register, login } from '../../services/api';

// interface SignUpFormState {
//   name: string;
//   email: string;
//   password: string;
// }

// export const SignUpForm: React.FC = () => {
//   const [form, setForm] = useState<SignUpFormState>({
//     name: '', email: '', password: ''
//   });

//   const [error, setError] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!form.name || !form.email || !form.password) {
//       setError('Please fill out all fields');
//       return;
//     }

//     setError('');
//     setLoading(true);

//     try {
//       // 1. Register the user (backend expects: email, password, username)
//       await register({
//         email: form.email,
//         password: form.password,
//         username: form.name,
//       });

//       // 2. Auto-login immediately after successful registration
//       //    This stores the tokens in sessionStorage via setTokens()
//       await login({
//         email: form.email,
//         password: form.password,
//       });

//       window.location.href = '/dashboard';

//     } catch (err) {
//       // err.message is pulled from the backend's error response by request()
//       setError(err instanceof Error ? err.message : 'Sign up failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8 mt-20">
//       <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Sign Up</h2>
//       {error && <p className="text-red-500 text-center">{error}</p>}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Full Name"
//           value={form.name}
//           onChange={handleChange}
//           disabled={loading}
//           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           disabled={loading}
//           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           disabled={loading}
//           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Creating account...' : 'Create Account'}
//         </button>
//         <div className="text-sm text-center mt-2">
//           Already have an account? <a href="/signin" className="text-blue-500 underline">Sign In</a>
//         </div>
//       </form>
//     </div>
//   );
// };


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
  const [focusedField, setFocusedField] = useState<string>('');

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
    <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md mb-16">
        
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">Join Tonnyola</h1>
          <p className="text-gray-600 text-sm">Create your account and start managing your finances</p>
        </div>

        {/* Main Form Card */}
        <div className="relative bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl animate-slideUp">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  disabled={loading}
                  className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                    focusedField === 'name' ? 'border-black' : 'border-gray-200'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  disabled={loading}
                  className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                    focusedField === 'email' ? 'border-black' : 'border-gray-200'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  disabled={loading}
                  className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                    focusedField === 'password' ? 'border-black' : 'border-gray-200'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 ml-1 mt-1.5">Must be at least 8 characters long</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-6 group overflow-hidden"
            >
              <div className="bg-black rounded-xl transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-xl">
                <div className="px-6 py-4 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-white font-semibold text-base">Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white font-semibold text-base">Create Account</span>
                      <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or sign up with</span>
              </div>
            </div>

            {/* Social Sign Up Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:border-black hover:bg-gray-50 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:border-black hover:bg-gray-50 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a 
                  href="/signin" 
                  className="text-black font-semibold hover:underline transition-all duration-200 inline-flex items-center gap-1 group"
                >
                  Sign In
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Terms & Privacy */}
        <p className="text-center text-xs text-gray-500 mt-6 px-4">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-black font-medium hover:underline transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-black font-medium hover:underline transition-colors">Privacy Policy</a>
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};