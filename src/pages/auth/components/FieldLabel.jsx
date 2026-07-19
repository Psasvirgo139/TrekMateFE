import React from 'react';

export default function FieldLabel({ required, children }) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-brand-dark">
      {children}
      {required && <span className="text-red-600 font-bold">*</span>}
    </span>
  );
}
