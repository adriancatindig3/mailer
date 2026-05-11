import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub,
  FaYoutube, FaGlobe, FaTiktok, FaPinterest, FaReddit,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaCalendar,
  FaCheckCircle, FaUser, FaBriefcase, FaShareAlt, FaLink,
  FaTimes
} from 'react-icons/fa';

const FloatingConnectForm = ({
  showConnectForm, setShowConnectForm,
  userData,
  connectName, setConnectName,
  connectEmail, setConnectEmail,
  connectCompany, setConnectCompany,
  connectPhone, setConnectPhone,
  message, setMessage,
  handleConnectSubmit,
  isSending, sendSuccess, sendError,
  darkMode = true,
}) => {
  const nameInputRef = useRef(null);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (showConnectForm && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [showConnectForm]);

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    let digits = value.replace(/\D/g, '');
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    setConnectPhone(digits);
    if (digits.length > 0 && digits.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handlePhoneBlur = () => {
    if (connectPhone.length > 0 && connectPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    }
  };

  const isFormValid = () => {
    if (connectPhone.length > 0 && connectPhone.length !== 10) {
      return false;
    }
    return true;
  };

  if (!showConnectForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl animate-slideUp overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Connect with {userData?.displayName?.split(' ')[0] || 'User'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fill out the form below to send a message
              </p>
            </div>
            <button
              onClick={() => setShowConnectForm(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all -mt-1 -mr-1"
              type="button"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {sendSuccess ? (
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900">
              Request Sent!
            </h3>
            <p className="text-sm text-gray-600">
              Your connection request has been sent successfully.
            </p>
          </div>
        ) : (
          <div className="px-6 py-5">
            {sendError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-600">{sendError}</p>
              </div>
            )}
            
            <form onSubmit={handleConnectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={connectName}
                  onChange={e => setConnectName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={connectEmail}
                  onChange={e => setConnectEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Company Name <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={connectCompany}
                  onChange={e => setConnectCompany(e.target.value)}
                  placeholder="Your company"
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Phone Number <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="flex items-stretch">
                  <span className="inline-flex items-center px-3 py-2 text-sm rounded-l-lg bg-gray-100 text-gray-600 border border-r-0 border-gray-200 whitespace-nowrap">
                    +63
                  </span>
                  <input
                    type="tel"
                    value={connectPhone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    placeholder="9123456789"
                    className={`w-full px-3 py-2 text-sm rounded-r-lg outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400 border ${
                      phoneError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Enter 10 digits (e.g., 9123456789)
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`What would you like to say to ${userData?.displayName?.split(' ')[0] || 'them'}?`}
                  required
                  rows="3"
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all resize-none bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSending || !!phoneError || !isFormValid()}
                className="w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isSending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaEnvelope className="w-3.5 h-3.5" />
                    Send Connection Request
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PublicProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolLogo, setSchoolLogo] = useState('/CCC.png'); // Add state for school logo
  const { userId } = useParams();
  const navigate = useNavigate();

  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connectEmail, setConnectEmail] = useState('');
  const [connectName, setConnectName] = useState('');
  const [connectCompany, setConnectCompany] = useState('');
  const [connectPhone, setConnectPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');

  // Fetch school logo from Firestore
  useEffect(() => {
    const fetchSchoolLogo = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'school'));
        if (settingsDoc.exists() && settingsDoc.data().logoURL) {
          setSchoolLogo(settingsDoc.data().logoURL);
        }
      } catch (error) {
        console.error('Error fetching school logo:', error);
      }
    };
    fetchSchoolLogo();
  }, []);

  useEffect(() => {
    const handleEscapeKey = e => {
      if (e.key === 'Escape' && showConnectForm) setShowConnectForm(false);
    };
    if (showConnectForm) document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showConnectForm]);

  const handleConnectSubmit = async e => {
    e.preventDefault();
    if (!connectEmail.trim() || !connectName.trim()) {
      setSendError('Please fill in all required fields.');
      return;
    }
    if (!userData?.email) {
      setSendError('Profile owner has no email address configured.');
      return;
    }
    setIsSending(true);
    setSendError('');
    
    try {
      const response = await fetch('/.netlify/functions/sendMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorEmail: connectEmail,
          visitorName: connectName,
          visitorCompany: connectCompany,
          visitorPhone: connectPhone,
          visitorMessage: message,
          ownerEmail: userData.email,
          ownerName: userData.displayName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSending(false);
        setSendSuccess(true);
        setTimeout(() => {
          setSendSuccess(false);
          setShowConnectForm(false);
          setConnectEmail('');
          setConnectName('');
          setConnectCompany('');
          setConnectPhone('');
          setMessage('');
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch (err) {
      setIsSending(false);
      setSendError('Failed to send. Please try again.');
      console.error('Email error:', err);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) { navigate('/'); return; }
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) { setError('User not found'); setLoading(false); return; }
        const data = userDoc.data();
        const allSocialLinks = {
          facebook: data.socialLinks?.facebook || '',
          twitter: data.socialLinks?.twitter || '',
          instagram: data.socialLinks?.instagram || '',
          linkedin: data.socialLinks?.linkedin || '',
          github: data.socialLinks?.github || '',
          youtube: data.socialLinks?.youtube || '',
          website: data.socialLinks?.website || '',
          ...data.socialLinks,
        };
        setUserData({
          displayName: data.displayName || 'User',
          email: data.email || '',
          photoURL: data.photoURL || '',
          bio: data.bio || '',
          location: data.location || '',
          phoneNumber: data.phoneNumber || '',
          occupation: data.occupation || '',
          company: data.company || 'City College of Calamba',
          companyLogo: '/CCC.png',
          joinDate: data.joinDate || '',
          socialLinks: allSocialLinks,
          selectedLayout: data.selectedLayout || 1,
          coverPhotoURL: data.coverPhotoURL || '',
          createdAt: data.createdAt || '',
          skills: data.skills || '',
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId, navigate]);

  // ─── Shared helpers ─────────────────────────────────────────────────────────
  const getSocialIcon = platform => {
    const icons = {
      facebook: <FaFacebook className="w-3 h-3" />,
      twitter: <FaTwitter className="w-3 h-3" />,
      instagram: <FaInstagram className="w-3 h-3" />,
      linkedin: <FaLinkedin className="w-3 h-3" />,
      github: <FaGithub className="w-3 h-3" />,
      youtube: <FaYoutube className="w-3 h-3" />,
      website: <FaGlobe className="w-3 h-3" />,
      tiktok: <FaTiktok className="w-3 h-3" />,
      pinterest: <FaPinterest className="w-3 h-3" />,
      reddit: <FaReddit className="w-3 h-3" />,
    };
    return icons[platform] || <FaLink className="w-3 h-3" />;
  };

  const getInitials = name => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // Updated SchoolLogo component to use dynamic logo
  const SchoolLogo = ({ className = 'w-3 h-3', style = {} }) => (
    <img 
      src={schoolLogo} 
      alt="School logo" 
      className={`object-contain ${className}`} 
      style={style}
      onError={(e) => {
        e.target.src = '/CCC.png';
      }}
    />
  );

  // ─── Universal Connect Button ───────────────────────────────────────────────
  const ConnectButton = ({ onClick, dark = true }) => (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        dark 
          ? 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white'
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        <FaEnvelope className="w-4 h-4" />
        Let's connect
      </span>
    </button>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 1 - Dark Green Theme (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout1 = () => (
    <div className="w-full font-['Inter'] text-white" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)' }}>
      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#2a3f2a', border: '2px solid rgba(255,255,255,0.2)' }}>
            {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold" style={{ background: '#3a5a3a' }}>{getInitials(userData?.displayName)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white mb-1 truncate">{userData?.displayName}</h1>
            {userData?.occupation && <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{userData.occupation}</p>}
            {userData?.company && <div className="flex items-center gap-1 mt-1"><SchoolLogo className="w-3 h-3" style={{ opacity: 0.8 }} /><span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{userData.company}</span></div>}
          </div>
        </div>
        {userData?.bio && <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{userData.bio}</p>}
        <div className="flex justify-around py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-center"><div className="text-lg font-bold">{userData?.skills?.split(',').length || 0}</div><div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Skills</div></div>
          <div className="text-center"><div className="text-lg font-bold">{Object.values(userData?.socialLinks || {}).filter(Boolean).length}</div><div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Links</div></div>
        </div>
      </div>
      <div className="px-4 pb-6 space-y-3">
        {userData?.skills && <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}><h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Skills</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').map((s, i) => <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>{s.trim()}</span>)}</div></div>}
        {(userData?.email || userData?.phoneNumber) && <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}><h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}><FaEnvelope /><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}><FaPhone /><span>{userData.phoneNumber}</span></a>}</div></div>}
        {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}><h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect</h3><div className="grid grid-cols-4 gap-3">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}><div style={{ color: 'rgba(255,255,255,0.7)' }}>{getSocialIcon(p)}</div><span className="text-[9px] capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{p}</span></a>)}</div></div>}
        <ConnectButton onClick={() => setShowConnectForm(true)} dark={true} />
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 2 - Dark Navy Theme (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout2 = () => (
    <div className="w-full font-['Inter'] text-white" style={{ background: '#0f1623' }}>
      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#1e2d45', border: '2px solid rgba(255,255,255,0.15)' }}>
            {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold" style={{ background: '#2a3f5f' }}>{getInitials(userData?.displayName)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white mb-1 truncate">{userData?.displayName}</h1>
            {userData?.occupation && <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{userData.occupation}</p>}
            {userData?.company && <div className="flex items-center gap-1 mt-1"><SchoolLogo className="w-3 h-3" style={{ opacity: 0.8 }} /><span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{userData.company}</span></div>}
          </div>
        </div>
        {userData?.bio && <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>{userData.bio}</p>}
        <div className="flex justify-around py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-center"><div className="text-lg font-bold">{userData?.skills?.split(',').length || 0}</div><div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Skills</div></div>
          <div className="text-center"><div className="text-lg font-bold">{Object.values(userData?.socialLinks || {}).filter(Boolean).length}</div><div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Links</div></div>
        </div>
      </div>
      <div className="px-4 pb-6 space-y-3">
        {userData?.skills && <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}><h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Skills</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').map((s, i) => <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}>{s.trim()}</span>)}</div></div>}
        {(userData?.email || userData?.phoneNumber) && <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}><h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}><FaEnvelope /><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}><FaPhone /><span>{userData.phoneNumber}</span></a>}</div></div>}
        {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}><h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Connect</h3><div className="grid grid-cols-4 gap-3">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}><div style={{ color: 'rgba(255,255,255,0.65)' }}>{getSocialIcon(p)}</div><span className="text-[9px] capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>{p}</span></a>)}</div></div>}
        <ConnectButton onClick={() => setShowConnectForm(true)} dark={true} />
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 3 - Clean White Theme (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout3 = () => (
    <div className="w-full bg-white font-['Inter']">
      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
            {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-lg font-semibold">{getInitials(userData?.displayName)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">{userData?.displayName}</h1>
            {userData?.occupation && <p className="text-sm font-medium text-gray-600 truncate">{userData.occupation}</p>}
            {userData?.company && <div className="flex items-center gap-1 mt-1"><SchoolLogo className="w-3 h-3" /><span className="text-xs text-gray-400">{userData.company}</span></div>}
          </div>
        </div>
        {userData?.bio && <p className="text-sm text-gray-600 leading-relaxed mb-4">{userData.bio}</p>}
        <div className="flex justify-around py-3 border-y border-gray-100">
          <div className="text-center"><div className="text-lg font-bold text-gray-900">{userData?.skills?.split(',').length || 0}</div><div className="text-xs text-gray-400">Skills</div></div>
          <div className="text-center"><div className="text-lg font-bold text-gray-900">{Object.values(userData?.socialLinks || {}).filter(Boolean).length}</div><div className="text-xs text-gray-400">Links</div></div>
        </div>
      </div>
      <div className="px-4 pb-6 space-y-3">
        {userData?.skills && <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Skills</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').map((s, i) => <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200">{s.trim()}</span>)}</div></div>}
        {(userData?.email || userData?.phoneNumber) && <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm text-gray-700"><FaEnvelope className="text-gray-400" /><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm text-gray-700"><FaPhone className="text-gray-400" /><span>{userData.phoneNumber}</span></a>}</div></div>}
        {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Connect</h3><div className="grid grid-cols-4 gap-3">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-gray-200"><div className="text-gray-500">{getSocialIcon(p)}</div><span className="text-[9px] text-gray-400 capitalize">{p}</span></a>)}</div></div>}
        <ConnectButton onClick={() => setShowConnectForm(true)} dark={false} />
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 4 - Dark Green with Cover (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout4 = () => (
    <div className="w-full font-['Inter'] text-white" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)' }}>
      <div className="h-36 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2e1a, #0f1f0f)' }}>
        {userData?.coverPhotoURL && <img src={userData.coverPhotoURL} alt="" className="w-full h-full object-cover opacity-60" />}
      </div>
      <div className="px-6 py-4 relative" style={{ background: 'linear-gradient(135deg, #1a2e1a, #0f1f0f)' }}>
        <div className="w-20 h-20 rounded-2xl overflow-hidden absolute -top-10 left-6 border-4" style={{ borderColor: '#0f1f0f', background: '#2a3f2a' }}>
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold" style={{ background: '#3a5a3a' }}>{getInitials(userData?.displayName)}</div>}
        </div>
        <div className="pt-12">
          <h1 className="text-xl font-bold text-white mb-1">{userData?.displayName}</h1>
          {userData?.occupation && <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{userData.occupation}</p>}
          {userData?.company && <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}><SchoolLogo className="w-4 h-4" style={{ opacity: 0.8 }} /><span>{userData.company}</span></div>}
          {userData?.bio && <p className="text-sm leading-relaxed mb-4 pb-4" style={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{userData.bio}</p>}
          {userData?.skills && <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Expertise</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').slice(0, 6).map((s, i) => <span key={i} className="px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>{s.trim()}</span>)}</div></div>}
          {(userData?.email || userData?.phoneNumber) && <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}><FaEnvelope style={{ color: 'rgba(255,255,255,0.5)' }} /></div><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}><FaPhone style={{ color: 'rgba(255,255,255,0.5)' }} /></div><span>{userData.phoneNumber}</span></a>}</div></div>}
          {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect</h3><div className="flex flex-wrap gap-2">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>{getSocialIcon(p)}</a>)}</div></div>}
          <ConnectButton onClick={() => setShowConnectForm(true)} dark={true} />
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 5 - Deep Slate Blue with Cover (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout5 = () => (
    <div className="w-full font-['Inter']" style={{ background: '#0d1b2e' }}>
      <div className="h-36 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1b2e, #1a3a5c)' }}>
        {userData?.coverPhotoURL && <img src={userData.coverPhotoURL} alt="" className="w-full h-full object-cover brightness-75" />}
      </div>
      <div className="px-6 py-4 relative" style={{ background: '#0d1b2e' }}>
        <div className="w-20 h-20 rounded-2xl overflow-hidden absolute -top-10 left-6" style={{ border: '4px solid #0d1b2e', background: 'linear-gradient(135deg, #1a3a5c, #0d1b2e)' }}>
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold" style={{ background: '#1a3a5c' }}>{getInitials(userData?.displayName)}</div>}
        </div>
        <div className="pt-12">
          <h1 className="text-xl font-bold text-white mb-1">{userData?.displayName}</h1>
          {userData?.occupation && <p className="text-sm font-medium mb-1" style={{ color: '#93b4d4' }}>{userData.occupation}</p>}
          {userData?.company && <div className="flex items-center gap-2 text-xs mb-4" style={{ color: '#5a8ab0' }}><SchoolLogo className="w-4 h-4" /><span>{userData.company}</span></div>}
          {userData?.bio && <p className="text-sm leading-relaxed mb-4 pb-4" style={{ color: '#93b4d4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{userData.bio}</p>}
          {userData?.skills && <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Expertise</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').slice(0, 6).map((s, i) => <span key={i} className="px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: '#93b4d4' }}>{s.trim()}</span>)}</div></div>}
          {(userData?.email || userData?.phoneNumber) && <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: '#93b4d4' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}><FaEnvelope style={{ color: '#5a8ab0' }} /></div><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: '#93b4d4' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}><FaPhone style={{ color: '#5a8ab0' }} /></div><span>{userData.phoneNumber}</span></a>}</div></div>}
          {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Connect</h3><div className="flex flex-wrap gap-2">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', color: '#93b4d4' }}>{getSocialIcon(p)}</a>)}</div></div>}
          <ConnectButton onClick={() => setShowConnectForm(true)} dark={true} />
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 6 - Clean White with Cover (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout6 = () => (
    <div className="w-full bg-white font-['Inter']">
      <div className="h-36 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1f2937, #111827)' }}>
        {userData?.coverPhotoURL && <img src={userData.coverPhotoURL} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="px-6 py-4 relative bg-white">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg absolute -top-10 left-6" style={{ background: 'linear-gradient(135deg, #374151, #111827)' }}>
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xl font-bold">{getInitials(userData?.displayName)}</div>}
        </div>
        <div className="pt-12">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{userData?.displayName}</h1>
          {userData?.occupation && <p className="text-sm text-gray-600 mb-1 font-medium">{userData.occupation}</p>}
          {userData?.company && <div className="flex items-center gap-2 text-xs text-gray-400 mb-4"><SchoolLogo className="w-4 h-4" /><span>{userData.company}</span></div>}
          {userData?.bio && <p className="text-sm text-gray-600 leading-relaxed mb-4 pb-4 border-b border-gray-100">{userData.bio}</p>}
          {userData?.skills && <div className="mb-4 pb-4 border-b border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Expertise</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').slice(0, 6).map((s, i) => <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs border border-gray-200">{s.trim()}</span>)}</div></div>}
          {(userData?.email || userData?.phoneNumber) && <div className="mb-4 pb-4 border-b border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm text-gray-700"><div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><FaEnvelope className="text-gray-500 text-xs" /></div><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm text-gray-700"><div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><FaPhone className="text-gray-500 text-xs" /></div><span>{userData.phoneNumber}</span></a>}</div></div>}
          {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div><h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Connect</h3><div className="flex flex-wrap gap-2">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">{getSocialIcon(p)}</a>)}</div></div>}
          <ConnectButton onClick={() => setShowConnectForm(true)} dark={false} />
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 7 - Dark Forest Vertical (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout7 = () => (
    <div className="w-full font-['Inter'] text-white" style={{ background: 'linear-gradient(160deg, #2a3a2a, #1a2a1e)' }}>
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 mb-3" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-green-900 text-white text-2xl font-medium">{getInitials(userData?.displayName)}</div>}
        </div>
        <h1 className="text-xl font-medium text-white mb-1">{userData?.displayName}</h1>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}{userData?.company}</p>
        <ConnectButton onClick={() => setShowConnectForm(true)} dark={true} />
        <div className="w-full mt-4 space-y-2">
          {userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}><FaPhone /></div><div className="flex-1"><div className="text-xs font-medium">Call me</div><div className="text-[11px] opacity-60">{userData.phoneNumber}</div></div><span className="text-xs opacity-40">↗</span></a>}
          {userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}><FaEnvelope /></div><div className="flex-1"><div className="text-xs font-medium">Email me</div><div className="text-[11px] opacity-60">{userData.email}</div></div><span className="text-xs opacity-40">↗</span></a>}
          {userData?.location && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(userData.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <FaMapMarkerAlt />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">View Location</div>
              </div>
              <span className="text-xs opacity-40">↗</span>
            </a>
          )}
          {Object.entries(userData?.socialLinks || {}).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>{getSocialIcon(p)}</div><div className="flex-1"><div className="text-xs font-medium capitalize">Follow me</div><div className="text-[11px] opacity-60">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div></div><span className="text-xs opacity-40">↗</span></a>)}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 8 - Dark Navy Vertical (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout8 = () => (
    <div className="w-full font-['Inter'] text-white" style={{ background: '#0f1623' }}>
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 mb-3" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-700 text-white text-2xl font-medium">{getInitials(userData?.displayName)}</div>}
        </div>
        <h1 className="text-xl font-medium text-white mb-1">{userData?.displayName}</h1>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>{userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}{userData?.company}</p>
        <ConnectButton onClick={() => setShowConnectForm(true)} dark={true} />
        <div className="w-full mt-4 space-y-2">
          {userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}><FaPhone /></div><div className="flex-1"><div className="text-xs font-medium">Call me</div><div className="text-[11px] opacity-55">{userData.phoneNumber}</div></div><span className="text-xs opacity-35">↗</span></a>}
          {userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}><FaEnvelope /></div><div className="flex-1"><div className="text-xs font-medium">Email me</div><div className="text-[11px] opacity-55">{userData.email}</div></div><span className="text-xs opacity-35">↗</span></a>}
          {userData?.location && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(userData.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <FaMapMarkerAlt />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">View Location</div>
              </div>
              <span className="text-xs opacity-35">↗</span>
            </a>
          )}
          {Object.entries(userData?.socialLinks || {}).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>{getSocialIcon(p)}</div><div className="flex-1"><div className="text-xs font-medium capitalize">Follow me</div><div className="text-[11px] opacity-55">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div></div><span className="text-xs opacity-35">↗</span></a>)}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT 9 - Clean White Vertical (from SelectLayout)
  // ═══════════════════════════════════════════════════════════════════════════
  const Layout9 = () => (
    <div className="w-full bg-white font-['Inter']">
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 mb-3">
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-2xl font-medium">{getInitials(userData?.displayName)}</div>}
        </div>
        <h1 className="text-xl font-medium text-gray-900 mb-1">{userData?.displayName}</h1>
        <p className="text-xs text-gray-500 mb-4">{userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}<span className="underline">{userData?.company}</span></p>
        <ConnectButton onClick={() => setShowConnectForm(true)} dark={false} />
        <div className="w-full mt-4 space-y-2">
          {userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-500"><FaPhone className="text-white text-xs" /></div><div className="flex-1"><div className="text-xs font-medium text-gray-900">Call me</div><div className="text-[11px] text-gray-500">{userData.phoneNumber}</div></div><span className="text-xs text-gray-400">↗</span></a>}
          {userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500"><FaEnvelope className="text-white text-xs" /></div><div className="flex-1"><div className="text-xs font-medium text-gray-900">Email me</div><div className="text-[11px] text-gray-500">{userData.email}</div></div><span className="text-xs text-gray-400">↗</span></a>}
          {userData?.location && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(userData.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500">
                <FaMapMarkerAlt className="text-white text-xs" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-900">View Location</div>
              </div>
              <span className="text-xs text-gray-400">↗</span>
            </a>
          )}
          {Object.entries(userData?.socialLinks || {}).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600"><span className="text-white text-xs">{getSocialIcon(p)}</span></div><div className="flex-1"><div className="text-xs font-medium text-gray-900 capitalize">Follow me</div><div className="text-[11px] text-gray-500">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div></div><span className="text-xs text-gray-400">↗</span></a>)}
        </div>
      </div>
    </div>
  );

  const layoutComponents = { 
    1: Layout1, 
    2: Layout2, 
    3: Layout3, 
    4: Layout4, 
    5: Layout5, 
    6: Layout6, 
    7: Layout7, 
    8: Layout8, 
    9: Layout9 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/30 rounded-2xl p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl font-medium text-gray-100 mb-2">Profile Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Go Home</button>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const SelectedLayout = layoutComponents[userData.selectedLayout] || Layout1;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>

      <FloatingConnectForm
        showConnectForm={showConnectForm}
        setShowConnectForm={setShowConnectForm}
        userData={userData}
        connectName={connectName}
        setConnectName={setConnectName}
        connectEmail={connectEmail}
        setConnectEmail={setConnectEmail}
        connectCompany={connectCompany}
        setConnectCompany={setConnectCompany}
        connectPhone={connectPhone}
        setConnectPhone={setConnectPhone}
        message={message}
        setMessage={setMessage}
        handleConnectSubmit={handleConnectSubmit}
        isSending={isSending}
        sendSuccess={sendSuccess}
        sendError={sendError}
        darkMode={userData.selectedLayout !== 3}
      />

      {/* Removed the outer padding and made it full width with no gaps */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <SelectedLayout />
        </div>
      </div>
    </>
  );
};

export default PublicProfile;