import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import FloatingConnectForm from "../components/FloatingConnectForm";
import {
  Layout1,
  Layout2,
  Layout3,
  Layout4,
  Layout5,
  Layout6,
  Layout7,
  Layout8,
  Layout9,
} from "../layouts";

const PublicProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolLogo, setSchoolLogo] = useState("/CCC.png");
  const { userId } = useParams();
  const navigate = useNavigate();

  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connectEmail, setConnectEmail] = useState("");
  const [connectName, setConnectName] = useState("");
  const [connectCompany, setConnectCompany] = useState("");
  const [connectPhone, setConnectPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState("");

  // Fetch school logo from Firestore
  useEffect(() => {
    const fetchSchoolLogo = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "school"));
        if (settingsDoc.exists() && settingsDoc.data().logoURL) {
          setSchoolLogo(settingsDoc.data().logoURL);
        }
      } catch (error) {
        console.error("Error fetching school logo:", error);
      }
    };
    fetchSchoolLogo();
  }, []);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && showConnectForm) setShowConnectForm(false);
    };
    if (showConnectForm) document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [showConnectForm]);

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!connectEmail.trim() || !connectName.trim()) {
      setSendError("Please fill in all required fields.");
      return;
    }
    if (!userData?.email) {
      setSendError("Profile owner has no email address configured.");
      return;
    }
    setIsSending(true);
    setSendError("");

    try {
      const response = await fetch("/.netlify/functions/sendMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          setConnectEmail("");
          setConnectName("");
          setConnectCompany("");
          setConnectPhone("");
          setMessage("");
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to send");
      }
    } catch (err) {
      setIsSending(false);
      setSendError("Failed to send. Please try again.");
      console.error("Email error:", err);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        navigate("/");
        return;
      }
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }
        const data = userDoc.data();
        const allSocialLinks = {
          facebook: data.socialLinks?.facebook || "",
          twitter: data.socialLinks?.twitter || "",
          instagram: data.socialLinks?.instagram || "",
          linkedin: data.socialLinks?.linkedin || "",
          github: data.socialLinks?.github || "",
          youtube: data.socialLinks?.youtube || "",
          website: data.socialLinks?.website || "",
          ...data.socialLinks,
        };
        setUserData({
          displayName: data.displayName || "User",
          email: data.email || "",
          photoURL: data.photoURL || "",
          bio: data.bio || "",
          location: data.location || "",
          phoneNumber: data.phoneNumber || "",
          occupation: data.occupation || "",
          company: data.company || "City College of Calamba",
          companyLogo: "/CCC.png",
          joinDate: data.joinDate || "",
          socialLinks: allSocialLinks,
          selectedLayout: data.selectedLayout || 1,
          coverPhotoURL: data.coverPhotoURL || "",
          createdAt: data.createdAt || "",
          skills: data.skills || "",
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId, navigate]);

  const layoutComponents = {
    1: Layout1,
    2: Layout2,
    3: Layout3,
    4: Layout4,
    5: Layout5,
    6: Layout6,
    7: Layout7,
    8: Layout8,
    9: Layout9,
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
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-100 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
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

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <SelectedLayout 
              userData={userData} 
              schoolLogo={schoolLogo} 
              onConnect={() => setShowConnectForm(true)} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfile;