// // src/components/interviewer/SubmitEvaluation.jsx

// import React, { useState, useEffect, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { Star, X, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

// import { submitEvaluation } from '../interviewerFeedbackSlice';


// const SubmitEvaluation = ({ bookingId, bookingData, onClose, isOpen = true }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { submitting } = useSelector(state => state.feedback);
  
//   // Form state - exactly matches your CandidateEvaluation model
//   const [formData, setFormData] = useState({
//     technical_score: 0,
//     communication_score: 0,
//     problem_solving_score: 0,
//     confidence_score: 0,
//     hire_recommendation: '',
//     strengths: '',
//     areas_for_improvement: '',
//     actionable_suggestions: '',
//     additional_notes: '',
//     interview_difficulty: '',
//     topics_covered: []
//   });
  
//   const [errors, setErrors] = useState({});
//   const [overallScore, setOverallScore] = useState(0);
  
//   // Topics list
//   const topics = [
//     'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search',
//     'Linked List', 'Trees', 'Tries', 'Heap / Priority Queue', 'Backtracking',
//     'Graphs', 'Advanced Graphs', '1D DP', '2D DP', 'Greedy', 'Intervals',
//     'Math & Geometry', 'Bit Manipulation', 'System Design', 'Behavioral'
//   ];
  
//   // Calculate overall score
//   useEffect(() => {
//     const scores = Object.values(formData).filter((_, index) => 
//       ['technical_score', 'communication_score', 'problem_solving_score', 'confidence_score'].includes(Object.keys(formData)[index])
//     );
//     const avg = scores.reduce((a, b) => a + b, 0) / 4;
//     setOverallScore(isNaN(avg) ? 0 : avg.toFixed(1));
//   }, [formData]);
  
//   // Star rating component (exact design)
//   const StarRating = ({ value, onChange, label, name, error }) => (
//     <div className="space-y-1">
//       <label className="text-sm font-medium text-slate-700 block mb-1">{label}</label>
//       <div className="flex items-center space-x-1">
//         {[1, 2, 3, 4, 5].map(star => (
//           <Star
//             key={star}
//             className={`
//               w-7 h-7 cursor-pointer transition-all duration-200
//               ${star <= value 
//                 ? 'text-yellow-400 fill-yellow-400 shadow-sm' 
//                 : 'text-slate-300 hover:text-yellow-300 hover:fill-yellow-300'
//               }
//               ${error ? 'hover:text-red-400 hover:fill-red-400' : ''}
//             `}
//             onClick={() => onChange(star)}
//           />
//         ))}
//         <span className={`ml-3 text-sm font-semibold ${
//           value >= 4 ? 'text-green-600' :
//           value >= 3 ? 'text-blue-600' :
//           value >= 2 ? 'text-yellow-600' : 'text-red-600'
//         }`}>
//           {value || 0}/5
//         </span>
//       </div>
//       {error && (
//         <p className="mt-1 flex items-center text-xs text-red-600">
//           <AlertCircle className="w-3 h-3 mr-1" />
//           {error}
//         </p>
//       )}
//     </div>
//   );

//   useEffect(() => {
//     if (!bookingData) return; // Safety first
    
//     if (!bookingData.can_submit) {
//       toast.error(bookingData.reason || 'Cannot submit evaluation');
//       onClose?.();
//       return;
//     }
    
//     toast.success(`Ready to evaluate ${bookingData.booking?.candidate_name}`);
//   }, [bookingData, onClose]); // ✅ Stable deps - NO LOOP
  
//   // Handle changes
//   const handleChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   }, [errors]);
  
//   const handleTopicToggle = useCallback((topic) => {
//     setFormData(prev => ({
//       ...prev,
//       topics_covered: prev.topics_covered.includes(topic)
//         ? prev.topics_covered.filter(t => t !== topic)
//         : [...prev.topics_covered, topic]
//     }));
//   }, []);
  
//   // Comprehensive validation
//   const validateForm = useCallback(() => {
//     const newErrors = {};
    
//     // Scores (1-5 required)
//     ['technical_score', 'communication_score', 'problem_solving_score', 'confidence_score'].forEach(field => {
//       if (formData[field] === 0 || formData[field] < 1 || formData[field] > 5) {
//         newErrors[field] = 'Select a rating (1-5)';
//       }
//     });
    
//     // Required text fields
//     if (formData.strengths.trim().length < 20) newErrors.strengths = 'Minimum 20 characters required';
//     if (formData.areas_for_improvement.trim().length < 20) newErrors.areas_for_improvement = 'Minimum 20 characters required';
//     if (formData.actionable_suggestions.trim().length < 20) newErrors.actionable_suggestions = 'Minimum 20 characters required';
    
//     // Dropdowns
//     if (!formData.hire_recommendation) newErrors.hire_recommendation = 'Select recommendation';
//     if (!formData.interview_difficulty) newErrors.interview_difficulty = 'Select difficulty';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [formData]);
  
//   // Submit handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       toast.error('Please fix the errors above');
//       return;
//     }
    
//     dispatch(submitEvaluation({ 
//       bookingId, 
//       data: formData 
//     })).unwrap().then(() => {
//       if (onClose) {
//         onClose();
//       } else {
//         navigate('/interviewer/dashboard?evaluation-submitted=true');
//       }
//     }).catch((error) => {
//       // Error handled in Redux thunk
//     });
//   };
  
//   if (!isOpen) return null;
  
//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
//       <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-white/20">
        
//         {/* Header - Exact design match */}
//         <div className="px-8 pt-8 pb-6 border-b border-slate-200/50">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-3">
//               <button 
//                 onClick={() => onClose?.() || navigate(-1)}
//                 className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all group"
//               >
//                 <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
//               </button>
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
//                   Submit Candidate Evaluation
//                 </h1>
//                 <p className="text-slate-600 mt-1">Detailed feedback for your recent interview session</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => onClose?.() || navigate(-1)}
//               className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all"
//             >
//               <X className="w-6 h-6 text-slate-500 hover:text-slate-900" />
//             </button>
//           </div>
          
//           {/* Overall Score Preview - Exact design */}
//           <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border border-emerald-200/50 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
//                   <Star className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Overall Score Preview</p>
//                   <p className="text-3xl font-black text-slate-900">{overallScore}</p>
//                   <p className="text-sm text-slate-500">/ 5.0</p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
//                   overallScore >= 4 ? 'bg-emerald-100 text-emerald-800' :
//                   overallScore >= 3 ? 'bg-blue-100 text-blue-800' :
//                   overallScore >= 2 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
//                 }`}>
//                   {overallScore >= 4 ? 'Excellent' : 
//                    overallScore >= 3 ? 'Good' : 
//                    overallScore >= 2 ? 'Average' : 'Needs Improvement'}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Form Content */}
//         <div className="px-8 pb-8 max-h-[70vh] overflow-y-auto">
//           <form onSubmit={handleSubmit} className="space-y-8">
            
//             {/* 1. Performance Ratings */}
//             <section className="space-y-6">
//               <h2 className="text-xl font-bold text-slate-900 flex items-center">
//                 <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded mr-3" />
//                 Performance Ratings
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <StarRating
//                   label="Technical Skills"
//                   value={formData.technical_score}
//                   onChange={val => setFormData(prev => ({ ...prev, technical_score: val }))}
//                   name="technical_score"
//                   error={errors.technical_score}
//                 />
//                 <StarRating
//                   label="Communication & Clarity"
//                   value={formData.communication_score}
//                   onChange={val => setFormData(prev => ({ ...prev, communication_score: val }))}
//                   name="communication_score"
//                   error={errors.communication_score}
//                 />
//                 <StarRating
//                   label="Problem Solving Approach"
//                   value={formData.problem_solving_score}
//                   onChange={val => setFormData(prev => ({ ...prev, problem_solving_score: val }))}
//                   name="problem_solving_score"
//                   error={errors.problem_solving_score}
//                 />
//                 <StarRating
//                   label="Confidence & Composure"
//                   value={formData.confidence_score}
//                   onChange={val => setFormData(prev => ({ ...prev, confidence_score: val }))}
//                   name="confidence_score"
//                   error={errors.confidence_score}
//                 />
//               </div>
//             </section>
            
//             {/* 2. Hiring Recommendation */}
//             <section className="space-y-4">
//               <h2 className="text-xl font-bold text-slate-900 flex items-center">
//                 <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded mr-3" />
//                 Hiring Recommendation
//               </h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
//                 {[
//                   { value: 'STRONG_YES', label: 'Strong Yes', subtitle: 'Hire immediately', color: 'from-emerald-500 to-green-500' },
//                   { value: 'YES', label: 'Yes', subtitle: 'Minor concerns', color: 'from-blue-500 to-indigo-500' },
//                   { value: 'MAYBE', label: 'Maybe', subtitle: 'Needs improvement', color: 'from-amber-500 to-orange-500' },
//                   { value: 'NO', label: 'No', subtitle: 'Not ready yet', color: 'from-orange-500 to-red-500' },
//                   { value: 'STRONG_NO', label: 'Strong No', subtitle: 'Significant gaps', color: 'from-red-500 to-rose-500' }
//                 ].map(({ value, label, subtitle, color }) => (
//                   <label key={value} className="group cursor-pointer">
//                     <input
//                       type="radio"
//                       name="hire_recommendation"
//                       value={value}
//                       className="sr-only peer"
//                       checked={formData.hire_recommendation === value}
//                       onChange={handleChange}
//                     />
//                     <div className={`
//                       relative p-6 rounded-2xl border-2 transition-all duration-200 group-hover:scale-[1.02]
//                       peer-checked:border-transparent peer-checked:shadow-2xl peer-checked:scale-[1.02]
//                       peer-checked:ring-4 peer-checked:ring-offset-2 peer-checked:ring-blue-500/20
//                       ${formData.hire_recommendation === value 
//                         ? `bg-gradient-to-br ${color} shadow-2xl ring-4 ring-offset-2 ring-white/50` 
//                         : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-md'
//                       }
//                     `}>
//                       <div className="font-bold text-lg leading-tight">{label}</div>
//                       <div className="text-sm opacity-90">{subtitle}</div>
//                     </div>
//                   </label>
//                 ))}
//               </div>
//               {errors.hire_recommendation && (
//                 <div className="flex items-center text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">
//                   <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
//                   {errors.hire_recommendation}
//                 </div>
//               )}
//             </section>
            
//             {/* 3. Detailed Feedback */}
//             <section className="space-y-6">
//               <h2 className="text-xl font-bold text-slate-900 flex items-center">
//                 <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded mr-3" />
//                 Detailed Feedback
//               </h2>
//               {[
//                 { 
//                   name: 'strengths', 
//                   label: 'Strengths', 
//                   placeholder: 'What did the candidate excel at? Be specific about technical skills demonstrated, problem-solving approaches used, etc.',
//                   rows: 4 
//                 },
//                 { 
//                   name: 'areas_for_improvement', 
//                   label: 'Areas for Improvement', 
//                   placeholder: 'What needs work? Focus on specific skills, knowledge gaps, or behaviors observed.',
//                   rows: 4 
//                 },
//                 { 
//                   name: 'actionable_suggestions', 
//                   label: 'Actionable Next Steps', 
//                   placeholder: 'Concrete recommendations: practice problems, courses, books, projects, interview prep strategies.',
//                   rows: 5 
//                 }
//               ].map(({ name, label, placeholder, rows }) => (
//                 <div key={name}>
//                   <label className="block text-sm font-semibold text-slate-700 mb-3">
//                     {label} <span className="text-red-500">*</span>
//                   </label>
//                   <textarea
//                     name={name}
//                     rows={rows}
//                     value={formData[name]}
//                     onChange={handleChange}
//                     className={`
//                       w-full p-5 border-2 rounded-2xl resize-vertical font-medium
//                       focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
//                       placeholder-slate-400 transition-all min-h-[120px]
//                       ${errors[name] 
//                         ? 'border-red-300 bg-red-50/50 shadow-sm shadow-red-200 focus:ring-red-500/20 focus:border-red-500' 
//                         : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100'
//                       }
//                     `}
//                     placeholder={placeholder}
//                   />
//                   {errors[name] && (
//                     <div className="mt-2 flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
//                       <AlertCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
//                       <span className="text-sm text-red-700">{errors[name]}</span>
//                     </div>
//                   )}
//                   <div className="mt-2 text-xs text-slate-500">
//                     {formData[name].length}/500 characters
//                   </div>
//                 </div>
//               ))}
//             </section>
            
//             {/* 4. Interview Context */}
//             <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div>
//                 <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
//                   Interview Difficulty <span className="text-red-500 ml-1">*</span>
//                 </h3>
//                 <select
//                   name="interview_difficulty"
//                   value={formData.interview_difficulty}
//                   onChange={handleChange}
//                   className={`
//                     w-full p-5 pr-12 border-2 rounded-2xl bg-white shadow-sm
//                     focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
//                     ${errors.interview_difficulty 
//                       ? 'border-red-300 bg-red-50 shadow-red-200 focus:ring-red-500/20' 
//                       : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
//                     }
//                   `}
//                 >
//                   <option value="">Select difficulty level</option>
//                   <option value="EASY">🟢 Easy (Freshers / Junior roles)</option>
//                   <option value="MEDIUM">🟡 Medium (2-4 years experience)</option>
//                   <option value="HARD">🟠 Hard (Senior roles)</option>
//                   <option value="EXPERT">🔴 Expert (Staff / Lead roles)</option>
//                 </select>
//                 {errors.interview_difficulty && (
//                   <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
//                     <AlertCircle className="w-4 h-4 mr-2" />
//                     <span className="text-sm text-red-700">{errors.interview_difficulty}</span>
//                   </div>
//                 )}
//               </div>
              
//               <div>
//                 <h3 className="text-lg font-semibold text-slate-900 mb-4">Topics Covered</h3>
//                 <div className="max-h-40 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-y-auto hover:border-slate-300 transition-all">
//                   <div className="grid grid-cols-2 gap-2">
//                     {topics.slice(0, 16).map(topic => (
//                       <label key={topic} className="flex items-center p-2.5 hover:bg-white/50 rounded-xl cursor-pointer group transition-all">
//                         <input
//                           type="checkbox"
//                           checked={formData.topics_covered.includes(topic)}
//                           onChange={() => handleTopicToggle(topic)}
//                           className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 bg-white shadow-sm"
//                         />
//                         <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate">
//                           {topic}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                   {formData.topics_covered.length > 0 && (
//                     <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
//                       <p className="text-xs font-medium text-blue-800">
//                         {formData.topics_covered.length} topics selected
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </section>
            
//             {/* 5. Additional Notes */}
//             <section>
//               <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Notes (Optional)</h3>
//               <textarea
//                 name="additional_notes"
//                 rows={3}
//                 value={formData.additional_notes}
//                 onChange={handleChange}
//                 className="w-full p-5 border-2 rounded-2xl resize-vertical bg-slate-50 hover:bg-white hover:border-slate-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
//                 placeholder="Any other observations, behavioral notes, or context that might be helpful..."
//               />
//             </section>
//           </form>
//         </div>
        
//         {/* Footer - Exact design */}
//         <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/50 backdrop-blur-sm">
//           <div className="flex items-center justify-between">
//             <button
//               type="button"
//               onClick={() => onClose?.() || navigate(-1)}
//               disabled={submitting}
//               className="px-10 py-3.5 text-slate-700 font-semibold bg-white/80 hover:bg-white border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md rounded-2xl transition-all duration-200 flex items-center space-x-2"
//             >
//               <X className="w-4 h-4" />
//               <span>Cancel</span>
//             </button>
            
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={submitting || !validateForm()}
//               className="group px-12 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 min-w-[200px] justify-center"
//             >
//               {submitting ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   <span>Submitting</span>
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
//                   <span>Submit Evaluation</span>
//                 </>
//               )}
//             </button>
//           </div>
          
//           {/* Character count summary */}
//           <div className="mt-4 pt-4 border-t border-slate-200/50 text-xs text-slate-500 text-center">
//             <span>Total characters: {(formData.strengths.length + formData.areas_for_improvement.length + formData.actionable_suggestions.length)}</span>
//             {Object.keys(errors).length > 0 && (
//               <span className="ml-4 text-red-500 font-medium">
//                 {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} to fix
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubmitEvaluation;





















// src/features/feedback/interviewer/pages/SubmitEvaluation.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Star, X, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

import { submitEvaluation } from '../interviewerFeedbackSlice';

const SubmitEvaluation = ({ bookingId, bookingData, onClose, isOpen = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submitting } = useSelector(state => state.feedback);

  // Form state - matches CandidateEvaluation model
  const [formData, setFormData] = useState({
    technical_score: 0,
    communication_score: 0,
    problem_solving_score: 0,
    confidence_score: 0,
    hire_recommendation: '',
    strengths: '',
    areas_for_improvement: '',
    actionable_suggestions: '',
    additional_notes: '',
    interview_difficulty: '',
    topics_covered: []
  });

  const [errors, setErrors] = useState({});
  const [overallScore, setOverallScore] = useState(0);

  // Topics list
  const topics = [
    'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search',
    'Linked List', 'Trees', 'Tries', 'Heap / Priority Queue', 'Backtracking',
    'Graphs', 'Advanced Graphs', '1D DP', '2D DP', 'Greedy', 'Intervals',
    'Math & Geometry', 'Bit Manipulation', 'System Design', 'Behavioral'
  ];

  // Overall score (only depends on the 4 numeric fields)
  useEffect(() => {
    const scores = [
      formData.technical_score,
      formData.communication_score,
      formData.problem_solving_score,
      formData.confidence_score
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / 4;
    setOverallScore(isNaN(avg) ? 0 : avg.toFixed(1));
  }, [
    formData.technical_score,
    formData.communication_score,
    formData.problem_solving_score,
    formData.confidence_score
  ]);

  // Star rating component
  const StarRating = ({ value, onChange, label, name, error }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 block mb-1">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`
              w-7 h-7 cursor-pointer transition-all duration-200
              ${star <= value 
                ? 'text-yellow-400 fill-yellow-400 shadow-sm' 
                : 'text-slate-300 hover:text-yellow-300 hover:fill-yellow-300'
              }
              ${error ? 'hover:text-red-400 hover:fill-red-400' : ''}
            `}
            onClick={() => onChange(star)}
          />
        ))}
        <span
          className={`ml-3 text-sm font-semibold ${
            value >= 4
              ? 'text-green-600'
              : value >= 3
              ? 'text-blue-600'
              : value >= 2
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}
        >
          {value || 0}/5
        </span>
      </div>
      {error && (
        <p className="mt-1 flex items-center text-xs text-red-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );

  // Booking eligibility – run once on mount
  useEffect(() => {
    if (!bookingData) return;

    if (!bookingData.can_submit) {
      toast.error(bookingData.reason || 'Cannot submit evaluation');
      onClose?.();
      return;
    }

    const name = bookingData.booking?.candidate_name || 'candidate';
    toast.success(`Ready to evaluate ${name}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once – bookingData came from wrapper

  // Input change handlers
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  const handleTopicToggle = useCallback((topic) => {
    setFormData(prev => ({
      ...prev,
      topics_covered: prev.topics_covered.includes(topic)
        ? prev.topics_covered.filter(t => t !== topic)
        : [...prev.topics_covered, topic]
    }));
  }, []);

  // Pure validation (fills errors state, returns boolean)
  const runValidation = useCallback(() => {
    const newErrors = {};

    // Scores (1–5 required)
    ['technical_score', 'communication_score', 'problem_solving_score', 'confidence_score'].forEach(field => {
      if (formData[field] === 0 || formData[field] < 1 || formData[field] > 5) {
        newErrors[field] = 'Select a rating (1-5)';
      }
    });

    // Required text fields
    if (formData.strengths.trim().length < 20) {
      newErrors.strengths = 'Minimum 20 characters required';
    }
    if (formData.areas_for_improvement.trim().length < 20) {
      newErrors.areas_for_improvement = 'Minimum 20 characters required';
    }
    if (formData.actionable_suggestions.trim().length < 20) {
      newErrors.actionable_suggestions = 'Minimum 20 characters required';
    }

    // Dropdowns
    if (!formData.hire_recommendation) {
      newErrors.hire_recommendation = 'Select recommendation';
    }
    if (!formData.interview_difficulty) {
      newErrors.interview_difficulty = 'Select difficulty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    formData.technical_score,
    formData.communication_score,
    formData.problem_solving_score,
    formData.confidence_score,
    formData.hire_recommendation,
    formData.interview_difficulty,
    formData.strengths,
    formData.areas_for_improvement,
    formData.actionable_suggestions
  ]);

  // Lightweight validity flag for disabling the button (no state changes)
  const isFormBasicallyValid = useMemo(() => {
    return (
      formData.technical_score >= 1 &&
      formData.communication_score >= 1 &&
      formData.problem_solving_score >= 1 &&
      formData.confidence_score >= 1 &&
      formData.hire_recommendation &&
      formData.interview_difficulty &&
      formData.strengths.trim().length >= 20 &&
      formData.areas_for_improvement.trim().length >= 20 &&
      formData.actionable_suggestions.trim().length >= 20
    );
  }, [
    formData.technical_score,
    formData.communication_score,
    formData.problem_solving_score,
    formData.confidence_score,
    formData.hire_recommendation,
    formData.interview_difficulty,
    formData.strengths,
    formData.areas_for_improvement,
    formData.actionable_suggestions
  ]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!runValidation()) {
      toast.error('Please fix the errors above');
      return;
    }

    try {
      await dispatch(submitEvaluation({ bookingId, data: formData })).unwrap();
      toast.success('Evaluation submitted successfully!');
      if (onClose) {
        onClose();
      } else {
        navigate('/interviewer/dashboard?evaluation-submitted=true');
      }
    } catch {
      // Error toast already handled in thunk
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-white/20">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onClose?.() || navigate(-1)}
                className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
                  Submit Candidate Evaluation
                </h1>
                <p className="text-slate-600 mt-1">
                  Detailed feedback for your recent interview session
                </p>
              </div>
            </div>
            <button
              onClick={() => onClose?.() || navigate(-1)}
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all"
            >
              <X className="w-6 h-6 text-slate-500 hover:text-slate-900" />
            </button>
          </div>

          {/* Overall Score Preview */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border border-emerald-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                    Overall Score Preview
                  </p>
                  <p className="text-3xl font-black text-slate-900">{overallScore}</p>
                  <p className="text-sm text-slate-500">/ 5.0</p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    overallScore >= 4
                      ? 'bg-emerald-100 text-emerald-800'
                      : overallScore >= 3
                      ? 'bg-blue-100 text-blue-800'
                      : overallScore >= 2
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {overallScore >= 4
                    ? 'Excellent'
                    : overallScore >= 3
                    ? 'Good'
                    : overallScore >= 2
                    ? 'Average'
                    : 'Needs Improvement'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 pb-8 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Performance Ratings */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded mr-3" />
                Performance Ratings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StarRating
                  label="Technical Skills"
                  value={formData.technical_score}
                  onChange={val =>
                    setFormData(prev => ({ ...prev, technical_score: val }))
                  }
                  name="technical_score"
                  error={errors.technical_score}
                />
                <StarRating
                  label="Communication & Clarity"
                  value={formData.communication_score}
                  onChange={val =>
                    setFormData(prev => ({ ...prev, communication_score: val }))
                  }
                  name="communication_score"
                  error={errors.communication_score}
                />
                <StarRating
                  label="Problem Solving Approach"
                  value={formData.problem_solving_score}
                  onChange={val =>
                    setFormData(prev => ({ ...prev, problem_solving_score: val }))
                  }
                  name="problem_solving_score"
                  error={errors.problem_solving_score}
                />
                <StarRating
                  label="Confidence & Composure"
                  value={formData.confidence_score}
                  onChange={val =>
                    setFormData(prev => ({ ...prev, confidence_score: val }))
                  }
                  name="confidence_score"
                  error={errors.confidence_score}
                />
              </div>
            </section>

            {/* 2. Hiring Recommendation */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded mr-3" />
                Hiring Recommendation
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[
                  {
                    value: 'STRONG_YES',
                    label: 'Strong Yes',
                    subtitle: 'Hire immediately',
                    color: 'from-emerald-500 to-green-500'
                  },
                  {
                    value: 'YES',
                    label: 'Yes',
                    subtitle: 'Minor concerns',
                    color: 'from-blue-500 to-indigo-500'
                  },
                  {
                    value: 'MAYBE',
                    label: 'Maybe',
                    subtitle: 'Needs improvement',
                    color: 'from-amber-500 to-orange-500'
                  },
                  {
                    value: 'NO',
                    label: 'No',
                    subtitle: 'Not ready yet',
                    color: 'from-orange-500 to-red-500'
                  },
                  {
                    value: 'STRONG_NO',
                    label: 'Strong No',
                    subtitle: 'Significant gaps',
                    color: 'from-red-500 to-rose-500'
                  }
                ].map(({ value, label, subtitle, color }) => (
                  <label key={value} className="group cursor-pointer">
                    <input
                      type="radio"
                      name="hire_recommendation"
                      value={value}
                      className="sr-only peer"
                      checked={formData.hire_recommendation === value}
                      onChange={handleChange}
                    />
                    <div
                      className={`
                        relative p-6 rounded-2xl border-2 transition-all duration-200 group-hover:scale-[1.02]
                        peer-checked:border-transparent peer-checked:shadow-2xl peer-checked:scale-[1.02]
                        peer-checked:ring-4 peer-checked:ring-offset-2 peer-checked:ring-blue-500/20
                        ${
                          formData.hire_recommendation === value
                            ? `bg-gradient-to-br ${color} shadow-2xl ring-4 ring-offset-2 ring-white/50`
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="font-bold text-lg leading-tight">{label}</div>
                      <div className="text-sm opacity-90">{subtitle}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.hire_recommendation && (
                <div className="flex items-center text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {errors.hire_recommendation}
                </div>
              )}
            </section>

            {/* 3. Detailed Feedback */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded mr-3" />
                Detailed Feedback
              </h2>
              {[
                {
                  name: 'strengths',
                  label: 'Strengths',
                  placeholder:
                    'What did the candidate excel at? Be specific about technical skills demonstrated, problem-solving approaches used, etc.',
                  rows: 4
                },
                {
                  name: 'areas_for_improvement',
                  label: 'Areas for Improvement',
                  placeholder:
                    'What needs work? Focus on specific skills, knowledge gaps, or behaviors observed.',
                  rows: 4
                },
                {
                  name: 'actionable_suggestions',
                  label: 'Actionable Next Steps',
                  placeholder:
                    'Concrete recommendations: practice problems, courses, books, projects, interview prep strategies.',
                  rows: 5
                }
              ].map(({ name, label, placeholder, rows }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name={name}
                    rows={rows}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`
                      w-full p-5 border-2 rounded-2xl resize-vertical font-medium
                      focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                      placeholder-slate-400 transition-all min-h-[120px]
                      ${
                        errors[name]
                          ? 'border-red-300 bg-red-50/50 shadow-sm shadow-red-200 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100'
                      }
                    `}
                    placeholder={placeholder}
                  />
                  {errors[name] && (
                    <div className="mt-2 flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-700">{errors[name]}</span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-500">
                    {formData[name].length}/500 characters
                  </div>
                </div>
              ))}
            </section>

            {/* 4. Interview Context */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  Interview Difficulty <span className="text-red-500 ml-1">*</span>
                </h3>
                <select
                  name="interview_difficulty"
                  value={formData.interview_difficulty}
                  onChange={handleChange}
                  className={`
                    w-full p-5 pr-12 border-2 rounded-2xl bg-white shadow-sm
                    focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                    ${
                      errors.interview_difficulty
                        ? 'border-red-300 bg-red-50 shadow-red-200 focus:ring-red-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }
                  `}
                >
                  <option value="">Select difficulty level</option>
                  <option value="EASY">🟢 Easy (Freshers / Junior roles)</option>
                  <option value="MEDIUM">🟡 Medium (2-4 years experience)</option>
                  <option value="HARD">🟠 Hard (Senior roles)</option>
                  <option value="EXPERT">🔴 Expert (Staff / Lead roles)</option>
                </select>
                {errors.interview_difficulty && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm text-red-700">
                      {errors.interview_difficulty}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Topics Covered</h3>
                <div className="max-h-40 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-y-auto hover:border-slate-300 transition-all">
                  <div className="grid grid-cols-2 gap-2">
                    {topics.slice(0, 16).map(topic => (
                      <label
                        key={topic}
                        className="flex items-center p-2.5 hover:bg-white/50 rounded-xl cursor-pointer group transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={formData.topics_covered.includes(topic)}
                          onChange={() => handleTopicToggle(topic)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 bg-white shadow-sm"
                        />
                        <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate">
                          {topic}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.topics_covered.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-xs font-medium text-blue-800">
                        {formData.topics_covered.length} topics selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 5. Additional Notes */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Additional Notes (Optional)
              </h3>
              <textarea
                name="additional_notes"
                rows={3}
                value={formData.additional_notes}
                onChange={handleChange}
                className="w-full p-5 border-2 rounded-2xl resize-vertical bg-slate-50 hover:bg-white hover:border-slate-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                placeholder="Any other observations, behavioral notes, or context that might be helpful..."
              />
            </section>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onClose?.() || navigate(-1)}
              disabled={submitting}
              className="px-10 py-3.5 text-slate-700 font-semibold bg-white/80 hover:bg-white border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md rounded-2xl transition-all duration-200 flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting || !isFormBasicallyValid}
              className="group px-12 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 min-w-[200px] justify-center"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Submit Evaluation</span>
                </>
              )}
            </button>
          </div>

          {/* Character count summary */}
          <div className="mt-4 pt-4 border-t border-slate-200/50 text-xs text-slate-500 text-center">
            <span>
              Total characters:{' '}
              {formData.strengths.length +
                formData.areas_for_improvement.length +
                formData.actionable_suggestions.length}
            </span>
            {Object.keys(errors).length > 0 && (
              <span className="ml-4 text-red-500 font-medium">
                {Object.keys(errors).length} error
                {Object.keys(errors).length > 1 ? 's' : ''} to fix
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitEvaluation;
