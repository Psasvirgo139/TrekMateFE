import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/common/ToastContainer';
import ConfirmModal from '../components/common/ConfirmModal';
import AuthRequiredModal from '../components/common/AuthRequiredModal';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Confirm modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // 'danger' | 'warning' | 'info'
    onConfirm: null,
  });

  // Auth modal state
  const [authConfig, setAuthConfig] = useState({
    isOpen: false,
    title: 'Authentication Required',
    message: 'Please log in to perform this action.',
  });

  // ─── Toast functions ──────────────────────────────────────────────────────
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', title = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  // ─── Confirm modal functions ──────────────────────────────────────────────
  const showConfirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to perform this action?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    onConfirm,
  }) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  // ─── Auth modal functions ─────────────────────────────────────────────────
  const showAuthModal = useCallback(({
    title = 'Authentication Required',
    message = 'Please log in to use this feature!',
  } = {}) => {
    setAuthConfig({
      isOpen: true,
      title,
      message,
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showConfirm,
        showAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={confirmConfig.onCancel}
      />
      <AuthRequiredModal
        isOpen={authConfig.isOpen}
        title={authConfig.title}
        message={authConfig.message}
        onClose={closeAuthModal}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
