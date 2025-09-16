import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Shield, 
  Zap, 
  TrendingUp, 
  Smartphone, 
  Globe,
  ArrowRight,
  Play,
  Star,
  Users,
  DollarSign
} from 'lucide-react';

const WalletHero = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [animatedNumbers, setAnimatedNumbers] = useState({
    users: 0,
    transactions: 0,
    saved: 0
  });

  const features = [
    { icon: Shield, text: "Bank-level Security" },
    { icon: Zap, text: "Instant Transactions" },
    { icon: Globe, text: "Global Payments" },
    { icon: TrendingUp, text: "Smart Analytics" }
  ];

  // Animate numbers on mount
  useEffect(() => {
    const animateNumber = (target, key, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        setAnimatedNumbers(prev => ({
          ...prev,
          [key]: Math.floor(start)
        }));
      }, 16);
    };

    animateNumber(2500000, 'users');
    animateNumber(15000000, 'transactions');
    animateNumber(500000, 'saved');
  }, []);

  // Rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Cards */}
        <div className="absolute top-32 right-1/4 animate-float">
          <div className="w-16 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-60 rotate-12"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-float-delayed">
          <div className="w-12 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg opacity-40 -rotate-12"></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span>Rated #1 Digital Wallet 2025</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Your Money,
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Simplified
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Experience the future of digital payments. Send, receive, and manage your money with unparalleled security and lightning-fast speed.
              </p>
            </div>

            {/* Rotating Features */}
            <div className="flex items-center space-x-3 h-12">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                {React.createElement(features[currentFeature].icon, {
                  className: "w-5 h-5 text-blue-400"
                })}
                <span className="text-white font-medium">
                  {features[currentFeature].text}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
              
              <button className="group flex items-center justify-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                <Play className="w-5 h-5 text-blue-400" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {animatedNumbers.users.toLocaleString()}+
                </div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  ${animatedNumbers.transactions.toLocaleString()}M
                </div>
                <div className="text-gray-400 text-sm">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  ${animatedNumbers.saved.toLocaleString()}K
                </div>
                <div className="text-gray-400 text-sm">Avg. Saved</div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Wallet Mockup */}
          <div className="relative">
            {/* Main Wallet Card */}
            <div className="relative mx-auto w-80 h-96 perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl shadow-2xl transform rotate-y-12 hover:rotate-y-6 transition-transform duration-700 border border-white/20 backdrop-blur-sm">
                
                {/* Card Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">PayWallet Pro</div>
                        <div className="text-gray-400 text-sm">Premium Account</div>
                      </div>
                    </div>
                    <div className="text-2xl">💎</div>
                  </div>
                </div>

                {/* Balance Section */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm">Available Balance</div>
                    <div className="text-3xl font-bold text-white">$12,847.92</div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors duration-200">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white rotate-45" />
                      </div>
                      <span className="text-white text-sm">Send</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors duration-200">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white -rotate-45" />
                      </div>
                      <span className="text-white text-sm">Receive</span>
                    </button>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="p-6 pt-0">
                  <div className="text-gray-400 text-sm mb-3">Recent Activity</div>
                  <div className="space-y-2">
                    {[
                      { name: "Amazon", amount: "-$89.99", color: "red" },
                      { name: "Salary", amount: "+$3,200", color: "green" },
                      { name: "Netflix", amount: "-$15.99", color: "red" }
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span className="text-white text-sm">{transaction.name}</span>
                        <span className={`text-sm font-medium ${
                          transaction.color === 'green' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center animate-bounce-slow shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>

            {/* Notification Cards */}
            <div className="absolute top-20 -left-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 max-w-xs animate-slide-in-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-white text-sm">Payment successful</div>
              </div>
            </div>

            <div className="absolute bottom-32 -right-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 max-w-xs animate-slide-in-right">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <div className="text-white text-sm">$250 cashback earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-15px) rotate(-12deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slide-in-left {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-in-right {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out 2s both;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out 3s both;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
        
        .rotate-y-6 {
          transform: rotateY(6deg);
        }
      `}</style>
    </div>
  );
};
export default WalletHero;