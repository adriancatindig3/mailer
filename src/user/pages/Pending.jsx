// src/user/pages/Pending.jsx

import { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Mail } from 'lucide-react';

function Pending() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/login', { replace: true });
        return;
      }
      setUser(firebaseUser);
      setLoading(false);

      const userRef = doc(db, 'users', firebaseUser.uid);
      const unsubscribeDoc = onSnapshot(userRef, (snapshot) => {
        if (!snapshot.exists()) return;
        const status = snapshot.data()?.accountStatus;
        if (status === 'approved') navigate('/home', { replace: true });
        else if (status === 'rejected') navigate('/rejected', { replace: true });
      });

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm p-7"
      >
        {/* Animated clock icon */}
        <div className="flex justify-center mb-7">
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.55, 1], opacity: [0.18, 0, 0.18] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-16 h-16 rounded-full bg-amber-100"
            />
            <motion.div
              animate={{ scale: [1, 1.28, 1], opacity: [0.25, 0, 0.25] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute w-16 h-16 rounded-full bg-amber-100"
            />
            <div className="relative w-14 h-14 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-xl font-bold text-gray-900 text-center leading-snug mb-2">
          Awaiting approval
        </h1>
        <p className="text-gray-400 text-xs text-center leading-relaxed mb-7">
          You'll be redirected automatically once an admin approves your account.
        </p>

        {/* User pill */}
        {user && (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                {user.displayName?.[0] ?? '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{user.displayName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Mail size={10} className="text-gray-400 flex-shrink-0" />
                <p className="text-[0.7rem] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <span className="flex-shrink-0 text-[0.65rem] font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full tracking-wide uppercase">
              Pending
            </span>
          </div>
        )}

        {/* Live listener indicator */}
        <div className="flex items-center gap-2 mb-6 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <p className="text-[0.72rem] text-gray-400">Listening for approval — no need to refresh</p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-xs font-medium hover:bg-gray-50 hover:text-gray-700 transition-all duration-150 disabled:opacity-40"
        >
          <LogOut size={14} />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </motion.div>

      <p className="text-[0.65rem] text-gray-300 mt-5 text-center">
        © 2026 e-CARD · City College of Calamba
      </p>
    </div>
  );
}

export default Pending;