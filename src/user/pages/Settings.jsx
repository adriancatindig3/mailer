// src/user/pages/Settings.jsx

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Mail, User, Trash2, LogOut, Shield } from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature coming soon');
    }
  };

  return (
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
                className={`w-11 h-6 rounded-full transition-all duration-200 ${
                  notifications ? 'bg-gray-900' : 'bg-gray-200'
                } relative shadow-inner`}
              >
                <div 
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-sm ${
                    notifications ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="font-medium text-gray-900 text-sm">Email Updates</p>
                <p className="text-xs text-gray-400 mt-0.5">Get weekly reports and tips</p>
              </div>
              <button
                onClick={() => setEmailUpdates(!emailUpdates)}
                className={`w-11 h-6 rounded-full transition-all duration-200 ${
                  emailUpdates ? 'bg-gray-900' : 'bg-gray-200'
                } relative shadow-inner`}
              >
                <div 
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-sm ${
                    emailUpdates ? 'right-0.5' : 'left-0.5'
                  }`}
                />
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
          
          <div className="p-5 space-y-3">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-100 transition-all duration-200"
            >
              <LogOut size={16} />
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-lg font-medium text-sm hover:bg-red-100 transition-all duration-200"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-gray-400" />
              <h2 className="font-semibold text-gray-900">Security</h2>
            </div>
          </div>
          
          <div className="p-5">
            <button className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <span className="text-sm font-medium text-gray-700">Change Password</span>
              <span className="text-xs text-gray-400">→</span>
            </button>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Last login: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 text-center">
            <p className="text-xs font-mono text-gray-400">ProfileQR v1.0.0</p>
            <p className="text-[10px] text-gray-300 mt-1">© 2024 ProfileQR. All rights reserved.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Settings;