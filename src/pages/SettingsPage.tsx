import { useState } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import { 
  Moon, 
  Sun, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Shield, 
  FileText, 
  LogOut,
  ChevronRight,
  AlertTriangle,
  Database
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (page: 'main' | 'terms' | 'privacy') => void;
}

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { 
    settings, 
    currentUser,
    toggleTheme, 
    toggleNotifications, 
    toggleSoundEffects,
    logout, 
    deleteAccount,
    clearAllData,
  } = useVibeStore();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const isDark = settings.theme === 'dark';

  const handleDeleteAccount = () => {
    if (deleteInput === 'DELETE') {
      deleteAccount();
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`sticky top-0 z-30 ${isDark ? 'bg-[#0a0a0a]/95' : 'bg-[#f5f5f5]/95'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 py-4`}>
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Customize your VIBE experience</p>
      </div>

      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {/* Account Section */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Account
          </h2>
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            {currentUser && (
              <div className="p-4 border-b border-dashed border-gray-500/30">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentUser.avatar.gradient} flex items-center justify-center`}>
                    <span className="text-white font-bold">{currentUser.avatar.initial}</span>
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentUser.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser.isGuest ? 'Guest Account' : 'Google Account'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center justify-between p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-orange-500" />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Log Out</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </section>

        {/* Appearance Section */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Appearance
          </h2>
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button 
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-yellow-500/20' : 'bg-indigo-500/20'} flex items-center justify-center`}>
                  {isDark ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-500" />
                  )}
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDark ? 'bg-[#ff2e2e]' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </section>

        {/* Notifications & Sound Section */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Notifications & Sound
          </h2>
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button 
              onClick={toggleNotifications}
              className={`w-full flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${settings.notifications ? 'bg-green-500/20' : 'bg-gray-500/20'} flex items-center justify-center`}>
                  {settings.notifications ? (
                    <Bell className="w-4 h-4 text-green-500" />
                  ) : (
                    <BellOff className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Push Notifications
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notifications ? 'bg-[#ff2e2e]' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </button>
            
            <button 
              onClick={toggleSoundEffects}
              className={`w-full flex items-center justify-between p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${settings.soundEffects ? 'bg-blue-500/20' : 'bg-gray-500/20'} flex items-center justify-center`}>
                  {settings.soundEffects ? (
                    <Volume2 className="w-4 h-4 text-blue-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Sound Effects
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.soundEffects ? 'bg-[#ff2e2e]' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.soundEffects ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </section>

        {/* Legal Section */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Legal
          </h2>
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button 
              onClick={() => onNavigate('terms')}
              className={`w-full flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Terms & Conditions
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
            
            <button 
              onClick={() => onNavigate('privacy')}
              className={`w-full flex items-center justify-between p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-500" />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Privacy Policy
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Data Management
          </h2>
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button 
              onClick={() => setShowClearConfirm(true)}
              className={`w-full flex items-center justify-between p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Database className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-left">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Clear All Data
                  </span>
                  <p className="text-xs text-gray-500">Remove all posts and interactions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 text-red-500`}>
            Danger Zone
          </h2>
          <div className="rounded-2xl overflow-hidden bg-red-500/10 border border-red-500/30">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-red-500">Delete Account</span>
                  <p className="text-xs text-red-400">Permanently delete your account and data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center pt-4 pb-8">
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            VIBE v1.0.0
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Made with ❤️ for the anonymous
          </p>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className={`relative w-full max-w-md ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-3xl p-6 scale-in`}>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Delete Account?
            </h3>
            <p className={`text-center mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              This action cannot be undone. All your drops, pulses, and data will be permanently deleted.
            </p>
            <p className="text-center text-red-500 text-sm mb-4">
              Type "DELETE" to confirm
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE"
              className={`w-full p-3 rounded-xl mb-4 text-center font-mono ${
                isDark 
                  ? 'bg-white/10 text-white placeholder-gray-500' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE'}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className={`w-full py-3 font-semibold rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className={`relative w-full max-w-md ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-3xl p-6 scale-in`}>
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Clear All Data?
            </h3>
            <p className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              This will remove all posts, interactions, and local data. Your account will remain.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleClearData}
                className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
              >
                Clear Data
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className={`w-full py-3 font-semibold rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
