import React from 'react';

export const CardSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-16"></div>
    </div>
);

export const ChartSkeleton = ({ className = "" }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse flex flex-col ${className}`}>
        <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-48 mb-8"></div>
        <div className="flex-1 bg-slate-100 rounded-xl"></div>
    </div>
);

export const HistorySkeleton = () => (
    <div className="mt-8 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-40 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-64 mb-6"></div>

        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 bg-slate-200 rounded-xl shrink-0"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                    <div className="w-24 h-12 bg-slate-200 rounded-lg hidden sm:block"></div>
                </div>
            ))}
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
            <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
                <ChartSkeleton className="h-[400px]" />
            </div>
            <div>
                <ChartSkeleton className="h-[400px]" />
            </div>
        </div>

        <HistorySkeleton />
    </div>
);
