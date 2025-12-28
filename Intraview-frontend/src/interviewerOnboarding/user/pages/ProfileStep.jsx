import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { fetchProfile, saveProfile } from "../../interviewerOnboardingApi";

export default function ProfileStep() {
  const navigate = useNavigate();
  const { onboardingStatus } = useOutletContext();

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    display_name: "",
    headline: "",
    bio: "",
    years_of_experience: "",
    location: "",
    timezone: "UTC",
    specializations: [],
    languages: [],
    education: [],
    certifications: [],
    industries: [],
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await fetchProfile();
        if (!mounted) return;

        setForm({
          display_name: data.display_name || "",
          headline: data.headline || "",
          bio: data.bio || "",
          years_of_experience: data.years_of_experience || "",
          location: data.location || "",
          timezone: data.timezone || "UTC",
          specializations: data.specializations || [],
          languages: data.languages || [],
          education: data.education || [],
          certifications: data.certifications || [],
          industries: data.industries || [],
        });
        setProfilePreview(data.profile_picture || null);
      } catch {
        // 404 is fine for first-time
      } finally {
        if (mounted) setInitialLoaded(true);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleTagInputKeyDown = (field, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (!value) return;
      setForm((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
      e.target.value = "";
    }
  };

  const handleRemoveTag = (field, tag) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((t) => t !== tag),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicture(file);
    const url = URL.createObjectURL(file);
    setProfilePreview(url);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fd.append(key, JSON.stringify(value));
        } else {
          if (value !== null && value !== undefined) {
            fd.append(key, value);
          }
        }
      });
      if (profilePicture) {
        fd.append("profile_picture", profilePicture);
      }

      await saveProfile(fd);
      navigate("/interviewer/onboarding/availability");
    } catch (err) {
      const msg = err.response?.data || "Failed to save profile.";
      setError(typeof msg === "string" ? msg : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!initialLoaded) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-slate-500 text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top text */}
      <div className="text-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-1">
          Profile Creation
        </h2>
        <p className="text-slate-500 text-sm">
          This is how your profile will appear to candidates once your account is live.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: form */}
        <div className="space-y-5">
          {/* Picture */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">
              Profile Picture
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                {form.display_name ? form.display_name[0].toUpperCase() : "IN"}
              </div>
              <label className="inline-flex items-center px-3 py-2 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-200">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <span className="text-[11px] text-slate-400">
                Recommended: 400x400px, max 2MB
              </span>
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => handleChange("display_name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Headline */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Senior Backend Engineer • System Design"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Professional Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={4}
              maxLength={500}
              placeholder="Tell candidates about your experience and how you run interviews..."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {form.bio.length}/500 characters
            </p>
          </div>

          {/* Years of experience */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={form.years_of_experience}
                onChange={(e) => handleChange("years_of_experience", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Timezone
            </label>
            <select
              value={form.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          {/* Specializations */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Interview Specializations
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.specializations.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("specializations", tag)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              onKeyDown={(e) => handleTagInputKeyDown("specializations", e)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Frontend, System Design (press Enter to add)"
            />
          </div>

          {/* Languages */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Languages Spoken
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.languages.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("languages", tag)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              onKeyDown={(e) => handleTagInputKeyDown("languages", e)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Add languages (press Enter to add)"
            />
          </div>
        </div>

        {/* Right column: preview */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Profile Preview
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-600">
                  {form.display_name ? form.display_name[0].toUpperCase() : "IN"}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {form.display_name || "Your name"}
              </p>
              <p className="text-xs text-slate-500">
                {form.headline || "Professional Interviewer"}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-700 mb-1">About</p>
              <p className="text-slate-500">
                {form.bio || "Your professional bio will appear here..."}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {form.specializations.length ? (
                  form.specializations.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 rounded-full bg-white border border-slate-200 text-[11px]"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 text-[11px]">Add specializations</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Languages</p>
              {form.languages.length ? (
                <p>{form.languages.join(", ")}</p>
              ) : (
                <p className="text-slate-400 text-[11px]">Add languages</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-2">{String(error)}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => navigate("/interviewer/status")}
          className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Next"}
        </button>
      </div>
    </form>
  );
}
