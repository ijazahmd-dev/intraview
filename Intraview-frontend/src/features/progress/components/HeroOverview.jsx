import React from "react";
import {
    CalendarCheck,
    Users,
    Bot,
    Award,
    Clock,
    TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <div className={`p-2 rounded-xl ${colorClass}`}>
                <Icon size={20} />
            </div>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800 tracking-tight">
                {value}
            </span>
        </div>
    </motion.div>
);

const HeroOverview = ({ data }) => {
    if (!data) return null;

    const stats = [
        {
            title: "Total Sessions",
            value: data.total_sessions_attended,
            icon: CalendarCheck,
            colorClass: "bg-blue-50 text-blue-600",
        },
        {
            title: "Peer Interviews",
            value: data.peer_sessions_count,
            icon: Users,
            colorClass: "bg-indigo-50 text-indigo-600",
        },
        {
            title: "AI Interviews",
            value: data.ai_sessions_count,
            icon: Bot,
            colorClass: "bg-purple-50 text-purple-600",
        },
        {
            title: "Avg Overall Score",
            value: data.average_overall_score.toFixed(1),
            icon: Award,
            colorClass: "bg-amber-50 text-amber-600",
        },
        {
            title: "Practice Hours",
            value: data.total_practice_hours.toFixed(1) + "h",
            icon: Clock,
            colorClass: "bg-emerald-50 text-emerald-600",
        },
        {
            title: "Readiness Level",
            value: data.readiness_level.replace("_", " "),
            icon: TrendingUp,
            colorClass: "bg-rose-50 text-rose-600",
        },
    ];

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
            {stats.map((stat, i) => (
                <StatCard
                    key={stat.title}
                    {...stat}
                    delay={i * 0.05}
                />
            ))}
        </div>
    );
};

export default HeroOverview;
