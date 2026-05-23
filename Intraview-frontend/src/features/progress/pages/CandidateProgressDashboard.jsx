import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
    fetchOverviewStats,
    fetchGrowthAnalytics,
    fetchSkillBreakdown,
    fetchStrengthsWeaknesses,
    fetchInterviewHistory
} from "../progressSlice";

// Components
import HeroOverview from "../components/HeroOverview";
import ReadinessScore from "../components/ReadinessScore";
import GrowthChart from "../components/GrowthChart";
import SkillsRadar from "../components/SkillsRadar";
import StrengthsWeaknesses from "../components/StrengthsWeaknesses";
import InterviewHistory from "../components/InterviewHistory";
import { DashboardSkeleton } from "../components/ProgressSkeleton";

import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";

const CandidateProgressDashboard = () => {
    const dispatch = useDispatch();

    // Selectors
    const overview = useSelector((state) => state.progress.overview);
    const growth = useSelector((state) => state.progress.growth);
    const skills = useSelector((state) => state.progress.skills);
    const strengths = useSelector((state) => state.progress.strengths);
    const history = useSelector((state) => state.progress.history);

    const isLoading = overview.status === "loading" || overview.status === "idle";

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                await Promise.all([
                    dispatch(fetchOverviewStats()).unwrap(),
                    dispatch(fetchGrowthAnalytics(growth.source)).unwrap(),
                    dispatch(fetchSkillBreakdown()).unwrap(),
                    dispatch(fetchStrengthsWeaknesses()).unwrap(),
                    dispatch(fetchInterviewHistory({ source: history.source, page: history.page })).unwrap()
                ]);
            } catch (error) {
                console.error("Dashboard load error", error);
                toast.error("Failed to load some dashboard data. Please refresh.");
            }
        };

        loadDashboard();
    }, [dispatch]);

    // Re-fetch only when these dependencies change
    useEffect(() => {
        if (growth.status !== "idle") {
            dispatch(fetchGrowthAnalytics(growth.source));
        }
    }, [dispatch, growth.source]);

    useEffect(() => {
        if (history.status !== "idle") {
            dispatch(fetchInterviewHistory({ source: history.source, page: history.page }));
        }
    }, [dispatch, history.source, history.page]);


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Sidebar role="candidate" />
            <div className="flex-1 md:ml-64 flex flex-col pt-16 md:pt-0">
                <Navbar role="candidate" />
                <main className="flex-1 overflow-x-hidden">
                    {isLoading ? (
                        <DashboardSkeleton />
                    ) : (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Performance Analytics</h1>
                                <p className="text-slate-500 mt-1">Track your interview readiness, growth, and skill progression.</p>
                            </div>

                            {/* Row 1: Overview Cards */}
                            <HeroOverview data={overview.data} />

                            {/* Row 2: Readiness & Radar */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <ReadinessScore data={overview.data} />
                                <SkillsRadar data={skills.data} />
                            </div>

                            {/* Row 3: Growth Chart */}
                            <div className="mb-8">
                                <GrowthChart data={growth.data} />
                            </div>

                            {/* Row 4: Strengths & Weaknesses */}
                            <StrengthsWeaknesses data={strengths.data} />

                            {/* Row 5: Interview History */}
                            <InterviewHistory
                                data={history.data}
                                currentPage={history.page}
                                totalPages={Math.ceil(history.count / 10)}
                            />

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CandidateProgressDashboard;
