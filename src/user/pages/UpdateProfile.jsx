// UpdateProfile.jsx - Auto-save when cropping is applied with Dark Mode Support
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { uploadImage } from '../../config/cloudinary';
import Cropper from 'react-easy-crop';
import { 
  ArrowLeft, Save, Camera, MapPin, Briefcase, Phone, Mail, 
  User, Image as ImageIcon, Trash2, Plus, X, Check, 
  Wifi, Radio, Smartphone, Cpu, CreditCard, Upload, Loader2,
  Move, ZoomIn, RotateCw, Crop, CheckCircle
} from "lucide-react";

const UpdateProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userData, setUserData] = useState({
    displayName: '',
    bio: '',
    location: '',
    email: '',
    occupation: '',
    company: 'CCC',
    phoneNumber: '',
    skills: '',
  });

  const [socialLinks, setSocialLinks] = useState([
    { id: Date.now(), url: '' }
  ]);

  // Profile picture cropping states
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [currentPhotoURL, setCurrentPhotoURL] = useState('');
  const [isProfilePicRemoved, setIsProfilePicRemoved] = useState(false);
  const [showProfileCropper, setShowProfileCropper] = useState(false);
  const [profileCrop, setProfileCrop] = useState({ x: 0, y: 0 });
  const [profileZoom, setProfileZoom] = useState(1);
  const [profileCroppedAreaPixels, setProfileCroppedAreaPixels] = useState(null);
  const [profileImageToCrop, setProfileImageToCrop] = useState(null);
  const [isSavingProfilePic, setIsSavingProfilePic] = useState(false);

  // Cover photo cropping states
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState('');
  const [currentCoverURL, setCurrentCoverURL] = useState('');
  const [isCoverPhotoRemoved, setIsCoverPhotoRemoved] = useState(false);
  const [showCoverCropper, setShowCoverCropper] = useState(false);
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [coverZoom, setCoverZoom] = useState(1);
  const [coverCroppedAreaPixels, setCoverCroppedAreaPixels] = useState(null);
  const [coverImageToCrop, setCoverImageToCrop] = useState(null);
  const [isSavingCoverPic, setIsSavingCoverPic] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const profilePicInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  const navigate = useNavigate();

  const positionOptions = [
    { value: 'Teaching', label: 'Teaching' },
    { value: 'Non-Teaching', label: 'Non-Teaching' },
    { value: 'Alumni', label: 'Alumni' }
  ];

  const defaultProfilePic = 'https://res.cloudinary.com/dduu3qj8q/image/upload/v1770705831/users/profile-photos/fflqvlvzyt2cec7yukfp.jpg';
  const defaultCoverPhoto = 'https://res.cloudinary.com/dduu3qj8q/image/upload/v1770705831/users/profile-photos/fflqvlvzyt2cec7yukfp.jpg';
  const cccLogo = 'https://res.cloudinary.com/dduu3qj8q/image/upload/v1770705831/users/company-logos/ccc.png';

  // Load dark mode preference from Firestore
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().darkMode !== undefined) {
            setDarkMode(userDoc.data().darkMode);
          }
        }
      } catch (error) {
        console.error('Error loading dark mode:', error);
      }
    };
    loadDarkMode();
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const onProfileCropComplete = (croppedArea, croppedAreaPixels) => {
    setProfileCroppedAreaPixels(croppedAreaPixels);
  };

  const onCoverCropComplete = (croppedArea, croppedAreaPixels) => {
    setCoverCroppedAreaPixels(croppedAreaPixels);
  };

  // Auto-save profile picture to Firestore immediately after cropping
  const autoSaveProfilePicture = async (croppedFile) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const result = await uploadImage(croppedFile, 'users/profile-photos');
      const newPhotoUrl = result.url;

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL: newPhotoUrl,
        profilePic: newPhotoUrl,
        updatedAt: new Date().toISOString(),
      });

      if (currentUser.updateProfile) {
        await currentUser.updateProfile({ photoURL: newPhotoUrl });
      }

      setCurrentPhotoURL(newPhotoUrl);
      setProfilePicPreview(newPhotoUrl);
      
      return true;
    } catch (error) {
      console.error('Error auto-saving profile picture:', error);
      setError('Failed to save profile picture: ' + error.message);
      return false;
    }
  };

  // Auto-save cover photo to Firestore immediately after cropping
  const autoSaveCoverPhoto = async (croppedFile) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const result = await uploadImage(croppedFile, 'users/cover-photos');
      const newCoverUrl = result.url;

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        coverPhotoURL: newCoverUrl,
        coverPhoto: newCoverUrl,
        updatedAt: new Date().toISOString(),
      });

      setCurrentCoverURL(newCoverUrl);
      setCoverPhotoPreview(newCoverUrl);
      
      return true;
    } catch (error) {
      console.error('Error auto-saving cover photo:', error);
      setError('Failed to save cover photo: ' + error.message);
      return false;
    }
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImageToCrop(reader.result);
      setShowProfileCropper(true);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImageToCrop(reader.result);
      setShowCoverCropper(true);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleProfileCropSave = async () => {
    if (!profileCroppedAreaPixels || !profileImageToCrop) return;

    setIsSavingProfilePic(true);
    setError('');
    
    try {
      const croppedBlob = await getCroppedImg(profileImageToCrop, profileCroppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'cropped-profile.jpg', { type: 'image/jpeg' });
      
      // Auto-save to Firestore immediately
      const success = await autoSaveProfilePicture(croppedFile);
      
      if (success) {
        setSuccess('Profile picture updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
      
      setProfilePicFile(null); // Clear since it's already saved
      setIsProfilePicRemoved(false);
      setShowProfileCropper(false);
      setProfileImageToCrop(null);
      setProfileCrop({ x: 0, y: 0 });
      setProfileZoom(1);
      
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Failed to crop and save image');
    } finally {
      setIsSavingProfilePic(false);
    }
  };

  const handleCoverCropSave = async () => {
    if (!coverCroppedAreaPixels || !coverImageToCrop) return;

    setIsSavingCoverPic(true);
    setError('');
    
    try {
      const croppedBlob = await getCroppedImg(coverImageToCrop, coverCroppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'cropped-cover.jpg', { type: 'image/jpeg' });
      
      // Auto-save to Firestore immediately
      const success = await autoSaveCoverPhoto(croppedFile);
      
      if (success) {
        setSuccess('Cover photo updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
      
      setCoverPhotoFile(null); // Clear since it's already saved
      setIsCoverPhotoRemoved(false);
      setShowCoverCropper(false);
      setCoverImageToCrop(null);
      setCoverCrop({ x: 0, y: 0 });
      setCoverZoom(1);
      
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Failed to crop and save image');
    } finally {
      setIsSavingCoverPic(false);
    }
  };

  const handleProfilePicClick = () => {
    profilePicInputRef.current?.click();
  };

  const handleCoverPhotoClick = () => {
    coverPhotoInputRef.current?.click();
  };

  const detectPlatform = (url) => {
    if (!url) return '';
    const urlLower = url.toLowerCase();
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) return 'facebook';
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('linkedin.com')) return 'linkedin';
    if (urlLower.includes('github.com')) return 'github';
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
    if (urlLower.includes('tiktok.com')) return 'tiktok';
    if (urlLower.includes('pinterest.com')) return 'pinterest';
    if (urlLower.includes('reddit.com')) return 'reddit';
    if (urlLower.startsWith('http') && !urlLower.includes('@')) return 'website';
    return 'other';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();

          setUserData({
            displayName: data.displayName || currentUser.displayName || '',
            bio: data.bio || '',
            location: data.location || '',
            email: data.email || currentUser.email || '',
            occupation: data.occupation || data.role || '',
            company: data.company || 'CCC School',
            phoneNumber: data.phoneNumber || data.phone || '',
            skills: data.skills || '',
          });

          if (data.photoURL || data.profilePic) {
            const photoUrl = data.photoURL || data.profilePic;
            setCurrentPhotoURL(photoUrl);
            setProfilePicPreview(photoUrl);
          } else {
            setCurrentPhotoURL('');
            setProfilePicPreview(defaultProfilePic);
          }

          if (data.coverPhotoURL || data.coverPhoto) {
            const coverUrl = data.coverPhotoURL || data.coverPhoto;
            setCurrentCoverURL(coverUrl);
            setCoverPhotoPreview(coverUrl);
          } else {
            setCurrentCoverURL('');
            setCoverPhotoPreview(defaultCoverPhoto);
          }

          if (data.socialLinks) {
            const linksArray = [];
            Object.entries(data.socialLinks).forEach(([platform, url]) => {
              if (url && url.trim() !== '') {
                linksArray.push({
                  id: Date.now() + Math.random(),
                  url: url
                });
              }
            });
            if (linksArray.length > 0) {
              setSocialLinks(linksArray);
            } else {
              setSocialLinks([{ id: Date.now(), url: '' }]);
            }
          }
        } else {
          setUserData({
            displayName: currentUser.displayName || '',
            bio: '',
            location: '',
            email: currentUser.email || '',
            occupation: '',
            company: 'CCC School',
            phoneNumber: '',
            skills: '',
          });
          setCurrentPhotoURL('');
          setCurrentCoverURL('');
          setProfilePicPreview(defaultProfilePic);
          setCoverPhotoPreview(defaultCoverPhoto);
          if (currentUser.photoURL) {
            setCurrentPhotoURL(currentUser.photoURL);
            setProfilePicPreview(currentUser.photoURL);
          }
        }

        setIsProfilePicRemoved(false);
        setIsCoverPhotoRemoved(false);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (id, value) => {
    setSocialLinks(prev => prev.map(link => {
      if (link.id === id) {
        return { ...link, url: value };
      }
      return link;
    }));
  };

  const addSocialLink = () => {
    setSocialLinks(prev => [
      ...prev,
      { id: Date.now() + Math.random(), url: '' }
    ]);
  };

  const removeSocialLink = (id) => {
    if (socialLinks.length > 1) {
      setSocialLinks(prev => prev.filter(link => link.id !== id));
    } else {
      setSocialLinks([{ id: Date.now(), url: '' }]);
    }
  };

  const validateUrl = (url) => {
    if (!url || url.trim() === '') return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') return true;
    const phoneRegex = /^\+63\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (userData.phoneNumber && !validatePhoneNumber(userData.phoneNumber)) {
      setError('Please enter a valid phone number (+63 followed by 10 digits)');
      return;
    }

    const invalidLinks = socialLinks.filter(link => link.url && !validateUrl(link.url));
    if (invalidLinks.length > 0) {
      setError('Please enter valid URLs for social links');
      return;
    }

    setSaving(true);
    setUploadProgress(0);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Only handle text data - images are already saved via cropping
      const socialLinksObj = {};
      socialLinks.forEach(link => {
        if (link.url && link.url.trim() !== '') {
          const platform = detectPlatform(link.url);
          let finalPlatform = platform;
          let counter = 1;
          while (socialLinksObj[finalPlatform]) {
            finalPlatform = `${platform}${counter}`;
            counter++;
          }
          socialLinksObj[finalPlatform] = link.url;
        }
      });

      const updateData = {
        displayName: userData.displayName || '',
        bio: userData.bio || '',
        location: userData.location || '',
        occupation: userData.occupation || '',
        company: 'CCC School',
        phoneNumber: userData.phoneNumber || '',
        skills: userData.skills || '',
        socialLinks: socialLinksObj,
        updatedAt: new Date().toISOString(),
      };

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const initialData = {
          ...updateData,
          email: currentUser.email || '',
          createdAt: new Date().toISOString(),
          uid: currentUser.uid,
          photoURL: currentPhotoURL,
          profilePic: currentPhotoURL,
          coverPhotoURL: currentCoverURL,
          coverPhoto: currentCoverURL,
        };
        await setDoc(userDocRef, initialData);
      } else {
        await updateDoc(userDocRef, updateData);
      }

      setUploadProgress(100);
      setSuccess('Profile information saved successfully!');

      // setTimeout(() => {
      //   navigate('/selectlayout');
      // }, 1500);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  // Dynamic styles based on dark mode
  const bgGradient = darkMode 
    ? 'radial-gradient(ellipse at 20% 30%, #0f0f1a, #0a0a0f)'
    : '#f8fafc';
  
  const cardBg = darkMode
    ? 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.6))'
    : 'rgba(255,255,255,0.95)';
  
  const headerBg = darkMode
    ? 'rgba(15, 23, 42, 0.6)'
    : 'rgba(255,255,255,0.8)';
  
  const cardBorder = darkMode
    ? '1px solid rgba(99,102,241,0.2)'
    : '1px solid rgba(99,102,241,0.3)';
  
  const textColor = darkMode ? 'white' : '#1e293b';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const textMuted = darkMode ? '#475569' : '#94a3b8';
  const inputBg = darkMode ? 'rgba(30,41,59,0.8)' : '#f8fafc';
  const inputBorder = darkMode ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.2)';

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: bgGradient,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ width: 48, height: 48, border: `2px solid ${darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.3)'}`, borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bgGradient,
      position: 'relative', 
      overflow: 'hidden' 
    }}>

      {/* Background animated orbs - Only show in dark mode */}
      {darkMode && (
        <>
          <motion.div
            animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "fixed", top: "-20%", left: "-15%",
              width: 600, height: 600, borderRadius: "50%",
              background: "radial-gradient(circle, #6366f1 0%, rgba(99,102,241,0) 70%)",
              filter: "blur(120px)", opacity: 0.08, pointerEvents: "none",
            }}
          />
          <motion.div
            animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "fixed", bottom: "-10%", right: "-10%",
              width: 500, height: 500, borderRadius: "50%",
              background: "radial-gradient(circle, #8b5cf6 0%, rgba(139,92,246,0) 80%)",
              filter: "blur(120px)", opacity: 0.08, pointerEvents: "none",
            }}
          />
        </>
      )}

      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '2rem'
      }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: headerBg,
              border: cardBorder,
              borderRadius: '0.75rem',
              color: textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.color = textSecondary; }}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CreditCard size={20} style={{ color: '#6366f1' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textColor, margin: 0 }}>Edit Profile</h1>
          </div>
          
          <div style={{ width: 80 }} />
        </motion.div>

        {/* Live Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            background: cardBg,
            border: cardBorder,
            borderRadius: '2rem',
            overflow: 'hidden',
            backdropFilter: darkMode ? 'blur(20px)' : 'none',
            marginBottom: '2rem',
            boxShadow: darkMode ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ height: 3, background: 'linear-gradient(90deg, #6366f1, #34d399, #8b5cf6)' }} />

          {/* Cover Photo */}
          <div 
            onClick={handleCoverPhotoClick}
            style={{
              position: 'relative',
              height: '200px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            {isSavingCoverPic && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20
              }}>
                <Loader2 size={32} style={{ color: 'white', animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}
            <img
              src={coverPhotoPreview}
              alt="Cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
            >
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '2rem',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Camera size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>Change Cover</span>
              </div>
            </div>
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Profile Picture */}
          <div style={{ position: 'relative', padding: '0 1.5rem 1.5rem' }}>
            <div 
              onClick={handleProfilePicClick}
              style={{
                position: 'absolute',
                top: '-60px',
                left: '1.5rem',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              {isSavingProfilePic && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}>
                  <Loader2 size={24} style={{ color: 'white', animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid rgba(99,102,241,0.5)',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                overflow: 'hidden',
                boxShadow: '0 0 0 4px rgba(99,102,241,0.2)'
              }}>
                <img
                  src={profilePicPreview}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = defaultProfilePic; }}
                />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: '#1e293b',
                borderRadius: '50%',
                padding: '0.25rem',
                border: '2px solid #0f172a'
              }}>
                <Camera size={14} style={{ color: '#6366f1' }} />
              </div>
              <input
                ref={profilePicInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Profile Info */}
            <div style={{ marginTop: '70px', paddingLeft: '140px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: textColor, marginBottom: '0.5rem' }}>
                {userData.displayName || 'Your Name'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <img src={cccLogo} alt="CCC Logo" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: '0.85rem', color: textSecondary }}>{userData.company}</span>
              </div>
              {userData.occupation && (
                <p style={{ fontSize: '0.85rem', color: '#818cf8', marginBottom: '0.5rem' }}>{userData.occupation}</p>
              )}
              {userData.bio && (
                <p style={{ fontSize: '0.8rem', color: textSecondary, marginTop: '0.5rem', lineHeight: 1.5 }}>{userData.bio}</p>
              )}
              {userData.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: textMuted }}>
                  <MapPin size={14} />
                  <span style={{ fontSize: '0.8rem' }}>{userData.location}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Picture Cropper Modal */}
        <AnimatePresence>
          {showProfileCropper && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: '90%',
                maxWidth: '600px',
                background: '#1e293b',
                borderRadius: '1rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Move size={18} /> Drag to position profile picture
                  </h3>
                  <button onClick={() => setShowProfileCropper(false)} style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}>
                    <X size={20} />
                  </button>
                </div>
                <div style={{ position: 'relative', height: '400px', margin: '1rem' }}>
                  <Cropper
                    image={profileImageToCrop}
                    crop={profileCrop}
                    zoom={profileZoom}
                    aspect={1}
                    onCropChange={setProfileCrop}
                    onZoomChange={setProfileZoom}
                    onCropComplete={onProfileCropComplete}
                    cropShape="round"
                    showGrid={true}
                  />
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(99,102,241,0.2)', display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setShowProfileCropper(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'rgba(239,68,68,0.2)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '0.5rem',
                      color: '#f87171',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileCropSave}
                    disabled={isSavingProfilePic}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: isSavingProfilePic ? 'not-allowed' : 'pointer',
                      opacity: isSavingProfilePic ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {isSavingProfilePic ? (
                      <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                    ) : (
                      <><CheckCircle size={16} /> Apply & Save</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cover Photo Cropper Modal */}
        <AnimatePresence>
          {showCoverCropper && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: '90%',
                maxWidth: '800px',
                background: '#1e293b',
                borderRadius: '1rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Move size={18} /> Drag to position cover photo (16:9)
                  </h3>
                  <button onClick={() => setShowCoverCropper(false)} style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}>
                    <X size={20} />
                  </button>
                </div>
                <div style={{ position: 'relative', height: '400px', margin: '1rem' }}>
                  <Cropper
                    image={coverImageToCrop}
                    crop={coverCrop}
                    zoom={coverZoom}
                    aspect={16/9}
                    onCropChange={setCoverCrop}
                    onZoomChange={setCoverZoom}
                    onCropComplete={onCoverCropComplete}
                    showGrid={true}
                  />
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(99,102,241,0.2)', display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setShowCoverCropper(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'rgba(239,68,68,0.2)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '0.5rem',
                      color: '#f87171',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCoverCropSave}
                    disabled={isSavingCoverPic}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: isSavingCoverPic ? 'not-allowed' : 'pointer',
                      opacity: isSavingCoverPic ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {isSavingCoverPic ? (
                      <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                    ) : (
                      <><CheckCircle size={16} /> Apply & Save</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar for main form save */}
        <AnimatePresence>
          {saving && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <div style={{ background: 'rgba(99,102,241,0.2)', borderRadius: '1rem', height: '0.5rem', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '1rem' }}
                />
              </div>
              <p style={{ fontSize: '0.7rem', color: textSecondary, textAlign: 'center', marginTop: '0.5rem' }}>
                Saving profile information...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.75rem'
              }}
            >
              <p style={{ fontSize: '0.8rem', color: '#f87171', textAlign: 'center' }}>{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.3)',
                borderRadius: '0.75rem'
              }}
            >
              <p style={{ fontSize: '0.8rem', color: '#34d399', textAlign: 'center' }}>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Form - Only for text data now */}
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255,255,255,0.8)',
              border: cardBorder,
              borderRadius: '1rem',
              overflow: 'hidden',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ padding: '1rem 1.5rem', borderBottom: darkMode ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.2)', background: darkMode ? 'transparent' : '#f8fafc' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: textColor, margin: 0 }}>Basic Information</h3>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                name="displayName"
                value={userData.displayName}
                onChange={handleInputChange}
                placeholder="Your Name"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: inputBg,
                  border: inputBorder,
                  borderRadius: '0.75rem',
                  color: textColor,
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              <textarea
                name="bio"
                value={userData.bio}
                onChange={handleInputChange}
                rows="3"
                placeholder="Tell us about yourself..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: inputBg,
                  border: inputBorder,
                  borderRadius: '0.75rem',
                  color: textColor,
                  outline: 'none',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
              <p style={{ fontSize: '0.65rem', color: textMuted, marginTop: '-0.5rem' }}>{userData.bio.length}/200 characters</p>
              <input
                type="text"
                name="location"
                value={userData.location}
                onChange={handleInputChange}
                placeholder="Location (City, Country)"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: inputBg,
                  border: inputBorder,
                  borderRadius: '0.75rem',
                  color: textColor,
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              
              {/* Phone Number with +63 prefix always visible */}
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: textMuted, zIndex: 1 }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute',
                    left: '2.5rem',
                    color: textSecondary,
                    fontSize: '0.9rem',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}>
                    +63
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userData.phoneNumber.replace(/^\+63/, '')}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, '');
                      if (value.length > 10) value = value.substring(0, 10);
                      setUserData(prev => ({
                        ...prev,
                        phoneNumber: value ? `+63${value}` : ''
                      }));
                    }}
                    placeholder="912 345 6789"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 5rem',
                      background: inputBg,
                      border: inputBorder,
                      borderRadius: '0.75rem',
                      color: textColor,
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.6rem', color: textMuted, marginTop: '-0.25rem' }}>
                Enter your 10-digit mobile number (e.g., 9123456789)
              </p>
            </div>
          </motion.div>

          {/* Professional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              background: darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255,255,255,0.8)',
              border: cardBorder,
              borderRadius: '1rem',
              overflow: 'hidden',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ padding: '1rem 1.5rem', borderBottom: darkMode ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.2)', background: darkMode ? 'transparent' : '#f8fafc' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: textColor, margin: 0 }}>Professional Information</h3>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select
                name="occupation"
                value={userData.occupation}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: inputBg,
                  border: inputBorder,
                  borderRadius: '0.75rem',
                  color: textColor,
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              >
                <option value="">Select Position</option>
                {positionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <textarea
                name="skills"
                value={userData.skills}
                onChange={handleInputChange}
                rows="3"
                placeholder="Skills & Expertise (separate with commas)"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: inputBg,
                  border: inputBorder,
                  borderRadius: '0.75rem',
                  color: textColor,
                  outline: 'none',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255,255,255,0.8)',
              border: cardBorder,
              borderRadius: '1rem',
              overflow: 'hidden',
              marginBottom: '2rem'
            }}
          >
            <div style={{ padding: '1rem 1.5rem', borderBottom: darkMode ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: darkMode ? 'transparent' : '#f8fafc' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: textColor, margin: 0 }}>Social Links</h3>
              <button
                type="button"
                onClick={addSocialLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(99,102,241,0.2)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '0.5rem',
                  color: '#818cf8',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} />
                Add Link
              </button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {socialLinks.map((link) => (
                <div key={link.id} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(link.id, e.target.value)}
                    placeholder="https://..."
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: inputBg,
                      border: inputBorder,
                      borderRadius: '0.75rem',
                      color: textColor,
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                  {socialLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(link.id)}
                      style={{
                        padding: '0 0.75rem',
                        background: 'rgba(239,68,68,0.2)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '0.75rem',
                        color: '#f87171',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* NFC Features Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}
          >
            {[
              { icon: <Wifi size={14} />, label: "NFC Ready" },
              { icon: <Radio size={14} />, label: "Tap to Share" },
              { icon: <Smartphone size={14} />, label: "Universal" },
              { icon: <Cpu size={14} />, label: "Real-time" },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#818cf8' }}>{item.icon}</span>
                <span style={{ fontSize: '0.7rem', color: textMuted }}>{item.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: '1rem', paddingBottom: '2rem' }}
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: darkMode ? 'rgba(30,41,59,0.8)' : '#f1f5f9',
                border: inputBorder,
                borderRadius: '0.75rem',
                color: textSecondary,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = inputBorder; e.currentTarget.style.color = textSecondary; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '0.75rem',
                color: 'white',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {saving ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={16} /> Save Profile Info</>}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ 
            marginTop: '1rem', 
            paddingTop: '1.5rem', 
            borderTop: darkMode ? '1px solid rgba(99,102,241,0.1)' : '1px solid rgba(99,102,241,0.15)', 
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '0.6rem', color: textMuted, letterSpacing: '0.06em' }}>
            © 2026 e-CARD · NFC Digital Business Card Platform · City College of Calamba
          </p>
        </motion.div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default UpdateProfile;