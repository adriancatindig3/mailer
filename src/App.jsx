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
import Rejected from './user/pages/Rejected';
import Deleted from './user/pages/Deleted';
import AdminDashboard from './admin/AdminDashboard';

// Protected route that checks if user is approved
const ProtectedRoute = ({ children }) => {
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
              setStatus('approved');
            } else if (accountStatus === 'rejected') {
              setStatus('rejected');
            } else if (accountStatus === 'deleted') {
              setStatus('deleted');
            } else {
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
  if (status === 'rejected') return <Navigate to="/rejected" replace />;
  if (status === 'deleted') return <Navigate to="/deleted" replace />;
  
  return children;
};

// Redirects logged-in users away from /login
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

// Route for pending page
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
              setStatus('approved');
            } else if (accountStatus === 'rejected') {
              setStatus('rejected');
            } else if (accountStatus === 'deleted') {
              setStatus('deleted');
            } else {
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
  if (status === 'rejected') return <Navigate to="/rejected" replace />;
  if (status === 'deleted') return <Navigate to="/deleted" replace />;
  
  return <Pending />;
};

// Route for rejected page
const RejectedRoute = () => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const accountStatus = userDoc.data()?.accountStatus;
            if (accountStatus === 'rejected') {
              setStatus('rejected');
            } else if (accountStatus === 'approved') {
              setStatus('approved');
            } else if (accountStatus === 'deleted') {
              setStatus('deleted');
            } else {
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
  if (status === 'pending') return <Navigate to="/pending" replace />;
  if (status === 'deleted') return <Navigate to="/deleted" replace />;
  
  return <Rejected />;
};

// Route for deleted page
const DeletedRoute = () => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const accountStatus = userDoc.data()?.accountStatus;
            if (accountStatus === 'deleted') {
              setStatus('deleted');
            } else if (accountStatus === 'approved') {
              setStatus('approved');
            } else if (accountStatus === 'rejected') {
              setStatus('rejected');
            } else {
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
        // Check URL param for deleted flag
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('deleted') === 'true') {
          setStatus('deleted');
        } else {
          setStatus('unauthenticated');
        }
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

  if (status === 'approved') return <Navigate to="/home" replace />;
  if (status === 'pending') return <Navigate to="/pending" replace />;
  if (status === 'rejected') return <Navigate to="/rejected" replace />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  
  return <Deleted />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/pending" element={<PendingRoute />} />
        <Route path="/rejected" element={<RejectedRoute />} />
        <Route path="/deleted" element={<DeletedRoute />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/updateprofile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
        <Route path="/viewqr" element={<ProtectedRoute><ViewQr /></ProtectedRoute>} />
        <Route path="/selectlayout" element={<ProtectedRoute><SelectLayout /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;