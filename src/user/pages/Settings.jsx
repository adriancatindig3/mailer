// src/user/pages/Settings.jsx

import { useState, useEffect } from 'react';
import { signOut, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, LogOut, AlertTriangle, X, Moon } from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Apply / remove the `dark` class on <html> whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    setDeleteError('');
  };
const handleDeleteAccount = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    setDeleteError('No user is currently signed in.');
    return;
  }

  setDeleteLoading(true);
  setDeleteError('');

  try {
    // Store the current user's UID before reauthentication
    const originalUid = currentUser.uid;
    
    // Create a fresh provider instance
    const provider = new GoogleAuthProvider();
    
    // Add custom parameters to ensure we get a fresh popup
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Re-authenticate with popup and wait for it to complete
    const result = await reauthenticateWithPopup(currentUser, provider);
    
    // Verify the reauthenticated user matches the original user
    if (result.user.uid !== originalUid) {
      throw new Error('User mismatch after reauthentication');
    }
    
    // Get the latest user instance
    const user = auth.currentUser;
    if (!user || user.uid !== originalUid) {
      throw new Error('User session changed during reauthentication');
    }
    
    const uid = user.uid;

    // Delete main user Firestore document
    await deleteDoc(doc(db, 'users', uid));

    // Delete all related data
    const relatedCollections = ['qr_codes', 'scans', 'analytics'];
    for (const colName of relatedCollections) {
      try {
        const q = query(collection(db, colName), where('uid', '==', uid));
        const snapshot = await getDocs(q);
        const deletions = snapshot.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletions);
      } catch (err) {
        console.warn(`Error deleting from ${colName}:`, err);
        // Continue with other collections even if one fails
      }
    }

    // Delete Firebase Auth account
    await deleteUser(user);

    // Clear local storage and redirect
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login', { replace: true });

  } catch (error) {
    console.error('Delete account error:', error);
    
    // More specific error handling
    if (error.code === 'auth/popup-closed-by-user') {
      setDeleteError('The popup was closed before completing authentication. Please try again.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      setDeleteError('Authentication was cancelled. Please try again.');
    } else if (error.code === 'auth/network-request-failed') {
      setDeleteError('Network error. Please check your connection and try again.');
    } else if (error.code === 'auth/user-mismatch') {
      setDeleteError('User session changed. Please sign out and sign back in before deleting your account.');
    } else if (error.code === 'auth/too-many-requests') {
      setDeleteError('Too many attempts. Please try again later.');
    } else if (error.code === 'auth/requires-recent-login') {
      setDeleteError('Your session has expired. Please sign out and sign back in, then try again.');
    } else if (error.message === 'User mismatch after reauthentication') {
      setDeleteError('Authentication user mismatch. Please sign out and sign back in.');
    } else {
      setDeleteError(`Failed to delete account: ${error.message || 'Unknown error'}. Please try again.`);
    }
  } finally {
    setDeleteLoading(false);
  }
};

  const canDelete = deleteConfirmText === 'DELETE';

  // Reusable toggle
  const Toggle = ({ value, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-all duration-200 relative shadow-inner
        ${value ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-600'}`}
    >
      <div
        className={`w-5 h-5 rounded-full absolute top-0.5 transition-all duration-200 shadow-sm
          ${value
            ? 'right-0.5 bg-white dark:bg-gray-900'
            : 'left-0.5 bg-white dark:bg-gray-400'
          }`}
      />
    </button>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account preferences</p>
        </div>

        <div className="max-w-2xl space-y-4">

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-50 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-gray-400 dark:text-gray-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Push Notifications</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Receive updates about your QR scans</p>
                </div>
                <Toggle value={notifications} onToggle={() => setNotifications(!notifications)} />
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Email Updates</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Get weekly reports and tips</p>
                </div>
                <Toggle value={emailUpdates} onToggle={() => setEmailUpdates(!emailUpdates)} />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-50 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Moon size={18} className="text-gray-400 dark:text-gray-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Appearance</h2>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Dark Mode</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Switch to a darker interface</p>
                </div>
                <Toggle value={darkMode} onToggle={() => setDarkMode(!darkMode)} />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-50 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-400 dark:text-gray-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Account</h2>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Account Deletion</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 shadow-sm"
          >
            <LogOut size={16} />
            {loading ? 'Signing out…' : 'Sign Out'}
          </button>

        </div>
      </motion.div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle size={15} className="text-red-500 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Delete account</h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  This will permanently delete your account, profile, and all associated data.{' '}
                  <span className="font-medium text-gray-900 dark:text-white">This cannot be undone.</span>
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                  You'll be asked to sign in with Google to confirm your identity before deletion.
                </p>

                {/* Type DELETE */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Type <span className="font-semibold text-gray-800 dark:text-gray-200">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-300 dark:focus:border-red-500 transition"
                  />
                </div>

                {/* Error */}
                {deleteError && (
                  <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                    {deleteError}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!canDelete || deleteLoading}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    'Delete account'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Settings;

//current