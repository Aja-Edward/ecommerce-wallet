import React, { useState } from 'react';
import { ChevronDown, User, Wallet, LogOut, Menu, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate()

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowDropdown(false);
  };

  const navItems = [
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
    { name: 'Career', href: '#career' },
    { name: 'Wallet', href: '#wallet' },
     { name: 'Privacy', href: 'privacy' }

  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div onClick={ () => navigate("/") } className="flex-shrink-0 cursor-pointer">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              LOGO
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-800/50 rounded-lg"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={handleLogin}
                  className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-800/50 rounded-lg"
                >
                  Login
                </button>
                <Link to={'/signup'}  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                  Join
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-800/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span>John Doe</span>
                  <ChevronDown 
                    size={16} 
                    className={`transform transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-800 py-2 animate-in fade-in duration-200">
                    <a
                      href="#profile"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </a>
                    <a
                      href="#wallet"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <Wallet size={16} />
                      <span>Wallet</span>
                    </a>
                    <hr className="my-2 border-gray-800" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800/50 transition-colors duration-200 w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors duration-200 hover:bg-gray-800/50 rounded-lg"
                >
                  {item.name}
                </a>
              ))}
              
              {!isLoggedIn ? (
                <div className="pt-4 space-y-2">
                  <button
                    onClick={handleLogin}
                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors duration-200 hover:bg-gray-800/50 rounded-lg w-full text-left"
                  >
                    Login
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 text-base font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 w-full">
                    Join
                  </button>
                </div>
              ) : (
                <div className="pt-4 space-y-1 border-t border-gray-800">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-white font-medium">John Doe</span>
                  </div>
                  <a
                    href="#profile"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </a>
                  <a
                    href="#wallet"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
                  >
                    <Wallet size={16} />
                    <span>Wallet</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800/50 rounded-lg transition-colors duration-200 w-full text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};