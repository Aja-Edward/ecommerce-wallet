
import { Mail, Phone, MapPin, ArrowRight, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function ModernFooter() {
  return (
    <footer className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* CTA Section */}
        {/* <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 mb-16 text-center shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <div className="text-indigo-600 text-2xl">💳</div>
              </div>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Your Secure Shopping Experience
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Create your digital wallet today and enjoy seamless, secure transactions with exclusive cashback rewards!
          </p>
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
            Create Wallet Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div> */}

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Contact */}
          <div className="lg:col-span-1">
            <h3 className="text-slate-800 font-bold text-lg mb-6">Contact</h3>
            <div className="space-y-4">
              <a href="tel:602-774-4735" className="flex items-start gap-3 text-slate-600 hover:text-indigo-600 transition-colors group">
                <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Phone className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm">1-800-WALLET-1</span>
              </a>
              <a href="#" className="flex items-start gap-3 text-slate-600 hover:text-indigo-600 transition-colors group">
                <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm">123 Commerce Street Suite 500<br />New York, NY 10013</span>
              </a>
              <a href="mailto:hello@unitedui.com" className="flex items-start gap-3 text-slate-600 hover:text-indigo-600 transition-colors group">
                <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm">support@walletpay.com</span>
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-slate-800 font-bold text-lg mb-6">Products</h3>
            <ul className="space-y-3">
              {['Digital Wallet', 'Payment Cards', 'Money Transfer', 'Merchant Services', 'Mobile App'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors text-sm hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div>
            <h3 className="text-slate-800 font-bold text-lg mb-6">Features</h3>
            <ul className="space-y-3">
              {['Instant Payments', 'Cashback Rewards', 'Security & Privacy', 'Bill Payments', 'Virtual Cards'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors text-sm hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-slate-800 font-bold text-lg mb-6">Resources</h3>
            <ul className="space-y-3">
              {['Help Center', 'API Documentation', 'Security Info', 'Blog & News', 'Partner With Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors text-sm hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-slate-800 font-bold text-lg mb-6">Follow Us</h3>
            <div className="space-y-4">
              {[
                { name: 'Facebook', icon: Facebook },
                { name: 'Instagram', icon: Instagram },
                { name: 'LinkedIn', icon: Linkedin },
                { name: 'Twitter', icon: Twitter }
              ].map(({ name, icon: Icon }) => (
                <a 
                  key={name}
                  href="#" 
                  className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors group"
                >
                  <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-600 transition-colors">
                    <Icon className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm">{name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              © Copyright <a href="/copyright" className="text-indigo-600 hover:underline">TonyWallet</a> All rights reserved. 2025
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="cookies-policy" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}