// src/features/interviewer/components/StepPersonal.jsx
export default function StepPersonal({ data, setData, next }) {
  const handleChange = (field) => (e) =>
    setData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">
        Personal Information
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Phone Number<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.phone_number}
            onChange={handleChange("phone_number")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Location<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.location}
            onChange={handleChange("location")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Kochi, India"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Timezone<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.timezone}
            onChange={handleChange("timezone")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Asia/Kolkata (IST)"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            LinkedIn Profile<span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={data.linkedin_url}
            onChange={handleChange("linkedin_url")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="https://www.linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            GitHub Profile (Optional)
          </label>
          <input
            type="url"
            value={data.github_url}
            onChange={handleChange("github_url")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="https://github.com/username"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          className="px-5 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
