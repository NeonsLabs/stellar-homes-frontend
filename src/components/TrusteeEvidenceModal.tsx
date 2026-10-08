"use client";

import React, { useState } from "react";

interface TrusteeEvidenceModalProps {
  propertyId: number;
  stageIndex: number;
  stageName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidenceHash: string) => void;
}

export const TrusteeEvidenceModal: React.FC<TrusteeEvidenceModalProps> = ({
  stageName,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [hash, setHash] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Submit Evidence: {stageName}</h3>
        <p className="text-sm text-slate-400 mb-4">
          Provide the IPFS evidence multihash documenting completed construction inspection.
        </p>
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="0x... or Qm..."
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white mb-4 text-sm"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={() => { onSubmit(hash); onClose(); }}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
          >
            Submit Sign-off
          </button>
        </div>
      </div>
    </div>
  );
};
