// src/user/pages/Pending.jsx - Static UI only

import { motion } from 'framer-motion';

function Pending() {
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
          Account Pending Approval
        </h1>
        <p className="text-gray-500 text-sm text-center leading-relaxed mb-6">
          Your account is currently under review by an administrator.
        </p>
        <p className="text-gray-400 text-xs text-center leading-relaxed mb-7">
          You'll be able to access your dashboard once your account is approved.
        </p>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <p className="text-xs text-gray-400">Waiting for admin approval</p>
        </div>

        {/* Note */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-[0.7rem] text-gray-400 text-center">
            Please check back later or contact the administrator.
          </p>
        </div>
      </motion.div>

      <p className="text-[0.65rem] text-gray-300 mt-5 text-center">
        © 2026 e-CARD · City College of Calamba
      </p>
    </div>
  );
}

export default Pending;