import React from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-transparent h-6 w-6 border-gray-500 ${className}`}
    />
  );
}
