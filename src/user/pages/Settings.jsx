// src/user/pages/Settings.jsx

import { useState } from 'react';
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, LogOut, AlertTriangle, X } from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      localStorage.removeItem('user');
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
    setPassword('');
    setDeleteError('');
  };

  const handleDeleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setDeleteLoading(true);
    setDeleteError('');

    try {
      // Re-authenticate (Firebase requires recent login before deletion)
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete Firestore document first
      await deleteDoc(doc(db, 'users', currentUser.uid));

      // Delete Firebase Auth account
      await deleteUser(currentUser);

      // Clear local data and redirect
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login', { replace: true });

    } catch (error) {
      console.error('Delete account error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setDeleteError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setDeleteError('Too many attempts. Please try again later.');
      } else if (error.code === 'auth/requires-recent-login') {
        setDeleteError('Session expired. Please sign out and sign back in first.');
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const canDelete = deleteConfirmText === 'DELETE' && password.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account preferences</p>
        </div>

        <div className="max-w-2xl space-y-4">
          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-gray-400" />
                <h2 className="font-semibold text-gray-900">Notifications</h2>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Push Notifications</p>
                  <p className="text-xs text-gray-400 mt-0.5">Receive updates about your QR scans</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-11 h-6 rounded-full transition-all duration-200 relative shadow-inner ${notifications ? 'bg-gray-900' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-sm ${notifications ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Email Updates</p>
                  <p className="text-xs text-gray-400 mt-0.5">Get weekly reports and tips</p>
                </div>
                <button
                  onClick={() => setEmailUpdates(!emailUpdates)}
                  className={`w-11 h-6 rounded-full transition-all duration-200 relative shadow-inner ${emailUpdates ? 'bg-gray-900' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-sm ${emailUpdates ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-400" />
                <h2 className="font-semibold text-gray-900">Account</h2>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Account Deletion</p>
                  <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-500 hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out — always at the bottom */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition disabled:opacity-50 shadow-sm"
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
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle size={15} className="text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Delete account</h3>
                </div>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  This will permanently delete your account, profile, and all associated data.{' '}
                  <span className="font-medium text-gray-900">This cannot be undone.</span>
                </p>

                {/* Password re-auth */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Enter your password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setDeleteError(''); }}
                    placeholder="Your password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-300 transition"
                  />
                </div>

                {/* Type DELETE */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Type <span className="font-semibold text-gray-800">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-300 transition"
                  />
                </div>

                {/* Error */}
                {deleteError && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {deleteError}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition font-medium"
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