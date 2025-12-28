import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from "../../interviewerOnboardingApi";

export default function AvailabilityStep() {
  const navigate = useNavigate();
  const { onboardingStatus } = useOutletContext();
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    timezone: "Asia/Kolkata",
    is_recurring: false,
    recurrence_type: "WEEKLY",
    recurrence_end_date: "",
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await fetchAvailability();
        if (!mounted) return;
        setSlots(data || []);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingSlots(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        is_recurring: Boolean(form.is_recurring),
      };
      if (!payload.is_recurring) {
        delete payload.recurrence_type;
        delete payload.recurrence_end_date;
      }
      const { data } = await createAvailability(payload);
      // Reload slots
      const res = await fetchAvailability();
      setSlots(res.data || []);
    } catch (err) {
      const msg = err.response?.data || "Failed to add availability.";
      setError(typeof msg === "string" ? msg : "Failed to add availability.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteAvailability(id);
    const { data } = await fetchAvailability();
    setSlots(data || []);
  };

  const canContinue = slots.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-1">
          Set Your Availability
        </h2>
        <p className="text-slate-500 text-sm">
          Choose the days and times you are available to run mock interviews.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: calendar-ish inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Timezone
            </label>
            <select
              value={form.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => handleChange("start_time", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => handleChange("end_time", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={form.is_recurring}
                  onChange={(e) => handleChange("is_recurring", e.target.checked)}
                  className="rounded border-slate-300"
                />
                Set as recurring
              </label>
            </div>
          </div>

          {form.is_recurring && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Recurs
                </label>
                <select
                  value={form.recurrence_type}
                  onChange={(e) => handleChange("recurrence_type", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Until
                </label>
                <input
                  type="date"
                  value={form.recurrence_end_date}
                  onChange={(e) => handleChange("recurrence_end_date", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600">{String(error)}</p>
          )}

          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Adding..." : "Add Time Slot"}
          </button>
        </div>

        {/* Right: slots list & summary */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Available Time Slots
          </h3>
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 max-h-72 overflow-y-auto">
            {loadingSlots ? (
              <p className="text-xs text-slate-500">Loading slots...</p>
            ) : slots.length === 0 ? (
              <p className="text-xs text-slate-500">
                No availability added yet. Add at least one slot to continue.
              </p>
            ) : (
              <ul className="space-y-2 text-xs text-slate-700">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">
                        {slot.date} • {slot.start_time}–{slot.end_time}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {slot.timezone} {slot.is_recurring ? "• Recurring" : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(slot.id)}
                      className="text-[11px] text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => navigate("/interviewer/onboarding/profile")}
          className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => navigate("/interviewer/onboarding/verification")}
          className="px-6 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
