"use client";

import React from "react";

export interface ToastMessage {
  id: string;
  type: "info" | "success" | "error";
  text: string;
  txHash?: string;
}

export const ToastNotification: React.FC<{ messages: ToastMessage[]; onDismiss: (id: string) => void }> = ({
  messages,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex items-center justify-between rounded-lg p-3 text-sm shadow-xl text-white ${
            m.type === "success" ? "bg-emerald-600" : m.type === "error" ? "bg-rose-600" : "bg-blue-600"
          }`}
        >
          <span>{m.text}</span>
          <button onClick={() => onDismiss(m.id)} className="ml-3 text-white/80 hover:text-white font-bold">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
