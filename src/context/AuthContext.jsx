import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../services/authApi';
import { clearToken } from '../utils/authToken';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    const onLogout = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = authApi.getStoredToken();
    if (!token) {
      setUser(null);
      return null;
    }
    const profile = await authApi.getMe();
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        if (authApi.getStoredToken()) {
          const profile = await authApi.getMe();
          if (!cancelled) setUser(profile);
        }
      } catch {
        clearToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const response = await authApi.login({ email, password, rememberMe });
    authApi.storeToken(response.accessToken, rememberMe);
    setUser(response.user);
    return response;
  }, []);

  const googleLogin = useCallback(async (idToken, rememberMe = false) => {
    const response = await authApi.googleLogin({ idToken, rememberMe });
    authApi.storeToken(response.accessToken, rememberMe);
    setUser(response.user);
    return response;
  }, []);

  const requestRegistrationOtp = useCallback(async (payload) => {
    return authApi.requestRegistrationOtp(payload);
  }, []);

  const verifyRegistration = useCallback(async (email, otp) => {
    const response = await authApi.verifyRegistration({ email, otp });
    authApi.storeToken(response.accessToken, true);
    setUser(response.user);
    return response;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return authApi.forgotPassword({ email });
  }, []);

  const resetPassword = useCallback(async (payload) => {
    return authApi.resetPassword(payload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      googleLogin,
      requestRegistrationOtp,
      verifyRegistration,
      forgotPassword,
      resetPassword,
      logout,
      refreshUser,
    }),
    [
      user,
      loading,
      login,
      googleLogin,
      requestRegistrationOtp,
      verifyRegistration,
      forgotPassword,
      resetPassword,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useHasRole(...roles) {
  const { user } = useAuth();
  if (!user?.roles?.length) return false;
  return roles.some((role) => user.roles.includes(role));
}
