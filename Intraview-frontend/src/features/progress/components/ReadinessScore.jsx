import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

/**
 * Circular progress indicator for Readiness Score
 */
const CircularProgress = ({ score }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = "text-red-500";
    if (score >= 81) color = "text-emerald-500";
    else if (score >= 61) color = "text-blue-500";
    else if (score >= 31) color = "text-amber-500";

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Background circle */}
            <svg className="w-40 h-40 transform -rotate-90">
                <circle
                    className="text-slate-100"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                />
                {/* Foreground circle */}
                <motion.circle
                    className={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800">{score}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Score</span>
            </div>
        </div>
    );
};

const ReadinessScore = ({ data }) => {
    if (!data) return null;

    const { readiness_score, readiness_level } = data;

    const levelDetails = {
        "BEGINNER": {
            title: "Beginner",
            desc: "You're just starting. Keep practicing to build baseline confidence and skills.",
            color: "text-red-500"
        },
        "IMPROVING": {
            title: "Improving",
            desc: "Your interview readiness indicates you are becoming consistent but still have room for improvement.",
            color: "text-amber-500"
        },
        "JOB_READY": {
            title: "Job Ready",
            desc: "You consistently show strong technical and communication skills. You are ready to interview.",
            color: "text-blue-500"
        },
        "INTERVIEW_STRONG": {
            title: "Interview Strong",
            desc: "Exceptional performance! You handle difficult questions with high confidence.",
            color: "text-emerald-500"
        }
    };

    const details = levelDetails[readiness_level] || levelDetails["BEGINNER"];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full flex flex-col justify-center"
        >
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                Interview Readiness
                <div className="group relative">
                    <Info size={16} className="text-slate-400 cursor-pointer" />
                    <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-10">
                        Based on technical scores, communication, consistency, and recent trends across your mock interviews.
                    </div>
                </div>
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8">
                <CircularProgress score={readiness_score} />

                <div className="flex-1 text-center md:text-left">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Current Level
                    </p>
                    <h3 className={`text-3xl font-bold mb-3 ${details.color}`}>
                        {details.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        {details.desc}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default ReadinessScore;
