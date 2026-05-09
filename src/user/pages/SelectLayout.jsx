// src/user/pages/UpdateProfile.jsx

import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function UpdateProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      id: 1,
      title: "Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      gradient: "from-slate-700 to-slate-900",
      bgImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=600&fit=crop"
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Innovate Labs",
      location: "New York, NY",
      gradient: "from-indigo-700 to-indigo-900",
      bgImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=600&fit=crop"
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "Creative Studio",
      location: "Los Angeles, CA",
      gradient: "from-purple-700 to-purple-900",
      bgImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=600&fit=crop"
    },
    {
      id: 4,
      title: "DevOps Engineer",
      company: "Cloud Systems",
      location: "Seattle, WA",
      gradient: "from-emerald-700 to-emerald-900",
      bgImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=600&fit=crop"
    },
    {
      id: 5,
      title: "Data Scientist",
      company: "Analytics Pro",
      location: "Boston, MA",
      gradient: "from-amber-700 to-amber-900",
      bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop"
    }
  ];

  const handleCardSelect = (cardId) => {
    setSelectedRole(cardId === selectedRole ? null : cardId);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Digital Business Cards</h1>
        <p className="text-gray-500 mt-1">Choose your professional card design</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardSelect(card.id)}
            className={`
              group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer 
              transition-all duration-500 ease-in-out
              ${selectedRole && selectedRole !== card.id 
                ? 'blur-sm scale-95 opacity-60' 
                : selectedRole === card.id 
                  ? 'scale-105 shadow-2xl ring-4 ring-black ring-offset-2 z-10' 
                  : 'hover:scale-105 hover:shadow-xl'
              }
            `}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{ backgroundImage: `url(${card.bgImage})` }}
            ></div>
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient} opacity-90`}></div>
            
            {/* Card Content */}
            <div className="relative h-full flex flex-col p-6 text-white">
              {/* Top Section - Profile */}
              <div className="flex flex-col items-center text-center">
                <img
                  src={user?.photoURL || "https://ui-avatars.com/api/?name=" + (user?.displayName || 'User')}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg mb-4 transition-all duration-300"
                />
                <h3 className="text-xl font-bold">{user?.displayName || 'User'}</h3>
                <p className="text-sm text-white/80 mb-3 truncate max-w-full">{user?.email || 'No email'}</p>
                <div className="w-12 h-0.5 bg-white/50 mb-3"></div>
              </div>

              {/* Middle Section - Role Details */}
              <div className="flex-1 text-center mt-4">
                <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
                <p className="text-white/90 font-semibold">{card.company}</p>
                <p className="text-white/70 text-sm mt-1">{card.location}</p>
              </div>

              {/* Bottom Section - Action */}
              <div className="mt-auto pt-4">
                <button className="w-full py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold text-sm hover:bg-white/30 transition">
                  {selectedRole === card.id ? 'Selected' : 'Select Card'}
                </button>
              </div>
            </div>

            {/* Selected Badge */}
            {selectedRole === card.id && (
              <div className="absolute top-3 right-3 bg-black text-white rounded-full p-1.5 shadow-lg animate-pulse">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Selected Card */}
      {selectedRole && (
        <div className="mt-10 animate-fadeIn">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Your Selected Card Preview</h2>
          <div className="flex justify-center">
            <div className="w-80 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative bg-gradient-to-b from-slate-700 to-slate-900 transform transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-cover bg-center opacity-20" 
                style={{ backgroundImage: `url(${cards.find(c => c.id === selectedRole)?.bgImage})` }}>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-b ${cards.find(c => c.id === selectedRole)?.gradient} opacity-90`}></div>
              <div className="relative h-full flex flex-col p-6 text-white">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={user?.photoURL || "https://ui-avatars.com/api/?name=" + (user?.displayName || 'User')}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg mb-4"
                  />
                  <h3 className="text-xl font-bold">{user?.displayName || 'User'}</h3>
                  <p className="text-sm text-white/80 mb-3">{user?.email || 'No email'}</p>
                </div>
                <div className="flex-1 text-center mt-8">
                  <h2 className="text-2xl font-bold mb-2">
                    {cards.find(c => c.id === selectedRole)?.title}
                  </h2>
                  <p className="text-white/90 font-semibold">
                    {cards.find(c => c.id === selectedRole)?.company}
                  </p>
                  <p className="text-white/70 text-sm mt-2">
                    {cards.find(c => c.id === selectedRole)?.location}
                  </p>
                </div>
                <div className="mt-auto pt-4 text-center text-sm text-white/60">
                  Digital Business Card
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this to your global CSS or Tailwind config
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
`;

// Inject styles (or add to your index.css)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default UpdateProfile;