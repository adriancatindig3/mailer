import { useEffect, useState, useCallback, useRef } from 'react';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  collection, getDocs, doc, updateDoc, addDoc, serverTimestamp,
  query, orderBy, limit, onSnapshot, where, getDoc, setDoc, deleteDoc
} from 'firebase/firestore';
import { uploadImage } from '../config/cloudinary'; // adjust path if needed
// import logo from '../assets/e-CARD generic.png';
import {
  Users, BarChart2, ClipboardList,
  CheckCircle, XCircle, Trash2,
  Check, X, Moon, Sun, LogOut, Activity,
  Settings, Upload, Plus, Edit2, Save, ImageIcon,
  Loader2, GripVertical, AlertCircle
} from 'lucide-react';

const logo = "/e-CARD generic.png";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
const formatDate = (ts) => {
  if (!ts) return '—';
  try { return new Date(ts.seconds ? ts.seconds * 1000 : ts).toLocaleDateString(); } catch { return '—'; }
};
const formatDateTime = (ts) => {
  if (!ts) return '—';
  try {
    const d = new Date(ts.seconds ? ts.seconds * 1000 : ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};
const timeAgo = (ts) => {
  if (!ts) return '—';
  try {
    const d = new Date(ts.seconds ? ts.seconds * 1000 : ts);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return '—'; }
};

const logAdminAction = async (adminEmail, action, targetUser, details = '') => {
  try {
    await addDoc(collection(db, 'adminLogs'), {
      adminEmail, action,
      targetUserId: targetUser?.id || '',
      targetUserName: targetUser?.displayName || '',
      targetUserEmail: targetUser?.email || '',
      details,
      timestamp: serverTimestamp(),
    });
  } catch (e) { console.error('Failed to write admin log:', e); }
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick, activeColor = '#E8EDF5', activeBg = 'rgba(0,16,77,0.3)', activeBorder = 'rgba(27,55,105,0.5)' }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.35rem 0.875rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700,
      cursor: 'pointer', fontFamily: 'inherit',
      border: `1px solid ${active ? activeBorder : '#2A2D3E'}`,
      background: active ? activeBg : 'transparent',
      color: active ? activeColor : '#4A5168',
      transition: 'all 0.15s',
    }}>{label}</button>
  );
}

function ActionBtn({ label, color, bg, border, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '0.3rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.68rem', fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      border: `1px solid ${border}`, background: bg, color,
      opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s', whiteSpace: 'nowrap',
    }}>{label}</button>
  );
}

function StatCard({ label, value, color, darkMode }) {
  return (
    <div style={{
      background: darkMode ? 'rgba(26,29,39,0.7)' : 'rgba(255,255,255,0.95)',
      border: `1px solid ${darkMode ? '#2A2D3E' : 'rgba(99,102,241,0.2)'}`,
      borderRadius: '1rem', padding: '1.25rem 1rem', backdropFilter: 'blur(20px)',
      transition: 'all 0.2s ease', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: darkMode ? '#4A5168' : '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function AnalyticsBar({ label, value, max, color, darkMode }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.72rem', color: darkMode ? '#8892A4' : '#64748b' }}>{label}</span>
        <span style={{ fontSize: '0.72rem', color, fontWeight: 700 }}>{value} <span style={{ color: darkMode ? '#4A5168' : '#94a3b8' }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: color, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ T, darkMode, user }) {
  // School Logo state
  const [schoolLogoURL, setSchoolLogoURL] = useState('');
  const [schoolLogoUploading, setSchoolLogoUploading] = useState(false);
  const [schoolLogoError, setSchoolLogoError] = useState('');
  const [schoolLogoSuccess, setSchoolLogoSuccess] = useState('');
  const logoInputRef = useRef(null);

  // User Roles state
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#60a5fa');
  const [addingRole, setAddingRole] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleLabel, setEditingRoleLabel] = useState('');
  const [editingRoleColor, setEditingRoleColor] = useState('');
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  const PRESET_COLORS = [
    '#60a5fa', '#a78bfa', '#fb923c', '#34d399',
    '#f472b6', '#fbbf24', '#38bdf8', '#e879f9',
    '#86efac', '#f87171', '#c084fc', '#2dd4bf',
  ];

  // Fetch school settings from Firestore (doc: settings/school)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'school'));
        if (snap.exists()) {
          setSchoolLogoURL(snap.data().logoURL || '');
        }
      } catch (e) { console.error(e); }
    };
    fetchSettings();
  }, []);

  // Fetch roles from Firestore (collection: userRoles)
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

  // ── Logo upload ──
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
      await setDoc(doc(db, 'settings', 'school'), { logoURL: newUrl, updatedAt: new Date().toISOString(), updatedBy: user?.email || 'admin' }, { merge: true });
      setSchoolLogoURL(newUrl);
      await logAdminAction(user?.email, 'UPDATE_LOGO', null, 'School logo updated');
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
      setSchoolLogoSuccess('Logo removed.');
      setTimeout(() => setSchoolLogoSuccess(''), 2000);
    } catch (e) { setSchoolLogoError('Failed to remove logo.'); }
  };

  // ── Role management ──
  const handleAddRole = async () => {
    const label = newRoleLabel.trim();
    if (!label) { setRoleError('Role name cannot be empty.'); return; }
    if (roles.some(r => r.label.toLowerCase() === label.toLowerCase())) { setRoleError('A role with this name already exists.'); return; }
    setAddingRole(true);
    setRoleError('');
    try {
      const docRef = await addDoc(collection(db, 'userRoles'), {
        label,
        value: label.toLowerCase().replace(/\s+/g, '-'),
        color: newRoleColor,
        createdAt: serverTimestamp(),
        createdBy: user?.email || 'admin',
      });
      setRoles(prev => [...prev, { id: docRef.id, label, value: label.toLowerCase().replace(/\s+/g, '-'), color: newRoleColor }]);
      setNewRoleLabel('');
      setNewRoleColor('#60a5fa');
      setRoleSuccess('Role added!');
      setTimeout(() => setRoleSuccess(''), 2000);
    } catch (e) { setRoleError('Failed to add role: ' + e.message); }
    finally { setAddingRole(false); }
  };

  const handleSaveEdit = async (id) => {
    const label = editingRoleLabel.trim();
    if (!label) { setRoleError('Role name cannot be empty.'); return; }
    try {
      await updateDoc(doc(db, 'userRoles', id), {
        label,
        value: label.toLowerCase().replace(/\s+/g, '-'),
        color: editingRoleColor,
        updatedAt: new Date().toISOString(),
      });
      setRoles(prev => prev.map(r => r.id === id ? { ...r, label, value: label.toLowerCase().replace(/\s+/g, '-'), color: editingRoleColor } : r));
      setEditingRoleId(null);
      setRoleSuccess('Role updated!');
      setTimeout(() => setRoleSuccess(''), 2000);
    } catch (e) { setRoleError('Failed to update role.'); }
  };

  const handleDeleteRole = async (id) => {
    setDeletingRoleId(id);
    try {
      await deleteDoc(doc(db, 'userRoles', id));
      setRoles(prev => prev.filter(r => r.id !== id));
      setRoleSuccess('Role deleted.');
      setTimeout(() => setRoleSuccess(''), 2000);
    } catch (e) { setRoleError('Failed to delete role.'); }
    finally { setDeletingRoleId(null); }
  };

  const card = {
    background: T.card,
    border: `1px solid ${T.cardBorder}`,
    borderRadius: '1rem',
    padding: '1.5rem',
    backdropFilter: 'blur(20px)',
    marginBottom: '1.25rem',
    transition: 'background 0.3s',
  };

  const sectionLabel = {
    fontSize: '0.7rem', fontWeight: 700, color: T.textMuted,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    fontFamily: 'var(--font-mono, monospace)', marginBottom: '1.25rem',
  };

  const inputStyle = {
    flex: 1, padding: '0.65rem 1rem',
    background: T.inputBg, border: `1px solid ${T.cardBorder}`,
    borderRadius: '0.625rem', color: T.text, fontSize: '0.82rem',
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div style={{ maxWidth: 700 }}>

      {/* ── School Logo ── */}
      <div style={card}>
        <div style={sectionLabel}>School Logo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Preview */}
          <div style={{
            width: 96, height: 96, borderRadius: '1rem', flexShrink: 0,
            background: darkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
            border: `2px dashed ${T.cardBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative',
          }}>
            {schoolLogoUploading ? (
              <Loader2 size={24} color={T.textMuted} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : schoolLogoURL ? (
              <img src={schoolLogoURL} alt="School logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
            ) : (
              <ImageIcon size={28} color={T.textMuted} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.82rem', color: T.textSub, marginBottom: '0.75rem' }}>
              Upload your school's logo. It will appear across the platform for all users. Supports JPEG, PNG, WEBP, SVG — max 5MB.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={schoolLogoUploading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0.55rem 1.1rem', borderRadius: '0.625rem', fontSize: '0.78rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8',
                  opacity: schoolLogoUploading ? 0.6 : 1,
                }}>
                <Upload size={13} /> {schoolLogoUploading ? 'Uploading…' : 'Upload logo'}
              </button>
              {schoolLogoURL && (
                <button
                  onClick={handleRemoveLogo}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0.55rem 1.1rem', borderRadius: '0.625rem', fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171',
                  }}>
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoFileChange} style={{ display: 'none' }} />
            {schoolLogoError && <p style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> {schoolLogoError}</p>}
            {schoolLogoSuccess && <p style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> {schoolLogoSuccess}</p>}
          </div>
        </div>
      </div>

      {/* ── User Roles ── */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={sectionLabel}>User Roles</div>
            <p style={{ fontSize: '0.78rem', color: T.textSub, marginTop: '-0.75rem' }}>
              These roles will appear in the registration form and profile editor.
            </p>
          </div>
          <span style={{
            fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.6rem',
            borderRadius: '2rem', background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8',
            fontFamily: 'var(--font-mono, monospace)',
          }}>{roles.length} ROLES</span>
        </div>

        {/* Feedback */}
        {roleError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 0.875rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#f87171' }}>
            <AlertCircle size={13} /> {roleError}
          </div>
        )}
        {roleSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 0.875rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#34d399' }}>
            <CheckCircle size={13} /> {roleSuccess}
          </div>
        )}

        {/* Add new role form */}
        <div style={{
          display: 'flex', gap: '0.625rem', marginBottom: '1.25rem',
          padding: '1rem', background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.03)',
          border: `1px solid ${T.cardBorder}`, borderRadius: '0.75rem', flexWrap: 'wrap',
        }}>
          <input
            value={newRoleLabel}
            onChange={e => { setNewRoleLabel(e.target.value); setRoleError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole(); } }}
            placeholder="New role name (e.g. Teacher, Staff, Intern…)"
            style={{ ...inputStyle, minWidth: 180 }}
          />
          {/* Color picker */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewRoleColor(c)}
                style={{
                  width: 20, height: 20, borderRadius: '50%', background: c, border: 'none',
                  cursor: 'pointer', outline: newRoleColor === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 2, transition: 'transform 0.1s',
                  transform: newRoleColor === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <button
            onClick={handleAddRole}
            disabled={addingRole || !newRoleLabel.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.55rem 1.1rem', borderRadius: '0.625rem', fontSize: '0.78rem', fontWeight: 700,
              cursor: addingRole || !newRoleLabel.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399',
              opacity: addingRole || !newRoleLabel.trim() ? 0.5 : 1,
            }}>
            {addingRole ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={13} />}
            Add role
          </button>
        </div>

        {/* Role list */}
        {rolesLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: 10 }}>
            <div style={{ width: 18, height: 18, border: '2px solid rgba(0,16,77,0.3)', borderTopColor: '#1B3769', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.78rem', color: T.textMuted }}>Loading roles…</span>
          </div>
        ) : roles.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: T.textMuted, fontSize: '0.78rem', border: `1px dashed ${T.cardBorder}`, borderRadius: '0.75rem' }}>
            No roles yet. Add your first role above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {roles.map(role => (
              <div key={role.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '0.625rem',
                background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${T.cardBorder}`, transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(27,55,105,0.06)' : 'rgba(99,102,241,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
              >
                {/* Color dot */}
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color || '#60a5fa', flexShrink: 0 }} />

                {editingRoleId === role.id ? (
                  <>
                    <input
                      value={editingRoleLabel}
                      onChange={e => setEditingRoleLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(role.id); if (e.key === 'Escape') setEditingRoleId(null); }}
                      autoFocus
                      style={{ ...inputStyle, flex: 1, padding: '0.35rem 0.625rem', fontSize: '0.8rem' }}
                    />
                    {/* Color picker inline */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {PRESET_COLORS.slice(0, 6).map(c => (
                        <button key={c} onClick={() => setEditingRoleColor(c)}
                          style={{
                            width: 16, height: 16, borderRadius: '50%', background: c, border: 'none',
                            cursor: 'pointer', outline: editingRoleColor === c ? `2px solid ${c}` : 'none',
                            outlineOffset: 2, transform: editingRoleColor === c ? 'scale(1.25)' : 'scale(1)',
                          }} />
                      ))}
                    </div>
                    <button onClick={() => handleSaveEdit(role.id)}
                      style={{ padding: '0.3rem 0.625rem', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '0.375rem', color: '#34d399', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit' }}>
                      <Save size={11} /> Save
                    </button>
                    <button onClick={() => setEditingRoleId(null)}
                      style={{ padding: '0.3rem 0.5rem', background: 'transparent', border: `1px solid ${T.cardBorder}`, borderRadius: '0.375rem', color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: T.text }}>{role.label}</span>
                    <span style={{ fontSize: '0.62rem', color: T.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>{role.value}</span>
                    <button
                      onClick={() => { setEditingRoleId(role.id); setEditingRoleLabel(role.label); setEditingRoleColor(role.color || '#60a5fa'); setRoleError(''); }}
                      style={{ padding: '0.3rem 0.55rem', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: '0.375rem', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={deletingRoleId === role.id}
                      style={{ padding: '0.3rem 0.55rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.375rem', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: deletingRoleId === role.id ? 0.5 : 1 }}>
                      {deletingRoleId === role.id ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={12} />}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: darkMode ? 'rgba(251,191,36,0.05)' : 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '0.5rem', fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Deleting a role does <strong>not</strong> update existing users with that role. Change their role manually from the Users tab if needed.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({ total: 0, teaching: 0, nonTeaching: 0, alumni: 0, pending: 0, approved: 0, rejected: 0, pendingReactivation: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);

  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilterDate, setLogFilterDate] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('all');

  // Dynamic roles (fetched from Firestore for filter pills)
  const [dynamicRoles, setDynamicRoles] = useState([]);

  const navigate = useNavigate();

  const T = darkMode ? {
    bg: 'linear-gradient(135deg, #0a0a0f, #0d0d10)',
    card: 'rgba(26,29,39,0.7)',
    cardBorder: '#2A2D3E',
    text: '#E8EDF5',
    textSub: '#8892A4',
    textMuted: '#4A5168',
    inputBg: '#0F1117',
    headerBg: 'rgba(26,29,39,0.7)',
  } : {
    bg: '#f8fafc',
    card: 'rgba(255,255,255,0.95)',
    cardBorder: 'rgba(99,102,241,0.2)',
    text: '#1e293b',
    textSub: '#64748b',
    textMuted: '#94a3b8',
    inputBg: '#f1f5f9',
    headerBg: 'rgba(255,255,255,0.9)',
  };

  // Fetch dynamic roles for filter pills
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'userRoles'), orderBy('createdAt', 'asc')));
        setDynamicRoles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
    };
    fetchRoles();
  }, [activeTab]); // refresh when returning from settings

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllLogs = async () => {
    try {
      setLogsLoading(true);
      const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      const logsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllLogs(logsData);
      setLogs(logsData);
    } catch (error) { console.error('Error fetching logs:', error); }
    finally { setLogsLoading(false); }
  };

  useEffect(() => {
    if (activeTab !== 'logs') return;
    fetchAllLogs();
  }, [activeTab]);

  useEffect(() => {
    let filtered = [...allLogs];
    if (logFilterDate) {
      const filterDate = new Date(logFilterDate);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
      filtered = filtered.filter(log => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp.seconds ? log.timestamp.seconds * 1000 : log.timestamp);
        return logDate >= startOfDay && logDate <= endOfDay;
      });
    }
    if (logFilterAction !== 'all') {
      filtered = filtered.filter(log => log.action === logFilterAction);
    }
    setLogs(filtered);
  }, [logFilterDate, logFilterAction, allLogs]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'users'));
      let teaching = 0, nonTeaching = 0, alumni = 0, pending = 0,
        approved = 0, rejected = 0, pendingReactivation = 0;
      const list = [];
      const seenIds = new Set();
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.accountStatus === 'deleted') return;
        if (data.accountType === 'admin') return;
        if (seenIds.has(d.id)) return;
        seenIds.add(d.id);
        const u = {
          id: d.id,
          email: data.email || '',
          displayName: data.displayName || 'Unknown',
          photoURL: data.photoURL || data.profilePic || '',
          occupation: data.occupation || '',
          company: data.company || '',
          phoneNumber: data.phoneNumber || '',
          bio: data.bio || '',
          createdAt: data.createdAt || '',
          accountStatus: data.accountStatus || 'pending',
          isActive: data.isActive || false,
          reactivationRequestedAt: data.reactivationRequestedAt || null,
          accountType: data.accountType || 'user',
          selectedLayout: data.selectedLayout || 1,
          skills: data.skills || '',
        };
        list.push(u);
        const occ = u.occupation?.toLowerCase();
        if (occ === 'teaching') teaching++;
        else if (occ === 'non-teaching') nonTeaching++;
        else if (occ === 'alumni') alumni++;
        if (u.accountStatus === 'pending' || u.accountStatus === 'pending_reactivation') {
          if (u.accountStatus === 'pending_reactivation') pendingReactivation++;
          pending++;
        } else if (u.accountStatus === 'approved') approved++;
        else if (u.accountStatus === 'rejected') rejected++;
      });
      setUsers(list);
      setStats({ total: list.length, teaching, nonTeaching, alumni, pending, approved, rejected, pendingReactivation });
    } catch (e) { console.error('Error fetching users:', e); }
    finally { setLoading(false); }
  };

  const handleApproveUser = async (userId) => {
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        accountStatus: 'approved', isActive: true,
        approvedAt: new Date().toISOString(), approvedBy: user?.email || 'admin',
        reactivationRequestedAt: null, reactivationApprovedAt: new Date().toISOString(),
      });
      await logAdminAction(user?.email, 'APPROVE', selectedUser,
        selectedUser?.accountStatus === 'pending_reactivation' ? 'Reactivation approved' : 'New account approved');
      await fetchAllUsers();
      if (activeTab === 'logs') fetchAllLogs();
    } catch (e) { console.error('Error approving user:', e); }
    finally { setActionLoading(null); setShowConfirmModal(false); setSelectedUser(null); setActionType(null); }
  };

  const handleRejectUser = async (userId) => {
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        accountStatus: 'rejected', isActive: false,
        rejectedAt: new Date().toISOString(), rejectedBy: user?.email || 'admin',
      });
      await logAdminAction(user?.email, 'REJECT', selectedUser, 'Account rejected');
      await fetchAllUsers();
      if (activeTab === 'logs') fetchAllLogs();
    } catch (e) { console.error('Error rejecting user:', e); }
    finally { setActionLoading(null); setShowConfirmModal(false); setSelectedUser(null); setActionType(null); }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        accountStatus: 'pending', isActive: false,
        deletedAt: new Date().toISOString(), deletedBy: user?.email || 'admin',
      });
      await logAdminAction(user?.email, 'DELETE', selectedUser, 'Account deleted by admin');
      await fetchAllUsers();
      if (activeTab === 'logs') fetchAllLogs();
    } catch (e) { console.error('Error deleting user:', e); }
    finally { setActionLoading(null); setShowConfirmModal(false); setSelectedUser(null); setActionType(null); }
  };






  const openConfirmModal = (u, action) => { setSelectedUser(u); setActionType(action); setShowConfirmModal(true); };
  const handleConfirmAction = () => {
    if (!selectedUser) return;
    if (actionType === 'approve') handleApproveUser(selectedUser.id);
    else if (actionType === 'reject') handleRejectUser(selectedUser.id);
    else if (actionType === 'delete') handleDeleteUser(selectedUser.id);
  };

  // Build filter options dynamically from loaded roles
  const roleFilterOptions = [
    { id: 'all', label: 'All Roles' },
    ...dynamicRoles.map(r => ({ id: r.value, label: r.label })),
  ];

  const filteredUsers = users.filter(u => {
    const matchSearch = !searchTerm ||
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || u.occupation?.toLowerCase().replace(/\s+/g, '-') === filterRole;
    const matchStatus = filterStatus === 'all' || u.accountStatus === filterStatus ||
      (filterStatus === 'pending' && u.accountStatus === 'pending_reactivation');
    return matchSearch && matchRole && matchStatus;
  });

  const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', color: '#fbbf24' },
    pending_reactivation: { label: 'Reactivation', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', color: '#a78bfa' },
    approved: { label: 'Approved', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', color: '#34d399' },
    rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
  };

  const ROLE_COLORS = {
    teaching: { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', color: '#60a5fa' },
    'non-teaching': { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', color: '#a78bfa' },
    alumni: { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)', color: '#fb923c' },
  };

  // Build role color map from dynamicRoles for the table badge
  const dynamicRoleColorMap = dynamicRoles.reduce((acc, r) => {
    const hex = r.color || '#60a5fa';
    acc[r.value] = {
      bg: hex + '20',
      border: hex + '50',
      color: hex,
    };
    return acc;
  }, {});

  const getRoleCfg = (occupation) => {
    if (!occupation) return { bg: 'rgba(74,81,104,0.2)', border: 'rgba(74,81,104,0.3)', color: '#4A5168' };
    const key = occupation.toLowerCase().replace(/\s+/g, '-');
    return dynamicRoleColorMap[key] || ROLE_COLORS[key] || { bg: 'rgba(74,81,104,0.2)', border: 'rgba(74,81,104,0.3)', color: '#4A5168' };
  };

  const ACTION_LOG_CONFIG = {
    APPROVE: { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', icon: <CheckCircle size={11} />, text: 'Approved' },
    REJECT:  { color: '#f87171', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  icon: <XCircle   size={11} />, text: 'Rejected' },
    DELETE:  { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', icon: <Trash2    size={11} />, text: 'Deleted'  },
    UPDATE_LOGO: { color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', icon: <ImageIcon size={11} />, text: 'Logo Updated' },
  };

  const STAT_CARDS = [
    { label: 'Total Users',   value: stats.total,               color: '#60a5fa' },
    { label: 'Teaching',      value: stats.teaching,            color: '#60a5fa' },
    { label: 'Non-Teaching',  value: stats.nonTeaching,         color: '#a78bfa' },
    { label: 'Alumni',        value: stats.alumni,              color: '#fb923c' },
    { label: 'Pending',       value: stats.pending,             color: '#fbbf24' },
    { label: 'Reactivation',  value: stats.pendingReactivation, color: '#a78bfa' },
    { label: 'Approved',      value: stats.approved,            color: '#34d399' },
    { label: 'Rejected',      value: stats.rejected,            color: '#f87171' },
  ];

  const STATUS_FILTERS = [
    { id: 'all',                  label: 'All Status'  },
    { id: 'pending',              label: 'Pending'     },
    { id: 'pending_reactivation', label: 'Reactivation'},
    { id: 'approved',             label: 'Approved'    },
    { id: 'rejected',             label: 'Rejected'    },
  ];

  const TABS = [
    { id: 'users',     icon: <Users         size={15} />, label: 'Users'         },
    { id: 'analytics', icon: <BarChart2     size={15} />, label: 'Analytics'     },
    { id: 'logs',      icon: <ClipboardList size={15} />, label: 'Activity Logs' },
    { id: 'settings',  icon: <Settings      size={15} />, label: 'Settings'      },
  ];

  const layoutCounts = users.reduce((acc, u) => {
    const l = u.selectedLayout || 1;
    acc[l] = (acc[l] || 0) + 1;
    return acc;
  }, {});
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'var(--font-sans, sans-serif)', position: 'relative', transition: 'background 0.3s, color 0.3s' }}>
      {darkMode && <>
        <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #00104D 0%, transparent 70%)', filter: 'blur(140px)', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, #1B3769 0%, transparent 80%)', filter: 'blur(120px)', opacity: 0.12, pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── Header ── */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: T.headerBg, border: `1px solid ${T.cardBorder}`, borderRadius: '1rem', backdropFilter: 'blur(20px)', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: 'linear-gradient(135deg, #00104D, #1B3769)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logo} alt="e-CARD" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>e-CARD Admin</div>
              <div style={{ fontSize: '0.55rem', color: T.textMuted, letterSpacing: '0.08em', fontFamily: 'var(--font-mono, monospace)' }}>USER MANAGEMENT</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => setDarkMode(d => !d)}
              style={{ width: 48, height: 26, borderRadius: '2rem', background: darkMode ? '#6366f1' : '#cbd5e1', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: darkMode ? 24 : 2, transition: 'left 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {darkMode ? <Moon size={12} color="#6366f1" /> : <Sun size={12} color="#f59e0b" />}
              </div>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.75rem', background: darkMode ? 'rgba(15,17,23,0.6)' : '#f1f5f9', border: `1px solid ${T.cardBorder}`, borderRadius: '0.5rem' }}>
              <Activity size={10} color="#34d399" />
              <span style={{ fontSize: '0.65rem', color: T.textSub, fontFamily: 'var(--font-mono, monospace)' }}>ADMIN</span>
            </div>

            <button
              onClick={async () => { await signOut(auth); navigate('/login', { replace: true }); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', background: darkMode ? 'rgba(15,17,23,0.6)' : '#f1f5f9', border: `1px solid ${T.cardBorder}`, borderRadius: '0.625rem', color: T.textSub, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.cardBorder; e.currentTarget.style.color = T.textSub; }}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </header>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STAT_CARDS.map(s => <StatCard key={s.label} label={s.label} value={s.value} color={s.color} darkMode={darkMode} />)}
        </div>

        {/* ── Tab Nav ── */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: `1px solid ${T.cardBorder}`, paddingBottom: '0.5rem' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1.25rem', borderRadius: '0.625rem', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                background: activeTab === tab.id ? (darkMode ? 'rgba(27,55,105,0.4)' : 'rgba(99,102,241,0.12)') : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? (darkMode ? '#93c5fd' : '#6366f1') : T.textMuted,
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ══ TAB: USERS ══ */}
        {activeTab === 'users' && (
          <>
            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: '1rem', padding: '1.25rem', backdropFilter: 'blur(20px)', marginBottom: '1rem', transition: 'background 0.3s' }}>
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" fill="none" stroke={T.textMuted} viewBox="0 0 24 24" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  style={{ width: '100%', boxSizing: 'border-box', background: T.inputBg, border: `1px solid ${T.cardBorder}`, borderRadius: '0.625rem', padding: '0.7rem 0.875rem 0.7rem 2.25rem', fontSize: '0.82rem', color: T.text, outline: 'none', fontFamily: 'inherit', transition: 'background 0.3s, color 0.3s' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {/* Dynamic role filters */}
                {roleFilterOptions.map(f => <FilterPill key={f.id} label={f.label} active={filterRole === f.id} onClick={() => setFilterRole(f.id)} />)}
                <div style={{ width: 1, background: T.cardBorder, margin: '0 4px' }} />
                {STATUS_FILTERS.map(f => {
                  const cfg = STATUS_CONFIG[f.id];
                  return <FilterPill key={f.id} label={f.label} active={filterStatus === f.id} onClick={() => setFilterStatus(f.id)} activeColor={cfg?.color} activeBg={cfg?.bg} activeBorder={cfg?.border} />;
                })}
              </div>
            </div>

            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: '1rem', overflow: 'hidden', backdropFilter: 'blur(20px)', transition: 'background 0.3s' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: 12 }}>
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(0,16,77,0.3)', borderTopColor: '#1B3769', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: '0.8rem', color: T.textMuted }}>Loading users...</span>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                        {['User', 'Email', 'Position', 'Status', 'Phone', 'Joined', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: T.textMuted, fontSize: '0.82rem' }}>No users found</td></tr>
                      ) : filteredUsers.map(u => {
                        const statusCfg = STATUS_CONFIG[u.accountStatus] || STATUS_CONFIG.pending;
                        const roleCfg = getRoleCfg(u.occupation);
                        const isPending = u.accountStatus === 'pending' || u.accountStatus === 'pending_reactivation';
                        return (
                          <tr key={u.id} style={{ borderBottom: `1px solid ${T.cardBorder}`, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(27,55,105,0.05)' : 'rgba(99,102,241,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #00104D, #1B3769)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {u.photoURL ? <img src={u.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'white' }}>{getInitials(u.displayName)}</span>}
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: T.text }}>{u.displayName}</div>
                                  {u.bio && <div style={{ fontSize: '0.68rem', color: T.textMuted, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.875rem 1.25rem' }}><span style={{ fontSize: '0.78rem', color: T.textSub }}>{u.email}</span></td>
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              {u.occupation
                                ? <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '2rem', background: roleCfg.bg, border: `1px solid ${roleCfg.border}`, color: roleCfg.color }}>{u.occupation}</span>
                                : <span style={{ color: T.textMuted, fontSize: '0.78rem' }}>—</span>}
                            </td>
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '2rem', background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.color }}>{statusCfg.label}</span>
                            </td>
                            <td style={{ padding: '0.875rem 1.25rem' }}><span style={{ fontSize: '0.78rem', color: T.textSub }}>{u.phoneNumber || '—'}</span></td>
                            <td style={{ padding: '0.875rem 1.25rem' }}><span style={{ fontSize: '0.72rem', color: T.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>{formatDate(u.createdAt)}</span></td>
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                {isPending && <>
                                  <ActionBtn label="Approve" color="#34d399" bg="rgba(52,211,153,0.12)" border="rgba(52,211,153,0.3)" onClick={() => openConfirmModal(u, 'approve')} disabled={actionLoading === u.id} />
                                  <ActionBtn label="Reject"  color="#f87171" bg="rgba(239,68,68,0.12)"  border="rgba(239,68,68,0.3)"  onClick={() => openConfirmModal(u, 'reject')}  disabled={actionLoading === u.id} />
                                </>}
                                {u.accountStatus === 'approved' && <ActionBtn label="Delete"  color="#f87171" bg="rgba(239,68,68,0.12)"  border="rgba(239,68,68,0.3)"  onClick={() => openConfirmModal(u, 'delete')}  disabled={actionLoading === u.id} />}
                                {u.accountStatus === 'rejected' && <ActionBtn label="Approve" color="#34d399" bg="rgba(52,211,153,0.12)" border="rgba(52,211,153,0.3)" onClick={() => openConfirmModal(u, 'approve')} disabled={actionLoading === u.id} />}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ padding: '0.875rem 1.25rem', borderTop: `1px solid ${T.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: T.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>SHOWING {filteredUsers.length} OF {users.length} USERS</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={10} color="#34d399" />
                  <span style={{ fontSize: '0.65rem', color: T.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>LIVE</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ TAB: ANALYTICS ══ */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: '1rem', padding: '1.5rem', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', marginBottom: '1.25rem' }}>ROLE DISTRIBUTION</div>
              {dynamicRoles.length > 0
                ? dynamicRoles.map(r => (
                  <AnalyticsBar key={r.id} label={r.label}
                    value={users.filter(u => u.occupation?.toLowerCase().replace(/\s+/g, '-') === r.value).length}
                    max={stats.total} color={r.color || '#60a5fa'} darkMode={darkMode} />
                ))
                : <>
                  <AnalyticsBar label="Teaching"     value={stats.teaching}   max={stats.total} color="#60a5fa" darkMode={darkMode} />
                  <AnalyticsBar label="Non-Teaching" value={stats.nonTeaching} max={stats.total} color="#a78bfa" darkMode={darkMode} />
                  <AnalyticsBar label="Alumni"       value={stats.alumni}     max={stats.total} color="#fb923c" darkMode={darkMode} />
                </>
              }
            </div>

            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: '1rem', padding: '1.5rem', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', marginBottom: '1.25rem' }}>ACCOUNT STATUS</div>
              <AnalyticsBar label="Approved"     value={stats.approved}            max={stats.total} color="#34d399" darkMode={darkMode} />
              <AnalyticsBar label="Pending"      value={stats.pending}             max={stats.total} color="#fbbf24" darkMode={darkMode} />
              <AnalyticsBar label="Rejected"     value={stats.rejected}            max={stats.total} color="#f87171" darkMode={darkMode} />
              <AnalyticsBar label="Reactivation" value={stats.pendingReactivation} max={stats.total} color="#a78bfa" darkMode={darkMode} />
              <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: darkMode ? 'rgba(52,211,153,0.07)' : 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: T.textSub }}>Approval Rate</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono, monospace)' }}>{approvalRate}%</span>
              </div>
            </div>

            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: '1rem', padding: '1.5rem', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', marginBottom: '1.25rem' }}>LAYOUT POPULARITY</div>
              {[1,2,3,4,5,6,7,8,9].map((l, i) => {
                const colors = ['#60a5fa','#a78bfa','#34d399','#fb923c','#f472b6','#fbbf24','#38bdf8','#e879f9','#86efac'];
                return <AnalyticsBar key={l} label={`Layout ${l}`} value={layoutCounts[l] || 0} max={stats.total || 1} color={colors[i]} darkMode={darkMode} />;
              })}
            </div>

            <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: '1rem', padding: '1.5rem', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', marginBottom: '1.25rem' }}>QUICK INSIGHTS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Total Registered', value: stats.total,       color: '#60a5fa' },
                  { label: 'Active Accounts',  value: stats.approved,    color: '#34d399' },
                  { label: 'Need Action',      value: stats.pending,     color: '#fbbf24' },
                  { label: 'Approval Rate',    value: `${approvalRate}%`,color: '#34d399' },
                  { label: 'Teaching Staff',   value: stats.teaching,    color: '#60a5fa' },
                  { label: 'Non-Teaching',     value: stats.nonTeaching, color: '#a78bfa' },
                  { label: 'Alumni',           value: stats.alumni,      color: '#fb923c' },
                  { label: 'Rejected',         value: stats.rejected,    color: '#f87171' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '0.9rem', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)', border: `1px solid ${T.cardBorder}`, borderRadius: '0.625rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-mono, monospace)' }}>{item.value}</div>
                    <div style={{ fontSize: '0.6rem', color: T.textMuted, marginTop: 4, fontWeight: 600, letterSpacing: '0.03em' }}>{item.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: LOGS ══ */}
        {activeTab === 'logs' && (
          <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: '1rem', overflow: 'hidden', backdropFilter: 'blur(20px)', transition: 'background 0.3s' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.cardBorder}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: T.text }}>Admin Activity Logs</div>
                  <div style={{ fontSize: '0.65rem', color: T.textMuted, marginTop: 2 }}>All administrative actions are recorded here</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={10} color="#34d399" />
                  <span style={{ fontSize: '0.65rem', color: T.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>LIVE</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.65rem', color: T.textMuted, display: 'block', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>FILTER BY DATE</label>
                  <input type="date" value={logFilterDate} onChange={(e) => setLogFilterDate(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 1rem', background: T.inputBg, border: `1px solid ${T.cardBorder}`, borderRadius: '0.625rem', color: T.text, fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }} />
                </div>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <label style={{ fontSize: '0.65rem', color: T.textMuted, display: 'block', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>FILTER BY ACTION</label>
                  <select value={logFilterAction} onChange={(e) => setLogFilterAction(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 1rem', background: T.inputBg, border: `1px solid ${T.cardBorder}`, borderRadius: '0.625rem', color: T.text, fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                    <option value="all">All Actions</option>
                    <option value="APPROVE">Approved</option>
                    <option value="REJECT">Rejected</option>
                    <option value="DELETE">Deleted</option>
                    <option value="UPDATE_LOGO">Logo Updated</option>
                  </select>
                </div>
                {(logFilterDate || logFilterAction !== 'all') && (
                  <button onClick={() => { setLogFilterDate(''); setLogFilterAction('all'); }}
                    style={{ padding: '0.6rem 1.25rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.625rem', color: '#f87171', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {logsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: 12 }}>
                <div style={{ width: 20, height: 20, border: '2px solid rgba(0,16,77,0.3)', borderTopColor: '#1B3769', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '0.8rem', color: T.textMuted }}>Loading logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: T.textMuted, fontSize: '0.82rem' }}>No activity logs found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                      {['Time', 'Admin', 'Action', 'Target User', 'Target Email', 'Details'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const actionCfg = ACTION_LOG_CONFIG[log.action] || { color: '#8892A4', bg: 'rgba(74,81,104,0.1)', border: 'rgba(74,81,104,0.2)', icon: null, text: log.action };
                      return (
                        <tr key={log.id} style={{ borderBottom: `1px solid ${T.cardBorder}`, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(27,55,105,0.05)' : 'rgba(99,102,241,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '0.72rem', color: T.textSub, fontFamily: 'var(--font-mono, monospace)' }}>{timeAgo(log.timestamp)}</div>
                            <div style={{ fontSize: '0.62rem', color: T.textMuted, marginTop: 1 }}>{formatDateTime(log.timestamp)}</div>
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem' }}><span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>{log.adminEmail || '—'}</span></td>
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '2rem', background: actionCfg.bg, border: `1px solid ${actionCfg.border}`, color: actionCfg.color, whiteSpace: 'nowrap', lineHeight: 1 }}>
                              {actionCfg.icon}{actionCfg.text}
                            </span>
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem' }}><span style={{ fontSize: '0.78rem', fontWeight: 600, color: T.text }}>{log.targetUserName || '—'}</span></td>
                          <td style={{ padding: '0.875rem 1.25rem' }}><span style={{ fontSize: '0.72rem', color: T.textSub }}>{log.targetUserEmail || '—'}</span></td>
                          <td style={{ padding: '0.875rem 1.25rem' }}><span style={{ fontSize: '0.72rem', color: T.textMuted, fontStyle: 'italic' }}>{log.details || '—'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ padding: '0.875rem 1.25rem', borderTop: `1px solid ${T.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: T.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>SHOWING {logs.length} OF {allLogs.length} ENTRIES</span>
              <span style={{ fontSize: '0.65rem', color: T.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>STORED IN FIRESTORE · adminLogs</span>
            </div>
          </div>
        )}

        {/* ══ TAB: SETTINGS ══ */}
        {activeTab === 'settings' && <SettingsTab T={T} darkMode={darkMode} user={user} />}

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: `1px solid ${T.cardBorder}`, textAlign: 'center' }}>
          <span style={{ fontSize: '0.6rem', color: T.textMuted, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.06em' }}>
            CITY COLLEGE OF CALAMBA · e-CARD ADMIN PANEL
          </span>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {showConfirmModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1.5rem' }}>
          <div style={{ background: darkMode ? '#1A1D27' : 'white', border: `1px solid ${T.cardBorder}`, borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: 420, boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: T.text, marginBottom: 6 }}>
                {actionType === 'approve' ? 'Approve User' : actionType === 'reject' ? 'Reject User' : 'Delete User'}
              </div>
              <p style={{ fontSize: '0.82rem', color: T.textSub, lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to <strong style={{ color: actionType === 'approve' ? '#34d399' : '#f87171' }}>{actionType}</strong> <strong style={{ color: T.text }}>{selectedUser.displayName}</strong>?
                {selectedUser.accountStatus === 'pending_reactivation' && actionType === 'approve' && ' This will reactivate their account.'}
                {actionType === 'delete' && ' This action cannot be undone.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setShowConfirmModal(false); setSelectedUser(null); setActionType(null); }}
                style={{ flex: 1, padding: '0.75rem', background: darkMode ? 'rgba(26,29,39,0.7)' : '#f1f5f9', border: `1px solid ${T.cardBorder}`, borderRadius: '0.625rem', color: T.textSub, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={handleConfirmAction} disabled={actionLoading === selectedUser.id}
                style={{ flex: 1, padding: '0.75rem', background: actionType === 'approve' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${actionType === 'approve' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '0.625rem', color: actionType === 'approve' ? '#34d399' : '#f87171', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {actionLoading === selectedUser.id ? 'Processing...' : `Confirm ${actionType?.charAt(0).toUpperCase() + actionType?.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminDashboard;