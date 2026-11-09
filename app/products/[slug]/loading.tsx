import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div className="bg-[#f7f5ee] min-h-screen py-6 sm:py-10 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <div className="h-4 w-12 bg-neutral-200/80 rounded-md" />
          <div className="h-4 w-3 bg-neutral-200/60 rounded-md" />
          <div className="h-4 w-16 bg-neutral-200/80 rounded-md" />
          <div className="h-4 w-3 bg-neutral-200/60 rounded-md" />
          <div className="h-4 w-32 bg-neutral-200/80 rounded-md" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-square w-full bg-white rounded-3xl border border-neutral-200/80 flex items-center justify-center p-8 shadow-sm">
              <div className="w-3/4 h-3/4 bg-neutral-100 rounded-2xl animate-pulse" />
            </div>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-white rounded-2xl border border-neutral-200/80 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Details Column Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-5">
              {/* Category */}
              <div className="h-4 w-24 bg-neutral-200 rounded-full" />

              {/* Title */}
              <div className="space-y-2">
                <div className="h-7 w-5/6 bg-neutral-200 rounded-lg" />
                <div className="h-7 w-2/3 bg-neutral-200 rounded-lg" />
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 bg-neutral-200 rounded-md" />
                <div className="h-4 w-16 bg-neutral-200 rounded-md" />
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2 border-t border-neutral-100">
                <div className="h-8 w-28 bg-neutral-200 rounded-lg" />
                <div className="h-5 w-20 bg-neutral-200 rounded-md" />
              </div>

              {/* Delivery info placeholder */}
              <div className="h-10 w-full bg-neutral-100 rounded-xl" />

              {/* Colors */}
              <div className="space-y-2 pt-2">
                <div className="h-4 w-20 bg-neutral-200 rounded-md" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((c) => (
                    <div key={c} className="w-8 h-8 rounded-full bg-neutral-200" />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-neutral-200 rounded-md" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="w-12 h-9 rounded-xl bg-neutral-200" />
                  ))}
                </div>
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-3">
                <div className="h-12 w-full bg-neutral-900/10 rounded-2xl" />
                <div className="h-12 w-full bg-neutral-900/80 rounded-2xl" />
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200 rounded-md" />
                <div className="h-4 w-2/3 bg-neutral-200 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
