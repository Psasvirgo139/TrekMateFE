import React from 'react';

export default function PaymentsList({ payments, formatPrice, formatDate }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h4 className="font-extrabold text-[#012d1d] text-base mb-4 pb-3 border-b border-gray-100">
        Payment transaction history
      </h4>
      {payments && payments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {payments.map((payment) => {
            const paid = payment.status === "success" || payment.status === "PAID";
            return (
              <div key={payment.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex flex-col gap-1">
                  <span className="self-start bg-[#012d1d] text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                    {payment.method}
                  </span>
                  <span className="text-xs font-mono text-gray-500">Code: {payment.gatewayTxnId || payment.id}</span>
                  <span className="text-[11px] text-gray-400">{formatDate(payment.paidAt || payment.createdAt, true)}</span>
                </div>
                <div className="text-right">
                  <span className="block font-extrabold text-[#012d1d] text-sm">{formatPrice(payment.amount)}</span>
                  <span className={`text-xs font-bold mt-0.5 block ${paid ? "text-emerald-600" : "text-amber-600"}`}>
                    {paid ? "Success" : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No payment transactions have been recorded for this order yet.</p>
      )}
    </div>
  );
}
