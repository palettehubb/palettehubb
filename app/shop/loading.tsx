'use client';

import React from 'react';

export default function ShopLoading() {
  return (
    <div className="bg-[#f7f5ee] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse mb-4" />
        <div className="h-4 w-72 bg-neutral-200/60 rounded-md animate-pulse mb-8" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
              <div className="aspect-square w-full bg-neutral-100 rounded-2xl animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded-md animate-pulse" />
              <div className="h-4 w-1/3 bg-neutral-200 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
