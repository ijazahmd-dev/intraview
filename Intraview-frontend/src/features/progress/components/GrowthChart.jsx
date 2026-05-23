import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { motion } from "framer-motion";
import { setGrowthSource } from "../progressSlice";
import { useDispatch, useSelector } from "react-redux";

const GrowthChart = ({ data }) => {
    const dispatch = useDispatch();
    const source = useSelector(state => state.progress.growth.source);

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-[400px] flex items-center justify-center">
                <p className="text-slate-400">Not enough data to show growth trend.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Score Progression</h2>
                    <p className="text-sm text-slate-500">Track your performance over time</p>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-1">
                    {["all", "peer", "ai"].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => dispatch(setGrowthSource(opt))}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${source === opt
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                                }`}
                        >
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748B", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, 5]}
                            ticks={[1, 2, 3, 4, 5]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748B", fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            itemStyle={{ fontSize: "14px", fontWeight: "500" }}
                            labelStyle={{ color: "#64748B", marginBottom: "4px" }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: "13px", paddingTop: "10px" }} />
                        <Line
                            name="Overall Score"
                            type="monotone"
                            dataKey="overall_score"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        {(source === "all" || source === "peer") && (
                            <>
                                <Line name="Technical" type="monotone" dataKey="technical_score" stroke="#10B981" strokeWidth={2} dot={false} />
                                <Line name="Communication" type="monotone" dataKey="communication_score" stroke="#F59E0B" strokeWidth={2} dot={false} />
                                <Line name="Problem Solving" type="monotone" dataKey="problem_solving_score" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                                <Line name="Confidence" type="monotone" dataKey="confidence_score" stroke="#EC4899" strokeWidth={2} dot={false} />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default GrowthChart;
