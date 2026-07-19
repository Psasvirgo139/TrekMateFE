import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, EyeOff, Eye, Phone, AlertCircle } from 'lucide-react';

const EmergencyContactSection = ({ contact, isOwnProfile }) => {
  const [showContact, setShowContact] = useState(false);

  if (!isOwnProfile) {
    return (
      <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 text-center">
        <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-600">Emergency Contact Locked</h4>
        <p className="text-xs text-slate-400 mt-1">This information is private and visible only to the profile owner.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-trek-neutral font-montserrat flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          Emergency Contact
        </h3>
        <button
          onClick={() => setShowContact(!showContact)}
          className="text-xs font-bold text-trek-tertiary hover:text-trek-primary flex items-center gap-1 transition-colors duration-200"
        >
          {showContact ? (
            <>
              <EyeOff className="w-4 h-4" /> Hide
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> Reveal details
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showContact ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div className="bg-red-50/30 border border-red-100/40 p-3 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contact Name</span>
              <span className="text-sm font-bold text-slate-700">{contact?.name || 'N/A'}</span>
            </div>
            <div className="bg-red-50/30 border border-red-100/40 p-3 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Relationship</span>
              <span className="text-sm font-bold text-slate-700">{contact?.relationship || 'N/A'}</span>
            </div>
            <div className="bg-red-50/30 border border-red-100/40 p-3 rounded-2xl md:col-span-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <Phone className="w-3.5 h-3.5 text-red-500" />
                {contact?.phone || 'N/A'}
              </div>
            </div>
            {contact?.address && (
              <div className="bg-red-50/30 border border-red-100/40 p-3 rounded-2xl md:col-span-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contact Address</span>
                <span className="text-xs font-semibold text-slate-600">{contact?.address}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="py-4 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
            <LockOverlay onClick={() => setShowContact(true)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LockOverlay = ({ onClick }) => (
  <div className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:text-trek-primary" onClick={onClick}>
    <AlertCircle className="w-6 h-6 text-slate-400 animate-pulse" />
    <p className="text-xs font-bold text-slate-400">Click "Reveal details" to show contact info</p>
  </div>
);

export default EmergencyContactSection;
