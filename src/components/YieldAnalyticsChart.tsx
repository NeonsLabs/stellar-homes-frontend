"use client";

import React from "react";

export const YieldAnalyticsChart: React.FC = () => {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 mb-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Historical Yield Performance (APY)</h3>
      <div className="h-40 w-full flex items-end gap-2 pt-4">
        {[40, 55, 60, 75, 80, 85, 90, 88, 95, 100].map((val, i) => (
          <div key={i} className="flex-1 bg-blue-600/60 hover:bg-blue-500 rounded-t" style={{ height: `${val}%` }} />
        ))}
      </div>
    </div>
  );
};
