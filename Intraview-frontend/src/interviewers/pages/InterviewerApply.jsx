// src/features/interviewer/pages/InterviewerApply.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitInterviewerApplication,
} from "../interviewerSlice";
import StepPersonal from "../components/StepPersonal";
import StepExperience from "../components/StepExperience";
import StepDocuments from "../components/StepDocuments";
import StepReview from "../components/StepReview";
import ApplicationSubmitted from "../components/ApplicationSubmitted";

const steps = [
  { id: 0, label: "Personal Info", component: StepPersonal },
  { id: 1, label: "Experience", component: StepExperience },
  { id: 2, label: "Documents", component: StepDocuments },
  { id: 3, label: "Review", component: StepReview },
];

export default function InterviewerApply() {
  const dispatch = useDispatch();
  const { loading, status } = useSelector((s) => s.interviewer);

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    phone_number: "",
    location: "",
    timezone: "",
    linkedin_url: "",
    github_url: "",
    years_of_experience: "",
    years_of_interview_experience: "",
    specializations: [],
    education: "",
    languages: [],
    expertise_summary: "",
    motivation: "",
    resume: null,
    certifications: null,
    additional_docs: null,
  });

  const CurrentStep = steps[activeStep].component;

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => fd.append(key, v));
      } else if (value !== null && value !== "") {
        fd.append(key, value);
      }
    });

    await dispatch(submitInterviewerApplication(fd));
  };

  if (status === "PENDING") {
    return <ApplicationSubmitted />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-2">
          Apply to Become an Interviewer
        </h1>
        <p className="text-slate-500 mb-8">
          Fill out your details and submit credentials for review. We&apos;ll get back to you within 5–7 business days.
        </p>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium ${
                    index <= activeStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    index === activeStep
                      ? "text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <CurrentStep
              data={formData}
              setData={setFormData}
              next={handleNext}
              back={handleBack}
              submit={handleSubmit}
              isLast={activeStep === steps.length - 1}
              loading={loading}
            />
          </div>

          {/* Right sidebar: help + FAQs + tips */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Need Help?
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                We&apos;re here to assist you through the application process.
              </p>
              <div className="space-y-2 text-xs">
                <button className="w-full border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span>Email Support</span>
                  <span className="text-slate-400">support@intraview.app</span>
                </button>
                <button className="w-full border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span>Live Chat</span>
                  <span className="text-slate-400">Coming soon</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Application Tips
              </h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Be thorough and accurate with all information.</li>
                <li>• Highlight your unique interviewing experience.</li>
                <li>• Upload a professional, up-to-date resume.</li>
                <li>• Include relevant certifications if available.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
