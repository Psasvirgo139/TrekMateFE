import React from 'react';
import { Package, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

const EquipmentStatsBar = ({ stats }) => {
  const cards = [
    {
      label: 'Tổng thiết bị',
      value: stats?.total ?? '—',
      icon: Package,
      color: 'text-trek-primary',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Đang hoạt động',
      value: stats?.active ?? '—',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Ngừng hoạt động',
      value: stats?.inactive ?? '—',
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: 'Đang cho thuê',
      value: stats?.renting ?? '—',
      icon: ShoppingBag,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`${c.bg} p-2 rounded-lg`}>
              <Icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EquipmentStatsBar;
