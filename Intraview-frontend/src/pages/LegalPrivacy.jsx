import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://res.cloudinary.com/dpn42vumz/image/upload/v1790803589/7a01858e-5b2d-420e-b5da-6722ef1f99d90000000000_injfdo.png';
const BG_IMAGE = 'https://res.cloudinary.com/dpn42vumz/image/upload/v1790798661/d2507caf-1682-47c3-bc02-146b7fff50b9_tjtjtl.png';
const EFFECTIVE_DATE = 'October 1, 2025';
const CONTACT_EMAIL = 'privacy@intraview.io';
const COMPANY_NAME = 'IntraView';

const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  html, body, .pp-page { scrollbar-width: thin; scrollbar-color: rgba(57,89,77,0.3) transparent; }
  html::-webkit-scrollbar, body::-webkit-scrollbar { width: 5px; }
  html::-webkit-scrollbar-track, body::-webkit-scrollbar-track { background: transparent; }
  html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: rgba(57,89,77,0.35); border-radius: 4px; }

  .pp-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    background-color: rgb(238, 240, 239);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  }

  .pp-bg {
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

  .pp-shell { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  .pp-nav {
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
  .pp-nav-logo { background: none; border: none; padding: 0; cursor: pointer; transition: opacity 0.15s ease, transform 0.15s ease; }
  .pp-nav-logo:hover { opacity: 0.82; transform: translateY(-1px); }
  .pp-nav-logo-img { height: 70px; width: 120px; object-fit: fill; display: block; }
  .pp-nav-links { display: flex; align-items: center; gap: 28px; }
  .pp-nav-link {
    font-size: 0.9rem; font-weight: 500; color: rgb(57, 89, 77);
    background: none; border: none; cursor: pointer; padding: 0; text-decoration: none;
    transition: color 0.15s ease;
  }
  .pp-nav-link:hover { color: rgb(22, 33, 28); }

  .pp-main { flex: 1; max-width: 860px; margin: 0 auto; padding: 56px 32px 80px; width: 100%; box-sizing: border-box; }

  .pp-header { margin-bottom: 48px; padding-bottom: 32px; border-bottom: 2px solid rgb(57, 89, 77); }
  .pp-badge {
    display: inline-block; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgb(57, 89, 77); background: rgba(57,89,77,0.1); border-radius: 20px; padding: 4px 14px; margin-bottom: 16px;
  }
  .pp-title { font-size: 2.4rem; font-weight: 700; color: rgb(22, 33, 28); margin: 0 0 12px; line-height: 1.2; }
  .pp-subtitle { font-size: 1rem; color: rgb(97, 97, 97); margin: 0 0 6px; line-height: 1.6; }
  .pp-effective { font-size: 0.82rem; color: rgb(117, 117, 117); margin-top: 10px; }

  .pp-toc {
    background: rgba(255,255,255,0.75); border: 1px solid rgba(57,89,77,0.2);
    border-radius: 16px; padding: 28px 32px; margin-bottom: 48px;
  }
  .pp-toc-title { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgb(57, 89, 77); margin: 0 0 16px; }
  .pp-toc-list { list-style: none; margin: 0; padding: 0; columns: 2; gap: 12px; }
  .pp-toc-item { margin-bottom: 8px; break-inside: avoid; }
  .pp-toc-link { font-size: 0.875rem; color: rgb(57, 89, 77); text-decoration: none; transition: color 0.15s ease; display: flex; align-items: center; gap: 6px; }
  .pp-toc-link:hover { color: rgb(22, 33, 28); text-decoration: underline; }
  .pp-toc-num { font-weight: 600; opacity: 0.6; }

  .pp-section { margin-bottom: 52px; scroll-margin-top: 100px; }
  .pp-section-title {
    font-size: 1.3rem; font-weight: 700; color: rgb(22, 33, 28); margin: 0 0 20px;
    padding-bottom: 12px; border-bottom: 1px solid rgba(57,89,77,0.2);
    display: flex; align-items: center; gap: 12px;
  }
  .pp-section-num {
    width: 32px; height: 32px; border-radius: 50%; background: rgb(57, 89, 77); color: white;
    font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .pp-p { font-size: 0.95rem; line-height: 1.8; color: rgb(55, 65, 60); margin: 0 0 16px; }
  .pp-ul { list-style: none; padding: 0; margin: 0 0 16px; }
  .pp-ul li { font-size: 0.95rem; line-height: 1.8; color: rgb(55, 65, 60); padding-left: 20px; position: relative; margin-bottom: 8px; }
  .pp-ul li::before { content: ''; position: absolute; left: 0; top: 11px; width: 7px; height: 7px; background: rgb(57, 89, 77); border-radius: 50%; }
  .pp-highlight { background: rgba(57,89,77,0.08); border-left: 3px solid rgb(57, 89, 77); border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
  .pp-highlight p { margin: 0; font-size: 0.92rem; color: rgb(40,55,47); font-style: italic; line-height: 1.7; }
  .pp-link { color: rgb(57, 89, 77); text-decoration: underline; }
  .pp-link:hover { color: rgb(22, 33, 28); }

  .pp-table { width: 100%; border-collapse: collapse; margin: 16px 0; border-radius: 10px; overflow: hidden; }
  .pp-table th { background: rgba(57,89,77,0.1); color: rgb(22,33,28); font-size: 0.85rem; font-weight: 600; text-align: left; padding: 12px 16px; }
  .pp-table td { background: rgba(255,255,255,0.7); font-size: 0.875rem; color: rgb(55,65,60); padding: 12px 16px; border-top: 1px solid rgba(57,89,77,0.1); vertical-align: top; }

  .pp-footer { background: rgba(255,255,255,0.6); border-top: 1px solid rgba(57,89,77,0.15); padding: 32px 40px; text-align: center; }
  .pp-footer-links { display: flex; justify-content: center; gap: 28px; margin-bottom: 14px; flex-wrap: wrap; }
  .pp-footer-link { font-size: 0.85rem; color: rgb(57, 89, 77); text-decoration: none; cursor: pointer; background: none; border: none; padding: 0; transition: color 0.15s ease; }
  .pp-footer-link:hover { color: rgb(22, 33, 28); text-decoration: underline; }
  .pp-footer-copy { font-size: 0.8rem; color: rgb(117, 117, 117); }

  @media (max-width: 640px) {
    .pp-nav { padding: 16px 20px; }
    .pp-main { padding: 40px 20px 60px; }
    .pp-title { font-size: 1.8rem; }
    .pp-toc-list { columns: 1; }
    .pp-nav-logo-img { height: 54px; width: 96px; }
    .pp-footer { padding: 24px 20px; }
  }
`;

const sections = [
  { id: 'overview', num: 1, title: 'Overview' },
  { id: 'information-collected', num: 2, title: 'Information We Collect' },
  { id: 'how-we-use', num: 3, title: 'How We Use Your Information' },
  { id: 'data-sharing', num: 4, title: 'Data Sharing & Disclosure' },
  { id: 'cookies', num: 5, title: 'Cookies & Tracking Technologies' },
  { id: 'ai-processing', num: 6, title: 'AI Processing & Interview Data' },
  { id: 'data-retention', num: 7, title: 'Data Retention' },
  { id: 'your-rights', num: 8, title: 'Your Rights & Choices' },
  { id: 'security', num: 9, title: 'Data Security' },
  { id: 'children', num: 10, title: "Children's Privacy" },
  { id: 'international', num: 11, title: 'International Transfers' },
  { id: 'changes', num: 12, title: 'Changes to This Policy' },
  { id: 'contact', num: 13, title: 'Contact Us' },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy — IntraView';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pp-page">
      <style>{PAGE_STYLES}</style>
      <div className="pp-bg" aria-hidden="true" />

      <div className="pp-shell">
        <nav className="pp-nav" aria-label="Site navigation">
          <button className="pp-nav-logo" onClick={() => navigate('/home')} aria-label="IntraView home">
            <img src={LOGO_URL} alt="IntraView" className="pp-nav-logo-img" />
          </button>
          <div className="pp-nav-links">
            <button className="pp-nav-link" onClick={() => navigate('/login')}>Log in</button>
            <button className="pp-nav-link" onClick={() => navigate('/signup')}>Sign up</button>
          </div>
        </nav>

        <main className="pp-main">
          <header className="pp-header">
            <span className="pp-badge">Legal</span>
            <h1 className="pp-title">Privacy Policy</h1>
            <p className="pp-subtitle">
              At IntraView, your privacy is fundamental to how we operate. This policy explains how we collect,
              use, protect, and give you control over your personal information when you use our platform.
            </p>
            <p className="pp-effective">Effective Date: {EFFECTIVE_DATE}</p>
          </header>

          <nav className="pp-toc" aria-label="Table of contents">
            <p className="pp-toc-title">Table of Contents</p>
            <ul className="pp-toc-list">
              {sections.map(s => (
                <li key={s.id} className="pp-toc-item">
                  <a className="pp-toc-link" href={`#${s.id}`}>
                    <span className="pp-toc-num">{s.num}.</span>{s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section id="overview" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">1</span> Overview</h2>
            <p className="pp-p">
              IntraView Technologies (&ldquo;IntraView,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;us&rdquo;) is committed to protecting and respecting your privacy. This Privacy Policy
              applies to all users of the IntraView platform — including job candidates, professional
              interviewers, and administrators — and covers all services we provide, including AI-powered
              mock interviews, live interviewer sessions, profile management, and analytics.
            </p>
            <div className="pp-highlight">
              <p>
                We do not sell your personal data to third parties. Your information is used exclusively
                to operate, improve, and personalize the IntraView experience for you.
              </p>
            </div>
          </section>

          <section id="information-collected" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">2</span> Information We Collect</h2>
            <p className="pp-p">We collect several categories of information to deliver and improve our services:</p>
            <p className="pp-p"><strong>Account & Profile Information</strong></p>
            <ul className="pp-ul">
              <li>Name, email address, username, and password (stored as encrypted hash).</li>
              <li>Profile picture, professional bio, work experience, skills, and career preferences.</li>
              <li>Resume and any documents you choose to upload.</li>
              <li>LinkedIn URL, GitHub, portfolio links, and other social/professional links.</li>
            </ul>
            <p className="pp-p"><strong>Session & Interview Data</strong></p>
            <ul className="pp-ul">
              <li>Transcripts and responses from AI interview sessions.</li>
              <li>AI-generated feedback reports, scores, and readiness assessments.</li>
              <li>Booking history, session schedules, and interviewer ratings you submit.</li>
              <li>Video/audio metadata from live sessions (IntraView does not record live sessions without explicit consent).</li>
            </ul>
            <p className="pp-p"><strong>Financial & Transaction Data</strong></p>
            <ul className="pp-ul">
              <li>Token purchase history, subscription plan details, and payment dates.</li>
              <li>Billing information (managed securely by our payment processor; IntraView does not store raw card numbers).</li>
              <li>Interviewer payout requests and wallet balances.</li>
            </ul>
            <p className="pp-p"><strong>Usage & Technical Data</strong></p>
            <ul className="pp-ul">
              <li>Browser type, operating system, device identifiers, and IP address.</li>
              <li>Pages visited, features used, click patterns, and session duration.</li>
              <li>Error logs and diagnostic data for platform stability.</li>
            </ul>
            <p className="pp-p"><strong>Communications</strong></p>
            <ul className="pp-ul">
              <li>Support tickets and messages you send to our team.</li>
              <li>Feedback, reviews, and issue reports you submit.</li>
              <li>Email communications related to your account, bookings, and platform updates.</li>
            </ul>
          </section>

          <section id="how-we-use" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">3</span> How We Use Your Information</h2>
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Data Used</th>
                  <th>Legal Basis</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Provide and operate our platform services</td><td>Account info, session data</td><td>Contract performance</td></tr>
                <tr><td>Generate AI interview feedback</td><td>Session transcripts, responses</td><td>Contract performance</td></tr>
                <tr><td>Process payments and manage subscriptions</td><td>Transaction data, billing info</td><td>Contract performance</td></tr>
                <tr><td>Match candidates with interviewers</td><td>Profile, availability, preferences</td><td>Contract performance</td></tr>
                <tr><td>Improve and train our AI models</td><td>Anonymized session data</td><td>Legitimate interest</td></tr>
                <tr><td>Send transactional notifications</td><td>Email, booking details</td><td>Contract performance</td></tr>
                <tr><td>Platform analytics and optimization</td><td>Usage data, device info</td><td>Legitimate interest</td></tr>
                <tr><td>Marketing communications (opt-in)</td><td>Email, usage preferences</td><td>Consent</td></tr>
                <tr><td>Security, fraud prevention, compliance</td><td>All relevant data</td><td>Legal obligation / Legitimate interest</td></tr>
              </tbody>
            </table>
          </section>

          <section id="data-sharing" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">4</span> Data Sharing & Disclosure</h2>
            <p className="pp-p">We do not sell or rent your personal data. We may share your information only in the following limited circumstances:</p>
            <ul className="pp-ul">
              <li><strong>Professional Interviewers:</strong> When you book a session, relevant profile information (name, skills, session context) is shared with your assigned interviewer to facilitate the interview.</li>
              <li><strong>Service Providers:</strong> We engage trusted third-party service providers for payment processing (Stripe), email delivery, video conferencing (LiveKit), cloud hosting, and analytics. These providers access data only to perform services on our behalf and are bound by strict data processing agreements.</li>
              <li><strong>Legal Compliance:</strong> We may disclose your information if required by law, subpoena, court order, or to protect the safety and rights of IntraView, its users, or the public.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. We will notify you before your data becomes subject to a different privacy policy.</li>
              <li><strong>With Your Consent:</strong> For any other sharing not described above, we will obtain your explicit consent first.</li>
            </ul>
          </section>

          <section id="cookies" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">5</span> Cookies & Tracking Technologies</h2>
            <p className="pp-p">IntraView uses cookies and similar tracking technologies to operate and improve the platform. We use:</p>
            <ul className="pp-ul">
              <li><strong>Strictly Necessary Cookies:</strong> Required for authentication, session management, and core platform functionality. These cannot be disabled.</li>
              <li><strong>Functional Cookies:</strong> Store your preferences (e.g., language, theme, notification settings) to enhance your experience.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with IntraView, which features are most used, and where we can improve. Data is aggregated and anonymized where possible.</li>
              <li><strong>Third-Party Cookies:</strong> Limited third-party tools (such as payment processors) may set their own cookies during transactions.</li>
            </ul>
            <p className="pp-p">
              You can control cookie preferences through your browser settings. Note that disabling certain
              cookies may impact the functionality of the platform. We do not currently respond to
              &ldquo;Do Not Track&rdquo; signals, but we honor equivalent opt-out mechanisms where required by law.
            </p>
          </section>

          <section id="ai-processing" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">6</span> AI Processing & Interview Data</h2>
            <p className="pp-p">
              IntraView uses artificial intelligence to power its mock interview experience. When you participate
              in an AI interview session:
            </p>
            <ul className="pp-ul">
              <li>Your spoken or typed responses are processed by AI language models to generate real-time conversational responses and post-session feedback.</li>
              <li>Session data is stored to generate your performance report and track your progress over time.</li>
              <li>Anonymized and aggregated data may be used to improve the quality and accuracy of our AI models. We take steps to remove personally identifying information before using data for model training.</li>
              <li>You may request deletion of your AI session data through your account settings or by contacting us.</li>
            </ul>
            <div className="pp-highlight">
              <p>
                Our AI systems are designed to provide constructive, unbiased feedback. We actively monitor
                for algorithmic bias and review AI outputs to ensure they meet professional and ethical
                standards.
              </p>
            </div>
          </section>

          <section id="data-retention" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">7</span> Data Retention</h2>
            <p className="pp-p">We retain your personal data for as long as necessary to fulfill the purposes described in this Policy, unless a longer retention period is required by law.</p>
            <ul className="pp-ul">
              <li><strong>Account Data:</strong> Retained for the duration of your account, plus 3 years after account closure for audit and legal compliance purposes.</li>
              <li><strong>Session & Interview Data:</strong> Retained for 2 years from the date of the session to support progress tracking and dispute resolution.</li>
              <li><strong>Financial Records:</strong> Retained for 7 years as required by tax and financial regulations.</li>
              <li><strong>Support Communications:</strong> Retained for 2 years to assist with follow-up issues.</li>
              <li><strong>Marketing Data:</strong> Retained until you withdraw consent or unsubscribe.</li>
            </ul>
            <p className="pp-p">When data is no longer needed, we securely delete or anonymize it in accordance with our data disposal procedures.</p>
          </section>

          <section id="your-rights" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">8</span> Your Rights & Choices</h2>
            <p className="pp-p">Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="pp-ul">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to processing of your data based on legitimate interests.</li>
              <li><strong>Restriction:</strong> Request that we limit processing of your data in certain circumstances.</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for processing activities based on consent at any time.</li>
              <li><strong>Lodge a Complaint:</strong> File a complaint with your local data protection authority.</li>
            </ul>
            <p className="pp-p">
              To exercise your rights, contact us at{' '}
              <a className="pp-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will respond
              within 30 days of receiving your request.
            </p>
          </section>

          <section id="security" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">9</span> Data Security</h2>
            <p className="pp-p">
              We implement a comprehensive set of technical and organizational security measures to protect
              your personal data, including:
            </p>
            <ul className="pp-ul">
              <li>End-to-end encryption for sensitive data in transit (TLS 1.2+).</li>
              <li>AES-256 encryption for sensitive data at rest.</li>
              <li>Password hashing using bcrypt with appropriate salt rounds.</li>
              <li>Role-based access controls that limit employee access to personal data on a need-to-know basis.</li>
              <li>Regular security audits, vulnerability scanning, and penetration testing.</li>
              <li>Incident response procedures with mandatory breach notification timelines.</li>
            </ul>
            <p className="pp-p">
              While we apply industry-standard security practices, no method of transmission over the
              internet is 100% secure. In the event of a data breach affecting your personal data, we will
              notify you as required by applicable law.
            </p>
          </section>

          <section id="children" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">10</span> Children's Privacy</h2>
            <p className="pp-p">
              IntraView is not directed at children under the age of 16. We do not knowingly collect
              personal data from children under 16. If you believe we have inadvertently collected
              information from a child, please contact us immediately at{' '}
              <a className="pp-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will
              promptly delete such information.
            </p>
            <p className="pp-p">
              Users between the ages of 16 and 18 may use IntraView only with verifiable parental or
              guardian consent. Parents or guardians who have concerns about their child's use of our
              platform are encouraged to contact us.
            </p>
          </section>

          <section id="international" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">11</span> International Transfers</h2>
            <p className="pp-p">
              IntraView operates globally and your data may be transferred to and processed in countries
              outside your country of residence, including countries that may not offer the same level of
              data protection as your home country.
            </p>
            <p className="pp-p">
              Where we transfer data internationally, we implement appropriate safeguards such as Standard
              Contractual Clauses (SCCs) approved by applicable regulatory authorities, to ensure your
              data receives adequate protection in accordance with applicable privacy laws.
            </p>
          </section>

          <section id="changes" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">12</span> Changes to This Policy</h2>
            <p className="pp-p">
              We may update this Privacy Policy periodically to reflect changes in our practices, legal
              requirements, or platform features. When we make material changes, we will notify you by
              email and/or by displaying a prominent notice on the Platform at least 14 days before the
              changes take effect.
            </p>
            <p className="pp-p">
              Your continued use of IntraView after the effective date of any updated Policy constitutes
              your acceptance of the changes. We encourage you to review this Policy regularly.
            </p>
          </section>

          <section id="contact" className="pp-section">
            <h2 className="pp-section-title"><span className="pp-section-num">13</span> Contact Us</h2>
            <p className="pp-p">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data
              practices, please contact our Data Protection team:
            </p>
            <div className="pp-highlight">
              <p>
                <strong>IntraView Technologies — Privacy Team</strong><br />
                Email: <a className="pp-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
                General Support: <a className="pp-link" href="mailto:support@intraview.io">support@intraview.io</a><br />
                Response Time: Within 30 days of receiving your request
              </p>
            </div>
          </section>
        </main>

        <footer className="pp-footer">
          <div className="pp-footer-links">
            <button className="pp-footer-link" onClick={() => navigate('/terms-of-use')}>Terms of Use</button>
            <button className="pp-footer-link" onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
            <button className="pp-footer-link" onClick={() => navigate('/terms-and-conditions')}>Terms & Conditions</button>
            <button className="pp-footer-link" onClick={() => navigate('/home')}>Home</button>
            <a className="pp-footer-link" href="mailto:support@intraview.io">Contact</a>
          </div>
          <p className="pp-footer-copy">&copy; {new Date().getFullYear()} {COMPANY_NAME} Technologies. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
