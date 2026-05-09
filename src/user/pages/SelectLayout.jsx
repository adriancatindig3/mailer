import { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
// import cccLogo from '../assets/CCC.png'; // Import the CCC logo

const cccLogo = '/CCC.png';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaYoutube,
  FaGlobe,
  FaTiktok,
  FaPinterest,
  FaReddit,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendar,
  FaCheckCircle,
  FaUser,
  FaBriefcase,
  FaShareAlt,
  FaLink
} from 'react-icons/fa';
import { icons } from 'lucide-react';

const socialIconMap = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  github: FaGithub,
  youtube: FaYoutube,
  website: FaGlobe,
  tiktok: FaTiktok,
  pinterest: FaPinterest,
  reddit: FaReddit,
  email: FaEnvelope,
  phone: FaPhone,
  location: FaMapMarkerAlt,
  company: FaBuilding,
  calendar: FaCalendar,
  check: FaCheckCircle,
  user: FaUser,
  briefcase: FaBriefcase,
  share: FaShareAlt,
  link: FaLink
};

const SelectLayout = () => {
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Hardcoded CCC logo URL
  const cccLogoUrl = cccLogo;

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

        if (userDoc.exists()) {
          const data = userDoc.data();
          const allSocialLinks = {
            facebook: data.socialLinks?.facebook || '',
            twitter: data.socialLinks?.twitter || '',
            instagram: data.socialLinks?.instagram || '',
            linkedin: data.socialLinks?.linkedin || '',
            github: data.socialLinks?.github || '',
            youtube: data.socialLinks?.youtube || '',
            website: data.socialLinks?.website || '',
            ...data.socialLinks
          };
          setUserData({
            displayName: data.displayName || currentUser.displayName || 'User',
            email: currentUser.email || '',
            photoURL: data.photoURL || currentUser.photoURL || '',
            bio: data.bio || '',
            location: data.location || '',
            phoneNumber: data.phoneNumber || '',
            occupation: data.occupation || '',
            company: 'City College of Calamba', // Hardcoded company name
            companyLogo: cccLogoUrl, // Hardcoded CCC logo
            joinDate: data.joinDate || new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }),
            socialLinks: allSocialLinks,
            selectedLayout: data.selectedLayout || 1,
            coverPhotoURL: data.coverPhotoURL || '',
            createdAt: data.createdAt || currentUser.metadata.creationTime,
            lastLoginAt: data.lastLoginAt || '',
            emailVerified: currentUser.emailVerified,
            skills: data.skills || '',
          });
          setSelectedLayout(data.selectedLayout || 1);
        } else {
          setUserData({
            displayName: currentUser.displayName || 'User',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            bio: '',
            location: '',
            phoneNumber: '',
            occupation: '',
            company: 'CCC School', // Hardcoded company name
            companyLogo: cccLogoUrl, // Hardcoded CCC logo
            joinDate: new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }),
            socialLinks: {},
            selectedLayout: 1,
            coverPhotoURL: '',
            createdAt: currentUser.metadata.creationTime,
            lastLoginAt: '',
            emailVerified: currentUser.emailVerified,
            skills: '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSelectLayout = async (layoutId) => {
    if (!user) return;

    setLoading(true);
    setSelectedLayout(layoutId);

    try {
      const userDocRef = doc(db, 'users', user.uid);

      // Check if document exists
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          selectedLayout: layoutId,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new document if it doesn't exist
        await updateDoc(userDocRef, {
          selectedLayout: layoutId,
          email: user.email || '',
          displayName: user.displayName || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setUserData(prev => ({ ...prev, selectedLayout: layoutId }));

      setTimeout(() => {
        setLoading(false);
        navigate('/selectlayout');  
      }, 500);

    } catch (error) {
      console.error('Error updating layout:', error);
      setLoading(false);
    }
  };

  const getSocialIcon = (platform) => {
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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };




































  
 // LAYOUT 1 — Always dark forest green
const Layout1 = () => {
  return (
    <div className="w-full h-full overflow-y-auto font-['Inter'] relative text-white"
      style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)' }}>

      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-0.5" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <div className="w-full h-full rounded-full overflow-hidden" style={{ background: '#2a3f2a' }}>
                {userData?.photoURL || userData?.profilePic ? (
                  <img src={userData.photoURL || userData.profilePic} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: '#3a5a3a' }}>
                    <span className="text-white text-lg font-semibold">{getInitials(userData?.displayName)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-1">{userData?.displayName}</h1>
            {userData?.occupation && (
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{userData.occupation}</p>
            )}
            {userData?.company && (
              <div className="flex items-center gap-1 mt-1">
                {cccLogoUrl && <img src={cccLogoUrl} alt="" className="w-3 h-3 object-contain opacity-80" />}
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{userData.company}</span>
              </div>
            )}
          </div>
        </div>

        {userData?.bio && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{userData.bio}</p>
        )}

        <div className="flex justify-around py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{userData?.skills?.split(',').length || 0}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Skills</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {Object.keys(userData?.socialLinks || {}).filter(k => userData.socialLinks[k]).length}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Links</div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3">
        {userData?.skills && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Skills</h3>
            <div className="flex flex-wrap gap-2">
              {userData.skills.split(',').map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {(userData?.email || userData?.phoneNumber) && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Contact</h3>
            <div className="space-y-2">
              {userData?.email && (
                <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <FaEnvelope style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span>{userData.email}</span>
                </a>
              )}
              {userData?.phoneNumber && (
                <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <FaPhone style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span>{userData.phoneNumber}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {userData?.socialLinks && Object.entries(userData.socialLinks).some(([, url]) => url) && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(userData.socialLinks).filter(([, url]) => url).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)' }}>{getSocialIcon(platform)}</div>
                  <span className="text-[9px] capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// LAYOUT 2 — Always dark navy
const Layout2 = () => {
  return (
    <div className="w-full h-full overflow-y-auto font-['Inter'] relative text-white"
      style={{ background: '#0f1623' }}>

      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-0.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="w-full h-full rounded-full overflow-hidden" style={{ background: '#1e2d45' }}>
                {userData?.photoURL || userData?.profilePic ? (
                  <img src={userData.photoURL || userData.profilePic} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: '#2a3f5f' }}>
                    <span className="text-white text-lg font-semibold">{getInitials(userData?.displayName)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-1">{userData?.displayName}</h1>
            {userData?.occupation && (
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{userData.occupation}</p>
            )}
            {userData?.company && (
              <div className="flex items-center gap-1 mt-1">
                {cccLogoUrl && <img src={cccLogoUrl} alt="" className="w-3 h-3 object-contain opacity-80" />}
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{userData.company}</span>
              </div>
            )}
          </div>
        </div>

        {userData?.bio && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>{userData.bio}</p>
        )}

        <div className="flex justify-around py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{userData?.skills?.split(',').length || 0}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Skills</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {Object.keys(userData?.socialLinks || {}).filter(k => userData.socialLinks[k]).length}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Links</div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3">
        {userData?.skills && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Skills</h3>
            <div className="flex flex-wrap gap-2">
              {userData.skills.split(',').map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {(userData?.email || userData?.phoneNumber) && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Contact</h3>
            <div className="space-y-2">
              {userData?.email && (
                <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <FaEnvelope style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <span>{userData.email}</span>
                </a>
              )}
              {userData?.phoneNumber && (
                <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <FaPhone style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <span>{userData.phoneNumber}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {userData?.socialLinks && Object.entries(userData.socialLinks).some(([, url]) => url) && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Connect</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(userData.socialLinks).filter(([, url]) => url).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.65)' }}>{getSocialIcon(platform)}</div>
                  <span className="text-[9px] capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>{platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// LAYOUT 3 — Always clean white
const Layout3 = () => {
  return (
    <div className="w-full h-full bg-white overflow-y-auto font-['Inter'] relative">

      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-0.5 bg-gray-200">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                {userData?.photoURL || userData?.profilePic ? (
                  <img src={userData.photoURL || userData.profilePic} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <span className="text-white text-lg font-semibold">{getInitials(userData?.displayName)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{userData?.displayName}</h1>
            {userData?.occupation && (
              <p className="text-sm font-medium text-gray-600">{userData.occupation}</p>
            )}
            {userData?.company && (
              <div className="flex items-center gap-1 mt-1">
                {cccLogoUrl && <img src={cccLogoUrl} alt="" className="w-3 h-3 object-contain" />}
                <span className="text-xs text-gray-400">{userData.company}</span>
              </div>
            )}
          </div>
        </div>

        {userData?.bio && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{userData.bio}</p>
        )}

        <div className="flex justify-around py-3 border-y border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{userData?.skills?.split(',').length || 0}</div>
            <div className="text-xs text-gray-400">Skills</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {Object.keys(userData?.socialLinks || {}).filter(k => userData.socialLinks[k]).length}
            </div>
            <div className="text-xs text-gray-400">Links</div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3">
        {userData?.skills && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {userData.skills.split(',').map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {(userData?.email || userData?.phoneNumber) && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Contact</h3>
            <div className="space-y-2">
              {userData?.email && (
                <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm text-gray-700">
                  <FaEnvelope className="text-gray-400" />
                  <span>{userData.email}</span>
                </a>
              )}
              {userData?.phoneNumber && (
                <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm text-gray-700">
                  <FaPhone className="text-gray-400" />
                  <span>{userData.phoneNumber}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {userData?.socialLinks && Object.entries(userData.socialLinks).some(([, url]) => url) && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Connect</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(userData.socialLinks).filter(([, url]) => url).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="text-gray-500">{getSocialIcon(platform)}</div>
                  <span className="text-[9px] text-gray-400 capitalize">{platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// LAYOUT 4 — Same dark forest green theme as Layout 1 with cover photo
const Layout4 = () => {
  return (
    <div className="w-full h-full overflow-y-auto font-['Inter'] relative text-white"
      style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)' }}>
      
      <div className="w-full h-full flex flex-col">
        {/* Cover photo section */}
        <div className="h-48 w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.03) 10px, rgba(255,255,255,.03) 20px)' }}></div>
          {userData?.coverPhotoURL && (
            <img src={userData.coverPhotoURL} alt="" className="w-full h-full object-cover opacity-60" />
          )}
        </div>

        <div className="px-6 py-6 relative flex-1" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)' }}>
          {/* Profile picture */}
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-[#0f1f0f] shadow-xl absolute -top-14 left-6"
            style={{ background: '#2a3f2a' }}>
            {userData?.photoURL || userData?.profilePic ? (
              <img src={userData.photoURL || userData.profilePic} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#3a5a3a' }}>
                <span className="text-white text-2xl font-bold">{getInitials(userData?.displayName)}</span>
              </div>
            )}
          </div>

          <div className="pt-14">
            <h1 className="text-2xl font-bold text-white mb-1">{userData?.displayName}</h1>
            {userData?.occupation && (
              <p className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{userData.occupation}</p>
            )}
            {userData?.company && (
              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {cccLogoUrl ? (
                  <img src={cccLogoUrl} alt={userData.company} className="w-5 h-5 object-contain rounded opacity-80"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <FaBuilding className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.55)' }} />
                )}
                <span>{userData.company}</span>
              </div>
            )}
            
            {userData?.bio && (
              <p className="text-sm leading-relaxed mb-4 pb-4" style={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{userData.bio}</p>
            )}
            
            {userData?.skills && (
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.skills.split(',').slice(0, 6).map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(userData?.email || userData?.phoneNumber) && (
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Contact</h3>
                <div className="space-y-2">
                  {userData?.email && (
                    <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <FaEnvelope style={{ color: 'rgba(255,255,255,0.5)' }} />
                      </div>
                      <span className="font-medium">{userData.email}</span>
                    </a>
                  )}
                  {userData?.phoneNumber && (
                    <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <FaPhone style={{ color: 'rgba(255,255,255,0.5)' }} />
                      </div>
                      <span className="font-medium">{userData.phoneNumber}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {userData?.socialLinks && Object.entries(userData.socialLinks).some(([, url]) => url) && (
              <div>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userData.socialLinks).filter(([, url]) => url).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                      {getSocialIcon(platform)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// LAYOUT 5 — Always deep slate blue with cover photo (James Walker style)
const Layout5 = () => {
  return (
    <div className="w-full h-full overflow-y-auto font-['Inter'] relative" style={{ background: '#0d1b2e' }}>
      <div className="w-full h-full flex flex-col">
        <div className="h-48 w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1b2e 0%, #1a3a5c 100%)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.02) 10px, rgba(255,255,255,.02) 20px)' }}></div>
          {userData?.coverPhotoURL && (
            <img src={userData.coverPhotoURL} alt="" className="w-full h-full object-cover brightness-75" />
          )}
        </div>

        <div className="px-6 py-6 relative flex-1" style={{ background: '#0d1b2e' }}>
          <div className="w-28 h-28 rounded-2xl overflow-hidden absolute -top-14 left-6"
            style={{ border: '4px solid #0d1b2e', background: 'linear-gradient(135deg, #1a3a5c, #0d1b2e)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            {userData?.photoURL || userData?.profilePic ? (
              <img src={userData.photoURL || userData.profilePic} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a3a5c' }}>
                <span className="text-white text-2xl font-bold">{getInitials(userData?.displayName)}</span>
              </div>
            )}
          </div>

          <div className="pt-14">
            <h1 className="text-2xl font-bold text-white mb-1">{userData?.displayName}</h1>
            {userData?.occupation && (
              <p className="text-base font-medium mb-1" style={{ color: '#93b4d4' }}>{userData.occupation}</p>
            )}
            {userData?.company && (
              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#5a8ab0' }}>
                {cccLogoUrl ? (
                  <img src={cccLogoUrl} alt={userData.company} className="w-5 h-5 object-contain rounded"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <FaBuilding className="w-4 h-4" />
                )}
                <span>{userData.company}</span>
              </div>
            )}
            {userData?.bio && (
              <p className="text-sm leading-relaxed mb-4 pb-4" style={{ color: '#93b4d4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {userData.bio}
              </p>
            )}
            {userData?.skills && (
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.skills.split(',').slice(0, 6).map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#93b4d4', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(userData?.email || userData?.phoneNumber) && (
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Contact</h3>
                <div className="space-y-2">
                  {userData?.email && (
                    <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm" style={{ color: '#93b4d4' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <FaEnvelope className="w-3 h-3" style={{ color: '#5a8ab0' }} />
                      </div>
                      <span className="font-medium">{userData.email}</span>
                    </a>
                  )}
                  {userData?.phoneNumber && (
                    <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm" style={{ color: '#93b4d4' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <FaPhone className="w-3 h-3" style={{ color: '#5a8ab0' }} />
                      </div>
                      <span className="font-medium">{userData.phoneNumber}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
            {userData?.socialLinks && Object.entries(userData.socialLinks).some(([, url]) => url) && (
              <div>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: '#5a8ab0' }}>Connect</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userData.socialLinks).filter(([, url]) => url).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#93b4d4', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {getSocialIcon(platform)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// LAYOUT 6 — Always clean white with cover photo
const Layout6 = () => {
  return (
    <div className="w-full h-full bg-white overflow-y-auto font-['Inter'] relative">
      <div className="w-full h-full flex flex-col">
        <div className="h-48 w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.03) 10px, rgba(255,255,255,.03) 20px)' }}></div>
          {userData?.coverPhotoURL && (
            <img src={userData.coverPhotoURL} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-6 py-6 relative flex-1 bg-white">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl absolute -top-14 left-6"
            style={{ background: 'linear-gradient(135deg, #374151, #111827)' }}>
            {userData?.photoURL || userData?.profilePic ? (
              <img src={userData.photoURL || userData.profilePic} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-white text-2xl font-bold">{getInitials(userData?.displayName)}</span>
              </div>
            )}
          </div>

          <div className="pt-14">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{userData?.displayName}</h1>
            {userData?.occupation && (
              <p className="text-base text-gray-600 mb-1 font-medium">{userData.occupation}</p>
            )}
            {userData?.company && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                {cccLogoUrl ? (
                  <img src={cccLogoUrl} alt={userData.company} className="w-5 h-5 object-contain rounded"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <FaBuilding className="w-4 h-4 text-gray-400" />
                )}
                <span>{userData.company}</span>
              </div>
            )}
            {userData?.bio && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4 pb-4 border-b border-gray-100">{userData.bio}</p>
            )}
            {userData?.skills && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.skills.split(',').slice(0, 6).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(userData?.email || userData?.phoneNumber) && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Contact</h3>
                <div className="space-y-2">
                  {userData?.email && (
                    <a href={`mailto:${userData.email}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FaEnvelope className="w-3 h-3 text-gray-500" />
                      </div>
                      <span className="font-medium">{userData.email}</span>
                    </a>
                  )}
                  {userData?.phoneNumber && (
                    <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FaPhone className="w-3 h-3 text-gray-500" />
                      </div>
                      <span className="font-medium">{userData.phoneNumber}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
            {userData?.socialLinks && Object.entries(userData.socialLinks).some(([, url]) => url) && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Connect</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userData.socialLinks).filter(([, url]) => url).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm">
                      {getSocialIcon(platform)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// LAYOUT 7 — Dark forest card
const Layout7 = () => (
  <div className="w-full h-full overflow-y-auto font-['Inter'] relative text-white"
    style={{ background: 'linear-gradient(160deg, #2a3a2a 0%, #1a2a1e 100%)' }}>
    <div className="flex flex-col items-center pt-8 pb-4 px-4">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 mb-3">
        {userData?.photoURL ? (
          <img src={userData.photoURL} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-900 text-white text-2xl font-medium">
            {getInitials(userData?.displayName)}
          </div>
        )}
      </div>
      <h1 className="text-xl font-medium text-white mb-1">{userData?.displayName}</h1>
      <p className="text-xs text-white/70 mb-4">
        {userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}{userData?.company}
      </p>
      <button className="w-full py-3 rounded-xl text-sm font-medium mb-4"
        style={{ background: 'rgba(255,255,255,0.15)', border: '0.5px solid rgba(255,255,255,0.25)', color: 'white' }}>
        Let’s connect 
      </button>
      <div className="w-full space-y-2">
        {userData?.phoneNumber && (
          <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <FaPhone className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium">Call me</div>
              <div className="text-[11px] opacity-60">{userData.phoneNumber}</div>
            </div>
            <span className="text-xs opacity-40">↗</span>
          </a>
        )}
        {userData?.email && (
          <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <FaEnvelope className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium">Email me</div>
              <div className="text-[11px] opacity-60">{userData.email}</div>
            </div>
            <span className="text-xs opacity-40">↗</span>
          </a>
        )}
        {userData?.location && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <FaMapMarkerAlt className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-white">Visit my office</div>
              <div className="text-[11px] text-white/60">{userData.location}</div>
            </div>
            <span className="text-xs text-white/40">↗</span>
          </div>
        )}
        {userData?.socialLinks && Object.entries(userData.socialLinks).filter(([,v]) => v).map(([platform, url]) => (
          <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              {getSocialIcon(platform)}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium capitalize">Follow me</div>
              <div className="text-[11px] opacity-60">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div>
            </div>
            <span className="text-xs opacity-40">↗</span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

// LAYOUT 8 — Dark navy card
const Layout8 = () => (
  <div className="w-full h-full overflow-y-auto font-['Inter'] relative text-white" style={{ background: '#0f1623' }}>
    <div className="flex flex-col items-center pt-8 pb-4 px-4">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 mb-3">
        {userData?.photoURL ? (
          <img src={userData.photoURL} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-700 text-white text-2xl font-medium">
            {getInitials(userData?.displayName)}
          </div>
        )}
      </div>
      <h1 className="text-xl font-medium text-white mb-1">{userData?.displayName}</h1>
      <p className="text-xs text-white/60 mb-4">
        {userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}{userData?.company}
      </p>
      <button className="w-full py-3 rounded-xl text-sm font-medium mb-4"
        style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'white' }}>
       Let’s connect
      </button>
      <div className="w-full space-y-2">
        {userData?.phoneNumber && (
          <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <FaPhone className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium">Call me</div>
              <div className="text-[11px] opacity-55">{userData.phoneNumber}</div>
            </div>
            <span className="text-xs opacity-35">↗</span>
          </a>
        )}
        {userData?.email && (
          <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <FaEnvelope className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium">Email me</div>
              <div className="text-[11px] opacity-55">{userData.email}</div>
            </div>
            <span className="text-xs opacity-35">↗</span>
          </a>
        )}
        {userData?.location && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <FaMapMarkerAlt className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-white">Visit my office</div>
              <div className="text-[11px] text-white/55">{userData.location}</div>
            </div>
            <span className="text-xs text-white/35">↗</span>
          </div>
        )}
        {userData?.socialLinks && Object.entries(userData.socialLinks).filter(([,v]) => v).map(([platform, url]) => (
          <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white no-underline"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              {getSocialIcon(platform)}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium capitalize">Follow me</div>
              <div className="text-[11px] opacity-55">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div>
            </div>
            <span className="text-xs opacity-35">↗</span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

// LAYOUT 9 — Clean white card
const Layout9 = () => (
  <div className="w-full h-full bg-white overflow-y-auto font-['Inter'] relative">
    <div className="flex flex-col items-center pt-8 pb-4 px-4">
      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 mb-3">
        {userData?.photoURL ? (
          <img src={userData.photoURL} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-2xl font-medium">
            {getInitials(userData?.displayName)}
          </div>
        )}
      </div>
      <h1 className="text-xl font-medium text-gray-900 mb-1">{userData?.displayName}</h1>
      <p className="text-xs text-gray-500 mb-4">
        {userData?.occupation}{userData?.occupation && userData?.company ? ' | ' : ''}
        <span className="underline">{userData?.company}</span>
      </p>
      <button className="w-full py-3 rounded-xl text-sm font-medium mb-4 bg-gray-900 text-white">
        Let’s connect
      </button>
      <div className="w-full space-y-2">
        {userData?.phoneNumber && (
          <a href={`tel:${userData.phoneNumber}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline"
            style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-500">
              <FaPhone className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-900">Call me</div>
              <div className="text-[11px] text-gray-500">{userData.phoneNumber}</div>
            </div>
            <span className="text-xs text-gray-400">↗</span>
          </a>
        )}
        {userData?.email && (
          <a href={`mailto:${userData.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline"
            style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500">
              <FaEnvelope className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-900">Email me</div>
              <div className="text-[11px] text-gray-500">{userData.email}</div>
            </div>
            <span className="text-xs text-gray-400">↗</span>
          </a>
        )}
        {userData?.location && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500">
              <FaMapMarkerAlt className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-900">Visit my office</div>
              <div className="text-[11px] text-gray-500">{userData.location}</div>
            </div>
            <span className="text-xs text-gray-400">↗</span>
          </div>
        )}
        {userData?.socialLinks && Object.entries(userData.socialLinks).filter(([,v]) => v).map(([platform, url]) => (
          <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline"
            style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600">
              <span className="text-white">{getSocialIcon(platform)}</span>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-900 capitalize">Follow me</div>
              <div className="text-[11px] text-gray-500">{url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</div>
            </div>
            <span className="text-xs text-gray-400">↗</span>
          </a>
        ))}
      </div>
    </div>
  </div>
);





  const layouts = [

    {
      id: 1,
      name: "1",
      preview: <Layout1 />,
    },
    {
      id: 2,
      name: "2",
      preview: <Layout2 />,
    },
    {
      id: 3,
      name: "3",
      preview: <Layout3 />,
    },
    {
      id: 4,
      name: "4",
      preview: <Layout4 />,
    },
    {
      id: 5,
      name: "5",
      preview: <Layout5 />,
    },
    {
      id: 6,
      name: "6",
      preview: <Layout6 />,
    },
    {
      id: 7,
      name: "7",
      preview: <Layout7 />,
    },
    {
      id: 8,
      name: "8",
      preview: <Layout8 />,
    },
    {
      id: 9,
      name: "",
      preview: <Layout9 />,
    },
  ];

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-16 h-16 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0,0,0,0.1) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-500/5 to-transparent rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* <header className="mb-10">
          <div className="flex justify-between items-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:border-blue-300 transition-all">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-sans font-medium tracking-wide">Back to Dashboard</span>
              </div>
            </button>
          </div>
        </header> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {layouts.map((layout) => (
            <div key={layout.id} className="w-full">
              <div className={`bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 flex flex-col ${selectedLayout === layout.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-lg hover:border-gray-300'
                }`} style={{ height: '875px' }}>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div>
                      <h3 className="text-sm font-sans font-medium text-gray-900">Layout {layout.name}</h3>
                    </div>
                  </div>

                  <div className="flex-1 p-2 min-h-0 overflow-hidden">
                    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-100" style={{ height: '700px' }}>
                      {layout.preview}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 mt-auto">
                    <button
                      onClick={() => handleSelectLayout(layout.id)}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-sans font-medium text-sm tracking-wide text-center transition-all duration-300 ${selectedLayout === layout.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                        }`}
                    >
                      {loading && selectedLayout === layout.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                          Applying...
                        </div>
                      ) : selectedLayout === layout.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <FaCheckCircle className="w-4 h-4" />
                          <span>Selected</span>
                        </div>
                      ) : (
                        'Select This Layout'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectLayout;