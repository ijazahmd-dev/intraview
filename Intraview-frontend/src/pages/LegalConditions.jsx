import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://res.cloudinary.com/dpn42vumz/image/upload/v1790803589/7a01858e-5b2d-420e-b5da-6722ef1f99d90000000000_injfdo.png';
const BG_IMAGE = 'https://res.cloudinary.com/dpn42vumz/image/upload/v1790798661/d2507caf-1682-47c3-bc02-146b7fff50b9_tjtjtl.png';
const EFFECTIVE_DATE = 'October 1, 2025';
const CONTACT_EMAIL = 'legal@intraview.io';
const COMPANY_NAME = 'IntraView';

const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  html, body, .tc-page { scrollbar-width: thin; scrollbar-color: rgba(57,89,77,0.3) transparent; }
  html::-webkit-scrollbar, body::-webkit-scrollbar { width: 5px; }
  html::-webkit-scrollbar-track, body::-webkit-scrollbar-track { background: transparent; }
  html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: rgba(57,89,77,0.35); border-radius: 4px; }

  .tc-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    background-color: rgb(238, 240, 239);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  }

  .tc-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    height: 100vh;
    width: 100vw;
    background-image: url('${BG_IMAGE}');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center bottom;
    pointer-events: none;
    opacity: 0.45;
  }

  .tc-shell { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  .tc-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(238,240,239,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(57,89,77,0.12);
  }
  .tc-nav-logo { background: none; border: none; padding: 0; cursor: pointer; transition: opacity 0.15s ease, transform 0.15s ease; }
  .tc-nav-logo:hover { opacity: 0.82; transform: translateY(-1px); }
  .tc-nav-logo-img { height: 70px; width: 120px; object-fit: fill; display: block; }
  .tc-nav-links { display: flex; align-items: center; gap: 28px; }
  .tc-nav-link {
    font-size: 0.9rem; font-weight: 500; color: rgb(57, 89, 77);
    background: none; border: none; cursor: pointer; padding: 0; text-decoration: none;
    transition: color 0.15s ease;
  }
  .tc-nav-link:hover { color: rgb(22, 33, 28); }

  .tc-main { flex: 1; max-width: 860px; margin: 0 auto; padding: 56px 32px 80px; width: 100%; box-sizing: border-box; }

  .tc-header { margin-bottom: 48px; padding-bottom: 32px; border-bottom: 2px solid rgb(57, 89, 77); }
  .tc-badge {
    display: inline-block; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgb(57, 89, 77); background: rgba(57,89,77,0.1); border-radius: 20px; padding: 4px 14px; margin-bottom: 16px;
  }
  .tc-title { font-size: 2.4rem; font-weight: 700; color: rgb(22, 33, 28); margin: 0 0 12px; line-height: 1.2; }
  .tc-subtitle { font-size: 1rem; color: rgb(97, 97, 97); margin: 0 0 6px; line-height: 1.6; }
  .tc-effective { font-size: 0.82rem; color: rgb(117, 117, 117); margin-top: 10px; }

  .tc-toc {
    background: rgba(255,255,255,0.75); border: 1px solid rgba(57,89,77,0.2);
    border-radius: 16px; padding: 28px 32px; margin-bottom: 48px;
  }
  .tc-toc-title { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgb(57, 89, 77); margin: 0 0 16px; }
  .tc-toc-list { list-style: none; margin: 0; padding: 0; columns: 2; gap: 12px; }
  .tc-toc-item { margin-bottom: 8px; break-inside: avoid; }
  .tc-toc-link { font-size: 0.875rem; color: rgb(57, 89, 77); text-decoration: none; transition: color 0.15s ease; display: flex; align-items: center; gap: 6px; }
  .tc-toc-link:hover { color: rgb(22, 33, 28); text-decoration: underline; }
  .tc-toc-num { font-weight: 600; opacity: 0.6; }

  .tc-section { margin-bottom: 52px; scroll-margin-top: 100px; }
  .tc-section-title {
    font-size: 1.3rem; font-weight: 700; color: rgb(22, 33, 28); margin: 0 0 20px;
    padding-bottom: 12px; border-bottom: 1px solid rgba(57,89,77,0.2);
    display: flex; align-items: center; gap: 12px;
  }
  .tc-section-num {
    width: 32px; height: 32px; border-radius: 50%; background: rgb(57, 89, 77); color: white;
    font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .tc-p { font-size: 0.95rem; line-height: 1.8; color: rgb(55, 65, 60); margin: 0 0 16px; }
  .tc-ul { list-style: none; padding: 0; margin: 0 0 16px; }
  .tc-ul li { font-size: 0.95rem; line-height: 1.8; color: rgb(55, 65, 60); padding-left: 20px; position: relative; margin-bottom: 8px; }
  .tc-ul li::before { content: ''; position: absolute; left: 0; top: 11px; width: 7px; height: 7px; background: rgb(57, 89, 77); border-radius: 50%; }
  .tc-highlight { background: rgba(57,89,77,0.08); border-left: 3px solid rgb(57, 89, 77); border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
  .tc-highlight p { margin: 0; font-size: 0.92rem; color: rgb(40,55,47); font-style: italic; line-height: 1.7; }
  .tc-link { color: rgb(57, 89, 77); text-decoration: underline; }
  .tc-link:hover { color: rgb(22, 33, 28); }

  .tc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
  .tc-card { background: rgba(255,255,255,0.7); border: 1px solid rgba(57,89,77,0.15); border-radius: 12px; padding: 20px; }
  .tc-card-title { font-size: 0.85rem; font-weight: 700; color: rgb(57,89,77); margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.06em; }
  .tc-card p { font-size: 0.875rem; line-height: 1.7; color: rgb(55,65,60); margin: 0; }

  .tc-footer { background: rgba(255,255,255,0.6); border-top: 1px solid rgba(57,89,77,0.15); padding: 32px 40px; text-align: center; }
  .tc-footer-links { display: flex; justify-content: center; gap: 28px; margin-bottom: 14px; flex-wrap: wrap; }
  .tc-footer-link { font-size: 0.85rem; color: rgb(57, 89, 77); text-decoration: none; cursor: pointer; background: none; border: none; padding: 0; transition: color 0.15s ease; }
  .tc-footer-link:hover { color: rgb(22, 33, 28); text-decoration: underline; }
  .tc-footer-copy { font-size: 0.8rem; color: rgb(117, 117, 117); }

  @media (max-width: 640px) {
    .tc-nav { padding: 16px 20px; }
    .tc-main { padding: 40px 20px 60px; }
    .tc-title { font-size: 1.8rem; }
    .tc-toc-list { columns: 1; }
    .tc-grid { grid-template-columns: 1fr; }
    .tc-nav-logo-img { height: 54px; width: 96px; }
    .tc-footer { padding: 24px 20px; }
  }
`;

const sections = [
  { id: 'definitions', num: 1, title: 'Definitions' },
  { id: 'services', num: 2, title: 'Platform Services Overview' },
  { id: 'candidate-terms', num: 3, title: 'Candidate-Specific Terms' },
  { id: 'interviewer-terms', num: 4, title: 'Interviewer-Specific Terms' },
  { id: 'booking-policy', num: 5, title: 'Booking & Cancellation Policy' },
  { id: 'token-policy', num: 6, title: 'Token & Credit Policy' },
  { id: 'subscription-terms', num: 7, title: 'Subscription Terms' },
  { id: 'code-of-conduct', num: 8, title: 'Code of Conduct' },
  { id: 'feedback-reviews', num: 9, title: 'Feedback & Reviews' },
  { id: 'platform-integrity', num: 10, title: 'Platform Integrity & Safety' },
  { id: 'dispute-resolution', num: 11, title: 'Dispute Resolution' },
  { id: 'indemnification', num: 12, title: 'Indemnification' },
  { id: 'liability', num: 13, title: 'Limitation of Liability' },
  { id: 'contact', num: 14, title: 'Contact & Support' },
];

export default function TermsAndConditions() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms & Conditions — IntraView';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="tc-page">
      <style>{PAGE_STYLES}</style>
      <div className="tc-bg" aria-hidden="true" />

      <div className="tc-shell">
        <nav className="tc-nav" aria-label="Site navigation">
          <button className="tc-nav-logo" onClick={() => navigate('/home')} aria-label="IntraView home">
            <img src={LOGO_URL} alt="IntraView" className="tc-nav-logo-img" />
          </button>
          <div className="tc-nav-links">
            <button className="tc-nav-link" onClick={() => navigate('/login')}>Log in</button>
            <button className="tc-nav-link" onClick={() => navigate('/signup')}>Sign up</button>
          </div>
        </nav>

        <main className="tc-main">
          <header className="tc-header">
            <span className="tc-badge">Legal</span>
            <h1 className="tc-title">Terms & Conditions</h1>
            <p className="tc-subtitle">
              These Terms & Conditions form a binding agreement between you and IntraView Technologies,
              governing how you use our platform as a candidate, interviewer, or general user. Please
              read these carefully before using our services.
            </p>
            <p className="tc-effective">Effective Date: {EFFECTIVE_DATE}</p>
          </header>

          <nav className="tc-toc" aria-label="Table of contents">
            <p className="tc-toc-title">Table of Contents</p>
            <ul className="tc-toc-list">
              {sections.map(s => (
                <li key={s.id} className="tc-toc-item">
                  <a className="tc-toc-link" href={`#${s.id}`}>
                    <span className="tc-toc-num">{s.num}.</span>{s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section id="definitions" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">1</span> Definitions</h2>
            <p className="tc-p">For the purposes of these Terms & Conditions, the following terms have the meanings defined below:</p>
            <div className="tc-grid">
              <div className="tc-card">
                <p className="tc-card-title">Platform</p>
                <p>The IntraView website, mobile application, APIs, and all associated services operated by IntraView Technologies.</p>
              </div>
              <div className="tc-card">
                <p className="tc-card-title">Candidate</p>
                <p>A registered user who uses IntraView to prepare for job interviews through AI sessions or live interviewer bookings.</p>
              </div>
              <div className="tc-card">
                <p className="tc-card-title">Interviewer</p>
                <p>A verified professional who conducts live interview sessions with Candidates through the IntraView platform.</p>
              </div>
              <div className="tc-card">
                <p className="tc-card-title">Token</p>
                <p>A digital credit unit used within IntraView to purchase session time, AI interviews, or other platform features.</p>
              </div>
              <div className="tc-card">
                <p className="tc-card-title">Session</p>
                <p>A scheduled live video interview between a Candidate and an Interviewer, or an AI-powered mock interview.</p>
              </div>
              <div className="tc-card">
                <p className="tc-card-title">Subscription</p>
                <p>A recurring paid plan that grants access to platform features and may include monthly token allocations.</p>
              </div>
            </div>
          </section>

          <section id="services" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">2</span> Platform Services Overview</h2>
            <p className="tc-p">
              IntraView provides a two-sided marketplace connecting job candidates with experienced professional
              interviewers. In addition to live sessions, IntraView provides AI-powered interview simulations
              across technical, behavioral, and industry-specific domains.
            </p>
            <p className="tc-p">
              IntraView acts as an intermediary and technology platform — we are not a staffing agency,
              recruiter, or employment service. We do not guarantee employment outcomes, job placements,
              or specific hiring decisions as a result of using our platform.
            </p>
            <div className="tc-highlight">
              <p>
                All service relationships for live sessions are directly between Candidates and Interviewers.
                IntraView facilitates and supports these relationships but is not a party to the individual
                session agreements.
              </p>
            </div>
          </section>

          <section id="candidate-terms" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">3</span> Candidate-Specific Terms</h2>
            <p className="tc-p">As a Candidate using IntraView, you agree to the following:</p>
            <ul className="tc-ul">
              <li>You will provide accurate and honest information about your background, skills, experience, and career goals in your profile and during sessions.</li>
              <li>You will treat Interviewers with professionalism and respect during all sessions.</li>
              <li>You will join sessions on time. Repeated no-shows or last-minute cancellations may result in booking restrictions.</li>
              <li>You will not request Interviewers to provide services outside the IntraView platform to circumvent fees.</li>
              <li>You acknowledge that feedback provided by Interviewers represents their professional opinion and may not reflect the views or hiring standards of any specific company.</li>
              <li>You will not share, distribute, or reproduce session content, feedback reports, or any other proprietary IntraView content without authorization.</li>
              <li>You are responsible for ensuring a suitable environment for conducting video sessions, including stable internet connectivity and appropriate background settings.</li>
            </ul>
          </section>

          <section id="interviewer-terms" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">4</span> Interviewer-Specific Terms</h2>
            <p className="tc-p">By registering as an Interviewer on IntraView, you represent and warrant that:</p>
            <ul className="tc-ul">
              <li>You have genuine, verifiable professional experience in the domain(s) for which you offer interview sessions.</li>
              <li>All qualifications, credentials, and work history listed in your profile are accurate and truthful.</li>
              <li>You will conduct sessions in a professional, respectful, and constructive manner at all times.</li>
              <li>You will provide timely, actionable, and unbiased feedback to Candidates following sessions.</li>
              <li>You understand that your IntraView profile and ratings are public and visible to Candidates.</li>
              <li>You will not discriminate against any Candidate based on age, gender, race, religion, national origin, disability, or any other protected characteristic.</li>
              <li>You will maintain appropriate availability on the platform and honor accepted bookings.</li>
              <li>Payouts are subject to a minimum threshold and are processed on a regular schedule per our Payout Policy.</li>
            </ul>
            <p className="tc-p">
              IntraView reserves the right to review, suspend, or remove Interviewers from the platform
              based on negative ratings, policy violations, or conduct that is inconsistent with our
              community standards.
            </p>
          </section>

          <section id="booking-policy" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">5</span> Booking & Cancellation Policy</h2>
            <p className="tc-p"><strong>Candidate Cancellations:</strong></p>
            <ul className="tc-ul">
              <li>Cancellations made more than 24 hours before a session: Full token refund to your wallet.</li>
              <li>Cancellations made between 2–24 hours before a session: 50% token refund.</li>
              <li>Cancellations made less than 2 hours before a session or no-shows: No token refund. Tokens are forfeited.</li>
            </ul>
            <p className="tc-p"><strong>Interviewer Cancellations:</strong></p>
            <ul className="tc-ul">
              <li>Interviewers who cancel a confirmed session within 24 hours will have their rating impacted and may face booking restrictions.</li>
              <li>Candidates whose sessions are cancelled by an Interviewer will receive a full token refund regardless of timing.</li>
            </ul>
            <p className="tc-p"><strong>Technical Failures:</strong></p>
            <ul className="tc-ul">
              <li>If a session cannot be completed due to a verified platform-side technical failure, affected users will receive a full token refund.</li>
              <li>Issues caused by individual user connectivity or hardware are not eligible for refunds.</li>
            </ul>
            <div className="tc-highlight">
              <p>
                To cancel a booking, please use the cancellation feature in your dashboard at least 2 hours
                before the session start time. Late cancellations via email cannot be guaranteed to be
                processed in time to avoid the no-show policy.
              </p>
            </div>
          </section>

          <section id="token-policy" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">6</span> Token & Credit Policy</h2>
            <p className="tc-p">Tokens are IntraView's internal currency used to access sessions and certain premium features. The following rules apply:</p>
            <ul className="tc-ul">
              <li>Tokens may be purchased individually in bundles or included with subscription plans.</li>
              <li>Tokens do not expire as long as your account remains active.</li>
              <li>Tokens have no cash value and cannot be converted back to currency, transferred to another account, or exchanged outside the platform.</li>
              <li>IntraView reserves the right to adjust token pricing, session costs, and bundle compositions with reasonable notice.</li>
              <li>Tokens obtained through promotional offers or bonuses may have additional restrictions and shorter validity periods.</li>
              <li>Upon account closure, unused tokens are forfeited unless a refund exception is granted under our refund policy.</li>
            </ul>
          </section>

          <section id="subscription-terms" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">7</span> Subscription Terms</h2>
            <p className="tc-p">IntraView offers subscription plans that provide ongoing access to platform features and may include monthly token allocations. By subscribing, you agree that:</p>
            <ul className="tc-ul">
              <li>Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date.</li>
              <li>Cancelling a subscription stops future charges but does not generate a refund for the current billing period.</li>
              <li>Downgrading your plan mid-cycle does not result in a prorated refund; the lower plan tier will take effect at the next billing cycle.</li>
              <li>Unused monthly token allocations from a subscription do not roll over to the next month unless explicitly stated in the plan description.</li>
              <li>IntraView may change subscription plan features and pricing with at least 30 days' notice to existing subscribers.</li>
            </ul>
          </section>

          <section id="code-of-conduct" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">8</span> Code of Conduct</h2>
            <p className="tc-p">All users of IntraView — Candidates, Interviewers, and any other participants — must uphold the following community standards:</p>
            <ul className="tc-ul">
              <li><strong>Respect:</strong> Treat all participants with dignity and professionalism. Harassment, discrimination, and offensive language are strictly prohibited.</li>
              <li><strong>Honesty:</strong> Represent yourself accurately. Impersonation, fabrication of credentials, and misrepresentation are grounds for immediate removal.</li>
              <li><strong>Professionalism:</strong> Arrive prepared, on time, and ready to engage constructively. Sessions are professional interactions, not casual conversations.</li>
              <li><strong>Confidentiality:</strong> Do not disclose session content, feedback, or proprietary information shared during sessions without consent.</li>
              <li><strong>Fair Use:</strong> Do not attempt to game, manipulate, or exploit platform features, token systems, ratings, or feedback mechanisms.</li>
              <li><strong>Safety:</strong> Do not engage in or encourage any activity that threatens physical, psychological, or data safety of any user or the platform.</li>
            </ul>
            <p className="tc-p">
              Violations of the Code of Conduct may result in warnings, session cancellations, account
              suspension, permanent bans, or legal action depending on severity.
            </p>
          </section>

          <section id="feedback-reviews" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">9</span> Feedback & Reviews</h2>
            <p className="tc-p">
              IntraView's rating and review system helps maintain quality and transparency on the platform.
              When submitting ratings or feedback:
            </p>
            <ul className="tc-ul">
              <li>Feedback must be honest, constructive, and based on your actual session experience.</li>
              <li>Reviews must not contain defamatory content, hate speech, personal attacks, or false information.</li>
              <li>Ratings should reflect the quality and professionalism of the session, not personal biases unrelated to the interview experience.</li>
              <li>IntraView reserves the right to remove feedback that violates our community guidelines without notice.</li>
              <li>Attempting to manipulate ratings — whether positively or negatively — through fake sessions or coordinated campaigns is a serious policy violation.</li>
            </ul>
            <p className="tc-p">
              If you believe a review about you is fraudulent, defamatory, or violates our policies,
              you may dispute it by contacting{' '}
              <a className="tc-link" href="mailto:support@intraview.io">support@intraview.io</a> with
              supporting evidence.
            </p>
          </section>

          <section id="platform-integrity" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">10</span> Platform Integrity & Safety</h2>
            <p className="tc-p">
              Maintaining a trustworthy and safe platform environment is a shared responsibility. IntraView
              employs multiple mechanisms to ensure platform integrity, including:
            </p>
            <ul className="tc-ul">
              <li>Identity verification for Interviewer applications, including credential and background checks.</li>
              <li>Automated monitoring for unusual activity patterns that may indicate fraud or policy violations.</li>
              <li>A dedicated Trust & Safety team that reviews reports and investigates concerns.</li>
              <li>Rate limiting, abuse detection, and CAPTCHA systems to prevent automated misuse.</li>
            </ul>
            <p className="tc-p">
              If you observe or experience any conduct on the platform that you believe violates these Terms,
              please report it immediately through the in-app reporting tool or by emailing{' '}
              <a className="tc-link" href="mailto:safety@intraview.io">safety@intraview.io</a>.
            </p>
          </section>

          <section id="dispute-resolution" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">11</span> Dispute Resolution</h2>
            <p className="tc-p"><strong>Between Users:</strong> If a dispute arises between a Candidate and an Interviewer, both parties are encouraged to resolve the matter directly in good faith. If resolution cannot be reached:</p>
            <ul className="tc-ul">
              <li>Either party may escalate the matter to IntraView's Support team by submitting a dispute through the platform within 7 days of the issue occurring.</li>
              <li>IntraView will review the dispute within 10 business days and issue a final decision on any token or payment implications.</li>
              <li>IntraView's dispute decisions are final with respect to token credits and platform actions.</li>
            </ul>
            <p className="tc-p"><strong>Against IntraView:</strong> Any disputes between you and IntraView shall first be subject to a 30-day informal negotiation period. If no resolution is reached, disputes shall be resolved through binding arbitration on an individual basis.</p>
            <div className="tc-highlight">
              <p>
                For payment-related disputes or billing issues, please contact us at{' '}
                <a className="tc-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> within 14 days
                of the charge. We aim to resolve all billing disputes within 5 business days.
              </p>
            </div>
          </section>

          <section id="indemnification" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">12</span> Indemnification</h2>
            <p className="tc-p">
              You agree to indemnify, defend, and hold harmless IntraView Technologies and its officers,
              directors, employees, contractors, agents, and licensors from and against any and all claims,
              liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising
              from or related to:
            </p>
            <ul className="tc-ul">
              <li>Your access to or use of the IntraView platform.</li>
              <li>Any content you submit, post, or transmit through the platform.</li>
              <li>Your violation of these Terms & Conditions or any applicable law.</li>
              <li>Your violation of any third-party rights, including intellectual property rights or privacy rights.</li>
              <li>Any disputes between you and another user of the platform.</li>
            </ul>
          </section>

          <section id="liability" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">13</span> Limitation of Liability</h2>
            <p className="tc-p">
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, INTRAVIEW TECHNOLOGIES SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS
              OPPORTUNITIES, ARISING FROM OR RELATED TO YOUR USE OF THE PLATFORM.
            </p>
            <p className="tc-p">
              IN NO EVENT WILL INTRAVIEW'S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM
              OR RELATED TO THESE TERMS OR YOUR USE OF THE PLATFORM EXCEED THE GREATER OF: (A) THE TOTAL
              AMOUNT PAID BY YOU TO INTRAVIEW IN THE TWELVE MONTHS PRIOR TO THE CLAIM; OR (B) ONE HUNDRED
              US DOLLARS (USD $100).
            </p>
            <p className="tc-p">
              Some jurisdictions do not permit the exclusion of certain warranties or limitation of
              liability. In such jurisdictions, these exclusions apply to the maximum extent permitted
              by applicable law.
            </p>
          </section>

          <section id="contact" className="tc-section">
            <h2 className="tc-section-title"><span className="tc-section-num">14</span> Contact & Support</h2>
            <p className="tc-p">
              If you have questions about these Terms & Conditions, or need assistance with any aspect
              of the IntraView platform, please reach out to us:
            </p>
            <div className="tc-highlight">
              <p>
                <strong>IntraView Technologies — Legal & Support</strong><br />
                Legal Inquiries: <a className="tc-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
                General Support: <a className="tc-link" href="mailto:support@intraview.io">support@intraview.io</a><br />
                Trust & Safety: <a className="tc-link" href="mailto:safety@intraview.io">safety@intraview.io</a><br />
                Privacy Requests: <a className="tc-link" href="mailto:privacy@intraview.io">privacy@intraview.io</a>
              </p>
            </div>
            <p className="tc-p">
              For urgent legal matters, please mark your email subject line with &ldquo;URGENT — Legal&rdquo;
              to ensure prioritized handling. We aim to respond to all inquiries within 5 business days.
            </p>
          </section>
        </main>

        <footer className="tc-footer">
          <div className="tc-footer-links">
            <button className="tc-footer-link" onClick={() => navigate('/terms-of-use')}>Terms of Use</button>
            <button className="tc-footer-link" onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
            <button className="tc-footer-link" onClick={() => navigate('/terms-and-conditions')}>Terms & Conditions</button>
            <button className="tc-footer-link" onClick={() => navigate('/home')}>Home</button>
            <a className="tc-footer-link" href="mailto:support@intraview.io">Contact</a>
          </div>
          <p className="tc-footer-copy">&copy; {new Date().getFullYear()} {COMPANY_NAME} Technologies. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
