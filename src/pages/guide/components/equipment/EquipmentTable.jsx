import React from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

const CONDITION_LABEL = {
  EXCELLENT: { label: 'Xuất sắc', cls: 'bg-emerald-100 text-emerald-700' },
  GOOD:      { label: 'Tốt',      cls: 'bg-blue-100 text-blue-700' },
  FAIR:      { label: 'Khá',      cls: 'bg-amber-100 text-amber-700' },
  RETIRED:   { label: 'Nghỉ hưu', cls: 'bg-red-100 text-red-700' },
};

const EquipmentTable = ({
  equipments = [],
  loading,
  error,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onEdit,
  onDelete,
  onToggle,
  onViewRentals,
}) => {
  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">
      Đang tải...
    </div>
  );
  if (error) return (
    <div className="flex-1 flex items-center justify-center py-12 text-red-500 text-sm">
      {error}
    </div>
  );

  return (
    <>
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Tên thiết bị', 'Danh mục', 'Giá/ngày', 'Tồn kho', 'Tình trạng', 'Trạng thái', 'Thao tác'].map(h => (
                  <th
                    key={h}
                    className="sticky top-0 z-10 text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 border-b border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">Không có thiết bị nào</td>
                </tr>
              ) : equipments.map(eq => {
                const cond = CONDITION_LABEL[eq.condition] || { label: eq.condition, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={eq.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {eq.imageUrl ? (
                          <img src={eq.imageUrl} alt={eq.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold text-base">
                            {eq.name?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{eq.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{eq.brand} {eq.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{eq.categoryName}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {Number(eq.pricePerDay).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${eq.availableStock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                        {eq.availableStock}
                      </span>
                      <span className="text-gray-400 text-xs">/{eq.totalStock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cond.cls}`}>
                        {cond.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {eq.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                          Ngừng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => onViewRentals(eq)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-trek-primary hover:bg-emerald-50 transition-colors"
                          title="Xem lượt thuê"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onEdit(eq)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onToggle(eq.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title={eq.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                        >
                          {eq.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button
                          onClick={() => onDelete(eq)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
        <span>{totalElements ?? 0} thiết bị</span>
        <div className="flex gap-1">
          <button
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="px-2.5 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            ‹
          </button>
          <span className="px-3 py-1 rounded border border-gray-200 bg-white font-medium text-gray-700">
            {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="px-2.5 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
};

export default EquipmentTable;
