import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://res.cloudinary.com/dpn42vumz/image/upload/v1790803589/7a01858e-5b2d-420e-b5da-6722ef1f99d90000000000_injfdo.png';
const BG_IMAGE = 'https://res.cloudinary.com/dpn42vumz/image/upload/v1790798661/d2507caf-1682-47c3-bc02-146b7fff50b9_tjtjtl.png';
const EFFECTIVE_DATE = 'October 1, 2025';
const COMPANY_NAME = 'IntraView';
const CONTACT_EMAIL = 'legal@intraview.io';

const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  html, body, .tou-page { scrollbar-width: thin; scrollbar-color: rgba(57,89,77,0.3) transparent; }
  html::-webkit-scrollbar, body::-webkit-scrollbar { width: 5px; }
  html::-webkit-scrollbar-track, body::-webkit-scrollbar-track { background: transparent; }
  html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: rgba(57,89,77,0.35); border-radius: 4px; }

  .tou-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    background-color: rgb(238, 240, 239);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  }

  .tou-bg {
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

  .tou-shell {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .tou-nav {
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

  .tou-nav-logo {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  .tou-nav-logo:hover { opacity: 0.82; transform: translateY(-1px); }
  .tou-nav-logo-img { height: 70px; width: 120px; object-fit: fill; display: block; }

  .tou-nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
  }
  .tou-nav-link {
    font-size: 0.9rem;
    font-weight: 500;
    color: rgb(57, 89, 77);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .tou-nav-link:hover { color: rgb(22, 33, 28); }

  .tou-main {
    flex: 1;
    max-width: 860px;
    margin: 0 auto;
    padding: 56px 32px 80px;
    width: 100%;
    box-sizing: border-box;
  }

  .tou-header {
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 2px solid rgb(57, 89, 77);
  }
  .tou-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgb(57, 89, 77);
    background: rgba(57,89,77,0.1);
    border-radius: 20px;
    padding: 4px 14px;
    margin-bottom: 16px;
  }
  .tou-title {
    font-size: 2.4rem;
    font-weight: 700;
    color: rgb(22, 33, 28);
    margin: 0 0 12px;
    line-height: 1.2;
  }
  .tou-subtitle {
    font-size: 1rem;
    color: rgb(97, 97, 97);
    margin: 0 0 6px;
    line-height: 1.6;
  }
  .tou-effective {
    font-size: 0.82rem;
    color: rgb(117, 117, 117);
    margin-top: 10px;
  }

  .tou-toc {
    background: rgba(255,255,255,0.75);
    border: 1px solid rgba(57,89,77,0.2);
    border-radius: 16px;
    padding: 28px 32px;
    margin-bottom: 48px;
  }
  .tou-toc-title {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(57, 89, 77);
    margin: 0 0 16px;
  }
  .tou-toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    columns: 2;
    gap: 12px;
  }
  .tou-toc-item { margin-bottom: 8px; break-inside: avoid; }
  .tou-toc-link {
    font-size: 0.875rem;
    color: rgb(57, 89, 77);
    text-decoration: none;
    transition: color 0.15s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tou-toc-link:hover { color: rgb(22, 33, 28); text-decoration: underline; }
  .tou-toc-num { font-weight: 600; opacity: 0.6; }

  .tou-section {
    margin-bottom: 52px;
    scroll-margin-top: 100px;
  }
  .tou-section-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: rgb(22, 33, 28);
    margin: 0 0 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(57,89,77,0.2);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .tou-section-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgb(57, 89, 77);
    color: white;
    font-size: 0.78rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .tou-p {
    font-size: 0.95rem;
    line-height: 1.8;
    color: rgb(55, 65, 60);
    margin: 0 0 16px;
  }
  .tou-ul {
    list-style: none;
    padding: 0;
    margin: 0 0 16px;
  }
  .tou-ul li {
    font-size: 0.95rem;
    line-height: 1.8;
    color: rgb(55, 65, 60);
    padding-left: 20px;
    position: relative;
    margin-bottom: 8px;
  }
  .tou-ul li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 11px;
    width: 7px;
    height: 7px;
    background: rgb(57, 89, 77);
    border-radius: 50%;
  }
  .tou-highlight {
    background: rgba(57,89,77,0.08);
    border-left: 3px solid rgb(57, 89, 77);
    border-radius: 0 8px 8px 0;
    padding: 16px 20px;
    margin: 20px 0;
  }
  .tou-highlight p { margin: 0; font-size: 0.92rem; color: rgb(40,55,47); font-style: italic; line-height: 1.7; }
  .tou-link { color: rgb(57, 89, 77); text-decoration: underline; }
  .tou-link:hover { color: rgb(22, 33, 28); }

  .tou-footer {
    background: rgba(255,255,255,0.6);
    border-top: 1px solid rgba(57,89,77,0.15);
    padding: 32px 40px;
    text-align: center;
  }
  .tou-footer-links { display: flex; justify-content: center; gap: 28px; margin-bottom: 14px; flex-wrap: wrap; }
  .tou-footer-link {
    font-size: 0.85rem;
    color: rgb(57, 89, 77);
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: color 0.15s ease;
  }
  .tou-footer-link:hover { color: rgb(22, 33, 28); text-decoration: underline; }
  .tou-footer-copy { font-size: 0.8rem; color: rgb(117, 117, 117); }

  @media (max-width: 640px) {
    .tou-nav { padding: 16px 20px; }
    .tou-main { padding: 40px 20px 60px; }
    .tou-title { font-size: 1.8rem; }
    .tou-toc-list { columns: 1; }
    .tou-nav-logo-img { height: 54px; width: 96px; }
    .tou-footer { padding: 24px 20px; }
  }
`;

const sections = [
  { id: 'acceptance', num: 1, title: 'Acceptance of Terms' },
  { id: 'description', num: 2, title: 'Description of Services' },
  { id: 'eligibility', num: 3, title: 'Eligibility & Account Registration' },
  { id: 'user-conduct', num: 4, title: 'User Conduct & Prohibited Activities' },
  { id: 'interviews', num: 5, title: 'Interview Sessions & AI Services' },
  { id: 'payments', num: 6, title: 'Payments, Tokens & Subscriptions' },
  { id: 'intellectual-property', num: 7, title: 'Intellectual Property' },
  { id: 'privacy', num: 8, title: 'Privacy & Data Usage' },
  { id: 'disclaimers', num: 9, title: 'Disclaimers & Limitations' },
  { id: 'termination', num: 10, title: 'Termination' },
  { id: 'governing-law', num: 11, title: 'Governing Law & Disputes' },
  { id: 'changes', num: 12, title: 'Changes to Terms' },
  { id: 'contact', num: 13, title: 'Contact Information' },
];

export default function TermsOfUse() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms of Use — IntraView';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="tou-page">
      <style>{PAGE_STYLES}</style>
      <div className="tou-bg" aria-hidden="true" />

      <div className="tou-shell">
        {/* Nav */}
        <nav className="tou-nav" aria-label="Site navigation">
          <button className="tou-nav-logo" onClick={() => navigate('/home')} aria-label="IntraView home">
            <img src={LOGO_URL} alt="IntraView" className="tou-nav-logo-img" />
          </button>
          <div className="tou-nav-links">
            <button className="tou-nav-link" onClick={() => navigate('/login')}>Log in</button>
            <button className="tou-nav-link" onClick={() => navigate('/signup')}>Sign up</button>
          </div>
        </nav>

        {/* Main content */}
        <main className="tou-main">
          {/* Header */}
          <header className="tou-header">
            <span className="tou-badge">Legal</span>
            <h1 className="tou-title">Terms of Use</h1>
            <p className="tou-subtitle">
              These Terms of Use govern your access to and use of the IntraView platform, including our
              AI-powered interview preparation tools, live interviewer sessions, and all associated services.
            </p>
            <p className="tou-effective">Effective Date: {EFFECTIVE_DATE}</p>
          </header>

          {/* Table of Contents */}
          <nav className="tou-toc" aria-label="Table of contents">
            <p className="tou-toc-title">Table of Contents</p>
            <ul className="tou-toc-list">
              {sections.map(s => (
                <li key={s.id} className="tou-toc-item">
                  <a className="tou-toc-link" href={`#${s.id}`}>
                    <span className="tou-toc-num">{s.num}.</span>{s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sections */}
          <section id="acceptance" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">1</span> Acceptance of Terms</h2>
            <p className="tou-p">
              By creating an account, accessing, or using any part of the IntraView platform
              (&ldquo;Platform&rdquo;), you agree to be legally bound by these Terms of Use
              (&ldquo;Terms&rdquo;), our Privacy Policy, and any additional guidelines or policies
              incorporated herein by reference.
            </p>
            <p className="tou-p">
              If you do not agree to these Terms, you may not access or use our services. IntraView
              is operated by IntraView Technologies (&ldquo;Company,&rdquo; &ldquo;we,&rdquo;
              &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms apply to all users, including
              job candidates, professional interviewers, and any other individuals who access the Platform.
            </p>
            <div className="tou-highlight">
              <p>
                If you are using IntraView on behalf of an organization or enterprise, you represent
                and warrant that you have the authority to bind that organization to these Terms.
              </p>
            </div>
          </section>

          <section id="description" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">2</span> Description of Services</h2>
            <p className="tou-p">IntraView provides a comprehensive interview preparation and assessment platform that includes:</p>
            <ul className="tou-ul">
              <li><strong>AI-Powered Mock Interviews:</strong> Conversational AI agents that simulate real interview scenarios across technical, behavioral, and role-specific domains.</li>
              <li><strong>Live Interviewer Sessions:</strong> Scheduled one-on-one video sessions with verified professional interviewers from relevant industries.</li>
              <li><strong>Performance Feedback:</strong> Detailed feedback reports, scoring, and improvement recommendations generated post-session.</li>
              <li><strong>Candidate Profile Management:</strong> Resume upload, profile customization, skill tracking, and career information management.</li>
              <li><strong>Subscription Plans & Token Bundles:</strong> Flexible access tiers that grant credits for session bookings and AI interviews.</li>
              <li><strong>Progress Analytics:</strong> Charts, readiness scores, and historical interview data to track your improvement over time.</li>
            </ul>
            <p className="tou-p">
              We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any
              time. We will endeavor to provide reasonable notice of significant changes where feasible.
            </p>
          </section>

          <section id="eligibility" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">3</span> Eligibility & Account Registration</h2>
            <p className="tou-p">
              To use IntraView, you must be at least 16 years of age. Individuals under 18 may use the
              platform only with verifiable parental or guardian consent. By registering, you confirm that:
            </p>
            <ul className="tou-ul">
              <li>All registration information you submit is accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and update it as necessary.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You will not share your account with others or allow others to access it on your behalf.</li>
            </ul>
            <p className="tou-p">
              We reserve the right to terminate or suspend any account that we determine, in our sole
              discretion, violates these Terms or is used for fraudulent, abusive, or harmful purposes.
            </p>
          </section>

          <section id="user-conduct" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">4</span> User Conduct & Prohibited Activities</h2>
            <p className="tou-p">You agree to use IntraView only for lawful purposes and in a manner consistent with these Terms. The following activities are strictly prohibited:</p>
            <ul className="tou-ul">
              <li>Impersonating any person or entity, or misrepresenting your identity, qualifications, or professional background.</li>
              <li>Recording, sharing, or distributing session content without the explicit written consent of all participating parties.</li>
              <li>Using the Platform to harass, abuse, threaten, stalk, or harm any interviewer, candidate, or IntraView staff.</li>
              <li>Attempting to circumvent, disable, or interfere with any security, integrity, or access-control features of the Platform.</li>
              <li>Scraping, crawling, or otherwise extracting data from the Platform using automated tools or bots.</li>
              <li>Submitting false, misleading, or defamatory reviews, ratings, or feedback about interviewers or other users.</li>
              <li>Engaging in any activity that could impose an unreasonably large load on our infrastructure.</li>
              <li>Using the Platform for unauthorized commercial solicitation or spam.</li>
            </ul>
            <p className="tou-p">Violations may result in immediate account suspension, permanent bans, and in serious cases, referral to law enforcement authorities.</p>
          </section>

          <section id="interviews" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">5</span> Interview Sessions & AI Services</h2>
            <p className="tou-p">
              <strong>Live Sessions:</strong> When you book a session with a professional interviewer, both
              parties agree to join at the scheduled time. Late cancellations (within 2 hours of the session)
              or no-shows may result in token deductions or booking restrictions as outlined in our
              cancellation policy.
            </p>
            <p className="tou-p">
              <strong>AI Interviews:</strong> Our AI interview system uses large language models to simulate
              realistic interview experiences. AI-generated feedback is provided for educational and
              preparatory purposes only. It does not constitute professional career advice, and IntraView
              does not guarantee any specific employment outcome resulting from use of our AI tools.
            </p>
            <p className="tou-p">
              <strong>Session Recordings:</strong> AI interview sessions may be recorded or processed to
              generate feedback. By initiating an AI session, you consent to this processing. Live sessions
              are not recorded by IntraView unless explicitly agreed to by both participants.
            </p>
            <p className="tou-p">
              <strong>Interviewer Conduct:</strong> Professional interviewers on our platform agree to a
              separate Interviewer Code of Conduct. We screen and verify interviewers, but we do not warrant
              the specific qualifications or performance of any individual interviewer.
            </p>
          </section>

          <section id="payments" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">6</span> Payments, Tokens & Subscriptions</h2>
            <p className="tou-p">
              IntraView uses a token-based system for certain services. Tokens may be purchased in bundles
              or received as part of subscription plans. The following terms apply to all financial
              transactions on the Platform:
            </p>
            <ul className="tou-ul">
              <li>All prices are displayed in USD unless stated otherwise. Applicable taxes may be added at checkout.</li>
              <li>Payments are processed securely through our third-party payment providers. IntraView does not store full payment card details.</li>
              <li>Purchased tokens are non-refundable unless the service for which they were used was demonstrably not delivered due to a platform error.</li>
              <li>Subscription fees are billed on a recurring basis (monthly or annually) as selected at purchase. Subscriptions auto-renew unless cancelled before the renewal date.</li>
              <li>Interviewer payouts are subject to a separate Payout Policy and minimum threshold requirements.</li>
              <li>IntraView reserves the right to modify pricing at any time, with notice provided to existing subscribers before the next billing cycle.</li>
            </ul>
            <div className="tou-highlight">
              <p>
                Refund requests for exceptional circumstances are evaluated on a case-by-case basis. Contact
                us at <a className="tou-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> within
                14 days of the charge in question.
              </p>
            </div>
          </section>

          <section id="intellectual-property" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">7</span> Intellectual Property</h2>
            <p className="tou-p">
              All content on the IntraView Platform, including but not limited to text, graphics, logos,
              icons, interface designs, software code, AI models, and compiled feedback reports, is the
              exclusive property of IntraView Technologies or its licensors and is protected by applicable
              intellectual property laws.
            </p>
            <p className="tou-p">You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, non-commercial interview preparation purposes. This license does not include the right to:</p>
            <ul className="tou-ul">
              <li>Reproduce, modify, distribute, or publicly display Platform content without express written permission.</li>
              <li>Reverse engineer, decompile, or extract source code from any part of the Platform.</li>
              <li>Create derivative works based on our intellectual property.</li>
              <li>Commercially exploit any content, materials, or data obtained from the Platform.</li>
            </ul>
            <p className="tou-p">
              Content you submit to the Platform (such as your profile information, resume, or session
              feedback responses) remains your intellectual property. By submitting content, you grant
              IntraView a worldwide, royalty-free license to use, process, and display such content
              solely to operate and improve our services.
            </p>
          </section>

          <section id="privacy" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">8</span> Privacy & Data Usage</h2>
            <p className="tou-p">
              Your use of IntraView is subject to our{' '}
              <button className="tou-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }} onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>,
              which is incorporated into these Terms by reference. By using the Platform, you acknowledge
              that you have read and understood our data practices, including:
            </p>
            <ul className="tou-ul">
              <li>How we collect, store, and process your personal information and session data.</li>
              <li>How AI models process your interview responses to generate feedback.</li>
              <li>Your rights regarding access, correction, and deletion of your data.</li>
              <li>Our use of cookies and tracking technologies for platform functionality and analytics.</li>
            </ul>
            <p className="tou-p">We comply with applicable data protection regulations and take appropriate technical and organizational measures to protect your personal data.</p>
          </section>

          <section id="disclaimers" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">9</span> Disclaimers & Limitations of Liability</h2>
            <p className="tou-p">
              THE INTRAVIEW PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
              WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="tou-p">We do not guarantee:</p>
            <ul className="tou-ul">
              <li>That the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.</li>
              <li>That AI-generated feedback will be accurate, complete, or suitable for your specific needs.</li>
              <li>Any specific employment outcome, job offer, or career advancement as a result of using IntraView.</li>
              <li>That professional interviewers will meet every user's individual expectations.</li>
            </ul>
            <p className="tou-p">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, INTRAVIEW SHALL NOT BE LIABLE FOR
              ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR
              USE OF OR INABILITY TO USE THE PLATFORM. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO
              THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRIOR TO THE CLAIM.
            </p>
          </section>

          <section id="termination" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">10</span> Termination</h2>
            <p className="tou-p">
              You may terminate your account at any time through your account settings or by contacting
              our support team. Upon termination:
            </p>
            <ul className="tou-ul">
              <li>Your access to the Platform and all associated services will be revoked.</li>
              <li>Unused tokens and subscription credits are non-refundable upon voluntary termination.</li>
              <li>Any pending interviewer payouts will be processed in accordance with our Payout Policy.</li>
              <li>We may retain certain data as required by law or for legitimate business purposes as outlined in our Privacy Policy.</li>
            </ul>
            <p className="tou-p">
              IntraView reserves the right to suspend or terminate your account immediately, with or
              without notice, if we determine that you have violated these Terms, engaged in fraudulent
              activity, or pose a risk to the integrity of our platform or community.
            </p>
          </section>

          <section id="governing-law" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">11</span> Governing Law & Dispute Resolution</h2>
            <p className="tou-p">
              These Terms shall be governed by and construed in accordance with applicable law. Any disputes
              arising from or related to these Terms or your use of the Platform shall first be attempted
              to be resolved through good-faith negotiation. If informal resolution fails within 30 days,
              disputes shall be submitted to binding arbitration.
            </p>
            <p className="tou-p">
              You and IntraView waive the right to participate in class-action lawsuits. Any claims must
              be brought on an individual basis within one (1) year of the event giving rise to the claim,
              or such claim shall be permanently barred.
            </p>
          </section>

          <section id="changes" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">12</span> Changes to Terms</h2>
            <p className="tou-p">
              We reserve the right to update or modify these Terms at any time. When we make material
              changes, we will notify you via email or a prominent notice on the Platform at least 14 days
              before the changes take effect. Your continued use of the Platform after that date constitutes
              your acceptance of the updated Terms.
            </p>
            <p className="tou-p">
              We encourage you to review these Terms periodically. The &ldquo;Effective Date&rdquo; at the
              top of this document indicates when these Terms were last updated.
            </p>
          </section>

          <section id="contact" className="tou-section">
            <h2 className="tou-section-title"><span className="tou-section-num">13</span> Contact Information</h2>
            <p className="tou-p">
              If you have any questions, concerns, or requests regarding these Terms of Use, please contact
              our legal team:
            </p>
            <div className="tou-highlight">
              <p>
                <strong>IntraView Technologies</strong><br />
                Legal Department<br />
                Email: <a className="tou-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
                Support: <a className="tou-link" href="mailto:support@intraview.io">support@intraview.io</a>
              </p>
            </div>
            <p className="tou-p">
              We aim to respond to all legal inquiries within 5 business days. For urgent matters, please
              mark your email subject line as &ldquo;URGENT — Legal&rdquo;.
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="tou-footer">
          <div className="tou-footer-links">
            <button className="tou-footer-link" onClick={() => navigate('/terms-of-use')}>Terms of Use</button>
            <button className="tou-footer-link" onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
            <button className="tou-footer-link" onClick={() => navigate('/terms-and-conditions')}>Terms & Conditions</button>
            <button className="tou-footer-link" onClick={() => navigate('/home')}>Home</button>
            <a className="tou-footer-link" href="mailto:support@intraview.io">Contact</a>
          </div>
          <p className="tou-footer-copy">&copy; {new Date().getFullYear()} {COMPANY_NAME} Technologies. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
