import { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import type { SavedContact } from '../../types/wallet.types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded?: () => void;
}

const GRADIENT_COLORS = [
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-indigo-500 to-purple-500',
  'from-rose-500 to-pink-500',
];

const AddContactModal = ({ isOpen, onClose, onContactAdded }: AddContactModalProps) => {
  const { lookupUser, addContact, contacts } = useWallet();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    id: number;
    username: string;
    email: string;
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a username');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await lookupUser(searchQuery.trim());
      
      // Check if already in contacts
      if (contacts.some(c => c.username === result.username)) {
        setSearchError('This user is already in your contacts');
        return;
      }

      setSearchResult(result);
    } catch (err: any) {
      setSearchError(err?.error || 'User not found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = () => {
    if (!searchResult) return;

    // Generate initials and random color
    const initials = searchResult.email
      .split('@')[0]
      .split('.')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const color = GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)];

    const newContact: Omit<SavedContact, 'added_at'> = {
      username: searchResult.username,
      display_name: searchResult.email, // Using email as display name since backend returns email
      initials,
      color,
    };

    addContact(newContact);
    
    // Reset and close
    setSearchQuery('');
    setSearchResult(null);
    setSearchError(null);
    onContactAdded?.();
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResult(null);
    setSearchError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Contact</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                {isSearching ? '🔍' : 'Search'}
              </button>
            </div>
          </div>

          {/* Error message */}
          {searchError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <span>⚠️</span>
              <span>{searchError}</span>
            </div>
          )}

          {/* Search result */}
          {searchResult && (
            <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {searchResult.email.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{searchResult.email}</p>
                  <p className="text-sm text-gray-400">@{searchResult.username}</p>
                </div>
              </div>
              
              <button
                onClick={handleAddContact}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                Add to Contacts
              </button>
            </div>
          )}

          {/* Help text */}
          {!searchResult && !searchError && (
            <p className="text-xs text-gray-500 text-center">
              Search for a user by their username to add them to your quick transfer contacts
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;