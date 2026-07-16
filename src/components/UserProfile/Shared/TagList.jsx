import React from 'react';

const TagList = ({ title, items, icon: Icon, colorTheme = 'primary' }) => {
  if (!items || items.length === 0) return null;

  const getThemeClass = () => {
    switch (colorTheme) {
      case 'secondary':
        return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
      case 'tertiary':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-3">
      <h3 className="text-lg font-bold text-trek-neutral font-montserrat flex items-center gap-2 border-b border-slate-100 pb-3">
        {Icon && <Icon className="w-5 h-5 text-trek-primary" />}
        {title}
      </h3>
      <div className="flex flex-wrap gap-2 pt-1">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-default ${getThemeClass()}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagList;
