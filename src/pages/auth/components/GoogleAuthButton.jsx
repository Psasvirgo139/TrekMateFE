import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function GoogleAuthButton({ onError, onSuccess, disabled }) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        className="w-full h-10 flex items-center justify-center rounded-full px-4 font-semibold text-sm border border-brand-dark/15 bg-white text-gray-500 opacity-70 cursor-not-allowed"
        disabled
        title="Google Client ID not configured"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className={`flex justify-center mt-1 w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          size="large"
          width="100%"
          text="signin_with"
          shape="pill"
          locale="en"
        />
      </div>
    </div>
  );
}
