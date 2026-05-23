import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setHistorySource, setHistoryPage } from "../progressSlice";
import { motion } from "framer-motion";
import { Bot, Users, ExternalLink, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const HistoryCard = ({ session }) => {
    const isPeer = session.source === "peer";

    return (
        <div className="group bg-white flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">

            {/* Visual Indicator */}
            <div className={`p-4 rounded-xl shrink-0 ${isPeer ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                {isPeer ? <Users size={24} /> : <Bot size={24} />}
            </div>

            {/* Core Info */}
            <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800">
                        {isPeer ? "Peer Interview" : "AI Roleplay"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                        {isPeer ? "Mock" : "Practice"}
                    </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
                    <Calendar size={14} />
                    <span>{formatDate(session.date)}</span>
                    {!isPeer && <span className="ml-1">• {session.duration} min</span>}
                </div>
            </div>

            {/* Score & Recommendation */}
            <div className="flex items-center gap-6 sm:px-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0">
                <div className="text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Score</p>
                    <p className="text-xl font-bold text-slate-800">{session.overall_score || "N/A"}</p>
                </div>

                <div className="text-center min-w-[120px]">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Feedback</p>
                    {isPeer && session.hire_recommendation ? (
                        <p className={`text-sm font-semibold ${session.hire_recommendation.toLowerCase() === 'hire' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {session.hire_recommendation}
                        </p>
                    ) : (
                        <div className="flex items-center justify-center gap-1 text-blue-600 text-sm font-semibold cursor-pointer hover:underline group-hover:text-blue-700">
                            View Report <ExternalLink size={14} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InterviewHistory = ({ data, totalPages, currentPage }) => {
    const dispatch = useDispatch();
    const source = useSelector(state => state.progress.history.source);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Interview History</h2>
                    <p className="text-sm text-slate-500">Review your past sessions and feedback</p>
                </div>

                <div className="flex bg-slate-100 rounded-lg p-1">
                    {["all", "peer", "ai"].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => dispatch(setHistorySource(opt))}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${source === opt
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                                }`}
                        >
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {data && data.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {data.map((session, idx) => (
                            <HistoryCard key={idx} session={session} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={() => dispatch(setHistoryPage(currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-medium text-slate-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => dispatch(setHistoryPage(currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No history found</h3>
                    <p className="text-slate-500 max-w-sm">
                        You haven't completed any {source !== 'all' ? source : ''} mock interviews yet.
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default InterviewHistory;
