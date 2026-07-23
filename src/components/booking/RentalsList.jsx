import React from 'react';

export default function RentalsList({ rentals, formatPrice }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h4 className="font-extrabold text-[#012d1d] text-base mb-4 pb-3 border-b border-gray-100">
        Rental climbing equipment
      </h4>
      {rentals && rentals.length > 0 ? (
        <div className="flex flex-col divide-y divide-gray-50">
          {rentals.map((rental) => (
            <div key={rental.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                {rental.imageUrl ? (
                  <img src={rental.imageUrl} alt={rental.equipmentName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🎒</span>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h5 className="font-bold text-[#012d1d] text-sm">{rental.equipmentName}</h5>
                <p className="text-xs text-gray-500 mt-0.5">{rental.brand} {rental.model}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatPrice(rental.pricePerDay)}/day × {rental.rentalDays} days
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-xs text-gray-400">
                  Quantity: <strong className="text-gray-700">{rental.quantity}</strong>
                </span>
                <span className="block font-bold text-[#012d1d] text-sm mt-1">
                  {formatPrice(rental.subtotal)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No rental climbing equipment for this trip.</p>
      )}
    </div>
  );
}
