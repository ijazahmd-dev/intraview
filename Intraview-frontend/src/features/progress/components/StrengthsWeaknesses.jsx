import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

const StrengthsWeaknesses = ({ data }) => {
    if (!data) return null;

    const { strengths, weaknesses } = data;

    const hasBothEmpty = strengths.length === 0 && weaknesses.length === 0;

    if (hasBothEmpty) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center">
                <p className="text-slate-400">Complete more sessions to identify strengths & weaknesses.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 grid md:grid-cols-2 gap-8"
        >
            {/* Strengths Column */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Your Strengths</h2>
                </div>

                {strengths.length > 0 ? (
                    <div className="space-y-3">
                        {strengths.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                            >
                                <span className="font-semibold text-slate-700">{item.skill}</span>
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                                    {item.score.toFixed(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic py-4">Keep practicing to build your core strengths.</p>
                )}
            </div>

            {/* Weaknesses Column */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <AlertTriangle size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Focus Areas</h2>
                </div>

                {weaknesses.length > 0 ? (
                    <div className="space-y-3">
                        {weaknesses.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-4 bg-orange-50/50 rounded-xl border border-orange-100/50"
                            >
                                <span className="font-semibold text-slate-700">{item.skill}</span>
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">
                                    {item.score.toFixed(1)}
                                </span>
                            </div>
                        ))}

                        <div className="mt-4 flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <Lightbulb size={20} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Review your latest feedback in these focus areas and consider scheduling a targeted mock interview.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center py-6 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <span className="text-xl">🎉</span>
                        </div>
                        <p className="text-sm font-medium text-slate-600">No major weaknesses detected!</p>
                        <p className="text-xs text-slate-400 mt-1">Consistency is key to maintaining your skills.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StrengthsWeaknesses;
