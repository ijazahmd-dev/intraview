
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import InterviewerCard from '../components/InterviewerCard.jsx';
import Filters from '../components/Filters.jsx';
import { candidateBookingsApi } from '../../candidateBookingsApi.js';
import CandidateNavbar from '../../../components/CandidateNavbar.jsx';
import CandidateFooter from '../../../components/CandidateFooter.jsx';

/* ─────────────────────────────────────────────
   IntraView Brand Tokens
   Primary teal : #1D9E75
   Dark navy    : #0D1B2A
   Surface      : #F7F9FC
   Card bg      : #FFFFFF
   Border       : #E4EAF0
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

  /* ── Root ── */
  .iv-browse-root {
    min-height: 100vh;
    background: #F7F9FC;
    font-family: 'DM Sans', sans-serif;
    color: #0D1B2A;
  }

  .iv-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
  }

  /* ─────────────────────────────────────────
     Hero Banner
  ───────────────────────────────────────── */
  .iv-hero {
    background: #FFFFFF;
    border-bottom: 1px solid #E4EAF0;
    padding: 52px 0 44px;
    position: relative;
    overflow: hidden;
  }

  .iv-hero::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(29,158,117,0.07) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .iv-hero::after {
    content: '';
    position: absolute;
    bottom: -60px; left: -60px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(29,158,117,0.04) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .iv-hero-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
  }

  .iv-hero-text {
    flex: 1;
    min-width: 0;
  }

  /* Eyebrow label */
  .iv-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E1F5EE;
    color: #0F6E56;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    padding: 5px 13px;
    border-radius: 100px;
    margin-bottom: 20px;
  }

  .iv-eyebrow-dot {
    width: 6px; height: 6px;
    background: #1D9E75;
    border-radius: 50%;
  }

  .iv-hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: 46px;
    line-height: 1.1;
    color: #0D1B2A;
    margin: 0 0 14px;
    font-weight: 400;
  }

  .iv-hero-title em {
    font-style: italic;
    color: #1D9E75;
  }

  .iv-hero-subtitle {
    font-size: 15.5px;
    line-height: 1.7;
    color: #4A5568;
    margin: 0;
    max-width: 460px;
  }

  /* Stats row */
  .iv-stats-bar {
    display: flex;
    align-items: center;
    margin-top: 24px;
  }

  .iv-stat-item {
    display: flex;
    flex-direction: column;
    padding-right: 28px;
    margin-right: 28px;
    border-right: 1px solid #E4EAF0;
  }

  .iv-stat-item:last-child {
    border-right: none;
    padding-right: 0;
    margin-right: 0;
  }

  .iv-stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #0D1B2A;
    line-height: 1;
  }

  .iv-stat-label {
    font-size: 11.5px;
    color: #9AA5B4;
    margin-top: 4px;
  }

  /* Token balance card */
  .iv-token-card {
    background: #FFFFFF;
    border: 1px solid #E4EAF0;
    border-radius: 14px;
    padding: 24px 28px;
    min-width: 210px;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 2px 12px rgba(13,27,42,0.06);
  }

  .iv-token-card-accent {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1D9E75, #5DCAA5);
    border-radius: 14px 14px 0 0;
  }

  .iv-token-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #9AA5B4;
    margin: 0 0 10px;
  }

  .iv-token-amount {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    line-height: 1;
    color: #0D1B2A;
    margin: 0 0 6px;
  }

  .iv-token-amount span {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #4A5568;
    margin-left: 4px;
  }

  .iv-token-sub {
    font-size: 12px;
    color: #1D9E75;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
  }

  .iv-token-skeleton {
    display: inline-block;
    width: 80px;
    height: 36px;
    background: linear-gradient(90deg, #F0F4F8 25%, #E4EAF0 50%, #F0F4F8 75%);
    background-size: 200% 100%;
    animation: iv-shimmer 1.4s infinite;
    border-radius: 6px;
  }

  /* ─────────────────────────────────────────
     Main Content
  ───────────────────────────────────────── */
  .iv-content {
    padding: 40px 0 80px;
  }

  /* Filter section — just a spacing wrapper; Filters.jsx renders its own card */
  .iv-filter-section {
    margin-bottom: 32px;
  }

  /* ── Section Header ── */
  .iv-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .iv-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #0D1B2A;
    margin: 0;
  }

  .iv-result-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E1F5EE;
    color: #0F6E56;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 13px;
    border-radius: 100px;
  }

  /* ── Card Grid: 3 columns ── */
  .iv-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    align-items: start;       /* cards start at top, don't stretch to each other */
  }

  /* ── Loading State ── */
  .iv-loading {
    min-height: 100vh;
    background: #F7F9FC;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 22px;
    font-family: 'DM Sans', sans-serif;
  }

  .iv-spinner-wrap {
    position: relative;
    width: 52px; height: 52px;
  }

  .iv-spinner {
    position: absolute; inset: 0;
    border: 2.5px solid #E4EAF0;
    border-top-color: #1D9E75;
    border-radius: 50%;
    animation: iv-spin 0.8s linear infinite;
  }

  .iv-spinner-inner {
    position: absolute;
    inset: 8px;
    border: 2px solid transparent;
    border-top-color: #5DCAA5;
    border-radius: 50%;
    animation: iv-spin 0.6s linear infinite reverse;
  }

  .iv-loading-text {
    font-size: 15px;
    color: #4A5568;
    font-weight: 500;
  }

  .iv-loading-dots::after {
    content: '';
    animation: iv-dots 1.5s steps(4, end) infinite;
  }

  /* ── Empty State ── */
  .iv-empty {
    text-align: center;
    padding: 80px 24px;
    background: #FFFFFF;
    border: 1px solid #E4EAF0;
    border-radius: 14px;
  }

  .iv-empty-icon {
    width: 60px; height: 60px;
    background: #F7F9FC;
    border: 1px solid #E4EAF0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .iv-empty-icon svg {
    width: 26px; height: 26px;
    color: #9AA5B4;
  }

  .iv-empty h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #0D1B2A;
    margin: 0 0 8px;
  }

  .iv-empty p {
    font-size: 14px;
    color: #6B7280;
    max-width: 340px;
    margin: 0 auto 24px;
    line-height: 1.65;
  }

  .iv-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #1D9E75;
    color: #FFFFFF;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 11px 24px;
    border-radius: 9px;
    border: none;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s;
  }

  .iv-btn-primary:hover {
    background: #0F6E56;
    transform: translateY(-1px);
  }

  .iv-btn-primary:active { transform: translateY(0); }

  /* ── Footer note ── */
  .iv-footer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 48px;
    padding-top: 28px;
    border-top: 1px solid #E4EAF0;
    font-size: 12.5px;
    color: #9AA5B4;
  }

  .iv-footer-note svg { color: #1D9E75; }

  /* ── Animations ── */
  @keyframes iv-spin    { to { transform: rotate(360deg); } }
  @keyframes iv-shimmer { to { background-position: -200% 0; } }

  @keyframes iv-dots {
    0%   { content: ''; }
    25%  { content: '.'; }
    50%  { content: '..'; }
    75%  { content: '...'; }
    100% { content: ''; }
  }

  @keyframes iv-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .iv-fade-up   { animation: iv-fade-up 0.36s ease both; }
  .iv-delay-1   { animation-delay: 0.06s; }
  .iv-delay-2   { animation-delay: 0.12s; }
  .iv-delay-3   { animation-delay: 0.2s; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .iv-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .iv-hero-inner   { flex-direction: column; gap: 28px; }
    .iv-hero-title   { font-size: 34px; }
    .iv-token-card   { width: 100%; min-width: unset; }
    .iv-grid         { grid-template-columns: 1fr; }
    .iv-container    { padding: 0 16px; }
    .iv-stats-bar    { flex-wrap: wrap; gap: 16px; }
    .iv-stat-item    { border-right: none; padding-right: 0; margin-right: 0; }
    .iv-hero         { padding: 36px 0 32px; }
  }

  @media (max-width: 540px) {
    .iv-hero-title { font-size: 28px; }
  }
`;

/* ─────────────────────────────────────────────
   BrowseInterviewers Page
───────────────────────────────────────────── */
const BrowseInterviewers = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [filteredInterviewers, setFilteredInterviewers] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    maxPrice: '',
    date: '',
  });

  /* ── Token balance ── */
  const fetchTokenBalance = useCallback(async () => {
    try {
      setTokenLoading(true);
      const response = await candidateBookingsApi.getTokenBalance();
      setTokenBalance(response.data.token_balance);
    } catch (error) {
      console.error('Token balance fetch failed:', error);
      toast.error('Failed to load token balance');
      setTokenBalance(0);
    } finally {
      setTokenLoading(false);
    }
  }, []);

  /* ── Interviewers list ── */
  const fetchInterviewers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await candidateBookingsApi.getInterviewers({
        specialization: filters.specialization || undefined,
        max_price: filters.maxPrice || undefined,
        date: filters.date || undefined,
      });
      setInterviewers(response.data);
      setFilteredInterviewers(response.data);
      toast.success(`${response.data.length} interviewers available`);
    } catch (error) {
      toast.error('Failed to load interviewers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTokenBalance();
    fetchInterviewers();
  }, [fetchTokenBalance, fetchInterviewers]);

  useEffect(() => {
    fetchInterviewers();
  }, [fetchInterviewers]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const clearFilters = () => setFilters({ specialization: '', maxPrice: '', date: '' });

  /* ── Loading screen ── */
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="iv-loading">
          <div className="iv-spinner-wrap">
            <div className="iv-spinner" />
            <div className="iv-spinner-inner" />
          </div>
          <p className="iv-loading-text">
            Finding interviewers
            <span className="iv-loading-dots" />
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <CandidateNavbar />
      <style>{styles}</style>

      <div className="iv-browse-root">

        {/* ══════════════════════════════════════
            Hero / Header
        ══════════════════════════════════════ */}
        <section className="iv-hero">
          <div className="iv-container">
            <div className="iv-hero-inner">

              {/* Left: title + stats */}
              <div className="iv-hero-text iv-fade-up">
                <div className="iv-eyebrow">
                  <span className="iv-eyebrow-dot" />
                  Verified professionals
                </div>
                <h1 className="iv-hero-title">
                  Find your <em>perfect</em><br />interviewer
                </h1>
                <p className="iv-hero-subtitle">
                  Connect with subscription-active interviewers for mock
                  interviews, personalised feedback, and career guidance.
                </p>

                {/* Stats */}
                <div className="iv-stats-bar iv-fade-up iv-delay-2">
                  <div className="iv-stat-item">
                    <span className="iv-stat-value">{filteredInterviewers.length}</span>
                    <span className="iv-stat-label">Available now</span>
                  </div>
                  <div className="iv-stat-item">
                    <span className="iv-stat-value">4.9★</span>
                    <span className="iv-stat-label">Avg. rating</span>
                  </div>
                  <div className="iv-stat-item">
                    <span className="iv-stat-value">24h</span>
                    <span className="iv-stat-label">Avg. response</span>
                  </div>
                </div>
              </div>

              {/* Right: token balance card */}
              <div className="iv-token-card iv-fade-up iv-delay-3">
                <div className="iv-token-card-accent" />
                <p className="iv-token-label">Your token balance</p>
                {tokenLoading ? (
                  <span className="iv-token-skeleton" />
                ) : (
                  <p className="iv-token-amount">
                    {tokenBalance}
                    <span>tokens</span>
                  </p>
                )}
                <p className="iv-token-sub">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="6" cy="6" r="5" />
                    <path d="M6 4v2.5l1.5 1" strokeLinecap="round" />
                  </svg>
                  {tokenLoading ? 'Loading...' : 'Ready to use'}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            Main Content
        ══════════════════════════════════════ */}
        <div className="iv-content">
          <div className="iv-container">

            {/* ── Full-width Filter Bar ── */}
            <div className="iv-filter-section">
              <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                interviewers={interviewers}
              />
            </div>

            {/* ── Section Header ── */}
            <div className="iv-section-header">
              <h2 className="iv-section-title">
                {filteredInterviewers.length > 0
                  ? 'Available Interviewers'
                  : 'No Results'}
              </h2>
              {filteredInterviewers.length > 0 && (
                <span className="iv-result-count">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                  {filteredInterviewers.length} found
                </span>
              )}
            </div>

            {/* ── Empty State ── */}
            {filteredInterviewers.length === 0 ? (
              <div className="iv-empty">
                <div className="iv-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </div>
                <h2>No interviewers found</h2>
                <p>
                  Try adjusting your filters or check back later —
                  new interviewers join regularly.
                </p>
                <button className="iv-btn-primary" onClick={clearFilters}>
                  Clear all filters
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 6.5h10M8 3l4 3.5L8 10" />
                  </svg>
                </button>
              </div>
            ) : (
              /* ── Card Grid ── */
              <div className="iv-grid">
                {filteredInterviewers.map((interviewer) => (
                  <InterviewerCard
                    key={interviewer.id}
                    interviewer={interviewer}
                    tokenBalance={tokenBalance}
                  />
                ))}
              </div>
            )}

            {/* ── Footer note ── */}
            <div className="iv-footer-note">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5 5.5 4z" />
              </svg>
              Only verified, subscription-active interviewers are shown
            </div>

          </div>
        </div>

      </div>
      <CandidateFooter />
    </>
  );
};

export default BrowseInterviewers;