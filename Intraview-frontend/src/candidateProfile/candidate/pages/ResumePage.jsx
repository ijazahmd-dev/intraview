// src/pages/candidate/ResumePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import ProfileSidebar from '../components/ProfileSidebar';
import useProfileData from '../hooks/useProfileData';
import { validateFile } from '../../candidateProfileApi';

// ============================================
// MODALS
// ============================================

const DeleteConfirmModal = ({ open, onConfirm, onCancel, isDeleting }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Delete resume?</h2>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            This will permanently delete your resume. You can upload a new one anytime.
          </p>
          <p className="text-xs text-slate-500">
            This action cannot be undone.
          </p>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// UPLOAD SECTION
// ============================================

const UploadSection = ({
  onUpload,
  isUploading,
  hasResume,
  onReplace,
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const processFile = (file) => {
    const validation = validateFile(file, 'resume');
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    onUpload(file);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          {hasResume ? 'Update resume' : 'Upload resume'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          PDF format, maximum 5MB. Interviewers will see this before your session.
        </p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          <Upload className={`w-8 h-8 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">
              Drop your resume here or click to browse
            </p>
            <p className="text-xs text-slate-500">
              PDF files only (max 5MB)
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-3">
        💡 Tip: Make sure your resume is up-to-date with your current skills and experience.
      </p>
    </div>
  );
};

// ============================================
// RESUME PREVIEW SECTION
// ============================================

const ResumePreviewSection = ({
  resumeUrl,
  isLoading,
  onDelete,
  isDeletingResume,
  shareToggle,
  onShareToggle,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandPreview, setExpandPreview] = useState(false);

  if (!resumeUrl) {
    return (
      <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-600 font-medium">No resume uploaded yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Upload your resume using the upload section above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your resume</h3>
            <p className="text-xs text-slate-500 mt-1">
              Preview, download, or manage your resume.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Uploaded</span>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <button
            onClick={() => setExpandPreview(!expandPreview)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Eye className="w-4 h-4" />
              Preview Resume
            </span>
            <span className="text-xs text-slate-500">PDF</span>
          </button>

          {expandPreview && (
            <div className="mt-3 rounded-2xl border border-slate-200 overflow-hidden bg-slate-900">
              <iframe
                src={resumeUrl}
                title="Resume Preview"
                className="w-full h-96 sm:h-[600px]"
              />
            </div>
          )}
        </div>

        {/* Download */}
        <div className="mb-4">
          <a
            href={resumeUrl}
            download="resume.pdf"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Download Resume
          </a>
        </div>

        {/* Share Toggle */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <input
            type="checkbox"
            checked={shareToggle}
            onChange={(e) => onShareToggle(e.target.checked)}
            id="share-resume"
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
          />
          <label
            htmlFor="share-resume"
            className="flex-1 text-sm font-medium text-slate-900 cursor-pointer"
          >
            <div>Allow interviewers to see resume</div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interviewers will have access to your resume before the interview.
            </p>
          </label>
        </div>

        {/* Delete */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete Resume
        </button>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onConfirm={() => {
          onDelete();
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeletingResume}
      />
    </>
  );
};

// ============================================
// MAIN PAGE
// ============================================

const ResumePage = () => {
  const navigate = useNavigate();
  const {
    user,
    resume,
    isUploadingResume,
    isDeletingResume,
    resumeError,
    resumeSuccess,
    handleUploadResume,
    handleDeleteResume,
  } = useProfileData();

  const [shareToggle, setShareToggle] = useState(false);

  useEffect(() => {
    if (resumeError) {
      toast.error(
        typeof resumeError === 'string'
          ? resumeError
          : 'Failed to manage resume'
      );
    }
  }, [resumeError]);

  useEffect(() => {
    if (resumeSuccess) {
      toast.success(resumeSuccess);
    }
  }, [resumeSuccess]);

  const handleUpload = async (file) => {
    await handleUploadResume(file);
  };

  const handleDelete = async () => {
    await handleDeleteResume();
  };

  const handleLogout = () => {
    navigate('/auth/logout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <ProfileSidebar onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-indigo-100 mb-1">
                  Document Management
                </p>
                <h1 className="text-2xl sm:text-3xl font-black">Resume & Documents</h1>
                <p className="text-sm text-indigo-100 mt-2 max-w-md">
                  Upload and manage your resume. This helps interviewers prepare for your session.
                </p>
              </div>
              <FileText className="w-16 h-16 text-indigo-300 opacity-50" />
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <UploadSection
                onUpload={handleUpload}
                isUploading={isUploadingResume}
                hasResume={resume.hasResume}
                onReplace={() => {}}
              />

              <ResumePreviewSection
                resumeUrl={resume.resumeUrl}
                isLoading={false}
                onDelete={handleDelete}
                isDeletingResume={isDeletingResume}
                shareToggle={shareToggle}
                onShareToggle={setShareToggle}
              />
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 shadow-sm sticky top-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Resume tips</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>
                    ✅ Keep it concise (1-2 pages)
                  </p>
                  <p>
                    ✅ Highlight key achievements
                  </p>
                  <p>
                    ✅ Include relevant skills
                  </p>
                  <p>
                    ✅ Add contact information
                  </p>
                  <p>
                    ✅ Use clear formatting
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-blue-900 mb-1">
                      Pro tip
                    </p>
                    <p className="text-blue-700">
                      A well-formatted resume helps interviewers quickly understand your background and prepare better questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResumePage;
