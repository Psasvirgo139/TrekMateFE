import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const RentalTable = ({
  rentals = [],
  loading,
  error,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onReturn,
  equipmentName,
  onBack,
}) => {
  return (
    <>
      {/* Sub-header */}
      {equipmentName && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Rentals for: <span className="text-trek-primary font-semibold">{equipmentName}</span>
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center py-12 text-red-500 text-sm">{error}</div>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {['Customer', 'Booking Code', 'Equipment', 'Qty', 'Days', 'Subtotal', 'Damage Fee', 'Status', 'Actions'].map(h => (
                      <th key={h}
                        className="sticky top-0 z-10 text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 border-b border-gray-200">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rentals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-400">No rentals found</td>
                    </tr>
                  ) : rentals.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.customerName ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.bookingCode ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{r.equipmentName ?? '—'}</td>
                      <td className="px-4 py-3 text-center">{r.quantity}</td>
                      <td className="px-4 py-3 text-center">{r.rentalDays} days</td>
                      <td className="px-4 py-3 font-medium">
                        {Number(r.subtotal).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-4 py-3">
                        {r.damageFee && Number(r.damageFee) > 0
                          ? <span className="text-red-600 font-medium">{Number(r.damageFee).toLocaleString('vi-VN')}₫</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {r.returned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            Returned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700">
                            Renting
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!r.returned && (
                          <button
                            onClick={() => onReturn(r)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-trek-primary text-white text-xs font-medium hover:bg-trek-tertiary transition-colors"
                          >
                            <RotateCcw size={12} />
                            Return Item
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
            <span>{totalElements ?? 0} rentals</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => onPageChange(page - 1)}
                className="px-2.5 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">‹</button>
              <span className="px-3 py-1 rounded border border-gray-200 bg-white font-medium text-gray-700">
                {page + 1} / {Math.max(totalPages, 1)}
              </span>
              <button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}
                className="px-2.5 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">›</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RentalTable;
