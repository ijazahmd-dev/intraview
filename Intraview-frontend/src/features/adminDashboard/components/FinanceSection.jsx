// src/features/adminDashboard/components/FinanceSection.jsx
/**
 * Section 6: Finance / Payouts / Refunds
 * Payout status breakdown and refund analytics
 */

import { useSelector, useDispatch } from "react-redux";
import { fetchFinance } from "../adminDashboardSlice";
import {
    DashboardCard, SectionHeader, FadeIn, KPISkeleton,
    ErrorState, EmptyState,
} from "./DashboardShell";
import {
    Wallet, Clock, CheckCircle, XCircle, RotateCcw, DollarSign,
} from "lucide-react";

export default function FinanceSection() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((s) => s.adminDashboard.finance);

    if (status === "loading" || status === "idle") {
        return (
            <section>
                <SectionHeader title="Finance" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <KPISkeleton key={i} />)}
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return <ErrorState message={error} onRetry={() => dispatch(fetchFinance())} />;
    }

    if (!data) return <EmptyState />;

    const { payouts, refunds } = data;
    const fmtCurrency = (v) => `₹${Number(v || 0).toLocaleString()}`;

    const payoutCards = [
        {
            icon: Clock, label: "Pending Payouts",
            count: payouts?.pending_payouts, amount: fmtCurrency(payouts?.pending_payout_amount),
            color: "text-amber-600 bg-amber-50",
        },
        {
            icon: CheckCircle, label: "Completed Payouts",
            count: payouts?.completed_payouts, amount: fmtCurrency(payouts?.completed_payout_amount),
            color: "text-emerald-600 bg-emerald-50",
        },
        {
            icon: XCircle, label: "Failed Payouts",
            count: payouts?.failed_payouts, amount: null,
            color: "text-rose-600 bg-rose-50",
        },
    ];

    return (
        <FadeIn>
            <section>
                <SectionHeader title="Finance" subtitle="Payouts, refunds, and financial operations" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Payouts */}
                    <DashboardCard>
                        <div className="flex items-center gap-2 mb-4">
                            <Wallet className="w-4 h-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">Payouts</p>
                        </div>
                        <div className="space-y-3">
                            {payoutCards.map((card) => (
                                <div key={card.label} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}>
                                            <card.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{card.label}</p>
                                            {card.amount && (
                                                <p className="text-[11px] text-slate-400">{card.amount}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-slate-800 tabular-nums">{card.count}</span>
                                </div>
                            ))}
                            {/* Total Payout */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                <p className="text-sm font-medium text-slate-500">Total Payout Volume</p>
                                <p className="text-base font-bold text-slate-900">
                                    {fmtCurrency(payouts?.total_payout_amount)}
                                </p>
                            </div>
                        </div>
                    </DashboardCard>

                    {/* Refunds */}
                    <DashboardCard>
                        <div className="flex items-center gap-2 mb-4">
                            <RotateCcw className="w-4 h-4 text-rose-500" />
                            <p className="text-sm font-semibold text-slate-700">Refunds</p>
                        </div>
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 flex items-center justify-center mb-4">
                                <RotateCcw className="w-8 h-8 text-rose-500" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900 tabular-nums">
                                {refunds?.total_refunds || 0}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">Total Refunds Issued</p>
                            <p className="text-lg font-semibold text-rose-600 mt-3">
                                {fmtCurrency(refunds?.total_refund_amount)}
                            </p>
                            <p className="text-xs text-slate-400">Total Refund Value</p>
                        </div>
                    </DashboardCard>
                </div>
            </section>
        </FadeIn>
    );
}
