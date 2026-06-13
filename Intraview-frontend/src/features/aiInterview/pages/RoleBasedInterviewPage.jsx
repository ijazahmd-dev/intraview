// src/features/aiInterview/pages/RoleBasedInterviewPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CandidateNavbar from "../../../components/CandidateNavbar";
import CandidateFooter from "../../../components/CandidateFooter";

import {
  fetchFeaturedRoles,
  fetchSearchRoles,
  clearSearchResults,
} from "../slice/aiInterviewRolesSlice";

const tabs = [

];

const navLinks = ["Use Cases", "Resources", "Pricing", "Contact Us"];

const steps = [
  {
    number: "01",
    title: "Choose your Role",
    description:
      "Search from 3000+ roles or browse by category. Pick the exact role you are preparing for, from software engineer to sales executive.",
    tag: "200+ Roles Available",
    side: "right",
  },
  {
    number: "02",
    title: "Set Round & Difficulty",
    description:
      "Choose the type of interview round, warm up, role related, behavioral, or coding, and set your difficulty level to match where you are in your prep.",
    tag: "4 round types",
    side: "left",
  },
  {
    number: "03",
    title: "Practice with AI",
    description:
      "Face a realistic AI interview in a live video session. It asks real questions, listens carefully, and adapts follow-ups based on your answers.",
    tag: "AI Video Interview",
    side: "right",
  },
  {
    number: "04",
    title: "Get Instant Feedback",
    description:
      "Receive a detailed report immediately after your session. The report evaluates your confidence, structure and relevance and provides clear tips for improvement.",
    tag: "Instant AI report",
    side: "left",
  },
];

const footerLinks = {
  "USE CASES": [
    "Job Interviews",
    "Visa Interviews",
    "Resume Toolkit",
    "Communication",
    "MBA Interviews",
  ],
  "BUSINESS SOLUTIONS": [
    "College Placement",
    "Outplacement",
    "Recruitment",
    "Visa Agencies",
    "Sales Training",
    "AI Proctoring",
  ],
  RESOURCES: [
    "About",
    "Blog",
    "Trust Center",
    "Pricing",
    "Contact Us",
    "Privacy Policy",
    "Terms",
  ],
};

// --- Step mock UIs (unchanged) ---

function StepMockRole() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 text-xs font-sans border border-gray-100">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
          Search roles
        </span>
        <div className="ml-auto bg-teal-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
          NEXT
        </div>
      </div>
      <div className="font-semibold text-gray-700 mb-2 text-sm">Roles</div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          "Data Analyst",
          "Marketing Manager",
          "Project Manager",
          "Software Engineer",
          "Sales Executive",
          "Web Designer",
          "Business Analyst",
          "Product Manager",
          "Cybersecurity Analyst",
          "Customer Service Rep",
          "Account Manager",
          "Data Scientist",
          "Full Stack Dev",
          "Digital Marketing",
          "Financial Analyst",
        ].map((r) => (
          <div
            key={r}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-[9px] text-gray-600 text-center hover:border-teal-400 cursor-pointer transition-colors"
          >
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepMockDifficulty() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 text-xs font-sans border border-gray-100">
      <div className="text-gray-400 text-[10px] mb-1">Interview Details</div>
      <div className="font-semibold text-gray-800 text-sm mb-3">
        Marketing Manager
      </div>
      <div className="flex gap-2 mb-3">
        {["Resume Based", "Scheduled"].map((t) => (
          <span
            key={t}
            className={`px-2 py-1 rounded-full text-[9px] font-semibold ${t === "Resume Based"
              ? "bg-teal-100 text-teal-700"
              : "bg-gray-100 text-gray-500"
              }`}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="text-[10px] text-gray-500 mb-1">Select Round</div>
      <div className="grid grid-cols-3 gap-1 mb-3">
        {["Warm Up", "Role Related", "Behavioral"].map((r, i) => (
          <div
            key={r}
            className={`border rounded-lg py-1.5 text-[9px] text-center ${i === 0
              ? "border-teal-500 text-teal-600 bg-teal-50"
              : "border-gray-200 text-gray-500"
              }`}
          >
            {r}
          </div>
        ))}
      </div>
      <div className="text-[10px] text-gray-500 mb-1">Interview Duration</div>
      <div className="flex gap-1.5">
        {["10 min", "20 min", "30 min"].map((d, i) => (
          <div
            key={d}
            className={`border rounded-md px-2 py-1 text-[9px] ${i === 1
              ? "border-teal-500 text-teal-600"
              : "border-gray-200 text-gray-500"
              }`}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepMockVideo() {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-44 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-600 mx-auto mb-2 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute top-3 right-3 bg-white rounded-xl p-2 shadow-lg text-[9px]">
        <div className="font-semibold text-gray-700 text-[10px]">
          Marketing Manager
        </div>
        <div className="text-gray-400">AI Interviewer</div>
        <div className="mt-1.5 bg-teal-500 text-white rounded-full px-2 py-0.5 text-center text-[9px] font-semibold">
          ● LIVE
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur rounded-xl p-2 text-[9px] text-gray-600">
        How would you plan and execute a campaign with a limited budget?
      </div>
    </div>
  );
}

function StepMockReport() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
      <div className="font-semibold text-gray-800 text-sm mb-3">
        Interview Report
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Confidence", val: 78, color: "teal" },
          { label: "Structure", val: 85, color: "amber" },
          { label: "Relevance", val: 72, color: "teal" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div
              className={`text-lg font-bold ${m.color === "teal" ? "text-teal-500" : "text-amber-400"
                }`}
            >
              {m.val}%
            </div>
            <div className="text-[9px] text-gray-500">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          "Strong opening statement",
          "Could improve filler words",
          "Good use of examples",
        ].map((f, i) => (
          <div
            key={f}
            className="flex items-start gap-1.5 text-[9px] text-gray-600"
          >
            <span className={i === 1 ? "text-amber-400" : "text-teal-500"}>
              ●
            </span>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

const stepMocks = [
  <StepMockRole key="step-role" />,
  <StepMockDifficulty key="step-difficulty" />,
  <StepMockVideo key="step-video" />,
  <StepMockReport key="step-report" />,
];

export default function RoleBasedInterviewPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Role Based");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    featured,
    featuredLoading,
    featuredError,
    searchResults,
    searchLoading,
  } = useSelector((state) => state.aiInterviewRoles);

  // Load featured roles on first mount
  useEffect(() => {
    if (!featured || featured.length === 0) {
      dispatch(fetchFeaturedRoles());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Debounced search
  useEffect(() => {
    const q = searchQuery.trim();

    if (q.length < 2) {
      dispatch(clearSearchResults());
      return;
    }

    const handle = setTimeout(() => {
      dispatch(fetchSearchRoles(q));
    }, 300);

    return () => clearTimeout(handle);
  }, [searchQuery, dispatch]);

  const showSearchResults =
    searchQuery.trim().length >= 2 && searchResults && searchResults.length > 0;

  const rolesToRender = showSearchResults ? searchResults : featured;

  const isLoading = featuredLoading || (searchQuery.trim().length >= 2 && searchLoading);

  const handleRoleClick = (role) => {
    // Navigate to the role-specific setup page
    navigate(`/ai-interview/role/${role.slug}`);
  };

  return (
    <div
      className="min-h-screen bg-white font-sans"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      <CandidateNavbar />
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }
        .tab-active { background: #0D9488; color: white; }
        .tab-inactive { background: white; color: #374151; border: 1px solid #E5E7EB; }
        .role-card { transition: all 0.18s ease; }
        .role-card:hover { border-color: #0D9488; background: #F0FDFA; color: #0D9488; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(13,148,136,0.12); }
        .step-tag { display: inline-flex; align-items: center; gap: 6px; border: 1.5px solid #0D9488; color: #0D9488; border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 600; background: #F0FDFA; }
        .step-number-bubble { width: 42px; height: 42px; border-radius: 50%; background: #0D9488; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 17px; box-shadow: 0 4px 16px rgba(13,148,136,0.3); }
        .search-input:focus { outline: none; border-color: #0D9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.12); }
        .hero-bg { background: linear-gradient(160deg, #F0FDFA 0%, #E0F2FE 40%, #F8FAFC 100%); }
      `}</style>



      {/* TAB BAR */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === tab ? "tab-active" : "tab-inactive"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="hero-bg pt-14 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-7 tracking-wide uppercase">
            <svg
              className="w-3.5 h-3.5 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            200+ Roles Available
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
            Role-Specific
          </h1>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-teal-500 leading-tight mb-5">
            AI Mock Interviews
          </h2>

          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Practice role-specific interviews with real-world questions. Improve
            domain knowledge, articulation and communication with instant
            feedback report.
          </p>

          {/* Search Bar */}
          <div className="flex items-center max-w-xl mx-auto bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
            <div className="flex items-center gap-2 flex-1 px-4">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for roles (e.g. Software Engineer, Data Analyst)"
                className="search-input w-full py-3.5 text-sm text-gray-700 bg-transparent placeholder-gray-400"
              />
            </div>
            <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm px-6 py-3.5 transition-colors m-1 rounded-lg">
              SEARCH
            </button>
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2.5 mb-7">
            <svg
              className="w-5 h-5 text-teal-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <h3 className="font-display text-xl font-bold text-gray-900">
              Roles
            </h3>
          </div>

          {featuredError && (
            <div className="mb-4 text-sm text-red-500">
              {featuredError}
            </div>
          )}

          {isLoading && (
            <div className="mb-4 text-sm text-gray-500">Loading roles...</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rolesToRender &&
              rolesToRender.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleClick(role)}
                  className="role-card text-left px-5 py-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white shadow-sm cursor-pointer"
                >
                  {role.name}
                  {role.category && (
                    <div className="mt-1 text-[11px] text-gray-400">
                      {role.category}
                    </div>
                  )}
                </button>
              ))}

            {!isLoading &&
              rolesToRender &&
              rolesToRender.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-400 text-sm">
                  No roles found
                  {searchQuery.trim() && (
                    <>
                      {" "}
                      for{" "}
                      <span className="font-semibold">
                        "{searchQuery.trim()}"
                      </span>
                    </>
                  )}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              How it <span className="text-teal-500">Works</span>
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              From picking your role to getting your report, your AI interview
              is ready in under a minute.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-20">
            {steps.map((step, i) => {
              const isRight = step.side === "right";
              return (
                <div
                  key={step.number}
                  className={`flex flex-col ${isRight ? "lg:flex-row" : "lg:flex-row-reverse"
                    } items-center gap-10 lg:gap-16`}
                >
                  {/* Text Side */}
                  <div className="flex-1 text-center lg:text-left">
                    <div
                      className={`${isRight ? "lg:text-right" : "lg:text-left"
                        } text-center`}
                    >
                      <p className="text-xs font-bold text-teal-400 tracking-widest uppercase mb-2">
                        Step {step.number}
                      </p>
                      <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 text-base leading-relaxed mb-6 max-w-sm mx-auto lg:mx-0">
                        {step.description}
                      </p>
                      <span className="step-tag">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {step.tag}
                      </span>
                    </div>
                  </div>

                  {/* Step Number + Mock Visual */}
                  <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-sm lg:max-w-none">
                    <div className="step-number-bubble text-lg">{i + 1}</div>
                    <div className="w-full">{stepMocks[i]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <CandidateFooter />
    </div>
  );
}