import { useState, useEffect, useRef } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import { Search, X, FileText, Users, Radio, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { formatNumber, formatTimeAgo } from '@/lib/utils';
import { MOOD_CONFIG } from '@/types';
import mockBackend from '@/services/mockBackend';
import type { Drop, Aura, Space } from '@/types';

type SearchTab = 'all' | 'drops' | 'users' | 'spaces';

export default function DiscoverPage() {
  const { settings, toggleVibe, isVibing, openDropDetail } = useVibeStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [results, setResults] = useState<{ drops: Drop[]; auras: Aura[]; spaces: Space[] }>({
    drops: [],
    auras: [],
    spaces: [],
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = settings.theme === 'dark';

  const trendingSearches = [
    '#LateNightThoughts',
    '#VibeCheck',
    '#AnonymousConfessions',
    '#MidnightMusic',
    '#CoffeeThoughts',
    '#DeepConversations',
  ];

  const popularTags = [
    { tag: '#Mood', count: 15234 },
    { tag: '#Random', count: 12345 },
    { tag: '#Thoughts', count: 9876 },
    { tag: '#Feelings', count: 8765 },
  ];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        const searchResults = mockBackend.search(query);
        setResults(searchResults);
        setIsSearching(false);
        setShowSuggestions(false);
      } else {
        setResults({ drops: [], auras: [], spaces: [] });
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    if (query.trim() && query.length >= 2) {
      const searchSuggestions = mockBackend.searchSuggestions(query);
      setSuggestions(searchSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ drops: [], auras: [], spaces: [] });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const hasResults = results.drops.length > 0 || results.auras.length > 0 || results.spaces.length > 0;
  const totalResults = results.drops.length + results.auras.length + results.spaces.length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`sticky top-0 z-30 ${isDark ? 'bg-[#0a0a0a]/95' : 'bg-[#f5f5f5]/95'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 py-4`}>
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Discover</h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Find drops, auras, and spaces</p>
      </div>

      {/* Search Input */}
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="relative">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <Search className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drops, users, spaces..."
              className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
            {query && (
              <button onClick={clearSearch}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-xl z-20 ${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className={`px-4 py-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <Sparkles className="w-4 h-4 text-[#ff2e2e]" />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{suggestion}</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-gray-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!query ? (
        /* Default View - Trending & Popular */
        <div className="px-4 py-2 max-w-2xl mx-auto space-y-6">
          {/* Trending Searches */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#ff2e2e]" />
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Trending</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleTrendingClick(term)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-white/10 text-white hover:bg-white/20' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Popular Tags */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#ff2e2e]" />
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Popular Tags</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {popularTags.map((tag) => (
                <button
                  key={tag.tag}
                  onClick={() => handleTrendingClick(tag.tag)}
                  className={`p-4 rounded-xl text-left transition-colors ${
                    isDark 
                      ? 'bg-white/5 hover:bg-white/10' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{tag.tag}</p>
                  <p className="text-xs text-gray-500">{formatNumber(tag.count)} drops</p>
                </button>
              ))}
            </div>
          </section>

          {/* Quick Tip */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#ff2e2e]/10' : 'bg-red-50'} border ${isDark ? 'border-[#ff2e2e]/30' : 'border-red-200'}`}>
            <p className={`text-sm ${isDark ? 'text-[#ff2e2e]' : 'text-red-700'}`}>
              <strong>Tip:</strong> Search by username, drop content, or space name to find what you're looking for.
            </p>
          </div>
        </div>
      ) : (
        /* Search Results */
        <div className="max-w-2xl mx-auto">
          {/* Results Header */}
          <div className={`px-4 py-2 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isSearching ? 'Searching...' : `${totalResults} results for "${query}"`}
            </p>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${isDark ? 'border-white/10' : 'border-gray-200'} px-4`}>
            {(['all', 'drops', 'users', 'spaces'] as SearchTab[]).map((tab) => {
              const counts = {
                all: totalResults,
                drops: results.drops.length,
                users: results.auras.length,
                spaces: results.spaces.length,
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab 
                      ? 'border-[#ff2e2e] text-[#ff2e2e]' 
                      : `border-transparent ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                  }`}
                >
                  {tab}
                  <span className="ml-1 text-xs">
                    ({counts[tab]})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Content */}
          <div className="px-4 py-4">
            {isSearching ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-[#ff2e2e] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Searching...</p>
              </div>
            ) : !hasResults ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center mx-auto mb-4`}>
                  <Search className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No results found</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Drops Results */}
                {(activeTab === 'all' || activeTab === 'drops') && results.drops.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Drops ({results.drops.length})
                      </h3>
                    )}
                    <div className="space-y-3">
                      {results.drops.map((drop) => (
                        <DropResult key={drop.id} drop={drop} isDark={isDark} onClick={() => openDropDetail(drop)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Users Results */}
                {(activeTab === 'all' || activeTab === 'users') && results.auras.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Users ({results.auras.length})
                      </h3>
                    )}
                    <div className="space-y-3">
                      {results.auras.map((aura) => (
                        <AuraResult 
                          key={aura.id} 
                          aura={aura} 
                          isDark={isDark} 
                          isVibing={isVibing(aura.id)}
                          onToggleVibe={() => toggleVibe(aura.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Spaces Results */}
                {(activeTab === 'all' || activeTab === 'spaces') && results.spaces.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Spaces ({results.spaces.length})
                      </h3>
                    )}
                    <div className="space-y-3">
                      {results.spaces.map((space) => (
                        <SpaceResult key={space.id} space={space} isDark={isDark} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DropResult({ drop, isDark, onClick }: { drop: Drop; isDark: boolean; onClick: () => void }) {
  const mood = MOOD_CONFIG[drop.mood];
  
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'} cursor-pointer hover:scale-[1.01] transition-transform`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${drop.author.avatar.gradient} flex items-center justify-center`}>
          <span className="text-white text-sm font-bold">{drop.author.avatar.initial}</span>
        </div>
        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {drop.author.username}
        </span>
        <span className="text-xs text-gray-500">{formatTimeAgo(drop.createdAt)}</span>
      </div>
      <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {drop.content}
      </p>
      <div className="flex items-center gap-3">
        <span 
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${mood.color}20`, color: mood.color }}
        >
          {mood.emoji} {mood.label}
        </span>
        <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <FileText className="w-3 h-3" />
          {drop.category}
        </span>
      </div>
    </div>
  );
}

function AuraResult({ aura, isDark, isVibing, onToggleVibe }: { aura: Aura; isDark: boolean; isVibing: boolean; onToggleVibe: () => void }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${aura.avatar.gradient} flex items-center justify-center`}>
          <span className="text-white font-bold">{aura.avatar.initial}</span>
        </div>
        <div>
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{aura.username}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatNumber(aura.vibeCount)} Vibers
            </span>
          </div>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleVibe(); }}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          isVibing 
            ? 'bg-[#ff2e2e]/20 text-[#ff2e2e]' 
            : 'bg-[#ff2e2e] text-white hover:bg-[#e62929]'
        }`}
      >
        {isVibing ? 'Vibing' : 'Vibe'}
      </button>
    </div>
  );
}

function SpaceResult({ space, isDark }: { space: Space; isDark: boolean }) {
  return (
    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{space.name}</h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{space.description}</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-[#ff2e2e]/20 rounded-full">
          <Radio className="w-3 h-3 text-[#ff2e2e] animate-pulse" />
          <span className="text-xs text-[#ff2e2e]">LIVE</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-sm">{formatNumber(space.activeUsers)} active</span>
        </div>
        <button className="px-4 py-2 bg-[#ff2e2e] text-white text-sm font-medium rounded-full hover:bg-[#e62929] transition-colors">
          Join
        </button>
      </div>
    </div>
  );
}
