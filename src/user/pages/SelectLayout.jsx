import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const cccLogo = '/CCC.png';

import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub,
  FaYoutube, FaGlobe, FaTiktok, FaPinterest, FaReddit,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding,
  FaCheckCircle, FaLink
} from 'react-icons/fa';

const SelectLayout = () => {
  const [selectedLayout, setSelectedLayout] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const cccLogoUrl = cccLogo;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { navigate('/login', { replace: true }); return; }
      setUser(currentUser);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            displayName: data.displayName || currentUser.displayName || 'User',
            email: currentUser.email || '',
            photoURL: data.photoURL || currentUser.photoURL || '',
            bio: data.bio || '',
            location: data.location || '',
            phoneNumber: data.phoneNumber || '',
            occupation: data.occupation || '',
            company: 'City College of Calamba',
            companyLogo: cccLogoUrl,
            socialLinks: { facebook: data.socialLinks?.facebook || '', twitter: data.socialLinks?.twitter || '', instagram: data.socialLinks?.instagram || '', linkedin: data.socialLinks?.linkedin || '', github: data.socialLinks?.github || '', ...data.socialLinks },
            selectedLayout: data.selectedLayout || 1,
            coverPhotoURL: data.coverPhotoURL || '',
            skills: data.skills || '',
          });
          setSelectedLayout(data.selectedLayout || 1);
        } else {
          setUserData({ displayName: currentUser.displayName || 'User', email: currentUser.email || '', photoURL: currentUser.photoURL || '', bio: '', location: '', phoneNumber: '', occupation: '', company: 'City College of Calamba', companyLogo: cccLogoUrl, socialLinks: {}, selectedLayout: 1, coverPhotoURL: '', skills: '' });
        }
      } catch (e) { console.error(e); }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSelectLayout = async (layoutId) => {
    if (!user) return;
    setLoading(true);
    setSelectedLayout(layoutId);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { selectedLayout: layoutId, updatedAt: new Date().toISOString() });
      }
      setUserData(prev => ({ ...prev, selectedLayout: layoutId }));
      setTimeout(() => setLoading(false), 500);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const getSocialIcon = (platform) => {
    const map = { facebook: <FaFacebook />, twitter: <FaTwitter />, instagram: <FaInstagram />, linkedin: <FaLinkedin />, github: <FaGithub />, youtube: <FaYoutube />, website: <FaGlobe />, tiktok: <FaTiktok />, pinterest: <FaPinterest />, reddit: <FaReddit /> };
    return map[platform] || <FaLink />;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // ─── LAYOUTS ────────────────────────────────────────────────────────────────

  const Layout1 = () => (
    <div className="w-full h-full overflow-y-auto font-['Inter'] text-white" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)' }}>
      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#2a3f2a', border: '2px solid rgba(255,255,255,0.2)' }}>
            {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold" style={{ background: '#3a5a3a' }}>{getInitials(userData?.displayName)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white mb-1 truncate">{userData?.displayName}</h1>
            {userData?.occupation && <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{userData.occupation}</p>}
            {userData?.company && <div className="flex items-center gap-1 mt-1"><img src={cccLogoUrl} alt="" className="w-3 h-3 object-contain opacity-80" /><span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{userData.company}</span></div>}
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
      </div>
    </div>
  );

  const Layout2 = () => (
    <div className="w-full h-full overflow-y-auto font-['Inter'] text-white" style={{ background: '#0f1623' }}>
      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#1e2d45', border: '2px solid rgba(255,255,255,0.15)' }}>
            {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold" style={{ background: '#2a3f5f' }}>{getInitials(userData?.displayName)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white mb-1 truncate">{userData?.displayName}</h1>
            {userData?.occupation && <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{userData.occupation}</p>}
            {userData?.company && <div className="flex items-center gap-1 mt-1"><img src={cccLogoUrl} alt="" className="w-3 h-3 object-contain opacity-80" /><span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{userData.company}</span></div>}
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
      </div>
    </div>
  );

  const Layout3 = () => (
    <div className="w-full h-full bg-white overflow-y-auto font-['Inter']">
      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
            {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-lg font-semibold">{getInitials(userData?.displayName)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">{userData?.displayName}</h1>
            {userData?.occupation && <p className="text-sm font-medium text-gray-600 truncate">{userData.occupation}</p>}
            {userData?.company && <div className="flex items-center gap-1 mt-1"><img src={cccLogoUrl} alt="" className="w-3 h-3 object-contain" /><span className="text-xs text-gray-400">{userData.company}</span></div>}
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
      </div>
    </div>
  );

  const Layout4 = () => (
    <div className="w-full h-full overflow-y-auto font-['Inter'] text-white" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)' }}>
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
          {userData?.company && <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}><img src={cccLogoUrl} alt="" className="w-4 h-4 object-contain opacity-80" /><span>{userData.company}</span></div>}
          {userData?.bio && <p className="text-sm leading-relaxed mb-4 pb-4" style={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{userData.bio}</p>}
          {userData?.skills && <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Expertise</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').slice(0, 6).map((s, i) => <span key={i} className="px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>{s.trim()}</span>)}</div></div>}
          {(userData?.email || userData?.phoneNumber) && <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}><FaEnvelope style={{ color: 'rgba(255,255,255,0.5)' }} /></div><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}><FaPhone style={{ color: 'rgba(255,255,255,0.5)' }} /></div><span>{userData.phoneNumber}</span></a>}</div></div>}
          {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect</h3><div className="flex flex-wrap gap-2">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>{getSocialIcon(p)}</a>)}</div></div>}
        </div>
      </div>
    </div>
  );

  const Layout5 = () => (
    <div className="w-full h-full overflow-y-auto font-['Inter']" style={{ background: '#0d1b2e' }}>
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
          {userData?.company && <div className="flex items-center gap-2 text-xs mb-4" style={{ color: '#5a8ab0' }}><img src={cccLogoUrl} alt="" className="w-4 h-4 object-contain" /><span>{userData.company}</span></div>}
          {userData?.bio && <p className="text-sm leading-relaxed mb-4 pb-4" style={{ color: '#93b4d4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{userData.bio}</p>}
          {userData?.skills && <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Expertise</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').slice(0, 6).map((s, i) => <span key={i} className="px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: '#93b4d4' }}>{s.trim()}</span>)}</div></div>}
          {(userData?.email || userData?.phoneNumber) && <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: '#93b4d4' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}><FaEnvelope style={{ color: '#5a8ab0' }} /></div><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: '#93b4d4' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}><FaPhone style={{ color: '#5a8ab0' }} /></div><span>{userData.phoneNumber}</span></a>}</div></div>}
          {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div><h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Connect</h3><div className="flex flex-wrap gap-2">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', color: '#93b4d4' }}>{getSocialIcon(p)}</a>)}</div></div>}
        </div>
      </div>
    </div>
  );

  const Layout6 = () => (
    <div className="w-full h-full bg-white overflow-y-auto font-['Inter']">
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
          {userData?.company && <div className="flex items-center gap-2 text-xs text-gray-400 mb-4"><img src={cccLogoUrl} alt="" className="w-4 h-4 object-contain" /><span>{userData.company}</span></div>}
          {userData?.bio && <p className="text-sm text-gray-600 leading-relaxed mb-4 pb-4 border-b border-gray-100">{userData.bio}</p>}
          {userData?.skills && <div className="mb-4 pb-4 border-b border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Expertise</h3><div className="flex flex-wrap gap-2">{userData.skills.split(',').slice(0, 6).map((s, i) => <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs border border-gray-200">{s.trim()}</span>)}</div></div>}
          {(userData?.email || userData?.phoneNumber) && <div className="mb-4 pb-4 border-b border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Contact</h3><div className="space-y-2">{userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm text-gray-700"><div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><FaEnvelope className="text-gray-500 text-xs" /></div><span>{userData.email}</span></a>}{userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm text-gray-700"><div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><FaPhone className="text-gray-500 text-xs" /></div><span>{userData.phoneNumber}</span></a>}</div></div>}
          {Object.entries(userData?.socialLinks || {}).some(([, v]) => v) && <div><h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Connect</h3><div className="flex flex-wrap gap-2">{Object.entries(userData.socialLinks).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">{getSocialIcon(p)}</a>)}</div></div>}
        </div>
      </div>
    </div>
  );

  const Layout7 = () => (
    <div className="w-full h-full overflow-y-auto font-['Inter'] text-white" style={{ background: 'linear-gradient(160deg, #2a3a2a, #1a2a1e)' }}>
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 mb-3" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-green-900 text-white text-2xl font-medium">{getInitials(userData?.displayName)}</div>}
        </div>
        <h1 className="text-xl font-medium text-white mb-1">{userData?.displayName}</h1>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}{userData?.company}</p>
        <button className="w-full py-3 rounded-xl text-sm font-medium mb-4" style={{ background: 'rgba(255,255,255,0.15)', border: '0.5px solid rgba(255,255,255,0.25)' }}>Let's connect</button>
        <div className="w-full space-y-2">
          {userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}><FaPhone /></div><div className="flex-1"><div className="text-xs font-medium">Call me</div><div className="text-[11px] opacity-60">{userData.phoneNumber}</div></div><span className="text-xs opacity-40">↗</span></a>}
          {userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}><FaEnvelope /></div><div className="flex-1"><div className="text-xs font-medium">Email me</div><div className="text-[11px] opacity-60">{userData.email}</div></div><span className="text-xs opacity-40">↗</span></a>}
          {userData?.location && <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}><FaMapMarkerAlt /></div><div className="flex-1"><div className="text-xs font-medium">Location</div><div className="text-[11px] opacity-60">{userData.location}</div></div></div>}
          {Object.entries(userData?.socialLinks || {}).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>{getSocialIcon(p)}</div><div className="flex-1"><div className="text-xs font-medium capitalize">Follow me</div><div className="text-[11px] opacity-60">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div></div><span className="text-xs opacity-40">↗</span></a>)}
        </div>
      </div>
    </div>
  );

  const Layout8 = () => (
    <div className="w-full h-full overflow-y-auto font-['Inter'] text-white" style={{ background: '#0f1623' }}>
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 mb-3" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-700 text-white text-2xl font-medium">{getInitials(userData?.displayName)}</div>}
        </div>
        <h1 className="text-xl font-medium text-white mb-1">{userData?.displayName}</h1>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>{userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}{userData?.company}</p>
        <button className="w-full py-3 rounded-xl text-sm font-medium mb-4" style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)' }}>Let's connect</button>
        <div className="w-full space-y-2">
          {userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}><FaPhone /></div><div className="flex-1"><div className="text-xs font-medium">Call me</div><div className="text-[11px] opacity-55">{userData.phoneNumber}</div></div><span className="text-xs opacity-35">↗</span></a>}
          {userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}><FaEnvelope /></div><div className="flex-1"><div className="text-xs font-medium">Email me</div><div className="text-[11px] opacity-55">{userData.email}</div></div><span className="text-xs opacity-35">↗</span></a>}
          {userData?.location && <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}><FaMapMarkerAlt /></div><div className="flex-1"><div className="text-xs font-medium">Location</div><div className="text-[11px] opacity-55">{userData.location}</div></div></div>}
          {Object.entries(userData?.socialLinks || {}).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline" style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>{getSocialIcon(p)}</div><div className="flex-1"><div className="text-xs font-medium capitalize">Follow me</div><div className="text-[11px] opacity-55">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div></div><span className="text-xs opacity-35">↗</span></a>)}
        </div>
      </div>
    </div>
  );

  const Layout9 = () => (
    <div className="w-full h-full bg-white overflow-y-auto font-['Inter']">
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 mb-3">
          {userData?.photoURL ? <img src={userData.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-2xl font-medium">{getInitials(userData?.displayName)}</div>}
        </div>
        <h1 className="text-xl font-medium text-gray-900 mb-1">{userData?.displayName}</h1>
        <p className="text-xs text-gray-500 mb-4">{userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}<span className="underline">{userData?.company}</span></p>
        <button className="w-full py-3 rounded-xl text-sm font-medium mb-4 bg-gray-900 text-white">Let's connect</button>
        <div className="w-full space-y-2">
          {userData?.phoneNumber && <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-500"><FaPhone className="text-white text-xs" /></div><div className="flex-1"><div className="text-xs font-medium text-gray-900">Call me</div><div className="text-[11px] text-gray-500">{userData.phoneNumber}</div></div><span className="text-xs text-gray-400">↗</span></a>}
          {userData?.email && <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500"><FaEnvelope className="text-white text-xs" /></div><div className="flex-1"><div className="text-xs font-medium text-gray-900">Email me</div><div className="text-[11px] text-gray-500">{userData.email}</div></div><span className="text-xs text-gray-400">↗</span></a>}
          {userData?.location && <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500"><FaMapMarkerAlt className="text-white text-xs" /></div><div className="flex-1"><div className="text-xs font-medium text-gray-900">Location</div><div className="text-[11px] text-gray-500">{userData.location}</div></div></div>}
          {Object.entries(userData?.socialLinks || {}).filter(([, v]) => v).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline" style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}><div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600"><span className="text-white text-xs">{getSocialIcon(p)}</span></div><div className="flex-1"><div className="text-xs font-medium text-gray-900 capitalize">Follow me</div><div className="text-[11px] text-gray-500">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div></div><span className="text-xs text-gray-400">↗</span></a>)}
        </div>
      </div>
    </div>
  );

  const layouts = [
    { id: 1, component: <Layout1 /> },
    { id: 2, component: <Layout2 /> },
    { id: 3, component: <Layout3 /> },
    { id: 4, component: <Layout4 /> },
    { id: 5, component: <Layout5 /> },
    { id: 6, component: <Layout6 /> },
    { id: 7, component: <Layout7 /> },
    { id: 8, component: <Layout8 /> },
    { id: 9, component: <Layout9 /> },
  ];

  // ─── TOUCH SWIPE ────────────────────────────────────────────────────────────
  const minSwipeDistance = 50;

  const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0 && currentIndex < layouts.length - 1) setCurrentIndex(i => i + 1);
      if (distance < 0 && currentIndex > 0) setCurrentIndex(i => i - 1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  const currentLayout = layouts[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── MOBILE: swipeable full-screen card ── */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Counter + label */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Choose a theme</h2>
          <span className="text-sm text-gray-400">{currentIndex + 1} / {layouts.length}</span>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 pb-3 flex-shrink-0">
          {layouts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all ${i === currentIndex ? 'w-5 h-2 bg-gray-900' : 'w-2 h-2 bg-gray-300'}`}
            />
          ))}
        </div>

        {/* Swipeable preview — fills remaining height */}
        <div
          className="flex-1 mx-4 rounded-2xl overflow-hidden relative"
          style={{ minHeight: 0 }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Selected ring */}
          {selectedLayout === currentLayout.id && (
            <div className="absolute inset-0 ring-2 ring-blue-500 rounded-2xl z-10 pointer-events-none" />
          )}
          <div className="w-full h-full overflow-hidden">
            {currentLayout.component}
          </div>
          {/* Swipe hint arrows */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none z-10">
            {currentIndex > 0 && <div className="w-7 h-7 bg-black/30 rounded-full flex items-center justify-center text-white text-xs">‹</div>}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none z-10">
            {currentIndex < layouts.length - 1 && <div className="w-7 h-7 bg-black/30 rounded-full flex items-center justify-center text-white text-xs">›</div>}
          </div>
        </div>

        {/* Select button */}
        <div className="px-4 py-4 flex-shrink-0">
          <button
            onClick={() => handleSelectLayout(currentLayout.id)}
            disabled={loading && selectedLayout === currentLayout.id}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
              selectedLayout === currentLayout.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            {loading && selectedLayout === currentLayout.id ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                Applying…
              </span>
            ) : selectedLayout === currentLayout.id ? (
              <span className="flex items-center justify-center gap-2"><FaCheckCircle /> Selected — Layout {currentLayout.id}</span>
            ) : (
              `Select Layout ${currentLayout.id}`
            )}
          </button>
        </div>
      </div>

      {/* ── DESKTOP: grid of raw previews ── */}
      <div className="hidden md:block max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Choose a theme</h2>
          <p className="text-sm text-gray-500 mt-1">Pick the layout for your digital card</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout) => (
            <div key={layout.id} className="flex flex-col gap-2">
              {/* Raw preview — no outer card, just the layout itself */}
              <div
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all ${
                  selectedLayout === layout.id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'ring-1 ring-gray-200 hover:ring-gray-400 hover:shadow-md'
                }`}
                style={{ height: '520px' }}
                onClick={() => handleSelectLayout(layout.id)}
              >
                <div className="w-full h-full overflow-hidden pointer-events-none">
                  {layout.component}
                </div>
              </div>

              {/* Label + button below the card */}
              <button
                onClick={() => handleSelectLayout(layout.id)}
                disabled={loading && selectedLayout === layout.id}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedLayout === layout.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                }`}
              >
                {loading && selectedLayout === layout.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                    Applying…
                  </span>
                ) : selectedLayout === layout.id ? (
                  <span className="flex items-center justify-center gap-2"><FaCheckCircle /> Selected</span>
                ) : (
                  `Layout ${layout.id}`
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectLayout;