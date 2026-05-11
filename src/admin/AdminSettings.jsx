import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';
import { logAdminAction } from './adminHelpers';
import { Upload, Trash2, Plus, Edit2, Save, X, Loader2, AlertCircle, CheckCircle, ImageIcon } from 'lucide-react';

const AdminSettings = ({ darkMode, T, currentUser }) => {
  const [schoolLogoURL, setSchoolLogoURL] = useState('');
  const [schoolLogoUploading, setSchoolLogoUploading] = useState(false);
  const [schoolLogoError, setSchoolLogoError] = useState('');
  const [schoolLogoSuccess, setSchoolLogoSuccess] = useState('');
  const logoInputRef = useRef(null);

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#4299E1');
  const [addingRole, setAddingRole] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleLabel, setEditingRoleLabel] = useState('');
  const [editingRoleColor, setEditingRoleColor] = useState('');
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  // Theme-based classes matching UpdateProfile
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const textSubClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const textMutedClass = darkMode ? 'text-gray-500' : 'text-gray-400';
  const inputBgClass = darkMode ? 'bg-gray-900' : 'bg-white';
  const inputBorderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBgClass = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const buttonPrimaryClass = darkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-700';
  const badgeClass = darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600';
  const warningBgClass = darkMode ? 'bg-yellow-900/10 border-yellow-800/30 text-yellow-500' : 'bg-yellow-50 border-yellow-200 text-yellow-600';
  const successBgClass = darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600';
  const errorBgClass = darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-500';
  const roleItemBgClass = darkMode ? 'bg-gray-800/50' : 'bg-gray-50';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'school'));
        if (snap.exists()) setSchoolLogoURL(snap.data().logoURL || '');
      } catch (e) { console.error(e); }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      try {
        const snap = await getDocs(query(collection(db, 'userRoles'), orderBy('createdAt', 'asc')));
        setRoles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setRolesLoading(false); }
    };
    fetchRoles();
  }, []);

  const handleLogoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const valid = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!valid.includes(file.type)) { setSchoolLogoError('Please select a JPEG, PNG, WEBP, or SVG file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setSchoolLogoError('Image must be under 5MB.'); return; }
    setSchoolLogoError('');
    setSchoolLogoSuccess('');
    setSchoolLogoUploading(true);
    try {
      const result = await uploadImage(file, 'settings/school-logo');
      const newUrl = result.url;
      await setDoc(doc(db, 'settings', 'school'), { logoURL: newUrl, updatedAt: new Date().toISOString(), updatedBy: currentUser?.email || 'admin' }, { merge: true });
      setSchoolLogoURL(newUrl);
      await logAdminAction(currentUser?.email, 'UPDATE_LOGO', null, 'School logo updated', { adminName: currentUser?.displayName });
      setSchoolLogoSuccess('School logo saved successfully!');
      setTimeout(() => setSchoolLogoSuccess(''), 3000);
    } catch (err) {
      setSchoolLogoError('Upload failed: ' + err.message);
    } finally {
      setSchoolLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await setDoc(doc(db, 'settings', 'school'), { logoURL: '', updatedAt: new Date().toISOString() }, { merge: true });
      setSchoolLogoURL('');
      await logAdminAction(currentUser?.email, 'UPDATE_LOGO', null, 'School logo removed', { adminName: currentUser?.displayName });
      setSchoolLogoSuccess('Logo removed.');
      setTimeout(() => setSchoolLogoSuccess(''), 2000);
    } catch (e) { setSchoolLogoError('Failed to remove logo.'); }
  };

  const handleAddRole = async () => {
    const label = newRoleLabel.trim();
    if (!label) { setRoleError('Role name cannot be empty.'); return; }
    if (roles.some(r => r.label.toLowerCase() === label.toLowerCase())) { setRoleError('A role with this name already exists.'); return; }
    setAddingRole(true);
    setRoleError('');
    try {
      const docRef = await addDoc(collection(db, 'userRoles'), {
        label, value: label.toLowerCase().replace(/\s+/g, '-'),
        color: newRoleColor, createdAt: new Date().toISOString(),
        createdBy: currentUser?.email || 'admin',
      });
      setRoles(prev => [...prev, { id: docRef.id, label, value: label.toLowerCase().replace(/\s+/g, '-'), color: newRoleColor }]);
      
      await logAdminAction(
        currentUser?.email, 
        'ADD_ROLE', 
        null, 
        `Added new role "${label}"`,
        { roleName: label, roleColor: newRoleColor, adminName: currentUser?.displayName }
      );
      
      setNewRoleLabel('');
      setRoleSuccess('Role added!');
      setTimeout(() => setRoleSuccess(''), 2000);
    } catch (e) { setRoleError('Failed to add role: ' + e.message); }
    finally { setAddingRole(false); }
  };

  const handleSaveEdit = async (id) => {
    const label = editingRoleLabel.trim();
    if (!label) { setRoleError('Role name cannot be empty.'); return; }
    
    const originalRole = roles.find(r => r.id === id);
    const changes = [];
    if (originalRole.label !== label) changes.push(`name: "${originalRole.label}" → "${label}"`);
    const changesText = changes.join(', ');
    
    try {
      await updateDoc(doc(db, 'userRoles', id), {
        label, value: label.toLowerCase().replace(/\s+/g, '-'),
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'admin',
      });
      setRoles(prev => prev.map(r => r.id === id ? { ...r, label, value: label.toLowerCase().replace(/\s+/g, '-') } : r));
      
      await logAdminAction(
        currentUser?.email, 
        'EDIT_ROLE', 
        null, 
        `Edited role from "${originalRole.label}" to "${label}"`,
        { roleName: label, changes: changesText, adminName: currentUser?.displayName }
      );
      
      setEditingRoleId(null);
      setRoleSuccess('Role updated!');
      setTimeout(() => setRoleSuccess(''), 2000);
    } catch (e) { setRoleError('Failed to update role.'); }
  };

  const handleDeleteRole = async (id) => {
    const roleToDelete = roles.find(r => r.id === id);
    if (!roleToDelete) return;
    
    setDeletingRoleId(id);
    try {
      await deleteDoc(doc(db, 'userRoles', id));
      setRoles(prev => prev.filter(r => r.id !== id));
      
      await logAdminAction(
        currentUser?.email, 
        'DELETE_ROLE', 
        null, 
        `Deleted role "${roleToDelete.label}"`,
        { roleName: roleToDelete.label, adminName: currentUser?.displayName }
      );
      
      setRoleSuccess('Role deleted.');
      setTimeout(() => setRoleSuccess(''), 2000);
    } catch (e) { setRoleError('Failed to delete role.'); }
    finally { setDeletingRoleId(null); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* School Logo Section */}
      <div className={`rounded-xl border ${cardBorderClass} ${cardBgClass} p-4 sm:p-6 shadow-sm`}>
        <h3 className={`text-xs font-bold tracking-wider ${textMutedClass} uppercase mb-4`}>School Logo</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className={`w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-dashed ${cardBorderClass}`}>
            {schoolLogoUploading ? (
              <Loader2 size={28} className={`${textMutedClass} animate-spin`} />
            ) : schoolLogoURL ? (
              <img src={schoolLogoURL} alt="School logo" className="w-full h-full object-contain p-3" />
            ) : (
              <ImageIcon size={32} className={textMutedClass} />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className={`text-sm ${textSubClass} mb-3`}>
              Upload your school's logo. It will appear across the platform for all users.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
              <button 
                onClick={() => logoInputRef.current?.click()} 
                disabled={schoolLogoUploading}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  darkMode 
                    ? 'bg-blue-900/20 text-blue-400 border border-blue-800 hover:bg-blue-900/30' 
                    : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                } ${schoolLogoUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Upload size={14} /> {schoolLogoUploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              {schoolLogoURL && (
                <button 
                  onClick={handleRemoveLogo}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    darkMode 
                      ? 'bg-red-900/20 text-red-400 border border-red-800 hover:bg-red-900/30' 
                      : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
            {schoolLogoError && (
              <p className={`text-xs ${errorBgClass} mt-2 flex items-center justify-center sm:justify-start gap-1`}>
                <AlertCircle size={12} /> {schoolLogoError}
              </p>
            )}
            {schoolLogoSuccess && (
              <p className={`text-xs ${successBgClass} mt-2 flex items-center justify-center sm:justify-start gap-1`}>
                <CheckCircle size={12} /> {schoolLogoSuccess}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className={`rounded-xl border ${cardBorderClass} ${cardBgClass} p-4 sm:p-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className={`text-xs font-bold tracking-wider ${textMutedClass} uppercase mb-1`}>User Roles</h3>
            <p className={`text-sm ${textSubClass}`}>These roles appear in registration and profile editor.</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeClass}`}>{roles.length} ROLES</span>
        </div>

        {roleError && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${errorBgClass} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
            <AlertCircle size={14} /> {roleError}
          </div>
        )}
        {roleSuccess && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${successBgClass} border ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
            <CheckCircle size={14} /> {roleSuccess}
          </div>
        )}

        {/* Add Role Form - Mobile friendly */}
        <div className="flex flex-col gap-3 mb-5 p-4 rounded-xl bg-opacity-50" style={{ background: darkMode ? 'rgba(255,255,255,0.02)' : '#F7FAFC', border: `1px solid ${cardBorderClass}` }}>
          <input 
            value={newRoleLabel} 
            onChange={e => { setNewRoleLabel(e.target.value); setRoleError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleAddRole(); }}
            placeholder="New role name (e.g. Teacher, Staff...)"
            className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition ${inputBgClass} border ${inputBorderClass} ${textClass}`} 
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={handleAddRole} 
              disabled={addingRole || !newRoleLabel.trim()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                darkMode 
                  ? 'bg-green-900/20 text-green-400 border border-green-800 hover:bg-green-900/30' 
                  : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
              } ${(addingRole || !newRoleLabel.trim()) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {addingRole ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Role
            </button>
          </div>
        </div>

        {rolesLoading ? (
          <div className="py-12 text-center">
            <div className={`w-6 h-6 border-2 ${darkMode ? 'border-gray-700 border-t-white' : 'border-gray-200 border-t-gray-900'} rounded-full animate-spin mx-auto mb-2`} />
            <span className={`text-sm ${textMutedClass}`}>Loading roles...</span>
          </div>
        ) : roles.length === 0 ? (
          <div className={`py-8 text-center border border-dashed rounded-xl ${textMutedClass}`}>
            No roles yet. Add your first role above.
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map(role => (
              <div key={role.id} className={`flex flex-wrap items-center gap-2 p-3 rounded-lg ${roleItemBgClass} border ${cardBorderClass}`}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: role.color || '#4299E1' }} />
                {editingRoleId === role.id ? (
                  <>
                    <input 
                      value={editingRoleLabel} 
                      onChange={e => setEditingRoleLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(role.id); if (e.key === 'Escape') setEditingRoleId(null); }}
                      autoFocus 
                      className={`flex-1 min-w-[120px] px-2 py-1.5 rounded-md text-sm focus:outline-none ${inputBgClass} border ${inputBorderClass} ${textClass}`} 
                    />
                    <button 
                      onClick={() => handleSaveEdit(role.id)} 
                      className={`p-1.5 rounded-md transition ${
                        darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <Save size={14} />
                    </button>
                    <button 
                      onClick={() => setEditingRoleId(null)} 
                      className={`p-1.5 rounded-md transition ${hoverBgClass} ${textMutedClass}`}
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`flex-1 text-sm font-medium ${textClass}`}>{role.label}</span>
                    <span className={`text-xs font-mono ${textMutedClass} hidden sm:inline`}>{role.value}</span>
                    <button 
                      onClick={() => { setEditingRoleId(role.id); setEditingRoleLabel(role.label); setEditingRoleColor(role.color || '#4299E1'); }} 
                      className={`p-1.5 rounded-md transition ${
                        darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteRole(role.id)} 
                      disabled={deletingRoleId === role.id}
                      className={`p-1.5 rounded-md transition ${
                        darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100'
                      } ${deletingRoleId === role.id ? 'opacity-50' : ''}`}
                    >
                      {deletingRoleId === role.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-xs ${warningBgClass} border`}>
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>Deleting a role does <strong>not</strong> update existing users with that role. Change their role manually from the Users tab if needed.</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminSettings;