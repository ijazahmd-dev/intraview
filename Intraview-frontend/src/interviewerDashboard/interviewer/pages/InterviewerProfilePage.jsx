import { useEffect, useState } from "react";
import { fetchProfile, updateProfile, patchProfile } from "../../interviewerDashboardApi";

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await fetchProfile();
        if (!mounted) return;
        setProfile(data);
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

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...profile,
        // ensure arrays
        specializations: normalizeArray(profile.specializations),
        languages: normalizeArray(profile.languages),
        education: normalizeArray(profile.education),
        certifications: normalizeArray(profile.certifications),
        industries: normalizeArray(profile.industries),
        // ensure number
        years_of_experience: Number(profile.years_of_experience || 0),
      };

      // very important: do NOT send profile_picture when not uploading a file
      delete payload.profile_picture;

      await updateProfile(payload);
    } catch (err) {
      console.log("update error this is the error.", err.response?.data);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };


  const toggleSwitch = async (field) => {
    const newValue = !profile[field];
    setProfile((prev) => ({ ...prev, [field]: newValue }));
    try {
      await patchProfile({ [field]: newValue });
    } catch {
      // revert on error
      setProfile((prev) => ({ ...prev, [field]: !newValue }));
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
      {/* Header card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {profile.display_name}
            </p>
            <p className="text-xs text-slate-500">
              {profile.headline || "Professional Interviewer"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Profile visibility</span>
            <button
              type="button"
              onClick={() => toggleSwitch("is_profile_public")}
              className={[
                "w-10 h-5 rounded-full flex items-center px-0.5 transition",
                profile.is_profile_public
                  ? "bg-emerald-500 justify-end"
                  : "bg-slate-200 justify-start",
              ].join(" ")}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Accept bookings</span>
            <button
              type="button"
              onClick={() => toggleSwitch("is_accepting_bookings")}
              className={[
                "w-10 h-5 rounded-full flex items-center px-0.5 transition",
                profile.is_accepting_bookings
                  ? "bg-emerald-500 justify-end"
                  : "bg-slate-200 justify-start",
              ].join(" ")}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>
      </div>

      {/* Main sections */}
      <form
        onSubmit={handleSave}
        className="grid lg:grid-cols-3 gap-6 items-start"
      >
        {/* Left: bio and description */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-800 mb-3">
              Professional Summary
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Headline</label>
                <input
                  type="text"
                  value={profile.headline || ""}
                  onChange={(e) => handleChange("headline", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Professional Bio
                </label>
                <textarea
                  rows={4}
                  value={profile.bio || ""}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={profile.years_of_experience || ""}
                    onChange={(e) =>
                      handleChange("years_of_experience", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specializations, industries, languages */}
          <TagSection
            title="Specializations"
            field="specializations"
            profile={profile}
            onChange={handleChange}
          />
          <TagSection
            title="Industries Served"
            field="industries"
            profile={profile}
            onChange={handleChange}
          />
          <TagSection
            title="Languages"
            field="languages"
            profile={profile}
            onChange={handleChange}
          />
        </div>

        {/* Right column: education, certifications, contact */}
        <div className="space-y-4 text-xs">
          <TagSection
            title="Education"
            field="education"
            profile={profile}
            onChange={handleChange}
          />
          <TagSection
            title="Certifications"
            field="certifications"
            profile={profile}
            onChange={handleChange}
          />
        </div>

        {/* Save button full width under grid */}
        <div className="lg:col-span-3 flex justify-end">
          {error && (
            <p className="text-xs text-red-600 mr-4 self-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TagSection({ title, field, profile, onChange }) {
  const values = profile[field] || [];

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (!value) return;
      onChange(field, [...values, value]);
      e.target.value = "";
    }
  };

  const removeTag = (tag) => {
    onChange(
      field,
      values.filter((t) => t !== tag)
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
      <p className="text-sm font-semibold text-slate-800 mb-2">{title}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.length === 0 && (
          <p className="text-[11px] text-slate-400">No items yet.</p>
        )}
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder="Type and press Enter to add"
      />
    </div>
  );
}
