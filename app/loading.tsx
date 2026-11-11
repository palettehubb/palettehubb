'use client';

import React from 'react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f7f5ee]/90 backdrop-blur-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
          Loading PALETTE HUB...
        </span>
      </div>
    </div>
  );
}
