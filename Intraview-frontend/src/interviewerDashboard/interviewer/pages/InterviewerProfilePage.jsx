// import { useEffect, useState } from "react";
// import { fetchProfile, updateProfile, patchProfile } from "../../interviewerDashboardApi";

// const normalizeArray = (val) => {
//   if (Array.isArray(val)) return val;
//   if (typeof val === "string" && val.trim().startsWith("[")) {
//     try {
//       return JSON.parse(val);
//     } catch {
//       return [];
//     }
//   }
//   if (val == null || val === "") return [];
//   return Array.isArray(val) ? val : [val];
// };



// export default function InterviewerProfilePage() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       try {
//         const { data } = await fetchProfile();
//         if (!mounted) return;
//         setProfile(data);
//       } catch (err) {
//         setError("Failed to load profile.");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleChange = (field, value) => {
//     setProfile((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const payload = {
//         ...profile,
//         // ensure arrays
//         specializations: normalizeArray(profile.specializations),
//         languages: normalizeArray(profile.languages),
//         education: normalizeArray(profile.education),
//         certifications: normalizeArray(profile.certifications),
//         industries: normalizeArray(profile.industries),
//         // ensure number
//         years_of_experience: Number(profile.years_of_experience || 0),
//       };

//       // very important: do NOT send profile_picture when not uploading a file
//       delete payload.profile_picture;

//       await updateProfile(payload);
//     } catch (err) {
//       console.log("update error this is the error.", err.response?.data);
//       setError("Failed to update profile.");
//     } finally {
//       setSaving(false);
//     }
//   };


//   const toggleSwitch = async (field) => {
//     const newValue = !profile[field];
//     setProfile((prev) => ({ ...prev, [field]: newValue }));
//     try {
//       await patchProfile({ [field]: newValue });
//     } catch {
//       // revert on error
//       setProfile((prev) => ({ ...prev, [field]: !newValue }));
//     }
//   };

//   if (loading || !profile) {
//     return (
//       <div className="flex items-center justify-center h-40">
//         <p className="text-slate-500 text-sm">Loading profile...</p>
//       </div>
//     );
//   }

//   const initials = profile.display_name
//     ? profile.display_name
//         .split(" ")
//         .map((p) => p[0])
//         .join("")
//         .toUpperCase()
//     : "IN";

//   return (
//     <div className="space-y-6">
//       {/* Header card */}
//       <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
//             {initials}
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-slate-800">
//               {profile.display_name}
//             </p>
//             <p className="text-xs text-slate-500">
//               {profile.headline || "Professional Interviewer"}
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-4 text-xs">
//           <div className="flex items-center gap-2">
//             <span className="text-slate-500">Profile visibility</span>
//             <button
//               type="button"
//               onClick={() => toggleSwitch("is_profile_public")}
//               className={[
//                 "w-10 h-5 rounded-full flex items-center px-0.5 transition",
//                 profile.is_profile_public
//                   ? "bg-emerald-500 justify-end"
//                   : "bg-slate-200 justify-start",
//               ].join(" ")}
//             >
//               <span className="w-4 h-4 rounded-full bg-white shadow" />
//             </button>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-slate-500">Accept bookings</span>
//             <button
//               type="button"
//               onClick={() => toggleSwitch("is_accepting_bookings")}
//               className={[
//                 "w-10 h-5 rounded-full flex items-center px-0.5 transition",
//                 profile.is_accepting_bookings
//                   ? "bg-emerald-500 justify-end"
//                   : "bg-slate-200 justify-start",
//               ].join(" ")}
//             >
//               <span className="w-4 h-4 rounded-full bg-white shadow" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main sections */}
//       <form
//         onSubmit={handleSave}
//         className="grid lg:grid-cols-3 gap-6 items-start"
//       >
//         {/* Left: bio and description */}
//         <div className="lg:col-span-2 space-y-4">
//           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
//             <p className="text-sm font-semibold text-slate-800 mb-3">
//               Professional Summary
//             </p>
//             <div className="space-y-3 text-xs">
//               <div>
//                 <label className="block text-slate-600 mb-1">Headline</label>
//                 <input
//                   type="text"
//                   value={profile.headline || ""}
//                   onChange={(e) => handleChange("headline", e.target.value)}
//                   className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-slate-600 mb-1">
//                   Professional Bio
//                 </label>
//                 <textarea
//                   rows={4}
//                   value={profile.bio || ""}
//                   onChange={(e) => handleChange("bio", e.target.value)}
//                   className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-slate-600 mb-1">
//                     Years of Experience
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={profile.years_of_experience || ""}
//                     onChange={(e) =>
//                       handleChange("years_of_experience", e.target.value)
//                     }
//                     className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-slate-600 mb-1">
//                     Location
//                   </label>
//                   <input
//                     type="text"
//                     value={profile.location || ""}
//                     onChange={(e) => handleChange("location", e.target.value)}
//                     className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Specializations, industries, languages */}
//           <TagSection
//             title="Specializations"
//             field="specializations"
//             profile={profile}
//             onChange={handleChange}
//           />
//           <TagSection
//             title="Industries Served"
//             field="industries"
//             profile={profile}
//             onChange={handleChange}
//           />
//           <TagSection
//             title="Languages"
//             field="languages"
//             profile={profile}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Right column: education, certifications, contact */}
//         <div className="space-y-4 text-xs">
//           <TagSection
//             title="Education"
//             field="education"
//             profile={profile}
//             onChange={handleChange}
//           />
//           <TagSection
//             title="Certifications"
//             field="certifications"
//             profile={profile}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Save button full width under grid */}
//         <div className="lg:col-span-3 flex justify-end">
//           {error && (
//             <p className="text-xs text-red-600 mr-4 self-center">{error}</p>
//           )}
//           <button
//             type="submit"
//             disabled={saving}
//             className="px-6 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
//           >
//             {saving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// function TagSection({ title, field, profile, onChange }) {
//   const values = profile[field] || [];

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const value = e.target.value.trim();
//       if (!value) return;
//       onChange(field, [...values, value]);
//       e.target.value = "";
//     }
//   };

//   const removeTag = (tag) => {
//     onChange(
//       field,
//       values.filter((t) => t !== tag)
//     );
//   };

//   return (
//     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
//       <p className="text-sm font-semibold text-slate-800 mb-2">{title}</p>
//       <div className="flex flex-wrap gap-2 mb-2">
//         {values.length === 0 && (
//           <p className="text-[11px] text-slate-400">No items yet.</p>
//         )}
//         {values.map((tag) => (
//           <span
//             key={tag}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
//           >
//             {tag}
//             <button
//               type="button"
//               onClick={() => removeTag(tag)}
//               className="text-slate-400 hover:text-slate-600"
//             >
//               ×
//             </button>
//           </span>
//         ))}
//       </div>
//       <input
//         type="text"
//         onKeyDown={handleKeyDown}
//         className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//         placeholder="Type and press Enter to add"
//       />
//     </div>
//   );
// }


























// import { useEffect, useState, useCallback, useRef } from "react";
// import { fetchProfile, updateProfile, patchProfile } from "../../interviewerDashboardApi";
// import { Upload, Image, User, X, Edit3, Trash2 } from "lucide-react";

// const normalizeArray = (val) => {
//   if (Array.isArray(val)) return val;
//   if (typeof val === "string" && val.trim().startsWith("[")) {
//     try {
//       return JSON.parse(val);
//     } catch {
//       return [];
//     }
//   }
//   if (val == null || val === "") return [];
//   return Array.isArray(val) ? val : [val];
// };

// export default function InterviewerProfilePage() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [profileImageFile, setProfileImageFile] = useState(null);
//   const [profileImagePreview, setProfileImagePreview] = useState(null);
//   const [removingImage, setRemovingImage] = useState(false);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       try {
//         const { data } = await fetchProfile();
//         if (!mounted) return;
//         setProfile(data);
//         if (data.profile_picture) {
//           setProfileImagePreview(data.profile_picture);
//         }
//       } catch (err) {
//         setError("Failed to load profile.");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleChange = useCallback((field, value) => {
//     setProfile((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const handleProfileImageChange = useCallback((e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
    
//     // Validate file
//     if (!file.type.startsWith('image/')) {
//       setError('Please select a valid image file.');
//       return;
//     }
    
//     if (file.size > 5 * 1024 * 1024) { // 5MB limit
//       setError('Image size must be less than 5MB.');
//       return;
//     }
    
//     setProfileImageFile(file);
//     const previewUrl = URL.createObjectURL(file);
//     setProfileImagePreview(previewUrl);
//     setError(null);
//   }, []);

//   const handleRemoveProfileImage = useCallback(async () => {
//     if (!confirm('Are you sure you want to remove your profile picture?')) return;
    
//     setRemovingImage(true);
//     try {
//       setProfileImageFile(null);
//       setProfileImagePreview(null);
//       setProfile((prev) => ({ ...prev, profile_picture: null }));
      
//       // Send patch to clear image
//       await patchProfile({ profile_picture: null });
//     } catch (err) {
//       setError("Failed to remove profile picture.");
//       // Revert preview on error
//       setProfileImagePreview(profile?.profile_picture);
//     } finally {
//       setRemovingImage(false);
//     }
//   }, [profile]);

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const formData = new FormData();

//       const payload = {
//         ...profile,
//         specializations: normalizeArray(profile.specializations),
//         languages: normalizeArray(profile.languages),
//         education: normalizeArray(profile.education),
//         certifications: normalizeArray(profile.certifications),
//         industries: normalizeArray(profile.industries),
//         years_of_experience: Number(profile.years_of_experience || 0),
//       };

//       // Append all scalar/JSON fields
//       Object.entries(payload).forEach(([key, value]) => {
//         if (key === 'profile_picture') return; // Skip, handled separately
//         if (Array.isArray(value)) {
//           formData.append(key, JSON.stringify(value));
//         } else if (value !== undefined && value !== null) {
//           formData.append(key, value);
//         }
//       });

//       // Append profile picture only if new file selected
//       if (profileImageFile) {
//         formData.append("profile_picture", profileImageFile);
//       } else if (profile.profile_picture === null) {
//         formData.append("profile_picture", ""); // Clear existing image
//       }

//       await updateProfile(formData);
//     } catch (err) {
//       console.error("Update error:", err.response?.data);
//       setError(err.response?.data?.detail || "Failed to update profile.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleSwitch = async (field) => {
//     const newValue = !profile[field];
//     setProfile((prev) => ({ ...prev, [field]: newValue }));
//     try {
//       await patchProfile({ [field]: newValue });
//     } catch (err) {
//       setError(`Failed to update ${field}.`);
//       setProfile((prev) => ({ ...prev, [field]: !newValue }));
//     }
//   };

//   if (loading || !profile) {
//     return (
//       <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl p-12">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-spin">
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//           </div>
//           <p className="text-slate-600 font-medium">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const initials = profile.display_name
//     ? profile.display_name
//         .split(" ")
//         .map((p) => p[0])
//         .join("")
//         .toUpperCase()
//         .slice(0, 2)
//     : "IN";

//   return (
//     <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Profile Header */}
//       <div className="bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border border-slate-100/50 rounded-3xl shadow-xl p-8 lg:p-12">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
//             {/* Profile Image Section */}
//             <div className="flex flex-col items-center lg:items-start lg:flex-1 mb-8 lg:mb-0">
//               <div className="relative group">
//                 <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 bg-gradient-to-br from-slate-100 to-slate-200">
//                   {profileImagePreview ? (
//                     <img
//                       src={profileImagePreview}
//                       alt={profile.display_name}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                       onLoad={() => {
//                         if (profileImageFile) URL.revokeObjectURL(profileImagePreview);
//                       }}
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-700 font-bold text-2xl lg:text-3xl">
//                       {initials}
//                     </div>
//                   )}
//                 </div>

//                 {/* Upload/Remove Controls */}
//                 <div className="absolute -inset-4 bg-black/20 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
//                   <label className="flex items-center gap-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl">
//                     <Upload size={16} className="text-emerald-600" />
//                     <span className="text-xs font-semibold text-slate-800">Change</span>
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={handleProfileImageChange}
//                     />
//                   </label>
                  
//                   {(profileImagePreview || profile.profile_picture) && (
//                     <button
//                       onClick={handleRemoveProfileImage}
//                       disabled={removingImage}
//                       className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50"
//                     >
//                       <Trash2 size={16} className="text-red-600" />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <p className="mt-4 text-xs text-slate-500 text-center lg:text-left">
//                 {profileImageFile ? 'Preview' : profile.profile_picture ? 'Current image' : 'Upload a profile picture (JPG, PNG, max 5MB)'}
//               </p>
//             </div>

//             {/* Profile Info & Toggles */}
//             <div className="flex-1 space-y-6 lg:pt-4">
//               <div className="space-y-3">
//                 <h1 className="text-3xl lg:text-4xl font-light bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 bg-clip-text text-transparent">
//                   {profile.display_name}
//                 </h1>
//                 <input
//                   type="text"
//                   value={profile.headline || ""}
//                   onChange={(e) => handleChange("headline", e.target.value)}
//                   placeholder="Add a professional headline..."
//                   className="w-full px-5 py-3 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl text-lg font-light text-slate-800 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm hover:shadow-md"
//                 />
//               </div>

//               {/* Toggle Switches */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
//                 <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-100/50">
//                   <div>
//                     <p className="font-semibold text-slate-800 text-sm">Profile Visibility</p>
//                     <p className="text-xs text-slate-600">Make your profile discoverable</p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => toggleSwitch("is_profile_public")}
//                     className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${
//                       profile.is_profile_public
//                         ? 'bg-emerald-500 shadow-emerald-300/50'
//                         : 'bg-slate-200 shadow-slate-300/50'
//                     }`}
//                   >
//                     <span
//                       className={`absolute inset-0.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 w-5 h-5 flex items-center justify-center text-xs font-bold ${
//                         profile.is_profile_public ? 'translate-x-6 text-emerald-600' : 'translate-x-0.5 text-slate-600'
//                       }`}
//                     >
//                       {profile.is_profile_public ? 'ON' : 'OFF'}
//                     </span>
//                   </button>
//                 </div>
                
//                 <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-100/50">
//                   <div>
//                     <p className="font-semibold text-slate-800 text-sm">Accept Bookings</p>
//                     <p className="text-xs text-slate-600">Allow new interview requests</p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => toggleSwitch("is_accepting_bookings")}
//                     className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${
//                       profile.is_accepting_bookings
//                         ? 'bg-emerald-500 shadow-emerald-300/50'
//                         : 'bg-slate-200 shadow-slate-300/50'
//                     }`}
//                   >
//                     <span
//                       className={`absolute inset-0.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 w-5 h-5 flex items-center justify-center text-xs font-bold ${
//                         profile.is_accepting_bookings ? 'translate-x-6 text-emerald-600' : 'translate-x-0.5 text-slate-600'
//                       }`}
//                     >
//                       {profile.is_accepting_bookings ? 'ON' : 'OFF'}
//                     </span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Form */}
//       <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-8">
//         {/* Left Column: Bio & Core Info */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Bio Section */}
//           <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100/50 p-8 hover:shadow-xl transition-all duration-300">
//             <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
//               <User className="w-6 h-6 text-amber-500" />
//               Professional Summary
//             </h3>
//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
//                 <textarea
//                   rows={5}
//                   value={profile.bio || ""}
//                   onChange={(e) => handleChange("bio", e.target.value)}
//                   placeholder="Tell us about your experience as an interviewer..."
//                   className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-vertical shadow-sm hover:shadow-md"
//                 />
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="50"
//                     value={profile.years_of_experience || ""}
//                     onChange={(e) => handleChange("years_of_experience", e.target.value)}
//                     className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm hover:shadow-md"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
//                   <input
//                     type="text"
//                     value={profile.location || ""}
//                     onChange={(e) => handleChange("location", e.target.value)}
//                     placeholder="City, Country"
//                     className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm hover:shadow-md"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Tag Sections */}
//           <TagSection
//             title="Specializations"
//             icon="🎯"
//             field="specializations"
//             profile={profile}
//             onChange={handleChange}
//           />
//           <TagSection
//             title="Industries Served"
//             icon="🏢"
//             field="industries"
//             profile={profile}
//             onChange={handleChange}
//           />
//           <TagSection
//             title="Languages"
//             icon="🌐"
//             field="languages"
//             profile={profile}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Right Column: Education & Certifications */}
//         <div className="space-y-6">
//           <TagSection
//             title="Education"
//             icon="🎓"
//             field="education"
//             profile={profile}
//             onChange={handleChange}
//           />
//           <TagSection
//             title="Certifications"
//             icon="🏆"
//             field="certifications"
//             profile={profile}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Save Button */}
//         <div className="lg:col-span-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100/50 shadow-inner">
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
//               <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//               <p className="text-sm text-red-800 font-medium">{error}</p>
//             </div>
//           )}
//           <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
//             <div className="text-sm text-slate-600">
//               Last updated: {new Date(profile.updated_at).toLocaleDateString()}
//             </div>
//             <button
//               type="submit"
//               disabled={saving}
//               className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 text-lg"
//             >
//               {saving ? (
//                 <>
//                   <svg className="animate-spin -ml-1 w-5 h-5" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

// function TagSection({ title, icon, field, profile, onChange }) {
//   const values = profile[field] || [];

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       const value = e.target.value.trim();
//       if (!value || values.includes(value)) return;
//       onChange(field, [...values, value]);
//       e.target.value = "";
//     }
//   };

//   const removeTag = (tagToRemove) => {
//     onChange(field, values.filter((tag) => tag !== tagToRemove));
//   };

//   return (
//     <div className="group bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-3xl shadow-lg border border-slate-100/50 p-6 hover:shadow-xl hover:border-slate-200/50">
//       <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100/50">
//         <div className="w-10 h-10 bg-gradient-to-br rounded-2xl flex items-center justify-center text-lg font-bold shadow-md">
//           {icon}
//         </div>
//         <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
//       </div>
      
//       <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto p-2 bg-slate-50/50 rounded-xl">
//         {values.length === 0 ? (
//           <span className="text-xs text-slate-400 px-3 py-2">No {title.toLowerCase()} added yet</span>
//         ) : (
//           values.map((tag) => (
//             <span
//               key={tag}
//               className="inline-flex items-center gap-1.5 bg-white/70 hover:bg-white backdrop-blur-sm border border-slate-200/60 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-800 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] hover:border-slate-300"
//             >
//               {tag}
//               <button
//                 type="button"
//                 onClick={() => removeTag(tag)}
//                 className="text-slate-400 hover:text-slate-600 hover:scale-110 transition-all ml-1"
//                 title="Remove"
//               >
//                 <X size={14} />
//               </button>
//             </span>
//           ))
//         )}
//       </div>
      
//       <input
//         type="text"
//         onKeyDown={handleKeyDown}
//         placeholder={`Add ${title.toLowerCase()} (press Enter)`}
//         className="w-full px-4 py-3 bg-gradient-to-r from-slate-50/70 to-white/70 border-2 border-dashed border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 rounded-2xl text-sm placeholder-slate-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none"
//       />
//     </div>
//   );
// }

































import { useEffect, useState, useCallback, useRef } from "react";
import { 
  fetchProfile, 
  updateProfile, 
  uploadProfilePicture, 
  deleteProfilePicture,
  patchProfile 
} from "../../interviewerDashboardApi";

const normalizeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  if (val == null || val === "") return [];
  return Array.isArray(val) ? val : [val];
};

export default function InterviewerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await fetchProfile();
        if (!mounted) return;
        setProfile(data);
        console.log("the profile pic is this.......",data.profile_picture);
        if (data.profile_picture) {
          setImagePreview(data.profile_picture  || null);
        }
        console.log("the profile image previwe is .......",imagePreview);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);



  const handleChange = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setUploadingImage(true);
    setError(null);
    
    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Upload to backend
      await uploadProfilePicture(file);
      
      // Refresh profile to get updated data
      const { data } = await fetchProfile();
      setProfile(data);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload image.");
      setImagePreview(profile?.profile_picture);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [profile?.profile_picture]);

  const handleRemoveImage = useCallback(async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    setRemovingImage(true);
    setError(null);
    
    try {
      await deleteProfilePicture();
      
      // Refresh profile
      const { data } = await fetchProfile();
      setProfile(data);
      setImagePreview(null);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to remove image.");
      setImagePreview(profile?.profile_picture);
    } finally {
      setRemovingImage(false);
    }
  }, [profile?.profile_picture]);

  const toggleSwitch = async (field) => {
    const newValue = !profile[field];
    setProfile((prev) => ({ ...prev, [field]: newValue }));
    
    try {
      await patchProfile({ [field]: newValue });
    } catch (err) {
      setError(`Failed to update ${field}.`);
      // Revert on error
      setProfile((prev) => ({ ...prev, [field]: !newValue }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...profile,
        specializations: normalizeArray(profile.specializations),
        languages: normalizeArray(profile.languages),
        education: normalizeArray(profile.education),
        certifications: normalizeArray(profile.certifications),
        industries: normalizeArray(profile.industries),
        years_of_experience: Number(profile.years_of_experience || 0),
      };

      // Don't send profile_picture - handled separately via dedicated endpoint
      delete payload.profile_picture;

      await updateProfile(payload);
      
      // Refresh profile after save
      const { data } = await fetchProfile();
      setProfile(data);
      
    } catch (err) {
      console.error("Update error:", err.response?.data);
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-slate-500 text-sm">Loading profile...</p>
      </div>
    );
  }

  const initials = profile.display_name
    ? profile.display_name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "IN";

  return (
    <div className="space-y-6">
      {/* Header card with profile picture */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-100 bg-gradient-to-br from-slate-100 to-slate-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-600">
                  {initials}
                </div>
              )}
            </div>

            {/* Image controls */}
            <div className="absolute -inset-2 bg-black/10 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1 top-0 left-0">
              <label className="flex items-center gap-1 bg-white/90 hover:bg-white rounded-xl px-3 py-1.5 shadow cursor-pointer text-xs transition-all hover:scale-105">
                📁 Change
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploadingImage || removingImage}
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage || removingImage}
                  className="bg-white/90 hover:bg-white rounded-xl px-3 py-1.5 shadow text-xs transition-all hover:scale-105 disabled:opacity-50"
                  title="Remove photo"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={profile.display_name || ""}
              onChange={(e) => handleChange("display_name", e.target.value)}
              className="w-full text-lg font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1 py-0.5"
              placeholder="Your display name"
            />
            <input
              type="text"
              value={profile.headline || ""}
              onChange={(e) => handleChange("headline", e.target.value)}
              className="w-full text-sm text-slate-500 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded px-1 mt-0.5"
              placeholder="Add a professional headline"
            />
          </div>
        </div>




        {/* Toggle switches */}
        <div className="flex flex-wrap gap-4 text-xs lg:flex-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap">Public Profile</span>
            <button
              type="button"
              onClick={() => toggleSwitch("is_profile_public")}
              disabled={saving}
              className={[
                "w-11 h-6 rounded-full flex items-center p-0.5 transition-all relative shadow-sm",
                profile.is_profile_public
                  ? "bg-emerald-500 shadow-emerald-200"
                  : "bg-slate-200 shadow-slate-200",
              ].join(" ")}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center text-xs font-bold ${
                  profile.is_profile_public ? "translate-x-5 text-emerald-600" : "translate-x-0.5 text-slate-500"
                }`}
              >
                {profile.is_profile_public ? "ON" : "OFF"}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap">Accept Bookings</span>
            <button
              type="button"
              onClick={() => toggleSwitch("is_accepting_bookings")}
              disabled={saving}
              className={[
                "w-11 h-6 rounded-full flex items-center p-0.5 transition-all relative shadow-sm",
                profile.is_accepting_bookings
                  ? "bg-emerald-500 shadow-emerald-200"
                  : "bg-slate-200 shadow-slate-200",
              ].join(" ")}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center text-xs font-bold ${
                  profile.is_accepting_bookings ? "translate-x-5 text-emerald-600" : "translate-x-0.5 text-slate-500"
                }`}
              >
                {profile.is_accepting_bookings ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main form */}
      <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left: bio and description */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-semibold text-slate-800 mb-4">Professional Summary</p>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 mb-2 text-sm">Bio</label>
                <textarea
                  rows={4}
                  value={profile.bio || ""}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-vertical"
                  placeholder="Tell us about your experience as an interviewer..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-2 text-sm">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={profile.years_of_experience || ""}
                    onChange={(e) => handleChange("years_of_experience", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-2 text-sm">Location</label>
                  <input
                    type="text"
                    value={profile.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>
          </div>

          <TagSection title="Specializations" field="specializations" profile={profile} onChange={handleChange} />
          <TagSection title="Industries Served" field="industries" profile={profile} onChange={handleChange} />
          <TagSection title="Languages" field="languages" profile={profile} onChange={handleChange} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <TagSection title="Education" field="education" profile={profile} onChange={handleChange} />
          <TagSection title="Certifications" field="certifications" profile={profile} onChange={handleChange} />
        </div>

        {/* Save button */}
        <div className="lg:col-span-3 flex items-center gap-4 pt-2">
          {error && (
            <p className="text-sm text-red-600 flex-1 text-left">{error}</p>
          )}
          <button
            type="submit"
            disabled={saving || uploadingImage || removingImage}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 flex items-center gap-2 ml-auto"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {(uploadingImage || removingImage) && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          {uploadingImage ? "Uploading profile picture..." : "Removing profile picture..."}
        </div>
      )}
    </div>
  );
}

function TagSection({ title, field, profile, onChange }) {
  const values = normalizeArray(profile[field]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const value = e.target.value.trim();
      if (!value || values.includes(value)) return;
      onChange(field, [...values, value]);
      e.target.value = "";
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(field, values.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
      <p className="text-sm font-semibold text-slate-800 mb-3">{title}</p>
      <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto">
        {values.length === 0 ? (
          <p className="text-xs text-slate-400">No {title.toLowerCase()} added yet</p>
        ) : (
          values.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-full shadow-sm hover:bg-emerald-100 transition-all"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-emerald-500 hover:text-emerald-700 ml-1 hover:scale-110 transition-all"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={`Add ${title.toLowerCase()} (press Enter)`}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    </div>
  );
}
