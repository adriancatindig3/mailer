import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { getTheme, TABS } from './adminHelpers';
import AdminUsers from './AdminUsers';
import AdminAnalytics from './AdminAnalytics';
import AdminLogs from './AdminLogs';
import AdminSettings from './AdminSettings';
import {
  Moon, Sun, LogOut, Shield,
  Users, UserCheck, Briefcase, GraduationCap,
  Clock, CheckCircle, XCircle,
  Menu, X, AlertTriangle
} from 'lucide-react';

const logo = "/e-CARD generic.png";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [roleStats, setRoleStats] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('adminTheme') === 'dark');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'users');
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const T = getTheme(darkMode);

  useEffect(() => {
    localStorage.setItem('adminTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: currentUser.uid,
              email: currentUser.email || userData.email,
              displayName: userData.displayName || currentUser.displayName || 'Admin',
              photoURL: userData.photoURL || currentUser.photoURL,
              accountType: userData.accountType,
              accountStatus: userData.accountStatus,
            });
          } else {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'Admin',
              photoURL: currentUser.photoURL,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'Admin',
            photoURL: currentUser.photoURL,
          });
        }
      } else {
        navigate('/login');
      }
    };
    getCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'userRoles'), orderBy('createdAt', 'asc')));
        if (!snap.empty) {
          setDynamicRoles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setDynamicRoles([
            { id: '1', value: 'teaching',     label: 'Teaching',     color: '#3B82F6' },
            { id: '2', value: 'non-teaching', label: 'Non-Teaching', color: '#8B5CF6' },
            { id: '3', value: 'alumni',       label: 'Alumni',       color: '#F59E0B' },
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoles();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'users'));
      let pending = 0, approved = 0, rejected = 0;
      const list = [];
      const roleCounts = {};

      snap.docs.forEach(d => {
        const data = d.data();
        if (data.accountStatus === 'deleted') return;
        if (data.accountType === 'admin') return;

        const u = {
          id: d.id,
          email: data.email || '',
          displayName: data.displayName || 'Unknown',
          photoURL: data.photoURL || data.profilePic || '',
          occupation: data.occupation || '',
          company: data.company || '',
          phoneNumber: data.phoneNumber || '',
          bio: data.bio || '',
          createdAt: data.createdAt || '',
          accountStatus: data.accountStatus || 'pending',
          isActive: data.isActive || false,
          accountType: data.accountType || 'user',
          selectedLayout: data.selectedLayout || 1,
          skills: data.skills || '',
        };

        list.push(u);
        const occ = u.occupation?.toLowerCase();
        if (occ) roleCounts[occ] = (roleCounts[occ] || 0) + 1;

        if (u.accountStatus === 'pending')  pending++;
        else if (u.accountStatus === 'approved') approved++;
        else if (u.accountStatus === 'rejected') rejected++;
      });

      const roleStatsArray = (dynamicRoles || []).map(role => ({
        label: role.label,
        value: roleCounts[role.value] || 0,
        color: role.color || '#6B7280',
        icon: getRoleIcon(role.value),
      }));

      setUsers(list);
      setStats({ total: list.length, pending, approved, rejected });
      setRoleStats(roleStatsArray);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleValue) => {
    switch (roleValue) {
      case 'teaching':     return UserCheck;
      case 'non-teaching': return Briefcase;
      case 'alumni':       return GraduationCap;
      default:             return Users;
    }
  };

  useEffect(() => {
    if (user) fetchAllUsers();
  }, [user, dynamicRoles]);

  const handleRefresh = async () => { await fetchAllUsers(); };

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setShowLogoutModal(false);
    }
  };

  // ── Theme classes ──────────────────────────────────────────────────────────
  const bgClass             = darkMode ? 'bg-gray-900'                 : 'bg-gray-50';
  const sidebarBgClass      = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const sidebarTextClass    = darkMode ? 'text-gray-200'               : 'text-gray-900';
  const sidebarSubtextClass = darkMode ? 'text-gray-500'               : 'text-gray-400';
  const navButtonActiveClass   = darkMode ? 'bg-gray-700 text-white'         : 'bg-gray-100 text-black';
  const navButtonInactiveClass = darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50';
  const borderClass         = darkMode ? 'border-gray-700'             : 'border-gray-200';
  const mobileHeaderBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const mobileHeaderTextClass = darkMode ? 'text-white'                : 'text-gray-900';
  const themeToggleBgClass  = darkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-200';
  const logoutButtonClass   = darkMode
    ? 'w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm font-medium transition border border-red-800/50'
    : 'w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition border border-red-200';

  if (loading && !user) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${bgClass}`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 ${darkMode ? 'border-gray-700 border-t-white' : 'border-gray-300 border-t-black'} rounded-full animate-spin mx-auto mb-4`} />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = TABS || [];

  return (
    <div className={`min-h-screen ${bgClass}`}>

      {/* ── Logout Confirmation Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
            >
              <div className="text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                  <AlertTriangle size={28} className={darkMode ? 'text-red-400' : 'text-red-600'} />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sign Out</h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Are you sure you want to sign out of your admin account?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoutConfirm}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Header ─────────────────────────────────────────────────── */}
      <div className={`md:hidden fixed top-0 left-0 right-0 ${mobileHeaderBgClass} border-b px-4 py-3 flex items-center justify-between z-40`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt="e-CARD"
              className={`w-full h-full object-contain ${darkMode ? 'brightness-0 invert' : ''}`}
            />
          </div>
          <span className={`font-semibold ${mobileHeaderTextClass}`}>e-CARD Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border transition ${themeToggleBgClass}`}
          >
            {darkMode
              ? <Sun  size={16} className="text-yellow-400" />
              : <Moon size={16} className="text-gray-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {mobileMenuOpen
              ? <X    size={22} className={darkMode ? 'text-white' : 'text-gray-900'} />
              : <Menu size={22} className={darkMode ? 'text-white' : 'text-gray-900'} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Sidebar Overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 bottom-0 w-64 ${sidebarBgClass} z-50 shadow-xl md:hidden flex flex-col border-l`}
            >
              <div className={`p-5 border-b ${borderClass}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    <img
                      src={logo}
                      alt="e-CARD"
                      className={`w-full h-full object-contain ${darkMode ? 'brightness-0 invert' : ''}`}
                    />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${sidebarTextClass}`}>e-CARD Admin</div>
                    <div className={`text-[9px] ${sidebarSubtextClass}`}>Dashboard</div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-3 overflow-y-auto">
                {tabs.map(tab => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-all ${active ? navButtonActiveClass : navButtonInactiveClass}`}
                    >
                      {tab.icon}
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className={`p-4 border-t ${borderClass} space-y-3`}>
                <div className="flex items-center gap-3">
                  <img
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Admin'}&background=000&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${sidebarTextClass} truncate`}>
                      {user?.displayName?.split(' ')[0] || 'Admin'}
                    </p>
                    <p className={`text-xs ${sidebarSubtextClass} truncate`}>{user?.email}</p>
                  </div>
                </div>
                <button onClick={() => setShowLogoutModal(true)} className={logoutButtonClass}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      <div className={`hidden md:flex w-64 ${sidebarBgClass} fixed left-0 top-0 bottom-0 flex-col border-r`}>
        {/* Logo */}
        <div className={`p-5 border-b ${borderClass}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img
                src={logo}
                alt="e-CARD"
                className={`w-full h-full object-contain ${darkMode ? 'brightness-0 invert' : ''}`}
              />
            </div>
            <div>
              <div className={`text-sm font-bold ${sidebarTextClass}`}>e-CARD Admin</div>
              <div className={`text-[9px] ${sidebarSubtextClass}`}>Dashboard</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition ${active ? navButtonActiveClass : navButtonInactiveClass}`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer — user info + dark mode toggle + sign out */}
        <div className={`p-4 border-t ${borderClass} space-y-3`}>
          {/* User row */}
          <div className="flex items-center gap-3">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Admin'}&background=000&color=fff`}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${sidebarTextClass} truncate`}>
                {user?.displayName?.split(' ')[0] || 'Admin'}
              </p>
              <p className={`text-xs ${sidebarSubtextClass} truncate`}>{user?.email}</p>
            </div>
            {/* Dark mode toggle lives here on desktop — no floating header needed */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-lg border transition flex-shrink-0 ${themeToggleBgClass}`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode
                ? <Sun  size={14} className="text-yellow-400" />
                : <Moon size={14} className="text-gray-600" />}
            </button>
          </div>

          {/* Sign out */}
          <button onClick={() => setShowLogoutModal(true)} className={logoutButtonClass}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

          {activeTab === 'users' && (
            <AdminUsers
              users={users}
              loading={loading}
              darkMode={darkMode}
              T={T}
              onRefresh={handleRefresh}
              currentUser={user}
              dynamicRoles={dynamicRoles}
            />
          )}

          {activeTab === 'analytics' && (
            <AdminAnalytics
              stats={stats}
              roleStats={roleStats}
              users={users}
              darkMode={darkMode}
              T={T}
              dynamicRoles={dynamicRoles}
            />
          )}

          {activeTab === 'logs' && (
            <AdminLogs darkMode={darkMode} T={T} />
          )}

          {activeTab === 'settings' && (
            <AdminSettings darkMode={darkMode} T={T} currentUser={user} />
          )}

        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;