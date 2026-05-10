// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import Login from './user/pages/Login';
import Home from './user/pages/Home';
import UpdateProfile from './user/pages/UpdateProfile';
import ViewQr from './user/pages/ViewQr';
import SelectLayout from './user/pages/SelectLayout';
import Pending from './user/pages/Pending';

// ─── Protected Route ──────────────────────────────────────────────────────────
// Only lets 'approved' users through. Pending users get redirected to /pending.
const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'approved' | 'pending' | 'unauthenticated'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setStatus('unauthenticated');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // No Firestore doc yet (rare edge case) — send back to login
          setStatus('unauthenticated');
          return;
        }

        const accountStatus = userDoc.data()?.accountStatus;
        if (accountStatus === 'approved') {
          setStatus('approved');
        } else {
          // pending, rejected, or anything else
          setStatus('pending');
        }
      } catch (err) {
        console.error('ProtectedRoute error:', err);
        setStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (status === 'pending') return <Navigate to="/pending" replace />;

  return children;
};

// ─── Pending Route ────────────────────────────────────────────────────────────
// Only lets non-approved authenticated users through.
// Approved users get pushed to /home; unauthenticated to /login.
const PendingRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setStatus('unauthenticated');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setStatus('unauthenticated');
          return;
        }

        const accountStatus = userDoc.data()?.accountStatus;
        if (accountStatus === 'approved') {
          setStatus('approved');
        } else {
          setStatus('pending');
        }
      } catch (err) {
        console.error('PendingRoute error:', err);
        setStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (status === 'approved') return <Navigate to="/home" replace />;

  return children;
};

// ─── Public Route ─────────────────────────────────────────────────────────────
// Redirects already-authenticated users away from /login.
const PublicRoute = ({ children }) => {
  const [state, setState] = useState('loading'); // 'loading' | 'approved' | 'pending' | 'guest'

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
          setState('guest');
          return;
        }

        const accountStatus = userDoc.data()?.accountStatus;
        if (accountStatus === 'approved') {
          setState('approved');
        } else {
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
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'approved') return <Navigate to="/home" replace />;
  if (state === 'pending') return <Navigate to="/pending" replace />;

  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — redirects away if already logged in */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Pending — only for authenticated but not-yet-approved users */}
        <Route path="/pending" element={
          <ProtectedRoute>
            <Pending />
          </ProtectedRoute>
        } />

        {/* Protected — only for approved users */}
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