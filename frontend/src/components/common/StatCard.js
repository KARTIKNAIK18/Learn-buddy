import React from 'react';

/**
 * Reusable statistics card for dashboards.
 * @param {{ title, value, icon, color, subtitle }} props
 * icon: a Lucide React element e.g. <BookOpen size={22} />
 */
const StatCard = ({ title, value, icon, color = 'brand', subtitle }) => {
  const colorMap = {
    brand:  'bg-brand-100 text-brand-600',
    blue:   'bg-sky-100 text-sky-600',
    green:  'bg-emerald-100 text-emerald-600',
    violet: 'bg-violet-100 text-violet-600',
    purple: 'bg-violet-100 text-violet-600',
    yellow: 'bg-amber-100 text-amber-600',
    amber:  'bg-amber-100 text-amber-600',
    red:    'bg-red-100 text-red-600',
  };

  return (
    <div className="card flex items-center gap-5">
      <div className={`rounded-2xl p-4 flex-shrink-0 ${colorMap[color] || colorMap.brand}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-semibold truncate">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900 leading-tight mt-0.5">{value ?? '—'}</p>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
