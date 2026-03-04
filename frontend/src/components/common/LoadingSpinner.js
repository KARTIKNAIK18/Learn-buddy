import React from 'react';

const LoadingSpinner = ({ message = 'Loading…', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      {message && <p className="text-sm text-slate-500 font-medium">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
