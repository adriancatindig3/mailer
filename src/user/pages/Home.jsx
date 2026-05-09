// src/user/pages/Home.jsx

import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  QrCode,
  User,
  Palette,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { auth } from '../../config/firebase';
import UpdateProfile from './UpdateProfile';
import ViewQr from './ViewQr';
import SelectLayout from './SelectLayout';
import SettingsPage from './Settings';

// Custom hook for media queries
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
};

const NAV_ITEMS = [
  { to: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "overview" },
  { to: "qr", label: "My QR", icon: QrCode, group: "overview" },
  { to: "profile", label: "Edit Profile", icon: User, group: "profile" },
  { to: "themes", label: "Themes", icon: Palette, group: "profile" },
  { to: "settings", label: "Settings", icon: Settings, group: "settings" },
];

const GROUPS = ["overview", "profile", "settings"];
const GROUP_LABELS = {
  overview: "Main",
  profile: "Profile",
  settings: "Preferences",
};

const SPRING = { type: "spring", stiffness: 380, damping: 36, mass: 0.8 };
const SPRING_NAV = { type: "spring", stiffness: 500, damping: 30 };

function Home() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const effectiveCollapsed = isMobile ? true : isCollapsed;
  const sidebarWidth = effectiveCollapsed ? 80 : 240;

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

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // const handleLogout = async () => {
  //   await auth.signOut();
  //   navigate('/login');
  // };
  // In Home.jsx, update the handleLogout function
const handleLogout = async () => {
  try {
    await auth.signOut();
    navigate('/login', { replace: true });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Animated Sidebar */}
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: sidebarWidth }}
        transition={SPRING}
        className="flex-shrink-0 flex flex-col bg-white border-r border-gray-200 relative overflow-hidden"
        style={{ zIndex: 100 }}
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={`${effectiveCollapsed ? 'py-5 px-2' : 'p-5'} border-b border-gray-200 flex ${effectiveCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <div className={`flex items-center ${effectiveCollapsed ? 'justify-center' : 'justify-start'} min-h-[55px] ${effectiveCollapsed ? 'gap-0' : 'gap-3'}`}>
            <div className={`${effectiveCollapsed ? 'w-10 h-10' : 'w-12 h-12'} bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl transition-all duration-200`}>
              QR
            </div>
            <AnimatePresence initial={false}>
              {!effectiveCollapsed && (
                <motion.div
                  key="logo-text"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="text-sm font-bold text-gray-900 whitespace-nowrap">ProfileQR</div>
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5 whitespace-nowrap">Digital Business Card</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className={`flex-1 ${effectiveCollapsed ? 'p-3' : 'p-4'} overflow-y-auto overflow-x-hidden`}>
          {GROUPS.map((group, gi) => {
            const items = NAV_ITEMS.filter((n) => n.group === group);
            return (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + gi * 0.06, duration: 0.3 }}
                className="mb-6"
              >
                <AnimatePresence initial={false}>
                  {!effectiveCollapsed && (
                    <motion.div
                      key={`label-${group}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-[9px] font-bold tracking-wider uppercase text-gray-400 px-3 mb-2 whitespace-nowrap"
                    >
                      {GROUP_LABELS[group]}
                    </motion.div>
                  )}
                </AnimatePresence>

                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.to;
                  return (
                    <div key={item.to}>
                      <motion.div
                        whileHover={{ x: effectiveCollapsed ? 0 : 4 }}
                        transition={SPRING_NAV}
                        onClick={() => setActiveSection(item.to)}
                        className={`flex items-center ${effectiveCollapsed ? 'justify-center' : 'justify-start'} gap-2 p-2 rounded-lg mb-1 cursor-pointer transition-all duration-200 ${
                          isActive
                            ? 'bg-gray-100 text-black border border-gray-200'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                        style={{ position: 'relative' }}
                        {...(effectiveCollapsed && { "data-tooltip": item.label })}
                      >
                        {isActive && !effectiveCollapsed && (
                          <motion.div
                            layoutId="nav-active-bar"
                            transition={SPRING_NAV}
                            className="absolute left-0 w-0.5 h-8 rounded-full bg-black"
                          />
                        )}
                        <Icon size={effectiveCollapsed ? 18 : 16} strokeWidth={isActive ? 2.2 : 1.75} className="flex-shrink-0" />
                        <AnimatePresence initial={false}>
                          {!effectiveCollapsed && (
                            <motion.span
                              key={`label-${item.to}`}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -4 }}
                              transition={{ duration: 0.15 }}
                              className={`text-xs whitespace-nowrap ${isActive ? 'font-semibold' : 'font-normal'}`}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </nav>

        {/* Footer / User Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className={`${effectiveCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}
        >
          <div
            onClick={!effectiveCollapsed ? handleLogout : undefined}
            className={`flex items-center ${effectiveCollapsed ? 'justify-center' : 'justify-start'} gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition group`}
            {...(effectiveCollapsed && { "data-tooltip": "Logout" })}
          >
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}`}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <AnimatePresence initial={false}>
              {!effectiveCollapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold text-gray-900 truncate">{user?.displayName?.split(' ')[0] || 'User'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!effectiveCollapsed && (
              <LogOut size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition" />
            )}
          </div>
        </motion.div>

        {/* Collapse Toggle Button */}
        {!isMobile && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={toggleCollapse}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer text-gray-500 shadow-sm hover:shadow-md transition z-10"
          >
            <motion.span
              key={isCollapsed ? "right" : "left"}
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </motion.span>
          </motion.button>
        )}
      </motion.aside>

      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeSection === 'dashboard' && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, {user?.displayName?.split(' ')[0] || 'User'} 👋</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center gap-5">
              <div className="flex gap-4 items-center">
                <img 
                  src={user?.photoURL || "https://i.pravatar.cc/300"} 
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">{user?.displayName || 'User'}</h2>
                  <p className="text-gray-500">{user?.email || 'No email'}</p>
                </div>
              </div>
              <div className="w-24 h-24 rounded-xl bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
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

      {/* Tooltip CSS */}
      <style>{`
        [data-tooltip] { position: relative; }
        [data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 12px;
          padding: 6px 10px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #111;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
          pointer-events: none;
        }
        [data-tooltip]:hover::before {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 6px;
          border-width: 6px;
          border-style: solid;
          border-color: transparent #e5e7eb transparent transparent;
          z-index: 1000;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default Home;