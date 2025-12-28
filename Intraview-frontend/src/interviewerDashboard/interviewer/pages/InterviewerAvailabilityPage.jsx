import { useEffect, useState } from "react";
import {
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from "../../interviewerDashboardApi";

export default function InterviewerAvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setError("Failed to load availability.");
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
      await createAvailability(payload);
      const { data } = await fetchAvailability();
      setSlots(data || []);
    } catch (err) {
      setError("Failed to add availability.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteAvailability(id);
    const { data } = await fetchAvailability();
    setSlots(data || []);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Manage Availability
          </p>
          <p className="text-xs text-slate-500">
            Control when candidates can book sessions with you.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: form */}
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
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
              <label className="block text-xs font-medium text-slate-600 mb-1">
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
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Start time
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
              <label className="block text-xs font-medium text-slate-600 mb-1">
                End time
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
                />
                Set as recurring
              </label>
            </div>
          </div>

          {form.is_recurring && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Recurs
                </label>
                <select
                  value={form.recurrence_type}
                  onChange={(e) =>
                    handleChange("recurrence_type", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Until
                </label>
                <input
                  type="date"
                  value={form.recurrence_end_date}
                  onChange={(e) =>
                    handleChange("recurrence_end_date", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 px-4 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Adding..." : "Add Slot"}
          </button>
        </form>

        {/* Right: list of slots */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-800 mb-3">
            Existing Time Slots
          </p>
          {loading ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-slate-500">
              No availability added yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between bg-slate-50 rounded-2xl px-3 py-2"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {slot.date} • {slot.start_time}–{slot.end_time}
                    </p>
                    <p className="text-slate-500 text-[11px]">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
