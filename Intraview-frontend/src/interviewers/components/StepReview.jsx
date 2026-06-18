// src/interviewers/components/StepReview.jsx
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ReviewRow({ label, value }) {
  const isEmpty = !value || value === '-';
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '5px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', minWidth: '140px', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', color: isEmpty ? '#D1D5DB' : '#1F2937', wordBreak: 'break-word' }}>
        {value || '—'}
      </span>
    </div>
  );
}

function SectionCard({ title, stepIndex, isValid, onGoTo, children }) {
  return (
    <div style={{
      borderRadius: '12px',
      border: `1.5px solid ${isValid ? '#D1FAE5' : '#FEE2E2'}`,
      background: isValid ? '#F0FDF4' : '#FFF5F5',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: isValid ? '#ECFDF5' : '#FEF2F2',
        borderBottom: `1px solid ${isValid ? '#D1FAE5' : '#FECACA'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isValid
            ? <CheckCircle2 size={16} color="#059669" />
            : <XCircle size={16} color="#DC2626" />}
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>{title}</span>
        </div>
        <button
          type="button"
          onClick={() => onGoTo(stepIndex)}
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#059669',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 8px',
            borderRadius: '6px',
            textDecoration: 'underline',
          }}
        >
          Edit
        </button>
      </div>
      {/* Body */}
      <div style={{ padding: '12px 16px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepReview({ data, back, submit, loading, validation, goToStep }) {
  // Run validateAll to get section statuses for display (non-destructive: errors shown only if already touched)
  const getStepValid = (stepIndex) => {
    const STEP_FIELDS = [
      ['phone_number', 'company_name', 'location', 'timezone', 'linkedin_url', 'github_url'],
      ['years_of_experience', 'years_of_interview_experience', 'specializations', 'education', 'languages', 'expertise_summary', 'motivation'],
      ['resume', 'certifications', 'additional_docs'],
    ];
    // Quick check: just run validators without touching state
    const fields = STEP_FIELDS[stepIndex];
    // We'll pass these through the hook's getDisplayError to see if there are any errors
    return fields.every((f) => !validation.errors[f]);
  };

  const step1Valid = getStepValid(0);
  const step2Valid = getStepValid(1);
  const step3Valid = getStepValid(2);

  const handleSubmit = async () => {
    // Full re-validation before submit
    const { valid, firstInvalidStep } = validation.validateAll(data);
    if (!valid) {
      if (firstInvalidStep !== null && goToStep) {
        goToStep(firstInvalidStep);
      }
      return;
    }
    await submit();
  };

  const resumeLabel = data.resume
    ? data.resume.name
    : data._existing_resume
    ? `Current: ${data._existing_resume.split('/').pop()}`
    : '— Not uploaded';

  const certLabel = data.certifications
    ? data.certifications.name
    : data._existing_certifications
    ? `Current: ${data._existing_certifications.split('/').pop()}`
    : '— None';

  const addlLabel = data.additional_docs
    ? data.additional_docs.name
    : data._existing_additional_docs
    ? `Current: ${data._existing_additional_docs.split('/').pop()}`
    : '— None';

  const allValid = step1Valid && step2Valid && step3Valid;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Review &amp; Submit
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
          Review your application before submitting. Click Edit on any section to make changes.
        </p>
      </div>

      {/* Validation summary banner */}
      {!allValid && (
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1.5px solid #FCA5A5',
          background: '#FEF2F2',
          marginBottom: '20px',
        }}>
          <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#7F1D1D' }}>
              Some sections are incomplete
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#991B1B' }}>
              Please fix the highlighted issues before submitting your application.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Section 1 — Personal */}
        <SectionCard title="Personal Information" stepIndex={0} isValid={step1Valid} onGoTo={goToStep}>
          <ReviewRow label="Phone" value={data.phone_number} />
          <ReviewRow label="Company" value={data.company_name} />
          <ReviewRow label="Location" value={data.location} />
          <ReviewRow label="Timezone" value={data.timezone} />
          <ReviewRow label="LinkedIn" value={data.linkedin_url} />
          <ReviewRow label="GitHub" value={data.github_url || 'Not provided'} />
        </SectionCard>

        {/* Section 2 — Experience */}
        <SectionCard title="Professional Experience & Skills" stepIndex={1} isValid={step2Valid} onGoTo={goToStep}>
          <ReviewRow label="Professional Exp." value={data.years_of_experience ? `${data.years_of_experience} years` : null} />
          <ReviewRow label="Interview Exp." value={data.years_of_interview_experience !== '' ? `${data.years_of_interview_experience} years` : null} />
          <ReviewRow label="Specializations" value={data.specializations?.length ? data.specializations.join(', ') : null} />
          <ReviewRow label="Languages" value={data.languages?.length ? data.languages.join(', ') : null} />
          <ReviewRow label="Education" value={data.education} />
          <ReviewRow label="Expertise Summary" value={
            data.expertise_summary
              ? `${data.expertise_summary.slice(0, 120)}${data.expertise_summary.length > 120 ? '…' : ''}`
              : null
          } />
          {data.motivation && (
            <ReviewRow label="Motivation" value={
              data.motivation.length > 100
                ? `${data.motivation.slice(0, 100)}…`
                : data.motivation
            } />
          )}
        </SectionCard>

        {/* Section 3 — Documents */}
        <SectionCard title="Documents" stepIndex={2} isValid={step3Valid} onGoTo={goToStep}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
            <FileText size={14} color={data.resume || data._existing_resume ? '#059669' : '#EF4444'} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', minWidth: '140px' }}>Resume</span>
            <span style={{ fontSize: '13px', color: '#1F2937' }}>{resumeLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
            <FileText size={14} color="#9CA3AF" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', minWidth: '140px' }}>Certifications</span>
            <span style={{ fontSize: '13px', color: '#1F2937' }}>{certLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
            <FileText size={14} color="#9CA3AF" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', minWidth: '140px' }}>Additional Docs</span>
            <span style={{ fontSize: '13px', color: '#1F2937' }}>{addlLabel}</span>
          </div>
        </SectionCard>

        {/* Terms */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '10px',
          border: '1px solid #FDE68A',
          background: '#FFFBEB',
          fontSize: '12px',
          color: '#78350F',
          lineHeight: 1.5,
        }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700 }}>Terms &amp; Consent</p>
          <p style={{ margin: 0 }}>
            By submitting this application, you confirm that all information provided is accurate and complete.
            You agree to Intraview's terms, confidentiality expectations, and interviewer code of conduct.
          </p>
        </div>

      </div>

      {/* Actions */}
      <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={back}
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1.5px solid #D1D5DB',
            background: '#FFFFFF',
            color: '#374151',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          ← Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '11px 32px',
            borderRadius: '10px',
            border: 'none',
            background: loading ? '#6EE7B7' : '#059669',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.15s',
            boxShadow: loading ? 'none' : '0 2px 8px rgba(5,150,105,0.3)',
          }}
        >
          {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
          {loading ? 'Submitting…' : '🚀 Submit Application'}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}