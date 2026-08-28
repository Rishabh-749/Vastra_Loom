import React from 'react';

const SocialAuth = () => {
  const handleGoogleAuth = () => {
    // Redirects to backend OAuth endpoint
    window.location.href = 'http://localhost:8080/api/auth/google';
  };

  const handleAppleAuth = () => {
    // To be implemented later
    console.log("Apple auth clicked");
  };

  const handleGithubAuth = () => {
    // Redirects to backend OAuth endpoint for GitHub
    window.location.href = 'http://localhost:8080/api/auth/github';
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <button 
        type="button" 
        onClick={handleGoogleAuth}
        className="flex-1 py-3 flex items-center justify-center gap-2 border border-[#2a2520] rounded-full text-xs text-gray-300 hover:bg-[#1a1612] hover:border-[#3a3530] transition-all active:scale-[0.98]"
      >
        <i className="ri-google-fill text-lg"></i>
        <span className="hidden sm:block">Google</span>
      </button>
      <button 
        type="button" 
        onClick={handleAppleAuth}
        className="flex-1 py-3 flex items-center justify-center gap-2 border border-[#2a2520] rounded-full text-xs text-gray-300 hover:bg-[#1a1612] hover:border-[#3a3530] transition-all active:scale-[0.98]"
      >
        <i className="ri-apple-fill text-lg"></i>
        <span className="hidden sm:block">Apple</span>
      </button>
      <button 
        type="button" 
        onClick={handleGithubAuth}
        className="flex-1 py-3 flex items-center justify-center gap-2 border border-[#2a2520] rounded-full text-xs text-gray-300 hover:bg-[#1a1612] hover:border-[#3a3530] transition-all active:scale-[0.98]"
      >
        <i className="ri-github-fill text-lg"></i>
        <span className="hidden sm:block">GitHub</span>
      </button>
    </div>
  );
};

export default SocialAuth;
