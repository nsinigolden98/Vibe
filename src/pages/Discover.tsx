import React, { useState, useEffect } from 'react';
import { Search, Loader2, Users, FileText, TrendingUp, MessageSquare } from 'lucide-react';
import type { Drop, User, Space } from '@/types';
import { searchDrops, searchUsers, getSpaces } from '@/services/supabaseClient';
import { soundManager } from '@/sounds/SoundManager';
import DropCard from '@/components/DropCard';

interface DiscoverProps {
  currentUser: User | null;
}

const Discover: React.FC<DiscoverProps> = ({ currentUser }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'drops' | 'users' | 'spaces'>('drops');
  const [drops, setDrops] = useState<Drop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Load trending spaces on mount
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    const data = await getSpaces(10);
    setSpaces(data);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    soundManager.playClick();

    try {
      switch (activeTab) {
        case 'drops':
          const dropResults = await searchDrops(query);
          setDrops(dropResults);
          break;
        case 'users':
          const userResults = await searchUsers(query);
          setUsers(userResults);
          break;
        case 'spaces':
          // Filter spaces locally for now
          const allSpaces = await getSpaces(50);
          const filteredSpaces = allSpaces.filter(s => 
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.description?.toLowerCase().includes(query.toLowerCase())
          );
          setSpaces(filteredSpaces);
          break;
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-[#ff2e2e]" />
          Discover
        </h1>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search drops, users, spaces..."
              className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="px-4 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 border-b border-white/10">
        <div className="flex gap-6">
          {(['drops', 'users', 'spaces'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                soundManager.playClick();
                if (query.trim() && searched) {
                  handleSearch();
                }
              }}
              className={`relative py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-white' : 'text-white/50'
              }`}
            >
              <span className="flex items-center gap-1">
                {tab === 'drops' && <FileText className="w-4 h-4" />}
                {tab === 'users' && <Users className="w-4 h-4" />}
                {tab === 'spaces' && <MessageSquare className="w-4 h-4" />}
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2e2e] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="p-4 pb-24 lg:pb-4">
        {!searched && activeTab === 'spaces' ? (
          // Show trending spaces by default
          <>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ff2e2e]" />
              Trending Spaces
            </h2>
            {spaces.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-white/30 mb-3" />
                <p className="text-white/50">No spaces yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {spaces.map((space) => {
                  const avatar = space.user ? parseAvatar(space.user.avatar) : null;
                  return (
                    <div
                      key={space.id}
                      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff2e2e]/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💬</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{space.name}</h3>
                        {space.description && (
                          <p className="text-sm text-white/50 truncate">{space.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {avatar && (
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
                              <span className="text-white text-[10px] font-bold">{avatar.initial}</span>
                            </div>
                          )}
                          <span className="text-xs text-white/40">by {space.user?.username}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : searched && loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#ff2e2e] animate-spin" />
          </div>
        ) : searched && activeTab === 'drops' ? (
          drops.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-white/30 mb-3" />
              <p className="text-white/50">No drops found</p>
            </div>
          ) : (
            drops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                currentUser={currentUser}
                onEcho={() => {}}
                onFlow={() => {}}
                onVibe={() => {}}
                onView={() => {}}
              />
            ))
          )
        ) : searched && activeTab === 'users' ? (
          users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-white/30 mb-3" />
              <p className="text-white/50">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const userAvatar = parseAvatar(user.avatar);
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${userAvatar.gradient} flex items-center justify-center`}>
                      <span className="text-white font-bold">{userAvatar.initial}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{user.username}</p>
                      <p className="text-xs text-white/50">Level {user.level}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : searched && activeTab === 'spaces' ? (
          spaces.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-white/30 mb-3" />
              <p className="text-white/50">No spaces found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {spaces.map((space) => {
                const avatar = space.user ? parseAvatar(space.user.avatar) : null;
                return (
                  <div
                    key={space.id}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff2e2e]/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{space.name}</h3>
                      {space.description && (
                        <p className="text-sm text-white/50 truncate">{space.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {avatar && (
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
                            <span className="text-white text-[10px] font-bold">{avatar.initial}</span>
                          </div>
                        )}
                        <span className="text-xs text-white/40">by {space.user?.username}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-white/30 mb-3" />
            <p className="text-white/50">Search for drops, users, or spaces</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
