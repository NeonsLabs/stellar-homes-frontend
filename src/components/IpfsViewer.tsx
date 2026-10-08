"use client";

import React from "react";

interface IpfsViewerProps {
  cid: string;
  caption?: string;
}

export const IpfsViewer: React.FC<IpfsViewerProps> = ({ cid, caption }) => {
  const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="aspect-video w-full rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden mb-3">
        <span className="text-xs text-slate-400">IPFS Media: {cid.slice(0, 12)}...</span>
      </div>
      {caption && <p className="text-xs text-slate-300 font-medium">{caption}</p>}
      <a
        href={gatewayUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-400 hover:underline mt-2 inline-block"
      >
        View on IPFS Gateway &rarr;
      </a>
    </div>
  );
};
