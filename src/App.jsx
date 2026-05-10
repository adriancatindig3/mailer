// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Login from './user/pages/Login';
import Home from './user/pages/Home';
import UpdateProfile from './user/pages/UpdateProfile';
import ViewQr from './user/pages/ViewQr';
import SelectLayout from './user/pages/SelectLayout';
import Pending from './user/pages/Pending';

// Protected route that checks if user is approved
const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is approved
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const accountStatus = userDoc.data()?.accountStatus;
            if (accountStatus === 'approved') {
              setStatus('approved');
            } else {
              // User is pending, redirect to pending page
              setStatus('pending');
            }
          } else {
            setStatus('unauthenticated');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setStatus('unauthenticated');
        }
      } else {
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
  
  // Only show children if status is 'approved'
  return children;
};

// Redirects logged-in users away from /login only (not /pending)
const PublicRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStatus(user ? 'authenticated' : 'guest');
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

  if (status === 'authenticated') return <Navigate to="/home" replace />;

  return children;
};

// Protected route for pending page - redirects to home if approved
const PendingRoute = () => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const accountStatus = userDoc.data()?.accountStatus;
            if (accountStatus === 'approved') {
              // User is approved, redirect to home
              setStatus('approved');
            } else {
              // User is still pending
              setStatus('pending');
            }
          } else {
            setStatus('unauthenticated');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setStatus('unauthenticated');
        }
      } else {
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
  
  // Only show pending page if status is 'pending'
  return <Pending />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/pending" element={<PendingRoute />} />

        <Route path="/"             element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home"         element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/updateprofile"element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
        <Route path="/viewqr"       element={<ProtectedRoute><ViewQr /></ProtectedRoute>} />
        <Route path="/selectlayout" element={<ProtectedRoute><SelectLayout /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;