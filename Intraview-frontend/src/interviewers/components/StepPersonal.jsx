// src/interviewers/components/StepPersonal.jsx
import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { TIMEZONE_OPTIONS } from '../hooks/useInterviewerFormValidation';

// ─── Shared primitives ────────────────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: 'block',
      fontSize: '12px',
      fontWeight: 700,
      color: '#374151',
      marginBottom: '6px',
      letterSpacing: '0.02em',
    }}>
      {children}
      {required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
      <AlertCircle size={13} color="#EF4444" style={{ flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: '12px', color: '#EF4444' }}>{msg}</p>
    </div>
  );
}

function ValidatedInput({ name, status, type = 'text', ...props }) {
  const isError = status === 'error';
  const isValid = status === 'valid';
  const borderColor = isError ? '#EF4444' : isValid ? '#10B981' : '#D1D5DB';
  const bg = isError ? '#FFF5F5' : isValid ? '#F0FDF4' : '#FFFFFF';

  return (
    <div style={{ position: 'relative' }}>
      <input
        name={name}
        type={type}
        {...props}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 36px 10px 12px',
          borderRadius: '10px',
          border: `1.5px solid ${borderColor}`,
          background: bg,
          fontSize: '13.5px',
          color: '#1F2937',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      />
      {isValid && <CheckCircle2 size={16} color="#10B981" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />}
      {isError && <XCircle size={16} color="#EF4444" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />}
    </div>
  );
}

function ValidatedSelect({ name, status, children, ...props }) {
  const isError = status === 'error';
  const isValid = status === 'valid';
  const borderColor = isError ? '#EF4444' : isValid ? '#10B981' : '#D1D5DB';
  const bg = isError ? '#FFF5F5' : isValid ? '#F0FDF4' : '#FFFFFF';

  return (
    <div style={{ position: 'relative' }}>
      <select
        name={name}
        {...props}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 36px 10px 12px',
          borderRadius: '10px',
          border: `1.5px solid ${borderColor}`,
          background: bg,
          fontSize: '13.5px',
          color: props.value ? '#1F2937' : '#9CA3AF',
          outline: 'none',
          fontFamily: 'inherit',
          cursor: 'pointer',
          appearance: 'none',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        {children}
      </select>
      {/* Custom dropdown arrow */}
      <div style={{
        position: 'absolute', right: '28px', top: '50%',
        transform: 'translateY(-50%)', pointerEvents: 'none',
        borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
        borderTop: `5px solid #6B7280`,
      }} />
      {isValid && <CheckCircle2 size={16} color="#10B981" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
      {isError && <XCircle size={16} color="#EF4444" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepPersonal({ data, setData, next, validation }) {
  const { getDisplayError, getFieldStatus, handleBlur, handleChangeValidate } = validation;

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setData((prev) => ({ ...prev, [field]: value }));
    handleChangeValidate(field, { ...data, [field]: value });
  };

  const handleBlurField = (field) => () => {
    handleBlur(field, data);
  };

  const handleNext = () => {
    const valid = validation.validateStep(0, data);
    if (valid) next();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Personal Information
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
          Tell us a bit about yourself so we can verify your identity and contact details.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Phone Number */}
        <div>
          <FieldLabel required>Phone Number</FieldLabel>
          <ValidatedInput
            name="phone_number"
            type="tel"
            value={data.phone_number}
            onChange={handleChange('phone_number')}
            onBlur={handleBlurField('phone_number')}
            status={getFieldStatus('phone_number')}
            placeholder="+91 98765 43210"
          />
          <FieldError msg={getDisplayError('phone_number')} />
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9CA3AF' }}>
            10-digit Indian number, with or without +91 prefix
          </p>
        </div>

        {/* Company Name */}
        <div>
          <FieldLabel required>Current / Most Recent Company</FieldLabel>
          <ValidatedInput
            name="company_name"
            value={data.company_name}
            onChange={handleChange('company_name')}
            onBlur={handleBlurField('company_name')}
            status={getFieldStatus('company_name')}
            placeholder="e.g. Google, Infosys, Self Employed"
          />
          <FieldError msg={getDisplayError('company_name')} />
        </div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Location */}
          <div>
            <FieldLabel required>Location</FieldLabel>
            <ValidatedInput
              name="location"
              value={data.location}
              onChange={handleChange('location')}
              onBlur={handleBlurField('location')}
              status={getFieldStatus('location')}
              placeholder="Kochi, India"
            />
            <FieldError msg={getDisplayError('location')} />
          </div>

          {/* Timezone */}
          <div>
            <FieldLabel required>Timezone</FieldLabel>
            <ValidatedSelect
              name="timezone"
              value={data.timezone}
              onChange={handleChange('timezone')}
              onBlur={handleBlurField('timezone')}
              status={getFieldStatus('timezone')}
            >
              <option value="">Select your timezone</option>
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </ValidatedSelect>
            <FieldError msg={getDisplayError('timezone')} />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <FieldLabel required>LinkedIn Profile</FieldLabel>
          <ValidatedInput
            name="linkedin_url"
            type="url"
            value={data.linkedin_url}
            onChange={handleChange('linkedin_url')}
            onBlur={handleBlurField('linkedin_url')}
            status={getFieldStatus('linkedin_url')}
            placeholder="https://www.linkedin.com/in/username"
          />
          <FieldError msg={getDisplayError('linkedin_url')} />
        </div>

        {/* GitHub (optional) */}
        <div>
          <FieldLabel>GitHub Profile <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></FieldLabel>
          <ValidatedInput
            name="github_url"
            type="url"
            value={data.github_url}
            onChange={handleChange('github_url')}
            onBlur={handleBlurField('github_url')}
            status={getFieldStatus('github_url')}
            placeholder="https://github.com/username"
          />
          <FieldError msg={getDisplayError('github_url')} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleNext}
          style={{
            padding: '10px 28px',
            borderRadius: '10px',
            border: 'none',
            background: '#059669',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.target.style.background = '#047857')}
          onMouseLeave={(e) => (e.target.style.background = '#059669')}
        >
          Next: Experience →
        </button>
      </div>
    </div>
  );
}