// src/interviewers/components/StepDocuments.jsx
import React, { useRef } from 'react';
import { Upload, FileCheck2, AlertCircle, X, File } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function humanFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Upload Zone component ────────────────────────────────────────────────────

function UploadZone({ label, required, hint, accept, file, existingUrl, onSelect, onClear, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onSelect(dropped);
  };

  const handleInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onSelect(f);
  };

  const existingFilename = existingUrl ? existingUrl.split('/').pop() : null;
  const hasFile = !!file || !!existingFilename;
  const borderColor = error ? '#EF4444' : dragging ? '#059669' : hasFile ? '#10B981' : '#D1D5DB';
  const bg = error ? '#FFF5F5' : dragging ? '#ECFDF5' : hasFile ? '#F0FDF4' : '#F9FAFB';

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: 700,
        color: '#374151',
        marginBottom: '8px',
        letterSpacing: '0.02em',
      }}>
        {label}
        {required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
      </label>

      {/* Drop zone */}
      <div
        data-field={label}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          borderRadius: '12px',
          border: `2px dashed ${borderColor}`,
          background: bg,
          padding: '20px 16px',
          cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          minHeight: '110px',
          textAlign: 'center',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {file ? (
          // New file selected
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
            <FileCheck2 size={28} color="#059669" />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#065F46' }}>{file.name}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>{humanFileSize(file.size)}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              style={{
                marginTop: '4px',
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                background: '#fff',
                color: '#6B7280',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <X size={11} /> Remove
            </button>
          </div>
        ) : existingFilename ? (
          // Existing file (re-apply)
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <File size={26} color="#3B82F6" />
            <p style={{ margin: 0, fontSize: '12px', color: '#1D4ED8', fontWeight: 500 }}>
              Current: {existingFilename}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>
              Click to upload a new file, or leave as-is
            </p>
          </div>
        ) : (
          // Empty state
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <Upload size={26} color={dragging ? '#059669' : '#9CA3AF'} />
            <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
              Drag &amp; drop or <span style={{ color: '#059669', fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>{hint}</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
          <AlertCircle size={13} color="#EF4444" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '12px', color: '#EF4444' }}>{error}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StepDocuments({ data, setData, next, back, validation }) {
  const { getDisplayError, getFieldStatus, validateStep } = validation;

  const handleFileSelect = (field) => (file) => {
    setData((prev) => ({ ...prev, [field]: file }));
    // Validate immediately
    validation.handleChangeValidate(field, { ...data, [field]: file });
  };

  const handleFileClear = (field) => () => {
    setData((prev) => ({ ...prev, [field]: null }));
    validation.handleChangeValidate(field, { ...data, [field]: null });
  };

  const handleNext = () => {
    const valid = validateStep(2, data);
    if (valid) next();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Document Upload
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
          Upload your resume and any supporting documents. Only PDF, DOC, DOCX, PNG and JPG files are accepted.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Resume */}
        <UploadZone
          label="Resume / CV"
          required={!data._existing_resume}
          hint="PDF, DOC, DOCX — max 10 MB"
          accept=".pdf,.doc,.docx"
          file={data.resume}
          existingUrl={data._existing_resume}
          onSelect={handleFileSelect('resume')}
          onClear={handleFileClear('resume')}
          error={getDisplayError('resume')}
        />

        {/* Certifications */}
        <UploadZone
          label="Certifications"
          hint="PDF, PNG, JPG, JPEG — max 5 MB per file (Optional)"
          accept=".pdf,.png,.jpg,.jpeg"
          file={data.certifications}
          existingUrl={data._existing_certifications}
          onSelect={handleFileSelect('certifications')}
          onClear={handleFileClear('certifications')}
          error={getDisplayError('certifications')}
        />

        {/* Additional Documents */}
        <UploadZone
          label="Additional Documents"
          hint="PDF, DOC, DOCX, PNG, JPG — max 10 MB (Optional)"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          file={data.additional_docs}
          existingUrl={data._existing_additional_docs}
          onSelect={handleFileSelect('additional_docs')}
          onClear={handleFileClear('additional_docs')}
          error={getDisplayError('additional_docs')}
        />

        {/* Security note */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          fontSize: '12px',
          color: '#1E40AF',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '16px' }}>🔒</span>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            All uploaded files are scanned and stored securely. Executable files (.exe, .bat, .sh, .js, .php) are automatically rejected.
          </p>
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
          Next: Review →
        </button>
      </div>
    </div>
  );
}