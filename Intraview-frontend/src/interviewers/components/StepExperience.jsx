// src/interviewers/components/StepExperience.jsx
import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  SPECIALIZATION_OPTIONS,
  LANGUAGE_OPTIONS,
} from '../hooks/useInterviewerFormValidation';

// ─── Primitives ───────────────────────────────────────────────────────────────

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

function ValidatedTextarea({ name, status, maxLen, value, ...props }) {
  const isError = status === 'error';
  const isValid = status === 'valid';
  const borderColor = isError ? '#EF4444' : isValid ? '#10B981' : '#D1D5DB';
  const bg = isError ? '#FFF5F5' : isValid ? '#F0FDF4' : '#FFFFFF';
  const len = (value || '').length;
  const overLimit = maxLen && len > maxLen;

  return (
    <div>
      <textarea
        name={name}
        value={value}
        {...props}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 12px',
          borderRadius: '10px',
          border: `1.5px solid ${borderColor}`,
          background: bg,
          fontSize: '13.5px',
          color: '#1F2937',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: 1.55,
          transition: 'border-color 0.15s, background 0.15s',
        }}
      />
      {maxLen && (
        <p style={{
          margin: '3px 0 0',
          fontSize: '11px',
          textAlign: 'right',
          color: overLimit ? '#EF4444' : len >= maxLen * 0.8 ? '#F59E0B' : '#9CA3AF',
        }}>
          {len} / {maxLen}
        </p>
      )}
    </div>
  );
}

// Chip selection (specializations & languages)
function ChipGroup({ options, selected = [], onToggle, maxSelect, status, name }) {
  const isError = status === 'error';
  return (
    <div
      data-field={name}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        borderRadius: '10px',
        border: `1.5px solid ${isError ? '#EF4444' : '#E5E7EB'}`,
        background: isError ? '#FFF5F5' : '#F9FAFB',
      }}
    >
      {options.map((item) => {
        const isSelected = selected.includes(item);
        const isDisabled = !isSelected && maxSelect && selected.length >= maxSelect;
        return (
          <button
            type="button"
            key={item}
            onClick={() => !isDisabled && onToggle(item)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: isSelected ? '1.5px solid #059669' : '1.5px solid #D1D5DB',
              background: isSelected ? '#ECFDF5' : '#FFFFFF',
              color: isSelected ? '#065F46' : isDisabled ? '#D1D5DB' : '#374151',
              fontSize: '12.5px',
              fontWeight: isSelected ? 600 : 400,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.12s',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            {isSelected && <CheckCircle2 size={12} color="#059669" />}
            {item}
          </button>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepExperience({ data, setData, next, back, validation }) {
  const { getDisplayError, getFieldStatus, handleBlur, handleChangeValidate } = validation;

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setData((prev) => ({ ...prev, [field]: value }));
    handleChangeValidate(field, { ...data, [field]: value });
  };

  const handleBlurField = (field) => () => {
    handleBlur(field, data);
  };

  const toggleInArray = (field, value, max) => {
    setData((prev) => {
      const arr = new Set(prev[field] || []);
      if (arr.has(value)) {
        arr.delete(value);
      } else {
        if (max && arr.size >= max) return prev; // cap at max
        arr.add(value);
      }
      const newArr = Array.from(arr);
      // Validate after change
      handleChangeValidate(field, { ...prev, [field]: newArr });
      return { ...prev, [field]: newArr };
    });
  };

  const handleNext = () => {
    const valid = validation.validateStep(1, data);
    if (valid) next();
  };

  const specsCount = (data.specializations || []).length;
  const langsCount  = (data.languages || []).length;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Professional Experience &amp; Skills
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
          Help us understand your technical background and interview expertise.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Experience grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <FieldLabel required>Years of Professional Experience</FieldLabel>
            <ValidatedInput
              name="years_of_experience"
              type="number"
              min="1"
              max="50"
              step="0.5"
              value={data.years_of_experience}
              onChange={handleChange('years_of_experience')}
              onBlur={handleBlurField('years_of_experience')}
              status={getFieldStatus('years_of_experience')}
              placeholder="e.g. 5"
            />
            <FieldError msg={getDisplayError('years_of_experience')} />
          </div>

          <div>
            <FieldLabel required>Years of Interview Experience</FieldLabel>
            <ValidatedInput
              name="years_of_interview_experience"
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={data.years_of_interview_experience}
              onChange={handleChange('years_of_interview_experience')}
              onBlur={handleBlurField('years_of_interview_experience')}
              status={getFieldStatus('years_of_interview_experience')}
              placeholder="e.g. 2"
            />
            <FieldError msg={getDisplayError('years_of_interview_experience')} />
          </div>
        </div>

        {/* Specializations */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <FieldLabel required>Specializations / Focus Areas</FieldLabel>
            <span style={{ fontSize: '11px', color: specsCount >= 5 ? '#EF4444' : '#9CA3AF' }}>
              {specsCount} / 5 selected
            </span>
          </div>
          <ChipGroup
            name="specializations"
            options={SPECIALIZATION_OPTIONS}
            selected={data.specializations || []}
            onToggle={(item) => toggleInArray('specializations', item, 5)}
            maxSelect={5}
            status={getFieldStatus('specializations')}
          />
          <FieldError msg={getDisplayError('specializations')} />
        </div>

        {/* Education */}
        <div>
          <FieldLabel required>Education</FieldLabel>
          <ValidatedInput
            name="education"
            value={data.education}
            onChange={handleChange('education')}
            onBlur={handleBlurField('education')}
            status={getFieldStatus('education')}
            placeholder="e.g. B.Tech in Computer Science, XYZ University"
          />
          <FieldError msg={getDisplayError('education')} />
        </div>

        {/* Languages */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <FieldLabel required>Languages Spoken</FieldLabel>
            <span style={{ fontSize: '11px', color: langsCount >= 10 ? '#EF4444' : '#9CA3AF' }}>
              {langsCount} / 10 selected
            </span>
          </div>
          <ChipGroup
            name="languages"
            options={LANGUAGE_OPTIONS}
            selected={data.languages || []}
            onToggle={(item) => toggleInArray('languages', item, 10)}
            maxSelect={10}
            status={getFieldStatus('languages')}
          />
          <FieldError msg={getDisplayError('languages')} />
        </div>

        {/* Expertise Summary */}
        <div>
          <FieldLabel required>Interview Expertise Summary</FieldLabel>
          <ValidatedTextarea
            name="expertise_summary"
            value={data.expertise_summary}
            onChange={handleChange('expertise_summary')}
            onBlur={handleBlurField('expertise_summary')}
            status={getFieldStatus('expertise_summary')}
            rows={6}
            maxLen={2000}
            placeholder="Describe your interviewing experience, technical areas of expertise, your approach to evaluating candidates, and what makes you a great interviewer. Minimum 100 characters."
          />
          <FieldError msg={getDisplayError('expertise_summary')} />
          {!getDisplayError('expertise_summary') && (data.expertise_summary || '').length < 100 && (
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#6B7280' }}>
              At least 100 characters required
            </p>
          )}
        </div>

        {/* Motivation (optional) */}
        <div>
          <FieldLabel>
            Why do you want to be an interviewer?{' '}
            <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span>
          </FieldLabel>
          <ValidatedTextarea
            name="motivation"
            value={data.motivation}
            onChange={handleChange('motivation')}
            onBlur={handleBlurField('motivation')}
            status={getFieldStatus('motivation')}
            rows={3}
            maxLen={1000}
            placeholder="Share your motivation for joining the Intraview interviewer network..."
          />
          <FieldError msg={getDisplayError('motivation')} />
        </div>

      </div>

      {/* Actions */}
      <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={back}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1.5px solid #D1D5DB',
            background: '#FFFFFF',
            color: '#374151',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
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
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.target.style.background = '#047857')}
          onMouseLeave={(e) => (e.target.style.background = '#059669')}
        >
          Next: Documents →
        </button>
      </div>
    </div>
  );
}
