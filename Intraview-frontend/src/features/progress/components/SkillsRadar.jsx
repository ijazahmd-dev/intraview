import React from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip
} from "recharts";
import { motion } from "framer-motion";

const SkillsRadar = ({ data }) => {
    if (!data || data.total_evaluations === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center min-h-[350px]">
                <p className="text-slate-400">Not enough peer evaluations for skill breakdown.</p>
            </div>
        );
    }

    const radarData = [
        { subject: "Technical", A: data.technical, fullMark: 5 },
        { subject: "Communication", A: data.communication, fullMark: 5 },
        { subject: "Problem Solving", A: data.problem_solving, fullMark: 5 },
        { subject: "Confidence", A: data.confidence, fullMark: 5 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col"
        >
            <h2 className="text-lg font-bold text-slate-800 mb-2">Skill Summary</h2>
            <p className="text-sm text-slate-500 mb-6">Based on structured peer evaluations</p>

            <div className="flex-1 relative min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
                        />
                        <Radar
                            name="Skill Level"
                            dataKey="A"
                            stroke="#8B5CF6"
                            fill="#8B5CF6"
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            itemStyle={{ color: "#475569", fontWeight: "600" }}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                {/* Center score overlay for premium feel */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-100">
                        <span className="text-lg font-bold text-slate-800">{data.overall.toFixed(1)}</span>
                        <span className="text-xs font-semibold text-slate-500 ml-1">AVG</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SkillsRadar;
