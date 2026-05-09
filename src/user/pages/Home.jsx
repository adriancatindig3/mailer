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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">QR</span>
          </div>
          <span className="font-semibold text-gray-900">ProfileQR</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
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
            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-xl md:hidden flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">QR</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">ProfileQR</div>
                    <div className="text-[9px] text-gray-400">Digital Business Card</div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3">
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
                        isActive
                          ? 'bg-gray-100 text-black'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Info & Logout */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.displayName?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 flex-col">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">QR</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">ProfileQR</div>
              <div className="text-[9px] text-gray-400">Digital Business Card</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-all ${
                  isActive
                    ? 'bg-gray-100 text-black'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.displayName?.split(' ')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 pt-14 md:pt-0">
        <div className="p-4 md:p-8">
          {activeSection === 'dashboard' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.displayName?.split(' ')[0] || 'User'} 👋</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                <div className="flex gap-4 items-center">
                  <img 
                    src={user?.photoURL || "https://i.pravatar.cc/300"} 
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{user?.displayName || 'User'}</h2>
                    <p className="text-gray-500 text-sm">{user?.email || 'No email'}</p>
                  </div>
                </div>
                <div className="w-24 h-24 rounded-xl bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)]"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                <div onClick={() => setActiveSection('qr')} className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:-translate-y-1 transition">
                  <h3 className="font-bold mb-2">View QR</h3>
                  <p className="text-gray-500 text-sm">Open your QR instantly</p>
                </div>
                <div onClick={() => setActiveSection('profile')} className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:-translate-y-1 transition">
                  <h3 className="font-bold mb-2">Edit Profile</h3>
                  <p className="text-gray-500 text-sm">Update your info</p>
                </div>
                <div onClick={() => setActiveSection('themes')} className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:-translate-y-1 transition">
                  <h3 className="font-bold mb-2">Themes</h3>
                  <p className="text-gray-500 text-sm">Customize your card</p>
                </div>
                <div onClick={() => setActiveSection('settings')} className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:-translate-y-1 transition">
                  <h3 className="font-bold mb-2">Settings</h3>
                  <p className="text-gray-500 text-sm">Manage your account</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'qr' && <ViewQr />}
          {activeSection === 'profile' && <UpdateProfile />}
          {activeSection === 'themes' && <SelectLayout />}
          {activeSection === 'settings' && <SettingsPage />}
        </div>
      </div>
    </div>
  );
}

export default Home;