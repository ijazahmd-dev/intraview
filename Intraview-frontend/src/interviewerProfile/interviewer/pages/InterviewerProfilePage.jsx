

// import { useEffect, useState, useCallback, useRef } from "react";
// import toaster from "../../../utils/toaster";
// import { 
//   fetchProfile, 
//   updateProfile, 
//   uploadProfilePicture, 
//   deleteProfilePicture,
//   patchProfile 
// } from "../../../interviewerDashboard/interviewerDashboardApi";


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
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [removingImage, setRemovingImage] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);
//   const fileInputRef = useRef(null);

  

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       try {
//         const { data } = await fetchProfile();
//         if (!mounted) return;
//         setProfile(data);
//         const isVerified = data.verification_status === 'APPROVED';
//         console.log("the profile pic is this.......",data.profile_picture);
//         if (data.profile_picture) {
//           setImagePreview(data.profile_picture  || null);
//         }
//         console.log("the profile image previwe is .......",imagePreview);
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

//   const handleImageChange = useCallback(async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Client-side validation
//     if (!file.type.startsWith('image/')) {
//       setError('Please select a valid image file.');
//       return;
//     }
    
//     if (file.size > 5 * 1024 * 1024) {
//       setError('Image size must be less than 5MB.');
//       return;
//     }

//     setUploadingImage(true);
//     setError(null);
    
//     try {
//       const previewUrl = URL.createObjectURL(file);
//       setImagePreview(previewUrl);
      
//       // Upload to backend
//       await uploadProfilePicture(file);
      
//       // Refresh profile to get updated data
//       const { data } = await fetchProfile();
//       setProfile(data);
      
//     } catch (err) {
//       setError(err.response?.data?.detail || "Failed to upload image.");
//       setImagePreview(profile?.profile_picture);
//     } finally {
//       setUploadingImage(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   }, [profile?.profile_picture]);

//   const handleRemoveImage = useCallback(async () => {
//     if (!confirm('Are you sure you want to remove your profile picture?')) return;

//     setRemovingImage(true);
//     setError(null);
    
//     try {
//       await deleteProfilePicture();
      
//       // Refresh profile
//       const { data } = await fetchProfile();
//       setProfile(data);
//       setImagePreview(null);
      
//     } catch (err) {
//       setError(err.response?.data?.detail || "Failed to remove image.");
//       setImagePreview(profile?.profile_picture);
//     } finally {
//       setRemovingImage(false);
//     }
//   }, [profile?.profile_picture]);

//   const toggleSwitch = async (field) => {

//     if (profile.verification_status !== 'APPROVED' && 
//       (field === 'is_profile_public' || field === 'is_accepting_bookings')) {
//         toaster.error('You must complete your identity verification first.');
        
//     return;
//   }

//     const newValue = !profile[field];
//     setProfile((prev) => ({ ...prev, [field]: newValue }));
    
//     try {
//       await patchProfile({ [field]: newValue });
//     } catch (err) {
//       setError(`Failed to update ${field}.`);
//       // Revert on error
//       setProfile((prev) => ({ ...prev, [field]: !newValue }));
//     }
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const payload = {
//         ...profile,
//         specializations: normalizeArray(profile.specializations),
//         languages: normalizeArray(profile.languages),
//         education: normalizeArray(profile.education),
//         certifications: normalizeArray(profile.certifications),
//         industries: normalizeArray(profile.industries),
//         years_of_experience: Number(profile.years_of_experience || 0),
//       };

//       // Don't send profile_picture - handled separately via dedicated endpoint
//       delete payload.profile_picture;

//       await updateProfile(payload);
      
//       // Refresh profile after save
//       const { data } = await fetchProfile();
//       setProfile(data);
      
//     } catch (err) {
//       console.error("Update error:", err.response?.data);
//       setError(err.response?.data?.detail || "Failed to update profile.");
//     } finally {
//       setSaving(false);
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
//       {/* Header card with profile picture */}
//       <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//         <div className="flex items-center gap-4 flex-1">
//           <div className="relative">
//             <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-100 bg-gradient-to-br from-slate-100 to-slate-200">
//               {imagePreview ? (
//                 <img
//                   src={imagePreview}
//                   alt={profile.display_name}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-600">
//                   {initials}
//                 </div>
//               )}
//             </div>

//             {/* Image controls */}
//             <div className="absolute -inset-2 bg-black/10 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1 top-0 left-0">
//               <label className="flex items-center gap-1 bg-white/90 hover:bg-white rounded-xl px-3 py-1.5 shadow cursor-pointer text-xs transition-all hover:scale-105">
//                 📁 Change
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleImageChange}
//                   disabled={uploadingImage || removingImage}
//                 />
//               </label>
//               {imagePreview && (
//                 <button
//                   type="button"
//                   onClick={handleRemoveImage}
//                   disabled={uploadingImage || removingImage}
//                   className="bg-white/90 hover:bg-white rounded-xl px-3 py-1.5 shadow text-xs transition-all hover:scale-105 disabled:opacity-50"
//                   title="Remove photo"
//                 >
//                   🗑️
//                 </button>
//               )}
//             </div>
//           </div>
          
//           <div className="min-w-0 flex-1">
//             <input
//               type="text"
//               value={profile.display_name || ""}
//               onChange={(e) => handleChange("display_name", e.target.value)}
//               className="w-full text-lg font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1 py-0.5"
//               placeholder="Your display name"
//             />
//             <input
//               type="text"
//               value={profile.headline || ""}
//               onChange={(e) => handleChange("headline", e.target.value)}
//               className="w-full text-sm text-slate-500 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded px-1 mt-0.5"
//               placeholder="Add a professional headline"
//             />
//           </div>
//         </div>




//         {/* Toggle switches */}
//         {/* {profile.verification_status !== 'APPROVED' && (
//               <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-sm text-amber-800">
//                 🔐 <strong>Verify your identity</strong> to make profile public and accept bookings.
//                 <a href="/interviewer/dashboard/verification" className="ml-2 underline">Go to verification →</a>
//               </div>
//             )} */}
//         <div className="flex flex-wrap gap-4 text-xs lg:flex-nowrap">
//           <div className="flex items-center gap-2">
//             <span className="text-slate-500 whitespace-nowrap">Public Profile</span>
//             <button
//               type="button"
//               onClick={() => toggleSwitch("is_profile_public")}
//               disabled={saving}
//               className={[
//                 "w-11 h-6 rounded-full flex items-center p-0.5 transition-all relative shadow-sm",
//                 profile.is_profile_public
//                   ? "bg-emerald-500 shadow-emerald-200"
//                   : "bg-slate-200 shadow-slate-200",
//               ].join(" ")}
//             >
//               <span
//                 className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center text-xs font-bold ${
//                   profile.is_profile_public ? "translate-x-5 text-emerald-600" : "translate-x-0.5 text-slate-500"
//                 }`}
//               >
//                 {profile.is_profile_public ? "ON" : "OFF"}
//               </span>
//             </button>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-slate-500 whitespace-nowrap">Accept Bookings</span>
//             <button
//               type="button"
//               onClick={() => toggleSwitch("is_accepting_bookings")}
//               disabled={saving}
//               className={[
//                 "w-11 h-6 rounded-full flex items-center p-0.5 transition-all relative shadow-sm",
//                 profile.is_accepting_bookings
//                   ? "bg-emerald-500 shadow-emerald-200"
//                   : "bg-slate-200 shadow-slate-200",
//               ].join(" ")}
//             >
//               <span
//                 className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center text-xs font-bold ${
//                   profile.is_accepting_bookings ? "translate-x-5 text-emerald-600" : "translate-x-0.5 text-slate-500"
//                 }`}
//               >
//                 {profile.is_accepting_bookings ? "ON" : "OFF"}
//               </span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main form */}
//       <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6 items-start">
//         {/* Left: bio and description */}
//         <div className="lg:col-span-2 space-y-4">
//           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
//             <p className="text-sm font-semibold text-slate-800 mb-4">Professional Summary</p>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-slate-600 mb-2 text-sm">Bio</label>
//                 <textarea
//                   rows={4}
//                   value={profile.bio || ""}
//                   onChange={(e) => handleChange("bio", e.target.value)}
//                   className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-vertical"
//                   placeholder="Tell us about your experience as an interviewer..."
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-slate-600 mb-2 text-sm">Years of Experience</label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="50"
//                     value={profile.years_of_experience || ""}
//                     onChange={(e) => handleChange("years_of_experience", e.target.value)}
//                     className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-slate-600 mb-2 text-sm">Location</label>
//                   <input
//                     type="text"
//                     value={profile.location || ""}
//                     onChange={(e) => handleChange("location", e.target.value)}
//                     className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                     placeholder="City, Country"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <TagSection title="Specializations" field="specializations" profile={profile} onChange={handleChange} />
//           <TagSection title="Industries Served" field="industries" profile={profile} onChange={handleChange} />
//           <TagSection title="Languages" field="languages" profile={profile} onChange={handleChange} />
//         </div>

//         {/* Right column */}
//         <div className="space-y-4">
//           <TagSection title="Education" field="education" profile={profile} onChange={handleChange} />
//           <TagSection title="Certifications" field="certifications" profile={profile} onChange={handleChange} />
//         </div>

//         {/* Save button */}
//         <div className="lg:col-span-3 flex items-center gap-4 pt-2">
//           {error && (
//             <p className="text-sm text-red-600 flex-1 text-left">{error}</p>
//           )}
//           <button
//             type="submit"
//             disabled={saving || uploadingImage || removingImage}
//             className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 flex items-center gap-2 ml-auto"
//           >
//             {saving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </form>

//       {(uploadingImage || removingImage) && (
//         <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
//           {uploadingImage ? "Uploading profile picture..." : "Removing profile picture..."}
//         </div>
//       )}
//     </div>
//   );
// }

// function TagSection({ title, field, profile, onChange }) {
//   const values = normalizeArray(profile[field]);

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
//     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
//       <p className="text-sm font-semibold text-slate-800 mb-3">{title}</p>
//       <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto">
//         {values.length === 0 ? (
//           <p className="text-xs text-slate-400">No {title.toLowerCase()} added yet</p>
//         ) : (
//           values.map((tag) => (
//             <span
//               key={tag}
//               className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-full shadow-sm hover:bg-emerald-100 transition-all"
//             >
//               {tag}
//               <button
//                 type="button"
//                 onClick={() => removeTag(tag)}
//                 className="text-emerald-500 hover:text-emerald-700 ml-1 hover:scale-110 transition-all"
//               >
//                 ×
//               </button>
//             </span>
//           ))
//         )}
//       </div>
//       <input
//         type="text"
//         onKeyDown={handleKeyDown}
//         placeholder={`Add ${title.toLowerCase()} (press Enter)`}
//         className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
} from "../../../interviewerDashboard/interviewerDashboardApi";

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
        console.log("the profile pic is this.......", data.profile_picture);
        if (data.profile_picture) {
          setImagePreview(data.profile_picture || null);
        }
        console.log("the profile image preview is .......", imagePreview);
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
      
      await uploadProfilePicture(file);
      
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

      delete payload.profile_picture;

      await updateProfile(payload);
      
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-light">Loading profile...</p>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-6">
              {/* Profile Picture - Larger and More Formal */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-medium text-slate-600">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Image Controls - Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                  <label className="flex items-center gap-2 bg-white hover:bg-slate-50 rounded-lg px-4 py-2 shadow cursor-pointer text-sm font-medium text-slate-700 transition-all hover:scale-105">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Change Photo
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
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 shadow text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
                      title="Remove photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>

                {/* Upload/Remove Status Indicator */}
                {(uploadingImage || removingImage) && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Name and Headline */}
              <div className="flex-1 pt-2">
                <input
                  type="text"
                  value={profile.display_name || ""}
                  onChange={(e) => handleChange("display_name", e.target.value)}
                  className="w-full text-2xl font-medium text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none transition-all px-2 py-1 mb-2"
                  placeholder="Your display name"
                />
                <input
                  type="text"
                  value={profile.headline || ""}
                  onChange={(e) => handleChange("headline", e.target.value)}
                  className="w-full text-base text-slate-600 font-light bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none transition-all px-2 py-1"
                  placeholder="Professional headline"
                />
                
                {/* Location and Experience */}
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 px-2">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  {profile.years_of_experience > 0 && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.years_of_experience} years
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Toggle Switches */}
            <div className="flex flex-col gap-3 lg:min-w-[280px]">
              <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Public Profile</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSwitch("is_profile_public")}
                  disabled={saving}
                  className={[
                    "w-11 h-6 rounded-full flex items-center px-0.5 transition-colors",
                    profile.is_profile_public
                      ? "bg-emerald-500 justify-end"
                      : "bg-slate-300 justify-start",
                  ].join(" ")}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Accept Bookings</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSwitch("is_accepting_bookings")}
                  disabled={saving}
                  className={[
                    "w-11 h-6 rounded-full flex items-center px-0.5 transition-colors",
                    profile.is_accepting_bookings
                      ? "bg-emerald-500 justify-end"
                      : "bg-slate-300 justify-start",
                  ].join(" ")}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {(uploadingImage || removingImage) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium text-blue-800">
              {uploadingImage ? "Uploading profile picture..." : "Removing profile picture..."}
            </span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-slate-800">Professional Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Professional Bio</label>
                  <textarea
                    rows={5}
                    value={profile.bio || ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all resize-vertical"
                    placeholder="Tell us about your experience as an interviewer..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={profile.years_of_experience || ""}
                      onChange={(e) => handleChange("years_of_experience", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={profile.location || ""}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50 focus:bg-white transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            <ListSection title="Specializations" field="specializations" profile={profile} onChange={handleChange} icon={<svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>} />
            <ListSection title="Industries Served" field="industries" profile={profile} onChange={handleChange} icon={<svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
            <ListSection title="Languages" field="languages" profile={profile} onChange={handleChange} icon={<svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ListSection title="Education" field="education" profile={profile} onChange={handleChange} icon={<svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>} />
            <ListSection title="Certifications" field="certifications" profile={profile} onChange={handleChange} icon={<svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>} />
          </div>

          {/* Save Button */}
          <div className="lg:col-span-3 flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div>
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
              {!error && <p className="text-sm text-slate-500 font-light">Remember to save your changes before leaving this page</p>}
            </div>
            <button
              type="submit"
              disabled={saving || uploadingImage || removingImage}
              className="px-6 py-3 rounded-xl bg-slate-800 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-300/50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function ListSection({ title, field, profile, onChange, icon }) {
  const values = normalizeArray(profile[field]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const value = inputValue.trim();
      if (!value || values.includes(value)) return;
      onChange(field, [...values, value]);
      setInputValue("");
    }
  };

  const removeItem = (itemToRemove) => {
    onChange(field, values.filter((item) => item !== itemToRemove));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-base font-medium text-slate-800">{title}</h3>
      </div>
      
      {values.length > 0 ? (
        <div className="mb-4 bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
          {values.map((item, idx) => (
            <div
              key={`${item}-${idx}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="opacity-0 group-hover:opacity-100 ml-3 p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4 bg-slate-50 rounded-xl border border-slate-100 px-4 py-8 text-center">
          <p className="text-xs text-slate-400 font-light">No {title.toLowerCase()} added yet</p>
        </div>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white transition-all"
          placeholder={`Add ${title.toLowerCase()} (press Enter)`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>
    </div>
  );
}