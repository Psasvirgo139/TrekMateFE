import React from 'react';

export default function ParticipantsTable({ participantsInfo, numParticipants, formatDate }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h4 className="font-extrabold text-[#012d1d] text-base mb-4 pb-3 border-b border-gray-100">
        Participating members ({numParticipants} people)
      </h4>
      {participantsInfo && participantsInfo.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100">
                {["Full name", "Date of birth", "Nationality", "Fitness level"].map((h) => (
                  <th key={h} className="pb-2 pr-4 text-[10px] uppercase tracking-wider font-bold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participantsInfo.map((p, idx) => (
                <tr key={idx} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-gray-800">{p.fullName || p.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{formatDate(p.dateOfBirth || p.dob)}</td>
                  <td className="py-3 pr-4 text-gray-600">{p.nationality || "Vietnam"}</td>
                  <td className="py-3">
                    <span className="bg-emerald-50 text-[#012d1d] text-xs font-bold px-3 py-1 rounded-full">
                      {p.fitnessLevel || "Normal"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">The tour organizer is the only participant.</p>
      )}
    </div>
  );
}
