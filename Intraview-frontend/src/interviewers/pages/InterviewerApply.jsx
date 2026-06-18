// src/interviewers/pages/InterviewerApply.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitInterviewerApplication,
  fetchExistingApplication,
} from "../interviewerSlice";
import StepPersonal    from "../components/StepPersonal";
import StepExperience  from "../components/StepExperience";
import StepDocuments   from "../components/StepDocuments";
import StepReview      from "../components/StepReview";
import ApplicationSubmitted from "../components/ApplicationSubmitted";
import { useInterviewerFormValidation } from "../hooks/useInterviewerFormValidation";
import { CheckCircle2 } from "lucide-react";

const steps = [
  { id: 0, label: "Personal Info",  component: StepPersonal },
  { id: 1, label: "Experience",     component: StepExperience },
  { id: 2, label: "Documents",      component: StepDocuments },
  { id: 3, label: "Review",         component: StepReview },
];

const EMPTY_FORM = {
  phone_number:                  "",
  location:                      "",
  timezone:                      "",
  linkedin_url:                  "",
  github_url:                    "",
  company_name:                  "",
  years_of_experience:           "",
  years_of_interview_experience: "",
  specializations:               [],
  education:                     "",
  languages:                     [],
  expertise_summary:             "",
  motivation:                    "",
  resume:                        null,
  certifications:                null,
  additional_docs:               null,
};

export default function InterviewerApply() {
  const dispatch = useDispatch();
  const { loading, status, existingApplication, loadingExistingApplication, error } =
    useSelector((s) => s.interviewer);

  const [activeStep, setActiveStep]   = useState(0);
  const [formData,   setFormData]     = useState(EMPTY_FORM);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Validation hook
  const validation = useInterviewerFormValidation();

  // ── On mount: fetch existing application ────────────────────────────────────
  useEffect(() => {
    dispatch(fetchExistingApplication());
  }, [dispatch]);

  // ── Handle API Errors ───────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      validation.handleApiErrors(error);
      // Optional: If there's a non_field_errors, we could show a toast, but for now we map it to fields
    }
  }, [error, validation]);

  // ── Pre-populate form when re-applying ──────────────────────────────────────
  useEffect(() => {
    if (!existingApplication) return;
    if (existingApplication.status !== "REJECTED") return;

    setFormData({
      phone_number:                  existingApplication.phone_number                  || "",
      location:                      existingApplication.location                      || "",
      timezone:                      existingApplication.timezone                      || "",
      linkedin_url:                  existingApplication.linkedin_url                  || "",
      github_url:                    existingApplication.github_url                    || "",
      company_name:                  existingApplication.company_name                  || "",
      years_of_experience:           existingApplication.years_of_experience           ?? "",
      years_of_interview_experience: existingApplication.years_of_interview_experience ?? "",
      specializations:               existingApplication.specializations               || [],
      education:                     existingApplication.education                     || "",
      languages:                     existingApplication.languages                     || [],
      expertise_summary:             existingApplication.expertise_summary             || "",
      motivation:                    existingApplication.motivation                    || "",
      resume:                        null,
      certifications:                null,
      additional_docs:               null,
      _existing_resume:              existingApplication.resume          || null,
      _existing_certifications:      existingApplication.certifications  || null,
      _existing_additional_docs:     existingApplication.additional_docs || null,
    });
  }, [existingApplication]);

  const isReapplying = existingApplication?.status === "REJECTED";
  const CurrentStep  = steps[activeStep].component;

  // Navigation helpers — advance only if step validation passes (handled inside each step)
  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, activeStep]));
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (stepIndex) => {
    setActiveStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key.startsWith("_existing_")) return;
      if (Array.isArray(value)) {
        value.forEach((v) => fd.append(key, v));
      } else if (value !== null && value !== "") {
        fd.append(key, value);
      }
    });
    await dispatch(submitInterviewerApplication(fd));
  };

  if (status === "PENDING") return <ApplicationSubmitted />;

  if (loadingExistingApplication) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #D1D5DB', borderTopColor: '#059669', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Loading your application…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F0FDF4 0%, #F8FAFC 60%)', paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 20px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            {isReapplying ? "Re-apply as Interviewer" : "Apply to Become an Interviewer"}
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            {isReapplying
              ? "Your previous application was rejected. Update your details and resubmit."
              : "Fill out your details and submit credentials for review. We'll respond within 5–7 business days."}
          </p>
        </div>

        {/* Rejection banner */}
        {isReapplying && existingApplication?.rejection_reason && (
          <div style={{
            marginBottom: '20px',
            borderRadius: '12px',
            border: '1.5px solid #FCA5A5',
            background: '#FEF2F2',
            padding: '14px 18px',
            fontSize: '13px',
            color: '#7F1D1D',
          }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700 }}>Previous rejection reason:</p>
            <p style={{ margin: 0 }}>{existingApplication.rejection_reason}</p>
          </div>
        )}

        {/* ── Step Indicator ───────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '28px',
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px 24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          border: '1px solid #E5E7EB',
        }}>
          {steps.map((step, index) => {
            const isActive    = index === activeStep;
            const isCompleted = completedSteps.has(index) && index < activeStep;
            const isFuture    = index > activeStep && !completedSteps.has(index);
            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => isCompleted && goToStep(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: isCompleted ? 'pointer' : 'default',
                  }}
                >
                  {/* Circle */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '13px',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    background: isCompleted ? '#059669' : isActive ? '#ECFDF5' : '#F3F4F6',
                    border: isActive ? '2px solid #059669' : isCompleted ? '2px solid #059669' : '2px solid #E5E7EB',
                    color: isCompleted ? '#fff' : isActive ? '#059669' : '#9CA3AF',
                  }}>
                    {isCompleted
                      ? <CheckCircle2 size={16} color="#fff" />
                      : index + 1}
                  </div>
                  {/* Label */}
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#059669' : isCompleted ? '#374151' : '#9CA3AF',
                    whiteSpace: 'nowrap',
                  }}>
                    {step.label}
                  </span>
                </div>
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    margin: '0 12px',
                    background: completedSteps.has(index) && index < activeStep
                      ? '#059669'
                      : '#E5E7EB',
                    borderRadius: 1,
                    transition: 'background 0.3s',
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Main content grid ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '20px' }}>

          {/* Step card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            border: '1px solid #E5E7EB',
            padding: '28px 32px',
          }}>
            <CurrentStep
              data={formData}
              setData={setFormData}
              next={handleNext}
              back={handleBack}
              submit={handleSubmit}
              isLast={activeStep === steps.length - 1}
              loading={loading}
              isReapplying={isReapplying}
              validation={validation}
              goToStep={goToStep}
            />
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Progress */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              padding: '18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                Application Progress
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {steps.map((step, index) => {
                  const done = completedSteps.has(index) && index < activeStep;
                  const active = index === activeStep;
                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: done ? '#059669' : active ? '#34D399' : '#E5E7EB',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '12px', color: done ? '#065F46' : active ? '#047857' : '#9CA3AF', fontWeight: active ? 700 : 400 }}>
                        {step.label}
                        {done && ' ✓'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>
                  Step {activeStep + 1} of {steps.length}
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${((activeStep) / (steps.length - 1)) * 100}%`,
                    background: '#059669',
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            </div>

            {/* Help */}
            <div style={{
              background: '#F0FDF4',
              borderRadius: '14px',
              border: '1px solid #D1FAE5',
              padding: '18px',
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
                💡 Tips
              </h3>
              <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: '#047857', lineHeight: 1.7 }}>
                <li>Be thorough and accurate with all information</li>
                <li>Highlight your unique interviewing experience</li>
                <li>Upload an up-to-date, professional resume</li>
                <li>Include relevant certifications if available</li>
                <li>Write at least 100 characters in your expertise summary</li>
              </ul>
            </div>

            {/* Support */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              padding: '18px',
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                Need Help?
              </h3>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6B7280' }}>
                We're here to help with your application.
              </p>
              <a
                href="mailto:support@intraview.app"
                style={{ fontSize: '12px', color: '#059669', fontWeight: 600, textDecoration: 'none' }}
              >
                📧 support@intraview.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
