"use client";

import React, { useState } from "react";

export const MortgageCalculator: React.FC = () => {
  const [propertyPrice, setPropertyPrice] = useState(100000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [termMonths, setTermMonths] = useState(120);

  const loanAmount = propertyPrice * (1 - downPaymentPercent / 100);
  const monthlyRate = 0.085 / 12;
  const monthlyPayment =
    loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      : 0;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">Mortgage Payment Estimator</h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Property Value: ${propertyPrice.toLocaleString()}
          </label>
          <input
            type="range"
            min={20000}
            max={500000}
            step={5000}
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Down Payment: {downPaymentPercent}% (${((propertyPrice * downPaymentPercent) / 100).toLocaleString()})
          </label>
          <input
            type="range"
            min={20}
            max={60}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-sm text-slate-400">Estimated Monthly:</span>
          <span className="text-2xl font-bold text-emerald-400">
            ${Math.round(monthlyPayment).toLocaleString()}/mo
          </span>
        </div>
      </div>
    </div>
  );
};
