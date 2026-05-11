import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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
  Menu, X
} from 'lucide-react';

const logo = "/e-CARD generic.png";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [roleStats, setRoleStats] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const T = getTheme(darkMode);

  // Save darkMode preference to localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Update localStorage when darkMode changes
  useEffect(() => {
    localStorage.setItem('adminTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'userRoles'), orderBy('createdAt', 'asc'))
        );

        if (!snap.empty) {
          setDynamicRoles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setDynamicRoles([
            { id: '1', value: 'teaching', label: 'Teaching', color: '#3B82F6' },
            { id: '2', value: 'non-teaching', label: 'Non-Teaching', color: '#8B5CF6' },
            { id: '3', value: 'alumni', label: 'Alumni', color: '#F59E0B' },
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

        if (u.accountStatus === 'pending') pending++;
        else if (u.accountStatus === 'approved') approved++;
        else if (u.accountStatus === 'rejected') rejected++;
      });

      const roleStatsArray = (dynamicRoles || []).map(role => ({
        label: role.label,
        value: roleCounts[role.value] || 0,
        color: role.color || '#6B7280',
        icon: getRoleIcon(role.value)
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
      case 'teaching': return UserCheck;
      case 'non-teaching': return Briefcase;
      case 'alumni': return GraduationCap;
      default: return Users;
    }
  };

  useEffect(() => {
    const init = async () => {
      setUser({
        email: 'admin@test.com',
        displayName: 'Admin User',
        uid: 'mock'
      });

      await fetchAllUsers();
    };

    init();
  }, [dynamicRoles]);

  const handleRefresh = async () => {
    await fetchAllUsers();
  };

  // Theme-based classes matching user homepage
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const sidebarBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const sidebarTextClass = darkMode ? 'text-gray-200' : 'text-gray-900';
  const sidebarSubtextClass = darkMode ? 'text-gray-500' : 'text-gray-400';
  const navButtonActiveClass = darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black';
  const navButtonInactiveClass = darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const headerTextClass = darkMode ? 'text-white' : 'text-gray-900';
  const mobileHeaderBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const mobileHeaderTextClass = darkMode ? 'text-white' : 'text-gray-900';
  const buttonBgClass = darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
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

  const tabs = TABS || [];

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Mobile Header with Hamburger on Right */}
      <div className={`md:hidden fixed top-0 left-0 right-0 ${mobileHeaderBgClass} px-4 py-3 flex items-center justify-between z-50`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <img src={logo} className="w-5 h-5" alt="logo" />
          </div>
          <span className={`font-semibold ${mobileHeaderTextClass}`}>e-CARD Admin</span>
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
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <img src={logo} className="w-6 h-6" alt="logo" />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${sidebarTextClass}`}>e-CARD Admin</div>
                    <div className={`text-[9px] ${sidebarSubtextClass}`}>Dashboard</div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 overflow-y-auto">
                {tabs.map(tab => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-all ${
                        active ? navButtonActiveClass : navButtonInactiveClass
                      }`}
                    >
                      {tab.icon}
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Info & Logout */}
              <div className={`p-4 ${borderClass}`}>
                <div className="flex items-center gap-3 mb-3">
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
                <button
                  onClick={async () => {
                    await signOut(auth);
                    navigate('/login');
                  }}
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

      {/* Desktop Sidebar - Left side */}
      <div className={`hidden md:flex w-64 ${sidebarBgClass} fixed left-0 top-0 bottom-0 flex-col`}>
        {/* LOGO */}
        <div className={`p-5 ${borderClass}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <img src={logo} className="w-6 h-6" alt="logo" />
            </div>
            <div>
              <div className={`text-sm font-bold ${sidebarTextClass}`}>e-CARD Admin</div>
              <div className={`text-[9px] ${sidebarSubtextClass}`}>Dashboard</div>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition ${
                  active ? navButtonActiveClass : navButtonInactiveClass
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className={`p-4 ${borderClass}`}>
          <div className="flex items-center gap-3 mb-3">
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
          <button
            onClick={async () => {
              await signOut(auth);
              navigate('/login');
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 ${buttonBgClass} rounded-lg text-sm font-medium transition`}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        {/* HEADER with Dark Mode Toggle (Desktop - top right corner) */}
        <div className="hidden md:block sticky top-0 z-40 bg-transparent pt-6 pb-2">
          <div className="max-w-6xl mx-auto px-8">
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

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {/* Page Title */}
          {/* <div className="mb-6">
            <h1 className={`text-xl md:text-2xl font-bold capitalize ${headerTextClass}`}>{activeTab}</h1>
          </div> */}

          {/* CONTENT */}
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