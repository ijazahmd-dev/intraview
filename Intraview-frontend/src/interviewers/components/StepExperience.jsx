// src/features/interviewer/components/StepExperience.jsx
const SPECIALIZATION_OPTIONS = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Mobile",
  "Data Structures & Algorithms",
  "System Design",
  "DevOps",
  "Data Science / ML",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Malayalam",
  "Tamil",
  "Telugu",
];

export default function StepExperience({ data, setData, next, back }) {
  const handleChange = (field) => (e) =>
    setData((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleInArray = (field, value) => {
    setData((prev) => {
      const arr = new Set(prev[field] || []);
      if (arr.has(value)) arr.delete(value);
      else arr.add(value);
      return { ...prev, [field]: Array.from(arr) };
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">
        Professional Experience &amp; Skills
      </h2>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Years of Professional Experience<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="40"
              value={data.years_of_experience}
              onChange={handleChange("years_of_experience")}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="3"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Years of Interview Experience<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="40"
              value={data.years_of_interview_experience}
              onChange={handleChange("years_of_interview_experience")}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="1"
            />
          </div>
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Specializations / Focus Areas<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATION_OPTIONS.map((item) => {
              const selected = data.specializations?.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleInArray("specializations", item)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    selected
                      ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Education */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Education<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.education}
            onChange={handleChange("education")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="B.Tech in Computer Science, XYZ University"
          />
        </div>

        {/* Languages */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Languages Spoken<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => {
              const selected = data.languages?.includes(lang);
              return (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleInArray("languages", lang)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    selected
                      ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Interview Expertise Summary<span className="text-red-500">*</span>
          </label>
          <textarea
            value={data.expertise_summary}
            onChange={handleChange("expertise_summary")}
            rows={5}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Describe your interviewing experience, approach, and what makes you a great interviewer..."
          />
        </div>

        {/* Motivation (optional) */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Why do you want to be an interviewer? (Optional)
          </label>
          <textarea
            value={data.motivation}
            onChange={handleChange("motivation")}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={back}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
        >
          Back
        </button>
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
