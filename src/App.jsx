// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, cloneElement } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import { motion } from 'framer-motion';
import Login from './user/pages/Login';
import Home from './user/pages/Home';
import UpdateProfile from './user/pages/UpdateProfile';
import ViewQr from './user/pages/ViewQr';
import SelectLayout from './user/pages/SelectLayout';

// ─── Pending Screen ──────────────────────────────────────────────────────────
const PendingScreen = ({ user }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center"
    >
      {/* Spinning clock */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-4 border-gray-100 border-t-gray-900 absolute inset-0"
          />
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center absolute inset-0">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Hi <span className="font-medium text-gray-700">{user?.displayName || 'there'}</span>, your account is currently under review.
        The administrator will approve your registration shortly.
      </p>

      {/* Status steps */}
      <div className="text-left space-y-3 mb-6">
        {[
          { label: 'Account registered', done: true },
          { label: 'Waiting for admin approval', done: false, active: true },
          { label: 'Access granted', done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.done ? 'bg-green-100' : step.active ? 'bg-yellow-100' : 'bg-gray-100'
            }`}>
              {step.done ? (
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : step.active ? (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-yellow-500"
                />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              )}
            </div>
            <span className={`text-sm ${
              step.done ? 'text-green-700 font-medium' :
              step.active ? 'text-yellow-700 font-medium' :
              'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
        <p className="text-xs text-gray-500 leading-relaxed">
          📧 <span className="font-medium text-gray-700">{user?.email}</span>
          <br />
          Try logging in again after your account has been approved by the admin.
        </p>
      </div>

      <button
        onClick={() => auth.signOut()}
        className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
      >
        Sign out
      </button>
    </motion.div>
  </div>
);

// ─── Protected Route ─────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'approved' | 'pending' | 'unauthenticated'
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setStatus('unauthenticated');
        return;
      }

      setAuthUser(currentUser);

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setStatus('pending');
          return;
        }

        const accountStatus = (userDoc.data().accountStatus || '').toLowerCase();

        if (accountStatus === 'approved') {
          setStatus('approved');
        } else {
          // Pending, rejected, or anything else — block access
          setStatus('pending');
        }
      } catch (err) {
        console.error('ProtectedRoute error:', err);
        setStatus('pending');
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'pending') {
    return <PendingScreen user={authUser} />;
  }

  return children;
};

// ─── Public Route ─────────────────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const [state, setState] = useState('loading'); // 'loading' | 'authenticated' | 'pending' | 'guest'
  const [pendingUser, setPendingUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setState('guest');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // No record yet — sign them out and show login
          await auth.signOut();
          setState('guest');
          return;
        }

        const accountStatus = (userDoc.data().accountStatus || '').toLowerCase();

        if (accountStatus === 'approved') {
          setState('authenticated');
        } else {
          // Pending or rejected — sign out and keep on login page with message
          setPendingUser({ ...currentUser, accountStatus: userDoc.data().accountStatus });
          await auth.signOut();
          setState('pending');
        }
      } catch (err) {
        console.error('PublicRoute error:', err);
        setState('guest');
      }
    });

    return () => unsubscribe();
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (state === 'authenticated') {
    return <Navigate to="/home" replace />;
  }

  // Pass pending info as props to Login so it can show the message
  if (state === 'pending') {
    return cloneElement(children, { pendingUser });
  }

  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/updateprofile" element={
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        } />
        <Route path="/viewqr" element={
          <ProtectedRoute>
            <ViewQr />
          </ProtectedRoute>
        } />
        <Route path="/selectlayout" element={
          <ProtectedRoute>
            <SelectLayout />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;