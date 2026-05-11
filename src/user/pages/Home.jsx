// src/user/pages/Home.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  QrCode,
  User,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { auth } from '../../config/firebase';
import UpdateProfile from './UpdateProfile';
import ViewQr from './ViewQr';
import SelectLayout from './SelectLayout';
import SettingsPage from './Settings';

function Home() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('userTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'qr', label: 'My QR', icon: QrCode },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Theme-based classes
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const sidebarBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const sidebarTextClass = darkMode ? 'text-gray-200' : 'text-gray-900';
  const sidebarSubtextClass = darkMode ? 'text-gray-500' : 'text-gray-400';
  const navButtonActiveClass = darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black';
  const navButtonInactiveClass = darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const headerTextClass = darkMode ? 'text-white' : 'text-gray-900';
  const headerSubtextClass = darkMode ? 'text-gray-400' : 'text-gray-400';
  const mobileHeaderBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const mobileHeaderTextClass = darkMode ? 'text-white' : 'text-gray-900';
  const buttonBgClass = darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorderClass = darkMode ? 'border-gray-700' : 'border-gray-100';
  const profileCoverClass = darkMode ? 'from-gray-800 via-gray-700 to-gray-800' : 'from-gray-900 via-gray-700 to-gray-900';
  const quickActionBgClass = darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-gray-300';
  const quickActionIconBgClass = darkMode ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-100 group-hover:bg-black';
  const quickActionIconClass = darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-white';
  const quickActionTextClass = darkMode ? 'text-gray-200' : 'text-gray-900';
  const quickActionDescClass = darkMode ? 'text-gray-500' : 'text-gray-400';
  const themeToggleBgClass = darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50';

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${bgClass}`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 ${darkMode ? 'border-gray-700 border-t-white' : 'border-gray-300 border-t-black'} rounded-full animate-spin mx-auto mb-4`}></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Mobile Header with Hamburger on Right */}
      <div className={`md:hidden fixed top-0 left-0 right-0 ${mobileHeaderBgClass} px-4 py-3 flex items-center justify-between z-50`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-transparent">
            <img 
              src="/e-CARD generic.png" 
              alt="e-CARD" 
              className={`w-full h-full object-contain transition-all duration-200 ${darkMode ? 'brightness-0 invert' : ''}`} 
            />
          </div>
          <span className={`font-semibold ${mobileHeaderTextClass}`}>e-CARD</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition ${themeToggleBgClass}`}
          >
            {darkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-700" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {mobileMenuOpen ? <X size={24} className={darkMode ? 'text-white' : 'text-gray-900'} /> : <Menu size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay - Slides from RIGHT */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            {/* Sidebar - from right */}
            <motion.div
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 bottom-0 w-64 ${sidebarBgClass} z-50 shadow-xl md:hidden flex flex-col`}
            >
              {/* Sidebar Header */}
              <div className={`p-5 ${borderClass}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-transparent">
                    <img 
                      src="/e-CARD generic.png" 
                      alt="e-CARD" 
                      className={`w-full h-full object-contain transition-all duration-200 ${darkMode ? 'brightness-0 invert' : ''}`} 
                    />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${sidebarTextClass}`}>e-CARD</div>
                    <div className={`text-[9px] ${sidebarSubtextClass}`}>Digital Business Card</div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-all ${
                        isActive ? navButtonActiveClass : navButtonInactiveClass
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Info & Logout */}
              <div className={`p-4 ${borderClass}`}>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=000&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${sidebarTextClass} truncate`}>
                      {user?.displayName?.split(' ')[0] || 'User'}
                    </p>
                    <p className={`text-xs ${sidebarSubtextClass} truncate`}>{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 ${buttonBgClass} rounded-lg text-sm font-medium transition`}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Left side - SIMPLER STYLE */}
      <div className={`hidden md:flex w-64 ${sidebarBgClass} fixed left-0 top-0 bottom-0 flex-col`}>
        <div className={`p-5 ${borderClass}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-transparent">
              <img 
                src="/e-CARD generic.png" 
                alt="e-CARD" 
                className={`w-full h-full object-contain transition-all duration-200 ${darkMode ? 'brightness-0 invert' : ''}`} 
              />
            </div>
            <div>
              <div className={`text-sm font-bold ${sidebarTextClass}`}>e-CARD</div>
              <div className={`text-[9px] ${sidebarSubtextClass}`}>Digital Business Card</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-all ${
                  isActive ? navButtonActiveClass : navButtonInactiveClass
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`p-4 ${borderClass}`}>
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=000&color=fff`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${sidebarTextClass} truncate`}>
                {user?.displayName?.split(' ')[0] || 'User'}
              </p>
              <p className={`text-xs ${sidebarSubtextClass} truncate`}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 ${buttonBgClass} rounded-lg text-sm font-medium transition`}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        {/* HEADER with Dark Mode Toggle (Desktop) */}
        <div className="hidden md:block sticky top-0 z-40 bg-transparent pt-6 pb-2">
          <div className="max-w-4xl mx-auto px-8">
            <div className="flex justify-end">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${themeToggleBgClass} rounded-lg transition`}
              >
                {darkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* Themes gets no container — it manages its own full-width grid / mobile carousel */}
        {activeSection === 'themes' ? (
          <SelectLayout darkMode={darkMode} />
        ) : (
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div>
                {/* Page header */}
                <div className="mb-8">
                  <h1 className={`text-2xl md:text-3xl font-bold ${headerTextClass}`}>Dashboard</h1>
                  <p className={`${headerSubtextClass} mt-1 text-sm`}>
                    Welcome back, <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{user?.displayName?.split(' ')[0] || 'User'}</span> 👋
                  </p>
                </div>

                {/* Profile card */}
                <div className={`${cardBgClass} border ${cardBorderClass} rounded-2xl shadow-sm overflow-hidden mb-6`}>
                  {/* Cover bar */}
                  <div className={`h-20 bg-gradient-to-r ${profileCoverClass}`} />
                  <div className="px-6 pb-6 relative">
                    <img
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=000&color=fff&size=128`}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white absolute -top-10"
                    />
                    <div className="pt-12 flex items-end justify-between gap-4 flex-wrap">
                      <div>
                        <h2 className={`text-lg font-bold ${headerTextClass}`}>{user?.displayName || 'User'}</h2>
                        <p className={`text-sm ${sidebarSubtextClass}`}>{user?.email}</p>
                      </div>
                      <button
                        onClick={() => setActiveSection('qr')}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:opacity-80 transition"
                      >
                        <QrCode size={15} />
                        View QR
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick actions grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'qr', icon: QrCode, label: 'My QR Code', desc: 'Download or share' },
                    { id: 'profile', icon: User, label: 'Edit Profile', desc: 'Update your info' },
                    { id: 'themes', icon: Palette, label: 'Themes', desc: 'Customize your card' },
                    { id: 'settings', icon: Settings, label: 'Settings', desc: 'Account preferences' },
                  ].map(({ id, icon: Icon, label, desc }) => (
                    <button
                      key={id}
                      onClick={() => setActiveSection(id)}
                      className={`group ${quickActionBgClass} border p-5 rounded-2xl shadow-sm text-left hover:shadow-md transition-all`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${quickActionIconBgClass} flex items-center justify-center mb-3 transition-colors`}>
                        <Icon size={17} className={`${quickActionIconClass} transition-colors`} />
                      </div>
                      <p className={`text-sm font-semibold ${quickActionTextClass} mb-0.5`}>{label}</p>
                      <p className={`text-xs ${quickActionDescClass}`}>{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-pages */}
            {activeSection === 'qr' && <ViewQr darkMode={darkMode} />}
            {activeSection === 'profile' && <UpdateProfile darkMode={darkMode} />}
            {activeSection === 'settings' && <SettingsPage darkMode={darkMode} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;