// src/user/pages/ViewQr.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import QRCodeLib from 'react-qr-code';
const QRCode = QRCodeLib.default || QRCodeLib.QRCode || QRCodeLib;
import html2canvas from 'html2canvas';
import { Download, Copy, Check, Wifi, Smartphone } from 'lucide-react';

function ViewQr() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState({ name: '', email: '', profileUrl: '' });
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrContainerRef = useRef(null);

  const getProfileUrl = (userId) => `https://ccc-e-card.netlify.app/profile/${userId}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }
      setUser(currentUser);

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const data = userDoc.exists() ? userDoc.data() : {};

        setQrData({
          name: data.displayName || currentUser.displayName || 'User',
          email: currentUser.email || '',
          profileUrl: getProfileUrl(currentUser.uid),
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setQrData({
          name: currentUser.displayName || 'User',
          email: currentUser.email || '',
          profileUrl: getProfileUrl(currentUser.uid),
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrData.profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    if (!qrContainerRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(qrContainerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `e-CARD_${qrData.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4 md:py-6">

        {/* Main QR Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900" />

          <div className="p-5 md:p-8">
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Your QR Code</h2>
              <p className="text-xs md:text-sm text-gray-500">Scan to instantly view your digital card</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center mb-6">
              <div
                ref={qrContainerRef}
                className="p-4 bg-white rounded-xl shadow-md border border-gray-100 mb-4"
              >
                <QRCode
                  value={qrData.profileUrl}
                  size={200}
                  level="L"
                  bgColor="#ffffff"
                  fgColor="#111111"
                />
              </div>

              {/* User Info */}
              <div className="text-center mb-4">
                <div className="text-base font-semibold text-gray-900 mb-0.5">{qrData.name}</div>
                <div className="text-xs text-gray-500">{qrData.email}</div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadQR}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download QR as PNG
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Profile Link */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Wifi size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shareable Link</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[180px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <code className="text-xs text-gray-600 font-mono break-all">
                    {qrData.profileUrl}
                  </code>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                <Smartphone size={14} className="text-gray-600" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                This QR code links directly to your e-CARD profile. Anyone who scans it can view your digital identity card instantly.{' '}
                <span className="font-semibold text-gray-700">NFC ready</span> — tap to share!
              </p>
            </div>

            {/* Features */}
            <div className="flex justify-center gap-4 flex-wrap">
              {['Tap to Share', 'No App Needed', 'Real-time'].map((feature, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span className="text-[10px] md:text-xs text-gray-500">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">
            © 2026 e-CARD · NFC Digital Business Card Platform · City College of Calamba
          </p>
        </div>

      </div>
    </div>
  );
}

export default ViewQr;